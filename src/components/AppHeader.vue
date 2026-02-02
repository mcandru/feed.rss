<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import { useFeed } from '../composables/useFeed'

defineEmits<{
  manage: []
  refresh: []
}>()

const { getShareUrl } = useFeed()

const showCopied = ref(false)

async function handleShare() {
  const url = getShareUrl()
  
  try {
    await navigator.clipboard.writeText(url)
    showCopied.value = true
    setTimeout(() => {
      showCopied.value = false
    }, 2000)
  } catch {
    // Fallback for browsers that don't support clipboard API
    prompt('Copy this link to share your feeds:', url)
  }
}
</script>

<template>
  <header class="sticky top-0 bg-bg/90 border-b border-border z-[100] backdrop-blur-[10px]">
    <div class="max-w-[900px] mx-auto py-5 px-8 flex justify-between items-center sm:py-4 sm:px-5">
      <div class="font-serif text-2xl font-medium tracking-tight text-text-primary">Feed</div>
      <div class="flex gap-2">
        <Button
          unstyled
          class="btn btn-ghost relative"
          @click="handleShare"
        >
          <template #icon>
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 12v1a2 2 0 002 2h8a2 2 0 002-2v-1M8 3v9M12 7l-4-4-4 4"/>
            </svg>
          </template>
          <span>{{ showCopied ? 'Copied!' : 'Share' }}</span>
        </Button>
        <Button
          label="Manage"
          unstyled
          class="btn btn-ghost"
          @click="$emit('manage')"
        >
          <template #icon>
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <circle cx="8" cy="8" r="6"/>
              <path d="M8 5v6M5 8h6"/>
            </svg>
          </template>
        </Button>
        <Button
          label="Refresh"
          unstyled
          class="btn btn-primary"
          @click="$emit('refresh')"
        >
          <template #icon>
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M2 8a6 6 0 0111.5-2.5M14 8a6 6 0 01-11.5 2.5"/>
              <path d="M14 3v3h-3M2 13v-3h3"/>
            </svg>
          </template>
        </Button>
      </div>
    </div>
  </header>
</template>
