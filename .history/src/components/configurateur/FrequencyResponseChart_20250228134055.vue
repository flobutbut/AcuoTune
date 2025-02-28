<script setup lang="ts">
import { onMounted, watch, ref, onUnmounted } from 'vue'
import Chart from 'chart.js/auto'
import { calculateAcoustic } from '@/utils/calculations/acoustic'
import { calculateElectronic } from '@/utils/calculations/electronic'
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
  const voieResponses = []
  
  // Calcul des paramètres acoustiques
  const acousticParams = calculateAcoustic(props.config)
  const nombreVoies = parseInt(props.config.nombreVoies)
  const freqCoupures = props.electronicParams.frequencesCoupure.map((f: string) => parseInt(f))
  
  // Génération des fréquences (échelle logarithmique)
  for (let i = 0; i <= 400; i++) {
    const f = Math.round(10 * Math.pow(10, i * 3 / 400))
    if (f <= 20000) {
      frequencies.push(f)
      
      // Réponses individuelles des voies
      const voieReponses = []
      for (let v = 0; v < nombreVoies; v++) {
        const f0 = v === 0 ? 20 : freqCoupures[v - 1]
        const f1 = v === nombreVoies - 1 ? 20000 : freqCoupures[v]
        let reponse = 0

        // Calcul de la réponse de la voie avec pente du filtre
        if (f < f0) {
          reponse = -props.electronicParams.penteFiltre * Math.log2(f0/f)
        } else if (f > f1) {
          reponse = -props.electronicParams.penteFiltre * Math.log2(f/f1)
        } else {
          reponse = 0
        }

        voieReponses.push(reponse)
      }
      voieResponses.push(voieReponses)

      // Réponse globale (somme des réponses individuelles)
      const globalResponse = voieReponses[voieReponses.length - 1].reduce((sum: number, resp: number) => {
        return sum + Math.pow(10, resp/20)
      }, 0)
      responses.push(20 * Math.log10(globalResponse))
    }
  }

  return {
    frequencies,
    responses,
    voieResponses
  }
}

// Création du graphe
function createChart() {
  if (!chartCanvas.value) return

  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return

  const data = generateChartData()
  const nombreVoies = parseInt(props.config.nombreVoies)
  
  // Couleurs pour chaque voie
  const voieColors = ['#2563eb', '#16a34a', '#dc2626', '#9333ea']

  // Datasets pour chaque voie individuelle
  const voieDatasets = Array.from({ length: nombreVoies }, (_, i) => ({
    label: `Voie ${i + 1}`,
    data: data.frequencies.map((f, idx) => ({
      x: f,
      y: data.voieResponses[idx][i]
    })),
    borderColor: voieColors[i],
    backgroundColor: `${voieColors[i]}20`,
    borderWidth: 1,
    borderDash: [5, 5],
    fill: false,
    tension: 0.4,
    pointRadius: 0
  }))

  // Dataset pour la réponse globale
  const globalDataset = {
    label: 'Réponse globale',
    data: data.frequencies.map((f, i) => ({
      x: f,
      y: data.responses[i]
    })),
    borderColor: '#000000',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderWidth: 2,
    fill: false,
    tension: 0.4,
    pointRadius: 0
  }

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