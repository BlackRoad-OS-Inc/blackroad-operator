/**
 * BLACKROAD OS - IT Asset Management
 *
 * SETUP: Extensions > Apps Script > Paste this code > Save > Refresh sheet
 *
 * FEATURES:
 * - Hardware inventory (laptops, monitors, etc.)
 * - Software license tracking
 * - Assignment to employees
 * - Depreciation calculations
 * - Warranty tracking
 * - Maintenance schedules
 * - Check-in/check-out workflow
 * - Audit trail
 */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('💻 IT Assets')
    .addItem('➕ Add Hardware Asset', 'addHardwareAsset')
    .addItem('📀 Add Software License', 'addSoftwareLicense')
    .addSeparator()
    .addSubMenu(ui.createMenu('👤 Assignment')
      .addItem('Assign Asset to Employee', 'assignAsset')
      .addItem('Return Asset', 'returnAsset')
      .addItem('Transfer Asset', 'transferAsset'))
    .addSeparator()
    .addSubMenu(ui.createMenu('📊 Reports')
      .addItem('Asset Summary', 'assetSummary')
      .addItem('License Compliance', 'licenseCompliance')
      .addItem('Warranty Expiring', 'warrantyExpiring')
      .addItem('Depreciation Report', 'depreciationReport')
      .addItem('Employee Assets', 'employeeAssets'))
    .addSeparator()
    .addSubMenu(ui.createMenu('🔧 Maintenance')
      .addItem('Log Maintenance', 'logMaintenance')
      .addItem('Schedule Maintenance', 'scheduleMaintenance')
      .addItem('View Maintenance History', 'maintenanceHistory'))
    .addSeparator()
    .addItem('🔍 Asset Lookup', 'assetLookup')
    .addItem('📧 Send Inventory Report', 'sendInventoryReport')
    .addItem('⚙️ Settings', 'openITSettings')
    .addToUi();
}

const CONFIG = {
  COMPANY_NAME: 'BlackRoad OS, Inc.',
  ASSET_TYPES: {
    'Hardware': ['Laptop', 'Desktop', 'Monitor', 'Keyboard', 'Mouse', 'Headset', 'Webcam', 'Docking Station', 'Phone', 'Tablet', 'Server', 'Network Equipment', 'Other'],
    'Software': ['Operating System', 'Productivity Suite', 'Development Tools', 'Design Software', 'Security', 'Cloud Service', 'SaaS Subscription', 'Other']
  },
  CONDITIONS: ['New', 'Excellent', 'Good', 'Fair', 'Poor', 'Retired'],
  DEPRECIATION_YEARS: {
    'Laptop': 3,
    'Desktop': 5,
    'Monitor': 5,
    'Server': 5,
    'Phone': 2,
    'Tablet': 3,
    'Default': 3
  },
  WARRANTY_ALERT_DAYS: 90,
  LICENSE_ALERT_DAYS: 60
};

// Add Hardware Asset
function addHardwareAsset() {
  const ui = SpreadsheetApp.getUi();

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      label { display: block; margin-top: 10px; font-weight: bold; }
      input, select, textarea { width: 100%; padding: 8px; margin-top: 5px; box-sizing: border-box; }
      button { margin-top: 20px; padding: 10px 20px; background: #2979FF; color: white; border: none; cursor: pointer; width: 100%; }
      .row { display: flex; gap: 10px; }
      .col { flex: 1; }
    </style>

    <label>Asset Type:</label>
    <select id="assetType">
      ${CONFIG.ASSET_TYPES.Hardware.map(t => '<option>' + t + '</option>').join('')}
    </select>

    <label>Brand/Manufacturer:</label>
    <input type="text" id="brand" placeholder="e.g., Apple, Dell, Lenovo">

    <label>Model:</label>
    <input type="text" id="model" placeholder="e.g., MacBook Pro 14-inch">

    <label>Serial Number:</label>
    <input type="text" id="serialNumber" placeholder="Unique serial number">

    <label>Specifications:</label>
    <textarea id="specs" rows="2" placeholder="e.g., M3 Pro, 18GB RAM, 512GB SSD"></textarea>

    <div class="row">
      <div class="col">
        <label>Purchase Date:</label>
        <input type="date" id="purchaseDate">
      </div>
      <div class="col">
        <label>Purchase Price ($):</label>
        <input type="number" id="purchasePrice" value="0">
      </div>
    </div>

    <div class="row">
      <div class="col">
        <label>Warranty End:</label>
        <input type="date" id="warrantyEnd">
      </div>
      <div class="col">
        <label>Condition:</label>
        <select id="condition">
          ${CONFIG.CONDITIONS.map(c => '<option>' + c + '</option>').join('')}
        </select>
      </div>
    </div>

    <label>Location:</label>
    <input type="text" id="location" placeholder="e.g., Office, Remote, Storage">

    <label>Notes:</label>
    <textarea id="notes" rows="2" placeholder="Additional notes"></textarea>

    <button onclick="submitHardware()">Add Asset</button>

    <script>
      function submitHardware() {
        const data = {
          assetType: document.getElementById('assetType').value,
          brand: document.getElementById('brand').value,
          model: document.getElementById('model').value,
          serialNumber: document.getElementById('serialNumber').value,
          specs: document.getElementById('specs').value,
          purchaseDate: document.getElementById('purchaseDate').value,
          purchasePrice: parseFloat(document.getElementById('purchasePrice').value),
          warrantyEnd: document.getElementById('warrantyEnd').value,
          condition: document.getElementById('condition').value,
          location: document.getElementById('location').value,
          notes: document.getElementById('notes').value
        };
        google.script.run.withSuccessHandler(() => {
          google.script.host.close();
        }).processHardwareAsset(data);
      }
    </script>
  `).setWidth(450).setHeight(700);

  ui.showModalDialog(html, '💻 Add Hardware Asset');
}

function processHardwareAsset(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Hardware Assets');

  if (!sheet) {
    sheet = ss.insertSheet('Hardware Assets');
    sheet.getRange(1, 1, 1, 16).setValues([['Asset ID', 'Type', 'Brand', 'Model', 'Serial Number', 'Specs', 'Purchase Date', 'Purchase Price', 'Current Value', 'Warranty End', 'Condition', 'Assigned To', 'Location', 'Status', 'Notes', 'Created']]);
    sheet.getRange(1, 1, 1, 16).setFontWeight('bold').setBackground('#2979FF').setFontColor('white');
  }

  const lastRow = Math.max(sheet.getLastRow(), 1);
  const id = 'HW-' + new Date().getFullYear() + '-' + String(lastRow).padStart(4, '0');

  // Calculate depreciation
  const purchaseDate = new Date(data.purchaseDate);
  const today = new Date();
  const yearsOld = (today - purchaseDate) / (365.25 * 24 * 60 * 60 * 1000);
  const depYears = CONFIG.DEPRECIATION_YEARS[data.assetType] || CONFIG.DEPRECIATION_YEARS.Default;
  const currentValue = Math.max(0, data.purchasePrice * (1 - yearsOld / depYears));

  sheet.appendRow([
    id,
    data.assetType,
    data.brand,
    data.model,
    data.serialNumber,
    data.specs,
    data.purchaseDate,
    data.purchasePrice,
    Math.round(currentValue * 100) / 100,
    data.warrantyEnd,
    data.condition,
    '', // Assigned To
    data.location,
    'Available',
    data.notes,
    new Date()
  ]);

  // Color code by type
  const typeColors = {
    'Laptop': '#E3F2FD',
    'Desktop': '#E8F5E9',
    'Monitor': '#FFF3E0',
    'Server': '#FCE4EC',
    'Phone': '#F3E5F5',
    'Tablet': '#E0F7FA'
  };
  sheet.getRange(sheet.getLastRow(), 1, 1, 16).setBackground(typeColors[data.assetType] || '#FFFFFF');

  // Format currency
  sheet.getRange(sheet.getLastRow(), 8, 1, 2).setNumberFormat('$#,##0.00');

  SpreadsheetApp.getUi().alert('✅ Hardware asset added!\n\nAsset ID: ' + id + '\nCurrent Value: $' + Math.round(currentValue).toLocaleString());
}

// Add Software License
function addSoftwareLicense() {
  const ui = SpreadsheetApp.getUi();

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      label { display: block; margin-top: 10px; font-weight: bold; }
      input, select { width: 100%; padding: 8px; margin-top: 5px; box-sizing: border-box; }
      button { margin-top: 20px; padding: 10px 20px; background: #9C27B0; color: white; border: none; cursor: pointer; width: 100%; }
      .row { display: flex; gap: 10px; }
      .col { flex: 1; }
    </style>

    <label>Software Type:</label>
    <select id="softwareType">
      ${CONFIG.ASSET_TYPES.Software.map(t => '<option>' + t + '</option>').join('')}
    </select>

    <label>Software Name:</label>
    <input type="text" id="name" placeholder="e.g., Microsoft 365, Adobe Creative Cloud">

    <label>Vendor:</label>
    <input type="text" id="vendor" placeholder="e.g., Microsoft, Adobe, JetBrains">

    <label>License Key:</label>
    <input type="text" id="licenseKey" placeholder="XXXX-XXXX-XXXX-XXXX">

    <div class="row">
      <div class="col">
        <label>License Type:</label>
        <select id="licenseType">
          <option>Perpetual</option>
          <option>Subscription</option>
          <option>Per Seat</option>
          <option>Site License</option>
          <option>Open Source</option>
        </select>
      </div>
      <div class="col">
        <label>Seats/Quantity:</label>
        <input type="number" id="seats" value="1" min="1">
      </div>
    </div>

    <div class="row">
      <div class="col">
        <label>Purchase Date:</label>
        <input type="date" id="purchaseDate">
      </div>
      <div class="col">
        <label>Expiration Date:</label>
        <input type="date" id="expirationDate">
      </div>
    </div>

    <div class="row">
      <div class="col">
        <label>Cost ($):</label>
        <input type="number" id="cost" value="0">
      </div>
      <div class="col">
        <label>Billing:</label>
        <select id="billing">
          <option>One-time</option>
          <option>Monthly</option>
          <option>Annual</option>
        </select>
      </div>
    </div>

    <label>Notes:</label>
    <input type="text" id="notes" placeholder="Additional notes">

    <button onclick="submitLicense()">Add License</button>

    <script>
      function submitLicense() {
        const data = {
          softwareType: document.getElementById('softwareType').value,
          name: document.getElementById('name').value,
          vendor: document.getElementById('vendor').value,
          licenseKey: document.getElementById('licenseKey').value,
          licenseType: document.getElementById('licenseType').value,
          seats: parseInt(document.getElementById('seats').value),
          purchaseDate: document.getElementById('purchaseDate').value,
          expirationDate: document.getElementById('expirationDate').value,
          cost: parseFloat(document.getElementById('cost').value),
          billing: document.getElementById('billing').value,
          notes: document.getElementById('notes').value
        };
        google.script.run.withSuccessHandler(() => {
          google.script.host.close();
        }).processSoftwareLicense(data);
      }
    </script>
  `).setWidth(450).setHeight(600);

  ui.showModalDialog(html, '📀 Add Software License');
}

function processSoftwareLicense(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Software Licenses');

  if (!sheet) {
    sheet = ss.insertSheet('Software Licenses');
    sheet.getRange(1, 1, 1, 14).setValues([['License ID', 'Type', 'Name', 'Vendor', 'License Key', 'License Type', 'Total Seats', 'Used Seats', 'Purchase Date', 'Expiration', 'Cost', 'Billing', 'Status', 'Notes']]);
    sheet.getRange(1, 1, 1, 14).setFontWeight('bold').setBackground('#9C27B0').setFontColor('white');
  }

  const lastRow = Math.max(sheet.getLastRow(), 1);
  const id = 'SW-' + new Date().getFullYear() + '-' + String(lastRow).padStart(4, '0');

  // Calculate status
  const expDate = new Date(data.expirationDate);
  const today = new Date();
  const daysToExpiry = Math.ceil((expDate - today) / (24 * 60 * 60 * 1000));
  let status = 'Active';
  if (daysToExpiry < 0) status = 'Expired';
  else if (daysToExpiry < CONFIG.LICENSE_ALERT_DAYS) status = 'Expiring Soon';

  sheet.appendRow([
    id,
    data.softwareType,
    data.name,
    data.vendor,
    data.licenseKey,
    data.licenseType,
    data.seats,
    0, // Used seats
    data.purchaseDate,
    data.expirationDate,
    data.cost,
    data.billing,
    status,
    data.notes
  ]);

  // Color code by status
  const newRow = sheet.getLastRow();
  if (status === 'Expired') {
    sheet.getRange(newRow, 1, 1, 14).setBackground('#FFCDD2');
  } else if (status === 'Expiring Soon') {
    sheet.getRange(newRow, 1, 1, 14).setBackground('#FFF9C4');
  } else {
    sheet.getRange(newRow, 1, 1, 14).setBackground('#C8E6C9');
  }

  SpreadsheetApp.getUi().alert('✅ Software license added!\n\nLicense ID: ' + id + '\nStatus: ' + status);
}

// Assign Asset
function assignAsset() {
  const ui = SpreadsheetApp.getUi();

  const assetResponse = ui.prompt('Enter Asset ID (e.g., HW-2024-0001):', ui.ButtonSet.OK_CANCEL);
  if (assetResponse.getSelectedButton() !== ui.Button.OK) return;
  const assetId = assetResponse.getResponseText().trim();

  const employeeResponse = ui.prompt('Enter employee name or email:', ui.ButtonSet.OK_CANCEL);
  if (employeeResponse.getSelectedButton() !== ui.Button.OK) return;
  const employee = employeeResponse.getResponseText().trim();

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Hardware Assets');

  if (!sheet) {
    ui.alert('No Hardware Assets sheet found.');
    return;
  }

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 16).getValues();

  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === assetId) {
      const row = i + 2;
      const currentStatus = data[i][13];

      if (currentStatus === 'Assigned') {
        ui.alert('⚠️ Asset is already assigned to: ' + data[i][11]);
        return;
      }

      sheet.getRange(row, 12).setValue(employee);
      sheet.getRange(row, 14).setValue('Assigned');
      sheet.getRange(row, 1, 1, 16).setBackground('#E3F2FD');

      // Log assignment
      logAssetHistory(assetId, 'Assigned', 'Assigned to ' + employee);

      ui.alert('✅ Asset assigned!\n\n' + assetId + ' → ' + employee);
      return;
    }
  }

  ui.alert('❌ Asset not found: ' + assetId);
}

// Return Asset
function returnAsset() {
  const ui = SpreadsheetApp.getUi();

  const assetResponse = ui.prompt('Enter Asset ID to return:', ui.ButtonSet.OK_CANCEL);
  if (assetResponse.getSelectedButton() !== ui.Button.OK) return;
  const assetId = assetResponse.getResponseText().trim();

  const conditionResponse = ui.prompt('Enter condition upon return:', ui.ButtonSet.OK_CANCEL);
  const condition = conditionResponse.getSelectedButton() === ui.Button.OK ? conditionResponse.getResponseText() : 'Good';

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Hardware Assets');

  if (!sheet) {
    ui.alert('No Hardware Assets sheet found.');
    return;
  }

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 16).getValues();

  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === assetId) {
      const row = i + 2;
      const previousOwner = data[i][11];

      sheet.getRange(row, 12).setValue('');
      sheet.getRange(row, 11).setValue(condition);
      sheet.getRange(row, 14).setValue('Available');
      sheet.getRange(row, 1, 1, 16).setBackground('#C8E6C9');

      logAssetHistory(assetId, 'Returned', 'Returned by ' + previousOwner + ', condition: ' + condition);

      ui.alert('✅ Asset returned!\n\n' + assetId + ' is now available.');
      return;
    }
  }

  ui.alert('❌ Asset not found.');
}

// Transfer Asset
function transferAsset() {
  const ui = SpreadsheetApp.getUi();

  const assetResponse = ui.prompt('Enter Asset ID to transfer:', ui.ButtonSet.OK_CANCEL);
  if (assetResponse.getSelectedButton() !== ui.Button.OK) return;
  const assetId = assetResponse.getResponseText().trim();

  const newOwnerResponse = ui.prompt('Enter new owner name or email:', ui.ButtonSet.OK_CANCEL);
  if (newOwnerResponse.getSelectedButton() !== ui.Button.OK) return;
  const newOwner = newOwnerResponse.getResponseText().trim();

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Hardware Assets');

  if (!sheet) {
    ui.alert('No Hardware Assets sheet found.');
    return;
  }

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 16).getValues();

  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === assetId) {
      const row = i + 2;
      const previousOwner = data[i][11] || 'Unassigned';

      sheet.getRange(row, 12).setValue(newOwner);
      sheet.getRange(row, 14).setValue('Assigned');

      logAssetHistory(assetId, 'Transferred', previousOwner + ' → ' + newOwner);

      ui.alert('✅ Asset transferred!\n\n' + assetId + ': ' + previousOwner + ' → ' + newOwner);
      return;
    }
  }

  ui.alert('❌ Asset not found.');
}

// Log Asset History
function logAssetHistory(assetId, action, details) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let historySheet = ss.getSheetByName('Asset History');

  if (!historySheet) {
    historySheet = ss.insertSheet('Asset History');
    historySheet.getRange(1, 1, 1, 5).setValues([['Date', 'Asset ID', 'Action', 'Details', 'User']]);
    historySheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#FF1D6C').setFontColor('white');
  }

  historySheet.appendRow([
    new Date(),
    assetId,
    action,
    details,
    Session.getActiveUser().getEmail() || 'Unknown'
  ]);
}

// Asset Summary
function assetSummary() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let hwSheet = ss.getSheetByName('Hardware Assets');
  let swSheet = ss.getSheetByName('Software Licenses');

  let hwStats = { total: 0, assigned: 0, available: 0, totalValue: 0, currentValue: 0 };
  let swStats = { total: 0, totalSeats: 0, usedSeats: 0, expiringSoon: 0 };

  if (hwSheet && hwSheet.getLastRow() > 1) {
    const hwData = hwSheet.getRange(2, 1, hwSheet.getLastRow() - 1, 16).getValues();
    for (const row of hwData) {
      hwStats.total++;
      if (row[13] === 'Assigned') hwStats.assigned++;
      if (row[13] === 'Available') hwStats.available++;
      hwStats.totalValue += row[7] || 0;
      hwStats.currentValue += row[8] || 0;
    }
  }

  if (swSheet && swSheet.getLastRow() > 1) {
    const swData = swSheet.getRange(2, 1, swSheet.getLastRow() - 1, 14).getValues();
    for (const row of swData) {
      swStats.total++;
      swStats.totalSeats += row[6] || 0;
      swStats.usedSeats += row[7] || 0;
      if (row[12] === 'Expiring Soon') swStats.expiringSoon++;
    }
  }

  let report = `
💻 IT ASSET SUMMARY
===================

HARDWARE:
  Total Assets: ${hwStats.total}
  Assigned: ${hwStats.assigned}
  Available: ${hwStats.available}
  Total Purchase Value: $${hwStats.totalValue.toLocaleString()}
  Current Book Value: $${Math.round(hwStats.currentValue).toLocaleString()}
  Depreciation: $${Math.round(hwStats.totalValue - hwStats.currentValue).toLocaleString()}

SOFTWARE LICENSES:
  Total Licenses: ${swStats.total}
  Total Seats: ${swStats.totalSeats}
  Used Seats: ${swStats.usedSeats}
  Available Seats: ${swStats.totalSeats - swStats.usedSeats}
  Expiring Soon: ${swStats.expiringSoon}
  `;

  ui.alert(report);
}

// License Compliance
function licenseCompliance() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const swSheet = ss.getSheetByName('Software Licenses');

  if (!swSheet || swSheet.getLastRow() < 2) {
    ui.alert('No software licenses found.');
    return;
  }

  const swData = swSheet.getRange(2, 1, swSheet.getLastRow() - 1, 14).getValues();

  let compliant = 0;
  let overused = 0;
  let issues = [];

  for (const row of swData) {
    const name = row[2];
    const totalSeats = row[6];
    const usedSeats = row[7];

    if (usedSeats > totalSeats) {
      overused++;
      issues.push(name + ': ' + usedSeats + '/' + totalSeats + ' seats (OVER LICENSE)');
    } else {
      compliant++;
    }
  }

  let report = `
📊 LICENSE COMPLIANCE REPORT
============================

Compliant: ${compliant}
Over-licensed: ${overused}

${issues.length > 0 ? 'ISSUES:\n' + issues.map(i => '  ⚠️ ' + i).join('\n') : '✅ All licenses compliant!'}
  `;

  ui.alert(report);
}

// Warranty Expiring
function warrantyExpiring() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hwSheet = ss.getSheetByName('Hardware Assets');

  if (!hwSheet || hwSheet.getLastRow() < 2) {
    ui.alert('No hardware assets found.');
    return;
  }

  const hwData = hwSheet.getRange(2, 1, hwSheet.getLastRow() - 1, 16).getValues();
  const today = new Date();
  const alertDate = new Date(today.getTime() + CONFIG.WARRANTY_ALERT_DAYS * 24 * 60 * 60 * 1000);

  let expiring = [];
  let expired = [];

  for (const row of hwData) {
    const warrantyEnd = new Date(row[9]);
    if (warrantyEnd) {
      if (warrantyEnd < today) {
        expired.push(row[0] + ': ' + row[2] + ' ' + row[3] + ' (expired ' + warrantyEnd.toLocaleDateString() + ')');
      } else if (warrantyEnd <= alertDate) {
        const daysLeft = Math.ceil((warrantyEnd - today) / (24 * 60 * 60 * 1000));
        expiring.push(row[0] + ': ' + row[2] + ' ' + row[3] + ' (' + daysLeft + ' days left)');
      }
    }
  }

  let report = `
⚠️ WARRANTY ALERTS
==================

EXPIRING WITHIN ${CONFIG.WARRANTY_ALERT_DAYS} DAYS (${expiring.length}):
${expiring.length > 0 ? expiring.map(e => '  🟡 ' + e).join('\n') : '  None'}

ALREADY EXPIRED (${expired.length}):
${expired.length > 0 ? expired.map(e => '  🔴 ' + e).join('\n') : '  None'}
  `;

  ui.alert(report);
}

// Depreciation Report
function depreciationReport() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hwSheet = ss.getSheetByName('Hardware Assets');

  if (!hwSheet || hwSheet.getLastRow() < 2) {
    ui.alert('No hardware assets found.');
    return;
  }

  const hwData = hwSheet.getRange(2, 1, hwSheet.getLastRow() - 1, 16).getValues();

  let byType = {};
  let totalOriginal = 0;
  let totalCurrent = 0;

  for (const row of hwData) {
    const type = row[1];
    const original = row[7] || 0;
    const current = row[8] || 0;

    if (!byType[type]) byType[type] = { original: 0, current: 0, count: 0 };
    byType[type].original += original;
    byType[type].current += current;
    byType[type].count++;

    totalOriginal += original;
    totalCurrent += current;
  }

  let report = `
📉 DEPRECIATION REPORT
======================

TOTAL:
  Original Value: $${totalOriginal.toLocaleString()}
  Current Value: $${Math.round(totalCurrent).toLocaleString()}
  Total Depreciation: $${Math.round(totalOriginal - totalCurrent).toLocaleString()}
  Depreciation %: ${totalOriginal > 0 ? Math.round((1 - totalCurrent / totalOriginal) * 100) : 0}%

BY ASSET TYPE:
`;

  for (const [type, data] of Object.entries(byType)) {
    report += `  ${type} (${data.count}):\n`;
    report += `    Original: $${data.original.toLocaleString()}\n`;
    report += `    Current: $${Math.round(data.current).toLocaleString()}\n`;
  }

  ui.alert(report);
}

// Employee Assets
function employeeAssets() {
  const ui = SpreadsheetApp.getUi();

  const employeeResponse = ui.prompt('Enter employee name or email:', ui.ButtonSet.OK_CANCEL);
  if (employeeResponse.getSelectedButton() !== ui.Button.OK) return;
  const employee = employeeResponse.getResponseText().trim().toLowerCase();

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hwSheet = ss.getSheetByName('Hardware Assets');

  if (!hwSheet || hwSheet.getLastRow() < 2) {
    ui.alert('No hardware assets found.');
    return;
  }

  const hwData = hwSheet.getRange(2, 1, hwSheet.getLastRow() - 1, 16).getValues();
  const empAssets = hwData.filter(row => row[11] && row[11].toLowerCase().includes(employee));

  if (empAssets.length === 0) {
    ui.alert('No assets found for: ' + employee);
    return;
  }

  let report = `👤 ASSETS FOR: ${employee.toUpperCase()}\n${'='.repeat(30)}\n\n`;

  let totalValue = 0;
  for (const asset of empAssets) {
    report += `${asset[0]}: ${asset[2]} ${asset[3]}\n`;
    report += `  Serial: ${asset[4]}\n`;
    report += `  Value: $${Math.round(asset[8]).toLocaleString()}\n\n`;
    totalValue += asset[8] || 0;
  }

  report += `\nTOTAL ASSETS: ${empAssets.length}\nTOTAL VALUE: $${Math.round(totalValue).toLocaleString()}`;

  ui.alert(report);
}

// Log Maintenance
function logMaintenance() {
  const ui = SpreadsheetApp.getUi();

  const assetResponse = ui.prompt('Enter Asset ID:', ui.ButtonSet.OK_CANCEL);
  if (assetResponse.getSelectedButton() !== ui.Button.OK) return;
  const assetId = assetResponse.getResponseText().trim();

  const typeResponse = ui.prompt('Maintenance type (Repair, Upgrade, Cleaning, etc.):', ui.ButtonSet.OK_CANCEL);
  if (typeResponse.getSelectedButton() !== ui.Button.OK) return;
  const maintType = typeResponse.getResponseText();

  const descResponse = ui.prompt('Description of work:', ui.ButtonSet.OK_CANCEL);
  if (descResponse.getSelectedButton() !== ui.Button.OK) return;
  const description = descResponse.getResponseText();

  const costResponse = ui.prompt('Cost ($):', ui.ButtonSet.OK_CANCEL);
  const cost = costResponse.getSelectedButton() === ui.Button.OK ? parseFloat(costResponse.getResponseText()) : 0;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let maintSheet = ss.getSheetByName('Maintenance Log');

  if (!maintSheet) {
    maintSheet = ss.insertSheet('Maintenance Log');
    maintSheet.getRange(1, 1, 1, 6).setValues([['Date', 'Asset ID', 'Type', 'Description', 'Cost', 'Technician']]);
    maintSheet.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#F5A623').setFontColor('white');
  }

  maintSheet.appendRow([
    new Date(),
    assetId,
    maintType,
    description,
    cost,
    Session.getActiveUser().getEmail() || 'Unknown'
  ]);

  ui.alert('✅ Maintenance logged!\n\nAsset: ' + assetId + '\nType: ' + maintType);
}

// Schedule Maintenance
function scheduleMaintenance() {
  const ui = SpreadsheetApp.getUi();

  const assetResponse = ui.prompt('Enter Asset ID:', ui.ButtonSet.OK_CANCEL);
  if (assetResponse.getSelectedButton() !== ui.Button.OK) return;
  const assetId = assetResponse.getResponseText().trim();

  const dateResponse = ui.prompt('Scheduled date (YYYY-MM-DD):', ui.ButtonSet.OK_CANCEL);
  if (dateResponse.getSelectedButton() !== ui.Button.OK) return;
  const schedDate = dateResponse.getResponseText();

  const typeResponse = ui.prompt('Maintenance type:', ui.ButtonSet.OK_CANCEL);
  const maintType = typeResponse.getSelectedButton() === ui.Button.OK ? typeResponse.getResponseText() : 'General';

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let schedSheet = ss.getSheetByName('Scheduled Maintenance');

  if (!schedSheet) {
    schedSheet = ss.insertSheet('Scheduled Maintenance');
    schedSheet.getRange(1, 1, 1, 5).setValues([['Scheduled Date', 'Asset ID', 'Type', 'Status', 'Created']]);
    schedSheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#F5A623').setFontColor('white');
  }

  schedSheet.appendRow([
    schedDate,
    assetId,
    maintType,
    'Scheduled',
    new Date()
  ]);

  ui.alert('✅ Maintenance scheduled!\n\nAsset: ' + assetId + '\nDate: ' + schedDate);
}

// Maintenance History
function maintenanceHistory() {
  const ui = SpreadsheetApp.getUi();

  const assetResponse = ui.prompt('Enter Asset ID (or leave blank for all):', ui.ButtonSet.OK_CANCEL);
  if (assetResponse.getSelectedButton() !== ui.Button.OK) return;
  const assetId = assetResponse.getResponseText().trim();

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const maintSheet = ss.getSheetByName('Maintenance Log');

  if (!maintSheet || maintSheet.getLastRow() < 2) {
    ui.alert('No maintenance history found.');
    return;
  }

  const maintData = maintSheet.getRange(2, 1, maintSheet.getLastRow() - 1, 6).getValues();
  const filtered = assetId ? maintData.filter(row => row[1] === assetId) : maintData;

  if (filtered.length === 0) {
    ui.alert('No maintenance records found' + (assetId ? ' for ' + assetId : '') + '.');
    return;
  }

  let report = `🔧 MAINTENANCE HISTORY\n${'='.repeat(25)}\n\n`;

  for (const record of filtered.slice(-10)) {
    report += `${new Date(record[0]).toLocaleDateString()}: ${record[1]}\n`;
    report += `  ${record[2]}: ${record[3]}\n`;
    report += `  Cost: $${record[4] || 0}\n\n`;
  }

  ui.alert(report);
}

// Asset Lookup
function assetLookup() {
  const ui = SpreadsheetApp.getUi();

  const searchResponse = ui.prompt('Enter Asset ID or Serial Number:', ui.ButtonSet.OK_CANCEL);
  if (searchResponse.getSelectedButton() !== ui.Button.OK) return;
  const search = searchResponse.getResponseText().trim().toLowerCase();

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hwSheet = ss.getSheetByName('Hardware Assets');

  if (!hwSheet || hwSheet.getLastRow() < 2) {
    ui.alert('No hardware assets found.');
    return;
  }

  const hwData = hwSheet.getRange(2, 1, hwSheet.getLastRow() - 1, 16).getValues();

  for (const row of hwData) {
    if (row[0].toLowerCase() === search || row[4].toLowerCase() === search) {
      let report = `
🔍 ASSET FOUND
==============

Asset ID: ${row[0]}
Type: ${row[1]}
Brand: ${row[2]}
Model: ${row[3]}
Serial: ${row[4]}
Specs: ${row[5]}

Purchase Date: ${row[6]}
Purchase Price: $${row[7]}
Current Value: $${Math.round(row[8])}
Warranty Until: ${row[9]}

Condition: ${row[10]}
Assigned To: ${row[11] || 'Unassigned'}
Location: ${row[12]}
Status: ${row[13]}
      `;
      ui.alert(report);
      return;
    }
  }

  ui.alert('❌ Asset not found: ' + search);
}

// Send Inventory Report
function sendInventoryReport() {
  const ui = SpreadsheetApp.getUi();

  const emailResponse = ui.prompt('Send inventory report to:', ui.ButtonSet.OK_CANCEL);
  if (emailResponse.getSelectedButton() !== ui.Button.OK) return;
  const email = emailResponse.getResponseText();

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hwSheet = ss.getSheetByName('Hardware Assets');
  const swSheet = ss.getSheetByName('Software Licenses');

  let hwCount = 0, hwValue = 0;
  let swCount = 0, swSeats = 0;

  if (hwSheet && hwSheet.getLastRow() > 1) {
    const hwData = hwSheet.getRange(2, 1, hwSheet.getLastRow() - 1, 16).getValues();
    hwCount = hwData.length;
    hwValue = hwData.reduce((sum, row) => sum + (row[8] || 0), 0);
  }

  if (swSheet && swSheet.getLastRow() > 1) {
    const swData = swSheet.getRange(2, 1, swSheet.getLastRow() - 1, 14).getValues();
    swCount = swData.length;
    swSeats = swData.reduce((sum, row) => sum + (row[6] || 0), 0);
  }

  const subject = CONFIG.COMPANY_NAME + ' - IT Asset Inventory ' + new Date().toLocaleDateString();
  const body = `
${CONFIG.COMPANY_NAME} IT ASSET INVENTORY
=========================================

HARDWARE:
  Total Assets: ${hwCount}
  Current Value: $${Math.round(hwValue).toLocaleString()}

SOFTWARE:
  Total Licenses: ${swCount}
  Total Seats: ${swSeats}

View full inventory: ${ss.getUrl()}

--
Generated by BlackRoad OS IT Asset Management
  `;

  MailApp.sendEmail(email, subject, body);
  ui.alert('✅ Inventory report sent to ' + email);
}

// Settings
function openITSettings() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      h3 { color: #2979FF; }
    </style>
    <h3>⚙️ IT Asset Settings</h3>
    <p><b>Company:</b> ${CONFIG.COMPANY_NAME}</p>
    <p><b>Warranty Alert:</b> ${CONFIG.WARRANTY_ALERT_DAYS} days</p>
    <p><b>License Alert:</b> ${CONFIG.LICENSE_ALERT_DAYS} days</p>
    <p><b>Depreciation (years):</b></p>
    <ul>
      ${Object.entries(CONFIG.DEPRECIATION_YEARS).map(([k, v]) => '<li>' + k + ': ' + v + ' years</li>').join('')}
    </ul>
    <p><b>To customize:</b> Edit CONFIG in Apps Script</p>
  `).setWidth(400).setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(html, '⚙️ Settings');
}
