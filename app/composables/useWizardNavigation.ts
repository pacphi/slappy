import { ref, computed } from 'vue'
import type { WizardStep } from '~/types'

export const useWizardNavigation = () => {
  const currentStep = ref<WizardStep>('upload')

  const stepIndex = computed(() => {
    const steps: WizardStep[] = ['upload', 'mapping', 'preview']
    return steps.indexOf(currentStep.value)
  })

  const goToStep = (step: WizardStep) => {
    currentStep.value = step
  }

  const nextStep = () => {
    if (currentStep.value === 'upload') {
      currentStep.value = 'mapping'
    } else if (currentStep.value === 'mapping') {
      currentStep.value = 'preview'
    }
  }

  const previousStep = () => {
    if (currentStep.value === 'preview') {
      currentStep.value = 'mapping'
    } else if (currentStep.value === 'mapping') {
      currentStep.value = 'upload'
    }
  }

  const reset = () => {
    currentStep.value = 'upload'
  }

  return {
    currentStep: readonly(currentStep),
    stepIndex,
    goToStep,
    nextStep,
    previousStep,
    reset,
  }
}
