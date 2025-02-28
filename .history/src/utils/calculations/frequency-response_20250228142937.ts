import type { Config, ElectronicParams, AcousticParams } from '@/types/configurateur'
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
  const acousticParams = calculateAcoustic(config)
  
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
  
  // Fonction de transfert du filtre
  const filterResponse = (f: number, fc: number, isHighPass: boolean): number => {
    const w = f / fc
    const order = penteFiltre / 6 // 12dB/oct = ordre 2, 18dB/oct = ordre 3, etc.
    
    if (isHighPass) {
      // H(s) = s^n / (s^n + 1) pour passe-haut
      return 20 * Math.log10(Math.pow(w, order)) - 3 // -3dB à fc
    } else {
      // H(s) = 1 / (s^n + 1) pour passe-bas
      return -20 * Math.log10(Math.sqrt(1 + Math.pow(w, 2 * order)))
    }
  }

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

  // Ajout d'une légère résonance aux fréquences de coupure (Q)
  const Q = config.facteurQualite || 0.707
  const resonanceGain = (Q - 0.707) * 3 // +3dB max de résonance pour Q=1
  
  if (voiceIndex > 0) {
    const f0 = freqCoupures[voiceIndex - 1]
    response += resonanceGain * Math.exp(-Math.pow(Math.log2(frequency/f0), 2))
  }
  if (voiceIndex < nombreVoies - 1) {
    const f1 = freqCoupures[voiceIndex]
    response += resonanceGain * Math.exp(-Math.pow(Math.log2(frequency/f1), 2))
  }

  // Ajout des effets de la distance au mur
  if (voiceIndex === 0) {
    const distanceEffect = calculateWallDistance(frequency, config.distanceAuMur)
    response += distanceEffect
  }

  return response
}

function calculateBassResponse(frequency: number, config: Config, freqCoupure: number): number {
  let response = 0
  
  // Réponse du filtre passe-bas
  response += filterResponse(frequency, freqCoupure, false)

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
  return filterResponse(frequency, freqCoupure, true)
}

function calculateMidResponse(frequency: number, config: Config, f0: number, f1: number): number {
  return filterResponse(frequency, f0, true) + filterResponse(frequency, f1, false)
}

function calculateWallDistance(frequency: number, distance: string): number {
  const distances = {
    'proche': 0.2,
    'moyenne': 0.4,
    'loin': 0.8
  }
  const d = distances[distance as keyof typeof distances] || 0.4
  
  // Effet de la distance sur les basses fréquences
  const wavelength = 343 / frequency // vitesse du son / fréquence
  return 6 * Math.sin(2 * Math.PI * d / wavelength)
}

export function calculateGlobalResponse(frequency: number, voiceResponses: number[]): number {
  // Conversion en amplitudes linéaires avec phase
  const amplitudes = voiceResponses.map(db => Math.pow(10, db/20))
  
  // Somme vectorielle avec phase
  const totalAmplitude = amplitudes.reduce((sum, amp) => sum + amp, 0)
  
  return 20 * Math.log10(totalAmplitude)
} 