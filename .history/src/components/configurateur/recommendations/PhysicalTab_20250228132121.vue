<script setup lang="ts">
import { computed } from 'vue'
import { useConfigStore } from '@/stores/configurateur'
import { calculatePhysical } from '@/utils/calculations/physical'
import { calculateAcoustic } from '@/utils/calculations/acoustic'

const store = useConfigStore()

const physicalRecommendations = computed(() => {
  if (!store.config) return null

  // Calcul des paramètres acoustiques nécessaires
  const acousticParams = calculateAcoustic(store.config)
  
  // Calcul des paramètres physiques
  return calculatePhysical(store.config, acousticParams)
})
</script>

<template>
  <div v-if="physicalRecommendations" class="space-y-6">
    <div class="grid grid-cols-2 gap-6">
      <div>
        <h3 class="font-medium mb-4">Volume et dimensions</h3>
        <div class="space-y-3">
          <div>
            <div class="text-gray-600">Volume optimal</div>
            <div class="font-medium">{{ physicalRecommendations.volume }}L</div>
          </div>
          <div>
            <div class="text-gray-600">Dimensions suggérées</div>
            <div class="grid grid-cols-2 gap-2 mt-1">
              <div>
                <div class="text-sm">Hauteur</div>
                <div class="font-medium">{{ physicalRecommendations.dimensions.hauteur }}cm</div>
              </div>
              <div>
                <div class="text-sm">Largeur</div>
                <div class="font-medium">{{ physicalRecommendations.dimensions.largeur }}cm</div>
              </div>
              <div>
                <div class="text-sm">Profondeur</div>
                <div class="font-medium">{{ physicalRecommendations.dimensions.profondeur }}cm</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="physicalRecommendations.ventilation">
        <h3 class="font-medium mb-4">Caractéristiques de l'évent</h3>
        <div class="space-y-3">
          <div>
            <div class="text-gray-600">Surface</div>
            <div class="font-medium">{{ physicalRecommendations.eventSpecs.surface }}cm²</div>
          </div>
          <div>
            <div class="text-gray-600">Longueur</div>
            <div class="font-medium">{{ physicalRecommendations.eventSpecs.longueur }}cm</div>
          </div>
          <div>
            <div class="text-gray-600">Diamètre</div>
            <div class="font-medium">{{ physicalRecommendations.eventSpecs.diametre }}cm</div>
          </div>
          <div>
            <div class="text-gray-600">Fréquence d'accord</div>
            <div class="font-medium">{{ physicalRecommendations.eventSpecs.frequence }}Hz</div>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 class="font-medium mb-2">Matériaux recommandés</h3>
      <ul class="list-disc list-inside text-gray-600">
        <li v-for="material in physicalRecommendations.materiaux" 
            :key="material">{{ material }}</li>
      </ul>
    </div>

    <div class="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
      <div class="font-medium mb-1">Type de charge : {{ physicalRecommendations.typeCharge }}</div>
      <p>Les dimensions sont calculées selon le ratio d'or pour une esthétique optimale.</p>
    </div>
  </div>
  <div v-else class="text-gray-500 text-center py-4">
    Chargement des recommandations...
  </div>
</template> 