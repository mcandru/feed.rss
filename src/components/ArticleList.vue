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
  <div class="flex flex-col">
    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center p-12 text-text-secondary">
      <div class="spinner mr-3"></div>
      Loading feeds...
    </div>

    <!-- Empty state -->
    <div v-else-if="articles.length === 0" class="text-center py-16 px-8">
      <div class="w-16 h-16 mx-auto mb-6 bg-border rounded-2xl flex items-center justify-center text-text-tertiary">
        <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h4l2 2h8a2 2 0 012 2v10a2 2 0 01-2 2z"/>
        </svg>
      </div>
      <h3 class="font-serif text-2xl mb-2">No articles yet</h3>
      <p class="text-text-secondary mb-6">Add some feeds to get started with your reading.</p>
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
