import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'

const assets = new URL('../.output/public/_nuxt/', import.meta.url)
const cssFiles = (await readdir(assets)).filter(file => file.endsWith('.css'))
assert.ok(cssFiles.length, 'Production CSS assets must exist')
for (const file of cssFiles) {
  const css = await readFile(new URL(file, assets), 'utf8')
  assert.doesNotMatch(css, /@(apply|reference)\b/, `Uncompiled Tailwind directive in ${file}`)
}
console.log(`Production CSS checked: ${cssFiles.length} files, no uncompiled directives`)
