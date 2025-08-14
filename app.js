import { parseFields } from './parser.js';

const cfg = { SHEET_WEBHOOK_URL: 'https://script.google.com/macros/s/AKfycbwmJCx-eL-v3AeCbUTroSa-3GxruEcMQiYdNQYEeLFa5Uk-fed46YYVVsqREfxTLHhc/exec', MONTHLY_LIMIT: 100 };
document.getElementById('limitInfo').textContent = `Monthly limit: ${cfg.MONTHLY_LIMIT}`;

const fileInput = document.getElementById('fileInput');
const dropzone = document.getElementById('dropzone');
const log = document.getElementById('log');
const resultsBody = document.getElementById('resultsBody');
const downloadCsv = document.getElementById('downloadCsv');

let processed = [];

document.getElementById('testBtn').addEventListener('click', async ()=>{
  const ok = await postToSheet({name:'Test User', phone:'9999999999', email:'test@demo.com', company:'Demo', website:'demo.com', address:'', designation:'', raw:'manual'}, '');
  log.textContent += `\nTest POST => ${ok ? 'OK' : 'FAILED'}`;
});

fileInput.addEventListener('change', e => handleFiles(e.target.files));
dropzone.addEventListener('dragover', e=>{ e.preventDefault(); dropzone.classList.add('drag'); });
dropzone.addEventListener('dragleave', ()=> dropzone.classList.remove('drag'));
dropzone.addEventListener('drop', e=>{ e.preventDefault(); dropzone.classList.remove('drag'); handleFiles(e.dataTransfer.files); });

function addRow(preview, data, status, ok=true){
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${preview?`<img class="preview" src="${preview}">`:''}</td>
    <td>${data.name||''}</td><td>${data.phone||''}</td><td>${data.email||''}</td>
    <td>${data.company||''}</td><td>${data.website||''}</td><td>${data.address||''}</td>
    <td>${data.designation||''}</td><td class="${ok?'status-ok':'status-fail'}">${status}</td>
  `;
  resultsBody.appendChild(tr);
}

function toCSV(rows){
  const h = ["Name","Phone","Email","Company","Website","Address","Designation"];
  const lines = [h.join(',')];
  for (const r of rows) lines.push([r.name,r.phone,r.email,r.company,r.website,r.address,r.designation].map(v=>`"${(v||'').replace(/"/g,'""')}"`).join(','));
  return lines.join('\n');
}

async function preprocess(file){
  const img = await createImageBitmap(file);
  const c = document.createElement('canvas');
  c.width = img.width; c.height = img.height;
  const ctx = c.getContext('2d');
  ctx.drawImage(img,0,0);
  const id = ctx.getImageData(0,0,c.width,c.height);
  const d = id.data;
  for (let i=0;i<d.length;i+=4){ const gray = 0.299*d[i] + 0.587*d[i+1] + 0.114*d[i+2]; const thr = gray>150?255:0; d[i]=d[i+1]=d[i+2]=thr; }
  ctx.putImageData(id,0,0);
  return c;
}

async function ocrCanvas(file){
  const canvas = await preprocess(file);
  const worker = await Tesseract.createWorker();
  await worker.setParameters({ tessedit_pageseg_mode: 6 });
  const { data } = await worker.recognize(canvas);
  await worker.terminate();
  return data.text;
}

async function postToSheet(row, src){
  if (!cfg.SHEET_WEBHOOK_URL) return false;
  const payload = { name: row.name||'', phone: row.phone||'', email: row.email||'', company: row.company||'', website: row.website||'', address: row.address||'', designation: row.designation||'', sourceImage: src||'', scannedAt: new Date().toISOString(), notes: row.raw||'' };
  try {
    const res = await fetch(cfg.SHEET_WEBHOOK_URL, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
    if (res.headers.get('content-type')?.includes('application/json')) { await res.json(); return res.ok; }
    return res.ok;
  } catch(e) {
    try { await fetch(cfg.SHEET_WEBHOOK_URL, { method:'POST', mode:'no-cors', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(payload) }); return true; } catch(e2){ console.error(e2); return false; }
  }
}

async function handleFiles(list){
  for (const f of list){
    log.textContent += `\nProcessing ${f.name}...`;
    try {
      const text = await ocrCanvas(f);
      const fields = parseFields(text);
      processed.push(fields);
      const ok = await postToSheet(fields, '');
      addRow(URL.createObjectURL(f), fields, ok?'Saved':'Failed', ok);
    } catch(err) { console.error(err); addRow('',{},'OCR error',false); }
  }
}

document.getElementById('downloadCsv').addEventListener('click', ()=>{
  const csv = toCSV(processed);
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download='ocr-results.csv'; a.click();
});
