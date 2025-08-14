
# Business Card OCR → Google Sheets (Static, Free)

**No server required.** Deploy on Vercel as a static site. OCR runs **in the browser** (Tesseract.js).
Parsed fields are posted to your Google Sheet using a **Google Apps Script Web App** (free).

## Google Sheet
We will use your sheet ID: `1uzJEyJdLD_tO1HbVdx0v4tl2DBJhM-bkNrimjEM2iGU`. First sheet should have headers:
```
Name | Phone | Email | Company | Website | Address | Designation | SourceImage | ScannedAt | Notes
```

## One‑Time Setup
1. Open your Sheet → **Extensions → Apps Script**.
2. Create a file `Code.gs` and paste the contents from `gas/Code.gs` in this repo.
3. Confirm `SPREADSHEET_ID` is set to your sheet (already set here).
4. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy**, then copy the **Web App URL**.
5. In this repo file `config.json`, paste that URL into `SHEET_WEBHOOK_URL`.
6. Commit & push to GitHub. Vercel will auto‑redeploy.

## Usage
- Open your `.vercel.app` (or your custom domain).
- Drag & drop multiple card images.
- App does preprocessing (grayscale + threshold) + OCR (PSM 6), parses fields,
  posts a row to the Google Sheet, and shows results in a table.
- Optional: **Download CSV** of the session.

## Rate Limit
- `config.json` → `MONTHLY_LIMIT` (default 100). It’s a soft, client‑side limit.

## Notes
- OCR quality depends on the photo. Clear, straight, high‑contrast images work best.
- Improve parser patterns in `parser.js` any time (names, addresses, etc.).
