import { ref, computed } from 'vue'
import type { ColumnMapping } from '~/types'

export const useColumnMapping = (columnCount: number) => {
  const mapping = ref<ColumnMapping>({
    line1: 0,
    line2: columnCount > 1 ? 1 : null,
    line3: columnCount > 2 ? 2 : null,
  })

  const hasHeaders = ref(false)

  const isValid = computed(() => {
    return (
      mapping.value.line1 !== null || mapping.value.line2 !== null || mapping.value.line3 !== null
    )
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
    updateMapping,
    reset,
  }
}
