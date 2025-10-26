/**
 * Generates a PDF from HTML content using Puppeteer
 * This module provides PDF generation for name tags while preserving
 * the exact layout from the HTML template (TownStix US-10 format)
 */

/**
 * Generates a PDF buffer from HTML content
 * @param html HTML content to convert to PDF
 * @returns PDF as Buffer
 */
export async function generatePDF(html: string): Promise<Buffer> {
  let browser
  try {
    // Dynamically import Puppeteer to avoid issues in environments where it's not available
    const puppeteer = await import('puppeteer')

    // Launch headless browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    const page = await browser.newPage()

    // Set content and wait for it to load
    await page.setContent(html, {
      waitUntil: 'networkidle0',
    })

    // Generate PDF with proper settings for US Letter
    const pdfBuffer = await page.pdf({
      format: 'Letter', // US Letter (8.5" x 11")
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in',
      },
      printBackground: true, // Include background colors/images
      preferCSSPageSize: true, // Use CSS @page settings
    })

    await browser.close()

    return Buffer.from(pdfBuffer)
  } catch (error) {
    if (browser) {
      await browser.close()
    }
    if (error instanceof Error) {
      throw new Error(`PDF generation failed: ${error.message}`)
    }
    throw new Error('PDF generation failed with an unknown error')
  }
}

/**
 * Generates a PDF and saves it to a file (for CLI use)
 * @param html HTML content to convert to PDF
 * @param outputPath Path where the PDF should be saved
 */
export async function generatePDFFile(html: string, outputPath: string): Promise<void> {
  const fs = await import('fs/promises')
  const pdfBuffer = await generatePDF(html)
  await fs.writeFile(outputPath, pdfBuffer)
}
