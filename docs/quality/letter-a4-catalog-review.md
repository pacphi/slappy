# Letter/A4 catalog review

Reviewed 2026-09-08 on `feat/letter-a4-catalog`.

## Result

Implemented 34 alphabetized provider/template choices with Avery 5390 as default,
22 Letter and 12 A4 layouts, and the requested details and manufacturer link below
the picker. Ten hidden OnlineLabels IDs retain their original API/CLI geometry.
Catalog definitions are split by provider; paper geometry flows through the shared
renderer, PDF export, and Vue preview. No application dependency was added.

## Findings resolved

- Matching nominal sizes did not establish matching print geometry. Avery entries
  were verified from official PDF/Word artifacts, with raw evidence and hashes in
  the fixture and [geometry report](avery-geometry.md).
- Letter-only CSS/PDF/preview dimensions prevented A4 support. These now follow
  the selected template. API validation retains historical IDs independently of
  the visible picker.
- TownStix US-10's former side margins and horizontal gap disagreed with published
  specifications. The catalog now uses 0.15-inch sides and a 0.2-inch column gap.
- Independent review caught repeating decimal tails in the displayed inch sizes.
  A failing component regression demonstrated the issue; display rounds to three
  decimal places without changing print geometry.
- The A4 browser accessibility scan initially raced Reka's closing animation.
  Evidence showed `data-state="closed"` on the still-mounted menu. The check now
  waits for menu options to unmount before scanning the settled preview.
- Scoped AQE analysis now traverses provider subdirectories, so splitting the
  catalog does not silently remove those files from analysis.

## Executed verification

| Check                   | Result                                                                                                     |
| ----------------------- | ---------------------------------------------------------------------------------------------------------- |
| Core tests              | 105 passed                                                                                                 |
| Core coverage           | 99.62% statements/lines, 95.30% branches, 100% functions                                                   |
| Vue component tests     | 57 passed                                                                                                  |
| Vue coverage            | 93.97% statements, 89.32% branches, 93.18% functions, 96.82% lines                                         |
| Physical geometry/PDF   | All 44 IDs; browser label coordinates, two-sheet pagination, PDF paper dimensions, sample text containment |
| Production smoke        | Letter/A4 HTML and PDF across all providers, legacy IDs, invalid input                                     |
| Production picker       | 34 alphabetized choices, default, search, keyboard selection, Letter/A4 regeneration, CSV flow             |
| Accessibility           | Zero axe violations in homepage, upload, mapping, Letter preview, A4 preview                               |
| Static checks           | ESLint, formatting, Knip, Vue and tools TypeScript passed                                                  |
| Build                   | Nuxt production build passed                                                                               |
| Per-function complexity | 193 functions measured by ESLint AST; maximum 10, zero above 10                                            |
| Scoped AQE              | Real Agentic QE 3.14.0 CodeMetricsAnalyzer measured 29 first-party TypeScript files                        |

Core statement coverage includes static catalog data; it is not a substitute for
behavioral coverage. Vue coverage is measured separately across eligible components.
Independent review found no blocking correctness, compatibility, or security issue;
the display defect it identified was remediated before completion.

## AQE limitations and remaining uncertainty

AQE orchestration could not initialize its embedding backend. The automatic
`quality_assess` gate returned coverage −1 and a complexity value around 36,934,
consistent with the previously documented generated-output scope problem. Its
reported score of 26 is not a valid assessment of this change; no AQE gate pass or
synthetic replacement score is claimed. Scoped analysis uses the installed AQE
implementation, while Vue/per-function measurements use ESLint and test coverage.

Automated tests do not certify physical printer calibration. Manufacturer source
precision and tiny regular-grid normalizations are documented in the geometry
report. TownStix US-21 remains excluded because its published measurements do not
reconcile with Letter paper. No physical label-sheet print was performed.
