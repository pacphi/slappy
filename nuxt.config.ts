// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  future: { compatibilityVersion: 4 },
  modules: ['@nuxt/ui', '@pinia/nuxt', '@pinia/colada-nuxt', '@nuxt/eslint'],
  css: ['~/assets/css/main.css'],
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
