<script setup lang="ts">
const colorMode = useColorMode()

const isDark = computed(() => colorMode.value === 'dark')

const toggleTheme = () => {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}
</script>

<template>
  <header class="app-header">
    <div class="header-container">
      <div class="header-top">
        <button
          class="theme-toggle"
          :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggleTheme"
        >
          <UIcon v-if="isDark" name="i-heroicons-sun" class="h-5 w-5" />
          <UIcon v-else name="i-heroicons-moon" class="h-5 w-5" />
        </button>
        <h1 class="app-title">Slappy</h1>
      </div>
      <div class="header-text">
        <p class="header-subtitle">Professional Name Tags in 60 Seconds</p>
        <p class="header-description">
          Transform your spreadsheets into print-ready labels instantly. No design skills required.
        </p>
      </div>
    </div>
  </header>
</template>

<style lang="postcss" scoped>
.app-header {
  @apply border-b backdrop-blur-sm;
  @apply border-neutral-200 bg-white/80;
  @apply dark:border-white/10 dark:bg-neutral-950/80;
}

.header-container {
  @apply mx-auto max-w-6xl px-6 py-4;
}

.header-top {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-title {
  @apply text-2xl font-bold;
  margin: 0;
}

.header-text {
  @apply mt-2 flex flex-col gap-1;
  margin-left: 46px; /* Align with title (toggle width + gap) */
}

.header-subtitle {
  @apply text-lg leading-normal;
  @apply text-neutral-600 dark:text-white/70;
  margin: 0;
}

.header-description {
  @apply text-lg leading-normal;
  @apply text-neutral-600 dark:text-white/70;
  margin: 0;
}

.theme-toggle {
  @apply flex h-10 w-10 items-center justify-center rounded-full transition-all;
  @apply bg-neutral-100 hover:bg-neutral-200;
  @apply dark:bg-white/5 dark:hover:bg-white/10;

  &:active {
    @apply scale-95;
  }
}
</style>
