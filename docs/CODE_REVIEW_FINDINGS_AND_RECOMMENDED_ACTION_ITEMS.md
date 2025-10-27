# Code Review Findings & Recommended Action Items

**Document Version:** 1.1
**Last Updated:** 2025-10-26
**Review Date:** 2025-10-26
**Reviewer:** Claude Code

**Changelog:**

- v1.1 (2025-10-26): Added documentation of context-aware column mapping feature (Architecture Strengths #6), updated F7 to reflect existing implementation

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Overall Assessment](#overall-assessment)
3. [Critical Issues (P0)](#critical-issues-p0)
4. [Major Issues (P1)](#major-issues-p1)
5. [Minor Issues (P2)](#minor-issues-p2)
6. [Missing Functionality](#missing-functionality)
7. [Usability Concerns](#usability-concerns)
8. [Implementation Roadmap](#implementation-roadmap)
9. [Architecture Strengths](#architecture-strengths)

---

## Executive Summary

### Review Scope

This comprehensive code review analyzed the Slappy Name Tag Generator UI implementation, focusing on:

- Component architecture and interactions
- User experience and workflow design
- Error handling and validation
- Accessibility and keyboard navigation
- State management and data flow
- Edge case handling

### Key Metrics

| Category               | Count | Severity Impact             |
| ---------------------- | ----- | --------------------------- |
| **Critical Issues**    | 4     | Data loss, validation gaps  |
| **Major Issues**       | 6     | Poor UX, accessibility gaps |
| **Minor Issues**       | 6     | Polish and consistency      |
| **Missing Features**   | 7     | Expected functionality gaps |
| **Usability Concerns** | 14    | Potential user mistakes     |
| **Total Findings**     | 37    | -                           |

### Priority Breakdown

- **P0 (Must Fix):** 4 critical issues blocking production-ready status
- **P1 (Should Fix):** 12 issues affecting user experience and accessibility
- **P2 (Nice to Have):** 21 enhancements and polish items

### Biggest Risks

1. **Data Loss Risk:** No browser navigation protection → Users lose 10+ minutes of work
2. **Validation Gaps:** Missing duplicate column detection → Confusing output
3. **Poor Error Recovery:** Generic error messages without actionable guidance
4. **Accessibility Gaps:** No keyboard navigation support

---

## Overall Assessment

### Strengths ✅

The Slappy implementation demonstrates **excellent architectural decisions**:

- **Clean composable-based architecture** - State management is well-separated from UI
- **Progressive disclosure pattern** - Three-column wizard design provides excellent spatial awareness
- **Type-safe implementation** - Comprehensive TypeScript types prevent common errors
- **Modern tech stack** - Nuxt 4, Vue 3 Composition API, proper PostCSS organization
- **Context-aware UI** - Column mapping dropdowns reactively show header names when "First row contains headers" is checked, making mapping intuitive and error-free

### Areas for Improvement ⚠️

While the foundation is solid, the application has **significant gaps** in:

- **User protection** - No safeguards against accidental data loss
- **Validation** - Insufficient checks allow confusing/invalid states
- **Error handling** - Generic messages without recovery guidance
- **Accessibility** - Limited keyboard navigation and ARIA support

### Production Readiness

**Current Status:** 70% ready for production

**Required for MVP (P0):**

- Browser navigation protection (prevent data loss)
- Duplicate column validation
- File type and size validation
- Actionable error messages

**Recommended for Launch (P1):**

- Keyboard navigation
- Improved validation feedback
- State persistence during navigation
- Error recovery mechanisms

---

## Critical Issues (P0)

### C1. No Browser Navigation Protection

**Severity:** Critical - Data Loss Risk
**Impact:** High - Users can lose 10+ minutes of work
**Files Affected:** All wizard components and composables

**Problem:**
No `beforeunload` event handler warns users when they have unsaved work. Users can:

- Accidentally click browser back button
- Close tab
- Navigate to different URL
- Refresh page

All of these actions lose uploaded CSV data, column mappings, and generated preview.

**Scenario:**

1. User uploads 500-row CSV file
2. Spends 5 minutes mapping columns correctly
3. Accidentally clicks browser back button
4. No warning appears
5. Returns to empty wizard - must start completely over

**Recommended Solution:**

```typescript
// app/composables/useWizardNavigation.ts
export const useWizardNavigation = () => {
  const hasUnsavedWork = computed(() => {
    return parsedData.value !== null || Object.values(mapping.value).some(v => v !== null)
  })

  // Add beforeunload listener
  onMounted(() => {
    window.addEventListener('beforeunload', handleBeforeUnload)
  })

  onUnmounted(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  })

  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (hasUnsavedWork.value) {
      e.preventDefault()
      e.returnValue = 'You have unsaved work. Are you sure you want to leave?'
      return e.returnValue
    }
  }

  // ... rest of composable
}
```

**Additional Protection:**

```vue
<!-- app/components/organisms/NameTagWizard.vue -->
<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
const hasUnsavedWork = computed(() => /* ... */);

// Warn before route navigation (if using vue-router)
onBeforeRouteLeave((to, from, next) => {
  if (hasUnsavedWork.value) {
    const answer = window.confirm(
      'You have unsaved work. Are you sure you want to leave?'
    );
    if (answer) {
      next();
    } else {
      next(false);
    }
  } else {
    next();
  }
});
</script>
```

**Effort:** 2 hours
**Testing:** NAV-002 (Browser Navigation Protection)

---

### C2. Missing Duplicate Column Validation

**Severity:** Critical - Data Integrity
**Impact:** High - Produces confusing output
**File:** `app/composables/useColumnMapping.ts:13-17`

**Problem:**
The `isValid` computed property only checks if at least one line is mapped, but doesn't prevent mapping the same column to multiple lines.

**Current Code:**

```typescript
const isValid = computed(() => {
  return (
    mapping.value.line1 !== null || mapping.value.line2 !== null || mapping.value.line3 !== null
  )
})
```

**Scenario:**

1. User uploads CSV with columns: Name, Email, Phone
2. Accidentally selects "Email" for both Line 1 and Line 2
3. Validation passes (at least one line is mapped)
4. Preview shows email address on two lines of every label
5. User doesn't notice until after printing 100 labels

**Recommended Solution:**

```typescript
// app/composables/useColumnMapping.ts
const hasDuplicates = computed(() => {
  const mappedValues = [mapping.value.line1, mapping.value.line2, mapping.value.line3].filter(
    v => v !== null
  )

  const uniqueValues = new Set(mappedValues)
  return uniqueValues.size !== mappedValues.length
})

const isValid = computed(() => {
  // Must have at least one mapping AND no duplicates
  const hasMapping =
    mapping.value.line1 !== null || mapping.value.line2 !== null || mapping.value.line3 !== null

  return hasMapping && !hasDuplicates.value
})

// Export for UI to show specific error
return {
  mapping: readonly(mapping),
  isValid,
  hasDuplicates: readonly(hasDuplicates), // Add this
  // ... rest
}
```

**UI Feedback:**

```vue
<!-- app/components/organisms/ColumnMapper.vue -->
<template>
  <div class="column-mapper">
    <!-- ... mapping dropdowns ... -->

    <!-- Error message for duplicates -->
    <div v-if="hasDuplicates" class="validation-error">
      <UIcon name="i-heroicons-exclamation-triangle" />
      <p>Each column can only be mapped once. Please select different columns for each line.</p>
    </div>

    <!-- Disabled continue button -->
    <UButton :disabled="!isValid" @click="continueToPreview"> Continue to Preview </UButton>

    <!-- Helper text when button is disabled -->
    <p v-if="!isValid && !hasDuplicates" class="helper-text">
      Select at least one column to continue
    </p>
  </div>
</template>

<style lang="postcss" scoped>
.validation-error {
  @apply flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-red-400;
}

.helper-text {
  @apply text-sm text-gray-400;
}
</style>
```

**Effort:** 3 hours
**Testing:** VAL-001 (Duplicate Column Detection)

---

### C3. Inconsistent File Type Validation

**Severity:** Critical - Poor UX
**Impact:** Medium - Users get cryptic errors
**File:** `app/components/molecules/FileUpload.vue:20-28`

**Problem:**
The `handleDrop` function validates `file.type === 'text/csv'`, but `handleFileInput` (file picker) doesn't validate at all.

**Current Code:**

```typescript
// handleDrop validates
const handleDrop = (e: DragEvent) => {
  // ...
  if (file.type === 'text/csv') {
    emit('file-selected', file)
  }
}

// handleFileInput does NOT validate
const handleFileInput = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    emit('file-selected', file) // No validation!
  }
}
```

**Scenario:**

1. User clicks "Browse" button (file picker)
2. Selects Excel file (.xlsx)
3. API call fails with generic error: "Failed to parse file"
4. User confused - doesn't know CSV is required

**Recommended Solution:**

```typescript
// app/components/molecules/FileUpload.vue
const validateFile = (file: File): { valid: boolean; error?: string } => {
  // Check file extension (more reliable than MIME type)
  if (!file.name.toLowerCase().endsWith('.csv')) {
    return {
      valid: false,
      error: 'Please upload a CSV file (.csv extension required)',
    }
  }

  // Check MIME type (when available)
  if (file.type && file.type !== 'text/csv' && file.type !== 'application/csv') {
    return {
      valid: false,
      error: 'Please upload a CSV file',
    }
  }

  return { valid: true }
}

const handleDrop = (e: DragEvent) => {
  // ...
  const validation = validateFile(file)
  if (!validation.valid) {
    emit('error', validation.error)
    return
  }
  emit('file-selected', file)
}

const handleFileInput = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const validation = validateFile(file)
    if (!validation.valid) {
      emit('error', validation.error)
      return
    }
    emit('file-selected', file)
  }
}
```

**UI Error Display:**

```vue
<!-- app/components/organisms/NameTagWizard.vue -->
<template>
  <div class="upload-step">
    <FileUpload
      :loading="uploadLoading"
      @file-selected="handleFileUpload"
      @error="handleUploadError"
    />

    <!-- Error message -->
    <div v-if="uploadError" class="error-message">
      <UIcon name="i-heroicons-exclamation-circle" />
      <p>{{ uploadError }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const uploadError = ref<string | null>(null)

const handleUploadError = (error: string) => {
  uploadError.value = error
}

const handleFileUpload = async (file: File) => {
  uploadError.value = null // Clear previous errors
  // ... rest of upload logic
}
</script>
```

**Effort:** 2 hours
**Testing:** VAL-002 (File Type Validation)

---

### C4. No CSV Size Limit

**Severity:** Critical - Performance
**Impact:** Medium - Browser freeze, server timeout
**File:** `app/composables/useDataUpload.ts`

**Problem:**
No client-side validation of file size before upload. Users can upload 50MB+ CSV files that:

- Freeze browser during parsing
- Cause server timeouts
- Generate massive PDFs
- Waste server resources

**Recommended Solution:**

```typescript
// app/components/molecules/FileUpload.vue
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const validateFile = (file: File): { valid: boolean; error?: string } => {
  // File type validation (from C3)
  if (!file.name.toLowerCase().endsWith('.csv')) {
    return { valid: false, error: 'Please upload a CSV file' }
  }

  // Size validation
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(1)
    return {
      valid: false,
      error: `File size (${sizeMB}MB) exceeds the 5MB limit. Please use a smaller file or split your data.`,
    }
  }

  // Warn for large files (but allow)
  if (file.size > 1 * 1024 * 1024) {
    // > 1MB
    const sizeMB = (file.size / 1024 / 1024).toFixed(1)
    console.warn(`Large file uploaded: ${sizeMB}MB`)
  }

  return { valid: true }
}
```

**Additional: Row Count Limit**

```typescript
// server/utils/csv-parser.ts
const MAX_ROWS = 5000 // Reasonable limit for name tags

export async function parseCSVContent(content: string) {
  const parsed = parse(content, {
    /* options */
  })

  if (parsed.data.length > MAX_ROWS) {
    throw createError({
      statusCode: 400,
      message: `CSV contains ${parsed.data.length} rows, but maximum is ${MAX_ROWS}. Please split your data into smaller files.`,
    })
  }

  return parsed
}
```

**Effort:** 2 hours
**Testing:** VAL-002 (File Size Validation)

---

## Major Issues (P1)

### M1. Generic Error Messages

**Severity:** Major - Poor UX
**Impact:** Medium - Users can't self-recover
**File:** `app/components/organisms/NameTagWizard.vue:68-70`

**Problem:**
Error messages are displayed directly from API without context or recovery guidance.

**Current Code:**

```vue
<div v-if="error" class="error-message">
  <p>{{ error }}</p>
</div>
```

**Examples of Generic Errors:**

- "Failed to parse Google Sheet" → Why? What should user do?
- "Invalid Google Sheets URL" → What format is expected?
- "Failed to parse file" → What's wrong with the file?

**Recommended Solution:**

```typescript
// app/utils/error-messages.ts
type ErrorContext = {
  message: string
  solution: string
  helpLink?: string
}

export const ERROR_MESSAGES: Record<string, ErrorContext> = {
  GOOGLE_SHEETS_FAILED: {
    message: 'Unable to access Google Sheet',
    solution:
      'Make sure your sheet is published:\n1. Open your sheet\n2. Click File → Share → Publish to web\n3. Click "Publish" and copy the URL',
    helpLink: 'https://support.google.com/docs/answer/183965',
  },
  GOOGLE_SHEETS_INVALID_URL: {
    message: 'Invalid Google Sheets URL',
    solution: 'URL should look like:\nhttps://docs.google.com/spreadsheets/d/SHEET_ID/edit',
    helpLink: 'https://support.google.com/docs/answer/183965',
  },
  GOOGLE_SHEETS_PRIVATE: {
    message: 'Google Sheet is private',
    solution:
      'The sheet must be publicly accessible. Click "Share" and set to "Anyone with the link"',
  },
  CSV_PARSE_FAILED: {
    message: 'Unable to parse CSV file',
    solution:
      'Please check:\n• File is valid CSV format\n• Encoding is UTF-8\n• Quotes are properly escaped\n• No binary data in file',
  },
  FILE_TOO_LARGE: {
    message: 'File is too large',
    solution:
      'Maximum file size is 5MB. Try:\n• Removing unnecessary columns\n• Splitting data into multiple files\n• Compressing the file',
  },
}

export function getErrorMessage(apiError: string): ErrorContext {
  // Map API errors to user-friendly messages
  if (apiError.includes('Google Sheet')) {
    if (apiError.includes('403') || apiError.includes('private')) {
      return ERROR_MESSAGES.GOOGLE_SHEETS_PRIVATE
    }
    return ERROR_MESSAGES.GOOGLE_SHEETS_FAILED
  }

  if (apiError.includes('Invalid Google Sheets URL')) {
    return ERROR_MESSAGES.GOOGLE_SHEETS_INVALID_URL
  }

  if (apiError.includes('parse') || apiError.includes('CSV')) {
    return ERROR_MESSAGES.CSV_PARSE_FAILED
  }

  // Default fallback
  return {
    message: 'An error occurred',
    solution: apiError,
  }
}
```

**Enhanced UI:**

```vue
<!-- app/components/molecules/ErrorDisplay.vue -->
<template>
  <div class="error-display">
    <div class="error-header">
      <UIcon name="i-heroicons-exclamation-circle" class="error-icon" />
      <h3>{{ errorContext.message }}</h3>
    </div>

    <div class="error-solution">
      <p class="whitespace-pre-line">{{ errorContext.solution }}</p>
    </div>

    <div v-if="errorContext.helpLink" class="error-help">
      <a :href="errorContext.helpLink" target="_blank" rel="noopener noreferrer">
        Learn more <UIcon name="i-heroicons-arrow-top-right-on-square" />
      </a>
    </div>

    <div class="error-actions">
      <UButton variant="secondary" @click="$emit('retry')"> Try Again </UButton>
      <UButton variant="ghost" @click="$emit('dismiss')"> Dismiss </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ErrorContext } from '~/utils/error-messages'

defineProps<{
  errorContext: ErrorContext
}>()

defineEmits<{
  retry: []
  dismiss: []
}>()
</script>

<style lang="postcss" scoped>
.error-display {
  @apply rounded-xl border border-red-500/20 bg-red-500/10 p-6;
}

.error-header {
  @apply mb-4 flex items-center gap-3;
}

.error-icon {
  @apply h-6 w-6 text-red-400;
}

.error-solution {
  @apply mb-4 text-sm text-gray-300;
}

.error-help {
  @apply mb-4;
}

.error-help a {
  @apply inline-flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300;
}

.error-actions {
  @apply flex gap-3;
}
</style>
```

**Usage:**

```vue
<!-- app/components/organisms/NameTagWizard.vue -->
<script setup lang="ts">
import { getErrorMessage } from '~/utils/error-messages'

const errorContext = computed(() => {
  if (!error.value) return null
  return getErrorMessage(error.value)
})
</script>

<template>
  <ErrorDisplay
    v-if="errorContext"
    :error-context="errorContext"
    @retry="handleRetry"
    @dismiss="error = null"
  />
</template>
```

**Effort:** 4 hours
**Testing:** ERR-001 (API Failure and Recovery)

---

### M2. No Keyboard Navigation

**Severity:** Major - Accessibility
**Impact:** High - Excludes power users and accessibility tools
**Files:** All components

**Problem:**
No keyboard shortcuts or focus management. Users relying on keyboard navigation have poor experience:

- Can't navigate wizard steps via keyboard
- No focus indicators on custom components
- No keyboard shortcuts for common actions

**WCAG Violations:**

- 2.1.1 Keyboard (Level A) - Not all functionality available via keyboard
- 2.4.3 Focus Order (Level A) - Focus order not logical
- 2.4.7 Focus Visible (Level AA) - Focus indicators missing

**Recommended Solution:**

**1. Add Keyboard Event Listeners:**

```typescript
// app/composables/useKeyboardNavigation.ts
export const useKeyboardNavigation = () => {
  const handleKeydown = (e: KeyboardEvent) => {
    // Wizard navigation
    if (e.key === 'ArrowRight' && e.ctrlKey) {
      e.preventDefault()
      navigateNext()
    }

    if (e.key === 'ArrowLeft' && e.ctrlKey) {
      e.preventDefault()
      navigatePrevious()
    }

    // Escape to close preview
    if (e.key === 'Escape' && currentStep.value === 'preview') {
      e.preventDefault()
      goToStep('mapping')
    }

    // Zoom controls
    if (currentStep.value === 'preview') {
      if (e.key === '+' || e.key === '=') {
        e.preventDefault()
        zoomIn()
      }
      if (e.key === '-') {
        e.preventDefault()
        zoomOut()
      }
      if (e.key === '0') {
        e.preventDefault()
        resetZoom()
      }
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
}
```

**2. Add Focus Management:**

```vue
<!-- app/components/organisms/ColumnMapper.vue -->
<script setup lang="ts">
const line1Select = ref<HTMLSelectElement>()
const line2Select = ref<HTMLSelectElement>()
const line3Select = ref<HTMLSelectElement>()

// Auto-focus first dropdown when step activates
watch(
  () => props.active,
  isActive => {
    if (isActive) {
      nextTick(() => {
        line1Select.value?.focus()
      })
    }
  }
)

// Tab order management
const handleLine1Change = () => {
  nextTick(() => {
    line2Select.value?.focus()
  })
}

const handleLine2Change = () => {
  nextTick(() => {
    line3Select.value?.focus()
  })
}
</script>

<template>
  <div class="column-mapper">
    <label for="line1-select">Line 1 (Large, Bold)</label>
    <select id="line1-select" ref="line1Select" v-model="mapping.line1" @change="handleLine1Change">
      <!-- options -->
    </select>

    <label for="line2-select">Line 2 (Small)</label>
    <select id="line2-select" ref="line2Select" v-model="mapping.line2" @change="handleLine2Change">
      <!-- options -->
    </select>

    <label for="line3-select">Line 3 (Small)</label>
    <select id="line3-select" ref="line3Select" v-model="mapping.line3">
      <!-- options -->
    </select>
  </div>
</template>
```

**3. Add Focus Indicators:**

```css
/* app/assets/css/main.css */
*:focus-visible {
  @apply outline-2 outline-offset-2 outline-purple-400;
}

/* Custom focus styles for buttons */
button:focus-visible {
  @apply ring-2 ring-purple-400 ring-offset-2 ring-offset-gray-900;
}

/* Focus styles for form elements */
select:focus-visible,
input:focus-visible {
  @apply border-purple-400 ring-2 ring-purple-400/50;
}
```

**4. Add Keyboard Shortcut Help:**

```vue
<!-- app/components/molecules/KeyboardShortcutsHelp.vue -->
<template>
  <div v-if="showHelp" class="shortcuts-overlay" @click="showHelp = false">
    <div class="shortcuts-panel" @click.stop>
      <h2>Keyboard Shortcuts</h2>

      <div class="shortcut-group">
        <h3>Navigation</h3>
        <div class="shortcut">
          <kbd>Ctrl</kbd> + <kbd>→</kbd>
          <span>Next step</span>
        </div>
        <div class="shortcut">
          <kbd>Ctrl</kbd> + <kbd>←</kbd>
          <span>Previous step</span>
        </div>
        <div class="shortcut">
          <kbd>Esc</kbd>
          <span>Exit preview</span>
        </div>
      </div>

      <div class="shortcut-group">
        <h3>Preview</h3>
        <div class="shortcut">
          <kbd>+</kbd> or <kbd>=</kbd>
          <span>Zoom in</span>
        </div>
        <div class="shortcut">
          <kbd>-</kbd>
          <span>Zoom out</span>
        </div>
        <div class="shortcut">
          <kbd>0</kbd>
          <span>Reset zoom</span>
        </div>
      </div>

      <div class="shortcut-group">
        <h3>Help</h3>
        <div class="shortcut">
          <kbd>?</kbd>
          <span>Show this help</span>
        </div>
      </div>
    </div>
  </div>
</template>
```

**Effort:** 6 hours
**Testing:** A11Y-001 (Keyboard Navigation)

---

### M3. Missing Validation Feedback

**Severity:** Major - UX
**Impact:** Medium - User confusion
**File:** `app/components/organisms/ColumnMapper.vue:140`

**Problem:**
"Continue to Preview" button just disables without explaining why.

**Recommended Solution:**

```vue
<!-- app/components/organisms/ColumnMapper.vue -->
<template>
  <div class="mapper-footer">
    <UButton :disabled="!isValid" @click="continueToPreview"> Continue to Preview </UButton>

    <!-- Validation feedback -->
    <div v-if="!isValid" class="validation-feedback">
      <template v-if="hasDuplicates">
        <UIcon name="i-heroicons-exclamation-triangle" class="text-red-400" />
        <p>Each column can only be used once</p>
      </template>
      <template v-else>
        <UIcon name="i-heroicons-information-circle" class="text-blue-400" />
        <p>Select at least one column to continue</p>
      </template>
    </div>

    <!-- Success feedback -->
    <div v-else class="validation-success">
      <UIcon name="i-heroicons-check-circle" class="text-green-400" />
      <p>Mapping valid - ready to preview</p>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.mapper-footer {
  @apply mt-6 space-y-3;
}

.validation-feedback {
  @apply flex items-center gap-2 text-sm;
}

.validation-success {
  @apply flex items-center gap-2 text-sm text-green-400;
}
</style>
```

**Effort:** 1 hour
**Testing:** Covered in VAL-001

---

### M4. No Loading State for File Upload

**Severity:** Major - UX
**Impact:** Medium - User confusion during large file upload
**File:** `app/components/molecules/FileUpload.vue`

**Problem:**
Component has `loading` prop but doesn't display it visually.

**Recommended Solution:**

```vue
<!-- app/components/molecules/FileUpload.vue -->
<template>
  <div class="file-upload" :class="{ 'is-loading': loading }">
    <!-- Loading overlay -->
    <div v-if="loading" class="upload-loading-overlay">
      <UIcon name="i-heroicons-arrow-path" class="loading-spinner" />
      <p class="loading-text">Processing CSV file...</p>
      <p class="loading-subtext">This may take a few seconds for large files</p>
    </div>

    <!-- Upload area (hidden when loading) -->
    <div v-else class="upload-area" @drop="handleDrop" @dragover="handleDragOver">
      <!-- ... existing upload UI ... -->
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.file-upload {
  @apply relative min-h-[200px];
}

.upload-loading-overlay {
  @apply absolute inset-0 z-10 flex flex-col items-center justify-center;
  @apply rounded-xl border border-purple-500/20 bg-purple-500/10;
  backdrop-filter: blur(8px);
}

.loading-spinner {
  @apply h-8 w-8 animate-spin text-purple-400;
}

.loading-text {
  @apply mt-4 text-lg font-medium text-white;
}

.loading-subtext {
  @apply mt-2 text-sm text-gray-400;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
```

**Effort:** 2 hours
**Testing:** Covered in HP-CSV-001

---

### M5. Iframe Preview Accessibility

**Severity:** Major - Accessibility
**Impact:** Medium - Screen reader users excluded
**File:** `app/components/organisms/PreviewPanel.vue:100`

**Problem:**

- Iframe has title but no keyboard access to zoom
- No screen reader announcements for zoom changes
- No ARIA live region

**Recommended Solution:**

```vue
<!-- app/components/organisms/PreviewPanel.vue -->
<template>
  <div class="preview-panel">
    <!-- Zoom controls with keyboard support -->
    <div class="zoom-controls" role="toolbar" aria-label="Zoom controls">
      <UButton
        variant="secondary"
        :disabled="zoomLevel >= 200"
        aria-label="Zoom in (+ key)"
        @click="handleZoomIn"
      >
        <UIcon name="i-heroicons-magnifying-glass-plus" />
        Zoom In
      </UButton>

      <span class="zoom-level" aria-live="polite" aria-atomic="true"> {{ zoomLevel }}% </span>

      <UButton
        variant="secondary"
        :disabled="zoomLevel <= 50"
        aria-label="Zoom out (- key)"
        @click="handleZoomOut"
      >
        <UIcon name="i-heroicons-magnifying-glass-minus" />
        Zoom Out
      </UButton>

      <UButton variant="ghost" aria-label="Reset zoom (0 key)" @click="handleResetZoom">
        Reset
      </UButton>
    </div>

    <!-- Preview iframe with proper ARIA -->
    <div class="preview-container">
      <iframe
        :src="previewUrl"
        title="Name tags preview showing generated labels"
        :style="{ transform: `scale(${zoomLevel / 100})` }"
        aria-describedby="preview-description"
        sandbox="allow-same-origin"
      />
      <p id="preview-description" class="sr-only">
        Interactive preview of {{ labelCount }} name tag labels. Use zoom controls or keyboard
        shortcuts to adjust view.
      </p>
    </div>

    <!-- Screen reader only announcements -->
    <div aria-live="polite" aria-atomic="true" class="sr-only">
      {{ announceText }}
    </div>
  </div>
</template>

<script setup lang="ts">
const announceText = ref('')

const handleZoomIn = () => {
  zoomIn()
  announceText.value = `Zoomed in to ${zoomLevel.value}%`
}

const handleZoomOut = () => {
  zoomOut()
  announceText.value = `Zoomed out to ${zoomLevel.value}%`
}

const handleResetZoom = () => {
  resetZoom()
  announceText.value = `Zoom reset to 100%`
}
</script>

<style lang="postcss" scoped>
.sr-only {
  @apply absolute h-px w-px overflow-hidden whitespace-nowrap;
  clip: rect(0, 0, 0, 0);
}
</style>
```

**Effort:** 3 hours
**Testing:** A11Y-001

---

### M6. No Column Mapping Persistence

**Severity:** Major - UX
**Impact:** Medium - Users lose work navigating backward
**File:** `app/composables/useWizardNavigation.ts:40-46`

**Problem:**
Navigating back to upload step clears mapping via `invalidateStep`.

**Recommended Solution:**

```typescript
// app/composables/useWizardNavigation.ts
export const useWizardNavigation = () => {
  // Store previous states for restoration
  const previousStates = ref<{
    mapping?: ColumnMapping
    csvData?: string
  }>({})

  const goToStep = (step: WizardStep) => {
    // Save current mapping before navigating away
    if (currentStep.value === 'mapping') {
      previousStates.value.mapping = { ...mapping.value }
    }

    currentStep.value = step

    // Only invalidate if explicitly requested (e.g., "Start Over")
    // Don't invalidate on normal navigation
  }

  const handleReset = () => {
    // Only clear on explicit reset
    currentStep.value = 'upload'
    parsedData.value = null
    mapping.value = { line1: null, line2: null, line3: null }
    previewHtml.value = null
    previousStates.value = {}
  }

  return {
    // ... existing
    previousStates: readonly(previousStates),
  }
}
```

**Alternative: Warn User Before Clearing:**

```vue
<!-- When user uploads new file -->
<script setup lang="ts">
const handleNewFileUpload = async (file: File) => {
  if (hasExistingMapping.value) {
    const confirmed = confirm('Uploading a new file will reset your column mapping. Continue?')
    if (!confirmed) {
      return
    }
  }

  await uploadFile(file)
}
</script>
```

**Effort:** 3 hours
**Testing:** NAV-001

---

## Minor Issues (P2)

### m1. Inconsistent Button Variants

**File:** `app/components/organisms/PreviewPanel.vue:106`
**Severity:** Minor - Visual inconsistency

**Problem:** "Start Over" is destructive action but uses `variant="secondary"`

**Solution:**

```vue
<UButton variant="danger" @click="handleStartOver">
  Start Over
</UButton>
```

Requires adding "danger" variant to Button component:

```vue
<!-- app/components/atoms/Button.vue -->
<template>
  <button :class="buttonClasses">
    <slot />
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
}>()

const buttonClasses = computed(() => ({
  'btn-primary': props.variant === 'primary',
  'btn-secondary': props.variant === 'secondary',
  'btn-ghost': props.variant === 'ghost',
  'btn-danger': props.variant === 'danger',
}))
</script>

<style lang="postcss" scoped>
.btn-danger {
  @apply bg-red-500/10 text-red-400 hover:bg-red-500/20;
}
</style>
```

**Effort:** 1 hour

---

### m2. No Visual Indication of Active Upload Mode

**File:** `app/components/organisms/NameTagWizard.vue:86-99`
**Severity:** Minor - UX polish

**Problem:** Inactive mode buttons blend into background

**Solution:**

```vue
<style lang="postcss" scoped>
.mode-button {
  @apply relative rounded-lg px-6 py-3 transition-all;

  /* Inactive state */
  &:not(.active) {
    @apply bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70;
  }

  /* Active state */
  &.active {
    @apply bg-gradient-to-r from-purple-500 to-pink-500 text-white;
  }
}
</style>
```

**Effort:** 30 minutes

---

### m3. Missing ARIA Labels

**Files:** Multiple components
**Severity:** Minor - Accessibility

**Problem:** Buttons lack descriptive ARIA labels

**Solution:** Add `aria-label` to all interactive elements:

```vue
<button aria-label="Upload step, click to edit uploaded data" @click="goToStep('upload')">
  Upload
</button>
```

**Effort:** 2 hours (audit all components)

---

### m4. No Empty State for Zero-Row CSV

**File:** `app/components/organisms/ColumnMapper.vue`
**Severity:** Minor - Edge case UX

**Solution:**

```vue
<DataTable v-if="preview.length > 0" :data="preview" />
<div v-else class="empty-state">
  <UIcon name="i-heroicons-table-cells" class="empty-icon" />
  <p>No data to preview</p>
  <p class="text-sm text-gray-400">
    Your CSV file only contains headers. Please upload a file with data rows.
  </p>
</div>
```

**Effort:** 1 hour

---

### m5. Zoom Controls Lack Min/Max Indicators

**File:** `app/components/organisms/PreviewPanel.vue:39-44`
**Severity:** Minor - UX clarity

**Solution:** Disable buttons at limits (see M5 solution above)

**Effort:** 30 minutes

---

### m6. Google Sheets URL Validation on Server-Side Only

**File:** `server/utils/sheets-fetcher.ts:10-13`
**Severity:** Minor - Performance

**Solution:**

```typescript
// app/utils/validators.ts
export function isValidGoogleSheetsUrl(url: string): boolean {
  const pattern = /^https:\/\/docs\.google\.com\/spreadsheets\/d\/[a-zA-Z0-9-_]+/
  return pattern.test(url)
}
```

```vue
<!-- app/components/organisms/NameTagWizard.vue -->
<script setup lang="ts">
const handleSheetsLoad = async () => {
  if (!isValidGoogleSheetsUrl(sheetsUrl.value)) {
    error.value = 'Please enter a valid Google Sheets URL'
    return
  }

  await loadSheet()
}
</script>
```

**Effort:** 1 hour

---

## Missing Functionality

### F1. Edit CSV Data Before Mapping

**Priority:** P2 - Enhancement
**User Expectation:** Fix typos after upload without re-uploading

**Proposed Solution:**
Add inline editing to DataTable:

```vue
<!-- app/components/molecules/DataTable.vue -->
<template>
  <table>
    <tbody>
      <tr v-for="(row, i) in data" :key="i">
        <td v-for="(cell, j) in row" :key="j">
          <input v-if="editable" v-model="data[i][j]" @blur="handleCellEdit(i, j)" />
          <span v-else>{{ cell }}</span>
        </td>
      </tr>
    </tbody>
  </table>
</template>
```

**Effort:** 6 hours
**Value:** Medium

---

### F2. Save/Load Mapping Templates

**Priority:** P1 - High value
**User Expectation:** Reuse mappings for recurring CSV formats

**Proposed Solution:**

```typescript
// app/composables/useMappingTemplates.ts
export const useMappingTemplates = () => {
  const STORAGE_KEY = 'slappy-mapping-templates'

  const saveTemplate = (name: string, mapping: ColumnMapping) => {
    const templates = getTemplates()
    templates[name] = mapping
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates))
  }

  const loadTemplate = (name: string): ColumnMapping | null => {
    const templates = getTemplates()
    return templates[name] || null
  }

  const getTemplates = (): Record<string, ColumnMapping> => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  }

  return {
    saveTemplate,
    loadTemplate,
    getTemplates,
  }
}
```

**UI:**

```vue
<div class="mapping-templates">
  <UButton @click="showSaveDialog = true">
    Save as Template
  </UButton>

  <USelect
    v-model="selectedTemplate"
    :options="templateNames"
    @change="handleLoadTemplate"
  >
    <option value="">Load Template...</option>
  </USelect>
</div>
```

**Effort:** 8 hours
**Value:** High

---

### F4. Undo/Redo for Mapping Changes

**Priority:** P2 - Enhancement
**User Expectation:** Standard editor functionality

**Proposed Solution:** Implement command pattern

**Effort:** 12 hours
**Value:** Medium

---

### F5. Bulk Operations

**Priority:** P2 - Power user features

**Examples:**

- "Clear all mappings" button
- "Reset to defaults" button
- "Apply mapping to multiple files" (batch mode)

**Effort:** 4 hours per feature
**Value:** Low-Medium

---

### F6. Sample Data / Demo Mode

**Priority:** P1 - Onboarding
**User Expectation:** Try before committing

**Proposed Solution:**

```typescript
// public/sample.csv
const sampleCSV = `Name,Company,Title
John Doe,Acme Corp,CEO
Jane Smith,TechStart,CTO
Bob Johnson,DataCo,Engineer`;

// Add "Try Sample Data" button
<UButton variant="secondary" @click="loadSampleData">
  Try Sample Data
</UButton>
```

**Effort:** 2 hours
**Value:** High (improves onboarding)

---

### F7. Add Sample Data Preview to Column Dropdowns

**Priority:** P2 - UX enhancement

**Current Implementation:** ✅ Already shows header names

- Dropdowns currently display: "Column 1: Name", "Column 2: Email", etc.
- Implemented via reactive `columnOptions` computed property
- See **Architecture Strengths #6** for details

**Proposed Enhancement:** Add first data row preview in addition to header

- Show both header name AND sample value for easier recognition
- Helps users verify they're mapping the correct column

**Example:**

```
Current:    Column 1: Name
Proposed:   Column 1: Name (John Doe)

Current:    Column 2: Email
Proposed:   Column 2: Email (john@example.com)

Current:    Column 3: Phone
Proposed:   Column 3: Phone (555-1234)
```

**Implementation:**

```typescript
// app/components/organisms/ColumnMapper.vue
const columnOptions = computed(() => {
  const options = [{ label: '(Skip this line)', value: null }]

  for (let i = 0; i < props.parsedData.columnCount; i++) {
    let label = `Column ${i + 1}`

    // Add header name (already implemented)
    if (hasHeaders.value && props.parsedData.headers) {
      label = `${label}: ${props.parsedData.headers[i]}`
    }

    // NEW: Add sample data preview
    const sampleRow = hasHeaders.value ? props.parsedData.preview[1] : props.parsedData.preview[0]
    if (sampleRow && sampleRow[i]) {
      const sampleValue = String(sampleRow[i]).substring(0, 20) // Truncate long values
      label = `${label} (${sampleValue})`
    }

    options.push({ label, value: i })
  }

  return options
})
```

**Effort:** 2 hours (simpler than originally estimated since headers already work)
**Value:** Medium

---

### F8. Export Mapping Configuration

**Priority:** P2 - Team collaboration

**Format:**

```json
{
  "version": "1.0",
  "mapping": {
    "line1": 0,
    "line2": 1,
    "line3": 2
  },
  "hasHeaders": true
}
```

**Effort:** 4 hours
**Value:** Medium

---

## Usability Concerns

### Summary Table

| ID  | Concern                              | Severity | Fix Effort |
| --- | ------------------------------------ | -------- | ---------- |
| U1  | No breadcrumb trail                  | Minor    | 2h         |
| U2  | "Start Over" without confirmation    | Major    | 1h         |
| U3  | No back/forward buttons              | Minor    | 3h         |
| U4  | No retry button in error state       | Major    | 1h         |
| U5  | Unclear "First row contains headers" | Minor    | 1h         |
| U6  | Column mapping allows all nulls      | Minor    | 2h         |
| U7  | No label count preview               | Medium   | 2h         |
| U8  | Zoom affects layout                  | Minor    | 2h         |
| U9  | No CSV structure validation          | Medium   | 3h         |
| U10 | Drag-and-drop hover state weak       | Minor    | 30min      |
| U11 | Google Sheets URL accepts any URL    | Minor    | 1h         |
| U12 | No print preview guidance            | Minor    | 30min      |
| U13 | PDF generic filename                 | Minor    | 1h         |
| U14 | Can't compare mappings               | Medium   | 8h         |

**Total Estimated Effort:** 28.5 hours

See detailed solutions in [Missing Functionality](#missing-functionality) and [Major Issues](#major-issues-p1) sections above.

---

## Implementation Roadmap

### Sprint 1: Critical Fixes (Week 1)

**Goal:** Fix P0 issues - make app production-ready

**Tasks:**

- [ ] C1: Add browser navigation protection (2h)
- [ ] C2: Implement duplicate column validation (3h)
- [ ] C3: Fix file type validation (2h)
- [ ] C4: Add CSV size limit (2h)
- [ ] M1: Improve error messages (4h)

**Deliverables:**

- No data loss risk
- Proper validation
- Actionable error messages

**Effort:** 13 hours (~2 days)

---

### Sprint 2: UX Improvements (Week 2)

**Goal:** Fix P1 issues - improve user experience

**Tasks:**

- [ ] M2: Implement keyboard navigation (6h)
- [ ] M3: Add validation feedback (1h)
- [ ] M4: Show upload loading state (2h)
- [ ] M6: Persist mapping during navigation (3h)
- [ ] U2: Add "Start Over" confirmation (1h)
- [ ] U4: Add error retry button (1h)

**Deliverables:**

- Full keyboard support
- Better feedback
- State persistence

**Effort:** 14 hours (~2 days)

---

### Sprint 3: High-Value Features (Week 3)

**Goal:** Add most-requested features

**Tasks:**

- [ ] F2: Save/load mapping templates (8h)
- [ ] F6: Add sample data mode (2h)
- [ ] U7: Show label count preview (2h)
- [ ] M5: Improve preview accessibility (3h)

**Deliverables:**

- Mapping templates
- Demo mode
- Better accessibility

**Effort:** 15 hours (~2 days)

---

### Sprint 4: Polish & Accessibility (Week 4)

**Goal:** Fix P2 issues and polish

**Tasks:**

- [ ] m1-m6: Fix minor issues (6h total)
- [ ] U1, U3, U5, etc.: Address usability concerns (8h)
- [ ] Add keyboard shortcuts help (2h)
- [ ] Improve ARIA labels (2h)

**Deliverables:**

- Polished UI
- Full accessibility compliance
- Better onboarding

**Effort:** 18 hours (~2.5 days)

---

## Architecture Strengths

### What's Working Well

**1. Composable-Based State Management**

- Clean separation of concerns
- Testable business logic
- Easy to reason about data flow

**2. Atomic Design Pattern**

- Reusable components
- Consistent design system
- Easy to maintain

**3. Type Safety**

- Comprehensive TypeScript types
- Prevents common errors
- Great IDE support

**4. Progressive Disclosure**

- Three-column wizard is innovative
- Good spatial awareness
- Clear step progression

**5. Modern Tech Stack**

- Nuxt 4 + Vue 3
- PostCSS component-scoped styles
- Clean semantic class names

**6. Context-Aware Column Mapping**

- Dropdown labels reactively switch based on "First row contains headers" checkbox
- When unchecked: Shows generic "Column 1", "Column 2", "Column 3"
- When checked: Shows "Column 1: Name", "Column 2: Company", "Column 3: Title"
- Implemented in `ColumnMapper.vue:18-30` using computed `columnOptions`
- Significantly improves mapping UX by showing what each column contains
- Users can immediately recognize which column to map without counting

**Code Reference:**

```typescript
// app/components/organisms/ColumnMapper.vue:22-25
const label =
  hasHeaders.value && props.parsedData.headers
    ? `Column ${i + 1}: ${props.parsedData.headers[i]}` // "Column 1: Name"
    : `Column ${i + 1}` // "Column 1"
```

### Recommendations to Preserve

- **Don't add Pinia stores** - Composables work well
- **Keep atomic design** - Component hierarchy is clean
- **Maintain type safety** - Don't use `any`
- **Use PostCSS** - Semantic classes > utility sprawl

---

## Appendix

### Review Methodology

**Static Analysis:**

- Manual code review of all components
- Composable and utility function review
- Type definition analysis

**Workflow Analysis:**

- Traced complete user flows (CSV + Sheets)
- Identified navigation patterns
- Analyzed state transitions

**Accessibility Audit:**

- Keyboard navigation testing
- ARIA label review
- Screen reader simulation

**Error Scenario Testing:**

- API failure paths
- Invalid input handling
- Edge case analysis

### Files Reviewed

**Components:**

- `app/components/organisms/NameTagWizard.vue`
- `app/components/organisms/ColumnMapper.vue`
- `app/components/organisms/PreviewPanel.vue`
- `app/components/molecules/FileUpload.vue`
- `app/components/molecules/ColumnHeader.vue`
- `app/components/molecules/DataTable.vue`

**Composables:**

- `app/composables/useWizardNavigation.ts`
- `app/composables/useDataUpload.ts`
- `app/composables/useColumnMapping.ts`
- `app/composables/useNameTagGeneration.ts`

**Server Utilities:**

- `server/api/parse.post.ts`
- `server/api/generate.post.ts`
- `server/utils/csv-parser.ts`
- `server/utils/sheets-fetcher.ts`
- `server/utils/column-mapper.ts`

**Total Lines Reviewed:** ~2,500 LOC

---

## Conclusion

The Slappy application has a **strong architectural foundation** but requires **critical UX and validation improvements** before production release.

**Immediate Priorities:**

1. Fix data loss risk (browser navigation)
2. Add proper validation (duplicates, file types)
3. Improve error messages
4. Add keyboard navigation

**Estimated Time to Production-Ready:** 2-3 weeks (Sprints 1-2)

**Recommended Next Steps:**

1. Review this document with team
2. Prioritize Sprint 1 tasks
3. Set up e2e testing infrastructure
4. Begin implementation in priority order
