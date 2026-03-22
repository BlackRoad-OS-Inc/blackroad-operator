/**
 * BLACKROAD OS - Invoice Generator Macros
 *
 * SETUP INSTRUCTIONS:
 * 1. Open your Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Delete any existing code and paste this entire file
 * 4. Click Save (Ctrl+S)
 * 5. Refresh your sheet - you'll see a new "Invoice Tools" menu
 *
 * FEATURES:
 * - Auto-generate invoice numbers
 * - Calculate due dates based on payment terms
 * - Send invoices via email as PDF
 * - Track invoice status
 * - Generate PDF for download
 * - Mark invoices as paid
 * - Overdue invoice alerts
 */

// Create custom menu when sheet opens
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📄 Invoice Tools')
    .addItem('🆕 New Invoice', 'createNewInvoice')
    .addItem('📧 Send Invoice via Email', 'sendInvoiceEmail')
    .addItem('📥 Download as PDF', 'downloadInvoicePDF')
    .addSeparator()
    .addItem('✅ Mark as Paid', 'markAsPaid')
    .addItem('📨 Mark as Sent', 'markAsSent')
    .addSeparator()
    .addItem('⚠️ Check Overdue Invoices', 'checkOverdueInvoices')
    .addItem('📊 Generate Monthly Report', 'generateMonthlyReport')
    .addSeparator()
    .addItem('⚙️ Settings', 'openSettings')
    .addToUi();
}

// Generate new invoice with auto-incremented number
function createNewInvoice() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();

  // Get current invoice number and increment
  const currentInvoice = sheet.getRange('B17').getValue();
  let invoiceNum = 1;

  if (currentInvoice && currentInvoice.toString().includes('INV-')) {
    invoiceNum = parseInt(currentInvoice.replace('INV-', '')) + 1;
  }

  const newInvoiceNum = 'INV-' + invoiceNum.toString().padStart(4, '0');

  // Set new invoice number
  sheet.getRange('B17').setValue(newInvoiceNum);

  // Set invoice date to today
  sheet.getRange('B18').setValue(new Date());

  // Calculate due date based on payment terms
  const paymentTerms = sheet.getRange('B13').getValue();
  const daysMatch = paymentTerms.match(/\d+/);
  const days = daysMatch ? parseInt(daysMatch[0]) : 30;

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + days);
  sheet.getRange('B19').setValue(dueDate);

  // Set status to Draft
  sheet.getRange('B20').setValue('Draft');

  // Clear line items
  sheet.getRange('A34:G38').clearContent();
  sheet.getRange('A34').setValue('[Item 1]');
  sheet.getRange('B34').setValue('[Description]');
  sheet.getRange('C34').setValue(1);
  sheet.getRange('D34').setValue(0);
  sheet.getRange('E34').setValue('0%');
  sheet.getRange('F34').setValue('0%');

  // Clear client info
  sheet.getRange('B23:B28').clearContent();

  SpreadsheetApp.getUi().alert('✅ New Invoice Created: ' + newInvoiceNum);
}

// Send invoice via email
function sendInvoiceEmail() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();

  const clientEmail = sheet.getRange('B27').getValue();
  const clientName = sheet.getRange('B23').getValue();
  const invoiceNum = sheet.getRange('B17').getValue();
  const total = sheet.getRange('G44').getValue();
  const dueDate = sheet.getRange('B19').getValue();
  const companyName = sheet.getRange('B5').getValue();

  if (!clientEmail || !clientEmail.includes('@')) {
    SpreadsheetApp.getUi().alert('❌ Please enter a valid client email address');
    return;
  }

  // Create PDF of the invoice
  const pdfBlob = createInvoicePDF();

  // Email body
  const subject = `Invoice ${invoiceNum} from ${companyName}`;
  const body = `
Dear ${clientName},

Please find attached invoice ${invoiceNum} for $${total.toFixed(2)}.

Due Date: ${Utilities.formatDate(new Date(dueDate), Session.getScriptTimeZone(), 'MMMM dd, yyyy')}

If you have any questions about this invoice, please don't hesitate to contact us.

Thank you for your business!

Best regards,
${companyName}
  `;

  try {
    MailApp.sendEmail({
      to: clientEmail,
      subject: subject,
      body: body,
      attachments: [pdfBlob]
    });

    // Update status and sent date
    sheet.getRange('B20').setValue('Sent');
    addToHistory(sheet, invoiceNum, clientName, new Date(), total, 'Sent');

    SpreadsheetApp.getUi().alert('✅ Invoice sent successfully to ' + clientEmail);
  } catch (e) {
    SpreadsheetApp.getUi().alert('❌ Error sending email: ' + e.message);
  }
}

// Create PDF blob of invoice
function createInvoicePDF() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const invoiceNum = sheet.getRange('B17').getValue();

  // Get the sheet as PDF
  const url = ss.getUrl().replace(/edit.*$/, '') +
    'export?format=pdf&gid=' + sheet.getSheetId() +
    '&size=letter&portrait=true&fitw=true&gridlines=false&printtitle=false&sheetnames=false&pagenum=false&fzr=false' +
    '&range=A1:G50';

  const token = ScriptApp.getOAuthToken();
  const response = UrlFetchApp.fetch(url, {
    headers: { 'Authorization': 'Bearer ' + token }
  });

  return response.getBlob().setName(invoiceNum + '.pdf');
}

// Download invoice as PDF
function downloadInvoicePDF() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const invoiceNum = sheet.getRange('B17').getValue();

  const url = ss.getUrl().replace(/edit.*$/, '') +
    'export?format=pdf&gid=' + sheet.getSheetId() +
    '&size=letter&portrait=true&fitw=true&gridlines=false';

  const html = '<script>window.open("' + url + '");google.script.host.close();</script>';
  const userInterface = HtmlService.createHtmlOutput(html)
    .setWidth(200)
    .setHeight(50);

  SpreadsheetApp.getUi().showModalDialog(userInterface, 'Downloading ' + invoiceNum + '...');
}

// Mark invoice as paid
function markAsPaid() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();

  const invoiceNum = sheet.getRange('B17').getValue();
  const clientName = sheet.getRange('B23').getValue();
  const total = sheet.getRange('G44').getValue();

  sheet.getRange('B20').setValue('Paid');

  // Update history
  updateHistoryStatus(sheet, invoiceNum, 'Paid', new Date());

  SpreadsheetApp.getUi().alert('✅ Invoice ' + invoiceNum + ' marked as PAID');
}

// Mark invoice as sent
function markAsSent() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();

  const invoiceNum = sheet.getRange('B17').getValue();
  sheet.getRange('B20').setValue('Sent');

  SpreadsheetApp.getUi().alert('✅ Invoice ' + invoiceNum + ' marked as SENT');
}

// Check for overdue invoices
function checkOverdueInvoices() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();

  const historyStart = 52; // Row where history starts
  const lastRow = sheet.getLastRow();

  let overdueCount = 0;
  let overdueTotal = 0;
  let overdueList = [];

  for (let i = historyStart; i <= lastRow; i++) {
    const status = sheet.getRange(i, 5).getValue();
    const dueDate = sheet.getRange(i, 3).getValue();
    const amount = sheet.getRange(i, 4).getValue();
    const invoiceNum = sheet.getRange(i, 1).getValue();

    if (status === 'Sent' && new Date(dueDate) < new Date()) {
      overdueCount++;
      overdueTotal += parseFloat(amount) || 0;
      overdueList.push(invoiceNum);
      sheet.getRange(i, 5).setValue('Overdue');
    }
  }

  if (overdueCount > 0) {
    SpreadsheetApp.getUi().alert(
      '⚠️ OVERDUE INVOICES\n\n' +
      'Count: ' + overdueCount + '\n' +
      'Total: $' + overdueTotal.toFixed(2) + '\n\n' +
      'Invoices: ' + overdueList.join(', ')
    );
  } else {
    SpreadsheetApp.getUi().alert('✅ No overdue invoices!');
  }
}

// Add invoice to history
function addToHistory(sheet, invoiceNum, client, date, amount, status) {
  const historyStart = 52;
  const lastRow = sheet.getLastRow();
  const newRow = Math.max(lastRow + 1, historyStart);

  sheet.getRange(newRow, 1).setValue(invoiceNum);
  sheet.getRange(newRow, 2).setValue(client);
  sheet.getRange(newRow, 3).setValue(date);
  sheet.getRange(newRow, 4).setValue(amount);
  sheet.getRange(newRow, 5).setValue(status);
  sheet.getRange(newRow, 6).setValue(status === 'Sent' ? date : '');
}

// Update history status
function updateHistoryStatus(sheet, invoiceNum, status, date) {
  const historyStart = 52;
  const lastRow = sheet.getLastRow();

  for (let i = historyStart; i <= lastRow; i++) {
    if (sheet.getRange(i, 1).getValue() === invoiceNum) {
      sheet.getRange(i, 5).setValue(status);
      if (status === 'Paid') {
        sheet.getRange(i, 7).setValue(date);
      }
      break;
    }
  }
}

// Generate monthly report
function generateMonthlyReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();

  const historyStart = 52;
  const lastRow = sheet.getLastRow();

  let totalInvoiced = 0;
  let totalPaid = 0;
  let totalOutstanding = 0;
  let invoiceCount = 0;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  for (let i = historyStart; i <= lastRow; i++) {
    const date = new Date(sheet.getRange(i, 3).getValue());
    const amount = parseFloat(sheet.getRange(i, 4).getValue()) || 0;
    const status = sheet.getRange(i, 5).getValue();

    if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
      totalInvoiced += amount;
      invoiceCount++;

      if (status === 'Paid') {
        totalPaid += amount;
      } else {
        totalOutstanding += amount;
      }
    }
  }

  const report =
    '📊 MONTHLY REPORT - ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'MMMM yyyy') + '\n\n' +
    'Invoices Generated: ' + invoiceCount + '\n' +
    'Total Invoiced: $' + totalInvoiced.toFixed(2) + '\n' +
    'Total Paid: $' + totalPaid.toFixed(2) + '\n' +
    'Outstanding: $' + totalOutstanding.toFixed(2) + '\n' +
    'Collection Rate: ' + (totalInvoiced > 0 ? ((totalPaid/totalInvoiced)*100).toFixed(1) : 0) + '%';

  SpreadsheetApp.getUi().alert(report);
}

// Open settings
function openSettings() {
  const html = HtmlService.createHtmlOutput(`
    <h3>Invoice Settings</h3>
    <p>Edit the Company Info section (rows 5-14) to customize your invoices.</p>
    <p><b>Payment Terms:</b> Change cell B13 (e.g., "Net 15", "Net 30", "Net 60")</p>
    <p><b>Late Fee:</b> Change cell B14</p>
    <p><b>Logo:</b> Upload image to Google Drive, get shareable link, paste in B12</p>
    <br>
    <p><a href="https://github.com/BlackRoad-OS/blackroad-cluster" target="_blank">Documentation</a></p>
  `)
    .setWidth(400)
    .setHeight(250);

  SpreadsheetApp.getUi().showModalDialog(html, '⚙️ Settings');
}

// Trigger: Check overdue invoices daily
function createDailyTrigger() {
  ScriptApp.newTrigger('checkOverdueInvoices')
    .timeBased()
    .everyDays(1)
    .atHour(9)
    .create();
}
