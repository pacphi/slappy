import { createError, defineEventHandler, setResponseHeader, type H3Event } from 'h3'
import { parseCSVToPagesWithMapping } from '../../lib/column-mapper'
import { generateNameTagsHTML } from '../../lib/html-generator'
import { generatePDF, PDFCapacityError } from '../../lib/pdf-generator'
import { getLabelTemplate } from '../../shared/label-templates'
import { generationRequestSchema } from '../../shared/validation'
import { MAX_SHEETS } from '../../shared/limits'
import { invalidInput, readBoundedJSON } from '../utils/request-body'

export default defineEventHandler(async event => {
  const result = generationRequestSchema.safeParse(await readBoundedJSON(event))
  if (!result.success) throw createError({ statusCode: 400, message: 'Invalid generation request' })
  const { csvContent, mapping, hasHeaders, format, labelTemplate } = result.data
  const template = getLabelTemplate(labelTemplate)
  let pages
  try {
    pages = parseCSVToPagesWithMapping(csvContent, mapping, hasHeaders)
  } catch (error) {
    invalidInput(error)
  }
  const sheetCount = pages.reduce(
    (count, page) => count + Math.ceil(page.tags.length / (template.columns * template.rows)),
    0
  )
  if (sheetCount > MAX_SHEETS) {
    throw createError({ statusCode: 413, message: `Maximum ${MAX_SHEETS} sheets per request` })
  }
  const html = generateNameTagsHTML(pages, template.id)
  if (format === 'pdf') return pdfResponse(event, html)

  return {
    html,
    labelCount: pages.reduce((count, page) => count + page.tags.length, 0),
    sheetCount,
  }
})

async function pdfResponse(event: H3Event, html: string): Promise<Buffer> {
  let pdfBuffer
  try {
    pdfBuffer = await generatePDF(html)
  } catch (error) {
    if (error instanceof PDFCapacityError) {
      throw createError({ statusCode: 503, message: error.message })
    }
    throw createError({ statusCode: 500, message: 'PDF generation failed' })
  }
  setResponseHeader(event, 'Content-Type', 'application/pdf')
  setResponseHeader(event, 'Content-Disposition', 'attachment; filename="name-tags.pdf"')
  return pdfBuffer
}
