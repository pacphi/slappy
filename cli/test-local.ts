import * as fs from 'fs'
import { parseCSVToPages } from '../lib/csv-parser'
import { generateNameTagsHTML } from '../lib/html-generator'

/**
 * Test with a local CSV file
 */
async function testWithLocalFile(csvFilePath: string) {
  console.log(`🧪 Testing with local file: ${csvFilePath}\n`)

  if (!fs.existsSync(csvFilePath)) {
    console.error(`❌ File not found: ${csvFilePath}`)
    process.exit(1)
  }

  const csvContent = fs.readFileSync(csvFilePath, 'utf-8')
  const pages = parseCSVToPages(csvContent)

  console.log(`✅ Parsed ${pages.length} logical page(s) of name tags`)

  let totalPhysicalPages = 0
  pages.forEach((page, index) => {
    const tagCount = page.tags.length
    const physicalPages = Math.ceil(tagCount / 10)
    totalPhysicalPages += physicalPages

    if (physicalPages === 1) {
      const emptySlots = 10 - tagCount
      console.log(
        `   Logical page ${index + 1}: ${tagCount} tag(s) → 1 physical page (${emptySlots} empty slots)`
      )
    } else {
      console.log(
        `   Logical page ${index + 1}: ${tagCount} tag(s) → ${physicalPages} physical pages`
      )
    }
  })

  console.log(`\n📄 Total: ${totalPhysicalPages} physical sheet(s) to print`)
  console.log('')

  const html = generateNameTagsHTML(pages)
  const outputPath = csvFilePath.replace(/\.csv$/i, '-tags.html')

  fs.writeFileSync(outputPath, html, 'utf-8')
  console.log(`✅ Generated name tags: ${outputPath}`)
  console.log('📄 Open in browser to preview and print')
}

// CLI interface
// Check if this file is being run directly (ES module version)
const isMainModule = import.meta.url === `file://${process.argv[1]}`
if (isMainModule) {
  const args = process.argv.slice(2)
  const csvFile = args.length > 0 ? args[0] : './sample/sample-roster.csv'
  testWithLocalFile(csvFile)
}
