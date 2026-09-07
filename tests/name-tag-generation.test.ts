import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
import { test, type TestContext } from 'node:test'

// Resolve Nuxt's shared alias only in this standalone Node test process.
const aliasHook = registerHooks({
  resolve(specifier, context, nextResolve) {
    return nextResolve(
      specifier === '#shared/label-templates'
        ? new URL('../shared/label-templates.ts', import.meta.url).href
        : specifier,
      context
    )
  },
})
const { useNameTagGeneration } = await import('../app/composables/useNameTagGeneration')
aliasHook.deregister()

const mapping = { line1: 0, line2: null, line3: null }
const response = (html: string) => ({ html, labelCount: 2, sheetCount: 2 })

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: Error) => void
  const promise = new Promise<T>((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}

function stubGlobal(t: TestContext, name: string, value: unknown) {
  const original = Object.getOwnPropertyDescriptor(globalThis, name)
  Object.defineProperty(globalThis, name, { configurable: true, writable: true, value })
  t.after(() => {
    if (original) Object.defineProperty(globalThis, name, original)
    else Reflect.deleteProperty(globalThis, name)
  })
}

function queuedRequests(t: TestContext) {
  const requests = [deferred<unknown>(), deferred<unknown>()]
  let next = 0
  stubGlobal(t, '$fetch', () => requests[next++].promise)
  return requests
}

function stateOf(generation: ReturnType<typeof useNameTagGeneration>) {
  return {
    html: generation.generatedHtml.value,
    labelCount: generation.labelCount.value,
    sheetCount: generation.sheetCount.value,
    loading: generation.loading.value,
    error: generation.error.value,
  }
}

test('should_keepNewerPreviewLoading_when_olderRequestFinishesFirst', async t => {
  const [older, newer] = queuedRequests(t)
  const generation = useNameTagGeneration()
  const first = generation.generate('old', mapping, true)
  const second = generation.generate('new', mapping, true)
  older.resolve(response('old'))
  await first
  assert.deepEqual(stateOf(generation), {
    html: null,
    labelCount: 0,
    sheetCount: 0,
    loading: true,
    error: null,
  })
  newer.resolve(response('new'))
  await second
})

test('should_preserveCurrentPreview_when_olderRequestFinishesLast', async t => {
  const [older, newer] = queuedRequests(t)
  const generation = useNameTagGeneration()
  const first = generation.generate('old', mapping, true)
  const second = generation.generate('new', mapping, true)
  newer.resolve(response('new'))
  await second
  older.resolve({ html: 'old', labelCount: 1, sheetCount: 1 })
  await first
  assert.deepEqual(stateOf(generation), {
    html: 'new',
    labelCount: 2,
    sheetCount: 2,
    loading: false,
    error: null,
  })
})

test('should_ignoreStaleError_when_olderRequestFails', async t => {
  const [older, newer] = queuedRequests(t)
  const generation = useNameTagGeneration()
  const first = generation.generate('old', mapping, true)
  const second = generation.generate('new', mapping, true)
  older.reject(new Error('Old request failed'))
  await first
  assert.deepEqual(stateOf(generation), {
    html: null,
    labelCount: 0,
    sheetCount: 0,
    loading: true,
    error: null,
  })
  newer.resolve(response('new'))
  await second
})

test('should_keepResetState_when_pendingPreviewCompletes', async t => {
  const [pending] = queuedRequests(t)
  const generation = useNameTagGeneration()
  const request = generation.generate('old', mapping, true)
  generation.reset()
  pending.resolve(response('old'))
  await request
  assert.deepEqual(stateOf(generation), {
    html: null,
    labelCount: 0,
    sheetCount: 0,
    loading: false,
    error: null,
  })
})

test('should_keepPdfLoading_when_supersededPreviewCompletes', async t => {
  const [older, newer] = queuedRequests(t)
  const generation = useNameTagGeneration()
  const first = generation.generate('old', mapping, true)
  const second = generation.generate('new', mapping, true, 'pdf')
  older.resolve(response('old'))
  await first
  assert.equal(generation.loading.value, true)
  newer.reject(new Error('PDF failed'))
  await second
})

test('should_reportCurrentPdfError_when_pdfRequestFails', async t => {
  const [pending] = queuedRequests(t)
  const generation = useNameTagGeneration()
  const request = generation.generate('new', mapping, true, 'pdf')
  pending.reject(new Error('PDF failed'))
  await request
  assert.deepEqual(
    { loading: generation.loading.value, error: generation.error.value },
    {
      loading: false,
      error: 'PDF failed',
    }
  )
})

test('should_suppressPendingPdfDownload_when_resetCalled', async t => {
  const [pending] = queuedRequests(t)
  let downloads = 0
  stubGlobal(t, 'window', { URL: { createObjectURL: () => 'blob:test', revokeObjectURL() {} } })
  stubGlobal(t, 'document', { createElement: () => ({ click: () => downloads++ }) })
  const generation = useNameTagGeneration()
  const request = generation.generate('new', mapping, true, 'pdf')
  generation.reset()
  pending.resolve(new Blob(['pdf']))
  await request
  assert.equal(downloads, 0)
})
