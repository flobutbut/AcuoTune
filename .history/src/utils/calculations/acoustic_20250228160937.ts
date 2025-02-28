import type { Config } from '@/types/configurateur'

interface AcousticParams {
  // Paramètres de base
  impedance: number
  puissanceAmp: number
  nombreVoies: number
  amplitudeEcoute: string
  styleMusical: string
  typeEnceinte: string
  utilisationPrincipale: string
  
  // Paramètres avancés
  typeCharge: string
  penteFiltre: number
  freqCoupure: number[]
  accordEvent: number
  facteurQualite: number
}

interface AcousticResult {
  volumeOptimal: number      // Volume optimal en litres
  frequenceAccord: number    // Fréquence d'accord en Hz
  facteurQualite: number    // Facteur de qualité calculé
  frequenceResonance: number // Fréquence de résonance en Hz
  rendementBasse: number     // Rendement dans les basses en dB
  puissanceMax: number       // Puissance maximale admissible en W
}

interface AcousticParameters {
  volumeOptimal: number
  frequenceAccord: number
  facteurQualite: number
  frequenceResonance: number
  rendementBasse: number
  puissanceMax: number
  freqCoupure: string[]
}

export class AcousticCalculator {
  private readonly REFERENCE_LEVEL = 89 // Niveau de référence en dB
  
  constructor(private params: AcousticParams) {}

  private calculateDampingFactor(): number {
    // Facteur d'amortissement basé sur l'impédance
    return 8 / this.params.impedance
  }

  private calculatePowerResponse(): number {
    // Correction du niveau selon la puissance
    return Math.min(3, Math.log10(this.params.puissanceAmp / 100) * 3)
  }

  private calculateAmplitudeCorrection(f: number): number {
    // Courbes de Fletcher-Munson simplifiées
    const corrections = {
      'faible': {
        bass: -6,
        treble: -3,
        transition: 0.7
      },
      'moyenne': {
        bass: -3,
        treble: -1,
        transition: 0.85
      },
      'forte': {
        bass: 0,
        treble: 0,
        transition: 1
      }
    }

    const correction = corrections[this.params.amplitudeEcoute as keyof typeof corrections]
    const bassWeight = Math.min(1, Math.pow(f / 1000, 0.5))
    return correction.bass * (1 - bassWeight) + correction.treble * bassWeight
  }

  private calculateStyleCorrection(f: number): number {
    const styleCorrections = {
      'neutre': 0,
      'hifi': f < 100 ? -2 : f > 5000 ? 1 : 0,
      'bass': f < 200 ? 3 : f > 2000 ? -1 : 0,
      'acoustique': f < 100 ? -3 : f > 3000 ? 2 : 0
    }
    return styleCorrections[this.params.styleMusical as keyof typeof styleCorrections] || 0
  }

  private calculateEnclosureResponse(f: number): number {
    const enclosureTypes = {
      'bibliothèque': {
        lowFreqLimit: 45,
        highFreqBoost: 0
      },
      'colonne': {
        lowFreqLimit: 35,
        highFreqBoost: -1
      },
      'monitoring': {
        lowFreqLimit: 40,
        highFreqBoost: 1
      }
    }

    const enclosure = enclosureTypes[this.params.typeEnceinte as keyof typeof enclosureTypes]
    const lowFreqRolloff = f < enclosure.lowFreqLimit ? 
      -12 * Math.log2(enclosure.lowFreqLimit / f) : 0
    
    return lowFreqRolloff + enclosure.highFreqBoost
  }

  private calculateLoadResponse(f: number): number {
    const fb = this.params.accordEvent
    const q = this.params.facteurQualite
    
    switch(this.params.typeCharge) {
      case 'clos':
        // Réponse close avec Q
        return 20 * Math.log10(
          Math.pow(f/fb, 2) / Math.sqrt(
            Math.pow(1 - Math.pow(f/fb, 2), 2) + 
            Math.pow(f/(fb * q), 2)
          )
        )
      
      case 'bass-reflex':
        // Réponse bass-reflex avec Q
        const w = f/fb
        return 20 * Math.log10(
          Math.pow(w, 4) / Math.sqrt(
            Math.pow(Math.pow(w, 4) - 1, 2) + 
            Math.pow(w * w/q, 2)
          )
        )
      
      case 'double-bass-reflex':
        // Double bass-reflex avec deux accords
        const w1 = f/fb
        const w2 = f/(fb * 1.2)
        const resp1 = this.calculateLoadResponse(f)
        const resp2 = 20 * Math.log10(
          Math.pow(w2, 4) / Math.sqrt(
            Math.pow(Math.pow(w2, 4) - 1, 2) + 
            Math.pow(w2 * w2/q, 2)
          )
        )
        return 10 * Math.log10(Math.pow(10, resp1/10) + Math.pow(10, resp2/10))
      
      default:
        return 0
    }
  }

  private calculateCrossoverResponse(f: number, voieIndex: number): number {
    const slope = this.params.penteFiltre / 6 // Conversion en ordre du filtre
    const freqs = this.params.freqCoupure
    let response = 0

    // Fonction de transfert du filtre avec phase
    const filterResponse = (f: number, fc: number, isHighPass: boolean): number => {
      const w = f / fc
      const order = slope
      
      if (isHighPass) {
        // Filtre passe-haut avec résonance
        return 20 * Math.log10(
          Math.pow(w, 2 * order) /
          Math.sqrt(
            Math.pow(1 + Math.pow(w, 2 * order), 2)
          )
        )
      } else {
        // Filtre passe-bas avec résonance
        return 20 * Math.log10(
          1 /
          Math.sqrt(
            Math.pow(1 + Math.pow(w, 2 * order), 2)
          )
        )
      }
    }

    // Application des filtres selon la voie
    if (voieIndex === 0) {
      // Woofer : passe-bas
      response += filterResponse(f, freqs[0], false)
    } else if (voieIndex === this.params.nombreVoies - 1) {
      // Tweeter : passe-haut
      response += filterResponse(f, freqs[freqs.length - 1], true)
    } else {
      // Voies médium : passe-bande
      response += filterResponse(f, freqs[voieIndex - 1], true)
      response += filterResponse(f, freqs[voieIndex], false)
    }

    // Ajout d'une légère résonance à la fréquence de coupure
    const q = 0.707 // Facteur Q du filtre
    for (const fc of freqs) {
      if (Math.abs(Math.log2(f/fc)) < 1) {
        response += q * Math.exp(-Math.pow(Math.log2(f/fc), 2)) * 0.5
      }
    }

    return response
  }

  public calculateSystemResponse(f: number): {
    individual: number[];
    global: number;
  } {
    // Calcul des corrections globales
    const dampingCorrection = this.calculateDampingFactor()
    const powerCorrection = this.calculatePowerResponse()
    const amplitudeCorrection = this.calculateAmplitudeCorrection(f)
    const styleCorrection = this.calculateStyleCorrection(f)
    const enclosureResponse = this.calculateEnclosureResponse(f)
    
    // Réponses individuelles des voies
    const individual = Array(this.params.nombreVoies).fill(0).map((_, index) => {
      let response = this.REFERENCE_LEVEL

      // Applique les corrections globales
      response += powerCorrection
      response += amplitudeCorrection
      response += styleCorrection
      response += enclosureResponse

      // Applique la réponse du type de charge (uniquement pour le woofer)
      if (index === 0 && f < 500) {
        response += this.calculateLoadResponse(f)
      }

      // Applique les filtres
      response += this.calculateCrossoverResponse(f, index)

      return Math.max(70, Math.min(95, response))
    })

    // Calcul de la réponse globale
    const global = 10 * Math.log10(
      individual.reduce((sum, resp) => sum + Math.pow(10, resp/10), 0)
    )

    return {
      individual,
      global: Math.max(70, Math.min(95, global))
    }
  }
}

export function calculateAcoustic(config: Config, electronicParams?: ElectronicParams) {
  console.log('Calculating acoustic parameters for:', config)

  // Récupération du facteur de qualité depuis la config
  const facteurQ = parseFloat(config.facteurQualite.toString())
  
  // Utilisation du facteur Q dans les calculs
  let volumeOptimal = calculateBaseVolume(config)
  
  // Ajustement du volume en fonction du facteur Q
  if (facteurQ <= 0.6) {
    // Pour un son plus neutre, on réduit légèrement le volume
    volumeOptimal *= 0.9
  } else if (facteurQ >= 0.9) {
    // Pour plus d'impact, on augmente légèrement le volume
    volumeOptimal *= 1.2
  }

  // Ajustement de la fréquence de résonance en fonction du facteur Q
  const frequenceResonance = calculateResonanceFrequency(config)
  const frequenceResonanceAjustee = facteurQ >= 0.9 
    ? frequenceResonance * 0.9  // Plus bas pour plus d'impact
    : facteurQ <= 0.6 
      ? frequenceResonance * 1.1  // Plus haut pour plus de neutralité
      : frequenceResonance

  const result = {
    volumeOptimal,
    frequenceAccord: config.typeCharge === 'clos' ? 0 : frequenceResonanceAjustee,
    facteurQualite: facteurQ,
    frequenceResonance: frequenceResonanceAjustee,
    rendementBasse: calculateBassSensitivity(config),
    puissanceMax: calculateMaxPower(config),
    freqCoupure: electronicParams?.frequencesCoupure || []
  }

  console.log('Acoustic calculation result:', result)
  return result
}

function calculateOptimalVolume(config: Config): number {
  // Volume de base selon la puissance
  let volume = config.puissanceAmp * 0.3 // 0.3L par watt comme base

  // Ajustements selon le type d'enceinte
  const volumeMultipliers: Record<string, number> = {
    'bibliothèque': 0.8,
    'colonne': 1.2,
    'monitoring': 1.0
  }
  volume *= volumeMultipliers[config.typeEnceinte] || 1

  // Ajustements selon le type de charge
  if (config.typeCharge === 'bass-reflex') {
    volume *= 1.4
  } else if (config.typeCharge === 'double-bass-reflex') {
    volume *= 1.8
  }

  return Math.round(volume)
}

function calculateDefaultAccordFrequency(config: Config): number {
  // Fréquence d'accord par défaut
  const baseFreq = config.typeEnceinte === 'bibliothèque' ? 50 : 40

  // Ajustements selon le style musical
  const freqMultipliers: Record<string, number> = {
    'bass': 0.9,
    'hifi': 1.1,
    'neutre': 1.0
  }

  return Math.round(baseFreq * (freqMultipliers[config.styleMusical] || 1))
}

function calculateResonanceFrequency(config: Config): number {
  // Fréquence de résonance de base
  const baseFreq = config.typeCharge === 'clos' ? 45 : 35

  // Ajustements selon le type d'enceinte
  return Math.round(baseFreq * (config.typeEnceinte === 'bibliothèque' ? 1.2 : 1.0))
}

function calculateBassEfficiency(volume: number): number {
  // Rendement selon le volume
  return Math.round((85 + Math.log10(volume) * 3) * 10) / 10
}

function calculateMaxPower(config: Config): number {
  // Puissance maximale selon la configuration
  let power = config.puissanceAmp * 1.5

  // Ajustements selon l'amplitude d'écoute
  const powerMultipliers: Record<string, number> = {
    'faible': 1.2,
    'moyenne': 1.5,
    'forte': 1.8
  }

  return Math.round(power * (powerMultipliers[config.amplitudeEcoute] || 1.5))
}

function calculateCrossoverFrequencies(config: Config): string[] {
  if (config.showAdvanced) {
    return config.freqCoupureManuelle.map(f => `${f} Hz`)
  }

  const freqs: number[] = []
  switch (config.nombreVoies) {
    case 2:
      freqs.push(config.styleMusical === 'bass' ? 2500 : 3000)
      break
    case 3:
      freqs.push(
        config.styleMusical === 'bass' ? 400 : 500,
        config.styleMusical === 'bass' ? 2500 : 3000
      )
      break
    case 4:
      freqs.push(
        config.styleMusical === 'bass' ? 200 : 250,
        config.styleMusical === 'bass' ? 800 : 1000,
        config.styleMusical === 'bass' ? 2500 : 3000
      )
      break
  }
  return freqs.map(f => `${f} Hz`)
} 