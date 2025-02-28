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
    [name]: ['impedance', 'puissanceAmp', 'nombreVoies', 'accordEvent', 'facteurQualite']
      .includes(name)
      ? Number(value)
      : value
  })
}

const handleVoiesClick = (voies: number) => {
  store.updateConfig({ nombreVoies: voies })
}

const getTypeChargeDescription = (type: string): string => {
  const descriptions = {
    'clos': 'Meilleur contrôle des basses, idéal près des murs',
    'bass-reflex': 'Plus de rendement dans les basses, nécessite plus d\'espace',
    'double-bass-reflex': 'Extension maximale des basses, pour les audiophiles'
  }
  return descriptions[type as keyof typeof descriptions] || ''
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
            v-for="num in [2, 3, 4]"
            :key="num"
            @click="handleVoiesClick(num)"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2',
              config.nombreVoies === num
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500'
                : 'bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500'
            ]"
          >
            {{ num }} voies
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
          @click="handleChange({ target: { name: 'showAdvanced', value: !config.showAdvanced } } as Event)"
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
      <div v-if="config.showAdvanced" class="space-y-6 border-t pt-6">
        <!-- Type de charge -->
        <div class="space-y-2">
          <h3 class="text-sm font-medium text-gray-700">Type de charge</h3>
          <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <button
              v-for="option in TYPE_CHARGE_OPTIONS"
              :key="option.value"
              :class="[
                'px-4 py-2 text-sm font-medium rounded-md',
                config.typeCharge === option.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              ]"
              @click="handleChange({ target: { name: 'typeCharge', value: option.value } } as Event)"
            >
              {{ option.label }}
            </button>
          </div>
          <p class="text-sm text-gray-500">
            {{ getTypeChargeDescription(config.typeCharge) }}
          </p>
        </div>

        <!-- Autres paramètres avancés selon le type de charge -->
        <template v-if="config.typeCharge !== 'clos'">
          <RangeInput
            label="Fréquence d'accord (Hz)"
            name="accordEvent"
            :value="config.accordEvent"
            :min="20"
            :max="100"
            :step="1"
            unit="Hz"
            @update="handleChange"
          />
        </template>

        <RangeInput
          label="Facteur de qualité"
          name="facteurQualite"
          :value="config.facteurQualite"
          :min="0.5"
          :max="1.0"
          :step="0.001"
          @update="handleChange"
        />
      </div>
    </div>
  </div>
</template> 