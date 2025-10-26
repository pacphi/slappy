<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ColumnMapping } from '~/types'

const props = defineProps<{
  csvContent: string
  mapping: ColumnMapping
  hasHeaders: boolean
}>()

const emit = defineEmits<{
  back: []
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
</script>

<template>
  <div class="preview-panel">
    <h2 class="step-title">Preview & Download</h2>

    <!-- Error Display -->
    <AtomsContentBox v-if="error" class="error-box">
      <p>{{ error }}</p>
    </AtomsContentBox>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 animate-spin text-purple-500" />
      <p class="text-white/70">Generating preview...</p>
    </div>

    <!-- Preview Controls -->
    <div v-if="!loading && !error" class="preview-controls">
      <div class="zoom-controls">
        <AtomsButton size="sm" variant="secondary" @click="zoomOut">
          <UIcon name="i-heroicons-minus" class="h-4 w-4" />
        </AtomsButton>
        <span class="zoom-display">{{ zoom }}%</span>
        <AtomsButton size="sm" variant="secondary" @click="zoomIn">
          <UIcon name="i-heroicons-plus" class="h-4 w-4" />
        </AtomsButton>
        <AtomsButton size="sm" variant="ghost" @click="resetZoom"> Reset </AtomsButton>
      </div>

      <div class="action-buttons">
        <AtomsButton variant="secondary" @click="handleDownloadPDF">
          <UIcon name="i-heroicons-document-arrow-down" class="h-4 w-4" />
          Download PDF
        </AtomsButton>
        <AtomsButton variant="secondary" @click="downloadHtml">
          <UIcon name="i-heroicons-code-bracket" class="h-4 w-4" />
          Download HTML
        </AtomsButton>
        <AtomsButton variant="secondary" @click="handlePrint">
          <UIcon name="i-heroicons-printer" class="h-4 w-4" />
          Print
        </AtomsButton>
      </div>
    </div>

    <!-- Preview Iframe -->
    <AtomsContentBox v-if="!loading && !error" class="preview-container">
      <iframe
        :srcdoc="iframeContent"
        :style="{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }"
        class="preview-iframe"
        title="Name Tags Preview"
      />
    </AtomsContentBox>

    <!-- Actions -->
    <div class="actions">
      <AtomsButton variant="ghost" @click="emit('back')">
        <UIcon name="i-heroicons-arrow-left" class="h-4 w-4" />
        Back
      </AtomsButton>
      <AtomsButton variant="secondary" @click="emit('close')">
        Start Over
        <UIcon name="i-heroicons-arrow-path" class="h-4 w-4" />
      </AtomsButton>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.preview-panel {
  @apply flex flex-col gap-6;
}

.step-title {
  @apply text-3xl font-bold text-white;
}

.error-box {
  @apply bg-red-500/10 p-4 text-red-400;
}

.loading-state {
  @apply flex flex-col items-center gap-4 py-12;
}

.preview-controls {
  @apply flex flex-col gap-4 md:flex-row md:items-center md:justify-between;
}

.zoom-controls {
  @apply flex items-center gap-2;
}

.zoom-display {
  @apply min-w-[4rem] text-center text-sm font-medium text-white;
}

.action-buttons {
  @apply flex flex-wrap gap-2;
}

.preview-container {
  @apply bg-white/5 p-4 overflow-auto;
  min-height: 500px;
}

.preview-iframe {
  @apply w-full border-0;
  min-height: 800px;
}

.actions {
  @apply flex items-center justify-between gap-4;
}
</style>
