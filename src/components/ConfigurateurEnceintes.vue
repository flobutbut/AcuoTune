<script setup lang="ts">
import ConfigurationPanel from './configurateur/ConfigurationPanel.vue'
import RecommendationsPanel from './configurateur/RecommendationsPanel.vue'
</script>

<template>
  <div class="flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden">
    <!-- Colonne de gauche - Paramètres -->
    <div class="w-full md:w-1/2 border-r border-gray-200">
      <ConfigurationPanel />
    </div>
    
    <!-- Colonne de droite - Recommandations -->
    <div class="w-full md:w-1/2 bg-gray-50">
      <RecommendationsPanel />
    </div>
  </div>
</template> 