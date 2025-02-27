import type { Config } from '@/types/configurateur'

export const getFrequencesCoupure = (config: Config): string[] => {
  const { nombreVoies, styleMusical, showAdvanced, freqCoupureManuelle } = config
  
  // Si mode avancé et fréquences manuelles définies, les utiliser
  if (showAdvanced && freqCoupureManuelle.length > 0) {
    return freqCoupureManuelle.map(freq => `${freq} Hz`)
  }

  // Sinon, utiliser les valeurs automatiques
  const frequences = []
  switch (nombreVoies) {
    case 2:
      frequences.push(styleMusical === 'bass' ? '2500 Hz' : '3000 Hz')
      break
    case 3:
      frequences.push(
        styleMusical === 'bass' ? '400 Hz' : '500 Hz',
        styleMusical === 'bass' ? '2500 Hz' : '3000 Hz'
      )
      break
    case 4:
      frequences.push(
        styleMusical === 'bass' ? '200 Hz' : '250 Hz',
        styleMusical === 'bass' ? '800 Hz' : '1000 Hz',
        styleMusical === 'bass' ? '2500 Hz' : '3000 Hz'
      )
      break
  }
  return frequences
}

export const calculateElectronicParameters = (config: Config) => {
  const { 
    nombreVoies, 
    styleMusical, 
    budgetNiveau, 
    amplitudeEcoute, 
    puissanceAmp, 
    impedance,
    showAdvanced,
    penteFiltre 
  } = config

  // Calcul des fréquences de coupure
  const freqCoupure = getFrequencesCoupure(config)
  
  // Détermination de la pente du filtre
  let penteCalculee = '12 dB/octave'
  if (!showAdvanced) {
    // Mode automatique
    if (budgetNiveau === 'élevé' || styleMusical === 'hifi') {
      penteCalculee = '24 dB/octave'
    }
  } else {
    // Mode avancé : utiliser la pente choisie
    penteCalculee = `${penteFiltre} dB/octave`
  }

  const impedanceGlobale = `${impedance} Ω nominal`
  const puissanceAdmissible = `${Math.round(puissanceAmp * 1.5)}W RMS`
  
  // Calcul de l'efficacité en fonction de l'amplitude d'écoute
  let efficacite = '89 dB'
  if (amplitudeEcoute === 'forte') {
    efficacite = '91 dB'
  } else if (amplitudeEcoute === 'faible') {
    efficacite = '87 dB'
  }

  return {
    freqCoupure,
    penteFiltre: penteCalculee,
    impedanceGlobale,
    puissanceAdmissible,
    efficacite
  }
} 