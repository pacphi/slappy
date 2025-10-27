/**
 * Shared type definitions for Slappy
 * Used by both Nuxt server and CLI tools
 */

/**
 * Represents a single name tag with up to 3 lines of text
 */
export interface NameTagRow {
  line1: string // Column A - Large font (32pt, bold)
  line2: string // Column B - Smaller font (18pt)
  line3: string // Column C - Smaller font (18pt)
}

/**
 * Represents a logical page of name tags
 * Can span multiple physical pages if more than 10 tags
 */
export interface NameTagPage {
  tags: NameTagRow[]
}

/**
 * Column mapping configuration
 * Maps each line to a column index (0-based)
 * null means the line should be left empty
 */
export interface ColumnMapping {
  line1: number | null
  line2: number | null
  line3: number | null
}

/**
 * Parsed raw data with metadata
 */
export interface ParsedData {
  columns: string[][] // All rows as arrays of column values
  headers?: string[] // Column names if hasHeaders is true
  columnCount: number
  rowCount: number
  preview: string[][] // First 5 rows for preview
}

/**
 * Output format options
 */
export type OutputFormat = 'html' | 'pdf'
