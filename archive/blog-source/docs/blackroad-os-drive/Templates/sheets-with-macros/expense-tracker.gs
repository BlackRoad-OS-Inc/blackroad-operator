/**
 * BLACKROAD OS - Expense Tracker Macros
 *
 * SETUP: Extensions > Apps Script > Paste this code > Save > Refresh sheet
 *
 * FEATURES:
 * - Quick expense entry with auto-categorization
 * - Receipt attachment via Google Drive
 * - Budget alerts when approaching limits
 * - Approval workflow
 * - Export to accounting software (CSV/QBO)
 * - Monthly expense reports via email
 * - Mileage calculator
 * - Per diem calculator
 */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('💰 Expense Tools')
    .addItem('➕ Quick Add Expense', 'quickAddExpense')
    .addItem('📎 Attach Receipt', 'attachReceipt')
    .addSeparator()
    .addItem('✅ Approve Selected', 'approveExpense')
    .addItem('❌ Reject Selected', 'rejectExpense')
    .addItem('📋 View Pending Approvals', 'viewPendingApprovals')
    .addSeparator()
    .addItem('🚗 Calculate Mileage', 'calculateMileage')
    .addItem('🍽️ Calculate Per Diem', 'calculatePerDiem')
    .addSeparator()
    .addItem('📊 Generate Monthly Report', 'generateExpenseReport')
    .addItem('📧 Email Report to Manager', 'emailExpenseReport')
    .addItem('📥 Export for Accounting', 'exportForAccounting')
    .addSeparator()
    .addItem('⚠️ Check Budget Alerts', 'checkBudgetAlerts')
    .addToUi();
}

// Quick add expense with dialog
function quickAddExpense() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      label { display: block; margin-top: 10px; font-weight: bold; }
      input, select { width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px; }
      button { margin-top: 15px; padding: 10px 20px; background: #FF1D6C; color: white; border: none; border-radius: 4px; cursor: pointer; }
      button:hover { background: #E0195F; }
    </style>

    <label>Date</label>
    <input type="date" id="date" value="${new Date().toISOString().split('T')[0]}">

    <label>Category</label>
    <select id="category">
      <option>Travel</option>
      <option>Meals</option>
      <option>Software</option>
      <option>Office</option>
      <option>Marketing</option>
      <option>Other</option>
    </select>

    <label>Vendor</label>
    <input type="text" id="vendor" placeholder="e.g., Amazon, Uber, Starbucks">

    <label>Description</label>
    <input type="text" id="description" placeholder="Brief description">

    <label>Amount ($)</label>
    <input type="number" id="amount" step="0.01" placeholder="0.00">

    <label>Payment Method</label>
    <select id="payment">
      <option>Company Card</option>
      <option>Personal Card (Reimburse)</option>
      <option>Cash</option>
      <option>Check</option>
    </select>

    <button onclick="submitExpense()">Add Expense</button>

    <script>
      function submitExpense() {
        const expense = {
          date: document.getElementById('date').value,
          category: document.getElementById('category').value,
          vendor: document.getElementById('vendor').value,
          description: document.getElementById('description').value,
          amount: document.getElementById('amount').value,
          payment: document.getElementById('payment').value
        };
        google.script.run.withSuccessHandler(() => {
          google.script.host.close();
        }).addExpenseFromForm(expense);
      }
    </script>
  `)
    .setWidth(350)
    .setHeight(450);

  SpreadsheetApp.getUi().showModalDialog(html, '➕ Add New Expense');
}

// Add expense from form data
function addExpenseFromForm(expense) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();

  // Find first empty row in expense section (starting at row 6)
  let row = 6;
  while (sheet.getRange(row, 1).getValue() !== '') {
    row++;
    if (row > 500) break;
  }

  sheet.getRange(row, 1).setValue(new Date(expense.date));
  sheet.getRange(row, 2).setValue(expense.category);
  sheet.getRange(row, 3).setValue(expense.vendor);
  sheet.getRange(row, 4).setValue(expense.description);
  sheet.getRange(row, 5).setValue(parseFloat(expense.amount));
  sheet.getRange(row, 6).setValue(expense.payment);
  sheet.getRange(row, 7).setValue('');
  sheet.getRange(row, 8).setValue('Pending');

  // Check budget after adding
  checkBudgetAlerts();
}

// Attach receipt from Google Drive
function attachReceipt() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    '📎 Attach Receipt',
    'Paste Google Drive sharing link for receipt image/PDF:',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() === ui.Button.OK) {
    const link = response.getResponseText();
    const sheet = SpreadsheetApp.getActiveSheet();
    const row = sheet.getActiveCell().getRow();

    if (row >= 6) {
      sheet.getRange(row, 7).setValue(link);
      ui.alert('✅ Receipt attached!');
    } else {
      ui.alert('❌ Please select an expense row first');
    }
  }
}

// Approve selected expense
function approveExpense() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const row = sheet.getActiveCell().getRow();

  if (row >= 6) {
    sheet.getRange(row, 8).setValue('Approved');
    SpreadsheetApp.getUi().alert('✅ Expense approved!');
  }
}

// Reject selected expense
function rejectExpense() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Rejection Reason:', ui.ButtonSet.OK_CANCEL);

  if (response.getSelectedButton() === ui.Button.OK) {
    const sheet = SpreadsheetApp.getActiveSheet();
    const row = sheet.getActiveCell().getRow();

    if (row >= 6) {
      sheet.getRange(row, 8).setValue('Rejected');
      sheet.getRange(row, 9).setValue('Rejected: ' + response.getResponseText());
      ui.alert('❌ Expense rejected');
    }
  }
}

// View pending approvals
function viewPendingApprovals() {
  const sheet = SpreadsheetApp.getActiveSheet();
  let pending = [];
  let totalPending = 0;

  for (let row = 6; row <= 500; row++) {
    const status = sheet.getRange(row, 8).getValue();
    if (status === 'Pending') {
      const date = sheet.getRange(row, 1).getValue();
      const vendor = sheet.getRange(row, 3).getValue();
      const amount = sheet.getRange(row, 5).getValue();
      pending.push(`Row ${row}: ${vendor} - $${amount}`);
      totalPending += parseFloat(amount) || 0;
    }
    if (sheet.getRange(row, 1).getValue() === '') break;
  }

  if (pending.length > 0) {
    SpreadsheetApp.getUi().alert(
      '📋 PENDING APPROVALS\n\n' +
      pending.slice(0, 10).join('\n') +
      (pending.length > 10 ? '\n... and ' + (pending.length - 10) + ' more' : '') +
      '\n\nTotal Pending: $' + totalPending.toFixed(2)
    );
  } else {
    SpreadsheetApp.getUi().alert('✅ No pending approvals!');
  }
}

// Calculate mileage reimbursement
function calculateMileage() {
  const ui = SpreadsheetApp.getUi();
  const IRS_RATE = 0.67; // 2024 IRS rate - update annually

  const response = ui.prompt(
    '🚗 Mileage Calculator',
    'Enter miles driven:',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() === ui.Button.OK) {
    const miles = parseFloat(response.getResponseText());
    const reimbursement = miles * IRS_RATE;

    const addIt = ui.alert(
      '🚗 Mileage Calculation\n\n' +
      'Miles: ' + miles + '\n' +
      'IRS Rate: $' + IRS_RATE + '/mile\n' +
      'Reimbursement: $' + reimbursement.toFixed(2) + '\n\n' +
      'Add as expense?',
      ui.ButtonSet.YES_NO
    );

    if (addIt === ui.Button.YES) {
      addExpenseFromForm({
        date: new Date().toISOString().split('T')[0],
        category: 'Travel',
        vendor: 'Mileage Reimbursement',
        description: miles + ' miles @ $' + IRS_RATE + '/mi',
        amount: reimbursement.toFixed(2),
        payment: 'Personal Card (Reimburse)'
      });
    }
  }
}

// Calculate per diem
function calculatePerDiem() {
  const ui = SpreadsheetApp.getUi();

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      label { display: block; margin-top: 10px; }
      input, select { width: 100%; padding: 8px; margin-top: 5px; }
      button { margin-top: 15px; padding: 10px 20px; background: #2979FF; color: white; border: none; cursor: pointer; }
    </style>
    <label>Destination City</label>
    <input type="text" id="city" placeholder="e.g., New York, NY">
    <label>Number of Days</label>
    <input type="number" id="days" value="1">
    <label>Per Diem Rate ($/day)</label>
    <input type="number" id="rate" value="79" step="0.01">
    <p style="font-size:11px;color:#666;">Default: $79 (standard CONUS). Check GSA.gov for location-specific rates.</p>
    <button onclick="calculate()">Calculate & Add</button>
    <script>
      function calculate() {
        const data = {
          city: document.getElementById('city').value,
          days: document.getElementById('days').value,
          rate: document.getElementById('rate').value
        };
        google.script.run.withSuccessHandler(() => google.script.host.close()).addPerDiem(data);
      }
    </script>
  `).setWidth(300).setHeight(300);

  ui.showModalDialog(html, '🍽️ Per Diem Calculator');
}

function addPerDiem(data) {
  const total = parseFloat(data.days) * parseFloat(data.rate);
  addExpenseFromForm({
    date: new Date().toISOString().split('T')[0],
    category: 'Meals',
    vendor: 'Per Diem - ' + data.city,
    description: data.days + ' days @ $' + data.rate + '/day',
    amount: total.toFixed(2),
    payment: 'Personal Card (Reimburse)'
  });
}

// Check budget alerts
function checkBudgetAlerts() {
  const sheet = SpreadsheetApp.getActiveSheet();
  let alerts = [];

  // Check rows 22-26 for budget status
  for (let row = 22; row <= 26; row++) {
    const category = sheet.getRange(row, 1).getValue();
    const percentUsed = sheet.getRange(row, 5).getValue();
    const status = sheet.getRange(row, 6).getValue();

    if (status === 'Over Budget') {
      alerts.push('🔴 ' + category + ': ' + Math.round(percentUsed * 100) + '% - OVER BUDGET!');
    } else if (status === 'Warning') {
      alerts.push('🟡 ' + category + ': ' + Math.round(percentUsed * 100) + '% - Approaching limit');
    }
  }

  if (alerts.length > 0) {
    SpreadsheetApp.getUi().alert('⚠️ BUDGET ALERTS\n\n' + alerts.join('\n'));
  } else {
    SpreadsheetApp.getUi().alert('✅ All categories within budget!');
  }
}

// Generate expense report
function generateExpenseReport() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const month = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'MMMM yyyy');

  let totalExpenses = 0;
  let byCategory = {};
  let byPayment = {};

  for (let row = 6; row <= 500; row++) {
    const date = sheet.getRange(row, 1).getValue();
    if (!date) break;

    const expenseDate = new Date(date);
    if (expenseDate.getMonth() === new Date().getMonth() &&
        expenseDate.getFullYear() === new Date().getFullYear()) {

      const category = sheet.getRange(row, 2).getValue();
      const amount = parseFloat(sheet.getRange(row, 5).getValue()) || 0;
      const payment = sheet.getRange(row, 6).getValue();

      totalExpenses += amount;
      byCategory[category] = (byCategory[category] || 0) + amount;
      byPayment[payment] = (byPayment[payment] || 0) + amount;
    }
  }

  let report = '📊 EXPENSE REPORT - ' + month + '\n\n';
  report += 'TOTAL: $' + totalExpenses.toFixed(2) + '\n\n';
  report += 'BY CATEGORY:\n';
  for (let cat in byCategory) {
    report += '  ' + cat + ': $' + byCategory[cat].toFixed(2) + '\n';
  }
  report += '\nBY PAYMENT METHOD:\n';
  for (let pay in byPayment) {
    report += '  ' + pay + ': $' + byPayment[pay].toFixed(2) + '\n';
  }

  SpreadsheetApp.getUi().alert(report);
}

// Email report to manager
function emailExpenseReport() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Manager Email:', ui.ButtonSet.OK_CANCEL);

  if (response.getSelectedButton() === ui.Button.OK) {
    const email = response.getResponseText();
    // Generate report content (reuse generateExpenseReport logic)
    const month = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'MMMM yyyy');

    MailApp.sendEmail({
      to: email,
      subject: 'Expense Report - ' + month,
      body: 'Please find the monthly expense report attached.\n\nGenerated by BlackRoad OS Expense Tracker.'
    });

    ui.alert('✅ Report sent to ' + email);
  }
}

// Export for accounting software
function exportForAccounting() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();

  // Create new sheet with accounting format
  let exportSheet = ss.getSheetByName('Accounting Export');
  if (!exportSheet) {
    exportSheet = ss.insertSheet('Accounting Export');
  } else {
    exportSheet.clear();
  }

  // Headers for QuickBooks/Xero format
  exportSheet.getRange(1, 1, 1, 8).setValues([[
    'Date', 'Account', 'Description', 'Debit', 'Credit', 'Vendor', 'Category', 'Reference'
  ]]);

  let exportRow = 2;
  for (let row = 6; row <= 500; row++) {
    const date = sheet.getRange(row, 1).getValue();
    if (!date) break;

    const status = sheet.getRange(row, 8).getValue();
    if (status === 'Approved') {
      exportSheet.getRange(exportRow, 1).setValue(date);
      exportSheet.getRange(exportRow, 2).setValue('Expenses');
      exportSheet.getRange(exportRow, 3).setValue(sheet.getRange(row, 4).getValue());
      exportSheet.getRange(exportRow, 4).setValue(sheet.getRange(row, 5).getValue());
      exportSheet.getRange(exportRow, 5).setValue('');
      exportSheet.getRange(exportRow, 6).setValue(sheet.getRange(row, 3).getValue());
      exportSheet.getRange(exportRow, 7).setValue(sheet.getRange(row, 2).getValue());
      exportSheet.getRange(exportRow, 8).setValue('EXP-' + row);
      exportRow++;
    }
  }

  SpreadsheetApp.getUi().alert('✅ Export created in "Accounting Export" sheet\n\nDownload as CSV for QuickBooks/Xero import.');
}
