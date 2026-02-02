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
      <div v-if="visible" class="modal-overlay" @click="onOverlayClick">
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div class="modal-header">
            <h2 id="modal-title" class="modal-title">Manage Feeds</h2>
            <button class="modal-close" @click="closeModal" aria-label="Close">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M4 4l8 8M12 4l-8 8"/>
              </svg>
            </button>
          </div>
          
          <div class="modal-body">
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
              <button type="submit" class="btn btn-primary btn-full">
                Add Feed
              </button>
            </form>

            <div class="feeds-section">
              <h3 class="feeds-section-title">Your feeds</h3>
              <ul v-if="feeds.length > 0" class="feed-list">
                <li v-for="feed in feeds" :key="feed.url" class="feed-item">
                  <div class="feed-info">
                    <div class="feed-name">{{ feed.name }}</div>
                    <div class="feed-url">{{ feed.url }}</div>
                  </div>
                  <button
                    class="feed-delete"
                    :title="'Remove ' + feed.name"
                    @click="$emit('deleteFeed', feed.url)"
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                      <path d="M3 6h10M5 6V4a1 1 0 011-1h4a1 1 0 011 1v2M6 6v7M10 6v7"/>
                    </svg>
                  </button>
                </li>
              </ul>
              <p v-else class="no-feeds">No feeds added yet.</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(26, 26, 26, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--bg-elevated);
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 85vh;
  overflow: hidden;
  box-shadow: 0 24px 48px var(--shadow-lg);
}

.modal-header {
  padding: 1.5rem 1.5rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border);
}

.modal-title {
  font-family: var(--font-serif);
  font-size: 1.25rem;
  font-weight: 500;
  margin: 0;
}

.modal-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: var(--border);
  color: var(--text-primary);
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  max-height: calc(85vh - 80px);
}

.btn-full {
  width: 100%;
}

.feeds-section {
  margin-top: 2rem;
}

.feeds-section-title {
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 1rem;
  color: var(--text-secondary);
}

.feed-list {
  list-style: none;
}

.feed-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 0;
  border-bottom: 1px solid var(--border);
}

.feed-item:last-child {
  border-bottom: none;
}

.feed-info {
  flex: 1;
  min-width: 0;
}

.feed-name {
  font-weight: 500;
  margin-bottom: 0.125rem;
}

.feed-url {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.feed-delete {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--text-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.5rem;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.feed-delete:hover {
  background: #FEE2E2;
  color: #DC2626;
}

.no-feeds {
  color: var(--text-tertiary);
  font-size: 0.875rem;
}

/* Transition animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal,
.modal-leave-to .modal {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}

@media (max-width: 640px) {
  .modal {
    width: 95%;
    max-height: 90vh;
  }
}
</style>
