<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue'
import { z } from 'zod'
import type { ColumnMapping, WizardStep } from '~/types'
import type { FormSubmitEvent } from '#ui/types'
import { getErrorMessage } from '~/utils/error-messages'
import { isValidGoogleSheetsUrl } from '~/utils/validators'
import type { UploadMode } from '~/composables/useAppNavigation'

const props = defineProps<{
  initialUploadMode?: UploadMode
}>()

const {
  currentStep,
  goToStep,
  nextStep,
  isStepCompleted,
  isStepLocked,
  reset: resetWizard,
} = useWizardNavigation()
const { parsedData, uploadFile, uploadSheets, loading, error, reset: resetUpload } = useDataUpload()
const toast = useToast()

// C1: Browser navigation protection
useUnsavedChanges()

// Local error state for file upload
const uploadError = ref<string | null>(null)

// Watch for errors and show toast
watch([() => uploadError.value, error], ([uploadErr, apiErr]) => {
  const errorMessage = uploadErr || apiErr
  if (errorMessage) {
    const errorContext = getErrorMessage(errorMessage)
    toast.add({
      title: errorContext.message,
      description: errorContext.solution,
      color: 'error',
      timeout: 8000,
    })
  }
})

const uploadMode = ref<UploadMode>(props.initialUploadMode || 'csv')
const csvContent = ref('')
const mapping = ref<ColumnMapping | null>(null)
const hasHeaders = ref(false)

// Update upload mode when prop changes
watch(
  () => props.initialUploadMode,
  newMode => {
    if (newMode) {
      uploadMode.value = newMode
    }
  }
)

// Google Sheets form validation
const sheetsSchema = z.object({
  url: z
    .string()
    .min(1, 'Please enter a Google Sheets URL')
    .url('Please enter a valid URL')
    .refine(val => isValidGoogleSheetsUrl(val), {
      message: 'Please enter a valid Google Sheets URL (https://docs.google.com/spreadsheets/...)',
    }),
})

const sheetsState = reactive({
  url: '',
})

// All columns are always visible, but content is conditional
const canShowMappingContent = computed(
  () => isStepCompleted('upload') || currentStep.value !== 'upload'
)
const canShowPreviewContent = computed(
  () => isStepCompleted('mapping') || currentStep.value === 'preview'
)

const handleFileSelected = async (file: File) => {
  uploadError.value = null // Clear previous errors
  await uploadFile(file)
  if (parsedData.value) {
    nextStep()
  }
}

const handleUploadError = (errorMessage: string) => {
  uploadError.value = errorMessage
}

const handleSheetsSubmit = async (event: FormSubmitEvent<z.infer<typeof sheetsSchema>>) => {
  uploadError.value = null
  await uploadSheets(event.data.url)
  if (parsedData.value) {
    nextStep()
    sheetsState.url = '' // Clear form on success
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
  sheetsState.url = ''
  csvContent.value = ''
  mapping.value = null
  hasHeaders.value = false
  uploadError.value = null
}

const handleColumnClick = (step: WizardStep) => {
  goToStep(step)
}

// Keyboard shortcuts
defineShortcuts({
  escape: {
    handler: () => {
      if (currentStep.value === 'preview') {
        handleReset()
      }
    },
  },
  meta_r: {
    handler: () => {
      handleReset()
    },
  },
})

// F6: Sample data / demo mode
const loadSampleData = async () => {
  const sampleCSV = `Name,Company,Title
John Doe,Acme Corp,CEO
Jane Smith,TechStart,CTO
Bob Johnson,DataCo,Engineer
Alice Williams,InnovateLabs,Designer
Charlie Brown,CloudSystems,Developer
Diana Prince,StartupHub,Product Manager
Eve Adams,FutureTech,Data Scientist
Frank Miller,WebWorks,UX Researcher
Grace Lee,CodeFactory,DevOps Engineer
Henry Clark,AppStudio,Mobile Developer`

  // Create a Blob and File from the sample data
  const blob = new Blob([sampleCSV], { type: 'text/csv' })
  const file = new File([blob], 'sample-data.csv', { type: 'text/csv' })

  uploadError.value = null
  await uploadFile(file)
  if (parsedData.value) {
    nextStep()
  }
}
</script>

<template>
  <div class="wizard-container">
    <!-- Three-Column Layout -->
    <div class="columns-grid">
      <!-- Upload Column -->
      <UCard variant="outline" class="column">
        <MoleculesColumnHeader
          title="Upload"
          :is-active="currentStep === 'upload'"
          :is-completed="isStepCompleted('upload')"
          :is-locked="isStepLocked('upload')"
          @click="handleColumnClick('upload')"
        />
        <div class="column-content">
          <!-- CSV Upload Mode -->
          <template v-if="uploadMode === 'csv'">
            <MoleculesFileUpload
              :loading="loading"
              @file-selected="handleFileSelected"
              @error="handleUploadError"
            />

            <!-- F6: Sample Data Button -->
            <div class="sample-data-section">
              <p class="sample-data-text">Want to try it first?</p>
              <UButton variant="ghost" size="sm" :disabled="loading" @click="loadSampleData">
                <UIcon name="i-heroicons-sparkles" class="h-4 w-4" />
                Try Sample Data
              </UButton>
            </div>
          </template>

          <!-- Google Sheets Mode -->
          <div v-if="uploadMode === 'sheets'" class="sheets-input-container">
            <UForm :schema="sheetsSchema" :state="sheetsState" @submit="handleSheetsSubmit">
              <UCard variant="outline" class="sheets-input">
                <UFormField
                  name="url"
                  label="Google Sheets URL"
                  description="Paste a link to a published Google Sheets document"
                  required
                >
                  <UInput
                    v-model="sheetsState.url"
                    type="url"
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    icon="i-heroicons-link"
                  />
                </UFormField>
                <UButton type="submit" :loading="loading" :disabled="loading">
                  <UIcon v-if="!loading" name="i-heroicons-arrow-right" class="h-4 w-4" />
                  Load Sheet
                </UButton>
              </UCard>
            </UForm>
          </div>
        </div>
      </UCard>

      <!-- Mapping Column -->
      <UCard variant="outline" class="column">
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
      </UCard>

      <!-- Preview Column -->
      <UCard variant="outline" class="column column-preview">
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
      </UCard>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.wizard-container {
  @apply mx-auto w-full p-4 md:p-8;
  max-width: 1600px;
  min-height: calc(100vh - 8rem);
}

.columns-grid {
  @apply grid gap-4 md:grid-cols-[1fr_1fr_2fr] md:gap-6;
  height: 100%;
}

.column {
  @apply flex flex-col;
  min-height: 0;
}

.column-content {
  @apply flex flex-1 flex-col gap-8 p-6;
  min-height: 0;
  overflow-y: auto;
}

.column-placeholder {
  @apply flex min-h-[200px] items-center justify-center py-12;
}

.sheets-input {
  @apply flex flex-col gap-4;
}

.sheets-label {
  @apply flex flex-col gap-2;
}

.sample-data-section {
  @apply flex flex-col items-center gap-3 p-4;
}
</style>
