import { ref, computed, readonly } from 'vue'
import type { ColumnMapping } from '#shared/types'
import { isValidMapping } from '#shared/validation'

export const useColumnMapping = (columnCount: number) => {
  const mapping = ref<ColumnMapping>({
    line1: 0,
    line2: columnCount > 1 ? 1 : null,
    line3: columnCount > 2 ? 2 : null,
  })

  const hasHeaders = ref(false)

  // C2: Check for duplicate column mappings
  const hasDuplicates = computed(() => {
    const mappedValues = [mapping.value.line1, mapping.value.line2, mapping.value.line3].filter(
      v => v !== null
    )

    const uniqueValues = new Set(mappedValues)
    return uniqueValues.size !== mappedValues.length
  })

  const isValid = computed(
    () =>
      isValidMapping(mapping.value) &&
      Object.values(mapping.value).every(value => value === null || value < columnCount)
  )

  const updateMapping = (line: keyof ColumnMapping, value: number | null) => {
    mapping.value[line] = value
  }

  const reset = () => {
    mapping.value = {
      line1: 0,
      line2: columnCount > 1 ? 1 : null,
      line3: columnCount > 2 ? 2 : null,
    }
    hasHeaders.value = false
  }

  return {
    mapping: readonly(mapping),
    hasHeaders,
    isValid,
    hasDuplicates: readonly(hasDuplicates),
    updateMapping,
    reset,
  }
}
