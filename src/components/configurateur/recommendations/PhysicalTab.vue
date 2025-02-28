<script setup lang="ts">
import { computed } from 'vue'
import { useConfigurateurStore } from '@/stores/configurateur'
import { calculatePhysical } from '@/utils/calculations/physical'
import { calculateAcoustic } from '@/utils/calculations/acoustic'

const store = useConfigurateurStore()

const physicalRecommendations = computed(() => {
  if (!store.config) return null

  // Calcul des paramètres acoustiques nécessaires
  const acousticParams = calculateAcoustic(store.config)
  
  // Calcul des paramètres physiques
  return calculatePhysical(store.config, acousticParams)
})
</script>

<template>
  <div class="space-y-6 p-4">
    <div v-if="physicalRecommendations" class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Volume et dimensions -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Volume et dimensions</h3>
          <div class="space-y-4">
            <div>
              <div class="text-sm text-gray-600">Volume optimal</div>
              <div class="font-medium text-gray-900">{{ physicalRecommendations.volume }}L</div>
            </div>
            <div>
              <div class="text-sm text-gray-600 mb-2">Dimensions suggérées</div>
              <div class="grid grid-cols-3 gap-4">
                <div class="bg-gray-50 p-3 rounded-lg">
                  <div class="text-xs text-gray-500">Hauteur</div>
                  <div class="font-medium text-gray-900">{{ physicalRecommendations.dimensions.hauteur }}cm</div>
                </div>
                <div class="bg-gray-50 p-3 rounded-lg">
                  <div class="text-xs text-gray-500">Largeur</div>
                  <div class="font-medium text-gray-900">{{ physicalRecommendations.dimensions.largeur }}cm</div>
                </div>
                <div class="bg-gray-50 p-3 rounded-lg">
                  <div class="text-xs text-gray-500">Profondeur</div>
                  <div class="font-medium text-gray-900">{{ physicalRecommendations.dimensions.profondeur }}cm</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Caractéristiques de l'évent -->
        <div v-if="physicalRecommendations.ventilation" 
             class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Caractéristiques de l'évent</h3>
          <div class="grid grid-cols-2 gap-4">
            <div v-for="(value, key) in [
              { label: 'Surface', value: physicalRecommendations.eventSpecs.surface + 'cm²' },
              { label: 'Longueur', value: physicalRecommendations.eventSpecs.longueur + 'cm' },
              { label: 'Diamètre', value: physicalRecommendations.eventSpecs.diametre + 'cm' },
              { label: 'Fréquence d\'accord', value: physicalRecommendations.eventSpecs.frequence + 'Hz' }
            ]" :key="key" class="group">
              <div class="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">{{ value.label }}</div>
              <div class="font-medium text-gray-900">{{ value.value }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Matériaux recommandés -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Matériaux recommandés</h3>
        <ul class="space-y-2">
          <li v-for="material in physicalRecommendations.materiaux" 
              :key="material"
              class="flex items-center space-x-2 text-gray-700">
            <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <span>{{ material }}</span>
          </li>
        </ul>
      </div>

      <!-- Type de charge -->
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="text-sm text-gray-700">
          <div class="font-medium mb-1">Type de charge : {{ physicalRecommendations.typeCharge }}</div>
          <p class="text-gray-600">Les dimensions sont calculées selon le ratio d'or pour une esthétique optimale.</p>
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