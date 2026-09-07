import assert from 'node:assert/strict'
import { test } from 'node:test'
import { generateNameTagsHTML } from '../lib/html-generator'

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
