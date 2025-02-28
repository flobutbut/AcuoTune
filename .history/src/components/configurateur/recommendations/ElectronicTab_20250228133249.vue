<script setup lang="ts">
import { computed } from 'vue'
import { useConfigurateurStore } from '@/stores/configurateur'
import { calculateElectronic } from '@/utils/calculations/electronic'
import { calculateAcoustic } from '@/utils/calculations/acoustic'
import FrequencyResponseChart from '../FrequencyResponseChart.vue'

const store = useConfigurateurStore()

const electronicRecommendations = computed(() => {
  if (!store.config) return null
  const acousticParams = calculateAcoustic(store.config)
  return calculateElectronic(store.config, acousticParams)
})
</script>

<template>
  <div class="space-y-6 p-4">
    <div v-if="electronicRecommendations" class="space-y-6">
      <!-- Panneau des paramètres -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div v-for="(value, key) in [
            { label: 'Impédance globale', value: electronicRecommendations.impedanceGlobale },
            { label: 'Puissance admissible', value: electronicRecommendations.puissanceAdmissible },
            { label: 'Fréquences de coupure', value: electronicRecommendations.frequencesCoupure.join(' / ') },
            { label: 'Pente du filtre', value: electronicRecommendations.penteFiltre },
            { label: 'Sensibilité', value: electronicRecommendations.sensibilite }
          ]" :key="key" class="group">
            <div class="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">{{ value.label }}</div>
            <div class="font-medium text-gray-900">{{ value.value }}</div>
          </div>
        </div>
      </div>
      
      <!-- Graphique -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Réponse en fréquence</h3>
        <div class="h-[400px] w-full">
          <FrequencyResponseChart 
            :config="store.config"
            :electronic-params="electronicRecommendations"
          />
        </div>
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
  </div>
</template> 