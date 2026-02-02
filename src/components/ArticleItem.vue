<script setup lang="ts">
import type { Article } from '../types'
import { useFeed } from '../composables/useFeed'

const props = defineProps<{
  article: Article
  animationDelay?: number
}>()

const { markAsClicked, isClicked } = useFeed()

function handleClick() {
  markAsClicked(props.article.link)
}

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
    class="py-6 border-b border-border animate-[fadeIn_0.4s_ease_forwards] opacity-0"
    :style="{ animationDelay: `${animationDelay ?? 0}s` }"
  >
    <div class="flex items-center gap-2.5 mb-2">
      <span class="text-xs font-medium uppercase tracking-wide text-accent">{{ article.source }}</span>
      <span class="text-xs text-text-tertiary">{{ formatDate(article.date) }}</span>
    </div>
    <h2 class="font-serif text-[1.375rem] font-normal leading-tight tracking-tight mb-2 sm:text-lg">
      <a 
        :href="article.link" 
        target="_blank" 
        rel="noopener"
        class="text-inherit no-underline transition-colors duration-200 hover:text-accent"
        :class="{ 'text-text-tertiary': isClicked(article.link) }"
        @click="handleClick"
      >
        {{ article.title }}
      </a>
    </h2>
    <p 
      v-if="article.description" 
      class="text-[0.9375rem] text-text-secondary leading-relaxed line-clamp-2"
    >
      {{ article.description.substring(0, 200) }}
    </p>
  </article>
</template>
