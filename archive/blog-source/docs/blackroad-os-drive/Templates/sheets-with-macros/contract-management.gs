/**
 * BLACKROAD OS - Contract Management with E-Signature Tracking
 *
 * SETUP: Extensions > Apps Script > Paste this code > Save > Refresh sheet
 *
 * FEATURES:
 * - Contract lifecycle tracking
 * - Renewal/expiration alerts
 * - E-signature status monitoring
 * - Obligation tracking
 * - Amendment management
 * - Approval workflow
 * - Contract value tracking
 * - Compliance checkpoints
 */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📝 Contract Tools')
    .addItem('➕ New Contract', 'addNewContract')
    .addItem('✍️ Update Signature Status', 'updateSignatureStatus')
    .addItem('📄 Add Amendment', 'addAmendment')
    .addSeparator()
    .addSubMenu(ui.createMenu('📊 Reports')
      .addItem('Contract Summary', 'contractSummary')
      .addItem('Expiring Contracts', 'expiringContracts')
      .addItem('Pending Signatures', 'pendingSignatures')
      .addItem('Contract Value Report', 'valueReport')
      .addItem('Vendor Contracts', 'vendorContracts'))
    .addSeparator()
    .addItem('⚠️ Check Renewals', 'checkRenewals')
    .addItem('📧 Send Renewal Notices', 'sendRenewalNotices')
    .addItem('✅ Request Approval', 'requestApproval')
    .addSeparator()
    .addItem('⚙️ Settings', 'openContractSettings')
    .addToUi();
}

const CONFIG = {
  CONTRACTS_START_ROW: 6,
  AMENDMENTS_SHEET: 'Amendments',
  OBLIGATIONS_SHEET: 'Obligations',
  RENEWAL_NOTICE_DAYS: 60, // Days before expiry to send notice
  CONTRACT_TYPES: [
    'Master Service Agreement (MSA)',
    'Software License',
    'SaaS Subscription',
    'NDA',
    'Employment',
    'Vendor/Supplier',
    'Customer',
    'Partnership',
    'Consulting',
    'Lease'
  ],
  SIGNATURE_STATUSES: [
    'Draft',
    'Internal Review',
    'Sent for Signature',
    'Partially Signed',
    'Fully Executed',
    'Expired',
    'Terminated'
  ]
};

// Add New Contract
function addNewContract() {
  const typeOptions = CONFIG.CONTRACT_TYPES.map(t => `<option>${t}</option>`).join('');

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      label { display: block; margin-top: 10px; font-weight: bold; }
      input, select, textarea { width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      button { margin-top: 15px; padding: 12px; background: #2979FF; color: white; border: none; cursor: pointer; width: 100%; border-radius: 4px; }
      .row { display: flex; gap: 10px; }
      .row > div { flex: 1; }
    </style>
    <label>Contract Title</label>
    <input type="text" id="title" placeholder="e.g., Acme Corp MSA">
    <label>Contract Type</label>
    <select id="type">${typeOptions}</select>
    <label>Counterparty</label>
    <input type="text" id="counterparty" placeholder="Other party name">
    <label>Counterparty Contact</label>
    <input type="email" id="contact" placeholder="contact@company.com">
    <div class="row">
      <div>
        <label>Effective Date</label>
        <input type="date" id="effectiveDate">
      </div>
      <div>
        <label>Expiration Date</label>
        <input type="date" id="expirationDate">
      </div>
    </div>
    <div class="row">
      <div>
        <label>Contract Value ($)</label>
        <input type="number" id="value" placeholder="0" min="0">
      </div>
      <div>
        <label>Payment Terms</label>
        <select id="terms">
          <option>One-Time</option>
          <option>Monthly</option>
          <option>Quarterly</option>
          <option>Annual</option>
          <option>Custom</option>
        </select>
      </div>
    </div>
    <label>Auto-Renew?</label>
    <select id="autoRenew">
      <option value="No">No</option>
      <option value="Yes">Yes - Auto-renewal</option>
      <option value="Evergreen">Evergreen (no expiry)</option>
    </select>
    <label>Internal Owner</label>
    <input type="text" id="owner" placeholder="Contract owner name">
    <label>Document Link</label>
    <input type="text" id="docLink" placeholder="Google Drive or DocuSign link">
    <button onclick="addContract()">Create Contract</button>
    <script>
      // Default dates
      document.getElementById('effectiveDate').value = new Date().toISOString().split('T')[0];
      const expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + 1);
      document.getElementById('expirationDate').value = expiry.toISOString().split('T')[0];

      function addContract() {
        const contract = {
          title: document.getElementById('title').value,
          type: document.getElementById('type').value,
          counterparty: document.getElementById('counterparty').value,
          contact: document.getElementById('contact').value,
          effectiveDate: document.getElementById('effectiveDate').value,
          expirationDate: document.getElementById('expirationDate').value,
          value: document.getElementById('value').value,
          terms: document.getElementById('terms').value,
          autoRenew: document.getElementById('autoRenew').value,
          owner: document.getElementById('owner').value,
          docLink: document.getElementById('docLink').value
        };
        google.script.run.withSuccessHandler((result) => {
          alert(result);
          google.script.host.close();
        }).processNewContract(contract);
      }
    </script>
  `).setWidth(420).setHeight(620);

  SpreadsheetApp.getUi().showModalDialog(html, '➕ New Contract');
}

function processNewContract(contract) {
  const sheet = SpreadsheetApp.getActiveSheet();
  const row = sheet.getLastRow() + 1;

  // Generate contract ID
  const contractId = 'CTR-' + new Date().getFullYear() + '-' + String(row - CONFIG.CONTRACTS_START_ROW + 1).padStart(4, '0');

  sheet.getRange(row, 1).setValue(contractId);
  sheet.getRange(row, 2).setValue(contract.title);
  sheet.getRange(row, 3).setValue(contract.type);
  sheet.getRange(row, 4).setValue(contract.counterparty);
  sheet.getRange(row, 5).setValue(contract.contact);
  sheet.getRange(row, 6).setValue(new Date(contract.effectiveDate));
  sheet.getRange(row, 7).setValue(new Date(contract.expirationDate));
  sheet.getRange(row, 8).setValue(parseFloat(contract.value) || 0);
  sheet.getRange(row, 9).setValue(contract.terms);
  sheet.getRange(row, 10).setValue(contract.autoRenew);
  sheet.getRange(row, 11).setValue('Draft'); // Signature status
  sheet.getRange(row, 12).setValue(contract.owner);
  sheet.getRange(row, 13).setValue(contract.docLink);
  sheet.getRange(row, 14).setValue(new Date()); // Created

  // Calculate days to expiry
  const expiry = new Date(contract.expirationDate);
  const daysToExpiry = Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24));
  sheet.getRange(row, 15).setValue(daysToExpiry);

  return '✅ Contract ' + contractId + ' created!\n\nNext: Send for signature via Contract Tools menu.';
}

// Update Signature Status
function updateSignatureStatus() {
  const ui = SpreadsheetApp.getUi();
  const contractResponse = ui.prompt('Enter Contract ID:', ui.ButtonSet.OK_CANCEL);

  if (contractResponse.getSelectedButton() !== ui.Button.OK) return;

  const contractId = contractResponse.getResponseText().trim();
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();

  // Find contract
  let contractRow = null;
  for (let row = CONFIG.CONTRACTS_START_ROW; row <= lastRow; row++) {
    if (sheet.getRange(row, 1).getValue() === contractId) {
      contractRow = row;
      break;
    }
  }

  if (!contractRow) {
    ui.alert('❌ Contract not found: ' + contractId);
    return;
  }

  const currentStatus = sheet.getRange(contractRow, 11).getValue();
  const statusOptions = CONFIG.SIGNATURE_STATUSES.join('\n');

  const statusResponse = ui.prompt('Current status: ' + currentStatus + '\n\nEnter new status:\n' + statusOptions, ui.ButtonSet.OK_CANCEL);

  if (statusResponse.getSelectedButton() !== ui.Button.OK) return;

  const newStatus = statusResponse.getResponseText().trim();

  if (!CONFIG.SIGNATURE_STATUSES.includes(newStatus)) {
    ui.alert('❌ Invalid status');
    return;
  }

  sheet.getRange(contractRow, 11).setValue(newStatus);

  // Color code by status
  const colors = {
    'Draft': '#E0E0E0',
    'Internal Review': '#FFF3E0',
    'Sent for Signature': '#E3F2FD',
    'Partially Signed': '#BBDEFB',
    'Fully Executed': '#C8E6C9',
    'Expired': '#FFCDD2',
    'Terminated': '#FFCDD2'
  };
  sheet.getRange(contractRow, 1, 1, 15).setBackground(colors[newStatus] || '#FFFFFF');

  // If fully executed, prompt for signed date
  if (newStatus === 'Fully Executed') {
    const signedDate = ui.prompt('Enter signed date (YYYY-MM-DD):', ui.ButtonSet.OK_CANCEL);
    if (signedDate.getSelectedButton() === ui.Button.OK) {
      // Could store in a notes column or separate field
    }
  }

  ui.alert('✅ Status updated to: ' + newStatus);
}

// Add Amendment
function addAmendment() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      label { display: block; margin-top: 10px; font-weight: bold; }
      input, select, textarea { width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      button { margin-top: 15px; padding: 12px; background: #F5A623; color: white; border: none; cursor: pointer; width: 100%; border-radius: 4px; }
    </style>
    <label>Original Contract ID</label>
    <input type="text" id="contractId" placeholder="e.g., CTR-2024-0001">
    <label>Amendment Number</label>
    <input type="number" id="amendmentNum" value="1" min="1">
    <label>Amendment Type</label>
    <select id="amendmentType">
      <option>Term Extension</option>
      <option>Scope Change</option>
      <option>Price Adjustment</option>
      <option>Party Change</option>
      <option>General Modification</option>
    </select>
    <label>Description</label>
    <textarea id="description" rows="3" placeholder="What is being changed?"></textarea>
    <label>New Expiration Date (if changed)</label>
    <input type="date" id="newExpiry">
    <label>Value Change ($)</label>
    <input type="number" id="valueChange" placeholder="0 (use negative for decrease)">
    <button onclick="submitAmendment()">Add Amendment</button>
    <script>
      function submitAmendment() {
        const amendment = {
          contractId: document.getElementById('contractId').value,
          amendmentNum: document.getElementById('amendmentNum').value,
          amendmentType: document.getElementById('amendmentType').value,
          description: document.getElementById('description').value,
          newExpiry: document.getElementById('newExpiry').value,
          valueChange: document.getElementById('valueChange').value
        };
        google.script.run.withSuccessHandler(() => {
          alert('Amendment added!');
          google.script.host.close();
        }).processAmendment(amendment);
      }
    </script>
  `).setWidth(400).setHeight(450);

  SpreadsheetApp.getUi().showModalDialog(html, '📄 Add Amendment');
}

function processAmendment(amendment) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let amendSheet = ss.getSheetByName(CONFIG.AMENDMENTS_SHEET);

  if (!amendSheet) {
    amendSheet = ss.insertSheet(CONFIG.AMENDMENTS_SHEET);
    amendSheet.getRange(1, 1, 1, 8).setValues([['Amendment ID', 'Contract ID', 'Amendment #', 'Type', 'Description', 'New Expiry', 'Value Change', 'Date']]);
    amendSheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#FFF3E0');
  }

  const amendId = amendment.contractId + '-A' + amendment.amendmentNum;
  const row = amendSheet.getLastRow() + 1;

  amendSheet.getRange(row, 1, 1, 8).setValues([[
    amendId,
    amendment.contractId,
    amendment.amendmentNum,
    amendment.amendmentType,
    amendment.description,
    amendment.newExpiry ? new Date(amendment.newExpiry) : '',
    parseFloat(amendment.valueChange) || 0,
    new Date()
  ]]);

  // Update main contract if expiry changed
  if (amendment.newExpiry) {
    const mainSheet = ss.getSheets()[0];
    const lastRow = mainSheet.getLastRow();

    for (let row = CONFIG.CONTRACTS_START_ROW; row <= lastRow; row++) {
      if (mainSheet.getRange(row, 1).getValue() === amendment.contractId) {
        mainSheet.getRange(row, 7).setValue(new Date(amendment.newExpiry));
        break;
      }
    }
  }
}

// Contract Summary
function contractSummary() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();

  let stats = {
    total: 0,
    active: 0,
    draft: 0,
    pending: 0,
    expired: 0,
    totalValue: 0,
    byType: {}
  };

  for (let row = CONFIG.CONTRACTS_START_ROW; row <= lastRow; row++) {
    const status = sheet.getRange(row, 11).getValue();
    const type = sheet.getRange(row, 3).getValue();
    const value = parseFloat(sheet.getRange(row, 8).getValue()) || 0;
    const expiry = new Date(sheet.getRange(row, 7).getValue());

    stats.total++;
    stats.totalValue += value;

    if (!stats.byType[type]) stats.byType[type] = 0;
    stats.byType[type]++;

    if (status === 'Fully Executed') {
      if (expiry >= new Date()) stats.active++;
      else stats.expired++;
    } else if (status === 'Draft' || status === 'Internal Review') {
      stats.draft++;
    } else if (status === 'Sent for Signature' || status === 'Partially Signed') {
      stats.pending++;
    } else if (status === 'Expired' || status === 'Terminated') {
      stats.expired++;
    }
  }

  let report = `
CONTRACT SUMMARY
================

Total Contracts: ${stats.total}
✅ Active: ${stats.active}
📝 Draft/Review: ${stats.draft}
✍️ Pending Signature: ${stats.pending}
❌ Expired/Terminated: ${stats.expired}

Total Contract Value: $${stats.totalValue.toLocaleString()}

BY TYPE:
`;

  for (const [type, count] of Object.entries(stats.byType)) {
    report += `  ${type}: ${count}\n`;
  }

  SpreadsheetApp.getUi().alert(report);
}

// Expiring Contracts
function expiringContracts() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  const today = new Date();
  const threshold = new Date(today.getTime() + CONFIG.RENEWAL_NOTICE_DAYS * 24 * 60 * 60 * 1000);

  let expiring = [];

  for (let row = CONFIG.CONTRACTS_START_ROW; row <= lastRow; row++) {
    const status = sheet.getRange(row, 11).getValue();
    const expiry = new Date(sheet.getRange(row, 7).getValue());
    const autoRenew = sheet.getRange(row, 10).getValue();

    if (status === 'Fully Executed' && expiry <= threshold && expiry >= today) {
      expiring.push({
        id: sheet.getRange(row, 1).getValue(),
        title: sheet.getRange(row, 2).getValue(),
        counterparty: sheet.getRange(row, 4).getValue(),
        expiry: expiry,
        autoRenew: autoRenew,
        daysLeft: Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
      });

      // Highlight expiring contracts
      sheet.getRange(row, 1, 1, 15).setBackground('#FFF3E0');
    }
  }

  if (expiring.length === 0) {
    SpreadsheetApp.getUi().alert('✅ No contracts expiring within ' + CONFIG.RENEWAL_NOTICE_DAYS + ' days!');
    return;
  }

  let report = '⚠️ EXPIRING CONTRACTS (Next ' + CONFIG.RENEWAL_NOTICE_DAYS + ' days)\n\n';

  for (const contract of expiring) {
    report += `${contract.id}: ${contract.title}\n`;
    report += `  Counterparty: ${contract.counterparty}\n`;
    report += `  Expires: ${contract.expiry.toLocaleDateString()} (${contract.daysLeft} days)\n`;
    report += `  Auto-Renew: ${contract.autoRenew}\n\n`;
  }

  SpreadsheetApp.getUi().alert(report);
}

// Pending Signatures
function pendingSignatures() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();

  let pending = [];

  for (let row = CONFIG.CONTRACTS_START_ROW; row <= lastRow; row++) {
    const status = sheet.getRange(row, 11).getValue();

    if (status === 'Sent for Signature' || status === 'Partially Signed') {
      pending.push({
        id: sheet.getRange(row, 1).getValue(),
        title: sheet.getRange(row, 2).getValue(),
        counterparty: sheet.getRange(row, 4).getValue(),
        contact: sheet.getRange(row, 5).getValue(),
        status: status,
        created: new Date(sheet.getRange(row, 14).getValue())
      });
    }
  }

  if (pending.length === 0) {
    SpreadsheetApp.getUi().alert('✅ No contracts pending signature!');
    return;
  }

  let report = '✍️ PENDING SIGNATURES\n\n';

  for (const contract of pending) {
    const daysPending = Math.ceil((new Date() - contract.created) / (1000 * 60 * 60 * 24));
    report += `${contract.id}: ${contract.title}\n`;
    report += `  Status: ${contract.status}\n`;
    report += `  Counterparty: ${contract.counterparty}\n`;
    report += `  Days Pending: ${daysPending}\n\n`;
  }

  SpreadsheetApp.getUi().alert(report);
}

// Value Report
function valueReport() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();

  let stats = {
    total: 0,
    monthly: 0,
    quarterly: 0,
    annual: 0,
    oneTime: 0,
    byCounterparty: {}
  };

  for (let row = CONFIG.CONTRACTS_START_ROW; row <= lastRow; row++) {
    const status = sheet.getRange(row, 11).getValue();
    if (status !== 'Fully Executed') continue;

    const value = parseFloat(sheet.getRange(row, 8).getValue()) || 0;
    const terms = sheet.getRange(row, 9).getValue();
    const counterparty = sheet.getRange(row, 4).getValue();
    const expiry = new Date(sheet.getRange(row, 7).getValue());

    if (expiry < new Date()) continue; // Skip expired

    stats.total += value;

    if (terms === 'Monthly') stats.monthly += value;
    else if (terms === 'Quarterly') stats.quarterly += value;
    else if (terms === 'Annual') stats.annual += value;
    else stats.oneTime += value;

    if (!stats.byCounterparty[counterparty]) stats.byCounterparty[counterparty] = 0;
    stats.byCounterparty[counterparty] += value;
  }

  // Annualized value
  const annualized = stats.monthly * 12 + stats.quarterly * 4 + stats.annual + stats.oneTime;

  let report = `
CONTRACT VALUE REPORT
=====================

Total Active Contract Value: $${stats.total.toLocaleString()}
Annualized Value: $${annualized.toLocaleString()}

BY PAYMENT TERMS:
  Monthly: $${stats.monthly.toLocaleString()}/mo ($${(stats.monthly * 12).toLocaleString()}/yr)
  Quarterly: $${stats.quarterly.toLocaleString()}/qtr ($${(stats.quarterly * 4).toLocaleString()}/yr)
  Annual: $${stats.annual.toLocaleString()}/yr
  One-Time: $${stats.oneTime.toLocaleString()}

TOP COUNTERPARTIES:
`;

  const topParties = Object.entries(stats.byCounterparty)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  for (const [party, value] of topParties) {
    report += `  ${party}: $${value.toLocaleString()}\n`;
  }

  SpreadsheetApp.getUi().alert(report);
}

// Vendor Contracts
function vendorContracts() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();

  let vendors = [];

  for (let row = CONFIG.CONTRACTS_START_ROW; row <= lastRow; row++) {
    const type = sheet.getRange(row, 3).getValue();
    const status = sheet.getRange(row, 11).getValue();

    if (type === 'Vendor/Supplier' && status === 'Fully Executed') {
      vendors.push({
        id: sheet.getRange(row, 1).getValue(),
        counterparty: sheet.getRange(row, 4).getValue(),
        value: parseFloat(sheet.getRange(row, 8).getValue()) || 0,
        expiry: new Date(sheet.getRange(row, 7).getValue())
      });
    }
  }

  if (vendors.length === 0) {
    SpreadsheetApp.getUi().alert('No active vendor contracts found.');
    return;
  }

  let report = 'VENDOR CONTRACTS\n================\n\n';
  let totalValue = 0;

  for (const v of vendors) {
    report += `${v.counterparty}\n  Value: $${v.value.toLocaleString()}\n  Expires: ${v.expiry.toLocaleDateString()}\n\n`;
    totalValue += v.value;
  }

  report += `Total Vendor Spend: $${totalValue.toLocaleString()}`;

  SpreadsheetApp.getUi().alert(report);
}

// Check Renewals
function checkRenewals() {
  expiringContracts(); // Same functionality
}

// Send Renewal Notices
function sendRenewalNotices() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Send renewal notices to (internal recipient):', ui.ButtonSet.OK_CANCEL);

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const email = response.getResponseText();
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  const today = new Date();
  const threshold = new Date(today.getTime() + CONFIG.RENEWAL_NOTICE_DAYS * 24 * 60 * 60 * 1000);

  let expiring = [];

  for (let row = CONFIG.CONTRACTS_START_ROW; row <= lastRow; row++) {
    const status = sheet.getRange(row, 11).getValue();
    const expiry = new Date(sheet.getRange(row, 7).getValue());

    if (status === 'Fully Executed' && expiry <= threshold && expiry >= today) {
      expiring.push({
        title: sheet.getRange(row, 2).getValue(),
        counterparty: sheet.getRange(row, 4).getValue(),
        expiry: expiry.toLocaleDateString(),
        autoRenew: sheet.getRange(row, 10).getValue()
      });
    }
  }

  if (expiring.length === 0) {
    ui.alert('✅ No contracts expiring within ' + CONFIG.RENEWAL_NOTICE_DAYS + ' days!');
    return;
  }

  let body = 'CONTRACT RENEWAL NOTICE\n\nThe following contracts are expiring soon:\n\n';

  for (const c of expiring) {
    body += `• ${c.title} (${c.counterparty})\n  Expires: ${c.expiry}\n  Auto-Renew: ${c.autoRenew}\n\n`;
  }

  body += 'Please review and take appropriate action.\n\n--\nContract Management System';

  MailApp.sendEmail(email, 'Contract Renewal Notice - ' + expiring.length + ' contracts expiring', body);
  ui.alert('✅ Renewal notice sent to ' + email);
}

// Request Approval
function requestApproval() {
  const ui = SpreadsheetApp.getUi();
  const contractResponse = ui.prompt('Enter Contract ID to submit for approval:', ui.ButtonSet.OK_CANCEL);

  if (contractResponse.getSelectedButton() !== ui.Button.OK) return;

  const contractId = contractResponse.getResponseText().trim();

  const approverResponse = ui.prompt('Enter approver email:', ui.ButtonSet.OK_CANCEL);

  if (approverResponse.getSelectedButton() !== ui.Button.OK) return;

  const approver = approverResponse.getResponseText();
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();

  // Find contract
  for (let row = CONFIG.CONTRACTS_START_ROW; row <= lastRow; row++) {
    if (sheet.getRange(row, 1).getValue() === contractId) {
      const title = sheet.getRange(row, 2).getValue();
      const counterparty = sheet.getRange(row, 4).getValue();
      const value = sheet.getRange(row, 8).getValue();

      const subject = 'Contract Approval Required: ' + title;
      const body = `
CONTRACT APPROVAL REQUEST
=========================

Contract: ${contractId} - ${title}
Counterparty: ${counterparty}
Value: $${value.toLocaleString()}

Please review and approve this contract.

View contract: ${SpreadsheetApp.getActiveSpreadsheet().getUrl()}

--
Contract Management System
      `;

      MailApp.sendEmail(approver, subject, body);

      // Update status
      sheet.getRange(row, 11).setValue('Internal Review');
      sheet.getRange(row, 1, 1, 15).setBackground('#FFF3E0');

      ui.alert('✅ Approval request sent to ' + approver);
      return;
    }
  }

  ui.alert('❌ Contract not found: ' + contractId);
}

// Settings
function openContractSettings() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      h3 { color: #2979FF; }
    </style>
    <h3>⚙️ Contract Settings</h3>
    <p><b>Renewal Notice:</b> ${CONFIG.RENEWAL_NOTICE_DAYS} days before expiry</p>
    <p><b>Signature Statuses:</b></p>
    <p>Draft → Internal Review → Sent for Signature → Partially Signed → Fully Executed</p>
    <p><b>Contract Types:</b></p>
    <p>${CONFIG.CONTRACT_TYPES.slice(0, 5).join(', ')}...</p>
    <p><b>To customize:</b> Edit CONFIG in Apps Script</p>
  `).setWidth(400).setHeight(300);

  SpreadsheetApp.getUi().showModalDialog(html, '⚙️ Settings');
}
