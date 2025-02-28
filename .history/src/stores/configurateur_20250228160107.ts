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
  // Valeurs par défaut
  nombreVoies: '2',
  puissanceAmp: 100,
  impedance: 8,
  amplitudeEcoute: 'moyenne',
  styleMusical: 'acoustique',
  typeEnceinte: 'bibliothèque',
  distanceAuMur: 'moyenne',
  utilisationPrincipale: 'musique',
  budgetNiveau: 'moyen',
  typeCharge: 'bass-reflex',
  showAdvanced: false,
  // Valeurs avancées
  penteFiltre: 12,
  freqCoupureManuelle: [500, 5000],
  accordEvent: 50,
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
      showAdvanced: false,
      typeCharge: 'bass-reflex',
      accordEvent: 50,
      facteurQualite: 0.707, // Valeur par défaut Butterworth
      freqCoupureManuelle: [500, 5000]
    } as Config
  }),

  actions: {
    updateConfig(update: Partial<Config>) {
      this.config = {
        ...this.config,
        ...update
      }

      // Si on change le type de charge, on ajuste la fréquence d'accord
      if (update.typeCharge) {
        const baseFreq = this.config.typeEnceinte === 'bibliothèque' ? 50 : 40
        this.config.accordEvent = update.typeCharge === 'double-bass-reflex' 
          ? Math.round(baseFreq * 0.8) 
          : baseFreq
      }

      // Si on change le facteur de qualité, on ajuste les recommandations
      if (update.facteurQualite) {
        // Mise à jour des fréquences de coupure en fonction du facteur de qualité
        const q = parseFloat(update.facteurQualite.toString())
        if (q <= 0.6) {
          // Pour un son plus neutre, on augmente légèrement les fréquences de coupure
          this.config.freqCoupureManuelle = [600, 5500]
        } else if (q >= 0.9) {
          // Pour plus d'impact, on baisse légèrement les fréquences de coupure
          this.config.freqCoupureManuelle = [400, 4500]
        } else {
          // Valeurs standard pour Butterworth
          this.config.freqCoupureManuelle = [500, 5000]
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