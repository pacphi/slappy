import assert from 'node:assert/strict'
import { test } from 'node:test'
import { labelTemplates, defaultLabelTemplateId, getLabelTemplate } from '../shared/label-templates'
import { generationRequestSchema } from '../shared/validation'

test('catalog defaults to Avery 5390', () => {
  assert.equal(defaultLabelTemplateId, 'avery-5390')
})
test('catalog covers the approved providers and paper formats', () => {
  const count = (key: 'provider' | 'paperSize', value: string) =>
    labelTemplates.filter(template => template[key] === value).length
  assert.deepEqual(
    [count('provider', 'Avery'), count('provider', 'TownStix'), count('provider', 'OnlineLabels')],
    [17, 7, 10]
  )
  assert.deepEqual([count('paperSize', 'Letter'), count('paperSize', 'A4')], [22, 12])
})
test('catalog lists only preferred templates alphabetically', () => {
  const names = labelTemplates.map(template => template.name)
  assert.deepEqual(
    names,
    [...names].sort((a, b) => a.localeCompare(b, 'en'))
  )
  assert.equal(names.length, 34)
  assert.equal(
    labelTemplates.some(template => template.id === 'onlinelabels-ol875'),
    false
  )
})
test('legacy OnlineLabels requests retain their original geometry', () => {
  const result = generationRequestSchema.parse({
    csvContent: 'Ada',
    mapping: { line1: 0, line2: null, line3: null },
    labelTemplate: 'onlinelabels-ol875',
  })
  const template = getLabelTemplate(result.labelTemplate)
  assert.equal(template.widthIn, 2.5935)
  assert.equal(template.marginLeftIn, 0.21975)
})
