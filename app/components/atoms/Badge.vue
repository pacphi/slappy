<script setup lang="ts">
defineProps<{
  variant?: 'default' | 'success' | 'warning' | 'error'
}>()
</script>

<template>
  <span :class="['badge', `badge-${variant || 'default'}`]">
    <slot />
  </span>
</template>

<style lang="postcss" scoped>
.badge {
  @apply inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium backdrop-blur-sm;
  @apply border transition-all;
}

.badge-default {
  @apply border-white/10 bg-white/5 text-white/80;
}

.badge-success {
  @apply border-green-500/30 bg-green-500/10 text-green-400;
}

.badge-warning {
  @apply border-yellow-500/30 bg-yellow-500/10 text-yellow-400;
}

.badge-error {
  @apply border-red-500/30 bg-red-500/10 text-red-400;
}
</style>
