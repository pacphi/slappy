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

  // SEO Configuration
  site: {
    url: 'https://slappy.cloud',
    name: 'Slappy',
    description:
      'Transform your spreadsheets into print-ready TownStix US-10 labels instantly. Free, fast, and easy to use.',
    defaultLocale: 'en',
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
      version: '2.0.0',
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'https://slappy.cloud',
      features: {
        adsense: false, // Enable/disable Google AdSense integration
      },
    },
  },
  vite: {
    build: {
      // Suppress esbuild CSS minifier warnings for PostCSS/Tailwind @apply directives
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
