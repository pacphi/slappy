import { createError, defineEventHandler, getHeader } from 'h3'
import { parseRawData } from '../../lib/data-parser'
import { fetchGoogleSheetAsCSV } from '../../lib/sheets-fetcher'
import { invalidInput, readBoundedBody, readBoundedJSON } from '../utils/request-body'
import { sheetsRequestSchema } from '../../shared/validation'

export default defineEventHandler(async event => {
  const contentType = getHeader(event, 'content-type') || ''
  let csvContent: string
  if (contentType.startsWith('multipart/form-data')) {
    const bytes = await readBoundedBody(event)
    try {
      const form = await new Response(new Uint8Array(bytes), {
        headers: { 'Content-Type': contentType },
      }).formData()
      const file = form.get('file')
      if (!(file instanceof File)) throw new Error('No file provided')
      csvContent = await file.text()
    } catch (error) {
      invalidInput(error)
    }
  } else {
    const result = sheetsRequestSchema.safeParse(await readBoundedJSON(event))
    if (!result.success) throw createError({ statusCode: 400, message: 'Invalid sheetsUrl' })
    try {
      csvContent = await fetchGoogleSheetAsCSV(result.data.sheetsUrl)
    } catch (error) {
      invalidInput(error)
    }
  }
  try {
    return parseRawData(csvContent)
  } catch (error) {
    invalidInput(error)
  }
})
