<script setup lang="ts">
import { ref, computed } from "vue";
import { useFeed } from "../composables/useFeed";
import FeedFilters from "./FeedFilters.vue";
import ArticleList from "./ArticleList.vue";

const {
  sharedFeeds,
  shareError,
  loading,
  activeFilter,
  sources,
  filteredArticles,
  importFeeds,
  exitShareMode,
  setFilter,
} = useFeed();

// Track which feeds are selected for import
const selectedUrls = ref<Set<string>>(
  new Set(sharedFeeds.value.map((f) => f.url)),
);
const showImportModal = ref(false);

const allSelected = computed(
  () => selectedUrls.value.size === sharedFeeds.value.length,
);

const someSelected = computed(
  () =>
    selectedUrls.value.size > 0 &&
    selectedUrls.value.size < sharedFeeds.value.length,
);

function toggleFeed(url: string) {
  if (selectedUrls.value.has(url)) {
    selectedUrls.value.delete(url);
  } else {
    selectedUrls.value.add(url);
  }
  // Trigger reactivity
  selectedUrls.value = new Set(selectedUrls.value);
}

function toggleAll() {
  if (allSelected.value) {
    selectedUrls.value = new Set();
  } else {
    selectedUrls.value = new Set(sharedFeeds.value.map((f) => f.url));
  }
}

function handleImport() {
  const feedsToImport = sharedFeeds.value.filter((f) =>
    selectedUrls.value.has(f.url),
  );
  const importedCount = importFeeds(feedsToImport);

  if (importedCount === 0 && feedsToImport.length > 0) {
    alert("All selected feeds already exist in your collection.");
  }
}

function handleDecline() {
  exitShareMode();
}
</script>

<template>
  <div class="min-h-screen">
    <!-- Error state -->
    <div v-if="shareError" class="flex items-center justify-center min-h-screen">
      <div class="text-center py-16 px-8">
        <div
          class="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-2xl flex items-center justify-center text-red-500"
        >
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 class="font-serif text-xl mb-2">Unable to load shared feeds</h2>
        <p class="text-text-secondary mb-6">{{ shareError }}</p>
        <button class="btn btn-primary" @click="handleDecline">
          Go to my feeds
        </button>
      </div>
    </div>

    <!-- Preview mode -->
    <template v-else>
      <!-- Sticky import banner -->
      <div class="sticky top-0 z-[200] bg-accent text-white shadow-lg">
        <div class="max-w-[900px] mx-auto py-4 px-8 sm:px-5">
          <div class="flex flex-col sm:flex-col gap-4">
            <div class="flex-1 min-w-0">
              <h3 class="font-medium mb-1 text-base sm:text-sm">
                <span class="sm:hidden">Preview Mode: Someone shared their feeds with you</span>
                <span class="hidden sm:inline">Shared Feeds Preview</span>
              </h3>
              <p class="text-sm opacity-90">
                {{ sharedFeeds.length }} feed{{
                  sharedFeeds.length !== 1 ? "s" : ""
                }}
                • {{ selectedUrls.size }} selected
              </p>
            </div>
            <div class="flex gap-2 shrink-0 sm:flex-wrap">
              <button
                class="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors duration-200 text-sm font-medium whitespace-nowrap"
                @click="showImportModal = true"
              >
                Choose Feeds
              </button>
              <button
                class="px-4 py-2 rounded-lg bg-white text-accent hover:bg-white/90 transition-colors duration-200 text-sm font-medium whitespace-nowrap"
                :disabled="selectedUrls.size === 0"
                :class="{
                  'opacity-50 cursor-not-allowed': selectedUrls.size === 0,
                }"
                @click="handleImport"
              >
                Import {{ selectedUrls.size }}
              </button>
              <button
                class="px-4 py-2 rounded-lg bg-transparent hover:bg-white/10 transition-colors duration-200 text-sm font-medium whitespace-nowrap"
                @click="handleDecline"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Normal feed view (read-only preview) -->
      <header class="border-b border-border bg-bg-elevated">
        <div
          class="max-w-[900px] mx-auto py-5 px-8 flex justify-between items-center sm:py-4 sm:px-5"
        >
          <div
            class="font-serif text-2xl font-medium tracking-tight text-text-primary"
          >
            Feed Preview
          </div>
        </div>
      </header>

      <main class="max-w-[900px] mx-auto p-8 sm:p-5 sm:px-5 w-full">
        <FeedFilters
          :sources="sources"
          :active-filter="activeFilter"
          @update:active-filter="setFilter"
        />

        <ArticleList :articles="filteredArticles" :loading="loading" />
      </main>
    </template>

    <!-- Import selection modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showImportModal"
          class="modal-overlay fixed inset-0 bg-black/40 backdrop-blur-[4px] flex items-center justify-center z-[1000]"
          @click="showImportModal = false"
        >
          <div
            class="bg-bg-elevated rounded-2xl w-[90%] max-w-[500px] max-h-[85vh] overflow-hidden shadow-2xl sm:w-[95%] sm:max-h-[90vh]"
            role="dialog"
            aria-modal="true"
            @click.stop
          >
            <div
              class="p-6 pb-4 flex justify-between items-center border-b border-border"
            >
              <h2 class="font-serif text-xl font-medium m-0">
                Select Feeds to Import
              </h2>
              <button
                class="w-8 h-8 rounded-lg border-none bg-transparent cursor-pointer text-text-secondary flex items-center justify-center transition-all duration-200 hover:bg-border hover:text-text-primary"
                @click="showImportModal = false"
                aria-label="Close"
              >
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                >
                  <path d="M4 4l8 8M12 4l-8 8" />
                </svg>
              </button>
            </div>

            <div class="p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
              <!-- Select all -->
              <div class="border-b border-border pb-4 mb-4">
                <label class="flex items-center gap-3 cursor-pointer group">
                  <div
                    class="w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200"
                    :class="[
                      allSelected
                        ? 'bg-accent border-accent'
                        : someSelected
                          ? 'bg-accent/50 border-accent'
                          : 'border-border-hover group-hover:border-accent',
                    ]"
                    @click="toggleAll"
                  >
                    <svg
                      v-if="allSelected || someSelected"
                      width="12"
                      height="12"
                      fill="none"
                      stroke="white"
                      stroke-width="2.5"
                      stroke-linecap="round"
                    >
                      <path v-if="allSelected" d="M2 6l3 3 5-6" />
                      <path v-else d="M3 6h6" />
                    </svg>
                  </div>
                  <span class="font-medium"
                    >Select all ({{ sharedFeeds.length }} feeds)</span
                  >
                </label>
              </div>

              <!-- Feed items -->
              <ul class="space-y-1 mb-4">
                <li
                  v-for="feed in sharedFeeds"
                  :key="feed.url"
                  class="rounded-lg transition-colors duration-200"
                  :class="
                    selectedUrls.has(feed.url)
                      ? 'bg-accent/5'
                      : 'hover:bg-border/50'
                  "
                >
                  <label class="flex items-center gap-3 p-3 cursor-pointer">
                    <div
                      class="w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 shrink-0"
                      :class="[
                        selectedUrls.has(feed.url)
                          ? 'bg-accent border-accent'
                          : 'border-border-hover',
                      ]"
                      @click.prevent="toggleFeed(feed.url)"
                    >
                      <svg
                        v-if="selectedUrls.has(feed.url)"
                        width="12"
                        height="12"
                        fill="none"
                        stroke="white"
                        stroke-width="2.5"
                        stroke-linecap="round"
                      >
                        <path d="M2 6l3 3 5-6" />
                      </svg>
                    </div>
                    <div
                      class="flex-1 min-w-0"
                      @click.prevent="toggleFeed(feed.url)"
                    >
                      <div class="font-medium truncate">{{ feed.name }}</div>
                      <div class="text-sm text-text-tertiary truncate">
                        {{ feed.url }}
                      </div>
                    </div>
                  </label>
                </li>
              </ul>
            </div>

            <div class="p-6 pt-4 border-t border-border">
              <button
                class="btn btn-primary w-full justify-center"
                :disabled="selectedUrls.size === 0"
                :class="{
                  'opacity-50 cursor-not-allowed': selectedUrls.size === 0,
                }"
                @click="showImportModal = false"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style>
/* Transition animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}
</style>
