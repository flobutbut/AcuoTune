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

// Fonction de transfert du filtre
function calculateFilterResponse(frequency: number, fc: number, isHighPass: boolean, config: Config): number {
  const w = frequency / fc
  const order = parseInt(config.penteFiltre) / 6 // Conversion dB/oct en ordre
  
  if (isHighPass) {
    // Filtre passe-haut
    return 20 * Math.log10(Math.pow(w, order)) - 3 // -3dB à fc
  } else {
    // Filtre passe-bas
    return -20 * Math.log10(Math.sqrt(1 + Math.pow(w, 2 * order)))
  }
}

function calculateTuningFrequency(config: Config): number {
  return config.typeEnceinte === 'bibliothèque' ? 50 : 35
}

function calculateResonanceFrequency(config: Config): number {
  return config.typeEnceinte === 'bibliothèque' ? 60 : 40
}

function calculateRoomEffects(frequency: number, config: Config): number {
  const roomModes = {
    'proche': 120,
    'moyenne': 80,
    'loin': 60
  }
  const fb = roomModes[config.distanceAuMur as keyof typeof roomModes] || 80
  
  // Effet de la pièce sur les basses
  if (frequency < fb) {
    return 6 * Math.log10(fb/frequency)
  }
  return 0
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

function calculateTrebleResponse(frequency: number, config: Config, freqCoupure: number): number {
  // Filtre passe-haut
  return calculateFilterResponse(frequency, freqCoupure, true, config)
}

function calculateMidResponse(frequency: number, config: Config, freqBasse: number, freqHaute: number): number {
  // Combinaison passe-haut et passe-bas
  const responseHaut = calculateFilterResponse(frequency, freqBasse, true, config)
  const responseBas = calculateFilterResponse(frequency, freqHaute, false, config)
  return responseHaut + responseBas
}

export function calculateGlobalResponse(frequency: number, voiceResponses: number[]): number {
  // Conversion en amplitudes linéaires
  const amplitudes = voiceResponses.map(db => Math.pow(10, db/20))
  
  // Somme des amplitudes
  const totalAmplitude = amplitudes.reduce((sum, amp) => sum + amp, 0)
  
  // Reconversion en dB
  return 20 * Math.log10(totalAmplitude)
}