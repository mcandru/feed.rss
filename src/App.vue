<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppHeader from './components/AppHeader.vue'
import FeedFilters from './components/FeedFilters.vue'
import ArticleList from './components/ArticleList.vue'
import ManageFeedsModal from './components/ManageFeedsModal.vue'
import { useFeed } from './composables/useFeed'
import type { Feed } from './types'

const {
  feeds,
  loading,
  activeFilter,
  sources,
  filteredArticles,
  loadFeeds,
  addFeed,
  deleteFeed,
  refreshFeeds,
  setFilter
} = useFeed()

const showManageModal = ref(false)

function openManageModal() {
  showManageModal.value = true
}

function handleAddFeed(feed: Feed) {
  addFeed(feed)
}

function handleDeleteFeed(url: string) {
  deleteFeed(url)
}

onMounted(() => {
  loadFeeds()
  refreshFeeds()
})
</script>

<template>
  <div class="app">
    <AppHeader
      @manage="openManageModal"
      @refresh="refreshFeeds"
    />

    <main class="main">
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

<style scoped>
.app {
  min-height: 100vh;
}

.main {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

@media (max-width: 640px) {
  .main {
    padding: 1.5rem 1.25rem;
  }
}
</style>
