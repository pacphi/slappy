import { ESLint } from 'eslint'
import { mkdir, writeFile } from 'node:fs/promises'
import { relative } from 'node:path'

// Use ESLint's AST-based rule, including Vue script blocks; exclude dependencies and build output.
const eslint = new ESLint({ overrideConfig: { rules: { complexity: ['warn', 0] } } })
const results = await eslint.lintFiles(['app', 'lib', 'shared', 'server', 'cli'])
const functions = results.flatMap(file =>
  file.messages
    .filter(message => message.ruleId === 'complexity')
    .map(message => ({
      file: relative(process.cwd(), file.filePath),
      line: message.line,
      complexity: Number(message.message.match(/complexity of (\d+)/)?.[1]),
      description: message.message,
    }))
)
const report = {
  method: 'ESLint complexity rule (AST), classic variant, per function',
  scope: ['app', 'lib', 'shared', 'server', 'cli'],
  functions: functions.length,
  maximum: Math.max(0, ...functions.map(fn => fn.complexity)),
  overLimit: functions.filter(fn => fn.complexity > 10),
  details: functions.sort((a, b) => b.complexity - a.complexity),
}
await mkdir('coverage', { recursive: true })
await writeFile('coverage/complexity.json', JSON.stringify(report, null, 2) + '\n')
console.log(
  `${report.functions} functions; maximum complexity ${report.maximum}; ${report.overLimit.length} above 10`
)
if (report.overLimit.length) process.exitCode = 1
