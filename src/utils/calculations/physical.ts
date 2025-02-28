import type { Config, Dimensions } from '@/types/configurateur'
import type { PhysicalRecommendation } from '@/types/configurateur'

export const calculateVolume = (config: Config) => {
  const { typeEnceinte, puissanceAmp, styleMusical } = config

  let volume = 0
  if (typeEnceinte === 'bibliothèque') {
    volume = Math.round(puissanceAmp * 0.2)
  } else if (typeEnceinte === 'colonne') {
    volume = Math.round(puissanceAmp * 0.4)
  } else {
    volume = Math.round(puissanceAmp * 0.3)
  }

  if (styleMusical === 'bass') {
    volume = Math.round(volume * 1.3)
  } else if (styleMusical === 'acoustique') {
    volume = Math.round(volume * 0.9)
  }

  return volume
}

export const calculateVentilation = (config: Config, volume: number) => {
  const { typeCharge, showAdvanced, accordEvent } = config

  if (!typeCharge.includes('bass-reflex')) {
    return {
      ventilation: false,
      surfaceEvent: 0,
      diametreEvent: 0,
      longueurEvent: 0,
      freqAccord: 0
    }
  }

  const surfaceEvent = Math.round(volume * 0.1)
  const diametreEvent = Math.round(Math.sqrt(surfaceEvent * 4 / Math.PI))
  
  // Fréquence d'accord : utiliser la valeur manuelle en mode avancé
  const freqAccord = showAdvanced && accordEvent 
    ? accordEvent 
    : Math.round(40 + (volume * 0.05))

  // Ajustement de la longueur d'évent en fonction de la fréquence d'accord
  const longueurEvent = Math.round(
    (34000 / freqAccord) * (diametreEvent / 100) - (0.8 * diametreEvent)
  )

  return {
    ventilation: true,
    surfaceEvent,
    diametreEvent,
    longueurEvent,
    freqAccord
  }
}

export const getRecommendedMaterials = (volume: number, budgetNiveau: string) => {
  const materiaux = ['MDF 19mm']
  if (budgetNiveau === 'élevé') {
    materiaux.push('Multiplis bouleau')
  }
  if (volume > 50) {
    materiaux.push('Renforts internes')
  }
  return materiaux
}

export const calculateDimensions = (volume: number, typeEnceinte: string): Dimensions => {
  // Le volume est en litres, conversion en dm³ (même unité)
  // On utilise le ratio d'or (1.618) pour des proportions esthétiques
  const phi = 1.618

  let hauteur: number
  let largeur: number
  let profondeur: number

  if (typeEnceinte === 'bibliothèque') {
    // Pour une enceinte bibliothèque, on privilégie une forme plus compacte
    largeur = Math.cbrt(volume / phi)
    hauteur = largeur * phi
    profondeur = volume / (largeur * hauteur)
  } else if (typeEnceinte === 'colonne') {
    // Pour une colonne, on privilégie la hauteur
    largeur = Math.cbrt(volume / (phi * phi))
    hauteur = largeur * phi * phi
    profondeur = volume / (largeur * hauteur)
  } else {
    // Pour les autres types, on utilise des proportions standards
    largeur = Math.cbrt(volume / phi)
    hauteur = largeur * phi
    profondeur = volume / (largeur * hauteur)
  }

  // Arrondissons au centimètre près
  return {
    hauteur: Math.round(hauteur * 10),
    largeur: Math.round(largeur * 10),
    profondeur: Math.round(profondeur * 10)
  }
}

const getSuggestedTypeCharge = (distanceAuMur: string, styleMusical: string): string => {
  if (distanceAuMur === 'proche') {
    return 'clos'
  } else if (styleMusical === 'hifi') {
    return 'double-bass-reflex'
  }
  return 'bass-reflex'
}

export const calculatePhysicalCharacteristics = (config: Config) => {
  const volume = calculateVolume(config)
  const dimensions = calculateDimensions(volume, config.typeEnceinte)
  
  // Utiliser le type de charge suggéré sauf si en mode avancé
  const effectiveTypeCharge = config.showAdvanced 
    ? config.typeCharge 
    : getSuggestedTypeCharge(config.distanceAuMur, config.styleMusical)
  
  const ventilationParams = calculateVentilation(config, volume)
  const materiaux = getRecommendedMaterials(volume, config.budgetNiveau)

  // Calcul du facteur de qualité effectif
  const facteurQualite = config.showAdvanced 
    ? config.facteurQualite 
    : 0.707 // Valeur Butterworth par défaut

  return {
    volume,
    materiaux,
    typeCharge: effectiveTypeCharge,
    dimensions,
    facteurQualite,
    ...ventilationParams,
    suggestedTypeCharge: getSuggestedTypeCharge(config.distanceAuMur, config.styleMusical)
  }
}

export const calculatePhysical = (config: Config, acoustic: any): PhysicalRecommendation => {
  console.log('Calculating physical parameters for:', { config, acoustic })

  // Calcul des dimensions optimales
  const dimensions = calculateOptimalDimensions(acoustic.volumeOptimal, config.typeEnceinte)

  // Sélection des matériaux recommandés
  const materiaux = selectMaterials(config)

  // Calcul des spécifications d'évent si nécessaire
  const eventSpecs = config.typeCharge !== 'clos' 
    ? calculateEventSpecs(acoustic, dimensions)
    : undefined

  const result: PhysicalRecommendation = {
    dimensions,
    volume: acoustic.volumeOptimal,
    materiaux,
    typeCharge: config.typeCharge,
    ventilation: config.typeCharge !== 'clos',
    ...(eventSpecs && { eventSpecs })
  }

  console.log('Physical calculation result:', result)
  return result
}

function calculateOptimalDimensions(volume: number, typeEnceinte: string) {
  // Conversion du volume en cm³
  const volumeCm3 = volume * 1000

  // Ratios de dimensions selon le type d'enceinte
  const ratios = {
    'bibliothèque': { h: 1.6, w: 1, d: 1.25 },
    'colonne': { h: 3, w: 1, d: 1.5 },
    'monitoring': { h: 1.4, w: 1, d: 1.2 }
  }

  const ratio = ratios[typeEnceinte as keyof typeof ratios] || ratios.bibliothèque

  // Calcul de la largeur de base
  const baseWidth = Math.pow(volumeCm3 / (ratio.h * ratio.w * ratio.d), 1/3)

  return {
    hauteur: Math.round(baseWidth * ratio.h),
    largeur: Math.round(baseWidth),
    profondeur: Math.round(baseWidth * ratio.d)
  }
}

function selectMaterials(config: Config): string[] {
  const materials: string[] = []

  // Matériau principal
  if (config.budgetNiveau === 'élevé') {
    materials.push('MDF haute densité 22mm')
  } else {
    materials.push('MDF standard 19mm')
  }

  // Matériau d'amortissement
  if (config.styleMusical === 'hifi' || config.budgetNiveau === 'élevé') {
    materials.push('Laine de roche 50mm haute densité')
    materials.push('Feutre acoustique 10mm')
  } else {
    materials.push('Laine de roche 40mm')
  }

  // Renforts internes
  if (config.typeEnceinte === 'colonne' || config.budgetNiveau === 'élevé') {
    materials.push('Tasseaux de renfort 20x20mm')
  }

  return materials
}

function calculateEventSpecs(acoustic: any, dimensions: { largeur: number }) {
  // Surface de l'évent (règle empirique : 10-15% de la surface du HP grave)
  const baseSurface = dimensions.largeur * dimensions.largeur * 0.12

  // Ajustements selon le type de charge
  const surfaceMultiplier = acoustic.volumeOptimal > 50 ? 1.2 : 1

  const surface = Math.round(baseSurface * surfaceMultiplier)
  const diametre = Math.round(Math.sqrt(surface * 4 / Math.PI))
  
  // Longueur de l'évent selon la formule de Thiele & Small simplifiée
  const longueur = Math.round(
    (23562 * surface) / 
    (acoustic.frequenceAccord * acoustic.frequenceAccord * diametre)
  )

  return {
    surface,          // cm²
    diametre,         // cm
    longueur,         // cm
    frequence: acoustic.frequenceAccord
  }
} 