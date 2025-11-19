import { defineFeatureFlags } from '#feature-flags/handler'

/**
 * Feature Flags Configuration
 *
 * Centralized feature flag management for Slappy.
 * Flags can be static booleans or dynamic with context-aware evaluation.
 *
 * @see https://nuxt-feature-flags-docs.vercel.app/
 */
export default defineFeatureFlags(() => ({
  /**
   * Google AdSense Integration
   *
   * Controls whether Google AdSense ads are displayed throughout the application.
   * When disabled:
   * - AdSense script will not be loaded
   * - No DNS prefetch/preconnect for AdSense domains
   * - Ad components will not render
   * - Zero performance impact from AdSense
   *
   * When enabled:
   * - AdSense script loads asynchronously
   * - DNS prefetch/preconnect optimizations enabled
   * - Ad slots render on landing page and preview panel
   */
  adsense: {
    enabled: process.env.NUXT_PUBLIC_GOOGLE_ADSENSE_ENABLED === 'true',
    description: 'Google AdSense integration for monetization',
  },

  // Example: Future feature flags
  // Uncomment and customize as needed:

  // /**
  //  * Dark Mode Beta
  //  *
  //  * Enable beta dark mode theme variant
  //  */
  // darkModeBeta: {
  //   enabled: process.env.NODE_ENV === 'development',
  //   description: 'Beta dark mode theme with improved contrast',
  // },

  // /**
  //  * New Wizard UI (A/B Test)
  //  *
  //  * Test new wizard design against classic design
  //  */
  // newWizardUI: {
  //   enabled: true,
  //   description: 'A/B test for modernized wizard interface',
  //   variants: [
  //     { name: 'control', weight: 50, value: 'classic' },
  //     { name: 'treatment', weight: 50, value: 'modern' },
  //   ],
  // },
}))
