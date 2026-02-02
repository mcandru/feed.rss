<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Feed } from '../types'

const props = defineProps<{
  visible: boolean
  feeds: Feed[]
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  addFeed: [feed: Feed]
  deleteFeed: [url: string]
}>()

const newFeedUrl = ref('')
const newFeedName = ref('')

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return url
  }
}

function handleSubmit() {
  const url = newFeedUrl.value.trim()
  if (!url) return

  const name = newFeedName.value.trim() || extractDomain(url)
  
  if (props.feeds.some(f => f.url === url)) {
    alert('This feed already exists!')
    return
  }

  emit('addFeed', { name, url })
  newFeedUrl.value = ''
  newFeedName.value = ''
}

function closeModal() {
  emit('update:visible', false)
}

function onOverlayClick(e: MouseEvent) {
  if ((e.target as HTMLElement).classList.contains('modal-overlay')) {
    closeModal()
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    closeModal()
  }
}

watch(() => props.visible, (visible) => {
  if (visible) {
    document.addEventListener('keydown', onKeydown)
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', onKeydown)
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="visible" 
        class="modal-overlay fixed inset-0 bg-black/40 backdrop-blur-[4px] flex items-center justify-center z-[1000]" 
        @click="onOverlayClick"
      >
        <div 
          class="bg-bg-elevated rounded-2xl w-[90%] max-w-[500px] max-h-[85vh] overflow-hidden shadow-2xl sm:w-[95%] sm:max-h-[90vh]" 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="modal-title"
        >
          <div class="p-6 pb-4 flex justify-between items-center border-b border-border">
            <h2 id="modal-title" class="font-serif text-xl font-medium m-0">Manage Feeds</h2>
            <button 
              class="w-8 h-8 rounded-lg border-none bg-transparent cursor-pointer text-text-secondary flex items-center justify-center transition-all duration-200 hover:bg-border hover:text-text-primary" 
              @click="closeModal" 
              aria-label="Close"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M4 4l8 8M12 4l-8 8"/>
              </svg>
            </button>
          </div>
          
          <div class="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
            <form @submit.prevent="handleSubmit">
              <div class="form-group">
                <label class="form-label">Add new feed</label>
                <input
                  v-model="newFeedUrl"
                  type="url"
                  placeholder="https://example.com/rss"
                  class="form-input"
                  required
                />
                <p class="form-hint">Enter the RSS or Atom feed URL</p>
              </div>
              <div class="form-group">
                <input
                  v-model="newFeedName"
                  type="text"
                  placeholder="Feed name (optional)"
                  class="form-input"
                />
              </div>
              <button type="submit" class="btn btn-primary w-full justify-center">
                Add Feed
              </button>
            </form>

            <div class="mt-8">
              <h3 class="text-sm font-medium mb-4 text-text-secondary">Your feeds</h3>
              <ul v-if="feeds.length > 0" class="list-none">
                <li 
                  v-for="feed in feeds" 
                  :key="feed.url" 
                  class="flex items-center justify-between py-3.5 border-b border-border last:border-b-0"
                >
                  <div class="flex-1 min-w-0">
                    <div class="font-medium mb-0.5">{{ feed.name }}</div>
                    <div class="text-[0.8125rem] text-text-tertiary whitespace-nowrap overflow-hidden text-ellipsis">{{ feed.url }}</div>
                  </div>
                  <button
                    class="w-8 h-8 rounded-md border-none bg-transparent cursor-pointer text-text-tertiary flex items-center justify-center ml-2 shrink-0 transition-all duration-200 hover:bg-red-100 hover:text-red-600"
                    :title="'Remove ' + feed.name"
                    @click="$emit('deleteFeed', feed.url)"
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                      <path d="M3 6h10M5 6V4a1 1 0 011-1h4a1 1 0 011 1v2M6 6v7M10 6v7"/>
                    </svg>
                  </button>
                </li>
              </ul>
              <p v-else class="text-text-tertiary text-sm">No feeds added yet.</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
/* Transition animations - kept in style tag as they require Vue transition classes */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s ease, opacity 0.3s ease;
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
