<script setup lang="ts">
import { onMounted, watch, ref } from 'vue'
import { Chart, registerables } from 'chart.js'
import { AcousticCalculator } from '@/utils/calculations/acoustic'
import type { Config } from '@/types/configurateur'

Chart.register(...registerables)

const props = defineProps<{
  config: Config
  freqCoupure: string[]
}>()

const chartInstance = ref<Chart | null>(null)

const parseFrequency = (freqString: string): number => {
  return parseInt(freqString.replace(/[^\d]/g, ''))
}

const createChart = () => {
  if (chartInstance.value) {
    chartInstance.value.destroy()
  }

  const ctx = document.getElementById('frequencyResponse') as HTMLCanvasElement
  if (!ctx) return

  const freqCoupureValues = props.freqCoupure.map(parseFrequency)

  // Génération des fréquences avec une résolution adaptative
  const frequencies = []
  for (let f = 10; f <= 20000;) {
    frequencies.push(Math.round(f))
    if (f < 100) {
      f *= 1.05  // Plus de points dans les basses fréquences
    } else if (f < 1000) {
      f *= 1.02
    } else {
      f *= 1.01  // Plus de points dans les hautes fréquences
    }
  }

  try {
    // Création du calculateur acoustique avec tous les paramètres
    const calculator = new AcousticCalculator({
      impedance: props.config.impedance,
      puissanceAmp: props.config.puissanceAmp,
      nombreVoies: props.config.nombreVoies,
      amplitudeEcoute: props.config.amplitudeEcoute,
      styleMusical: props.config.styleMusical,
      typeEnceinte: props.config.typeEnceinte,
      utilisationPrincipale: props.config.utilisationPrincipale,
      typeCharge: props.config.typeCharge,
      penteFiltre: parseInt(props.config.penteFiltre),
      freqCoupure: freqCoupureValues,
      accordEvent: props.config.accordEvent,
      facteurQualite: props.config.facteurQualite
    })

    // Calcul des réponses pour chaque fréquence
    const responses = frequencies.map(f => calculator.calculateSystemResponse(f))

    // Préparation des labels selon le nombre de voies
    const voiceLabels = ['Woofer']
    if (props.config.nombreVoies >= 3) voiceLabels.push('Médium')
    if (props.config.nombreVoies === 4) voiceLabels.push('Médium-aigu')
    voiceLabels.push('Tweeter')

    // Couleurs pour chaque voie
    const colors = [
      'rgba(0, 0, 255, 0.7)',   // Bleu pour le woofer
      'rgba(0, 255, 0, 0.7)',   // Vert pour le médium
      'rgba(255, 165, 0, 0.7)', // Orange pour le médium-aigu
      'rgba(255, 0, 0, 0.7)'    // Rouge pour le tweeter
    ]

    // Création des datasets pour chaque voie
    const datasets = voiceLabels.map((label, index) => ({
      label,
      data: frequencies.map((_, i) => responses[i].individual[index]),
      borderColor: colors[index],
      borderDash: [5, 5],
      borderWidth: 2,
      pointRadius: 0,
      tension: 0.4,
      fill: false
    }))

    // Ajout de la réponse globale
    datasets.push({
      label: 'Réponse globale',
      data: frequencies.map((_, i) => responses[i].global),
      borderColor: 'rgba(0, 0, 0, 1)',
      borderWidth: 3,
      pointRadius: 0,
      tension: 0.4,
      fill: false
    })

    // Configuration du graphique
    chartInstance.value = new Chart(ctx, {
      type: 'line',
      data: { 
        labels: frequencies,
        datasets 
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 0 },
        scales: {
          x: {
            type: 'logarithmic',
            title: {
              display: true,
              text: 'Fréquence (Hz)',
              font: { size: 14 }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              callback: (value) => {
                if ([10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000].includes(Number(value))) {
                  return value.toString()
                }
                return ''
              },
              maxRotation: 0,
              autoSkip: false
            }
          },
          y: {
            title: {
              display: true,
              text: 'Niveau SPL (dB)',
              font: { size: 14 }
            },
            min: 70,
            max: 95,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: [
              `Simulation de la réponse en fréquence`,
              `${props.config.nombreVoies} voies - ${props.config.typeCharge} - ${props.config.typeEnceinte}`,
              `Style: ${props.config.styleMusical} - Utilisation: ${props.config.utilisationPrincipale}`
            ],
            font: {
              size: 14,
              weight: 'normal'
            },
            padding: 20
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (context) => {
                return `${context.dataset.label}: ${context.parsed.y.toFixed(1)} dB`
              }
            }
          },
          legend: {
            position: 'top',
            align: 'center',
            labels: {
              boxWidth: 30,
              usePointStyle: false,
              padding: 20
            }
          }
        }
      }
    })
  } catch (error) {
    console.error('Erreur lors de la création du graphique:', error)
  }
}

// Surveillance des changements avec deep watching
watch([() => props.config, () => props.freqCoupure], () => {
  createChart()
}, { deep: true })

onMounted(createChart)
</script>

<template>
  <div class="w-full" style="height: 500px;">
    <canvas id="frequencyResponse"></canvas>
  </div>
</template> 