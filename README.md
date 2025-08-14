# Tri Rudra — Business Card OCR → Google Sheet (Static)

This is a full ready-to-deploy **static** web app (client-side OCR using Tesseract.js).
It OCRs images in-browser, parses fields, and posts rows to your Google Sheet via an Apps Script webhook.

Quick setup
1. Upload these files to your GitHub repo (replace existing files).
2. Ensure `config.json` has your Apps Script webhook URL.
3. Commit & push; Vercel will auto-deploy.
4. Open site, upload images, check Google Sheet rows appear.

Sheet setup
Sheet ID: 1uzJEyJdLD_tO1HbVdx0v4tl2DBJhM-bkNrimjEM2iGU
Headers expected on first sheet:
Name | Phone | Email | Company | Website | Address | Designation | SourceImage | ScannedAt | Notes
