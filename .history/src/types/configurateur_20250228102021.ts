export interface HautParleur {
  type: string
  technologie: string
  impedance: string
  puissance: string
  sensibilite: string
  resonance: string
}

export interface Config {
  nombreVoies: number
  typeCharge: string
  puissanceAmp: number
  impedance: number
  styleMusical: string
  amplitudeEcoute: string
  typeEnceinte: string
  utilisationPrincipale: string
  showAdvanced: boolean
  facteurQualite: number
  accordEvent?: number
  freqCoupureManuelle: number[]
}

export interface Dimensions {
  hauteur: number
  largeur: number
  profondeur: number
}

export interface PhysicalRecommendation {
  dimensions: Dimensions
  volume: number
  materiaux: string[]
  typeCharge: string
  ventilation: boolean
  eventSpecs?: {
    surface: number
    diametre: number
    longueur: number
    frequence: number
  }
}

export interface ElectronicRecommendation {
  puissanceAdmissible: string
  impedanceGlobale: string
  sensibilite: string
  frequencesCoupure: string[]
  penteFiltre: string
}

export interface Recommendations {
  physique: PhysicalRecommendation
  electronique: ElectronicRecommendation
  hautParleurs: HautParleur[]
  freqCoupure: string[]
} 