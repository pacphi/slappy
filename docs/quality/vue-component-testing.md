# Vue component testing and remediation

## Decision and research

Use Nuxt test-utils 4.2.0, Vue Test Utils 2.5.0, Vitest/coverage-v8 4.1.11, and happy-dom 20.14.0. Nuxt test-utils declares Vitest 4 as its supported peer; installing the newest Vitest 5 initially exposed an incompatible peer, so both runner and provider were aligned to 4.1.11.

- [Nuxt testing documentation](https://nuxt.com/docs/4.x/getting-started/testing) provides `mountSuspended` and `registerEndpoint` for real Nuxt context and HTTP boundaries.
- [Vue Test Utils](https://test-utils.vuejs.org/guide/essentials/forms) recommends interacting with rendered forms and asserting their effects. These tests mount real Nuxt UI controls, rather than replacing forms, dropdowns, or application composables with stubs.
- [Vitest coverage](https://vitest.dev/guide/coverage.html) supports V8 source remapping and explicit inclusion of untested source files. `vitest.config.ts` includes every `app/components/**/*.vue` file.
- [Deque axe API documentation](https://www.deque.com/axe/core-documentation/api-documentation/) recommends scanning each rendered state. The existing Puppeteer workflow now scans the real production homepage, upload, mapping, and preview states with WCAG A/AA rules.

Node 26 exposes optional native storage that interferes with the DOM test environment. The setup binds a real happy-dom Storage implementation and resets it between tests. HTTP responses, browser print/download/share APIs, and external ad initialization are controlled at their boundaries. Vue component code, Nuxt context, and UI component behavior execute normally.

## Verified fixes

| Regression                                                               | Fix and evidence                                                                                                                                                   |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Saved-template selector crashed on an empty option value                 | Removed invalid placeholder option; real selector tests load valid and unavailable-column mappings                                                                 |
| Template Enter could submit the mapping form; controls lacked names      | Named controls and prevented implicit submission on template-save Enter                                                                                            |
| Escape discarded completed work                                          | Removed destructive global Escape/Command-R handlers; rendered wizard test preserves preview                                                                       |
| Upload failures only produced transient notifications                    | Persistent accessible alert alongside existing toast                                                                                                               |
| Loading and scroll regions were inaccessible                             | Live loading status; named, keyboard-focusable table and label preview regions; production axe checks                                                              |
| Preview errors had no explicit recovery                                  | Retry preview action using current input and stock                                                                                                                 |
| PDF could download after closing the preview                             | Invalidate pending generation during component teardown; late response test fails before the fix                                                                   |
| Zoom shortcuts used unrecognized key names                               | Match actual `+` and `-` keys; keyboard tests enforce zoom bounds                                                                                                  |
| Table lost wider later columns and ignored a zero-row limit              | Compute width across rows and honor explicit zero; rendered table regressions                                                                                      |
| CSV uploaded with Windows Excel MIME alias was rejected                  | Accept `application/vnd.ms-excel` for `.csv`, preserving incompatible MIME and size checks; [Mozilla source](https://bugzilla.mozilla.org/show_bug.cgi?id=1934918) |
| Header button could submit an enclosing form; completion was only visual | Explicit button type and screen-reader completion text                                                                                                             |
| Ad queue was never created before external script initialization         | Initialize the queue on mount; test absent/existing queue behavior                                                                                                 |

Each production fix was preceded by a failing component assertion or a real-browser axe violation. An independent native code review inspected the consolidated API, CSV, PDF, and Vue changes. Its MIME compatibility finding was fixed and its request-regeneration assertion was strengthened. AQE orchestration remained unavailable because of its embedding backend; no native review is represented as an AQE fleet result.

## Measured results

55 component tests pass. Component coverage is 93.73% statements, 89.16% branches, 92.85% functions, and 96.70% lines. All ten components are included; no untouched component is silently excluded. The existing 94 core tests and their separate c8 coverage remain in place.

Vitest coverage applies to component scripts and executable compiled render logic remapped to `.vue` sources. It does not measure CSS correctness, visual layout, all accessibility requirements, `app/app.vue`, or `app/pages/*.vue`. Production browser checks cover the homepage and end-to-end flows separately. Neither a coverage percentage nor zero axe violations establishes full accessibility conformance; axe incomplete results are retained for manual follow-up.

AQE's coverage-gap tool accepted the component JSON report as real data and returned zero prioritized gaps. This is not interpreted as complete coverage: the Vitest report explicitly retains uncovered branches. The final default AQE gate returned 26/100, coverage -1, and a block decision. It still has the source-discovery limitations recorded in the [prior report](brutal-honesty-2026-09-08.md); this is not relabeled as a passing gate. Independent ESLint analysis measured 185 first-party functions, maximum complexity 10, and zero above 10.

## Gates and artifacts

```bash
pnpm test:components
pnpm test:components:coverage
pnpm check:all
pnpm build
pnpm test:build
pnpm test:web
pnpm quality:metrics
pnpm audit --audit-level=low
```

Component coverage has blocking 80% statement/branch/function/line thresholds, independently of the TypeScript gate. Reports live in `coverage/components/` (HTML, JSON, LCOV); axe results live in `coverage/accessibility/results.json`. CI uploads both. The homepage and three wizard states passed the production axe scan with zero violations.

Knip's `vitest-environment-nuxt` dependency exception refers to Nuxt test-utils' virtual environment alias, not a missing package. The remaining optional `@bomb.sh/tab`/`cac` peer warning is in development CLI completion tooling; no forced incompatible dependency override was added.
