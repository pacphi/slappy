import { parseCSVToPagesWithMapping } from '../utils/column-mapper'
import { generateNameTagsHTML } from '../utils/html-generator'
import { generatePDF } from '../utils/pdf-generator'

export default defineEventHandler(async event => {
  const body = await readBody(event)

  const { csvContent, mapping, hasHeaders, format = 'html' } = body

  if (!csvContent) {
    throw createError({
      statusCode: 400,
      message: 'No csvContent provided',
    })
  }

  const pages = parseCSVToPagesWithMapping(csvContent, mapping, hasHeaders)
  const html = generateNameTagsHTML(pages)

  if (format === 'pdf') {
    const pdfBuffer = await generatePDF(html)

    setResponseHeader(event, 'Content-Type', 'application/pdf')
    setResponseHeader(event, 'Content-Disposition', 'attachment; filename="name-tags.pdf"')

    return pdfBuffer
  }

  return { html }
})
