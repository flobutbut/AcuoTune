<script setup lang="ts">
import { useConfigurateurStore } from '@/stores/configurateur'
import { storeToRefs } from 'pinia'
import RangeInput from './controls/RangeInput.vue'
import SelectInput from './controls/SelectInput.vue'
import {
  IMPEDANCE_OPTIONS,
  PUISSANCE_OPTIONS,
  AMPLITUDE_ECOUTE_OPTIONS,
  STYLE_MUSICAL_OPTIONS,
  TYPE_ENCEINTE_OPTIONS,
  BUDGET_NIVEAU_OPTIONS,
  DISTANCE_MUR_OPTIONS,
  UTILISATION_OPTIONS,
  TYPE_CHARGE_OPTIONS,
  PENTE_FILTRE_OPTIONS,
  FACTEUR_QUALITE_OPTIONS
} from '@/constants/configurateur'

const store = useConfigurateurStore()
const { config } = storeToRefs(store)

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement | HTMLSelectElement
  const { name, value } = target
  
  store.updateConfig({
    [name]: ['impedance', 'puissanceAmp', 'nombreVoies'].includes(name)
      ? parseInt(value, 10)
      : value
  })
}

const handleVoiesClick = (voies: number) => {
  store.updateConfig({ nombreVoies: voies })
}

const getTypeChargeDescription = (type: string) => {
  switch (type) {
    case 'clos':
      return 'Meilleur contrôle des basses, idéal près des murs'
    case 'bass-reflex':
      return 'Plus de rendement dans les basses, nécessite plus d\'espace'
    case 'double-bass-reflex':
      return 'Extension maximale des basses, pour les audiophiles'
    default:
      return ''
  }
}

const handleFreqCoupureChange = (event: Event, index: number) => {
  const value = (event.target as HTMLInputElement).value
  const newFreqs = [...config.value.freqCoupureManuelle]
  newFreqs[index] = parseInt(value)
  store.updateConfig({ freqCoupureManuelle: newFreqs })
}
</script>

<template>
  <div class="p-6 space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-gray-900">Paramètres de l'enceinte</h2>
      <p class="mt-1 text-sm text-gray-500">
        Configurez les caractéristiques techniques de votre enceinte
      </p>
    </div>

    <div class="space-y-6">
      <!-- Impédance -->
      <RangeInput
        label="Impédance de sortie"
        name="impedance"
        :value="config.impedance"
        :min="IMPEDANCE_OPTIONS.min"
        :max="IMPEDANCE_OPTIONS.max"
        :step="IMPEDANCE_OPTIONS.step"
        unit="Ω"
        @update="handleChange"
      />

      <!-- Puissance de l'amplificateur -->
      <RangeInput
        label="Puissance de l'amplificateur"
        name="puissanceAmp"
        :value="config.puissanceAmp"
        :min="PUISSANCE_OPTIONS.min"
        :max="PUISSANCE_OPTIONS.max"
        :step="PUISSANCE_OPTIONS.step"
        unit="W"
        @update="handleChange"
      />

      <!-- Nombre de voies -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          Nombre de voies
        </label>
        <div class="flex gap-3">
          <button
            v-for="num in [1, 2, 3, 4]"
            :key="num"
            @click="handleVoiesClick(num)"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2',
              config.nombreVoies === num
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500'
                : 'bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500'
            ]"
          >
            {{ num }}
          </button>
        </div>
      </div>

      <!-- Amplitude d'écoute -->
      <SelectInput
        label="Amplitude d'écoute"
        name="amplitudeEcoute"
        :value="config.amplitudeEcoute"
        :options="AMPLITUDE_ECOUTE_OPTIONS"
        @update="handleChange"
      />

      <!-- Style musical -->
      <SelectInput
        label="Style musical dominant"
        name="styleMusical"
        :value="config.styleMusical"
        :options="STYLE_MUSICAL_OPTIONS"
        @update="handleChange"
      />

      <!-- Type d'enceinte -->
      <SelectInput
        label="Type d'enceinte"
        name="typeEnceinte"
        :value="config.typeEnceinte"
        :options="TYPE_ENCEINTE_OPTIONS"
        @update="handleChange"
      />

      <!-- Budget -->
      <SelectInput
        label="Niveau de budget"
        name="budgetNiveau"
        :value="config.budgetNiveau"
        :options="BUDGET_NIVEAU_OPTIONS"
        @update="handleChange"
      />

      <!-- Distance au mur -->
      <SelectInput
        label="Distance au mur arrière"
        name="distanceAuMur"
        :value="config.distanceAuMur"
        :options="DISTANCE_MUR_OPTIONS"
        @update="handleChange"
      />

      <!-- Utilisation principale -->
      <SelectInput
        label="Utilisation principale"
        name="utilisationPrincipale"
        :value="config.utilisationPrincipale"
        :options="UTILISATION_OPTIONS"
        @update="handleChange"
      />

      <!-- Mode avancé toggle -->
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-gray-700">Mode avancé</span>
        <button
          type="button"
          :class="[
            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2',
            config.showAdvanced ? 'bg-indigo-600' : 'bg-gray-200'
          ]"
          @click="handleChange({ target: { name: 'showAdvanced', value: !config.showAdvanced } })"
        >
          <span
            :class="[
              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
              config.showAdvanced ? 'translate-x-5' : 'translate-x-0'
            ]"
          />
        </button>
      </div>

      <!-- Paramètres avancés -->
      <div v-if="config.showAdvanced" class="space-y-6">
        <!-- Type de charge -->
        <div class="space-y-2">
          <h3 class="text-sm font-medium text-gray-700">Type de charge (Avancé)</h3>
          <div class="flex gap-2">
            <button
              v-for="option in TYPE_CHARGE_OPTIONS"
              :key="option.value"
              :class="[
                'px-4 py-2 text-sm font-medium rounded-md',
                config.typeCharge === option.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              ]"
              @click="handleChange({ target: { name: 'typeCharge', value: option.value } })"
            >
              {{ option.label }}
            </button>
          </div>
          <p class="text-sm text-gray-500">
            {{ getTypeChargeDescription(config.typeCharge) }}
          </p>
          <div class="mt-2 text-sm text-amber-600">
            <p>⚠️ La modification manuelle du type de charge peut affecter les performances recommandées.</p>
          </div>
        </div>

        <!-- Pente des filtres avec explications -->
        <div class="space-y-2">
          <h3 class="text-sm font-medium text-gray-700">Pente des filtres</h3>
          <div class="flex gap-2">
            <button
              v-for="option in PENTE_FILTRE_OPTIONS"
              :key="option.value"
              :class="[
                'px-4 py-2 text-sm font-medium rounded-md',
                config.penteFiltre === option.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              ]"
              @click="handleChange({ target: { name: 'penteFiltre', value: option.value } })"
            >
              {{ option.label }}
            </button>
          </div>
          
          <!-- Explications détaillées -->
          <div class="mt-3 text-sm">
            <p class="font-medium text-gray-700">Impact de la pente sélectionnée :</p>
            <div class="mt-2 space-y-2 text-gray-600">
              <div v-if="config.penteFiltre === '12'">
                <p class="font-medium text-indigo-600">12 dB/octave :</p>
                <ul class="list-disc pl-5 space-y-1">
                  <li>Phase minimale et réponse transitoire naturelle</li>
                  <li>Meilleure cohérence temporelle</li>
                  <li>Zone de recouvrement plus large entre les haut-parleurs</li>
                  <li>Recommandé pour la musique acoustique et le jazz</li>
                  <li class="text-amber-600">Attention : Risque de surcharge des haut-parleurs à fort volume</li>
                </ul>
              </div>
              
              <div v-if="config.penteFiltre === '18'">
                <p class="font-medium text-indigo-600">18 dB/octave :</p>
                <ul class="list-disc pl-5 space-y-1">
                  <li>Bon compromis entre séparation et phase</li>
                  <li>Protection accrue des haut-parleurs</li>
                  <li>Zone de recouvrement modérée</li>
                  <li>Recommandé pour un usage polyvalent</li>
                  <li class="text-amber-600">Attention : Complexité accrue du filtre</li>
                </ul>
              </div>
              
              <div v-if="config.penteFiltre === '24'">
                <p class="font-medium text-indigo-600">24 dB/octave :</p>
                <ul class="list-disc pl-5 space-y-1">
                  <li>Meilleure séparation entre les voies</li>
                  <li>Protection maximale des haut-parleurs</li>
                  <li>Zone de recouvrement étroite</li>
                  <li>Recommandé pour la musique électronique et le home-cinema</li>
                  <li class="text-amber-600">Attention : Phase non linéaire et composants plus coûteux</li>
                </ul>
              </div>
            </div>

            <p class="mt-3 text-sm text-gray-500 italic">
              Note : Une pente plus raide (24 dB) nécessite des composants de meilleure qualité 
              et un budget plus élevé pour le filtre.
            </p>
          </div>
        </div>

        <!-- Fréquences de coupure manuelles -->
        <div v-if="config.nombreVoies > 1" class="space-y-2">
          <h3 class="text-sm font-medium text-gray-700">Fréquences de coupure (Hz)</h3>
          <div class="grid gap-4" :class="[
            config.nombreVoies === 2 ? 'grid-cols-1' :
            config.nombreVoies === 3 ? 'grid-cols-2' : 'grid-cols-3'
          ]">
            <RangeInput
              v-for="(_, index) in config.nombreVoies - 1"
              :key="index"
              :name="`freqCoupureManuelle.${index}`"
              :value="config.freqCoupureManuelle[index]"
              :min="100"
              :max="20000"
              :step="10"
              @input="handleFreqCoupureChange($event, index)"
            />
          </div>
        </div>

        <!-- Facteur de qualité avec explications détaillées -->
        <div class="space-y-2">
          <h3 class="text-sm font-medium text-gray-700">Facteur de qualité (Q)</h3>
          <SelectInput
            name="facteurQualite"
            :value="config.facteurQualite"
            :options="FACTEUR_QUALITE_OPTIONS"
            @change="handleChange"
          />
          
          <!-- Explications détaillées -->
          <div class="mt-3 text-sm">
            <p class="font-medium text-gray-700">Impact du facteur Q sélectionné :</p>
            <div class="mt-2 space-y-2 text-gray-600">
              <div v-if="config.facteurQualite === '0.5'">
                <p class="font-medium text-indigo-600">Q = 0.5 (Sous-amorti) :</p>
                <ul class="list-disc pl-5 space-y-1">
                  <li>Réponse très rapide aux transitoires</li>
                  <li>Basses précises et bien définies</li>
                  <li>Son plus "sec" et analytique</li>
                  <li>Recommandé pour :</li>
                  <ul class="list-circle pl-5 space-y-1">
                    <li>Musique acoustique</li>
                    <li>Jazz</li>
                    <li>Écoute critique</li>
                  </ul>
                  <li class="text-amber-600">Attention : Peut manquer d'impact dans les basses fréquences</li>
                </ul>
              </div>
              
              <div v-if="config.facteurQualite === '0.707'">
                <p class="font-medium text-indigo-600">Q = 0.707 (Butterworth) :</p>
                <ul class="list-disc pl-5 space-y-1">
                  <li>Réponse la plus linéaire possible</li>
                  <li>Excellent compromis entre précision et chaleur</li>
                  <li>Réponse transitoire optimale</li>
                  <li>Recommandé pour :</li>
                  <ul class="list-circle pl-5 space-y-1">
                    <li>Usage polyvalent</li>
                    <li>Écoute de longue durée</li>
                    <li>Tous styles de musique</li>
                  </ul>
                  <li class="text-green-600">Alignement le plus utilisé en Hi-Fi</li>
                </ul>
              </div>
              
              <div v-if="config.facteurQualite === '1.0'">
                <p class="font-medium text-indigo-600">Q = 1.0 (Sur-amorti) :</p>
                <ul class="list-disc pl-5 space-y-1">
                  <li>Basses plus chaleureuses et plus présentes</li>
                  <li>Son plus "rond" et plus enveloppant</li>
                  <li>Meilleure extension dans les basses fréquences</li>
                  <li>Recommandé pour :</li>
                  <ul class="list-circle pl-5 space-y-1">
                    <li>Musique électronique</li>
                    <li>Home-cinéma</li>
                    <li>Rock et musiques amplifiées</li>
                  </ul>
                  <li class="text-amber-600">Attention : Peut manquer de précision sur les transitoires rapides</li>
                </ul>
              </div>
            </div>

            <div class="mt-3 space-y-2">
              <p class="text-sm text-gray-500 italic">
                Note : Le facteur Q influence principalement le comportement des basses fréquences 
                et la réponse transitoire du système.
              </p>
              <p class="text-sm text-gray-500">
                Un facteur Q plus élevé donnera plus de "punch" mais moins de précision, 
                tandis qu'un facteur Q plus bas privilégiera la précision au détriment de l'impact.
              </p>
            </div>
          </div>
        </div>

        <!-- Fréquence d'accord avec explications détaillées -->
        <div v-if="config.typeCharge !== 'clos'" class="space-y-2">
          <h3 class="text-sm font-medium text-gray-700">Fréquence d'accord (Hz)</h3>
          <div class="space-y-4">
            <RangeInput
              name="accordEvent"
              :value="config.accordEvent"
              :min="20"
              :max="100"
              :step="1"
              @input="handleChange"
            />
            
            <!-- Explications détaillées -->
            <div class="text-sm">
              <p class="font-medium text-gray-700">Impact de la fréquence d'accord :</p>
              
              <div class="mt-2 space-y-2 text-gray-600">
                <!-- Explications selon la plage de fréquence -->
                <div v-if="config.accordEvent < 35">
                  <p class="font-medium text-indigo-600">Accord très grave (20-35 Hz) :</p>
                  <ul class="list-disc pl-5 space-y-1">
                    <li>Extension maximale dans l'extrême grave</li>
                    <li>Idéal pour le home-cinéma et les effets spéciaux</li>
                    <li>Adapté aux très grands volumes d'enceinte</li>
                    <li class="text-amber-600">Attention : Nécessite un évent plus long</li>
                    <li class="text-amber-600">Risque de bruit d'évent à fort volume</li>
                  </ul>
                </div>
                
                <div v-else-if="config.accordEvent >= 35 && config.accordEvent < 45">
                  <p class="font-medium text-indigo-600">Accord grave (35-45 Hz) :</p>
                  <ul class="list-disc pl-5 space-y-1">
                    <li>Excellent compromis pour la musique</li>
                    <li>Bonne extension dans le grave</li>
                    <li>Recommandé pour :</li>
                    <ul class="list-circle pl-5 space-y-1">
                      <li>Musique électronique</li>
                      <li>Orgue</li>
                      <li>Contrebasse</li>
                    </ul>
                    <li class="text-green-600">Meilleur compromis pour la plupart des cas</li>
                  </ul>
                </div>
                
                <div v-else-if="config.accordEvent >= 45 && config.accordEvent < 60">
                  <p class="font-medium text-indigo-600">Accord médium-grave (45-60 Hz) :</p>
                  <ul class="list-disc pl-5 space-y-1">
                    <li>Réponse plus dynamique</li>
                    <li>Basses plus percutantes</li>
                    <li>Recommandé pour :</li>
                    <ul class="list-circle pl-5 space-y-1">
                      <li>Rock</li>
                      <li>Jazz</li>
                      <li>Musique acoustique</li>
                    </ul>
                    <li class="text-amber-600">Perte d'extension dans l'extrême grave</li>
                  </ul>
                </div>
                
                <div v-else>
                  <p class="font-medium text-indigo-600">Accord haut (60-100 Hz) :</p>
                  <ul class="list-disc pl-5 space-y-1">
                    <li>Basses très percutantes</li>
                    <li>Excellent rendement</li>
                    <li>Adapté aux petits volumes d'enceinte</li>
                    <li>Recommandé pour :</li>
                    <ul class="list-circle pl-5 space-y-1">
                      <li>Petites enceintes bibliothèque</li>
                      <li>Musique peu exigeante en grave</li>
                    </ul>
                    <li class="text-amber-600">Extension limitée dans le grave</li>
                    <li class="text-amber-600">Risque de "bosse" dans la réponse</li>
                  </ul>
                </div>
              </div>

              <div class="mt-3 space-y-2">
                <p class="text-sm text-gray-500 italic">
                  Note : La fréquence d'accord influence directement l'extension dans le grave 
                  et le comportement dynamique de l'enceinte.
                </p>
                <p class="text-sm text-gray-500">
                  Une fréquence plus basse donnera plus d'extension dans le grave mais nécessitera 
                  un évent plus long et un volume d'enceinte plus important.
                </p>
                <p v-if="config.typeCharge === 'double-bass-reflex'" class="text-sm text-amber-600">
                  En configuration double bass-reflex, considérez d'accorder les évents à des 
                  fréquences légèrement différentes pour une meilleure extension.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 