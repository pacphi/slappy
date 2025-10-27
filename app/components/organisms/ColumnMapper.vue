<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue'
import { z } from 'zod'
import type { ParsedData, ColumnMapping } from '~/types'
import type { FormSubmitEvent } from '#ui/types'

const props = defineProps<{
  parsedData: ParsedData
}>()

const emit = defineEmits<{
  complete: [mapping: ColumnMapping, hasHeaders: boolean, csvContent: string]
}>()

// Form state for column mapping
const mappingState = reactive({
  line1: null as number | null,
  line2: null as number | null,
  line3: null as number | null,
  hasHeaders: false,
})

// Validation schema
const mappingSchema = z.object({
  line1: z.number().nullable(),
  line2: z.number().nullable(),
  line3: z.number().nullable(),
  hasHeaders: z.boolean(),
}).refine(
  (data) => {
    // At least one line must be selected
    return data.line1 !== null || data.line2 !== null || data.line3 !== null
  },
  {
    message: 'Select at least one column to continue',
    path: ['line1'], // Show error on line1
  }
).refine(
  (data) => {
    // No duplicates allowed
    const selected = [data.line1, data.line2, data.line3].filter((v) => v !== null)
    return selected.length === new Set(selected).size
  },
  {
    message: 'Each column can only be mapped once',
    path: ['line1'], // Show error on line1
  }
)

const isValid = computed(() => {
  const selected = [mappingState.line1, mappingState.line2, mappingState.line3]
  const hasSelection = selected.some((v) => v !== null)
  const uniqueSelected = selected.filter((v) => v !== null)
  const noDuplicates = uniqueSelected.length === new Set(uniqueSelected).size
  return hasSelection && noDuplicates
})

// F2: Mapping templates
const { templateNames, hasTemplates, saveTemplate, loadTemplate } = useMappingTemplates()
const templateName = ref('')
const selectedTemplate = ref('')

// F7: Create column options for dropdowns with sample data preview
const columnOptions = computed(() => {
  const options = [{ label: '(Skip this line)', value: null }]

  for (let i = 0; i < props.parsedData.columnCount; i++) {
    let label = `Column ${i + 1}`

    // Add header name (already implemented)
    if (mappingState.hasHeaders && props.parsedData.headers) {
      label = `${label}: ${props.parsedData.headers[i]}`
    }

    // F7: Add sample data preview
    const sampleRow = mappingState.hasHeaders ? props.parsedData.preview[1] : props.parsedData.preview[0]
    if (sampleRow && sampleRow[i]) {
      const sampleValue = String(sampleRow[i]).substring(0, 20) // Truncate long values
      const truncated = sampleValue.length < String(sampleRow[i]).length ? '...' : ''
      label = `${label} (${sampleValue}${truncated})`
    }

    options.push({ label, value: i })
  }

  return options
})

// Preview data
const previewData = computed(() => {
  if (mappingState.hasHeaders && props.parsedData.headers) {
    return props.parsedData.preview.slice(1) // Skip header row in preview
  }
  return props.parsedData.preview
})

const previewHeaders = computed(() => {
  if (mappingState.hasHeaders && props.parsedData.headers) {
    return props.parsedData.headers
  }
  return undefined
})

// U7: Calculate label count
const labelCount = computed(() => {
  let count = props.parsedData.rowCount
  // Subtract header row if present
  if (mappingState.hasHeaders) {
    count -= 1
  }
  return count
})

const sheetsCount = computed(() => {
  return Math.ceil(labelCount.value / 10) // 10 labels per sheet (TownStix US-10)
})

const handleSubmit = (event: FormSubmitEvent<z.infer<typeof mappingSchema>>) => {
  // Reconstruct CSV content from columns
  const rows = props.parsedData.columns.map(row => row.join(','))
  const csvContent = rows.join('\n')

  const mapping: ColumnMapping = {
    line1: event.data.line1,
    line2: event.data.line2,
    line3: event.data.line3,
  }

  emit('complete', mapping, event.data.hasHeaders, csvContent)
}

// F2: Template management
const handleSaveTemplate = () => {
  if (!templateName.value.trim()) return

  const mapping: ColumnMapping = {
    line1: mappingState.line1,
    line2: mappingState.line2,
    line3: mappingState.line3,
  }
  saveTemplate(templateName.value.trim(), mapping, mappingState.hasHeaders)
  templateName.value = ''
}

const handleLoadTemplate = (name: string) => {
  if (!name) return

  const template = loadTemplate(name)
  if (!template) return

  // Apply template mapping
  mappingState.line1 = template.mapping.line1
  mappingState.line2 = template.mapping.line2
  mappingState.line3 = template.mapping.line3
  mappingState.hasHeaders = template.hasHeaders
}

// Watch for template selection changes
watch(selectedTemplate, (newValue) => {
  if (newValue) {
    handleLoadTemplate(newValue)
    selectedTemplate.value = '' // Reset after loading
  }
})

// Keyboard shortcuts
const formRef = ref()

defineShortcuts({
  meta_enter: {
    usingInput: true,
    handler: () => {
      if (isValid.value) {
        formRef.value?.submit()
      }
    },
  },
})
</script>

<template>
  <UForm ref="formRef" :schema="mappingSchema" :state="mappingState" @submit="handleSubmit">
    <div class="column-mapper">
      <!-- Has Headers Toggle -->
      <UCard variant="outline">
        <UFormField name="hasHeaders">
          <UCheckbox v-model="mappingState.hasHeaders" label="First row contains column headers" />
        </UFormField>
      </UCard>

    <!-- F2: Template Management -->
    <UCard v-if="hasTemplates || isValid" variant="outline" class="template-section">
      <div v-if="hasTemplates" class="flex flex-col gap-2">
        <label class="text-sm font-medium">Load Template:</label>
        <USelect
          v-model="selectedTemplate"
          placeholder="Choose a saved template..."
          :items="[{ label: 'Choose a saved template...', value: '' }, ...templateNames.map(name => ({ label: name, value: name }))]"
        />
      </div>

      <div v-if="isValid" class="template-save">
        <UInput
          v-model="templateName"
          placeholder="Template name..."
          @keyup.enter="handleSaveTemplate"
        />
        <UButton
          size="sm"
          variant="outline"
          :disabled="!templateName.trim()"
          @click="handleSaveTemplate"
        >
          <UIcon name="i-heroicons-bookmark" class="h-4 w-4" />
          Save Template
        </UButton>
      </div>
    </UCard>

      <!-- Column Mapping -->
      <div class="mapping-grid">
        <UFormField
          name="line1"
          label="Line 1 (Large, Bold)"
          description="This line will be displayed in a large, bold font"
        >
          <USelect v-model="mappingState.line1" :items="columnOptions" />
        </UFormField>

        <UFormField
          name="line2"
          label="Line 2 (Regular)"
          description="This line will be displayed in regular font"
        >
          <USelect v-model="mappingState.line2" :items="columnOptions" />
        </UFormField>

        <UFormField
          name="line3"
          label="Line 3 (Regular)"
          description="This line will be displayed in regular font"
        >
          <USelect v-model="mappingState.line3" :items="columnOptions" />
        </UFormField>
      </div>

    <!-- U7: Label Count Display -->
    <UCard variant="soft" color="primary" class="label-count-box">
      <div class="flex items-center gap-3">
        <UIcon name="i-heroicons-document-text" class="h-8 w-8 flex-shrink-0" />
        <div class="flex flex-col gap-1">
          <p class="text-lg font-semibold">{{ labelCount }} name tags</p>
          <p class="text-sm opacity-70">
            {{ sheetsCount }} sheet{{ sheetsCount !== 1 ? 's' : '' }} (10 labels per sheet)
          </p>
        </div>
      </div>
    </UCard>

    <!-- Data Preview -->
    <div class="preview-section">
      <h3 class="text-xl font-semibold">Data Preview</h3>
      <MoleculesDataTable :headers="previewHeaders" :rows="previewData" :max-rows="5" />
    </div>

      <!-- Success Feedback -->
      <UAlert
        v-if="isValid"
        color="success"
        variant="soft"
        icon="i-heroicons-check-circle"
        title="Mapping valid - ready to preview"
      />

      <!-- Continue Button -->
      <UButton type="submit" color="primary" :disabled="!isValid" class="w-full">
        Continue to Preview
        <UIcon name="i-heroicons-arrow-right" class="h-4 w-4" />
      </UButton>
    </div>
  </UForm>
</template>

<style lang="postcss" scoped>
.column-mapper {
  @apply flex flex-col gap-6;
}

.template-section {
  @apply flex flex-col gap-4;
}

.template-save {
  @apply flex gap-2;
}

.mapping-grid {
  @apply flex flex-col gap-4;
}

.mapping-row {
  @apply flex flex-col gap-2;
}

.preview-section {
  @apply flex flex-col gap-4;
}
</style>
