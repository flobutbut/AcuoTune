<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import type { Config } from '@/types/configurateur'
import Chart from 'chart.js/auto'

const props = defineProps<{
  config: Config
  freqCoupure: string[]
  electronicParams: any
}>()

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let frequencyChart: Chart | null = null

interface ComplexResponse {
  magnitude: number
  phase: number
}

interface SpeakerConfig {
  name: string
  color: string
  borderDash: number[]
  borderWidth: number
}

// Configuration dynamique des haut-parleurs selon le nombre de voies
const speakerConfigs = computed((): SpeakerConfig[] => {
  const baseConfigs = {
    subwoofer: { name: 'Subwoofer', color: '#000099', borderDash: [], borderWidth: 2 },
    woofer: { name: 'Woofer', color: '#0000FF', borderDash: [5, 5], borderWidth: 2 },
    midrange: { name: 'Médium', color: '#00CC00', borderDash: [10, 5], borderWidth: 2 },
    tweeter: { name: 'Tweeter', color: '#FF9900', borderDash: [5, 10], borderWidth: 2 },
    superTweeter: { name: 'Super-Tweeter', color: '#FF0000', borderDash: [2, 2], borderWidth: 2 }
  }

  switch (props.config.nombreVoies) {
    case 2:
      return [baseConfigs.woofer, baseConfigs.tweeter]
    case 3:
      return [baseConfigs.woofer, baseConfigs.midrange, baseConfigs.tweeter]
    case 4:
      return [baseConfigs.subwoofer, baseConfigs.woofer, baseConfigs.midrange, baseConfigs.tweeter]
    default:
      return [baseConfigs.woofer, baseConfigs.tweeter]
  }
})

// Fréquences de coupure normalisées
const crossoverFrequencies = computed(() => {
  return props.freqCoupure.map(f => parseInt(f))
})

// Génération des points de fréquence avec plus de précision
const generateFrequencyPoints = () => {
  const points = []
  for (let i = 0; i <= 600; i++) { // Augmentation de la résolution
    points.push(Math.pow(10, 1 + (i * 3.3) / 600))
  }
  return points
}

// Réponse naturelle améliorée avec paramètres ajustables
const getNaturalResponse = (freq: number, type: string): ComplexResponse => {
  const sensitivity = parseFloat(props.config.sensibilite || '88.3')
  let magnitude = Math.pow(10, sensitivity / 20)
  let phase = 0

  const speakerParams = {
    subwoofer: { f0: 20, fMax: 1000 },
    woofer: { f0: 35, fMax: 2000 },
    midrange: { f0: 200, fMax: 5000 },
    tweeter: { f0: 1500, fMax: 20000 },
    superTweeter: { f0: 3000, fMax: 40000 }
  }

  const params = speakerParams[type as keyof typeof speakerParams]
  if (params) {
    // Réponse en cloche avec Q ajustable
    const Q = props.config.facteurQualite || 0.707
    magnitude *= 1 / Math.sqrt(1 + Math.pow(params.f0 / freq, 4))
    magnitude *= 1 / Math.sqrt(1 + Math.pow(freq / params.fMax, 4))
    phase -= Math.atan2(params.f0 / freq / Q, 1)
  }

  return { magnitude, phase }
}

// Filtre amélioré avec pente paramétrable
const applyFilter = (freq: number, fc: number, type: 'lowpass' | 'highpass'): ComplexResponse => {
  const slope = props.config.penteFiltre ? parseInt(props.config.penteFiltre) : 12
  const order = slope / 6 // 6dB par ordre
  const ratio = type === 'lowpass' ? freq / fc : fc / freq
  const magnitude = 1 / Math.pow(1 + Math.pow(ratio, 2), order/2)
  const phase = -order * Math.atan2(ratio, 1)
  return { magnitude, phase }
}

// Calcul des réponses individuelles avec gestion adaptative des voies
const calculateSpeakerResponse = (freq: number, speakerIndex: number): ComplexResponse => {
  const freqs = crossoverFrequencies.value
  const type = speakerConfigs.value[speakerIndex].name.toLowerCase()
  const natural = getNaturalResponse(freq, type)

  let response = { ...natural }

  if (props.config.nombreVoies === 4) {
    switch (speakerIndex) {
      case 0: // Subwoofer
        response = applyComplexMultiply(response, applyFilter(freq, freqs[0], 'lowpass'))
        break
      case 1: // Woofer
        response = applyComplexMultiply(response, applyFilter(freq, freqs[0], 'highpass'))
        response = applyComplexMultiply(response, applyFilter(freq, freqs[1], 'lowpass'))
        break
      case 2: // Médium
        response = applyComplexMultiply(response, applyFilter(freq, freqs[1], 'highpass'))
        response = applyComplexMultiply(response, applyFilter(freq, freqs[2], 'lowpass'))
        break
      case 3: // Tweeter
        response = applyComplexMultiply(response, applyFilter(freq, freqs[2], 'highpass'))
        break
    }
  } else if (props.config.nombreVoies === 3) {
    switch (speakerIndex) {
      case 0: // Woofer
        response = applyComplexMultiply(response, applyFilter(freq, freqs[0], 'lowpass'))
        break
      case 1: // Médium
        response = applyComplexMultiply(response, applyFilter(freq, freqs[0], 'highpass'))
        response = applyComplexMultiply(response, applyFilter(freq, freqs[1], 'lowpass'))
        break
      case 2: // Tweeter
        response = applyComplexMultiply(response, applyFilter(freq, freqs[1], 'highpass'))
        break
    }
  }

  return response
}

// Multiplication complexe pour combiner les réponses
const applyComplexMultiply = (a: ComplexResponse, b: ComplexResponse): ComplexResponse => {
  return {
    magnitude: a.magnitude * b.magnitude,
    phase: a.phase + b.phase
  }
}

// Sommation complexe améliorée
const calculateGlobalResponse = (freq: number): number => {
  const responses = speakerConfigs.value.map((_, index) => 
    calculateSpeakerResponse(freq, index)
  )

  const sumReal = responses.reduce((sum, r) => 
    sum + r.magnitude * Math.cos(r.phase), 0)
  const sumImag = responses.reduce((sum, r) => 
    sum + r.magnitude * Math.sin(r.phase), 0)

  const magnitude = Math.sqrt(sumReal * sumReal + sumImag * sumImag)
  return 20 * Math.log10(magnitude)
}

// Génération des points pour le graphe
function generateChartData() {
  const frequencies = []
  const responses = []
  
  // Génération des fréquences (échelle logarithmique)
  for (let i = 0; i <= 400; i++) {
    const f = Math.round(10 * Math.pow(10, i * 3 / 400))
    if (f <= 20000) {
      frequencies.push(f)
      responses.push(calculateResponse(f))
    }
  }

  return { frequencies, responses }
}

// Calcul de la réponse pour une fréquence donnée
function calculateResponse(frequency: number) {
  // Simulation d'une réponse en fréquence basique
  // À remplacer par vos calculs réels
  const f0 = 50 // Fréquence de coupure basse
  const f1 = 20000 // Fréquence de coupure haute
  
  let response = 0
  if (frequency < f0) {
    response = 20 * Math.log10(frequency / f0)
  } else if (frequency > f1) {
    response = -20 * Math.log10(frequency / f1)
  } else {
    response = 0
  }
  
  return Math.max(-40, Math.min(response, 0))
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
        data: data.responses,
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
watch([() => props.config, () => props.freqCoupure, () => props.electronicParams], () => {
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
  <div class="w-full h-96">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<style scoped>
canvas {
  background-color: white;
}
</style> 
</style> 