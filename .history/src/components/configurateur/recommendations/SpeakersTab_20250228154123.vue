<template>
  <div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
    <div v-for="(speaker, index) in recommendedSpeakers" :key="index" class="p-4 border border-gray-200">
      <h3 class="font-medium text-gray-900">{{ speaker.type }}</h3>
      <div class="mt-2 space-y-1">
        <p v-for="(spec, specIndex) in speaker.specs" :key="specIndex" class="text-sm text-gray-500">
          {{ spec }}
        </p>
      </div>
      <a 
        :href="generateSearchUrl(speaker)"
        target="_blank"
        rel="noopener noreferrer"
        class="mt-3 inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
      >
        Rechercher sur Google
        <svg class="ml-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
        </svg>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useConfigStore } from '../../../stores/config'

const store = useConfigStore()

function generateSearchUrl(speaker: any) {
  const searchTerms = [
    speaker.type,
    'haut-parleur',
    ...speaker.specs
  ].join(' ')
  return `https://www.google.com/search?q=${encodeURIComponent(searchTerms)}`
}

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