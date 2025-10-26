import { ref } from 'vue'
import type { ColumnMapping, OutputFormat } from '~/types'

export const useNameTagGeneration = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const generatedHtml = ref<string | null>(null)

  const generate = async (
    csvContent: string,
    mapping: ColumnMapping,
    hasHeaders: boolean,
    format: OutputFormat = 'html'
  ) => {
    loading.value = true
    error.value = null

    try {
      if (format === 'pdf') {
        // For PDF, download directly
        const response = await $fetch('/api/generate', {
          method: 'POST',
          body: { csvContent, mapping, hasHeaders, format: 'pdf' },
          responseType: 'blob',
        })

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
        const response = await $fetch<{ html: string }>('/api/generate', {
          method: 'POST',
          body: { csvContent, mapping, hasHeaders, format: 'html' },
        })

        generatedHtml.value = response.html
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to generate name tags'
    } finally {
      loading.value = false
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
    generatedHtml.value = null
    error.value = null
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    generatedHtml: readonly(generatedHtml),
    generate,
    downloadHtml,
    reset,
  }
}
