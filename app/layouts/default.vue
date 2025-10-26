<script setup lang="ts">
useSeoMeta({
  title: 'Slappy',
  description: 'Generate print-ready name tags in TownStix US-10 format',
  ogTitle: 'Slappy',
  ogDescription: 'Transform spreadsheets into print-ready labels instantly',
})
</script>

<template>
  <div
    class="min-h-screen transition-colors duration-200 bg-white text-neutral-900 dark:bg-neutral-950 dark:text-white"
  >
    <Transition name="fade" mode="out-in">
      <slot />
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 250ms;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
