import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
import { test, type TestContext } from 'node:test'
import { ref, createRenderer, h } from 'vue'
import { useDataUpload } from '../app/composables/useDataUpload'
import { useUnsavedChanges } from '../app/composables/useUnsavedChanges'
import { getErrorMessage, ERROR_MESSAGES } from '../app/utils/error-messages'
import { downloadBlob } from '../app/utils/download'

const hook = registerHooks({
  resolve(specifier, context, nextResolve) {
    return nextResolve(
      specifier.startsWith('#shared/')
        ? new URL(`../shared/${specifier.slice(8)}.ts`, import.meta.url).href
        : specifier,
      context
    )
  },
})
const { useMappingTemplates } = await import('../app/composables/useMappingTemplates')
const { useNameTagGeneration } = await import('../app/composables/useNameTagGeneration')
hook.deregister()

function stub(t: TestContext, name: string, value: unknown) {
  const original = Object.getOwnPropertyDescriptor(globalThis, name)
  Object.defineProperty(globalThis, name, { configurable: true, writable: true, value })
  t.after(() => {
    if (original) Object.defineProperty(globalThis, name, original)
    else Reflect.deleteProperty(globalThis, name)
  })
}
function deferred() {
  let resolve!: (value: unknown) => void
  let reject!: (reason: Error) => void
  const promise = new Promise((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
const parsed = {
  csvContent: 'Alice',
  columns: [['Alice']],
  preview: [['Alice']],
  columnCount: 1,
  rowCount: 1,
}

test('upload clears previous data on failure and cannot advance the wizard', async t => {
  stub(t, '$fetch', async () => parsed)
  const upload = useDataUpload()
  await upload.uploadSheets('first')
  stub(t, '$fetch', async () => {
    throw new Error('Failed')
  })
  const succeeded = await upload.uploadSheets('second')
  assert.deepEqual(
    [succeeded, upload.parsedData.value, upload.error.value, upload.loading.value],
    [false, null, 'Failed', false]
  )
})
test('stale upload cannot overwrite current data or report success', async t => {
  const first = deferred(),
    second = deferred()
  let calls = 0
  stub(t, '$fetch', () => [first, second][calls++].promise)
  const upload = useDataUpload()
  const older = upload.uploadSheets('older'),
    newer = upload.uploadSheets('newer')
  second.resolve(parsed)
  await newer
  first.resolve({ ...parsed, csvContent: 'old' })
  assert.deepEqual([await older, upload.parsedData.value], [false, parsed])
})
test('reset suppresses late upload results and clears loading immediately', async t => {
  const pending = deferred()
  stub(t, '$fetch', () => pending.promise)
  const upload = useDataUpload()
  const result = upload.uploadFile(new File(['Alice'], 'names.csv'))
  upload.reset()
  pending.resolve(parsed)
  assert.deepEqual(
    [await result, upload.parsedData.value, upload.loading.value],
    [false, null, false]
  )
})
test('stale upload failure does not clear a newer loading state', async t => {
  const first = deferred(),
    second = deferred()
  let calls = 0
  stub(t, '$fetch', () => [first, second][calls++].promise)
  const upload = useDataUpload()
  const older = upload.uploadSheets('older'),
    newer = upload.uploadSheets('newer')
  first.reject(new Error('obsolete'))
  await older
  assert.deepEqual([upload.loading.value, upload.error.value], [true, null])
  second.resolve(parsed)
  await newer
})
test('saved mappings reject hostile keys and invalid data and isolate mutations', t => {
  const valid = {
    name: 'Good',
    mapping: { line1: 0, line2: null, line3: null },
    hasHeaders: false,
    createdAt: new Date().toISOString(),
  }
  stub(t, 'window', {})
  stub(t, 'localStorage', {
    getItem: () =>
      JSON.stringify({
        Good: valid,
        Invalid: { ...valid, name: 'Invalid', mapping: { line1: -1 } },
        constructor: valid,
      }),
    setItem() {},
  })
  const templates = useMappingTemplates()
  templates.saveTemplate('__proto__', valid.mapping, false)
  templates.saveTemplate('Broken', { line1: 1.5, line2: null, line3: null }, false)
  const loaded = templates.loadTemplate('Good')!
  loaded.mapping.line1 = 9
  assert.deepEqual(
    [
      templates.templateNames.value,
      templates.loadTemplate('Good')?.mapping.line1,
      templates.loadTemplate('toString'),
    ],
    [['Good'], 0, null]
  )
  templates.deleteTemplate('Good')
  assert.equal(templates.hasTemplates.value, false)
})
test('unload warning follows actual wizard state and removes listener on unmount', t => {
  let listener: ((event: BeforeUnloadEvent) => void) | undefined
  stub(t, 'window', {
    addEventListener: (_: string, fn: typeof listener) => {
      listener = fn
    },
    removeEventListener: () => {
      listener = undefined
    },
  })
  const renderer = createRenderer({
    insert() {},
    remove() {},
    createElement: () => ({}),
    createText: () => ({}),
    createComment: () => ({}),
    setText() {},
    setElementText() {},
    parentNode: () => null,
    nextSibling: () => null,
    patchProp() {},
  })
  const data = ref<unknown | null>(null)
  const app = renderer.createApp({
    setup() {
      useUnsavedChanges(data)
      return () => h('div')
    },
  })
  app.mount({})
  let prevented = 0
  const event = {
    preventDefault: () => prevented++,
    returnValue: '',
  } as unknown as BeforeUnloadEvent
  listener!(event)
  data.value = parsed
  listener!(event)
  data.value = null
  listener!(event)
  app.unmount()
  assert.deepEqual([prevented, listener], [1, undefined])
})
test('invalid Sheets URLs receive the specific recovery guidance', () => {
  assert.equal(
    getErrorMessage('Invalid Google Sheets URL'),
    ERROR_MESSAGES.GOOGLE_SHEETS_INVALID_URL
  )
})
test('download releases the blob URL when clicking fails', t => {
  const revoked: string[] = []
  stub(t, 'window', {
    URL: {
      createObjectURL: () => 'blob:test',
      revokeObjectURL: (url: string) => revoked.push(url),
    },
  })
  stub(t, 'document', {
    createElement: () => ({
      click() {
        throw new Error('click failed')
      },
    }),
  })
  assert.throws(() => downloadBlob(new Blob(['hello']), 'names.html'), /click failed/)
  assert.deepEqual(revoked, ['blob:test'])
})

test('error recovery classifies specific Sheets, size, CSV, and unknown failures', () => {
  const cases = [
    ['Google Sheet 403', ERROR_MESSAGES.GOOGLE_SHEETS_PRIVATE],
    ['Google Sheet is private', ERROR_MESSAGES.GOOGLE_SHEETS_PRIVATE],
    ['Google Sheet unavailable', ERROR_MESSAGES.GOOGLE_SHEETS_FAILED],
    ['Could not parse content', ERROR_MESSAGES.CSV_PARSE_FAILED],
    ['CSV unsupported', ERROR_MESSAGES.CSV_PARSE_FAILED],
    ['File too large', ERROR_MESSAGES.FILE_TOO_LARGE],
    ['Maximum size exceeded', ERROR_MESSAGES.FILE_TOO_LARGE],
    ['network down', { message: 'An error occurred', solution: 'network down' }],
  ] as const
  for (const [message, expected] of cases) assert.deepEqual(getErrorMessage(message), expected)
})

test('successful save persists a normalized independent mapping and deletion survives reload', t => {
  let stored: string | null = null
  stub(t, 'window', {})
  stub(t, 'localStorage', {
    getItem: () => stored,
    setItem: (_: string, value: string) => {
      stored = value
    },
  })
  const templates = useMappingTemplates()
  const mapping = { line1: 0, line2: null, line3: null }
  templates.saveTemplate('  Team  ', mapping, true)
  mapping.line1 = 2
  const restored = useMappingTemplates()
  assert.deepEqual(
    [
      restored.templateNames.value,
      restored.loadTemplate('Team')?.mapping.line1,
      restored.loadTemplate('Team')?.hasHeaders,
    ],
    [['Team'], 0, true]
  )
  restored.deleteTemplate('Team')
  assert.equal(useMappingTemplates().hasTemplates.value, false)
})

test('storage corruption, denial, and unavailable browser do not break mapping controls', t => {
  stub(t, 'window', undefined)
  const server = useMappingTemplates()
  server.saveTemplate('Server', { line1: 0, line2: null, line3: null }, false)
  assert.equal(server.hasTemplates.value, true)
  stub(t, 'window', {})
  const logged: unknown[] = []
  t.mock.method(console, 'error', (...args: unknown[]) => logged.push(args))
  for (const value of ['[]', 'null', '"text"', '{invalid']) {
    stub(t, 'localStorage', { getItem: () => value })
    assert.equal(useMappingTemplates().hasTemplates.value, false)
  }
  stub(t, 'localStorage', {
    getItem: () => null,
    setItem() {
      throw new Error('quota exceeded')
    },
  })
  const denied = useMappingTemplates()
  denied.saveTemplate('Memory', { line1: 0, line2: null, line3: null }, false)
  assert.equal(denied.loadTemplate('Memory')?.name, 'Memory')
  assert.equal(logged.length, 2)
})

test('unknown upload errors retain actionable source-specific messages', async t => {
  stub(t, '$fetch', async () => {
    throw 'offline'
  })
  const upload = useDataUpload()
  await upload.uploadSheets('sheet')
  assert.equal(upload.error.value, 'Failed to parse Google Sheet')
  await upload.uploadFile(new File(['Alice'], 'names.csv'))
  assert.equal(upload.error.value, 'Failed to parse file')
})

test('generation downloads HTML and PDF with correct content types and cleans temporary URLs', async t => {
  const blobs: Blob[] = []
  const filenames: string[] = []
  const revoked: string[] = []
  stub(t, 'window', {
    URL: {
      createObjectURL: (blob: Blob) => {
        blobs.push(blob)
        return `blob:${blobs.length}`
      },
      revokeObjectURL: (url: string) => revoked.push(url),
    },
  })
  stub(t, 'document', {
    createElement: () => ({
      download: '',
      click() {
        filenames.push(this.download)
      },
    }),
  })
  stub(t, '$fetch', async (_: string, options: { body: { format: string } }) =>
    options.body.format === 'pdf'
      ? new Blob(['%PDF-content'])
      : { html: '<p>Alice</p>', labelCount: 1, sheetCount: 1 }
  )
  const generation = useNameTagGeneration()
  generation.downloadHtml()
  const mapping = { line1: 0, line2: null, line3: null }
  await generation.generate('Alice', mapping, false)
  generation.downloadHtml()
  await generation.generate('Alice', mapping, false, 'pdf')
  assert.deepEqual(filenames, ['name-tags.html', 'name-tags.pdf'])
  assert.deepEqual(
    blobs.map(blob => blob.type),
    ['text/html', 'application/pdf']
  )
  assert.deepEqual(await Promise.all(blobs.map(blob => blob.text())), [
    '<p>Alice</p>',
    '%PDF-content',
  ])
  assert.deepEqual(revoked, ['blob:1', 'blob:2'])
})

test('unknown generation failure clears old counts and reports recovery text', async t => {
  stub(t, '$fetch', async () => ({ html: 'old', labelCount: 10, sheetCount: 2 }))
  const generation = useNameTagGeneration()
  const mapping = { line1: 0, line2: null, line3: null }
  await generation.generate('Alice', mapping, false)
  stub(t, '$fetch', async () => {
    throw 'offline'
  })
  await generation.generate('Bob', mapping, false)
  assert.deepEqual(
    [
      generation.generatedHtml.value,
      generation.labelCount.value,
      generation.sheetCount.value,
      generation.error.value,
    ],
    [null, 0, 0, 'Failed to generate name tags']
  )
})
