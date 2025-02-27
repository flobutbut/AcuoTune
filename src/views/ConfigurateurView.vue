<script setup lang="ts">
import ConfigurationPanel from '@/components/configurateur/ConfigurationPanel.vue'
import RecommendationsPanel from '@/components/configurateur/RecommendationsPanel.vue'
</script>

<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Colonne de gauche - Configuration -->
    <div class="w-[400px] min-w-[400px] overflow-y-auto border-r border-gray-200 bg-white">
      <div class="p-6">
        <h1 class="text-2xl font-bold text-gray-900">Configurateur d'Enceintes</h1>
      </div>
      <ConfigurationPanel />
    </div>

    <!-- Colonne de droite - Recommandations -->
    <div class="flex-1 overflow-y-auto">
      <RecommendationsPanel />
    </div>
  </div>
</template>

<style>
/* Supprimer les marges par défaut */
body {
  margin: 0;
  padding: 0;
}

/* Assurer que l'app prend toute la hauteur */
#app {
  height: 100vh;
}
</style> 