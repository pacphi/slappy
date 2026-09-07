<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  labelTemplates,
  defaultLabelTemplateId,
  getLabelTemplate,
  type LabelTemplateId,
} from '#shared/label-templates'
import type { ColumnMapping } from '~/types'

const props = defineProps<{
  csvContent: string
  mapping: ColumnMapping
  hasHeaders: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const { isEnabled } = useFeatureFlags()
const isAdSenseEnabled = isEnabled('adsense')

const {
  generatedHtml,
  labelCount: tagCount,
  sheetCount,
  loading,
  error,
  generate,
  downloadHtml,
} = useNameTagGeneration()
const zoom = ref(100)
const labelTemplate = ref<LabelTemplateId>(defaultLabelTemplateId)
const selectedTemplate = computed(() => getLabelTemplate(labelTemplate.value))
const labelOptions = labelTemplates.map(template => ({
  value: template.id,
  label: `${template.name} — ${template.columns * template.rows} per sheet`,
}))
const previewFrame = ref<HTMLIFrameElement | null>(null)
const labelsPerSheet = computed(() => selectedTemplate.value.columns * selectedTemplate.value.rows)

// Regenerate both pagination and geometry whenever the selected stock or data changes.
watch(
  [labelTemplate, () => props.csvContent, () => props.mapping, () => props.hasHeaders],
  async () => {
    await generate(props.csvContent, props.mapping, props.hasHeaders, 'html', labelTemplate.value)
  },
  { immediate: true }
)

const iframeContent = computed(() => {
  if (!generatedHtml.value) return ''
  return generatedHtml.value
})

const handleDownloadPDF = async () => {
  if (loading.value || error.value) return
  await generate(props.csvContent, props.mapping, props.hasHeaders, 'pdf', labelTemplate.value)
}

const handlePrint = () => {
  if (loading.value || error.value) return
  const iframe = previewFrame.value
  if (iframe?.contentWindow) {
    iframe.contentWindow.print()
  }
}

const zoomIn = () => {
  if (zoom.value < 200) zoom.value += 10
}

const zoomOut = () => {
  if (zoom.value > 50) zoom.value -= 10
}

const resetZoom = () => {
  zoom.value = 100
}

// U2: Confirmation before starting over
const handleStartOver = () => {
  const confirmed = confirm(
    'Are you sure you want to start over? This will reset all your work and cannot be undone.'
  )
  if (confirmed) {
    emit('close')
  }
}

// Keyboard shortcuts
defineShortcuts({
  meta_p: {
    handler: () => {
      handlePrint()
    },
  },
  meta_d: {
    handler: () => {
      handleDownloadPDF()
    },
  },
  meta_h: {
    handler: () => {
      downloadHtml()
    },
  },
  plus: {
    handler: () => {
      zoomIn()
    },
  },
  minus: {
    handler: () => {
      zoomOut()
    },
  },
  '0': {
    handler: () => {
      resetZoom()
    },
  },
})
</script>

<template>
  <div class="preview-panel">
    <UFormField label="Label stock" name="labelTemplate">
      <USelect
        v-model="labelTemplate"
        :items="labelOptions"
        :disabled="loading"
        class="w-full"
        aria-label="Label stock"
      />
    </UFormField>
    <p class="text-sm text-muted">
      {{ selectedTemplate.widthIn }}″ × {{ selectedTemplate.nominalHeightIn }}″ ·
      {{ labelsPerSheet }} per sheet · {{ sheetCount }} sheet{{ sheetCount === 1 ? '' : 's' }}
    </p>
    <p class="text-sm text-muted">
      Print on US Letter at 100% / Actual size. Turn off browser headers and footers.
    </p>

    <!-- Error Display -->
    <UAlert v-if="error" color="error" variant="soft" :title="error" />

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 animate-spin" />
      <p>Generating preview...</p>
    </div>

    <!-- Preview Controls -->
    <div v-if="!loading && !error" class="preview-controls">
      <div class="zoom-controls">
        <UButton
          size="sm"
          variant="outline"
          aria-label="Zoom out"
          :disabled="zoom <= 50"
          @click="zoomOut"
        >
          <UIcon name="i-heroicons-minus" class="h-4 w-4" />
        </UButton>
        <span class="zoom-display">{{ zoom }}%</span>
        <UButton
          size="sm"
          variant="outline"
          aria-label="Zoom in"
          :disabled="zoom >= 200"
          @click="zoomIn"
        >
          <UIcon name="i-heroicons-plus" class="h-4 w-4" />
        </UButton>
        <UButton size="sm" variant="ghost" @click="resetZoom">Reset</UButton>
      </div>

      <div class="action-buttons">
        <UButton variant="outline" @click="handleDownloadPDF">
          <UIcon name="i-heroicons-document-arrow-down" class="h-4 w-4" />
          Download PDF
        </UButton>
        <UButton variant="outline" @click="downloadHtml">
          <UIcon name="i-heroicons-code-bracket" class="h-4 w-4" />
          Download HTML
        </UButton>
        <UButton variant="outline" @click="handlePrint">
          <UIcon name="i-heroicons-printer" class="h-4 w-4" />
          Print
        </UButton>
      </div>
    </div>

    <!-- Preview Iframe -->
    <div v-if="!loading && !error" class="preview-card">
      <div
        class="preview-sheet"
        :style="{
          width: `${8.5 * 96 * (zoom / 100)}px`,
          height: `${Math.max(1, sheetCount) * 11 * 96 * (zoom / 100)}px`,
        }"
      >
        <iframe
          ref="previewFrame"
          :srcdoc="iframeContent"
          :style="{
            width: `${8.5 * 96}px`,
            height: `${Math.max(1, sheetCount) * 11 * 96}px`,
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top left',
          }"
          class="preview-iframe"
          title="Name Tags Preview"
        />
      </div>
    </div>

    <!-- Google AdSense - Preview Sidebar Ad (only shown when feature flag is enabled) -->
    <MoleculesAdSenseAd
      v-if="isAdSenseEnabled && !loading && !error"
      ad-slot="PREVIEW_SIDEBAR_AD_SLOT_ID"
      format="display"
    />

    <!-- Social Share -->
    <MoleculesSocialShare v-if="!loading && !error" :tag-count="tagCount" />

    <!-- Actions -->
    <UButton color="error" class="w-full flex-shrink-0" @click="handleStartOver">
      Start Over
      <UIcon name="i-heroicons-arrow-path" class="h-4 w-4" />
    </UButton>
  </div>
</template>

<style scoped>
@reference '../../assets/css/main.css';

.preview-panel {
  @apply flex flex-1 flex-col gap-6;
  min-height: 0;
}

.loading-state {
  @apply flex flex-col items-center gap-4 py-12;
}

.preview-controls {
  @apply flex flex-col gap-4 md:flex-row md:items-center md:justify-between;
  flex-shrink: 0;
}

.zoom-controls {
  @apply flex items-center gap-2;
}

.zoom-display {
  @apply min-w-16 text-center;
}

.action-buttons {
  @apply flex flex-wrap gap-2;
}

.preview-card {
  @apply flex flex-1 items-start overflow-auto;
  min-height: 0;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 0.5rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.preview-sheet {
  flex-shrink: 0;
}

.preview-iframe {
  display: block;
  max-width: none;
  @apply border-0;
  background: white;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style>
