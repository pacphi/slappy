import type { ParsedData } from './types'
import { parseCSVLine } from './csv-parser'

/**
 * Parses raw CSV content and extracts column data with metadata
 * @param csvContent Raw CSV content as string
 * @param hasHeaders Whether the first row contains headers (default: false)
 * @returns ParsedData with all columns, headers, and preview
 */
export function parseRawData(csvContent: string, hasHeaders = false): ParsedData {
  const lines = csvContent.split('\n').filter(line => line.trim() !== '')

  if (lines.length === 0) {
    return {
      columns: [],
      columnCount: 0,
      rowCount: 0,
      preview: [],
    }
  }

  const columns: string[][] = []
  let headers: string[] | undefined
  let startIndex = 0

  // Extract headers if specified
  if (hasHeaders && lines.length > 0) {
    headers = parseCSVLine(lines[0])
    startIndex = 1
  }

  // Parse all data rows
  for (let i = startIndex; i < lines.length; i++) {
    const parsedLine = parseCSVLine(lines[i])

    // Skip completely blank rows
    const isBlank = parsedLine.every(col => !col || col.trim() === '')
    if (!isBlank) {
      columns.push(parsedLine)
    }
  }

  // Determine column count (max columns across all rows)
  const columnCount = Math.max(headers?.length || 0, ...columns.map(row => row.length))

  // Normalize all rows to have the same number of columns
  const normalizedColumns = columns.map(row => {
    const normalized = [...row]
    while (normalized.length < columnCount) {
      normalized.push('')
    }
    return normalized
  })

  // Get preview (first 5 rows)
  const preview = normalizedColumns.slice(0, 5)

  return {
    columns: normalizedColumns,
    headers,
    columnCount,
    rowCount: normalizedColumns.length,
    preview,
  }
}
