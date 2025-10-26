import type { ColumnMapping, NameTagRow, NameTagPage } from './types'

/**
 * Applies column mapping and organizes into pages based on blank rows
 * @param csvContent Raw CSV content
 * @param mapping Column mapping configuration
 * @param hasHeaders Whether the first row contains headers
 * @returns Array of NameTagPage objects
 */
export function parseCSVToPagesWithMapping(
  csvContent: string,
  mapping: ColumnMapping,
  hasHeaders = false
): NameTagPage[] {
  const lines = csvContent.split('\n')
  const pages: NameTagPage[] = []
  let currentPage: NameTagRow[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Skip the first line (header row) if requested
    if (i === 0 && hasHeaders) {
      continue
    }

    // Simple CSV parsing (respecting quotes)
    const columns = parseCSVLineSimple(line)

    // Check if row is blank (all columns empty or just whitespace)
    const isBlankRow = columns.every(col => !col || col.trim() === '')

    if (isBlankRow) {
      // Blank row indicates page break
      if (currentPage.length > 0) {
        pages.push({ tags: currentPage })
        currentPage = []
      }
    } else {
      // Apply mapping to create tag row
      const tagRow: NameTagRow = {
        line1: mapping.line1 !== null ? columns[mapping.line1] || '' : '',
        line2: mapping.line2 !== null ? columns[mapping.line2] || '' : '',
        line3: mapping.line3 !== null ? columns[mapping.line3] || '' : '',
      }

      // Only add if at least one field has content
      if (tagRow.line1 || tagRow.line2 || tagRow.line3) {
        currentPage.push(tagRow)
      }
    }
  }

  // Add remaining rows as final page
  if (currentPage.length > 0) {
    pages.push({ tags: currentPage })
  }

  return pages
}

/**
 * Simple CSV line parser that respects quoted values
 * Duplicate of parseCSVLine from csv-parser.ts to avoid circular dependencies
 */
function parseCSVLineSimple(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }

  result.push(current)
  return result.map(s => s.trim())
}

/**
 * Creates a default column mapping (columns 0, 1, 2 → lines 1, 2, 3)
 */
export function getDefaultMapping(): ColumnMapping {
  return {
    line1: 0,
    line2: 1,
    line3: 2,
  }
}
