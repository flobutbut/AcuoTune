<script setup lang="ts">
import { computed } from 'vue'
import { useConfigurateurStore } from '@/stores/configurateur'
import { calculateElectronic } from '@/utils/calculations/electronic'
import { calculateAcoustic } from '@/utils/calculations/acoustic'

const store = useConfigurateurStore()

const speakerRecommendations = computed(() => {
  if (!store.config) return null

  const acousticParams = calculateAcoustic(store.config)
  const electronicParams = calculateElectronic(store.config, acousticParams)

  // Création des recommandations pour chaque voie
  const speakers = []
  const nombreVoies = parseInt(store.config.nombreVoies || '2')
  const freqCoupure = electronicParams.frequencesCoupure

  // Labels pour chaque type de haut-parleur selon le nombre de voies
  const speakerTypes = {
    2: ['Grave', 'Aigu'],
    3: ['Grave', 'Médium', 'Aigu'],
    4: ['Grave', 'Bas-médium', 'Haut-médium', 'Aigu']
  }

  // Calcul des puissances recommandées pour chaque voie
  const totalPower = parseInt(store.config.puissanceAmp || '100')
  const powerDistribution = {
    2: [0.7, 0.3],
    3: [0.5, 0.3, 0.2],
    4: [0.4, 0.3, 0.2, 0.1]
  }

  // Sensibilités recommandées (augmentation progressive vers l'aigu)
  const baseSensitivity = parseInt(electronicParams.sensibilite)

  for (let i = 0; i < nombreVoies; i++) {
    const powerRatio = powerDistribution[nombreVoies as keyof typeof powerDistribution][i]
    const power = Math.round(totalPower * powerRatio)
    
    speakers.push({
      type: speakerTypes[nombreVoies as keyof typeof speakerTypes][i],
      impedance: electronicParams.impedanceGlobale.split(' ')[0], // Prend la valeur nominale
      power: `${power}W RMS`,
      sensitivity: `${baseSensitivity + i}dB`,
      freqRange: getFrequencyRange(i, nombreVoies, freqCoupure)
    })
  }

  return speakers
})

function getFrequencyRange(index: number, totalVoies: number, freqCoupure: string[]): string {
  const freqs = freqCoupure.map(f => parseInt(f))
  
  if (index === 0) {
    return `20Hz - ${freqs[0]}Hz`
  } else if (index === totalVoies - 1) {
    return `${freqs[freqs.length - 1]}Hz - 20kHz`
  } else {
    return `${freqs[index - 1]}Hz - ${freqs[index]}Hz`
  }
}

function generateSearchUrl(speaker: any) {
  const searchTerms = [
    speaker.type,
    ...speaker.specs
  ].join(' ')
  
  return `https://www.google.com/search?q=${encodeURIComponent(searchTerms)}`
}
</script>

<template>
  <div class="space-y-6 p-4">
    <div v-if="speakerRecommendations" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div v-for="(speaker, index) in speakerRecommendations" 
           :key="index"
           class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <span class="w-3 h-3 rounded-full mr-2" 
                :class="{
                  'bg-blue-500': index === 0,
                  'bg-green-500': index === 1,
                  'bg-red-500': index === 2,
                  'bg-purple-500': index === 3
                }"></span>
          {{ speaker.type }}
        </h3>
        <div class="grid grid-cols-2 gap-4">
          <div v-for="(value, key) in [
            { label: 'Impédance', value: speaker.impedance },
            { label: 'Puissance', value: speaker.power },
            { label: 'Sensibilité', value: speaker.sensitivity },
            { label: 'Bande passante', value: speaker.freqRange }
          ]" :key="key" class="group">
            <div class="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">{{ value.label }}</div>
            <div class="font-medium text-gray-900">{{ value.value }}</div>
          </div>
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

    <div v-else class="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
      <div class="text-gray-500">
        <svg class="w-8 h-8 mx-auto mb-2 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <span>Chargement des recommandations...</span>
      </div>
    </div>

    <div class="bg-blue-50 rounded-lg p-4">
      <div class="flex items-start space-x-3">
        <svg class="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p class="text-sm text-blue-700">
          Ces recommandations sont fournies à titre indicatif. Pour des résultats optimaux, consultez un spécialiste en acoustique.
        </p>
      </div>
    </div>
  </div>
</template> 