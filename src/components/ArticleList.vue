<script setup lang="ts">
import Button from 'primevue/button'
import ArticleItem from './ArticleItem.vue'
import type { Article } from '../types'

defineProps<{
  articles: Article[]
  loading: boolean
}>()

defineEmits<{
  addFeed: []
}>()
</script>

<template>
  <div class="articles">
    <!-- Loading state -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      Loading feeds...
    </div>

    <!-- Empty state -->
    <div v-else-if="articles.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h4l2 2h8a2 2 0 012 2v10a2 2 0 01-2 2z"/>
        </svg>
      </div>
      <h3 class="empty-title">No articles yet</h3>
      <p class="empty-description">Add some feeds to get started with your reading.</p>
      <Button
        label="Add Your First Feed"
        unstyled
        class="btn btn-primary"
        @click="$emit('addFeed')"
      />
    </div>

    <!-- Articles list -->
    <template v-else>
      <ArticleItem
        v-for="(article, index) in articles.slice(0, 50)"
        :key="article.link + article.title"
        :article="article"
        :animation-delay="0.05 * (index + 1)"
      />
    </template>
  </div>
</template>

<style scoped>
.articles {
  display: flex;
  flex-direction: column;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: var(--text-secondary);
}

.loading .spinner {
  margin-right: 0.75rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1.5rem;
  background: var(--border);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
}

.empty-title {
  font-family: var(--font-serif);
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.empty-description {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}
</style>
