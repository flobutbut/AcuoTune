import { defineStore } from 'pinia'
import type { Config, Recommandations } from '@/types/configurateur'
import { calculatePhysicalCharacteristics } from '@/utils/calculations/physical'
import { calculateElectronicParameters } from '@/utils/calculations/electronic'
import { getHautParleurs } from '@/utils/calculations/speakers'

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

export const useConfigurateurStore = defineStore('configurateur', {
  state: () => ({
    config: {
      impedance: 8,
      puissanceAmp: 100,
      nombreVoies: 2,
      amplitudeEcoute: 'moyenne',
      styleMusical: 'neutre',
      typeEnceinte: 'bibliothèque',
      budgetNiveau: 'moyen',
      distanceAuMur: 'moyenne',
      utilisationPrincipale: 'musique',
      showAdvanced: false,
      typeCharge: 'bass-reflex',
      penteFiltre: '12',
      freqCoupureManuelle: [3000],
      accordEvent: 40,
      facteurQualite: 0.707
    } as Config,
    recommandations: {
      volume: 0,
      materiaux: [],
      typeCharge: '',
      ventilation: false,
      surfaceEvent: 0,
      diametreEvent: 0,
      longueurEvent: 0,
      freqAccord: 0,
      dimensions: {
        hauteur: 0,
        largeur: 0,
        profondeur: 0
      },
      impedanceGlobale: '',
      puissanceAdmissible: '',
      freqCoupure: [],
      penteFiltre: '',
      efficacite: '',
      hautParleurs: [],
      facteurQualite: 0.707
    } as Recommandations
  }),

  actions: {
    updateConfig(newConfig: Partial<Config>) {
      if (newConfig.nombreVoies !== undefined && newConfig.nombreVoies !== this.config.nombreVoies) {
        const defaultFreqs = {
          2: [3000],
          3: [500, 3000],
          4: [250, 1000, 3000]
        }
        this.config.freqCoupureManuelle = defaultFreqs[newConfig.nombreVoies as keyof typeof defaultFreqs]
      }

      this.config = { ...this.config, ...newConfig }
      this.calculateRecommandations()
    },

    calculateRecommandations() {
      const physical = calculatePhysicalCharacteristics(this.config)
      const electronic = calculateElectronicParameters(this.config)
      const hautParleurs = getHautParleurs(this.config.nombreVoies, this.config.styleMusical)

      this.recommandations = {
        ...this.recommandations,
        ...physical,
        ...electronic,
        hautParleurs
      }
    }
  }
}) 