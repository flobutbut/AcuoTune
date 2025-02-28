<script setup lang="ts">
import { ref } from 'vue'
import ConfigurationPanel from '@/components/configurateur/ConfigurationPanel.vue'
import RecommendationsPanel from '@/components/configurateur/RecommendationsPanel.vue'
import { useConfigurateurStore } from '@/stores/configurateur'

// Initialisation du store
const store = useConfigurateurStore()

// État pour le mode d'affichage (peut être 'split' ou 'tabs')
const displayMode = ref<'split' | 'tabs'>('split')

// État pour l'onglet actif en mode tablettes/mobile
const activeTab = ref<'config' | 'results'>('config')

// Détermine si l'écran est en mode mobile
const isMobile = ref(window.innerWidth < 768)

// Gestion du redimensionnement de la fenêtre
window.addEventListener('resize', () => {
  isMobile.value = window.innerWidth < 768
  if (isMobile.value && displayMode.value === 'split') {
    displayMode.value = 'tabs'
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- En-tête -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
          <h1 class="text-3xl font-bold text-gray-900">
            Configurateur d'enceintes
          </h1>
          
          <!-- Toggle mode d'affichage (desktop uniquement) -->
          <button
            v-if="!isMobile"
            @click="displayMode = displayMode === 'split' ? 'tabs' : 'split'"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <template v-if="displayMode === 'split'">
              Mode onglets
            </template>
            <template v-else>
              Mode côte à côte
            </template>
          </button>
        </div>
      </div>
    </header>

    <!-- Contenu principal -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Mode côte à côte (desktop) -->
      <div v-if="displayMode === 'split' && !isMobile" class="flex gap-6">
        <div class="w-1/2 bg-white rounded-lg shadow">
          <ConfigurationPanel />
        </div>
        <div class="w-1/2 bg-white rounded-lg shadow">
          <RecommendationsPanel />
        </div>
      </div>

      <!-- Mode onglets (mobile ou choix utilisateur) -->
      <div v-else>
        <!-- Navigation des onglets -->
        <div class="sm:hidden">
          <div class="flex space-x-4 mb-6">
            <button
              v-for="tab in [
                { id: 'config', label: 'Configuration' },
                { id: 'results', label: 'Recommandations' }
              ]"
              :key="tab.id"
              @click="activeTab = tab.id as 'config' | 'results'"
              :class="[
                'flex-1 px-4 py-2 text-center text-sm font-medium rounded-md',
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-500 hover:text-gray-700'
              ]"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>

        <!-- Contenu des onglets -->
        <div class="bg-white rounded-lg shadow">
          <div v-show="activeTab === 'config' || !isMobile">
            <ConfigurationPanel />
          </div>
          <div v-show="activeTab === 'results' || !isMobile">
            <RecommendationsPanel />
          </div>
        </div>
      </div>

      <!-- Note d'information -->
      <div class="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-blue-700">
              Ce configurateur fournit des recommandations basées sur des calculs théoriques.
              Les résultats peuvent varier selon les conditions réelles d'utilisation.
            </p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.min-h-screen {
  min-height: 100vh;
}
</style> 