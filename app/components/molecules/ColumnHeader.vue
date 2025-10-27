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
    class="flex items-center justify-between gap-3 border-b p-1 text-left font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50"
    :class="{
      'border-primary': isActive,
      'hover:bg-muted': !isLocked,
    }"
    :disabled="isLocked"
    @click="handleClick"
  >
    <span class="text-lg">{{ title }}</span>
    <UIcon v-if="isCompleted" name="i-heroicons-check-circle" class="h-5 w-5 text-success" />
    <UIcon v-else-if="isLocked" name="i-heroicons-lock-closed" class="h-5 w-5 opacity-30" />
  </button>
</template>
