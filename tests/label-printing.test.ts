import assert from 'node:assert/strict'
import { test } from 'node:test'
import puppeteer from 'puppeteer'
import { generateNameTagsHTML } from '../lib/html-generator'
import { generatePDF } from '../lib/pdf-generator'
import type { LabelTemplateId } from '../shared/label-templates'

const tags = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    line1: `Person ${index + 1}`,
    line2: 'Company',
    line3: 'Team',
  }))

// Avery's official U-0119-01.pdf uses (54,76.5)pt origin and 252×159.75pt cells.
// Convert independently to CSS pixels (96/72), so template regressions are detected.
for (const stock of [
  {
    id: 'avery-5390',
    count: 8,
    left: 72,
    top: 102,
    width: 336,
    height: 213,
  },
  { id: 'townstix-us-10', count: 10, left: 24, top: 48, width: 384, height: 192 },
] as const) {
  test(`should_alignPhysicalLabels_when_${stock.id}Selected`, async () => {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
    try {
      const page = await browser.newPage()
      await page.setViewport({ width: 816, height: 1056 })
      await page.setContent(generateNameTagsHTML([{ tags: tags(stock.count) }], stock.id))
      await page.emulateMediaType('print')
      const boxes = await page.$$eval('.name-tag', elements =>
        elements.map(element => {
          const rect = element.getBoundingClientRect()
          return { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
        })
      )
      const expected = Array.from({ length: stock.count }, (_, index) => ({
        left: stock.left + (index % 2) * stock.width,
        top: stock.top + Math.floor(index / 2) * stock.height,
        width: stock.width,
        height: stock.height,
      }))
      assert.ok(
        boxes.length === expected.length &&
          boxes.every((box, index) =>
            Object.entries(box).every(
              ([key, value]) => Math.abs(value - expected[index][key as keyof typeof box]) < 0.1
            )
          ),
        'Every label should align within a tenth of a CSS pixel of the stock template'
      )
    } finally {
      await browser.close()
    }
  })
}

for (const [templateId, count, expectedPages] of [
  ['avery-5390', 8, 1],
  ['avery-5390', 9, 2],
  ['townstix-us-10', 10, 1],
  ['townstix-us-10', 11, 2],
] as const) {
  test(`should_print${expectedPages}Pages_when_${count}LabelsUse${templateId}`, async () => {
    const html = generateNameTagsHTML([{ tags: tags(count) }], templateId as LabelTemplateId)
    const pdf = await generatePDF(html)
    assert.equal((pdf.toString('latin1').match(/\/Type\s*\/Page\b/g) || []).length, expectedPages)
  })
}
