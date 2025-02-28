<script setup lang="ts">
// Données temporaires pour test
const electronicRecommendations = {
  impedance: '8Ω',
  power: '100W RMS',
  crossoverFreqs: ['500Hz', '3.5kHz'],
  filterSlope: '12dB/octave',
  efficiency: '89dB'
}
</script>

<template>
  <div class="space-y-6">
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
</template> 