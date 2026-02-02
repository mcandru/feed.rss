<script setup lang="ts">
import type { Article } from '../types'

defineProps<{
  article: Article
  animationDelay?: number
}>()

function formatDate(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)

  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>

<template>
  <article 
    class="article" 
    :style="{ animationDelay: `${animationDelay ?? 0}s` }"
  >
    <div class="article-meta">
      <span class="article-source">{{ article.source }}</span>
      <span class="article-time">{{ formatDate(article.date) }}</span>
    </div>
    <h2 class="article-title">
      <a :href="article.link" target="_blank" rel="noopener">
        {{ article.title }}
      </a>
    </h2>
    <p v-if="article.description" class="article-description">
      {{ article.description.substring(0, 200) }}
    </p>
  </article>
</template>

<style scoped>
.article {
  padding: 1.5rem 0;
  border-bottom: 1px solid var(--border);
  animation: fadeIn 0.4s ease forwards;
  opacity: 0;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin-bottom: 0.5rem;
}

.article-source {
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--accent);
}

.article-time {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.article-title {
  font-family: var(--font-serif);
  font-size: 1.375rem;
  font-weight: 400;
  line-height: 1.35;
  letter-spacing: -0.01em;
  margin-bottom: 0.5rem;
}

.article-title a {
  color: inherit;
  text-decoration: none;
  transition: color 0.2s ease;
}

.article-title a:hover {
  color: var(--accent);
}

.article-description {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (max-width: 640px) {
  .article-title {
    font-size: 1.125rem;
  }
}
</style>
