<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ColumnMapping } from '~/types'

const props = defineProps<{
  csvContent: string
  mapping: ColumnMapping
  hasHeaders: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const { generatedHtml, loading, error, generate, downloadHtml } = useNameTagGeneration()
const zoom = ref(100)

// Generate preview on mount
onMounted(async () => {
  await generate(props.csvContent, props.mapping, props.hasHeaders, 'html')
})

const iframeContent = computed(() => {
  if (!generatedHtml.value) return ''
  return generatedHtml.value
})

const handleDownloadPDF = async () => {
  await generate(props.csvContent, props.mapping, props.hasHeaders, 'pdf')
}

const handlePrint = () => {
  const iframe = document.querySelector('iframe')
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
        <UButton size="sm" variant="outline" :disabled="zoom <= 50" @click="zoomOut">
          <UIcon name="i-heroicons-minus" class="h-4 w-4" />
        </UButton>
        <span class="zoom-display">{{ zoom }}%</span>
        <UButton size="sm" variant="outline" :disabled="zoom >= 200" @click="zoomIn">
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
      <iframe
        :srcdoc="iframeContent"
        :style="{
          width: `${(8 * 96) / (zoom / 100)}px`,
          height: `${(10.5 * 96) / (zoom / 100)}px`,
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'top left'
        }"
        class="preview-iframe"
        title="Name Tags Preview"
      />
    </div>

    <!-- Actions -->
    <UButton color="error" class="w-full flex-shrink-0" @click="handleStartOver">
      Start Over
      <UIcon name="i-heroicons-arrow-path" class="h-4 w-4" />
    </UButton>
  </div>
</template>

<style lang="postcss" scoped>
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
  @apply flex flex-1 items-start justify-center overflow-auto;
  min-height: 0;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 0.5rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.preview-iframe {
  @apply border-0;
  background: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style>
