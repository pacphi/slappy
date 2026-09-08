import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { fetchGoogleSheetAsCSV } from '../lib/sheets-fetcher'
import { parseCSVToPagesWithMapping, getDefaultMapping } from '../lib/column-mapper'
import { generateNameTagsHTML } from '../lib/html-generator'
import { generatePDFFile } from '../lib/pdf-generator'
import { getLabelTemplate, labelTemplates } from '../shared/label-templates'
import { generationRequestSchema } from '../shared/validation'
import { MAX_SHEETS } from '../shared/limits'
import { parseCLIOptions, type GenerateOptions } from './options'

export async function generateNameTags(
  spreadsheetId: string,
  gid: string,
  outputPath?: string,
  options: GenerateOptions = {}
): Promise<void> {
  if (!/^[\w-]+$/.test(spreadsheetId) || !/^\d+$/.test(gid))
    throw new Error('Invalid spreadsheet ID or GID')
  const csvContent = await fetchGoogleSheetAsCSV(
    `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=${gid}`
  )
  const request = generationRequestSchema.parse({
    ...options,
    mapping: options.mapping ?? getDefaultMapping(),
    csvContent,
  })
  const template = getLabelTemplate(request.labelTemplate)
  const pages = parseCSVToPagesWithMapping(csvContent, request.mapping, request.hasHeaders)
  const sheets = pages.reduce(
    (total, page) => total + Math.ceil(page.tags.length / (template.columns * template.rows)),
    0
  )
  if (sheets > MAX_SHEETS) throw new RangeError(`Maximum ${MAX_SHEETS} sheets per export`)
  const html = generateNameTagsHTML(pages, template.id)
  const path = outputPath || `./name-tags.${request.format}`
  if (request.format === 'pdf') await generatePDFFile(html, path)
  else await writeFile(path, html, 'utf8')
  console.log(`Generated ${path} using ${template.name}. Print on US Letter at Actual size / 100%.`)
}

function showHelp() {
  console.log('Usage: pnpm cli <spreadsheet-id> <gid> [output-file] [options]')
  console.log(
    '--has-headers --format=html|pdf --label-template=ID --line1-col=N --line2-col=N --line3-col=N'
  )
  console.log(
    'Column indexes are zero-based. If any column flag is provided, omitted lines are blank.'
  )
  console.log(
    `Label stocks (default: townstix-us-10): ${labelTemplates.map(template => template.id).join(', ')}`
  )
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const command = parseCLIOptions(process.argv.slice(2))
    if (command.help) showHelp()
    else
      await generateNameTags(
        command.spreadsheetId,
        command.gid,
        command.outputPath,
        command.options
      )
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'Unable to generate name tags')
    process.exitCode = 1
  }
}
