/**
 * BlackRoad OS - Commission & Bonus Calculator
 * Track sales commissions, quotas, and bonus payouts
 *
 * Features:
 * - Sales rep quota management
 * - Commission structure configuration
 * - Deal-level commission tracking
 * - Tiered commission rates
 * - Bonus calculations (quarterly/annual)
 * - Payout reports and history
 * - Team performance dashboards
 */

const CONFIG = {
  COMPANY_NAME: 'BlackRoad OS, Inc.',

  // Sheet names
  SHEETS: {
    REPS: 'Sales Reps',
    DEALS: 'Deals',
    COMMISSIONS: 'Commissions',
    PAYOUTS: 'Payouts',
    STRUCTURES: 'Commission Structures'
  },

  // Commission types
  COMMISSION_TYPES: [
    'Percentage of Deal',
    'Flat Rate',
    'Tiered Percentage',
    'Tiered Flat',
    'Override/SPIFs'
  ],

  // Deal stages that trigger commission
  COMMISSIONABLE_STAGES: [
    'Closed Won',
    'Paid',
    'Delivered'
  ],

  // Bonus types
  BONUS_TYPES: [
    'Quota Attainment',
    'Accelerator',
    'SPIF',
    'Team Bonus',
    'Annual Performance',
    'Retention Bonus'
  ],

  // Payout frequencies
  PAYOUT_FREQUENCIES: [
    'Monthly',
    'Bi-weekly',
    'Quarterly',
    'Upon Close',
    'Upon Payment'
  ],

  // Default commission tiers
  DEFAULT_TIERS: [
    { min: 0, max: 50, rate: 0.05 },      // 0-50% quota: 5%
    { min: 50, max: 100, rate: 0.08 },    // 50-100% quota: 8%
    { min: 100, max: 150, rate: 0.10 },   // 100-150% quota: 10%
    { min: 150, max: 999, rate: 0.12 }    // 150%+ quota: 12%
  ]
};

// ============================================
// MENU SETUP
// ============================================

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('💰 Commissions')
    .addItem('👤 Add Sales Rep', 'addSalesRep')
    .addItem('📝 Log Deal', 'logDeal')
    .addItem('💵 Calculate Commission', 'calculateCommission')
    .addSeparator()
    .addSubMenu(ui.createMenu('📊 Quotas')
      .addItem('Set Quota', 'setQuota')
      .addItem('View Quota Attainment', 'viewQuotaAttainment')
      .addItem('Quota vs Actual Report', 'quotaVsActualReport'))
    .addSeparator()
    .addSubMenu(ui.createMenu('🎁 Bonuses')
      .addItem('Add Bonus', 'addBonus')
      .addItem('Calculate Accelerators', 'calculateAccelerators')
      .addItem('SPIF Campaign', 'createSPIF'))
    .addSeparator()
    .addSubMenu(ui.createMenu('💳 Payouts')
      .addItem('Generate Payout Report', 'generatePayoutReport')
      .addItem('Mark as Paid', 'markAsPaid')
      .addItem('Payout History', 'viewPayoutHistory'))
    .addSeparator()
    .addSubMenu(ui.createMenu('📈 Reports')
      .addItem('Rep Performance Dashboard', 'showRepDashboard')
      .addItem('Team Leaderboard', 'showLeaderboard')
      .addItem('Commission Summary', 'showCommissionSummary')
      .addItem('Export for Payroll', 'exportForPayroll'))
    .addSeparator()
    .addItem('⚙️ Configure Commission Structure', 'configureStructure')
    .addItem('❓ Help', 'showHelp')
    .addToUi();
}

// ============================================
// SALES REP MANAGEMENT
// ============================================

function addSalesRep() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 12px; }
      label { display: block; font-weight: bold; margin-bottom: 4px; }
      input, select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      .row { display: flex; gap: 10px; }
      .row .form-group { flex: 1; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
    </style>

    <h2>👤 Add Sales Rep</h2>

    <div class="form-group">
      <label>Full Name *</label>
      <input type="text" id="name">
    </div>

    <div class="form-group">
      <label>Email *</label>
      <input type="email" id="email">
    </div>

    <div class="row">
      <div class="form-group">
        <label>Role</label>
        <select id="role">
          <option>Account Executive</option>
          <option>Sales Development Rep</option>
          <option>Enterprise Rep</option>
          <option>Sales Manager</option>
          <option>VP Sales</option>
        </select>
      </div>
      <div class="form-group">
        <label>Team</label>
        <input type="text" id="team" placeholder="e.g., Enterprise West">
      </div>
    </div>

    <div class="row">
      <div class="form-group">
        <label>Manager</label>
        <input type="text" id="manager">
      </div>
      <div class="form-group">
        <label>Start Date</label>
        <input type="date" id="startDate">
      </div>
    </div>

    <div class="row">
      <div class="form-group">
        <label>Annual Quota ($)</label>
        <input type="number" id="annualQuota" value="500000">
      </div>
      <div class="form-group">
        <label>Commission Structure</label>
        <select id="structure">
          <option>Standard (8%)</option>
          <option>Tiered</option>
          <option>Enterprise (10%)</option>
          <option>SDR (Flat per Meeting)</option>
          <option>Custom</option>
        </select>
      </div>
    </div>

    <div class="form-group">
      <label>Base Salary ($)</label>
      <input type="number" id="baseSalary" placeholder="Annual base salary">
    </div>

    <button onclick="saveRep()">Add Sales Rep</button>

    <script>
      function saveRep() {
        const data = {
          name: document.getElementById('name').value,
          email: document.getElementById('email').value,
          role: document.getElementById('role').value,
          team: document.getElementById('team').value,
          manager: document.getElementById('manager').value,
          startDate: document.getElementById('startDate').value,
          annualQuota: document.getElementById('annualQuota').value,
          structure: document.getElementById('structure').value,
          baseSalary: document.getElementById('baseSalary').value
        };

        if (!data.name || !data.email) {
          alert('Please fill in required fields');
          return;
        }

        google.script.run
          .withSuccessHandler(() => {
            alert('Sales rep added!');
            google.script.host.close();
          })
          .saveSalesRep(data);
      }
    </script>
  `)
  .setWidth(450)
  .setHeight(550);

  SpreadsheetApp.getUi().showModalDialog(html, 'Add Sales Rep');
}

function saveSalesRep(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEETS.REPS);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.REPS);
    sheet.appendRow([
      'Rep ID', 'Name', 'Email', 'Role', 'Team', 'Manager',
      'Start Date', 'Annual Quota', 'Q1 Quota', 'Q2 Quota', 'Q3 Quota', 'Q4 Quota',
      'Commission Structure', 'Base Salary', 'Status', 'Notes'
    ]);
    sheet.getRange(1, 1, 1, 16).setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
  }

  const lastRow = sheet.getLastRow();
  const id = 'REP-' + String(lastRow).padStart(4, '0');

  // Calculate quarterly quotas
  const annualQuota = parseFloat(data.annualQuota) || 0;
  const quarterlyQuota = annualQuota / 4;

  sheet.appendRow([
    id,
    data.name,
    data.email,
    data.role,
    data.team,
    data.manager,
    data.startDate ? new Date(data.startDate) : new Date(),
    annualQuota,
    quarterlyQuota,
    quarterlyQuota,
    quarterlyQuota,
    quarterlyQuota,
    data.structure,
    data.baseSalary,
    'Active',
    ''
  ]);

  return id;
}

// ============================================
// DEAL LOGGING
// ============================================

function logDeal() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const repsSheet = ss.getSheetByName(CONFIG.SHEETS.REPS);

  let repOptions = '<option value="">Select rep...</option>';
  if (repsSheet && repsSheet.getLastRow() > 1) {
    const reps = repsSheet.getRange(2, 1, repsSheet.getLastRow() - 1, 3).getValues();
    repOptions += reps.map(r => `<option value="${r[0]}">${r[1]} (${r[0]})</option>`).join('');
  }

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 12px; }
      label { display: block; font-weight: bold; margin-bottom: 4px; }
      input, select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      .row { display: flex; gap: 10px; }
      .row .form-group { flex: 1; }
      button { background: #34a853; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
      .deal-value { font-size: 24px; color: #34a853; text-align: center; padding: 10px; background: #e6f4ea; border-radius: 8px; margin-bottom: 15px; }
    </style>

    <h2>📝 Log Deal</h2>

    <div class="form-group">
      <label>Sales Rep *</label>
      <select id="repId">${repOptions}</select>
    </div>

    <div class="form-group">
      <label>Deal/Opportunity Name *</label>
      <input type="text" id="dealName">
    </div>

    <div class="form-group">
      <label>Customer/Account</label>
      <input type="text" id="customer">
    </div>

    <div class="row">
      <div class="form-group">
        <label>Deal Value ($) *</label>
        <input type="number" id="dealValue" onchange="updatePreview()">
      </div>
      <div class="form-group">
        <label>Deal Type</label>
        <select id="dealType">
          <option>New Business</option>
          <option>Expansion</option>
          <option>Renewal</option>
          <option>Upsell</option>
          <option>Cross-sell</option>
        </select>
      </div>
    </div>

    <div class="row">
      <div class="form-group">
        <label>Close Date</label>
        <input type="date" id="closeDate" value="${new Date().toISOString().split('T')[0]}">
      </div>
      <div class="form-group">
        <label>Stage</label>
        <select id="stage">
          <option>Closed Won</option>
          <option>Paid</option>
          <option>Delivered</option>
        </select>
      </div>
    </div>

    <div class="row">
      <div class="form-group">
        <label>Contract Term (months)</label>
        <input type="number" id="term" value="12">
      </div>
      <div class="form-group">
        <label>Product</label>
        <input type="text" id="product">
      </div>
    </div>

    <div class="deal-value" id="preview">
      Commission Preview: Calculating...
    </div>

    <button onclick="saveDeal()">Log Deal</button>

    <script>
      function updatePreview() {
        const value = parseFloat(document.getElementById('dealValue').value) || 0;
        const commission = value * 0.08; // Default 8%
        document.getElementById('preview').innerHTML =
          'Deal: $' + value.toLocaleString() + ' → Est. Commission: $' + commission.toLocaleString();
      }

      function saveDeal() {
        const data = {
          repId: document.getElementById('repId').value,
          dealName: document.getElementById('dealName').value,
          customer: document.getElementById('customer').value,
          dealValue: document.getElementById('dealValue').value,
          dealType: document.getElementById('dealType').value,
          closeDate: document.getElementById('closeDate').value,
          stage: document.getElementById('stage').value,
          term: document.getElementById('term').value,
          product: document.getElementById('product').value
        };

        if (!data.repId || !data.dealName || !data.dealValue) {
          alert('Please fill in required fields');
          return;
        }

        google.script.run
          .withSuccessHandler(result => {
            alert(result);
            google.script.host.close();
          })
          .saveDeal(data);
      }
    </script>
  `)
  .setWidth(450)
  .setHeight(600);

  SpreadsheetApp.getUi().showModalDialog(html, 'Log Deal');
}

function saveDeal(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEETS.DEALS);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.DEALS);
    sheet.appendRow([
      'Deal ID', 'Rep ID', 'Deal Name', 'Customer', 'Deal Value',
      'Deal Type', 'Close Date', 'Stage', 'Contract Term', 'Product',
      'Commission Rate', 'Commission Amount', 'Status', 'Paid Date', 'Notes'
    ]);
    sheet.getRange(1, 1, 1, 15).setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
  }

  const lastRow = sheet.getLastRow();
  const dealId = 'DEAL-' + String(lastRow).padStart(5, '0');

  // Calculate commission (default 8%)
  const dealValue = parseFloat(data.dealValue) || 0;
  const commissionRate = 0.08;
  const commissionAmount = dealValue * commissionRate;

  sheet.appendRow([
    dealId,
    data.repId,
    data.dealName,
    data.customer,
    dealValue,
    data.dealType,
    new Date(data.closeDate),
    data.stage,
    data.term,
    data.product,
    commissionRate,
    commissionAmount,
    'Pending',
    '',
    ''
  ]);

  // Color code the row
  const newRow = sheet.getLastRow();
  sheet.getRange(newRow, 1, 1, 15).setBackground('#d9ead3');

  return `Deal logged! ${dealId}\nCommission: $${commissionAmount.toLocaleString()} (${(commissionRate * 100)}%)`;
}

// ============================================
// COMMISSION CALCULATION
// ============================================

function calculateCommission() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dealsSheet = ss.getSheetByName(CONFIG.SHEETS.DEALS);

  if (!dealsSheet || dealsSheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('No deals found. Log some deals first.');
    return;
  }

  const deals = dealsSheet.getRange(2, 1, dealsSheet.getLastRow() - 1, 15).getValues();
  const pendingDeals = deals.filter(d => d[12] === 'Pending');

  if (pendingDeals.length === 0) {
    SpreadsheetApp.getUi().alert('No pending commissions to calculate.');
    return;
  }

  // Group by rep
  const byRep = {};
  pendingDeals.forEach(deal => {
    const repId = deal[1];
    if (!byRep[repId]) byRep[repId] = { deals: [], total: 0 };
    byRep[repId].deals.push(deal);
    byRep[repId].total += deal[11]; // Commission amount
  });

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .rep-card { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px; }
      .rep-name { font-weight: bold; font-size: 16px; }
      .rep-total { color: #34a853; font-size: 20px; font-weight: bold; }
      .deal-list { font-size: 12px; color: #666; margin-top: 10px; }
      .summary { background: #e8f5e9; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
      .grand-total { font-size: 32px; font-weight: bold; color: #34a853; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin: 5px; }
    </style>

    <h2>💵 Commission Summary</h2>

    <div class="summary">
      <div>Total Pending Commissions</div>
      <div class="grand-total">$${Object.values(byRep).reduce((sum, r) => sum + r.total, 0).toLocaleString()}</div>
      <div>${pendingDeals.length} deals from ${Object.keys(byRep).length} reps</div>
    </div>

    ${Object.entries(byRep).map(([repId, data]) => `
      <div class="rep-card">
        <div class="rep-name">${repId}</div>
        <div class="rep-total">$${data.total.toLocaleString()}</div>
        <div class="deal-list">
          ${data.deals.map(d => d[2] + ': $' + d[11].toLocaleString()).join('<br>')}
        </div>
      </div>
    `).join('')}

    <div style="text-align: center;">
      <button onclick="google.script.run.withSuccessHandler(() => { alert('Commissions approved!'); google.script.host.close(); }).approveAllCommissions()">
        ✅ Approve All
      </button>
      <button onclick="google.script.host.close()" style="background: #666;">Cancel</button>
    </div>
  `)
  .setWidth(450)
  .setHeight(500);

  SpreadsheetApp.getUi().showModalDialog(html, 'Calculate Commissions');
}

function approveAllCommissions() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dealsSheet = ss.getSheetByName(CONFIG.SHEETS.DEALS);

  if (!dealsSheet) return;

  const data = dealsSheet.getRange(2, 1, dealsSheet.getLastRow() - 1, 15).getValues();

  data.forEach((row, index) => {
    if (row[12] === 'Pending') {
      dealsSheet.getRange(index + 2, 13).setValue('Approved');
    }
  });
}

// ============================================
// QUOTA MANAGEMENT
// ============================================

function setQuota() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const repsSheet = ss.getSheetByName(CONFIG.SHEETS.REPS);

  if (!repsSheet || repsSheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('No sales reps found. Add reps first.');
    return;
  }

  const reps = repsSheet.getRange(2, 1, repsSheet.getLastRow() - 1, 3).getValues();

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 12px; }
      label { display: block; font-weight: bold; margin-bottom: 4px; }
      input, select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      .row { display: flex; gap: 10px; }
      .row .form-group { flex: 1; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
    </style>

    <h2>📊 Set Quota</h2>

    <div class="form-group">
      <label>Sales Rep</label>
      <select id="repId">
        ${reps.map(r => `<option value="${r[0]}">${r[1]}</option>`).join('')}
      </select>
    </div>

    <div class="form-group">
      <label>Annual Quota ($)</label>
      <input type="number" id="annualQuota" onchange="updateQuarterly()">
    </div>

    <div class="row">
      <div class="form-group">
        <label>Q1 Quota</label>
        <input type="number" id="q1">
      </div>
      <div class="form-group">
        <label>Q2 Quota</label>
        <input type="number" id="q2">
      </div>
    </div>

    <div class="row">
      <div class="form-group">
        <label>Q3 Quota</label>
        <input type="number" id="q3">
      </div>
      <div class="form-group">
        <label>Q4 Quota</label>
        <input type="number" id="q4">
      </div>
    </div>

    <button onclick="saveQuota()">Update Quota</button>

    <script>
      function updateQuarterly() {
        const annual = parseFloat(document.getElementById('annualQuota').value) || 0;
        const quarterly = annual / 4;
        document.getElementById('q1').value = quarterly;
        document.getElementById('q2').value = quarterly;
        document.getElementById('q3').value = quarterly;
        document.getElementById('q4').value = quarterly;
      }

      function saveQuota() {
        const data = {
          repId: document.getElementById('repId').value,
          annual: document.getElementById('annualQuota').value,
          q1: document.getElementById('q1').value,
          q2: document.getElementById('q2').value,
          q3: document.getElementById('q3').value,
          q4: document.getElementById('q4').value
        };

        google.script.run
          .withSuccessHandler(() => {
            alert('Quota updated!');
            google.script.host.close();
          })
          .updateQuota(data);
      }
    </script>
  `)
  .setWidth(400)
  .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(html, 'Set Quota');
}

function updateQuota(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.REPS);

  const allData = sheet.getRange(2, 1, sheet.getLastRow() - 1, 16).getValues();
  const rowIndex = allData.findIndex(r => r[0] === data.repId);

  if (rowIndex === -1) return;

  const row = rowIndex + 2;
  sheet.getRange(row, 8).setValue(parseFloat(data.annual));
  sheet.getRange(row, 9).setValue(parseFloat(data.q1));
  sheet.getRange(row, 10).setValue(parseFloat(data.q2));
  sheet.getRange(row, 11).setValue(parseFloat(data.q3));
  sheet.getRange(row, 12).setValue(parseFloat(data.q4));
}

// ============================================
// QUOTA ATTAINMENT
// ============================================

function viewQuotaAttainment() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const repsSheet = ss.getSheetByName(CONFIG.SHEETS.REPS);
  const dealsSheet = ss.getSheetByName(CONFIG.SHEETS.DEALS);

  if (!repsSheet || repsSheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('No sales reps found.');
    return;
  }

  const reps = repsSheet.getRange(2, 1, repsSheet.getLastRow() - 1, 16).getValues();
  const deals = dealsSheet && dealsSheet.getLastRow() > 1
    ? dealsSheet.getRange(2, 1, dealsSheet.getLastRow() - 1, 15).getValues()
    : [];

  // Calculate attainment for each rep
  const attainment = reps.map(rep => {
    const repDeals = deals.filter(d => d[1] === rep[0]);
    const totalClosed = repDeals.reduce((sum, d) => sum + (d[4] || 0), 0);
    const annualQuota = rep[7] || 1;
    const attainmentPct = (totalClosed / annualQuota) * 100;

    return {
      id: rep[0],
      name: rep[1],
      quota: annualQuota,
      closed: totalClosed,
      attainment: attainmentPct,
      dealCount: repDeals.length
    };
  });

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .rep-row { display: flex; align-items: center; padding: 12px; border-bottom: 1px solid #eee; }
      .rep-info { flex: 1; }
      .rep-name { font-weight: bold; }
      .rep-stats { font-size: 12px; color: #666; }
      .attainment { width: 80px; text-align: right; font-weight: bold; font-size: 18px; }
      .bar-container { width: 150px; height: 20px; background: #e8e8e8; border-radius: 10px; overflow: hidden; margin-left: 10px; }
      .bar { height: 100%; transition: width 0.3s; }
      .under { background: #ea4335; }
      .close { background: #fbbc04; }
      .at { background: #34a853; }
      .over { background: #1e8e3e; }
    </style>

    <h2>📊 Quota Attainment</h2>

    ${attainment.sort((a, b) => b.attainment - a.attainment).map(rep => {
      let barClass = 'under';
      if (rep.attainment >= 100) barClass = 'over';
      else if (rep.attainment >= 80) barClass = 'at';
      else if (rep.attainment >= 50) barClass = 'close';

      return `
        <div class="rep-row">
          <div class="rep-info">
            <div class="rep-name">${rep.name}</div>
            <div class="rep-stats">$${rep.closed.toLocaleString()} of $${rep.quota.toLocaleString()} (${rep.dealCount} deals)</div>
          </div>
          <div class="attainment" style="color: ${barClass === 'over' || barClass === 'at' ? '#34a853' : (barClass === 'close' ? '#fbbc04' : '#ea4335')}">${rep.attainment.toFixed(0)}%</div>
          <div class="bar-container">
            <div class="bar ${barClass}" style="width: ${Math.min(rep.attainment, 100)}%"></div>
          </div>
        </div>
      `;
    }).join('')}
  `)
  .setWidth(500)
  .setHeight(500);

  SpreadsheetApp.getUi().showModalDialog(html, 'Quota Attainment');
}

// ============================================
// PAYOUT MANAGEMENT
// ============================================

function generatePayoutReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dealsSheet = ss.getSheetByName(CONFIG.SHEETS.DEALS);

  if (!dealsSheet || dealsSheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('No deals found.');
    return;
  }

  const deals = dealsSheet.getRange(2, 1, dealsSheet.getLastRow() - 1, 15).getValues();
  const approved = deals.filter(d => d[12] === 'Approved');

  if (approved.length === 0) {
    SpreadsheetApp.getUi().alert('No approved commissions ready for payout.');
    return;
  }

  // Group by rep
  const byRep = {};
  approved.forEach(deal => {
    const repId = deal[1];
    if (!byRep[repId]) byRep[repId] = { deals: [], total: 0 };
    byRep[repId].deals.push(deal);
    byRep[repId].total += deal[11];
  });

  // Create or get payouts sheet
  let payoutsSheet = ss.getSheetByName(CONFIG.SHEETS.PAYOUTS);
  if (!payoutsSheet) {
    payoutsSheet = ss.insertSheet(CONFIG.SHEETS.PAYOUTS);
    payoutsSheet.appendRow([
      'Payout ID', 'Date', 'Rep ID', 'Rep Name', 'Deal Count',
      'Gross Amount', 'Deductions', 'Net Amount', 'Status', 'Paid Date', 'Notes'
    ]);
    payoutsSheet.getRange(1, 1, 1, 11).setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
  }

  // Generate payout records
  const payoutDate = new Date();
  let payoutCount = 0;

  Object.entries(byRep).forEach(([repId, data]) => {
    const payoutId = 'PAY-' + Utilities.formatDate(payoutDate, 'GMT', 'yyyyMMdd') + '-' + String(payoutsSheet.getLastRow()).padStart(4, '0');

    payoutsSheet.appendRow([
      payoutId,
      payoutDate,
      repId,
      '', // Would lookup rep name
      data.deals.length,
      data.total,
      0, // Deductions
      data.total,
      'Pending',
      '',
      ''
    ]);
    payoutCount++;
  });

  SpreadsheetApp.getUi().alert(`Generated ${payoutCount} payout records!\n\nTotal: $${Object.values(byRep).reduce((sum, r) => sum + r.total, 0).toLocaleString()}`);
}

function markAsPaid() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const row = sheet.getActiveRange().getRow();

  if (sheet.getName() !== CONFIG.SHEETS.PAYOUTS || row < 2) {
    SpreadsheetApp.getUi().alert('Please select a payout row in the Payouts sheet.');
    return;
  }

  sheet.getRange(row, 9).setValue('Paid');
  sheet.getRange(row, 10).setValue(new Date());
  sheet.getRange(row, 1, 1, 11).setBackground('#d9ead3');

  SpreadsheetApp.getUi().alert('Payout marked as paid!');
}

// ============================================
// LEADERBOARD
// ============================================

function showLeaderboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const repsSheet = ss.getSheetByName(CONFIG.SHEETS.REPS);
  const dealsSheet = ss.getSheetByName(CONFIG.SHEETS.DEALS);

  if (!repsSheet || !dealsSheet) {
    SpreadsheetApp.getUi().alert('Missing data sheets.');
    return;
  }

  const reps = repsSheet.getRange(2, 1, repsSheet.getLastRow() - 1, 16).getValues();
  const deals = dealsSheet.getRange(2, 1, dealsSheet.getLastRow() - 1, 15).getValues();

  // Calculate stats for each rep
  const leaderboard = reps.map(rep => {
    const repDeals = deals.filter(d => d[1] === rep[0]);
    const totalRevenue = repDeals.reduce((sum, d) => sum + (d[4] || 0), 0);
    const totalCommission = repDeals.reduce((sum, d) => sum + (d[11] || 0), 0);
    const quota = rep[7] || 1;

    return {
      name: rep[1],
      role: rep[3],
      revenue: totalRevenue,
      commission: totalCommission,
      deals: repDeals.length,
      attainment: (totalRevenue / quota) * 100
    };
  }).sort((a, b) => b.revenue - a.revenue);

  const medals = ['🥇', '🥈', '🥉'];

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
      h2 { color: white; text-align: center; }
      .leaderboard { background: white; border-radius: 12px; overflow: hidden; }
      .rep { display: flex; align-items: center; padding: 15px; border-bottom: 1px solid #eee; }
      .rank { width: 40px; font-size: 24px; text-align: center; }
      .info { flex: 1; }
      .name { font-weight: bold; font-size: 16px; }
      .role { font-size: 12px; color: #666; }
      .stats { text-align: right; }
      .revenue { font-size: 18px; font-weight: bold; color: #34a853; }
      .details { font-size: 11px; color: #666; }
      .top3 { background: linear-gradient(90deg, #fff9c4 0%, #ffffff 100%); }
    </style>

    <h2>🏆 Sales Leaderboard</h2>

    <div class="leaderboard">
      ${leaderboard.slice(0, 10).map((rep, i) => `
        <div class="rep ${i < 3 ? 'top3' : ''}">
          <div class="rank">${i < 3 ? medals[i] : (i + 1)}</div>
          <div class="info">
            <div class="name">${rep.name}</div>
            <div class="role">${rep.role} • ${rep.deals} deals</div>
          </div>
          <div class="stats">
            <div class="revenue">$${rep.revenue.toLocaleString()}</div>
            <div class="details">${rep.attainment.toFixed(0)}% quota • $${rep.commission.toLocaleString()} comm</div>
          </div>
        </div>
      `).join('')}
    </div>
  `)
  .setWidth(450)
  .setHeight(600);

  SpreadsheetApp.getUi().showModalDialog(html, 'Sales Leaderboard');
}

// ============================================
// BONUS & SPIF
// ============================================

function addBonus() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 12px; }
      label { display: block; font-weight: bold; margin-bottom: 4px; }
      input, select, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      button { background: #fbbc04; color: #333; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
    </style>

    <h2>🎁 Add Bonus</h2>

    <div class="form-group">
      <label>Rep ID or Name</label>
      <input type="text" id="repId">
    </div>

    <div class="form-group">
      <label>Bonus Type</label>
      <select id="bonusType">
        ${CONFIG.BONUS_TYPES.map(t => '<option>' + t + '</option>').join('')}
      </select>
    </div>

    <div class="form-group">
      <label>Amount ($)</label>
      <input type="number" id="amount">
    </div>

    <div class="form-group">
      <label>Reason/Description</label>
      <textarea id="reason" rows="3"></textarea>
    </div>

    <div class="form-group">
      <label>Period</label>
      <input type="text" id="period" placeholder="e.g., Q1 2024, January 2024">
    </div>

    <button onclick="saveBonus()">Add Bonus</button>

    <script>
      function saveBonus() {
        const data = {
          repId: document.getElementById('repId').value,
          bonusType: document.getElementById('bonusType').value,
          amount: document.getElementById('amount').value,
          reason: document.getElementById('reason').value,
          period: document.getElementById('period').value
        };

        google.script.run
          .withSuccessHandler(() => {
            alert('Bonus added!');
            google.script.host.close();
          })
          .saveBonusRecord(data);
      }
    </script>
  `)
  .setWidth(400)
  .setHeight(450);

  SpreadsheetApp.getUi().showModalDialog(html, 'Add Bonus');
}

function saveBonusRecord(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEETS.COMMISSIONS);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.COMMISSIONS);
    sheet.appendRow([
      'Commission ID', 'Date', 'Rep ID', 'Type', 'Amount',
      'Reason', 'Period', 'Status', 'Paid Date'
    ]);
    sheet.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
  }

  const id = 'COMM-' + String(sheet.getLastRow()).padStart(5, '0');

  sheet.appendRow([
    id,
    new Date(),
    data.repId,
    data.bonusType,
    parseFloat(data.amount),
    data.reason,
    data.period,
    'Pending',
    ''
  ]);

  // Color for bonus
  sheet.getRange(sheet.getLastRow(), 1, 1, 9).setBackground('#fff2cc');
}

function createSPIF() {
  SpreadsheetApp.getUi().alert(
    'SPIF Campaign\n\n' +
    'To create a Sales Performance Incentive Fund:\n\n' +
    '1. Define the campaign period\n' +
    '2. Set the bonus amount per qualifying deal\n' +
    '3. Define qualifying criteria\n' +
    '4. Track via the Commissions sheet\n\n' +
    'Example SPIFs:\n' +
    '- $500 per new logo closed\n' +
    '- $1000 for deals > $50k\n' +
    '- Double commission on renewals'
  );
}

function calculateAccelerators() {
  SpreadsheetApp.getUi().alert(
    'Accelerators\n\n' +
    'Commission accelerators kick in when reps exceed quota:\n\n' +
    '• 100-150% quota: 1.25x commission rate\n' +
    '• 150-200% quota: 1.5x commission rate\n' +
    '• 200%+ quota: 2x commission rate\n\n' +
    'Configure in Commission Structures sheet.'
  );
}

// ============================================
// REPORTS
// ============================================

function showRepDashboard() {
  viewQuotaAttainment();
}

function showCommissionSummary() {
  calculateCommission();
}

function quotaVsActualReport() {
  viewQuotaAttainment();
}

function viewPayoutHistory() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.PAYOUTS);

  if (sheet) {
    ss.setActiveSheet(sheet);
  } else {
    SpreadsheetApp.getUi().alert('No payout history yet. Generate payouts first.');
  }
}

function exportForPayroll() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const payoutsSheet = ss.getSheetByName(CONFIG.SHEETS.PAYOUTS);

  if (!payoutsSheet || payoutsSheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('No payouts to export.');
    return;
  }

  SpreadsheetApp.getUi().alert(
    'Export for Payroll\n\n' +
    '1. Go to the Payouts sheet\n' +
    '2. File > Download > CSV\n' +
    '3. Import into your payroll system\n\n' +
    'Columns: Payout ID, Date, Rep ID, Amount, Status'
  );

  ss.setActiveSheet(payoutsSheet);
}

// ============================================
// CONFIGURATION
// ============================================

function configureStructure() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEETS.STRUCTURES);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.STRUCTURES);
    sheet.appendRow([
      'Structure Name', 'Type', 'Base Rate', 'Tier 1 (0-50%)', 'Tier 2 (50-100%)',
      'Tier 3 (100-150%)', 'Tier 4 (150%+)', 'Cap', 'Notes'
    ]);
    sheet.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#4285f4').setFontColor('white');

    // Add default structures
    sheet.appendRow(['Standard (8%)', 'Percentage of Deal', '8%', '', '', '', '', 'None', 'Default for AEs']);
    sheet.appendRow(['Tiered', 'Tiered Percentage', '5%', '5%', '8%', '10%', '12%', 'None', 'Increases with attainment']);
    sheet.appendRow(['Enterprise (10%)', 'Percentage of Deal', '10%', '', '', '', '', 'None', 'For enterprise deals']);
    sheet.appendRow(['SDR', 'Flat Rate', '$50/meeting', '', '', '', '', '$2000/mo', 'Per qualified meeting']);
  }

  ss.setActiveSheet(sheet);
  SpreadsheetApp.getUi().alert(
    'Commission Structures\n\n' +
    'Edit this sheet to configure:\n' +
    '- Base commission rates\n' +
    '- Tiered structures\n' +
    '- Caps and accelerators\n\n' +
    'Assign structures to reps in the Sales Reps sheet.'
  );
}

function showHelp() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      h3 { color: #4285f4; border-bottom: 1px solid #eee; padding-bottom: 5px; }
      .step { margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 4px; }
    </style>

    <h2>💰 Commission Calculator Help</h2>

    <h3>Quick Start</h3>
    <div class="step">1. Add sales reps with quotas</div>
    <div class="step">2. Log deals as they close</div>
    <div class="step">3. Calculate commissions</div>
    <div class="step">4. Generate payout reports</div>

    <h3>Commission Types</h3>
    <ul>
      <li><strong>Percentage:</strong> % of deal value</li>
      <li><strong>Tiered:</strong> Rate increases with attainment</li>
      <li><strong>Flat:</strong> Fixed amount per deal/meeting</li>
      <li><strong>SPIF:</strong> Bonus campaigns</li>
    </ul>

    <h3>Workflow</h3>
    <ol>
      <li>Deal logged → Status: Pending</li>
      <li>Commission calculated → Status: Approved</li>
      <li>Payout generated → Status: Pending Payout</li>
      <li>Payment made → Status: Paid</li>
    </ol>

    <h3>Tips</h3>
    <ul>
      <li>Set quarterly quotas for accurate tracking</li>
      <li>Use accelerators to reward overperformance</li>
      <li>Run payout reports monthly</li>
      <li>Export to payroll for seamless processing</li>
    </ul>
  `)
  .setWidth(400)
  .setHeight(500);

  SpreadsheetApp.getUi().showModalDialog(html, 'Help');
}
