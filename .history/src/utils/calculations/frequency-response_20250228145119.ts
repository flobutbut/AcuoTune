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
function calculateFilterResponse(frequency: number, fc: number, isHighPass: boolean, slope: number): number {
  const w = frequency / fc
  const order = slope / 6 // Conversion dB/octave en ordre
  const Q = 0.707 // Butterworth
  
  if (isHighPass) {
    return 20 * Math.log10(Math.pow(w, order) / 
           Math.sqrt(1 + (1/Q) * Math.pow(w, order) + Math.pow(w, 2 * order)))
  } else {
    return 20 * Math.log10(1 / 
           Math.sqrt(1 + (1/Q) * Math.pow(w, order) + Math.pow(w, 2 * order)))
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
  const nombreVoies = parseInt(config.nombreVoies)
  const freqCoupures = electronicParams.frequencesCoupure.map(f => parseInt(f))
  const penteFiltre = parseInt(electronicParams.penteFiltre)
  
  let response = 0
  
  // Ajustements selon l'amplitude d'écoute (Fletcher-Munson)
  const amplitudeAdjustments = {
    'faible': {
      bassBoost: 6,    // Compensation plus forte des basses à faible volume
      trebleBoost: 3   // Compensation des aigus à faible volume
    },
    'moyenne': {
      bassBoost: 0,
      trebleBoost: 0
    },
    'forte': {
      bassBoost: -3,   // Réduction des basses à fort volume
      trebleBoost: -2  // Réduction des aigus à fort volume
    }
  }[config.amplitudeEcoute] || { bassBoost: 0, trebleBoost: 0 }

  // Ajustements selon le style musical
  const styleAdjustments = {
    'neutre': {
      bassBoost: 0,
      midBoost: 0,
      trebleBoost: 0
    },
    'classique': {
      bassBoost: -2,
      midBoost: 1,
      trebleBoost: -1
    },
    'jazz': {
      bassBoost: 1,
      midBoost: 2,
      trebleBoost: -2
    },
    'rock': {
      bassBoost: 3,
      midBoost: -1,
      trebleBoost: 2
    },
    'electronic': {
      bassBoost: 4,
      midBoost: -2,
      trebleBoost: 3
    }
  }[config.styleMusical] || { bassBoost: 0, midBoost: 0, trebleBoost: 0 }

  // Calcul selon la voie
  if (voiceIndex === 0) { // Grave
    // Passe-bas
    response += calculateFilterResponse(frequency, freqCoupures[0], false, penteFiltre)
    
    // Effet bass-reflex ou clos
    if (config.typeCharge === 'bass-reflex') {
      const fb = config.typeEnceinte === 'bibliothèque' ? 45 : 35
      if (frequency < fb) {
        response += 12 * Math.log10(frequency/fb)
      }
    } else { // Charge close
      const fs = config.typeEnceinte === 'bibliothèque' ? 55 : 40
      if (frequency < fs) {
        response -= 12 * Math.log10(fs/frequency)
      }
    }

    // Effet de la pièce selon la distance au mur
    const roomEffects = {
      'proche': {
        gain: 6,
        frequency: 120
      },
      'moyenne': {
        gain: 3,
        frequency: 80
      },
      'loin': {
        gain: 0,
        frequency: 60
      }
    }[config.distanceAuMur] || { gain: 3, frequency: 80 }

    if (frequency < roomEffects.frequency) {
      response += roomEffects.gain * (1 - frequency/roomEffects.frequency)
    }

  } else if (voiceIndex === nombreVoies - 1) { // Aigu
    response += calculateFilterResponse(frequency, freqCoupures[freqCoupures.length - 1], true, penteFiltre)
    
    // Atténuation naturelle des hautes fréquences
    if (frequency > 10000) {
      response -= 0.5 * Math.pow((frequency - 10000) / 1000, 2)
    }

  } else { // Médiums
    response += calculateFilterResponse(frequency, freqCoupures[voiceIndex - 1], true, penteFiltre)
    response += calculateFilterResponse(frequency, freqCoupures[voiceIndex], false, penteFiltre)
  }

  // Application des ajustements d'amplitude et de style musical
  if (frequency < 200) {
    response += amplitudeAdjustments.bassBoost + styleAdjustments.bassBoost
  } else if (frequency > 2000) {
    response += amplitudeAdjustments.trebleBoost + styleAdjustments.trebleBoost
  } else {
    response += styleAdjustments.midBoost
  }

  // Ajustement selon la puissance de l'amplificateur
  const powerAdjustment = 10 * Math.log10(config.puissanceAmp / 100) // Référence 100W
  response += powerAdjustment

  // Limitation selon l'impédance
  const impedanceLimit = -3 * Math.log2(config.impedance / 8) // Référence 8 ohms
  response = Math.min(response, response + impedanceLimit)

  return Math.max(-40, Math.min(response, 10))
}

export function calculateGlobalResponse(frequency: number, voiceResponses: number[]): number {
  // Conversion des dB en amplitudes linéaires avec phase
  const amplitudes = voiceResponses.map(db => {
    const amplitude = Math.pow(10, db/20)
    return amplitude
  })
  
  // Somme vectorielle (considérant les phases)
  const totalAmplitude = Math.sqrt(amplitudes.reduce((sum, amp) => sum + amp * amp, 0))
  
  // Reconversion en dB
  const response = 20 * Math.log10(totalAmplitude)
  
  // Limitation à des valeurs réalistes
  return Math.max(-40, Math.min(response, 10))
}