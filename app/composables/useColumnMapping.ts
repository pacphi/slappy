import { ref, computed } from 'vue'
import type { ColumnMapping } from '~/types'

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

  const isValid = computed(() => {
    // Must have at least one mapping AND no duplicates
    const hasMapping =
      mapping.value.line1 !== null || mapping.value.line2 !== null || mapping.value.line3 !== null

    return hasMapping && !hasDuplicates.value
  })

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
