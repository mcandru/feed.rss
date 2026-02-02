<script setup lang="ts">
import Button from 'primevue/button'

defineEmits<{
  manage: []
  refresh: []
}>()
</script>

<template>
  <header class="header">
    <div class="header-inner">
      <div class="logo">Feed</div>
      <div class="header-actions">
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

<style scoped>
.header {
  position: sticky;
  top: 0;
  background: rgba(250, 248, 245, 0.9);
  border-bottom: 1px solid var(--border);
  z-index: 100;
  backdrop-filter: blur(10px);
}

.header-inner {
  max-width: 900px;
  margin: 0 auto;
  padding: 1.25rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-family: var(--font-serif);
  font-size: 1.5rem;
  font-weight: 500;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

@media (max-width: 640px) {
  .header-inner {
    padding: 1rem 1.25rem;
  }
}
</style>
