# Building Slappy

This guide explains how to build the Slappy from source for development and distribution.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Development Setup](#development-setup)
- [Building from Source](#building-from-source)
- [Build Outputs](#build-outputs)
- [Build Configurations](#build-configurations)
- [Platform-Specific Builds](#platform-specific-builds)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

- **Node.js**: Version 20.0.0 or higher
  - Check version: `node --version`
  - Download: [nodejs.org](https://nodejs.org/)

- **pnpm**: Version 9.0.0 or higher (package manager)
  - Check version: `pnpm --version`
  - Install: `npm install -g pnpm` or visit [pnpm.io](https://pnpm.io/)

- **Git**: For cloning and version control
  - Check version: `git --version`
  - Download: [git-scm.com](https://git-scm.com/)

- **TypeScript**: Installed as dev dependency
  - Version 5.3.3 or higher

### Optional Software

- **Docker**: For containerized builds (optional)
- **VSCode**: Recommended IDE with TypeScript support

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

- **Runtime dependencies**: Nuxt, Vue, Pinia, Puppeteer, etc.
- **Dev dependencies**:
  - `tsx` - TypeScript execution for CLI
  - `@types/node` - Node.js type definitions
  - `eslint`, `prettier` - Code quality tools
  - `knip` - Dead code detection

### Verify Installation

```bash
# Check pnpm version
pnpm --version

# Check tsx (CLI runner)
pnpm tsx --version

# List installed packages
pnpm list --depth=0
```

## Building from Source

### Nuxt Build

Build the Nuxt web application:

```bash
pnpm build
```

This executes: `nuxt build`

**Compilation process:**

1. Reads `nuxt.config.ts` configuration
2. Compiles Vue components, TypeScript, and server code
3. Outputs built application to `.output/` directory
4. Generates optimized production bundle

### Output Location

Compiled files are written to `.output/`:

```text
.output/
├── server/       # Nitro server bundle
├── public/       # Static assets
└── nitro.json    # Server configuration
```

### CLI Tools

CLI tools run directly with tsx (no build step needed):

```bash
pnpm cli          # Run main CLI
pnpm test:local   # Run local CSV test
```

### Clean Build

Remove previous build artifacts before rebuilding:

```bash
# Remove .output directory
rm -rf .output/

# Rebuild
pnpm build
```

Or use pnpm script:

```bash
pnpm clean && pnpm build
```

## Build Outputs

### JavaScript Output

The build generates ES2020 JavaScript with CommonJS modules:

**Input (TypeScript):**

```typescript
// nametag-generator.ts
interface NameTagRow {
  line1: string;
  line2: string;
  line3: string;
}

export async function generateNameTags(spreadsheetId: string, gid: string): Promise<void> {
  // Implementation
}
```

**Output (JavaScript):**

```javascript
// dist/nametag-generator.js
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.generateNameTags = void 0;

async function generateNameTags(spreadsheetId, gid) {
  // Compiled implementation
}
exports.generateNameTags = generateNameTags;
```

### Type Declarations

Type declaration files (`.d.ts`) allow TypeScript consumers to use your library with full type safety:

```typescript
// dist/nametag-generator.d.ts
export declare function generateNameTags(
  spreadsheetId: string,
  gid: string,
  outputPath?: string
): Promise<void>;
```

### Source Maps

Source maps (`.js.map`) enable debugging TypeScript source in Node.js:

```bash
# Run with source map support
node --enable-source-maps dist/nametag-generator.js
```

## Build Configurations

### TypeScript Configuration (tsconfig.json)

Current configuration:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

**Key settings:**

- **target**: ES2020 (supports modern JavaScript features)
- **module**: CommonJS (Node.js compatibility)
- **strict**: Enabled (maximum type safety)
- **outDir**: Compiled output goes to `dist/`
- **sourceMap**: Enables debugging support
- **declaration**: Generates `.d.ts` files

### Package Configuration (package.json)

```json
{
  "name": "slappy",
  "version": "1.0.0",
  "main": "dist/nametag-generator.js",
  "types": "dist/nametag-generator.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "ts-node --watch nametag-generator.ts",
    "test": "ts-node test-local.ts"
  }
}
```

## Platform-Specific Builds

### macOS

No special configuration required:

```bash
npm install
npm run build
```

### Linux

Same as macOS:

```bash
npm install
npm run build
```

### Windows

Use PowerShell or Command Prompt:

```powershell
npm install
npm run build
```

**Windows-specific notes:**

- Use `\` or `/` for paths (both work)
- TypeScript compiler handles path normalization

### Docker Build

Build inside a Docker container for consistent environments:

**Dockerfile:**

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm ci

COPY *.ts ./
RUN npm run build

# Production image
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm ci --only=production

CMD ["node", "dist/nametag-generator.js"]
```

**Build:**

```bash
docker build -t slappy-builder .
```

## Build Modes

### Development Build

For active development with fast rebuilds:

```bash
# Watch mode (rebuilds on file changes)
npm run dev
```

This runs TypeScript in watch mode with ts-node.

### Production Build

Optimized build for deployment:

```bash
npm run build
```

**Production optimizations:**

- Source maps can be disabled (set `sourceMap: false` in tsconfig.json)
- Type declarations always generated
- Strict type checking enforced

### Test Build

Verify build works before distribution:

```bash
# Build
npm run build

# Test compiled output
node dist/nametag-generator.js --help

# Run local test
npm test
```

## Troubleshooting

### Error: "Cannot find module 'typescript'"

**Cause**: TypeScript not installed

**Solution**:

```bash
npm install --save-dev typescript
```

### Error: "error TS2307: Cannot find module '@types/node'"

**Cause**: Node.js type definitions missing

**Solution**:

```bash
npm install --save-dev @types/node
```

### Error: "tsc: command not found"

**Cause**: TypeScript not in PATH

**Solution**:

```bash
# Use npx to run local TypeScript
npx tsc

# Or install globally (not recommended)
npm install -g typescript
```

### Build Succeeds but Runtime Errors

**Cause**: Mismatch between TypeScript source and JavaScript output

**Solution**:

```bash
# Clean build
rm -rf dist/
npm run build

# Verify no stale files
git clean -fdx -e node_modules
npm install
npm run build
```

### "Out of Memory" During Build

**Cause**: Large codebase or limited Node.js heap

**Solution**:

```bash
# Increase Node.js memory limit
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

### TypeScript Version Conflicts

**Cause**: Global vs local TypeScript version mismatch

**Solution**:

```bash
# Always use local version
npx tsc --version

# Update local TypeScript
npm install --save-dev typescript@latest
```

## Build Verification

### Verify Output

Check compiled files:

```bash
# List built files
ls -lh dist/

# Verify main entry point exists
test -f dist/nametag-generator.js && echo "Build successful"

# Check for type declarations
test -f dist/nametag-generator.d.ts && echo "Types generated"
```

### Run Compiled Code

Test the compiled JavaScript:

```bash
# Run directly with Node.js
node dist/nametag-generator.js

# Should display usage information
```

### Validate TypeScript Types

Check types with tsc:

```bash
# Type-check without emitting
npx tsc --noEmit

# Should output no errors
```

---

## Next Steps

- **Run the application**: See [RUN.md](RUN.md)
- **Deploy**: See [DEPLOY.md](DEPLOY.md) for distribution
- **Development**: See [ARCHITECTURE.md](ARCHITECTURE.md) for code structure
- **Automation**: See [CI.md](CI.md) for automated builds

For questions or issues, refer to:

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [npm Documentation](https://docs.npmjs.com/)
