// m6: Client-side validation utilities

/**
 * Validates if a URL is a valid Google Sheets URL
 */
export function isValidGoogleSheetsUrl(url: string): boolean {
  const pattern = /^https:\/\/docs\.google\.com\/spreadsheets\/d\/[a-zA-Z0-9-_]+/
  return pattern.test(url)
}

/**
 * Validates if a file is a CSV file
 */
export function isValidCSVFile(file: File): boolean {
  return file.name.toLowerCase().endsWith('.csv')
}
