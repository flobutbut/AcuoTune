export const IMPEDANCE_OPTIONS = {
  min: 4,
  max: 16,
  step: 4
}

export const PUISSANCE_OPTIONS = {
  min: 20,
  max: 250,
  step: 10
}

export const AMPLITUDE_ECOUTE_OPTIONS = [
  { value: 'faible', label: 'Faible (écoute de proximité)' },
  { value: 'moyenne', label: 'Moyenne (écoute domestique)' },
  { value: 'forte', label: 'Forte (home-cinéma, fêtes)' }
]

export const STYLE_MUSICAL_OPTIONS = [
  { value: 'neutre', label: 'Neutre / Polyvalent' },
  { value: 'hifi', label: 'Hi-Fi / Audiophile' },
  { value: 'bass', label: 'Bass heavy (Electronic, Hip-hop)' },
  { value: 'acoustique', label: 'Acoustique / Classique' }
]

export const TYPE_ENCEINTE_OPTIONS = [
  { value: 'bibliothèque', label: 'Bibliothèque / Compacte' },
  { value: 'colonne', label: 'Colonne' },
  { value: 'monitoring', label: 'Monitoring' }
]

export const BUDGET_NIVEAU_OPTIONS = [
  { value: 'économique', label: 'Économique' },
  { value: 'moyen', label: 'Moyen' },
  { value: 'élevé', label: 'Élevé' }
]

export const DISTANCE_MUR_OPTIONS = [
  { value: 'proche', label: 'Proche (< 20cm)' },
  { value: 'moyenne', label: 'Moyenne (20-40cm)' },
  { value: 'éloignée', label: 'Éloignée (> 40cm)' }
]

export const UTILISATION_OPTIONS = [
  { value: 'musique', label: 'Musique' },
  { value: 'homecinema', label: 'Home-cinéma' },
  { value: 'mixte', label: 'Mixte (Musique + Home-cinéma)' },
  { value: 'studio', label: 'Production / Mixage studio' }
]

export const TYPE_CHARGE_OPTIONS = [
  { value: 'clos', label: 'Clos' },
  { value: 'bass-reflex', label: 'Bass-reflex' },
  { value: 'double-bass-reflex', label: 'Double Bass-reflex' }
]

export const PENTE_FILTRE_OPTIONS = [
  { value: '12', label: '12 dB/octave' },
  { value: '18', label: '18 dB/octave' },
  { value: '24', label: '24 dB/octave' }
]

export const FACTEUR_QUALITE_OPTIONS = [
  { value: '0.5', label: 'Q = 0.5 (Sous-amorti)' },
  { value: '0.707', label: 'Q = 0.707 (Butterworth)' },
  { value: '1.0', label: 'Q = 1.0 (Sur-amorti)' }
] 