<script setup lang="ts">
const { showWizard } = useAppNavigation()
</script>

<template>
  <UHeader toggle-side="left">
    <template #title>
      <span class="app-title">Slappy</span>
    </template>

    <template #default>
      <nav class="nav-menu">
        <UButton
          variant="ghost"
          color="neutral"
          leading-icon="i-heroicons-arrow-up-tray"
          @click="showWizard('csv')"
        >
          Upload CSV
        </UButton>
        <UButton
          variant="ghost"
          color="neutral"
          leading-icon="i-heroicons-link"
          @click="showWizard('sheets')"
        >
          Upload Google Sheet
        </UButton>
      </nav>
    </template>

    <template #right>
      <UColorModeButton />
      <UButton
        color="neutral"
        variant="ghost"
        to="https://github.com/pacphi/slappy"
        target="_blank"
        icon="i-simple-icons-github"
        aria-label="GitHub"
      />
    </template>

    <template #body>
      <nav class="nav-menu-mobile">
        <UButton
          variant="ghost"
          color="neutral"
          leading-icon="i-heroicons-arrow-up-tray"
          block
          @click="showWizard('csv')"
        >
          Upload CSV
        </UButton>
        <UButton
          variant="ghost"
          color="neutral"
          leading-icon="i-heroicons-link"
          block
          @click="showWizard('sheets')"
        >
          Upload Google Sheet
        </UButton>
      </nav>
    </template>
  </UHeader>
</template>

<style lang="postcss" scoped>
.app-title {
  @apply text-xl font-bold;
}

.nav-menu {
  @apply flex items-center gap-2;
}

.nav-menu-mobile {
  @apply flex flex-col gap-2;
}
</style>
