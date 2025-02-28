# Configurateur d'Enceintes - Documentation de Contexte AI

> **Note Importante**: Ce fichier est destiné à fournir le contexte nécessaire aux modèles d'IA pour une meilleure compréhension et assistance sur le projet. Il doit être maintenu à jour lorsque des modifications significatives sont apportées au projet, notamment :
> - Changements dans la structure du projet
> - Mises à jour des dépendances
> - Modifications des conventions
> - Ajout ou suppression de fonctionnalités majeures
> - Changements dans l'architecture ou les patterns utilisés

## Instructions pour l'IA

1. Pour chaque nouvelle demande :
   - Relire systématiquement ce fichier de contexte
   - Reformuler la demande sous forme de prompt structuré
   - Vérifier la cohérence avec l'architecture et les conventions du projet

2. Format de réponse :
   - Commencer par la reformulation structurée de la demande
   - Lister les fichiers et composants impactés
   - Proposer la solution en respectant les conventions
   - Expliquer les choix techniques si pertinent

3. Pour les modifications de code :
   - Spécifier le chemin complet du fichier
   - Inclure uniquement les parties modifiées avec contexte minimal
   - Ajouter des commentaires explicatifs si nécessaire
   - Respecter les conventions de code définies

4. En cas de doute ou d'ambiguïté :
   - Demander des clarifications
   - Proposer des alternatives en expliquant les compromis
   - Se référer aux standards du projet

## Aperçu du Projet

Ce projet est un configurateur d'enceintes acoustiques interactif développé avec Vue 3, TypeScript et TailwindCSS. L'application permet aux utilisateurs de configurer virtuellement des enceintes audio en ajustant divers paramètres et visualiser en temps réel l'impact sur la réponse en fréquence.

## Structure du Projet

L'application suit une architecture Vue 3 avec Composition API et utilise Pinia pour la gestion d'état.

### Technologies Principales
- Vue 3.3.4
- TypeScript 5.x
- Pinia 2.x (Store)
- Chart.js (Visualisation)
- TailwindCSS 3.x (Styling)
- Yarn (Gestionnaire de paquets)
- Vite (Build tool)

### Environnement de Développement
- Gestionnaire de paquets : Yarn 1.22.x
- Node.js version : 18.x LTS
- IDE recommandé : VSCode
- Extensions VSCode recommandées :
  - Volar (Vue Language Features)
  - TypeScript Vue Plugin
  - Tailwind CSS IntelliSense
  - ESLint
  - Prettier
  - GitLens

### Package.json
```json
{
  "name": "configurateur-enceintes",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "lint": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix",
    "format": "prettier --write src/"
  },
  "dependencies": {
    "vue": "^3.3.4",
    "pinia": "^2.1.7",
    "chart.js": "^4.4.0",
    "@types/chart.js": "^2.9.40",
    "tailwindcss": "^3.3.5"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.5.0",
    "@vue/eslint-config-typescript": "^12.0.0",
    "@vue/test-utils": "^2.4.1",
    "eslint": "^8.49.0",
    "eslint-plugin-vue": "^9.17.0",
    "prettier": "^3.0.3",
    "typescript": "^5.2.2",
    "vite": "^4.4.11",
    "vitest": "^0.34.6",
    "vue-tsc": "^1.8.11"
  }
}
```

### Conventions de Code
- Linting : ESLint avec configuration Vue 3 + TypeScript
- Formatting : Prettier
- Style de code :
  - Indentation : 2 espaces
  - Quotes simples pour les strings
  - Point-virgule obligatoire
  - Trailing comma sur les objets multilignes
  - Max 80 caractères par ligne
  - Nommage camelCase pour les variables/fonctions
  - Nommage PascalCase pour les composants

### Conventions de Commit
- Format : `type(scope): description`
- Types : feat, fix, docs, style, refactor, test, chore
- Exemple : `feat(configurateur): ajouter le support des enceintes 4 voies`

### Tests
- Framework : Vitest
- Types de tests :
  - Unitaires : composants et fonctions utilitaires
  - Intégration : interactions entre composants
  - E2E : à implémenter avec Cypress

### Déploiement
- Environnement de développement : `yarn dev`
- Build de production : `yarn build`
- Preview du build : `yarn preview`
- CI/CD : à définir

### Scripts Disponibles
```json
{
  "scripts": {
    "dev": "yarn dev",
    "build": "yarn build",
    "test": "yarn test"
    // Autres scripts à spécifier
  }
}
```

### Organisation des Fichiers

```
src/
├─ components/               # Composants Vue
│  ├─ ConfigurateurEnceintes.vue      # Composant principal
│  └─ configurateur/         # Sous-composants du configurateur
│     ├─ ConfigurationPanel.vue        # Panneau de paramètres
│     ├─ FrequencyResponseChart.vue    # Graphique de réponse en fréquence
│     ├─ RecommendationsPanel.vue      # Panneau de recommandations
│     └─ controls/           # Contrôles d'interface réutilisables
│        ├─ RangeInput.vue              # Input type range
│        └─ SelectInput.vue             # Input type select
├─ constants/                # Constantes de l'application
│  └─ configurateur.ts       # Valeurs par défaut, limites, etc.
├─ stores/                   # Stores Pinia
│  └─ configurateur.ts       # Gestion de l'état du configurateur
├─ types/                    # Définitions de types TypeScript
│  └─ configurateur.ts       # Interfaces, types et enums
├─ utils/                    # Fonctions utilitaires
│  └─ calculations/          # Calculs pour la simulation d'enceintes
│     ├─ acoustic.ts         # Calculs liés à l'acoustique (réverbération, etc.)
│     ├─ electronic.ts       # Calculs des paramètres électriques
│     ├─ physical.ts         # Modélisation physique de l'enceinte
│     └─ speakers.ts         # Calculs spécifiques aux haut-parleurs et filtres
└─ views/                    # Pages de l'application
   └─ ConfigurateurView.vue  # Vue principale du configurateur
```

## Fonctionnalités Principales

L'application permet de configurer les paramètres suivants:

1. **Paramètres Électriques**
   - Impédance (4Ω à 16Ω)
   - Puissance de l'amplificateur (20W à 250W)

2. **Configuration des Haut-parleurs**
   - Nombre de voies (2, 3 ou 4)
   - Fréquences de coupure

3. **Paramètres Acoustiques**
   - Amplitude d'écoute
   - Style musical dominant
   - Type d'enceinte (bibliothèque/compacte, colonne, etc.)

4. **Paramètres d'Installation**
   - Distance au mur arrière
   - Utilisation principale

5. **Paramètres Avancés** (accessibles via toggle)
   - Type de charge (clos, bass-reflex, double bass-reflex)
   - Fréquence d'accord (pour enceintes bass-reflex)
   - Facteur de qualité

## Logique de Modélisation Acoustique

La modélisation des enceintes s'appuie sur plusieurs calculs interconnectés:

### 1. Modélisation des Haut-parleurs
- Chaque voie (woofer, médium, tweeter) a sa propre courbe de réponse
- Filtres passe-bas, passe-bande et passe-haut avec pentes configurables (généralement 12dB/octave)

### 2. Influence du Type de Charge
- Charge close: pente de 12dB/octave sous la fréquence de résonance
- Bass-reflex: alignement sur la fréquence d'accord, pente de 24dB/octave sous cette fréquence
- Double bass-reflex: extension accrue dans les basses fréquences

### 3. Impact de l'Environnement
- Distance au mur: influence sur la réponse dans les basses
- Taille de la pièce: réverbération et modes

### 4. Calcul de la Réponse Globale
- Sommation complexe (amplitude et phase) des réponses individuelles
- Normalisation par rapport à la sensibilité de référence

## Visualisation

Le composant `FrequencyResponseChart.vue` utilise Chart.js pour afficher:
- La réponse en fréquence globale (courbe noire)
- Les réponses individuelles des haut-parleurs (couleurs distinctes)
- Fréquences de 10Hz à 20kHz (échelle logarithmique)
- Amplitude en dB (typiquement 70-95dB)

## Considérations pour le Développement

1. **Modularité**: Chaque aspect du calcul est isolé dans son propre fichier utilitaire
2. **Réactivité**: Les changements de paramètres doivent déclencher immédiatement un recalcul et mise à jour graphique
3. **Précision**: Les calculs doivent refléter correctement la physique des enceintes acoustiques
4. **Performance**: Optimiser les calculs pour assurer une expérience fluide
5. **Visibilité des Courbes**: Assurer que toutes les courbes sont clairement visibles avec des couleurs contrastées