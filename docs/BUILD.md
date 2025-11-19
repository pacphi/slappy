# Building Slappy

This guide explains how to build Slappy from source for development and production deployment.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Development Setup](#development-setup)
- [Building the Web Application](#building-the-web-application)
- [CLI Tools (No Build Required)](#cli-tools-no-build-required)
- [Build Output](#build-output)
- [Docker Build](#docker-build)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

- **Node.js**: Version 20.0.0 or higher
  - Check version: `node --version`
  - Download: [nodejs.org](https://nodejs.org/)

- **pnpm**: Package manager (version enforced via `packageManager` field in package.json)
  - Check version: `pnpm --version`
  - Install: `npm install -g pnpm` or visit [pnpm.io](https://pnpm.io/)

- **Git**: For cloning and version control
  - Check version: `git --version`
  - Download: [git-scm.com](https://git-scm.com/)

### Optional Software

- **Docker**: For containerized builds
- **VSCode**: Recommended IDE with Vue/Nuxt support

## Development Setup

### Clone Repository

```bash
git clone https://github.com/pacphi/slappy.git
cd slappy
```

### Install Dependencies

```bash
pnpm install
```

This installs:

- **Runtime dependencies**: Nuxt, Vue, Pinia, Puppeteer, @nuxt/ui, etc.
- **Dev dependencies**: ESLint, Prettier, Knip, TypeScript types
- **Puppeteer's Chromium**: Downloaded automatically (~300MB, may take several minutes)

### Verify Installation

```bash
# Check pnpm version
pnpm --version

# List installed packages
pnpm list --depth=0

# Start dev server to verify
pnpm dev
```

## Building the Web Application

### Nuxt Build Process

Build the Nuxt application for production:

```bash
pnpm build
```

This executes: `nuxt build`

**What happens during build:**

1. **TypeScript Compilation**: All `.ts` and `.vue` files are type-checked and compiled
2. **Vue Component Processing**: SFCs are compiled to optimized JavaScript
3. **Nitro Server Build**: Server API routes and middleware are bundled
4. **Client Bundle**: JavaScript, CSS, and assets are optimized and code-split
5. **Static Asset Processing**: Images, fonts, and public files are copied
6. **SSR Preparation**: Server-side rendering infrastructure is configured

**Build configuration:**

- Source: `nuxt.config.ts`
- Vite config: CSS minification with `lightningcss`
- Output target: `.output/` directory

### Build Output Structure

After `pnpm build`, the `.output/` directory contains:

```text
.output/
├── server/              # Nitro server bundle
│   ├── index.mjs       # Server entry point
│   └── chunks/         # Server code chunks
├── public/             # Client-side assets (to be served statically)
│   ├── _nuxt/         # JavaScript, CSS bundles
│   └── ...            # Other static assets
└── nitro.json         # Nitro configuration metadata
```

**Key files:**

- `.output/server/index.mjs` - Node.js server that handles SSR and API routes
- `.output/public/` - Static files served by the web server
- `.output/public/_nuxt/` - Optimized client bundles with content hashes

### Preview Production Build

Test the production build locally:

```bash
pnpm preview
```

This starts the Nitro server on http://localhost:3000 serving the production build.

### Clean Build

Remove previous build artifacts before rebuilding:

```bash
# Remove build output
rm -rf .output/

# Remove Nuxt cache
rm -rf .nuxt/

# Rebuild
pnpm build
```

**When to clean:**

- After major dependency updates
- Build errors or inconsistencies
- Switching between branches with different configurations

## CLI Tools (No Build Required)

The CLI tools use **tsx** to execute TypeScript directly - no build step needed.

### Running CLI Tools

```bash
# Main CLI (Google Sheets support)
pnpm cli <SPREADSHEET_ID> <GID> [options]

# Local CSV testing
pnpm test:local [path/to/file.csv]
```

**How it works:**

- `tsx` is a TypeScript execution engine (like ts-node but faster)
- Scripts in `cli/` directory run directly from source
- Imports from `lib/` are resolved dynamically
- No compilation to `dist/` directory needed

**CLI entry points:**

- `cli/nametag-generator.ts` - Main CLI with column mapping
- `cli/test-local.ts` - Local CSV file testing utility

## Build Output

### JavaScript Modules

Nuxt generates **ES modules** (`.mjs` files) for the server:

**Input (TypeScript):**

```typescript
// server/api/generate.post.ts
export default defineEventHandler(async event => {
  const body = await readBody(event)
  return { success: true }
})
```

**Output (JavaScript):**

```javascript
// .output/server/chunks/...generate.post.mjs
export default defineEventHandler(async event => {
  const body = await readBody(event)
  return { success: true }
})
```

### Client Bundles

Client code is bundled and optimized:

- **Code splitting**: Automatic route-based splitting
- **Tree shaking**: Unused code removed
- **Minification**: JavaScript and CSS compressed
- **Asset hashing**: Cache-busting via content hashes (e.g., `app.abc123.js`)

### Type Declarations

Type checking occurs during build, but `.d.ts` files are not generated for the Nuxt app (only used for validation).

For the shared `lib/` directory, types are inferred from source files.

## Docker Build

Build a production Docker image with all dependencies included.

### Using the Dockerfile

The project includes a multi-stage `Dockerfile` optimized for Nuxt:

```bash
# Build image
docker build -t slappy:latest .

# Run container
docker run -p 3000:3000 slappy:latest
```

### Dockerfile Stages

**Stage 1: Dependencies**

- Installs Node.js and pnpm
- Copies `package.json` and `pnpm-lock.yaml`
- Installs dependencies (including Puppeteer's Chromium)

**Stage 2: Build**

- Copies source code
- Runs `pnpm build`
- Generates `.output/` directory

**Stage 3: Production**

- Lightweight runtime image
- Copies only `.output/` and runtime dependencies
- Runs as non-root user (`nuxt`)
- Exposes port 3000

**Build features:**

- Multi-stage build reduces final image size
- Alpine Linux base for minimal footprint
- Puppeteer/Chromium included for PDF generation
- Security: runs as non-root user

### Docker Compose

Alternative: Use `docker-compose.yml` for development and production:

```bash
# Production build
docker-compose up web -d

# Development with hot reload
docker-compose up dev

# View logs
docker-compose logs -f web
```

## Build Modes

### Development Build

For active development with fast rebuilds and HMR:

```bash
pnpm dev
```

**Features:**

- Hot Module Replacement (HMR)
- Source maps enabled
- No minification (faster builds)
- Detailed error messages
- Auto-restart on file changes

### Production Build

Optimized build for deployment:

```bash
pnpm build
pnpm preview
```

**Optimizations:**

- Minified JavaScript and CSS
- Code splitting and tree shaking
- Asset optimization (images, fonts)
- Source maps optional (configurable)
- Strict type checking enforced

### Static Generation (SSG)

Generate a fully static site:

```bash
pnpm generate
```

**Output:** `.output/public/` contains static HTML files

**Note:** Slappy uses SSR and API routes, so full SSG may not include dynamic functionality. Use `pnpm build` for production deployment.

## Troubleshooting

### Error: "Cannot find module 'nuxt'"

**Cause**: Dependencies not installed

**Solution**:

```bash
pnpm install
```

### Error: "Port 3000 is already in use"

**Cause**: Another process is using port 3000

**Solution**:

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process or use different port
PORT=3001 pnpm dev
```

### Build Succeeds but Runtime Errors

**Cause**: Mismatch between dependencies or cached builds

**Solution**:

```bash
# Clean everything and rebuild
rm -rf .output/ .nuxt/ node_modules/
pnpm install
pnpm build
```

### "Out of Memory" During Build

**Cause**: Large codebase or limited Node.js heap

**Solution**:

```bash
# Increase Node.js memory limit
NODE_OPTIONS=--max_old_space_size=4096 pnpm build
```

### Puppeteer/Chromium Issues

**Error**: "Failed to launch the browser process"

**Solutions**:

1. **Missing dependencies** (Linux):

   ```bash
   # Debian/Ubuntu
   sudo apt-get install -y chromium-browser

   # Or install dependencies for bundled Chromium
   sudo apt-get install -y libnss3 libatk-bridge2.0-0 libx11-xcb1
   ```

2. **Docker**: Use the provided Dockerfile which includes all dependencies

3. **Development**: Puppeteer downloads Chromium automatically - ensure sufficient disk space (~300MB)

### TypeScript Type Errors

**Cause**: Type mismatches or missing type definitions

**Solution**:

```bash
# Type-check without building
npx nuxi typecheck

# Check for specific issues
pnpm lint
```

## Build Verification

### Verify Output

Check compiled files:

```bash
# List build output
ls -lh .output/

# Verify server entry point exists
test -f .output/server/index.mjs && echo "Server build successful"

# Check public assets
ls .output/public/_nuxt/
```

### Run Production Build

Test the compiled application:

```bash
# Preview production build
pnpm preview

# Should start server on http://localhost:3000
# Test in browser to verify functionality
```

### Validate Bundle Size

Check bundle sizes:

```bash
# Use nuxi to analyze build
npx nuxi analyze

# Or manually check bundle sizes
du -sh .output/public/_nuxt/*
```

**Targets:**

- Server bundle: < 5MB (typical: 2-3MB)
- Client JavaScript: < 500KB initial load
- CSS: < 100KB

---

## Next Steps

- **Run the application**: See [RUN.md](RUN.md)
- **Deploy**: See [DEPLOY.md](DEPLOY.md) for deployment platforms
- **Development**: See [ARCHITECTURE.md](ARCHITECTURE.md) for code structure
- **Automation**: See [CI.md](CI.md) for automated builds

For questions or issues, refer to:

- [Nuxt Documentation](https://nuxt.com/docs/getting-started/deployment)
- [Nitro Documentation](https://nitro.unjs.io/deploy)
- [Vite Build Documentation](https://vitejs.dev/guide/build.html)
