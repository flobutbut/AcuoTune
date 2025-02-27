export interface HautParleur {
  type: string
  technologie: string
  impedance: string
  puissance: string
  sensibilite: string
  resonance: string
}

export interface Config {
  impedance: number
  puissanceAmp: number
  nombreVoies: number
  amplitudeEcoute: string
  styleMusical: string
  typeEnceinte: string
  budgetNiveau: string
  distanceAuMur: string
  utilisationPrincipale: string
  showAdvanced: boolean
  typeCharge: string
  penteFiltre: string
  freqCoupureManuelle: number[]
  accordEvent: number
  facteurQualite: number
}

export interface Dimensions {
  hauteur: number
  largeur: number
  profondeur: number
}

export interface Recommandations {
  volume: number
  materiaux: string[]
  typeCharge: string
  ventilation: boolean
  surfaceEvent: number
  diametreEvent: number
  longueurEvent: number
  freqAccord: number
  dimensions: Dimensions
  impedanceGlobale: string
  puissanceAdmissible: string
  freqCoupure: string[]
  penteFiltre: string
  efficacite: string
  hautParleurs: HautParleur[]
} 