import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises, type VueWrapper } from '@vue/test-utils'
import ColumnMapper from '../../app/components/organisms/ColumnMapper.vue'
import type { ParsedData } from '../../shared/types'

const csvContent = 'Name,Organization\n"Doe, Jane","Acme ""Labs"""\n\n"Alex\nSmith",Team'
const rows = [
  ['Name', 'Organization'],
  ['Doe, Jane', 'Acme "Labs"'],
  ['Alex\nSmith', 'Team'],
]
const data: ParsedData = { csvContent, columns: rows, preview: rows, rowCount: 3, columnCount: 2 }
let wrapper: VueWrapper

async function mount(dataOverride: Partial<ParsedData> = {}) {
  wrapper = await mountSuspended(ColumnMapper, {
    props: { parsedData: { ...data, ...dataOverride } },
    attachTo: document.body,
  })
  return wrapper
}

async function select(label: string, optionText: string) {
  await wrapper.get(`[aria-label="${label}"]`).trigger('click')
  await vi.waitFor(() => expect(document.querySelector('[role="option"]')).not.toBeNull())
  const option = [...document.querySelectorAll<HTMLElement>('[role="option"]')].find(
    element => element.textContent?.trim() === optionText
  )
  expect(option, `Option ${optionText} exists`).toBeDefined()
  option!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
  await vi.waitFor(() => expect(document.querySelector('[role="option"]')).toBeNull())
  await flushPromises()
}

beforeEach(() => localStorage.clear())

describe('ColumnMapper rendered interactions', () => {
  it('requires an available, nonduplicated mapping before continuing', async () => {
    await mount()
    expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeDefined()
    await select('Line 1 column', 'Column 1 (Name)')
    expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeUndefined()
    await select('Line 2 column', 'Column 1 (Name)')
    expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeDefined()
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.emitted('complete')).toBeUndefined()
    await select('Line 2 column', '(Skip this line)')
    expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeUndefined()
  })

  it('uses header labels and preserves the original quoted CSV on completion', async () => {
    await mount()
    await wrapper.get('[role="checkbox"]').trigger('click')
    await select('Line 1 column', 'Name')
    await select('Line 2 column', 'Organization')
    expect(wrapper.text()).toContain('2 name tags')
    expect(wrapper.get('table').text()).toContain('Doe, Jane')
    expect(wrapper.get('thead').text()).toContain('Organization')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.emitted('complete')).toEqual([
      [{ line1: 0, line2: 1, line3: null }, true, csvContent],
    ])
  })

  it('names saved-template controls and consumes Enter before implicit form submission', async () => {
    await mount()
    await select('Line 1 column', 'Column 1 (Name)')
    const input = wrapper.get('input[placeholder="Template name..."]')
    expect(input.attributes('aria-label')).toBe('Template name')
    await input.setValue('  Conference  ')
    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
    input.element.dispatchEvent(event)
    await flushPromises()
    expect(event.defaultPrevented).toBe(true)
    expect(
      JSON.parse(localStorage.getItem('slappy-mapping-templates')!).Conference.mapping
    ).toEqual({ line1: 0, line2: null, line3: null })
    expect(wrapper.emitted('complete')).toBeUndefined()
    expect(wrapper.get('[aria-label="Load template"]').exists()).toBe(true)
    expect((input.element as HTMLInputElement).value).toBe('')
  })

  it('rejects stored mappings that reference unavailable columns', async () => {
    localStorage.setItem(
      'slappy-mapping-templates',
      JSON.stringify({
        Wide: {
          name: 'Wide',
          mapping: { line1: 2, line2: null, line3: null },
          hasHeaders: true,
          createdAt: '2026-09-08T00:00:00.000Z',
        },
      })
    )
    await mount()
    await select('Load template', 'Wide')
    expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeDefined()
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.emitted('complete')).toBeUndefined()
  })

  it('loads saved mapping and headers through the real template selector', async () => {
    localStorage.setItem(
      'slappy-mapping-templates',
      JSON.stringify({
        Roster: {
          name: 'Roster',
          mapping: { line1: 1, line2: 0, line3: null },
          hasHeaders: true,
          createdAt: '2026-09-08T00:00:00.000Z',
        },
      })
    )
    await mount()
    await select('Load template', 'Roster')
    expect(wrapper.get('[aria-label="Line 1 column"]').text()).toContain('Organization')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.emitted('complete')).toEqual([
      [{ line1: 1, line2: 0, line3: null }, true, csvContent],
    ])
  })
})
