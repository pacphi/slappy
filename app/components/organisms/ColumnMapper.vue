<script setup lang="ts">
import { computed } from 'vue'
import type { ParsedData, ColumnMapping } from '~/types'

const props = defineProps<{
  parsedData: ParsedData
}>()

const emit = defineEmits<{
  complete: [mapping: ColumnMapping, hasHeaders: boolean, csvContent: string]
}>()

const { mapping, hasHeaders, isValid, updateMapping } = useColumnMapping(
  props.parsedData.columnCount
)

// Create column options for dropdowns
const columnOptions = computed(() => {
  const options = [{ label: '(Skip this line)', value: null }]

  for (let i = 0; i < props.parsedData.columnCount; i++) {
    const label =
      hasHeaders.value && props.parsedData.headers
        ? `Column ${i + 1}: ${props.parsedData.headers[i]}`
        : `Column ${i + 1}`
    options.push({ label, value: i })
  }

  return options
})

// Preview data
const previewData = computed(() => {
  if (hasHeaders.value && props.parsedData.headers) {
    return props.parsedData.preview.slice(1) // Skip header row in preview
  }
  return props.parsedData.preview
})

const previewHeaders = computed(() => {
  if (hasHeaders.value && props.parsedData.headers) {
    return props.parsedData.headers
  }
  return undefined
})

const handleContinue = () => {
  // Reconstruct CSV content from columns
  const rows = props.parsedData.columns.map(row => row.join(','))
  const csvContent = rows.join('\n')

  emit('complete', mapping.value as ColumnMapping, hasHeaders.value, csvContent)
}
</script>

<template>
  <div class="column-mapper">
    <!-- Has Headers Toggle -->
    <AtomsContentBox class="headers-toggle">
      <label class="toggle-label">
        <input v-model="hasHeaders" type="checkbox" class="toggle-checkbox" />
        <span class="toggle-text">First row contains column headers</span>
      </label>
    </AtomsContentBox>

    <!-- Column Mapping -->
    <div class="mapping-grid">
      <div class="mapping-row">
        <label class="mapping-label">Line 1 (Large, Bold):</label>
        <select
          :value="mapping.line1"
          class="mapping-select"
          @change="
            e =>
              updateMapping(
                'line1',
                (e.target as HTMLSelectElement).value === 'null'
                  ? null
                  : Number((e.target as HTMLSelectElement).value)
              )
          "
        >
          <option v-for="option in columnOptions" :key="option.label" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <div class="mapping-row">
        <label class="mapping-label">Line 2 (Regular):</label>
        <select
          :value="mapping.line2"
          class="mapping-select"
          @change="
            e =>
              updateMapping(
                'line2',
                (e.target as HTMLSelectElement).value === 'null'
                  ? null
                  : Number((e.target as HTMLSelectElement).value)
              )
          "
        >
          <option v-for="option in columnOptions" :key="option.label" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <div class="mapping-row">
        <label class="mapping-label">Line 3 (Regular):</label>
        <select
          :value="mapping.line3"
          class="mapping-select"
          @change="
            e =>
              updateMapping(
                'line3',
                (e.target as HTMLSelectElement).value === 'null'
                  ? null
                  : Number((e.target as HTMLSelectElement).value)
              )
          "
        >
          <option v-for="option in columnOptions" :key="option.label" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Data Preview -->
    <div class="preview-section">
      <h3 class="preview-title">Data Preview</h3>
      <MoleculesDataTable :headers="previewHeaders" :rows="previewData" :max-rows="5" />
    </div>

    <!-- Continue Button -->
    <div class="actions">
      <AtomsButton variant="primary" :disabled="!isValid" class="w-full" @click="handleContinue">
        Continue to Preview
        <UIcon name="i-heroicons-arrow-right" class="h-4 w-4" />
      </AtomsButton>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.column-mapper {
  @apply flex flex-col gap-6;
}

.headers-toggle {
  @apply bg-white/5 p-4;
}

.toggle-label {
  @apply flex items-center gap-3 cursor-pointer;
}

.toggle-checkbox {
  @apply h-5 w-5 rounded border-2 border-white/20 bg-white/5 text-purple-600 transition-all;
  @apply focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-neutral-950;
}

.toggle-text {
  @apply text-white;
}

.mapping-grid {
  @apply flex flex-col gap-4;
}

.mapping-row {
  @apply flex flex-col gap-2;
}

.mapping-label {
  @apply text-sm font-medium text-white;
}

.mapping-select {
  @apply rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white;
  @apply focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500;
}

.preview-section {
  @apply flex flex-col gap-4;
}

.preview-title {
  @apply text-xl font-semibold text-white;
}

.actions {
  @apply flex items-center justify-center gap-4;
}
</style>
