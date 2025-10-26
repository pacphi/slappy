import type { NameTagRow, NameTagPage } from './types'

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
  return text.replace(/[&<>"']/g, m => map[m])
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
function generatePagesHTML(page: NameTagPage, _pageIndex: number, labelsPerPage = 10): string {
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
 * Generates complete HTML document for name tags in TownStix US-10 (4" x 2") format
 * @param pages Array of pages with name tag data
 * @param labelsPerPage Number of labels per physical page (default: 10 for TownStix US-10)
 * @returns HTML string ready for printing
 */
export function generateNameTagsHTML(pages: NameTagPage[], labelsPerPage = 10): string {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Name Tags - TownStix US-10</title>
  <style>
    @page {
      size: letter;
      margin: 0.5in 0.25in;
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
      width: 8in;
      margin: 0 auto;
    }

    .page:last-child {
      page-break-after: auto;
    }

    /* TownStix US-10: 2 columns x 5 rows = 10 labels per sheet */
    /* Each label is 4" x 2" */
    .label-grid {
      display: grid;
      grid-template-columns: repeat(2, 4in);
      grid-template-rows: repeat(5, 2in);
      gap: 0;
      width: 8in;
    }

    .name-tag {
      width: 4in;
      height: 2in;
      border: 1px dashed #ccc;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 0.25in;
      overflow: hidden;
    }

    .line1 {
      font-size: 32pt;
      font-weight: bold;
      line-height: 1.2;
      margin-bottom: 0.1in;
      max-width: 100%;
      word-wrap: break-word;
    }

    .line2, .line3 {
      font-size: 18pt;
      line-height: 1.3;
      max-width: 100%;
      word-wrap: break-word;
    }

    .line2 {
      margin-bottom: 0.05in;
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
${pages.map((page, pageIndex) => generatePagesHTML(page, pageIndex, labelsPerPage)).join('\n')}
</body>
</html>`

  return html
}
