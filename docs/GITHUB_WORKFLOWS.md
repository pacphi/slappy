# GitHub Workflows Guide

This guide explains how to use the available GitHub Actions workflows in this repository. These workflows automate testing, deployment, and teardown operations for the Slappy application.

## Table of Contents

- [Available Workflows](#available-workflows)
- [Prerequisites](#prerequisites)
- [CI Workflow](#ci-workflow)
- [Fly Deploy Workflow](#fly-deploy-workflow)
- [Fly Teardown Workflow](#fly-teardown-workflow)
- [Triggering Workflows](#triggering-workflows)
  - [Via GitHub Web Interface](#via-github-web-interface)
  - [Via GitHub CLI (gh)](#via-github-cli-gh)
- [Workflow Artifacts](#workflow-artifacts)
- [Troubleshooting](#troubleshooting)

## Available Workflows

The repository includes three GitHub Actions workflows:

| Workflow         | File                                 | Purpose                       | Trigger          | Manual? |
| ---------------- | ------------------------------------ | ----------------------------- | ---------------- | ------- |
| **CI**           | `.github/workflows/ci.yml`           | Continuous Integration checks | Push, PR, Manual | ✅      |
| **Fly Deploy**   | `.github/workflows/fly-deploy.yml`   | Deploy to Fly.io              | Manual only      | ✅      |
| **Fly Teardown** | `.github/workflows/fly-teardown.yml` | Destroy Fly.io deployment     | Manual only      | ✅      |

## Prerequisites

### For All Workflows

- **GitHub repository access**: Contributor permission or higher
- **GitHub Actions enabled**: Workflows must be enabled in repository settings

### For Fly.io Workflows

- **Fly.io account**: Sign up at [fly.io](https://fly.io)
- **FLY_API_TOKEN secret**: Required for deployment and teardown
  - Get your token: `flyctl auth token`
  - Add to GitHub: Repository Settings → Secrets and variables → Actions → New repository secret
  - Name: `FLY_API_TOKEN`
  - Value: Your Fly.io API token
- **GOOGLE_ADSENSE_ACCOUNT secret** (optional): For Google AdSense integration
  - Get your Publisher ID from Google AdSense dashboard
  - Add to GitHub: Repository Settings → Secrets and variables → Actions → New repository secret
  - Name: `GOOGLE_ADSENSE_ACCOUNT`
  - Value: Your Publisher ID (e.g., `ca-pub-1234567890123456`)

### For GitHub CLI Usage

- **GitHub CLI installed**: Download from [cli.github.com](https://cli.github.com/)
- **Authentication**: Run `gh auth login` to authenticate

## CI Workflow

### Overview

The CI workflow runs automated quality checks on your code to ensure it meets project standards.

**File**: `.github/workflows/ci.yml`

**What it checks:**

- ✅ **Linting** - ESLint code quality checks
- ✅ **Formatting** - Prettier code style verification
- ✅ **Build** - Nuxt web application build
- ✅ **CLI Testing** - Test CLI tool with sample data
- ✅ **Security** - pnpm audit for vulnerabilities
- ✅ **Dead Code** - Knip for unused exports

### Automatic Triggers

The CI workflow runs automatically on:

- **Push to main branch** - Every commit to main
- **Pull requests to main** - Every PR opened or updated
- **Manual dispatch** - On-demand via web UI or CLI

### Jobs Breakdown

#### 1. Lint & Format Check

Validates code quality and style:

```bash
pnpm lint          # ESLint checks
pnpm format:check  # Prettier verification
```

**Duration**: ~1-2 minutes

#### 2. Build Nuxt Web App

Builds the Nuxt application with Puppeteer support:

```bash
pnpm build         # Nuxt production build
```

**Artifacts**: Uploads `.output/` directory for inspection

**Duration**: ~3-5 minutes

#### 3. Test CLI Tool

Tests the CLI with sample CSV data:

```bash
pnpm test:local    # Generate tags from sample/sample-roster.csv
```

**Validation**:

- Verifies HTML output file exists
- Checks file size (> 1KB)
- Validates HTML structure

**Artifacts**: Uploads generated HTML file

**Duration**: ~1-2 minutes

#### 4. Security Audit

Scans dependencies for vulnerabilities:

```bash
pnpm audit --audit-level=high
```

**Duration**: ~1 minute

#### 5. Dead Code Detection

Checks for unused exports:

```bash
pnpm deadcode      # Knip analysis
```

**Duration**: ~1 minute

### Viewing CI Results

**Web Interface**:

1. Go to repository → **Actions** tab
2. Click on the workflow run
3. View job results and logs

**Status Checks**:

- ✅ Green checkmark = All checks passed
- ❌ Red X = One or more checks failed
- 🟡 Yellow dot = In progress

## Fly Deploy Workflow

### Overview

The Fly Deploy workflow deploys the Nuxt application to Fly.io infrastructure with configurable resources.

**File**: `.github/workflows/fly-deploy.yml`

**Features**:

- Manual deployment only (no automatic deploys)
- Environment selection (production or staging)
- Region selection (18 global regions)
- Resource configuration (CPU, memory)
- Concurrency control (one deploy at a time)

### Deployment Options

When triggering the workflow, you can configure:

| Option                     | Description                       | Default        | Options                           |
| -------------------------- | --------------------------------- | -------------- | --------------------------------- |
| **environment**            | Deployment target                 | production     | production, staging               |
| **region**                 | Fly.io region                     | sjc (San Jose) | See [regions](#available-regions) |
| **vm_cpus**                | Number of CPUs                    | 1              | 1, 2, 4, 8                        |
| **vm_cpu_kind**            | CPU type                          | shared         | shared, performance               |
| **vm_memory**              | Memory (MB)                       | 1024           | 256, 512, 1024, 2048, 4096, 8192  |
| **google_adsense_enabled** | Enable Google AdSense (prod only) | false          | true, false                       |

### Available Regions

| Code    | Location                   | Code    | Location             |
| ------- | -------------------------- | ------- | -------------------- |
| **ams** | Amsterdam, Netherlands     | **nrt** | Tokyo, Japan         |
| **arn** | Stockholm, Sweden          | **ord** | Chicago, Illinois    |
| **bom** | Mumbai, India              | **sin** | Singapore            |
| **cdg** | Paris, France              | **sjc** | San Jose, California |
| **dfw** | Dallas, Texas              | **syd** | Sydney, Australia    |
| **ewr** | Secaucus, NJ               | **yyz** | Toronto, Canada      |
| **fra** | Frankfurt, Germany         |         |                      |
| **gru** | São Paulo, Brazil          |         |                      |
| **iad** | Ashburn, Virginia          |         |                      |
| **jnb** | Johannesburg, South Africa |         |                      |
| **lax** | Los Angeles, California    |         |                      |
| **lhr** | London, United Kingdom     |         |                      |

### Deployment Process

**What happens during deployment:**

1. **Setup** - Determines target (production or staging)
2. **App Check** - Verifies if Fly.io app exists
3. **Create App** - Creates app if it doesn't exist
4. **Deploy** - Builds Docker image with AdSense build args (if enabled) and deploys to Fly.io

**Duration**: 5-8 minutes (first deploy may take longer for Puppeteer)

**How AdSense Configuration Works:**

When `google_adsense_enabled: true` and `environment: production`:

- The workflow passes your `GOOGLE_ADSENSE_ACCOUNT` GitHub secret as Docker build arguments
- These values are available during `pnpm build` and get embedded in the client bundle
- The Publisher ID appears in the HTML `<meta>` tag and AdSense script URL
- No Fly.io runtime secrets needed (these are public values)

### Deployment Targets

**Production**:

- App name: `slappy`
- URL: https://slappy.fly.dev

**Staging**:

- App name: `slappy-staging`
- URL: https://slappy-staging.fly.dev

### Resource Recommendations

**For production (typical usage)**:

- CPUs: 1 (shared)
- Memory: 1024 MB
- Region: Nearest to your users

**For high-volume PDF generation**:

- CPUs: 2 (shared or performance)
- Memory: 2048 MB
- Region: Nearest to your users

**For testing/staging**:

- CPUs: 1 (shared)
- Memory: 512 MB
- Region: Same as production

## Fly Teardown Workflow

### Overview

The Fly Teardown workflow safely destroys a Fly.io deployment when it's no longer needed.

**File**: `.github/workflows/fly-teardown.yml`

**⚠️ WARNING**: This is a **destructive operation** that permanently deletes the deployment. Use with caution.

### Safety Features

- **Manual trigger only** - Cannot run automatically
- **Confirmation required** - Must type "DESTROY" exactly
- **Environment-specific** - Choose production or staging
- **Pre-flight check** - Verifies app exists before deletion
- **Summary report** - Shows what was destroyed

### Teardown Options

| Option                  | Description           | Required | Values               |
| ----------------------- | --------------------- | -------- | -------------------- |
| **environment**         | Deployment to destroy | ✅ Yes   | production, staging  |
| **confirm_destruction** | Confirmation text     | ✅ Yes   | Must type: `DESTROY` |

### What Gets Deleted

**Removed**:

- ✅ Fly.io app and all its resources
- ✅ All deployed machines/VMs
- ✅ App configuration on Fly.io
- ✅ DNS entries for the app

**Persists**:

- ✅ GitHub repository and code
- ✅ Fly.io account and API tokens
- ✅ Local configuration files (`fly.toml`, workflows)
- ✅ Git history

### When to Use Teardown

**Appropriate scenarios**:

- Removing staging environments after testing
- Cleaning up old deployments
- Reducing infrastructure costs
- Decommissioning the application

**Not recommended**:

- Production environments (unless truly decommissioning)
- During active usage
- Without team coordination

### Teardown Process

**What happens during teardown:**

1. **Validation** - Confirms destruction string matches "DESTROY"
2. **App Check** - Verifies app exists on Fly.io
3. **Destroy** - Permanently deletes the app and resources
4. **Summary** - Reports completion

**Duration**: 1-2 minutes

### Redeploying After Teardown

After teardown, you can redeploy anytime using the Fly Deploy workflow. The `fly.toml` configuration file preserves your settings.

## Triggering Workflows

### Via GitHub Web Interface

This is the easiest method for manual workflows.

#### Triggering CI Workflow

**Automatic**: Runs on every push and PR to main

**Manual**:

1. Go to repository on GitHub
2. Click **Actions** tab
3. Click **CI** in the left sidebar
4. Click **Run workflow** button (top right)
5. Select branch (usually `main`)
6. Click **Run workflow**

#### Triggering Fly Deploy Workflow

1. Go to repository on GitHub
2. Click **Actions** tab
3. Click **Fly Deploy** in the left sidebar
4. Click **Run workflow** button
5. Configure deployment:
   - **Environment**: production or staging
   - **Region**: Select from dropdown (default: sjc)
   - **VM CPUs**: 1, 2, 4, or 8 (default: 1)
   - **VM CPU Kind**: shared or performance (default: shared)
   - **VM Memory**: 256-8192 MB (default: 1024)
   - **Google AdSense Enabled**: Check to enable AdSense (production only)
6. Click **Run workflow**

**Example Configuration (with AdSense)**:

```
Environment: production
Region: sjc (San Jose, California)
VM CPUs: 1
VM CPU Kind: shared
VM Memory: 1024
Google AdSense Enabled: ✓ (checked)
```

**Example Configuration (without AdSense)**:

```
Environment: production
Region: sjc (San Jose, California)
VM CPUs: 1
VM CPU Kind: shared
VM Memory: 1024
Google AdSense Enabled: ☐ (unchecked)
```

#### Triggering Fly Teardown Workflow

⚠️ **Use with extreme caution**

1. Go to repository on GitHub
2. Click **Actions** tab
3. Click **Fly Teardown** in the left sidebar
4. Click **Run workflow** button
5. Configure teardown:
   - **Environment**: production or staging
   - **Confirm destruction**: Type `DESTROY` (must be exact)
6. Click **Run workflow**
7. **Double-check** your inputs before running

**Safety checklist before teardown**:

- [ ] You selected the correct environment
- [ ] You have backups of any critical data
- [ ] Team is aware of the teardown
- [ ] You typed "DESTROY" exactly (case-sensitive)

### Via GitHub CLI (gh)

The GitHub CLI provides command-line access to workflows.

#### Prerequisites

Install and authenticate:

```bash
# Install GitHub CLI (macOS)
brew install gh

# Or install from https://cli.github.com/

# Authenticate
gh auth login
```

#### Triggering CI Workflow

```bash
# Run on main branch
gh workflow run ci.yml

# Run on specific branch
gh workflow run ci.yml --ref feature-branch

# View recent runs
gh run list --workflow=ci.yml
```

#### Triggering Fly Deploy Workflow

**Basic deployment (all defaults)**:

```bash
gh workflow run fly-deploy.yml
```

**Production deployment with defaults (AdSense disabled)**:

```bash
gh workflow run fly-deploy.yml \
  -f environment=production \
  -f region=sjc \
  -f vm_cpus=1 \
  -f vm_cpu_kind=shared \
  -f vm_memory=1024 \
  -f google_adsense_enabled=false
```

**Production deployment with AdSense enabled**:

```bash
gh workflow run fly-deploy.yml \
  -f environment=production \
  -f region=sjc \
  -f vm_cpus=1 \
  -f vm_cpu_kind=shared \
  -f vm_memory=1024 \
  -f google_adsense_enabled=true
```

**Staging deployment**:

```bash
gh workflow run fly-deploy.yml \
  -f environment=staging \
  -f region=sjc \
  -f vm_cpus=1 \
  -f vm_cpu_kind=shared \
  -f vm_memory=512
```

**High-performance production deployment**:

```bash
gh workflow run fly-deploy.yml \
  -f environment=production \
  -f region=sjc \
  -f vm_cpus=2 \
  -f vm_cpu_kind=performance \
  -f vm_memory=2048
```

**Deploy to Europe (Frankfurt)**:

```bash
gh workflow run fly-deploy.yml \
  -f environment=production \
  -f region=fra \
  -f vm_cpus=1 \
  -f vm_cpu_kind=shared \
  -f vm_memory=1024
```

#### Triggering Fly Teardown Workflow

⚠️ **Destructive operation - use with caution**

**Destroy staging environment**:

```bash
gh workflow run fly-teardown.yml \
  -f environment=staging \
  -f confirm_destruction=DESTROY
```

**Destroy production environment**:

```bash
gh workflow run fly-teardown.yml \
  -f environment=production \
  -f confirm_destruction=DESTROY
```

**Important CLI notes**:

- The confirmation must be exactly `DESTROY` (case-sensitive)
- Double-check the environment parameter
- There is no undo operation

#### Monitoring Workflow Runs

**List recent workflow runs**:

```bash
# All workflows
gh run list

# Specific workflow
gh run list --workflow=fly-deploy.yml

# Only failed runs
gh run list --status=failure

# Last 10 runs
gh run list --limit=10
```

**Watch a running workflow**:

```bash
# Get the run ID from the list
gh run list --workflow=fly-deploy.yml

# Watch specific run
gh run watch <run-id>

# Watch latest run
gh run watch
```

**View workflow logs**:

```bash
# View logs for a specific run
gh run view <run-id> --log

# View logs for latest run
gh run view --log

# View failed run logs
gh run view <run-id> --log-failed
```

**Check workflow status**:

```bash
# Status of specific run
gh run view <run-id>

# Check if workflow passed/failed
gh run view <run-id> --exit-status
```

## Workflow Artifacts

Workflows may produce artifacts that you can download for inspection.

### CI Workflow Artifacts

**Available artifacts**:

- `nuxt-build` - Compiled Nuxt application (`.output/` directory)
- `test-output-html` - Generated HTML from CLI test

**Retention**: 7 days

**Downloading via web**:

1. Go to workflow run
2. Scroll to **Artifacts** section
3. Click artifact name to download

**Downloading via CLI**:

```bash
# List artifacts for a run
gh run view <run-id> --log

# Download specific artifact
gh run download <run-id> -n nuxt-build

# Download all artifacts
gh run download <run-id>
```

### Using Artifacts

**Inspect Nuxt build**:

```bash
# Download nuxt-build artifact
gh run download <run-id> -n nuxt-build

# Inspect contents
ls -R .output/

# Check bundle sizes
du -sh .output/public/_nuxt/*
```

**Review CLI test output**:

```bash
# Download test-output-html artifact
gh run download <run-id> -n test-output-html

# Open in browser
open sample/sample-roster-tags.html
```

## Troubleshooting

### CI Workflow Issues

#### Linting Failures

**Symptom**: CI fails on lint job

**Solution**:

```bash
# Fix locally first
pnpm lint:fix
pnpm format

# Commit fixes
git add .
git commit -m "Fix linting errors"
git push
```

#### Build Failures

**Symptom**: CI fails on Nuxt build

**Solution**:

```bash
# Test build locally
pnpm build

# If successful locally, may be CI environment issue
# Check workflow logs for specific error
gh run view <run-id> --log-failed
```

#### CLI Test Failures

**Symptom**: HTML output not generated or invalid

**Solution**:

```bash
# Test CLI locally
pnpm test:local

# Verify sample CSV exists
cat sample/sample-roster.csv

# Check generated output
open sample/sample-roster-tags.html
```

### Fly Deploy Workflow Issues

#### Missing FLY_API_TOKEN

**Symptom**: Workflow fails with authentication error

**Solution**:

1. Get your Fly.io API token:

   ```bash
   flyctl auth token
   ```

2. Add to GitHub secrets:
   - Repository Settings → Secrets and variables → Actions
   - New repository secret
   - Name: `FLY_API_TOKEN`
   - Value: (paste token)

#### Missing GOOGLE_ADSENSE_ACCOUNT (AdSense Enabled)

**Symptom**: Deployment succeeds but AdSense Publisher ID is missing from HTML when `google_adsense_enabled=true`

**Solution**:

1. Get your Google AdSense Publisher ID from your AdSense dashboard

2. Add to GitHub secrets:
   - Repository Settings → Secrets and variables → Actions
   - New repository secret
   - Name: `GOOGLE_ADSENSE_ACCOUNT`
   - Value: Your Publisher ID (e.g., `ca-pub-1234567890123456`)

3. Redeploy with `google_adsense_enabled: true`

**Note**: This secret is only required if you enable AdSense during deployment. The workflow passes it as a Docker build argument, so it gets embedded in the client-side bundle.

#### App Creation Failures

**Symptom**: Cannot create Fly.io app

**Possible causes**:

- App name already taken
- Insufficient Fly.io account permissions
- Region not available

**Solution**:

```bash
# Check if app name is available
flyctl apps list

# Try different region
# Use workflow with different region parameter
```

#### Deployment Timeouts

**Symptom**: Deployment takes too long or times out

**Solution**:

- Increase VM memory (Puppeteer needs more RAM)
- Use deployment with `vm_memory=2048`
- Check Fly.io status page for outages

### Fly Teardown Workflow Issues

#### Confirmation Not Accepted

**Symptom**: "Confirmation failed" error

**Solution**:

- Must type exactly `DESTROY` (all caps, no spaces)
- Re-run workflow with correct confirmation

#### App Not Found

**Symptom**: "App does not exist" message

**Solution**:

- App may already be deleted
- Check Fly.io apps: `flyctl apps list`
- Verify environment parameter (production vs staging)

### GitHub CLI Issues

#### Authentication Failures

**Symptom**: `gh` commands fail with auth error

**Solution**:

```bash
# Re-authenticate
gh auth login

# Check auth status
gh auth status

# Use specific account
gh auth login --hostname github.com
```

#### Workflow Not Found

**Symptom**: "could not find workflow" error

**Solution**:

```bash
# List available workflows
gh workflow list

# Use exact workflow filename
gh workflow run fly-deploy.yml  # Not "fly deploy"
```

#### Permission Denied

**Symptom**: Cannot trigger workflow

**Solution**:

- Verify you have write access to repository
- Check if GitHub Actions is enabled
- Confirm workflow file exists in `.github/workflows/`

---

## Quick Reference

### Common Commands

```bash
# CI Workflow
gh workflow run ci.yml

# Deploy to production
gh workflow run fly-deploy.yml -f environment=production

# Deploy to staging
gh workflow run fly-deploy.yml -f environment=staging

# Watch latest run
gh run watch

# View recent runs
gh run list --limit=5

# Download artifacts
gh run download <run-id>
```

### Workflow Files

- `.github/workflows/ci.yml` - Continuous Integration
- `.github/workflows/fly-deploy.yml` - Fly.io Deployment
- `.github/workflows/fly-teardown.yml` - Fly.io Teardown

### Related Documentation

- **[CI/CD Implementation](CI.md)** - Technical details of CI/CD setup
- **[Deployment Guide](DEPLOY.md)** - All deployment options
- **[Build Guide](BUILD.md)** - Building from source

For questions or issues, refer to:

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [Fly.io Documentation](https://fly.io/docs/)
