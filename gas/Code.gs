
/** Google Apps Script: Web App to append rows to your Google Sheet.
 * Deploy: Execute as 'Me', Access 'Anyone'.
 */
const SPREADSHEET_ID = "1uzJEyJdLD_tO1HbVdx0v4tl2DBJhM-bkNrimjEM2iGU";

function append_(o) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sh = ss.getSheets()[0];
  const values = [[
    o.name||'', o.phone||'', o.email||'', o.company||'',
    o.website||'', o.address||'', o.designation||'',
    o.sourceImage||'', o.scannedAt||new Date(), o.notes||''
  ]];
  sh.getRange(sh.getLastRow()+1,1,1,values[0].length).setValues(values);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || '{}');
    append_(data);
    return ContentService.createTextOutput(JSON.stringify({ok:true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ok:false,error:String(err)}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
