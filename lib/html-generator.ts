import type { NameTagRow, NameTagPage } from '../shared/types'
import {
  defaultLabelTemplateId,
  getLabelTemplate,
  type LabelTemplateId,
} from '../shared/label-templates'

/**
 * Escapes HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, m => map[m] || m)
}

/**
 * Generates HTML for a single name tag
 */
function generateTagHTML(tag: NameTagRow): string {
  const escapedLine1 = escapeHtml(tag.line1)
  const escapedLine2 = escapeHtml(tag.line2)
  const escapedLine3 = escapeHtml(tag.line3)

  return `      <div class="name-tag">
        ${escapedLine1 ? `<div class="line1">${escapedLine1}</div>` : ''}
        ${escapedLine2 ? `<div class="line2">${escapedLine2}</div>` : ''}
        ${escapedLine3 ? `<div class="line3">${escapedLine3}</div>` : ''}
      </div>`
}

/**
 * Generates HTML for one or more physical pages from a logical page
 * Splits into multiple physical pages if more than labelsPerPage tags
 */
function generatePagesHTML(page: NameTagPage, labelsPerPage: number): string {
  const tags = page.tags
  const physicalPages: string[] = []

  // Split tags into chunks of labelsPerPage (one physical page each)
  for (let i = 0; i < tags.length; i += labelsPerPage) {
    const pageTags = tags.slice(i, i + labelsPerPage)

    // Pad with empty tags if needed to fill the sheet
    const paddedTags = [...pageTags]
    while (paddedTags.length < labelsPerPage) {
      paddedTags.push({ line1: '', line2: '', line3: '' })
    }

    const pageHTML = `  <div class="page">
    <div class="label-grid">
${paddedTags.map(tag => generateTagHTML(tag)).join('\n')}
    </div>
  </div>`

    physicalPages.push(pageHTML)
  }

  return physicalPages.join('\n')
}

/**
 * Generates a printable US Letter document for the selected label stock.
 * @param pages Array of pages with name tag data
 * @param templateId Label stock identifier (defaults to TownStix US-10)
 * @returns HTML string ready for printing
 */
export function generateNameTagsHTML(
  pages: NameTagPage[],
  templateId: LabelTemplateId = defaultLabelTemplateId
): string {
  const template = getLabelTemplate(templateId)
  // Scale the three-line badge design to small stock while preserving existing badge sizes.
  const textScale = Math.min(1, template.widthIn / 3.5, template.heightIn / 2)
  const labelsPerPage = template.columns * template.rows
  const gridWidth =
    template.columns * template.widthIn + (template.columns - 1) * template.columnGapIn
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Name Tags - ${template.name}</title>
  <style>
    @page {
      size: letter;
      margin: 0;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: Arial, Helvetica, sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      page-break-after: always;
      break-inside: avoid;
      width: 8.5in;
      height: 11in;
      padding: ${template.marginTopIn}in ${template.marginRightIn}in ${template.marginBottomIn}in ${template.marginLeftIn}in;
      margin: 0 auto;
    }

    .page:last-child {
      page-break-after: auto;
    }

    /* ${template.name}: ${labelsPerPage} labels per sheet */
    .label-grid {
      display: grid;
      grid-template-columns: repeat(${template.columns}, ${template.widthIn}in);
      grid-template-rows: repeat(${template.rows}, ${template.heightIn}in);
      column-gap: ${template.columnGapIn}in;
      row-gap: ${template.rowGapIn}in;
      width: ${gridWidth}in;
    }

    .name-tag {
      width: ${template.widthIn}in;
      height: ${template.heightIn}in;
      border: 1px dashed #ccc;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: ${0.25 * textScale}in;
      overflow: hidden;
    }

    .line1 {
      font-size: ${32 * textScale}pt;
      font-weight: bold;
      line-height: 1.2;
      margin-bottom: ${0.1 * textScale}in;
      max-width: 100%;
      word-wrap: break-word;
    }

    .line2, .line3 {
      font-size: ${18 * textScale}pt;
      line-height: 1.3;
      max-width: 100%;
      word-wrap: break-word;
    }

    .line2 {
      margin-bottom: ${0.05 * textScale}in;
    }

    /* Hide borders for printing */
    @media print {
      .name-tag {
        border: none;
      }

      body {
        margin: 0;
        padding: 0;
      }
    }
  </style>
</head>
<body>
${pages.map(page => generatePagesHTML(page, labelsPerPage)).join('\n')}
</body>
</html>`

  return html
}
