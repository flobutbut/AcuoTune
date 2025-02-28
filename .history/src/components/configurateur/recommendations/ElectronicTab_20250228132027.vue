<script setup lang="ts">
import { computed } from 'vue'
import { useConfigStore } from '@/stores/configurateur'
import { calculateElectronic } from '@/utils/calculations/electronic'
import { calculateAcoustic } from '@/utils/calculations/acoustic'

const store = useConfigStore()

const electronicRecommendations = computed(() => {
  if (!store.config) return null

  // Calcul des paramètres acoustiques nécessaires
  const acousticParams = calculateAcoustic(store.config)
  
  // Calcul des paramètres électroniques
  return calculateElectronic(store.config, acousticParams)
})
</script>

<template>
  <div class="space-y-6">
    <div v-if="electronicRecommendations" class="grid grid-cols-2 gap-6">
      <div class="space-y-4">
        <div>
          <div class="text-gray-600">Impédance globale</div>
          <div class="font-medium">{{ electronicRecommendations.impedanceGlobale }}</div>
        </div>
        <div>
          <div class="text-gray-600">Puissance admissible</div>
          <div class="font-medium">{{ electronicRecommendations.puissanceAdmissible }}</div>
        </div>
        <div>
          <div class="text-gray-600">Fréquences de coupure</div>
          <div class="font-medium">{{ electronicRecommendations.frequencesCoupure.join(' / ') }}</div>
        </div>
        <div>
          <div class="text-gray-600">Pente du filtre</div>
          <div class="font-medium">{{ electronicRecommendations.penteFiltre }}</div>
        </div>
        <div>
          <div class="text-gray-600">Sensibilité</div>
          <div class="font-medium">{{ electronicRecommendations.sensibilite }}</div>
        </div>
      </div>
      
      <div class="bg-gray-50 rounded-lg p-4">
        <!-- Emplacement pour le graphe de réponse en fréquence -->
        <div class="text-center text-gray-500">Graphe de réponse en fréquence</div>
      </div>
    </div>

    <div v-else class="text-gray-500 text-center py-4">
      Chargement des recommandations...
    </div>
  </div>
</template> 