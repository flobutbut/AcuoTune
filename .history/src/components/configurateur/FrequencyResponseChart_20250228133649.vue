<script setup lang="ts">
import { ref, onMounted, watch, computed, onUnmounted } from 'vue'
import type { Config } from '@/types/configurateur'
import { calculateAcoustic } from '@/utils/calculations/acoustic'
import { calculateElectronicResponse } from '@/utils/calculations/electronic'
import { calculatePhysicalResponse } from '@/utils/calculations/physical'
import { getSpeakerConfig } from '@/utils/calculations/speakers'
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

// Configuration dynamique des haut-parleurs selon le nombre de voies
const speakerConfigs = computed(() => {
  return getSpeakerConfig(props.config.nombreVoies)
})

// Génération des points de fréquence
const generateFrequencyPoints = () => {
  const points = []
  for (let i = 0; i <= 400; i++) {
    points.push(Math.pow(10, 1 + (i * 3.3) / 400))
  }
  return points
}

// Calcul de la réponse complète d'un haut-parleur
const calculateSpeakerResponse = (freq: number, speakerIndex: number): ComplexResponse => {
  // Réponse acoustique de base (style musical, distance au mur, etc.)
  const acousticResponse = calculateAcoustic(props.config)

  // Réponse électronique (impédance, puissance)
  const electronicResponse = calculateElectronicResponse({
    freq,
    impedance: props.config.impedance,
    puissance: props.config.puissance
  })

  // Réponse physique (type de charge, accord, facteur Q)
  const physicalResponse = calculatePhysicalResponse({
    freq,
    typeCharge: props.config.typeCharge,
    accordEvent: props.config.accordEvent,
    facteurQualite: props.config.facteurQualite,
    typeEnceinte: props.config.typeEnceinte
  })

  // Combinaison des réponses de base
  let response = {
    magnitude: acousticResponse.magnitude * 
               electronicResponse.magnitude * 
               physicalResponse.magnitude,
    phase: acousticResponse.phase + 
           electronicResponse.phase + 
           physicalResponse.phase
  }

  // Application des filtres selon le nombre de voies
  const crossoverFreqs = props.freqCoupure.map(f => parseInt(f))
  response = applyFilters(response, freq, speakerIndex, crossoverFreqs)

  return response
}

// Application des filtres selon la configuration
const applyFilters = (
  response: ComplexResponse, 
  freq: number, 
  speakerIndex: number, 
  crossoverFreqs: number[]
): ComplexResponse => {
  const slope = props.config.showAdvanced && props.config.penteFiltre 
    ? parseInt(props.config.penteFiltre) 
    : 12

  switch (props.config.nombreVoies) {
    case 4:
      return applyFourWayFilters(response, freq, speakerIndex, crossoverFreqs, slope)
    case 3:
      return applyThreeWayFilters(response, freq, speakerIndex, crossoverFreqs, slope)
    default:
      return applyTwoWayFilters(response, freq, speakerIndex, crossoverFreqs, slope)
  }
}

// Calcul de la réponse globale avec sommation complexe
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
  
  // Calcul des paramètres acoustiques
  const acousticParams = calculateAcoustic(props.config)
  
  // Génération des fréquences (échelle logarithmique)
  for (let i = 0; i <= 400; i++) {
    const f = Math.round(10 * Math.pow(10, i * 3 / 400))
    if (f <= 20000) {
      frequencies.push(f)
      // Utilisation des paramètres électroniques pour la réponse
      const response = calculateResponse(f, props.electronicParams, acousticParams)
      responses.push(response)
    }
  }

  return { frequencies, responses }
}

// Calcul de la réponse pour une fréquence donnée
function calculateResponse(frequency: number, electronicParams: any, acousticParams: any) {
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
  <div class="w-full h-96">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<style scoped>
canvas {
  background-color: white;
}
</style>