<script setup lang="ts">
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
  <section class="hero-section">
    <!-- Headline -->
    <h1 class="hero-title">Professional Name Tags in 60 Seconds</h1>

    <!-- Subtitle -->
    <p class="hero-subtitle">
      Transform your spreadsheets into print-ready labels instantly. No design skills required.
    </p>

    <!-- Features Grid (3x2 as requested) -->
    <div class="features-grid">
      <MoleculesFeatureCard
        v-for="feature in features"
        :key="feature.title"
        :icon="feature.icon"
        :title="feature.title"
        :description="feature.description"
      />
    </div>
  </section>
</template>

<style lang="postcss" scoped>
.hero-section {
  @apply mx-auto flex max-w-6xl flex-col items-center gap-12 px-6 py-16;
}

.hero-badge {
  @apply rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur-sm;
}

.hero-title {
  @apply max-w-4xl text-center text-5xl font-extrabold leading-tight text-white;
}

.hero-subtitle {
  @apply max-w-2xl text-center text-xl leading-relaxed text-white/70;
}

.features-grid {
  @apply grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3;
}
</style>
