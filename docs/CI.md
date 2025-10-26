# Continuous Integration (CI/CD)

This document describes the CI/CD setup for the Slappy, including linting, code formatting, vulnerability scanning, dead code detection, and automated deployments.

## Table of Contents

- [Overview](#overview)
- [GitHub Actions Workflows](#github-actions-workflows)
- [Quality Checks](#quality-checks)
- [Automated Testing](#automated-testing)
- [Deployment Automation](#deployment-automation)
- [Local Development](#local-development)
- [Troubleshooting](#troubleshooting)

## Overview

The CI/CD pipeline ensures code quality, security, and consistency through automated checks on every push and pull request.

**Automated checks:**

- ✅ **Linting** - ESLint for code quality
- ✅ **Formatting** - Prettier for consistent style
- ✅ **Vulnerability scanning** - npm audit and Snyk
- ✅ **Dead code detection** - ts-prune and depcheck
- ✅ **Type checking** - TypeScript compiler
- ✅ **Build verification** - Ensure code compiles

## GitHub Actions Workflows

### Main CI Workflow

**File**: `.github/workflows/ci.yml` (to be implemented)

**Triggers:**

- Push to `main` branch
- Pull requests to `main`
- Manual workflow dispatch

**Jobs:**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:

jobs:
  lint:
    name: Lint & Format Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run format:check

  type-check:
    name: TypeScript Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run type-check

  build:
    name: Build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/

  test:
    name: Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test

  security:
    name: Security Audit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm audit --audit-level=high
      - name: Run Snyk Security Scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  dead-code:
    name: Dead Code Detection
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run dead-code
```

### Release Workflow

**File**: `.github/workflows/release.yml` (to be implemented)

**Triggers:**

- Tag push matching `v*.*.*`

**Jobs:**

- Build for multiple platforms
- Create GitHub release
- Upload standalone executables
- Publish to npm (optional)
- Build and push Docker image

## Quality Checks

### 1. Linting (ESLint)

**Purpose**: Enforce code quality and catch common errors

**Setup**:

Install ESLint and TypeScript plugin:

```bash
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

Create `.eslintrc.json`:

```json
{
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "plugins": ["@typescript-eslint"],
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "no-console": "off"
  },
  "ignorePatterns": ["dist/", "node_modules/"]
}
```

Create `.eslintignore`:

```
dist/
node_modules/
*.js
*.d.ts
```

Add npm script to `package.json`:

```json
{
  "scripts": {
    "lint": "eslint . --ext .ts",
    "lint:fix": "eslint . --ext .ts --fix"
  }
}
```

**Run locally:**

```bash
npm run lint
npm run lint:fix  # Auto-fix issues
```

### 2. Code Formatting (Prettier)

**Purpose**: Enforce consistent code style

**Setup**:

Install Prettier:

```bash
npm install --save-dev prettier
```

Create `.prettierrc.json`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "avoid"
}
```

Create `.prettierignore`:

```text
dist/
node_modules/
*.html
*.md
package-lock.json
```

Add npm scripts:

```json
{
  "scripts": {
    "format": "prettier --write \"**/*.{ts,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,json,md}\""
  }
}
```

**Run locally:**

```bash
npm run format        # Format all files
npm run format:check  # Check formatting (CI)
```

### 3. Vulnerability Scanning

**Purpose**: Detect security vulnerabilities in dependencies

**Option A: npm audit (Built-in)**

```bash
npm audit                    # View vulnerabilities
npm audit fix                # Auto-fix (may break changes)
npm audit --audit-level=high # Fail only on high+ severity
```

Add to `package.json`:

```json
{
  "scripts": {
    "audit": "npm audit --audit-level=moderate"
  }
}
```

**Option B: Snyk (Recommended)**

Sign up at [snyk.io](https://snyk.io) and get API token.

Install Snyk CLI:

```bash
npm install --save-dev snyk
```

Add npm script:

```json
{
  "scripts": {
    "security": "snyk test"
  }
}
```

Set environment variable:

```bash
export SNYK_TOKEN=your-snyk-token
npm run security
```

**GitHub Actions integration**: Add `SNYK_TOKEN` to repository secrets.

### 4. Dead Code Detection

**Purpose**: Identify unused exports and dependencies

**Tool A: ts-prune (Unused Exports)**

Install:

```bash
npm install --save-dev ts-prune
```

Add script:

```json
{
  "scripts": {
    "dead-code": "ts-prune"
  }
}
```

Run:

```bash
npm run dead-code
```

**Tool B: depcheck (Unused Dependencies)**

Install:

```bash
npm install --save-dev depcheck
```

Add script:

```json
{
  "scripts": {
    "deps:check": "depcheck"
  }
}
```

Run:

```bash
npm run deps:check
```

### 5. Type Checking

**Purpose**: Verify TypeScript types without emitting code

Add script:

```json
{
  "scripts": {
    "type-check": "tsc --noEmit"
  }
}
```

Run:

```bash
npm run type-check
```

## Automated Testing

### Integration Tests

**Current test**: `cli/test-local.ts` provides basic integration testing with sample CSV.

Run locally:

```bash
pnpm test:local
```

**CI Integration:**

The GitHub Actions CI workflow includes a test job that validates the CLI with sample data:

```yaml
test-cli:
  name: Test CLI Tool
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v5

    - uses: pnpm/action-setup@v4
      with:
        version: 10

    - name: Setup Node.js
      uses: actions/setup-node@v6
      with:
        node-version: '20'
        cache: 'pnpm'

    - name: Install dependencies
      run: pnpm install --frozen-lockfile

    - name: Test CLI with sample data
      run: pnpm test:local

    - name: Verify output HTML file
      run: |
        if [ ! -f "sample/sample-roster-tags.html" ]; then
          echo "Error: Output HTML file not generated"
          exit 1
        fi
        echo "✓ HTML file generated successfully"

    - name: Upload test artifacts
      uses: actions/upload-artifact@v5
      if: always()
      with:
        name: test-output
        path: sample/sample-roster-tags.html
        retention-days: 7
```

This test:

1. Runs the CLI with `sample/sample-roster.csv`
2. Generates HTML output
3. Verifies the file was created
4. Uploads the generated HTML as an artifact

### Unit Tests (Future)

**Setup with Vitest** (recommended for Nuxt):

```bash
pnpm add -D vitest @nuxt/test-utils
```

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
})
```

Add scripts:

```json
{
  "scripts": {
    "test:unit": "vitest",
    "test:coverage": "vitest --coverage"
  }
}
```

## Deployment Automation

### Docker Image Build

**Workflow**: `.github/workflows/docker.yml` (to be implemented)

```yaml
name: Docker Build

on:
  push:
    tags: ['v*.*.*']

jobs:
  docker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository }}
          tags: |
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
```

### npm Package Publishing

**Workflow**: `.github/workflows/npm-publish.yml` (to be implemented)

```yaml
name: Publish to npm

on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'

      - run: npm ci
      - run: npm run build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**Setup**: Add `NPM_TOKEN` to repository secrets.

## Local Development

### Pre-commit Hooks (Recommended)

Install Husky for Git hooks:

```bash
npm install --save-dev husky lint-staged
npx husky init
```

Create `.husky/pre-commit`:

```bash
#!/bin/sh
npx lint-staged
```

Add to `package.json`:

```json
{
  "lint-staged": {
    "*.ts": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

**Now**: Every commit automatically lints and formats changed files.

### VS Code Integration

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

Install VS Code extensions:

- **ESLint** (`dbaeumer.vscode-eslint`)
- **Prettier** (`esbenp.prettier-vscode`)

## Troubleshooting

### CI Build Fails: "Module not found"

**Cause**: Missing dependencies

**Solution**:

```bash
# Ensure package-lock.json is committed
git add package-lock.json
git commit -m "Add package-lock.json"

# Use npm ci instead of npm install in CI
```

### Linting Errors Block PR

**Cause**: Code doesn't meet style guidelines

**Solution**:

```bash
# Auto-fix locally
npm run lint:fix
npm run format

# Commit fixes
git add .
git commit -m "Fix linting errors"
```

### npm audit Fails on Low Severity

**Cause**: Audit level too strict

**Solution**:

```bash
# Adjust audit level in package.json
"audit": "npm audit --audit-level=high"
```

### Snyk Token Not Working

**Cause**: Token not set in GitHub secrets

**Solution**:

1. Go to repository Settings → Secrets and variables → Actions
2. Add `SNYK_TOKEN` secret with your Snyk API token
3. Re-run workflow

---

## Implementation Checklist

To fully implement CI/CD for this project:

- [ ] Install ESLint and configure (`.eslintrc.json`)
- [ ] Install Prettier and configure (`.prettierrc.json`)
- [ ] Add linting and formatting scripts to `package.json`
- [ ] Install ts-prune and depcheck
- [ ] Create `.github/workflows/ci.yml`
- [ ] Set up Snyk account and add `SNYK_TOKEN` secret
- [ ] (Optional) Install Husky for pre-commit hooks
- [ ] (Optional) Create `.github/workflows/release.yml` for releases
- [ ] (Optional) Create `.github/workflows/docker.yml` for Docker builds

## Next Steps

- **Understand architecture**: See [ARCHITECTURE.md](ARCHITECTURE.md)
- **Build from source**: See [BUILD.md](BUILD.md)
- **Deploy**: See [DEPLOY.md](DEPLOY.md)

For questions or contributions, refer to:

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [Snyk Documentation](https://docs.snyk.io/)
