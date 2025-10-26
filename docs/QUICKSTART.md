# Quick Start Guide

Get your name tags generated in 5 minutes!

## 🌐 Web App (Recommended)

The fastest way to create name tags is through the web interface.

### Step 1: Start the App

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 2: Upload Your Data

Choose one of two options:

**Option A: CSV File**

- Drag and drop your CSV file, or click to browse
- Your file should have columns like: Name, School, Voice

**Option B: Google Sheets**

1. Publish your sheet to web (File → Share → Publish to web)
2. Copy the URL
3. Paste it into the app

### Step 3: Map Your Columns

You'll see a preview of your data with mapping options:

1. **Check "Has headers"** if your first row contains column names
2. **Review the data preview** (first 5 rows shown)
3. **Map columns to lines:**
   - Line 1 (large, bold): Usually the name
   - Line 2 (smaller): Secondary info
   - Line 3 (smaller): Additional info
   - Select "None" to skip any line

### Step 4: Preview & Download

1. Review the generated name tags
2. Choose your format:
   - **Download HTML** - For browser printing
   - **Download PDF** - Ready to print or share
3. Or click **Print** to print directly

### Step 5: Print

**For HTML:**

- Press Ctrl+P (Cmd+P on Mac)
- Settings: US Letter, 0.5" margins, 100% scale, no headers/footers

**For PDF:**

- Just open and print normally

Done! 🎉

## 🖥️ CLI (Advanced)

For automated workflows or scripting:

### Basic Usage

```bash
pnpm install
pnpm cli <SPREADSHEET_ID> <GID>
```

Example:

```bash
pnpm cli 3kR9mN-2pQxWvY_bZdH8sLf4jTcUgEoAnV7iM5wKqX1yBe 428391756
```

### With Column Mapping

```bash
# Map columns 0, 2, 3 to lines 1, 2, 3
pnpm cli SHEET_ID GID \
  --line1-col=0 --line2-col=2 --line3-col=3

# Generate PDF with headers
pnpm cli SHEET_ID GID output.pdf \
  --has-headers --format=pdf
```

## 📋 Data Format

Your data can be in any order - you map it in Step 2!

**Example CSV:**

```csv
Name,School,Voice,Role
Sarah Johnson,Lincoln HS,Soprano,New Member
Michael Chen,Lincoln HS,Tenor,Section Leader
```

**Or use different columns:**

```csv
FullName,Organization,Title,Department
John Doe,Acme Inc,CEO,Executive
Jane Smith,XYZ Corp,CTO,Technology
```

**Key points:**

- ✅ Any number of columns (you choose which to use)
- ✅ Optional header row
- ✅ Blank rows create page breaks
- ✅ Use 1, 2, or 3 lines per tag

## ⚡ Common Scenarios

### Conference Badges

```text
Line 1: Name
Line 2: Company
Line 3: Title
```

### School Events

```text
Line 1: Student Name
Line 2: Grade
Line 3: Room Number
```

### Choir/Music

```text
Line 1: Name
Line 2: School
Line 3: Voice Part
```

## 🛠️ Troubleshooting

**Can't access Google Sheet?**

- Make sure it's published to web (File → Share → Publish to web)
- Copy the full URL from your browser

**Columns look wrong?**

- Toggle "Has headers" checkbox
- Check the preview table
- Click Back to remap

**Labels don't align?**

- For HTML: Use 0.5" margins and 100% scale
- For PDF: Print normally (already formatted correctly)

## 🎨 Tips

- **Preview first** - Always check the preview before printing
- **Test print** - Print one page on regular paper first
- **Use headers** - Makes column mapping much easier
- **Keep it short** - Long text may wrap to multiple lines

## 📦 What's Next?

- Deploy to fly.io for online access: [DEPLOY.md](DEPLOY.md)
- Learn about the architecture: [ARCHITECTURE.md](ARCHITECTURE.md)
- Read the full user guide: [USER.md](USER.md)
- Explore CLI options: [RUN.md](RUN.md)

Happy printing! 🏷️
