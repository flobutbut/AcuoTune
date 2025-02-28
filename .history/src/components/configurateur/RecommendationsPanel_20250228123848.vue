<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { Config } from '@/types/configurateur'
import { calculateSpeakerRecommendations } from '@/utils/calculations/speakers'
import { useConfigStore } from '@/stores/configurateur'

const activeTab = ref('hautparleurs')

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
</script>

<template>
  <div class="w-full">
    <h2 class="text-xl font-medium mb-2">Recommandations</h2>
    <p class="text-gray-600 mb-6">Spécifications techniques recommandées pour votre enceinte</p>

    <!-- Onglets -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="flex space-x-8">
        <button 
          @click="activeTab = 'physique'"
          :class="[
            'pb-4 px-1 font-medium text-sm border-b-2',
            activeTab === 'physique' 
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          Caractéristiques physiques
        </button>
        <button 
          @click="activeTab = 'electronique'"
          :class="[
            'pb-4 px-1 font-medium text-sm border-b-2',
            activeTab === 'electronique' 
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          Configuration électronique
        </button>
        <button 
          @click="activeTab = 'hautparleurs'"
          :class="[
            'pb-4 px-1 font-medium text-sm border-b-2',
            activeTab === 'hautparleurs' 
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          Haut-parleurs recommandés
        </button>
        <button 
          @click="activeTab = 'simulation'"
          :class="[
            'pb-4 px-1 font-medium text-sm border-b-2',
            activeTab === 'simulation' 
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          Simulation
        </button>
      </nav>
    </div>

    <!-- Contenu des onglets -->
    <div v-if="activeTab === 'hautparleurs'" class="space-y-8">
      <!-- Message d'état/chargement -->
      <div v-if="!recommendations || recommendations.length === 0" 
           class="text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
        <p>Calcul des recommandations en cours...</p>
        <p class="text-sm mt-2">Configuration actuelle :</p>
        <pre class="text-xs mt-1">{{ JSON.stringify(store.config, null, 2) }}</pre>
      </div>

      <!-- Liste des haut-parleurs -->
      <template v-else>
        <div v-for="rec in recommendations" 
             :key="rec.type" 
             class="bg-white">
          <h3 class="font-medium mb-4">{{ speakerTypeLabels[rec.type] }}</h3>
          <div class="grid grid-cols-2 gap-y-4">
            <div>
              <div class="text-gray-600">Type</div>
              <div class="font-medium">{{ rec.type }}</div>
            </div>
            <div>
              <div class="text-gray-600">Impédance</div>
              <div class="font-medium">{{ rec.impedance }}</div>
            </div>
            <div>
              <div class="text-gray-600">Puissance</div>
              <div class="font-medium">{{ rec.power }}</div>
            </div>
            <div>
              <div class="text-gray-600">Sensibilité</div>
              <div class="font-medium">{{ rec.sensitivity }}</div>
            </div>
            <div v-if="rec.resonance" class="col-span-2">
              <div class="text-gray-600">Fréquence de résonance</div>
              <div class="font-medium">{{ rec.resonance }}</div>
            </div>
          </div>
        </div>
      </template>

      <!-- Message d'avertissement -->
      <div class="bg-blue-50 text-blue-700 p-4 rounded-lg text-sm mt-6">
        Ces recommandations sont fournies à titre indicatif. Pour des résultats optimaux, consultez un spécialiste en acoustique.
      </div>
    </div>

    <div v-if="activeTab === 'physique'">
      <!-- Contenu de l'onglet physique -->
    </div>
    <div v-if="activeTab === 'electronique'">
      <!-- Contenu de l'onglet électronique -->
    </div>
    <div v-if="activeTab === 'simulation'">
      <!-- Contenu de l'onglet simulation -->
    </div>
  </div>
</template>