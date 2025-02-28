import type { Config, ElectronicParams, AcousticParams } from '@/types/configurateur'
import { calculateAcoustic } from './acoustic'
import { calculateElectronic } from './electronic'

export function calculateVoiceResponse(frequency: number, voiceIndex: number, config: Config, electronicParams: ElectronicParams): number {
  const nombreVoies = parseInt(config.nombreVoies)
  const freqCoupures = electronicParams.frequencesCoupure.map(f => parseInt(f))
  const penteFiltre = parseInt(electronicParams.penteFiltre)
  const acousticParams = calculateAcoustic(config)
  
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

  // Application des filtres selon la voie
  if (voiceIndex === 0) { // Grave
    // Passe-bas
    const f1 = freqCoupures[0]
    response += filterResponse(frequency, f1, false)
    
    // Effet bass-reflex ou clos
    if (config.typeCharge === 'bass-reflex') {
      const fb = 50 // Fréquence d'accord typique
      if (frequency < fb) {
        response += 12 * Math.log10(frequency/fb) // Pente +12dB/oct sous fb
      }
    } else {
      // Charge close: -12dB/oct sous la fréquence de résonance
      const fr = 40
      if (frequency < fr) {
        response -= 12 * Math.log10(fr/frequency)
      }
    }
    
  } else if (voiceIndex === nombreVoies - 1) { // Aigu
    // Passe-haut
    const f0 = freqCoupures[freqCoupures.length - 1]
    response += filterResponse(frequency, f0, true)
    
  } else { // Médiums
    // Passe-bande (passe-haut + passe-bas)
    const f0 = freqCoupures[voiceIndex - 1]
    const f1 = freqCoupures[voiceIndex]
    response += filterResponse(frequency, f0, true) // Passe-haut
    response += filterResponse(frequency, f1, false) // Passe-bas
  }

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

  // Ajustement global selon l'amplitude d'écoute
  const amplitudeAdjust = {
    'faible': -2,
    'moyenne': 0,
    'forte': 2
  }
  response += (amplitudeAdjust[config.amplitudeEcoute as keyof typeof amplitudeAdjust] || 0)

  return Math.max(-40, Math.min(response, 3))
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
  // Conversion des dB en amplitudes linéaires avec phase
  const amplitudes = voiceResponses.map(db => {
    const amplitude = Math.pow(10, db/20)
    return amplitude
  })
  
  // Somme vectorielle (considérant les phases alignées)
  const totalAmplitude = amplitudes.reduce((sum, amp) => sum + amp, 0)
  
  // Reconversion en dB
  return 20 * Math.log10(totalAmplitude)
} 