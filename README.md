# Slappy

[![GA](https://img.shields.io/badge/Release-GA-darkgreen)](https://img.shields.io/badge/Release-GA-darkgreen) ![Github Action CI Workflow Status](https://github.com/pacphi/slappy/actions/workflows/ci.yml/badge.svg) [![Online Demo](https://img.shields.io/badge/Online-Try%20on%20fly.io-darkpurple)](https://slappy.fly.dev/)

Generate print-ready name tags in TownStix US-10 format (4" × 2" labels, 10 per sheet) from CSV files or Google Sheets. Features an intuitive multi-step wizard with flexible column mapping and both HTML and PDF export options.

**Perfect for**: Conferences, choir groups, school events, workshops, and volunteer programs.

## 🌐 Web Application

The easiest way to use Slappy is through our modern web interface:

### Quick Start - Web App

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and follow the **3-step wizard**:

1. **Upload** - Drag & drop CSV or paste Google Sheets URL
2. **Map Columns** - Select which columns appear on each line
3. **Preview & Download** - Get HTML or PDF output

See **[Quick Start Guide](docs/QUICKSTART.md)** for detailed walkthrough.

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

For automated workflows and scripting:

```bash
# Basic usage
pnpm cli <SPREADSHEET_ID> <GID>

# Advanced: Custom column mapping and PDF
pnpm cli SHEET_ID GID output.pdf \
  --line1-col=0 --line2-col=2 --line3-col=3 \
  --has-headers --format=pdf

# Local testing
pnpm test:local
```

See **[Run Guide](docs/RUN.md)** for complete CLI documentation and options.

## Documentation

- **[User Guide](docs/USER.md)** - Non-technical guide for creating name tags
- **[Quick Start Guide](docs/QUICKSTART.md)** - Get started quickly
- **[Run Guide](docs/RUN.md)** - Detailed usage instructions
- **[Build Guide](docs/BUILD.md)** - Building from source
- **[Architecture](docs/ARCHITECTURE.md)** - Technical architecture details
- **[GitHub Workflows](docs/GITHUB_WORKFLOWS.md)** - Using GitHub Actions workflows (CI, Deploy, Teardown)
- **[Continuous Integration](docs/CI.md)** - CI/CD technical implementation details
- **[Deployment](docs/DEPLOY.md)** - Deployment instructions (Fly.io, Vercel, Cloudflare, Netlify, Docker)
- **[Custom Domain Setup](docs/CUSTOM_DOMAIN_SETUP.md)** - Connect a custom domain to your Fly.io deployment with HTTPS
- **[AdSense & SEO Setup](docs/ADSENSE_SEO_SETUP.md)** - Configure Google AdSense and SEO optimization

## Requirements

- Node.js 20+
- pnpm (package manager - version enforced via `packageManager` field in package.json)
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

Feature flags use the `nuxt-feature-flags` module for type-safe, centralized feature management.

- **AdSense Integration**: Controlled via `feature-flags.config.ts` (disabled by default)
- **Configuration**: See `/feature-flags.config.ts` for all available flags
- **Setup Guide**: [AdSense & SEO Setup](docs/ADSENSE_SEO_SETUP.md) for monetization configuration

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
