import { parseCSVToPagesWithMapping } from '../utils/column-mapper'
import { generateNameTagsHTML } from '../utils/html-generator'
import { generatePDF } from '../utils/pdf-generator'
import { getLabelTemplate } from '../../shared/label-templates'

export default defineEventHandler(async event => {
  const body = await readBody(event)

  const { csvContent, mapping, hasHeaders, format = 'html', labelTemplate } = body

  if (!csvContent) {
    throw createError({
      statusCode: 400,
      message: 'No csvContent provided',
    })
  }

  let template
  try {
    template = getLabelTemplate(labelTemplate)
  } catch {
    throw createError({ statusCode: 400, message: 'Unknown label template' })
  }
  const pages = parseCSVToPagesWithMapping(csvContent, mapping, hasHeaders)
  const html = generateNameTagsHTML(pages, template.id)

  if (format === 'pdf') {
    const pdfBuffer = await generatePDF(html)

    setResponseHeader(event, 'Content-Type', 'application/pdf')
    setResponseHeader(event, 'Content-Disposition', 'attachment; filename="name-tags.pdf"')

    return pdfBuffer
  }

  return {
    html,
    labelCount: pages.reduce((count, page) => count + page.tags.length, 0),
    sheetCount: pages.reduce(
      (count, page) => count + Math.ceil(page.tags.length / (template.columns * template.rows)),
      0
    ),
  }
})
