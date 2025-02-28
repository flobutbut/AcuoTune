<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { Config } from '@/types/configurateur'
import { calculateSpeakerRecommendations } from '@/utils/calculations/speakers'
import { useConfigStore } from '@/stores/configurateur'

const activeTab = ref('physique')

const props = defineProps<{
  config: Config
}>()

const store = useConfigStore()

// Logique de calcul des recommandations
const recommendations = computed(() => {
  if (!store.config || !store.recommendations) {
    console.log('Données manquantes:', { config: store.config, recs: store.recommendations })
    return []
  }

  const recs = calculateSpeakerRecommendations({
    ...store.config,
    nombreVoies: parseInt(store.config.nombreVoies || '2'),
    puissance: store.config.puissanceAmp,
    impedance: parseInt(store.config.impedance || '8'),
    typeCharge: store.config.typeCharge || 'bass-reflex'
  })

  console.log('Recommandations calculées:', recs)
  return recs
})

const speakerTypeLabels: Record<string, string> = {
  subwoofer: 'Subwoofer',
  woofer: 'Grave',
  midrange: 'Médium',
  tweeter: 'Aigu'
}

// Debug et monitoring
onMounted(() => {
  console.log('État initial:', {
    config: store.config,
    recommendations: store.recommendations
  })
})

watch(() => store.config, (newConfig) => {
  console.log('Configuration mise à jour:', newConfig)
}, { deep: true })

// Données temporaires pour test
const physicalRecommendations = {
  volume: '30L',
  dimensions: {
    height: '80cm',
    width: '30cm',
    depth: '40cm'
  },
  materials: ['MDF 19mm', 'Contreplaqué bouleau 18mm'],
  portType: 'Bass-reflex',
  port: {
    surface: '50cm²',
    length: '15cm',
    diameter: '8cm',
    tuningFreq: '35Hz'
  }
}

const electronicRecommendations = {
  impedance: '8Ω',
  power: '100W RMS',
  crossoverFreqs: ['500Hz', '3.5kHz'],
  filterSlope: '12dB/octave',
  efficiency: '89dB'
}

const speakerRecommendations = [
  {
    type: 'Grave',
    impedance: '8Ω',
    power: '100W RMS',
    sensitivity: '89dB'
  },
  {
    type: 'Médium',
    impedance: '8Ω',
    power: '50W RMS',
    sensitivity: '91dB'
  },
  {
    type: 'Aigu',
    impedance: '8Ω',
    power: '25W RMS',
    sensitivity: '92dB'
  }
]
</script>

<template>
  <div class="w-full">
    <h2 class="text-xl font-medium mb-2">Recommandations</h2>
    <p class="text-gray-600 mb-6">Spécifications techniques recommandées pour votre enceinte</p>

    <!-- Onglets -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="flex space-x-8">
        <button 
          v-for="tab in ['physique', 'electronique', 'hautparleurs']"
          :key="tab"
          @click="activeTab = tab"
          :class="[
            'pb-4 px-1 font-medium text-sm border-b-2',
            activeTab === tab 
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          {{ tab === 'physique' ? 'Caractéristiques physiques' :
             tab === 'electronique' ? 'Configuration électronique' :
             'Haut-parleurs recommandés' }}
        </button>
      </nav>
    </div>

    <!-- Onglet Physique -->
    <div v-if="activeTab === 'physique'" class="space-y-6">
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

    <!-- Onglet Électronique -->
    <div v-if="activeTab === 'electronique'" class="space-y-6">
      <div class="grid grid-cols-2 gap-6">
        <div class="space-y-4">
          <div>
            <div class="text-gray-600">Impédance globale</div>
            <div class="font-medium">{{ electronicRecommendations.impedance }}</div>
          </div>
          <div>
            <div class="text-gray-600">Puissance admissible</div>
            <div class="font-medium">{{ electronicRecommendations.power }}</div>
          </div>
          <div>
            <div class="text-gray-600">Fréquences de coupure</div>
            <div class="font-medium">{{ electronicRecommendations.crossoverFreqs.join(' / ') }}</div>
          </div>
          <div>
            <div class="text-gray-600">Pente du filtre</div>
            <div class="font-medium">{{ electronicRecommendations.filterSlope }}</div>
          </div>
          <div>
            <div class="text-gray-600">Efficacité</div>
            <div class="font-medium">{{ electronicRecommendations.efficiency }}</div>
          </div>
        </div>
        
        <div class="bg-gray-50 rounded-lg p-4">
          <!-- Emplacement pour le graphe de réponse en fréquence -->
          <div class="text-center text-gray-500">Graphe de réponse en fréquence</div>
        </div>
      </div>
    </div>

    <!-- Onglet Haut-parleurs -->
    <div v-if="activeTab === 'hautparleurs'" class="space-y-6">
      <div v-for="(speaker, index) in speakerRecommendations" 
           :key="index"
           class="bg-white rounded-lg border border-gray-200 p-4">
        <h3 class="font-medium mb-4">Haut-parleur {{ index + 1 }}</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-gray-600">Type</div>
            <div class="font-medium">{{ speaker.type }}</div>
          </div>
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
        </div>
      </div>

      <div class="bg-blue-50 text-blue-700 p-4 rounded-lg text-sm">
        Ces recommandations sont fournies à titre indicatif. Pour des résultats optimaux, consultez un spécialiste en acoustique.
      </div>
    </div>
  </div>
</template>