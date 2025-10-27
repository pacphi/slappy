<script setup lang="ts">
defineProps<{
  title: string
  isActive: boolean
  isCompleted: boolean
  isLocked: boolean
}>()

const emit = defineEmits<{
  click: []
}>()

const handleClick = () => {
  emit('click')
}
</script>

<template>
  <button
    :class="[
      'column-header',
      {
        active: isActive,
        completed: isCompleted,
        locked: isLocked,
      },
    ]"
    :disabled="isLocked"
    @click="handleClick"
  >
    <span class="header-title">{{ title }}</span>
    <UIcon v-if="isCompleted" name="i-heroicons-check-circle" class="completion-icon" />
    <UIcon v-else-if="isLocked" name="i-heroicons-lock-closed" class="lock-icon" />
  </button>
</template>

<style lang="postcss" scoped>
.column-header {
  @apply relative flex items-center justify-between gap-3;
  padding: 5px;
  @apply border-b border-white/10 bg-white/5 backdrop-blur-sm;
  @apply text-left font-semibold text-white/60 transition-all;
  @apply hover:bg-white/10;

  &.active {
    @apply border-b-2 border-purple-500 bg-white/10 text-white;
  }

  &.completed {
    @apply cursor-pointer text-white/80;

    &:hover {
      @apply text-white;
    }
  }

  &.locked {
    @apply cursor-not-allowed opacity-50;
    @apply hover:bg-white/5;
  }
}

.header-title {
  @apply text-lg;
}

.completion-icon {
  @apply h-5 w-5 text-green-400;
}

.lock-icon {
  @apply h-5 w-5 text-white/30;
}
</style>
