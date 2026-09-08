import { readBody } from 'h3'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import PreviewPanel from '../../app/components/organisms/PreviewPanel.vue'

const props = {
  csvContent: 'Ada,Team',
  mapping: { line1: 0, line2: null, line3: null },
  hasHeaders: false,
}
const result = { html: '<html><body>Ada</body></html>', labelCount: 1, sheetCount: 1 }
const fetchMock = vi.fn()
registerEndpoint('/api/generate', {
  method: 'POST',
  handler: async event => fetchMock(await readBody(event)),
})
beforeEach(() => {
  fetchMock.mockReset().mockResolvedValue(result)
})
afterEach(() => vi.unstubAllGlobals())

async function render() {
  const wrapper = await mountSuspended(PreviewPanel, { props, attachTo: document.body })
  await vi.waitFor(() => expect(wrapper.text()).not.toContain('Generating preview...'))
  return wrapper
}

describe('preview behavior', () => {
  it('renders returned HTML with sheet geometry and label stock metadata', async () => {
    const wrapper = await render()
    expect(wrapper.get('iframe').attributes('srcdoc')).toBe(result.html)
    expect(wrapper.text()).toContain('10 per sheet · 1 sheet')
    expect(wrapper.get('[aria-label="Label preview"]').attributes('tabindex')).toBe('0')
  })
  it('bounds zoom and resets through rendered controls', async () => {
    const wrapper = await render()
    for (let i = 0; i < 10; i++) await wrapper.get('[aria-label="Zoom in"]').trigger('click')
    expect(wrapper.get('[aria-label="Zoom in"]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('iframe').attributes('style')).toContain('scale(2)')
    await wrapper
      .findAll('button')
      .find(button => button.text() === 'Reset')!
      .trigger('click')
    for (let i = 0; i < 5; i++) await wrapper.get('[aria-label="Zoom out"]').trigger('click')
    expect(wrapper.get('[aria-label="Zoom out"]').attributes('disabled')).toBeDefined()
  })
  it('requires confirmation before discarding the preview', async () => {
    const wrapper = await render()
    const confirm = vi.fn().mockReturnValueOnce(false).mockReturnValueOnce(true)
    vi.stubGlobal('confirm', confirm)
    const start = wrapper.findAll('button').find(button => button.text().includes('Start Over'))!
    await start.trigger('click')
    expect(wrapper.emitted('close')).toBeUndefined()
    await start.trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })
  it('announces loading and hides stale output while a replacement is pending', async () => {
    const wrapper = await render()
    fetchMock.mockReturnValue(new Promise(() => {}))
    await wrapper.setProps({ csvContent: 'Grace,Team' })
    expect(wrapper.find('iframe').exists()).toBe(false)
    expect(wrapper.get('[role="status"]').text()).toContain('Generating preview')
  })
  it('offers retry after a transient generation failure', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Temporary service failure'))
    const wrapper = await render()
    expect(wrapper.find('iframe').exists()).toBe(false)
    const retry = wrapper.findAll('button').find(button => button.text().includes('Retry'))
    expect(retry, 'Failed generation must be recoverable without re-uploading').toBeDefined()
    await retry!.trigger('click')
    await vi.waitFor(() => expect(wrapper.find('iframe').exists()).toBe(true))
    expect(wrapper.get('iframe').attributes('srcdoc')).toBe(result.html)
  })
})

describe('preview interactions and lifecycle', () => {
  it('regenerates pagination for a stock chosen from the actual selector', async () => {
    const wrapper = await render()
    fetchMock.mockImplementation(async body => ({
      ...result,
      html: `<p>${body.labelTemplate}:${body.hasHeaders}</p>`,
      sheetCount: 2,
    }))
    await wrapper.get('[aria-label="Label stock"]').trigger('click')
    await vi.waitFor(() => expect(document.querySelector('[role="option"]')).not.toBeNull())
    const option = [...document.querySelectorAll<HTMLElement>('[role="option"]')].find(el =>
      el.textContent?.includes('OL175')
    )!
    option.click()
    await vi.waitFor(() =>
      expect(wrapper.get('iframe').attributes('srcdoc')).toContain('onlinelabels-ol175')
    )
    expect(wrapper.text()).toContain('1 per sheet · 2 sheets')
    await wrapper.setProps({ hasHeaders: true })
    await vi.waitFor(() =>
      expect(wrapper.get('iframe').attributes('srcdoc')).toContain('onlinelabels-ol175:true')
    )
  })
  it('downloads generated HTML through the browser boundary', async () => {
    const wrapper = await render()
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:preview')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    await wrapper
      .findAll('button')
      .find(b => b.text().includes('Download HTML'))!
      .trigger('click')
    expect(click.mock.instances[0]?.download).toBe('name-tags.html')
  })
  it('prints the preview frame through its browser print API', async () => {
    const wrapper = await render()
    const frame = wrapper.get('iframe').element as HTMLIFrameElement
    const print = vi.fn()
    Object.defineProperty(frame, 'contentWindow', { configurable: true, value: { print } })
    await wrapper
      .findAll('button')
      .find(b => b.text() === 'Print')!
      .trigger('click')
    expect(print).toHaveBeenCalledOnce()
  })
  it('does not download a late PDF after the preview has been closed', async () => {
    const wrapper = await render()
    let finish!: (value: Blob) => void
    let requested = false
    fetchMock.mockImplementation(() => {
      requested = true
      return new Promise(resolve => {
        finish = resolve
      })
    })
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:preview')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    await wrapper
      .findAll('button')
      .find(b => b.text().includes('Download PDF'))!
      .trigger('click')
    await vi.waitFor(() => expect(requested).toBe(true))
    wrapper.unmount()
    finish(new Blob(['pdf'], { type: 'application/pdf' }))
    await new Promise(resolve => setTimeout(resolve, 100))
    await flushPromises()
    expect(click).not.toHaveBeenCalled()
  })
})

it('supports keyboard zoom with the same bounds as buttons', async () => {
  const wrapper = await render()
  const key = async (value: string) => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: value, bubbles: true }))
    await flushPromises()
  }
  for (let i = 0; i < 12; i++) await key('+')
  expect(wrapper.text()).toContain('200%')
  await key('0')
  expect(wrapper.text()).toContain('100%')
  for (let i = 0; i < 7; i++) await key('-')
  expect(wrapper.text()).toContain('50%')
})
