import { parseCSVRecords } from './csv-records'
import { getDefaultMapping, parseCSVToPagesWithMapping } from './column-mapper'

export function parseCSVLine(line: string): string[] {
  return parseCSVRecords(line)[0] || ['']
}

/** Compatibility entry point for local CSV CLI users. */
export function parseCSVToPages(csvContent: string, skipHeader = true) {
  return parseCSVToPagesWithMapping(csvContent, getDefaultMapping(), skipHeader)
}
