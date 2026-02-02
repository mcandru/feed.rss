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
  <div class="flex gap-2 mb-8 flex-wrap">
    <Button
      label="All"
      unstyled
      :class="[
        'font-sans text-[0.8125rem] py-2 px-3.5 rounded-full border cursor-pointer transition-all duration-200',
        activeFilter === 'all' 
          ? 'bg-text-primary text-bg-elevated border-text-primary' 
          : 'border-border bg-bg-elevated text-text-secondary hover:border-border-hover hover:text-text-primary'
      ]"
      @click="setFilter('all')"
    />
    <Button
      v-for="source in sources"
      :key="source"
      :label="source"
      unstyled
      :class="[
        'font-sans text-[0.8125rem] py-2 px-3.5 rounded-full border cursor-pointer transition-all duration-200',
        activeFilter === source 
          ? 'bg-text-primary text-bg-elevated border-text-primary' 
          : 'border-border bg-bg-elevated text-text-secondary hover:border-border-hover hover:text-text-primary'
      ]"
      @click="setFilter(source)"
    />
  </div>
</template>
