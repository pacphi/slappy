import * as fs from 'fs'
import { fileURLToPath } from 'url'
import { fetchGoogleSheetAsCSV } from '../lib/sheets-fetcher'
import { parseCSVToPagesWithMapping, getDefaultMapping } from '../lib/column-mapper'
import { generateNameTagsHTML } from '../lib/html-generator'
import { generatePDFFile } from '../lib/pdf-generator'
import type { ColumnMapping, OutputFormat } from '../lib/types'

interface GenerateOptions {
  mapping?: ColumnMapping
  hasHeaders?: boolean
  format?: OutputFormat
}

/**
 * Main function to generate name tags from a Google Sheet
 */
export async function generateNameTags(
  spreadsheetId: string,
  gid: string,
  outputPath?: string,
  options: GenerateOptions = {}
): Promise<void> {
  try {
    const { mapping, hasHeaders = false, format = 'html' } = options

    // Determine output path based on format if not provided
    const finalOutputPath = outputPath || `./name-tags.${format}`

    console.log('Fetching Google Sheet data...')
    const csvContent = await fetchGoogleSheetAsCSV(spreadsheetId, gid)

    console.log('Parsing data into pages...')
    let pages
    if (mapping) {
      console.log('Using custom column mapping:', mapping)
      pages = parseCSVToPagesWithMapping(csvContent, mapping, hasHeaders)
    } else {
      // Use default mapping
      pages = parseCSVToPagesWithMapping(csvContent, getDefaultMapping(), hasHeaders)
    }
    console.log(`Found ${pages.length} page(s) of name tags`)

    console.log('Generating HTML...')
    const html = generateNameTagsHTML(pages)

    // Generate output based on format
    if (format === 'pdf') {
      console.log(`Generating PDF and writing to ${finalOutputPath}...`)
      await generatePDFFile(html, finalOutputPath)
      console.log('✅ Name tags PDF generated successfully!')
      console.log(`📄 File saved: ${finalOutputPath}`)
    } else {
      console.log(`Writing HTML to ${finalOutputPath}...`)
      fs.writeFileSync(finalOutputPath, html, 'utf-8')
      console.log('✅ Name tags HTML generated successfully!')
      console.log(`📄 Open ${finalOutputPath} in a browser and print to create your name tags.`)
      console.log('   Print settings: US Letter, margins 0.5in, no headers/footers')
    }
  } catch (error) {
    console.error('❌ Error generating name tags:', error)
    throw error
  }
}

// CLI interface
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2)

  // Parse flags and positional arguments
  const flags: Record<string, string> = {}
  const positional: string[] = []

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=')
      if (value !== undefined) {
        flags[key] = value
      } else {
        // Flag without value (boolean flag)
        flags[key] = 'true'
      }
    } else {
      positional.push(arg)
    }
  }

  if (positional.length < 2) {
    console.log(
      'Usage: tsx cli/nametag-generator.ts <spreadsheet-id> <gid> [output-file] [options]'
    )
    console.log('')
    console.log('Positional Arguments:')
    console.log('  spreadsheet-id    Google Sheets spreadsheet ID')
    console.log('  gid              Sheet ID (found in URL as #gid=...)')
    console.log(
      '  output-file      Output file path (default: ./name-tags.html or ./name-tags.pdf)'
    )
    console.log('')
    console.log('Options:')
    console.log('  --line1-col=N    Column index (0-based) for line 1 (default: 0)')
    console.log('  --line2-col=N    Column index (0-based) for line 2 (default: 1)')
    console.log('  --line3-col=N    Column index (0-based) for line 3 (default: 2)')
    console.log('  --has-headers    First row contains headers (default: false)')
    console.log('  --format=FORMAT  Output format: html or pdf (default: html)')
    console.log('')
    console.log('Examples:')
    console.log('  Basic usage (default column mapping):')
    console.log(
      '    tsx cli/nametag-generator.ts 3kR9mN-2pQxWvY_bZdH8sLf4jTcUgEoAnV7iM5wKqX1yBe 428391756'
    )
    console.log('')
    console.log('  Custom column mapping (use columns 0, 2, 3 for lines 1, 2, 3):')
    console.log(
      '    tsx cli/nametag-generator.ts SHEET_ID GID --line1-col=0 --line2-col=2 --line3-col=3'
    )
    console.log('')
    console.log('  With headers and PDF output:')
    console.log(
      '    tsx cli/nametag-generator.ts SHEET_ID GID output.pdf --has-headers --format=pdf'
    )
    console.log('')
    console.log('  Skip line 3 (only use 2 lines per tag):')
    console.log('    tsx cli/nametag-generator.ts SHEET_ID GID --line1-col=0 --line2-col=1')
    process.exit(1)
  }

  const spreadsheetId = positional[0]
  const gid = positional[1]
  const outputPath = positional[2]

  // Parse column mapping flags
  const mapping: ColumnMapping = {
    line1: flags['line1-col'] !== undefined ? parseInt(flags['line1-col'], 10) : null,
    line2: flags['line2-col'] !== undefined ? parseInt(flags['line2-col'], 10) : null,
    line3: flags['line3-col'] !== undefined ? parseInt(flags['line3-col'], 10) : null,
  }

  // If no mapping flags provided, use default (backwards compatible)
  const useCustomMapping =
    flags['line1-col'] !== undefined ||
    flags['line2-col'] !== undefined ||
    flags['line3-col'] !== undefined

  const options: GenerateOptions = {
    mapping: useCustomMapping ? mapping : getDefaultMapping(),
    hasHeaders: flags['has-headers'] === 'true',
    format: (flags['format'] as OutputFormat) || 'html',
  }

  generateNameTags(spreadsheetId, gid, outputPath, options)
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}
