import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseCSVLine, parseCSVToPages } from '../lib/csv-parser'
import { parseCSVToPagesWithMapping } from '../lib/column-mapper'
import { parseRawData } from '../lib/data-parser'

const mapping = { line1: 0, line2: 1, line3: null }
test('should_preserveEscapedQuotes_when_csvFieldQuoted', () => {
  assert.deepEqual(parseCSVLine('"Ada ""Ace"" Lee",Team'), ['Ada "Ace" Lee', 'Team'])
})
test('should_preserveMultilineFields_when_csvParsed', () => {
  assert.deepEqual(parseCSVToPagesWithMapping('Name,Team\r\n"Ada\nLee",R&D', mapping, true), [
    { tags: [{ line1: 'Ada\nLee', line2: 'R&D', line3: '' }] },
  ])
})
test('should_preserveOriginalCSV_when_previewParsed', () => {
  const csv = 'Name,Team\n"Lee, Ada",Engineering\n\nBob,Ops'
  assert.equal(parseRawData(csv).csvContent, csv)
})
test('should_rejectMalformedCSV_when_quotesUnclosed', () => {
  assert.throws(() => parseRawData('"Ada,Lee'), /CSV/)
})
test('should_skipBOMHeader_when_defaultPageParserUsed', () => {
  assert.deepEqual(parseCSVToPages('\uFEFFName,Team\r\nAda,Ops\r\n\r\nBob,R&D'), [
    { tags: [{ line1: 'Ada', line2: 'Ops', line3: '' }] },
    { tags: [{ line1: 'Bob', line2: 'R&D', line3: '' }] },
  ])
})
test('should_normalizeRaggedRows_when_previewBuilt', () => {
  assert.deepEqual(parseRawData('Name,Team\nAda\nBob,Ops', true).columns, [
    ['Ada', ''],
    ['Bob', 'Ops'],
  ])
})
test('should_returnEmptyPreview_when_csvBlank', () => {
  assert.equal(parseRawData('\n,,\n').rowCount, 0)
})
test('should_rejectExcessiveRows_when_csvExceedsLimit', () => {
  assert.throws(() => parseRawData('x\n'.repeat(10002)), /rows/)
})
test('should_rejectExcessiveColumns_when_csvExceedsLimit', () => {
  assert.throws(() => parseRawData(Array(101).fill('x').join(',')), /columns/)
})
test('should_skipUnmappedRows_when_selectedCellsEmpty', () => {
  assert.deepEqual(
    parseCSVToPagesWithMapping(',Ops\nAda,R&D', { line1: 0, line2: null, line3: null }),
    [{ tags: [{ line1: 'Ada', line2: '', line3: '' }] }]
  )
})

test('should_skipFirstNonblankHeader_when_csvStartsWithBlankRecords', () => {
  assert.deepEqual(parseCSVToPagesWithMapping('\n\nName,Team\nAda,Ops', mapping, true), [
    { tags: [{ line1: 'Ada', line2: 'Ops', line3: '' }] },
  ])
})
