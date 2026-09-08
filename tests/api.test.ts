import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { test, type TestContext } from 'node:test'
import { createApp, toNodeListener } from 'h3'
import parseHandler from '../server/api/parse.post'
import generateHandler from '../server/api/generate.post'
import { generatePDF } from '../lib/pdf-generator'
import { MAX_REQUEST_BYTES } from '../server/utils/request-body'

const mapping = { line1: 0, line2: null, line3: null }

async function startAPI(t: TestContext) {
  const app = createApp().use('/parse', parseHandler).use('/generate', generateHandler)
  const server = createServer(toNodeListener(app))
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  t.after(
    () =>
      new Promise<void>((resolve, reject) =>
        server.close(error => (error ? reject(error) : resolve()))
      )
  )
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Expected TCP address')
  const url = `http://127.0.0.1:${address.port}`
  const post = (path: string, value: unknown) =>
    fetch(`${url}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(value),
    })

  return { url, post }
}

test('API validates input and returns real parsed and generated labels', async t => {
  const { url, post } = await startAPI(t)

  for (const value of [
    null,
    {},
    { csvContent: 'Ada', mapping: {} },
    { csvContent: 'Ada', mapping, format: 'exe' },
    { csvContent: 'Ada', mapping, labelTemplate: 'missing' },
  ]) {
    assert.equal((await post('/generate', value)).status, 400)
  }
  assert.equal((await fetch(`${url}/generate`, { method: 'POST', body: '{broken' })).status, 400)
  assert.equal((await post('/parse', null)).status, 400)
  assert.equal(
    (await post('/parse', { sheetsUrl: 'https://evil.test/spreadsheets/d/abc' })).status,
    400
  )
  const form = new FormData()
  form.set('file', new File(['Name\nAda'], 'people.csv', { type: 'text/csv' }))
  const parsed = await fetch(`${url}/parse`, { method: 'POST', body: form })
  assert.equal(parsed.status, 200)
  assert.equal((await parsed.json()).csvContent, 'Name\nAda')
  const generated = await post('/generate', { csvContent: 'Name\nAda', mapping, hasHeaders: true })
  assert.equal(generated.status, 200)
  const output = await generated.json()
  assert.equal(output.labelCount, 1)
  assert.equal(output.sheetCount, 1)
  assert.match(output.html, /Ada/)
  assert.equal(
    (await fetch(`${url}/generate`, { method: 'POST', body: 'x'.repeat(MAX_REQUEST_BYTES + 1) }))
      .status,
    413
  )
  const chunkedBody = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new Uint8Array(MAX_REQUEST_BYTES + 1))
      controller.close()
    },
  })
  const chunkedOptions = { method: 'POST', body: chunkedBody, duplex: 'half' }
  assert.equal((await fetch(`${url}/generate`, chunkedOptions)).status, 413)
  assert.equal((await post('/generate', { csvContent: '"unclosed', mapping })).status, 400)
  assert.equal(
    (
      await post('/generate', {
        csvContent: Array.from({ length: 501 }, () => 'Ada').join('\n\n'),
        mapping,
      })
    ).status,
    413
  )
})

test('API PDF response has attachment headers and returns 503 when workers are full', async t => {
  const { post } = await startAPI(t)
  const pending = [generatePDF('<p>Ada</p>'), generatePDF('<p>Grace</p>')]
  const busy = await post('/generate', { csvContent: 'Ada', mapping, format: 'pdf' })
  assert.equal(busy.status, 503)
  await Promise.all(pending)
  const pdf = await post('/generate', { csvContent: 'Ada', mapping, format: 'pdf' })
  assert.equal(pdf.status, 200)
  assert.equal(pdf.headers.get('content-type'), 'application/pdf')
  assert.match(pdf.headers.get('content-disposition') || '', /attachment/)
  assert.equal(
    Buffer.from(await pdf.arrayBuffer())
      .subarray(0, 5)
      .toString(),
    '%PDF-'
  )
})

test('API rejects missing files and malformed CSV uploads', async t => {
  const { url } = await startAPI(t)
  for (const body of [
    new FormData(),
    (() => {
      const form = new FormData()
      form.set('file', new File(['"unclosed'], 'broken.csv'))
      return form
    })(),
  ]) {
    assert.equal((await fetch(`${url}/parse`, { method: 'POST', body })).status, 400)
  }
})

test('API parses Sheets exports and handles upstream failures', async t => {
  const { post } = await startAPI(t)
  const realFetch = globalThis.fetch
  let status = 200
  t.mock.method(globalThis, 'fetch', (input: URL | RequestInfo, init?: RequestInit) => {
    if (String(input).startsWith('https://docs.google.com')) {
      return Promise.resolve(new Response('Name\nAda', { status }))
    }
    return realFetch(input, init)
  })
  const result = await post('/parse', { sheetsUrl: 'https://docs.google.com/spreadsheets/d/abc' })
  assert.equal(result.status, 200)
  assert.equal((await result.json()).csvContent, 'Name\nAda')
  status = 403
  assert.equal(
    (await post('/parse', { sheetsUrl: 'https://docs.google.com/spreadsheets/d/abc' })).status,
    400
  )
})

test('API accepts A4 and retired stocks while defaulting to Avery 5390', async t => {
  const { post } = await startAPI(t)
  for (const [labelTemplate, slots, title] of [
    [undefined, 8, 'Avery 5390'],
    ['avery-l7160', 21, 'Avery L7160'],
    ['onlinelabels-ol875', 30, 'OnlineLabels OL875'],
  ] as const) {
    const response = await post('/generate', { csvContent: 'Ada', mapping, labelTemplate })
    assert.equal(response.status, 200, title)
    const { html } = await response.json()
    assert.ok(html.includes(`<title>Name Tags - ${title}</title>`))
    assert.equal((html.match(/class="name-tag"/g) || []).length, slots)
  }
})
