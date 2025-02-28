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
function calculateFilterResponse(frequency: number, fc: number, isHighPass: boolean, slope: number, Q: number): number {
  const w = frequency / fc
  const order = slope / 6
  
  if (isHighPass) {
    // Passe-haut avec résonance Q
    return 20 * Math.log10(Math.pow(w, order) / 
           Math.sqrt(1 + (1/Q) * Math.pow(w, order) + Math.pow(w, 2 * order)))
  } else {
    // Passe-bas avec résonance Q
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
  console.log('Params:', { Q: electronicParams.facteurQ, freqAccord: electronicParams.frequenceAccord }) // Debug
  
  const nombreVoies = parseInt(config.nombreVoies)
  const freqCoupures = electronicParams.frequencesCoupure.map(f => parseInt(f))
  const penteFiltre = parseInt(electronicParams.penteFiltre)
  const Q = parseFloat(electronicParams.facteurQ) || 0.707
  const freqAccord = parseFloat(electronicParams.frequenceAccord) || 0
  
  let response = 0
  
  // Calcul selon la voie
  if (voiceIndex === 0) { // Grave
    // Passe-bas avec Q spécifié
    response += calculateFilterResponse(frequency, freqCoupures[0], false, penteFiltre, Q)
    
    // Effet de charge avec Q
    if (config.typeCharge === 'bass-reflex') {
      console.log('Bass-reflex Q effect:', Q) // Debug
      const fb = freqAccord > 0 ? freqAccord : (config.typeEnceinte === 'bibliothèque' ? 45 : 35)
      const w = frequency / fb
      
      if (frequency < fb) {
        // Sous la fréquence d'accord
        response += 12 * Math.log10(frequency/fb)
        // Effet du Q plus prononcé sur la résonance basse
        response += 12 * Q * Math.log10(1 + Math.pow(1/w, 2))
      } else {
        // Autour et au-dessus de la fréquence d'accord
        // Pic de résonance plus prononcé avec Q élevé
        const qResonance = 6 * Q * Math.exp(-Math.pow(Math.log(w), 2))
        response += qResonance
      }
    } else { // Charge close
      console.log('Closed-box Q effect:', Q) // Debug
      const fs = config.typeEnceinte === 'bibliothèque' ? 55 : 40
      const w = frequency / fs
      
      if (frequency < fs) {
        // Pente de base
        response -= 12 * Math.log10(fs/frequency)
        // Effet du Q sur l'amortissement et la résonance
        response += 6 * Q * Math.log10(1 + Math.pow(w, 2))
      } else {
        // Résonance autour de Fs plus prononcée avec Q élevé
        const qResonance = 4 * Q * Math.exp(-Math.pow(Math.log(w), 2))
        response += qResonance
      }
    }

    // Effet de la pièce
    const roomEffects = {
      'proche': { gain: 6, frequency: 120 },
      'moyenne': { gain: 3, frequency: 80 },
      'loin': { gain: 0, frequency: 60 }
    }[config.distanceAuMur] || { gain: 3, frequency: 80 }

    if (frequency < roomEffects.frequency) {
      response += roomEffects.gain * (1 - frequency/roomEffects.frequency)
    }
  } else if (voiceIndex === nombreVoies - 1) { // Aigu
    // Passe-haut avec Q spécifié
    response += calculateFilterResponse(frequency, freqCoupures[freqCoupures.length - 1], true, penteFiltre, Q)
    
    // Effet du Q sur la résonance à la fréquence de coupure
    const w = frequency / freqCoupures[freqCoupures.length - 1]
    const qResonance = 3 * Q * Math.exp(-Math.pow(Math.log(w), 2))
    response += qResonance

  } else { // Médiums
    // Filtres avec Q spécifié
    const w1 = frequency / freqCoupures[voiceIndex - 1]
    const w2 = frequency / freqCoupures[voiceIndex]
    
    response += calculateFilterResponse(frequency, freqCoupures[voiceIndex - 1], true, penteFiltre, Q)
    response += calculateFilterResponse(frequency, freqCoupures[voiceIndex], false, penteFiltre, Q)
    
    // Effet du Q sur les résonances aux fréquences de coupure
    const qResonance1 = 3 * Q * Math.exp(-Math.pow(Math.log(w1), 2))
    const qResonance2 = 3 * Q * Math.exp(-Math.pow(Math.log(w2), 2))
    response += qResonance1 + qResonance2
  }

  // Ajustements finaux
  response = applyAmplitudeAndStyleAdjustments(frequency, response, config)
  response = applyPowerAndImpedanceAdjustments(response, config)

  console.log(`Response at ${frequency}Hz with Q=${Q}: ${response}dB`) // Debug
  return Math.max(-40, Math.min(response, 10))
}

function applyAmplitudeAndStyleAdjustments(frequency: number, response: number, config: Config): number {
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

  // Application des ajustements d'amplitude et de style musical
  if (frequency < 200) {
    response += amplitudeAdjustments.bassBoost + styleAdjustments.bassBoost
  } else if (frequency > 2000) {
    response += amplitudeAdjustments.trebleBoost + styleAdjustments.trebleBoost
  } else {
    response += styleAdjustments.midBoost
  }

  return response
}

function applyPowerAndImpedanceAdjustments(response: number, config: Config): number {
  const powerAdjustment = 10 * Math.log10(config.puissanceAmp / 100)
  const impedanceLimit = -3 * Math.log2(config.impedance / 8)
  return Math.min(response + powerAdjustment, response + impedanceLimit)
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

// Interface ElectronicParams mise à jour
interface ElectronicParams {
  frequencesCoupure: string[]
  penteFiltre: string
  facteurQ: string        // Nouveau paramètre
  frequenceAccord: string // Nouveau paramètre
}