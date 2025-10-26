<script setup lang="ts">
defineProps<{
  icon: string
  title: string
  description: string
}>()
</script>

<template>
  <div class="feature-card">
    <div class="feature-icon-wrapper">
      <div class="feature-icon">
        <UIcon :name="icon" class="h-7 w-7 text-white" />
      </div>
    </div>
    <h3 class="feature-title">{{ title }}</h3>
    <p class="feature-description">{{ description }}</p>
  </div>
</template>

<style lang="postcss" scoped>
.feature-card {
  @apply relative flex flex-col items-center gap-3 rounded-2xl bg-neutral-900/30 p-6 text-center transition-all duration-300;
  @apply border border-white/5 hover:border-purple-500/20 hover:bg-neutral-900/40;
}

.feature-icon-wrapper {
  @apply relative;
}

.feature-icon {
  @apply flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-b from-purple-500 to-purple-700;
  @apply transition-transform duration-300;

  .feature-card:hover & {
    @apply scale-110;
  }
}

.feature-title {
  @apply text-lg font-semibold text-white;
}

.feature-description {
  @apply text-sm leading-relaxed text-white/60;
}
</style>
