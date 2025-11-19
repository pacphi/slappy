# Google AdSense & SEO Setup Guide

This guide will help you complete the Google AdSense integration and SEO optimization for Slappy.

---

## Feature Flag: Enable/Disable AdSense

AdSense integration is controlled by the `nuxt-feature-flags` module in `/feature-flags.config.ts`. This provides type-safe feature management with support for A/B testing and advanced capabilities.

### How to Enable/Disable AdSense

**File: `/feature-flags.config.ts`**

```typescript
import { defineFeatureFlags } from '#feature-flags/handler'

export default defineFeatureFlags(() => ({
  adsense: {
    enabled: false, // Change to true to enable AdSense
    description: 'Google AdSense integration for monetization',
  },
}))
```

**When `enabled: false` (default):**

- AdSense script will NOT be loaded
- No DNS prefetch/preconnect for AdSense domains
- Ad components will NOT render (no blank containers)
- Zero performance impact from AdSense

**When `enabled: true`:**

- AdSense script loads asynchronously
- DNS prefetch/preconnect optimizations enabled
- Ad slots render on landing page and preview panel

**Important:** Changes to feature flags require a rebuild (`pnpm build`) in production. In development with `pnpm dev`, changes are detected automatically with HMR.

---

## Part 1: Google AdSense Setup

### Step 1: Create AdSense Account

1. **Sign up for Google AdSense**
   - Go to [https://www.google.com/adsense](https://www.google.com/adsense)
   - Sign in with your Google account
   - Fill out the application form with your domain: `slappy.cloud`

2. **Add the verification code**
   - After signing up, AdSense will provide a verification `<meta>` tag
   - Uncomment and update line 17 in `/app/app.vue`:
     ```vue
     { name: 'google-adsense-account', content: 'ca-pub-XXXXXXXXXXXXXXXX' }
     ```
   - Replace `ca-pub-XXXXXXXXXXXXXXXX` with your actual Publisher ID

3. **Deploy and verify**
   - Deploy your site to production (`slappy.cloud`)
   - Return to AdSense dashboard and click "Verify"
   - Wait 1-3 days for approval

### Step 2: Create Ad Units (After Approval)

Once your AdSense account is approved:

1. **Create Landing Hero Ad**
   - In AdSense dashboard: **Ads** → **By ad unit** → **Display ads**
   - Name: "Landing Hero Ad"
   - Ad type: **Display ad** (Responsive or 728x90 Leaderboard)
   - Copy the **Ad Slot ID** (e.g., `1234567890`)

2. **Create Preview Sidebar Ad**
   - Create another ad unit
   - Name: "Preview Sidebar Ad"
   - Ad type: **Display ad** (Responsive or 300x250 Medium Rectangle)
   - Copy the **Ad Slot ID**

### Step 3: Update Code with Ad Slot IDs

**File: `/app/app.vue` (line 30)**

```vue
src:
'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX',
```

Replace `ca-pub-XXXXXXXXXXXXXXXX` with your **Publisher ID**.

**File: `/app/components/molecules/AdSenseAd.vue` (line 53)**

```vue
data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
```

Replace `ca-pub-XXXXXXXXXXXXXXXX` with your **Publisher ID**.

**File: `/app/pages/index.vue` (line 68)**

```vue
<MoleculesAdSenseAd slot="LANDING_HERO_AD_SLOT_ID" format="horizontal" />
```

Replace `LANDING_HERO_AD_SLOT_ID` with your **Landing Hero Ad** slot ID.

**File: `/app/components/organisms/PreviewPanel.vue` (line 152)**

```vue
<MoleculesAdSenseAd v-if="!loading && !error" slot="PREVIEW_SIDEBAR_AD_SLOT_ID" format="display" />
```

Replace `PREVIEW_SIDEBAR_AD_SLOT_ID` with your **Preview Sidebar Ad** slot ID.

### Step 4: Test AdSense Integration

1. **Local testing:**
   - Run `pnpm dev`
   - Ads may show as blank rectangles (normal in development)
   - Check browser console for AdSense errors

2. **Production testing:**
   - Deploy to `slappy.cloud`
   - Ads should appear within 10-20 minutes after deployment
   - New ads may show as blank for the first 24-48 hours

3. **Verify ad placements:**
   - **Landing page**: Ad between hero text and "Why Choose Slappy?" section
   - **Preview panel**: Ad between preview iframe and "Start Over" button

---

## Part 2: SEO Implementation

### Step 1: Create Open Graph Image

You need to create a social sharing image (1200×630px) for Facebook, LinkedIn, and Twitter.

**Requirements:**

- Dimensions: **1200px × 630px**
- Format: PNG or JPG
- File name: `og-image.png`
- Location: `/public/og-image.png`

**Recommended Content:**

- Slappy logo or branding
- Tagline: "Professional Name Tags in 60 Seconds"
- Background: Match the purple theme (#8646F4)
- Optional: Screenshot of the app or example name tags

**Tools to create the image:**

- [Canva](https://www.canva.com) - Free templates for social media images
- [Figma](https://www.figma.com) - Design from scratch
- Adobe Photoshop / Illustrator
- Online generators: [og-image.vercel.app](https://og-image.vercel.app)

**Steps:**

1. Create the 1200×630px image
2. Save as `og-image.png`
3. Place in `/public/og-image.png`
4. Deploy to production

### Step 2: Verify SEO Implementation

#### Sitemap & Robots.txt

After deployment, verify these URLs are accessible:

- **Sitemap**: [https://slappy.cloud/sitemap.xml](https://slappy.cloud/sitemap.xml)
- **Robots.txt**: [https://slappy.cloud/robots.txt](https://slappy.cloud/robots.txt)

#### Meta Tags Validation

**Facebook Sharing Debugger:**

1. Go to [https://developers.facebook.com/tools/debug/](https://developers.facebook.com/tools/debug/)
2. Enter `https://slappy.cloud`
3. Click "Debug"
4. Verify:
   - Title: "Slappy - Professional Name Tags in 60 Seconds"
   - Description shows correctly
   - Image shows your OG image (1200×630px)

**Twitter Card Validator:**

1. Go to [https://cards-dev.twitter.com/validator](https://cards-dev.twitter.com/validator)
2. Enter `https://slappy.cloud`
3. Click "Preview card"
4. Verify the card displays correctly with image

**Google Rich Results Test:**

1. Go to [https://search.google.com/test/rich-results](https://search.google.com/test/rich-results)
2. Enter `https://slappy.cloud`
3. Click "Test URL"
4. Verify the WebApplication structured data is detected

#### Lighthouse SEO Audit

Run a Lighthouse audit in Chrome DevTools:

1. Open Chrome DevTools (F12)
2. Go to **Lighthouse** tab
3. Select **SEO** category
4. Click "Analyze page load"
5. **Target score: 90+**

**Common issues to fix:**

- Missing meta description (should already be added)
- Missing viewport meta tag (should already be added)
- Document doesn't have a valid `hreflang` (not applicable for single language)

### Step 3: Submit to Google Search Console

1. **Add property:**
   - Go to [https://search.google.com/search-console](https://search.google.com/search-console)
   - Click "Add property"
   - Enter `slappy.cloud`
   - Verify ownership (DNS, HTML file, or meta tag)

2. **Submit sitemap:**
   - In Search Console, go to **Sitemaps** (left sidebar)
   - Enter `sitemap.xml`
   - Click "Submit"

3. **Monitor indexing:**
   - Go to **Pages** to see indexing status
   - May take 1-7 days for Google to index your site

---

## Part 3: Performance Optimization

### DNS Prefetch & Preconnect

Already configured in `/app/app.vue` for:

- Google AdSense domains (performance optimization)
- Reduces ad load latency by ~100-200ms

### Mobile Optimization

**Viewport meta tag** (✅ Added):

```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

**Theme color** (✅ Added):

```html
<meta name="theme-color" content="#8646F4" />
```

- Matches the purple primary color
- Customizes mobile browser UI on Android

### Structured Data

**WebApplication schema** (✅ Added):

- Helps Google understand your app
- Shows app details in search results
- Includes features, pricing (free), and operating system compatibility

---

## Part 4: Testing Checklist

### AdSense Testing

- [ ] Publisher ID added to `app.vue` (line 30)
- [ ] Publisher ID added to `AdSenseAd.vue` (line 53)
- [ ] Landing Hero Ad slot ID added to `index.vue` (line 68)
- [ ] Preview Sidebar Ad slot ID added to `PreviewPanel.vue` (line 152)
- [ ] Ads render on landing page (between hero and features)
- [ ] Ads render in preview panel (after iframe, before "Start Over")
- [ ] Ads don't break layout or glassmorphism styling
- [ ] Ads are responsive on mobile/tablet/desktop

### SEO Testing

- [ ] OG image created and placed in `/public/og-image.png`
- [ ] `/sitemap.xml` is accessible after deployment
- [ ] `/robots.txt` is accessible after deployment
- [ ] Facebook Sharing Debugger shows correct meta tags and image
- [ ] Twitter Card Validator shows correct card preview
- [ ] Google Rich Results Test detects WebApplication schema
- [ ] Lighthouse SEO score is 90+
- [ ] Sitemap submitted to Google Search Console

### Performance Testing

- [ ] Lighthouse Performance score is 80+ (with ads)
- [ ] Mobile-friendly test passes: [https://search.google.com/test/mobile-friendly](https://search.google.com/test/mobile-friendly)
- [ ] Page Speed Insights acceptable: [https://pagespeed.web.dev/](https://pagespeed.web.dev/)

---

## Part 5: Monitoring & Analytics

### AdSense Revenue Tracking

1. **Check AdSense dashboard daily** (first week)
   - Impressions should appear within 24-48 hours
   - Clicks and revenue may take 1-2 weeks to appear
   - **Expected CPM**: $1-5 for free tools (varies by region)

2. **Optimize ad placement** (after 2 weeks of data)
   - Review which ad performs better (landing vs preview)
   - Consider A/B testing ad sizes/formats
   - Avoid adding more ads (2 ads is optimal for user experience)

### SEO Performance Tracking

1. **Google Search Console** (weekly)
   - Check **Performance** report for impressions and clicks
   - Monitor **Coverage** for indexing issues
   - Review **Core Web Vitals** for performance

2. **Google Analytics** (optional, not yet installed)
   - Track user behavior and conversions
   - Monitor bounce rate and session duration
   - See which traffic sources are most valuable

---

## Troubleshooting

### AdSense Ads Not Showing

**Possible causes:**

1. **Account not approved yet** → Wait for AdSense approval email (1-3 days)
2. **New ad unit** → Ads may take 24-48 hours to start showing
3. **Ad blocker enabled** → Disable ad blocker to test
4. **Incorrect Publisher ID** → Double-check `ca-pub-` ID matches your account
5. **Incorrect slot ID** → Verify slot IDs in AdSense dashboard match your code

**Debugging:**

- Open browser DevTools → Console
- Look for AdSense errors (e.g., "Ad slot not found")
- Check Network tab for requests to `googlesyndication.com`

### SEO Issues

**Sitemap not found:**

- Ensure `@nuxtjs/seo` is installed and in `nuxt.config.ts` modules
- Rebuild and redeploy: `pnpm build && pnpm preview`
- Check `/.nuxt/dist/sitemap.xml` exists in build output

**OG image not showing:**

- Verify image is exactly 1200×630px
- File must be in `/public/og-image.png` (not `/app/public/`)
- Use Facebook Debugger and click "Scrape Again" to refresh cache

**Low Lighthouse SEO score:**

- Check for missing meta tags in DevTools → Elements → `<head>`
- Verify canonical URL is absolute (not relative)
- Ensure viewport meta tag is present

---

## Summary of Changes Made

### New Files Created

- `/app/components/molecules/AdSenseAd.vue` - Reusable AdSense ad component
- `/ADSENSE_SEO_SETUP.md` - This setup guide

### Files Modified

1. **`/app/app.vue`**
   - Added viewport meta tag (critical for mobile SEO)
   - Added theme-color meta tag
   - Added AdSense script and Publisher ID placeholder
   - Added DNS prefetch/preconnect for AdSense domains

2. **`/app/pages/index.vue`**
   - Added landing page ad placement (between hero and features)
   - Added enhanced SEO meta tags (Open Graph, Twitter Card, keywords)
   - Added canonical URL
   - Added JSON-LD structured data (WebApplication schema)

3. **`/app/components/organisms/PreviewPanel.vue`**
   - Added preview sidebar ad placement (after preview, before "Start Over")

4. **`/nuxt.config.ts`**
   - Added `@nuxtjs/seo` module
   - Configured site metadata (URL, name, description)
   - Configured sitemap.xml generation
   - Configured robots.txt with sitemap reference

### Dependencies Added

- `@nuxtjs/seo@3.2.2` - Comprehensive SEO module for Nuxt

---

## Next Steps

1. **Enable AdSense feature flag** in `/app.config.ts` (set `features.adsense: true`)
2. **Create AdSense account** and get Publisher ID
3. **Create ad units** and get slot IDs
4. **Update code** with Publisher ID and slot IDs (4 locations)
5. **Create OG image** (1200×630px) and save to `/public/og-image.png`
6. **Deploy to production** (`slappy.cloud`)
7. **Verify sitemap** and robots.txt are accessible
8. **Test meta tags** with Facebook/Twitter validators
9. **Submit sitemap** to Google Search Console
10. **Monitor AdSense** for ad impressions (24-48 hours)
11. **Run Lighthouse audit** and aim for 90+ SEO score

**Estimated time to complete:** 1-2 hours (excluding AdSense approval wait time)

**Questions or issues?** Check the Troubleshooting section above or consult the Google AdSense Help Center.

---

Good luck with monetizing and optimizing Slappy! 🚀
