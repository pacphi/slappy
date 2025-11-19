<script setup lang="ts">
/**
 * Root App Component
 *
 * Configures global head meta tags, scripts, and resource hints for the entire application.
 * Includes Google AdSense integration (when enabled) and performance optimizations.
 */

const appConfig = useAppConfig()
const isAdSenseEnabled = appConfig.features?.adsense ?? false

useHead({
  htmlAttrs: { lang: 'en' },
  meta: [
    // Critical viewport meta tag for mobile SEO and responsive design
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    // Theme color for mobile browsers and PWA
    { name: 'theme-color', content: '#8646F4' },
    // Google AdSense verification (replace with your verification code after signup)
    // Only added when AdSense is enabled
    // ...(isAdSenseEnabled ? [{ name: 'google-adsense-account', content: 'ca-pub-XXXXXXXXXXXXXXXX' }] : []),
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' },
    // DNS prefetch and preconnect for Google AdSense (performance optimization)
    // Only added when AdSense is enabled
    ...(isAdSenseEnabled
      ? [
          { rel: 'dns-prefetch', href: 'https://pagead2.googlesyndication.com' },
          { rel: 'dns-prefetch', href: 'https://googleads.g.doubleclick.net' },
          { rel: 'preconnect', href: 'https://pagead2.googlesyndication.com' },
        ]
      : []),
  ],
  script: [
    // Google AdSense async script
    // NOTE: Replace ca-pub-XXXXXXXXXXXXXXXX with your actual AdSense Publisher ID
    // Only loaded when AdSense is enabled
    ...(isAdSenseEnabled
      ? [
          {
            src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX',
            async: true,
            crossorigin: 'anonymous',
          },
        ]
      : []),
  ],
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
