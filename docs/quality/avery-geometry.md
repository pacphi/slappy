# Avery catalog geometry verification

Reviewed 2026-09-08. The catalog contains 11 US Letter and six A4 Avery templates.
Product dimensions shown in the picker are nominal. Printing uses the manufacturer
PDF outlines or Word table geometry below. Similar OnlineLabels dimensions were
not used to infer Avery margins or spacing.

## US Letter

Official Avery Canada template selectors expose downloadable PDF URLs. These were
read from the live manufacturer page's `data-dt-download-url` attributes. Signed
query parameters were removed; the public PDF objects downloaded successfully.
Avery.com remains the user-facing details link.

The following measurements are **PDF points**, 72 points per inch. Landscape
PDFs were rotated into portrait Letter coordinates using `x = source y` and
`y = 792 - source x`. Margins below identify the first label's top-left corner.
Pitch is the distance between successive label origins, including any gap.

| Avery | Label width × height | Columns × rows | Left / top    | Horizontal / vertical pitch | Official PDF                                                                                                          |
| ----- | -------------------- | -------------- | ------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 5390  | 252 × 159.75         | 2 × 4          | 54 / 76.5     | 252 / 159.75                | [U-0119-01](https://s3.amazonaws.com/avery.dpp.projects.s3uspdownloadables/CA_en/Downloadables/pdf/U-0119-01.pdf)     |
| 5392  | 288 × 216            | 2 × 3          | 18 / 72       | 288 / 216                   | [U-0114-01](https://s3.amazonaws.com/avery.dpp.projects.s3uspdownloadables/CA_en/Downloadables/pdf/U-0114-01.pdf)     |
| 5395  | 243 × 167.976        | 2 × 4          | 49.5 / 40.5   | 270 / 181.466667            | [U-0121-01](https://s3.amazonaws.com/avery.dpp.projects.s3uspdownloadables/CA_en/Downloadables/pdf/U-0121-01.pdf)     |
| 5160  | 189.36 × 72          | 3 × 10         | 13.5 / 36     | 198 / 72                    | [U-0087-01](https://s3.amazonaws.com/avery.dpp.projects.s3uspdownloadables/CA_en/Downloadables/pdf/U-0087-01.pdf)     |
| 5161  | 288 × 72             | 2 × 10         | 12 / 36       | 301.55 / 72                 | [U-0088-01](https://s3.amazonaws.com/avery.dpp.projects.s3uspdownloadables/CA_en/Downloadables/pdf/U-0088-01.pdf)     |
| 5162  | 288 × 96             | 2 × 7          | 11.2 / 59.95  | 301.5 / 96                  | [U-0089-01](https://s3.amazonaws.com/avery.dpp.projects.s3uspdownloadables/CA_en/Downloadables/pdf/U-0089-01.pdf)     |
| 5163  | 288 × 144            | 2 × 5          | 11.2 / 36     | 301.55 / 144                | [U-0090-01-L](https://s3.amazonaws.com/avery.dpp.projects.s3uspdownloadables/CA_en/Downloadables/pdf/U-0090-01-L.pdf) |
| 5164  | 288 × 240            | 2 × 3          | 11.2 / 36     | 301.55 / 240                | [U-0091-01-L](https://s3.amazonaws.com/avery.dpp.projects.s3uspdownloadables/CA_en/Downloadables/pdf/U-0091-01-L.pdf) |
| 5165  | 612 × 792            | 1 × 1          | 0 / 0         | —                           | [U-0092-01-L](https://s3.amazonaws.com/avery.dpp.projects.s3uspdownloadables/CA_en/Downloadables/pdf/U-0092-01-L.pdf) |
| 5126  | 606.24 × 393.12      | 1 × 2          | 2.85 / 2.8507 | — / 393.1494                | [U-0125-01-L](https://s3.amazonaws.com/avery.dpp.projects.s3uspdownloadables/CA_en/Downloadables/pdf/U-0125-01-L.pdf) |
| 6572  | 189 × 144            | 3 × 5          | 13.5 / 36     | 198 / 144                   | [U-0146-01-L](https://s3.amazonaws.com/avery.dpp.projects.s3uspdownloadables/CA_en/Downloadables/pdf/U-0146-01-L.pdf) |

6572 was verified through Avery Canada's downloadable **6578** template. Avery's
[6572 template page](https://www.avery.com/templates/6572) explicitly lists 6578 as
compatible. This compatibility is manufacturer-confirmed, not inferred from size.

### Differences that matter

- **5390:** preserves the existing PDF geometry exactly. Its printed label height
  is 159.75 points, while the product is marketed as 2¼ inches.
- **5392:** uses a ¼-inch left margin and no column gap. It is a badge-holder
  insert, not an adhesive label; replacing OL500 by silently reusing its geometry
  would misalign the stock.
- **5160:** the downloaded outline is 189.36 points wide, while the nominal width
  is 2⅝ inches (189 points). The existing OL875 outline is different again.
- **5126:** the manufacturer PDF draws inset rounded outlines, approximately
  8.42 × 5.46 inches, inside nominal 8½ × 5½-inch stock. Generation preserves
  these manufacturer outline bounds instead of claiming edge-to-edge printing.
- **5395:** source row origins are 40.5, 221.95, 403.45, and 584.9 points. A regular
  grid uses the first-to-last average pitch, `(584.9 - 40.5) / 3`. Intermediate
  origins differ from the source by at most 0.034 points (0.012 mm).
- **5164:** two source rows are displaced by approximately 0.05 points from a
  regular 240-point pitch. The catalog normalizes this to 240 points, preserving
  the first row origin and nominal row height. Maximum source deviation is
  0.05 points (0.018 mm).
- Other PDF coordinate decimals are rounded to the documented hundredth of a
  point where float extraction noise is below 0.001 points. The fixture retains
  the original extracted bounds for review.

## A4

Avery UK's official downloadable `.doc` templates were parsed with Apache POI
5.5.1 `HWPFDocument`. Measurements are **twips**, 1,440 twips per inch.
The physical table origin equals the section's left margin plus the first cell's
left-edge offset. The alternating narrow cells are column gaps; negative Word
row heights indicate exact heights, not minimum heights. Every row was inspected.

| Avery | Label width × height | Columns × rows | Physical left / top | Column gap | Official Word template                                                                                               |
| ----- | -------------------- | -------------- | ------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------- |
| L7160 | 3600 × 2160          | 3 × 7          | 419 / 858           | 143        | [L7160](https://www.avery.co.uk/sites/avery.co.uk/files/avery_importer/template/files/Avery_L7160_WordTemplate.doc)  |
| L7161 | 3600 × 2639          | 3 × 6          | 419 / 500           | 143        | [L7161](https://www.avery.co.uk/sites/avery.co.uk/files/avery_importer/template/files/Avery_L7161_Word_Template.doc) |
| L7162 | 5616 × 1920          | 2 × 8          | 274 / 738           | 144        | [L7162](https://www.avery.co.uk/sites/avery.co.uk/files/avery_importer/template/files/Avery_L7162_WordTemplate.doc)  |
| L7163 | 5616 × 2160          | 2 × 7          | 274 / 858           | 144        | [L7163](https://www.avery.co.uk/sites/avery.co.uk/files/avery_importer/template/files/Avery_L7163_WordTemplate.doc)  |
| L7165 | 5616 × 3839          | 2 × 4          | 274 / 739           | 144        | [L7165](https://www.avery.co.uk/sites/avery.co.uk/files/avery_importer/template/files/Avery_L7165_WordTemplate.doc)  |
| L7166 | 5616 × 5279          | 2 × 3          | 274 / 499           | 144        | [L7166](https://www.avery.co.uk/sites/avery.co.uk/files/avery_importer/template/files/Avery_L7166_WordTemplate.doc)  |

All six have zero row gaps. L7160/L7161 section left margin is 490 twips with
first cell at −71; the others use 346 and −72. Word stores the A4 sheet rounded
to 11,905 × 16,837 twips. Generation uses exact **210 × 297 mm** sheet dimensions,
with bottom and right margins calculated from the occupied grid. Word's bottom
text margin reserves room for the required trailing paragraph and is not the
physical label-grid margin.

macOS `textutil` conversion was rejected: it stripped the label tables and
substituted default Letter page geometry. The catalog uses original binary Word
table values, not that conversion.

## Evidence and limits

`tests/fixtures/avery-stock-specs.json` contains expected normalized geometry,
manufacturer source URLs, SHA-256 hashes, and independently extracted source
PDF outline bounds or original Word twips. These values were obtained from the
manufacturer artifacts before being transcribed into the runtime catalog;
tests do not generate expected values by importing the catalog.

Geometry verification does not establish physical printer calibration, adhesive
suitability for clothing, or that arbitrary text fits every label. Print at 100%
scale on the selected paper size and check a plain-paper alignment sample against
the purchased stock. Provider templates may change; refresh both the source
measurements and fixture evidence when changing geometry.
