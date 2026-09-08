import { afterEach, beforeEach, vi } from 'vitest'
import { Window } from 'happy-dom'
import { enableAutoUnmount } from '@vue/test-utils'

enableAutoUnmount(afterEach)
const storage = new Window().localStorage
// Node 26 exposes its own optional storage; components must use the DOM implementation.
beforeEach(() => {
  storage.clear()
  vi.stubGlobal('localStorage', storage)
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})
