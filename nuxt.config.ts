import { version } from './package.json'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  future: { compatibilityVersion: 4 },
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@pinia/colada-nuxt',
    '@nuxt/eslint',
    '@nuxtjs/seo',
    'nuxt-feature-flags',
  ],
  css: ['~/assets/css/main.css'],

  // Social previews use public/og-image.png; no dynamic image renderer is needed.
  ogImage: { enabled: false },

  // SEO Configuration
  site: {
    url: 'https://slappy.cloud',
    name: 'Slappy',
    description:
      'Transform your spreadsheets into print-ready TownStix US-10 or Avery 5390 name tags instantly. Free, fast, and easy to use.',
    defaultLocale: 'en',
  },

  // Global head configuration
  app: {
    head: {
      meta: [
        // Google AdSense site verification meta tag
        // This verifies site ownership for Google AdSense
        {
          name: 'google-adsense-account',
          content: process.env.NUXT_PUBLIC_GOOGLE_ADSENSE_ACCOUNT,
        },
      ],
    },
  },

  // Sitemap configuration
  sitemap: {
    strictNuxtContentPaths: true,
    // Only include the homepage for now (single-page app)
    urls: ['https://slappy.cloud/'],
    // Exclude API endpoints and internal routes
    exclude: ['/api/**'],
  },

  // Robots.txt configuration
  robots: {
    // Allow all crawlers
    allow: '/',
    // Disallow API endpoints
    disallow: ['/api/'],
    // Reference sitemap
    sitemap: 'https://slappy.cloud/sitemap.xml',
  },
  ui: {
    colorMode: true, // Enable color mode support (default: true)
  },
  colorMode: {
    preference: 'dark', // Default to dark mode
    fallback: 'dark', // Defaults to dark if no preference detected
    classSuffix: '', // Remove '-mode' suffix for compatibility
  },
  runtimeConfig: {
    public: {
      appName: 'Slappy',
      version,
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'https://slappy.cloud',
      googleAdSenseAccount: process.env.NUXT_PUBLIC_GOOGLE_ADSENSE_ACCOUNT || '',
      googleAdSenseEnabled: process.env.NUXT_PUBLIC_GOOGLE_ADSENSE_ENABLED === 'true',
    },
  },
  vite: {
    build: {
      // Minify compiled CSS; component @apply rules are resolved by Tailwind first.
      cssMinify: 'lightningcss',
    },
    optimizeDeps: {
      include: ['vue', 'vue-router', 'pinia', '@pinia/colada'],
    },
    ssr: {
      noExternal: ['vue', 'vue-router', '@nuxt/ui'],
    },
  },
})
