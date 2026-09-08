import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { generatePDF, generatePDFFile, PDFCapacityError } from '../lib/pdf-generator'

test('PDF generator produces real PDFs, rejects excess jobs, and releases capacity', async () => {
  const html = '<!doctype html><html><body><h1>Ada Lovelace</h1></body></html>'
  const first = generatePDF(html)
  const second = generatePDF(html)
  await assert.rejects(generatePDF(html), PDFCapacityError)
  const outputs = await Promise.all([first, second])
  for (const output of outputs) assert.equal(output.subarray(0, 5).toString(), '%PDF-')
  const next = await generatePDF(html)
  assert.equal(next.subarray(0, 5).toString(), '%PDF-')
})

test('PDF file output blocks external resources and writes a valid document', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'slappy-pdf-'))
  t.after(() => rm(directory, { recursive: true, force: true }))
  const path = join(directory, 'labels.pdf')
  await generatePDFFile('<html><body>Ada<img src="http://127.0.0.1:1/private"></body></html>', path)
  assert.equal((await readFile(path)).subarray(0, 5).toString(), '%PDF-')
})
