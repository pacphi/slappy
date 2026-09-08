import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

// Optional integration with the separately installed AQE tool, not an application dependency.
const packageRoot = process.argv[2] || process.env.AQE_PACKAGE_ROOT
if (!packageRoot)
  throw new Error(
    'Provide the installed agentic-qe package directory as argument or AQE_PACKAGE_ROOT'
  )
const root = resolve(packageRoot)
const { version } = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'))
const { CodeMetricsAnalyzer } = await import(
  pathToFileURL(resolve(root, 'dist/shared/metrics/code-metrics.js')).href
)
const analyzer = new CodeMetricsAnalyzer()
const results = []
for (const directory of [
  'app/composables',
  'app/utils',
  'lib',
  'shared',
  'server/api',
  'server/utils',
  'cli',
]) {
  for (const name of await readdir(directory)) {
    if (!name.endsWith('.ts') || name.endsWith('types.ts')) continue
    const file = `${directory}/${name}`
    const metrics = await analyzer.analyzeFile(file)
    if (!metrics) throw new Error(`AQE could not analyze ${file}`)
    results.push({
      file,
      cyclomatic: metrics.cyclomaticComplexity,
      functions: metrics.functionCount,
      lines: metrics.linesOfCode,
      maintainability: metrics.maintainabilityIndex,
    })
  }
}
await mkdir('coverage', { recursive: true })
await writeFile(
  'coverage/aqe-scoped.json',
  JSON.stringify(
    {
      tool: 'agentic-qe CodeMetricsAnalyzer',
      version,
      limitations:
        'File-level heuristic/AST hybrid totals, not per-function ESLint complexity. Vue is measured separately by quality:metrics. No synthetic quality score.',
      results,
    },
    null,
    2
  ) + '\n'
)
console.log(
  `AQE ${version}: measured ${results.length} first-party TypeScript files; coverage/aqe-scoped.json`
)
