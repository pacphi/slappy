import { useRuntimeConfig } from '#imports'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import FileUpload from '~/components/molecules/FileUpload.vue'
import ColumnHeader from '~/components/molecules/ColumnHeader.vue'
import DataTable from '~/components/molecules/DataTable.vue'
import SocialShare from '~/components/molecules/SocialShare.vue'
import FeatureCard from '~/components/molecules/FeatureCard.vue'
import AdSenseAd from '~/components/molecules/AdSenseAd.vue'

beforeEach(() => {
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test-file')
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
  const config = useRuntimeConfig()
  config.public.appUrl = 'https://example.com/event?a=1'
  config.public.googleAdSenseAccount = 'ca-pub-test'
})
afterEach(() => {
  vi.restoreAllMocks()
  delete (window as Window & { adsbygoogle?: unknown }).adsbygoogle
  Reflect.deleteProperty(navigator, 'share')
})

describe('FileUpload', () => {
  async function selectFile(file: File) {
    const wrapper = await mountSuspended(FileUpload)
    const input = wrapper.get('input[type="file"]')
    Object.defineProperty(input.element, 'files', { value: [file], configurable: true })
    await input.trigger('change')
    return wrapper
  }

  it('emits the original selected CSV file', async () => {
    const file = new File(['Name\nAda'], 'roster.csv', { type: 'text/csv' })
    expect((await selectFile(file)).emitted('fileSelected')).toEqual([[file]])
  })

  it('accepts a CSV without a browser MIME type', async () => {
    const file = new File(['Name'], 'ROSTER.CSV')
    expect((await selectFile(file)).emitted('fileSelected')).toEqual([[file]])
  })

  it('accepts CSV files reported with the legacy Excel MIME alias', async () => {
    const file = new File(['Name\nAda'], 'roster.csv', { type: 'application/vnd.ms-excel' })
    expect((await selectFile(file)).emitted('fileSelected')).toEqual([[file]])
  })

  it('rejects a CSV with an incompatible MIME type', async () => {
    const file = new File(['Name'], 'roster.csv', { type: 'application/pdf' })
    expect((await selectFile(file)).emitted('error')).toEqual([['Please upload a CSV file']])
  })

  it('ignores an empty selection', async () => {
    const wrapper = await mountSuspended(FileUpload)
    const input = wrapper.get('input[type="file"]')
    Object.defineProperty(input.element, 'files', { value: [], configurable: true })
    await input.trigger('change')
    expect(wrapper.emitted('fileSelected')).toBeUndefined()
  })

  it('rejects files over the size limit', async () => {
    const file = new File(['x'.repeat(5 * 1024 * 1024 + 1)], 'large.csv', { type: 'text/csv' })
    expect((await selectFile(file)).emitted('error')?.[0]?.[0]).toContain('exceeds the 5MB limit')
  })

  it('announces processing and removes the upload control while loading', async () => {
    const wrapper = await mountSuspended(FileUpload, { props: { loading: true } })
    expect(wrapper.get('[role="status"]').text()).toContain('Processing CSV file')
    expect(wrapper.find('input[type="file"]').exists()).toBe(false)
  })
})

describe('ColumnHeader', () => {
  const props = { title: 'Map columns', isActive: true, isCompleted: false, isLocked: false }
  it('is a non-submitting navigation button', async () => {
    const wrapper = await mountSuspended(ColumnHeader, { props })
    expect(wrapper.get('button').attributes('type')).toBe('button')
  })
  it('emits navigation from its native button', async () => {
    const wrapper = await mountSuspended(ColumnHeader, { props })
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('click')).toEqual([[]])
  })
  it('prevents navigation while locked', async () => {
    const wrapper = await mountSuspended(ColumnHeader, {
      props: { ...props, isActive: false, isLocked: true },
    })
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })
  it('exposes completion to assistive technology', async () => {
    const wrapper = await mountSuspended(ColumnHeader, { props: { ...props, isCompleted: true } })
    expect(wrapper.get('button').text()).toContain('Completed')
  })
})

describe('DataTable', () => {
  it('makes the scrollable table a named keyboard-focusable region', async () => {
    const wrapper = await mountSuspended(DataTable, { props: { rows: [['Ada']] } })
    const region = wrapper.get('[role="region"]')
    expect(region.attributes('tabindex')).toBe('0')
    expect(region.attributes('aria-label')).toBe('Data preview')
  })
  it('shows the empty-state explanation', async () => {
    expect((await mountSuspended(DataTable, { props: { rows: [] } })).text()).toContain(
      'No data to preview'
    )
  })
  it('renders explicit headers and limits preview rows', async () => {
    const wrapper = await mountSuspended(DataTable, {
      props: { headers: ['Name'], rows: [['Ada'], ['Grace']], maxRows: 1 },
    })
    expect(wrapper.get('thead').text()).toContain('Name')
    expect(wrapper.get('tbody').text()).toBe('Ada')
    expect(wrapper.text()).toContain('Showing 1 of 2 rows')
  })
  it('retains cells from wider later rows', async () => {
    const wrapper = await mountSuspended(DataTable, {
      props: { rows: [['Ada'], ['Grace', 'Compiler']] },
    })
    expect(wrapper.get('thead').text()).toContain('Column 2')
    expect(wrapper.get('tbody').text()).toContain('Compiler')
  })
  it('honors an explicit zero preview limit', async () => {
    const wrapper = await mountSuspended(DataTable, { props: { rows: [['Ada']], maxRows: 0 } })
    expect(wrapper.get('tbody').text()).not.toContain('Ada')
  })
})

describe('SocialShare', () => {
  it.each([
    ['Facebook', 'www.facebook.com', 'quote'],
    ['Bluesky', 'bsky.app', 'text'],
    ['X', 'twitter.com', 'text'],
  ])('encodes the custom message for %s', async (label, hostname, parameter) => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null)
    const wrapper = await mountSuspended(SocialShare, { props: { shareText: 'Hello & goodbye?' } })
    await wrapper.get(`[aria-label="Share on ${label}"]`).trigger('click')
    const url = new URL(String(open.mock.calls[0]?.[0]))
    expect(url.hostname).toBe(hostname)
    expect(url.searchParams.get(parameter!)).toContain('Hello & goodbye?')
  })
  it('shares the generated tag count through the native API', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'share', { value: share, configurable: true })
    const wrapper = await mountSuspended(SocialShare, { props: { tagCount: 25 } })
    await wrapper.get('[aria-label="Share via..."]').trigger('click')
    expect(share).toHaveBeenCalledWith(
      expect.objectContaining({ text: expect.stringContaining('25 professional name tags') })
    )
  })
  it('handles native share cancellation without surfacing an error', async () => {
    Object.defineProperty(navigator, 'share', {
      value: vi.fn().mockRejectedValue(new Error('cancelled')),
      configurable: true,
    })
    const wrapper = await mountSuspended(SocialShare)
    await wrapper.get('[aria-label="Share via..."]').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Share your creation')
  })
  it('hides native sharing when unsupported and uses the general message', async () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null)
    const wrapper = await mountSuspended(SocialShare)
    expect(wrapper.find('[aria-label="Share via..."]').exists()).toBe(false)
    await wrapper.get('[aria-label="Share on X"]').trigger('click')
    expect(new URL(String(open.mock.calls[0]?.[0])).searchParams.get('text')).toContain(
      'Create print-ready name tags'
    )
  })
})

describe('FeatureCard', () => {
  it('renders its heading and every explanatory paragraph', async () => {
    const wrapper = await mountSuspended(FeatureCard, {
      props: {
        icon: 'i-lucide-tag',
        title: 'Print labels',
        description: ['Choose a stock.', 'Print at full size.'],
      },
    })
    expect(wrapper.get('h3').text()).toBe('Print labels')
    expect(wrapper.findAll('p').map(p => p.text())).toEqual([
      'Choose a stock.',
      'Print at full size.',
    ])
  })
})

describe('AdSenseAd', () => {
  it('queues an ad when the external script has not loaded yet', async () => {
    await mountSuspended(AdSenseAd, { props: { adSlot: '123' } })
    expect((window as Window & { adsbygoogle?: unknown }).adsbygoogle).toEqual([{}])
  })
  it('does not queue an ad without a publisher account', async () => {
    useRuntimeConfig().public.googleAdSenseAccount = ''
    await mountSuspended(AdSenseAd, { props: { adSlot: '123' } })
    expect((window as Window & { adsbygoogle?: unknown }).adsbygoogle).toBeUndefined()
  })

  it('preserves pending ads and configures a fixed format', async () => {
    const queue = [{ existing: true }]
    Object.assign(window, { adsbygoogle: queue })
    const wrapper = await mountSuspended(AdSenseAd, {
      props: { adSlot: '123', responsive: false, format: 'horizontal' },
    })
    expect(queue).toEqual([{ existing: true }, {}])
    expect(wrapper.get('ins').attributes('data-ad-format')).toBe('horizontal')
    expect(wrapper.get('ins').attributes('data-full-width-responsive')).toBe('false')
  })
  it('contains external queue failures', async () => {
    Object.assign(window, {
      adsbygoogle: {
        push: () => {
          throw new Error('blocked')
        },
      },
    })
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const wrapper = await mountSuspended(AdSenseAd, { props: { adSlot: '123' } })
    expect(wrapper.get('ins').attributes('data-ad-format')).toBe('auto')
    expect(error).toHaveBeenCalledWith('AdSense error:', expect.any(Error))
  })
})
