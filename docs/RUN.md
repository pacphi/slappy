# Running Slappy

This guide provides detailed instructions for running the Slappy in various scenarios.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Web Application Usage](#web-application-usage)
- [CLI Usage](#cli-usage)
- [Google Sheets Setup](#google-sheets-setup)
- [Column Mapping](#column-mapping)
- [Output Formats](#output-formats)
- [Printing Instructions](#printing-instructions)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before running the application, ensure you have:

1. **Node.js 20+** installed
2. **pnpm** installed (see [pnpm.io](https://pnpm.io))
3. **Dependencies installed**: Run `pnpm install`
4. **For PDF generation**: Puppeteer will install Chromium automatically (may take several minutes on first install)

## Quick Start

### Web Application (Recommended)

```bash
pnpm install         # Install dependencies
pnpm dev             # Start development server
```

Then open http://localhost:3000 in your browser.

### CLI

```bash
pnpm install         # Install dependencies
pnpm test:local      # Generate test tags from sample data
```

## Web Application Usage

The web application provides a modern, user-friendly interface with a multi-step wizard for generating name tags.

### Starting the Server

**Development:**

```bash
pnpm dev             # Starts at http://localhost:3000
```

**Production:**

```bash
pnpm build           # Build for production
pnpm preview         # Preview production build
```

### Step 1: Upload Data

Upload your data using one of two methods:

**Option A: CSV File Upload**

1. Drag and drop a CSV file onto the upload area, or click to browse
2. CSV can have any number of columns with or without headers
3. Click "Next" to proceed to column mapping

**Option B: Google Sheets URL**

1. Paste a published Google Sheets URL into the input field
2. The sheet must be published to web (see [Google Sheets Setup](#google-sheets-setup))
3. Click "Load from Google Sheets"
4. Click "Next" to proceed to column mapping

**CSV Format Example:**

```csv
Name,School,Voice Part,Grade
Sarah Johnson,Lincoln High School,Soprano,11
Michael Chen,Lincoln High School,Tenor,12
Emma Williams,Lincoln High School,Alto,10

David Brown,Madison Middle School,Bass,8
```

Blank rows create page breaks between different groups.

### Step 2: Column Mapping

Map your data columns to the three lines on each name tag:

**Column Mapping Interface:**

1. **Toggle "Has Headers"**: If your data has a header row, enable this checkbox
   - Headers will be displayed in the preview table
   - First data row won't be used as a name tag

2. **Select Columns**: Use the dropdowns to map columns to each line:
   - **Line 1**: Large text (32pt, bold) - typically the name
   - **Line 2**: Smaller text (18pt) - typically school/organization
   - **Line 3**: Smaller text (18pt) - typically role/voice part
   - Leave any line as "None" to skip it (partial mapping supported)

3. **Preview Table**: Review the first 5 rows of your data
   - Verify column mapping is correct
   - Check that data displays as expected

4. Click "Next" to proceed to preview

**Example Mappings:**

```
3 columns (Name, School, Voice):
  Line 1: Column 0 (Name)
  Line 2: Column 1 (School)
  Line 3: Column 2 (Voice)

4 columns (Name, School, Grade, Voice):
  Line 1: Column 0 (Name)
  Line 2: Column 1 (School)
  Line 3: Column 3 (Voice)

2 columns (Name, School):
  Line 1: Column 0 (Name)
  Line 2: Column 1 (School)
  Line 3: None (skip)
```

### Step 3: Preview & Download

Preview and download your name tags:

1. **Preview**: View your name tags in the browser
   - TownStix US-10 format (4" × 2" labels, 2 columns × 5 rows)
   - Dashed borders visible on screen (hidden when printing)
   - Scroll to review all pages

2. **Download Options**:
   - **Download HTML**: Get a standalone HTML file you can open in any browser
   - **Download PDF**: Get a print-ready PDF file (requires Puppeteer/Chrome)
   - **Print**: Open the browser print dialog for immediate printing

3. **Print Settings** (when using Print button or opening HTML):
   - Paper size: US Letter (8.5" × 11")
   - Margins: 0.5 inches on all sides
   - Scale: 100%
   - Disable headers/footers

### Dark Mode

Toggle between light and dark themes using the theme toggle button in the top-right corner.

## CLI Usage

The command-line interface provides flexible column mapping and supports both HTML and PDF output.

### Basic Command Syntax

```bash
pnpm cli <SPREADSHEET_ID> <GID> [OUTPUT_FILE] [OPTIONS]
```

**Parameters:**

- `SPREADSHEET_ID` (required): Google Sheets document ID
- `GID` (required): Specific tab/sheet ID
- `OUTPUT_FILE` (optional): Path to output file (default: `./name-tags.html`)

**Options:**

- `--line1-col=N`: Map column N to line 1 (default: 0)
- `--line2-col=N`: Map column N to line 2 (default: 1)
- `--line3-col=N`: Map column N to line 3 (default: 2)
- `--has-headers`: Treat first row as headers (skip it)
- `--format=FORMAT`: Output format: `html` or `pdf` (default: `html`)

Column indices are 0-based (first column = 0, second = 1, etc.).

### CLI Examples

**Example 1: Default mapping (backwards compatible)**

```bash
# Maps columns 0→line1, 1→line2, 2→line3
pnpm cli 1trONbsjA_o4ZAsp6L5ALVyL3dJL8FUE0AXCA7T0DhD8 0
```

**Example 2: Custom column mapping**

```bash
# Map column 0→line1, column 2→line2, column 3→line3
pnpm cli <SHEET_ID> <GID> output.html \
  --line1-col=0 --line2-col=2 --line3-col=3
```

**Example 3: With headers and PDF output**

```bash
# Skip header row and generate PDF
pnpm cli <SHEET_ID> <GID> output.pdf \
  --has-headers --format=pdf
```

**Example 4: Partial mapping (2 lines only)**

```bash
# Only use line 1 and line 2, skip line 3
pnpm cli <SHEET_ID> <GID> output.html \
  --line1-col=0 --line2-col=1
```

**Example 5: Testing with sample data**

```bash
pnpm test:local  # Generates sample-roster-tags.html with sample data
```

### Finding Spreadsheet ID and GID

Given this Google Sheets URL:

```url
https://docs.google.com/spreadsheets/d/3kR9mN-2pQxWvY_bZdH8sLf4jTcUgEoAnV7iM5wKqX1yBe/edit#gid=428391756
```

Extract:

- **Spreadsheet ID**: `3kR9mN-2pQxWvY_bZdH8sLf4jTcUgEoAnV7iM5wKqX1yBe` (between `/d/` and `/edit`)
- **GID**: `428391756` (after `#gid=`)

## Google Sheets Setup

### Publishing Your Sheet

1. Open your Google Sheet
2. Click **File** → **Share** → **Publish to web**
3. Click **Publish**
4. Copy the URL to extract the Spreadsheet ID and GID

**Important**: The sheet must be published for the tool to access it without authentication.

### Data Format

**Flexible Column Structure:**

- Your sheet can have any number of columns
- Use column mapping (web UI or CLI flags) to select which columns appear on each line
- Header row is optional (enable "Has Headers" if using one)

**Example with 3 columns:**

```text
Name              | School          | Voice
------------------|-----------------|----------
Sarah Johnson     | Lincoln HS      | Soprano
Michael Chen      | Lincoln HS      | Tenor
Emma Williams     | Lincoln HS      | Alto
                  |                 |          ← Blank row = page break
David Brown       | Madison MS      | Bass
Lisa Anderson     | Madison MS      | Soprano
```

**Example with 4 columns:**

```text
Name              | School          | Grade | Voice
------------------|-----------------|-------|----------
Sarah Johnson     | Lincoln HS      | 11    | Soprano
Michael Chen      | Lincoln HS      | 12    | Tenor
```

Map: Line 1 = Column 0 (Name), Line 2 = Column 1 (School), Line 3 = Column 3 (Voice)

### Page Breaks

To create **page breaks** (start a new sheet of labels):

- Insert a completely **blank row** in your spreadsheet (all columns empty)
- Blank rows separate groups into different physical pages
- Each page holds up to 10 labels (2 columns × 5 rows, TownStix US-10 format)
- Pages are automatically padded with empty labels to maintain the grid

## Column Mapping

### Understanding Column Mapping

Each name tag has three lines with different text sizes:

- **Line 1**: 32pt, bold - typically for names (most prominent)
- **Line 2**: 18pt, regular - typically for organization/school
- **Line 3**: 18pt, regular - typically for role/voice part

You can map any column from your source data to any line, or skip lines entirely.

### Column Mapping Strategies

**Strategy 1: Standard 3-column format**

```text
Source: Name, School, Voice
Mapping: 0→Line1, 1→Line2, 2→Line3
Result: Traditional name tag layout
```

**Strategy 2: Skip unwanted columns**

```text
Source: ID, Name, Email, School, Voice
Mapping: 1→Line1, 3→Line2, 4→Line3
Result: Uses Name, School, Voice; ignores ID and Email
```

**Strategy 3: Partial mapping**

```text
Source: Name, Organization
Mapping: 0→Line1, 1→Line2, None→Line3
Result: Two-line name tags
```

**Strategy 4: Reorder columns**

```text
Source: School, Name, Voice
Mapping: 1→Line1, 0→Line2, 2→Line3
Result: Name on line 1, School on line 2
```

## Output Formats

### HTML Output

**Advantages:**

- Smaller file size
- Easy to preview in any browser
- Can customize before printing
- Universal compatibility

**Use Cases:**

- Quick previews
- When you need to make manual adjustments
- Sharing with others who don't need PDF

**Opening HTML files:**

```bash
open name-tags.html          # macOS
start name-tags.html         # Windows
xdg-open name-tags.html      # Linux
```

### PDF Output

**Advantages:**

- Print-ready format
- Consistent rendering across systems
- Professional appearance
- No browser print dialog needed

**Use Cases:**

- Final production files
- Sending to print shops
- Archival purposes

**Requirements:**

- Puppeteer (installed automatically via pnpm)
- Chromium (downloaded on first run of Puppeteer)
- May take 30-60 seconds to generate

**Generating PDFs:**

Web UI: Select "PDF" format before clicking download

CLI: Add `--format=pdf` flag or use `.pdf` extension:

```bash
pnpm cli <ID> <GID> output.pdf --format=pdf
```

## Printing Instructions

### Print Settings

For best results when printing to TownStix US-10 label sheets:

**Required Settings:**

- **Paper size**: US Letter (8.5" × 11")
- **Margins**: 0.5 inches on all sides
- **Scale**: 100% (no shrinking or "fit to page")
- **Headers/Footers**: Disabled
- **Background graphics**: Enabled (optional, shows borders for alignment)

### Browser-Specific Instructions

**Chrome/Edge:**

1. Open HTML file or use web UI Print button
2. More settings → Margins → Custom (0.5in all sides)
3. Uncheck "Headers and footers"
4. Check "Background graphics" (to see alignment borders)
5. Verify preview shows 2×5 grid per page

**Firefox:**

1. File → Print
2. Page Setup → Margins (0.5in all sides)
3. Format & Options → Uncheck headers/footers
4. Use Print Preview to verify alignment

**Safari:**

1. File → Print
2. Show Details
3. Paper Size: US Letter
4. Scale: 100%
5. Enable "Print backgrounds" checkbox

### PDF Printing

If you generated a PDF file:

1. Open PDF in Adobe Reader, Preview (macOS), or your PDF viewer
2. File → Print
3. Select "Actual size" or "100%" scaling
4. Ensure no "fit to page" or auto-rotate options are enabled
5. Print to TownStix US-10 label sheets

### Test Print Procedure

**Always test print on regular paper first** before using label sheets:

1. Print one page on plain paper
2. Hold up to light with TownStix label sheet behind it
3. Verify alignment of all 10 label positions
4. Check that borders (if visible) align with label edges
5. If misaligned, adjust print settings and retest

### Alignment Verification

The HTML output includes dashed borders visible on-screen (hidden in final print). These help verify:

- Labels are exactly 4" wide × 2" tall
- Grid is precisely 2 columns × 5 rows
- Page margins are correct (0.5" all sides)

## Troubleshooting

### Web Application Issues

**Issue: Upload fails or shows error**

Solutions:

1. Verify CSV is valid (no malformed quotes or encoding issues)
2. For Google Sheets, ensure sheet is published to web
3. Check browser console for detailed error messages

**Issue: Column mapping doesn't update preview**

Solutions:

1. Toggle "Has Headers" checkbox to refresh
2. Try changing column selections
3. Reload the page and start over

**Issue: PDF download fails or takes forever**

Solutions:

1. Verify Puppeteer is installed: `pnpm list puppeteer`
2. Wait 60 seconds (PDF generation can be slow on first run)
3. Try HTML format first to verify content is correct
4. Check available disk space (Chromium download requires ~300MB)

### CLI Issues

**Error: "Usage: ts-node nametag-generator.ts..."**

Cause: Missing required arguments

Solution:

```bash
# Provide both spreadsheet ID and gid
npx ts-node nametag-generator.ts <SPREADSHEET_ID> <GID>
```

**Error: "Failed to fetch Google Sheet"**

Cause: Sheet not published or incorrect ID

Solutions:

1. Verify sheet is published (File → Share → Publish to web)
2. Double-check spreadsheet ID and gid in URL
3. Ensure sheet has public view access
4. Try accessing CSV export URL directly:

   ```url
   https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/export?format=csv&gid=<GID>
   ```

**Error: Column mapping produces wrong data**

Cause: Incorrect column indices or header row not skipped

Solutions:

1. Remember columns are 0-indexed (first column = 0)
2. Add `--has-headers` flag if first row contains headers
3. Print debug info: Check the first few rows of output
4. Test with `pnpm test:local` to verify tool is working

### Printing Issues

**Issue: Labels don't align with TownStix sheet**

Cause: Incorrect print settings

Solutions:

1. Verify paper size: **US Letter** (not A4)
2. Set margins to **exactly 0.5 inches** (not default)
3. Ensure scale is **100%** (not "fit to page")
4. Disable "Shrink to fit" or auto-scaling options
5. Test print on plain paper first

**Issue: Names cut off or wrapped strangely**

Cause: Long names exceeding label width

Solutions:

1. Use abbreviations or nicknames in the source data
2. Use first name + last initial format
3. Split very long organization names across lines 2 and 3
4. Consider customizing font sizes in `lib/html-generator.ts`

**Issue: No page breaks between groups**

Cause: Blank rows not recognized

Solutions:

1. Ensure blank rows are **completely empty** (all columns)
2. Don't use spaces or hidden characters in blank rows
3. In Google Sheets, select the entire row and press Delete
4. Verify in output: each group should start a new page

**Issue: Extra blank labels at end of pages**

This is expected behavior:

- TownStix US-10 requires 10 labels per sheet (2×5 grid)
- Pages are automatically padded to maintain the grid
- Labels with no data display as empty spaces
- This ensures proper label sheet alignment

### Data Issues

**Issue: First row appears as a name tag when it shouldn't**

Cause: Header row not marked

Solutions:

- Web UI: Enable "Has Headers" checkbox
- CLI: Add `--has-headers` flag

**Issue: Wrong columns showing on name tags**

Cause: Incorrect column mapping

Solutions:

- Web UI: Review column mapping in Step 2, check preview table
- CLI: Verify `--line1-col`, `--line2-col`, `--line3-col` values
- Remember: Columns are 0-indexed (first column = 0)

## Advanced Usage

### Local CSV Testing

Test with local CSV files without Google Sheets:

**Using built-in test:**

```bash
pnpm test:local  # Uses sample data from sample/sample-roster.csv
```

**Custom CSV file:**

```bash
pnpm test:local path/to/your-file.csv
```

CSV format example:

```csv
Name,School,Voice
Sarah Johnson,Lincoln HS,Soprano
Michael Chen,Lincoln HS,Tenor

Emma Williams,Madison MS,Alto
```

### Batch Processing Multiple Sheets

Generate tags for multiple events:

```bash
#!/bin/bash

# Array of [SPREADSHEET_ID, GID, OUTPUT_NAME]
declare -a events=(
  "3kR9mN-2pQxWvY_bZdH8sLf4jTcUgEoAnV7iM5wKqX1yBe 428391756 choir-fall.pdf"
  "7hF2nJ-8tYzQaW_cXvBmLr6kGdPsEuIoHq9jN4wMpT 915624783 band-spring.pdf"
)

for event in "${events[@]}"; do
  read -r id gid output <<< "$event"
  npx ts-node nametag-generator.ts "$id" "$gid" "$output" --has-headers --format=pdf
done
```

### Docker Deployment

Run as a containerized web service:

**Build and run locally:**

```bash
docker build -t slappy .
docker run -p 3000:3000 slappy
```

**Deploy to fly.io:**

```bash
flyctl launch        # Initial setup
flyctl deploy        # Deploy updates
```

### Debugging

Enable verbose output:

**Web UI:**

- Open browser DevTools (F12)
- Check Console tab for errors
- Check Network tab for API call failures

**CLI:**

```bash
npx ts-node nametag-generator.ts <ID> <GID> 2>&1 | tee generation.log
```

Look for:

- "Found X page(s) of name tags"
- Verify expected number of pages matches your data

---

## Next Steps

- **Customize styling**: See [ARCHITECTURE.md](ARCHITECTURE.md) for CSS customization
- **Build for distribution**: See [BUILD.md](BUILD.md) for compilation
- **Deploy as service**: See [DEPLOY.md](DEPLOY.md) for deployment options

For questions or issues, refer to:

- [User Guide](USER.md) - Non-technical user instructions
- [Quick Start](QUICKSTART.md) - Getting started quickly
- [Project Overview](PROJECT-OVERVIEW.md) - High-level project information
