/**
 * Zoom Internet — Google Sheets lead logger
 * ------------------------------------------
 * Turns a Google Sheet into a live log of every website lead.
 * The Zoom site POSTs each lead as JSON to this script's web-app URL
 * (set as LEAD_WEBHOOK_URL in Vercel), and this appends a row.
 *
 * SETUP (5 minutes):
 *  1. Create a new Google Sheet (sheet.new). Name the first tab "Leads".
 *  2. Extensions → Apps Script. Delete any sample code.
 *  3. Paste this whole file in, then click Save.
 *  4. Deploy → New deployment → type "Web app".
 *       - Description: Zoom lead logger
 *       - Execute as: Me
 *       - Who has access: Anyone
 *     Click Deploy, authorize, and COPY the "Web app URL".
 *  5. In Vercel → zoom-internet → Settings → Environment Variables, add:
 *       LEAD_WEBHOOK_URL = <the Web app URL>
 *     Then redeploy. Done — new leads now land in the sheet.
 *
 * Tip: In the Sheet, File → Share → add your email with "Notify on changes"
 * (or set up a notification rule) to get an email each time a row is added.
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Leads")
      || SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    // Write a header row once.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Received", "Type", "Name", "Phone", "Email", "Area", "Plan", "Message",
      ]);
      sheet.getRange("A1:H1").setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    var data = {};
    try { data = JSON.parse(e.postData.contents); } catch (err) {}

    sheet.appendRow([
      data.receivedAt || new Date().toISOString(),
      data.type || "",
      data.name || "",
      data.phone || "",
      data.email || "",
      data.area || "",
      data.plan || "",
      data.message || "",
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// Lets you confirm the deployment is live by visiting the URL in a browser.
function doGet() {
  return ContentService
    .createTextOutput("Zoom Internet lead logger is running.")
    .setMimeType(ContentService.MimeType.TEXT);
}
