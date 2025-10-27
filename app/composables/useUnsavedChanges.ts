import { computed, onMounted, onUnmounted } from 'vue'
import { useDataUpload } from './useDataUpload'

/**
 * Protects users from accidentally losing work by warning them before:
 * - Browser navigation (back/forward)
 * - Tab close
 * - Page refresh
 * - URL navigation
 */
export const useUnsavedChanges = () => {
  const { parsedData } = useDataUpload()

  const hasUnsavedWork = computed(() => {
    return parsedData.value !== null
  })

  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (hasUnsavedWork.value) {
      e.preventDefault()
      e.returnValue = 'You have unsaved work. Are you sure you want to leave?'
      return e.returnValue
    }
  }

  onMounted(() => {
    window.addEventListener('beforeunload', handleBeforeUnload)
  })

  onUnmounted(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  })

  return {
    hasUnsavedWork: readonly(hasUnsavedWork),
  }
}
