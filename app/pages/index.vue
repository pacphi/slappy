<script setup lang="ts">
/**
 * Slappy Homepage
 *
 * Main landing page with dual-view state:
 * - Features view: Landing page with hero and feature grid
 * - Wizard view: Three-step name tag generation wizard
 */

// Enhanced SEO meta tags with social sharing support
useSeoMeta({
  // Basic meta tags
  title: 'Slappy - Professional Name Tags in 60 Seconds',
  description:
    'Transform your spreadsheets into print-ready TownStix US-10 labels instantly. Free, fast, and easy to use.',
  keywords:
    'name tags, labels, CSV to PDF, TownStix, label maker, US-10 labels, Google Sheets, badge printing, event labels',
  author: 'Slappy',

  // Open Graph (Facebook, LinkedIn, etc.)
  ogType: 'website',
  ogUrl: 'https://slappy.cloud',
  ogTitle: 'Slappy - Professional Name Tags in 60 Seconds',
  ogDescription:
    'Generate print-ready name tags from CSV files or Google Sheets. TownStix US-10 format, 10 labels per sheet.',
  ogImage: 'https://slappy.cloud/og-image.png',
  ogImageAlt: 'Slappy - Transform spreadsheets into print-ready name tag labels',
  ogImageWidth: '1200',
  ogImageHeight: '630',
  ogSiteName: 'Slappy',
  ogLocale: 'en_US',

  // Twitter Card
  twitterCard: 'summary_large_image',
  twitterTitle: 'Slappy - Professional Name Tags in 60 Seconds',
  twitterDescription: 'Generate print-ready name tags from CSV files or Google Sheets instantly.',
  twitterImage: 'https://slappy.cloud/og-image.png',
  twitterImageAlt: 'Slappy - Transform spreadsheets into print-ready name tag labels',
})

// Canonical URL and structured data
useHead({
  link: [{ rel: 'canonical', href: 'https://slappy.cloud/' }],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Slappy',
        url: 'https://slappy.cloud',
        description:
          'Transform your spreadsheets into print-ready TownStix US-10 labels instantly. Free, fast, and easy to use.',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Any',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        featureList: [
          'CSV file upload',
          'Google Sheets integration',
          'TownStix US-10 format (4×2" labels)',
          'PDF and HTML export',
          'Live preview with zoom',
          'Intelligent column mapping',
        ],
      }),
    },
  ],
})

const { currentView, uploadMode } = useAppNavigation()
const appConfig = useAppConfig()
const isAdSenseEnabled = appConfig.features.adsense

const isFeaturesExpanded = ref(true)

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

    <!-- Name Tag Wizard (shown when navigation option is selected) -->
    <section v-if="currentView === 'wizard'" class="wizard-section">
      <OrganismsNameTagWizard :initial-upload-mode="uploadMode" />
    </section>

    <!-- Features Grid (shown by default) -->
    <section v-if="currentView === 'features'" class="features-section">
      <div class="hero-text">
        <h1 class="hero-title">Professional Name Tags in 60 Seconds</h1>
        <p class="hero-description">
          Transform your spreadsheets into print-ready labels instantly. No design skills required.
        </p>
      </div>

      <!-- Google AdSense - Landing Page Ad (only shown when feature flag is enabled) -->
      <MoleculesAdSenseAd v-if="isAdSenseEnabled" ad-slot="LANDING_HERO_AD_SLOT_ID" format="horizontal" />

      <div class="features-container">
        <button class="features-heading-button" @click="isFeaturesExpanded = !isFeaturesExpanded">
          <h2 class="features-heading">Why Choose Slappy?</h2>
          <UIcon
            :name="isFeaturesExpanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
            class="chevron-icon"
          />
        </button>
        <div v-show="isFeaturesExpanded" class="features-grid">
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
          Built with <UIcon name="i-heroicons-heart-solid" class="h-4 w-4 text-red-500" /> using
          Nuxt & Vue
        </p>
      </div>
    </footer>
  </div>
</template>

<style lang="postcss" scoped>
.home-page {
  @apply min-h-screen;
  padding: 50px;
}

.wizard-section {
  @apply px-6 pb-12;
  padding-top: 50px;
}

.features-section {
  @apply px-6 pb-16;
  padding-top: 50px;
}

.hero-text {
  @apply mx-auto max-w-4xl text-center;
  margin-bottom: 50px;
}

.hero-title {
  @apply mb-4 text-4xl font-bold md:text-5xl;
}

.hero-description {
  @apply text-lg text-neutral-600 dark:text-white/70;
}

.features-container {
  @apply mx-auto max-w-6xl;
}

.features-heading-button {
  @apply relative flex w-full cursor-pointer items-center justify-center gap-3;
  padding: 5px;
  @apply border-b border-white/10 bg-white/5 backdrop-blur-sm;
  @apply font-semibold text-white/60 transition-all;
  @apply hover:bg-white/10;
  margin-bottom: 2rem;
}

.features-heading-button:hover {
  @apply text-white;
}

.features-heading {
  @apply text-2xl font-semibold;
  margin-bottom: 0;
}

.chevron-icon {
  width: 24px;
  height: 24px;
  transition: transform 0.3s ease;
}

.features-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

@media (min-width: 640px) {
  .features-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 1024px) {
  .features-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.app-footer {
  @apply border-t py-8;
  @apply border-neutral-200 bg-neutral-50;
  @apply dark:border-white/10 dark:bg-neutral-950/80;
  margin-top: 50px;
}

.footer-container {
  @apply mx-auto flex max-w-6xl flex-col items-center gap-2 px-6 text-center;
}

.footer-text {
  @apply text-sm;
  @apply text-neutral-600 dark:text-white/70;
}
</style>
