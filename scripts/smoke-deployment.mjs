import assert from 'node:assert/strict'
import { setTimeout } from 'node:timers/promises'

const baseUrl = process.env.SLAPPY_SMOKE_URL || 'http://127.0.0.1:3000'
assert.equal(process.versions.node.split('.')[0], '26', 'Deployment must run Node 26')
let ready = false
for (let attempt = 0; attempt < 60; attempt++) {
  try {
    const response = await fetch(baseUrl, { signal: AbortSignal.timeout(2000) })
    if (response.ok) {
      ready = true
      break
    }
  } catch {
    // The server may still be starting.
  }
  await setTimeout(500)
}
assert.ok(ready, 'Production server did not become ready')

const csvContent = ['Name', ...Array.from({ length: 9 }, (_, index) => `Person ${index + 1}`)].join(
  '\n'
)
const payload = { csvContent, mapping: { line1: 0, line2: null, line3: null }, hasHeaders: true }
for (const [labelTemplate, expectedPages, expectedSlots] of [
  ['townstix-us-10', 1, 10],
  ['avery-5390', 2, 16],
]) {
  const response = await fetch(`${baseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, labelTemplate, format: 'html' }),
  })
  assert.equal(response.status, 200, `${labelTemplate} HTML request failed`)
  const { html, labelCount, sheetCount } = await response.json()
  assert.equal(labelCount, 9)
  assert.equal(sheetCount, expectedPages)
  assert.equal((html.match(/class="page"/g) || []).length, expectedPages)
  assert.equal((html.match(/class="name-tag"/g) || []).length, expectedSlots)

  const pdfResponse = await fetch(`${baseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, labelTemplate, format: 'pdf' }),
    signal: AbortSignal.timeout(30000),
  })
  assert.equal(pdfResponse.status, 200, `${labelTemplate} PDF request failed`)
  assert.match(pdfResponse.headers.get('content-type'), /application\/pdf/)
  const pdf = Buffer.from(await pdfResponse.arrayBuffer()).toString('latin1')
  assert.ok(pdf.startsWith('%PDF-'))
  assert.equal((pdf.match(/\/Type\s*\/Page\b/g) || []).length, expectedPages)
  console.log(`${labelTemplate}: HTML and PDF passed (${expectedPages} sheet(s))`)
}
// Blank CSV rows are intentional physical page breaks, even for partial sheets.
const grouped = await fetch(`${baseUrl}/api/generate`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ...payload,
    csvContent: 'Name\nAlice\n\nBob',
    labelTemplate: 'avery-5390',
  }),
})
assert.equal(grouped.status, 200)
const groupedResult = await grouped.json()
assert.equal(groupedResult.sheetCount, 2)
assert.equal((groupedResult.html.match(/class="page"/g) || []).length, 2)

const invalid = await fetch(`${baseUrl}/api/generate`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ...payload, labelTemplate: 'unknown-stock', format: 'html' }),
})
assert.equal(invalid.status, 400, 'Unknown label stock must be rejected')
console.log(`Deployment smoke passed on Node ${process.versions.node}`)
