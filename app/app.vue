<script setup lang="ts">
/**
 * Root App Component
 *
 * Configures dynamic head elements based on feature flags and runtime configuration.
 *
 * Note: The Google AdSense verification meta tag is configured in nuxt.config.ts
 * for site ownership verification. This component only handles the conditional
 * loading of AdSense scripts and performance optimizations when ads are enabled.
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
