# Brutal honesty review and remediation

Date: 2026-09-08 UTC. Baseline: `e066b92` (20-stock catalog). Remediation branch: `feat/qe-maintainability`.

## Verdict

The catalog expansion worked, but its 31 passing tests did not establish application-wide reliability. CSV corruption, broken CLI fetching, stale UI state, weak request boundaries, and missing type/coverage gates were real defects. Adding more labels exposed existing maintenance debt; the solution was to fix shared boundaries and ownership, not multiply stock-specific code.

All verified repository defects listed below are remediated. AQE itself has unresolved measurement/orchestration limitations described separately. No trustworthy overall 0–100 score is claimed.

## Findings and closure

| Priority | Broken behavior and consequence                                                                                                                 | Remediation                                                                                                                    | Regression evidence                                                                 |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| High     | Duplicated ad hoc CSV parsers mishandled escaped quotes and multiline values. UI joined cells back into CSV, corrupting commas and page breaks. | One maintained `csv-parse` boundary; preserve original CSV; header handling agrees with preview even after leading blank rows. | `tests/csv-data.test.ts`; production quoted-roster browser flow                     |
| High     | CLI passed an ID and GID to a fetcher expecting a URL; flags accepted malformed values.                                                         | Strict argument parser, correct Sheets URL, shared generation schema and sheet cap.                                            | `tests/cli.test.ts`, including subprocess and fetch-boundary tests                  |
| High     | APIs trusted malformed mappings/options and buffered unbounded input; output could allocate excessive sheets.                                   | Shared Zod schemas; bounded streaming body reader, CSV limits, output cap and explicit client errors.                          | `tests/api.test.ts`, oversized/chunked bodies, invalid options, multipart parsing   |
| High     | Google exports could consume excessive resources or follow unsafe destinations.                                                                 | Validate input and each redirect; bound bytes, redirects, and duration.                                                        | `tests/sheets-fetcher.test.ts`                                                      |
| High     | Concurrent PDF requests could launch unlimited browsers and hang operations.                                                                    | Two jobs per process, operation deadlines, finally cleanup, disabled JS and blocked outbound page requests.                    | `tests/pdf-generator.test.ts`, actual PDFs, capacity/recovery and resource blocking |
| Medium   | Late uploads could undo a reset or replace newer data; failed uploads could advance the wizard.                                                 | Request identity tracking, explicit success result, clear obsolete mapping/preview state.                                      | `tests/frontend-state.test.ts`, production upload flow                              |
| Medium   | Unsaved-change detection observed a separate upload instance; module navigation refs could cross SSR requests.                                  | Pass real data ref; Nuxt request-scoped state; lifecycle cleanup.                                                              | `tests/frontend-navigation.test.ts`                                                 |
| Medium   | Stored mapping JSON was trusted and dictionary keys could interact with object prototypes.                                                      | Schema validation, null-prototype dictionary, defensive copies and storage failure handling.                                   | Frontend state/navigation tests                                                     |
| Medium   | Download cleanup and error classification were inconsistent.                                                                                    | Shared finally-safe download helper; specific error classification before generic matching.                                    | Frontend regressions                                                                |
| Medium   | Type drift, repeated type definitions and pass-through server wrappers hid ownership.                                                           | Canonical `shared/types.ts`, direct library imports, corrected UI props and current typed SEO API.                             | Strict Vue plus CLI TypeScript checks                                               |
| Medium   | Three functions exceeded complexity 10; duplicate parsing amplified changes.                                                                    | Extract cohesive parsing/options/download boundaries; enforce ESLint complexity 10 in first-party TS and Vue scripts.          | `pnpm quality:metrics` and blocking lint                                            |
| Medium   | Unused state libraries/components and broad dead-code ignores increased maintenance cost.                                                       | Remove Pinia/Colada/date-fns, dead components and wrappers; narrow Knip configuration.                                         | `pnpm deadcode`, production build                                                   |
| Low      | Wizard inflated initial bundle and documentation described deleted components.                                                                  | Lazy-load wizard; replace stale architecture description; document actual CI gates.                                            | Build no longer reports oversized client chunk; production browser flow             |

## Measurements

The original commit was exported to an isolated temporary checkout and tested with the same c8 configuration and installed instrumentation as the final source. Declaration-only types are excluded consistently. Raw summary counters are preserved in [measurements](measurements-2026-09-08.json).

| Metric                          | Baseline |  After |
| ------------------------------- | -------: | -----: |
| Tests passing                   |       31 |     94 |
| Statements / lines              |   38.41% | 99.47% |
| Branches                        |   59.37% | 95.26% |
| Functions                       |   31.25% |   100% |
| Maximum per-function complexity |       17 |     10 |
| Functions above 10              |        3 |      0 |

Coverage includes executable TypeScript in `lib`, `shared`, `app/composables`, `app/utils`, `server`, and `cli`, including otherwise unexecuted files. It does **not** measure Vue templates or all rendered component behavior. c8/V8 function counters are not the same inventory as ESLint AST function counters. Remaining uncovered lines include CLI error handling and exceptional cleanup paths; high coverage is not proof of correctness.

Validation: 94 Node tests; strict Vue/CLI types; lint; formatting; Knip; production build and CSS check; actual browser/API smoke tests; dependency audit. CI now preserves coverage and complexity artifacts and blocks regressions below 80% coverage or above complexity 10.

## Agentic QE: actual results and tool defects

Agentic QE 3.14.0 was initialized and used for coverage-gap analysis, security scanning, quality assessment and scoped code metrics. Its brutal-honesty-review skill guided the report. Native coding agents handled bounded remediation only after the AQE orchestration failure was disclosed; their output is not represented as an AQE fleet result.

- **Orchestration failed:** the local embedding backend required unavailable `@huggingface/transformers` or a configured embedder endpoint. Installing an optional dependency chain with high advisories was not an acceptable remedy. A later explicitly scoped quality task stalled and was cancelled; it produced no completed assessment.
- **Coverage-gap analysis worked:** supplied c8 data identified untested composables and helpers, now covered by behavior regressions.
- **SAST needs triage:** the final scan reported ten medium path-traversal findings on static relative imports, zero high/critical findings. These imports do not accept user-controlled paths; they are false positives, not ten vulnerabilities fixed by rearranging imports. Dependency audit is a separate check.
- **Default quality score is invalid for this repository:** the final public `quality_assess(runGate: true)` returned **28/100**, coverage **-1**, complexity **23804.71**, and a block decision. This is recorded, not relabeled as a pass. Inspection of installed AQE source shows its fallback discovery scans the repository root, includes `.output`, and omits `.vue`. A diagnostic discovery selected 64 files, including 25 generated files and zero Vue files. The score changes with generated output and cannot judge first-party function complexity or actual measured coverage.
- **Scoped AQE analysis is reproducible:** `AQE_PACKAGE_ROOT=/path/to/installed/agentic-qe pnpm quality:aqe` invokes the real installed `CodeMetricsAnalyzer` on explicit first-party TypeScript files and writes `coverage/aqe-scoped.json`. These are file-level heuristic/AST totals, not ESLint per-function measurements. The adapter deliberately emits no synthetic overall score. It depends on an internal AQE API and may need adjustment when AQE changes.

AQE default-gate failure remains an external tooling issue. The repository gates are independently reproducible and remain enabled. No global tool configuration was silently changed and no automated score was manufactured to reach a target.

## Remaining limits and next work

- Physical alignment across printers and actual label stock still requires actual-size paper checks. Long text can exceed a small label's printable area; the current implementation does not promise automatic typography fitting.
- PDF admission is process-local. Global quotas, load testing across replicas, and production capacity sizing remain deployment work.
- Build output may include third-party Nuxt/Unhead warnings; passing a build is not evidence that those upstream warnings were repaired.
- **Queued by the user:** research current Vue/Nuxt component testing support, then add rendered component, event, keyboard, accessibility, and error-state regressions with honest `.vue` coverage. Preserve the existing TypeScript coverage scope and report component coverage separately before deciding on a combined gate. Prioritize ColumnMapper, FileUpload, NameTagWizard, and PreviewPanel. Run AQE on actual local artifacts and verify any reported findings.

## Reproduce

```bash
pnpm install --frozen-lockfile
pnpm exec puppeteer browsers install chrome
pnpm check:all
pnpm quality:metrics
pnpm build
pnpm test:build
pnpm test:web
pnpm audit --audit-level=low
# Optional separately installed AQE integration:
AQE_PACKAGE_ROOT=/path/to/agentic-qe pnpm quality:aqe
```

Machine-specific AQE runtime files and pre-existing local configuration changes are excluded from the remediation commit.
