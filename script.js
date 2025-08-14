
import { parseFields } from './parser.js';

const fileInput = document.getElementById('fileInput');
const dropzone = document.getElementById('dropzone');
const progress = document.getElementById('progress');
const resultsBody = document.getElementById('resultsBody');
const quotaEl = document.getElementById('quota');
const downloadCsvBtn = document.getElementById('downloadCsv');

let config = { SHEET_WEBHOOK_URL: "", MONTHLY_LIMIT: 100 };

async function loadConfig() {
  try {
    const res = await fetch('config.json');
    config = await res.json();
  } catch (e) { console.warn('Using default config', e); }
  quotaEl.textContent = `Monthly limit: ${config.MONTHLY_LIMIT} scans`;
}
loadConfig();

function addRow(previewUrl, data, statusText, ok=true) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><img class="preview" src="${previewUrl}" /></td>
    <td>${data.name||''}</td>
    <td>${data.phone||''}</td>
    <td>${data.email||''}</td>
    <td>${data.company||''}</td>
    <td>${data.website||''}</td>
    <td>${data.address||''}</td>
    <td>${data.designation||''}</td>
    <td class="${ok?'status-ok':'status-fail'}">${statusText}</td>
  `;
  resultsBody.appendChild(tr);
}

function toCSV(rows) {
  const headers = ["Name","Phone","Email","Company","Website","Address","Designation"];
  const out = [headers.join(',')];
  for (const r of rows) {
    out.push([r.name, r.phone, r.email, r.company, r.website, r.address, r.designation]
      .map(v => `"${(v||'').replace(/"/g,'""')}"`).join(','));
  }
  return out.join('\n');
}

// Canvas preprocessing: grayscale + threshold
async function preprocess(imageFile) {
  const img = await createImageBitmap(imageFile);
  const canvas = document.createElement('canvas');
  canvas.width = img.width; canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  for (let i=0; i<data.length; i+=4) {
    const r=data[i], g=data[i+1], b=data[i+2];
    const gray = 0.299*r + 0.587*g + 0.114*b;
    const thr = gray > 150 ? 255 : 0; // adjust threshold if needed
    data[i]=data[i+1]=data[i+2]=thr;
  }
  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

async function ocrImage(file) {
  const canvas = await preprocess(file);
  const worker = await Tesseract.createWorker('eng');
  await worker.setParameters({ tessedit_pageseg_mode: 6 });
  const { data } = await worker.recognize(canvas);
  await worker.terminate();
  return data.text;
}

// soft local counter (client-side demo only)
function monKey(){ const d=new Date(); return d.getFullYear()+'-'+(d.getMonth()+1); }
function readCount(){ return Number(localStorage.getItem('tri_ocr_'+monKey())||0); }
function writeCount(v){ localStorage.setItem('tri_ocr_'+monKey(), String(v)); }

async function sendToSheet(row, sourceUrl) {
  if (!config.SHEET_WEBHOOK_URL) return false;
  const payload = {
    name: row.name||"", phone: row.phone||"", email: row.email||"",
    company: row.company||"", website: row.website||"",
    address: row.address||"", designation: row.designation||"",
    sourceImage: sourceUrl||"", scannedAt: new Date().toISOString(), notes: row.raw||""
  };
  try {
    await fetch(config.SHEET_WEBHOOK_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return true; // assume success in no-cors
  } catch { return false; }
}

const processedRows = [];
async function handleFiles(files) {
  let count = readCount();
  for (const file of files) {
    if (count >= config.MONTHLY_LIMIT) { progress.textContent += "\nLimit reached."; break; }
    const url = URL.createObjectURL(file);
    progress.textContent += `\nProcessing ${file.name} ...`;
    try {
      const text = await ocrImage(file);
      const fields = parseFields(text);
      processedRows.push(fields);
      const ok = await sendToSheet(fields, url);
      addRow(url, fields, ok ? 'Saved to Sheet' : 'Ready (set webhook URL)', ok);
      writeCount(++count);
    } catch (e) {
      console.error(e);
      addRow(url, { }, 'OCR failed', false);
    }
  }
}

fileInput.addEventListener('change', e => handleFiles(e.target.files));
dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('drag'); });
dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag'));
dropzone.addEventListener('drop', e => { e.preventDefault(); dropzone.classList.remove('drag'); handleFiles(e.dataTransfer.files); });

downloadCsvBtn.addEventListener('click', () => {
  const csv = toCSV(processedRows);
  const blob = new Blob([csv], {type:'text/csv'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'ocr-results.csv';
  a.click();
});
