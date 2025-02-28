<script setup lang="ts">
import { computed } from 'vue'
import { useConfigStore } from '@/stores/configurateur'

const store = useConfigStore()

const physicalRecommendations = computed(() => {
  if (!store.config) return null

  const config = store.config
  const nombreVoies = parseInt(config.nombreVoies || '2')
  const volume = calculateVolume(config)
  const dimensions = calculateDimensions(volume)
  const port = calculatePort(volume, config)

  return {
    volume: `${volume.toFixed(1)}L`,
    dimensions: {
      height: `${dimensions.height}cm`,
      width: `${dimensions.width}cm`,
      depth: `${dimensions.depth}cm`
    },
    materials: [
      'MDF 19mm',
      'Contreplaqué bouleau 18mm',
      'Médium haute densité 22mm'
    ],
    portType: config.typeCharge || 'bass-reflex',
    port: {
      surface: `${port.surface.toFixed(1)}cm²`,
      length: `${port.length.toFixed(1)}cm`,
      diameter: `${port.diameter.toFixed(1)}cm`,
      tuningFreq: `${port.tuningFreq.toFixed(1)}Hz`
    }
  }
})

// Fonctions de calcul
function calculateVolume(config: any) {
  // Calcul basé sur la puissance et le nombre de voies
  const baseVolume = parseInt(config.puissanceAmp || '40') * 0.5
  const voiesMultiplier = parseInt(config.nombreVoies || '2') * 0.7
  return baseVolume * voiesMultiplier
}

function calculateDimensions(volume: number) {
  // Calcul des dimensions selon le ratio d'or (1.618)
  const goldenRatio = 1.618
  const height = Math.cbrt(volume * 1000 * goldenRatio * goldenRatio)
  const width = height / goldenRatio
  const depth = width

  return {
    height: Math.round(height / 10), // conversion en cm
    width: Math.round(width / 10),
    depth: Math.round(depth / 10)
  }
}

function calculatePort(volume: number, config: any) {
  // Calcul des caractéristiques de l'évent
  const fb = 35 // fréquence d'accord typique en Hz
  const diameter = Math.sqrt(volume * 10) // approximation simple
  const surface = Math.PI * Math.pow(diameter / 2, 2)
  const length = (234 * surface) / (fb * fb * volume)

  return {
    surface: surface,
    length: length,
    diameter: diameter,
    tuningFreq: fb
  }
}
</script>

<template>
  <div v-if="physicalRecommendations" class="space-y-6">
    <div class="grid grid-cols-2 gap-6">
      <div>
        <h3 class="font-medium mb-4">Volume et dimensions</h3>
        <div class="space-y-3">
          <div>
            <div class="text-gray-600">Volume optimal</div>
            <div class="font-medium">{{ physicalRecommendations.volume }}</div>
          </div>
          <div>
            <div class="text-gray-600">Dimensions suggérées</div>
            <div class="grid grid-cols-2 gap-2 mt-1">
              <div>
                <div class="text-sm">Hauteur</div>
                <div class="font-medium">{{ physicalRecommendations.dimensions.height }}</div>
              </div>
              <div>
                <div class="text-sm">Largeur</div>
                <div class="font-medium">{{ physicalRecommendations.dimensions.width }}</div>
              </div>
              <div>
                <div class="text-sm">Profondeur</div>
                <div class="font-medium">{{ physicalRecommendations.dimensions.depth }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 class="font-medium mb-4">Caractéristiques de l'évent</h3>
        <div class="space-y-3">
          <div>
            <div class="text-gray-600">Surface</div>
            <div class="font-medium">{{ physicalRecommendations.port.surface }}</div>
          </div>
          <div>
            <div class="text-gray-600">Longueur</div>
            <div class="font-medium">{{ physicalRecommendations.port.length }}</div>
          </div>
          <div>
            <div class="text-gray-600">Diamètre</div>
            <div class="font-medium">{{ physicalRecommendations.port.diameter }}</div>
          </div>
          <div>
            <div class="text-gray-600">Fréquence d'accord</div>
            <div class="font-medium">{{ physicalRecommendations.port.tuningFreq }}</div>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 class="font-medium mb-2">Matériaux recommandés</h3>
      <ul class="list-disc list-inside text-gray-600">
        <li v-for="material in physicalRecommendations.materials" 
            :key="material">{{ material }}</li>
      </ul>
    </div>
  </div>
  <div v-else class="text-gray-500 text-center py-4">
    Chargement des recommandations...
  </div>
</template> 