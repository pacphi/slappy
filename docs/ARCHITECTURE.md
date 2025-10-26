# Architecture

This document describes the technical architecture, design decisions, and implementation details of the Slappy Nuxt application.

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Shared Core Architecture](#shared-core-architecture)
- [Web Application Architecture](#web-application-architecture)
  - [Three-Step Wizard Flow](#three-step-wizard-flow)
  - [State Management](#state-management)
  - [Component Architecture](#component-architecture)
  - [Server API Routes](#server-api-routes)
- [CLI Architecture](#cli-architecture)
- [Data Flow](#data-flow)
- [Key Algorithms](#key-algorithms)
- [CSS Architecture](#css-architecture)
- [Design Decisions](#design-decisions)
- [Performance Considerations](#performance-considerations)

## Overview

Slappy is a **full-stack TypeScript application** built with **Nuxt 4** and **Vue 3** that generates print-ready name tags in TownStix US-10 format (4" × 2" labels, 2 columns × 5 rows = 10 labels per sheet).

**Two interfaces to one implementation:**

1. **Nuxt Web Application** - Modern Vue 3 UI with file upload, column mapping, and live preview
2. **CLI Tool** - Command-line interface for automation and scripting with Google Sheets support

**Architecture type**: Shared-core architecture with `lib/` containing all runtime-agnostic business logic

**Runtime**: Node.js 20+ with Nuxt 4 (Nitro server)

**Package Manager**: pnpm (enforced via `packageManager` field)

**Build system**: Nuxt 4 with Nitro for web app, tsx for CLI execution

## Technology Stack

### Frontend (Web App)

| Technology      | Version | Purpose                                |
| --------------- | ------- | -------------------------------------- |
| **Nuxt**        | 4.2.0+  | Vue meta-framework with server support |
| **Vue**         | 3.5.22+ | Progressive JavaScript framework       |
| **TypeScript**  | 5.x     | Type-safe development                  |
| **@nuxt/ui**    | 4.1.0+  | Tailwind CSS-based component library   |
| **Pinia**       | Latest  | State management (via composables)     |
| **Tailwind CSS** | 3.x     | Utility-first CSS (via @nuxt/ui)       |

### Backend (Server)

| Technology            | Version | Purpose                            |
| --------------------- | ------- | ---------------------------------- |
| **Nitro**             | 2.x     | Nuxt server engine                 |
| **Node.js**           | 20.0.0+ | Runtime environment                |
| **Puppeteer**         | 24.26+  | Headless Chrome for PDF generation |
| **H3**                | Latest  | HTTP server framework (via Nitro)  |
| **Nuxt Server Utils** | -       | Server-side utilities              |

### Shared Core (lib/)

Runtime-agnostic business logic used by both web and CLI:

| Module                | Purpose                                    |
| --------------------- | ------------------------------------------ |
| **types.ts**          | Shared TypeScript interfaces               |
| **csv-parser.ts**     | CSV parsing with quote handling            |
| **column-mapper.ts**  | Apply column mapping to parsed data        |
| **html-generator.ts** | HTML generation with TownStix US-10 layout |
| **pdf-generator.ts**  | PDF generation using Puppeteer             |
| **sheets-fetcher.ts** | Google Sheets CSV fetching                 |
| **data-parser.ts**    | Raw data extraction & column detection     |

### CLI Tools

| Module                    | Purpose                               |
| ------------------------- | ------------------------------------- |
| **cli/nametag-generator.ts** | Main CLI with Google Sheets support   |
| **cli/test-local.ts**     | Local CSV testing utility             |
| **tsx**                   | TypeScript execution for CLI          |

### Development Tools

| Tool         | Purpose                      |
| ------------ | ---------------------------- |
| **pnpm**     | Package management           |
| **ESLint**   | Code linting (@nuxt/eslint)  |
| **Prettier** | Code formatting              |
| **Knip**     | Dead code detection          |

### Key APIs Used

- **`fetch()`** - Google Sheets CSV export, API requests
- **`fs`** - File system operations (CLI only)
- **`Buffer`** - PDF binary data handling
- **Puppeteer** - Headless Chrome for HTML → PDF conversion
- **H3** - HTTP utilities for Nuxt server

## Project Structure

```text
slappy/
├── app/                            # Nuxt application
│   ├── components/                 # Vue components (atomic design)
│   │   ├── atoms/                  # Basic building blocks
│   │   │   ├── Card.vue           # Glass morphism card
│   │   │   ├── ContentBox.vue     # Inner content container
│   │   │   ├── Button.vue         # Button component
│   │   │   └── Badge.vue          # Badge component
│   │   ├── molecules/             # Composite components
│   │   │   ├── FeatureCard.vue    # Feature display card
│   │   │   ├── FileUpload.vue     # Drag-and-drop upload
│   │   │   ├── ProgressIndicator.vue # Wizard progress
│   │   │   └── DataTable.vue      # Data preview table
│   │   └── organisms/             # Complex components
│   │       ├── NameTagWizard.vue  # Main wizard orchestrator
│   │       ├── ColumnMapper.vue   # Column mapping interface
│   │       ├── PreviewPanel.vue   # HTML preview with zoom
│   │       ├── HeroSection.vue    # Landing page hero
│   │       └── AppHeader.vue      # Header with theme toggle
│   ├── composables/               # State management
│   │   ├── useWizardNavigation.ts # Step transitions
│   │   ├── useDataUpload.ts       # Upload & parsing state
│   │   ├── useColumnMapping.ts    # Column mapping state
│   │   └── useNameTagGeneration.ts # Generation state
│   ├── assets/
│   │   └── css/
│   │       └── main.css           # Global styles (Plus Jakarta Sans)
│   ├── app.vue                    # Root component
│   └── pages/
│       └── index.vue              # Main page
├── server/                        # Nuxt server (Nitro)
│   ├── api/                       # API routes
│   │   ├── parse.post.ts          # Parse CSV/Sheets endpoint
│   │   └── generate.post.ts       # Generate name tags endpoint
│   └── utils/                     # Server utilities (re-exports from lib/)
│       ├── _types.ts              # Re-export types
│       ├── csv-parser.ts          # Re-export CSV parser
│       ├── column-mapper.ts       # Re-export column mapper
│       ├── html-generator.ts      # Re-export HTML generator
│       ├── pdf-generator.ts       # Re-export PDF generator
│       ├── sheets-fetcher.ts      # Re-export sheets fetcher
│       └── data-parser.ts         # Re-export data parser
├── lib/                           # Shared business logic (runtime-agnostic)
│   ├── types.ts                   # Core type definitions
│   ├── csv-parser.ts              # CSV parsing logic
│   ├── column-mapper.ts           # Column mapping logic
│   ├── html-generator.ts          # HTML generation
│   ├── pdf-generator.ts           # PDF generation
│   ├── sheets-fetcher.ts          # Google Sheets integration
│   └── data-parser.ts             # Data parsing utilities
├── cli/                           # CLI tools
│   ├── nametag-generator.ts       # Main CLI with Google Sheets support
│   └── test-local.ts              # Local CSV testing
├── types/                         # Global type definitions
│   └── index.d.ts                 # Exported types for app
├── public/                        # Static assets
├── sample/                        # Sample data files
│   ├── sample-roster.csv          # Example CSV data
│   └── README.md                  # Sample usage guide
├── docs/                          # Documentation
├── nuxt.config.ts                 # Nuxt configuration
├── app.config.ts                  # UI theme configuration
├── tailwind.config.ts             # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript configuration
├── eslint.config.mjs              # ESLint configuration
├── package.json                   # Package manifest (pnpm)
├── Dockerfile                     # Docker production build
├── docker-compose.yml             # Docker compose configuration
└── fly.toml                       # Fly.io deployment config
```

## Shared Core Architecture

The application uses a **shared-core architecture** where all business logic resides in `lib/`, making it:

- **Runtime-agnostic**: Can run in Nuxt server, CLI, or any Node.js environment
- **DRY (Don't Repeat Yourself)**: Single source of truth for algorithms
- **Testable**: Business logic isolated from framework code
- **Portable**: Easy to adapt to other frameworks or runtimes

### Shared Core Flow

```
┌─────────────────────────────────────────────┐
│            lib/ (Shared Core)               │
│  Runtime-agnostic TypeScript business logic │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ types.ts                            │   │
│  │ csv-parser.ts                       │   │
│  │ column-mapper.ts                    │   │
│  │ html-generator.ts                   │   │
│  │ pdf-generator.ts                    │   │
│  │ sheets-fetcher.ts                   │   │
│  │ data-parser.ts                      │   │
│  └─────────────────────────────────────┘   │
└──────────────┬───────────────┬──────────────┘
               │               │
       ┌───────┴───────┐   ┌──┴──────┐
       │               │   │         │
       ▼               ▼   ▼         ▼
┌─────────────┐   ┌─────────────┐   ┌──────────┐
│ server/utils│   │ cli/        │   │ Future   │
│ (Nuxt)      │   │ (Direct)    │   │ Runtimes │
│             │   │             │   │          │
│ Re-exports  │   │ Imports     │   │ Can      │
│ from lib/   │   │ from lib/   │   │ Import   │
│ with ~/     │   │ with ../    │   │ lib/     │
└──────┬──────┘   └──────┬──────┘   └──────────┘
       │                 │
       ▼                 ▼
┌─────────────┐   ┌─────────────┐
│ Nuxt Web App│   │ CLI Tool    │
│             │   │             │
│ Multi-step  │   │ Direct      │
│ Wizard UI   │   │ Execution   │
└─────────────┘   └─────────────┘
```

### Benefits of Shared Core

1. **Consistency**: Same algorithms produce identical output in web and CLI
2. **Maintainability**: Bug fixes and features update both interfaces automatically
3. **Testing**: Test business logic once, applies to all interfaces
4. **Performance**: No duplication, smaller bundle sizes
5. **Portability**: Easy to add new interfaces (e.g., Electron app, mobile app)

## Web Application Architecture

The Nuxt web application provides a user-friendly interface for non-technical users to generate name tags through a guided wizard.

### Three-Step Wizard Flow

```
┌──────────────────────────────────────────────────────────────┐
│                     User Journey                              │
└──────────────────────────────────────────────────────────────┘

Step 1: Upload                 Step 2: Mapping               Step 3: Preview
┌─────────────────┐           ┌─────────────────┐          ┌─────────────────┐
│  CSV Upload     │           │  Column         │          │  Preview        │
│  or             │──────────▶│  Mapping        │─────────▶│  & Download     │
│  Google Sheets  │           │  Interface      │          │  (HTML/PDF)     │
└─────────────────┘           └─────────────────┘          └─────────────────┘
       │                             │                            │
       │                             │                            │
       ▼                             ▼                            ▼
┌─────────────────┐           ┌─────────────────┐          ┌─────────────────┐
│ useDataUpload() │           │useColumnMapping │          │useNameTag       │
│                 │           │                 │          │Generation()     │
│ - File/URL      │           │ - Column        │          │                 │
│ - API call      │           │   selection     │          │ - HTML preview  │
│ - Parse CSV     │           │ - Preview data  │          │ - PDF export    │
│ - Store data    │           │ - Save mapping  │          │ - Print         │
└─────────────────┘           └─────────────────┘          └─────────────────┘
       │                             │                            │
       └─────────────┬───────────────┴────────────────────────────┘
                     │
                     ▼
           ┌──────────────────┐
           │ server/api/      │
           │                  │
           │ - parse.post.ts  │
           │ - generate.post.ts
           └──────────────────┘
                     │
                     ▼
           ┌──────────────────┐
           │ lib/ (core logic)│
           └──────────────────┘
```

### State Management

The application uses **Vue 3 Composables** (not Pinia stores) for state management:

#### useWizardNavigation()

Controls wizard step progression:

```typescript
export function useWizardNavigation() {
  const currentStep = ref<WizardStep>('upload')

  function goToMapping() {
    currentStep.value = 'mapping'
  }

  function goToPreview() {
    currentStep.value = 'preview'
  }

  function goBack() {
    if (currentStep.value === 'preview') currentStep.value = 'mapping'
    else if (currentStep.value === 'mapping') currentStep.value = 'upload'
  }

  return {
    currentStep: readonly(currentStep),
    goToMapping,
    goToPreview,
    goBack,
  }
}
```

#### useDataUpload()

Manages uploaded CSV data:

```typescript
export function useDataUpload() {
  const parsedData = ref<ParsedData | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function uploadFile(file: File) {
    // Upload and parse CSV file
  }

  async function fetchGoogleSheet(url: string) {
    // Fetch and parse Google Sheets
  }

  return {
    parsedData: readonly(parsedData),
    isLoading: readonly(isLoading),
    error: readonly(error),
    uploadFile,
    fetchGoogleSheet,
    clear,
  }
}
```

#### useColumnMapping()

Handles column-to-line mapping:

```typescript
export function useColumnMapping() {
  const mapping = ref<ColumnMapping>({
    line1: 0,
    line2: 1,
    line3: 2,
  })
  const hasHeaders = ref(false)

  function setMapping(newMapping: ColumnMapping) {
    mapping.value = newMapping
  }

  function toggleHeaders() {
    hasHeaders.value = !hasHeaders.value
  }

  return {
    mapping: readonly(mapping),
    hasHeaders: readonly(hasHeaders),
    setMapping,
    toggleHeaders,
  }
}
```

#### useNameTagGeneration()

Manages tag generation and download:

```typescript
export function useNameTagGeneration() {
  const htmlContent = ref<string>('')
  const isGenerating = ref(false)

  async function generateHTML() {
    // Call server API to generate HTML
  }

  async function generatePDF() {
    // Call server API to generate PDF
  }

  function downloadHTML() {
    // Download HTML file
  }

  return {
    htmlContent: readonly(htmlContent),
    isGenerating: readonly(isGenerating),
    generateHTML,
    generatePDF,
    downloadHTML,
  }
}
```

### Component Architecture

The application follows **Atomic Design** principles:

#### Atoms (app/components/atoms/)

Basic building blocks with single responsibility:

- **Card.vue** - Glassmorphism card with backdrop blur
- **ContentBox.vue** - Inner content container
- **Button.vue** - Button with loading state
- **Badge.vue** - Status/info badge

Example: `Card.vue`

```vue
<template>
  <div class="glass-card">
    <slot />
  </div>
</template>

<style lang="postcss" scoped>
.glass-card {
  @apply relative overflow-hidden rounded-xl border;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border-color: rgba(255, 255, 255, 0.1);
}

/* Dark mode support via @nuxt/ui */
.dark .glass-card {
  background: rgba(0, 0, 0, 0.3);
}
</style>
```

#### Molecules (app/components/molecules/)

Combinations of atoms with specific purpose:

- **FeatureCard.vue** - Icon + title + description
- **FileUpload.vue** - Drag-and-drop upload zone
- **ProgressIndicator.vue** - Wizard step progress
- **DataTable.vue** - Data preview table

Example: `FileUpload.vue`

```vue
<template>
  <ContentBox>
    <div
      class="upload-zone"
      :class="{ 'upload-zone--active': isDragging }"
      @drop.prevent="handleDrop"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
    >
      <UIcon name="i-heroicons-arrow-up-tray" class="upload-icon" />
      <p>Drag CSV file here or click to browse</p>
      <input
        ref="fileInput"
        type="file"
        accept=".csv"
        @change="handleFileSelect"
        class="hidden"
      />
    </div>
  </ContentBox>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  upload: [file: File]
}>()

const isDragging = ref(false)
const fileInput = ref<HTMLInputElement>()

function handleDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file && file.type === 'text/csv') {
    emit('upload', file)
  }
}

function handleFileSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    emit('upload', file)
  }
}
</script>
```

#### Organisms (app/components/organisms/)

Complex components composed of molecules and atoms:

- **NameTagWizard.vue** - Main wizard orchestrator
- **ColumnMapper.vue** - Column mapping interface
- **PreviewPanel.vue** - Preview with zoom controls
- **HeroSection.vue** - Landing page hero
- **AppHeader.vue** - Header with theme toggle

Example: `NameTagWizard.vue`

```vue
<template>
  <Card>
    <ProgressIndicator
      :steps="steps"
      :current-step="currentStep"
    />

    <!-- Step 1: Upload -->
    <div v-if="currentStep === 'upload'">
      <FileUpload @upload="handleUpload" />
      <GoogleSheetsInput @submit="handleGoogleSheets" />
    </div>

    <!-- Step 2: Mapping -->
    <div v-else-if="currentStep === 'mapping'">
      <ColumnMapper
        :parsed-data="parsedData"
        :mapping="mapping"
        @update:mapping="setMapping"
        @continue="goToPreview"
      />
    </div>

    <!-- Step 3: Preview -->
    <div v-else-if="currentStep === 'preview'">
      <PreviewPanel
        :html-content="htmlContent"
        @download-html="downloadHTML"
        @download-pdf="downloadPDF"
      />
    </div>
  </Card>
</template>

<script setup lang="ts">
const { currentStep, goToMapping, goToPreview } = useWizardNavigation()
const { parsedData, uploadFile, fetchGoogleSheet } = useDataUpload()
const { mapping, setMapping } = useColumnMapping()
const { htmlContent, generateHTML, generatePDF, downloadHTML } = useNameTagGeneration()

async function handleUpload(file: File) {
  await uploadFile(file)
  goToMapping()
}

async function handleGoogleSheets(url: string) {
  await fetchGoogleSheet(url)
  goToMapping()
}

async function downloadPDF() {
  await generatePDF()
}
</script>
```

### Server API Routes

The Nuxt server provides two main API endpoints using **H3** (Nitro's HTTP framework):

#### `/api/parse` (POST)

Parses uploaded CSV file or Google Sheets URL:

**Input:**
- Multipart form data with CSV file, OR
- JSON with Google Sheets URL

**Output:**
```typescript
{
  columns: string[][],      // All rows as column arrays
  headers?: string[],        // Column names if hasHeaders=true
  columnCount: number,       // Number of columns
  rowCount: number,          // Number of data rows
  preview: string[][]        // First 5 rows for preview
}
```

**Implementation:**

```typescript
// server/api/parse.post.ts
import { parseRawData } from '~/lib/data-parser'
import { fetchGoogleSheetAsCSV, parseGoogleSheetsUrl } from '~/lib/sheets-fetcher'

export default defineEventHandler(async (event) => {
  const contentType = getHeader(event, 'content-type')

  let csvContent: string
  let hasHeaders = false

  if (contentType?.includes('multipart/form-data')) {
    // File upload
    const formData = await readMultipartFormData(event)
    const file = formData?.find(f => f.name === 'file')
    const headersField = formData?.find(f => f.name === 'hasHeaders')

    if (!file) {
      throw createError({ statusCode: 400, message: 'No file provided' })
    }

    csvContent = file.data.toString('utf-8')
    hasHeaders = headersField?.data.toString() === 'true'
  } else {
    // Google Sheets URL
    const body = await readBody(event)
    const { url, hasHeaders: headers } = body

    const { spreadsheetId, gid } = parseGoogleSheetsUrl(url)
    csvContent = await fetchGoogleSheetAsCSV(spreadsheetId, gid)
    hasHeaders = headers
  }

  const parsedData = parseRawData(csvContent, hasHeaders)
  return parsedData
})
```

#### `/api/generate` (POST)

Generates name tags with column mapping:

**Input:**
```typescript
{
  csvContent: string,
  mapping: ColumnMapping,
  hasHeaders: boolean,
  format: 'html' | 'pdf'
}
```

**Output:**
- HTML string (if format='html')
- PDF binary (if format='pdf')

**Implementation:**

```typescript
// server/api/generate.post.ts
import { parseCSVToPagesWithMapping } from '~/lib/column-mapper'
import { generateNameTagsHTML } from '~/lib/html-generator'
import { generatePDF } from '~/lib/pdf-generator'

export default defineEventHandler(async (event) => {
  const { csvContent, mapping, hasHeaders, format } = await readBody(event)

  // Parse CSV with column mapping
  const pages = parseCSVToPagesWithMapping(csvContent, mapping, hasHeaders)

  // Generate HTML
  const html = generateNameTagsHTML(pages)

  if (format === 'pdf') {
    // Generate PDF buffer
    const pdfBuffer = await generatePDF(html)

    // Set PDF headers
    setHeader(event, 'Content-Type', 'application/pdf')
    setHeader(event, 'Content-Disposition', 'attachment; filename="name-tags.pdf"')

    return pdfBuffer
  } else {
    // Return HTML
    setHeader(event, 'Content-Type', 'text/html')
    return html
  }
})
```

## CLI Architecture

The CLI tools provide command-line access to the same functionality, using the shared `lib/` core.

### Main CLI (cli/nametag-generator.ts)

```typescript
import { fetchGoogleSheetAsCSV } from '../lib/sheets-fetcher'
import { parseCSVToPagesWithMapping, getDefaultMapping } from '../lib/column-mapper'
import { generateNameTagsHTML } from '../lib/html-generator'
import { generatePDFFile } from '../lib/pdf-generator'

export async function generateNameTags(
  spreadsheetId: string,
  gid: string,
  outputPath?: string,
  options: GenerateOptions = {}
): Promise<void> {
  const { mapping, hasHeaders = false, format = 'html' } = options
  const finalOutputPath = outputPath || `./name-tags.${format}`

  // 1. Fetch CSV from Google Sheets
  const csvContent = await fetchGoogleSheetAsCSV(spreadsheetId, gid)

  // 2. Parse with column mapping
  const pages = parseCSVToPagesWithMapping(csvContent, mapping || getDefaultMapping(), hasHeaders)

  // 3. Generate HTML
  const html = generateNameTagsHTML(pages)

  // 4. Output as HTML or PDF
  if (format === 'pdf') {
    await generatePDFFile(html, finalOutputPath)
  } else {
    fs.writeFileSync(finalOutputPath, html, 'utf-8')
  }
}
```

**CLI Entry Point:**

```typescript
// Command-line argument parsing
if (require.main === module) {
  const args = process.argv.slice(2)
  // Parse flags: --line1-col=N, --line2-col=N, --line3-col=N, --has-headers, --format=pdf
  // Execute generateNameTags()
}
```

### Test Utility (cli/test-local.ts)

```typescript
import { parseCSVToPages } from '../lib/csv-parser'
import { generateNameTagsHTML } from '../lib/html-generator'

async function testWithLocalFile(csvFilePath: string) {
  const csvContent = fs.readFileSync(csvFilePath, 'utf-8')
  const pages = parseCSVToPages(csvContent)
  const html = generateNameTagsHTML(pages)
  const outputPath = csvFilePath.replace(/\.csv$/i, '-tags.html')
  fs.writeFileSync(outputPath, html, 'utf-8')
}
```

**Usage:**

```bash
pnpm test:local                        # Uses sample/sample-roster.csv
pnpm test:local path/to/custom.csv     # Uses custom CSV file
```

## Data Flow

### Web Application Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interaction                          │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
         ┌──────────────────────────────────────┐
         │  Step 1: Upload                      │
         │  ┌────────────────────────────────┐  │
         │  │ FileUpload.vue OR              │  │
         │  │ GoogleSheetsInput.vue          │  │
         │  └────────────────────────────────┘  │
         │             │                         │
         │             ▼                         │
         │  ┌────────────────────────────────┐  │
         │  │ useDataUpload()                │  │
         │  │ - Validate input               │  │
         │  │ - Call /api/parse              │  │
         │  └────────────────────────────────┘  │
         └───────────────┬──────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────────────┐
         │  Server: /api/parse.post.ts           │
         │  ┌──────────────────────────────────┐ │
         │  │ 1. Receive CSV or Sheets URL     │ │
         │  │ 2. Call lib/sheets-fetcher       │ │
         │  │ 3. Call lib/data-parser          │ │
         │  │ 4. Return ParsedData             │ │
         │  └──────────────────────────────────┘ │
         └───────────────┬───────────────────────┘
                         │
                         ▼
         ┌──────────────────────────────────────┐
         │  Step 2: Mapping                     │
         │  ┌────────────────────────────────┐  │
         │  │ ColumnMapper.vue               │  │
         │  │ - Display preview table        │  │
         │  │ - Dropdowns for line1/2/3      │  │
         │  │ - "Has Headers" checkbox       │  │
         │  └────────────────────────────────┘  │
         │             │                         │
         │             ▼                         │
         │  ┌────────────────────────────────┐  │
         │  │ useColumnMapping()             │  │
         │  │ - Store mapping                │  │
         │  │ - Store hasHeaders flag        │  │
         │  └────────────────────────────────┘  │
         └───────────────┬──────────────────────┘
                         │
                         ▼
         ┌──────────────────────────────────────┐
         │  Step 3: Preview                     │
         │  ┌────────────────────────────────┐  │
         │  │ PreviewPanel.vue               │  │
         │  │ - Display HTML in iframe       │  │
         │  │ - Zoom controls                │  │
         │  │ - Download HTML/PDF buttons    │  │
         │  └────────────────────────────────┘  │
         │             │                         │
         │             ▼                         │
         │  ┌────────────────────────────────┐  │
         │  │ useNameTagGeneration()         │  │
         │  │ - Call /api/generate           │  │
         │  │ - Handle download              │  │
         │  └────────────────────────────────┘  │
         └───────────────┬──────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────────────┐
         │  Server: /api/generate.post.ts        │
         │  ┌──────────────────────────────────┐ │
         │  │ 1. Receive CSV + mapping         │ │
         │  │ 2. Call lib/column-mapper        │ │
         │  │ 3. Call lib/html-generator       │ │
         │  │ 4. (Optional) lib/pdf-generator  │ │
         │  │ 5. Return HTML or PDF binary     │ │
         │  └──────────────────────────────────┘ │
         └───────────────┬───────────────────────┘
                         │
                         ▼
         ┌──────────────────────────────────────┐
         │  User receives:                      │
         │  - HTML file (browser download) OR   │
         │  - PDF file (browser download)       │
         └──────────────────────────────────────┘
```

### CLI Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Command Execution                             │
│  $ pnpm cli <SHEET_ID> <GID> --format=pdf --line1-col=0         │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
         ┌──────────────────────────────────────┐
         │  cli/nametag-generator.ts            │
         │  ┌────────────────────────────────┐  │
         │  │ 1. Parse CLI arguments         │  │
         │  │ 2. Extract spreadsheetId, gid  │  │
         │  │ 3. Extract mapping flags       │  │
         │  │ 4. Extract format flag         │  │
         │  └────────────────────────────────┘  │
         └───────────────┬──────────────────────┘
                         │
                         ▼
         ┌──────────────────────────────────────┐
         │  lib/sheets-fetcher.ts               │
         │  ┌────────────────────────────────┐  │
         │  │ fetchGoogleSheetAsCSV()        │  │
         │  │ - Build CSV export URL         │  │
         │  │ - Fetch via HTTP               │  │
         │  │ - Return CSV string            │  │
         │  └────────────────────────────────┘  │
         └───────────────┬──────────────────────┘
                         │
                         ▼
         ┌──────────────────────────────────────┐
         │  lib/column-mapper.ts                │
         │  ┌────────────────────────────────┐  │
         │  │ parseCSVToPagesWithMapping()   │  │
         │  │ - Apply column mapping         │  │
         │  │ - Handle hasHeaders flag       │  │
         │  │ - Return NameTagPage[]         │  │
         │  └────────────────────────────────┘  │
         └───────────────┬──────────────────────┘
                         │
                         ▼
         ┌──────────────────────────────────────┐
         │  lib/html-generator.ts               │
         │  ┌────────────────────────────────┐  │
         │  │ generateNameTagsHTML()         │  │
         │  │ - Generate HTML with CSS       │  │
         │  │ - TownStix US-10 layout        │  │
         │  │ - Return HTML string           │  │
         │  └────────────────────────────────┘  │
         └───────────────┬──────────────────────┘
                         │
                         ▼
    ┌─────────────────────────────────────────────┐
    │  Format decision                            │
    │  If format='pdf':                           │
    │  ┌───────────────────────────────────────┐  │
    │  │  lib/pdf-generator.ts                 │  │
    │  │  ┌─────────────────────────────────┐  │  │
    │  │  │ generatePDFFile()               │  │  │
    │  │  │ - Launch Puppeteer              │  │  │
    │  │  │ - Render HTML to PDF            │  │  │
    │  │  │ - Write to file                 │  │  │
    │  │  └─────────────────────────────────┘  │  │
    │  └───────────────────────────────────────┘  │
    │  Else:                                      │
    │  - Write HTML directly to file              │
    └─────────────────────────────────────────────┘
                         │
                         ▼
         ┌──────────────────────────────────────┐
         │  Output file created:                │
         │  - name-tags.html OR                 │
         │  - name-tags.pdf                     │
         └──────────────────────────────────────┘
```

## Key Algorithms

### CSV Parsing with Quote Handling

**File**: `lib/csv-parser.ts`

Handles CSV lines with quoted values containing commas:

```typescript
export function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }

  result.push(current)
  return result.map(s => s.trim())
}
```

**Example:**
```csv
"Smith, John", "123 Main St", "Anytown, USA"
```
Parses to: `["Smith, John", "123 Main St", "Anytown, USA"]`

### Column Mapping Application

**File**: `lib/column-mapper.ts`

Maps arbitrary columns to 3-line name tags:

```typescript
export function parseCSVToPagesWithMapping(
  csvContent: string,
  mapping: ColumnMapping,
  hasHeaders = false
): NameTagPage[] {
  const lines = csvContent.split('\n')
  const pages: NameTagPage[] = []
  let currentPage: NameTagRow[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Skip header row if requested
    if (i === 0 && hasHeaders) continue

    const columns = parseCSVLineSimple(line)

    // Blank row = page break
    if (columns.every(col => !col || col.trim() === '')) {
      if (currentPage.length > 0) {
        pages.push({ tags: currentPage })
        currentPage = []
      }
      continue
    }

    // Apply mapping: line1 = columns[mapping.line1], etc.
    const tagRow: NameTagRow = {
      line1: mapping.line1 !== null ? columns[mapping.line1] || '' : '',
      line2: mapping.line2 !== null ? columns[mapping.line2] || '' : '',
      line3: mapping.line3 !== null ? columns[mapping.line3] || '' : '',
    }

    if (tagRow.line1 || tagRow.line2 || tagRow.line3) {
      currentPage.push(tagRow)
    }
  }

  if (currentPage.length > 0) {
    pages.push({ tags: currentPage })
  }

  return pages
}
```

**Key features:**
- Supports null mapping (skip a line)
- Handles blank rows as page breaks
- Validates that at least one line has content
- Respects header row flag

### HTML Generation with TownStix US-10 Layout

**File**: `lib/html-generator.ts`

Generates print-ready HTML with precise CSS layout:

```typescript
export function generateNameTagsHTML(pages: NameTagPage[], labelsPerPage = 10): string {
  // Generate HTML with:
  // - @page CSS for print settings
  // - CSS Grid: 2 columns × 5 rows
  // - Each cell: 4" × 2" (TownStix US-10 format)
  // - line1: 32pt bold
  // - line2/line3: 18pt regular
  // - Padding tags to fill sheet (empty cells)
  // - Page breaks between sheets

  const html = `<!DOCTYPE html>
<html>
<head>
  <style>
    @page {
      size: letter;
      margin: 0.5in 0.25in;
    }

    .label-grid {
      display: grid;
      grid-template-columns: repeat(2, 4in);
      grid-template-rows: repeat(5, 2in);
      gap: 0;
      width: 8in;
    }

    .name-tag {
      width: 4in;
      height: 2in;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 0.25in;
    }

    .line1 {
      font-size: 32pt;
      font-weight: bold;
      line-height: 1.2;
    }

    .line2, .line3 {
      font-size: 18pt;
      line-height: 1.3;
    }
  </style>
</head>
<body>
  ${generatePagesHTML()}
</body>
</html>`

  return html
}
```

**Key features:**
- CSS Grid for precise 2×5 layout
- Padding empty cells to fill sheet
- Page breaks for multi-page printing
- Print-optimized CSS (@page)
- Line1 is large/bold, Line2/3 are smaller

### PDF Generation with Puppeteer

**File**: `lib/pdf-generator.ts`

Converts HTML to high-fidelity PDF:

```typescript
export async function generatePDF(html: string): Promise<Buffer> {
  const puppeteer = await import('puppeteer')

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const page = await browser.newPage()

  await page.setContent(html, {
    waitUntil: 'networkidle0',
  })

  const pdfBuffer = await page.pdf({
    format: 'Letter', // US Letter (8.5" × 11")
    margin: {
      top: '0.5in',
      right: '0.5in',
      bottom: '0.5in',
      left: '0.5in',
    },
    printBackground: true,
    preferCSSPageSize: true,
  })

  await browser.close()

  return Buffer.from(pdfBuffer)
}
```

**Key features:**
- Headless Chrome rendering
- Preserves CSS layout exactly
- Print background graphics
- US Letter page size
- Returns binary Buffer

## CSS Architecture

### Glassmorphism Design

The application uses a modern **glassmorphism** design with:

- Semi-transparent backgrounds
- Backdrop blur effects
- Subtle borders
- Dark/light mode support

### Component-Scoped PostCSS

**Pattern**: Semantic CSS classes with Tailwind `@apply`:

```vue
<template>
  <div class="glass-card">
    <div class="glass-card__content">
      <slot />
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.glass-card {
  @apply relative overflow-hidden rounded-xl border;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border-color: rgba(255, 255, 255, 0.1);
}

.glass-card__content {
  @apply p-6;
}

/* Dark mode */
.dark .glass-card {
  background: rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.05);
}
</style>
```

**Why component-scoped CSS:**
- Semantic class names
- Single source of truth
- Easier to maintain
- Better for responsive design
- Scoped to component (no leakage)

### Global Styles

**File**: `app/assets/css/main.css`

```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

* {
  font-family: 'Plus Jakarta Sans', sans-serif;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  @apply bg-gray-100 dark:bg-gray-800;
}

::-webkit-scrollbar-thumb {
  @apply bg-gray-300 dark:bg-gray-600 rounded-full;
}
```

### Theme Configuration

**File**: `app.config.ts`

```typescript
export default defineAppConfig({
  ui: {
    primary: 'purple',
    gray: 'neutral',
  },
})
```

**File**: `nuxt.config.ts`

```typescript
export default defineNuxtConfig({
  colorMode: {
    preference: 'dark', // Default to dark mode
  },
})
```

## Design Decisions

### 1. Why Nuxt Over Next.js?

**Chosen**: Nuxt 4 with Vue 3

**Reasoning**:
- **Vue 3 Composition API** is more concise than React hooks
- **File-based routing** with better conventions
- **Nitro server** is faster and more flexible than Next.js API routes
- **Better TypeScript support** out of the box
- **@nuxt/ui** provides excellent component library
- **SSR/SSG/SPA** flexibility

### 2. Why Shared lib/ Architecture?

**Chosen**: Separate `lib/` with runtime-agnostic code

**Reasoning**:
- **DRY principle**: One implementation for web and CLI
- **Testability**: Business logic isolated from framework
- **Portability**: Easy to add new interfaces
- **Performance**: No code duplication
- **Maintainability**: Bug fixes apply everywhere

### 3. Why Composables Over Pinia Stores?

**Chosen**: Vue 3 Composables for state management

**Reasoning**:
- **Simpler**: No store boilerplate
- **Co-located**: State near where it's used
- **Type-safe**: Better TypeScript inference
- **Flexible**: Easy to compose and reuse
- **Standard**: Vue 3 Composition API is the standard

**When to use Pinia**: Only if you need:
- Global state across unrelated components
- DevTools time-travel debugging
- Plugin ecosystem

### 4. Why Atomic Design?

**Chosen**: Atoms → Molecules → Organisms component hierarchy

**Reasoning**:
- **Reusability**: Small components compose into large ones
- **Consistency**: Shared atoms ensure visual consistency
- **Testability**: Easy to test small components
- **Maintainability**: Clear component boundaries
- **Documentation**: Self-documenting architecture

### 5. Why Component-Scoped CSS Over Inline Tailwind?

**Chosen**: PostCSS with Tailwind `@apply` in `<style scoped>`

**Reasoning**:
- **Readability**: Semantic class names in templates
- **Maintainability**: CSS in one place
- **Responsive**: Easier to handle complex responsive logic
- **DRY**: Define once, use many times
- **Debugging**: Easier to debug CSS issues

### 6. Why Puppeteer Over Other PDF Solutions?

**Chosen**: Puppeteer for PDF generation

**Reasoning**:
- **Accuracy**: Renders exactly like browser
- **CSS support**: Full modern CSS (Grid, Flexbox)
- **Mature**: Battle-tested, widely used
- **Control**: Fine-grained control over rendering

**Trade-offs**:
- **Size**: Requires Chromium (~200MB)
- **Memory**: Needs 512MB-1GB RAM
- **Speed**: 1-5 seconds per PDF

**Alternatives considered**:
- jsPDF: Limited CSS support
- PDFKit: Manual layout required
- wkhtmltopdf: Outdated WebKit engine

### 7. Why pnpm Over npm/yarn?

**Chosen**: pnpm enforced via `packageManager` field

**Reasoning**:
- **Disk efficiency**: Content-addressable storage
- **Speed**: 2-3× faster than npm
- **Strict**: Enforces proper dependencies
- **Monorepo**: Better for future expansion

### 8. Why Google Sheets CSV Export?

**Chosen**: Direct CSV export URL

**Reasoning**:
- **No OAuth**: Works with published sheets
- **Simple**: Just parse CSV
- **Fast**: Direct download
- **Reliable**: Google's infrastructure

**Trade-off**: Sheet must be published

### 9. Why Server API Routes?

**Chosen**: Nuxt server API routes vs client-only

**Reasoning**:
- **Security**: Keep Puppeteer server-side
- **Performance**: Server has more resources
- **CORS**: Avoid CORS issues
- **Caching**: Can cache on server

### 10. Why HTML Preview Over Direct Rendering?

**Chosen**: Preview in iframe before PDF

**Reasoning**:
- **User control**: See before download
- **Feedback**: Catch errors early
- **Adjustment**: Can go back and remap
- **Trust**: Users see exactly what they get

## Performance Considerations

### Bundle Size Optimization

- **Code splitting**: Nuxt auto-splits routes
- **Tree shaking**: Unused code removed
- **Dynamic imports**: Heavy components loaded on-demand
- **Font optimization**: Only weights used

### Server Performance

- **Puppeteer pool**: Reuse browser instances
- **Caching**: Cache Google Sheets fetches
- **Compression**: gzip/brotli for responses
- **Nitro optimization**: Minimal cold starts

### Client Performance

- **Virtual scrolling**: For large data tables (future)
- **Debounced mapping**: Don't regenerate on every keystroke
- **Lazy loading**: Images and components
- **Web Workers**: CSV parsing (future optimization)

### PDF Generation

- **Memory**: ~512MB per concurrent PDF
- **Timeout**: Max 60 seconds
- **Scaling**: Consider queue for high volume
- **Alternative**: Offer HTML-only for free tiers

---

This architecture provides a **scalable, maintainable, and performant** foundation for the Slappy, supporting both web and CLI interfaces with shared business logic.
