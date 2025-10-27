<script setup lang="ts">
import type { ErrorContext } from '~/utils/error-messages'

defineProps<{
  errorContext: ErrorContext
}>()

const emit = defineEmits<{
  retry: []
  dismiss: []
}>()

const actions = computed(() => [
  {
    label: 'Try Again',
    variant: 'outline' as const,
    click: () => emit('retry'),
  },
  {
    label: 'Dismiss',
    variant: 'ghost' as const,
    click: () => emit('dismiss'),
  },
])
</script>

<template>
  <UAlert
    color="error"
    variant="soft"
    icon="i-heroicons-exclamation-circle"
    :title="errorContext.message"
    :description="errorContext.solution"
    :actions="actions"
  >
    <template v-if="errorContext.helpLink" #actions>
      <div class="flex items-center gap-3">
        <a
          :href="errorContext.helpLink"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1 text-sm hover:underline"
        >
          Learn more
          <UIcon name="i-heroicons-arrow-top-right-on-square" class="h-4 w-4" />
        </a>
        <UButton variant="outline" @click="emit('retry')">Try Again</UButton>
        <UButton variant="ghost" @click="emit('dismiss')">Dismiss</UButton>
      </div>
    </template>
  </UAlert>
</template>
