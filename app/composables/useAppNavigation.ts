import { readonly } from 'vue'
import { useState } from '#app'

export type UploadMode = 'csv' | 'sheets'
export type AppView = 'features' | 'wizard'

export const useAppNavigation = () => {
  const currentView = useState<AppView>('app-current-view', () => 'features')
  const uploadMode = useState<UploadMode>('app-upload-mode', () => 'csv')

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
