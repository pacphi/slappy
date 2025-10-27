import { ref, computed } from 'vue'
import type { WizardStep } from '~/types'

const STEP_ORDER: WizardStep[] = ['upload', 'mapping', 'preview']

export const useWizardNavigation = () => {
  const currentStep = ref<WizardStep>('upload')
  const completedSteps = ref<Set<WizardStep>>(new Set())

  const stepIndex = computed(() => {
    return STEP_ORDER.indexOf(currentStep.value)
  })

  const getStepIndex = (step: WizardStep): number => {
    return STEP_ORDER.indexOf(step)
  }

  const markStepComplete = (step: WizardStep) => {
    completedSteps.value.add(step)
  }

  const canNavigateToStep = (step: WizardStep): boolean => {
    // Can navigate to current step, completed steps, or the next step after the last completed
    if (step === currentStep.value) return true
    if (completedSteps.value.has(step)) return true

    // Can navigate to the step immediately after any completed step
    const stepIdx = getStepIndex(step)
    if (stepIdx === 0) return true // Upload is always accessible

    const previousStep = STEP_ORDER[stepIdx - 1]
    return completedSteps.value.has(previousStep)
  }

  const goToStep = (step: WizardStep) => {
    if (!canNavigateToStep(step)) return

    currentStep.value = step

    // If navigating back, invalidate all downstream steps
    const targetIndex = getStepIndex(step)
    STEP_ORDER.forEach((s, idx) => {
      if (idx > targetIndex) {
        completedSteps.value.delete(s)
      }
    })
  }

  const nextStep = () => {
    if (currentStep.value === 'upload') {
      markStepComplete('upload')
      currentStep.value = 'mapping'
    } else if (currentStep.value === 'mapping') {
      markStepComplete('mapping')
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
    completedSteps.value.clear()
  }

  const isStepCompleted = (step: WizardStep): boolean => {
    return completedSteps.value.has(step)
  }

  const isStepLocked = (step: WizardStep): boolean => {
    return !canNavigateToStep(step)
  }

  return {
    currentStep: readonly(currentStep),
    completedSteps: readonly(completedSteps),
    stepIndex,
    goToStep,
    nextStep,
    previousStep,
    markStepComplete,
    canNavigateToStep,
    isStepCompleted,
    isStepLocked,
    reset,
  }
}
