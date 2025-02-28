export interface HautParleur {
  type: string
  technologie: string
  impedance: string
  puissance: string
  sensibilite: string
  resonance: string
}

export interface Config {
  impedance: number        // 4-16 ohms
  puissanceAmp: number    // 20-250W
  nombreVoies: number     // "2" | "3" | "4"
  amplitudeEcoute: string // "faible" | "moyenne" | "forte"
  styleMusical: string    // "neutre" | "bass" | "classique" | etc.
  typeEnceinte: string    // "bibliothèque" | "colonne"
  distanceAuMur: string   // "proche" | "moyenne" | "loin"
  typeCharge: string      // "clos" | "bass-reflex"
  facteurQualite: number  // 0.5-1.2
  showAdvanced: boolean
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

export interface ElectronicParams {
  impedanceGlobale: string
  puissanceAdmissible: string
  frequencesCoupure: string[]
  penteFiltre: string     // 6, 12, 18, 24 dB/oct
  sensibilite: string     // "XX dB (1W/1m)"
} 