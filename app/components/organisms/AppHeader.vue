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
      <div class="header-content">
        <h1 class="app-title">Slappy</h1>
        <button
          class="theme-toggle"
          :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggleTheme"
        >
          <UIcon v-if="isDark" name="i-heroicons-sun" class="h-5 w-5" />
          <UIcon v-else name="i-heroicons-moon" class="h-5 w-5" />
        </button>
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
  @apply mx-auto max-w-6xl px-6;
}

.header-content {
  @apply flex items-center justify-between py-4;
}

.app-title {
  @apply text-xl font-bold;
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
