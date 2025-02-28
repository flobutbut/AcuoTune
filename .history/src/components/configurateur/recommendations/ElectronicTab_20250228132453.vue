<script setup lang="ts">
import { computed, onMounted, ref, watch, onUnmounted } from 'vue'
import { useConfigurateurStore } from '@/stores/configurateur'
import { calculateElectronic } from '@/utils/calculations/electronic'
import { calculateAcoustic, AcousticCalculator } from '@/utils/calculations/acoustic'
import Chart from 'chart.js/auto'

const store = useConfigurateurStore()
const chartCanvas = ref<HTMLCanvasElement | null>(null)
let frequencyChart: Chart | null = null

const electronicRecommendations = computed(() => {
  if (!store.config) return null

  // Calcul des paramètres acoustiques nécessaires
  const acousticParams = calculateAcoustic(store.config)
  
  // Calcul des paramètres électroniques
  return calculateElectronic(store.config, acousticParams)
})

// Génération des points pour le graphe
function generateChartData() {
  if (!store.config) return null

  const calculator = new AcousticCalculator(store.config)
  const frequencies = []
  const responses = []
  const individualResponses: number[][] = []

  // Génération des fréquences (échelle logarithmique)
  for (let i = 0; i <= 400; i++) {
    const f = Math.round(10 * Math.pow(10, i * 3 / 400))
    if (f <= 20000) {
      frequencies.push(f)
      const result = calculator.calculateSystemResponse(f)
      responses.push(result.global)
      
      // Stockage des réponses individuelles
      result.individual.forEach((resp, index) => {
        if (!individualResponses[index]) individualResponses[index] = []
        individualResponses[index].push(resp)
      })
    }
  }

  return {
    frequencies,
    responses,
    individualResponses
  }
}

// Création du graphe
function createChart() {
  if (!chartCanvas.value) return

  const data = generateChartData()
  if (!data) return

  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return

  // Couleurs pour les différentes voies
  const voiceColors = ['#2563eb', '#16a34a', '#dc2626', '#9333ea']

  // Datasets pour chaque voie
  const datasets = data.individualResponses.map((responses, index) => ({
    label: `Voie ${index + 1}`,
    data: responses,
    borderColor: voiceColors[index],
    backgroundColor: voiceColors[index],
    borderWidth: 1,
    pointRadius: 0
  }))

  // Dataset pour la réponse globale
  datasets.push({
    label: 'Réponse globale',
    data: data.responses,
    borderColor: '#000000',
    backgroundColor: '#000000',
    borderWidth: 2,
    pointRadius: 0
  })

  frequencyChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.frequencies,
      datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'logarithmic',
          title: {
            display: true,
            text: 'Fréquence (Hz)'
          },
          min: 20,
          max: 20000
        },
        y: {
          title: {
            display: true,
            text: 'Amplitude (dB)'
          },
          min: 70,
          max: 95
        }
      },
      plugins: {
        legend: {
          position: 'top'
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      }
    }
  })
}

// Gestion du cycle de vie du composant
onMounted(() => {
  createChart()
})

// Mise à jour du graphe quand la configuration change
watch(() => store.config, () => {
  if (frequencyChart) {
    frequencyChart.destroy()
  }
  createChart()
}, { deep: true })

// Nettoyage lors de la destruction du composant
onUnmounted(() => {
  if (frequencyChart) {
    frequencyChart.destroy()
  }
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
      
      <div class="bg-white rounded-lg p-4 border border-gray-200">
        <h3 class="font-medium mb-4">Réponse en fréquence</h3>
        <div class="h-64">
          <canvas ref="chartCanvas"></canvas>
        </div>
      </div>
    </div>

    <div v-else class="text-gray-500 text-center py-4">
      Chargement des recommandations...
    </div>
  </div>
</template> 