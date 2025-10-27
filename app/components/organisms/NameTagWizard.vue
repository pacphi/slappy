<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ColumnMapping, WizardStep } from '~/types'

const {
  currentStep,
  goToStep,
  nextStep,
  isStepCompleted,
  isStepLocked,
  reset: resetWizard,
} = useWizardNavigation()
const { parsedData, uploadFile, uploadSheets, loading, error, reset: resetUpload } = useDataUpload()

const uploadMode = ref<'csv' | 'sheets'>('csv')
const sheetsUrl = ref('')
const csvContent = ref('')
const mapping = ref<ColumnMapping | null>(null)
const hasHeaders = ref(false)

// All columns are always visible, but content is conditional
const canShowMappingContent = computed(
  () => isStepCompleted('upload') || currentStep.value !== 'upload'
)
const canShowPreviewContent = computed(
  () => isStepCompleted('mapping') || currentStep.value === 'preview'
)

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

const handleColumnClick = (step: WizardStep) => {
  goToStep(step)
}
</script>

<template>
  <div class="wizard-container">
    <!-- Error Display -->
    <AtomsContentBox v-if="error" class="error-box">
      <p>{{ error }}</p>
    </AtomsContentBox>

    <!-- Three-Column Layout -->
    <div class="columns-grid">
      <!-- Upload Column -->
      <AtomsCard class="column">
        <MoleculesColumnHeader
          title="Upload"
          :is-active="currentStep === 'upload'"
          :is-completed="isStepCompleted('upload')"
          :is-locked="isStepLocked('upload')"
          @click="handleColumnClick('upload')"
        />
        <div class="column-content">
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
      </AtomsCard>

      <!-- Mapping Column -->
      <AtomsCard class="column">
        <MoleculesColumnHeader
          title="Map"
          :is-active="currentStep === 'mapping'"
          :is-completed="isStepCompleted('mapping')"
          :is-locked="isStepLocked('mapping')"
          @click="handleColumnClick('mapping')"
        />
        <div v-if="canShowMappingContent" class="column-content">
          <OrganismsColumnMapper
            v-if="parsedData"
            :parsed-data="parsedData"
            @complete="handleMappingComplete"
          />
        </div>
        <div v-else class="column-content column-placeholder">
          <p class="placeholder-text">Complete upload to map columns</p>
        </div>
      </AtomsCard>

      <!-- Preview Column -->
      <AtomsCard class="column column-preview">
        <MoleculesColumnHeader
          title="Preview"
          :is-active="currentStep === 'preview'"
          :is-completed="isStepCompleted('preview')"
          :is-locked="isStepLocked('preview')"
          @click="handleColumnClick('preview')"
        />
        <div v-if="canShowPreviewContent" class="column-content">
          <OrganismsPreviewPanel
            v-if="mapping && csvContent"
            :csv-content="csvContent"
            :mapping="mapping"
            :has-headers="hasHeaders"
            @close="handleReset"
          />
        </div>
        <div v-else class="column-content column-placeholder">
          <p class="placeholder-text">Complete mapping to preview</p>
        </div>
      </AtomsCard>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.wizard-container {
  @apply mx-auto w-full p-4 md:p-8;
  max-width: 1600px; /* Wider to accommodate three columns */
}

.error-box {
  @apply mb-6 bg-red-500/10 p-4 text-red-400;
}

/* Three-column grid layout */
.columns-grid {
  display: grid;
  gap: 1rem;
  /* Single column on mobile */
  grid-template-columns: 1fr;

  /* Three columns on tablet and up: 25% | 25% | 50% */
  @media (min-width: 768px) {
    gap: 1.5rem;
    grid-template-columns: 1fr 1fr 2fr;
  }
}

.column {
  @apply flex flex-col overflow-hidden p-0;
  /* Remove default card padding, add it to column-content instead */
}

.column-content {
  @apply flex flex-col gap-6 p-6;
  padding-top: 50px;
}

.column-placeholder {
  @apply items-center justify-center py-12;
  min-height: 200px;
}

.placeholder-text {
  @apply text-center text-sm text-white/40;
}

.column-preview {
  /* Preview column takes the third position in the grid */
  @apply col-span-1;

  @media (min-width: 768px) {
    grid-column: 3 / 4;
  }
}

/* Upload mode toggle */
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
