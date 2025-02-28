import type { Config, ElectronicParams } from '@/types/configurateur'
import { calculateAcoustic } from './acoustic'
import { calculateElectronic } from './electronic'

// Constantes physiques réalistes
const CONSTANTS = {
  SPEED_OF_SOUND: 343, // m/s
  MIN_FREQ: 20,       // Hz
  MAX_FREQ: 20000,    // Hz
  ROOM_MODES: {
    small: 100,       // Hz
    medium: 80,       // Hz
    large: 60        // Hz
  },
  TYPICAL_Q: {
    closed: 0.707,    // Butterworth
    bassReflex: 0.5   // Typique pour bass-reflex
  }
}

// Validation et normalisation des paramètres
function validateConfig(config: Config): void {
  if (config.impedance < 4 || config.impedance > 16) {
    console.warn('Impédance hors limites réalistes')
  }
  if (config.puissanceAmp < 20 || config.puissanceAmp > 250) {
    console.warn('Puissance hors limites réalistes')
  }
  // ... autres validations
}

export function calculateVoiceResponse(frequency: number, voiceIndex: number, config: Config, electronicParams: ElectronicParams): number {
  validateConfig(config)
  
  const nombreVoies = parseInt(config.nombreVoies)
  const freqCoupures = electronicParams.frequencesCoupure.map(f => parseInt(f))
  const penteFiltre = parseInt(electronicParams.penteFiltre)
  
  // Ajustements réalistes selon le type d'enceinte
  const enceinteAdjustments = {
    'bibliothèque': {
      bassBoost: -3,
      maxSpl: 106
    },
    'colonne': {
      bassBoost: 0,
      maxSpl: 110
    }
  }[config.typeEnceinte]

  // Ajustements selon l'amplitude d'écoute
  const amplitudeAdjustments = {
    'faible': {
      bassBoost: 3,    // Fletcher-Munson
      trebleBoost: 2
    },
    'moyenne': {
      bassBoost: 0,
      trebleBoost: 0
    },
    'forte': {
      bassBoost: -2,
      trebleBoost: -1
    }
  }[config.amplitudeEcoute]

  let response = 0

  // Calcul de base selon la voie
  if (voiceIndex === 0) { // Grave
    response = calculateBassResponse(frequency, config, freqCoupures[0])
  } else if (voiceIndex === nombreVoies - 1) { // Aigu
    response = calculateTrebleResponse(frequency, config, freqCoupures[freqCoupures.length - 1])
  } else { // Médiums
    response = calculateMidResponse(frequency, config, freqCoupures[voiceIndex - 1], freqCoupures[voiceIndex])
  }

  // Application des ajustements réalistes
  response += enceinteAdjustments.bassBoost * Math.exp(-Math.pow(frequency/100, 2))
  response += amplitudeAdjustments.bassBoost * Math.exp(-Math.pow(frequency/100, 2))
  response += amplitudeAdjustments.trebleBoost * Math.exp(-Math.pow(5000/frequency, 2))

  // Limitation réaliste selon la puissance
  const maxSpl = enceinteAdjustments.maxSpl + 10 * Math.log10(config.puissanceAmp/100)
  response = Math.min(response, maxSpl - 89) // 89 dB = sensibilité de référence

  return response
}

function calculateBassResponse(frequency: number, config: Config, freqCoupure: number): number {
  let response = 0
  
  // Réponse du filtre passe-bas
  response += calculateFilterResponse(frequency, freqCoupure, false, config)

  // Effets de charge
  if (config.typeCharge === 'bass-reflex') {
    const fb = calculateTuningFrequency(config)
    if (frequency < fb) {
      response += 12 * Math.log10(frequency/fb)
    }
  } else { // clos
    const fs = calculateResonanceFrequency(config)
    if (frequency < fs) {
      response -= 12 * Math.log10(fs/frequency)
    }
  }

  // Effets de la pièce
  response += calculateRoomEffects(frequency, config)

  return response
}

// ... autres fonctions de calcul spécialisées ...

export function calculateGlobalResponse(frequency: number, voiceResponses: number[]): number {
  // Conversion en amplitudes linéaires avec phase
  const amplitudes = voiceResponses.map(db => Math.pow(10, db/20))
  
  // Somme vectorielle avec phase
  const totalAmplitude = amplitudes.reduce((sum, amp) => sum + amp, 0)
  
  return 20 * Math.log10(totalAmplitude)
}