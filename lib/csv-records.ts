import { parse } from 'csv-parse/sync'
import { MAX_COLUMNS, MAX_CSV_BYTES, MAX_ROWS } from '../shared/limits'

export const isBlankRecord = (row: string[]) => row.every(value => value.trim() === '')

/** Preserve empty records because they represent intentional physical page breaks. */
export function parseCSVRecords(content: string): string[][] {
  if (Buffer.byteLength(content, 'utf8') > MAX_CSV_BYTES)
    throw new RangeError('CSV exceeds 5MB size limit')
  try {
    return parse(content, {
      bom: true,
      trim: true,
      relax_column_count: true,
      max_record_size: MAX_CSV_BYTES,
      on_record(record: string[], context: { records: number }) {
        if (context.records > MAX_ROWS) throw new RangeError('CSV exceeds maximum rows')
        if (record.length > MAX_COLUMNS) throw new RangeError('CSV exceeds maximum columns')
        return record
      },
    }) as string[][]
  } catch (error) {
    if (error instanceof RangeError) throw error
    throw new Error('Invalid CSV: check quotes and record formatting', { cause: error })
  }
}
