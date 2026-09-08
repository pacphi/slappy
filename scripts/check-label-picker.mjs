import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'
import puppeteer from 'puppeteer'
import { AxePuppeteer } from '@axe-core/puppeteer'
import { mkdir, writeFile } from 'node:fs/promises'

const accessibility = []
async function checkAccessibility(page, state) {
  const results = await new AxePuppeteer(page)
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze()
  accessibility.push({ state, violations: results.violations, incomplete: results.incomplete })
  await mkdir('coverage/accessibility', { recursive: true })
  await writeFile('coverage/accessibility/results.json', JSON.stringify(accessibility, null, 2))
  assert.deepEqual(
    results.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(node => node.target) })),
    [],
    `Accessibility violations in ${state}`
  )
}

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
try {
  const page = await browser.newPage()
  await page.setViewport({ width: 1600, height: 1000 })
  await page.goto(process.env.SLAPPY_SMOKE_URL || 'http://127.0.0.1:3000')
  await checkAccessibility(page, 'homepage')
  await page.locator('button::-p-text(Upload CSV)').click()
  await checkAccessibility(page, 'upload')
  await page.locator('button::-p-text(Try Sample Data)').click()
  await page.waitForSelector('button[role="combobox"]')
  await page.click('button[role="combobox"]')
  await page.locator('[role="option"]::-p-text(Column 1 (Name))').click()
  await page.waitForFunction(() => document.querySelectorAll('[role="option"]').length === 0)
  await checkAccessibility(page, 'mapping')
  await page.locator('button::-p-text(Continue to Preview)').click()
  await page.waitForSelector('[aria-label="Label stock"]:not([disabled])')
  await checkAccessibility(page, 'preview')
  await page.click('[aria-label="Label stock"]')
  await page.waitForSelector('[role="option"]')
  assert.equal(await page.$$eval('[role="option"]', elements => elements.length), 20)
  await page.type('input[placeholder="Search brand, product number, or size…"]', 'OL875')
  await page.waitForFunction(() => document.querySelectorAll('[role="option"]').length === 1)
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await page.waitForFunction(() =>
    document.querySelector('iframe')?.srcdoc.includes('Name Tags - OnlineLabels OL875')
  )
  assert.equal(
    await page.$eval('iframe', element => (element.srcdoc.match(/class="name-tag"/g) || []).length),
    30
  )
  // Exercise the actual upload → mapping → generation path, including quoting and page breaks.
  page.on('dialog', dialog => void dialog.accept())
  await page.locator('button::-p-text(Start Over)').click()
  const input = await page.waitForSelector('input[type="file"]')
  await input.uploadFile(
    fileURLToPath(new URL('../tests/fixtures/quoted-roster.csv', import.meta.url))
  )
  await page.waitForSelector('button[role="combobox"]')
  await page.click('button[role="combobox"]')
  await page.locator('[role="option"]::-p-text(Column 1 (Name))').click()
  await page.waitForFunction(() => document.querySelectorAll('[role="option"]').length === 0)
  await page.locator('[aria-label="Line 2 column"]').click()
  await page.locator('[role="option"]::-p-text(Column 2 (Team))').click()
  await page.waitForFunction(() => document.querySelectorAll('[role="option"]').length === 0)
  assert.match(
    await page.$eval('[aria-label="Line 1 column"]', element => element.textContent),
    /Column 1/
  )
  assert.match(
    await page.$eval('[aria-label="Line 2 column"]', element => element.textContent),
    /Column 2/
  )
  await page.click('[role="checkbox"]')
  await page.locator('button::-p-text(Continue to Preview)').click()
  await page.waitForSelector('iframe')
  const html = await page.$eval('iframe', element => element.srcdoc)
  assert.match(html, /Lee, Ada/)
  assert.match(html, /Research &quot;West&quot;/)
  assert.match(html, /Bob\nSmith/)
  assert.equal(
    (html.match(/class="page"/g) || []).length,
    2,
    'Blank records must preserve physical page breaks'
  )
  console.log(
    'Picker passed: 20 options, search, keyboard selection, and OL875 preview regeneration'
  )
} finally {
  await browser.close()
}
