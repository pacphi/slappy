# Continuous Integration

The source of truth is [`.github/workflows/ci.yml`](../.github/workflows/ci.yml). CI runs on pushes and pull requests to `main`, and by manual dispatch.

## Runtime and dependency installation

Local development, CI, and deployment use Node.js 26.x. `package.json` pins `pnpm@12.3.4` and restricts engines to Node 26 and pnpm 12. Install pnpm explicitly with `npm install -g pnpm@12.3.4`; Node 26 does not bundle Corepack.

GitHub Actions uses `actions/checkout@v7`, `pnpm/action-setup@v6` (reading `packageManager`), and `actions/setup-node@v7` with Node 26 and pnpm caching. Installs use `pnpm install --frozen-lockfile`.

pnpm 12 settings, dependency overrides, and allowed dependency build scripts live in `pnpm-workspace.yaml`. Keep that file with `package.json` and `pnpm-lock.yaml` when copying dependency manifests into containers. Regenerate the lockfile with the pinned pnpm version when dependencies or overrides change.

## Checks

Run the relevant checks locally before pushing:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm format:check
pnpm test
pnpm test:local
pnpm build
pnpm test:build
pnpm deadcode
pnpm audit --audit-level=low
```

- ESLint and Prettier check code and formatting.
- `pnpm test` runs the Node test runner through tsx (`tsx --test tests/*.test.ts`) for the shared label generation behavior.
- The CLI sample test generates `sample/sample-roster-tags.html`; CI checks that it exists, is substantial, and contains an HTML doctype.
- `pnpm test:build` runs `node scripts/check-build.mjs` after the build and rejects any uncompiled `@apply` or `@reference` directive in output CSS.
- The Nuxt build produces `.output/`. A successful build alone does not prove PDF browser launch or physical label alignment.
- Knip checks unused code using the repository configuration.
- The audit checks the resolved dependency graph. Review GitHub Dependabot alerts too; their status follows the default branch and may not clear until a fix merges.

Security and dead-code checks are blocking. The security gate uses `--audit-level=low`, so vulnerabilities at every reported severity fail CI. Resolve findings instead of treating the gate as advisory.

## Deployment validation

Build the same Node 26 image used by Fly.io:

```bash
docker build -t slappy:local .
docker run --rm -p 3000:3000 slappy:local
```

In a second terminal, run the deployment smoke test:

```bash
pnpm test:deployment
# To test another running server:
SLAPPY_SMOKE_URL=http://127.0.0.1:3001 pnpm test:deployment
```

`pnpm test:deployment` runs `node scripts/smoke-deployment.mjs`; the default URL is `http://127.0.0.1:3000`. It checks Node 26, the homepage, HTML and PDF page counts for both stocks, and HTTP 400 for an invalid stock.

The Docker builder runs `pnpm build && pnpm test:build`. The **Docker Deployment Smoke Test** CI job builds the Dockerfile, starts a `slappy-smoke` container, and executes the same script inside it:

```bash
docker exec -i slappy-smoke node --input-type=module < scripts/smoke-deployment.mjs
```

This exercises the deployed Node runtime and installed Chromium as the application user. Physical alignment still needs a plain-paper check at actual size before consuming label stock.

The Fly deploy workflow is manually triggered; changing the repository does not automatically update production. See [GitHub Workflows](GITHUB_WORKFLOWS.md) for deployment inputs and [Deployment](DEPLOY.md) for runtime details.

## Artifacts and troubleshooting

CI uploads the Nuxt build and generated sample HTML, with seven-day retention. Inspect a failing run with:

```bash
gh run list --workflow=ci.yml
gh run view <run-id> --log-failed
```

For formatting failures, run `pnpm format`. For frozen-lockfile failures, use Node 26 and pnpm 12.3.4 to reconcile the manifest, workspace settings, and lockfile, then rerun the frozen install. For browser launch failures, reproduce in the Docker image and inspect Chromium installation and `PUPPETEER_EXECUTABLE_PATH`.

The [testing roadmap](planning/TESTING_STRATEGY_ROADMAP_IMPLEMENTATION.md) describes proposed future tests; it is not a list of implemented CI gates.
