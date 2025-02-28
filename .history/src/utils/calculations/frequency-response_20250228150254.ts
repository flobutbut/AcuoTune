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
  
  // Butterworth par défaut si Q trop faible
  const safeQ = Math.max(Q, 0.707)
  
  if (isHighPass) {
    return 20 * Math.log10(Math.pow(w, order) / 
           Math.sqrt(1 + (1/safeQ) * Math.pow(w, order) + Math.pow(w, 2 * order)))
  } else {
    return 20 * Math.log10(1 / 
           Math.sqrt(1 + (1/safeQ) * Math.pow(w, order) + Math.pow(w, 2 * order)))
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
  const Q = Math.min(Math.max(parseFloat(electronicParams.facteurQ) || 0.707, 0.5), 2.0)
  const freqAccord = parseFloat(electronicParams.frequenceAccord) || 0
  
  let response = 0
  
  if (voiceIndex === 0) { // Grave
    response += calculateFilterResponse(frequency, freqCoupures[0], false, penteFiltre, Q)
    
    // Distinction entre les types de charge
    switch(config.typeCharge) {
      case 'bass-reflex':
        const fbSimple = freqAccord > 0 ? freqAccord : (config.typeEnceinte === 'bibliothèque' ? 45 : 35)
        const wSimple = frequency / fbSimple
        
        if (frequency < fbSimple) {
          const bassExtension = Math.min(12, 12 * Math.log10(frequency/fbSimple))
          const qEffect = 3 * (Q - 0.5) * Math.exp(-Math.pow(Math.log(wSimple), 2))
          response += bassExtension + qEffect
        } else {
          const qResonance = 2 * (Q - 0.5) * Math.exp(-Math.pow(Math.log(wSimple), 2))
          response += qResonance
        }
        break;

      case 'double-bass-reflex':
        const fb1 = freqAccord > 0 ? freqAccord : (config.typeEnceinte === 'bibliothèque' ? 40 : 30)
        const fb2 = fb1 * 1.4
        
        const wDouble1 = frequency / fb1
        const wDouble2 = frequency / fb2
        
        if (frequency < fb1) {
          const bassExtension = Math.min(15, 15 * Math.log10(frequency/fb1))
          const qEffect = 2 * (Q - 0.5) * Math.exp(-Math.pow(Math.log(wDouble1), 2))
          response += bassExtension + qEffect
        } else if (frequency < fb2) {
          const midBassResponse = 3 * Math.exp(-Math.pow(Math.log(wDouble1), 2))
          const qEffect = 2 * (Q - 0.5) * (Math.exp(-Math.pow(Math.log(wDouble1), 2)) + Math.exp(-Math.pow(Math.log(wDouble2), 2)))
          response += midBassResponse + qEffect
        } else {
          const qResonance = 1.5 * (Q - 0.5) * Math.exp(-Math.pow(Math.log(wDouble2), 2))
          response += qResonance
        }
        break;

      case 'clos':
        const fsClos = config.typeEnceinte === 'bibliothèque' ? 55 : 40
        const wClos = frequency / fsClos
        
        if (frequency < fsClos) {
          response -= 12 * Math.log10(fsClos/frequency)
          const qEffect = 2 * (Q - 0.5) * Math.exp(-Math.pow(Math.log(wClos), 2))
          response += qEffect
        }
        break;
    }

    // Effet de pièce
    const roomEffects = {
      'proche': { gain: 3, frequency: 100 },
      'moyenne': { gain: 1.5, frequency: 80 },
      'loin': { gain: 0, frequency: 60 }
    }[config.distanceAuMur] || { gain: 1.5, frequency: 80 }

    if (frequency < roomEffects.frequency) {
      response += roomEffects.gain * (1 - frequency/roomEffects.frequency)
    }
  } else if (voiceIndex === nombreVoies - 1) { // Aigu
    // Passe-haut avec Q réaliste
    response += calculateFilterResponse(frequency, freqCoupures[freqCoupures.length - 1], true, penteFiltre, Q)
    
    // Atténuation naturelle des hautes fréquences
    if (frequency > 10000) {
      response -= 0.2 * Math.pow((frequency - 10000) / 1000, 2)
    }
  } else { // Médiums
    // Filtres avec Q réaliste
    response += calculateFilterResponse(frequency, freqCoupures[voiceIndex - 1], true, penteFiltre, Q)
    response += calculateFilterResponse(frequency, freqCoupures[voiceIndex], false, penteFiltre, Q)
  }

  // Ajustements d'amplitude plus réalistes
  const amplitudeAdjustments = {
    'faible': {
      bassBoost: 3,
      trebleBoost: 1.5
    },
    'moyenne': {
      bassBoost: 0,
      trebleBoost: 0
    },
    'forte': {
      bassBoost: -1.5,
      trebleBoost: -1
    }
  }[config.amplitudeEcoute] || { bassBoost: 0, trebleBoost: 0 }

  if (frequency < 200) {
    response += amplitudeAdjustments.bassBoost
  } else if (frequency > 2000) {
    response += amplitudeAdjustments.trebleBoost
  }

  // Limitation plus réaliste
  return Math.max(-30, Math.min(response, 6))
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