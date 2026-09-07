import { ref, readonly } from 'vue'
import { defaultLabelTemplateId, type LabelTemplateId } from '#shared/label-templates'
import type { ColumnMapping, OutputFormat } from '~/types'

export const useNameTagGeneration = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const generatedHtml = ref<string | null>(null)
  const labelCount = ref(0)
  const sheetCount = ref(0)
  let latestRequest = 0

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
    if (format === 'html') generatedHtml.value = null

    try {
      if (format === 'pdf') {
        // For PDF, download directly
        const response = await $fetch('/api/generate', {
          method: 'POST',
          body: { csvContent, mapping, hasHeaders, format: 'pdf', labelTemplate },
          responseType: 'blob',
        })
        if (request !== latestRequest) return

        // Create download link
        const blob = new Blob([response as BlobPart], { type: 'application/pdf' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'name-tags.pdf'
        link.click()
        window.URL.revokeObjectURL(url)
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
      if (request === latestRequest) {
        error.value = err instanceof Error ? err.message : 'Failed to generate name tags'
      }
    } finally {
      if (request === latestRequest) loading.value = false
    }
  }

  const downloadHtml = () => {
    if (!generatedHtml.value) return

    const blob = new Blob([generatedHtml.value], { type: 'text/html' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'name-tags.html'
    link.click()
    window.URL.revokeObjectURL(url)
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
