<script setup lang="ts">
interface Option {
  value: string
  label: string
}

defineProps<{
  label: string
  name: string
  value: string
  options: Option[]
}>()

defineEmits<{
  (e: 'update', event: Event): void
}>()
</script>

<template>
  <div class="space-y-2">
    <label :for="name" class="block text-sm font-medium text-gray-700">
      {{ label }}
    </label>
    <select
      :id="name"
      :name="name"
      :value="value"
      @change="$emit('update', $event)"
      class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base 
             focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 
             bg-white shadow-sm"
    >
      <option 
        v-for="option in options" 
        :key="option.value" 
        :value="option.value"
        class="text-gray-900"
      >
        {{ option.label }}
      </option>
    </select>
  </div>
</template> 