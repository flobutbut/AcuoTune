<template>
  <div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
    <div v-for="(speaker, index) in recommendedSpeakers" :key="index" class="p-4 border border-gray-200">
      <h3 class="font-medium text-gray-900">{{ speaker.type }}</h3>
      <div class="mt-2 space-y-1">
        <p v-for="(spec, specIndex) in speaker.specs" :key="specIndex" class="text-sm text-gray-500">
          {{ spec }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useConfigStore } from '@/stores/config'

const store = useConfigStore()

const recommendedSpeakers = computed(() => {
  const speakers = []
  const nombreVoies = parseInt(store.config.nombreVoies)

  if (nombreVoies >= 2) {
    speakers.push({
      type: 'Woofer',
      specs: [
        'Diamètre: 16-21cm',
        'Puissance: 60-100W RMS',
        'Impédance: 8Ω',
        'Fs < 45Hz'
      ]
    })
  }

  if (nombreVoies >= 3) {
    speakers.push({
      type: 'Medium',
      specs: [
        'Diamètre: 13-16cm',
        'Puissance: 40-80W RMS',
        'Impédance: 8Ω',
        'Fs: 50-100Hz'
      ]
    })
  }

  if (nombreVoies >= 2) {
    speakers.push({
      type: 'Tweeter',
      specs: [
        'Diamètre: 25mm',
        'Puissance: 20-50W RMS',
        'Impédance: 8Ω',
        'Fs < 1.5kHz'
      ]
    })
  }

  return speakers
})
</script> 