<script setup lang="ts">
import { ref } from 'vue'

const activeTab = ref('hautparleurs')

// Structure des données pour les haut-parleurs
const speakers = [
  {
    id: 1,
    type: 'Woofer',
    power: '100W RMS',
    impedance: '8 Ω',
    sensitivity: '89 dB'
  },
  {
    id: 2,
    type: 'Tweeter',
    power: '50W RMS',
    impedance: '8 Ω',
    sensitivity: '91 dB'
  },
  {
    id: 3,
    type: 'Médium',
    power: '80W RMS',
    impedance: '8 Ω',
    sensitivity: '90 dB'
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
      <div v-for="(speaker, index) in speakers" :key="speaker.id" class="bg-white">
        <h3 class="font-medium mb-4">Haut-parleur {{ index + 1 }}</h3>
        <div class="grid grid-cols-2 gap-y-4">
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