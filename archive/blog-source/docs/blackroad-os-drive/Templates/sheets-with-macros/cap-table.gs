/**
 * BLACKROAD OS - Cap Table & Investor Relations
 *
 * SETUP: Extensions > Apps Script > Paste this code > Save > Refresh sheet
 *
 * FEATURES:
 * - Shareholder management
 * - Equity grant tracking
 * - Vesting schedules
 * - Dilution modeling
 * - Round modeling (Pre-seed, Seed, Series A, etc.)
 * - Investor updates
 * - SAFE/Convertible note tracking
 * - 409A valuation tracking
 * - Waterfall analysis
 */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('💎 Cap Table')
    .addItem('➕ Add Shareholder', 'addShareholder')
    .addItem('📄 Issue Equity Grant', 'issueEquityGrant')
    .addSeparator()
    .addSubMenu(ui.createMenu('📊 Modeling')
      .addItem('Model New Round', 'modelNewRound')
      .addItem('Dilution Calculator', 'dilutionCalculator')
      .addItem('Waterfall Analysis', 'waterfallAnalysis')
      .addItem('Option Pool Refresh', 'optionPoolRefresh'))
    .addSeparator()
    .addSubMenu(ui.createMenu('📈 Instruments')
      .addItem('Add SAFE', 'addSAFE')
      .addItem('Add Convertible Note', 'addConvertibleNote')
      .addItem('Convert SAFEs/Notes', 'convertInstruments'))
    .addSeparator()
    .addSubMenu(ui.createMenu('📋 Reports')
      .addItem('Cap Table Summary', 'capTableSummary')
      .addItem('Ownership Breakdown', 'ownershipBreakdown')
      .addItem('Vesting Schedule', 'vestingSchedule')
      .addItem('Investor Report', 'investorReport'))
    .addSeparator()
    .addItem('📧 Send Investor Update', 'sendInvestorUpdate')
    .addItem('⚙️ Settings', 'openCapTableSettings')
    .addToUi();
}

const CONFIG = {
  COMPANY_NAME: 'BlackRoad OS, Inc.',
  AUTHORIZED_SHARES: 10000000,
  SHARE_CLASSES: ['Common', 'Series Seed', 'Series A', 'Series B'],
  GRANT_TYPES: ['Founder Shares', 'Employee Option', 'Advisor', 'Investor'],
  VESTING_SCHEDULES: ['4 year with 1 year cliff', '3 year monthly', 'Immediate', 'Custom'],
  CURRENT_409A: 0.01, // $0.01 per share (example)
  OPTION_POOL_TARGET: 0.15 // 15% option pool
};

// Add Shareholder
function addShareholder() {
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

    <label>Shareholder Name:</label>
    <input type="text" id="name" placeholder="Full name or entity name">

    <label>Email:</label>
    <input type="email" id="email" placeholder="investor@email.com">

    <label>Type:</label>
    <select id="type">
      <option>Founder</option>
      <option>Investor</option>
      <option>Employee</option>
      <option>Advisor</option>
      <option>Board Member</option>
    </select>

    <label>Share Class:</label>
    <select id="shareClass">
      ${CONFIG.SHARE_CLASSES.map(c => '<option>' + c + '</option>').join('')}
    </select>

    <div class="row">
      <div class="col">
        <label>Shares:</label>
        <input type="number" id="shares" value="0">
      </div>
      <div class="col">
        <label>Price per Share ($):</label>
        <input type="number" id="pricePerShare" value="${CONFIG.CURRENT_409A}" step="0.001">
      </div>
    </div>

    <label>Investment Amount ($):</label>
    <input type="number" id="investment" value="0" step="0.01">

    <label>Grant Date:</label>
    <input type="date" id="grantDate">

    <label>Vesting Schedule:</label>
    <select id="vesting">
      ${CONFIG.VESTING_SCHEDULES.map(v => '<option>' + v + '</option>').join('')}
    </select>

    <label>Notes:</label>
    <input type="text" id="notes" placeholder="Additional notes">

    <button onclick="submitShareholder()">Add Shareholder</button>

    <script>
      function submitShareholder() {
        const data = {
          name: document.getElementById('name').value,
          email: document.getElementById('email').value,
          type: document.getElementById('type').value,
          shareClass: document.getElementById('shareClass').value,
          shares: parseInt(document.getElementById('shares').value),
          pricePerShare: parseFloat(document.getElementById('pricePerShare').value),
          investment: parseFloat(document.getElementById('investment').value),
          grantDate: document.getElementById('grantDate').value,
          vesting: document.getElementById('vesting').value,
          notes: document.getElementById('notes').value
        };
        google.script.run.withSuccessHandler(() => {
          google.script.host.close();
        }).processShareholder(data);
      }
    </script>
  `).setWidth(450).setHeight(700);

  ui.showModalDialog(html, '💎 Add Shareholder');
}

function processShareholder(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Cap Table');

  if (!sheet) {
    sheet = ss.insertSheet('Cap Table');
    sheet.getRange(1, 1, 1, 14).setValues([['ID', 'Name', 'Email', 'Type', 'Share Class', 'Shares', 'Price/Share', 'Investment', 'Ownership %', 'Vested', 'Unvested', 'Grant Date', 'Vesting', 'Notes']]);
    sheet.getRange(1, 1, 1, 14).setFontWeight('bold').setBackground('#9C27B0').setFontColor('white');
  }

  const lastRow = Math.max(sheet.getLastRow(), 1);
  const id = 'SH-' + String(lastRow).padStart(4, '0');

  // Calculate vested shares (simplified)
  const vestedShares = data.vesting === 'Immediate' ? data.shares : 0;
  const unvestedShares = data.shares - vestedShares;

  sheet.appendRow([
    id,
    data.name,
    data.email,
    data.type,
    data.shareClass,
    data.shares,
    data.pricePerShare,
    data.investment,
    '', // Will be calculated
    vestedShares,
    unvestedShares,
    data.grantDate,
    data.vesting,
    data.notes
  ]);

  // Update ownership percentages
  updateOwnershipPercentages();

  // Color code by type
  const typeColors = {
    'Founder': '#E3F2FD',
    'Investor': '#E8F5E9',
    'Employee': '#FFF3E0',
    'Advisor': '#F3E5F5',
    'Board Member': '#FCE4EC'
  };
  sheet.getRange(sheet.getLastRow(), 1, 1, 14).setBackground(typeColors[data.type] || '#FFFFFF');

  SpreadsheetApp.getUi().alert('✅ Shareholder added!\n\nID: ' + id + '\nShares: ' + data.shares.toLocaleString());
}

function updateOwnershipPercentages() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Cap Table');

  if (!sheet || sheet.getLastRow() < 2) return;

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 14).getValues();

  let totalShares = 0;
  for (const row of data) {
    totalShares += row[5] || 0;
  }

  for (let i = 0; i < data.length; i++) {
    const shares = data[i][5] || 0;
    const ownership = totalShares > 0 ? shares / totalShares : 0;
    sheet.getRange(i + 2, 9).setValue(ownership);
  }

  sheet.getRange(2, 9, data.length, 1).setNumberFormat('0.00%');
}

// Issue Equity Grant
function issueEquityGrant() {
  const ui = SpreadsheetApp.getUi();

  const nameResponse = ui.prompt('Employee/Advisor Name:', ui.ButtonSet.OK_CANCEL);
  if (nameResponse.getSelectedButton() !== ui.Button.OK) return;
  const name = nameResponse.getResponseText();

  const sharesResponse = ui.prompt('Number of options/shares:', ui.ButtonSet.OK_CANCEL);
  if (sharesResponse.getSelectedButton() !== ui.Button.OK) return;
  const shares = parseInt(sharesResponse.getResponseText());

  const typeResponse = ui.prompt('Grant Type (Employee Option / Advisor / RSU):', ui.ButtonSet.OK_CANCEL);
  const grantType = typeResponse.getSelectedButton() === ui.Button.OK ? typeResponse.getResponseText() : 'Employee Option';

  processShareholder({
    name: name,
    email: '',
    type: grantType.includes('Advisor') ? 'Advisor' : 'Employee',
    shareClass: 'Common',
    shares: shares,
    pricePerShare: CONFIG.CURRENT_409A,
    investment: 0,
    grantDate: new Date().toISOString().split('T')[0],
    vesting: '4 year with 1 year cliff',
    notes: grantType
  });
}

// Model New Round
function modelNewRound() {
  const ui = SpreadsheetApp.getUi();

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      label { display: block; margin-top: 10px; font-weight: bold; }
      input, select { width: 100%; padding: 8px; margin-top: 5px; box-sizing: border-box; }
      button { margin-top: 20px; padding: 10px 20px; background: #2979FF; color: white; border: none; cursor: pointer; width: 100%; }
      .result { margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 8px; }
    </style>

    <label>Round Name:</label>
    <select id="roundName">
      <option>Pre-Seed</option>
      <option>Seed</option>
      <option>Series A</option>
      <option>Series B</option>
      <option>Series C</option>
    </select>

    <label>Investment Amount ($):</label>
    <input type="number" id="investment" value="1000000">

    <label>Pre-Money Valuation ($):</label>
    <input type="number" id="preMoney" value="4000000">

    <label>Option Pool Increase (%):</label>
    <input type="number" id="optionPool" value="10">

    <button onclick="calculateRound()">Calculate</button>

    <div id="result" class="result" style="display: none;"></div>

    <button onclick="saveRound()" style="display: none;" id="saveBtn">Save Round Model</button>

    <script>
      let roundData = {};

      function calculateRound() {
        const investment = parseFloat(document.getElementById('investment').value);
        const preMoney = parseFloat(document.getElementById('preMoney').value);
        const optionPool = parseFloat(document.getElementById('optionPool').value) / 100;

        const postMoney = preMoney + investment;
        const newInvestorOwnership = investment / postMoney;
        const pricePerShare = postMoney / ${CONFIG.AUTHORIZED_SHARES};

        roundData = {
          roundName: document.getElementById('roundName').value,
          investment: investment,
          preMoney: preMoney,
          postMoney: postMoney,
          pricePerShare: pricePerShare.toFixed(4),
          newOwnership: (newInvestorOwnership * 100).toFixed(2),
          optionPool: optionPool * 100
        };

        document.getElementById('result').style.display = 'block';
        document.getElementById('result').innerHTML = \`
          <b>Round Model: \${roundData.roundName}</b><br><br>
          Investment: $\${investment.toLocaleString()}<br>
          Pre-Money: $\${preMoney.toLocaleString()}<br>
          Post-Money: $\${postMoney.toLocaleString()}<br>
          Price/Share: $\${roundData.pricePerShare}<br>
          New Investor Ownership: \${roundData.newOwnership}%<br>
          Option Pool: \${roundData.optionPool}%
        \`;
        document.getElementById('saveBtn').style.display = 'block';
      }

      function saveRound() {
        google.script.run.withSuccessHandler(() => {
          google.script.host.close();
        }).saveRoundModel(roundData);
      }
    </script>
  `).setWidth(450).setHeight(550);

  ui.showModalDialog(html, '📊 Model New Round');
}

function saveRoundModel(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Funding Rounds');

  if (!sheet) {
    sheet = ss.insertSheet('Funding Rounds');
    sheet.getRange(1, 1, 1, 10).setValues([['Round', 'Date', 'Investment', 'Pre-Money', 'Post-Money', 'Price/Share', 'New Ownership %', 'Option Pool %', 'Status', 'Notes']]);
    sheet.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#2979FF').setFontColor('white');
  }

  sheet.appendRow([
    data.roundName,
    new Date().toLocaleDateString(),
    data.investment,
    data.preMoney,
    data.postMoney,
    data.pricePerShare,
    data.newOwnership + '%',
    data.optionPool + '%',
    'Modeled',
    ''
  ]);

  SpreadsheetApp.getUi().alert('✅ Round model saved!\n\n' + data.roundName + ': $' + data.investment.toLocaleString());
}

// Dilution Calculator
function dilutionCalculator() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Cap Table');

  if (!sheet || sheet.getLastRow() < 2) {
    ui.alert('No cap table data.');
    return;
  }

  const newSharesResponse = ui.prompt('Enter new shares to be issued:', ui.ButtonSet.OK_CANCEL);
  if (newSharesResponse.getSelectedButton() !== ui.Button.OK) return;
  const newShares = parseInt(newSharesResponse.getResponseText());

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 14).getValues();

  let currentTotal = 0;
  for (const row of data) {
    currentTotal += row[5] || 0;
  }

  const newTotal = currentTotal + newShares;
  const dilutionPct = (1 - currentTotal / newTotal) * 100;

  let report = `📉 DILUTION ANALYSIS\n${'='.repeat(22)}\n\n`;
  report += `Current Shares: ${currentTotal.toLocaleString()}\n`;
  report += `New Shares: ${newShares.toLocaleString()}\n`;
  report += `Total After: ${newTotal.toLocaleString()}\n\n`;
  report += `Dilution: ${dilutionPct.toFixed(2)}%\n\n`;
  report += `BEFORE → AFTER:\n`;

  for (const row of data.slice(0, 10)) {
    const name = row[1];
    const shares = row[5] || 0;
    const currentPct = shares / currentTotal * 100;
    const newPct = shares / newTotal * 100;
    report += `  ${name}: ${currentPct.toFixed(2)}% → ${newPct.toFixed(2)}%\n`;
  }

  ui.alert(report);
}

// Waterfall Analysis
function waterfallAnalysis() {
  const ui = SpreadsheetApp.getUi();

  const exitValueResponse = ui.prompt('Enter exit value ($):', ui.ButtonSet.OK_CANCEL);
  if (exitValueResponse.getSelectedButton() !== ui.Button.OK) return;
  const exitValue = parseFloat(exitValueResponse.getResponseText());

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Cap Table');

  if (!sheet || sheet.getLastRow() < 2) {
    ui.alert('No cap table data.');
    return;
  }

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 14).getValues();

  let totalShares = 0;
  let shareholders = [];

  for (const row of data) {
    const shares = row[5] || 0;
    totalShares += shares;
    shareholders.push({
      name: row[1],
      type: row[3],
      shares: shares,
      shareClass: row[4]
    });
  }

  // Simple pro-rata waterfall (simplified - real ones have liquidation preferences)
  let report = `💰 WATERFALL ANALYSIS\n${'='.repeat(25)}\n\n`;
  report += `Exit Value: $${exitValue.toLocaleString()}\n`;
  report += `Price/Share: $${(exitValue / totalShares).toFixed(4)}\n\n`;
  report += `DISTRIBUTIONS:\n`;

  for (const sh of shareholders.sort((a, b) => b.shares - a.shares)) {
    const payout = (sh.shares / totalShares) * exitValue;
    const ownership = (sh.shares / totalShares * 100).toFixed(2);
    report += `  ${sh.name} (${ownership}%)\n`;
    report += `    Shares: ${sh.shares.toLocaleString()}\n`;
    report += `    Payout: $${payout.toLocaleString()}\n\n`;
  }

  ui.alert(report);
}

// Option Pool Refresh
function optionPoolRefresh() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Cap Table');

  if (!sheet || sheet.getLastRow() < 2) {
    ui.alert('No cap table data.');
    return;
  }

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 14).getValues();

  let totalShares = 0;
  let optionPoolShares = 0;

  for (const row of data) {
    const shares = row[5] || 0;
    totalShares += shares;
    if (row[3] === 'Employee' || row[3] === 'Advisor') {
      optionPoolShares += shares;
    }
  }

  const currentPoolPct = optionPoolShares / totalShares * 100;
  const targetPoolPct = CONFIG.OPTION_POOL_TARGET * 100;
  const needsRefresh = currentPoolPct < targetPoolPct;
  const sharesToAdd = needsRefresh ? Math.ceil((targetPoolPct / 100 * totalShares) - optionPoolShares) : 0;

  let report = `🎯 OPTION POOL ANALYSIS\n${'='.repeat(25)}\n\n`;
  report += `Current Pool: ${optionPoolShares.toLocaleString()} shares (${currentPoolPct.toFixed(2)}%)\n`;
  report += `Target Pool: ${targetPoolPct}%\n\n`;

  if (needsRefresh) {
    report += `⚠️ Pool needs refresh!\n`;
    report += `Shares to add: ${sharesToAdd.toLocaleString()}\n`;
  } else {
    report += `✅ Pool is at target level.\n`;
  }

  ui.alert(report);
}

// Add SAFE
function addSAFE() {
  const ui = SpreadsheetApp.getUi();

  const investorResponse = ui.prompt('Investor Name:', ui.ButtonSet.OK_CANCEL);
  if (investorResponse.getSelectedButton() !== ui.Button.OK) return;
  const investor = investorResponse.getResponseText();

  const amountResponse = ui.prompt('Investment Amount ($):', ui.ButtonSet.OK_CANCEL);
  if (amountResponse.getSelectedButton() !== ui.Button.OK) return;
  const amount = parseFloat(amountResponse.getResponseText());

  const capResponse = ui.prompt('Valuation Cap ($, or 0 for no cap):', ui.ButtonSet.OK_CANCEL);
  const cap = capResponse.getSelectedButton() === ui.Button.OK ? parseFloat(capResponse.getResponseText()) : 0;

  const discountResponse = ui.prompt('Discount (%, or 0 for no discount):', ui.ButtonSet.OK_CANCEL);
  const discount = discountResponse.getSelectedButton() === ui.Button.OK ? parseFloat(discountResponse.getResponseText()) : 0;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('SAFEs & Notes');

  if (!sheet) {
    sheet = ss.insertSheet('SAFEs & Notes');
    sheet.getRange(1, 1, 1, 10).setValues([['ID', 'Type', 'Investor', 'Amount', 'Valuation Cap', 'Discount', 'Date', 'Status', 'Converted To', 'Notes']]);
    sheet.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#F5A623').setFontColor('white');
  }

  const lastRow = Math.max(sheet.getLastRow(), 1);
  const id = 'SAFE-' + String(lastRow).padStart(3, '0');

  sheet.appendRow([
    id,
    'SAFE',
    investor,
    amount,
    cap || 'No Cap',
    discount ? discount + '%' : 'No Discount',
    new Date().toLocaleDateString(),
    'Outstanding',
    '',
    ''
  ]);

  ui.alert('✅ SAFE recorded!\n\nID: ' + id + '\nAmount: $' + amount.toLocaleString());
}

// Add Convertible Note
function addConvertibleNote() {
  const ui = SpreadsheetApp.getUi();

  const investorResponse = ui.prompt('Investor Name:', ui.ButtonSet.OK_CANCEL);
  if (investorResponse.getSelectedButton() !== ui.Button.OK) return;
  const investor = investorResponse.getResponseText();

  const principalResponse = ui.prompt('Principal Amount ($):', ui.ButtonSet.OK_CANCEL);
  if (principalResponse.getSelectedButton() !== ui.Button.OK) return;
  const principal = parseFloat(principalResponse.getResponseText());

  const interestResponse = ui.prompt('Interest Rate (%):', ui.ButtonSet.OK_CANCEL);
  const interest = interestResponse.getSelectedButton() === ui.Button.OK ? parseFloat(interestResponse.getResponseText()) : 5;

  const capResponse = ui.prompt('Valuation Cap ($):', ui.ButtonSet.OK_CANCEL);
  const cap = capResponse.getSelectedButton() === ui.Button.OK ? parseFloat(capResponse.getResponseText()) : 0;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('SAFEs & Notes');

  if (!sheet) {
    sheet = ss.insertSheet('SAFEs & Notes');
    sheet.getRange(1, 1, 1, 10).setValues([['ID', 'Type', 'Investor', 'Amount', 'Valuation Cap', 'Discount', 'Date', 'Status', 'Converted To', 'Notes']]);
    sheet.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#F5A623').setFontColor('white');
  }

  const lastRow = Math.max(sheet.getLastRow(), 1);
  const id = 'NOTE-' + String(lastRow).padStart(3, '0');

  sheet.appendRow([
    id,
    'Convertible Note',
    investor,
    principal,
    cap || 'No Cap',
    interest + '% interest',
    new Date().toLocaleDateString(),
    'Outstanding',
    '',
    ''
  ]);

  ui.alert('✅ Convertible Note recorded!\n\nID: ' + id + '\nPrincipal: $' + principal.toLocaleString());
}

// Convert Instruments
function convertInstruments() {
  const ui = SpreadsheetApp.getUi();

  const response = ui.alert('Convert SAFEs/Notes', 'This will convert all outstanding SAFEs and Notes at the current valuation.\n\nProceed?', ui.ButtonSet.YES_NO);

  if (response !== ui.Button.YES) return;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const notesSheet = ss.getSheetByName('SAFEs & Notes');

  if (!notesSheet || notesSheet.getLastRow() < 2) {
    ui.alert('No SAFEs or Notes to convert.');
    return;
  }

  const data = notesSheet.getRange(2, 1, notesSheet.getLastRow() - 1, 10).getValues();
  let converted = 0;

  for (let i = 0; i < data.length; i++) {
    if (data[i][7] === 'Outstanding') {
      const row = i + 2;
      const investor = data[i][2];
      const amount = data[i][3];

      // Add to cap table
      processShareholder({
        name: investor,
        email: '',
        type: 'Investor',
        shareClass: 'Series Seed',
        shares: Math.round(amount / CONFIG.CURRENT_409A),
        pricePerShare: CONFIG.CURRENT_409A,
        investment: amount,
        grantDate: new Date().toISOString().split('T')[0],
        vesting: 'Immediate',
        notes: 'Converted from ' + data[i][0]
      });

      // Update note status
      notesSheet.getRange(row, 8).setValue('Converted');
      notesSheet.getRange(row, 9).setValue('Series Seed');
      notesSheet.getRange(row, 1, 1, 10).setBackground('#C8E6C9');

      converted++;
    }
  }

  ui.alert('✅ Converted ' + converted + ' instruments to equity.');
}

// Cap Table Summary
function capTableSummary() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Cap Table');

  if (!sheet || sheet.getLastRow() < 2) {
    ui.alert('No cap table data.');
    return;
  }

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 14).getValues();

  let stats = {
    total: 0,
    byClass: {},
    byType: {},
    totalInvested: 0
  };

  for (const row of data) {
    const shares = row[5] || 0;
    const shareClass = row[4];
    const type = row[3];
    const investment = row[7] || 0;

    stats.total += shares;
    stats.byClass[shareClass] = (stats.byClass[shareClass] || 0) + shares;
    stats.byType[type] = (stats.byType[type] || 0) + shares;
    stats.totalInvested += investment;
  }

  let report = `
💎 CAP TABLE SUMMARY
====================

Total Shares Outstanding: ${stats.total.toLocaleString()}
Total Invested: $${stats.totalInvested.toLocaleString()}
Authorized: ${CONFIG.AUTHORIZED_SHARES.toLocaleString()}
Available: ${(CONFIG.AUTHORIZED_SHARES - stats.total).toLocaleString()}

BY SHARE CLASS:
${Object.entries(stats.byClass).map(([c, s]) => '  ' + c + ': ' + s.toLocaleString() + ' (' + (s / stats.total * 100).toFixed(1) + '%)').join('\n')}

BY HOLDER TYPE:
${Object.entries(stats.byType).map(([t, s]) => '  ' + t + ': ' + s.toLocaleString() + ' (' + (s / stats.total * 100).toFixed(1) + '%)').join('\n')}
  `;

  ui.alert(report);
}

// Ownership Breakdown
function ownershipBreakdown() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Cap Table');

  if (!sheet || sheet.getLastRow() < 2) {
    ui.alert('No cap table data.');
    return;
  }

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 14).getValues();

  let totalShares = 0;
  for (const row of data) {
    totalShares += row[5] || 0;
  }

  let report = `📊 OWNERSHIP BREAKDOWN\n${'='.repeat(25)}\n\n`;

  const sorted = data.sort((a, b) => (b[5] || 0) - (a[5] || 0));

  for (const row of sorted) {
    const name = row[1];
    const shares = row[5] || 0;
    const pct = (shares / totalShares * 100).toFixed(2);
    const bar = '█'.repeat(Math.round(shares / totalShares * 20));

    report += `${name}\n`;
    report += `  ${bar} ${pct}% (${shares.toLocaleString()} shares)\n\n`;
  }

  ui.alert(report);
}

// Vesting Schedule
function vestingSchedule() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Cap Table');

  if (!sheet || sheet.getLastRow() < 2) {
    ui.alert('No cap table data.');
    return;
  }

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 14).getValues();

  let report = `📅 VESTING SCHEDULE\n${'='.repeat(22)}\n\n`;

  for (const row of data) {
    if (row[12] && row[12] !== 'Immediate') {
      const name = row[1];
      const vested = row[9] || 0;
      const unvested = row[10] || 0;
      const total = vested + unvested;
      const vestedPct = total > 0 ? (vested / total * 100).toFixed(1) : 100;

      report += `${name}\n`;
      report += `  Schedule: ${row[12]}\n`;
      report += `  Grant Date: ${row[11]}\n`;
      report += `  Vested: ${vested.toLocaleString()} (${vestedPct}%)\n`;
      report += `  Unvested: ${unvested.toLocaleString()}\n\n`;
    }
  }

  ui.alert(report);
}

// Investor Report
function investorReport() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Cap Table');

  if (!sheet || sheet.getLastRow() < 2) {
    ui.alert('No cap table data.');
    return;
  }

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 14).getValues();
  const investors = data.filter(row => row[3] === 'Investor');

  if (investors.length === 0) {
    ui.alert('No investors found.');
    return;
  }

  let totalShares = 0;
  for (const row of data) {
    totalShares += row[5] || 0;
  }

  let report = `📈 INVESTOR REPORT\n${'='.repeat(20)}\n\n`;

  for (const inv of investors) {
    const shares = inv[5] || 0;
    const investment = inv[7] || 0;
    const ownership = (shares / totalShares * 100).toFixed(2);

    report += `${inv[1]}\n`;
    report += `  Investment: $${investment.toLocaleString()}\n`;
    report += `  Shares: ${shares.toLocaleString()} (${inv[4]})\n`;
    report += `  Ownership: ${ownership}%\n\n`;
  }

  ui.alert(report);
}

// Send Investor Update
function sendInvestorUpdate() {
  const ui = SpreadsheetApp.getUi();

  const subjectResponse = ui.prompt('Update Subject:', ui.ButtonSet.OK_CANCEL);
  if (subjectResponse.getSelectedButton() !== ui.Button.OK) return;
  const subject = subjectResponse.getResponseText();

  const bodyResponse = ui.prompt('Update Message (key highlights):', ui.ButtonSet.OK_CANCEL);
  if (bodyResponse.getSelectedButton() !== ui.Button.OK) return;
  const body = bodyResponse.getResponseText();

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Cap Table');

  if (!sheet || sheet.getLastRow() < 2) {
    ui.alert('No investors to email.');
    return;
  }

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 14).getValues();
  const investors = data.filter(row => row[3] === 'Investor' && row[2]);

  let sent = 0;
  for (const inv of investors) {
    const email = inv[2];
    const name = inv[1];

    const fullBody = `Dear ${name},\n\n${body}\n\nBest regards,\n${CONFIG.COMPANY_NAME} Team`;

    try {
      MailApp.sendEmail(email, subject, fullBody);
      sent++;
    } catch (e) {
      // Skip invalid emails
    }
  }

  ui.alert('✅ Investor update sent to ' + sent + ' investors.');
}

// Settings
function openCapTableSettings() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      h3 { color: #9C27B0; }
    </style>
    <h3>⚙️ Cap Table Settings</h3>
    <p><b>Company:</b> ${CONFIG.COMPANY_NAME}</p>
    <p><b>Authorized Shares:</b> ${CONFIG.AUTHORIZED_SHARES.toLocaleString()}</p>
    <p><b>Current 409A:</b> $${CONFIG.CURRENT_409A}</p>
    <p><b>Option Pool Target:</b> ${CONFIG.OPTION_POOL_TARGET * 100}%</p>
    <p><b>Share Classes:</b> ${CONFIG.SHARE_CLASSES.join(', ')}</p>
    <p><b>To customize:</b> Edit CONFIG in Apps Script</p>
  `).setWidth(400).setHeight(350);

  SpreadsheetApp.getUi().showModalDialog(html, '⚙️ Settings');
}
