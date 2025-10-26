# Slappy - Project Overview

## Purpose

This full-stack TypeScript application generates print-ready name tags in TownStix US-10 format (4" × 2" labels, 2 columns × 5 rows per sheet). It provides both a modern web interface with flexible column mapping and a command-line tool for generating name tags from CSV files or Google Sheets data.

## Problem Statement

Event organizers, choir directors, conference planners, and educators need a fast, reliable way to generate professional name tags from spreadsheet data. Existing solutions often:

- Require manual layout in word processors
- Lack proper formatting for standard label sheets
- Don't support flexible data mapping
- Produce misaligned or incorrectly sized labels

## Solution

A purpose-built tool that:

- Accepts data from multiple sources (CSV upload, Google Sheets URL)
- Provides visual column mapping to accommodate any spreadsheet structure
- Generates precise TownStix US-10 format output (4" × 2" labels)
- Supports both HTML and PDF export with print-ready formatting
- Works as either a web application or command-line tool

## Key Features

**Web Application:**

- Multi-step wizard interface (upload → map columns → preview → download)
- Drag-and-drop CSV upload or Google Sheets URL input
- Visual column mapping with data preview table
- Light/dark theme support
- In-browser preview with print capability
- HTML and PDF download options

**Command-Line Interface:**

- Flexible column mapping via CLI flags
- Support for CSV files and Google Sheets
- HTML and PDF output formats
- Header row detection
- Batch processing capability

**Core Capabilities:**

- Flexible column mapping (any columns to any label lines)
- Header row support (auto-skip first row)
- Partial mapping (use 1, 2, or 3 lines per tag)
- Page break support (blank rows in source data)
- Automatic pagination (10 labels per sheet)
- TownStix US-10 specification compliance

## Target Use Cases

- **Choir/Music Groups**: Name, school, voice part
- **Conferences**: Name, company, title
- **School Events**: Student name, grade, room assignment
- **Workshops**: Participant name, organization, role
- **Volunteer Events**: Name, assignment, shift time

## Technology Stack

- **Frontend**: Nuxt 4, Vue 3, TypeScript 5, @nuxt/ui (Tailwind CSS)
- **Backend**: Nuxt Server API Routes, Puppeteer for PDF generation
- **State Management**: Pinia with composables
- **Package Manager**: pnpm (enforced)
- **Deployment**: Fly.io, Vercel, Netlify, Cloudflare Pages compatible
- **Architecture**: Shared-core design (web and CLI use same business logic from lib/)

## Project Structure

```text
/
├── app/              # Nuxt web application
│   ├── components/   # Vue UI components (atomic design)
│   ├── composables/  # State management composables
│   └── assets/       # Global styles
├── server/           # Nuxt server
│   ├── api/          # API routes (parse, generate)
│   └── utils/        # Server utilities (re-exports from lib/)
├── lib/              # Shared core logic (used by both web and CLI)
│   ├── types.ts      # Shared TypeScript types
│   ├── csv-parser.ts
│   ├── column-mapper.ts
│   ├── html-generator.ts
│   ├── pdf-generator.ts
│   ├── sheets-fetcher.ts
│   └── data-parser.ts
├── cli/              # CLI tools
│   ├── nametag-generator.ts  # Main CLI with Google Sheets support
│   └── test-local.ts         # Local CSV testing
├── types/            # Global type definitions
└── docs/             # Documentation
```

## Label Specifications

**TownStix US-10 Format:**

- Label size: 4" × 2" (exact)
- Grid: 2 columns × 5 rows = 10 labels per sheet
- Paper: US Letter (8.5" × 11")
- Margins: 0.5" on all sides
- Font sizes: Line 1 (32pt bold), Lines 2-3 (18pt regular)

## Documentation

- **README.md**: Complete project documentation and setup
- **QUICKSTART.md**: Fast-start guide for new users
- **RUN.md**: Detailed usage instructions for web and CLI
- **CLAUDE.md**: AI assistant guidance for code contributions

## Getting Started

**Web Application:**

```bash
pnpm install
pnpm dev          # Start at http://localhost:3000
```

**Command-Line:**

```bash
pnpm install
pnpm test:local   # Generate test tags from sample data
pnpm cli <SPREADSHEET_ID> <GID>  # Generate from Google Sheets
```

See [RUN.md](RUN.md) for comprehensive usage instructions.
