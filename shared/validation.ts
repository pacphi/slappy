import { z } from 'zod'
import { defaultLabelTemplateId, allLabelTemplates } from './label-templates'
import { MAX_COLUMNS, MAX_CSV_BYTES } from './limits'
import type { ColumnMapping } from './types'

export function isValidMapping(mapping: ColumnMapping): boolean {
  const values = Object.values(mapping).filter(value => value !== null)
  return (
    values.length > 0 &&
    new Set(values).size === values.length &&
    values.every(value => Number.isInteger(value) && value >= 0 && value < MAX_COLUMNS)
  )
}

export const columnMappingSchema = z
  .object({
    line1: z
      .number()
      .int()
      .min(0)
      .max(MAX_COLUMNS - 1)
      .nullable(),
    line2: z
      .number()
      .int()
      .min(0)
      .max(MAX_COLUMNS - 1)
      .nullable(),
    line3: z
      .number()
      .int()
      .min(0)
      .max(MAX_COLUMNS - 1)
      .nullable(),
  })
  .refine(isValidMapping, {
    message: 'Select distinct valid columns for at least one line',
    path: ['line1'],
  })

export const generationRequestSchema = z.object({
  csvContent: z.string().min(1).max(MAX_CSV_BYTES),
  mapping: columnMappingSchema,
  hasHeaders: z.boolean().default(false),
  format: z.enum(['html', 'pdf']).default('html'),
  labelTemplate: z
    .enum(allLabelTemplates.map(template => template.id))
    .default(defaultLabelTemplateId),
})

export const sheetsRequestSchema = z.object({ sheetsUrl: z.string().min(1).max(2048) })
