<script setup lang="ts">
defineProps<{
  icon: string
  title: string
  description: string
}>()
</script>

<template>
  <UCard variant="outline">
    <div class="flex items-center gap-3">
      <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
        <UIcon :name="icon" class="h-5 w-5" />
      </div>
      <h3 class="font-semibold">{{ title }}</h3>
    </div>
    <p class="pl-12 text-sm opacity-70">{{ description }}</p>
  </UCard>
</template>
