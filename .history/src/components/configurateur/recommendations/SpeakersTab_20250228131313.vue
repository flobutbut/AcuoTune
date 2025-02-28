<script setup lang="ts">
// Données temporaires pour test
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
  <div class="space-y-6">
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
</template> 