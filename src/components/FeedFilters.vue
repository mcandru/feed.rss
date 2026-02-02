<script setup lang="ts">
import Button from 'primevue/button'

const props = defineProps<{
  sources: string[]
  activeFilter: string
}>()

const emit = defineEmits<{
  'update:activeFilter': [value: string]
}>()

function setFilter(filter: string) {
  emit('update:activeFilter', filter)
}
</script>

<template>
  <div class="feed-filters">
    <Button
      label="All"
      unstyled
      :class="['filter-btn', { active: activeFilter === 'all' }]"
      @click="setFilter('all')"
    />
    <Button
      v-for="source in sources"
      :key="source"
      :label="source"
      unstyled
      :class="['filter-btn', { active: activeFilter === source }]"
      @click="setFilter(source)"
    />
  </div>
</template>

<style scoped>
.feed-filters {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.filter-btn {
  font-family: inherit;
  font-size: 0.8125rem;
  padding: 0.5rem 0.875rem;
  border-radius: 100px;
  border: 1px solid var(--border);
  background: var(--bg-elevated);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  border-color: var(--border-hover);
  color: var(--text-primary);
}

.filter-btn.active {
  background: var(--text-primary);
  color: var(--bg-elevated);
  border-color: var(--text-primary);
}
</style>
