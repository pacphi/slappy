import { ref, readonly } from 'vue'

export type UploadMode = 'csv' | 'sheets'
export type AppView = 'features' | 'wizard'

// Shared state (created once, outside the composable)
const currentView = ref<AppView>('features')
const uploadMode = ref<UploadMode>('csv')

export const useAppNavigation = () => {
  const showFeatures = () => {
    currentView.value = 'features'
  }

  const showWizard = (mode: UploadMode) => {
    uploadMode.value = mode
    currentView.value = 'wizard'
  }

  return {
    currentView: readonly(currentView),
    uploadMode: readonly(uploadMode),
    showFeatures,
    showWizard,
  }
}
