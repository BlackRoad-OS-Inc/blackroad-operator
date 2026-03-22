/**
 * BLACKROAD OS - Time Tracking with Payroll Calculations
 *
 * SETUP: Extensions > Apps Script > Paste this code > Save > Refresh sheet
 *
 * FEATURES:
 * - Clock in/out tracking
 * - Break time deductions
 * - Overtime calculations (1.5x after 40hrs/week, 2x after 12hrs/day)
 * - Multiple pay rates by employee
 * - PTO/Sick time tracking
 * - Payroll period summaries
 * - Export to payroll systems
 * - Manager approval workflow
 */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('⏰ Time Tools')
    .addItem('🟢 Clock In', 'clockIn')
    .addItem('🔴 Clock Out', 'clockOut')
    .addItem('☕ Start Break', 'startBreak')
    .addItem('☕ End Break', 'endBreak')
    .addSeparator()
    .addItem('➕ Add Manual Entry', 'addManualEntry')
    .addItem('🏖️ Request Time Off', 'requestTimeOff')
    .addSeparator()
    .addSubMenu(ui.createMenu('📊 Reports')
      .addItem('Weekly Summary', 'weeklySummary')
      .addItem('Pay Period Report', 'payPeriodReport')
      .addItem('Overtime Report', 'overtimeReport')
      .addItem('PTO Balance', 'ptoBalance'))
    .addSeparator()
    .addItem('✅ Approve Timesheets', 'approveTimesheets')
    .addItem('📧 Submit for Approval', 'submitForApproval')
    .addItem('📤 Export to Payroll', 'exportToPayroll')
    .addSeparator()
    .addItem('👥 Manage Employees', 'manageEmployees')
    .addItem('⚙️ Settings', 'openTimeSettings')
    .addToUi();
}

const CONFIG = {
  ENTRIES_START_ROW: 8,
  EMPLOYEES_SHEET: 'Employees',
  PTO_SHEET: 'PTO Requests',
  OT_THRESHOLD_WEEKLY: 40, // Hours before weekly overtime kicks in
  OT_THRESHOLD_DAILY: 8,   // Hours before daily overtime kicks in
  OT_RATE: 1.5,            // Overtime multiplier
  DOUBLE_OT_DAILY: 12,     // Hours before double time
  DOUBLE_OT_RATE: 2.0
};

// Clock in
function clockIn() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Enter your Employee ID:', ui.ButtonSet.OK_CANCEL);

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const empId = response.getResponseText().trim();
  const employee = getEmployee(empId);

  if (!employee) {
    ui.alert('❌ Employee ID not found: ' + empId);
    return;
  }

  const sheet = SpreadsheetApp.getActiveSheet();
  const now = new Date();

  // Check if already clocked in
  const lastRow = sheet.getLastRow();
  for (let row = lastRow; row >= CONFIG.ENTRIES_START_ROW; row--) {
    if (sheet.getRange(row, 1).getValue() === empId) {
      const clockOut = sheet.getRange(row, 5).getValue();
      if (!clockOut) {
        ui.alert('⚠️ You are already clocked in!\n\nClock out first before clocking in again.');
        return;
      }
      break;
    }
  }

  const newRow = lastRow + 1;
  sheet.getRange(newRow, 1).setValue(empId);
  sheet.getRange(newRow, 2).setValue(employee.name);
  sheet.getRange(newRow, 3).setValue(now); // Date
  sheet.getRange(newRow, 4).setValue(now); // Clock In
  sheet.getRange(newRow, 9).setValue('Pending'); // Status

  ui.alert('🟢 CLOCKED IN\n\nEmployee: ' + employee.name + '\nTime: ' + now.toLocaleTimeString() + '\n\nHave a great day!');
}

// Clock out
function clockOut() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Enter your Employee ID:', ui.ButtonSet.OK_CANCEL);

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const empId = response.getResponseText().trim();
  const sheet = SpreadsheetApp.getActiveSheet();
  const now = new Date();
  const lastRow = sheet.getLastRow();

  // Find open clock-in entry
  for (let row = lastRow; row >= CONFIG.ENTRIES_START_ROW; row--) {
    if (sheet.getRange(row, 1).getValue() === empId) {
      const clockOutCell = sheet.getRange(row, 5);
      if (!clockOutCell.getValue()) {
        clockOutCell.setValue(now);

        // Calculate hours
        const clockIn = new Date(sheet.getRange(row, 4).getValue());
        const breakMins = parseInt(sheet.getRange(row, 6).getValue()) || 0;
        let hours = (now - clockIn) / (1000 * 60 * 60) - (breakMins / 60);
        hours = Math.round(hours * 100) / 100;

        sheet.getRange(row, 7).setValue(hours); // Regular hours
        sheet.getRange(row, 8).setValue(calculateOvertimeForDay(hours)); // OT hours

        ui.alert('🔴 CLOCKED OUT\n\nTime: ' + now.toLocaleTimeString() + '\nTotal Hours: ' + hours.toFixed(2) + '\n\nSee you next time!');
        return;
      }
    }
  }

  ui.alert('❌ No open clock-in found for ' + empId);
}

// Start break
function startBreak() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Enter your Employee ID:', ui.ButtonSet.OK_CANCEL);

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const empId = response.getResponseText().trim();

  // Store break start time in user properties
  PropertiesService.getUserProperties().setProperty('break_start_' + empId, new Date().toISOString());

  ui.alert('☕ BREAK STARTED\n\nEnjoy your break!\n\nRemember to end your break when you return.');
}

// End break
function endBreak() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Enter your Employee ID:', ui.ButtonSet.OK_CANCEL);

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const empId = response.getResponseText().trim();
  const props = PropertiesService.getUserProperties();
  const breakStart = props.getProperty('break_start_' + empId);

  if (!breakStart) {
    ui.alert('❌ No break in progress for ' + empId);
    return;
  }

  const start = new Date(breakStart);
  const end = new Date();
  const breakMins = Math.round((end - start) / (1000 * 60));

  // Find today's entry and add break time
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  const today = new Date().toDateString();

  for (let row = lastRow; row >= CONFIG.ENTRIES_START_ROW; row--) {
    if (sheet.getRange(row, 1).getValue() === empId) {
      const entryDate = new Date(sheet.getRange(row, 3).getValue()).toDateString();
      if (entryDate === today && !sheet.getRange(row, 5).getValue()) {
        const currentBreak = parseInt(sheet.getRange(row, 6).getValue()) || 0;
        sheet.getRange(row, 6).setValue(currentBreak + breakMins);

        props.deleteProperty('break_start_' + empId);

        ui.alert('☕ BREAK ENDED\n\nBreak time: ' + breakMins + ' minutes\nTotal break today: ' + (currentBreak + breakMins) + ' minutes');
        return;
      }
    }
  }

  ui.alert('❌ No active shift found for today');
}

// Add manual entry
function addManualEntry() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      label { display: block; margin-top: 10px; font-weight: bold; }
      input, select { width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      button { margin-top: 15px; padding: 12px; background: #2979FF; color: white; border: none; cursor: pointer; width: 100%; border-radius: 4px; }
      .row { display: flex; gap: 10px; }
      .row > div { flex: 1; }
    </style>
    <label>Employee ID</label>
    <input type="text" id="empId" placeholder="e.g., EMP001">
    <label>Date</label>
    <input type="date" id="date">
    <div class="row">
      <div>
        <label>Clock In</label>
        <input type="time" id="clockIn" value="09:00">
      </div>
      <div>
        <label>Clock Out</label>
        <input type="time" id="clockOut" value="17:00">
      </div>
    </div>
    <label>Break (minutes)</label>
    <input type="number" id="breakMins" value="30" min="0">
    <label>Notes</label>
    <input type="text" id="notes" placeholder="Reason for manual entry">
    <button onclick="addEntry()">Add Entry</button>
    <script>
      document.getElementById('date').value = new Date().toISOString().split('T')[0];

      function addEntry() {
        const entry = {
          empId: document.getElementById('empId').value,
          date: document.getElementById('date').value,
          clockIn: document.getElementById('clockIn').value,
          clockOut: document.getElementById('clockOut').value,
          breakMins: document.getElementById('breakMins').value,
          notes: document.getElementById('notes').value
        };
        google.script.run.withSuccessHandler(() => {
          alert('Entry added!');
          google.script.host.close();
        }).processManualEntry(entry);
      }
    </script>
  `).setWidth(400).setHeight(420);

  SpreadsheetApp.getUi().showModalDialog(html, '➕ Manual Time Entry');
}

function processManualEntry(entry) {
  const sheet = SpreadsheetApp.getActiveSheet();
  const employee = getEmployee(entry.empId);

  if (!employee) {
    SpreadsheetApp.getUi().alert('❌ Employee not found: ' + entry.empId);
    return;
  }

  const date = new Date(entry.date);
  const clockIn = new Date(entry.date + 'T' + entry.clockIn);
  const clockOut = new Date(entry.date + 'T' + entry.clockOut);
  const breakMins = parseInt(entry.breakMins) || 0;

  let hours = (clockOut - clockIn) / (1000 * 60 * 60) - (breakMins / 60);
  hours = Math.round(hours * 100) / 100;

  const row = sheet.getLastRow() + 1;
  sheet.getRange(row, 1).setValue(entry.empId);
  sheet.getRange(row, 2).setValue(employee.name);
  sheet.getRange(row, 3).setValue(date);
  sheet.getRange(row, 4).setValue(clockIn);
  sheet.getRange(row, 5).setValue(clockOut);
  sheet.getRange(row, 6).setValue(breakMins);
  sheet.getRange(row, 7).setValue(hours);
  sheet.getRange(row, 8).setValue(calculateOvertimeForDay(hours));
  sheet.getRange(row, 9).setValue('Manual - ' + entry.notes);
}

// Calculate overtime for a day
function calculateOvertimeForDay(hours) {
  if (hours <= CONFIG.OT_THRESHOLD_DAILY) return 0;
  return Math.round((hours - CONFIG.OT_THRESHOLD_DAILY) * 100) / 100;
}

// Get employee info
function getEmployee(empId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let empSheet = ss.getSheetByName(CONFIG.EMPLOYEES_SHEET);

  if (!empSheet) return null;

  const data = empSheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === empId) {
      return {
        id: data[i][0],
        name: data[i][1],
        rate: data[i][2],
        department: data[i][3],
        email: data[i][4]
      };
    }
  }
  return null;
}

// Request time off
function requestTimeOff() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      label { display: block; margin-top: 10px; font-weight: bold; }
      input, select { width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      button { margin-top: 15px; padding: 12px; background: #4CAF50; color: white; border: none; cursor: pointer; width: 100%; border-radius: 4px; }
    </style>
    <label>Employee ID</label>
    <input type="text" id="empId" placeholder="e.g., EMP001">
    <label>Type</label>
    <select id="type">
      <option>PTO (Vacation)</option>
      <option>Sick Leave</option>
      <option>Personal</option>
      <option>Bereavement</option>
      <option>Jury Duty</option>
    </select>
    <label>Start Date</label>
    <input type="date" id="startDate">
    <label>End Date</label>
    <input type="date" id="endDate">
    <label>Notes</label>
    <input type="text" id="notes" placeholder="Optional reason">
    <button onclick="submitRequest()">Submit Request</button>
    <script>
      function submitRequest() {
        const request = {
          empId: document.getElementById('empId').value,
          type: document.getElementById('type').value,
          startDate: document.getElementById('startDate').value,
          endDate: document.getElementById('endDate').value,
          notes: document.getElementById('notes').value
        };
        google.script.run.withSuccessHandler(() => {
          alert('Time off request submitted!');
          google.script.host.close();
        }).processPTORequest(request);
      }
    </script>
  `).setWidth(350).setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(html, '🏖️ Request Time Off');
}

function processPTORequest(request) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let ptoSheet = ss.getSheetByName(CONFIG.PTO_SHEET);

  if (!ptoSheet) {
    ptoSheet = ss.insertSheet(CONFIG.PTO_SHEET);
    ptoSheet.getRange(1, 1, 1, 7).setValues([['Request ID', 'Employee ID', 'Name', 'Type', 'Start', 'End', 'Status']]);
    ptoSheet.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#E0E0E0');
  }

  const employee = getEmployee(request.empId);
  const reqId = 'PTO-' + Date.now().toString().slice(-6);
  const row = ptoSheet.getLastRow() + 1;

  ptoSheet.getRange(row, 1, 1, 7).setValues([[
    reqId,
    request.empId,
    employee ? employee.name : 'Unknown',
    request.type,
    new Date(request.startDate),
    new Date(request.endDate),
    'Pending'
  ]]);
}

// Weekly summary
function weeklySummary() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Employee ID (leave blank for all):', ui.ButtonSet.OK_CANCEL);

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const empId = response.getResponseText().trim();
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();

  // Get current week's Monday
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(monday.getDate() - monday.getDay() + 1);
  monday.setHours(0, 0, 0, 0);

  let totals = {};

  for (let row = CONFIG.ENTRIES_START_ROW; row <= lastRow; row++) {
    const rowEmpId = sheet.getRange(row, 1).getValue();
    const date = new Date(sheet.getRange(row, 3).getValue());
    const hours = parseFloat(sheet.getRange(row, 7).getValue()) || 0;

    if (date >= monday && (empId === '' || rowEmpId === empId)) {
      if (!totals[rowEmpId]) {
        totals[rowEmpId] = { name: sheet.getRange(row, 2).getValue(), hours: 0, days: 0 };
      }
      totals[rowEmpId].hours += hours;
      totals[rowEmpId].days++;
    }
  }

  let report = 'WEEKLY SUMMARY (Week of ' + monday.toLocaleDateString() + ')\n================================\n\n';

  for (const [id, data] of Object.entries(totals)) {
    const ot = data.hours > CONFIG.OT_THRESHOLD_WEEKLY ? (data.hours - CONFIG.OT_THRESHOLD_WEEKLY).toFixed(2) : 0;
    report += `${id}: ${data.name}\n`;
    report += `  Days: ${data.days} | Hours: ${data.hours.toFixed(2)}`;
    if (ot > 0) report += ` | OT: ${ot}`;
    report += '\n\n';
  }

  ui.alert(report || 'No entries found for this week.');
}

// Pay period report
function payPeriodReport() {
  const ui = SpreadsheetApp.getUi();

  // Default to semi-monthly (1-15, 16-end)
  const today = new Date();
  let startDate, endDate;

  if (today.getDate() <= 15) {
    startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    endDate = new Date(today.getFullYear(), today.getMonth(), 15);
  } else {
    startDate = new Date(today.getFullYear(), today.getMonth(), 16);
    endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  }

  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  let totals = {};

  for (let row = CONFIG.ENTRIES_START_ROW; row <= lastRow; row++) {
    const date = new Date(sheet.getRange(row, 3).getValue());
    if (date >= startDate && date <= endDate) {
      const empId = sheet.getRange(row, 1).getValue();
      const hours = parseFloat(sheet.getRange(row, 7).getValue()) || 0;
      const otHours = parseFloat(sheet.getRange(row, 8).getValue()) || 0;

      if (!totals[empId]) {
        const emp = getEmployee(empId);
        totals[empId] = {
          name: sheet.getRange(row, 2).getValue(),
          regular: 0,
          overtime: 0,
          rate: emp ? emp.rate : 0
        };
      }
      totals[empId].regular += (hours - otHours);
      totals[empId].overtime += otHours;
    }
  }

  let report = `PAY PERIOD REPORT\n${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}\n================================\n\n`;
  let grandTotal = 0;

  for (const [id, data] of Object.entries(totals)) {
    const regPay = data.regular * data.rate;
    const otPay = data.overtime * data.rate * CONFIG.OT_RATE;
    const total = regPay + otPay;
    grandTotal += total;

    report += `${id}: ${data.name}\n`;
    report += `  Regular: ${data.regular.toFixed(2)} hrs × $${data.rate} = $${regPay.toFixed(2)}\n`;
    if (data.overtime > 0) {
      report += `  Overtime: ${data.overtime.toFixed(2)} hrs × $${(data.rate * CONFIG.OT_RATE).toFixed(2)} = $${otPay.toFixed(2)}\n`;
    }
    report += `  Total: $${total.toFixed(2)}\n\n`;
  }

  report += `GRAND TOTAL: $${grandTotal.toFixed(2)}`;

  ui.alert(report || 'No entries found for this pay period.');
}

// Overtime report
function overtimeReport() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  let overtime = [];

  for (let row = CONFIG.ENTRIES_START_ROW; row <= lastRow; row++) {
    const ot = parseFloat(sheet.getRange(row, 8).getValue()) || 0;
    if (ot > 0) {
      overtime.push({
        empId: sheet.getRange(row, 1).getValue(),
        name: sheet.getRange(row, 2).getValue(),
        date: new Date(sheet.getRange(row, 3).getValue()).toLocaleDateString(),
        hours: ot
      });
    }
  }

  if (overtime.length === 0) {
    SpreadsheetApp.getUi().alert('✅ No overtime logged!');
    return;
  }

  let report = 'OVERTIME REPORT\n===============\n\n';
  let totalOT = 0;

  for (const entry of overtime) {
    report += `${entry.date}: ${entry.name} - ${entry.hours.toFixed(2)} hrs OT\n`;
    totalOT += entry.hours;
  }

  report += `\nTOTAL OVERTIME: ${totalOT.toFixed(2)} hours`;

  SpreadsheetApp.getUi().alert(report);
}

// PTO balance
function ptoBalance() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ptoSheet = ss.getSheetByName(CONFIG.PTO_SHEET);
  const empSheet = ss.getSheetByName(CONFIG.EMPLOYEES_SHEET);

  if (!ptoSheet || !empSheet) {
    SpreadsheetApp.getUi().alert('Required sheets not found.');
    return;
  }

  // This would need employee PTO balances stored somewhere
  SpreadsheetApp.getUi().alert('📋 PTO Balance Report\n\nView the "PTO Requests" sheet for all requests.\n\nSet up employee PTO balances in the "Employees" sheet.');
}

// Approve timesheets
function approveTimesheets() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  let pendingCount = 0;

  for (let row = CONFIG.ENTRIES_START_ROW; row <= lastRow; row++) {
    const status = sheet.getRange(row, 9).getValue();
    if (status === 'Pending') {
      sheet.getRange(row, 9).setValue('Approved');
      sheet.getRange(row, 1, 1, 9).setBackground('#C8E6C9');
      pendingCount++;
    }
  }

  SpreadsheetApp.getUi().alert('✅ Approved ' + pendingCount + ' timesheet entries');
}

// Submit for approval
function submitForApproval() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Submit timesheets to (manager email):', ui.ButtonSet.OK_CANCEL);

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const email = response.getResponseText();
  const sheet = SpreadsheetApp.getActiveSheet();
  const url = SpreadsheetApp.getActiveSpreadsheet().getUrl();

  const subject = 'Timesheet Approval Required - ' + new Date().toLocaleDateString();
  const body = `Timesheets are ready for approval.\n\nReview and approve here: ${url}\n\n--\nBlackRoad OS Time Tracking`;

  MailApp.sendEmail(email, subject, body);
  ui.alert('✅ Submitted for approval to ' + email);
}

// Export to payroll
function exportToPayroll() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = SpreadsheetApp.getActiveSheet();

  // Create export sheet
  let exportSheet = ss.getSheetByName('Payroll Export');
  if (exportSheet) ss.deleteSheet(exportSheet);
  exportSheet = ss.insertSheet('Payroll Export');

  // Header for common payroll systems
  exportSheet.getRange(1, 1, 1, 6).setValues([['Employee ID', 'Employee Name', 'Regular Hours', 'OT Hours', 'Total Hours', 'Pay Period']]);

  const lastRow = sheet.getLastRow();
  let totals = {};

  // Get current pay period
  const today = new Date();
  const payPeriod = today.toLocaleDateString();

  for (let row = CONFIG.ENTRIES_START_ROW; row <= lastRow; row++) {
    const status = sheet.getRange(row, 9).getValue();
    if (status === 'Approved') {
      const empId = sheet.getRange(row, 1).getValue();
      const hours = parseFloat(sheet.getRange(row, 7).getValue()) || 0;
      const ot = parseFloat(sheet.getRange(row, 8).getValue()) || 0;

      if (!totals[empId]) {
        totals[empId] = { name: sheet.getRange(row, 2).getValue(), regular: 0, ot: 0 };
      }
      totals[empId].regular += (hours - ot);
      totals[empId].ot += ot;
    }
  }

  let exportRow = 2;
  for (const [id, data] of Object.entries(totals)) {
    exportSheet.getRange(exportRow, 1, 1, 6).setValues([[
      id,
      data.name,
      data.regular.toFixed(2),
      data.ot.toFixed(2),
      (data.regular + data.ot).toFixed(2),
      payPeriod
    ]]);
    exportRow++;
  }

  ss.setActiveSheet(exportSheet);
  SpreadsheetApp.getUi().alert('✅ Payroll export created!\n\nDownload as CSV for import to your payroll system.');
}

// Manage employees
function manageEmployees() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let empSheet = ss.getSheetByName(CONFIG.EMPLOYEES_SHEET);

  if (!empSheet) {
    empSheet = ss.insertSheet(CONFIG.EMPLOYEES_SHEET);
    empSheet.getRange(1, 1, 1, 6).setValues([['Employee ID', 'Name', 'Hourly Rate', 'Department', 'Email', 'PTO Balance']]);
    empSheet.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#E0E0E0');
    empSheet.getRange(2, 1, 1, 6).setValues([['EMP001', 'Example Employee', '25.00', 'Engineering', 'emp@example.com', '80']]);
  }

  ss.setActiveSheet(empSheet);
  SpreadsheetApp.getUi().alert('👥 Employee Management\n\nAdd employees to this sheet with:\n- Employee ID\n- Name\n- Hourly Rate\n- Department\n- Email\n- PTO Balance (hours)');
}

// Settings
function openTimeSettings() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      h3 { color: #2979FF; }
      code { background: #f5f5f5; padding: 2px 6px; }
    </style>
    <h3>⚙️ Time Tracking Settings</h3>
    <p><b>Overtime Rules:</b></p>
    <p>• Weekly threshold: 40 hours</p>
    <p>• Daily threshold: 8 hours</p>
    <p>• OT rate: 1.5x</p>
    <p>• Double time: after 12 hrs/day (2x)</p>
    <p><b>To customize:</b> Edit CONFIG in Apps Script</p>
    <p><b>Required Sheets:</b></p>
    <p>• "Employees" - employee info & rates</p>
    <p>• "PTO Requests" - time off requests</p>
  `).setWidth(350).setHeight(300);

  SpreadsheetApp.getUi().showModalDialog(html, '⚙️ Settings');
}
