import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    include: ['tests/components/**/*.nuxt.spec.ts'],
    setupFiles: ['tests/components/setup.ts'],
    testTimeout: 20_000,
    coverage: {
      provider: 'v8',
      include: ['app/components/**/*.vue'],
      reportsDirectory: 'coverage/components',
      reporter: ['text', 'json', 'json-summary', 'html', 'lcov'],
      thresholds: { statements: 80, branches: 80, functions: 80, lines: 80 },
    },
  },
})
