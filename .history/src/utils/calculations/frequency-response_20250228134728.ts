import type { Config, ElectronicParams, AcousticParams } from '@/types/configurateur'

export function calculateVoiceResponse(frequency: number, voiceIndex: number, config: Config, electronicParams: ElectronicParams): number {
  const nombreVoies = parseInt(config.nombreVoies)
  const freqCoupures = electronicParams.frequencesCoupure.map(f => parseInt(f))
  const penteFiltre = parseInt(electronicParams.penteFiltre)
  
  // Définition des bandes passantes pour chaque voie
  const f0 = voiceIndex === 0 ? 20 : freqCoupures[voiceIndex - 1]
  const f1 = voiceIndex === nombreVoies - 1 ? 20000 : freqCoupures[voiceIndex]
  
  let response = 0
  
  // Filtre passe-haut (pour toutes les voies sauf le grave)
  if (voiceIndex > 0) {
    response += -penteFiltre * Math.log2(Math.max(f0/frequency, 1))
  }
  
  // Filtre passe-bas (pour toutes les voies sauf l'aigu)
  if (voiceIndex < nombreVoies - 1) {
    response += -penteFiltre * Math.log2(Math.max(frequency/f1, 1))
  }
  
  // Ajout des effets acoustiques selon le type de voie
  if (voiceIndex === 0) { // Grave
    // Atténuation naturelle dans le grave
    const fb = 50 // Fréquence de coupure basse
    if (frequency < fb) {
      response -= 12 * Math.log2(fb/frequency)
    }
  }

  // Ajout d'une légère bosse à la fréquence de coupure pour un son plus naturel
  if (voiceIndex > 0) {
    const resonance = 1.5 // dB
    response += resonance * Math.exp(-Math.pow(Math.log2(frequency/f0), 2))
  }
  if (voiceIndex < nombreVoies - 1) {
    const resonance = 1.5 // dB
    response += resonance * Math.exp(-Math.pow(Math.log2(frequency/f1), 2))
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