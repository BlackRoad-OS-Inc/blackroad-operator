/**
 * BLACKROAD OS - HIPAA Compliance Tracker
 *
 * SETUP: Extensions > Apps Script > Paste this code > Save > Refresh sheet
 *
 * FEATURES:
 * - PHI access logging
 * - Business Associate Agreement tracking
 * - Security incident management
 * - Training compliance monitoring
 * - Risk assessment automation
 * - Breach notification workflow
 * - Annual audit checklists
 * - Policy acknowledgment tracking
 */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🏥 HIPAA Tools')
    .addItem('📋 Log PHI Access', 'logPHIAccess')
    .addItem('📝 Record Security Incident', 'recordIncident')
    .addSeparator()
    .addSubMenu(ui.createMenu('📊 Compliance Reports')
      .addItem('Access Audit Report', 'accessAuditReport')
      .addItem('Training Status Report', 'trainingStatusReport')
      .addItem('BAA Status Report', 'baaStatusReport')
      .addItem('Risk Assessment Summary', 'riskSummary')
      .addItem('Incident Summary', 'incidentSummary'))
    .addSeparator()
    .addSubMenu(ui.createMenu('✅ Checklists')
      .addItem('Annual Security Review', 'annualSecurityChecklist')
      .addItem('New Vendor Assessment', 'vendorAssessment')
      .addItem('Breach Response Checklist', 'breachChecklist'))
    .addSeparator()
    .addItem('📧 Send Training Reminders', 'sendTrainingReminders')
    .addItem('📧 Send BAA Renewal Notices', 'sendBAARenewals')
    .addItem('⚠️ Check Compliance Alerts', 'checkComplianceAlerts')
    .addSeparator()
    .addItem('⚙️ Settings', 'openHIPAASettings')
    .addToUi();
}

const CONFIG = {
  PHI_ACCESS_SHEET: 'PHI Access Log',
  TRAINING_SHEET: 'Training Records',
  BAA_SHEET: 'Business Associates',
  INCIDENTS_SHEET: 'Security Incidents',
  RISK_SHEET: 'Risk Assessment',
  COMPLIANCE_OFFICER_EMAIL: '',
  BREACH_THRESHOLD_RECORDS: 500, // HHS notification required for 500+
  TRAINING_EXPIRY_DAYS: 365,
  BAA_RENEWAL_DAYS: 30 // Days before expiry to send reminder
};

// Log PHI Access
function logPHIAccess() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      label { display: block; margin-top: 10px; font-weight: bold; }
      input, select, textarea { width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      button { margin-top: 15px; padding: 12px; background: #2979FF; color: white; border: none; cursor: pointer; width: 100%; border-radius: 4px; }
      .warning { background: #FFF3E0; padding: 10px; border-radius: 4px; margin-top: 10px; font-size: 12px; }
    </style>
    <label>Accessed By (Name/ID)</label>
    <input type="text" id="accessedBy" placeholder="Employee name or ID">
    <label>Patient Identifier (MRN/Pseudonym)</label>
    <input type="text" id="patientId" placeholder="Use pseudonym or record number">
    <label>Access Type</label>
    <select id="accessType">
      <option>View</option>
      <option>Create</option>
      <option>Modify</option>
      <option>Delete</option>
      <option>Print</option>
      <option>Export</option>
      <option>Disclose to Third Party</option>
    </select>
    <label>System/Application</label>
    <input type="text" id="system" placeholder="e.g., EHR, Billing System">
    <label>Purpose (TPO Category)</label>
    <select id="purpose">
      <option>Treatment</option>
      <option>Payment</option>
      <option>Operations</option>
      <option>Patient Request</option>
      <option>Legal Requirement</option>
      <option>Research (IRB Approved)</option>
      <option>Emergency</option>
      <option>Other - Requires Justification</option>
    </select>
    <label>Justification/Notes</label>
    <textarea id="notes" rows="2" placeholder="Specific reason for access"></textarea>
    <div class="warning">⚠️ All PHI access is logged and subject to audit. Minimum necessary standard applies.</div>
    <button onclick="logAccess()">Log PHI Access</button>
    <script>
      function logAccess() {
        const entry = {
          accessedBy: document.getElementById('accessedBy').value,
          patientId: document.getElementById('patientId').value,
          accessType: document.getElementById('accessType').value,
          system: document.getElementById('system').value,
          purpose: document.getElementById('purpose').value,
          notes: document.getElementById('notes').value
        };
        google.script.run.withSuccessHandler(() => {
          alert('PHI access logged successfully');
          google.script.host.close();
        }).processPHIAccess(entry);
      }
    </script>
  `).setWidth(400).setHeight(520);

  SpreadsheetApp.getUi().showModalDialog(html, '📋 Log PHI Access');
}

function processPHIAccess(entry) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.PHI_ACCESS_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.PHI_ACCESS_SHEET);
    sheet.getRange(1, 1, 1, 8).setValues([['Timestamp', 'Accessed By', 'Patient ID', 'Access Type', 'System', 'Purpose', 'Notes', 'IP Address']]);
    sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#E8F5E9');
  }

  const row = sheet.getLastRow() + 1;
  sheet.getRange(row, 1, 1, 8).setValues([[
    new Date(),
    entry.accessedBy,
    entry.patientId,
    entry.accessType,
    entry.system,
    entry.purpose,
    entry.notes,
    'Logged via Sheet' // In real implementation, capture IP
  ]]);

  // Flag suspicious access
  if (entry.accessType === 'Export' || entry.accessType === 'Disclose to Third Party') {
    sheet.getRange(row, 1, 1, 8).setBackground('#FFF3E0');
  }
}

// Record Security Incident
function recordIncident() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      label { display: block; margin-top: 10px; font-weight: bold; }
      input, select, textarea { width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      button { margin-top: 15px; padding: 12px; background: #FF1D6C; color: white; border: none; cursor: pointer; width: 100%; border-radius: 4px; }
      .critical { background: #FFEBEE; padding: 10px; border-radius: 4px; margin-top: 10px; border-left: 4px solid #FF1D6C; }
    </style>
    <label>Incident Type</label>
    <select id="incidentType">
      <option>Unauthorized Access</option>
      <option>Data Breach - Electronic</option>
      <option>Data Breach - Physical</option>
      <option>Lost/Stolen Device</option>
      <option>Phishing Attempt</option>
      <option>Malware/Ransomware</option>
      <option>Improper Disposal</option>
      <option>Unauthorized Disclosure</option>
      <option>System Vulnerability</option>
      <option>Policy Violation</option>
    </select>
    <label>Severity</label>
    <select id="severity">
      <option value="Low">Low - No PHI exposed</option>
      <option value="Medium">Medium - Limited PHI exposure</option>
      <option value="High">High - Significant PHI exposure</option>
      <option value="Critical">Critical - Breach notification required</option>
    </select>
    <label>Date/Time Discovered</label>
    <input type="datetime-local" id="discovered">
    <label>Estimated Records Affected</label>
    <input type="number" id="recordsAffected" value="0" min="0">
    <label>Description</label>
    <textarea id="description" rows="3" placeholder="Detailed description of the incident"></textarea>
    <label>Immediate Actions Taken</label>
    <textarea id="actions" rows="2" placeholder="Steps taken to contain"></textarea>
    <div class="critical">🚨 Incidents affecting 500+ individuals require HHS notification within 60 days</div>
    <button onclick="submitIncident()">Report Incident</button>
    <script>
      document.getElementById('discovered').value = new Date().toISOString().slice(0, 16);

      function submitIncident() {
        const incident = {
          type: document.getElementById('incidentType').value,
          severity: document.getElementById('severity').value,
          discovered: document.getElementById('discovered').value,
          recordsAffected: document.getElementById('recordsAffected').value,
          description: document.getElementById('description').value,
          actions: document.getElementById('actions').value
        };
        google.script.run.withSuccessHandler((result) => {
          alert(result);
          google.script.host.close();
        }).processSecurityIncident(incident);
      }
    </script>
  `).setWidth(420).setHeight(580);

  SpreadsheetApp.getUi().showModalDialog(html, '🚨 Report Security Incident');
}

function processSecurityIncident(incident) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.INCIDENTS_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.INCIDENTS_SHEET);
    sheet.getRange(1, 1, 1, 10).setValues([['Incident ID', 'Type', 'Severity', 'Discovered', 'Records Affected', 'Description', 'Actions', 'Status', 'Reported By', 'Created']]);
    sheet.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#FFEBEE');
  }

  const incidentId = 'INC-' + Date.now().toString().slice(-8);
  const row = sheet.getLastRow() + 1;

  sheet.getRange(row, 1, 1, 10).setValues([[
    incidentId,
    incident.type,
    incident.severity,
    new Date(incident.discovered),
    parseInt(incident.recordsAffected) || 0,
    incident.description,
    incident.actions,
    'Open',
    Session.getActiveUser().getEmail(),
    new Date()
  ]]);

  // Color code by severity
  const colors = { 'Low': '#E8F5E9', 'Medium': '#FFF3E0', 'High': '#FFEBEE', 'Critical': '#F8BBD9' };
  sheet.getRange(row, 1, 1, 10).setBackground(colors[incident.severity] || '#FFFFFF');

  let response = '✅ Incident ' + incidentId + ' recorded.';

  // Alert for high severity
  if (incident.severity === 'Critical' || parseInt(incident.recordsAffected) >= CONFIG.BREACH_THRESHOLD_RECORDS) {
    response += '\n\n🚨 CRITICAL: This incident may require breach notification!\n\nHHS must be notified within 60 days for breaches affecting 500+ individuals.';
  }

  return response;
}

// Access Audit Report
function accessAuditReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.PHI_ACCESS_SHEET);

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No PHI access logs found.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  let stats = { total: 0, byType: {}, byUser: {}, byPurpose: {} };

  for (let i = 1; i < data.length; i++) {
    const date = new Date(data[i][0]);
    if (date >= last30Days) {
      stats.total++;

      const type = data[i][3];
      const user = data[i][1];
      const purpose = data[i][5];

      stats.byType[type] = (stats.byType[type] || 0) + 1;
      stats.byUser[user] = (stats.byUser[user] || 0) + 1;
      stats.byPurpose[purpose] = (stats.byPurpose[purpose] || 0) + 1;
    }
  }

  let report = 'PHI ACCESS AUDIT REPORT (Last 30 Days)\n======================================\n\n';
  report += `Total Access Events: ${stats.total}\n\n`;

  report += 'BY ACCESS TYPE:\n';
  for (const [type, count] of Object.entries(stats.byType)) {
    report += `  • ${type}: ${count}\n`;
  }

  report += '\nBY PURPOSE:\n';
  for (const [purpose, count] of Object.entries(stats.byPurpose)) {
    report += `  • ${purpose}: ${count}\n`;
  }

  report += '\nTOP USERS:\n';
  const topUsers = Object.entries(stats.byUser).sort((a, b) => b[1] - a[1]).slice(0, 5);
  for (const [user, count] of topUsers) {
    report += `  • ${user}: ${count}\n`;
  }

  SpreadsheetApp.getUi().alert(report);
}

// Training Status Report
function trainingStatusReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.TRAINING_SHEET);

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No training records found. Add training data to "Training Records" sheet.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const expiryDate = new Date(Date.now() - CONFIG.TRAINING_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  let current = 0, expired = 0, expiringSoon = 0;
  const soonThreshold = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  for (let i = 1; i < data.length; i++) {
    const trainingDate = new Date(data[i][2]); // Assuming column C is training date
    const expiresOn = new Date(trainingDate);
    expiresOn.setFullYear(expiresOn.getFullYear() + 1);

    if (expiresOn < new Date()) {
      expired++;
    } else if (expiresOn < soonThreshold) {
      expiringSoon++;
    } else {
      current++;
    }
  }

  const total = current + expired + expiringSoon;
  const compliance = total > 0 ? ((current / total) * 100).toFixed(1) : 0;

  const report = `
HIPAA TRAINING STATUS
=====================

Total Employees: ${total}
✅ Current: ${current}
⚠️ Expiring Soon (30 days): ${expiringSoon}
❌ Expired: ${expired}

Compliance Rate: ${compliance}%
  `;

  SpreadsheetApp.getUi().alert(report);
}

// BAA Status Report
function baaStatusReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.BAA_SHEET);

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No BAA records found. Add data to "Business Associates" sheet.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const today = new Date();
  const soonThreshold = new Date(Date.now() + CONFIG.BAA_RENEWAL_DAYS * 24 * 60 * 60 * 1000);

  let active = 0, expired = 0, expiringSoon = [];

  for (let i = 1; i < data.length; i++) {
    const expiryDate = new Date(data[i][4]); // Assuming column E is expiry
    const vendor = data[i][1];

    if (expiryDate < today) {
      expired++;
    } else if (expiryDate < soonThreshold) {
      expiringSoon.push({ name: vendor, expires: expiryDate });
    } else {
      active++;
    }
  }

  let report = `
BAA STATUS REPORT
=================

✅ Active BAAs: ${active}
⚠️ Expiring Soon: ${expiringSoon.length}
❌ Expired: ${expired}
`;

  if (expiringSoon.length > 0) {
    report += '\nEXPIRING SOON:\n';
    for (const baa of expiringSoon) {
      report += `  • ${baa.name}: ${baa.expires.toLocaleDateString()}\n`;
    }
  }

  SpreadsheetApp.getUi().alert(report);
}

// Risk Assessment Summary
function riskSummary() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.RISK_SHEET);

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No risk assessment data found. Add data to "Risk Assessment" sheet.');
    return;
  }

  SpreadsheetApp.getUi().alert('📊 Risk Assessment Summary\n\nView the "Risk Assessment" sheet for detailed analysis.\n\nRisk areas should be reviewed annually per HIPAA Security Rule.');
}

// Incident Summary
function incidentSummary() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.INCIDENTS_SHEET);

  if (!sheet) {
    SpreadsheetApp.getUi().alert('✅ No security incidents recorded.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  let open = 0, closed = 0, critical = 0, totalRecords = 0;

  for (let i = 1; i < data.length; i++) {
    if (data[i][7] === 'Open') open++;
    else closed++;

    if (data[i][2] === 'Critical') critical++;
    totalRecords += parseInt(data[i][4]) || 0;
  }

  const report = `
SECURITY INCIDENT SUMMARY
=========================

Total Incidents: ${data.length - 1}
🔴 Open: ${open}
🟢 Closed: ${closed}
🚨 Critical: ${critical}

Records Affected (Total): ${totalRecords.toLocaleString()}

${totalRecords >= CONFIG.BREACH_THRESHOLD_RECORDS ? '⚠️ HHS breach notification may be required!' : ''}
  `;

  SpreadsheetApp.getUi().alert(report);
}

// Annual Security Checklist
function annualSecurityChecklist() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Annual Security Review');
  if (!sheet) {
    sheet = ss.insertSheet('Annual Security Review');

    const checklist = [
      ['HIPAA Security Rule Annual Review', '', '', ''],
      ['Review Date:', new Date(), '', ''],
      ['', '', '', ''],
      ['Category', 'Item', 'Status', 'Notes'],
      ['Administrative', 'Security Officer designated', '☐', ''],
      ['Administrative', 'Workforce training completed', '☐', ''],
      ['Administrative', 'Policies reviewed and updated', '☐', ''],
      ['Administrative', 'Risk assessment conducted', '☐', ''],
      ['Administrative', 'Contingency plan tested', '☐', ''],
      ['Administrative', 'Business Associate inventory current', '☐', ''],
      ['Physical', 'Facility access controls reviewed', '☐', ''],
      ['Physical', 'Workstation security assessed', '☐', ''],
      ['Physical', 'Device/media disposal verified', '☐', ''],
      ['Technical', 'Access controls reviewed', '☐', ''],
      ['Technical', 'Audit logs reviewed', '☐', ''],
      ['Technical', 'Encryption verified (at rest/transit)', '☐', ''],
      ['Technical', 'Authentication mechanisms assessed', '☐', ''],
      ['Technical', 'Transmission security verified', '☐', ''],
      ['Documentation', 'All policies documented', '☐', ''],
      ['Documentation', 'Incident response plan current', '☐', ''],
      ['Documentation', 'Training records maintained', '☐', '']
    ];

    sheet.getRange(1, 1, checklist.length, 4).setValues(checklist);
    sheet.getRange(1, 1, 1, 4).setFontWeight('bold').setFontSize(14);
    sheet.getRange(4, 1, 1, 4).setFontWeight('bold').setBackground('#E8F5E9');
  }

  ss.setActiveSheet(sheet);
  SpreadsheetApp.getUi().alert('✅ Annual Security Review checklist opened.\n\nComplete all items and document findings.');
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
    <input type="text" id="vendor" placeholder="Vendor/Business Associate name">
    <label>Service Type</label>
    <select id="serviceType">
      <option>Cloud/SaaS Provider</option>
      <option>IT Services</option>
      <option>Billing/Claims</option>
      <option>Shredding/Disposal</option>
      <option>Legal Services</option>
      <option>Consulting</option>
      <option>Other</option>
    </select>
    <label>PHI Access Level</label>
    <select id="phiAccess">
      <option>None - No PHI access</option>
      <option>Limited - Incidental access possible</option>
      <option>Standard - Regular PHI handling</option>
      <option>Extensive - Full database access</option>
    </select>
    <label>BAA Executed?</label>
    <select id="baaStatus">
      <option>Yes - Current</option>
      <option>Yes - Needs Renewal</option>
      <option>No - Required</option>
      <option>No - Not Required</option>
    </select>
    <label>BAA Expiration</label>
    <input type="date" id="baaExpiry">
    <button onclick="addVendor()">Add Business Associate</button>
    <script>
      function addVendor() {
        const vendor = {
          name: document.getElementById('vendor').value,
          serviceType: document.getElementById('serviceType').value,
          phiAccess: document.getElementById('phiAccess').value,
          baaStatus: document.getElementById('baaStatus').value,
          baaExpiry: document.getElementById('baaExpiry').value
        };
        google.script.run.withSuccessHandler(() => {
          alert('Business Associate added!');
          google.script.host.close();
        }).addBusinessAssociate(vendor);
      }
    </script>
  `).setWidth(380).setHeight(420);

  SpreadsheetApp.getUi().showModalDialog(html, '🏢 New Vendor Assessment');
}

function addBusinessAssociate(vendor) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.BAA_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.BAA_SHEET);
    sheet.getRange(1, 1, 1, 7).setValues([['BA ID', 'Vendor Name', 'Service Type', 'PHI Access', 'BAA Status', 'BAA Expiry', 'Added']]);
    sheet.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#E3F2FD');
  }

  const baId = 'BA-' + String(sheet.getLastRow()).padStart(3, '0');
  const row = sheet.getLastRow() + 1;

  sheet.getRange(row, 1, 1, 7).setValues([[
    baId,
    vendor.name,
    vendor.serviceType,
    vendor.phiAccess,
    vendor.baaStatus,
    vendor.baaExpiry ? new Date(vendor.baaExpiry) : '',
    new Date()
  ]]);
}

// Breach Response Checklist
function breachChecklist() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Breach Response');
  if (!sheet) {
    sheet = ss.insertSheet('Breach Response');

    const checklist = [
      ['HIPAA BREACH RESPONSE CHECKLIST', '', '', ''],
      ['Incident ID:', '', 'Date:', new Date()],
      ['', '', '', ''],
      ['Step', 'Action', 'Complete', 'Date/Notes'],
      ['1', 'Contain the breach - stop ongoing exposure', '☐', ''],
      ['2', 'Assemble breach response team', '☐', ''],
      ['3', 'Conduct risk assessment (4 factors)', '☐', ''],
      ['4', 'Document all findings', '☐', ''],
      ['5', 'Determine notification requirements', '☐', ''],
      ['6', 'Notify affected individuals (within 60 days)', '☐', ''],
      ['7', 'Notify HHS (if 500+ individuals)', '☐', ''],
      ['8', 'Notify media (if 500+ in a state)', '☐', ''],
      ['9', 'Implement corrective actions', '☐', ''],
      ['10', 'Update policies and training', '☐', ''],
      ['11', 'Document lessons learned', '☐', ''],
      ['', '', '', ''],
      ['RISK ASSESSMENT FACTORS', '', '', ''],
      ['Factor', 'Assessment', '', ''],
      ['Nature/extent of PHI involved', '', '', ''],
      ['Unauthorized person who accessed', '', '', ''],
      ['Whether PHI was actually viewed', '', '', ''],
      ['Extent to which risk was mitigated', '', '', '']
    ];

    sheet.getRange(1, 1, checklist.length, 4).setValues(checklist);
    sheet.getRange(1, 1).setFontWeight('bold').setFontSize(14).setFontColor('#FF1D6C');
    sheet.getRange(4, 1, 1, 4).setFontWeight('bold').setBackground('#FFEBEE');
    sheet.getRange(17, 1).setFontWeight('bold');
  }

  ss.setActiveSheet(sheet);
  SpreadsheetApp.getUi().alert('🚨 Breach Response Checklist opened.\n\nFollow all steps and document thoroughly.');
}

// Send Training Reminders
function sendTrainingReminders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.TRAINING_SHEET);

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No training records found.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const soonThreshold = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  let remindersSent = 0;

  for (let i = 1; i < data.length; i++) {
    const email = data[i][3]; // Assuming column D is email
    const trainingDate = new Date(data[i][2]);
    const expiresOn = new Date(trainingDate);
    expiresOn.setFullYear(expiresOn.getFullYear() + 1);

    if (expiresOn < soonThreshold && expiresOn > new Date()) {
      try {
        MailApp.sendEmail({
          to: email,
          subject: 'HIPAA Training Renewal Required',
          body: `Your HIPAA training will expire on ${expiresOn.toLocaleDateString()}.\n\nPlease complete your annual HIPAA training before the expiration date.\n\n--\nCompliance Team`
        });
        remindersSent++;
      } catch (e) {
        // Email failed
      }
    }
  }

  SpreadsheetApp.getUi().alert('✅ Sent ' + remindersSent + ' training reminders');
}

// Send BAA Renewal Notices
function sendBAARenewals() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Send BAA renewal notices to (your email for review):', ui.ButtonSet.OK_CANCEL);

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const email = response.getResponseText();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.BAA_SHEET);

  if (!sheet) {
    ui.alert('No BAA records found.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const soonThreshold = new Date(Date.now() + CONFIG.BAA_RENEWAL_DAYS * 24 * 60 * 60 * 1000);
  let expiring = [];

  for (let i = 1; i < data.length; i++) {
    const expiryDate = new Date(data[i][5]);
    if (expiryDate < soonThreshold && expiryDate > new Date()) {
      expiring.push({ name: data[i][1], expires: expiryDate.toLocaleDateString() });
    }
  }

  if (expiring.length === 0) {
    ui.alert('✅ No BAAs expiring within ' + CONFIG.BAA_RENEWAL_DAYS + ' days');
    return;
  }

  let body = 'The following Business Associate Agreements require renewal:\n\n';
  for (const baa of expiring) {
    body += `• ${baa.name} - Expires: ${baa.expires}\n`;
  }
  body += '\n--\nHIPAA Compliance System';

  MailApp.sendEmail(email, 'BAA Renewal Notice - Action Required', body);
  ui.alert('✅ BAA renewal notice sent to ' + email);
}

// Check Compliance Alerts
function checkComplianceAlerts() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let alerts = [];

  // Check training
  const trainingSheet = ss.getSheetByName(CONFIG.TRAINING_SHEET);
  if (trainingSheet) {
    const data = trainingSheet.getDataRange().getValues();
    let expired = 0;
    for (let i = 1; i < data.length; i++) {
      const trainingDate = new Date(data[i][2]);
      const expiresOn = new Date(trainingDate);
      expiresOn.setFullYear(expiresOn.getFullYear() + 1);
      if (expiresOn < new Date()) expired++;
    }
    if (expired > 0) {
      alerts.push(`🚨 ${expired} employee(s) have expired HIPAA training`);
    }
  }

  // Check BAAs
  const baaSheet = ss.getSheetByName(CONFIG.BAA_SHEET);
  if (baaSheet) {
    const data = baaSheet.getDataRange().getValues();
    let expired = 0;
    for (let i = 1; i < data.length; i++) {
      const expiryDate = new Date(data[i][5]);
      if (expiryDate < new Date()) expired++;
    }
    if (expired > 0) {
      alerts.push(`⚠️ ${expired} Business Associate Agreement(s) expired`);
    }
  }

  // Check open incidents
  const incidentSheet = ss.getSheetByName(CONFIG.INCIDENTS_SHEET);
  if (incidentSheet) {
    const data = incidentSheet.getDataRange().getValues();
    let open = 0;
    for (let i = 1; i < data.length; i++) {
      if (data[i][7] === 'Open') open++;
    }
    if (open > 0) {
      alerts.push(`🔴 ${open} open security incident(s) require attention`);
    }
  }

  if (alerts.length === 0) {
    SpreadsheetApp.getUi().alert('✅ No compliance alerts - all systems within parameters');
  } else {
    SpreadsheetApp.getUi().alert('⚠️ COMPLIANCE ALERTS\n\n' + alerts.join('\n\n'));
  }
}

// Settings
function openHIPAASettings() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      h3 { color: #2979FF; }
    </style>
    <h3>⚙️ HIPAA Compliance Settings</h3>
    <p><b>Required Sheets:</b></p>
    <p>• PHI Access Log</p>
    <p>• Training Records (Name, ID, Date, Email)</p>
    <p>• Business Associates</p>
    <p>• Security Incidents</p>
    <p>• Risk Assessment</p>
    <p><b>Thresholds:</b></p>
    <p>• Training expiry: 365 days</p>
    <p>• BAA renewal notice: 30 days</p>
    <p>• Breach notification: 500+ records</p>
    <p><b>To customize:</b> Edit CONFIG in Apps Script</p>
  `).setWidth(350).setHeight(350);

  SpreadsheetApp.getUi().showModalDialog(html, '⚙️ Settings');
}
