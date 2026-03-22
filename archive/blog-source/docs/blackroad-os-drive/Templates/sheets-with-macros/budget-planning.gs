/**
 * BLACKROAD OS - Budget Planning with Scenario Modeling
 *
 * SETUP: Extensions > Apps Script > Paste this code > Save > Refresh sheet
 *
 * FEATURES:
 * - Multiple budget scenarios (Best/Base/Worst case)
 * - Revenue forecasting with growth models
 * - Expense categorization and tracking
 * - Cash flow projections (12-month)
 * - Break-even analysis
 * - Variance analysis (Actual vs Budget)
 * - Department budgets
 * - Quarterly rollups
 */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('💰 Budget Tools')
    .addItem('➕ Add Budget Line Item', 'addBudgetItem')
    .addItem('📊 Generate Scenario Report', 'generateScenarioReport')
    .addSeparator()
    .addSubMenu(ui.createMenu('📈 Forecasting')
      .addItem('Revenue Forecast (Linear)', 'forecastRevenueLinear')
      .addItem('Revenue Forecast (Growth %)', 'forecastRevenueGrowth')
      .addItem('Expense Forecast', 'forecastExpenses')
      .addItem('Cash Flow Projection', 'projectCashFlow'))
    .addSeparator()
    .addSubMenu(ui.createMenu('🎯 Analysis')
      .addItem('Break-Even Analysis', 'breakEvenAnalysis')
      .addItem('Variance Analysis', 'varianceAnalysis')
      .addItem('Department Summary', 'departmentSummary')
      .addItem('Quarterly Rollup', 'quarterlyRollup'))
    .addSeparator()
    .addSubMenu(ui.createMenu('📋 Templates')
      .addItem('Create Monthly Budget Template', 'createMonthlyTemplate')
      .addItem('Create Department Budget', 'createDeptBudget')
      .addItem('Create Startup Runway Calculator', 'createRunwayCalc'))
    .addSeparator()
    .addItem('📧 Email Budget Report', 'emailBudgetReport')
    .addItem('⚙️ Settings', 'openBudgetSettings')
    .addToUi();
}

const CONFIG = {
  COMPANY_NAME: 'BlackRoad OS, Inc.',
  FISCAL_YEAR_START: 1, // January
  CURRENCY: '$',
  GROWTH_RATE_DEFAULT: 0.10, // 10% default growth
  SCENARIOS: {
    'Best Case': 1.20,    // 20% above base
    'Base Case': 1.00,    // Base scenario
    'Worst Case': 0.75    // 25% below base
  },
  DEPARTMENTS: ['Engineering', 'Sales', 'Marketing', 'Operations', 'HR', 'Finance', 'Legal'],
  EXPENSE_CATEGORIES: [
    'Salaries & Wages', 'Benefits', 'Contractors', 'Software/SaaS',
    'Cloud Infrastructure', 'Office/Equipment', 'Travel', 'Marketing',
    'Legal/Professional', 'Insurance', 'R&D', 'Other'
  ],
  REVENUE_CATEGORIES: ['Product Revenue', 'Services', 'Subscriptions', 'Licensing', 'Other Revenue']
};

// Add Budget Line Item
function addBudgetItem() {
  const ui = SpreadsheetApp.getUi();

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      label { display: block; margin-top: 10px; font-weight: bold; }
      input, select { width: 100%; padding: 8px; margin-top: 5px; box-sizing: border-box; }
      button { margin-top: 20px; padding: 10px 20px; background: #2979FF; color: white; border: none; cursor: pointer; }
      .row { display: flex; gap: 10px; }
      .col { flex: 1; }
    </style>

    <label>Type:</label>
    <select id="type">
      <option value="Revenue">Revenue</option>
      <option value="Expense">Expense</option>
    </select>

    <label>Category:</label>
    <select id="category">
      <optgroup label="Revenue">
        ${CONFIG.REVENUE_CATEGORIES.map(c => '<option value="' + c + '">' + c + '</option>').join('')}
      </optgroup>
      <optgroup label="Expenses">
        ${CONFIG.EXPENSE_CATEGORIES.map(c => '<option value="' + c + '">' + c + '</option>').join('')}
      </optgroup>
    </select>

    <label>Description:</label>
    <input type="text" id="description" placeholder="e.g., AWS Cloud Costs">

    <label>Department:</label>
    <select id="department">
      ${CONFIG.DEPARTMENTS.map(d => '<option>' + d + '</option>').join('')}
    </select>

    <div class="row">
      <div class="col">
        <label>Monthly Amount (${CONFIG.CURRENCY}):</label>
        <input type="number" id="monthlyAmount" value="0">
      </div>
      <div class="col">
        <label>Growth Rate (%):</label>
        <input type="number" id="growthRate" value="0" step="0.1">
      </div>
    </div>

    <label>Start Month:</label>
    <select id="startMonth">
      ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => '<option value="' + (i+1) + '">' + m + '</option>').join('')}
    </select>

    <label>Notes:</label>
    <input type="text" id="notes" placeholder="Optional notes">

    <button onclick="submitBudgetItem()">Add to Budget</button>

    <script>
      function submitBudgetItem() {
        const data = {
          type: document.getElementById('type').value,
          category: document.getElementById('category').value,
          description: document.getElementById('description').value,
          department: document.getElementById('department').value,
          monthlyAmount: parseFloat(document.getElementById('monthlyAmount').value),
          growthRate: parseFloat(document.getElementById('growthRate').value) / 100,
          startMonth: parseInt(document.getElementById('startMonth').value),
          notes: document.getElementById('notes').value
        };
        google.script.run.withSuccessHandler(() => {
          google.script.host.close();
        }).processBudgetItem(data);
      }
    </script>
  `).setWidth(450).setHeight(550);

  ui.showModalDialog(html, '➕ Add Budget Line Item');
}

function processBudgetItem(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Budget Items');
  if (!sheet) {
    SpreadsheetApp.getUi().alert('Please create "Budget Items" sheet first or use "Create Monthly Budget Template"');
    return;
  }

  const lastRow = Math.max(sheet.getLastRow(), 1);
  const id = 'BUD-' + new Date().getFullYear() + '-' + String(lastRow).padStart(4, '0');

  // Calculate 12-month projections
  const months = [];
  for (let i = 1; i <= 12; i++) {
    if (i >= data.startMonth) {
      const monthsElapsed = i - data.startMonth;
      const amount = data.monthlyAmount * Math.pow(1 + data.growthRate/12, monthsElapsed);
      months.push(Math.round(amount * 100) / 100);
    } else {
      months.push(0);
    }
  }

  const annual = months.reduce((sum, m) => sum + m, 0);

  sheet.appendRow([
    id,
    data.type,
    data.category,
    data.description,
    data.department,
    data.monthlyAmount,
    data.growthRate,
    data.startMonth,
    ...months,
    annual,
    data.notes,
    new Date()
  ]);

  // Color code
  const newRow = sheet.getLastRow();
  if (data.type === 'Revenue') {
    sheet.getRange(newRow, 1, 1, 23).setBackground('#E8F5E9');
  } else {
    sheet.getRange(newRow, 1, 1, 23).setBackground('#FFEBEE');
  }
}

// Generate Scenario Report
function generateScenarioReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const itemsSheet = ss.getSheetByName('Budget Items');

  if (!itemsSheet || itemsSheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('No budget items found. Add items first.');
    return;
  }

  // Create or clear Scenario Report sheet
  let reportSheet = ss.getSheetByName('Scenario Report');
  if (reportSheet) {
    reportSheet.clear();
  } else {
    reportSheet = ss.insertSheet('Scenario Report');
  }

  // Get data
  const data = itemsSheet.getRange(2, 1, itemsSheet.getLastRow() - 1, 22).getValues();

  // Calculate scenario totals
  const scenarios = {};
  for (const [scenario, multiplier] of Object.entries(CONFIG.SCENARIOS)) {
    scenarios[scenario] = {
      revenue: 0,
      expenses: 0,
      netIncome: 0,
      byMonth: Array(12).fill(0)
    };

    for (const row of data) {
      const type = row[1];
      const annual = row[20] || 0;
      const monthlyValues = row.slice(8, 20);

      if (type === 'Revenue') {
        scenarios[scenario].revenue += annual * multiplier;
        monthlyValues.forEach((v, i) => scenarios[scenario].byMonth[i] += (v || 0) * multiplier);
      } else {
        scenarios[scenario].expenses += annual * multiplier;
        monthlyValues.forEach((v, i) => scenarios[scenario].byMonth[i] -= (v || 0) * multiplier);
      }
    }

    scenarios[scenario].netIncome = scenarios[scenario].revenue - scenarios[scenario].expenses;
  }

  // Build report
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  let reportData = [
    ['SCENARIO ANALYSIS - ' + new Date().getFullYear(), '', '', ''],
    ['Generated: ' + new Date().toLocaleString(), '', '', ''],
    ['', '', '', ''],
    ['ANNUAL SUMMARY', 'Best Case', 'Base Case', 'Worst Case'],
    ['Total Revenue', scenarios['Best Case'].revenue, scenarios['Base Case'].revenue, scenarios['Worst Case'].revenue],
    ['Total Expenses', scenarios['Best Case'].expenses, scenarios['Base Case'].expenses, scenarios['Worst Case'].expenses],
    ['Net Income', scenarios['Best Case'].netIncome, scenarios['Base Case'].netIncome, scenarios['Worst Case'].netIncome],
    ['', '', '', ''],
    ['MONTHLY CASH FLOW (Base Case)', ...months],
    ['Net Cash Flow', ...scenarios['Base Case'].byMonth],
    ['', '', '', ''],
    ['RUNWAY ANALYSIS', '', '', ''],
    ['Monthly Burn (Worst Case)', Math.abs(scenarios['Worst Case'].netIncome / 12), '', ''],
    ['Months of Runway (with $500K)', 500000 / Math.max(1, Math.abs(scenarios['Worst Case'].netIncome / 12)), '', '']
  ];

  reportSheet.getRange(1, 1, reportData.length, Math.max(...reportData.map(r => r.length))).setValues(reportData);

  // Format
  reportSheet.getRange(1, 1, 2, 4).setFontWeight('bold').setBackground('#2979FF').setFontColor('white');
  reportSheet.getRange(4, 1, 1, 4).setFontWeight('bold').setBackground('#E3F2FD');
  reportSheet.getRange(9, 1, 1, 13).setFontWeight('bold').setBackground('#E3F2FD');

  // Conditional format net income
  reportSheet.getRange(7, 2, 1, 3).setNumberFormat('$#,##0');
  reportSheet.getRange(5, 2, 2, 3).setNumberFormat('$#,##0');

  SpreadsheetApp.getUi().alert('✅ Scenario Report generated!\n\nCheck the "Scenario Report" sheet.');
}

// Revenue Forecast (Linear)
function forecastRevenueLinear() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Enter current monthly revenue:', ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() !== ui.Button.OK) return;

  const currentRevenue = parseFloat(response.getResponseText());

  const growthResponse = ui.prompt('Enter monthly growth amount (e.g., 5000 for $5,000/month increase):', ui.ButtonSet.OK_CANCEL);
  if (growthResponse.getSelectedButton() !== ui.Button.OK) return;

  const growthAmount = parseFloat(growthResponse.getResponseText());

  // Generate 12-month forecast
  let forecast = [];
  let revenue = currentRevenue;

  for (let i = 1; i <= 12; i++) {
    forecast.push([i, revenue, revenue * 12]);
    revenue += growthAmount;
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let forecastSheet = ss.getSheetByName('Revenue Forecast');
  if (!forecastSheet) forecastSheet = ss.insertSheet('Revenue Forecast');
  forecastSheet.clear();

  forecastSheet.getRange(1, 1, 1, 3).setValues([['Month', 'Monthly Revenue', 'Annual Run Rate']]);
  forecastSheet.getRange(1, 1, 1, 3).setFontWeight('bold').setBackground('#E8F5E9');
  forecastSheet.getRange(2, 1, 12, 3).setValues(forecast);
  forecastSheet.getRange(2, 2, 12, 2).setNumberFormat('$#,##0');

  ui.alert('📈 Linear revenue forecast created!\n\nStarting: ' + CONFIG.CURRENCY + currentRevenue.toLocaleString() + '\nMonthly Growth: ' + CONFIG.CURRENCY + growthAmount.toLocaleString());
}

// Revenue Forecast (Growth %)
function forecastRevenueGrowth() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Enter current monthly revenue:', ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() !== ui.Button.OK) return;

  const currentRevenue = parseFloat(response.getResponseText());

  const growthResponse = ui.prompt('Enter monthly growth rate (e.g., 10 for 10%):', ui.ButtonSet.OK_CANCEL);
  if (growthResponse.getSelectedButton() !== ui.Button.OK) return;

  const growthRate = parseFloat(growthResponse.getResponseText()) / 100;

  let forecast = [];
  let revenue = currentRevenue;

  for (let i = 1; i <= 12; i++) {
    forecast.push([i, revenue, revenue * 12, (Math.pow(1 + growthRate, i) - 1) * 100]);
    revenue *= (1 + growthRate);
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let forecastSheet = ss.getSheetByName('Revenue Forecast');
  if (!forecastSheet) forecastSheet = ss.insertSheet('Revenue Forecast');
  forecastSheet.clear();

  forecastSheet.getRange(1, 1, 1, 4).setValues([['Month', 'Monthly Revenue', 'Annual Run Rate', 'Cumulative Growth %']]);
  forecastSheet.getRange(1, 1, 1, 4).setFontWeight('bold').setBackground('#E8F5E9');
  forecastSheet.getRange(2, 1, 12, 4).setValues(forecast);
  forecastSheet.getRange(2, 2, 12, 2).setNumberFormat('$#,##0');
  forecastSheet.getRange(2, 4, 12, 1).setNumberFormat('0.0%');

  const yearEndRevenue = currentRevenue * Math.pow(1 + growthRate, 12);

  ui.alert('📈 Growth forecast created!\n\nMonth 1: ' + CONFIG.CURRENCY + currentRevenue.toLocaleString() + '\nMonth 12: ' + CONFIG.CURRENCY + Math.round(yearEndRevenue).toLocaleString() + '\nGrowth Rate: ' + (growthRate * 100) + '% monthly');
}

// Expense Forecast
function forecastExpenses() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const itemsSheet = ss.getSheetByName('Budget Items');

  if (!itemsSheet || itemsSheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('No budget items found.');
    return;
  }

  const data = itemsSheet.getRange(2, 1, itemsSheet.getLastRow() - 1, 22).getValues();

  // Group by category
  const byCategory = {};
  for (const row of data) {
    if (row[1] === 'Expense') {
      const category = row[2];
      const annual = row[20] || 0;
      byCategory[category] = (byCategory[category] || 0) + annual;
    }
  }

  // Create forecast sheet
  let forecastSheet = ss.getSheetByName('Expense Forecast');
  if (!forecastSheet) forecastSheet = ss.insertSheet('Expense Forecast');
  forecastSheet.clear();

  const forecastData = [['Category', 'Annual Budget', '% of Total']];
  const totalExpenses = Object.values(byCategory).reduce((sum, v) => sum + v, 0);

  for (const [category, amount] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
    forecastData.push([category, amount, amount / totalExpenses]);
  }
  forecastData.push(['TOTAL', totalExpenses, 1]);

  forecastSheet.getRange(1, 1, forecastData.length, 3).setValues(forecastData);
  forecastSheet.getRange(1, 1, 1, 3).setFontWeight('bold').setBackground('#FFEBEE');
  forecastSheet.getRange(forecastData.length, 1, 1, 3).setFontWeight('bold');
  forecastSheet.getRange(2, 2, forecastData.length - 1, 1).setNumberFormat('$#,##0');
  forecastSheet.getRange(2, 3, forecastData.length - 1, 1).setNumberFormat('0.0%');

  SpreadsheetApp.getUi().alert('📊 Expense forecast generated!\n\nTotal Annual Expenses: ' + CONFIG.CURRENCY + totalExpenses.toLocaleString());
}

// Project Cash Flow
function projectCashFlow() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const itemsSheet = ss.getSheetByName('Budget Items');

  if (!itemsSheet || itemsSheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('No budget items found.');
    return;
  }

  const ui = SpreadsheetApp.getUi();
  const startingCash = parseFloat(ui.prompt('Enter starting cash balance:', ui.ButtonSet.OK_CANCEL).getResponseText() || 0);

  const data = itemsSheet.getRange(2, 1, itemsSheet.getLastRow() - 1, 22).getValues();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Calculate monthly cash flow
  const monthlyRevenue = Array(12).fill(0);
  const monthlyExpenses = Array(12).fill(0);

  for (const row of data) {
    const type = row[1];
    const monthlyValues = row.slice(8, 20);

    for (let i = 0; i < 12; i++) {
      if (type === 'Revenue') {
        monthlyRevenue[i] += monthlyValues[i] || 0;
      } else {
        monthlyExpenses[i] += monthlyValues[i] || 0;
      }
    }
  }

  // Build cash flow projection
  let cashFlowSheet = ss.getSheetByName('Cash Flow Projection');
  if (!cashFlowSheet) cashFlowSheet = ss.insertSheet('Cash Flow Projection');
  cashFlowSheet.clear();

  const cashFlowData = [
    ['CASH FLOW PROJECTION', ...months],
    ['Starting Cash', startingCash, '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['Revenue', ...monthlyRevenue],
    ['Expenses', ...monthlyExpenses.map(e => -e)],
    ['Net Cash Flow', ...monthlyRevenue.map((r, i) => r - monthlyExpenses[i])],
    ['', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['Ending Cash Balance']
  ];

  // Calculate running balance
  let balance = startingCash;
  const endingBalances = [];
  for (let i = 0; i < 12; i++) {
    balance += monthlyRevenue[i] - monthlyExpenses[i];
    endingBalances.push(balance);
  }
  cashFlowData[7] = ['Ending Cash Balance', ...endingBalances];

  cashFlowSheet.getRange(1, 1, cashFlowData.length, 13).setValues(cashFlowData);
  cashFlowSheet.getRange(1, 1, 1, 13).setFontWeight('bold').setBackground('#2979FF').setFontColor('white');
  cashFlowSheet.getRange(4, 1, 5, 13).setNumberFormat('$#,##0');

  // Highlight negative balances
  for (let i = 0; i < 12; i++) {
    if (endingBalances[i] < 0) {
      cashFlowSheet.getRange(8, i + 2).setBackground('#FFCDD2');
    }
  }

  const minBalance = Math.min(...endingBalances);
  const runwayMonths = endingBalances.filter(b => b > 0).length;

  ui.alert('💰 Cash Flow Projection Created!\n\nStarting Cash: ' + CONFIG.CURRENCY + startingCash.toLocaleString() + '\nLowest Point: ' + CONFIG.CURRENCY + Math.round(minBalance).toLocaleString() + '\nMonths of Runway: ' + runwayMonths);
}

// Break-Even Analysis
function breakEvenAnalysis() {
  const ui = SpreadsheetApp.getUi();

  const fixedCosts = parseFloat(ui.prompt('Enter total monthly fixed costs:', ui.ButtonSet.OK_CANCEL).getResponseText() || 0);
  const revenuePerUnit = parseFloat(ui.prompt('Enter revenue per unit/sale:', ui.ButtonSet.OK_CANCEL).getResponseText() || 0);
  const variableCostPerUnit = parseFloat(ui.prompt('Enter variable cost per unit:', ui.ButtonSet.OK_CANCEL).getResponseText() || 0);

  if (revenuePerUnit <= variableCostPerUnit) {
    ui.alert('❌ Error: Revenue per unit must exceed variable cost per unit.');
    return;
  }

  const contributionMargin = revenuePerUnit - variableCostPerUnit;
  const breakEvenUnits = fixedCosts / contributionMargin;
  const breakEvenRevenue = breakEvenUnits * revenuePerUnit;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let beSheet = ss.getSheetByName('Break-Even Analysis');
  if (!beSheet) beSheet = ss.insertSheet('Break-Even Analysis');
  beSheet.clear();

  const beData = [
    ['BREAK-EVEN ANALYSIS', ''],
    ['', ''],
    ['INPUTS', ''],
    ['Fixed Costs (monthly)', fixedCosts],
    ['Revenue per Unit', revenuePerUnit],
    ['Variable Cost per Unit', variableCostPerUnit],
    ['', ''],
    ['CALCULATIONS', ''],
    ['Contribution Margin', contributionMargin],
    ['Contribution Margin %', contributionMargin / revenuePerUnit],
    ['', ''],
    ['BREAK-EVEN POINT', ''],
    ['Units to Break Even', Math.ceil(breakEvenUnits)],
    ['Revenue to Break Even', breakEvenRevenue],
    ['', ''],
    ['SENSITIVITY', 'Units Needed'],
    ['At 10% lower price', Math.ceil(fixedCosts / ((revenuePerUnit * 0.9) - variableCostPerUnit))],
    ['At 10% higher costs', Math.ceil((fixedCosts * 1.1) / contributionMargin)]
  ];

  beSheet.getRange(1, 1, beData.length, 2).setValues(beData);
  beSheet.getRange(1, 1, 1, 2).setFontWeight('bold').setBackground('#2979FF').setFontColor('white');
  beSheet.getRange(3, 1).setFontWeight('bold');
  beSheet.getRange(8, 1).setFontWeight('bold');
  beSheet.getRange(12, 1).setFontWeight('bold');
  beSheet.getRange(16, 1).setFontWeight('bold');
  beSheet.getRange(4, 2, 3, 1).setNumberFormat('$#,##0');
  beSheet.getRange(14, 2).setNumberFormat('$#,##0');
  beSheet.getRange(10, 2).setNumberFormat('0.0%');

  ui.alert('🎯 Break-Even Analysis Complete!\n\nYou need ' + Math.ceil(breakEvenUnits) + ' units to break even.\nBreak-even revenue: ' + CONFIG.CURRENCY + Math.round(breakEvenRevenue).toLocaleString());
}

// Variance Analysis
function varianceAnalysis() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();

  // This would compare budget vs actual - simplified version
  const response = ui.prompt('Enter this month\'s actual revenue:', ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() !== ui.Button.OK) return;
  const actualRevenue = parseFloat(response.getResponseText());

  const expenseResponse = ui.prompt('Enter this month\'s actual expenses:', ui.ButtonSet.OK_CANCEL);
  if (expenseResponse.getSelectedButton() !== ui.Button.OK) return;
  const actualExpenses = parseFloat(expenseResponse.getResponseText());

  const budgetRevResponse = ui.prompt('Enter budgeted revenue:', ui.ButtonSet.OK_CANCEL);
  if (budgetRevResponse.getSelectedButton() !== ui.Button.OK) return;
  const budgetRevenue = parseFloat(budgetRevResponse.getResponseText());

  const budgetExpResponse = ui.prompt('Enter budgeted expenses:', ui.ButtonSet.OK_CANCEL);
  if (budgetExpResponse.getSelectedButton() !== ui.Button.OK) return;
  const budgetExpenses = parseFloat(budgetExpResponse.getResponseText());

  const revenueVariance = actualRevenue - budgetRevenue;
  const expenseVariance = actualExpenses - budgetExpenses;
  const netVariance = (actualRevenue - actualExpenses) - (budgetRevenue - budgetExpenses);

  let report = `
📊 VARIANCE ANALYSIS
====================

REVENUE
  Budget: ${CONFIG.CURRENCY}${budgetRevenue.toLocaleString()}
  Actual: ${CONFIG.CURRENCY}${actualRevenue.toLocaleString()}
  Variance: ${CONFIG.CURRENCY}${revenueVariance.toLocaleString()} (${revenueVariance >= 0 ? '✅ Favorable' : '⚠️ Unfavorable'})

EXPENSES
  Budget: ${CONFIG.CURRENCY}${budgetExpenses.toLocaleString()}
  Actual: ${CONFIG.CURRENCY}${actualExpenses.toLocaleString()}
  Variance: ${CONFIG.CURRENCY}${expenseVariance.toLocaleString()} (${expenseVariance <= 0 ? '✅ Favorable' : '⚠️ Unfavorable'})

NET INCOME
  Budget: ${CONFIG.CURRENCY}${(budgetRevenue - budgetExpenses).toLocaleString()}
  Actual: ${CONFIG.CURRENCY}${(actualRevenue - actualExpenses).toLocaleString()}
  Variance: ${CONFIG.CURRENCY}${netVariance.toLocaleString()} (${netVariance >= 0 ? '✅' : '⚠️'})
  `;

  ui.alert(report);
}

// Department Summary
function departmentSummary() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const itemsSheet = ss.getSheetByName('Budget Items');

  if (!itemsSheet || itemsSheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('No budget items found.');
    return;
  }

  const data = itemsSheet.getRange(2, 1, itemsSheet.getLastRow() - 1, 22).getValues();

  const byDept = {};
  for (const dept of CONFIG.DEPARTMENTS) {
    byDept[dept] = { revenue: 0, expenses: 0 };
  }

  for (const row of data) {
    const type = row[1];
    const dept = row[4];
    const annual = row[20] || 0;

    if (byDept[dept]) {
      if (type === 'Revenue') {
        byDept[dept].revenue += annual;
      } else {
        byDept[dept].expenses += annual;
      }
    }
  }

  let report = '📊 DEPARTMENT BUDGET SUMMARY\n\n';
  let totalRevenue = 0;
  let totalExpenses = 0;

  for (const [dept, data] of Object.entries(byDept)) {
    if (data.revenue > 0 || data.expenses > 0) {
      report += `${dept}:\n`;
      report += `  Revenue: ${CONFIG.CURRENCY}${data.revenue.toLocaleString()}\n`;
      report += `  Expenses: ${CONFIG.CURRENCY}${data.expenses.toLocaleString()}\n`;
      report += `  Net: ${CONFIG.CURRENCY}${(data.revenue - data.expenses).toLocaleString()}\n\n`;
      totalRevenue += data.revenue;
      totalExpenses += data.expenses;
    }
  }

  report += `\nTOTAL:\n`;
  report += `  Revenue: ${CONFIG.CURRENCY}${totalRevenue.toLocaleString()}\n`;
  report += `  Expenses: ${CONFIG.CURRENCY}${totalExpenses.toLocaleString()}\n`;
  report += `  Net: ${CONFIG.CURRENCY}${(totalRevenue - totalExpenses).toLocaleString()}`;

  SpreadsheetApp.getUi().alert(report);
}

// Quarterly Rollup
function quarterlyRollup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const itemsSheet = ss.getSheetByName('Budget Items');

  if (!itemsSheet || itemsSheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('No budget items found.');
    return;
  }

  const data = itemsSheet.getRange(2, 1, itemsSheet.getLastRow() - 1, 22).getValues();

  const quarters = {
    Q1: { revenue: 0, expenses: 0, months: [0, 1, 2] },
    Q2: { revenue: 0, expenses: 0, months: [3, 4, 5] },
    Q3: { revenue: 0, expenses: 0, months: [6, 7, 8] },
    Q4: { revenue: 0, expenses: 0, months: [9, 10, 11] }
  };

  for (const row of data) {
    const type = row[1];
    const monthlyValues = row.slice(8, 20);

    for (const [q, qData] of Object.entries(quarters)) {
      for (const monthIndex of qData.months) {
        const value = monthlyValues[monthIndex] || 0;
        if (type === 'Revenue') {
          qData.revenue += value;
        } else {
          qData.expenses += value;
        }
      }
    }
  }

  let report = '📅 QUARTERLY BUDGET ROLLUP\n\n';

  for (const [q, data] of Object.entries(quarters)) {
    const net = data.revenue - data.expenses;
    report += `${q}:\n`;
    report += `  Revenue: ${CONFIG.CURRENCY}${Math.round(data.revenue).toLocaleString()}\n`;
    report += `  Expenses: ${CONFIG.CURRENCY}${Math.round(data.expenses).toLocaleString()}\n`;
    report += `  Net: ${CONFIG.CURRENCY}${Math.round(net).toLocaleString()} ${net >= 0 ? '✅' : '⚠️'}\n\n`;
  }

  SpreadsheetApp.getUi().alert(report);
}

// Create Monthly Budget Template
function createMonthlyTemplate() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Create Budget Items sheet
  let itemsSheet = ss.getSheetByName('Budget Items');
  if (!itemsSheet) itemsSheet = ss.insertSheet('Budget Items');
  itemsSheet.clear();

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const headers = ['ID', 'Type', 'Category', 'Description', 'Department', 'Monthly Base', 'Growth Rate', 'Start Month', ...months, 'Annual Total', 'Notes', 'Created'];

  itemsSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  itemsSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#2979FF').setFontColor('white');
  itemsSheet.setFrozenRows(1);

  // Add sample data
  const sampleData = [
    ['BUD-2024-0001', 'Revenue', 'Subscriptions', 'SaaS Monthly Revenue', 'Sales', 50000, 0.05, 1, 50000, 52500, 55125, 57881, 60775, 63814, 67005, 70355, 73873, 77567, 81445, 85517, 795857, 'MRR growth 5%/month', new Date()],
    ['BUD-2024-0002', 'Expense', 'Salaries & Wages', 'Engineering Team', 'Engineering', 80000, 0, 1, 80000, 80000, 80000, 80000, 80000, 80000, 80000, 80000, 80000, 80000, 80000, 80000, 960000, '4 engineers', new Date()],
    ['BUD-2024-0003', 'Expense', 'Cloud Infrastructure', 'AWS Costs', 'Engineering', 15000, 0.03, 1, 15000, 15450, 15914, 16391, 16883, 17389, 17911, 18448, 19002, 19572, 20159, 20764, 212883, '3% growth for scale', new Date()]
  ];

  itemsSheet.getRange(2, 1, sampleData.length, sampleData[0].length).setValues(sampleData);
  itemsSheet.getRange(2, 1, 1, 23).setBackground('#E8F5E9');
  itemsSheet.getRange(3, 1, 2, 23).setBackground('#FFEBEE');

  SpreadsheetApp.getUi().alert('✅ Monthly Budget Template created!\n\nUse "Add Budget Line Item" to add more items.\n\nSample items added for reference.');
}

// Create Department Budget
function createDeptBudget() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Enter department name:', ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() !== ui.Button.OK) return;

  const deptName = response.getResponseText();

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let deptSheet = ss.getSheetByName(deptName + ' Budget');
  if (!deptSheet) deptSheet = ss.insertSheet(deptName + ' Budget');
  deptSheet.clear();

  const template = [
    [deptName.toUpperCase() + ' DEPARTMENT BUDGET', '', '', '', '', ''],
    ['Fiscal Year: ' + new Date().getFullYear(), '', '', '', '', ''],
    ['', '', '', '', '', ''],
    ['Category', 'Q1', 'Q2', 'Q3', 'Q4', 'Annual'],
    ['Salaries', 0, 0, 0, 0, '=SUM(B5:E5)'],
    ['Contractors', 0, 0, 0, 0, '=SUM(B6:E6)'],
    ['Software/Tools', 0, 0, 0, 0, '=SUM(B7:E7)'],
    ['Travel', 0, 0, 0, 0, '=SUM(B8:E8)'],
    ['Training', 0, 0, 0, 0, '=SUM(B9:E9)'],
    ['Other', 0, 0, 0, 0, '=SUM(B10:E10)'],
    ['', '', '', '', '', ''],
    ['TOTAL', '=SUM(B5:B10)', '=SUM(C5:C10)', '=SUM(D5:D10)', '=SUM(E5:E10)', '=SUM(F5:F10)']
  ];

  deptSheet.getRange(1, 1, template.length, 6).setValues(template);
  deptSheet.getRange(1, 1, 2, 6).setFontWeight('bold').setBackground('#9C27B0').setFontColor('white');
  deptSheet.getRange(4, 1, 1, 6).setFontWeight('bold').setBackground('#E3F2FD');
  deptSheet.getRange(12, 1, 1, 6).setFontWeight('bold').setBackground('#E8F5E9');

  ui.alert('✅ ' + deptName + ' Budget created!\n\nFill in quarterly amounts for each category.');
}

// Create Startup Runway Calculator
function createRunwayCalc() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let runwaySheet = ss.getSheetByName('Runway Calculator');
  if (!runwaySheet) runwaySheet = ss.insertSheet('Runway Calculator');
  runwaySheet.clear();

  const template = [
    ['STARTUP RUNWAY CALCULATOR', ''],
    ['', ''],
    ['CURRENT POSITION', ''],
    ['Cash in Bank', 500000],
    ['Accounts Receivable', 50000],
    ['Total Available', '=B4+B5'],
    ['', ''],
    ['MONTHLY BURN', ''],
    ['Fixed Costs', 75000],
    ['Variable Costs', 25000],
    ['Total Monthly Burn', '=B9+B10'],
    ['', ''],
    ['REVENUE', ''],
    ['Monthly Revenue', 30000],
    ['Monthly Growth Rate', 0.1],
    ['', ''],
    ['RUNWAY ANALYSIS', ''],
    ['Current Burn Rate', '=B11-B14'],
    ['Months of Runway (No Growth)', '=B6/B18'],
    ['', ''],
    ['SCENARIO: With 10% MoM Revenue Growth', ''],
    ['Month 6 Revenue Projection', '=B14*POWER(1+B15,6)'],
    ['Month 12 Revenue Projection', '=B14*POWER(1+B15,12)'],
    ['Months to Break Even', '=ROUNDUP(LOG(B11/B14)/LOG(1+B15),0)']
  ];

  runwaySheet.getRange(1, 1, template.length, 2).setValues(template);
  runwaySheet.getRange(1, 1, 1, 2).setFontWeight('bold').setBackground('#FF1D6C').setFontColor('white');
  runwaySheet.getRange(3, 1).setFontWeight('bold');
  runwaySheet.getRange(8, 1).setFontWeight('bold');
  runwaySheet.getRange(13, 1).setFontWeight('bold');
  runwaySheet.getRange(17, 1).setFontWeight('bold');
  runwaySheet.getRange(21, 1).setFontWeight('bold');

  // Format numbers
  runwaySheet.getRange('B4:B6').setNumberFormat('$#,##0');
  runwaySheet.getRange('B9:B11').setNumberFormat('$#,##0');
  runwaySheet.getRange('B14').setNumberFormat('$#,##0');
  runwaySheet.getRange('B15').setNumberFormat('0%');
  runwaySheet.getRange('B18:B19').setNumberFormat('#,##0.0');
  runwaySheet.getRange('B22:B23').setNumberFormat('$#,##0');
  runwaySheet.getRange('B24').setNumberFormat('#,##0');

  SpreadsheetApp.getUi().alert('✅ Runway Calculator created!\n\nAdjust the inputs to model your startup\'s runway.');
}

// Email Budget Report
function emailBudgetReport() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Send budget summary to:', ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() !== ui.Button.OK) return;

  const email = response.getResponseText();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const itemsSheet = ss.getSheetByName('Budget Items');

  let totalRevenue = 0;
  let totalExpenses = 0;

  if (itemsSheet && itemsSheet.getLastRow() > 1) {
    const data = itemsSheet.getRange(2, 1, itemsSheet.getLastRow() - 1, 22).getValues();
    for (const row of data) {
      if (row[1] === 'Revenue') totalRevenue += row[20] || 0;
      else totalExpenses += row[20] || 0;
    }
  }

  const subject = CONFIG.COMPANY_NAME + ' - Budget Summary ' + new Date().toLocaleDateString();
  const body = `
${CONFIG.COMPANY_NAME} BUDGET SUMMARY
======================================

Annual Revenue: ${CONFIG.CURRENCY}${Math.round(totalRevenue).toLocaleString()}
Annual Expenses: ${CONFIG.CURRENCY}${Math.round(totalExpenses).toLocaleString()}
Net Income: ${CONFIG.CURRENCY}${Math.round(totalRevenue - totalExpenses).toLocaleString()}

Monthly Burn Rate: ${CONFIG.CURRENCY}${Math.round(totalExpenses / 12).toLocaleString()}

View full budget: ${ss.getUrl()}

--
Generated by BlackRoad OS Budget Planner
  `;

  MailApp.sendEmail(email, subject, body);
  ui.alert('✅ Budget report sent to ' + email);
}

// Settings
function openBudgetSettings() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      h3 { color: #2979FF; }
      code { background: #f5f5f5; padding: 2px 6px; }
    </style>
    <h3>⚙️ Budget Planner Settings</h3>
    <p><b>Company:</b> ${CONFIG.COMPANY_NAME}</p>
    <p><b>Currency:</b> ${CONFIG.CURRENCY}</p>
    <p><b>Fiscal Year Start:</b> Month ${CONFIG.FISCAL_YEAR_START}</p>
    <p><b>Default Growth Rate:</b> ${CONFIG.GROWTH_RATE_DEFAULT * 100}%</p>
    <p><b>Scenarios:</b></p>
    <ul>
      <li>Best Case: +20%</li>
      <li>Base Case: 100%</li>
      <li>Worst Case: -25%</li>
    </ul>
    <p><b>Departments:</b> ${CONFIG.DEPARTMENTS.join(', ')}</p>
    <p><b>To customize:</b> Edit <code>CONFIG</code> in Apps Script</p>
  `).setWidth(400).setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(html, '⚙️ Settings');
}
