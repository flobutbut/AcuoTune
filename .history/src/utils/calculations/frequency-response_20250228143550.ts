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
  console.log('Input values:', { frequency, voiceIndex, config, electronicParams })
  
  const nombreVoies = parseInt(config.nombreVoies)
  const freqCoupures = electronicParams.frequencesCoupure.map(f => parseInt(f))
  
  let response = 0

  // Calcul de base selon la voie
  if (voiceIndex === 0) {
    response = calculateBassResponse(frequency, config, freqCoupures[0])
  } else if (voiceIndex === nombreVoies - 1) {
    response = calculateTrebleResponse(frequency, config, freqCoupures[freqCoupures.length - 1])
  } else {
    response = calculateMidResponse(frequency, config, freqCoupures[voiceIndex - 1], freqCoupures[voiceIndex])
  }

  console.log('Response before adjustments:', response)

  // Ajustements selon le type d'enceinte
  const enceinteBoost = config.typeEnceinte === 'bibliothèque' ? -3 : 0
  response += enceinteBoost * Math.exp(-Math.pow(frequency/100, 2))

  // Ajustements selon l'amplitude d'écoute
  const amplitudeBoosts = {
    'faible': { bass: 3, treble: 2 },
    'moyenne': { bass: 0, treble: 0 },
    'forte': { bass: -2, treble: -1 }
  }
  const defaultBoost = { bass: 0, treble: 0 }
  const boosts = amplitudeBoosts[config.amplitudeEcoute as keyof typeof amplitudeBoosts] || defaultBoost

  response += boosts.bass * Math.exp(-Math.pow(frequency/100, 2))
  response += boosts.treble * Math.exp(-Math.pow(5000/frequency, 2))

  console.log('Final response:', response)
  return response
}

function calculateBassResponse(frequency: number, config: Config, freqCoupure: number): number {
  let response = 0
  
  // Filtre passe-bas
  const w = frequency / freqCoupure
  const order = 2 // 12dB/octave
  response -= 20 * Math.log10(Math.sqrt(1 + Math.pow(w, 2 * order)))
  
  // Effets de charge
  if (config.typeCharge === 'bass-reflex') {
    const fb = 50 // Fréquence d'accord typique
    if (frequency < fb) {
      response += 12 * Math.log10(frequency/fb)
    }
  }
  
  return response
}

function calculateTrebleResponse(frequency: number, config: Config, freqCoupure: number): number {
  // Filtre passe-haut
  const w = frequency / freqCoupure
  const order = 2 // 12dB/octave
  return 20 * Math.log10(Math.pow(w, order)) - 3 // -3dB à fc
}

function calculateMidResponse(frequency: number, config: Config, freqBasse: number, freqHaute: number): number {
  // Combinaison passe-haut et passe-bas
  const wLow = frequency / freqBasse
  const wHigh = frequency / freqHaute
  const order = 2
  
  const responseHaut = 20 * Math.log10(Math.pow(wLow, order)) - 3
  const responseBas = -20 * Math.log10(Math.sqrt(1 + Math.pow(wHigh, 2 * order)))
  
  return responseHaut + responseBas
}

export function calculateGlobalResponse(frequency: number, voiceResponses: number[]): number {
  console.log('Global response input:', { frequency, voiceResponses })
  
  // Vérification des valeurs NaN
  if (voiceResponses.some(resp => isNaN(resp))) {
    console.error('NaN detected in voice responses')
    return 0
  }
  
  // Conversion en amplitudes linéaires
  const amplitudes = voiceResponses.map(db => Math.pow(10, db/20))
  console.log('Amplitudes:', amplitudes)
  
  // Somme des amplitudes
  const totalAmplitude = amplitudes.reduce((sum, amp) => sum + amp, 0)
  console.log('Total amplitude:', totalAmplitude)
  
  // Reconversion en dB
  const response = 20 * Math.log10(totalAmplitude)
  console.log('Final global response:', response)
  
  return response
}