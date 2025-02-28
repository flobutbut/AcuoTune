<script setup lang="ts">
import { computed } from 'vue'
import { useConfigStore } from '@/stores/configurateur'
import { calculateElectronic } from '@/utils/calculations/electronic'
import { calculateAcoustic } from '@/utils/calculations/acoustic'

const store = useConfigStore()

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
</script>

<template>
  <div class="space-y-6">
    <div v-if="speakerRecommendations" 
         v-for="(speaker, index) in speakerRecommendations" 
         :key="index"
         class="bg-white rounded-lg border border-gray-200 p-4">
      <h3 class="font-medium mb-4">{{ speaker.type }}</h3>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <div class="text-gray-600">Impédance</div>
          <div class="font-medium">{{ speaker.impedance }}</div>
        </div>
        <div>
          <div class="text-gray-600">Puissance</div>
          <div class="font-medium">{{ speaker.power }}</div>
        </div>
        <div>
          <div class="text-gray-600">Sensibilité</div>
          <div class="font-medium">{{ speaker.sensitivity }}</div>
        </div>
        <div>
          <div class="text-gray-600">Bande passante</div>
          <div class="font-medium">{{ speaker.freqRange }}</div>
        </div>
      </div>
    </div>

    <div v-else class="text-gray-500 text-center py-4">
      Chargement des recommandations...
    </div>

    <div class="bg-blue-50 text-blue-700 p-4 rounded-lg text-sm">
      Ces recommandations sont fournies à titre indicatif. Pour des résultats optimaux, consultez un spécialiste en acoustique.
    </div>
  </div>
</template> 