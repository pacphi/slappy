# Deployment Guide

This guide provides instructions for deploying the Slappy in various environments, including distribution as an npm package, Docker container, or standalone executable.

- [Deployment Guide](#deployment-guide)
  - [Deployment Options](#deployment-options)
  - [Prerequisites](#prerequisites)
  - [NPM Package Distribution](#npm-package-distribution)
    - [Publishing to npm Registry](#publishing-to-npm-registry)
    - [Private npm Registry](#private-npm-registry)
    - [GitHub Packages](#github-packages)
  - [Docker Deployment](#docker-deployment)
    - [Building Docker Image](#building-docker-image)
    - [Running the Web Application](#running-the-web-application)
    - [Docker Compose](#docker-compose)
    - [Pushing to Container Registry](#pushing-to-container-registry)
  - [Standalone Executable](#standalone-executable)
    - [Using pkg](#using-pkg)
    - [Using Bun](#using-bun)
    - [Distribution](#distribution)
  - [Web Application Deployment](#web-application-deployment)
    - [Common Features](#common-features)
  - [Fly.io Deployment](#flyio-deployment)
    - [Prerequisites](#prerequisites-1)
    - [Quick Deployment](#quick-deployment)
    - [Configuration Details](#configuration-details)
  - [Vercel Deployment](#vercel-deployment)
    - [Prerequisites](#prerequisites-2)
    - [Quick Deployment](#quick-deployment-1)
    - [Configuration](#configuration)
    - [PDF Generation on Vercel](#pdf-generation-on-vercel)
    - [Environment Variables](#environment-variables)
    - [Deployment Commands](#deployment-commands)
    - [Custom Domain](#custom-domain)
    - [Pros \& Cons](#pros--cons)
  - [Cloudflare Pages Deployment](#cloudflare-pages-deployment)
    - [Prerequisites](#prerequisites-3)
    - [Quick Deployment](#quick-deployment-2)
    - [Configuration](#configuration-1)
    - [PDF Generation on Cloudflare](#pdf-generation-on-cloudflare)
    - [Environment Variables](#environment-variables-1)
    - [Custom Domain](#custom-domain-1)
    - [Pros \& Cons](#pros--cons-1)
    - [Recommendation](#recommendation)
  - [Netlify Deployment](#netlify-deployment)
    - [Prerequisites](#prerequisites-4)
    - [Quick Deployment](#quick-deployment-3)
    - [Configuration](#configuration-2)
    - [PDF Generation on Netlify](#pdf-generation-on-netlify)
    - [Environment Variables](#environment-variables-2)
    - [Custom Domain](#custom-domain-2)
    - [Pros \& Cons](#pros--cons-2)
    - [Recommendation](#recommendation-1)
  - [Fly.io Deployment Commands](#flyio-deployment-commands)
    - [Environment Variables](#environment-variables-3)
    - [Cost Optimization](#cost-optimization)
    - [Custom Domain](#custom-domain-3)
    - [Updating the App](#updating-the-app)
    - [Troubleshooting Fly.io Deployment](#troubleshooting-flyio-deployment)
      - [Build failures](#build-failures)
      - [Out of memory errors](#out-of-memory-errors)
      - [Slow startup](#slow-startup)
  - [Troubleshooting](#troubleshooting)
    - [npm Publish Errors](#npm-publish-errors)
      - [Error: "403 Forbidden"](#error-403-forbidden)
    - [Docker Build Failures](#docker-build-failures)
      - [Error: "Cannot find module"](#error-cannot-find-module)
      - [Error: "Permission denied"](#error-permission-denied)
    - [Standalone Executable Issues](#standalone-executable-issues)
      - [Error: "Module not found in snapshot"](#error-module-not-found-in-snapshot)
      - [Large executable size](#large-executable-size)
  - [Useful Commands Reference](#useful-commands-reference)
  - [Next Steps](#next-steps)

## Deployment Options

Slappy provides both a **Nuxt web application** with multi-step wizard and **CLI tool** with column mapping for generating print-ready name tags in HTML or PDF format.

| Method                     | Best For                         | Pros                                                           | Cons                                                           |
| -------------------------- | -------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------- |
| **Fly.io (Web App)**       | Non-technical users, teams       | Browser access, no installation, column mapping UI, PDF export | Requires hosting (~$0-5/mo), Puppeteer increases memory needs  |
| **Vercel (Web App)**       | Zero-config deployment           | Instant deployment, edge network, serverless                   | Cold starts, Puppeteer requires pro plan for memory            |
| **Cloudflare Pages**       | Edge-first deployment            | Global CDN, fast cold starts, generous free tier               | Limited Node.js APIs, may need Worker for some features        |
| **Netlify (Web App)**      | JAMstack deployment              | Easy setup, build plugins, edge functions                      | Function timeouts, Puppeteer memory limits                     |
| **Docker**                 | Isolated environments, CI/CD     | Consistent runtime, no local deps, includes Chromium           | Larger image size (~500MB with Puppeteer)                      |
| **NPM Package (CLI only)** | Node.js users, development teams | Easy updates, standard tooling, CLI with mapping flags         | Requires Node.js + Puppeteer installed                         |
| **Standalone Binary**      | End users, automation scripts    | No Node.js required, simple                                    | Very large with PDF support (200MB+), platform-specific builds |

## Prerequisites

Before deploying, ensure you have completed the build process (see [BUILD.md](BUILD.md)) and have:

- **Node.js 20+** and **pnpm** installed
- **Nuxt built** (`pnpm build` creates `.output/` directory)
- **Puppeteer 24+** (for PDF generation - installed via pnpm)
- **Git** for version control
- **Docker** (optional, for container deployment)
- **npm account** (optional, for CLI package publishing)

**Note**: For PDF generation, Puppeteer requires Chrome/Chromium. In Docker/Fly.io deployments, this is handled automatically. For local development, Puppeteer downloads Chromium during `pnpm install`.

## NPM Package Distribution

### Publishing to npm Registry

**Public npm package** allows anyone to install via `npm install`:

1. **Update package.json**:

   ```json
   {
     "name": "slappy",
     "version": "1.0.0",
     "description": "Generate TownStix US-10 format name tags from Google Sheets",
     "main": "dist/nametag-generator.js",
     "bin": {
       "slappy": "./dist/nametag-generator.js"
     },
     "files": ["dist/", "README.md", "LICENSE"],
     "keywords": ["slappy", "labels", "name-tags", "google-sheets"],
     "license": "MIT"
   }
   ```

2. **Build the project**:

   ```bash
   npm run build
   ```

3. **Login to npm**:

   ```bash
   npm login
   ```

4. **Publish**:

   ```bash
   npm publish
   ```

5. **Users can install globally**:

   ```bash
   npm install -g slappy

   # Basic usage
   slappy <SPREADSHEET_ID> <GID>

   # Advanced usage with column mapping and PDF
   slappy <SPREADSHEET_ID> <GID> output.pdf \
     --line1-col=0 --line2-col=2 --line3-col=3 \
     --has-headers --format=pdf
   ```

### Private npm Registry

For **internal/team use**, publish to a private registry:

```bash
# Configure private registry
npm config set registry https://registry.your-company.com

# Publish (requires authentication)
npm publish
```

Or use **scoped packages**:

```json
{
  "name": "@yourcompany/slappy",
  "publishConfig": {
    "registry": "https://registry.your-company.com"
  }
}
```

### GitHub Packages

Publish to **GitHub Packages** for team access:

1. **Add to package.json**:

   ```json
   {
     "name": "@yourusername/slappy",
     "repository": {
       "type": "git",
       "url": "https://github.com/pacphi/slappy.git"
     },
     "publishConfig": {
       "registry": "https://npm.pkg.github.com"
     }
   }
   ```

2. **Authenticate**:

   ```bash
   npm login --registry=https://npm.pkg.github.com
   ```

3. **Publish**:

   ```bash
   npm publish
   ```

4. **Install (team members)**:

   ```bash
   npm install @yourusername/slappy
   ```

> **Documentation**: [GitHub Packages: npm](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry)

## Docker Deployment

Docker provides a consistent deployment environment with all dependencies (including Chromium for Puppeteer) bundled together.

**Official Documentation:**

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Build Reference](https://docs.docker.com/engine/reference/commandline/build/)
- [Dockerfile Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)

### Building Docker Image

A production-ready **Dockerfile** is included in the project root ([`Dockerfile`](../Dockerfile)).

**Key features:**

- **Multi-stage build** - Separates deps, build, and runtime stages for efficiency
- **Alpine Linux** - Lightweight Node.js distribution
- **pnpm support** - Uses corepack for package management
- **Puppeteer/Chromium included** - Pre-installed for PDF generation
- **Security best practices** - Runs as non-root user (`nuxt`)
- **Optimized layers** - Efficient caching for faster rebuilds

> **Related files:**
>
> - [`Dockerfile`](../Dockerfile) - Multi-stage build configuration
> - [`.dockerignore`](../.dockerignore) - Excludes unnecessary files from build context

Build the image:

```bash
docker build -t slappy:latest .
```

### Running the Web Application

**Production server:**

```bash
# Run web app on port 3000
docker run -d \
  -p 3000:3000 \
  --name slappy \
  slappy:latest
```

Access at http://localhost:3000

**With environment variables:**

```bash
docker run -d \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  --name slappy \
  slappy:latest
```

**Stop and remove:**

```bash
docker stop slappy
docker remove slappy
```

### Docker Compose

A **docker-compose.yml** configuration is included in the project root ([`docker-compose.yml`](../docker-compose.yml)).

**Production deployment:**

```bash
# Start web service
docker-compose up web -d

# View logs
docker-compose logs -f web

# Stop
docker-compose down
```

**Development with hot reload:**

```bash
# Start dev service
docker-compose up dev

# Your local files are mounted
# Changes trigger hot reload
```

**Configuration** (`docker-compose.yml` includes):

- **web service**: Production build with healthcheck
- **dev service**: Development mode with volume mounts

### Pushing to Container Registry

Push to **Docker Hub**:

```bash
# Tag image
docker tag slappy:latest username/slappy:latest

# Login
docker login

# Push
docker push username/slappy:latest
```

Push to **GitHub Container Registry**:

```bash
# Tag for GHCR
docker tag slappy:latest ghcr.io/username/slappy:latest

# Login to GHCR
echo $GITHUB_TOKEN | docker login ghcr.io -u username --password-stdin

# Push
docker push ghcr.io/username/slappy:latest
```

## Standalone Executable

### Using pkg

**[pkg](https://github.com/vercel/pkg)** bundles Node.js and your app into a single executable:

1. **Install pkg**:

   ```bash
   npm install -g pkg
   ```

2. **Add to package.json**:

   ```json
   {
     "bin": "dist/nametag-generator.js",
     "pkg": {
       "targets": ["node20-macos-x64", "node20-linux-x64", "node20-win-x64"],
       "outputPath": "build"
     }
   }
   ```

3. **Build executables**:

   ```bash
   npm run build
   pkg .
   ```

4. **Output** (in `build/` directory):
   - `slappy-macos` (macOS Intel)
   - `slappy-linux` (Linux x64)
   - `slappy-win.exe` (Windows x64)

5. **Distribute**: Share executables directly with users

### Using Bun

**[Bun](https://bun.sh)** offers faster compilation:

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Compile to standalone executable
bun build nametag-generator.ts --compile --outfile slappy

# Run (basic usage)
./slappy <SPREADSHEET_ID> <GID>

# Run (with column mapping and PDF)
./slappy <SPREADSHEET_ID> <GID> output.pdf \
  --line1-col=0 --line2-col=2 --has-headers --format=pdf
```

**Note**: Standalone executables with PDF generation require bundling Puppeteer and Chromium, which significantly increases file size (200MB+). Consider Docker distribution for PDF functionality.

### Distribution

**GitHub Releases** is ideal for distributing executables:

1. Create executables for each platform
2. Tag a release: `git tag v1.0.0 && git push --tags`
3. Create release on GitHub
4. Upload executables as release assets
5. Users download platform-specific binary

## Web Application Deployment

Slappy Nuxt web application can be deployed to multiple platforms. Each platform has its own strengths for different use cases.

### Common Features

All web deployments provide:

- **Multi-step wizard** - Upload → Map Columns → Preview & Download
- **Flexible column mapping** - Map any column to any tag line with data preview
- **Header detection** - Optional "Has headers" checkbox
- **Dual export formats** - Download as HTML or PDF (high-fidelity via Puppeteer)
- **Browser-based access** for non-technical users
- **No local installation** required
- **Dual input modes**: CSV file upload or Google Sheets URL
- **Live preview** with iframe rendering
- **Light/dark mode** theme toggle
- **Responsive design** for mobile and desktop

## Fly.io Deployment

Fly.io provides full Node.js runtime support, making it ideal for Puppeteer-based PDF generation.

**Official Documentation:**

- [Fly.io Documentation](https://fly.io/docs/)
- [Fly.io Node.js Guide](https://fly.io/docs/languages-and-frameworks/node/)
- [Fly.io Deployment Guide](https://fly.io/docs/hands-on/launch-app/)
- [Fly.io CLI Reference](https://fly.io/docs/flyctl/)

### Prerequisites

- Fly.io account ([sign up here](https://fly.io/app/sign-up))
- Fly CLI installed ([installation guide](https://fly.io/docs/hands-on/install-flyctl/))

### Quick Deployment

The project is **pre-configured** for Fly.io with:

- ✅ **Dockerfile** - Multi-stage Nuxt build with Puppeteer support
- ✅ **fly.toml** - Fly.io configuration
- ✅ **nuxt.config.ts** - Nitro server output

**Deploy in 3 steps**:

```bash
# 1. Install Fly CLI (if not already installed)
curl -L https://fly.io/install.sh | sh

# 2. Login to Fly.io
flyctl auth login

# 3. Deploy the app
flyctl launch
```

Follow the prompts:

- **App name**: Choose a unique name (e.g., `my-slappy-app`)
- **Region**: Select your preferred region (e.g., `sjc` for San Jose)
- **Deploy now**: Yes

The deployment will:

1. Use the Dockerfile to build the Nuxt app
2. Install Chromium for Puppeteer
3. Deploy to Fly.io's infrastructure
4. Provision 1GB RAM (sufficient for PDF generation)

### Configuration Details

The included **fly.toml** configuration:

```toml
app = "slappy"
primary_region = "sjc"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = "stop"
  auto_start_machines = true
  min_machines_running = 0

[[vm]]
  memory = "1gb"
  cpu_kind = "shared"
  cpus = 1

[env]
  NODE_ENV = "production"
```

**Key features**:

- **Auto-scaling**: Machines start on demand and stop when idle (saves costs)
- **Force HTTPS**: All traffic redirected to secure connection
- **1GB memory**: Sufficient for Next.js application with Puppeteer PDF generation
- **Production mode**: Optimized build with Turbopack

**Note on PDF Generation**: PDF generation uses Puppeteer (headless Chrome), which requires additional memory. The configured 1GB RAM is adequate for typical usage. For high-volume PDF generation, consider scaling to 2GB (`flyctl scale memory 2048`).

## Vercel Deployment

Vercel offers zero-configuration Nuxt deployment with excellent performance, though Puppeteer PDF generation requires specific configuration.

**Official Documentation:**

- [Vercel Nuxt Deployment Guide](https://vercel.com/docs/frameworks/nuxt)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)

### Prerequisites

- Vercel account ([sign up here](https://vercel.com/signup))
- GitHub, GitLab, or Bitbucket repository

### Quick Deployment

**Option 1: Deploy from Git (Recommended)**

1. Push your code to GitHub/GitLab/Bitbucket
2. Visit [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Vercel auto-detects Nuxt - no configuration needed
5. Click "Deploy"

**Option 2: Deploy with Vercel CLI**

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? slappy
# - Directory? ./
# - Override settings? No
```

### Configuration

Create `vercel.json` for advanced configuration:

```json
{
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install",
  "framework": "nuxtjs",
  "outputDirectory": ".output/public"
}
```

### PDF Generation on Vercel

**Important**: Puppeteer PDF generation has limitations on Vercel:

**Free/Hobby Tier:**

- 1GB memory limit (may timeout for PDF generation)
- 10-second serverless function timeout
- PDF generation may fail or timeout

**Pro Tier ($20/month):**

- Use `@sparticuz/chromium` for serverless Chrome
- Increase function memory and timeout

**Pro Tier Setup:**

1. Install serverless Chrome:

   ```bash
   pnpm add @sparticuz/chromium
   ```

2. Update `lib/pdf-generator.ts`:

   ```typescript
   import chromium from '@sparticuz/chromium'

   const browser = await puppeteer.launch({
     args: chromium.args,
     executablePath: await chromium.executablePath(),
     headless: chromium.headless,
   })
   ```

3. Configure in `vercel.json`:
   ```json
   {
     "functions": {
       "server/api/generate.post.ts": {
         "memory": 3008,
         "maxDuration": 60
       }
     }
   }
   ```

**Alternative**: For free tier, disable PDF generation and only offer HTML output.

### Environment Variables

No environment variables required for basic functionality. Google Sheets must be publicly published.

### Deployment Commands

```bash
# Deploy to production
vercel --prod

# View deployment logs
vercel logs

# Open deployed app
vercel open

# List deployments
vercel list

# Remove deployment
vercel remove slappy
```

### Custom Domain

1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS records as instructed
4. Vercel handles SSL automatically

### Pros & Cons

**Pros:**

- Zero configuration for Nuxt
- Instant deployments and rollbacks
- Global edge network
- Automatic HTTPS
- Preview deployments for PRs

**Cons:**

- PDF generation requires Pro tier
- Function timeout limits
- Cold starts for serverless functions
- Memory constraints on free tier

## Cloudflare Pages Deployment

Cloudflare Pages offers edge deployment with excellent global performance and generous free tier.

**Official Documentation:**

- [Cloudflare Pages - Nuxt Guide](https://developers.cloudflare.com/pages/framework-guides/deploy-a-nuxt-site/)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare Browser Rendering API](https://developers.cloudflare.com/browser-rendering/)

### Prerequisites

- Cloudflare account ([sign up here](https://dash.cloudflare.com/sign-up/pages))
- GitHub or GitLab repository

### Quick Deployment

**Deploy from Git:**

1. Push code to GitHub/GitLab
2. Visit [dash.cloudflare.com/pages](https://dash.cloudflare.com/pages)
3. Click "Create a project"
4. Connect your repository
5. Configure build settings:
   - **Framework preset**: Nuxt.js
   - **Build command**: `pnpm build`
   - **Build output directory**: `.output/public`
   - **Node version**: 20
6. Click "Save and Deploy"

**Deploy with Wrangler CLI:**

```bash
# Install Wrangler
pnpm add -g wrangler

# Login
wrangler login

# Deploy
pnpm build
wrangler pages deploy .output/public --project-name=slappy
```

### Configuration

Create `wrangler.toml` (optional):

```toml
name = "slappy"
compatibility_date = "2024-01-01"

[build]
command = "pnpm build"

[build.upload]
format = "service-worker"
dir = ".output/public"

[[pages_build_output_dir]]
directory = ".output/public"
```

### PDF Generation on Cloudflare

**Important Limitations:**

Cloudflare Pages/Workers have Node.js compatibility layers but **do not support Puppeteer**:

- No native Chrome/Chromium support
- Cannot run headless browsers
- PDF generation will **not work** out-of-the-box

**Solutions:**

**Option 1: Use Cloudflare Workers with Browser Rendering API (Paid)**

- Requires Cloudflare Workers Paid plan ($5/month)
- Use [Cloudflare Browser Rendering](https://developers.cloudflare.com/browser-rendering/)
- Replace Puppeteer with Cloudflare's browser API

**Option 2: Disable PDF generation**

- Only offer HTML output
- Users can use browser print-to-PDF
- Simplest solution for free tier

**Option 3: Hybrid approach**

- Deploy HTML generation to Cloudflare Pages
- Use separate Fly.io/Vercel function for PDF generation
- Call external API for PDF conversion

### Environment Variables

Set in Pages dashboard → Settings → Environment variables:

```
NODE_VERSION=20
```

### Custom Domain

1. Go to Pages project → Custom domains
2. Add your domain
3. Cloudflare automatically configures DNS (if domain is on Cloudflare)
4. SSL/TLS automatically provisioned

### Pros & Cons

**Pros:**

- Extremely fast edge deployment
- Generous free tier (unlimited requests, 500 builds/month)
- Global CDN with excellent performance
- Automatic HTTPS
- Preview deployments for PRs
- No cold starts

**Cons:**

- **No Puppeteer support** (major limitation for PDF)
- Limited Node.js API compatibility
- Build time limits (20 minutes)
- Requires workarounds for PDF generation

### Recommendation

Cloudflare Pages is **excellent for HTML-only deployment**. For full PDF support, use Fly.io or Vercel Pro.

## Netlify Deployment

Netlify provides easy deployment with build plugins and edge functions.

**Official Documentation:**

- [Netlify Nuxt Guide](https://docs.netlify.com/frameworks/nuxt/)
- [Netlify Documentation](https://docs.netlify.com/)
- [Netlify CLI Documentation](https://docs.netlify.com/cli/get-started/)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)

### Prerequisites

- Netlify account ([sign up here](https://app.netlify.com/signup))
- GitHub, GitLab, or Bitbucket repository

### Quick Deployment

**Deploy from Git:**

1. Push code to Git repository
2. Visit [app.netlify.com](https://app.netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect your repository
5. Configure build settings:
   - **Build command**: `pnpm build`
   - **Publish directory**: `.output/public`
   - **Node version**: 20 (set in `netlify.toml`)
6. Click "Deploy site"

**Deploy with Netlify CLI:**

```bash
# Install Netlify CLI
pnpm add -g netlify-cli

# Login
netlify login

# Initialize
netlify init

# Deploy
netlify deploy --prod
```

### Configuration

Create `netlify.toml`:

```toml
[build]
  command = "pnpm build"
  publish = ".output/public"

[build.environment]
  NODE_VERSION = "20"
  NPM_FLAGS = "--version"  # Use pnpm

[[redirects]]
  from = "/*"
  to = "/.netlify/functions/server"
  status = 200

[functions]
  node_bundler = "esbuild"
  directory = ".output/server"
```

### PDF Generation on Netlify

**Limitations:**

- **Free tier**: 125K function requests/month, 100 hours runtime
- **Timeout**: 10 seconds (free), 26 seconds (pro)
- **Memory**: 1GB (may struggle with Puppeteer)

**Solutions:**

**Option 1: Netlify Pro ($19/month)**

- Increased timeout and memory
- May still struggle with Puppeteer's Chromium dependency

**Option 2: Use Edge Functions with chrome-aws-lambda**

```bash
pnpm add chrome-aws-lambda
```

Update `lib/pdf-generator.ts` for serverless:

```typescript
import chromium from 'chrome-aws-lambda'

const browser = await chromium.puppeteer.launch({
  args: chromium.args,
  executablePath: await chromium.executablePath,
  headless: chromium.headless,
})
```

**Option 3: Disable PDF** (recommended for free tier)

- HTML output only
- Let users use browser print-to-PDF

### Environment Variables

Set in Netlify dashboard → Site settings → Environment variables:

```
NODE_VERSION=20
```

### Custom Domain

1. Go to Domain management
2. Add custom domain
3. Configure DNS records
4. Netlify handles SSL automatically

### Pros & Cons

**Pros:**

- Easy setup and deployment
- Good free tier
- Build plugins ecosystem
- Preview deployments
- Forms and identity features

**Cons:**

- Function timeouts limit PDF generation
- Puppeteer memory constraints
- May require paid plan for reliable PDF generation
- Slower builds than some competitors

### Recommendation

Netlify works well for **HTML output**. For reliable PDF generation, consider Fly.io or upgrade to Netlify Pro.

## Fly.io Deployment Commands

```bash
# Deploy updates
flyctl deploy

# View logs
flyctl logs

# Open app in browser
flyctl open

# Check app status
flyctl status

# Scale resources (if needed)
flyctl scale memory 2048  # Increase to 2GB
flyctl scale count 2      # Run 2 instances

# View environment variables
flyctl config env

# SSH into running machine
flyctl ssh console
```

### Environment Variables

No environment variables are required for basic functionality. Google Sheets URLs must be publicly published.

### Cost Optimization

Fly.io offers generous free tier:

- **3 shared-cpu-1x VMs** with 256MB RAM
- **160GB/month outbound data transfer**

To optimize costs:

- Use `auto_stop_machines = "stop"` (already configured)
- Set `min_machines_running = 0` for infrequent use
- Monitor usage: `flyctl scale show`

### Custom Domain

To use a custom domain:

```bash
# Add domain
flyctl certs create your-domain.com

# Add DNS records (follow Fly.io instructions)
# Usually: CNAME record pointing to your-app.fly.dev

# Verify
flyctl certs show your-domain.com
```

### Updating the App

```bash
# Pull latest changes
git pull

# Deploy
flyctl deploy

# Verify deployment
flyctl open
```

### Troubleshooting Fly.io Deployment

#### Build failures

```bash
# Check logs
flyctl logs

# Test Docker build locally
docker build -t slappy-test .
docker run -p 3000:3000 slappy-test
```

#### Out of memory errors

```bash
# Increase memory allocation
flyctl scale memory 2048
```

#### Slow startup

- Next.js apps can take 10-20 seconds for cold starts
- Consider keeping `min_machines_running = 1` for frequently used apps

> **Note**: The web app is **stateless** - no persistent storage or database required. All processing happens in-memory.

## Troubleshooting

### npm Publish Errors

#### Error: "403 Forbidden"

**Solution**:

```bash
# Verify you're logged in
npm whoami

# Check package name isn't taken
npm search slappy

# Use scoped package
# Change name to "@yourusername/slappy"
```

### Docker Build Failures

#### Error: "Cannot find module"

**Solution**:

```bash
# Ensure dist/ is built before Docker
npm run build

# Check .dockerignore doesn't exclude dist/
cat .dockerignore
```

#### Error: "Permission denied"

**Solution**:

```dockerfile
# Run as non-root user
RUN chown -R node:node /app
USER node
```

### Standalone Executable Issues

#### Error: "Module not found in snapshot"

**Solution** (pkg):

```json
{
  "pkg": {
    "assets": ["node_modules/**/*"]
  }
}
```

#### Large executable size

**Solution**:

- Use `--compress GZip` flag with pkg
- Exclude unnecessary dependencies
- Consider Docker distribution instead

## Useful Commands Reference

| Command                  | Description                              |
| ------------------------ | ---------------------------------------- |
| `pnpm build`             | Build Nuxt application                   |
| `pnpm preview`           | Preview production build                 |
| `docker build -t name .` | Build Docker image                       |
| `docker run --rm name`   | Run container (remove after exit)        |
| `docker-compose up -d`   | Start services in background             |
| `docker push name`       | Push to registry                         |
| `flyctl deploy`          | Deploy to Fly.io                         |
| `flyctl logs`            | View Fly.io application logs             |
| `vercel --prod`          | Deploy to Vercel production              |
| `wrangler pages deploy`  | Deploy to Cloudflare Pages               |
| `netlify deploy --prod`  | Deploy to Netlify production             |
| `npm publish`            | Publish CLI tool to npm registry         |
| `npm version patch`      | Bump CLI package version (1.0.0 → 1.0.1) |

---

## Next Steps

- **Versioning**: Use semantic versioning for releases
- **Documentation**: Keep README and docs up-to-date
- **Testing**: Test builds on all target platforms
- **CI/CD**: Automate builds and deployments (see [CI.md](CI.md))
- **Distribution**: Choose deployment method based on target audience

For questions or issues, refer to:

- **Deployment Platforms:**
  - [Fly.io Documentation](https://fly.io/docs/)
  - [Vercel Documentation](https://vercel.com/docs)
  - [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
  - [Netlify Documentation](https://docs.netlify.com/)
- **Containerization:**
  - [Docker Documentation](https://docs.docker.com/)
  - [Docker Compose Documentation](https://docs.docker.com/compose/)
- **Package Management:**
  - [npm Documentation](https://docs.npmjs.com/)
  - [pnpm Documentation](https://pnpm.io/)
- **Build Tools:**
  - [Nuxt Documentation](https://nuxt.com/docs)
  - [Nitro Documentation](https://nitro.unjs.io/)
- **Additional Tools:**
  - [pkg GitHub](https://github.com/vercel/pkg)
  - [Puppeteer Documentation](https://pptr.dev/)
