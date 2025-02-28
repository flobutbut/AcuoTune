<script setup lang="ts">
import { onMounted, watch, ref, onUnmounted } from 'vue'
import Chart from 'chart.js/auto'
import { calculateVoiceResponse, calculateGlobalResponse } from '@/utils/calculations/frequency-response'
import type { Config } from '@/types/configurateur'

const props = defineProps<{
  config: Config
  electronicParams: any
}>()

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let frequencyChart: Chart | null = null

// Génération des points pour le graphe
function generateChartData() {
  const frequencies = []
  const voieDatasets = []
  const globalResponse = []
  
  const nombreVoies = parseInt(props.config.nombreVoies)
  
  // Initialisation des tableaux pour chaque voie
  const voieResponses = Array.from({ length: nombreVoies }, () => [])
  
  // Génération des fréquences (échelle logarithmique)
  for (let i = 0; i <= 400; i++) {
    const f = Math.round(10 * Math.pow(10, i * 3 / 400))
    if (f <= 20000) {
      frequencies.push(f)
      
      // Calcul des réponses pour chaque voie
      const currentVoiceResponses = []
      for (let v = 0; v < nombreVoies; v++) {
        const response = calculateVoiceResponse(f, v, props.config, props.electronicParams)
        voieResponses[v].push(response)
        currentVoiceResponses.push(response)
      }
      
      // Calcul de la réponse globale pour cette fréquence
      globalResponse.push(calculateGlobalResponse(f, currentVoiceResponses))
    }
  }
  
  // Création des datasets pour chaque voie
  const voieColors = ['#2563eb', '#16a34a', '#dc2626', '#9333ea']
  for (let v = 0; v < nombreVoies; v++) {
    voieDatasets.push({
      label: `Voie ${v + 1}`,
      data: frequencies.map((f, i) => ({
        x: f,
        y: voieResponses[v][i]
      })),
      borderColor: voieColors[v],
      backgroundColor: `${voieColors[v]}20`,
      borderWidth: 1,
      borderDash: [5, 5],
      fill: false,
      tension: 0.4,
      pointRadius: 0
    })
  }
  
  // Dataset pour la réponse globale
  const globalDataset = {
    label: 'Réponse globale',
    data: frequencies.map((f, i) => ({
      x: f,
      y: globalResponse[i]
    })),
    borderColor: '#000000',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderWidth: 2,
    fill: false,
    tension: 0.4,
    pointRadius: 0,
    order: -1
  }

  return {
    frequencies,
    voieDatasets,
    globalDataset
  }
}

function createChart() {
  if (!chartCanvas.value) return
  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return

  const { voieDatasets, globalDataset } = generateChartData()

  frequencyChart = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [...voieDatasets, globalDataset]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'logarithmic',
          min: 20,
          max: 20000,
          title: {
            display: true,
            text: 'Fréquence (Hz)'
          }
        },
        y: {
          min: -40,
          max: 10,
          title: {
            display: true,
            text: 'Amplitude (dB)'
          }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function(context: any) {
              return `${context.dataset.label}: ${context.parsed.y.toFixed(1)} dB @ ${context.parsed.x} Hz`
            }
          }
        }
      }
    }
  })
}

// Gestion du cycle de vie du composant
onMounted(() => {
  createChart()
})

watch([() => props.config, () => props.electronicParams], () => {
  if (frequencyChart) {
    frequencyChart.destroy()
  }
  createChart()
}, { deep: true })

onUnmounted(() => {
  if (frequencyChart) {
    frequencyChart.destroy()
  }
})
</script>

<template>
  <canvas ref="chartCanvas"></canvas>
</template>

<style scoped>
canvas {
  background-color: white;
}
</style>