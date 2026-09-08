import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { generateNameTags } from '../cli/nametag-generator'

test('should_fetchRequestedSheetAndGid_when_cliGeneratesHTML', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'slappy-cli-'))
  t.after(() => rm(directory, { recursive: true, force: true }))
  const urls: string[] = []
  t.mock.method(globalThis, 'fetch', async (url: string) => {
    urls.push(String(url))
    return new Response('Name\nAda', { headers: { 'content-type': 'text/csv' } })
  })
  const path = join(directory, 'tags.html')
  await generateNameTags('sheet_123', '42', path, {
    hasHeaders: true,
    labelTemplate: 'onlinelabels-ol875',
  })
  assert.equal(urls[0], 'https://docs.google.com/spreadsheets/d/sheet_123/export?format=csv&gid=42')
  assert.match(await readFile(path, 'utf8'), /Ada/)
})

const { parseCLIOptions } = await import('../cli/options')
for (const flag of [
  '--line1-col=-1',
  '--line1-col=2x',
  '--format=doc',
  '--label-template=unknown',
  '--line1-col=100',
  '--unknown',
]) {
  test(`should_rejectInvalidOptions_when_${flag}Provided`, () => {
    assert.throws(() => parseCLIOptions(['sheet', '0', flag]))
  })
}
test('should_supportHelpWithoutSheet_when_helpRequested', () => {
  assert.deepEqual(parseCLIOptions(['--help']), { help: true })
})
test('should_skipUnspecifiedLines_when_customColumnsProvided', () => {
  const result = parseCLIOptions(['sheet', '42', '--line1-col=2'])
  assert.deepEqual(!result.help && result.options.mapping, { line1: 2, line2: null, line3: null })
})
test('should_rejectDuplicateColumns_when_mappingAmbiguous', () => {
  assert.throws(() => parseCLIOptions(['sheet', '0', '--line1-col=1', '--line2-col=1']))
})

const { execFile } = await import('node:child_process')
const { promisify } = await import('node:util')
const execute = promisify(execFile)
test('should_printHelp_when_cliInvokedAsProgram', async () => {
  const result = await execute(process.execPath, [
    '--import',
    'tsx',
    'cli/nametag-generator.ts',
    '--help',
  ])
  assert.match(result.stdout, /onlinelabels-ol200/)
})
test('should_exitNonzero_when_cliArgumentsMissing', async () => {
  await assert.rejects(
    execute(process.execPath, ['--import', 'tsx', 'cli/nametag-generator.ts']),
    /spreadsheet ID/
  )
})
test('should_generateLocalCSV_when_sampleCLIInvoked', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'slappy-local-'))
  t.after(() => rm(directory, { recursive: true, force: true }))
  const { writeFile } = await import('node:fs/promises')
  const input = join(directory, 'roster.csv')
  await writeFile(
    input,
    'Name\n' + Array.from({ length: 12 }, (_, i) => `Person ${i}`).join('\n') + '\n\nFinal'
  )
  await execute(process.execPath, ['--import', 'tsx', 'cli/test-local.ts', input])
  assert.match(await readFile(join(directory, 'roster-tags.html'), 'utf8'), /Final/)
})
test('should_exitNonzero_when_localCSVDoesNotExist', async () => {
  await assert.rejects(
    execute(process.execPath, [
      '--import',
      'tsx',
      'cli/test-local.ts',
      '/nonexistent/slappy-roster.csv',
    ]),
    /File not found/
  )
})
for (const args of [
  ['bad/id', '0'],
  ['sheet', 'bad'],
  ['sheet', '0', 'one', 'two'],
]) {
  test(`should_rejectInvalidPositionals_when_${args.join('-')}Provided`, () =>
    assert.throws(() => parseCLIOptions(args)))
}
test('should_rejectBadIdentifiersBeforeFetching_when_generateCalled', async () => {
  await assert.rejects(generateNameTags('bad/id', '0'), /Invalid spreadsheet/)
})
test('should_rejectExcessiveSheets_when_fullSheetStockSelected', async t => {
  t.mock.method(globalThis, 'fetch', async () => new Response('x\n'.repeat(501)))
  await assert.rejects(
    generateNameTags('sheet', '0', undefined, { labelTemplate: 'onlinelabels-ol175' }),
    /Maximum 500/
  )
})
