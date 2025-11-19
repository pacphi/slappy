<script setup lang="ts">
/**
 * Social Share Component
 *
 * Provides share buttons for Facebook, Bluesky, and X (Twitter).
 * Shares a customizable message about the generated name tags.
 */

interface Props {
  /**
   * Number of name tags generated
   */
  tagCount?: number
  /**
   * Optional custom share text
   */
  shareText?: string
}

const props = withDefaults(defineProps<Props>(), {
  tagCount: 0,
  shareText: '',
})

const config = useRuntimeConfig()
const appUrl = config.public.appUrl || 'https://slappy.cloud'

// Generate share message
const defaultShareText = computed(() => {
  if (props.tagCount > 0) {
    return `Just created ${props.tagCount} professional name tags in seconds with Slappy! 🏷️`
  }
  return 'Create print-ready name tags from CSV files in seconds with Slappy! 🏷️'
})

const shareText = computed(() => props.shareText || defaultShareText.value)

// Share URLs
const shareUrls = computed(() => ({
  facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}&quote=${encodeURIComponent(shareText.value)}`,
  bluesky: `https://bsky.app/intent/compose?text=${encodeURIComponent(`${shareText.value} ${appUrl}`)}`,
  twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText.value)}&url=${encodeURIComponent(appUrl)}`,
}))

// Open share dialog
const share = (platform: 'facebook' | 'bluesky' | 'twitter') => {
  const url = shareUrls.value[platform]
  const width = 600
  const height = 400
  const left = (window.screen.width - width) / 2
  const top = (window.screen.height - height) / 2

  window.open(
    url,
    `share-${platform}`,
    `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
  )
}

// Native Web Share API (mobile fallback)
const canUseNativeShare = ref(false)

onMounted(() => {
  canUseNativeShare.value = typeof navigator !== 'undefined' && !!navigator.share
})

const nativeShare = async () => {
  if (!navigator.share) return

  try {
    await navigator.share({
      title: 'Slappy - Name Tag Generator',
      text: shareText.value,
      url: appUrl,
    })
  } catch {
    // User cancelled or error occurred - ignore silently
  }
}
</script>

<template>
  <div class="social-share">
    <div class="share-label">Share your creation:</div>

    <div class="share-buttons">
      <!-- Facebook -->
      <UButton
        icon="i-simple-icons-facebook"
        color="primary"
        variant="soft"
        size="sm"
        aria-label="Share on Facebook"
        @click="share('facebook')"
      >
        <span class="button-text">Facebook</span>
      </UButton>

      <!-- Bluesky -->
      <UButton
        icon="i-simple-icons-bluesky"
        color="primary"
        variant="soft"
        size="sm"
        aria-label="Share on Bluesky"
        @click="share('bluesky')"
      >
        <span class="button-text">Bluesky</span>
      </UButton>

      <!-- X (Twitter) -->
      <UButton
        icon="i-simple-icons-x"
        color="primary"
        variant="soft"
        size="sm"
        aria-label="Share on X"
        @click="share('twitter')"
      >
        <span class="button-text">X</span>
      </UButton>

      <!-- Native Share (mobile) -->
      <UButton
        v-if="canUseNativeShare"
        icon="i-heroicons-share"
        color="gray"
        variant="soft"
        size="sm"
        aria-label="Share via..."
        @click="nativeShare"
      >
        <span class="button-text">More</span>
      </UButton>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.social-share {
  @apply flex flex-col gap-3;
}

.share-label {
  @apply text-sm font-medium opacity-70;
}

.share-buttons {
  @apply flex flex-wrap gap-2;
}

.button-text {
  @apply hidden sm:inline;
}

/* Show text on larger screens */
@media (min-width: 640px) {
  .share-buttons {
    @apply gap-3;
  }
}
</style>
