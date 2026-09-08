import type { ColumnMapping, NameTagRow, NameTagPage } from '../shared/types'
import { isBlankRecord, parseCSVRecords } from './csv-records'

function mapRecord(columns: string[], mapping: ColumnMapping): NameTagRow {
  const cell = (index: number | null) => (index === null ? '' : columns[index] || '')
  return { line1: cell(mapping.line1), line2: cell(mapping.line2), line3: cell(mapping.line3) }
}

/** Blank records separate logical pages; unmapped data never creates empty labels. */
export function parseCSVToPagesWithMapping(
  csvContent: string,
  mapping: ColumnMapping,
  hasHeaders = false
): NameTagPage[] {
  const records = parseCSVRecords(csvContent)
  const pages: NameTagPage[] = []
  let tags: NameTagRow[] = []
  const finishPage = () => {
    if (tags.length) pages.push({ tags })
    tags = []
  }
  let skipHeader = hasHeaders
  for (const row of records) {
    if (isBlankRecord(row)) {
      finishPage()
      continue
    }
    if (skipHeader) {
      skipHeader = false
      continue
    }
    const tag = mapRecord(row, mapping)
    if (Object.values(tag).some(Boolean)) tags.push(tag)
  }
  finishPage()
  return pages
}

export function getDefaultMapping(): ColumnMapping {
  return { line1: 0, line2: 1, line3: 2 }
}
