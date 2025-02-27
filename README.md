# AcuoTune

## Description

AcuoTune est un configurateur d'enceintes acoustiques qui permet aux utilisateurs de concevoir et de simuler des systèmes audio avec une précision professionnelle. Cette application web offre une simulation en temps réel de la réponse en fréquence, permettant aux audiophiles et aux ingénieurs du son de visualiser et d'optimiser les performances acoustiques de leurs enceintes avant même de les construire.

Grâce à une interface intuitive et des outils de visualisation avancés, AcuoTune simplifie le processus complexe de conception d'enceintes acoustiques en fournissant des retours immédiats sur les choix de configuration et des recommandations techniques personnalisées.

## Fonctionnalités principales

- **Simulation en temps réel** de la réponse en fréquence des enceintes
- **Configuration multi-voies** supportant de 2 à 4 voies pour des systèmes audio avancés
- **Types de charges multiples** : clos, bass-reflex, double bass-reflex
- **Paramètres acoustiques avancés** :
  - Facteur de qualité (Q)
  - Fréquence d'accord
  - Pentes de filtrage ajustables
- **Visualisation détaillée** des courbes de réponse avec Chart.js
- **Recommandations techniques** basées sur les configurations choisies

## Installation

### Prérequis

- Node.js 18 ou supérieur
- Yarn

### Étapes d'installation

```bash
# Cloner le dépôt
git clone https://github.com/votre-username/acuotune.git
cd acuotune

# Installer les dépendances
yarn install

# Lancer le serveur de développement
yarn dev
```

## Scripts disponibles

```bash
# Démarrer le serveur de développement
yarn dev

# Compiler pour la production
yarn build

# Prévisualiser la version de production
yarn preview

# Lancer les tests
yarn test

# Vérifier le formatage et la qualité du code
yarn lint

# Formater le code automatiquement
yarn format
```

## Structure du projet

```
src/
├─ components/        # Composants Vue réutilisables
│  ├─ audio/          # Composants spécifiques à l'audio
│  ├─ charts/         # Composants de visualisation
│  ├─ config/         # Composants de configuration
│  └─ ui/             # Composants d'interface utilisateur
├─ constants/         # Constantes et configurations
├─ stores/            # Store Pinia pour la gestion d'état
├─ types/             # Définitions de types TypeScript
├─ utils/             # Utilitaires et fonctions de calcul acoustique
└─ views/             # Pages principales de l'application
```

## Technologies

AcuoTune est construit avec des technologies modernes pour garantir performance, maintenabilité et expérience utilisateur optimale :

- **Vue 3.3** - Framework JavaScript progressif
- **TypeScript 5.2** - Superset JavaScript typé
- **Tailwind CSS 3.4** - Framework CSS utilitaire
- **Chart.js 4.4** - Bibliothèque de visualisation de données
- **Pinia 2.1** - Solution de gestion d'état pour Vue
- **Vite 6.2** - Outil de build ultrarapide

## Contribution

Les contributions à AcuoTune sont les bienvenues ! Voici comment vous pouvez contribuer :

1. Forkez le projet
2. Créez votre branche de fonctionnalité (`git checkout -b feature/amazing-feature`)
3. Committez vos changements (`git commit -m 'Add some amazing feature'`)
4. Poussez vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

Veuillez vous assurer de mettre à jour les tests le cas échéant et de respecter les conventions de code du projet.

## License

AcuoTune est distribué sous la licence MIT. Voir le fichier `LICENSE` pour plus d'informations.

```
MIT License

Copyright (c) 2025 AcuoTune

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```