/**
 * BLACKROAD OS - GDPR Compliance Manager
 *
 * SETUP: Extensions > Apps Script > Paste this code > Save > Refresh sheet
 *
 * FEATURES:
 * - Data Subject Request (DSR) tracking
 * - Processing activities register (Article 30)
 * - Data breach notification workflow
 * - Consent management
 * - DPO task management
 * - Vendor/processor assessment
 * - DPIA (Data Protection Impact Assessment)
 * - Cross-border transfer tracking
 */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🇪🇺 GDPR Tools')
    .addItem('📝 New Data Subject Request', 'newDSR')
    .addItem('🚨 Report Data Breach', 'reportBreach')
    .addItem('➕ Add Processing Activity', 'addProcessingActivity')
    .addSeparator()
    .addSubMenu(ui.createMenu('📊 Registers & Reports')
      .addItem('DSR Status Report', 'dsrStatusReport')
      .addItem('Processing Activities Register', 'processingRegister')
      .addItem('Breach Log', 'breachLog')
      .addItem('Consent Records', 'consentRecords')
      .addItem('Transfer Impact Assessment', 'tiaReport'))
    .addSeparator()
    .addSubMenu(ui.createMenu('✅ Assessments')
      .addItem('Start DPIA', 'startDPIA')
      .addItem('Vendor Assessment', 'vendorAssessment')
      .addItem('Lawful Basis Review', 'lawfulBasisReview'))
    .addSeparator()
    .addItem('⚠️ Check Compliance Deadlines', 'checkDeadlines')
    .addItem('📧 Send DPO Summary', 'sendDPOSummary')
    .addItem('⚙️ Settings', 'openGDPRSettings')
    .addToUi();
}

const CONFIG = {
  DSR_SHEET: 'Data Subject Requests',
  PROCESSING_SHEET: 'Processing Activities',
  BREACH_SHEET: 'Data Breaches',
  CONSENT_SHEET: 'Consent Records',
  VENDORS_SHEET: 'Data Processors',
  DSR_DEADLINE_DAYS: 30, // 1 month to respond
  BREACH_NOTIFICATION_HOURS: 72, // 72 hours to notify DPA
  DPO_EMAIL: '',
  LEGAL_BASES: [
    'Consent (Art. 6(1)(a))',
    'Contract (Art. 6(1)(b))',
    'Legal Obligation (Art. 6(1)(c))',
    'Vital Interests (Art. 6(1)(d))',
    'Public Task (Art. 6(1)(e))',
    'Legitimate Interests (Art. 6(1)(f))'
  ]
};

// New Data Subject Request
function newDSR() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      label { display: block; margin-top: 10px; font-weight: bold; }
      input, select, textarea { width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      button { margin-top: 15px; padding: 12px; background: #2979FF; color: white; border: none; cursor: pointer; width: 100%; border-radius: 4px; }
      .deadline { background: #FFF3E0; padding: 8px; border-radius: 4px; margin-top: 10px; font-size: 12px; }
    </style>
    <label>Request Type</label>
    <select id="requestType">
      <option>Access (Art. 15)</option>
      <option>Rectification (Art. 16)</option>
      <option>Erasure - Right to be Forgotten (Art. 17)</option>
      <option>Restriction (Art. 18)</option>
      <option>Portability (Art. 20)</option>
      <option>Object to Processing (Art. 21)</option>
      <option>Withdraw Consent</option>
    </select>
    <label>Data Subject Name</label>
    <input type="text" id="name" placeholder="Full name">
    <label>Email</label>
    <input type="email" id="email" placeholder="Contact email">
    <label>Identity Verified?</label>
    <select id="verified">
      <option value="Pending">Pending Verification</option>
      <option value="Yes">Yes - Verified</option>
      <option value="No">No - Requires Verification</option>
    </select>
    <label>Request Details</label>
    <textarea id="details" rows="3" placeholder="Specific data or systems involved"></textarea>
    <label>Received Via</label>
    <select id="channel">
      <option>Email</option>
      <option>Web Form</option>
      <option>Mail</option>
      <option>Phone</option>
      <option>In Person</option>
    </select>
    <div class="deadline">⏰ Response required within 30 days (extendable to 90 for complex requests)</div>
    <button onclick="submitDSR()">Log Request</button>
    <script>
      function submitDSR() {
        const dsr = {
          requestType: document.getElementById('requestType').value,
          name: document.getElementById('name').value,
          email: document.getElementById('email').value,
          verified: document.getElementById('verified').value,
          details: document.getElementById('details').value,
          channel: document.getElementById('channel').value
        };
        google.script.run.withSuccessHandler((result) => {
          alert(result);
          google.script.host.close();
        }).processDSR(dsr);
      }
    </script>
  `).setWidth(400).setHeight(520);

  SpreadsheetApp.getUi().showModalDialog(html, '📝 New Data Subject Request');
}

function processDSR(dsr) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.DSR_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.DSR_SHEET);
    sheet.getRange(1, 1, 1, 11).setValues([['DSR ID', 'Type', 'Data Subject', 'Email', 'Verified', 'Details', 'Channel', 'Received', 'Deadline', 'Status', 'Completed']]);
    sheet.getRange(1, 1, 1, 11).setFontWeight('bold').setBackground('#E3F2FD');
  }

  const dsrId = 'DSR-' + Date.now().toString().slice(-8);
  const received = new Date();
  const deadline = new Date(received.getTime() + CONFIG.DSR_DEADLINE_DAYS * 24 * 60 * 60 * 1000);
  const row = sheet.getLastRow() + 1;

  sheet.getRange(row, 1, 1, 11).setValues([[
    dsrId,
    dsr.requestType,
    dsr.name,
    dsr.email,
    dsr.verified,
    dsr.details,
    dsr.channel,
    received,
    deadline,
    'Open',
    ''
  ]]);

  return '✅ DSR ' + dsrId + ' logged.\n\nDeadline: ' + deadline.toLocaleDateString() + '\n\nVerify identity before processing!';
}

// Report Data Breach
function reportBreach() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      label { display: block; margin-top: 10px; font-weight: bold; }
      input, select, textarea { width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      button { margin-top: 15px; padding: 12px; background: #FF1D6C; color: white; border: none; cursor: pointer; width: 100%; border-radius: 4px; }
      .critical { background: #FFEBEE; padding: 10px; border-radius: 4px; margin-top: 10px; border-left: 4px solid #FF1D6C; font-size: 12px; }
    </style>
    <label>Breach Type</label>
    <select id="breachType">
      <option>Confidentiality - Unauthorized disclosure</option>
      <option>Integrity - Unauthorized alteration</option>
      <option>Availability - Data loss/destruction</option>
      <option>Combined breach</option>
    </select>
    <label>Discovery Date/Time</label>
    <input type="datetime-local" id="discovered">
    <label>Categories of Data</label>
    <select id="dataCategories" multiple size="4">
      <option>Contact details</option>
      <option>Financial data</option>
      <option>Health data (Art. 9)</option>
      <option>Location data</option>
      <option>Online identifiers</option>
      <option>Biometric data (Art. 9)</option>
      <option>Genetic data (Art. 9)</option>
      <option>Political/Religious (Art. 9)</option>
    </select>
    <label>Estimated Individuals Affected</label>
    <input type="number" id="affected" value="0" min="0">
    <label>Description</label>
    <textarea id="description" rows="2" placeholder="What happened?"></textarea>
    <label>Likely Risk to Individuals</label>
    <select id="riskLevel">
      <option value="Low">Low - unlikely to result in risk</option>
      <option value="Risk">Risk - likely to result in risk</option>
      <option value="High">High - likely to result in HIGH risk</option>
    </select>
    <div class="critical">
      🚨 NOTIFICATION REQUIREMENTS:<br>
      • DPA notification: within 72 hours (if risk to individuals)<br>
      • Individual notification: without undue delay (if HIGH risk)
    </div>
    <button onclick="submitBreach()">Report Breach</button>
    <script>
      document.getElementById('discovered').value = new Date().toISOString().slice(0, 16);

      function submitBreach() {
        const selected = document.getElementById('dataCategories').selectedOptions;
        const categories = Array.from(selected).map(o => o.value).join(', ');

        const breach = {
          breachType: document.getElementById('breachType').value,
          discovered: document.getElementById('discovered').value,
          dataCategories: categories,
          affected: document.getElementById('affected').value,
          description: document.getElementById('description').value,
          riskLevel: document.getElementById('riskLevel').value
        };
        google.script.run.withSuccessHandler((result) => {
          alert(result);
          google.script.host.close();
        }).processBreachReport(breach);
      }
    </script>
  `).setWidth(420).setHeight(600);

  SpreadsheetApp.getUi().showModalDialog(html, '🚨 Report Data Breach');
}

function processBreachReport(breach) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.BREACH_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.BREACH_SHEET);
    sheet.getRange(1, 1, 1, 12).setValues([['Breach ID', 'Type', 'Discovered', 'Data Categories', 'Affected', 'Description', 'Risk Level', 'DPA Notified?', 'Individuals Notified?', 'Status', 'Reporter', 'Logged']]);
    sheet.getRange(1, 1, 1, 12).setFontWeight('bold').setBackground('#FFEBEE');
  }

  const breachId = 'BREACH-' + Date.now().toString().slice(-6);
  const discovered = new Date(breach.discovered);
  const deadline = new Date(discovered.getTime() + CONFIG.BREACH_NOTIFICATION_HOURS * 60 * 60 * 1000);
  const row = sheet.getLastRow() + 1;

  sheet.getRange(row, 1, 1, 12).setValues([[
    breachId,
    breach.breachType,
    discovered,
    breach.dataCategories,
    parseInt(breach.affected) || 0,
    breach.description,
    breach.riskLevel,
    'No',
    'No',
    'Open',
    Session.getActiveUser().getEmail(),
    new Date()
  ]]);

  // Color code by risk
  const colors = { 'Low': '#E8F5E9', 'Risk': '#FFF3E0', 'High': '#FFEBEE' };
  sheet.getRange(row, 1, 1, 12).setBackground(colors[breach.riskLevel]);

  let response = '🚨 Breach ' + breachId + ' logged.\n\n';

  if (breach.riskLevel !== 'Low') {
    response += '⚠️ DPA NOTIFICATION REQUIRED!\n';
    response += 'Deadline: ' + deadline.toLocaleString() + ' (' + CONFIG.BREACH_NOTIFICATION_HOURS + ' hours)\n\n';
  }

  if (breach.riskLevel === 'High') {
    response += '🚨 INDIVIDUAL NOTIFICATION REQUIRED!\n';
    response += 'Must notify affected individuals without undue delay.\n';
  }

  return response;
}

// Add Processing Activity
function addProcessingActivity() {
  const basisOptions = CONFIG.LEGAL_BASES.map(b => `<option>${b}</option>`).join('');

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      label { display: block; margin-top: 10px; font-weight: bold; }
      input, select, textarea { width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      button { margin-top: 15px; padding: 12px; background: #4CAF50; color: white; border: none; cursor: pointer; width: 100%; border-radius: 4px; }
    </style>
    <label>Processing Activity Name</label>
    <input type="text" id="name" placeholder="e.g., Customer Marketing">
    <label>Purpose</label>
    <textarea id="purpose" rows="2" placeholder="Why is this data processed?"></textarea>
    <label>Lawful Basis</label>
    <select id="basis">${basisOptions}</select>
    <label>Categories of Data Subjects</label>
    <input type="text" id="subjects" placeholder="e.g., Customers, Employees, Prospects">
    <label>Categories of Personal Data</label>
    <input type="text" id="dataTypes" placeholder="e.g., Name, email, purchase history">
    <label>Data Recipients</label>
    <input type="text" id="recipients" placeholder="Who receives this data?">
    <label>Transfers Outside EEA?</label>
    <select id="transfers">
      <option>No</option>
      <option>Yes - Adequacy Decision</option>
      <option>Yes - SCCs</option>
      <option>Yes - BCRs</option>
      <option>Yes - Derogation</option>
    </select>
    <label>Retention Period</label>
    <input type="text" id="retention" placeholder="e.g., 7 years, Duration of contract + 1 year">
    <button onclick="addActivity()">Add Processing Activity</button>
    <script>
      function addActivity() {
        const activity = {
          name: document.getElementById('name').value,
          purpose: document.getElementById('purpose').value,
          basis: document.getElementById('basis').value,
          subjects: document.getElementById('subjects').value,
          dataTypes: document.getElementById('dataTypes').value,
          recipients: document.getElementById('recipients').value,
          transfers: document.getElementById('transfers').value,
          retention: document.getElementById('retention').value
        };
        google.script.run.withSuccessHandler(() => {
          alert('Processing activity added to register!');
          google.script.host.close();
        }).processActivity(activity);
      }
    </script>
  `).setWidth(400).setHeight(550);

  SpreadsheetApp.getUi().showModalDialog(html, '➕ Add Processing Activity (Article 30)');
}

function processActivity(activity) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.PROCESSING_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.PROCESSING_SHEET);
    sheet.getRange(1, 1, 1, 11).setValues([['Activity ID', 'Name', 'Purpose', 'Lawful Basis', 'Data Subjects', 'Data Categories', 'Recipients', 'Transfers', 'Retention', 'Last Review', 'Owner']]);
    sheet.getRange(1, 1, 1, 11).setFontWeight('bold').setBackground('#E8F5E9');
  }

  const actId = 'ACT-' + String(sheet.getLastRow()).padStart(3, '0');
  const row = sheet.getLastRow() + 1;

  sheet.getRange(row, 1, 1, 11).setValues([[
    actId,
    activity.name,
    activity.purpose,
    activity.basis,
    activity.subjects,
    activity.dataTypes,
    activity.recipients,
    activity.transfers,
    activity.retention,
    new Date(),
    ''
  ]]);
}

// DSR Status Report
function dsrStatusReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.DSR_SHEET);

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No DSR records found.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const today = new Date();
  let stats = { total: 0, open: 0, completed: 0, overdue: 0, byType: {} };

  for (let i = 1; i < data.length; i++) {
    stats.total++;
    const status = data[i][9];
    const deadline = new Date(data[i][8]);
    const type = data[i][1];

    if (status === 'Open') {
      stats.open++;
      if (deadline < today) stats.overdue++;
    } else {
      stats.completed++;
    }

    stats.byType[type] = (stats.byType[type] || 0) + 1;
  }

  let report = `
DATA SUBJECT REQUEST STATUS
===========================

Total Requests: ${stats.total}
✅ Completed: ${stats.completed}
🔄 Open: ${stats.open}
🚨 Overdue: ${stats.overdue}

BY TYPE:
`;

  for (const [type, count] of Object.entries(stats.byType)) {
    report += `  • ${type}: ${count}\n`;
  }

  if (stats.overdue > 0) {
    report += '\n⚠️ OVERDUE REQUESTS REQUIRE IMMEDIATE ATTENTION!';
  }

  SpreadsheetApp.getUi().alert(report);
}

// Check Deadlines
function checkDeadlines() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let alerts = [];
  const today = new Date();
  const soon = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Check DSRs
  const dsrSheet = ss.getSheetByName(CONFIG.DSR_SHEET);
  if (dsrSheet) {
    const data = dsrSheet.getDataRange().getValues();
    let overdue = 0, dueSoon = 0;

    for (let i = 1; i < data.length; i++) {
      if (data[i][9] === 'Open') {
        const deadline = new Date(data[i][8]);
        if (deadline < today) overdue++;
        else if (deadline < soon) dueSoon++;
      }
    }

    if (overdue > 0) alerts.push(`🚨 ${overdue} DSR(s) OVERDUE - immediate action required!`);
    if (dueSoon > 0) alerts.push(`⚠️ ${dueSoon} DSR(s) due within 7 days`);
  }

  // Check Breaches
  const breachSheet = ss.getSheetByName(CONFIG.BREACH_SHEET);
  if (breachSheet) {
    const data = breachSheet.getDataRange().getValues();
    let unreported = 0;

    for (let i = 1; i < data.length; i++) {
      if (data[i][6] !== 'Low' && data[i][7] === 'No') {
        unreported++;
      }
    }

    if (unreported > 0) alerts.push(`🚨 ${unreported} breach(es) require DPA notification!`);
  }

  if (alerts.length === 0) {
    SpreadsheetApp.getUi().alert('✅ No urgent GDPR deadlines!');
  } else {
    SpreadsheetApp.getUi().alert('⚠️ GDPR COMPLIANCE ALERTS\n\n' + alerts.join('\n\n'));
  }
}

// Processing Register
function processingRegister() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.PROCESSING_SHEET);

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No processing activities registered. Add activities first.');
    return;
  }

  ss.setActiveSheet(sheet);
  SpreadsheetApp.getUi().alert('📋 Article 30 Register opened.\n\nThis register must be maintained and available to supervisory authorities on request.');
}

// Breach Log
function breachLog() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.BREACH_SHEET);

  if (!sheet) {
    SpreadsheetApp.getUi().alert('✅ No data breaches recorded.');
    return;
  }

  ss.setActiveSheet(sheet);
  SpreadsheetApp.getUi().alert('📋 Breach Log opened.\n\nAll breaches must be documented per Article 33(5), even if not reported to DPA.');
}

// Consent Records
function consentRecords() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.CONSENT_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.CONSENT_SHEET);
    sheet.getRange(1, 1, 1, 8).setValues([['Record ID', 'Data Subject', 'Purpose', 'Consent Given', 'Method', 'Timestamp', 'Withdrawn', 'Withdrawn Date']]);
    sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#E8F5E9');
    sheet.getRange(2, 1, 1, 8).setValues([['CON-001', '[Name/ID]', '[Purpose]', 'Yes', '[Web Form/Paper/Verbal]', '[Date]', 'No', '']]);
  }

  ss.setActiveSheet(sheet);
  SpreadsheetApp.getUi().alert('📋 Consent Records opened.\n\nConsent must be:\n• Freely given\n• Specific\n• Informed\n• Unambiguous\n• Demonstrable');
}

// TIA Report
function tiaReport() {
  SpreadsheetApp.getUi().alert('📋 Transfer Impact Assessment\n\nRequired for transfers to third countries without adequacy decisions.\n\nAssess:\n• Laws in destination country\n• Supplementary measures needed\n• Effective legal remedies available');
}

// Start DPIA
function startDPIA() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('DPIA Template');

  if (!sheet) {
    sheet = ss.insertSheet('DPIA Template');

    const dpia = [
      ['DATA PROTECTION IMPACT ASSESSMENT', ''],
      ['Project/Processing:', '[Name]'],
      ['Date:', new Date()],
      ['Assessor:', ''],
      ['', ''],
      ['1. DESCRIBE THE PROCESSING', ''],
      ['Nature of processing:', ''],
      ['Scope:', ''],
      ['Context:', ''],
      ['Purpose:', ''],
      ['', ''],
      ['2. NECESSITY & PROPORTIONALITY', ''],
      ['Lawful basis:', ''],
      ['Necessity test:', ''],
      ['Proportionality test:', ''],
      ['Data minimization:', ''],
      ['', ''],
      ['3. RISKS TO INDIVIDUALS', ''],
      ['Risk', 'Likelihood', 'Severity', 'Overall'],
      ['[Risk 1]', '[L/M/H]', '[L/M/H]', ''],
      ['[Risk 2]', '', '', ''],
      ['[Risk 3]', '', '', ''],
      ['', ''],
      ['4. MEASURES TO MITIGATE RISKS', ''],
      ['Risk', 'Measure', 'Residual Risk'],
      ['[Risk 1]', '[Mitigation]', '[L/M/H]'],
      ['', ''],
      ['5. SIGN-OFF', ''],
      ['DPO Consultation Required?', '☐ Yes ☐ No'],
      ['DPO Opinion:', ''],
      ['Approved by:', ''],
      ['Date:', '']
    ];

    sheet.getRange(1, 1, dpia.length, 4).setValues(dpia);
    sheet.getRange(1, 1).setFontWeight('bold').setFontSize(14);
  }

  ss.setActiveSheet(sheet);
  SpreadsheetApp.getUi().alert('📋 DPIA Template opened.\n\nRequired when processing is likely to result in HIGH RISK to individuals.');
}

// Vendor Assessment
function vendorAssessment() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      label { display: block; margin-top: 10px; font-weight: bold; }
      input, select { width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      button { margin-top: 15px; padding: 12px; background: #4CAF50; color: white; border: none; cursor: pointer; width: 100%; border-radius: 4px; }
    </style>
    <label>Vendor Name</label>
    <input type="text" id="vendor">
    <label>Processing Role</label>
    <select id="role">
      <option>Processor</option>
      <option>Joint Controller</option>
      <option>Sub-processor</option>
    </select>
    <label>Data Processed</label>
    <input type="text" id="data" placeholder="Types of personal data">
    <label>Location (Data Storage)</label>
    <input type="text" id="location" placeholder="Country/Region">
    <label>DPA Contract in Place?</label>
    <select id="contract">
      <option>Yes</option>
      <option>No - Required</option>
      <option>In Progress</option>
    </select>
    <label>Security Certifications</label>
    <input type="text" id="certs" placeholder="e.g., ISO 27001, SOC 2">
    <button onclick="addVendor()">Add Data Processor</button>
    <script>
      function addVendor() {
        const vendor = {
          name: document.getElementById('vendor').value,
          role: document.getElementById('role').value,
          data: document.getElementById('data').value,
          location: document.getElementById('location').value,
          contract: document.getElementById('contract').value,
          certs: document.getElementById('certs').value
        };
        google.script.run.withSuccessHandler(() => {
          alert('Vendor added!');
          google.script.host.close();
        }).addDataProcessor(vendor);
      }
    </script>
  `).setWidth(380).setHeight(420);

  SpreadsheetApp.getUi().showModalDialog(html, '🏢 Vendor Assessment');
}

function addDataProcessor(vendor) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.VENDORS_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.VENDORS_SHEET);
    sheet.getRange(1, 1, 1, 8).setValues([['Vendor ID', 'Name', 'Role', 'Data', 'Location', 'DPA Contract', 'Certifications', 'Added']]);
    sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#E3F2FD');
  }

  const vendorId = 'VEN-' + String(sheet.getLastRow()).padStart(3, '0');
  const row = sheet.getLastRow() + 1;

  sheet.getRange(row, 1, 1, 8).setValues([[
    vendorId,
    vendor.name,
    vendor.role,
    vendor.data,
    vendor.location,
    vendor.contract,
    vendor.certs,
    new Date()
  ]]);

  // Highlight if no contract
  if (vendor.contract === 'No - Required') {
    sheet.getRange(row, 1, 1, 8).setBackground('#FFEBEE');
  }
}

// Lawful Basis Review
function lawfulBasisReview() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Lawful Basis Review');

  if (!sheet) {
    sheet = ss.insertSheet('Lawful Basis Review');

    const review = [
      ['LAWFUL BASIS REVIEW', '', ''],
      ['', '', ''],
      ['Basis', 'When to Use', 'Key Requirements'],
      ['Consent', 'Individual has given clear consent', 'Freely given, specific, informed, unambiguous, withdrawable'],
      ['Contract', 'Processing necessary for contract with individual', 'Must be objectively necessary, not just useful'],
      ['Legal Obligation', 'Processing necessary to comply with law', 'Must be specific EU or member state law'],
      ['Vital Interests', 'Processing necessary to protect life', 'Only for life-threatening emergencies'],
      ['Public Task', 'Processing necessary for public interest', 'Must have clear legal basis'],
      ['Legitimate Interests', 'Processing necessary for legitimate interests', 'Requires balancing test (LIA), not available for public authorities']
    ];

    sheet.getRange(1, 1, review.length, 3).setValues(review);
    sheet.getRange(1, 1).setFontWeight('bold').setFontSize(14);
    sheet.getRange(3, 1, 1, 3).setFontWeight('bold').setBackground('#E3F2FD');
    sheet.setColumnWidth(2, 300);
    sheet.setColumnWidth(3, 400);
  }

  ss.setActiveSheet(sheet);
}

// Send DPO Summary
function sendDPOSummary() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Send DPO summary to:', ui.ButtonSet.OK_CANCEL);

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const email = response.getResponseText();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let summary = 'GDPR COMPLIANCE SUMMARY\n=======================\n\n';

  // DSR stats
  const dsrSheet = ss.getSheetByName(CONFIG.DSR_SHEET);
  if (dsrSheet) {
    const data = dsrSheet.getDataRange().getValues();
    let open = 0;
    for (let i = 1; i < data.length; i++) {
      if (data[i][9] === 'Open') open++;
    }
    summary += `DSRs: ${data.length - 1} total, ${open} open\n`;
  }

  // Breach stats
  const breachSheet = ss.getSheetByName(CONFIG.BREACH_SHEET);
  if (breachSheet) {
    const data = breachSheet.getDataRange().getValues();
    summary += `Breaches: ${data.length - 1} recorded\n`;
  }

  // Processing activities
  const procSheet = ss.getSheetByName(CONFIG.PROCESSING_SHEET);
  if (procSheet) {
    summary += `Processing Activities: ${procSheet.getLastRow() - 1} registered\n`;
  }

  summary += '\n--\nGDPR Compliance System';

  MailApp.sendEmail(email, 'GDPR Compliance Summary - ' + new Date().toLocaleDateString(), summary);
  ui.alert('✅ Summary sent to ' + email);
}

// Settings
function openGDPRSettings() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      h3 { color: #2979FF; }
    </style>
    <h3>⚙️ GDPR Settings</h3>
    <p><b>Key Deadlines:</b></p>
    <p>• DSR Response: 30 days (extendable to 90)</p>
    <p>• Breach Notification: 72 hours to DPA</p>
    <p><b>Required Sheets:</b></p>
    <p>• Data Subject Requests</p>
    <p>• Processing Activities (Art. 30)</p>
    <p>• Data Breaches</p>
    <p>• Consent Records</p>
    <p>• Data Processors</p>
  `).setWidth(350).setHeight(300);

  SpreadsheetApp.getUi().showModalDialog(html, '⚙️ Settings');
}
