<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import type { Config } from '@/types/configurateur'
import { calculateAcousticResponse } from '@/utils/calculations/acoustic'
import { calculateElectronicResponse } from '@/utils/calculations/electronic'
import { calculatePhysicalResponse } from '@/utils/calculations/physical'
import { getSpeakerConfig } from '@/utils/calculations/speakers'
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
  const acousticResponse = calculateAcousticResponse({
    freq,
    amplitudeEcoute: props.config.amplitudeEcoute,
    styleMusical: props.config.styleMusical,
    distanceMur: props.config.distanceMur,
    utilisationPrincipale: props.config.utilisationPrincipale
  })

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

// Création du graphique avec style amélioré
const createChart = () => {
  if (!chartCanvas.value) return
  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return

  const frequencies = generateFrequencyPoints()
  
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
    data: { datasets: [...speakerDatasets, globalDataset] },
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