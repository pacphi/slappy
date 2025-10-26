import { ref } from 'vue'
import type { ParsedData } from '~/types'

export const useDataUpload = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const parsedData = ref<ParsedData | null>(null)

  const uploadFile = async (file: File) => {
    loading.value = true
    error.value = null

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await $fetch<ParsedData>('/api/parse', {
        method: 'POST',
        body: formData,
      })

      parsedData.value = response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to parse file'
    } finally {
      loading.value = false
    }
  }

  const uploadSheets = async (url: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ParsedData>('/api/parse', {
        method: 'POST',
        body: { sheetsUrl: url },
      })

      parsedData.value = response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to parse Google Sheet'
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    parsedData.value = null
    error.value = null
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    parsedData: readonly(parsedData),
    uploadFile,
    uploadSheets,
    reset,
  }
}
