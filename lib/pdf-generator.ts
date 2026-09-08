let activeJobs = 0
const MAX_PDF_JOBS = 2
const PDF_TIMEOUT_MS = 30_000

export class PDFCapacityError extends Error {
  constructor() {
    super('PDF service is busy; please retry shortly')
    this.name = 'PDFCapacityError'
  }
}

/** Generate a PDF with a bounded browser pool and per-operation deadlines. */
export async function generatePDF(html: string): Promise<Buffer> {
  if (activeJobs >= MAX_PDF_JOBS) throw new PDFCapacityError()
  activeJobs++
  let browser
  try {
    const puppeteer = await import('puppeteer')
    browser = await puppeteer.launch({
      headless: true,
      timeout: PDF_TIMEOUT_MS,
      protocolTimeout: PDF_TIMEOUT_MS,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    const page = await browser.newPage()
    page.setDefaultTimeout(PDF_TIMEOUT_MS)
    await page.setJavaScriptEnabled(false)
    await page.setRequestInterception(true)
    page.on('request', request => {
      // Labels are self-contained; PDF rendering must not fetch external resources.
      void request.abort()
    })
    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: PDF_TIMEOUT_MS })
    const pdf = await page.pdf({
      format: 'Letter',
      printBackground: true,
      preferCSSPageSize: true,
      timeout: PDF_TIMEOUT_MS,
    })
    return Buffer.from(pdf)
  } catch (error) {
    throw new Error('PDF generation failed', { cause: error })
  } finally {
    try {
      await browser?.close()
    } finally {
      activeJobs--
    }
  }
}

/** Generate a PDF file for the CLI. */
export async function generatePDFFile(html: string, outputPath: string): Promise<void> {
  const fs = await import('node:fs/promises')
  await fs.writeFile(outputPath, await generatePDF(html))
}
