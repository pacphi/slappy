<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}>()

defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    :class="['button', `button-${variant || 'primary'}`, `button-${size || 'md'}`, { disabled }]"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<style lang="postcss" scoped>
.button {
  @apply flex items-center justify-center gap-2 rounded-lg font-medium transition-all;

  &:active:not(.disabled) {
    @apply scale-95;
  }

  &.disabled {
    @apply cursor-not-allowed opacity-50;
  }
}

.button-primary {
  @apply bg-gradient-to-b from-purple-500 to-purple-700 text-white hover:opacity-90;
}

.button-secondary {
  @apply bg-white/10 text-white hover:bg-white/20;
}

.button-ghost {
  @apply bg-transparent text-white hover:bg-white/5;
}

.button-sm {
  @apply px-3 py-1.5 text-xs;
}

.button-md {
  @apply px-4 py-2 text-sm;
}

.button-lg {
  @apply px-6 py-3 text-base;
}
</style>
