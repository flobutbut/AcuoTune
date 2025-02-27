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