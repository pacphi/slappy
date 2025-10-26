<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  currentStep: 'upload' | 'mapping' | 'preview'
}>()

const steps = [
  { id: 'upload', label: 'Upload', icon: 'i-heroicons-arrow-up-tray' },
  { id: 'mapping', label: 'Map Columns', icon: 'i-heroicons-adjustments-horizontal' },
  { id: 'preview', label: 'Preview', icon: 'i-heroicons-eye' },
]

const currentStepIndex = computed(() => {
  return steps.findIndex(step => step.id === props.currentStep)
})

const isStepComplete = (index: number) => {
  return index < currentStepIndex.value
}

const isStepCurrent = (index: number) => {
  return index === currentStepIndex.value
}
</script>

<template>
  <div class="progress-indicator">
    <div
      v-for="(step, index) in steps"
      :key="step.id"
      class="progress-step"
      :class="{
        'is-complete': isStepComplete(index),
        'is-current': isStepCurrent(index),
      }"
    >
      <div class="step-icon-wrapper">
        <div class="step-icon">
          <UIcon v-if="isStepComplete(index)" name="i-heroicons-check" class="h-5 w-5" />
          <UIcon v-else :name="step.icon" class="h-5 w-5" />
        </div>
      </div>
      <span class="step-label">{{ step.label }}</span>
      <div v-if="index < steps.length - 1" class="step-connector" />
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.progress-indicator {
  @apply flex items-center justify-center gap-4 py-6;
}

.progress-step {
  @apply relative flex flex-col items-center gap-2;
}

.step-icon-wrapper {
  @apply relative z-10;
}

.step-icon {
  @apply flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/10 bg-white/5 text-white/50 transition-all;

  .is-complete & {
    @apply border-purple-500 bg-purple-500 text-white;
  }

  .is-current & {
    @apply border-purple-500 bg-purple-500/20 text-purple-400 shadow-lg shadow-purple-500/25;
  }
}

.step-label {
  @apply text-sm font-medium text-white/50 transition-colors;

  .is-complete &,
  .is-current & {
    @apply text-white;
  }
}

.step-connector {
  @apply absolute left-full top-6 h-0.5 w-16 -translate-y-1/2 bg-white/10 transition-colors;

  .is-complete & {
    @apply bg-purple-500;
  }
}
</style>
