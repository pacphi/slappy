/**
 * Fetches data from a published Google Sheet as CSV
 * Accepts full Google Sheets URL and extracts spreadsheet ID and GID
 * @param sheetsUrl Full Google Sheets URL
 * @returns CSV content as string
 * @throws Error if the fetch fails or the sheet is not published
 */
export async function fetchGoogleSheetAsCSV(sheetsUrl: string): Promise<string> {
  // Extract spreadsheet ID from URL
  const spreadsheetMatch = sheetsUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
  if (!spreadsheetMatch) {
    throw new Error('Invalid Google Sheets URL')
  }
  const spreadsheetId = spreadsheetMatch[1]

  // Extract GID from URL (hash or query parameter)
  let gid = '0' // Default to first sheet
  const gidHashMatch = sheetsUrl.match(/#gid=(\d+)/)
  const gidQueryMatch = sheetsUrl.match(/[?&]gid=(\d+)/)

  if (gidHashMatch) {
    gid = gidHashMatch[1]
  } else if (gidQueryMatch) {
    gid = gidQueryMatch[1]
  }

  const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`

  const response = await fetch(csvUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch Google Sheet: ${response.statusText}`)
  }

  return await response.text()
}
