import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
import { test } from 'node:test'
import { ref } from 'vue'
import { useWizardNavigation } from '../app/composables/useWizardNavigation'
import { isValidCSVFile, isValidGoogleSheetsUrl } from '../app/utils/validators'

// Nuxt useState is the external request-context boundary; exercise real navigation against isolated stores.
let requestState = new Map<string, ReturnType<typeof ref>>()
Object.assign(globalThis, {
  frontendTestUseState: (key: string, initialize: () => unknown) => {
    if (!requestState.has(key)) requestState.set(key, ref(initialize()))
    return requestState.get(key)
  },
})
const hook = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === '#app')
      return {
        url: 'data:text/javascript,export const useState = globalThis.frontendTestUseState',
        shortCircuit: true,
      }
    return nextResolve(
      specifier.startsWith('#shared/')
        ? new URL(`../shared/${specifier.slice(8)}.ts`, import.meta.url).href
        : specifier,
      context
    )
  },
})
const { useAppNavigation } = await import('../app/composables/useAppNavigation')
const { useColumnMapping } = await import('../app/composables/useColumnMapping')
hook.deregister()
Reflect.deleteProperty(globalThis, 'frontendTestUseState')

test('navigation shares state within a request but cannot leak to another request', () => {
  const firstRequest = useAppNavigation()
  firstRequest.showWizard('sheets')
  const sameRequest = useAppNavigation()
  assert.deepEqual(
    [sameRequest.currentView.value, sameRequest.uploadMode.value],
    ['wizard', 'sheets']
  )
  requestState = new Map()
  const secondRequest = useAppNavigation()
  assert.deepEqual(
    [secondRequest.currentView.value, secondRequest.uploadMode.value],
    ['features', 'csv']
  )
  firstRequest.showFeatures()
  secondRequest.showWizard('csv')
  assert.deepEqual(
    [firstRequest.currentView.value, secondRequest.currentView.value],
    ['features', 'wizard']
  )
})

test('wizard prevents skipping required steps and invalidates downstream progress on backtracking', () => {
  const wizard = useWizardNavigation()
  wizard.goToStep('preview')
  wizard.previousStep()
  assert.equal(wizard.currentStep.value, 'upload')
  assert.equal(wizard.isStepLocked('preview'), true)
  wizard.nextStep()
  assert.equal(wizard.stepIndex.value, 1)
  assert.equal(wizard.isStepCompleted('upload'), true)
  wizard.nextStep()
  wizard.nextStep()
  assert.equal(wizard.currentStep.value, 'preview')
  wizard.previousStep()
  wizard.previousStep()
  wizard.goToStep('mapping')
  wizard.markStepComplete('preview')
  wizard.goToStep('upload')
  assert.equal(wizard.completedSteps.value.has('preview'), false)
  assert.equal(wizard.isStepLocked('preview'), true)
  wizard.reset()
  assert.deepEqual([wizard.stepIndex.value, wizard.completedSteps.value.size], [0, 0])
})

test('wizard allows upload without a prior completion and immediate next step after completed work', () => {
  const wizard = useWizardNavigation()
  wizard.markStepComplete('upload')
  assert.equal(wizard.canNavigateToStep('mapping'), true)
  wizard.goToStep('mapping')
  wizard.reset()
  wizard.markStepComplete('mapping')
  wizard.goToStep('preview')
  assert.equal(wizard.canNavigateToStep('upload'), true)
})

test('column mapping rejects duplicate, absent, and out-of-range columns and restores defaults', () => {
  for (const count of [1, 2, 3]) {
    const columns = useColumnMapping(count)
    const initial = { ...columns.mapping.value }
    assert.equal(columns.isValid.value, true)
    assert.equal(columns.hasDuplicates.value, false)
    columns.updateMapping('line2', 0)
    assert.equal(columns.hasDuplicates.value, true)
    assert.equal(columns.isValid.value, false)
    columns.updateMapping('line1', null)
    columns.updateMapping('line2', null)
    columns.updateMapping('line3', null)
    assert.equal(columns.isValid.value, false)
    columns.updateMapping('line1', count)
    assert.equal(columns.isValid.value, false)
    columns.hasHeaders.value = true
    columns.reset()
    assert.deepEqual([columns.mapping.value, columns.hasHeaders.value], [initial, false])
  }
})

test('upload validators accept supported sources and reject misleading file extensions and hosts', () => {
  assert.equal(isValidCSVFile(new File([], 'NAMES.CSV')), true)
  assert.equal(isValidCSVFile(new File([], 'names.csv.exe')), false)
  assert.equal(isValidGoogleSheetsUrl('https://docs.google.com/spreadsheets/d/abc_123/edit'), true)
  for (const url of [
    'http://docs.google.com/spreadsheets/d/abc',
    'https://docs.google.com.evil.test/spreadsheets/d/abc',
    'https://example.com',
    'not a URL',
  ]) {
    assert.equal(isValidGoogleSheetsUrl(url), false)
  }
})
