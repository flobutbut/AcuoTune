import type { Config, ElectronicParams, AcousticParams } from '@/types/configurateur'

export function calculateVoiceResponse(frequency: number, voiceIndex: number, config: Config, electronicParams: ElectronicParams): number {
  const nombreVoies = parseInt(config.nombreVoies)
  const freqCoupures = electronicParams.frequencesCoupure.map(f => parseInt(f))
  
  // Définition des bandes passantes pour chaque voie
  const f0 = voiceIndex === 0 ? 20 : freqCoupures[voiceIndex - 1]
  const f1 = voiceIndex === nombreVoies - 1 ? 20000 : freqCoupures[voiceIndex]
  
  // Calcul de la réponse avec la pente du filtre
  let response = 0
  const penteFiltre = electronicParams.penteFiltre

  if (frequency < f0) {
    response = -penteFiltre * Math.log2(f0/frequency)
  } else if (frequency > f1) {
    response = -penteFiltre * Math.log2(frequency/f1)
  }

  // Ajout des effets acoustiques selon le type de voie
  if (voiceIndex === 0) { // Grave
    const fb = 50 // Fréquence de coupure basse
    if (frequency < fb) {
      response -= 12 * Math.log2(fb/frequency)
    }
  }

  return Math.max(-40, Math.min(response, 3))
}

export function calculateGlobalResponse(frequency: number, voiceResponses: number[]): number {
  // Somme des contributions de chaque voie en puissance
  const totalPower = voiceResponses.reduce((sum, resp) => {
    return sum + Math.pow(10, resp/20)
  }, 0)
  
  // Conversion en dB
  return 20 * Math.log10(totalPower)
} 