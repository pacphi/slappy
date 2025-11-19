# Slappy

[![GA](https://img.shields.io/badge/Release-GA-darkgreen)](https://img.shields.io/badge/Release-GA-darkgreen) ![Github Action CI Workflow Status](https://github.com/pacphi/slappy/actions/workflows/ci.yml/badge.svg) [![Online Demo](https://img.shields.io/badge/Online-Try%20on%20fly.io-darkpurple)](https://slappy.fly.dev/)

Generate print-ready name tags in TownStix US-10 format (4" x 2" labels) from CSV files or Google Sheets. Features an intuitive multi-step wizard with flexible column mapping and both HTML and PDF export options.

## 🌐 Web Application

The easiest way to use Slappy is through our modern web interface:

### Quick Start - Web App

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and follow the **3-step wizard**:

### Step 1: Upload Data

- **Drag & drop** a CSV file or click to browse
- **OR** paste a Google Sheets URL (must be published to the web)

### Step 2: Map Columns

- Choose which columns map to each line of your name tags
- Toggle "Has headers" if your first row contains column names
- Preview your data (first 5 rows) to verify mapping
- Optionally skip lines (e.g., use only 2 lines per tag)

### Step 3: Preview & Download

- Review generated name tags with live preview
- **Download as HTML** for browser-based printing
- **Download as PDF** for easy sharing and professional printing
- **Print directly** from the preview

The app features:

- 🎨 Modern, responsive design with light/dark mode
- 📤 Drag-and-drop CSV upload
- 🔗 Direct Google Sheets integration
- 🗺️ Flexible column mapping with data preview
- 👁️ Live preview before downloading
- 📄 Download as HTML or PDF
- 🖨️ One-click printing

### Deploy to fly.io

```bash
# Install flyctl if you haven't already
curl -L https://fly.io/install.sh | sh

# Login to fly.io
flyctl auth login

# Deploy the app
flyctl launch

# Follow the prompts to configure your app
```

## 🖥️ CLI Usage

The CLI supports advanced column mapping and PDF generation for automated workflows:

### Basic Usage

```bash
pnpm install
pnpm cli <SPREADSHEET_ID> <GID> [output-file]
```

**Example:**

```bash
# Generates name-tags.html with default column mapping (0,1,2)
pnpm cli 3kR9mN-2pQxWvY_bZdH8sLf4jTcUgEoAnV7iM5wKqX1yBe 428391756
```

### Advanced Usage with Column Mapping

Map any columns to any lines on your name tags:

```bash
# Use columns 0, 2, 3 for lines 1, 2, 3
pnpm cli SHEET_ID GID \
  --line1-col=0 --line2-col=2 --line3-col=3

# Skip the third line (only use 2 lines per tag)
pnpm cli SHEET_ID GID \
  --line1-col=0 --line2-col=1

# With headers and PDF output
pnpm cli SHEET_ID GID output.pdf \
  --has-headers --format=pdf
```

### CLI Options

| Option            | Description                                      | Example         |
| ----------------- | ------------------------------------------------ | --------------- |
| `--line1-col=N`   | Column index (0-based) for line 1                | `--line1-col=0` |
| `--line2-col=N`   | Column index (0-based) for line 2                | `--line2-col=1` |
| `--line3-col=N`   | Column index (0-based) for line 3                | `--line3-col=2` |
| `--has-headers`   | First row contains headers (skip it)             | `--has-headers` |
| `--format=FORMAT` | Output format: `html` or `pdf` (default: `html`) | `--format=pdf`  |

**For HTML output:** Open the generated file in a browser and print using US Letter paper with 0.5" margins.
**For PDF output:** Ready to print directly or share electronically.

### Local CSV Testing

Test with local CSV files:

```bash
pnpm test:local                        # Uses sample/sample-roster.csv
pnpm test:local path/to/custom.csv     # Uses custom CSV file
```

## Documentation

- **[User Guide](docs/USER.md)** - Non-technical guide for creating name tags
- **[Quick Start Guide](docs/QUICKSTART.md)** - Get started quickly
- **[Run Guide](docs/RUN.md)** - Detailed usage instructions
- **[Build Guide](docs/BUILD.md)** - Building from source
- **[Architecture](docs/ARCHITECTURE.md)** - Technical architecture details
- **[Continuous Integration](docs/CI.md)** - Continuous integration setup
- **[Deployment](docs/DEPLOY.md)** - Deployment instructions (Fly.io, Vercel, Cloudflare, Netlify, Docker)
- **[Custom Domain Setup](docs/CUSTOM_DOMAIN_SETUP.md)** - Connect a custom domain to your Fly.io deployment with HTTPS
- **[AdSense & SEO Setup](docs/ADSENSE_SEO_SETUP.md)** - Configure Google AdSense and SEO optimization
- **[Project Overview](docs/PROJECT-OVERVIEW.md)** - High-level project information

## Requirements

- Node.js 20+
- pnpm 9+ (package manager - enforced via `packageManager` field)
- Puppeteer 24+ (for PDF generation - installed automatically)
- A published Google Sheet or CSV file with your data

## Features

### Web Application

- ✅ **Multi-step wizard interface** - Upload → Map Columns → Preview & Download
- ✅ **Flexible column mapping** - Map any column to any tag line
- ✅ **Data preview table** - See first 5 rows to verify mapping
- ✅ **Header detection** - Toggle to treat first row as column names
- ✅ **Dual export formats** - Download as HTML or PDF
- ✅ **Modern Nuxt 4** web interface with @nuxt/ui components
- ✅ **Dual input modes** - CSV upload or Google Sheets URL
- ✅ **Drag-and-drop** file upload
- ✅ **Light/dark mode** theme toggle with glassmorphism design
- ✅ **Live preview** with iframe rendering and zoom controls
- ✅ **Responsive** mobile-friendly design
- ✅ **Deploy anywhere** - Fly.io, Vercel, Cloudflare Pages, Netlify, Docker

### CLI Tool

- ✅ **Command-line interface** - Automated workflows and scripting
- ✅ **Google Sheets integration** - Direct CSV export from published sheets
- ✅ **Flexible column mapping** - Custom column-to-line mapping via flags
- ✅ **Dual output formats** - HTML or PDF generation
- ✅ **Header support** - Optional header row handling
- ✅ **Local CSV testing** - Test with local files before using sheets

### Core Functionality

- ✅ **Flexible column mapping** - Choose which columns become which lines
- ✅ **Partial mapping** - Use 1, 2, or 3 lines per tag
- ✅ **Headers support** - Optional header row handling
- ✅ **PDF generation** - High-fidelity PDF via Puppeteer
- ✅ **TownStix US-10 format** - 2 columns × 5 rows = 10 labels per sheet
- ✅ **Google Sheets integration** - Direct CSV export API access
- ✅ **Automatic page breaks** - Blank rows create new pages
- ✅ **Print-ready output** - HTML or PDF ready for professional printing
- ✅ **Customizable styling** - Fonts, colors, and layout
- ✅ **Shared architecture** - CLI and web share core business logic in `lib/`
- ✅ **Backwards compatible** - Existing workflows continue to work

## Configuration

### Feature Flags

Feature flags are managed using the `nuxt-feature-flags` module for type-safe, centralized feature management:

```typescript
// feature-flags.config.ts
import { defineFeatureFlags } from '#feature-flags/handler'

export default defineFeatureFlags(() => ({
  adsense: {
    enabled: false, // Change to true to enable AdSense
    description: 'Google AdSense integration for monetization',
  },
}))
```

**Usage in components:**

```typescript
const { isEnabled } = useFeatureFlags()
if (isEnabled('adsense')) {
  // Render AdSense component
}
```

**AdSense Feature Flag:**

- When `enabled: false` (default): No AdSense scripts loaded, no ad components rendered, zero performance impact
- When `enabled: true`: AdSense ads appear on landing page and preview panel

**Benefits:**

- Full TypeScript support with autocomplete
- Build-time validation catches undefined flags
- Supports A/B testing and variants
- Context-aware evaluation

For complete AdSense setup instructions, see [AdSense & SEO Setup Guide](docs/ADSENSE_SEO_SETUP.md).

## Technology Stack

- **Frontend**: Nuxt 4, Vue 3, TypeScript 5, @nuxt/ui (Tailwind CSS)
- **Backend**: Nitro server, H3 HTTP framework
- **State Management**: Vue 3 Composables (Pinia available)
- **PDF Generation**: Puppeteer 24 (headless Chrome)
- **Theming**: @nuxt/ui color modes with glassmorphism design
- **Icons**: Heroicons, Lucide
- **Package Manager**: pnpm (enforced)
- **Deployment**: Docker, Fly.io, Vercel, Cloudflare Pages, Netlify

## Development

### Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Code Quality

```bash
pnpm lint          # Check code with ESLint
pnpm lint:fix      # Auto-fix ESLint issues
pnpm format        # Format code with Prettier
pnpm format:check  # Check code formatting
pnpm deadcode      # Find unused code with Knip

# Combined checks
pnpm check:all     # Run lint + format check + deadcode
pnpm fix:all       # Run lint:fix + format
```

### Project Structure

```text
slappy/
├── app/
│   ├── components/           # Vue components (atomic design)
│   │   ├── atoms/            # Base components
│   │   ├── molecules/        # Combined components
│   │   └── organisms/        # Complex components
│   ├── composables/          # Vue composables for state
│   ├── assets/css/           # Global styles
│   └── pages/                # Route pages
├── server/
│   ├── api/                  # API endpoints
│   └── utils/                # Server utilities (re-exports from lib/)
├── lib/                      # Shared business logic (runtime-agnostic)
│   ├── types.ts              # Core type definitions
│   ├── csv-parser.ts         # CSV parsing
│   ├── column-mapper.ts      # Column mapping
│   ├── html-generator.ts     # HTML generation
│   ├── pdf-generator.ts      # PDF generation
│   ├── sheets-fetcher.ts     # Google Sheets integration
│   └── data-parser.ts        # Data parsing utilities
├── cli/                      # CLI tools
│   ├── nametag-generator.ts  # Main CLI
│   └── test-local.ts         # Local testing
├── types/                    # Global TypeScript definitions
├── nuxt.config.ts            # Nuxt configuration
├── app.config.ts             # App theme configuration
└── feature-flags.config.ts   # Feature flag definitions
```

**Shared Architecture:** The `lib/` directory contains runtime-agnostic business logic used by both the Nuxt web app and CLI tools, ensuring consistency and maintainability.

### Creating Components

Follow atomic design principles:

```vue
<!-- app/components/atoms/MyComponent.vue -->
<template>
  <div class="my-component">
    <slot />
  </div>
</template>

<style lang="postcss" scoped>
.my-component {
  @apply relative overflow-hidden rounded-xl;
  /* Component-specific styles */
}
</style>
```

### API Routes

```typescript
// server/api/myroute.post.ts
export default defineEventHandler(async event => {
  const body = await readBody(event)
  // Handle request using lib/ utilities
  return { data: result }
})
```

For detailed development guidance, see [ARCHITECTURE.md](docs/ARCHITECTURE.md).

## License

MIT
