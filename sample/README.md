# Sample Files

This directory contains example files and templates for the Slappy.

## Files

### `sample-roster.csv`

**Purpose**: Example roster data for testing and demonstration

**Usage (Web App)**:

1. Start the web app: `pnpm dev`
2. Upload `sample/sample-roster.csv` in the browser
3. Map columns and generate tags

**Usage (CLI)**:

```bash
# Test with the sample CSV file
pnpm test:local

# Or specify a custom CSV file
pnpm test:local sample/sample-roster.csv
```

**Format**:

```csv
Name,Voice Part,Notes
Sarah Johnson,Soprano,New Member
Michael Chen,Tenor,
...
(blank row = page break)
Jennifer Clark,Soprano,Returning
...
```

This file demonstrates:

- Correct 3-column structure (Name, School/Voice Part, Notes)
- Header row in row 1
- Data rows starting from row 2
- Blank rows to create page breaks

### `config.example.ts`

**Purpose**: Example configuration templates for customizing label styles

**Note**: Not used in the default workflow. Provided for reference if you want to customize fonts, colors, or layout.

**Contains**:

- `NameTagConfig` interface definition
- `defaultConfig` - TownStix US-10 defaults
- `conferenceBadgeConfig` - Conference badge styling example
- `choirConfig` - Choir-specific styling example

### `example-output.html`

**Purpose**: Example of generated HTML output

**Note**: This is what the tool generates. Open in a browser to see the print-ready label layout.

## Creating Your Own Data

To create your own roster:

1. Create a Google Sheet or local CSV file
2. Use 3 columns: Name, School, Voice (or similar)
3. Add a header row
4. Add your data
5. Use blank rows to separate pages

For Google Sheets, see [docs/USER.md](../docs/USER.md) for detailed instructions.
