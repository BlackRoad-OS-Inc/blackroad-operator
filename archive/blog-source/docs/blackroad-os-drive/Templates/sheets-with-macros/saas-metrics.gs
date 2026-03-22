/**
 * BlackRoad OS - SaaS Metrics Dashboard
 * Key SaaS metrics and subscription analytics
 *
 * Features:
 * - MRR/ARR tracking
 * - Churn analysis
 * - Customer lifetime value (LTV)
 * - CAC and LTV:CAC ratio
 * - Cohort analysis
 * - Revenue recognition
 * - Subscription management
 */

const CONFIG = {
  COMPANY_NAME: 'BlackRoad OS, Inc.',

  PLANS: [
    { name: 'Starter', monthly: 29, annual: 290 },
    { name: 'Professional', monthly: 99, annual: 990 },
    { name: 'Business', monthly: 299, annual: 2990 },
    { name: 'Enterprise', monthly: 999, annual: 9990 }
  ],

  BILLING_CYCLES: ['Monthly', 'Annual'],

  SUBSCRIPTION_STATUSES: ['Active', 'Trial', 'Past Due', 'Cancelled', 'Churned', 'Paused'],

  CHURN_REASONS: [
    'Too Expensive',
    'Missing Features',
    'Switched to Competitor',
    'No Longer Needed',
    'Poor Support',
    'Technical Issues',
    'Business Closed',
    'Other'
  ],

  TARGET_LTV_CAC_RATIO: 3,
  TARGET_CHURN_RATE: 0.05, // 5% monthly
  TRIAL_LENGTH_DAYS: 14
};

/**
 * Creates custom menu on spreadsheet open
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📈 SaaS Metrics')
    .addItem('➕ Add Subscription', 'showAddSubscriptionDialog')
    .addItem('🔄 Update Subscription', 'showUpdateSubscriptionDialog')
    .addItem('❌ Record Churn', 'showRecordChurnDialog')
    .addSeparator()
    .addSubMenu(ui.createMenu('💰 Revenue')
      .addItem('Calculate MRR/ARR', 'calculateMRRARR')
      .addItem('MRR Movement', 'showMRRMovement')
      .addItem('Revenue by Plan', 'showRevenueByPlan')
      .addItem('Revenue Forecast', 'showRevenueForecast'))
    .addSeparator()
    .addSubMenu(ui.createMenu('📊 Churn Analysis')
      .addItem('Churn Rate', 'showChurnRate')
      .addItem('Churn by Reason', 'showChurnByReason')
      .addItem('Churn by Cohort', 'showChurnByCohort')
      .addItem('At-Risk Customers', 'showAtRiskCustomers'))
    .addSeparator()
    .addSubMenu(ui.createMenu('👥 Customer Metrics')
      .addItem('Customer LTV', 'calculateLTV')
      .addItem('CAC Analysis', 'showCACAnalysis')
      .addItem('LTV:CAC Ratio', 'showLTVCACRatio')
      .addItem('Cohort Analysis', 'showCohortAnalysis'))
    .addSeparator()
    .addSubMenu(ui.createMenu('📋 Reports')
      .addItem('Executive Dashboard', 'showExecutiveDashboard')
      .addItem('Monthly Metrics Report', 'generateMonthlyReport')
      .addItem('Subscription Summary', 'showSubscriptionSummary')
      .addItem('Export Metrics', 'exportMetrics'))
    .addSeparator()
    .addItem('🔔 Trial Expiring Alerts', 'showExpiringTrials')
    .addItem('⚙️ Settings', 'showSettings')
    .addToUi();
}

/**
 * Shows dialog to add new subscription
 */
function showAddSubscriptionDialog() {
  const planOptions = CONFIG.PLANS.map(p =>
    `<option value="${p.name}" data-monthly="${p.monthly}" data-annual="${p.annual}">${p.name} ($${p.monthly}/mo)</option>`
  ).join('');

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 15px; }
      label { display: block; margin-bottom: 5px; font-weight: bold; }
      input, select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      .row { display: flex; gap: 10px; }
      .row .form-group { flex: 1; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; }
      .mrr-display { background: #E8F5E9; padding: 15px; border-radius: 8px; text-align: center; margin: 15px 0; }
      .mrr-display h2 { margin: 0; color: #2E7D32; }
    </style>

    <h2>➕ Add Subscription</h2>

    <div class="form-group">
      <label>Customer Name *</label>
      <input type="text" id="customerName" placeholder="Company or individual name">
    </div>

    <div class="form-group">
      <label>Customer Email *</label>
      <input type="email" id="customerEmail" placeholder="email@company.com">
    </div>

    <div class="row">
      <div class="form-group">
        <label>Plan</label>
        <select id="plan" onchange="updateMRR()">
          ${planOptions}
        </select>
      </div>
      <div class="form-group">
        <label>Billing Cycle</label>
        <select id="billingCycle" onchange="updateMRR()">
          <option>Monthly</option>
          <option>Annual</option>
        </select>
      </div>
    </div>

    <div class="row">
      <div class="form-group">
        <label>Quantity</label>
        <input type="number" id="quantity" value="1" min="1" onchange="updateMRR()">
      </div>
      <div class="form-group">
        <label>Discount %</label>
        <input type="number" id="discount" value="0" min="0" max="100" onchange="updateMRR()">
      </div>
    </div>

    <div class="mrr-display">
      <p>Monthly Recurring Revenue</p>
      <h2 id="mrrValue">$29.00</h2>
    </div>

    <div class="row">
      <div class="form-group">
        <label>Start Date</label>
        <input type="date" id="startDate" value="${new Date().toISOString().split('T')[0]}">
      </div>
      <div class="form-group">
        <label>Status</label>
        <select id="status">
          <option>Active</option>
          <option>Trial</option>
        </select>
      </div>
    </div>

    <div class="form-group">
      <label>Source</label>
      <select id="source">
        <option>Organic</option>
        <option>Referral</option>
        <option>Paid Ads</option>
        <option>Content Marketing</option>
        <option>Sales Outbound</option>
        <option>Partner</option>
      </select>
    </div>

    <button onclick="addSubscription()">Add Subscription</button>
    <button style="background:#757575" onclick="google.script.host.close()">Cancel</button>

    <script>
      const plans = ${JSON.stringify(CONFIG.PLANS)};

      function updateMRR() {
        const planName = document.getElementById('plan').value;
        const billingCycle = document.getElementById('billingCycle').value;
        const quantity = parseInt(document.getElementById('quantity').value) || 1;
        const discount = parseFloat(document.getElementById('discount').value) || 0;

        const plan = plans.find(p => p.name === planName);
        let mrr = billingCycle === 'Annual' ? plan.annual / 12 : plan.monthly;
        mrr = mrr * quantity * (1 - discount / 100);

        document.getElementById('mrrValue').textContent = '$' + mrr.toFixed(2);
      }

      function addSubscription() {
        const data = {
          customerName: document.getElementById('customerName').value,
          customerEmail: document.getElementById('customerEmail').value,
          plan: document.getElementById('plan').value,
          billingCycle: document.getElementById('billingCycle').value,
          quantity: document.getElementById('quantity').value,
          discount: document.getElementById('discount').value,
          startDate: document.getElementById('startDate').value,
          status: document.getElementById('status').value,
          source: document.getElementById('source').value
        };

        if (!data.customerName || !data.customerEmail) {
          alert('Please fill in required fields');
          return;
        }

        google.script.run
          .withSuccessHandler(() => {
            alert('Subscription added!');
            google.script.host.close();
          })
          .withFailureHandler(err => alert('Error: ' + err))
          .addSubscription(data);
      }

      updateMRR();
    </script>
  `)
  .setWidth(450)
  .setHeight(550);

  SpreadsheetApp.getUi().showModalDialog(html, 'Add Subscription');
}

/**
 * Adds a subscription
 */
function addSubscription(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Subscriptions');

  if (!sheet) {
    sheet = ss.insertSheet('Subscriptions');
    sheet.appendRow(['Subscription ID', 'Customer Name', 'Customer Email', 'Plan', 'Billing Cycle',
                     'Quantity', 'Discount %', 'MRR', 'Start Date', 'Status', 'Source',
                     'Trial End', 'Cancelled Date', 'Churn Reason', 'Notes']);
    sheet.getRange(1, 1, 1, 15).setFontWeight('bold').setBackground('#E8EAF6');
  }

  // Calculate MRR
  const plan = CONFIG.PLANS.find(p => p.name === data.plan);
  let mrr = data.billingCycle === 'Annual' ? plan.annual / 12 : plan.monthly;
  mrr = mrr * parseInt(data.quantity) * (1 - parseFloat(data.discount) / 100);

  const subId = 'SUB-' + String(sheet.getLastRow()).padStart(5, '0');
  const startDate = new Date(data.startDate);

  // Calculate trial end if trial
  let trialEnd = '';
  if (data.status === 'Trial') {
    trialEnd = new Date(startDate.getTime() + CONFIG.TRIAL_LENGTH_DAYS * 24 * 60 * 60 * 1000);
  }

  sheet.appendRow([
    subId,
    data.customerName,
    data.customerEmail,
    data.plan,
    data.billingCycle,
    data.quantity,
    data.discount,
    mrr,
    startDate,
    data.status,
    data.source,
    trialEnd,
    '', // Cancelled date
    '', // Churn reason
    ''  // Notes
  ]);

  // Color code by status
  const newRow = sheet.getLastRow();
  if (data.status === 'Trial') {
    sheet.getRange(newRow, 1, 1, 15).setBackground('#FFF3E0');
  } else {
    sheet.getRange(newRow, 1, 1, 15).setBackground('#E8F5E9');
  }

  return subId;
}

/**
 * Shows update subscription dialog
 */
function showUpdateSubscriptionDialog() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Subscriptions');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No subscriptions found.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const activeSubscriptions = data.slice(1).filter(row =>
    row[9] === 'Active' || row[9] === 'Trial'
  );

  const subOptions = activeSubscriptions.map(row =>
    `<option value="${row[0]}">${row[0]} - ${row[1]} (${row[3]})</option>`
  ).join('');

  const planOptions = CONFIG.PLANS.map(p =>
    `<option value="${p.name}">${p.name}</option>`
  ).join('');

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 15px; }
      label { display: block; margin-bottom: 5px; font-weight: bold; }
      select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; }
    </style>

    <h2>🔄 Update Subscription</h2>

    <div class="form-group">
      <label>Select Subscription</label>
      <select id="subId">${subOptions}</select>
    </div>

    <div class="form-group">
      <label>Action</label>
      <select id="action">
        <option value="upgrade">Upgrade Plan</option>
        <option value="downgrade">Downgrade Plan</option>
        <option value="activate">Convert Trial to Active</option>
        <option value="pause">Pause Subscription</option>
      </select>
    </div>

    <div class="form-group">
      <label>New Plan (for upgrade/downgrade)</label>
      <select id="newPlan">${planOptions}</select>
    </div>

    <button onclick="updateSubscription()">Update</button>
    <button style="background:#757575" onclick="google.script.host.close()">Cancel</button>

    <script>
      function updateSubscription() {
        const data = {
          subId: document.getElementById('subId').value,
          action: document.getElementById('action').value,
          newPlan: document.getElementById('newPlan').value
        };

        google.script.run
          .withSuccessHandler(() => {
            alert('Subscription updated!');
            google.script.host.close();
          })
          .withFailureHandler(err => alert('Error: ' + err))
          .updateSubscription(data);
      }
    </script>
  `)
  .setWidth(400)
  .setHeight(350);

  SpreadsheetApp.getUi().showModalDialog(html, 'Update Subscription');
}

/**
 * Updates a subscription
 */
function updateSubscription(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Subscriptions');
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.subId) {
      if (data.action === 'activate') {
        sheet.getRange(i + 1, 10).setValue('Active');
        sheet.getRange(i + 1, 1, 1, 15).setBackground('#E8F5E9');
      } else if (data.action === 'pause') {
        sheet.getRange(i + 1, 10).setValue('Paused');
        sheet.getRange(i + 1, 1, 1, 15).setBackground('#FFF9C4');
      } else if (data.action === 'upgrade' || data.action === 'downgrade') {
        const plan = CONFIG.PLANS.find(p => p.name === data.newPlan);
        const billingCycle = rows[i][4];
        const quantity = rows[i][5];
        const discount = rows[i][6];

        let newMRR = billingCycle === 'Annual' ? plan.annual / 12 : plan.monthly;
        newMRR = newMRR * quantity * (1 - discount / 100);

        sheet.getRange(i + 1, 4).setValue(data.newPlan);
        sheet.getRange(i + 1, 8).setValue(newMRR);

        // Log MRR change
        logMRRMovement(data.subId, data.action, rows[i][7], newMRR);
      }
      break;
    }
  }
}

/**
 * Logs MRR movement
 */
function logMRRMovement(subId, type, oldMRR, newMRR) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('MRR Movement');

  if (!sheet) {
    sheet = ss.insertSheet('MRR Movement');
    sheet.appendRow(['Date', 'Subscription ID', 'Type', 'Old MRR', 'New MRR', 'Change']);
    sheet.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#E8EAF6');
  }

  sheet.appendRow([
    new Date(),
    subId,
    type,
    oldMRR,
    newMRR,
    newMRR - oldMRR
  ]);
}

/**
 * Shows record churn dialog
 */
function showRecordChurnDialog() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Subscriptions');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No subscriptions found.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const activeSubscriptions = data.slice(1).filter(row =>
    row[9] === 'Active' || row[9] === 'Trial' || row[9] === 'Past Due'
  );

  const subOptions = activeSubscriptions.map(row =>
    `<option value="${row[0]}">${row[0]} - ${row[1]} ($${row[7]}/mo)</option>`
  ).join('');

  const reasonOptions = CONFIG.CHURN_REASONS.map(r =>
    `<option>${r}</option>`
  ).join('');

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 15px; }
      label { display: block; margin-bottom: 5px; font-weight: bold; }
      select, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      textarea { height: 80px; }
      button { background: #F44336; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; }
      .warning { background: #FFEBEE; padding: 10px; border-radius: 4px; margin-bottom: 15px; border-left: 4px solid #F44336; }
    </style>

    <h2>❌ Record Churn</h2>

    <div class="warning">
      <strong>Warning:</strong> This will cancel the subscription and record it as churned.
    </div>

    <div class="form-group">
      <label>Select Subscription</label>
      <select id="subId">${subOptions}</select>
    </div>

    <div class="form-group">
      <label>Churn Reason</label>
      <select id="reason">${reasonOptions}</select>
    </div>

    <div class="form-group">
      <label>Notes</label>
      <textarea id="notes" placeholder="Additional details about why the customer churned..."></textarea>
    </div>

    <button onclick="recordChurn()">Record Churn</button>
    <button style="background:#757575" onclick="google.script.host.close()">Cancel</button>

    <script>
      function recordChurn() {
        if (!confirm('Are you sure you want to record this subscription as churned?')) return;

        const data = {
          subId: document.getElementById('subId').value,
          reason: document.getElementById('reason').value,
          notes: document.getElementById('notes').value
        };

        google.script.run
          .withSuccessHandler(() => {
            alert('Churn recorded.');
            google.script.host.close();
          })
          .withFailureHandler(err => alert('Error: ' + err))
          .recordChurn(data);
      }
    </script>
  `)
  .setWidth(400)
  .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(html, 'Record Churn');
}

/**
 * Records a churn event
 */
function recordChurn(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Subscriptions');
  const rows = sheet.getDataRange().getValues();

  let churningMRR = 0;

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.subId) {
      churningMRR = rows[i][7];
      sheet.getRange(i + 1, 10).setValue('Churned');
      sheet.getRange(i + 1, 13).setValue(new Date());
      sheet.getRange(i + 1, 14).setValue(data.reason);
      sheet.getRange(i + 1, 15).setValue(data.notes);
      sheet.getRange(i + 1, 1, 1, 15).setBackground('#FFCDD2');
      break;
    }
  }

  // Log MRR movement
  logMRRMovement(data.subId, 'churn', churningMRR, 0);

  // Log to churn tracking
  let churnSheet = ss.getSheetByName('Churn Log');
  if (!churnSheet) {
    churnSheet = ss.insertSheet('Churn Log');
    churnSheet.appendRow(['Date', 'Subscription ID', 'Customer', 'Plan', 'MRR Lost', 'Reason', 'Notes']);
    churnSheet.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#FFCDD2');
  }

  const subRow = rows.find(r => r[0] === data.subId);
  churnSheet.appendRow([
    new Date(),
    data.subId,
    subRow ? subRow[1] : '',
    subRow ? subRow[3] : '',
    churningMRR,
    data.reason,
    data.notes
  ]);
}

/**
 * Calculates MRR and ARR
 */
function calculateMRRARR() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Subscriptions');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No subscriptions found.');
    return;
  }

  const data = sheet.getDataRange().getValues();

  let totalMRR = 0;
  let activeCount = 0;
  let trialCount = 0;

  data.slice(1).forEach(row => {
    if (row[9] === 'Active') {
      totalMRR += parseFloat(row[7]) || 0;
      activeCount++;
    } else if (row[9] === 'Trial') {
      trialCount++;
    }
  });

  const arr = totalMRR * 12;
  const arpu = activeCount > 0 ? totalMRR / activeCount : 0;

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      .metric { background: #E8F5E9; padding: 20px; border-radius: 8px; margin: 10px 0; text-align: center; }
      .metric h2 { margin: 0; font-size: 32px; color: #2E7D32; }
      .metric p { margin: 5px 0 0; color: #666; }
      .secondary { background: #E3F2FD; }
      .secondary h2 { color: #1565C0; }
    </style>

    <h2>Revenue Metrics</h2>

    <div class="metric">
      <h2>$${totalMRR.toLocaleString('en-US', {minimumFractionDigits: 2})}</h2>
      <p>Monthly Recurring Revenue (MRR)</p>
    </div>

    <div class="metric">
      <h2>$${arr.toLocaleString('en-US', {minimumFractionDigits: 2})}</h2>
      <p>Annual Recurring Revenue (ARR)</p>
    </div>

    <div class="metric secondary">
      <h2>$${arpu.toLocaleString('en-US', {minimumFractionDigits: 2})}</h2>
      <p>Average Revenue Per User (ARPU)</p>
    </div>

    <div class="metric secondary">
      <h2>${activeCount}</h2>
      <p>Active Subscriptions</p>
    </div>

    <div class="metric secondary">
      <h2>${trialCount}</h2>
      <p>Trials in Progress</p>
    </div>
  `)
  .setWidth(350)
  .setHeight(500);

  SpreadsheetApp.getUi().showModalDialog(html, 'MRR / ARR');
}

/**
 * Shows MRR movement breakdown
 */
function showMRRMovement() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('MRR Movement');

  if (!sheet || sheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('No MRR movement data found.');
    return;
  }

  const data = sheet.getDataRange().getValues();

  // Get this month's movements
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  let newMRR = 0, expansion = 0, contraction = 0, churn = 0;

  data.slice(1).forEach(row => {
    const date = new Date(row[0]);
    if (date >= thisMonth) {
      const type = row[2];
      const change = parseFloat(row[5]) || 0;

      if (type === 'new') newMRR += change;
      else if (type === 'upgrade') expansion += change;
      else if (type === 'downgrade') contraction += Math.abs(change);
      else if (type === 'churn') churn += Math.abs(row[3]);
    }
  });

  const netNew = newMRR + expansion - contraction - churn;

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      .movement { display: flex; justify-content: space-between; padding: 15px; border-bottom: 1px solid #eee; }
      .movement.positive { color: #2E7D32; }
      .movement.negative { color: #C62828; }
      .total { background: #f5f5f5; padding: 15px; border-radius: 8px; margin-top: 15px; display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; }
    </style>

    <h2>MRR Movement (This Month)</h2>

    <div class="movement positive">
      <span>➕ New MRR</span>
      <span>+$${newMRR.toFixed(2)}</span>
    </div>

    <div class="movement positive">
      <span>📈 Expansion</span>
      <span>+$${expansion.toFixed(2)}</span>
    </div>

    <div class="movement negative">
      <span>📉 Contraction</span>
      <span>-$${contraction.toFixed(2)}</span>
    </div>

    <div class="movement negative">
      <span>❌ Churn</span>
      <span>-$${churn.toFixed(2)}</span>
    </div>

    <div class="total ${netNew >= 0 ? 'positive' : 'negative'}">
      <span>Net New MRR</span>
      <span>${netNew >= 0 ? '+' : ''}$${netNew.toFixed(2)}</span>
    </div>
  `)
  .setWidth(350)
  .setHeight(350);

  SpreadsheetApp.getUi().showModalDialog(html, 'MRR Movement');
}

/**
 * Shows revenue by plan
 */
function showRevenueByPlan() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Subscriptions');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No subscriptions found.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const byPlan = {};

  CONFIG.PLANS.forEach(p => byPlan[p.name] = { count: 0, mrr: 0 });

  data.slice(1).forEach(row => {
    if (row[9] === 'Active' && byPlan[row[3]]) {
      byPlan[row[3]].count++;
      byPlan[row[3]].mrr += parseFloat(row[7]) || 0;
    }
  });

  const totalMRR = Object.values(byPlan).reduce((sum, p) => sum + p.mrr, 0);

  let html = '<style>body{font-family:Arial,sans-serif;padding:15px;} .plan{margin:15px 0;} .plan-header{display:flex;justify-content:space-between;margin-bottom:5px;} .bar{background:#E0E0E0;height:30px;border-radius:4px;overflow:hidden;} .bar-fill{height:100%;display:flex;align-items:center;padding-left:10px;color:white;font-weight:bold;}</style>';

  html += '<h2>Revenue by Plan</h2>';

  const colors = ['#4CAF50', '#2196F3', '#9C27B0', '#FF9800'];

  Object.entries(byPlan).forEach(([plan, stats], i) => {
    const pct = totalMRR > 0 ? (stats.mrr / totalMRR * 100) : 0;
    html += `
      <div class="plan">
        <div class="plan-header">
          <span><strong>${plan}</strong> (${stats.count} customers)</span>
          <span>$${stats.mrr.toFixed(2)}/mo (${pct.toFixed(1)}%)</span>
        </div>
        <div class="bar">
          <div class="bar-fill" style="width:${pct}%;background:${colors[i % colors.length]}">${stats.count}</div>
        </div>
      </div>
    `;
  });

  html += `<p><strong>Total MRR:</strong> $${totalMRR.toFixed(2)}</p>`;

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(450)
    .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(output, 'Revenue by Plan');
}

/**
 * Shows revenue forecast
 */
function showRevenueForecast() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Subscriptions');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No subscriptions found.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  let currentMRR = 0;

  data.slice(1).forEach(row => {
    if (row[9] === 'Active') {
      currentMRR += parseFloat(row[7]) || 0;
    }
  });

  // Simple forecast assuming 5% growth and 5% churn
  const growthRate = 0.05;
  const churnRate = 0.05;
  const netGrowth = growthRate - churnRate;

  const forecast = [];
  let mrr = currentMRR;

  for (let i = 0; i < 12; i++) {
    const month = new Date();
    month.setMonth(month.getMonth() + i);
    forecast.push({
      month: month.toLocaleString('default', { month: 'short', year: 'numeric' }),
      mrr: mrr,
      arr: mrr * 12
    });
    mrr = mrr * (1 + netGrowth);
  }

  let html = '<style>body{font-family:Arial,sans-serif;padding:15px;} table{width:100%;border-collapse:collapse;} th,td{border:1px solid #ddd;padding:10px;text-align:right;} th{background:#E8EAF6;text-align:left;}</style>';

  html += '<h2>12-Month Revenue Forecast</h2>';
  html += '<p><em>Assuming ' + (growthRate * 100) + '% growth and ' + (churnRate * 100) + '% churn</em></p>';
  html += '<table><tr><th>Month</th><th>MRR</th><th>ARR</th></tr>';

  forecast.forEach(f => {
    html += `<tr><td>${f.month}</td><td>$${f.mrr.toLocaleString('en-US', {minimumFractionDigits: 2})}</td><td>$${f.arr.toLocaleString('en-US', {minimumFractionDigits: 2})}</td></tr>`;
  });

  html += '</table>';

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(450)
    .setHeight(450);

  SpreadsheetApp.getUi().showModalDialog(output, 'Revenue Forecast');
}

/**
 * Shows churn rate
 */
function showChurnRate() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const subSheet = ss.getSheetByName('Subscriptions');
  const churnSheet = ss.getSheetByName('Churn Log');

  if (!subSheet) {
    SpreadsheetApp.getUi().alert('No subscriptions found.');
    return;
  }

  const subData = subSheet.getDataRange().getValues();

  // Count active and churned this month
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  let activeCount = 0;
  let churnedCount = 0;
  let churnedMRR = 0;
  let totalMRR = 0;

  subData.slice(1).forEach(row => {
    if (row[9] === 'Active') {
      activeCount++;
      totalMRR += parseFloat(row[7]) || 0;
    }
  });

  if (churnSheet) {
    const churnData = churnSheet.getDataRange().getValues();
    churnData.slice(1).forEach(row => {
      const date = new Date(row[0]);
      if (date >= thisMonth) {
        churnedCount++;
        churnedMRR += parseFloat(row[4]) || 0;
      }
    });
  }

  const totalCustomers = activeCount + churnedCount;
  const customerChurnRate = totalCustomers > 0 ? (churnedCount / totalCustomers * 100) : 0;
  const revenueChurnRate = (totalMRR + churnedMRR) > 0 ? (churnedMRR / (totalMRR + churnedMRR) * 100) : 0;

  const targetChurnRate = CONFIG.TARGET_CHURN_RATE * 100;

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      .metric { padding: 20px; border-radius: 8px; margin: 10px 0; text-align: center; }
      .metric h2 { margin: 0; font-size: 36px; }
      .metric p { margin: 5px 0 0; }
      .good { background: #E8F5E9; color: #2E7D32; }
      .bad { background: #FFEBEE; color: #C62828; }
      .target { background: #E3F2FD; padding: 10px; border-radius: 4px; margin-top: 20px; }
    </style>

    <h2>Churn Rate (This Month)</h2>

    <div class="metric ${customerChurnRate <= targetChurnRate ? 'good' : 'bad'}">
      <h2>${customerChurnRate.toFixed(2)}%</h2>
      <p>Customer Churn Rate</p>
      <small>${churnedCount} of ${totalCustomers} customers</small>
    </div>

    <div class="metric ${revenueChurnRate <= targetChurnRate ? 'good' : 'bad'}">
      <h2>${revenueChurnRate.toFixed(2)}%</h2>
      <p>Revenue Churn Rate</p>
      <small>$${churnedMRR.toFixed(2)} MRR lost</small>
    </div>

    <div class="target">
      <strong>Target:</strong> < ${targetChurnRate}% monthly churn
    </div>
  `)
  .setWidth(350)
  .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(html, 'Churn Rate');
}

/**
 * Shows churn by reason
 */
function showChurnByReason() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Churn Log');

  if (!sheet || sheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('No churn data found.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const byReason = {};

  data.slice(1).forEach(row => {
    const reason = row[5] || 'Unknown';
    if (!byReason[reason]) byReason[reason] = { count: 0, mrr: 0 };
    byReason[reason].count++;
    byReason[reason].mrr += parseFloat(row[4]) || 0;
  });

  const totalChurned = Object.values(byReason).reduce((sum, r) => sum + r.count, 0);

  let html = '<style>body{font-family:Arial,sans-serif;padding:15px;} .reason{display:flex;justify-content:space-between;padding:10px;border-bottom:1px solid #eee;} .bar{background:#FFCDD2;height:20px;border-radius:4px;margin-top:5px;}</style>';

  html += '<h2>Churn by Reason</h2>';

  Object.entries(byReason)
    .sort((a, b) => b[1].count - a[1].count)
    .forEach(([reason, stats]) => {
      const pct = (stats.count / totalChurned * 100).toFixed(1);
      html += `
        <div class="reason">
          <div>
            <strong>${reason}</strong>
            <div class="bar" style="width:${pct}%"></div>
          </div>
          <div style="text-align:right">
            <strong>${stats.count}</strong> (${pct}%)<br>
            <small>$${stats.mrr.toFixed(2)} lost</small>
          </div>
        </div>
      `;
    });

  html += `<p><strong>Total Churned:</strong> ${totalChurned}</p>`;

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(450)
    .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(output, 'Churn by Reason');
}

/**
 * Shows churn by cohort
 */
function showChurnByCohort() {
  SpreadsheetApp.getUi().alert(
    'Cohort Analysis\n\n' +
    'To view churn by cohort:\n' +
    '1. Group customers by sign-up month\n' +
    '2. Track retention over time\n\n' +
    'Use the Cohort Analysis feature for detailed breakdown.'
  );
}

/**
 * Shows at-risk customers
 */
function showAtRiskCustomers() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Subscriptions');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No subscriptions found.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const atRisk = data.slice(1).filter(row =>
    row[9] === 'Past Due' || row[9] === 'Paused'
  );

  if (atRisk.length === 0) {
    SpreadsheetApp.getUi().alert('No at-risk customers found!');
    return;
  }

  let html = '<style>body{font-family:Arial,sans-serif;padding:15px;} .customer{background:#FFF3E0;padding:15px;margin:10px 0;border-radius:8px;border-left:4px solid #FF9800;}</style>';

  html += `<h2>⚠️ At-Risk Customers (${atRisk.length})</h2>`;

  atRisk.forEach(row => {
    html += `
      <div class="customer">
        <strong>${row[1]}</strong> (${row[0]})<br>
        <small>Status: ${row[9]} | Plan: ${row[3]} | MRR: $${row[7]}</small>
      </div>
    `;
  });

  const totalAtRiskMRR = atRisk.reduce((sum, r) => sum + (parseFloat(r[7]) || 0), 0);
  html += `<p><strong>Total At-Risk MRR:</strong> $${totalAtRiskMRR.toFixed(2)}</p>`;

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(450)
    .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(output, 'At-Risk Customers');
}

/**
 * Calculates customer LTV
 */
function calculateLTV() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Subscriptions');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No subscriptions found.');
    return;
  }

  const data = sheet.getDataRange().getValues();

  let totalMRR = 0;
  let activeCount = 0;

  data.slice(1).forEach(row => {
    if (row[9] === 'Active') {
      totalMRR += parseFloat(row[7]) || 0;
      activeCount++;
    }
  });

  const arpu = activeCount > 0 ? totalMRR / activeCount : 0;
  const churnRate = CONFIG.TARGET_CHURN_RATE; // Using target as estimate
  const avgLifetimeMonths = churnRate > 0 ? 1 / churnRate : 0;
  const ltv = arpu * avgLifetimeMonths;

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      .metric { background: #E3F2FD; padding: 20px; border-radius: 8px; margin: 10px 0; text-align: center; }
      .metric h2 { margin: 0; font-size: 32px; color: #1565C0; }
      .metric p { margin: 5px 0 0; }
      .formula { background: #FFF9C4; padding: 15px; border-radius: 8px; margin-top: 20px; font-family: monospace; }
    </style>

    <h2>Customer Lifetime Value</h2>

    <div class="metric">
      <h2>$${ltv.toFixed(2)}</h2>
      <p>Average LTV</p>
    </div>

    <div class="metric">
      <h2>$${arpu.toFixed(2)}</h2>
      <p>ARPU (Monthly)</p>
    </div>

    <div class="metric">
      <h2>${avgLifetimeMonths.toFixed(1)} months</h2>
      <p>Average Customer Lifetime</p>
    </div>

    <div class="formula">
      <strong>LTV Formula:</strong><br>
      LTV = ARPU / Churn Rate<br>
      LTV = $${arpu.toFixed(2)} / ${(churnRate * 100).toFixed(1)}%<br>
      <strong>LTV = $${ltv.toFixed(2)}</strong>
    </div>
  `)
  .setWidth(350)
  .setHeight(450);

  SpreadsheetApp.getUi().showModalDialog(html, 'Customer LTV');
}

/**
 * Shows CAC analysis
 */
function showCACAnalysis() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    'CAC Analysis',
    'Enter total marketing/sales spend this month ($):',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const spend = parseFloat(response.getResponseText()) || 0;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Subscriptions');

  if (!sheet) {
    ui.alert('No subscriptions found.');
    return;
  }

  // Count new customers this month
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const data = sheet.getDataRange().getValues();
  let newCustomers = 0;

  data.slice(1).forEach(row => {
    const startDate = new Date(row[8]);
    if (startDate >= thisMonth && row[9] === 'Active') {
      newCustomers++;
    }
  });

  const cac = newCustomers > 0 ? spend / newCustomers : 0;

  ui.alert(
    'CAC Analysis\n\n' +
    'Marketing/Sales Spend: $' + spend.toFixed(2) + '\n' +
    'New Customers: ' + newCustomers + '\n\n' +
    'Customer Acquisition Cost (CAC): $' + cac.toFixed(2)
  );
}

/**
 * Shows LTV:CAC ratio
 */
function showLTVCACRatio() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    'LTV:CAC Ratio',
    'Enter your current CAC ($):',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const cac = parseFloat(response.getResponseText()) || 0;

  // Calculate LTV
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Subscriptions');

  const data = sheet.getDataRange().getValues();
  let totalMRR = 0;
  let activeCount = 0;

  data.slice(1).forEach(row => {
    if (row[9] === 'Active') {
      totalMRR += parseFloat(row[7]) || 0;
      activeCount++;
    }
  });

  const arpu = activeCount > 0 ? totalMRR / activeCount : 0;
  const ltv = arpu / CONFIG.TARGET_CHURN_RATE;
  const ratio = cac > 0 ? ltv / cac : 0;

  const isHealthy = ratio >= CONFIG.TARGET_LTV_CAC_RATIO;

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      .ratio { text-align: center; padding: 30px; border-radius: 8px; margin: 20px 0; }
      .ratio h1 { margin: 0; font-size: 48px; }
      .good { background: #E8F5E9; color: #2E7D32; }
      .bad { background: #FFEBEE; color: #C62828; }
      .details { background: #f5f5f5; padding: 15px; border-radius: 8px; }
      .target { margin-top: 20px; padding: 10px; background: #E3F2FD; border-radius: 4px; }
    </style>

    <h2>LTV:CAC Ratio</h2>

    <div class="ratio ${isHealthy ? 'good' : 'bad'}">
      <h1>${ratio.toFixed(2)}:1</h1>
      <p>${isHealthy ? '✅ Healthy' : '⚠️ Below Target'}</p>
    </div>

    <div class="details">
      <p><strong>LTV:</strong> $${ltv.toFixed(2)}</p>
      <p><strong>CAC:</strong> $${cac.toFixed(2)}</p>
    </div>

    <div class="target">
      <strong>Target:</strong> ${CONFIG.TARGET_LTV_CAC_RATIO}:1 or higher<br>
      <small>A ratio of 3:1 or higher indicates healthy unit economics</small>
    </div>
  `)
  .setWidth(350)
  .setHeight(400);

  ui.showModalDialog(html, 'LTV:CAC Ratio');
}

/**
 * Shows cohort analysis
 */
function showCohortAnalysis() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Subscriptions');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No subscriptions found.');
    return;
  }

  const data = sheet.getDataRange().getValues();

  // Group by signup month
  const cohorts = {};

  data.slice(1).forEach(row => {
    const startDate = new Date(row[8]);
    if (isNaN(startDate)) return;

    const cohortKey = startDate.toLocaleString('default', { month: 'short', year: 'numeric' });

    if (!cohorts[cohortKey]) {
      cohorts[cohortKey] = { total: 0, active: 0, churned: 0 };
    }

    cohorts[cohortKey].total++;
    if (row[9] === 'Active') cohorts[cohortKey].active++;
    else if (row[9] === 'Churned') cohorts[cohortKey].churned++;
  });

  let html = '<style>body{font-family:Arial,sans-serif;padding:15px;} table{width:100%;border-collapse:collapse;} th,td{border:1px solid #ddd;padding:8px;text-align:center;} th{background:#E8EAF6;}</style>';

  html += '<h2>Cohort Analysis</h2>';
  html += '<table><tr><th>Cohort</th><th>Total</th><th>Active</th><th>Churned</th><th>Retention</th></tr>';

  Object.entries(cohorts)
    .sort((a, b) => new Date(b[0]) - new Date(a[0]))
    .slice(0, 12)
    .forEach(([cohort, stats]) => {
      const retention = stats.total > 0 ? ((stats.active / stats.total) * 100).toFixed(1) : 0;
      const color = retention >= 80 ? '#E8F5E9' : retention >= 60 ? '#FFF9C4' : '#FFEBEE';
      html += `<tr style="background:${color}">
        <td>${cohort}</td>
        <td>${stats.total}</td>
        <td>${stats.active}</td>
        <td>${stats.churned}</td>
        <td>${retention}%</td>
      </tr>`;
    });

  html += '</table>';

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(500)
    .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(output, 'Cohort Analysis');
}

/**
 * Shows executive dashboard
 */
function showExecutiveDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Subscriptions');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No subscriptions found.');
    return;
  }

  const data = sheet.getDataRange().getValues();

  let totalMRR = 0;
  let activeCount = 0;
  let trialCount = 0;

  data.slice(1).forEach(row => {
    if (row[9] === 'Active') {
      totalMRR += parseFloat(row[7]) || 0;
      activeCount++;
    } else if (row[9] === 'Trial') {
      trialCount++;
    }
  });

  const arr = totalMRR * 12;
  const arpu = activeCount > 0 ? totalMRR / activeCount : 0;
  const ltv = arpu / CONFIG.TARGET_CHURN_RATE;

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 0; }
      .header { background: #1976D2; color: white; padding: 20px; }
      .header h1 { margin: 0; }
      .header p { margin: 5px 0 0; opacity: 0.8; }
      .metrics { display: flex; flex-wrap: wrap; padding: 15px; }
      .metric { flex: 1; min-width: 120px; background: #f5f5f5; padding: 15px; margin: 5px; border-radius: 8px; text-align: center; }
      .metric h2 { margin: 0; color: #1976D2; }
      .metric p { margin: 5px 0 0; font-size: 12px; color: #666; }
      .highlight { background: #E8F5E9; }
      .highlight h2 { color: #2E7D32; }
    </style>

    <div class="header">
      <h1>SaaS Executive Dashboard</h1>
      <p>${CONFIG.COMPANY_NAME} | ${new Date().toLocaleDateString()}</p>
    </div>

    <div class="metrics">
      <div class="metric highlight">
        <h2>$${totalMRR.toLocaleString('en-US', {minimumFractionDigits: 0})}</h2>
        <p>MRR</p>
      </div>
      <div class="metric highlight">
        <h2>$${arr.toLocaleString('en-US', {minimumFractionDigits: 0})}</h2>
        <p>ARR</p>
      </div>
      <div class="metric">
        <h2>${activeCount}</h2>
        <p>Active Customers</p>
      </div>
      <div class="metric">
        <h2>${trialCount}</h2>
        <p>Trials</p>
      </div>
      <div class="metric">
        <h2>$${arpu.toFixed(0)}</h2>
        <p>ARPU</p>
      </div>
      <div class="metric">
        <h2>$${ltv.toFixed(0)}</h2>
        <p>LTV</p>
      </div>
    </div>
  `)
  .setWidth(450)
  .setHeight(350);

  SpreadsheetApp.getUi().showModalDialog(html, 'Executive Dashboard');
}

/**
 * Generates monthly report
 */
function generateMonthlyReport() {
  SpreadsheetApp.getUi().alert(
    'Monthly Metrics Report\n\n' +
    'To generate a monthly report:\n' +
    '1. Use the Executive Dashboard for current metrics\n' +
    '2. Export data via File > Download\n' +
    '3. Or create a scheduled trigger for automated reports'
  );
}

/**
 * Shows subscription summary
 */
function showSubscriptionSummary() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Subscriptions');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No subscriptions found.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const byStatus = {};

  CONFIG.SUBSCRIPTION_STATUSES.forEach(s => byStatus[s] = 0);

  data.slice(1).forEach(row => {
    const status = row[9];
    if (byStatus[status] !== undefined) {
      byStatus[status]++;
    }
  });

  const total = data.length - 1;

  let html = '<style>body{font-family:Arial,sans-serif;padding:15px;} .status{display:flex;justify-content:space-between;padding:12px;border-bottom:1px solid #eee;} .count{font-weight:bold;}</style>';

  html += '<h2>Subscription Summary</h2>';

  const colors = {
    'Active': '#4CAF50',
    'Trial': '#FF9800',
    'Past Due': '#F44336',
    'Cancelled': '#9E9E9E',
    'Churned': '#E91E63',
    'Paused': '#2196F3'
  };

  Object.entries(byStatus).forEach(([status, count]) => {
    const pct = total > 0 ? (count / total * 100).toFixed(1) : 0;
    html += `
      <div class="status">
        <span style="color:${colors[status] || '#000'}">${status}</span>
        <span class="count">${count} (${pct}%)</span>
      </div>
    `;
  });

  html += `<p style="margin-top:20px"><strong>Total:</strong> ${total}</p>`;

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(350)
    .setHeight(350);

  SpreadsheetApp.getUi().showModalDialog(output, 'Subscription Summary');
}

/**
 * Exports metrics
 */
function exportMetrics() {
  SpreadsheetApp.getUi().alert(
    'Export Metrics\n\n' +
    'Use File > Download to export:\n' +
    '- Microsoft Excel (.xlsx)\n' +
    '- PDF Document\n' +
    '- CSV (for specific sheet)'
  );
}

/**
 * Shows expiring trials
 */
function showExpiringTrials() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Subscriptions');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No subscriptions found.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const expiringTrials = data.slice(1).filter(row => {
    if (row[9] !== 'Trial') return false;
    const trialEnd = new Date(row[11]);
    return trialEnd >= today && trialEnd <= nextWeek;
  });

  if (expiringTrials.length === 0) {
    SpreadsheetApp.getUi().alert('No trials expiring in the next 7 days.');
    return;
  }

  let html = '<style>body{font-family:Arial,sans-serif;padding:15px;} .trial{background:#FFF3E0;padding:15px;margin:10px 0;border-radius:8px;border-left:4px solid #FF9800;}</style>';

  html += `<h2>🔔 Trials Expiring Soon (${expiringTrials.length})</h2>`;

  expiringTrials.forEach(row => {
    const daysLeft = Math.ceil((new Date(row[11]) - today) / (1000 * 60 * 60 * 24));
    html += `
      <div class="trial">
        <strong>${row[1]}</strong><br>
        <small>${row[2]} | ${row[3]} plan</small><br>
        <strong style="color:#E65100">${daysLeft} days left</strong>
      </div>
    `;
  });

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(400)
    .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(output, 'Expiring Trials');
}

/**
 * Shows settings
 */
function showSettings() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .setting { margin-bottom: 15px; }
      label { display: block; font-weight: bold; margin-bottom: 5px; }
      input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
    </style>

    <h2>⚙️ Settings</h2>

    <div class="setting">
      <label>Plans</label>
      <input type="text" value="${CONFIG.PLANS.map(p => p.name).join(', ')}" disabled>
    </div>

    <div class="setting">
      <label>Trial Length (days)</label>
      <input type="number" value="${CONFIG.TRIAL_LENGTH_DAYS}" disabled>
    </div>

    <div class="setting">
      <label>Target LTV:CAC Ratio</label>
      <input type="number" value="${CONFIG.TARGET_LTV_CAC_RATIO}" disabled>
    </div>

    <div class="setting">
      <label>Target Monthly Churn Rate</label>
      <input type="text" value="${(CONFIG.TARGET_CHURN_RATE * 100).toFixed(1)}%" disabled>
    </div>

    <p><em>Edit CONFIG in Extensions > Apps Script to customize.</em></p>

    <button onclick="google.script.host.close()">Close</button>
  `)
  .setWidth(350)
  .setHeight(350);

  SpreadsheetApp.getUi().showModalDialog(html, 'Settings');
}
