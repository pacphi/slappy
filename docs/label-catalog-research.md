# Label catalog research and design

Reviewed 2026-09-07. Decision: retain TownStix US-10 and Avery 5390, add 18 OnlineLabels stocks, for **20 selectable product templates across three providers**. These are product layouts, not a claim of 20 unique physical dimensions. All use US Letter sheets.

## Sources and maintenance assessment

| Source                                                                            | Evidence                                                                                                                                                                                                                                                                                                                 | Decision                                                                                                                                                                                       |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [OnlineLabels manufacturer catalog](https://www.onlinelabels.com/templates/blank) | Live product-specific pages provide detailed dimensions, margins, pitch, and PDF/Word downloads. Every selected product has a source link below.                                                                                                                                                                         | Use manufacturer-owned specifications as a reviewed static catalog; no network dependency during printing.                                                                                     |
| [Avery official catalog](https://www.avery.com/templates/category/all-templates)  | Official product-number lookup and downloadable templates, including the existing 5390 insert.                                                                                                                                                                                                                           | Keep 5390's previously verified PDF geometry. More Avery formats are a future addition after individual geometry checks.                                                                       |
| [gLabels Qt](https://github.com/j-evins/glabels-qt)                               | Upstream identifies Qt as the successor; legacy gLabels 3 has not been maintained by its author since 2018. Template XML has a separate MIT/X license; no copyright claimed on dimensional facts. The current [DTD](https://github.com/j-evins/glabels-qt/blob/master/templates/glabels-4.0.dtd) carries 2026 copyright. | Useful broader cross-brand database for future imports. Do not introduce a Qt/C++ desktop runtime into Nuxt. This research does not establish a maintenance SLA or audit every database entry. |

Recommendation: a small typed catalog grounded in current manufacturer specifications. No new dependency or commercial design-service integration is needed. Manufacturer-hosted design tools are alternatives for manual design, not a shared HTML/PDF geometry engine for this app.

## Selected catalog

Dimensions below are nominal width × height in inches; geometry uses the manufacturer's detailed specifications, which sometimes differ from the headline product size.

| Stock / source                                                             | Nominal size   | Labels/sheet | ID                    |
| -------------------------------------------------------------------------- | -------------- | ------------ | --------------------- |
| [TownStix US-10](https://townstix.com/templates/)                          | 4 × 2          | 10           | `townstix-us-10`      |
| [Avery 5390](https://www.avery.com/templates/5390)                         | 3.5 × 2.25     | 8            | `avery-5390`          |
| [OnlineLabels OL100](https://www.onlinelabels.com/templates/blank/ol100)   | 4 × 1.33       | 14           | `onlinelabels-ol100`  |
| [OnlineLabels OL125](https://www.onlinelabels.com/templates/blank/ol125)   | 4 × 2          | 10           | `onlinelabels-ol125`  |
| [OnlineLabels OL150](https://www.onlinelabels.com/templates/blank/ol150)   | 4 × 3.33       | 6            | `onlinelabels-ol150`  |
| [OnlineLabels OL250](https://www.onlinelabels.com/templates/blank/ol250)   | 4 × 1.5        | 12           | `onlinelabels-ol250`  |
| [OnlineLabels OL400](https://www.onlinelabels.com/templates/blank/ol400)   | 8.5 × 5.5      | 2            | `onlinelabels-ol400`  |
| [OnlineLabels OL450](https://www.onlinelabels.com/templates/blank/ol450)   | 4.25 × 5.5     | 4            | `onlinelabels-ol450`  |
| [OnlineLabels OL500](https://www.onlinelabels.com/templates/blank/ol500)   | 4 × 3          | 6            | `onlinelabels-ol500`  |
| [OnlineLabels OL525](https://www.onlinelabels.com/templates/blank/ol525)   | 4 × 3.25       | 6            | `onlinelabels-ol525`  |
| [OnlineLabels OL600](https://www.onlinelabels.com/templates/blank/ol600)   | 4 × 2.5        | 8            | `onlinelabels-ol600`  |
| [OnlineLabels OL700](https://www.onlinelabels.com/templates/blank/ol700)   | 4 × 1.75       | 12           | `onlinelabels-ol700`  |
| [OnlineLabels OL750](https://www.onlinelabels.com/templates/blank/ol750)   | 2.83 × 2.2     | 15           | `onlinelabels-ol750`  |
| [OnlineLabels OL800](https://www.onlinelabels.com/templates/blank/ol800)   | 2.5 × 1.563    | 18           | `onlinelabels-ol800`  |
| [OnlineLabels OL875](https://www.onlinelabels.com/templates/blank/ol875)   | 2.625 × 1      | 30           | `onlinelabels-ol875`  |
| [OnlineLabels OL900](https://www.onlinelabels.com/templates/blank/ol900)   | 2.83 × 1       | 33           | `onlinelabels-ol900`  |
| [OnlineLabels OL1000](https://www.onlinelabels.com/templates/blank/ol1000) | 1.5 × 1        | 50           | `onlinelabels-ol1000` |
| [OnlineLabels OL1100](https://www.onlinelabels.com/templates/blank/ol1100) | 1.5 × 0.5      | 100          | `onlinelabels-ol1100` |
| [OnlineLabels OL175](https://www.onlinelabels.com/templates/blank/ol175)   | 8.5 × 11       | 1            | `onlinelabels-ol175`  |
| [OnlineLabels OL200](https://www.onlinelabels.com/templates/blank/ol200)   | 3.4375 × 0.669 | 30           | `onlinelabels-ol200`  |

## Geometry decisions and limitations

- Preserve both existing IDs, default stock, and physical placement. Derive the ID union from the catalog so API, CLI, preview, and downloads share the same accepted values.
- OL125's 4 × 2 labels use 0.18-inch left margin and 0.14-inch column gap. TownStix uses 0.25-inch left margin with no gap. Same nominal size does not imply interchangeability.
- OL100, OL150, OL200, OL250, OL750, OL800 and OL875 have nominal/detailed size differences. Use detailed width and height for layout; retain nominal values for shopping and display.
- Excluded OL225 after its published margins and downloadable PDF did not reconcile: the PDF reports a 614 × 794 point page, not Letter's 612 × 792. Use OL200 instead, whose detailed table fits Letter exactly.
- Excluded OL75 because its published width, margins and spacing total 8.50625 inches; this needs a PDF/manufacturer reconciliation before inclusion. Excluded circular/CD shapes because rectangular text placement does not model their safe area.
- Scale fonts, padding, and line spacing together on small labels. Existing badge fonts remain unchanged. This is proportional sizing, not arbitrary-length text autofitting. Compact stock needs short entries; long content can still clip and should be checked in preview.
- Full-sheet and edge-to-edge stocks are supported geometrically. Printer hardware margins can limit the printable area. Use Actual size / 100%, disable browser headers and footers, and test on plain paper.

## UI and validation design

Searchable Nuxt UI select uses stable string IDs. Each option shows brand/product, nominal dimensions, and labels per sheet; the selected stock links to the manufacturer. Small stock displays a compact-text hint. The existing regeneration flow updates HTML, PDF, sheet count and browser print together.

Tests cover 20 unique IDs, bounds, per-stock pagination and padding, invalid input, HTML escaping, existing placement regressions, every new stock's browser coordinates, sample three-line text containment, and two-sheet PDF output at capacity + 1. The fixture records the reviewed manufacturer specifications separately from the runtime catalog; it detects implementation drift, not errors in manufacturer data. Automated checks cannot certify physical printer alignment.

To add or update a stock: check its manufacturer source, compare nominal and detailed measurements, verify rows/columns and bounds, update the reviewed fixture, and run the print suite. Do not silently substitute an equivalent-looking SKU or fetch mutable dimensions at runtime.

## Verification results

- `pnpm test`: 31 passed, including browser coordinates and PDF pagination for all 18 additions plus both existing stocks.
- `pnpm build`: passed. Nuxt reports robots/sitemap guidance and a large client chunk warning.
- ESLint and Prettier on all changed feature files: passed; `git diff --check`: passed.
- `SLAPPY_SMOKE_URL=http://127.0.0.1:3117 node scripts/check-label-picker.mjs`: passed against the production build; 20 options, filtering, keyboard selection, and regenerated OL875 HTML.
- `SLAPPY_SMOKE_URL=http://127.0.0.1:3117 node scripts/smoke-deployment.mjs`: passed HTML/PDF API checks for TownStix, Avery, OL875, OL175 and OL1100, plus invalid-ID and logical-page-break cases.
- Agentic-QE generated invalid-input test suggestions, which were reviewed and adapted. Its repository-wide quality gate returned **29/100, failed**, with unavailable coverage (`-1`) and unexplained average complexity (`63935.27`). This is not a passing gate or a validated score of this feature. No 98/100 claim is made. Physical printing was not tested.
