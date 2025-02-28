<script setup lang="ts">
import { ref } from 'vue'
import PhysicalTab from './recommendations/PhysicalTab.vue'
import ElectronicTab from './recommendations/ElectronicTab.vue'
import SpeakersTab from './recommendations/SpeakersTab.vue'

const activeTab = ref('physique')

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

    <!-- Contenu des onglets -->
    <PhysicalTab v-if="activeTab === 'physique'" />
    <ElectronicTab v-if="activeTab === 'electronique'" />
    <SpeakersTab v-if="activeTab === 'hautparleurs'" />
  </div>
</template>