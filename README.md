# AcuoTune

Un outil interactif de simulation et configuration d'enceintes acoustiques développé avec Vue 3 et TypeScript.

## Fonctionnalités

- Configuration interactive des paramètres d'enceintes
- Simulation en temps réel de la réponse en fréquence
- Support multi-voies (2-4 voies)
- Différents types de charges (clos, bass-reflex, double bass-reflex)
- Visualisation des courbes de réponse individuelles et globale
- Paramètres avancés (Q, fréquence d'accord, pentes de filtrage)

## Technologies utilisées

- Vue 3
- TypeScript
- Chart.js
- Pinia
- Tailwind CSS

## Installation

1. Cloner le repository
2. Installer les dépendances
3. Lancer le serveur de développement

```bash
npm install
npm run dev
```

## Structure du projet

    src/
    ├── utils/
    │ ├── calculations/
    │ │ ├── acoustic.ts
    │ │ └── crossover.ts
    │ └── filters.ts
    └── components/

## Contribution

1. Forker le repository
2. Créer une branche
3. Faire un commit et un push
4. Créer une pull request

## Licence

[MIT](https://opensource.org/licenses/MIT)
