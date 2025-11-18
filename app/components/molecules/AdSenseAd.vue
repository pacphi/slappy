<script setup lang="ts">
/**
 * Google AdSense Ad Component
 *
 * Displays Google AdSense ads with glassmorphism styling to match the app's design.
 * Automatically initializes ads when mounted and handles responsive behavior.
 *
 * @example
 * <AdSenseAd slot="1234567890" format="horizontal" />
 */

interface Props {
  /**
   * AdSense ad slot ID (from your AdSense account)
   * @example "1234567890"
   */
  slot: string

  /**
   * Ad format/style
   * @default "display"
   */
  format?: 'display' | 'horizontal' | 'vertical'

  /**
   * Whether to use full-width responsive ads
   * @default true
   */
  responsive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  format: 'display',
  responsive: true,
})

// Initialize ads when component mounts
onMounted(() => {
  // Push ads to AdSense queue (window.adsbygoogle)
  try {
    if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
      ;((window as any).adsbygoogle = (window as any).adsbygoogle || []).push(
        {},
      )
    }
  } catch (error) {
    console.error('AdSense error:', error)
  }
})
</script>

<template>
  <div class="adsense-container">
    <ins
      class="adsbygoogle"
      style="display: block"
      data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
      :data-ad-slot="slot"
      :data-ad-format="responsive ? 'auto' : format"
      :data-full-width-responsive="responsive ? 'true' : 'false'"
    ></ins>
  </div>
</template>

<style lang="postcss" scoped>
.adsense-container {
  @apply relative overflow-hidden rounded-xl border p-4;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(8px);
  border-color: rgba(255, 255, 255, 0.08);
  margin: 1.5rem 0;

  /* Match app's glassmorphism style */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.12);
  }
}

/* Ensure ads are centered and constrained */
.adsbygoogle {
  @apply mx-auto;
  max-width: 100%;
}

/* Dark mode adjustments */
:global(.dark) .adsense-container {
  background: rgba(255, 255, 255, 0.02);
  border-color: rgba(255, 255, 255, 0.06);

  &:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.1);
  }
}
</style>
