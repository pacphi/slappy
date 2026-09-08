import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fetchGoogleSheetAsCSV } from '../lib/sheets-fetcher'
import { MAX_CSV_BYTES } from '../shared/limits'

test('rejects untrusted Google Sheets URLs before making a request', async () => {
  for (const url of [
    'http://docs.google.com/spreadsheets/d/abc',
    'https://evil.test/spreadsheets/d/abc',
    'https://docs.google.com@evil.test/spreadsheets/d/abc',
    'https://user@docs.google.com/spreadsheets/d/abc',
    'https://docs.google.com/spreadsheets/d/abc?gid=bad',
    'invalid',
  ]) {
    await assert.rejects(fetchGoogleSheetAsCSV(url), /Invalid Google Sheets/)
  }
})

test('constructs the export URL and preserves tab selection', async t => {
  let requested = ''
  t.mock.method(globalThis, 'fetch', async (url: URL) => {
    requested = url.href
    return new Response('Name\nJosé')
  })
  assert.equal(
    await fetchGoogleSheetAsCSV('https://docs.google.com/spreadsheets/d/abc/edit?gid=1#gid=42'),
    'Name\nJosé'
  )
  assert.equal(requested, 'https://docs.google.com/spreadsheets/d/abc/export?format=csv&gid=42')
})

test('rejects redirects outside Google export hosts', async t => {
  t.mock.method(
    globalThis,
    'fetch',
    async () =>
      new Response(null, { status: 302, headers: { location: 'http://127.0.0.1/private' } })
  )
  await assert.rejects(
    fetchGoogleSheetAsCSV('https://docs.google.com/spreadsheets/d/abc'),
    /unsupported host/
  )
})

test('follows a Google export redirect and bounds downloaded content', async t => {
  let requests = 0
  t.mock.method(globalThis, 'fetch', async () => {
    requests++
    if (requests === 1)
      return new Response(null, {
        status: 302,
        headers: { location: 'https://doc-abc.googleusercontent.com/export' },
      })
    return new Response(new Uint8Array(MAX_CSV_BYTES + 1))
  })
  await assert.rejects(
    fetchGoogleSheetAsCSV('https://docs.google.com/spreadsheets/d/abc'),
    RangeError
  )
  assert.equal(requests, 2)
})

test('rejects declared oversized downloads without reading them', async t => {
  t.mock.method(
    globalThis,
    'fetch',
    async () => new Response('x', { headers: { 'content-length': String(MAX_CSV_BYTES + 1) } })
  )
  await assert.rejects(
    fetchGoogleSheetAsCSV('https://docs.google.com/spreadsheets/d/abc'),
    RangeError
  )
})

test('reports unsuccessful export responses', async t => {
  t.mock.method(globalThis, 'fetch', async () => new Response(null, { status: 403 }))
  await assert.rejects(
    fetchGoogleSheetAsCSV('https://docs.google.com/spreadsheets/d/abc'),
    /HTTP 403/
  )
})

test('propagates network timeouts and supplies an abort deadline', async t => {
  t.mock.method(globalThis, 'fetch', async (_url: URL, init: RequestInit) => {
    assert.ok(init.signal instanceof AbortSignal)
    throw new DOMException('Timed out', 'TimeoutError')
  })
  await assert.rejects(fetchGoogleSheetAsCSV('https://docs.google.com/spreadsheets/d/abc'), {
    name: 'TimeoutError',
  })
})

test('rejects redirect loops, missing locations, and empty exports', async t => {
  let response = () =>
    new Response(null, { status: 302, headers: { location: '/spreadsheets/d/abc/export' } })
  t.mock.method(globalThis, 'fetch', async () => response())
  await assert.rejects(
    fetchGoogleSheetAsCSV('https://docs.google.com/spreadsheets/d/abc'),
    /redirect failed/
  )
  response = () => new Response(null, { status: 302 })
  await assert.rejects(
    fetchGoogleSheetAsCSV('https://docs.google.com/spreadsheets/d/abc'),
    /redirect failed/
  )
  response = () => new Response(null)
  await assert.rejects(fetchGoogleSheetAsCSV('https://docs.google.com/spreadsheets/d/abc'), /empty/)
})
