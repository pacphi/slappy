<template>
  <div class="content-box">
    <slot />
  </div>
</template>

<style lang="postcss" scoped>
.content-box {
  @apply rounded-2xl bg-neutral-900/30 p-4;
}
</style>
