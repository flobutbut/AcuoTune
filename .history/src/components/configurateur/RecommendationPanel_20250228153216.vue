<template>
  <div class="recommendation-panel">
    <h2>{{ title }}</h2>
    <p v-if="description" class="description">{{ description }}</p>
    
    <div class="tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab"
        :class="{ active: activeTab === tab }"
        @click="activeTab = tab"
      >
        {{ tab }}
      </button>
    </div>

    <div class="content">
      <slot :name="activeTab"></slot>
    </div>
  </div>
</template>

<style scoped>
.recommendation-panel {
  width: 100%;
}

.description {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.tabs button {
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  color: var(--text-secondary);
}

.tabs button.active {
  color: var(--text-primary);
  border-bottom: 2px solid var(--primary);
}

.content {
  width: 100%;
}
</style>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  title: string
  description?: string
  tabs: string[]
}>()

const activeTab = ref(props.tabs[0])
</script> 