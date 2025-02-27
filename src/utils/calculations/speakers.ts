import type { HautParleur } from '@/types/configurateur'

export const getHautParleurs = (nombreVoies: number, styleMusical: string): HautParleur[] => {
  const hautParleurs: HautParleur[] = []

  hautParleurs.push({
    type: 'Woofer',
    technologie: 'Membrane polypropylène',
    impedance: '8 Ω',
    puissance: '100W RMS',
    sensibilite: '89 dB',
    resonance: '35 Hz'
  })

  if (nombreVoies >= 2) {
    hautParleurs.push({
      type: 'Tweeter',
      technologie: 'Dôme soie',
      impedance: '8 Ω',
      puissance: '50W RMS',
      sensibilite: '91 dB',
      resonance: '1.2 kHz'
    })
  }

  if (nombreVoies >= 3) {
    hautParleurs.push({
      type: 'Médium',
      technologie: 'Membrane polypropylène',
      impedance: '8 Ω',
      puissance: '80W RMS',
      sensibilite: '90 dB',
      resonance: '400 Hz'
    })
  }

  if (nombreVoies === 4) {
    hautParleurs.push({
      type: 'Super-Tweeter',
      technologie: 'Dôme titane',
      impedance: '8 Ω',
      puissance: '30W RMS',
      sensibilite: '92 dB',
      resonance: '2.5 kHz'
    })
  }

  return hautParleurs
} 