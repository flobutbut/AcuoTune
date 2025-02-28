<script setup lang="ts">
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
</script>

<template>
  <div class="space-y-6">
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
</template> 