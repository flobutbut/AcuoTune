<script setup lang="ts">
defineProps<{
  label: string
  name: string
  value: number
  min: number
  max: number
  step: number
  unit?: string
}>()

defineEmits<{
  (e: 'update', event: Event): void
}>()
</script>

<template>
  <div class="space-y-2">
    <!-- Label et valeur actuelle -->
    <div class="flex justify-between items-center">
      <label :for="name" class="block text-sm font-medium text-gray-700">
        {{ label }}
      </label>
      <span class="text-sm text-gray-500">
        {{ value }}{{ unit }}
      </span>
    </div>

    <!-- Input range -->
    <input
      :id="name"
      type="range"
      :name="name"
      :min="min"
      :max="max"
      :step="step"
      :value="value"
      @input="$emit('update', $event)"
      class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer 
             dark:bg-gray-700 accent-indigo-600 focus:outline-none focus:ring-2 
             focus:ring-indigo-500 focus:ring-offset-2"
    />

    <!-- Valeurs min/max -->
    <div class="flex justify-between px-1">
      <span class="text-xs text-gray-500">{{ min }}{{ unit }}</span>
      <span class="text-xs text-gray-500">{{ Math.round((max + min) / 2) }}{{ unit }}</span>
      <span class="text-xs text-gray-500">{{ max }}{{ unit }}</span>
    </div>
  </div>
</template> 