import type { Config } from '@/types/configurateur'
import type { ElectronicRecommendation } from '@/types/configurateur'

interface AcousticResult {
  volumeOptimal: number
  frequenceAccord: number
  facteurQualite: number
  frequenceResonance: number
  rendementBasse: number
  puissanceMax: number
}

interface ElectronicRecommendation {
  frequencesCoupure: string[]
  penteFiltre: string
  impedanceGlobale: string
  puissanceAdmissible: string
  sensibilite: string
  facteurQ: number
}

export function calculateElectronic(config: Config, acoustic?: AcousticResult): ElectronicRecommendation {
  console.log('Calculating electronic parameters for:', { config, acoustic })

  // Calcul des fréquences de coupure
  const frequencesCoupure = calculateCrossoverFrequencies(config)

  // Calcul de la pente des filtres
  let penteFiltre = '12 dB/octave' // Valeur par défaut
  if (config.nombreVoies >= 3) {
    penteFiltre = '24 dB/octave'
  }

  // Vérification que la pente est bien définie
  if (!penteFiltre.includes('dB/octave')) {
    console.warn('Invalid filter slope, using default')
    penteFiltre = '12 dB/octave'
  }

  // Calcul de l'impédance globale
  const impedanceGlobale = calculateGlobalImpedance(config)

  // Calcul de la puissance admissible
  const puissanceAdmissible = calculateAdmissiblePower(acoustic?.puissanceMax || 0)

  // Calcul de la sensibilité globale
  const sensibilite = calculateGlobalSensitivity(config, acoustic || {
    volumeOptimal: 0,
    frequenceAccord: 0,
    facteurQualite: 0,
    frequenceResonance: 0,
    rendementBasse: 0,
    puissanceMax: 0
  })

  const result: ElectronicRecommendation = {
    frequencesCoupure,
    penteFiltre,
    impedanceGlobale,
    puissanceAdmissible,
    sensibilite,
    facteurQ: config.facteurQualite
  }

  console.log('Electronic calculation result:', result)
  return result
}

export function calculateCrossoverFrequencies(config: Config): string[] {
  // Fréquences de coupure par défaut selon le nombre de voies
  let frequencies: string[] = []
  
  // Si les paramètres avancés sont activés, utiliser les fréquences manuelles
  if (config.showAdvanced && config.freqCoupureManuelle) {
    frequencies = config.freqCoupureManuelle.map(f => `${f} Hz`)
  } else {
    // Fréquences automatiques selon le nombre de voies
    switch (config.nombreVoies) {
      case 2:
        frequencies = ['3000 Hz']
        break
      case 3:
        frequencies = ['500 Hz', '5000 Hz']
        break
      case 4:
        frequencies = ['250 Hz', '1500 Hz', '8000 Hz']
        break
      default:
        frequencies = ['3000 Hz']
    }
  }

  console.log('Crossover frequencies calculation:', {
    showAdvanced: config.showAdvanced,
    nombreVoies: config.nombreVoies,
    freqCoupureManuelle: config.freqCoupureManuelle,
    result: frequencies
  })

  return frequencies
}

function calculateFilterSlope(config: Config): string {
  // Si mode avancé, utiliser la pente configurée
  if (config.showAdvanced) {
    return `${config.penteFiltre} dB/octave`
  }

  // Sinon, déterminer la pente recommandée
  if (config.budgetNiveau === 'élevé' || config.styleMusical === 'hifi') {
    return '24 dB/octave'
  } else if (config.nombreVoies >= 3) {
    return '18 dB/octave'
  }
  return '12 dB/octave'
}

function calculateGlobalImpedance(config: Config): string {
  // Calcul de l'impédance nominale
  let impedance = config.impedance

  // Ajustements selon le nombre de voies
  if (config.nombreVoies >= 3) {
    impedance = Math.max(4, impedance - 2)
  }

  return `${impedance} Ω nominal (${impedance - 1}-${impedance + 2} Ω)`
}

function calculateAdmissiblePower(maxPower: number): string {
  const rms = Math.round(maxPower)
  const peak = Math.round(maxPower * 2)
  return `${rms}W RMS / ${peak}W crête`
}

function calculateGlobalSensitivity(config: Config, acoustic: AcousticResult): string {
  // Sensibilité de base selon le rendement calculé
  let sensitivity = acoustic.rendementBasse

  // Ajustements selon l'amplitude d'écoute
  const sensAdjust = {
    'faible': -2,
    'moyenne': 0,
    'forte': +2
  }
  sensitivity += sensAdjust[config.amplitudeEcoute as keyof typeof sensAdjust] || 0

  // Ajustements selon le nombre de voies
  sensitivity += (config.nombreVoies - 2) * 0.5

  return `${Math.round(sensitivity)} dB (1W/1m)`
} 