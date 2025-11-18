# Testing Strategy, Roadmap & Implementation

**Document Version:** 1.0
**Last Updated:** 2025-10-26
**Owner:** Development Team

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Testing Framework & Tools](#testing-framework--tools)
3. [Test Structure & Organization](#test-structure--organization)
4. [Test Scenarios & Specifications](#test-scenarios--specifications)
5. [Test Data & Fixtures](#test-data--fixtures)
6. [Implementation Roadmap](#implementation-roadmap)
7. [CI/CD Integration](#cicd-integration)
8. [Success Metrics](#success-metrics)

---

## Executive Summary

This document outlines the comprehensive testing strategy for the Slappy Name Tag Generator application. The strategy focuses on end-to-end (e2e) testing to validate user workflows, component interactions, and state management across the three-step wizard interface.

### Goals

- **Prevent regression** during feature development
- **Validate critical user journeys** (CSV upload, Google Sheets integration)
- **Test complex state management** (wizard navigation, data flow)
- **Ensure accessibility** and keyboard navigation
- **Catch edge cases** before production (malformed data, API failures)

### Scope

**In Scope:**

- E2E tests for all wizard steps (upload → mapping → preview)
- Navigation scenarios (back/forward, state persistence)
- Validation logic (file types, column mapping, duplicates)
- Error handling and recovery flows
- Accessibility (keyboard navigation, ARIA labels)

**Out of Scope (for this phase):**

- Unit tests for individual composables (separate initiative)
- Visual regression testing (future enhancement)
- Performance/load testing (future enhancement)
- Mobile/responsive testing (future enhancement)

---

## Testing Framework & Tools

### Primary Framework: Playwright

**Selected for:**

- Cross-browser support (Chromium, Firefox, WebKit)
- Built-in network interception (mock Google Sheets API)
- File upload simulation
- PDF download verification
- Screenshot/video capture for debugging
- Excellent TypeScript support
- Already available via MCP tools

### Additional Tools

- **@playwright/test** - Test runner with fixtures
- **expect** - Assertion library (built into Playwright)
- **test-data-generator** - Custom utility for generating CSV fixtures
- **GitHub Actions** - CI/CD integration

### Installation

```bash
pnpm add -D @playwright/test
pnpm exec playwright install --with-deps chromium
```

### Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
```

---

## Test Structure & Organization

### Directory Layout

```
tests/
├── e2e/
│   ├── happy-paths/
│   │   ├── csv-upload-flow.spec.ts
│   │   └── google-sheets-flow.spec.ts
│   ├── navigation/
│   │   ├── wizard-back-forward.spec.ts
│   │   ├── state-persistence.spec.ts
│   │   └── browser-navigation-protection.spec.ts
│   ├── validation/
│   │   ├── file-validation.spec.ts
│   │   ├── column-mapping-validation.spec.ts
│   │   └── duplicate-column-detection.spec.ts
│   ├── error-handling/
│   │   ├── upload-errors.spec.ts
│   │   ├── api-failures.spec.ts
│   │   └── recovery-scenarios.spec.ts
│   ├── edge-cases/
│   │   ├── empty-csv.spec.ts
│   │   ├── large-files.spec.ts
│   │   ├── malformed-data.spec.ts
│   │   └── unicode-data.spec.ts
│   └── accessibility/
│       ├── keyboard-navigation.spec.ts
│       └── screen-reader.spec.ts
├── fixtures/
│   ├── csv/
│   │   ├── valid-contacts.csv
│   │   ├── large-dataset.csv
│   │   ├── single-column.csv
│   │   ├── empty.csv
│   │   ├── malformed-quotes.csv
│   │   └── unicode-names.csv
│   └── responses/
│       ├── google-sheets-success.json
│       └── google-sheets-error.json
└── helpers/
    ├── test-data-generator.ts
    ├── api-mocks.ts
    └── page-objects/
        ├── upload-step.ts
        ├── mapping-step.ts
        └── preview-step.ts
```

### Naming Conventions

- **Test files:** `{feature}.spec.ts`
- **Test IDs:** `{CATEGORY}-{NUMBER}` (e.g., `HP-CSV-001`, `VAL-002`)
- **Fixtures:** Descriptive names (`valid-contacts.csv`, `malformed-quotes.csv`)

---

## Test Scenarios & Specifications

### Priority Levels

**P0 - Must Pass (Blocking Release):**

- Critical user journeys that must work for MVP
- Core functionality tests
- Data integrity and validation tests

**P1 - Should Pass (Important):**

- Important UX flows
- Error recovery scenarios
- Edge cases that users might encounter

**P2 - Nice to Have (Enhanced UX):**

- Accessibility enhancements
- Performance optimizations
- Advanced features

---

### P0 Tests (5 Tests - Blocking)

#### HP-CSV-001: Complete CSV Upload to PDF Generation

**Priority:** P0 - Critical
**Estimated Time:** 45 minutes
**File:** `tests/e2e/happy-paths/csv-upload-flow.spec.ts`

**Scenario:**
User uploads CSV file → Data is parsed → Columns are auto-mapped → Preview loads → PDF downloads successfully

**Steps:**

1. Navigate to homepage
2. Upload valid CSV file (3 columns, 10 rows)
3. Verify parsing success message appears
4. Verify auto-mapping of first 3 columns
5. Verify data preview table shows 5 rows
6. Click "Continue to Preview"
7. Verify HTML preview iframe loads
8. Test zoom controls (in/out/reset)
9. Click "Download PDF"
10. Verify PDF file downloads with correct name and size > 1KB

**Assertions:**

- Upload step completes
- Column mapping step activates
- Data table renders with correct rows
- Preview iframe contains HTML
- PDF download succeeds

---

#### HP-SHEETS-001: Google Sheets URL to PDF Generation

**Priority:** P0 - Critical
**Estimated Time:** 45 minutes
**File:** `tests/e2e/happy-paths/google-sheets-flow.spec.ts`

**Scenario:**
User enters Google Sheets URL → API fetches sheet data → Rest of flow matches CSV upload

**Steps:**

1. Navigate to homepage
2. Toggle to "Google Sheets" mode
3. Enter valid Google Sheets URL
4. Click "Load Sheet"
5. Wait for API response (mocked)
6. Verify parsing success
7. Continue through mapping and preview steps
8. Verify PDF generation

**Mock Setup:**

```typescript
await page.route('**/api/parse', async route => {
  if (route.request().postDataJSON()?.sheetsUrl) {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        columns: ['Name', 'Company', 'Title'],
        headers: ['Name', 'Company', 'Title'],
        rowCount: 10,
        preview: [
          /* data rows */
        ],
      }),
    })
  }
})
```

---

#### VAL-001: Duplicate Column Detection

**Priority:** P0 - Critical
**Estimated Time:** 30 minutes
**File:** `tests/e2e/validation/duplicate-column-detection.spec.ts`

**Scenario:**
User attempts to map same column to multiple lines → Validation error appears → Continue button disabled

**Steps:**

1. Upload valid CSV
2. Map Column 1 to Line 1
3. Map Column 1 to Line 2 (duplicate)
4. Map Column 1 to Line 3 (duplicate)
5. Verify error message: "Each column can only be used once"
6. Verify "Continue to Preview" button is disabled
7. Change Line 2 to Column 2
8. Change Line 3 to Column 3
9. Verify error disappears
10. Verify button is enabled

**Validates:** Critical issue C2 from code review

---

#### VAL-002: File Type and Size Validation

**Priority:** P0 - Critical
**Estimated Time:** 45 minutes
**File:** `tests/e2e/validation/file-validation.spec.ts`

**Scenario:**
User attempts to upload invalid file types and oversized files

**Test Cases:**

1. **Invalid file type (Excel):**
   - Upload `.xlsx` file
   - Verify error: "Please upload a CSV file"
   - Verify upload step stays active

2. **Invalid file type (Text):**
   - Upload `.txt` file
   - Verify same error handling

3. **File too large:**
   - Upload 6MB CSV file
   - Verify error: "File must be smaller than 5MB"
   - Verify upload step stays active

4. **Valid CSV after error:**
   - Upload valid CSV after error
   - Verify success (error recovery)

**Validates:** Critical issues C3 and C4 from code review

---

#### NAV-002: Browser Navigation Protection

**Priority:** P0 - Critical
**Estimated Time:** 60 minutes
**File:** `tests/e2e/navigation/browser-navigation-protection.spec.ts`

**Scenario:**
User has uploaded data → Attempts to navigate away → Warning dialog prevents data loss

**Test Cases:**

1. **beforeunload event:**
   - Upload CSV
   - Trigger `beforeunload` event
   - Verify event listener is registered
   - Verify return value contains warning

2. **Browser back button:**
   - Upload CSV and map columns
   - Simulate browser back button
   - Verify confirmation dialog appears
   - User cancels → stays on page with data intact

3. **Close tab:**
   - Upload CSV
   - Trigger tab close event
   - Verify warning appears

4. **No warning when no data:**
   - Navigate to page
   - Don't upload anything
   - Trigger beforeunload
   - Verify no warning (no data to lose)

**Validates:** Critical issue C1 from code review

---

### P1 Tests (4 Tests - Important)

#### NAV-001: Wizard Back/Forward Navigation

**Priority:** P1 - Important
**Estimated Time:** 60 minutes
**File:** `tests/e2e/navigation/wizard-back-forward.spec.ts`

**Scenario:**
User navigates back and forth between wizard steps multiple times, making changes each iteration

**Steps:**

1. Upload CSV (Iteration 1)
2. Map columns: Line1=Col1, Line2=Col2, Line3=Col3
3. View preview
4. Navigate back to mapping step
5. Change mapping: Line2=Col3, Line3=Col2 (Iteration 2)
6. View updated preview
7. Navigate back to upload step
8. Navigate forward to mapping
9. Verify mapping persists (changed values)
10. Upload different CSV file (Iteration 3)
11. Verify mapping resets for new file
12. Complete flow with new file

**Assertions:**

- State persists when navigating back/forward
- Mapping changes are preserved
- Preview regenerates when mapping changes
- New upload resets downstream steps

---

#### ERR-001: API Failure and Recovery

**Priority:** P1 - Important
**Estimated Time:** 45 minutes
**File:** `tests/e2e/error-handling/api-failures.spec.ts`

**Scenario:**
API call fails → User sees actionable error message → Retry succeeds

**Test Cases:**

1. **Google Sheets API failure with retry:**
   - Mock API to fail on first call
   - Enter Google Sheets URL
   - Verify error message with guidance
   - Verify "Try Again" button appears
   - Click retry
   - Mock API succeeds on second call
   - Verify success

2. **Parse API timeout:**
   - Mock slow API response
   - Verify loading state shows
   - Verify timeout error after threshold

3. **Generate API failure:**
   - Complete upload and mapping
   - Mock generate API failure
   - Verify error in preview step
   - Verify user can go back to fix

**Validates:** Major issue M1 from code review

---

#### NAV-003: Start Over Confirmation

**Priority:** P1 - Important
**Estimated Time:** 30 minutes
**File:** `tests/e2e/navigation/start-over-confirmation.spec.ts`

**Scenario:**
User clicks "Start Over" → Confirmation dialog prevents accidental data loss

**Test Cases:**

1. **User confirms reset:**
   - Complete full flow to preview
   - Click "Start Over"
   - Verify confirmation dialog: "Are you sure? This will clear your upload and mapping."
   - Click "Confirm"
   - Verify wizard resets to upload step
   - Verify all state is cleared

2. **User cancels reset:**
   - Complete full flow to preview
   - Click "Start Over"
   - Click "Cancel" in dialog
   - Verify preview is still visible
   - Verify no state changed

**Validates:** Usability concern U2 from code review

---

#### EDGE-001: Empty and Malformed CSV

**Priority:** P1 - Important
**Estimated Time:** 60 minutes
**File:** `tests/e2e/edge-cases/malformed-data.spec.ts`

**Test Cases:**

1. **CSV with only headers (no data):**
   - Upload `empty.csv`
   - Verify error: "CSV file contains no data rows"
   - Verify can upload different file

2. **Single column CSV:**
   - Upload `single-column.csv`
   - Verify warning: "CSV has only 1 column"
   - Verify can still proceed (map to line1 only)
   - Verify preview shows single-line labels

3. **Malformed quotes:**
   - Upload `malformed-quotes.csv`
   - Verify either: successful parse OR clear error message
   - If parsed, verify data integrity

4. **Unicode characters:**
   - Upload `unicode-names.csv` (José, 李明, Müller)
   - Verify correct parsing
   - Verify preview displays Unicode correctly
   - Verify PDF contains Unicode characters

**Validates:** Multiple usability concerns (U9, etc.)

---

### P2 Tests (2 Tests - Nice to Have)

#### A11Y-001: Keyboard Navigation

**Priority:** P2 - Enhanced UX
**Estimated Time:** 90 minutes
**File:** `tests/e2e/accessibility/keyboard-navigation.spec.ts`

**Scenario:**
Power user completes entire flow using only keyboard

**Steps:**

1. Navigate to page
2. Tab to file input
3. Upload file (via Enter key simulation)
4. Tab through mapping dropdowns
5. Use arrow keys to select options
6. Tab to "Continue to Preview" and press Enter
7. Use keyboard shortcuts:
   - `+` or `=` to zoom in
   - `-` to zoom out
   - `0` to reset zoom
   - `Escape` to return to mapping
8. Tab to "Download PDF" and press Enter

**Accessibility Checks:**

- All interactive elements are focusable
- Focus indicators are visible
- Tab order is logical
- No keyboard traps
- ARIA labels are present

**Validates:** Major issue M2 from code review

---

#### PERF-001: Large File Performance

**Priority:** P2 - Performance
**Estimated Time:** 45 minutes
**File:** `tests/e2e/edge-cases/large-files.spec.ts`

**Scenario:**
User uploads CSV with 1000+ rows

**Steps:**

1. Upload `large-dataset.csv` (1000 rows)
2. Measure upload time (should be < 3 seconds)
3. Verify parsing completes
4. Verify preview table only shows 5 rows (pagination)
5. Complete mapping
6. Measure preview generation time
7. Verify preview loads in < 5 seconds
8. Download PDF
9. Verify PDF contains all 1000 labels (100 pages)

**Performance Assertions:**

- Upload: < 3 seconds
- Parse: < 2 seconds
- Preview generation: < 5 seconds
- PDF download initiates within 3 seconds

---

## Test Data & Fixtures

### CSV Fixtures

#### valid-contacts.csv

```csv
Name,Company,Title
John Doe,Acme Corp,CEO
Jane Smith,TechStart,CTO
Bob Johnson,DataCo,Engineer
Alice Williams,CloudInc,Designer
Charlie Brown,StartupXYZ,Manager
David Lee,FinTech,Analyst
Emma Davis,MedTech,Researcher
Frank Miller,EduCorp,Teacher
Grace Chen,AgriTech,Scientist
Henry Wilson,RetailCo,Manager
```

#### large-dataset.csv (Generated)

```typescript
// tests/helpers/test-data-generator.ts
export function generateLargeCSV(rowCount: number = 1000): string {
  const headers = 'Name,Email,Department'
  const rows = [headers]

  for (let i = 1; i <= rowCount; i++) {
    const name = `Person ${i}`
    const email = `person${i}@example.com`
    const dept = `Department ${(i % 10) + 1}`
    rows.push(`${name},${email},${dept}`)
  }

  return rows.join('\n')
}
```

#### single-column.csv

```csv
Name
John Doe
Jane Smith
Bob Johnson
```

#### empty.csv

```csv
Name,Email,Title
```

#### malformed-quotes.csv

```csv
Name,Description
"John Doe","This has a ""quote"" inside"
"Jane Smith","Normal description"
"Bob ""Bobby"" Johnson","Nickname with quotes"
```

#### unicode-names.csv

```csv
Name,Company,Title
José García,TechCorp España,Manager
李明,DataInc Beijing,Engineer
Müller Schmidt,CloudCo Deutschland,Director
Анна Иванова,RusTech,Analyst
محمد الأحمد,MideastCorp,Consultant
```

### API Response Fixtures

#### google-sheets-success.json

```json
{
  "columns": ["Name", "Company", "Title"],
  "headers": ["Name", "Company", "Title"],
  "rowCount": 10,
  "preview": [
    ["John Doe", "Acme Corp", "CEO"],
    ["Jane Smith", "TechStart", "CTO"],
    ["Bob Johnson", "DataCo", "Engineer"],
    ["Alice Williams", "CloudInc", "Designer"],
    ["Charlie Brown", "StartupXYZ", "Manager"]
  ]
}
```

#### google-sheets-error.json

```json
{
  "statusCode": 400,
  "message": "Failed to fetch Google Sheet. Make sure it is published (File → Share → Publish to web) and publicly accessible."
}
```

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1)

**Goal:** Set up testing infrastructure and implement P0 tests

**Tasks:**

- [ ] Install Playwright and configure `playwright.config.ts`
- [ ] Set up test directory structure
- [ ] Create all CSV fixture files
- [ ] Implement `test-data-generator.ts` helper
- [ ] Write page object models for wizard steps
- [ ] Implement HP-CSV-001 (CSV upload happy path)
- [ ] Implement HP-SHEETS-001 (Google Sheets happy path)

**Deliverables:**

- Working Playwright setup
- 2 P0 tests passing
- All fixtures available

**Success Criteria:**

- Tests run locally via `pnpm test:e2e`
- Both happy path tests pass consistently

---

### Phase 2: Validation (Week 2)

**Goal:** Implement critical validation tests

**Tasks:**

- [ ] Implement VAL-001 (Duplicate column detection)
- [ ] Implement VAL-002 (File type and size validation)
- [ ] Implement NAV-002 (Browser navigation protection)
- [ ] Create `api-mocks.ts` helper for network interception
- [ ] Document mock strategies

**Deliverables:**

- 3 additional P0 tests (total: 5)
- API mocking utilities

**Success Criteria:**

- All 5 P0 tests pass
- Validation logic is thoroughly tested

---

### Phase 3: Navigation & Errors (Week 3)

**Goal:** Implement P1 tests for navigation and error handling

**Tasks:**

- [ ] Implement NAV-001 (Back/forward navigation)
- [ ] Implement NAV-003 (Start Over confirmation)
- [ ] Implement ERR-001 (API failure and recovery)
- [ ] Implement EDGE-001 (Empty and malformed CSV)

**Deliverables:**

- 4 P1 tests (total: 9 tests)
- Edge case coverage

**Success Criteria:**

- 9 tests passing (5 P0 + 4 P1)
- Error scenarios well-covered

---

### Phase 4: Accessibility & Performance (Week 4)

**Goal:** Implement P2 tests and CI/CD integration

**Tasks:**

- [ ] Implement A11Y-001 (Keyboard navigation)
- [ ] Implement PERF-001 (Large file performance)
- [ ] Set up GitHub Actions workflow
- [ ] Configure test reporting (HTML, JUnit)
- [ ] Add test badges to README

**Deliverables:**

- 2 P2 tests (total: 11 tests)
- CI/CD pipeline running tests on every PR
- Test reports accessible in GitHub Actions

**Success Criteria:**

- All 11 tests passing in CI
- Test results visible in PR checks

---

### Phase 5: Maintenance & Enhancement (Ongoing)

**Tasks:**

- [ ] Add visual regression tests (Playwright screenshot comparison)
- [ ] Add performance benchmarking
- [ ] Expand mobile/responsive tests
- [ ] Add tests for new features as developed
- [ ] Review and update test data quarterly

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    timeout-minutes: 10
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v5

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps chromium

      - name: Build application
        run: pnpm build

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v5
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

      - name: Upload test screenshots
        if: failure()
        uses: actions/upload-artifact@v5
        with:
          name: test-screenshots
          path: test-results/
          retention-days: 7
```

### package.json Scripts

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:report": "playwright show-report"
  }
}
```

---

## Success Metrics

### Test Coverage Goals

| Category             | Target Coverage                |
| -------------------- | ------------------------------ |
| **Happy Paths**      | 100% (all critical flows)      |
| **Validation Logic** | 95% (all edge cases)           |
| **Error Handling**   | 90% (common errors + recovery) |
| **Accessibility**    | 80% (keyboard nav + ARIA)      |
| **Edge Cases**       | 70% (known edge cases)         |

### Quality Gates

**For Pull Requests:**

- [ ] All P0 tests must pass (5 tests)
- [ ] At least 90% of P1 tests pass (4 tests)
- [ ] No new failing tests introduced

**For Releases:**

- [ ] All P0 and P1 tests pass (9 tests)
- [ ] P2 tests have 80%+ pass rate (2 tests)
- [ ] Test execution time < 5 minutes

### KPIs to Track

1. **Test Pass Rate:** Target 95%+
2. **Test Execution Time:** Target < 5 minutes for full suite
3. **Flaky Test Rate:** Target < 5%
4. **Code Coverage:** Target 80%+ (when unit tests added)
5. **Bug Escape Rate:** Target < 1 critical bug per release

---

## Appendix

### Troubleshooting Common Issues

**Issue:** Tests fail with "Timeout waiting for locator"

- **Solution:** Increase timeout in `playwright.config.ts` or add explicit waits

**Issue:** File upload tests fail intermittently

- **Solution:** Use `waitForEvent('filechooser')` instead of direct input manipulation

**Issue:** PDF download verification fails

- **Solution:** Ensure `acceptDownloads: true` in browser context

**Issue:** API mocks not intercepting requests

- **Solution:** Set up route before navigating to page

### Best Practices

1. **Use data-testid attributes** for stable selectors
2. **Avoid hard-coded waits** (use `waitFor` instead of `setTimeout`)
3. **Clean up state** between tests (use `beforeEach` hooks)
4. **Mock external APIs** consistently (use fixtures)
5. **Keep tests independent** (no test should depend on another)

### Resources

- [Playwright Documentation](https://playwright.dev)
- [Nuxt Testing Best Practices](https://nuxt.com/docs/getting-started/testing)
- [Web Accessibility Testing](https://www.w3.org/WAI/test-evaluate/)
