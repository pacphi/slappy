import assert from 'node:assert/strict'
import puppeteer from 'puppeteer'

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
try {
  const page = await browser.newPage()
  await page.setViewport({ width: 1600, height: 1000 })
  await page.goto(process.env.SLAPPY_SMOKE_URL || 'http://127.0.0.1:3000')
  await page.locator('button::-p-text(Upload CSV)').click()
  await page.locator('button::-p-text(Try Sample Data)').click()
  await page.waitForSelector('button[role="combobox"]')
  await page.click('button[role="combobox"]')
  await page.locator('[role="option"]::-p-text(Column 1 (Name))').click()
  await page.locator('button::-p-text(Continue to Preview)').click()
  await page.waitForSelector('[aria-label="Label stock"]:not([disabled])')
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
  console.log(
    'Picker passed: 20 options, search, keyboard selection, and OL875 preview regeneration'
  )
} finally {
  await browser.close()
}
