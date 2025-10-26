# User Guide: Creating Name Tags

This guide is for non-technical users who want to create name tags using the web interface.

## What You'll Need

1. **A web browser** (Chrome, Firefox, Safari, Edge)
2. **Your data** - Either:
   - A CSV file with your roster
   - OR a Google Sheet with your roster (must be published to the web)
3. **A printer** loaded with TownStix US-10 label sheets (for printing)

## Using the Web Interface

### Step 1: Open the Application

1. Open your web browser
2. Go to the Slappy website (or http://localhost:3000 if running locally)
3. You'll see a clean interface with two options: **CSV Upload** or **Google Sheets**

### Step 2: Upload Your Data

**Option A: Upload a CSV File**

1. Click on the **CSV Upload** tab
2. Either:
   - Drag your CSV file into the upload area
   - OR click the upload area to browse and select your file
3. Wait a moment while the file is processed

**Option B: Use Google Sheets**

1. First, publish your Google Sheet:
   - Open your Google Sheet
   - Click **File** → **Share** → **Publish to web**
   - Click the green **Publish** button
2. Copy the URL from your browser's address bar
3. In the Label Maker, click the **Google Sheets** tab
4. Paste your Google Sheets URL
5. Click **Continue to Mapping**

### Step 3: Map Your Columns

Now you'll see a preview of your data and options to map it to your name tags.

**Understanding Column Mapping:**

- **Line 1** (Large, Bold): Usually the person's name
- **Line 2** (Smaller): Additional info like organization or title
- **Line 3** (Smaller): More info like role or voice part

**To set up your mapping:**

1. **Check "Has headers"** if your first row contains column names (like "Name", "School", "Voice")
   - The first row will be used as column labels
   - If unchecked, columns are labeled A, B, C, etc.

2. **Review the data preview table** - it shows the first 5 rows of your data

3. **Choose which columns go on each line:**
   - For **Line 1** (large, bold): Select the column with names
   - For **Line 2** (smaller): Select the column with secondary info
   - For **Line 3** (smaller): Select the column with additional info
   - You can select "None" if you don't need all three lines

4. Click **Continue to Preview**

### Step 4: Preview & Download

You'll now see exactly how your name tags will look!

**What you can do:**

- **Scroll** through the preview to check all your tags
- Click **Download HTML** to get a file you can open in any browser
- Click **Download PDF** to get a ready-to-print or share PDF file
- Click **Print** to print directly from your browser
- Click the **X** to go back and adjust your mapping

### Step 5: Print Your Tags

**For HTML files:**

1. Open the downloaded HTML file in your browser
2. Press **Ctrl+P** (Windows) or **Cmd+P** (Mac)
3. Set these print options:
   - Paper size: **US Letter** (8.5" × 11")
   - Margins: **0.5 inches** on all sides (or "Default")
   - Scale: **100%** (very important!)
   - Headers and footers: **OFF**
4. Load your printer with TownStix US-10 label sheets
5. Click **Print**

**For PDF files:**

1. The PDF is ready to print as-is
2. Just open it and print (no special settings needed)
3. Or share it electronically with others

## Example: Choir Roster

Let's say you have this data in your Google Sheet or CSV:

| Name          | School     | Voice   | Role           |
| ------------- | ---------- | ------- | -------------- |
| Sarah Johnson | Lincoln HS | Soprano | New Member     |
| Michael Chen  | Lincoln HS | Tenor   | Section Leader |

**Step-by-step:**

1. Upload or paste your Google Sheets URL
2. Check "Has headers" (because your first row has column names)
3. In the mapping:
   - **Line 1**: Select "Name" (or column A)
   - **Line 2**: Select "School" (or column B)
   - **Line 3**: Select "Voice" (or column C)
4. Click "Continue to Preview"
5. Download as PDF or HTML
6. Print!

Your name tags will show:

```text
    SARAH JOHNSON
    Lincoln HS
    Soprano
```

## Tips for Best Results

### Data Preparation

- **Keep names short** - Very long names may wrap to multiple lines
- **Use blank rows** to separate groups onto different pages
- **Include a header row** if you want to see column names when mapping

### Column Mapping

- **Preview your data** before finalizing the mapping
- **Experiment** - you can always click Back to adjust the mapping
- **Skip lines** if you don't need all three lines on every tag

### Printing

- **Test print first** - Print one page on regular paper to check alignment
- **Use the correct labels** - TownStix US-10 (4" x 2", 10 per sheet)
- **Check your settings** - 100% scale is crucial for proper alignment

## Troubleshooting

### "I don't see all my data"

- Make sure your Google Sheet is published to the web
- Check that you uploaded the correct CSV file
- Verify your file has data beyond just the header row

### "The mapping looks wrong"

- Double-check if you need "Has headers" checked or unchecked
- Review the preview table to see how the columns are labeled
- Try clicking Back and remapping the columns

### "My PDF won't download"

- PDF generation requires Puppeteer to be installed (handled automatically)
- Try downloading as HTML instead, which always works
- Check your browser's download settings aren't blocking the file

### "The names are cut off or too small"

- Use shorter names or abbreviations
- Long text will automatically wrap, but very long text may not fit
- Consider putting less important info on Line 3

### "The labels don't align with my sheet"

For HTML:

- Verify print settings: US Letter paper, 0.5" margins, 100% scale
- Make sure you're using TownStix US-10 label sheets
- Try the "Default" margin setting if 0.5" isn't available

For PDF:

- PDFs are pre-formatted and should align automatically
- Just print normally without adjusting settings

## Need Different Information on the Tags?

The new column mapping feature makes this easy!

**Want to show different columns?**

- Just map different columns in Step 2
- Example: Use columns "Name", "Title", "Company" instead of "Name", "School", "Voice"

**Only want 2 lines per tag?**

- Map Line 1 and Line 2 to your columns
- Set Line 3 to "None"

**Want to rearrange the order?**

- Map your columns in any order you like
- Example: Put the school on Line 1 (big) and name on Line 2 (smaller)

## Getting Help

If you need assistance:

1. Check that your data file is formatted correctly
2. Try the preview table to understand what the app is seeing
3. Contact your technical support with:
   - A screenshot of the mapping step
   - A description of what's not working
   - A sample of your data (first few rows)

## Advanced Features

### Using Multiple Data Sources

- Create different tags from different CSV files or Google Sheets
- Each upload starts fresh - previous mappings don't carry over

### Saving Your Work

- Download the PDF to save a permanent copy
- Keep your CSV or Google Sheet updated for future batches
- Browser can save HTML files for offline access

### Organizing Large Groups

- Use blank rows in your data to separate groups onto different pages
- Example: Put all 5th graders on pages 1-3, 6th graders on pages 4-6

Happy label making! 🏷️
