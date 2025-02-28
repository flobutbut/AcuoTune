<script setup lang="ts">
import { onMounted, watch, ref, onUnmounted } from 'vue'
import Chart from 'chart.js/auto'
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
  const responses = []
  
  // Génération des fréquences (échelle logarithmique)
  for (let i = 0; i <= 400; i++) {
    const f = Math.round(10 * Math.pow(10, i * 3 / 400))
    if (f <= 20000) {
      frequencies.push(f)
      // Utilisation des paramètres électroniques pour la réponse
      const response = calculateResponse(f, props.electronicParams)
      responses.push(response)
    }
  }

  return { frequencies, responses }
}

// Calcul de la réponse pour une fréquence donnée
function calculateResponse(frequency: number, electronicParams: any) {
  // Fréquences de coupure depuis les paramètres électroniques
  const freqCoupures = electronicParams.frequencesCoupure.map((f: string) => parseInt(f))
  const nombreVoies = parseInt(props.config.nombreVoies)
  
  // Calcul de la réponse globale
  let response = 0
  
  // Contribution du grave
  if (frequency < freqCoupures[0]) {
    response = 0
  } else {
    response = -12 * Math.log2(frequency / freqCoupures[0])
  }
  
  // Contribution des autres voies
  for (let i = 1; i < nombreVoies; i++) {
    const f0 = freqCoupures[i - 1]
    const f1 = i < freqCoupures.length ? freqCoupures[i] : 20000
    
    if (frequency >= f0 && frequency <= f1) {
      response = Math.max(response, 0)
    }
  }
  
  // Ajout de la pente du filtre
  const penteFiltre = electronicParams.penteFiltre
  response = Math.max(-40, Math.min(response * (penteFiltre / 12), 3))
  
  return response
}

// Création du graphe
function createChart() {
  if (!chartCanvas.value) return

  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return

  const data = generateChartData()

  frequencyChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.frequencies,
      datasets: [{
        label: 'Réponse en fréquence',
        data: data.responses.map((r, i) => ({
          x: data.frequencies[i],
          y: r
        })),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0
      }]
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
          display: false
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function(context: any) {
              return `${context.parsed.y.toFixed(1)} dB @ ${context.parsed.x} Hz`
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

// Mise à jour du graphe quand les props changent
watch([() => props.config, () => props.electronicParams], () => {
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
  <canvas ref="chartCanvas"></canvas>
</template>

<style scoped>
canvas {
  background-color: white;
}
</style>