import { defineStore } from 'pinia'
import type { 
  Config, 
  Recommendations, 
  PhysicalRecommendation,
  ElectronicRecommendation,
  HautParleur 
} from '@/types/configurateur'
import { calculateAcoustic } from '@/utils/calculations/acoustic'
import { calculateElectronic } from '@/utils/calculations/electronic'
import { calculatePhysical } from '@/utils/calculations/physical'
import { calculateSpeakers } from '@/utils/calculations/speakers'

const getTweeterTechnologie = (styleMusical: string, budgetNiveau: string): string => {
  if (styleMusical === 'hifi' || budgetNiveau === 'élevé') {
    return 'Dôme en soie de haute qualité avec chambre arrière amortie'
  }
  return 'Dôme en soie standard'
}

const getFrequencesCoupure = (nombreVoies: number, styleMusical: string): string[] => {
  const frequences = []
  
  switch (nombreVoies) {
    case 2:
      frequences.push(styleMusical === 'bass' ? '2.5 kHz' : '3 kHz')
      break
    case 3:
      frequences.push(
        styleMusical === 'bass' ? '400 Hz' : '500 Hz',
        styleMusical === 'bass' ? '2.5 kHz' : '3 kHz'
      )
      break
    case 4:
      frequences.push(
        styleMusical === 'bass' ? '200 Hz' : '250 Hz',
        styleMusical === 'bass' ? '800 Hz' : '1 kHz',
        styleMusical === 'bass' ? '2.5 kHz' : '3 kHz'
      )
      break
  }
  
  return frequences
}

// État initial par défaut
const defaultConfig: Config = {
  // Paramètres de base
  nombreVoies: 2,
  typeCharge: 'bass-reflex',
  puissanceAmp: 100,
  impedance: 8,
  
  // Paramètres d'utilisation
  styleMusical: 'neutre',
  amplitudeEcoute: 'moyenne',
  typeEnceinte: 'bibliothèque',
  utilisationPrincipale: 'musique',
  
  // Paramètres avancés
  showAdvanced: false,
  facteurQualite: 0.707,
  freqCoupureManuelle: [3000]
}

// Recommandations par défaut
const defaultRecommendations: Recommendations = {
  physique: {
    dimensions: { hauteur: 0, largeur: 0, profondeur: 0 },
    volume: 0,
    materiaux: [],
    typeCharge: 'bass-reflex',
    ventilation: false
  },
  electronique: {
    puissanceAdmissible: '',
    impedanceGlobale: '',
    sensibilite: '',
    frequencesCoupure: [],
    penteFiltre: ''
  },
  hautParleurs: [],
  freqCoupure: []
}

export const useConfigurateurStore = defineStore('configurateur', {
  state: () => ({
    config: { ...defaultConfig },
    recommandations: { ...defaultRecommendations }
  }),

  actions: {
    // Met à jour la configuration et déclenche le recalcul
    updateConfig(newConfig: Partial<Config>) {
      console.log('Updating config:', newConfig)

      // Gestion spéciale du nombre de voies
      if (newConfig.nombreVoies && newConfig.nombreVoies !== this.config.nombreVoies) {
        this._updateFrequencesCoupure(newConfig.nombreVoies)
      }

      // Mise à jour de la configuration
      this.config = {
        ...this.config,
        ...newConfig
      }

      // Déclenche le recalcul des recommandations
      this.calculateRecommendations()
    },

    // Méthodes internes (préfixées avec _)
    _updateFrequencesCoupure(nombreVoies: number) {
      const defaultFreqs = {
        2: [3000],
        3: [500, 3000],
        4: [250, 1000, 3000]
      }
      this.config.freqCoupureManuelle = defaultFreqs[nombreVoies as keyof typeof defaultFreqs]
    },

    calculateRecommendations() {
      console.log('Calculating recommendations with config:', this.config)

      try {
        // Calculs acoustiques
        const acoustic = calculateAcoustic(this.config)
        console.log('Acoustic calculations:', acoustic)

        // Mise à jour temporaire des recommandations
        this.recommandations = {
          physique: {
            dimensions: {
              hauteur: Math.round(Math.pow(acoustic.volumeOptimal * 1000, 1/3) * 1.6),
              largeur: Math.round(Math.pow(acoustic.volumeOptimal * 1000, 1/3)),
              profondeur: Math.round(Math.pow(acoustic.volumeOptimal * 1000, 1/3) * 1.25)
            },
            volume: acoustic.volumeOptimal,
            materiaux: ['MDF 19mm', 'Laine de roche 50mm'],
            typeCharge: this.config.typeCharge,
            ventilation: this.config.typeCharge !== 'clos',
            eventSpecs: this.config.typeCharge !== 'clos' ? {
              surface: 50,
              diametre: 8,
              longueur: 15,
              frequence: acoustic.frequenceAccord
            } : undefined
          },
          electronique: {
            puissanceAdmissible: `${acoustic.puissanceMax}W RMS`,
            impedanceGlobale: `${this.config.impedance}Ω nominal`,
            sensibilite: `${acoustic.rendementBasse} dB`,
            frequencesCoupure: acoustic.freqCoupure,
            penteFiltre: `${this.config.penteFiltre || '12'} dB/octave`
          },
          hautParleurs: [],
          freqCoupure: acoustic.freqCoupure
        }

        console.log('Updated recommendations:', this.recommandations)
      } catch (error) {
        console.error('Error calculating recommendations:', error)
      }
    },

    _calculateAcousticParameters() {
      return calculateAcoustic(this.config)
    },

    _calculatePhysicalParameters(acoustic: any) {
      // TODO: Implémenter dans physical.ts
      return this.recommandations.physique
    },

    _calculateElectronicParameters(acoustic: any) {
      // TODO: Implémenter dans electronic.ts
      return this.recommandations.electronique
    },

    _calculateSpeakerParameters(acoustic: any) {
      // TODO: Implémenter dans speakers.ts
      return this.recommandations.hautParleurs
    }
  }
}) 