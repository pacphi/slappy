<script setup lang="ts">
useSeoMeta({
  title: 'Slappy - Professional Name Tags in 60 Seconds',
  description:
    'Transform your spreadsheets into print-ready TownStix US-10 labels instantly. Free, fast, and easy to use.',
  ogTitle: 'Slappy',
  ogDescription: 'Generate print-ready name tags from CSV files or Google Sheets',
})

const features = [
  {
    icon: 'i-heroicons-bolt',
    title: 'Generate in Seconds',
    description: 'Process hundreds of labels instantly. No waiting, no rendering delays.',
  },
  {
    icon: 'i-heroicons-adjustments-horizontal',
    title: 'Intelligent Mapping',
    description: 'Automatically detect columns or customize exactly how your data appears.',
  },
  {
    icon: 'i-heroicons-document-duplicate',
    title: 'Export Your Way',
    description: 'Download as HTML for quick edits or production-ready PDFs.',
  },
  {
    icon: 'i-heroicons-cloud',
    title: 'Google Sheets Ready',
    description: 'Connect your live spreadsheets. Update once, regenerate instantly.',
  },
  {
    icon: 'i-heroicons-printer',
    title: 'TownStix Precision',
    description: 'Exact 4×2" format for US-10 labels. First print perfect.',
  },
  {
    icon: 'i-heroicons-eye',
    title: 'Live Preview',
    description: 'Interactive preview with zoom. Catch errors before they hit paper.',
  },
]
</script>

<template>
  <div class="home-page">
    <!-- Header -->
    <OrganismsAppHeader />

    <!-- Hero Section (title + subtitle only) -->
    <section class="hero-section">
      <h1 class="hero-title">Professional Name Tags in 60 Seconds</h1>

      <p class="hero-subtitle">
        Transform your spreadsheets into print-ready labels instantly. No design skills required.
      </p>
    </section>

    <!-- Name Tag Wizard -->
    <section class="wizard-section">
      <OrganismsNameTagWizard />
    </section>

    <!-- Features Grid (3x2) -->
    <section class="features-section">
      <div class="features-container">
        <h2 class="features-heading">Why Choose Slappy?</h2>
        <div class="features-grid">
          <MoleculesFeatureCard
            v-for="feature in features"
            :key="feature.title"
            :icon="feature.icon"
            :title="feature.title"
            :description="feature.description"
          />
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="app-footer">
      <div class="footer-container">
        <p class="footer-text">
          Built with
          <UIcon name="i-heroicons-heart-solid" class="inline h-4 w-4 text-red-500" />
          using Nuxt & Vue
        </p>
        <p class="footer-text text-white/50">Open Source • Free Forever</p>
      </div>
    </footer>
  </div>
</template>

<style lang="postcss" scoped>
.home-page {
  @apply min-h-screen;
}

.hero-section {
  @apply mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 py-12;
}

.hero-badge {
  @apply rounded-full border px-4 py-2 text-sm backdrop-blur-sm;
  @apply border-neutral-200 bg-neutral-100 text-neutral-700;
  @apply dark:border-white/10 dark:bg-white/5 dark:text-white/80;
}

.hero-title {
  @apply max-w-4xl text-center text-4xl font-extrabold leading-tight;
}

.hero-subtitle {
  @apply max-w-2xl text-center text-lg leading-relaxed;
  @apply text-neutral-600 dark:text-white/70;
}

.wizard-section {
  @apply px-6 pb-12;
}

.features-section {
  @apply px-6 pb-16;
}

.features-container {
  @apply mx-auto max-w-6xl;
}

.features-heading {
  @apply mb-8 text-center text-2xl font-bold;
}

.features-grid {
  @apply grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3;
}

.app-footer {
  @apply border-t py-8;
  @apply border-neutral-200 bg-neutral-50;
  @apply dark:border-white/10 dark:bg-neutral-950/80;
}

.footer-container {
  @apply mx-auto flex max-w-6xl flex-col items-center gap-2 px-6 text-center;
}

.footer-text {
  @apply text-sm;
  @apply text-neutral-600 dark:text-white/70;
}
</style>
