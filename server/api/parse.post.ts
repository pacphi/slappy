import { parseRawData } from '../utils/data-parser'
import { fetchGoogleSheetAsCSV } from '../utils/sheets-fetcher'

export default defineEventHandler(async event => {
  const contentType = getHeader(event, 'content-type')

  let csvContent: string

  if (contentType?.includes('multipart/form-data')) {
    // Handle file upload
    const form = await readMultipartFormData(event)
    const file = form?.find(item => item.name === 'file')

    if (!file) {
      throw createError({
        statusCode: 400,
        message: 'No file provided',
      })
    }

    csvContent = file.data.toString('utf-8')
  } else {
    // Handle Google Sheets URL
    const body = await readBody(event)

    if (!body.sheetsUrl) {
      throw createError({
        statusCode: 400,
        message: 'No sheetsUrl provided',
      })
    }

    csvContent = await fetchGoogleSheetAsCSV(body.sheetsUrl)
  }

  const parsedData = parseRawData(csvContent)

  return parsedData
})
