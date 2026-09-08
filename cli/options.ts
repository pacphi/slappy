import { parseArgs } from 'node:util'
import { columnMappingSchema } from '../shared/validation'
import { getLabelTemplate } from '../shared/label-templates'
import type { ColumnMapping, OutputFormat } from '../shared/types'
import type { LabelTemplateId } from '../shared/label-templates'

export interface GenerateOptions {
  mapping?: ColumnMapping
  hasHeaders?: boolean
  format?: OutputFormat
  labelTemplate?: LabelTemplateId
}

export function parseCLIOptions(args: string[]) {
  const { values, positionals } = parseArgs({
    args,
    allowPositionals: true,
    options: {
      'line1-col': { type: 'string' },
      'line2-col': { type: 'string' },
      'line3-col': { type: 'string' },
      'has-headers': { type: 'boolean', default: false },
      format: { type: 'string', default: 'html' },
      'label-template': { type: 'string' },
      help: { type: 'boolean', short: 'h', default: false },
    },
  })
  if (values.help) return { help: true as const }
  const [spreadsheetId, gid, outputPath] = positionals
  if (!spreadsheetId || !/^[\w-]+$/.test(spreadsheetId))
    throw new Error('Provide a valid spreadsheet ID')
  if (!gid || !/^\d+$/.test(gid) || positionals.length > 3)
    throw new Error('Provide a numeric sheet GID and optional output path')
  if (values.format !== 'html' && values.format !== 'pdf')
    throw new Error('Format must be html or pdf')
  const mapping = parseMapping(values)
  const options: GenerateOptions = {
    mapping,
    hasHeaders: values['has-headers'],
    format: values.format,
    labelTemplate: getLabelTemplate(values['label-template']).id,
  }
  return { help: false as const, spreadsheetId, gid, outputPath, options }
}

function parseMapping(values: Record<string, string | boolean | undefined>): ColumnMapping {
  const columns = ['line1-col', 'line2-col', 'line3-col'].map(key => values[key])
  if (columns.every(value => value === undefined)) return { line1: 0, line2: 1, line3: 2 }
  const indexes = columns.map(value => (value === undefined ? null : parseColumn(value)))
  return columnMappingSchema.parse({ line1: indexes[0], line2: indexes[1], line3: indexes[2] })
}

function parseColumn(value: string | boolean): number {
  if (typeof value !== 'string' || !/^\d+$/.test(value))
    throw new Error('Column indexes must be nonnegative integers')
  return Number(value)
}
