import { ref, computed } from "vue";
import type { Feed, Article } from "../types";

// CORS proxies with fallback
const CORS_PROXIES = [
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
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

export function useFeed() {
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

  return {
    feeds,
    articles,
    loading,
    activeFilter,
    sources,
    filteredArticles,
    loadFeeds,
    addFeed,
    deleteFeed,
    refreshFeeds,
    setFilter,
    markAsClicked,
    isClicked,
  };
}
