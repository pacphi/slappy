<script setup lang="ts">
/**
 * Root App Component
 *
 * Configures global head meta tags, scripts, and resource hints for the entire application.
 * Includes Google AdSense integration (when enabled) and performance optimizations.
 */

const config = useRuntimeConfig()
const { isEnabled } = useFeatureFlags()
const isAdSenseEnabled = isEnabled('adsense')
const publisherId = config.public.googleAdSenseAccount

useHead({
  htmlAttrs: { lang: 'en' },
  meta: [
    // Critical viewport meta tag for mobile SEO and responsive design
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    // Theme color for mobile browsers and PWA
    { name: 'theme-color', content: '#8646F4' },
    // Google AdSense verification meta tag
    // Only added when AdSense is enabled and Publisher ID is configured
    ...(isAdSenseEnabled && publisherId
      ? [{ name: 'google-adsense-account', content: publisherId }]
      : []),
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
    // Only loaded when AdSense is enabled and Publisher ID is configured
    ...(isAdSenseEnabled && publisherId
      ? [
          {
            src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`,
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
