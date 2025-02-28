<template>
  <RadioGroup :modelValue="modelValue" @update:modelValue="$emit('update:modelValue', $event)">
    <RadioGroupLabel class="block text-sm font-medium text-gray-700">
      {{ label }}
    </RadioGroupLabel>
    <p v-if="description" class="mt-1 text-sm text-gray-500">
      {{ description }}
    </p>
    <div class="mt-2 grid grid-cols-3 gap-4">
      <RadioGroupOption
        v-for="option in options"
        :key="option.value"
        :value="option.value"
        v-slot="{ checked }"
        class="flex flex-col items-center"
      >
        <div
          :class="[
            'w-full px-4 py-3 text-sm font-medium rounded-lg border transition-colors',
            checked
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          ]"
        >
          {{ option.label }}
        </div>
        <span v-if="option.description" class="mt-1 text-xs text-gray-500">
          {{ option.description }}
        </span>
      </RadioGroupOption>
    </div>
  </RadioGroup>
</template>

<script setup lang="ts">
import { RadioGroup, RadioGroupLabel, RadioGroupOption } from '@headlessui/vue'

interface Option {
  value: any
  label: string
  description?: string
}

defineProps<{
  modelValue: any
  label: string
  description?: string
  options: Option[]
}>()

defineEmits<{
  'update:modelValue': [value: any]
}>()
</script> 