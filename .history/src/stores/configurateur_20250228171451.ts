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
import { calculateAutoTypeCharge, calculateAutoFacteurQualite } from '@/utils/calculations/acoustic'

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
  // Valeurs par défaut
  nombreVoies: '2',
  puissanceAmp: 100,
  impedance: 8,
  amplitudeEcoute: 'moyenne',
  styleMusical: 'neutre',
  typeEnceinte: 'bibliothèque',
  distanceAuMur: 'moyenne',
  utilisationPrincipale: 'musique',
  budgetNiveau: 'moyen',
  typeCharge: 'bass-reflex',
  showAdvanced: false,
  // Valeurs avancées
  penteFiltre: 12,
  freqCoupureManuelle: [],
  accordEvent: 0,
  facteurQualite: 0.707
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
    config: {
      impedance: 8,
      puissanceAmp: 100,
      nombreVoies: 2,
      amplitudeEcoute: 'moyenne',
      styleMusical: 'acoustique',
      typeEnceinte: 'bibliothèque',
      budgetNiveau: 'moyen',
      distanceAuMur: 'moyenne',
      utilisationPrincipale: 'musique',
      typeCharge: 'bass-reflex',
      facteurQualite: 0.707,
      showAdvanced: false,
      accordEvent: 50,
      freqCoupureManuelle: [500, 5000]
    } as Config
  }),

  actions: {
    updateConfig(update: Partial<Config>) {
      // Si on active/désactive les paramètres avancés
      if ('showAdvanced' in update) {
        this.config.showAdvanced = update.showAdvanced
        return
      }

      // Si les paramètres avancés sont désactivés, on calcule automatiquement
      if (!this.config.showAdvanced) {
        // On met à jour d'abord les paramètres standards
        this.config = {
          ...this.config,
          ...update
        }

        // Puis on recalcule automatiquement les paramètres avancés
        this.config.typeCharge = calculateAutoTypeCharge(this.config)
        this.config.facteurQualite = calculateAutoFacteurQualite(this.config)
      } else {
        // En mode avancé, on met à jour directement les valeurs
        this.config = {
          ...this.config,
          ...update
        }
      }
    },

    resetConfig() {
      this.config = { ...defaultConfig }
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