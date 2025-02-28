import type { Config, ElectronicParams, AcousticParams } from '@/types/configurateur'
import { calculateAcoustic } from './acoustic'
import { calculateElectronic } from './electronic'

export function calculateVoiceResponse(frequency: number, voiceIndex: number, config: Config, electronicParams: ElectronicParams): number {
  const nombreVoies = parseInt(config.nombreVoies)
  const freqCoupures = electronicParams.frequencesCoupure.map(f => parseInt(f))
  const penteFiltre = parseInt(electronicParams.penteFiltre)
  const acousticParams = calculateAcoustic(config)
  
  // Définition des bandes passantes pour chaque voie
  const f0 = voiceIndex === 0 ? 20 : freqCoupures[voiceIndex - 1]
  const f1 = voiceIndex === nombreVoies - 1 ? 20000 : freqCoupures[voiceIndex]
  
  let response = 0
  
  // Fonction de transfert du filtre avec phase
  const filterResponse = (f: number, fc: number, isHighPass: boolean): number => {
    const w = f / fc
    const order = penteFiltre / 6 // Conversion en ordre du filtre
    
    if (isHighPass) {
      return 20 * Math.log10(
        Math.pow(w, 2 * order) /
        Math.sqrt(Math.pow(1 + Math.pow(w, 2 * order), 2))
      )
    } else {
      return 20 * Math.log10(
        1 / Math.sqrt(Math.pow(1 + Math.pow(w, 2 * order), 2))
      )
    }
  }

  // Application des filtres selon la voie
  if (voiceIndex === 0) {
    // Woofer : passe-bas + effets de charge
    response += filterResponse(frequency, f1, false)
    
    // Effets de la charge (clos ou bass-reflex)
    if (config.typeCharge === 'bass-reflex') {
      const fb = acousticParams.frequenceAccord
      if (frequency < fb) {
        response -= 12 * Math.log2(fb/frequency)
      }
    } else {
      // Charge close
      const fr = acousticParams.frequenceResonance
      if (frequency < fr) {
        response -= 12 * Math.log2(fr/frequency)
      }
    }
    
  } else if (voiceIndex === nombreVoies - 1) {
    // Tweeter : passe-haut
    response += filterResponse(frequency, f0, true)
  } else {
    // Voies médium : passe-bande
    response += filterResponse(frequency, f0, true)
    response += filterResponse(frequency, f1, false)
  }

  // Ajout des effets de la distance au mur
  if (voiceIndex === 0) {
    const distanceEffect = calculateWallDistance(frequency, config.distanceAuMur)
    response += distanceEffect
  }

  // Ajout d'une légère résonance aux fréquences de coupure
  const Q = config.facteurQualite || 0.707
  if (voiceIndex > 0) {
    response += Q * Math.exp(-Math.pow(Math.log2(frequency/f0), 2))
  }
  if (voiceIndex < nombreVoies - 1) {
    response += Q * Math.exp(-Math.pow(Math.log2(frequency/f1), 2))
  }

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
  const totalPower = voiceResponses.reduce((sum, resp) => {
    return sum + Math.pow(10, resp/20)
  }, 0)
  
  return 20 * Math.log10(totalPower)
} 