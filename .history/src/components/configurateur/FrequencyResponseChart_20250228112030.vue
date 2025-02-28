<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import type { Config } from '@/types/configurateur'
import Chart from 'chart.js/auto'

const props = defineProps<{
  config: Config
  freqCoupure: string[]
}>()

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

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

// Création du graphique avec style amélioré
const createChart = () => {
  if (!chartCanvas.value) return
  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return

  const frequencies = generateFrequencyPoints()
  
  // Datasets pour chaque haut-parleur
  const speakerDatasets = speakerConfigs.value.map((config, index) => ({
    label: config.name,
    data: frequencies.map(f => ({
      x: f,
      y: 20 * Math.log10(calculateSpeakerResponse(f, index).magnitude)
    })),
    borderColor: config.color,
    borderDash: config.borderDash,
    borderWidth: config.borderWidth,
    tension: 0.4
  }))

  // Dataset pour la réponse globale
  const globalDataset = {
    label: 'Réponse globale',
    data: frequencies.map(f => ({
      x: f,
      y: calculateGlobalResponse(f)
    })),
    borderColor: '#000000',
    borderWidth: 2,
    tension: 0.4
  }

  chart?.destroy()
  chart = new Chart(ctx, {
    type: 'line',
    data: { 
      datasets: [...speakerDatasets, globalDataset]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      elements: { point: { radius: 0 } },
      scales: {
        x: {
          type: 'logarithmic',
          min: 10,
          max: 20000,
          title: { 
            display: true, 
            text: 'Fréquence (Hz)',
            font: { weight: 'bold' }
          },
          ticks: {
            callback: (value: number) => {
              const values = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000]
              return values.includes(value) ? value : ''
            }
          }
        },
        y: {
          min: 70,
          max: 95,
          title: { 
            display: true, 
            text: 'Niveau SPL (dB)',
            font: { weight: 'bold' }
          }
        }
      },
      plugins: {
        legend: {
          position: 'top',
          align: 'center',
          labels: {
            boxWidth: 30,
            padding: 15,
            font: { size: 12 }
          }
        }
      }
    }
  })
}

onMounted(() => createChart())
watch([() => props.config, () => props.freqCoupure], () => createChart(), { deep: true })
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