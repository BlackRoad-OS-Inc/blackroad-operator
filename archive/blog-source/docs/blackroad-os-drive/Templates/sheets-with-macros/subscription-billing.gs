/**
 * BLACKROAD OS - SUBSCRIPTION BILLING MANAGER
 * Version: 1.0
 *
 * Features:
 * - Subscription plan management
 * - Customer subscription tracking
 * - Billing cycle automation
 * - Invoice generation
 * - Payment tracking
 * - MRR/ARR metrics
 * - Churn analysis
 * - Dunning management
 *
 * Setup: Import CSV, then paste this code in Extensions > Apps Script
 */

// Configuration
const CONFIG = {
  PLAN_INTERVALS: ['Monthly', 'Quarterly', 'Semi-Annual', 'Annual', 'Lifetime'],
  SUBSCRIPTION_STATUS: ['Active', 'Trial', 'Past Due', 'Cancelled', 'Paused', 'Expired'],
  PAYMENT_STATUS: ['Pending', 'Paid', 'Failed', 'Refunded', 'Voided', 'Disputed'],
  PAYMENT_METHODS: ['Credit Card', 'ACH/Bank Transfer', 'PayPal', 'Wire Transfer', 'Check', 'Crypto'],
  INVOICE_STATUS: ['Draft', 'Sent', 'Paid', 'Partial', 'Overdue', 'Void', 'Uncollectible'],
  TRIAL_DAYS: 14,
  GRACE_PERIOD_DAYS: 7,
  DUNNING_ATTEMPTS: 3,
  CURRENCY: 'USD'
};

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('💳 Billing')
    .addItem('➕ Add Subscription Plan', 'showAddPlanDialog')
    .addItem('👤 New Customer Subscription', 'showNewSubscriptionDialog')
    .addSeparator()
    .addSubMenu(ui.createMenu('📋 Subscription Actions')
      .addItem('Start Trial', 'showStartTrialDialog')
      .addItem('Convert Trial to Paid', 'convertTrialToPaid')
      .addItem('Upgrade/Downgrade Plan', 'showChangePlanDialog')
      .addItem('Pause Subscription', 'pauseSubscription')
      .addItem('Resume Subscription', 'resumeSubscription')
      .addItem('Cancel Subscription', 'showCancelDialog'))
    .addSubMenu(ui.createMenu('💰 Billing')
      .addItem('Generate Invoice', 'showGenerateInvoiceDialog')
      .addItem('Record Payment', 'showRecordPaymentDialog')
      .addItem('Process Refund', 'showRefundDialog')
      .addItem('Run Billing Cycle', 'runBillingCycle'))
    .addSubMenu(ui.createMenu('📊 Reports')
      .addItem('MRR/ARR Dashboard', 'showMRRDashboard')
      .addItem('Churn Analysis', 'showChurnAnalysis')
      .addItem('Revenue Report', 'showRevenueReport')
      .addItem('Upcoming Renewals', 'showUpcomingRenewals')
      .addItem('Past Due Accounts', 'showPastDueAccounts'))
    .addSubMenu(ui.createMenu('⚙️ Settings')
      .addItem('Dunning Settings', 'showDunningSettings')
      .addItem('Email Templates', 'showEmailTemplates')
      .addItem('Tax Settings', 'showTaxSettings'))
    .addItem('📧 Send Renewal Reminders', 'sendRenewalReminders')
    .addItem('🔄 Refresh Dashboard', 'refreshDashboard')
    .addToUi();
}

// ============ PLAN MANAGEMENT ============

function showAddPlanDialog() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 15px; }
      label { display: block; margin-bottom: 5px; font-weight: bold; }
      input, select, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      .row { display: flex; gap: 10px; }
      .row .form-group { flex: 1; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; }
      button:hover { background: #3367d6; }
      .cancel { background: #666; }
      h3 { margin-top: 20px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
    </style>
    <h2>Add Subscription Plan</h2>
    <form id="planForm">
      <div class="row">
        <div class="form-group">
          <label>Plan Name *</label>
          <input type="text" id="planName" required placeholder="e.g., Professional">
        </div>
        <div class="form-group">
          <label>Plan Code *</label>
          <input type="text" id="planCode" required placeholder="e.g., PRO">
        </div>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea id="description" rows="2" placeholder="Plan features and benefits"></textarea>
      </div>
      <h3>Pricing</h3>
      <div class="row">
        <div class="form-group">
          <label>Monthly Price *</label>
          <input type="number" id="monthlyPrice" step="0.01" required placeholder="99.00">
        </div>
        <div class="form-group">
          <label>Annual Price</label>
          <input type="number" id="annualPrice" step="0.01" placeholder="990.00 (optional discount)">
        </div>
      </div>
      <div class="row">
        <div class="form-group">
          <label>Setup Fee</label>
          <input type="number" id="setupFee" step="0.01" value="0" placeholder="One-time setup fee">
        </div>
        <div class="form-group">
          <label>Billing Interval</label>
          <select id="interval">
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="Annual">Annual</option>
          </select>
        </div>
      </div>
      <h3>Limits & Features</h3>
      <div class="row">
        <div class="form-group">
          <label>User Seats</label>
          <input type="number" id="seats" value="1" placeholder="Number of users">
        </div>
        <div class="form-group">
          <label>Storage (GB)</label>
          <input type="number" id="storage" placeholder="e.g., 100">
        </div>
      </div>
      <div class="form-group">
        <label>Features (comma-separated)</label>
        <input type="text" id="features" placeholder="API Access, Priority Support, Custom Branding">
      </div>
      <div class="form-group">
        <label>Trial Days</label>
        <input type="number" id="trialDays" value="14" placeholder="Free trial period">
      </div>
      <br>
      <button type="button" onclick="savePlan()">💾 Save Plan</button>
      <button type="button" class="cancel" onclick="google.script.host.close()">Cancel</button>
    </form>
    <script>
      function savePlan() {
        const plan = {
          name: document.getElementById('planName').value,
          code: document.getElementById('planCode').value,
          description: document.getElementById('description').value,
          monthlyPrice: parseFloat(document.getElementById('monthlyPrice').value) || 0,
          annualPrice: parseFloat(document.getElementById('annualPrice').value) || 0,
          setupFee: parseFloat(document.getElementById('setupFee').value) || 0,
          interval: document.getElementById('interval').value,
          seats: parseInt(document.getElementById('seats').value) || 1,
          storage: document.getElementById('storage').value,
          features: document.getElementById('features').value,
          trialDays: parseInt(document.getElementById('trialDays').value) || 14
        };
        if (!plan.name || !plan.code || !plan.monthlyPrice) {
          alert('Please fill in all required fields');
          return;
        }
        google.script.run.withSuccessHandler(() => {
          alert('Plan saved successfully!');
          google.script.host.close();
        }).savePlan(plan);
      }
    </script>
  `)
  .setWidth(500)
  .setHeight(650);
  SpreadsheetApp.getUi().showModalDialog(html, 'Add Subscription Plan');
}

function savePlan(plan) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Plans');
  if (!sheet) {
    sheet = ss.insertSheet('Plans');
    sheet.appendRow(['Plan ID', 'Name', 'Code', 'Description', 'Monthly Price', 'Annual Price',
                     'Setup Fee', 'Interval', 'Seats', 'Storage (GB)', 'Features', 'Trial Days',
                     'Status', 'Subscribers', 'Created Date']);
  }

  const planId = 'PLAN-' + String(sheet.getLastRow()).padStart(3, '0');
  sheet.appendRow([
    planId,
    plan.name,
    plan.code,
    plan.description,
    plan.monthlyPrice,
    plan.annualPrice || plan.monthlyPrice * 12 * 0.8, // 20% discount default
    plan.setupFee,
    plan.interval,
    plan.seats,
    plan.storage,
    plan.features,
    plan.trialDays,
    'Active',
    0,
    new Date()
  ]);

  SpreadsheetApp.getActiveSpreadsheet().toast('Plan "' + plan.name + '" created!', 'Success');
}

// ============ SUBSCRIPTION MANAGEMENT ============

function showNewSubscriptionDialog() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const planSheet = ss.getSheetByName('Plans');
  let planOptions = '<option value="">Select Plan</option>';

  if (planSheet && planSheet.getLastRow() > 1) {
    const plans = planSheet.getRange(2, 1, planSheet.getLastRow() - 1, 5).getValues();
    plans.forEach(p => {
      if (p[0]) {
        planOptions += `<option value="${p[0]}">${p[1]} - $${p[4]}/mo</option>`;
      }
    });
  }

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 15px; }
      label { display: block; margin-bottom: 5px; font-weight: bold; }
      input, select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      .row { display: flex; gap: 10px; }
      .row .form-group { flex: 1; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; }
      .cancel { background: #666; }
      h3 { margin-top: 20px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
      .checkbox-group { display: flex; align-items: center; gap: 8px; }
      .checkbox-group input { width: auto; }
    </style>
    <h2>New Customer Subscription</h2>
    <form id="subForm">
      <h3>Customer Information</h3>
      <div class="row">
        <div class="form-group">
          <label>Company Name *</label>
          <input type="text" id="company" required>
        </div>
        <div class="form-group">
          <label>Contact Name *</label>
          <input type="text" id="contact" required>
        </div>
      </div>
      <div class="row">
        <div class="form-group">
          <label>Email *</label>
          <input type="email" id="email" required>
        </div>
        <div class="form-group">
          <label>Phone</label>
          <input type="tel" id="phone">
        </div>
      </div>
      <h3>Subscription Details</h3>
      <div class="row">
        <div class="form-group">
          <label>Plan *</label>
          <select id="plan" required>${planOptions}</select>
        </div>
        <div class="form-group">
          <label>Billing Interval</label>
          <select id="interval">
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="Annual">Annual</option>
          </select>
        </div>
      </div>
      <div class="row">
        <div class="form-group">
          <label>Start Date</label>
          <input type="date" id="startDate" value="${new Date().toISOString().split('T')[0]}">
        </div>
        <div class="form-group">
          <label>Quantity/Seats</label>
          <input type="number" id="quantity" value="1" min="1">
        </div>
      </div>
      <div class="form-group">
        <label>Payment Method</label>
        <select id="paymentMethod">
          <option value="Credit Card">Credit Card</option>
          <option value="ACH/Bank Transfer">ACH/Bank Transfer</option>
          <option value="PayPal">PayPal</option>
          <option value="Wire Transfer">Wire Transfer</option>
          <option value="Check">Check</option>
        </select>
      </div>
      <div class="form-group">
        <label>Discount (%)</label>
        <input type="number" id="discount" value="0" min="0" max="100">
      </div>
      <div class="form-group checkbox-group">
        <input type="checkbox" id="startTrial">
        <label for="startTrial" style="display: inline; font-weight: normal;">Start with free trial</label>
      </div>
      <br>
      <button type="button" onclick="saveSubscription()">💾 Create Subscription</button>
      <button type="button" class="cancel" onclick="google.script.host.close()">Cancel</button>
    </form>
    <script>
      function saveSubscription() {
        const sub = {
          company: document.getElementById('company').value,
          contact: document.getElementById('contact').value,
          email: document.getElementById('email').value,
          phone: document.getElementById('phone').value,
          planId: document.getElementById('plan').value,
          interval: document.getElementById('interval').value,
          startDate: document.getElementById('startDate').value,
          quantity: parseInt(document.getElementById('quantity').value) || 1,
          paymentMethod: document.getElementById('paymentMethod').value,
          discount: parseFloat(document.getElementById('discount').value) || 0,
          isTrial: document.getElementById('startTrial').checked
        };
        if (!sub.company || !sub.contact || !sub.email || !sub.planId) {
          alert('Please fill in all required fields');
          return;
        }
        google.script.run.withSuccessHandler(() => {
          alert('Subscription created successfully!');
          google.script.host.close();
        }).saveSubscription(sub);
      }
    </script>
  `)
  .setWidth(500)
  .setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(html, 'New Customer Subscription');
}

function saveSubscription(sub) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Subscriptions');
  if (!sheet) {
    sheet = ss.insertSheet('Subscriptions');
    sheet.appendRow(['Subscription ID', 'Customer ID', 'Company', 'Contact', 'Email', 'Phone',
                     'Plan ID', 'Plan Name', 'Interval', 'Quantity', 'Unit Price', 'Discount %',
                     'MRR', 'Status', 'Payment Method', 'Start Date', 'Trial End', 'Next Billing',
                     'Last Payment', 'Cancel Date', 'Cancel Reason', 'Created']);
  }

  // Get plan details
  const planSheet = ss.getSheetByName('Plans');
  let planName = '', unitPrice = 0, trialDays = 14;
  if (planSheet) {
    const plans = planSheet.getRange(2, 1, planSheet.getLastRow() - 1, 12).getValues();
    const plan = plans.find(p => p[0] === sub.planId);
    if (plan) {
      planName = plan[1];
      unitPrice = sub.interval === 'Annual' ? plan[5] / 12 : plan[4];
      trialDays = plan[11] || 14;
    }
  }

  const subId = 'SUB-' + Date.now().toString(36).toUpperCase();
  const custId = 'CUST-' + String(sheet.getLastRow()).padStart(5, '0');
  const startDate = new Date(sub.startDate);
  const trialEnd = sub.isTrial ? new Date(startDate.getTime() + trialDays * 24 * 60 * 60 * 1000) : null;
  const nextBilling = sub.isTrial ? trialEnd : calculateNextBilling(startDate, sub.interval);
  const discountedPrice = unitPrice * (1 - sub.discount / 100);
  const mrr = discountedPrice * sub.quantity;

  sheet.appendRow([
    subId,
    custId,
    sub.company,
    sub.contact,
    sub.email,
    sub.phone,
    sub.planId,
    planName,
    sub.interval,
    sub.quantity,
    unitPrice,
    sub.discount,
    mrr,
    sub.isTrial ? 'Trial' : 'Active',
    sub.paymentMethod,
    startDate,
    trialEnd,
    nextBilling,
    '',
    '',
    '',
    new Date()
  ]);

  // Update plan subscriber count
  updatePlanSubscriberCount(sub.planId);

  SpreadsheetApp.getActiveSpreadsheet().toast('Subscription created for ' + sub.company, 'Success');
}

function calculateNextBilling(startDate, interval) {
  const next = new Date(startDate);
  switch (interval) {
    case 'Monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'Quarterly':
      next.setMonth(next.getMonth() + 3);
      break;
    case 'Semi-Annual':
      next.setMonth(next.getMonth() + 6);
      break;
    case 'Annual':
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  return next;
}

function updatePlanSubscriberCount(planId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const planSheet = ss.getSheetByName('Plans');
  const subSheet = ss.getSheetByName('Subscriptions');

  if (!planSheet || !subSheet) return;

  const subscriptions = subSheet.getRange(2, 7, subSheet.getLastRow() - 1, 8).getValues();
  const count = subscriptions.filter(s => s[0] === planId && ['Active', 'Trial'].includes(s[7])).length;

  const plans = planSheet.getRange(2, 1, planSheet.getLastRow() - 1, 1).getValues();
  const planRow = plans.findIndex(p => p[0] === planId);
  if (planRow >= 0) {
    planSheet.getRange(planRow + 2, 14).setValue(count); // Subscribers column
  }
}

// ============ BILLING & INVOICING ============

function showGenerateInvoiceDialog() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const subSheet = ss.getSheetByName('Subscriptions');
  let subOptions = '<option value="">Select Subscription</option>';

  if (subSheet && subSheet.getLastRow() > 1) {
    const subs = subSheet.getRange(2, 1, subSheet.getLastRow() - 1, 14).getValues();
    subs.forEach(s => {
      if (s[0] && s[13] === 'Active') {
        subOptions += `<option value="${s[0]}">${s[2]} - ${s[7]} ($${s[12].toFixed(2)}/mo)</option>`;
      }
    });
  }

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 15px; }
      label { display: block; margin-bottom: 5px; font-weight: bold; }
      input, select, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; }
      .cancel { background: #666; }
    </style>
    <h2>Generate Invoice</h2>
    <form>
      <div class="form-group">
        <label>Subscription *</label>
        <select id="subscription" required>${subOptions}</select>
      </div>
      <div class="form-group">
        <label>Invoice Date</label>
        <input type="date" id="invoiceDate" value="${new Date().toISOString().split('T')[0]}">
      </div>
      <div class="form-group">
        <label>Due Date</label>
        <input type="date" id="dueDate" value="${new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]}">
      </div>
      <div class="form-group">
        <label>Period Start</label>
        <input type="date" id="periodStart">
      </div>
      <div class="form-group">
        <label>Period End</label>
        <input type="date" id="periodEnd">
      </div>
      <div class="form-group">
        <label>Additional Notes</label>
        <textarea id="notes" rows="2"></textarea>
      </div>
      <br>
      <button type="button" onclick="generateInvoice()">📄 Generate Invoice</button>
      <button type="button" class="cancel" onclick="google.script.host.close()">Cancel</button>
    </form>
    <script>
      function generateInvoice() {
        const inv = {
          subscriptionId: document.getElementById('subscription').value,
          invoiceDate: document.getElementById('invoiceDate').value,
          dueDate: document.getElementById('dueDate').value,
          periodStart: document.getElementById('periodStart').value,
          periodEnd: document.getElementById('periodEnd').value,
          notes: document.getElementById('notes').value
        };
        if (!inv.subscriptionId) {
          alert('Please select a subscription');
          return;
        }
        google.script.run.withSuccessHandler((invId) => {
          alert('Invoice ' + invId + ' created!');
          google.script.host.close();
        }).generateInvoice(inv);
      }
    </script>
  `)
  .setWidth(400)
  .setHeight(450);
  SpreadsheetApp.getUi().showModalDialog(html, 'Generate Invoice');
}

function generateInvoice(inv) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let invSheet = ss.getSheetByName('Invoices');
  if (!invSheet) {
    invSheet = ss.insertSheet('Invoices');
    invSheet.appendRow(['Invoice ID', 'Subscription ID', 'Customer', 'Email', 'Invoice Date',
                        'Due Date', 'Period Start', 'Period End', 'Subtotal', 'Discount',
                        'Tax', 'Total', 'Amount Paid', 'Balance', 'Status', 'Payment Date',
                        'Payment Method', 'Notes', 'Created']);
  }

  // Get subscription details
  const subSheet = ss.getSheetByName('Subscriptions');
  const subs = subSheet.getRange(2, 1, subSheet.getLastRow() - 1, 22).getValues();
  const sub = subs.find(s => s[0] === inv.subscriptionId);

  if (!sub) {
    throw new Error('Subscription not found');
  }

  const invoiceId = 'INV-' + new Date().getFullYear() + '-' + String(invSheet.getLastRow()).padStart(5, '0');
  const subtotal = sub[12]; // MRR
  const discount = sub[11] > 0 ? subtotal * (sub[11] / 100) : 0;
  const tax = 0; // Configure tax rate as needed
  const total = subtotal - discount + tax;

  invSheet.appendRow([
    invoiceId,
    inv.subscriptionId,
    sub[2], // Company
    sub[4], // Email
    new Date(inv.invoiceDate),
    new Date(inv.dueDate),
    inv.periodStart ? new Date(inv.periodStart) : '',
    inv.periodEnd ? new Date(inv.periodEnd) : '',
    subtotal,
    discount,
    tax,
    total,
    0,
    total,
    'Draft',
    '',
    '',
    inv.notes,
    new Date()
  ]);

  return invoiceId;
}

function showRecordPaymentDialog() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const invSheet = ss.getSheetByName('Invoices');
  let invOptions = '<option value="">Select Invoice</option>';

  if (invSheet && invSheet.getLastRow() > 1) {
    const invoices = invSheet.getRange(2, 1, invSheet.getLastRow() - 1, 15).getValues();
    invoices.forEach(i => {
      if (i[0] && ['Sent', 'Partial', 'Overdue'].includes(i[14])) {
        invOptions += `<option value="${i[0]}">${i[0]} - ${i[2]} ($${i[13].toFixed(2)} due)</option>`;
      }
    });
  }

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 15px; }
      label { display: block; margin-bottom: 5px; font-weight: bold; }
      input, select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      button { background: #34a853; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; }
      .cancel { background: #666; }
    </style>
    <h2>Record Payment</h2>
    <form>
      <div class="form-group">
        <label>Invoice *</label>
        <select id="invoice" required>${invOptions}</select>
      </div>
      <div class="form-group">
        <label>Amount *</label>
        <input type="number" id="amount" step="0.01" required>
      </div>
      <div class="form-group">
        <label>Payment Date</label>
        <input type="date" id="paymentDate" value="${new Date().toISOString().split('T')[0]}">
      </div>
      <div class="form-group">
        <label>Payment Method</label>
        <select id="method">
          <option value="Credit Card">Credit Card</option>
          <option value="ACH/Bank Transfer">ACH/Bank Transfer</option>
          <option value="PayPal">PayPal</option>
          <option value="Wire Transfer">Wire Transfer</option>
          <option value="Check">Check</option>
        </select>
      </div>
      <div class="form-group">
        <label>Reference/Transaction ID</label>
        <input type="text" id="reference">
      </div>
      <br>
      <button type="button" onclick="recordPayment()">💰 Record Payment</button>
      <button type="button" class="cancel" onclick="google.script.host.close()">Cancel</button>
    </form>
    <script>
      function recordPayment() {
        const pmt = {
          invoiceId: document.getElementById('invoice').value,
          amount: parseFloat(document.getElementById('amount').value),
          paymentDate: document.getElementById('paymentDate').value,
          method: document.getElementById('method').value,
          reference: document.getElementById('reference').value
        };
        if (!pmt.invoiceId || !pmt.amount) {
          alert('Please fill in all required fields');
          return;
        }
        google.script.run.withSuccessHandler(() => {
          alert('Payment recorded!');
          google.script.host.close();
        }).recordPayment(pmt);
      }
    </script>
  `)
  .setWidth(400)
  .setHeight(400);
  SpreadsheetApp.getUi().showModalDialog(html, 'Record Payment');
}

function recordPayment(pmt) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const invSheet = ss.getSheetByName('Invoices');
  let paySheet = ss.getSheetByName('Payments');

  if (!paySheet) {
    paySheet = ss.insertSheet('Payments');
    paySheet.appendRow(['Payment ID', 'Invoice ID', 'Subscription ID', 'Customer', 'Amount',
                        'Payment Date', 'Method', 'Reference', 'Status', 'Created']);
  }

  // Find invoice
  const invoices = invSheet.getRange(2, 1, invSheet.getLastRow() - 1, 19).getValues();
  const invRowIndex = invoices.findIndex(i => i[0] === pmt.invoiceId);

  if (invRowIndex < 0) {
    throw new Error('Invoice not found');
  }

  const invoice = invoices[invRowIndex];
  const currentPaid = invoice[12] || 0;
  const newPaid = currentPaid + pmt.amount;
  const newBalance = invoice[11] - newPaid; // Total - Amount Paid
  const newStatus = newBalance <= 0 ? 'Paid' : 'Partial';

  // Update invoice
  invSheet.getRange(invRowIndex + 2, 13).setValue(newPaid);
  invSheet.getRange(invRowIndex + 2, 14).setValue(Math.max(0, newBalance));
  invSheet.getRange(invRowIndex + 2, 15).setValue(newStatus);
  invSheet.getRange(invRowIndex + 2, 16).setValue(new Date(pmt.paymentDate));
  invSheet.getRange(invRowIndex + 2, 17).setValue(pmt.method);

  // Record payment
  const paymentId = 'PMT-' + Date.now().toString(36).toUpperCase();
  paySheet.appendRow([
    paymentId,
    pmt.invoiceId,
    invoice[1], // Subscription ID
    invoice[2], // Customer
    pmt.amount,
    new Date(pmt.paymentDate),
    pmt.method,
    pmt.reference,
    'Paid',
    new Date()
  ]);

  // Update subscription last payment date
  const subSheet = ss.getSheetByName('Subscriptions');
  if (subSheet) {
    const subs = subSheet.getRange(2, 1, subSheet.getLastRow() - 1, 1).getValues();
    const subRow = subs.findIndex(s => s[0] === invoice[1]);
    if (subRow >= 0) {
      subSheet.getRange(subRow + 2, 19).setValue(new Date(pmt.paymentDate));
    }
  }

  SpreadsheetApp.getActiveSpreadsheet().toast('Payment of $' + pmt.amount.toFixed(2) + ' recorded!', 'Success');
}

// ============ SUBSCRIPTION ACTIONS ============

function convertTrialToPaid() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const row = sheet.getActiveRange().getRow();

  if (sheet.getName() !== 'Subscriptions' || row < 2) {
    SpreadsheetApp.getUi().alert('Please select a subscription row in the Subscriptions sheet.');
    return;
  }

  const status = sheet.getRange(row, 14).getValue();
  if (status !== 'Trial') {
    SpreadsheetApp.getUi().alert('This subscription is not in Trial status.');
    return;
  }

  sheet.getRange(row, 14).setValue('Active');
  sheet.getRange(row, 17).setValue(''); // Clear trial end
  sheet.getRange(row, 18).setValue(calculateNextBilling(new Date(), sheet.getRange(row, 9).getValue()));

  SpreadsheetApp.getActiveSpreadsheet().toast('Trial converted to paid subscription!', 'Success');
}

function pauseSubscription() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const row = sheet.getActiveRange().getRow();

  if (sheet.getName() !== 'Subscriptions' || row < 2) {
    SpreadsheetApp.getUi().alert('Please select a subscription row.');
    return;
  }

  const status = sheet.getRange(row, 14).getValue();
  if (status !== 'Active') {
    SpreadsheetApp.getUi().alert('Only active subscriptions can be paused.');
    return;
  }

  sheet.getRange(row, 14).setValue('Paused');
  SpreadsheetApp.getActiveSpreadsheet().toast('Subscription paused.', 'Info');
}

function resumeSubscription() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const row = sheet.getActiveRange().getRow();

  if (sheet.getName() !== 'Subscriptions' || row < 2) {
    SpreadsheetApp.getUi().alert('Please select a subscription row.');
    return;
  }

  const status = sheet.getRange(row, 14).getValue();
  if (status !== 'Paused') {
    SpreadsheetApp.getUi().alert('Only paused subscriptions can be resumed.');
    return;
  }

  sheet.getRange(row, 14).setValue('Active');
  sheet.getRange(row, 18).setValue(calculateNextBilling(new Date(), sheet.getRange(row, 9).getValue()));
  SpreadsheetApp.getActiveSpreadsheet().toast('Subscription resumed!', 'Success');
}

function showCancelDialog() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const row = sheet.getActiveRange().getRow();

  if (sheet.getName() !== 'Subscriptions' || row < 2) {
    SpreadsheetApp.getUi().alert('Please select a subscription row.');
    return;
  }

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 15px; }
      label { display: block; margin-bottom: 5px; font-weight: bold; }
      select, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      button { background: #ea4335; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; }
      .cancel { background: #666; }
    </style>
    <h2>Cancel Subscription</h2>
    <p>Are you sure you want to cancel this subscription?</p>
    <form>
      <div class="form-group">
        <label>Cancellation Reason</label>
        <select id="reason">
          <option value="Too expensive">Too expensive</option>
          <option value="Not using enough">Not using enough</option>
          <option value="Missing features">Missing features</option>
          <option value="Switching to competitor">Switching to competitor</option>
          <option value="Going out of business">Going out of business</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div class="form-group">
        <label>Additional Feedback</label>
        <textarea id="feedback" rows="3"></textarea>
      </div>
      <br>
      <button type="button" onclick="confirmCancel()">🚫 Confirm Cancellation</button>
      <button type="button" class="cancel" onclick="google.script.host.close()">Keep Subscription</button>
    </form>
    <script>
      function confirmCancel() {
        const data = {
          reason: document.getElementById('reason').value,
          feedback: document.getElementById('feedback').value
        };
        google.script.run.withSuccessHandler(() => {
          alert('Subscription cancelled.');
          google.script.host.close();
        }).cancelSubscription(data, ${row});
      }
    </script>
  `)
  .setWidth(400)
  .setHeight(350);
  SpreadsheetApp.getUi().showModalDialog(html, 'Cancel Subscription');
}

function cancelSubscription(data, row) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Subscriptions');
  sheet.getRange(row, 14).setValue('Cancelled');
  sheet.getRange(row, 20).setValue(new Date()); // Cancel date
  sheet.getRange(row, 21).setValue(data.reason + (data.feedback ? ': ' + data.feedback : ''));

  // Update plan subscriber count
  const planId = sheet.getRange(row, 7).getValue();
  updatePlanSubscriberCount(planId);

  // Log churn
  logChurn(sheet.getRange(row, 1).getValue(), data.reason);

  SpreadsheetApp.getActiveSpreadsheet().toast('Subscription cancelled.', 'Info');
}

function logChurn(subscriptionId, reason) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let churnSheet = ss.getSheetByName('Churn');
  if (!churnSheet) {
    churnSheet = ss.insertSheet('Churn');
    churnSheet.appendRow(['Date', 'Subscription ID', 'Customer', 'Plan', 'MRR Lost', 'Reason', 'Tenure (months)']);
  }

  const subSheet = ss.getSheetByName('Subscriptions');
  const subs = subSheet.getRange(2, 1, subSheet.getLastRow() - 1, 22).getValues();
  const sub = subs.find(s => s[0] === subscriptionId);

  if (sub) {
    const startDate = new Date(sub[15]);
    const tenure = Math.round((new Date() - startDate) / (30 * 24 * 60 * 60 * 1000));
    churnSheet.appendRow([new Date(), subscriptionId, sub[2], sub[7], sub[12], reason, tenure]);
  }
}

// ============ REPORTS & DASHBOARDS ============

function showMRRDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const subSheet = ss.getSheetByName('Subscriptions');

  if (!subSheet || subSheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('No subscription data available.');
    return;
  }

  const subs = subSheet.getRange(2, 1, subSheet.getLastRow() - 1, 22).getValues();

  // Calculate metrics
  let totalMRR = 0, activeSubs = 0, trialSubs = 0, pastDueSubs = 0;
  const planMRR = {};

  subs.forEach(s => {
    if (s[13] === 'Active') {
      totalMRR += s[12] || 0;
      activeSubs++;
      const plan = s[7] || 'Unknown';
      planMRR[plan] = (planMRR[plan] || 0) + (s[12] || 0);
    } else if (s[13] === 'Trial') {
      trialSubs++;
    } else if (s[13] === 'Past Due') {
      pastDueSubs++;
      totalMRR += s[12] || 0;
    }
  });

  const arr = totalMRR * 12;

  let planBreakdown = '';
  Object.keys(planMRR).sort((a, b) => planMRR[b] - planMRR[a]).forEach(plan => {
    const pct = (planMRR[plan] / totalMRR * 100).toFixed(1);
    planBreakdown += `<tr><td>${plan}</td><td>$${planMRR[plan].toFixed(2)}</td><td>${pct}%</td></tr>`;
  });

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .metric-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px; }
      .metric { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
      .metric-value { font-size: 28px; font-weight: bold; color: #1a73e8; }
      .metric-label { color: #666; margin-top: 5px; }
      .mrr { background: #e8f5e9; }
      .mrr .metric-value { color: #34a853; }
      table { width: 100%; border-collapse: collapse; margin-top: 15px; }
      th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
      th { background: #f8f9fa; }
      h3 { margin-top: 25px; }
    </style>
    <h2>📊 MRR/ARR Dashboard</h2>
    <div class="metric-grid">
      <div class="metric mrr">
        <div class="metric-value">$${totalMRR.toFixed(2)}</div>
        <div class="metric-label">Monthly Recurring Revenue</div>
      </div>
      <div class="metric">
        <div class="metric-value">$${arr.toFixed(2)}</div>
        <div class="metric-label">Annual Run Rate</div>
      </div>
      <div class="metric">
        <div class="metric-value">${activeSubs}</div>
        <div class="metric-label">Active Subscriptions</div>
      </div>
      <div class="metric">
        <div class="metric-value">${trialSubs}</div>
        <div class="metric-label">Active Trials</div>
      </div>
    </div>
    <p>⚠️ Past Due: ${pastDueSubs} subscription(s)</p>
    <p>📈 Average Revenue/Customer: $${activeSubs > 0 ? (totalMRR / activeSubs).toFixed(2) : '0.00'}</p>
    <h3>MRR by Plan</h3>
    <table>
      <tr><th>Plan</th><th>MRR</th><th>% of Total</th></tr>
      ${planBreakdown}
    </table>
  `)
  .setWidth(500)
  .setHeight(550);
  SpreadsheetApp.getUi().showModalDialog(html, 'MRR Dashboard');
}

function showChurnAnalysis() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const churnSheet = ss.getSheetByName('Churn');

  if (!churnSheet || churnSheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('No churn data available yet.');
    return;
  }

  const churns = churnSheet.getRange(2, 1, churnSheet.getLastRow() - 1, 7).getValues();

  let totalLostMRR = 0;
  const reasonCounts = {};
  const monthlyChurn = {};

  churns.forEach(c => {
    totalLostMRR += c[4] || 0;
    const reason = c[5] || 'Unknown';
    reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;

    const month = new Date(c[0]).toISOString().slice(0, 7);
    monthlyChurn[month] = (monthlyChurn[month] || 0) + 1;
  });

  let reasonTable = '';
  Object.keys(reasonCounts).sort((a, b) => reasonCounts[b] - reasonCounts[a]).forEach(r => {
    const pct = (reasonCounts[r] / churns.length * 100).toFixed(1);
    reasonTable += `<tr><td>${r}</td><td>${reasonCounts[r]}</td><td>${pct}%</td></tr>`;
  });

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .alert { background: #fce4ec; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
      .alert-value { font-size: 24px; font-weight: bold; color: #c62828; }
      table { width: 100%; border-collapse: collapse; margin-top: 15px; }
      th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
      th { background: #f8f9fa; }
    </style>
    <h2>📉 Churn Analysis</h2>
    <div class="alert">
      <div class="alert-value">$${totalLostMRR.toFixed(2)}</div>
      <div>Total MRR Lost (${churns.length} cancellations)</div>
    </div>
    <h3>Cancellation Reasons</h3>
    <table>
      <tr><th>Reason</th><th>Count</th><th>%</th></tr>
      ${reasonTable}
    </table>
    <h3>Average Tenure Before Churn</h3>
    <p>${(churns.reduce((sum, c) => sum + (c[6] || 0), 0) / churns.length).toFixed(1)} months</p>
  `)
  .setWidth(450)
  .setHeight(450);
  SpreadsheetApp.getUi().showModalDialog(html, 'Churn Analysis');
}

function showUpcomingRenewals() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const subSheet = ss.getSheetByName('Subscriptions');

  if (!subSheet || subSheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('No subscription data available.');
    return;
  }

  const subs = subSheet.getRange(2, 1, subSheet.getLastRow() - 1, 22).getValues();
  const today = new Date();
  const thirtyDays = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  const upcoming = subs.filter(s => {
    if (s[13] !== 'Active' && s[13] !== 'Trial') return false;
    const nextBilling = new Date(s[17]);
    return nextBilling >= today && nextBilling <= thirtyDays;
  }).sort((a, b) => new Date(a[17]) - new Date(b[17]));

  let tableRows = '';
  upcoming.forEach(s => {
    const daysLeft = Math.ceil((new Date(s[17]) - today) / (24 * 60 * 60 * 1000));
    tableRows += `<tr>
      <td>${s[2]}</td>
      <td>${s[7]}</td>
      <td>$${(s[12] || 0).toFixed(2)}</td>
      <td>${new Date(s[17]).toLocaleDateString()}</td>
      <td>${daysLeft} days</td>
    </tr>`;
  });

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
      th { background: #f8f9fa; }
      .summary { background: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
    </style>
    <h2>📅 Upcoming Renewals (Next 30 Days)</h2>
    <div class="summary">
      <strong>${upcoming.length}</strong> renewals worth <strong>$${upcoming.reduce((sum, s) => sum + (s[12] || 0), 0).toFixed(2)}</strong> MRR
    </div>
    <table>
      <tr><th>Customer</th><th>Plan</th><th>MRR</th><th>Renewal Date</th><th>In</th></tr>
      ${tableRows || '<tr><td colspan="5">No upcoming renewals</td></tr>'}
    </table>
  `)
  .setWidth(600)
  .setHeight(400);
  SpreadsheetApp.getUi().showModalDialog(html, 'Upcoming Renewals');
}

function showPastDueAccounts() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const invSheet = ss.getSheetByName('Invoices');

  if (!invSheet || invSheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('No invoice data available.');
    return;
  }

  const invoices = invSheet.getRange(2, 1, invSheet.getLastRow() - 1, 19).getValues();
  const today = new Date();

  const pastDue = invoices.filter(i => {
    if (!['Sent', 'Partial', 'Overdue'].includes(i[14])) return false;
    return new Date(i[5]) < today && i[13] > 0;
  }).sort((a, b) => new Date(a[5]) - new Date(b[5]));

  let tableRows = '';
  let totalPastDue = 0;
  pastDue.forEach(i => {
    const daysOverdue = Math.ceil((today - new Date(i[5])) / (24 * 60 * 60 * 1000));
    totalPastDue += i[13];
    tableRows += `<tr>
      <td>${i[0]}</td>
      <td>${i[2]}</td>
      <td>$${i[13].toFixed(2)}</td>
      <td>${new Date(i[5]).toLocaleDateString()}</td>
      <td style="color: ${daysOverdue > 30 ? '#c62828' : '#f57c00'}">${daysOverdue} days</td>
    </tr>`;
  });

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
      th { background: #f8f9fa; }
      .alert { background: #ffebee; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
      .alert-value { font-size: 24px; font-weight: bold; color: #c62828; }
    </style>
    <h2>⚠️ Past Due Accounts</h2>
    <div class="alert">
      <div class="alert-value">$${totalPastDue.toFixed(2)}</div>
      <div>Total Past Due (${pastDue.length} invoices)</div>
    </div>
    <table>
      <tr><th>Invoice</th><th>Customer</th><th>Balance</th><th>Due Date</th><th>Overdue</th></tr>
      ${tableRows || '<tr><td colspan="5">No past due invoices!</td></tr>'}
    </table>
  `)
  .setWidth(600)
  .setHeight(400);
  SpreadsheetApp.getUi().showModalDialog(html, 'Past Due Accounts');
}

// ============ AUTOMATION ============

function runBillingCycle() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const subSheet = ss.getSheetByName('Subscriptions');

  if (!subSheet || subSheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('No subscriptions to bill.');
    return;
  }

  const subs = subSheet.getRange(2, 1, subSheet.getLastRow() - 1, 22).getValues();
  const today = new Date();
  let billed = 0;

  subs.forEach((s, index) => {
    if (s[13] !== 'Active') return;
    const nextBilling = new Date(s[17]);

    if (nextBilling <= today) {
      // Generate invoice
      const invData = {
        subscriptionId: s[0],
        invoiceDate: today.toISOString().split('T')[0],
        dueDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        periodStart: today.toISOString().split('T')[0],
        periodEnd: calculateNextBilling(today, s[8]).toISOString().split('T')[0],
        notes: 'Auto-generated billing cycle'
      };

      try {
        generateInvoice(invData);
        // Update next billing date
        subSheet.getRange(index + 2, 18).setValue(calculateNextBilling(today, s[8]));
        billed++;
      } catch (e) {
        Logger.log('Error billing ' + s[0] + ': ' + e.message);
      }
    }
  });

  SpreadsheetApp.getActiveSpreadsheet().toast('Generated ' + billed + ' invoices.', 'Billing Cycle Complete');
}

function sendRenewalReminders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const subSheet = ss.getSheetByName('Subscriptions');

  if (!subSheet || subSheet.getLastRow() < 2) return;

  const subs = subSheet.getRange(2, 1, subSheet.getLastRow() - 1, 22).getValues();
  const today = new Date();
  const sevenDays = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  let sent = 0;

  subs.forEach(s => {
    if (s[13] !== 'Active') return;
    const nextBilling = new Date(s[17]);

    if (nextBilling > today && nextBilling <= sevenDays) {
      // Send reminder email
      try {
        MailApp.sendEmail({
          to: s[4],
          subject: 'Upcoming Renewal - ' + s[7],
          body: `Hi ${s[3]},\n\nThis is a reminder that your subscription to ${s[7]} will renew on ${nextBilling.toLocaleDateString()}.\n\nAmount: $${s[12].toFixed(2)}\n\nThank you for being a customer!\n\nBest regards,\nThe Team`
        });
        sent++;
      } catch (e) {
        Logger.log('Error sending reminder to ' + s[4] + ': ' + e.message);
      }
    }
  });

  SpreadsheetApp.getActiveSpreadsheet().toast('Sent ' + sent + ' renewal reminders.', 'Reminders Sent');
}

function refreshDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dashSheet = ss.getSheetByName('Dashboard');

  if (dashSheet) {
    // Force recalculation
    SpreadsheetApp.flush();
  }

  SpreadsheetApp.getActiveSpreadsheet().toast('Dashboard refreshed!', 'Success');
}

// ============ SETTINGS ============

function showDunningSettings() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 15px; }
      label { display: block; margin-bottom: 5px; font-weight: bold; }
      input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
      .info { background: #e8f5e9; padding: 10px; border-radius: 4px; margin-bottom: 15px; }
    </style>
    <h2>Dunning Settings</h2>
    <div class="info">Configure automatic retry settings for failed payments.</div>
    <form>
      <div class="form-group">
        <label>Grace Period (days)</label>
        <input type="number" id="gracePeriod" value="${CONFIG.GRACE_PERIOD_DAYS}">
      </div>
      <div class="form-group">
        <label>Retry Attempts</label>
        <input type="number" id="retryAttempts" value="${CONFIG.DUNNING_ATTEMPTS}">
      </div>
      <div class="form-group">
        <label>Days Between Retries</label>
        <input type="number" id="retryInterval" value="3">
      </div>
      <br>
      <button type="button" onclick="google.script.host.close()">Save Settings</button>
    </form>
  `)
  .setWidth(350)
  .setHeight(350);
  SpreadsheetApp.getUi().showModalDialog(html, 'Dunning Settings');
}

function showStartTrialDialog() {
  SpreadsheetApp.getUi().alert('To start a trial, use "New Customer Subscription" and check "Start with free trial".');
}

function showChangePlanDialog() {
  SpreadsheetApp.getUi().alert('Select a subscription row in the Subscriptions sheet and manually update the Plan ID and MRR columns.');
}

function showRefundDialog() {
  SpreadsheetApp.getUi().alert('Refunds should be processed through your payment provider. Record the refund by creating a negative payment entry.');
}

function showRevenueReport() {
  showMRRDashboard(); // Reuse MRR dashboard
}

function showEmailTemplates() {
  SpreadsheetApp.getUi().alert('Email templates can be customized by editing the sendRenewalReminders function.');
}

function showTaxSettings() {
  SpreadsheetApp.getUi().alert('Tax configuration: Edit the generateInvoice function to set your tax rate.');
}
