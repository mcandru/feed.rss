import { ref, computed } from "vue";
import type { Feed, Article } from "../types";
import {
  isShareUrl,
  getShareParam,
  decodeFeeds,
  clearShareParam,
  generateShareUrl,
} from "../utils/shareUrl";

// CORS proxies with fallback
// Primary: Our own Vercel serverless function (free, reliable, private)
// Fallback: Free public proxy service as backup
// Note: For local dev with `npm run dev`, use the fallback since Vite doesn't handle serverless functions
const isLocalDev =
  import.meta.env.DEV && window.location.hostname === "localhost";
const CORS_PROXIES = isLocalDev
  ? [
      // In local dev, use public proxy first since /api won't work with plain Vite
      (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    ]
  : [
      // In production, use our serverless function
      (url: string) => `/api/fetch-rss?url=${encodeURIComponent(url)}`,
      (url: string) =>
        `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    ];
const STORAGE_KEY = "rss_feeds";
const CLICKED_LINKS_KEY = "rss_clicked_links";

// Single HN feed for exemplar
const DEFAULT_FEEDS: Feed[] = [
  { name: "Hacker News", url: "https://hnrss.org/frontpage" },
  { name: "Simon Willison", url: "https://simonwillison.net/atom/everything/" },
  { name: "Sean Goedecke", url: "https://www.seangoedecke.com/rss.xml" },
  { name: "Hannah Ritchie", url: "https://hannahritchie.substack.com/feed" },
];

// Shared state
const feeds = ref<Feed[]>([]);
const articles = ref<Article[]>([]);
const loading = ref(false);
const activeFilter = ref("all");
const clickedLinks = ref<Set<string>>(new Set());

// Share mode state
const isShareMode = ref(false);
const sharedFeeds = ref<Feed[]>([]);
const shareError = ref<string | null>(null);

export function useFeed() {
  /**
   * Initialize the app - checks for share URL first
   * If share URL is detected, enters share mode and doesn't load localStorage
   * Otherwise loads feeds from localStorage normally
   */
  async function initializeApp() {
    if (isShareUrl()) {
      const encoded = getShareParam();
      if (encoded) {
        const decoded = decodeFeeds(encoded);
        if (decoded && decoded.length > 0) {
          isShareMode.value = true;
          sharedFeeds.value = decoded;
          shareError.value = null;
          // Load the shared feeds to show preview
          await loadSharedFeeds();
          return;
        } else if (decoded && decoded.length === 0) {
          shareError.value = "The shared link contains no feeds.";
          isShareMode.value = true;
          sharedFeeds.value = [];
          return;
        } else {
          shareError.value = "The shared link is invalid or corrupted.";
          isShareMode.value = true;
          sharedFeeds.value = [];
          return;
        }
      }
    }

    // Normal mode - load from localStorage
    loadFeeds();
    refreshFeeds();
  }

  /**
   * Load and fetch articles from shared feeds for preview
   */
  async function loadSharedFeeds() {
    loading.value = true;
    articles.value = [];

    const fetchPromises = sharedFeeds.value.map(async (feed) => {
      try {
        const text = await fetchWithProxy(feed.url);
        return parseFeed(text, feed);
      } catch (error) {
        console.error(`Error fetching ${feed.name}:`, error);
        return [];
      }
    });

    const results = await Promise.all(fetchPromises);
    articles.value = results
      .flat()
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    loading.value = false;
  }

  // Load feeds from localStorage
  function loadFeeds() {
    const stored = localStorage.getItem(STORAGE_KEY);
    feeds.value = stored ? JSON.parse(stored) : DEFAULT_FEEDS;
    if (!stored) {
      saveFeeds();
    }
    // Load clicked links
    const storedClicked = localStorage.getItem(CLICKED_LINKS_KEY);
    if (storedClicked) {
      clickedLinks.value = new Set(JSON.parse(storedClicked));
    }
  }

  // Save feeds to localStorage
  function saveFeeds() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(feeds.value));
  }

  // Add a new feed
  function addFeed(feed: Feed) {
    feeds.value.push(feed);
    saveFeeds();
    refreshFeeds();
  }

  // Delete a feed
  function deleteFeed(url: string) {
    feeds.value = feeds.value.filter((f) => f.url !== url);
    saveFeeds();
    articles.value = articles.value.filter((a) => a.feedUrl !== url);
  }

  // Strip HTML tags from text
  function stripHtml(html: string): string {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }

  // Parse RSS/Atom feed
  function parseFeed(xml: string, feed: Feed): Article[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "text/xml");
    const items: Article[] = [];

    // RSS 2.0
    const rssItems = doc.querySelectorAll("item");
    rssItems.forEach((item) => {
      items.push({
        title: item.querySelector("title")?.textContent || "Untitled",
        link: item.querySelector("link")?.textContent || "#",
        description: stripHtml(
          item.querySelector("description")?.textContent || "",
        ),
        date: new Date(
          item.querySelector("pubDate")?.textContent || Date.now(),
        ),
        source: feed.name,
        feedUrl: feed.url,
      });
    });

    // Atom
    if (items.length === 0) {
      const atomItems = doc.querySelectorAll("entry");
      atomItems.forEach((item) => {
        const link =
          item.querySelector('link[rel="alternate"]')?.getAttribute("href") ||
          item.querySelector("link")?.getAttribute("href") ||
          "#";
        items.push({
          title: item.querySelector("title")?.textContent || "Untitled",
          link: link,
          description: stripHtml(
            item.querySelector("summary")?.textContent ||
              item.querySelector("content")?.textContent ||
              "",
          ),
          date: new Date(
            item.querySelector("published")?.textContent ||
              item.querySelector("updated")?.textContent ||
              Date.now(),
          ),
          source: feed.name,
          feedUrl: feed.url,
        });
      });
    }

    return items;
  }

  // Fetch with proxy fallback
  async function fetchWithProxy(url: string): Promise<string> {
    for (const proxyFn of CORS_PROXIES) {
      try {
        const proxyUrl = proxyFn(url);
        const response = await fetch(proxyUrl);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return await response.text();
      } catch (error) {
        console.warn(`Proxy failed for ${url}:`, error);
        continue;
      }
    }
    throw new Error("All proxies failed");
  }

  // Refresh all feeds
  async function refreshFeeds() {
    loading.value = true;
    articles.value = [];

    const fetchPromises = feeds.value.map(async (feed) => {
      try {
        const text = await fetchWithProxy(feed.url);
        return parseFeed(text, feed);
      } catch (error) {
        console.error(`Error fetching ${feed.name}:`, error);
        return [];
      }
    });

    const results = await Promise.all(fetchPromises);
    articles.value = results
      .flat()
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    loading.value = false;
  }

  // Computed: unique sources from articles
  const sources = computed(() => {
    return [...new Set(articles.value.map((a) => a.source))];
  });

  // Computed: filtered articles
  const filteredArticles = computed(() => {
    if (activeFilter.value === "all") {
      return articles.value;
    }
    return articles.value.filter((a) => a.source === activeFilter.value);
  });

  // Set active filter
  function setFilter(filter: string) {
    activeFilter.value = filter;
  }

  // Mark a link as clicked
  function markAsClicked(link: string) {
    clickedLinks.value.add(link);
    localStorage.setItem(
      CLICKED_LINKS_KEY,
      JSON.stringify([...clickedLinks.value]),
    );
  }

  // Check if a link has been clicked
  function isClicked(link: string): boolean {
    return clickedLinks.value.has(link);
  }

  /**
   * Import selected feeds from share mode into localStorage
   * Merges with existing feeds, skipping duplicates by URL
   */
  function importFeeds(feedsToImport: Feed[]) {
    // Load current feeds from localStorage first
    loadFeeds();

    // Get existing URLs to avoid duplicates
    const existingUrls = new Set(feeds.value.map((f) => f.url));

    // Add only feeds that don't already exist
    const newFeeds = feedsToImport.filter((f) => !existingUrls.has(f.url));
    feeds.value = [...feeds.value, ...newFeeds];

    // Save and exit share mode
    saveFeeds();
    exitShareMode();

    return newFeeds.length;
  }

  /**
   * Exit share mode and return to normal app view
   */
  function exitShareMode() {
    clearShareParam();
    isShareMode.value = false;
    sharedFeeds.value = [];
    shareError.value = null;
    loadFeeds();
    refreshFeeds();
  }

  /**
   * Generate a shareable URL for current feeds
   */
  function getShareUrl(): string {
    return generateShareUrl(feeds.value);
  }

  return {
    feeds,
    articles,
    loading,
    activeFilter,
    sources,
    filteredArticles,
    // Share mode
    isShareMode,
    sharedFeeds,
    shareError,
    // Methods
    initializeApp,
    loadFeeds,
    addFeed,
    deleteFeed,
    refreshFeeds,
    setFilter,
    markAsClicked,
    isClicked,
    importFeeds,
    exitShareMode,
    getShareUrl,
  };
}
