import { ref, readonly } from 'vue'
import { defaultLabelTemplateId, type LabelTemplateId } from '#shared/label-templates'
import type { ColumnMapping, OutputFormat } from '#shared/types'
import { downloadBlob } from '../utils/download'

export const useNameTagGeneration = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const generatedHtml = ref<string | null>(null)
  const labelCount = ref(0)
  const sheetCount = ref(0)
  let latestRequest = 0

  const reportError = (request: number, err: unknown) => {
    if (request === latestRequest) {
      error.value = err instanceof Error ? err.message : 'Failed to generate name tags'
    }
  }

  const generate = async (
    csvContent: string,
    mapping: ColumnMapping,
    hasHeaders: boolean,
    format: OutputFormat = 'html',
    labelTemplate: LabelTemplateId = defaultLabelTemplateId
  ) => {
    const request = ++latestRequest
    loading.value = true
    error.value = null
    if (format === 'html') {
      generatedHtml.value = null
      labelCount.value = 0
      sheetCount.value = 0
    }

    try {
      if (format === 'pdf') {
        // For PDF, download directly
        const response = await $fetch<Blob>('/api/generate', {
          method: 'POST',
          body: { csvContent, mapping, hasHeaders, format: 'pdf', labelTemplate },
          responseType: 'blob',
        })
        if (request !== latestRequest) return

        downloadBlob(new Blob([response], { type: 'application/pdf' }), 'name-tags.pdf')
      } else {
        // For HTML, get the HTML content
        const response = await $fetch<{ html: string; labelCount: number; sheetCount: number }>(
          '/api/generate',
          {
            method: 'POST',
            body: { csvContent, mapping, hasHeaders, format: 'html', labelTemplate },
          }
        )

        if (request !== latestRequest) return
        generatedHtml.value = response.html
        labelCount.value = response.labelCount
        sheetCount.value = response.sheetCount
      }
    } catch (err) {
      reportError(request, err)
    } finally {
      if (request === latestRequest) loading.value = false
    }
  }

  const downloadHtml = () => {
    if (!generatedHtml.value) return

    downloadBlob(new Blob([generatedHtml.value], { type: 'text/html' }), 'name-tags.html')
  }

  const reset = () => {
    latestRequest++
    loading.value = false
    generatedHtml.value = null
    labelCount.value = 0
    sheetCount.value = 0
    error.value = null
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    generatedHtml: readonly(generatedHtml),
    labelCount: readonly(labelCount),
    sheetCount: readonly(sheetCount),
    generate,
    downloadHtml,
    reset,
  }
}
