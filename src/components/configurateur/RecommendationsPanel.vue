<script setup lang="ts">
import { ref } from 'vue'
import { useConfigurateurStore } from '@/stores/configurateur'
import { storeToRefs } from 'pinia'
import FrequencyResponseChart from './FrequencyResponseChart.vue'

const store = useConfigurateurStore()
const { recommandations, config } = storeToRefs(store)

const activeTab = ref('physique')
</script>

<template>
  <div class="p-6 space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-gray-900">Recommandations</h2>
      <p class="mt-1 text-sm text-gray-500">
        Spécifications techniques recommandées pour votre enceinte
      </p>
    </div>

    <!-- Onglets -->
    <div class="border-b border-gray-200">
      <nav class="-mb-px flex space-x-8" aria-label="Tabs">
        <button
          v-for="tab in [
            { id: 'physique', name: 'Caractéristiques physiques' },
            { id: 'electronique', name: 'Configuration électronique' },
            { id: 'hautparleurs', name: 'Haut-parleurs recommandés' },
            { id: 'simulation', name: 'Simulation' }
          ]"
          :key="tab.id"
          :class="[
            activeTab === tab.id
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
            'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium'
          ]"
          @click="activeTab = tab.id"
        >
          {{ tab.name }}
        </button>
      </nav>
    </div>

    <!-- Contenu des onglets -->
    <div class="mt-6">
      <!-- Caractéristiques physiques -->
      <div v-if="activeTab === 'physique'" class="bg-white shadow rounded-lg p-6">
        <dl class="space-y-3">
          <div>
            <dt class="text-sm font-medium text-gray-500">Volume optimal</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ recommandations.volume }} litres</dd>
          </div>

          <div>
            <dt class="text-sm font-medium text-gray-500">Dimensions suggérées</dt>
            <dd class="mt-1 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <span class="text-gray-500">Hauteur:</span>
                <span class="ml-2 text-gray-900">{{ recommandations.dimensions.hauteur }} cm</span>
              </div>
              <div>
                <span class="text-gray-500">Largeur:</span>
                <span class="ml-2 text-gray-900">{{ recommandations.dimensions.largeur }} cm</span>
              </div>
              <div>
                <span class="text-gray-500">Profondeur:</span>
                <span class="ml-2 text-gray-900">{{ recommandations.dimensions.profondeur }} cm</span>
              </div>
            </dd>
          </div>

          <div>
            <dt class="text-sm font-medium text-gray-500">Matériaux recommandés</dt>
            <dd class="mt-1 text-sm text-gray-900">
              <ul class="list-disc pl-5">
                <li v-for="materiau in recommandations.materiaux" :key="materiau">
                  {{ materiau }}
                </li>
              </ul>
            </dd>
          </div>

          <div>
            <dt class="text-sm font-medium text-gray-500">Type de charge</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ recommandations.typeCharge }}</dd>
          </div>

          <div v-if="recommandations.ventilation">
            <dt class="text-sm font-medium text-gray-500">Caractéristiques de l'event</dt>
            <dd class="mt-1 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <span class="text-gray-500">Surface:</span>
                <span class="ml-2 text-gray-900">{{ recommandations.surfaceEvent }} cm²</span>
              </div>
              <div>
                <span class="text-gray-500">Longueur:</span>
                <span class="ml-2 text-gray-900">{{ recommandations.longueurEvent }} cm</span>
              </div>
              <div>
                <span class="text-gray-500">Diamètre:</span>
                <span class="ml-2 text-gray-900">{{ recommandations.diametreEvent }} cm</span>
              </div>
              <div>
                <span class="text-gray-500">Fréq. accord:</span>
                <span class="ml-2 text-gray-900">{{ recommandations.freqAccord }} Hz</span>
              </div>
            </dd>
          </div>
        </dl>
      </div>

      <!-- Configuration électronique -->
      <div v-if="activeTab === 'electronique'" class="bg-white shadow rounded-lg p-6">
        <dl class="space-y-3">
          <div>
            <dt class="text-sm font-medium text-gray-500">Impédance globale</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ recommandations.impedanceGlobale }}</dd>
          </div>

          <div>
            <dt class="text-sm font-medium text-gray-500">Puissance admissible</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ recommandations.puissanceAdmissible }}</dd>
          </div>

          <div>
            <dt class="text-sm font-medium text-gray-500">Fréquences de coupure</dt>
            <dd class="mt-1 text-sm text-gray-900">
              <ul class="list-disc pl-5">
                <li v-for="freq in recommandations.freqCoupure" :key="freq">
                  {{ freq }}
                </li>
              </ul>
            </dd>
          </div>

          <div>
            <dt class="text-sm font-medium text-gray-500">Pente du filtre</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ recommandations.penteFiltre }}</dd>
          </div>

          <div>
            <dt class="text-sm font-medium text-gray-500">Efficacité</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ recommandations.efficacite }}</dd>
          </div>
        </dl>
      </div>

      <!-- Haut-parleurs recommandés -->
      <div v-if="activeTab === 'hautparleurs'" class="bg-white shadow rounded-lg p-6">
        <div v-for="(hp, index) in recommandations.hautParleurs" :key="index" class="mb-6 last:mb-0">
          <h4 class="text-sm font-medium text-gray-900 mb-2">
            Haut-parleur {{ index + 1 }}
          </h4>
          <dl class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt class="text-gray-500">Type</dt>
              <dd class="mt-1 text-gray-900">{{ hp.type }}</dd>
            </div>
            <div>
              <dt class="text-gray-500">Impédance</dt>
              <dd class="mt-1 text-gray-900">{{ hp.impedance }}</dd>
            </div>
            <div>
              <dt class="text-gray-500">Puissance</dt>
              <dd class="mt-1 text-gray-900">{{ hp.puissance }}</dd>
            </div>
            <div>
              <dt class="text-gray-500">Sensibilité</dt>
              <dd class="mt-1 text-gray-900">{{ hp.sensibilite }}</dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Simulation -->
      <div v-if="activeTab === 'simulation'" class="bg-white shadow rounded-lg p-6">
        <FrequencyResponseChart 
          :config="config"
          :freq-coupure="recommandations.freqCoupure"
        />
        <p class="mt-4 text-sm text-gray-500">
          Cette simulation montre la réponse en fréquence théorique de votre configuration.
          La ligne noire représente la réponse globale, tandis que les lignes pointillées
          montrent la contribution de chaque haut-parleur.
        </p>
      </div>
    </div>

    <p class="text-sm text-blue-600 bg-blue-50 p-4 rounded-md">
      Ces recommandations sont fournies à titre indicatif. Pour des résultats optimaux,
      consultez un spécialiste en acoustique.
    </p>
  </div>
</template> 