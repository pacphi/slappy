<script setup lang="ts">
import { ref } from 'vue'
import type { ColumnMapping } from '~/types'

const { currentStep, nextStep, previousStep, reset: resetWizard } = useWizardNavigation()
const { parsedData, uploadFile, uploadSheets, loading, error, reset: resetUpload } = useDataUpload()

const uploadMode = ref<'csv' | 'sheets'>('csv')
const sheetsUrl = ref('')
const csvContent = ref('')
const mapping = ref<ColumnMapping | null>(null)
const hasHeaders = ref(false)

const handleFileSelected = async (file: File) => {
  await uploadFile(file)
  if (parsedData.value) {
    nextStep()
  }
}

const handleSheetsSubmit = async () => {
  if (!sheetsUrl.value.trim()) return
  await uploadSheets(sheetsUrl.value)
  if (parsedData.value) {
    nextStep()
  }
}

const handleMappingComplete = (newMapping: ColumnMapping, headers: boolean, content: string) => {
  mapping.value = newMapping
  hasHeaders.value = headers
  csvContent.value = content
  nextStep()
}

const handleReset = () => {
  resetWizard()
  resetUpload()
  sheetsUrl.value = ''
  csvContent.value = ''
  mapping.value = null
  hasHeaders.value = false
}
</script>

<template>
  <AtomsCard class="wizard-container">
    <!-- Progress Indicator -->
    <MoleculesProgressIndicator v-if="currentStep !== 'preview'" :current-step="currentStep" />

    <!-- Error Display -->
    <AtomsContentBox v-if="error" class="error-box">
      <p>{{ error }}</p>
    </AtomsContentBox>

    <!-- Step: Upload -->
    <div v-if="currentStep === 'upload'" class="wizard-step">
      <h2 class="step-title">Upload Your Data</h2>

      <!-- Mode Toggle -->
      <div class="mode-toggle">
        <button
          :class="['mode-button', { active: uploadMode === 'csv' }]"
          @click="uploadMode = 'csv'"
        >
          <UIcon name="i-heroicons-arrow-up-tray" />
          CSV Upload
        </button>
        <button
          :class="['mode-button', { active: uploadMode === 'sheets' }]"
          @click="uploadMode = 'sheets'"
        >
          <UIcon name="i-heroicons-link" />
          Google Sheets
        </button>
      </div>

      <!-- CSV Upload Mode -->
      <MoleculesFileUpload
        v-if="uploadMode === 'csv'"
        :loading="loading"
        @file-selected="handleFileSelected"
      />

      <!-- Google Sheets Mode -->
      <div v-if="uploadMode === 'sheets'" class="sheets-input-container">
        <AtomsContentBox class="sheets-input">
          <label class="sheets-label">
            Google Sheets URL:
            <input
              v-model="sheetsUrl"
              type="url"
              class="sheets-url-input"
              placeholder="https://docs.google.com/spreadsheets/d/..."
            />
          </label>
          <AtomsButton :disabled="!sheetsUrl.trim() || loading" @click="handleSheetsSubmit">
            <UIcon v-if="loading" name="i-heroicons-arrow-path" class="h-4 w-4 animate-spin" />
            <UIcon v-else name="i-heroicons-arrow-right" class="h-4 w-4" />
            Load Sheet
          </AtomsButton>
        </AtomsContentBox>
      </div>
    </div>

    <!-- Step: Mapping -->
    <OrganismsColumnMapper
      v-if="currentStep === 'mapping' && parsedData"
      :parsed-data="parsedData"
      @complete="handleMappingComplete"
      @back="previousStep"
    />

    <!-- Step: Preview -->
    <OrganismsPreviewPanel
      v-if="currentStep === 'preview' && mapping && csvContent"
      :csv-content="csvContent"
      :mapping="mapping"
      :has-headers="hasHeaders"
      @back="previousStep"
      @close="handleReset"
    />
  </AtomsCard>
</template>

<style lang="postcss" scoped>
.wizard-container {
  @apply mx-auto w-full max-w-4xl p-8;
}

.wizard-step {
  @apply flex flex-col gap-6;
}

.step-title {
  @apply text-3xl font-bold text-white;
}

.error-box {
  @apply bg-red-500/10 p-4 text-red-400;
}

.mode-toggle {
  @apply flex gap-2 rounded-lg bg-white/5 p-1;
}

.mode-button {
  @apply flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white/70 transition-all;
  @apply hover:bg-white/10 hover:text-white;

  &.active {
    @apply bg-gradient-to-b from-purple-500 to-purple-700 text-white shadow-lg;
  }
}

.sheets-input-container {
  @apply flex flex-col gap-4;
}

.sheets-input {
  @apply flex flex-col gap-4 bg-white/5 p-6;
}

.sheets-label {
  @apply flex flex-col gap-2 text-sm font-medium text-white;
}

.sheets-url-input {
  @apply rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white;
  @apply focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500;
}
</style>
