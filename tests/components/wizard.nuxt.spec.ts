import { createError } from 'h3'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import NameTagWizard from '../../app/components/organisms/NameTagWizard.vue'
import AppHeader from '../../app/components/organisms/AppHeader.vue'
import { useAppNavigation } from '../../app/composables/useAppNavigation'

const parse = vi.fn()
registerEndpoint('/api/parse', { method: 'POST', handler: () => parse() })
registerEndpoint('/api/generate', {
  method: 'POST',
  handler: () => ({ html: '<p>Ada</p>', labelCount: 1, sheetCount: 1 }),
})
const parsed = {
  csvContent: 'Name,Team\nAda,Research',
  columns: [
    ['Name', 'Team'],
    ['Ada', 'Research'],
  ],
  preview: [
    ['Name', 'Team'],
    ['Ada', 'Research'],
  ],
  rowCount: 2,
  columnCount: 2,
}
beforeEach(() => {
  parse.mockReset().mockResolvedValue(parsed)
  localStorage.clear()
})
async function render() {
  return mountSuspended(NameTagWizard, { attachTo: document.body })
}
async function sample(wrapper: Awaited<ReturnType<typeof render>>) {
  await wrapper
    .findAll('button')
    .find(b => b.text().includes('Try Sample Data'))!
    .trigger('click')
  await vi.waitFor(() => expect(wrapper.text()).toContain('Data Preview'))
}
async function preview(wrapper: Awaited<ReturnType<typeof render>>) {
  await sample(wrapper)
  await wrapper.get('[aria-label="Line 1 column"]').trigger('click')
  await vi.waitFor(() => expect(document.querySelector('[role="option"]')).not.toBeNull())
  const option = [...document.querySelectorAll<HTMLElement>('[role="option"]')].find(el =>
    el.textContent?.includes('Column 1')
  )!
  option.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
  await vi.waitFor(() => expect(document.querySelector('[role="option"]')).toBeNull())
  await flushPromises()
  await wrapper
    .findAll('button')
    .find(b => b.text().includes('Continue to Preview'))!
    .trigger('click')
  await vi.waitFor(() => expect(wrapper.find('iframe').exists(), wrapper.text()).toBe(true))
}
describe('wizard rendered workflow', () => {
  it('keeps later steps locked until successful upload', async () => {
    const wrapper = await render()
    expect(
      wrapper
        .findAll('button')
        .find(b => b.text() === 'Map')!
        .attributes('disabled')
    ).toBeDefined()
    await sample(wrapper)
    expect(
      wrapper
        .findAll('button')
        .find(b => b.text() === 'Map')!
        .attributes('disabled')
    ).toBeUndefined()
  })
  it('shows an accessible persistent error after upload fails', async () => {
    parse.mockRejectedValueOnce(
      createError({ statusCode: 400, statusMessage: 'Upload unavailable' })
    )
    const wrapper = await render()
    await wrapper
      .findAll('button')
      .find(b => b.text().includes('Try Sample Data'))!
      .trigger('click')
    await vi.waitFor(() => expect(wrapper.find('[role="alert"]').exists()).toBe(true))
    expect(wrapper.text()).toContain('Complete upload to map columns')
  })
  it('does not discard completed work when Escape dismisses a control', async () => {
    const wrapper = await render()
    await preview(wrapper)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await flushPromises()
    expect(wrapper.find('iframe').exists(), wrapper.text()).toBe(true)
  })
  it('clears mapping and preview after confirmed Start Over', async () => {
    const wrapper = await render()
    await preview(wrapper)
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true))
    await wrapper
      .findAll('button')
      .find(b => b.text().includes('Start Over'))!
      .trigger('click')
    expect(wrapper.find('iframe').exists()).toBe(false)
    expect(wrapper.text()).toContain('Complete upload to map columns')
  })
  it('uses the requested upload mode and reacts to mode changes', async () => {
    const wrapper = await mountSuspended(NameTagWizard, { props: { initialUploadMode: 'sheets' } })
    expect(wrapper.find('input[type="url"]').exists()).toBe(true)
    await wrapper.setProps({ initialUploadMode: 'csv' })
    expect(wrapper.find('input[type="file"]').exists()).toBe(true)
  })
  it('loads a valid Google Sheet and clears the URL on success', async () => {
    const wrapper = await mountSuspended(NameTagWizard, { props: { initialUploadMode: 'sheets' } })
    await wrapper
      .get('input[type="url"]')
      .setValue('https://docs.google.com/spreadsheets/d/test/edit')
    await wrapper.get('form').trigger('submit')
    await vi.waitFor(() => expect(wrapper.text()).toContain('Data Preview'))
    expect((wrapper.get('input[type="url"]').element as HTMLInputElement).value).toBe('')
  })
  it('preserves the sheet URL and shows a recoverable API error', async () => {
    parse.mockRejectedValueOnce(createError({ statusCode: 400, statusMessage: 'Sheet not public' }))
    const wrapper = await mountSuspended(NameTagWizard, { props: { initialUploadMode: 'sheets' } })
    const url = 'https://docs.google.com/spreadsheets/d/test/edit'
    await wrapper.get('input[type="url"]').setValue(url)
    await wrapper.get('form').trigger('submit')
    await vi.waitFor(() => expect(wrapper.find('[role="alert"]').exists()).toBe(true))
    expect((wrapper.get('input[type="url"]').element as HTMLInputElement).value).toBe(url)
    expect(wrapper.text()).toContain('Complete upload to map columns')
  })
  it('rejects a non-Sheets URL before upload', async () => {
    const wrapper = await mountSuspended(NameTagWizard, { props: { initialUploadMode: 'sheets' } })
    await wrapper.get('input[type="url"]').setValue('https://example.com')
    await wrapper.get('form').trigger('submit')
    await vi.waitFor(() =>
      expect(wrapper.text()).toContain('Please enter a valid Google Sheets URL')
    )
    expect(parse).not.toHaveBeenCalled()
  })
  it('announces local file validation errors', async () => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test-file')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    const wrapper = await render()
    const input = wrapper.get('input[type="file"]')
    Object.defineProperty(input.element, 'files', {
      value: [new File(['x'], 'roster.csv', { type: 'application/pdf' })],
      configurable: true,
    })
    await input.trigger('change')
    expect(wrapper.get('[role="alert"]').text()).toContain('Please upload a CSV file')
    expect(parse).not.toHaveBeenCalled()
  })
  it('disables sample upload while a request is pending', async () => {
    let resolve: (value: typeof parsed) => void = () => {}
    parse.mockReturnValueOnce(
      new Promise<typeof parsed>(done => {
        resolve = done
      })
    )
    const wrapper = await render()
    const button = wrapper.findAll('button').find(b => b.text().includes('Try Sample Data'))!
    await button.trigger('click')
    await vi.waitFor(() => expect(button.attributes('disabled')).toBeDefined())
    expect(wrapper.get('[role="status"]').text()).toContain('Processing CSV file')
    resolve(parsed)
    await vi.waitFor(() => expect(wrapper.text()).toContain('Data Preview'))
  })
  it('keeps the preview after cancelling Start Over', async () => {
    const wrapper = await render()
    await preview(wrapper)
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(false))
    await wrapper
      .findAll('button')
      .find(b => b.text().includes('Start Over'))!
      .trigger('click')
    expect(wrapper.find('iframe').exists()).toBe(true)
  })
  it('navigates from the real application header', async () => {
    const wrapper = await mountSuspended(AppHeader)
    await wrapper
      .findAll('button')
      .find(b => b.text().includes('Upload Google Sheet'))!
      .trigger('click')
    expect(useAppNavigation().uploadMode.value).toBe('sheets')
    await wrapper
      .findAll('button')
      .find(b => b.text().includes('Upload CSV'))!
      .trigger('click')
    expect(useAppNavigation().uploadMode.value).toBe('csv')
  })
})

it('navigates through the mobile header menu', async () => {
  const wrapper = await mountSuspended(AppHeader, { attachTo: document.body })
  await wrapper.get('button[data-slot="toggle"]').trigger('click')
  await vi.waitFor(() => expect(document.querySelector('.nav-menu-mobile')).not.toBeNull())
  const menu = document.querySelector('.nav-menu-mobile')!
  const buttons = [...menu.querySelectorAll<HTMLButtonElement>('button')]
  buttons.find(b => b.textContent?.includes('Upload Google Sheet'))!.click()
  await flushPromises()
  expect(useAppNavigation().uploadMode.value).toBe('sheets')
  buttons.find(b => b.textContent?.includes('Upload CSV'))!.click()
  await flushPromises()
  expect(useAppNavigation().uploadMode.value).toBe('csv')
})
