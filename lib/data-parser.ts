import type { ParsedData } from '../shared/types'
import { isBlankRecord, parseCSVRecords } from './csv-records'

export function parseRawData(csvContent: string, hasHeaders = false): ParsedData {
  const rows = parseCSVRecords(csvContent).filter(row => !isBlankRecord(row))
  const headers = hasHeaders ? rows.shift() : undefined
  const columnCount = rows.reduce(
    (maximum, row) => Math.max(maximum, row.length),
    headers?.length || 0
  )
  const columns = rows.map(row => [...row, ...Array<string>(columnCount - row.length).fill('')])
  return {
    csvContent,
    columns,
    headers,
    columnCount,
    rowCount: columns.length,
    preview: columns.slice(0, 5),
  }
}
