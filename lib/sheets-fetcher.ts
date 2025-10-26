/**
 * Fetches data from a published Google Sheet as CSV
 * @param spreadsheetId The Google Sheets ID from the URL
 * @param gid The tab/sheet ID (gid parameter from the URL, default: '0')
 * @returns CSV content as string
 * @throws Error if the fetch fails or the sheet is not published
 */
export async function fetchGoogleSheetAsCSV(
  spreadsheetId: string,
  gid: string = '0'
): Promise<string> {
  const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`

  const response = await fetch(csvUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch Google Sheet: ${response.statusText}`)
  }

  return await response.text()
}

/**
 * Extracts spreadsheet ID and GID from a Google Sheets URL
 * Supports various URL formats:
 * - https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit#gid=GID
 * - https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit?gid=GID
 * - https://docs.google.com/spreadsheets/d/SPREADSHEET_ID
 * @param url Google Sheets URL
 * @returns Object with spreadsheetId and gid (defaults to '0')
 */
export function parseGoogleSheetsUrl(url: string): { spreadsheetId: string; gid: string } {
  // Extract spreadsheet ID from URL
  const spreadsheetMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
  if (!spreadsheetMatch) {
    throw new Error('Invalid Google Sheets URL')
  }
  const spreadsheetId = spreadsheetMatch[1]

  // Extract GID from URL (hash or query parameter)
  let gid = '0' // Default to first sheet
  const gidHashMatch = url.match(/#gid=(\d+)/)
  const gidQueryMatch = url.match(/[?&]gid=(\d+)/)

  if (gidHashMatch) {
    gid = gidHashMatch[1]
  } else if (gidQueryMatch) {
    gid = gidQueryMatch[1]
  }

  return { spreadsheetId, gid }
}
