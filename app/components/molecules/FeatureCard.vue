<script setup lang="ts">
defineProps<{
  icon: string
  title: string
  description: string
}>()
</script>

<template>
  <div class="feature-card">
    <div class="feature-header">
      <div class="feature-icon">
        <UIcon :name="icon" class="h-5 w-5 text-white" />
      </div>
      <h3 class="feature-title">{{ title }}</h3>
    </div>
    <p class="feature-description">{{ description }}</p>
  </div>
</template>

<style lang="postcss" scoped>
.feature-card {
  @apply relative flex flex-col gap-3 rounded-lg border border-white/10 bg-neutral-900/20 p-5 transition-all duration-300;
  @apply hover:border-purple-500/30 hover:bg-neutral-900/30 hover:shadow-lg hover:shadow-purple-500/5;
}

.feature-header {
  @apply flex items-center gap-3;
}

.feature-icon {
  @apply flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-b from-purple-500 to-purple-700;
  @apply transition-transform duration-300;

  .feature-card:hover & {
    @apply scale-110;
  }
}

.feature-title {
  @apply text-base font-semibold text-white;
}

.feature-description {
  @apply pl-12 text-sm leading-relaxed text-white/60;
}
</style>
