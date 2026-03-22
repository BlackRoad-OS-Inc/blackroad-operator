/**
 * BLACKROAD OS - SOX Compliance & Internal Controls
 *
 * SETUP: Extensions > Apps Script > Paste this code > Save > Refresh sheet
 *
 * FEATURES:
 * - Control testing automation
 * - Evidence collection tracking
 * - Deficiency management
 * - Audit trail logging
 * - Management certification workflow
 * - Financial close checklist
 * - Segregation of duties matrix
 * - Control self-assessment
 */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📈 SOX Tools')
    .addItem('➕ Add Control Test', 'addControlTest')
    .addItem('📋 Record Deficiency', 'recordDeficiency')
    .addItem('📎 Log Evidence', 'logEvidence')
    .addSeparator()
    .addSubMenu(ui.createMenu('📊 Reports')
      .addItem('Control Testing Summary', 'controlTestingSummary')
      .addItem('Deficiency Report', 'deficiencyReport')
      .addItem('Evidence Status', 'evidenceStatus')
      .addItem('SOD Matrix', 'sodMatrix'))
    .addSeparator()
    .addSubMenu(ui.createMenu('✅ Checklists')
      .addItem('Quarter-End Close', 'quarterEndChecklist')
      .addItem('Year-End Close', 'yearEndChecklist')
      .addItem('Management Certification', 'certificationChecklist'))
    .addSeparator()
    .addItem('⚠️ Check Control Status', 'checkControlStatus')
    .addItem('📧 Send Testing Reminders', 'sendTestingReminders')
    .addItem('⚙️ Settings', 'openSOXSettings')
    .addToUi();
}

const CONFIG = {
  CONTROLS_SHEET: 'Controls',
  TESTING_SHEET: 'Control Testing',
  DEFICIENCIES_SHEET: 'Deficiencies',
  EVIDENCE_SHEET: 'Evidence',
  PROCESS_AREAS: [
    'Revenue Recognition',
    'Accounts Receivable',
    'Accounts Payable',
    'Payroll',
    'Fixed Assets',
    'Inventory',
    'Financial Close',
    'IT General Controls',
    'Treasury',
    'Tax'
  ]
};

// Add Control Test
function addControlTest() {
  const processOptions = CONFIG.PROCESS_AREAS.map(p => `<option>${p}</option>`).join('');

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      label { display: block; margin-top: 10px; font-weight: bold; }
      input, select, textarea { width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      button { margin-top: 15px; padding: 12px; background: #2979FF; color: white; border: none; cursor: pointer; width: 100%; border-radius: 4px; }
    </style>
    <label>Control ID</label>
    <input type="text" id="controlId" placeholder="e.g., REV-001, AP-003">
    <label>Process Area</label>
    <select id="processArea">${processOptions}</select>
    <label>Control Description</label>
    <textarea id="description" rows="2" placeholder="What the control does"></textarea>
    <label>Control Type</label>
    <select id="controlType">
      <option>Preventive</option>
      <option>Detective</option>
      <option>Manual</option>
      <option>Automated (ITGC)</option>
    </select>
    <label>Frequency</label>
    <select id="frequency">
      <option>Per Transaction</option>
      <option>Daily</option>
      <option>Weekly</option>
      <option>Monthly</option>
      <option>Quarterly</option>
      <option>Annually</option>
    </select>
    <label>Control Owner</label>
    <input type="text" id="owner" placeholder="Name or role">
    <label>Testing Period</label>
    <select id="period">
      <option>Q1</option>
      <option>Q2</option>
      <option>Q3</option>
      <option>Q4</option>
      <option>Annual</option>
    </select>
    <button onclick="addTest()">Add Control Test</button>
    <script>
      function addTest() {
        const test = {
          controlId: document.getElementById('controlId').value,
          processArea: document.getElementById('processArea').value,
          description: document.getElementById('description').value,
          controlType: document.getElementById('controlType').value,
          frequency: document.getElementById('frequency').value,
          owner: document.getElementById('owner').value,
          period: document.getElementById('period').value
        };
        google.script.run.withSuccessHandler(() => {
          alert('Control test added!');
          google.script.host.close();
        }).processControlTest(test);
      }
    </script>
  `).setWidth(400).setHeight(520);

  SpreadsheetApp.getUi().showModalDialog(html, '➕ Add Control Test');
}

function processControlTest(test) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.TESTING_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.TESTING_SHEET);
    sheet.getRange(1, 1, 1, 12).setValues([['Control ID', 'Process Area', 'Description', 'Type', 'Frequency', 'Owner', 'Period', 'Test Date', 'Tester', 'Result', 'Evidence Ref', 'Notes']]);
    sheet.getRange(1, 1, 1, 12).setFontWeight('bold').setBackground('#E3F2FD');
  }

  const row = sheet.getLastRow() + 1;
  sheet.getRange(row, 1, 1, 12).setValues([[
    test.controlId,
    test.processArea,
    test.description,
    test.controlType,
    test.frequency,
    test.owner,
    test.period,
    '', // Test date
    '', // Tester
    'Not Tested', // Result
    '', // Evidence
    ''  // Notes
  ]]);
}

// Record Deficiency
function recordDeficiency() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      label { display: block; margin-top: 10px; font-weight: bold; }
      input, select, textarea { width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      button { margin-top: 15px; padding: 12px; background: #FF1D6C; color: white; border: none; cursor: pointer; width: 100%; border-radius: 4px; }
      .warning { background: #FFF3E0; padding: 8px; border-radius: 4px; margin-top: 10px; font-size: 12px; }
    </style>
    <label>Related Control ID</label>
    <input type="text" id="controlId" placeholder="e.g., REV-001">
    <label>Deficiency Type</label>
    <select id="defType">
      <option>Control Design Deficiency</option>
      <option>Control Operating Deficiency</option>
      <option>Significant Deficiency</option>
      <option>Material Weakness</option>
    </select>
    <label>Description</label>
    <textarea id="description" rows="3" placeholder="Detailed description of the deficiency"></textarea>
    <label>Root Cause</label>
    <textarea id="rootCause" rows="2" placeholder="Why did this occur?"></textarea>
    <label>Impact</label>
    <select id="impact">
      <option>Low - Immaterial</option>
      <option>Medium - Potentially material</option>
      <option>High - Material impact likely</option>
    </select>
    <label>Remediation Plan</label>
    <textarea id="remediation" rows="2" placeholder="How will this be fixed?"></textarea>
    <label>Target Date</label>
    <input type="date" id="targetDate">
    <div class="warning">⚠️ Material weaknesses must be disclosed in SEC filings</div>
    <button onclick="submitDeficiency()">Record Deficiency</button>
    <script>
      function submitDeficiency() {
        const def = {
          controlId: document.getElementById('controlId').value,
          defType: document.getElementById('defType').value,
          description: document.getElementById('description').value,
          rootCause: document.getElementById('rootCause').value,
          impact: document.getElementById('impact').value,
          remediation: document.getElementById('remediation').value,
          targetDate: document.getElementById('targetDate').value
        };
        google.script.run.withSuccessHandler(() => {
          alert('Deficiency recorded!');
          google.script.host.close();
        }).processDeficiency(def);
      }
    </script>
  `).setWidth(420).setHeight(580);

  SpreadsheetApp.getUi().showModalDialog(html, '⚠️ Record Deficiency');
}

function processDeficiency(def) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.DEFICIENCIES_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.DEFICIENCIES_SHEET);
    sheet.getRange(1, 1, 1, 11).setValues([['Def ID', 'Control ID', 'Type', 'Description', 'Root Cause', 'Impact', 'Remediation', 'Target Date', 'Status', 'Owner', 'Created']]);
    sheet.getRange(1, 1, 1, 11).setFontWeight('bold').setBackground('#FFEBEE');
  }

  const defId = 'DEF-' + Date.now().toString().slice(-6);
  const row = sheet.getLastRow() + 1;

  sheet.getRange(row, 1, 1, 11).setValues([[
    defId,
    def.controlId,
    def.defType,
    def.description,
    def.rootCause,
    def.impact,
    def.remediation,
    def.targetDate ? new Date(def.targetDate) : '',
    'Open',
    '',
    new Date()
  ]]);

  // Color code by type
  const colors = {
    'Control Design Deficiency': '#FFF3E0',
    'Control Operating Deficiency': '#FFF3E0',
    'Significant Deficiency': '#FFEBEE',
    'Material Weakness': '#F8BBD9'
  };
  sheet.getRange(row, 1, 1, 11).setBackground(colors[def.defType] || '#FFFFFF');
}

// Log Evidence
function logEvidence() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      label { display: block; margin-top: 10px; font-weight: bold; }
      input, select, textarea { width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      button { margin-top: 15px; padding: 12px; background: #4CAF50; color: white; border: none; cursor: pointer; width: 100%; border-radius: 4px; }
    </style>
    <label>Control ID</label>
    <input type="text" id="controlId" placeholder="e.g., REV-001">
    <label>Evidence Type</label>
    <select id="evidenceType">
      <option>Screenshot</option>
      <option>Report/Output</option>
      <option>Signed Document</option>
      <option>System Log</option>
      <option>Email</option>
      <option>Reconciliation</option>
      <option>Approval</option>
    </select>
    <label>Description</label>
    <input type="text" id="description" placeholder="What does this evidence show?">
    <label>File Location/Link</label>
    <input type="text" id="location" placeholder="Drive link, folder path, or filename">
    <label>Test Period</label>
    <select id="period">
      <option>Q1</option>
      <option>Q2</option>
      <option>Q3</option>
      <option>Q4</option>
    </select>
    <button onclick="addEvidence()">Log Evidence</button>
    <script>
      function addEvidence() {
        const evidence = {
          controlId: document.getElementById('controlId').value,
          evidenceType: document.getElementById('evidenceType').value,
          description: document.getElementById('description').value,
          location: document.getElementById('location').value,
          period: document.getElementById('period').value
        };
        google.script.run.withSuccessHandler(() => {
          alert('Evidence logged!');
          google.script.host.close();
        }).processEvidence(evidence);
      }
    </script>
  `).setWidth(380).setHeight(380);

  SpreadsheetApp.getUi().showModalDialog(html, '📎 Log Evidence');
}

function processEvidence(evidence) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.EVIDENCE_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.EVIDENCE_SHEET);
    sheet.getRange(1, 1, 1, 7).setValues([['Evidence ID', 'Control ID', 'Type', 'Description', 'Location', 'Period', 'Logged']]);
    sheet.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#E8F5E9');
  }

  const evidenceId = 'EV-' + Date.now().toString().slice(-6);
  const row = sheet.getLastRow() + 1;

  sheet.getRange(row, 1, 1, 7).setValues([[
    evidenceId,
    evidence.controlId,
    evidence.evidenceType,
    evidence.description,
    evidence.location,
    evidence.period,
    new Date()
  ]]);
}

// Control Testing Summary
function controlTestingSummary() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.TESTING_SHEET);

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No control testing data found.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  let stats = { total: 0, passed: 0, failed: 0, notTested: 0, byProcess: {} };

  for (let i = 1; i < data.length; i++) {
    stats.total++;
    const result = data[i][9];
    const process = data[i][1];

    if (result === 'Effective') stats.passed++;
    else if (result === 'Ineffective') stats.failed++;
    else stats.notTested++;

    if (!stats.byProcess[process]) stats.byProcess[process] = { total: 0, passed: 0 };
    stats.byProcess[process].total++;
    if (result === 'Effective') stats.byProcess[process].passed++;
  }

  let report = `
SOX CONTROL TESTING SUMMARY
===========================

Total Controls: ${stats.total}
✅ Effective: ${stats.passed}
❌ Ineffective: ${stats.failed}
⬜ Not Tested: ${stats.notTested}

Testing Completion: ${((stats.passed + stats.failed) / stats.total * 100).toFixed(1)}%
Effectiveness Rate: ${stats.passed > 0 ? ((stats.passed / (stats.passed + stats.failed)) * 100).toFixed(1) : 0}%

BY PROCESS AREA:
`;

  for (const [process, data] of Object.entries(stats.byProcess)) {
    const rate = data.total > 0 ? ((data.passed / data.total) * 100).toFixed(0) : 0;
    report += `  ${process}: ${data.passed}/${data.total} (${rate}%)\n`;
  }

  SpreadsheetApp.getUi().alert(report);
}

// Deficiency Report
function deficiencyReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.DEFICIENCIES_SHEET);

  if (!sheet) {
    SpreadsheetApp.getUi().alert('✅ No deficiencies recorded.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  let stats = { open: 0, closed: 0, materialWeakness: 0, significantDef: 0 };

  for (let i = 1; i < data.length; i++) {
    if (data[i][8] === 'Open') stats.open++;
    else stats.closed++;

    if (data[i][2] === 'Material Weakness') stats.materialWeakness++;
    if (data[i][2] === 'Significant Deficiency') stats.significantDef++;
  }

  const report = `
SOX DEFICIENCY REPORT
=====================

Total Deficiencies: ${data.length - 1}
🔴 Open: ${stats.open}
🟢 Closed: ${stats.closed}

🚨 Material Weaknesses: ${stats.materialWeakness}
⚠️ Significant Deficiencies: ${stats.significantDef}

${stats.materialWeakness > 0 ? '⚠️ Material weaknesses require disclosure in SEC filings!' : '✅ No material weaknesses'}
  `;

  SpreadsheetApp.getUi().alert(report);
}

// Evidence Status
function evidenceStatus() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const testSheet = ss.getSheetByName(CONFIG.TESTING_SHEET);
  const evidenceSheet = ss.getSheetByName(CONFIG.EVIDENCE_SHEET);

  if (!testSheet) {
    SpreadsheetApp.getUi().alert('No control testing data found.');
    return;
  }

  const controls = testSheet.getDataRange().getValues();
  const evidence = evidenceSheet ? evidenceSheet.getDataRange().getValues() : [];

  // Count evidence by control
  const evidenceCount = {};
  for (let i = 1; i < evidence.length; i++) {
    const controlId = evidence[i][1];
    evidenceCount[controlId] = (evidenceCount[controlId] || 0) + 1;
  }

  let withEvidence = 0, withoutEvidence = 0;
  for (let i = 1; i < controls.length; i++) {
    const controlId = controls[i][0];
    if (evidenceCount[controlId]) withEvidence++;
    else withoutEvidence++;
  }

  const report = `
EVIDENCE STATUS
===============

Controls with evidence: ${withEvidence}
Controls missing evidence: ${withoutEvidence}

Evidence Coverage: ${((withEvidence / (controls.length - 1)) * 100).toFixed(1)}%
  `;

  SpreadsheetApp.getUi().alert(report);
}

// SOD Matrix
function sodMatrix() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('SOD Matrix');

  if (!sheet) {
    sheet = ss.insertSheet('SOD Matrix');

    const matrix = [
      ['SEGREGATION OF DUTIES MATRIX', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      ['Function', 'Initiate', 'Approve', 'Record', 'Custody', 'Reconcile', 'Conflicts?'],
      ['Purchasing', '[Role]', '[Role]', '[Role]', '[Role]', '[Role]', '=IF(OR(B4=C4,B4=D4,C4=D4),"⚠️ CONFLICT","✅ OK")'],
      ['Accounts Payable', '[Role]', '[Role]', '[Role]', '[Role]', '[Role]', '=IF(OR(B5=C5,B5=D5,C5=D5),"⚠️ CONFLICT","✅ OK")'],
      ['Cash Disbursements', '[Role]', '[Role]', '[Role]', '[Role]', '[Role]', '=IF(OR(B6=C6,B6=D6,C6=D6),"⚠️ CONFLICT","✅ OK")'],
      ['Accounts Receivable', '[Role]', '[Role]', '[Role]', '[Role]', '[Role]', '=IF(OR(B7=C7,B7=D7,C7=D7),"⚠️ CONFLICT","✅ OK")'],
      ['Cash Receipts', '[Role]', '[Role]', '[Role]', '[Role]', '[Role]', '=IF(OR(B8=C8,B8=D8,C8=D8),"⚠️ CONFLICT","✅ OK")'],
      ['Payroll', '[Role]', '[Role]', '[Role]', '[Role]', '[Role]', '=IF(OR(B9=C9,B9=D9,C9=D9),"⚠️ CONFLICT","✅ OK")'],
      ['Fixed Assets', '[Role]', '[Role]', '[Role]', '[Role]', '[Role]', '=IF(OR(B10=C10,B10=D10,C10=D10),"⚠️ CONFLICT","✅ OK")'],
      ['Inventory', '[Role]', '[Role]', '[Role]', '[Role]', '[Role]', '=IF(OR(B11=C11,B11=D11,C11=D11),"⚠️ CONFLICT","✅ OK")'],
      ['', '', '', '', '', '', ''],
      ['⚠️ Key SOD Principle: No single person should have control over two or more of:', '', '', '', '', '', ''],
      ['Authorization/Approval, Custody of Assets, Recording Transactions, Reconciliation', '', '', '', '', '', '']
    ];

    sheet.getRange(1, 1, matrix.length, 7).setValues(matrix);
    sheet.getRange(1, 1).setFontWeight('bold').setFontSize(14);
    sheet.getRange(3, 1, 1, 7).setFontWeight('bold').setBackground('#E3F2FD');
  }

  ss.setActiveSheet(sheet);
  SpreadsheetApp.getUi().alert('📊 SOD Matrix opened.\n\nEnter role names in each cell. Conflicts are automatically detected.');
}

// Quarter-End Checklist
function quarterEndChecklist() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Quarter-End Close');

  if (!sheet) {
    sheet = ss.insertSheet('Quarter-End Close');

    const checklist = [
      ['QUARTER-END CLOSE CHECKLIST', '', '', ''],
      ['Quarter:', '', 'Year:', new Date().getFullYear()],
      ['', '', '', ''],
      ['Step', 'Task', 'Owner', 'Status', 'Completed Date'],
      ['1', 'Close sub-ledgers (AR, AP, FA)', '', '☐', ''],
      ['2', 'Complete bank reconciliations', '', '☐', ''],
      ['3', 'Record adjusting journal entries', '', '☐', ''],
      ['4', 'Complete intercompany reconciliations', '', '☐', ''],
      ['5', 'Review revenue recognition', '', '☐', ''],
      ['6', 'Analyze account variances', '', '☐', ''],
      ['7', 'Review accruals and reserves', '', '☐', ''],
      ['8', 'Complete management review', '', '☐', ''],
      ['9', 'Prepare financial statements', '', '☐', ''],
      ['10', 'SEC reporting (if applicable)', '', '☐', ''],
      ['11', 'Management certification', '', '☐', ''],
      ['12', 'Archive workpapers', '', '☐', '']
    ];

    sheet.getRange(1, 1, checklist.length, 5).setValues(checklist);
    sheet.getRange(1, 1).setFontWeight('bold').setFontSize(14);
    sheet.getRange(4, 1, 1, 5).setFontWeight('bold').setBackground('#E3F2FD');
  }

  ss.setActiveSheet(sheet);
}

// Year-End Checklist
function yearEndChecklist() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Year-End Close');

  if (!sheet) {
    sheet = ss.insertSheet('Year-End Close');

    const checklist = [
      ['YEAR-END CLOSE CHECKLIST', '', '', ''],
      ['Fiscal Year:', new Date().getFullYear(), '', ''],
      ['', '', '', ''],
      ['Category', 'Task', 'Owner', 'Status'],
      ['Pre-Close', 'Complete Q4 close procedures', '', '☐'],
      ['Pre-Close', 'Prepare audit schedules', '', '☐'],
      ['Pre-Close', 'Update rollforward schedules', '', '☐'],
      ['Audit', 'Provide PBC (prepared by client) items', '', '☐'],
      ['Audit', 'Address audit inquiries', '', '☐'],
      ['Audit', 'Management representation letter', '', '☐'],
      ['Tax', 'Provide tax provision workpapers', '', '☐'],
      ['Tax', 'Review deferred tax accounts', '', '☐'],
      ['Reporting', 'Draft 10-K/Annual Report', '', '☐'],
      ['Reporting', 'Prepare footnotes', '', '☐'],
      ['Reporting', 'Management discussion & analysis', '', '☐'],
      ['Compliance', 'SOX 302 certification', '', '☐'],
      ['Compliance', 'SOX 404 assessment', '', '☐'],
      ['Final', 'Board audit committee review', '', '☐'],
      ['Final', 'SEC filing', '', '☐']
    ];

    sheet.getRange(1, 1, checklist.length, 4).setValues(checklist);
    sheet.getRange(1, 1).setFontWeight('bold').setFontSize(14);
    sheet.getRange(4, 1, 1, 4).setFontWeight('bold').setBackground('#E3F2FD');
  }

  ss.setActiveSheet(sheet);
}

// Management Certification
function certificationChecklist() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Management Certification');

  if (!sheet) {
    sheet = ss.insertSheet('Management Certification');

    const content = [
      ['SOX 302/404 MANAGEMENT CERTIFICATION', ''],
      ['', ''],
      ['Certifying Officers:', ''],
      ['CEO Name:', '[Name]'],
      ['CFO Name:', '[Name]'],
      ['Period:', '[Q1/Q2/Q3/Q4/Annual] [Year]'],
      ['', ''],
      ['SECTION 302 CERTIFICATION ITEMS', 'Confirmed'],
      ['Report does not contain untrue statement of material fact', '☐'],
      ['Report does not omit material fact necessary to make statements not misleading', '☐'],
      ['Financial statements fairly present financial condition and results', '☐'],
      ['Signing officers are responsible for disclosure controls', '☐'],
      ['Disclosure controls were evaluated within 90 days', '☐'],
      ['Conclusions about effectiveness of controls were presented', '☐'],
      ['All significant deficiencies/material weaknesses disclosed to auditors', '☐'],
      ['Any fraud involving management or significant employees disclosed', '☐'],
      ['', ''],
      ['SECTION 404 CERTIFICATION (Annual)', 'Confirmed'],
      ['Management assessed effectiveness of internal controls', '☐'],
      ['Framework used for assessment disclosed (COSO)', '☐'],
      ['Conclusions on effectiveness stated', '☐'],
      ['External auditor report obtained', '☐'],
      ['', ''],
      ['CEO Signature:', '_______________', 'Date:', ''],
      ['CFO Signature:', '_______________', 'Date:', '']
    ];

    sheet.getRange(1, 1, content.length, 4).setValues(content);
    sheet.getRange(1, 1).setFontWeight('bold').setFontSize(14);
    sheet.getRange(8, 1).setFontWeight('bold').setBackground('#E3F2FD');
    sheet.getRange(18, 1).setFontWeight('bold').setBackground('#E3F2FD');
  }

  ss.setActiveSheet(sheet);
}

// Check Control Status
function checkControlStatus() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let alerts = [];

  // Check testing status
  const testSheet = ss.getSheetByName(CONFIG.TESTING_SHEET);
  if (testSheet) {
    const data = testSheet.getDataRange().getValues();
    let notTested = 0, failed = 0;
    for (let i = 1; i < data.length; i++) {
      if (data[i][9] === 'Not Tested') notTested++;
      if (data[i][9] === 'Ineffective') failed++;
    }
    if (notTested > 0) alerts.push(`⬜ ${notTested} controls not yet tested`);
    if (failed > 0) alerts.push(`❌ ${failed} controls tested as ineffective`);
  }

  // Check deficiencies
  const defSheet = ss.getSheetByName(CONFIG.DEFICIENCIES_SHEET);
  if (defSheet) {
    const data = defSheet.getDataRange().getValues();
    let open = 0, materialWeakness = 0;
    for (let i = 1; i < data.length; i++) {
      if (data[i][8] === 'Open') open++;
      if (data[i][2] === 'Material Weakness') materialWeakness++;
    }
    if (open > 0) alerts.push(`🔴 ${open} open deficiencies`);
    if (materialWeakness > 0) alerts.push(`🚨 ${materialWeakness} material weakness(es) - disclosure required!`);
  }

  if (alerts.length === 0) {
    SpreadsheetApp.getUi().alert('✅ All SOX controls in good standing!');
  } else {
    SpreadsheetApp.getUi().alert('⚠️ SOX CONTROL ALERTS\n\n' + alerts.join('\n\n'));
  }
}

// Send Testing Reminders
function sendTestingReminders() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Send testing reminders to (email):', ui.ButtonSet.OK_CANCEL);

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const email = response.getResponseText();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.TESTING_SHEET);

  if (!sheet) {
    ui.alert('No control testing data found.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  let notTested = [];

  for (let i = 1; i < data.length; i++) {
    if (data[i][9] === 'Not Tested') {
      notTested.push(`${data[i][0]} - ${data[i][1]} (Owner: ${data[i][5]})`);
    }
  }

  if (notTested.length === 0) {
    ui.alert('✅ All controls have been tested!');
    return;
  }

  const subject = 'SOX Control Testing Reminder - ' + notTested.length + ' Controls Pending';
  const body = 'The following SOX controls have not been tested:\n\n' + notTested.join('\n') + '\n\nPlease complete testing as soon as possible.\n\n--\nSOX Compliance System';

  MailApp.sendEmail(email, subject, body);
  ui.alert('✅ Testing reminder sent to ' + email);
}

// Settings
function openSOXSettings() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      h3 { color: #2979FF; }
    </style>
    <h3>⚙️ SOX Compliance Settings</h3>
    <p><b>Process Areas:</b></p>
    <p>Revenue, AR, AP, Payroll, Fixed Assets, Inventory, Financial Close, ITGC, Treasury, Tax</p>
    <p><b>Control Testing Results:</b></p>
    <p>• Not Tested</p>
    <p>• Effective</p>
    <p>• Ineffective</p>
    <p><b>Deficiency Types:</b></p>
    <p>• Control Design/Operating</p>
    <p>• Significant Deficiency</p>
    <p>• Material Weakness (requires disclosure)</p>
  `).setWidth(350).setHeight(320);

  SpreadsheetApp.getUi().showModalDialog(html, '⚙️ Settings');
}
