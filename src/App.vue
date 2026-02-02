<script setup lang="ts">
import { ref, onMounted } from "vue";
import AppHeader from "./components/AppHeader.vue";
import FeedFilters from "./components/FeedFilters.vue";
import ArticleList from "./components/ArticleList.vue";
import ManageFeedsModal from "./components/ManageFeedsModal.vue";
import SharePreview from "./components/SharePreview.vue";
import { useFeed } from "./composables/useFeed";
import type { Feed } from "./types";

const {
  feeds,
  loading,
  activeFilter,
  sources,
  filteredArticles,
  isShareMode,
  initializeApp,
  addFeed,
  deleteFeed,
  refreshFeeds,
  setFilter,
} = useFeed();

const showManageModal = ref(false);

function openManageModal() {
  showManageModal.value = true;
}

function handleAddFeed(feed: Feed) {
  addFeed(feed);
}

function handleDeleteFeed(url: string) {
  deleteFeed(url);
}

onMounted(() => {
  initializeApp();
});
</script>

<template>
  <!-- Share preview mode -->
  <SharePreview v-if="isShareMode" />

  <!-- Normal app mode -->
  <div v-else class="min-h-screen">
    <AppHeader @manage="openManageModal" @refresh="refreshFeeds" />

    <main class="max-w-[900px] mx-auto p-8 sm:p-5 sm:px-5 w-full">
      <FeedFilters
        :sources="sources"
        :active-filter="activeFilter"
        @update:active-filter="setFilter"
      />

      <ArticleList
        :articles="filteredArticles"
        :loading="loading"
        @add-feed="openManageModal"
      />
    </main>

    <ManageFeedsModal
      v-model:visible="showManageModal"
      :feeds="feeds"
      @add-feed="handleAddFeed"
      @delete-feed="handleDeleteFeed"
    />
  </div>
</template>
