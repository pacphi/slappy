<template>
  <div class="card">
    <slot />
  </div>
</template>

<style lang="postcss" scoped>
.card {
  @apply relative flex h-full w-full flex-col overflow-hidden rounded-[2rem] bg-neutral-900/50 text-white;
  @apply border border-white/5 backdrop-blur-sm;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
</style>
