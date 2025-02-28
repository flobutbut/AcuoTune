import type { Config } from '@/types/configurateur'
import type { HautParleur } from '@/types/configurateur'

interface AcousticResult {
  volumeOptimal: number
  frequenceAccord: number
  facteurQualite: number
  frequenceResonance: number
  rendementBasse: number
  puissanceMax: number
}

interface SpeakerRecommendation {
  type: 'woofer' | 'midrange' | 'tweeter' | 'subwoofer'
  diameter: string
  power: string
  impedance: string
  frequency: string
  sensitivity: string
  resonance?: string
}

interface SpeakerConfig {
  type: string
  powerRatio: [number, number] // [min, max] ratio de la puissance totale
  sensitivityRange: [number, number] // [min, max] en dB
  frequencyRange: [number, number] // [min, max] en Hz
  diameterRange: { min: number; max: number; unit: 'mm' | 'cm' }
  resonanceRange?: [number, number] // [min, max] en Hz pour woofer
}

const SPEAKER_CONFIGS: Record<string, SpeakerConfig> = {
  woofer: {
    type: 'woofer',
    powerRatio: [0.6, 1.0],
    sensitivityRange: [88, 91],
    frequencyRange: [35, 500],
    diameterRange: { min: 20, max: 25, unit: 'cm' },
    resonanceRange: [25, 35]
  },
  midrange: {
    type: 'midrange',
    powerRatio: [0.3, 0.5],
    sensitivityRange: [89, 92],
    frequencyRange: [500, 3000],
    diameterRange: { min: 13, max: 17, unit: 'cm' }
  },
  tweeter: {
    type: 'tweeter',
    powerRatio: [0.2, 0.3],
    sensitivityRange: [90, 93],
    frequencyRange: [3000, 20000],
    diameterRange: { min: 25, max: 28, unit: 'mm' }
  },
  subwoofer: {
    type: 'subwoofer',
    powerRatio: [0.8, 1.2],
    sensitivityRange: [87, 90],
    frequencyRange: [20, 150],
    diameterRange: { min: 30, max: 38, unit: 'cm' },
    resonanceRange: [18, 25]
  }
}

export function calculateSpeakers(config: Config, acoustic: AcousticResult): HautParleur[] {
  const speakers: HautParleur[] = []

  // Calcul du woofer
  const woofer = {
    type: 'Grave',
    technologie: selectWooferTechnology(config),
    impedance: `${config.impedance} Ω`,
    puissance: `${Math.round(acoustic.puissanceMax * 0.6)}W RMS`,
    sensibilite: `${acoustic.rendementBasse} dB`,
    resonance: `${acoustic.frequenceResonance} Hz`,
    frequenceMin: 35,
    frequenceMax: config.freqCoupureManuelle[0],
    diametre: calculateWooferDiameter(acoustic.volumeOptimal)
  }
  speakers.push(woofer)

  // Calcul du médium (si 3 ou 4 voies)
  if (config.nombreVoies >= 3) {
    const medium = {
      type: 'Médium',
      technologie: selectMidrangeTechnology(config),
      impedance: `${config.impedance} Ω`,
      puissance: `${Math.round(acoustic.puissanceMax * 0.3)}W RMS`,
      sensibilite: `${acoustic.rendementBasse + 1} dB`,
      resonance: `${config.freqCoupureManuelle[0] * 0.7} Hz`,
      frequenceMin: config.freqCoupureManuelle[0],
      frequenceMax: config.freqCoupureManuelle[1],
      diametre: calculateMidrangeDiameter(config)
    }
    speakers.push(medium)
  }

  // Calcul du tweeter
  const tweeter = {
    type: 'Aigu',
    technologie: selectTweeterTechnology(config),
    impedance: `${config.impedance} Ω`,
    puissance: `${Math.round(acoustic.puissanceMax * 0.2)}W RMS`,
    sensibilite: `${acoustic.rendementBasse + 2} dB`,
    resonance: '800 Hz',
    frequenceMin: config.nombreVoies === 2 ? config.freqCoupureManuelle[0] : config.freqCoupureManuelle[1],
    frequenceMax: 20000,
    diametre: 25 // 25mm standard pour un dôme
  }
  speakers.push(tweeter)

  // Calcul du super-tweeter (si 4 voies)
  if (config.nombreVoies === 4) {
    const superTweeter = {
      type: 'Super-Aigu',
      technologie: 'Dôme titane',
      impedance: `${config.impedance} Ω`,
      puissance: `${Math.round(acoustic.puissanceMax * 0.1)}W RMS`,
      sensibilite: `${acoustic.rendementBasse + 3} dB`,
      resonance: '2000 Hz',
      frequenceMin: config.freqCoupureManuelle[2],
      frequenceMax: 40000,
      diametre: 19 // 19mm standard pour un super-tweeter
    }
    speakers.push(superTweeter)
  }

  return speakers
}

function calculateWooferDiameter(volume: number): number {
  // Calcul plus précis du diamètre du woofer selon le volume
  const baseSize = Math.pow(volume / 10, 1/3) * 25
  return Math.round(baseSize / 5) * 5 // Arrondi aux 5mm les plus proches
}

function calculateMidrangeDiameter(config: Config): number {
  // Le diamètre du médium dépend de la fréquence de coupure
  const freqCoupure = config.freqCoupureManuelle[0]
  return Math.round(1000 / freqCoupure * 50) // Formule empirique
}

function selectWooferTechnology(config: Config): string {
  if (config.budgetNiveau === 'élevé') {
    return config.styleMusical === 'bass' 
      ? 'Membrane sandwich carbone-Rohacell'
      : 'Membrane sandwich carbone-papier'
  } else if (config.budgetNiveau === 'moyen') {
    return config.styleMusical === 'bass'
      ? 'Membrane polypropylène renforcé'
      : 'Membrane papier traité'
  }
  return 'Membrane polypropylène standard'
}

function selectMidrangeTechnology(config: Config): string {
  if (config.budgetNiveau === 'élevé') {
    return config.styleMusical === 'hifi'
      ? 'Membrane Kevlar tressé'
      : 'Membrane papier haute rigidité'
  } else if (config.budgetNiveau === 'moyen') {
    return 'Membrane papier traité'
  }
  return 'Membrane polypropylène'
}

function selectTweeterTechnology(config: Config): string {
  if (config.budgetNiveau === 'élevé') {
    return config.styleMusical === 'hifi'
      ? 'Dôme soie traitée à chambre amortie'
      : 'Dôme aluminium-magnésium'
  } else if (config.budgetNiveau === 'moyen') {
    return 'Dôme soie traitée'
  }
  return 'Dôme polyester'
}

export function calculateSpeakerRecommendations(config: Config): SpeakerRecommendation[] {
  const power = parseInt(config.puissance || '100')
  const impedance = parseInt(config.impedance || '8')
  const recommendations: SpeakerRecommendation[] = []

  // Sélection des haut-parleurs selon le nombre de voies
  const speakerTypes = getSpeakerTypesForConfig(config)

  speakerTypes.forEach(type => {
    const speakerConfig = SPEAKER_CONFIGS[type]
    if (!speakerConfig) return

    // Ajustements selon le style musical
    const adjustedConfig = adjustForMusicalStyle(speakerConfig, config.styleMusical)

    recommendations.push({
      type: speakerConfig.type as SpeakerRecommendation['type'],
      diameter: formatDiameter(speakerConfig.diameterRange),
      power: formatPower(power, speakerConfig.powerRatio),
      impedance: `${impedance}Ω`,
      frequency: formatFrequency(adjustedConfig.frequencyRange),
      sensitivity: formatSensitivity(adjustedConfig.sensitivityRange),
      ...(speakerConfig.resonanceRange && {
        resonance: formatFrequency(speakerConfig.resonanceRange)
      })
    })
  })

  return recommendations
}

function getSpeakerTypesForConfig(config: Config): string[] {
  const nombreVoies = parseInt(config.nombreVoies || '2')
  
  switch (nombreVoies) {
    case 4:
      return ['subwoofer', 'woofer', 'midrange', 'tweeter']
    case 3:
      return ['woofer', 'midrange', 'tweeter']
    case 2:
      return ['woofer', 'tweeter']
    default:
      return ['woofer', 'tweeter']
  }
}

function adjustForMusicalStyle(
  config: SpeakerConfig,
  style?: string
): SpeakerConfig {
  const adjusted = { ...config }
  
  switch (style) {
    case 'chaleureux':
      if (config.type === 'woofer') {
        adjusted.sensitivityRange = [
          config.sensitivityRange[0] + 1,
          config.sensitivityRange[1] + 1
        ]
      }
      break
    case 'analytique':
      if (config.type === 'tweeter') {
        adjusted.sensitivityRange = [
          config.sensitivityRange[0] + 1,
          config.sensitivityRange[1] + 2
        ]
      }
      break
    // Autres styles musicaux...
  }

  return adjusted
}

// Fonctions utilitaires de formatage
function formatDiameter(range: { min: number; max: number; unit: string }): string {
  return `${range.min}-${range.max}${range.unit}`
}

function formatPower(totalPower: number, ratio: [number, number]): string {
  const min = Math.round(totalPower * ratio[0])
  const max = Math.round(totalPower * ratio[1])
  return `${min}-${max}W`
}

function formatFrequency(range: [number, number]): string {
  return `${range[0]}-${range[1]}Hz`
}

function formatSensitivity(range: [number, number]): string {
  return `${range[0]}-${range[1]}dB`
} 