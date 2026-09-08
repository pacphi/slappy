import { ref, readonly, shallowReadonly } from 'vue'
import type { ParsedData } from '#shared/types'

export const useDataUpload = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const parsedData = ref<ParsedData | null>(null)
  let latestRequest = 0

  const upload = async (body: FormData | { sheetsUrl: string }, failureMessage: string) => {
    const request = ++latestRequest
    loading.value = true
    error.value = null
    parsedData.value = null
    try {
      const response = await $fetch<ParsedData>('/api/parse', { method: 'POST', body })
      if (request !== latestRequest) return false
      parsedData.value = response
      return true
    } catch (err) {
      if (request === latestRequest) {
        error.value = err instanceof Error ? err.message : failureMessage
      }
      return false
    } finally {
      if (request === latestRequest) loading.value = false
    }
  }

  const uploadFile = (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return upload(formData, 'Failed to parse file')
  }
  const uploadSheets = (url: string) => upload({ sheetsUrl: url }, 'Failed to parse Google Sheet')

  const reset = () => {
    latestRequest++
    loading.value = false
    parsedData.value = null
    error.value = null
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    parsedData: shallowReadonly(parsedData),
    uploadFile,
    uploadSheets,
    reset,
  }
}
