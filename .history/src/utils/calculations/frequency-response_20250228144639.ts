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
  const nombreVoies = parseInt(config.nombreVoies)
  const freqCoupures = electronicParams.frequencesCoupure.map(f => parseInt(f))
  const penteFiltre = parseInt(electronicParams.penteFiltre) || 12 // dB/octave
  
  let response = 0
  
  // Fonction de transfert du filtre avec phase
  const filterResponse = (f: number, fc: number, isHighPass: boolean): number => {
    const w = f / fc
    const order = penteFiltre / 6 // Conversion dB/octave en ordre
    
    if (isHighPass) {
      // Filtre passe-haut avec résonance au Q
      const Q = 0.707 // Butterworth
      return 20 * Math.log10(Math.pow(w, order) / 
             Math.sqrt(1 + (1/Q) * Math.pow(w, order) + Math.pow(w, 2 * order)))
    } else {
      // Filtre passe-bas avec résonance au Q
      const Q = 0.707 // Butterworth
      return 20 * Math.log10(1 / 
             Math.sqrt(1 + (1/Q) * Math.pow(w, order) + Math.pow(w, 2 * order)))
    }
  }

  // Calcul selon la voie
  if (voiceIndex === 0) { // Grave
    // Passe-bas
    response += filterResponse(frequency, freqCoupures[0], false)
    
    // Effet bass-reflex ou clos
    if (config.typeCharge === 'bass-reflex') {
      const fb = config.typeEnceinte === 'bibliothèque' ? 45 : 35 // Fréquence d'accord
      if (frequency < fb) {
        response += 12 * Math.log10(frequency/fb) // +12dB/oct sous fb
      }
    } else { // Charge close
      const fs = config.typeEnceinte === 'bibliothèque' ? 55 : 40 // Fréquence de résonance
      if (frequency < fs) {
        response -= 12 * Math.log10(fs/frequency) // -12dB/oct sous fs
      }
    }

    // Effet de la pièce sur les basses
    const roomGain = {
      'proche': 6,
      'moyenne': 3,
      'loin': 0
    }[config.distanceAuMur] || 3

    if (frequency < 100) {
      response += roomGain * (1 - frequency/100)
    }

  } else if (voiceIndex === nombreVoies - 1) { // Aigu
    // Passe-haut
    response += filterResponse(frequency, freqCoupures[freqCoupures.length - 1], true)
    
    // Atténuation naturelle des hautes fréquences
    if (frequency > 10000) {
      response -= 0.5 * Math.pow((frequency - 10000) / 1000, 2)
    }

  } else { // Médiums
    // Passe-bande (combinaison passe-haut et passe-bas)
    response += filterResponse(frequency, freqCoupures[voiceIndex - 1], true)
    response += filterResponse(frequency, freqCoupures[voiceIndex], false)
  }

  // Ajustements selon le type d'enceinte
  const enceinteAdjustments = {
    'bibliothèque': {
      bassBoost: -2,
      midBoost: 0,
      trebleBoost: 1
    },
    'colonne': {
      bassBoost: 0,
      midBoost: 0,
      trebleBoost: 0
    }
  }[config.typeEnceinte] || { bassBoost: 0, midBoost: 0, trebleBoost: 0 }

  // Application des ajustements
  if (frequency < 200) {
    response += enceinteAdjustments.bassBoost
  } else if (frequency > 2000) {
    response += enceinteAdjustments.trebleBoost
  } else {
    response += enceinteAdjustments.midBoost
  }

  // Limitation à des valeurs réalistes
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