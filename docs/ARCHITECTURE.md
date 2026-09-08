# Architecture

Slappy is a Nuxt 4 application and Node CLI sharing CSV, label-layout, HTML, and PDF implementations. Node 26 and pnpm 12 are required. There is no application database or Pinia store.

## Ownership

| Directory                      | Responsibility                                                            |
| ------------------------------ | ------------------------------------------------------------------------- |
| `app/components/`              | Upload, mapping, stock selection, preview, and downloads                  |
| `app/composables/`             | Upload/generation lifecycle, navigation, and saved mappings               |
| `app/utils/`                   | Browser downloads, validation helpers, and user-facing errors             |
| `shared/`                      | Canonical types, request schemas, limits, and the 20-stock catalog        |
| `lib/`                         | CSV decoding, mapping, pagination, Google export retrieval, HTML, and PDF |
| `server/api/`                  | HTTP validation and orchestration                                         |
| `server/utils/request-body.ts` | Bounded request reading and JSON decoding                                 |
| `cli/`                         | Strict argument parsing and command-line orchestration                    |
| `tests/`                       | Unit and integration regressions, including HTTP and real Chromium        |
| `scripts/`                     | Production browser checks, build checks, and quality measurements         |

## Data flow

1. The upload API reads a bounded multipart CSV or retrieves a validated Google Sheets export.
2. `lib/csv-records.ts` uses `csv-parse` for quoted commas, escaped quotes, and multiline fields. Empty records remain available as explicit page boundaries.
3. `lib/data-parser.ts` creates the table preview and preserves the original CSV in `ParsedData.csvContent`. The UI submits that original text with the mapping; it never reconstructs CSV by joining cells.
4. `shared/validation.ts` validates generation input. `lib/column-mapper.ts` maps records into logical pages, skipping the first nonblank record when headers are enabled.
5. `lib/html-generator.ts` paginates for the selected stock, escapes user content, and emits print geometry from `shared/label-templates.ts`.
6. HTML is returned directly or rendered by `lib/pdf-generator.ts` with Chromium. The CLI calls the same implementation.

Stock IDs are stable API and CLI values. Adding a stock requires verified manufacturer geometry and catalog/geometry regressions. See [catalog research](label-catalog-research.md). Templates use physical units; browser preview is not printer calibration.

## State and UI

The homepage lazily loads the wizard. Nuxt `useState` owns application navigation without module-level mutable state crossing server requests. The wizard owns uploaded data and passes the actual data ref to unsaved-change tracking.

Upload and generation operations use request identifiers so late results cannot replace newer input or undo a reset. Failed uploads do not advance the wizard. Saved mappings are validated, copied defensively, and stored locally with failure handling. Download object URLs are released in a `finally` block.

## Boundaries and resource limits

CSV input is limited to 5 MiB, 10,000 records, and 100 columns. Generation is limited to 500 physical sheets. HTTP bodies allow an additional 64 KiB for JSON/multipart overhead and have a 15-second read deadline. Invalid requests return 400; oversized bodies return 413.

Google Sheets input requires HTTPS on `docs.google.com`, without credentials or a custom port. Export redirects are checked against permitted Google hosts, and response size and duration are bounded.

PDF generation admits two concurrent jobs per process, returns 503 when busy, and applies 30-second operation deadlines. Chromium runs with JavaScript disabled and outbound page requests blocked. Cleanup releases browser resources and the job slot on success or failure. Deployments with many replicas need infrastructure-level quotas if a global admission limit is required.

## Quality gates

```bash
pnpm check:all
pnpm quality:metrics
pnpm build
pnpm test:build
pnpm test:web
pnpm audit --audit-level=low
```

ESLint enforces cyclomatic complexity at most 10 per first-party function, including Vue script blocks. Strict typechecking covers Vue and CLI code. Knip checks unused code and dependencies. c8 requires at least 80% statements, lines, branches, and functions across executable TypeScript in `lib`, `shared`, `app/composables`, `app/utils`, `server`, and `cli`; declaration-only types are excluded. Vue templates are not included in that TypeScript coverage percentage. A separate Vitest gate measures all component `.vue` files with real Nuxt UI, at 80% minimum in all dimensions. Production browser checks exercise the picker and upload-to-preview flow and run axe on four rendered states. See [component testing](quality/vue-component-testing.md).

See [CI](CI.md) and the [brutal honesty report](quality/brutal-honesty-2026-09-08.md) for measurements and limitations. Historical planning documents describe proposals and may not match implemented code.
