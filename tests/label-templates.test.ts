import assert from 'node:assert/strict'
import { test } from 'node:test'
import { generateNameTagsHTML } from '../lib/html-generator'
import { labelTemplates, getLabelTemplate } from '../shared/label-templates'

test('should_offerTwentyDistinctStocks_when_catalogLoaded', () => {
  assert.equal(new Set(labelTemplates.map(template => template.id)).size, 20)
})

test('should_keepAllLabelsWithinLetterSheet_when_catalogLoaded', () => {
  for (const t of labelTemplates) {
    assert.ok(
      t.marginLeftIn + t.columns * t.widthIn + (t.columns - 1) * t.columnGapIn + t.marginRightIn <=
        8.501 &&
        t.marginTopIn + t.rows * t.heightIn + (t.rows - 1) * t.rowGapIn + t.marginBottomIn <=
          11.001,
      t.id
    )
  }
})

test('should_paginateEveryStock_when_oneMoreThanFullSheetProvided', () => {
  for (const t of labelTemplates) {
    const capacity = t.columns * t.rows
    const html = generateNameTagsHTML([{ tags: tags(capacity + 1) }], t.id)
    assert.equal((html.match(/class="name-tag"/g) || []).length, capacity * 2, t.id)
  }
})

const tags = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    line1: `Person ${index + 1}`,
    line2: '',
    line3: '',
  }))

test('should_splitAndPadEightLabels_when_avery5390Selected', () => {
  const html = generateNameTagsHTML([{ tags: tags(9) }], 'avery-5390')
  assert.equal((html.match(/class="name-tag"/g) || []).length, 16)
})

test('should_fitEightLabelsOnOneSheet_when_avery5390Selected', () => {
  const html = generateNameTagsHTML([{ tags: tags(8) }], 'avery-5390')
  assert.equal((html.match(/class="page"/g) || []).length, 1)
})

test('should_keepLogicalPageBreaks_when_partialAverySheetsProvided', () => {
  const html = generateNameTagsHTML([{ tags: tags(1) }, { tags: tags(2) }], 'avery-5390')
  assert.equal((html.match(/class="name-tag"/g) || []).length, 16)
})

test('should_preserveTenLabelDefault_when_templateOmitted', () => {
  const html = generateNameTagsHTML([{ tags: tags(11) }])
  assert.equal((html.match(/class="name-tag"/g) || []).length, 20)
})

test('should_rejectUnknownTemplate_when_untrustedValuePassed', () => {
  assert.throws(() => generateNameTagsHTML([], 'invalid' as never), /Unknown label template/)
})

test('should_escapeMarkup_when_labelContainsHTML', () => {
  const html = generateNameTagsHTML([{ tags: [{ line1: '<script>', line2: '&', line3: '"' }] }])
  assert.ok(html.includes('&lt;script&gt;'))
})

// Invalid-input cases suggested by Agentic-QE; exercise the real catalog lookup.
for (const id of [null, '', ' ', 0, false, {}, [], 'AVERY-5390']) {
  test(`should_rejectUnsupportedId_when_${JSON.stringify(id)}Passed`, () => {
    assert.throws(() => getLabelTemplate(id), RangeError)
  })
}
