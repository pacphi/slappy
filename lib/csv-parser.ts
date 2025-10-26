import type { NameTagRow, NameTagPage } from './types'

/**
 * Simple CSV line parser that respects quoted values
 * Handles cases like: "Name, First", School, Voice
 */
export function parseCSVLine(line: string): string[] {
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
 * Parses CSV content and organizes into pages based on blank rows
 * @param csvContent Raw CSV content (string)
 * @param skipHeader Whether to skip the first row (default: true)
 * @returns Array of pages, each containing name tag rows
 */
export function parseCSVToPages(csvContent: string, skipHeader = true): NameTagPage[] {
  const lines = csvContent.split('\n')
  const pages: NameTagPage[] = []
  let currentPage: NameTagRow[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Skip the first line (header row) if requested
    if (i === 0 && skipHeader) {
      continue
    }

    // Split CSV line respecting quoted values
    const columns = parseCSVLine(line)

    // Check if row is blank (all columns empty or just whitespace)
    const isBlankRow = columns.every(col => !col || col.trim() === '')

    if (isBlankRow) {
      // Blank row indicates page break
      if (currentPage.length > 0) {
        pages.push({ tags: currentPage })
        currentPage = []
      }
    } else {
      // Add row to current page
      const tagRow: NameTagRow = {
        line1: columns[0] || '',
        line2: columns[1] || '',
        line3: columns[2] || '',
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
