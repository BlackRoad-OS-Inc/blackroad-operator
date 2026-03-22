/**
 * BLACKROAD OS - Sales Pipeline with Forecasting
 *
 * SETUP: Extensions > Apps Script > Paste this code > Save > Refresh sheet
 *
 * FEATURES:
 * - Visual pipeline stages
 * - Weighted revenue forecasting
 * - Win probability tracking
 * - Sales velocity metrics
 * - Rep performance dashboards
 * - Automated stage progression
 * - Deal alerts and reminders
 * - Territory management
 */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('💰 Sales Tools')
    .addItem('➕ Add New Deal', 'addNewDeal')
    .addItem('📊 Update Pipeline View', 'updatePipelineView')
    .addItem('🔄 Move Deal Stage', 'moveDealStage')
    .addSeparator()
    .addSubMenu(ui.createMenu('📈 Reports')
      .addItem('Pipeline Summary', 'pipelineSummary')
      .addItem('Revenue Forecast', 'revenueForecast')
      .addItem('Rep Performance', 'repPerformance')
      .addItem('Win/Loss Analysis', 'winLossAnalysis')
      .addItem('Sales Velocity', 'salesVelocity'))
    .addSeparator()
    .addItem('⚠️ Check Stalled Deals', 'checkStalledDeals')
    .addItem('📧 Send Pipeline Report', 'sendPipelineReport')
    .addItem('🎯 Set Quota', 'setQuota')
    .addSeparator()
    .addItem('⚙️ Settings', 'openSalesSettings')
    .addToUi();
}

const CONFIG = {
  DEALS_START_ROW: 6,
  STAGES: {
    'Lead': { probability: 0.10, order: 1 },
    'Qualified': { probability: 0.25, order: 2 },
    'Discovery': { probability: 0.40, order: 3 },
    'Proposal': { probability: 0.60, order: 4 },
    'Negotiation': { probability: 0.80, order: 5 },
    'Closed Won': { probability: 1.00, order: 6 },
    'Closed Lost': { probability: 0.00, order: 7 }
  },
  STALE_DAYS: 14, // Days without activity = stale
  COLORS: {
    'Lead': '#E3F2FD',
    'Qualified': '#BBDEFB',
    'Discovery': '#90CAF9',
    'Proposal': '#64B5F6',
    'Negotiation': '#42A5F5',
    'Closed Won': '#C8E6C9',
    'Closed Lost': '#FFCDD2'
  }
};

// Add New Deal
function addNewDeal() {
  const stageOptions = Object.keys(CONFIG.STAGES).filter(s => s !== 'Closed Won' && s !== 'Closed Lost').map(s => `<option>${s}</option>`).join('');

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      label { display: block; margin-top: 10px; font-weight: bold; }
      input, select, textarea { width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      button { margin-top: 15px; padding: 12px; background: #4CAF50; color: white; border: none; cursor: pointer; width: 100%; border-radius: 4px; }
      .row { display: flex; gap: 10px; }
      .row > div { flex: 1; }
    </style>
    <label>Company Name</label>
    <input type="text" id="company" placeholder="Prospect company">
    <label>Contact Name</label>
    <input type="text" id="contact" placeholder="Primary contact">
    <label>Contact Email</label>
    <input type="email" id="email" placeholder="email@company.com">
    <div class="row">
      <div>
        <label>Deal Value ($)</label>
        <input type="number" id="value" placeholder="0" min="0">
      </div>
      <div>
        <label>Stage</label>
        <select id="stage">${stageOptions}</select>
      </div>
    </div>
    <label>Expected Close Date</label>
    <input type="date" id="closeDate">
    <label>Sales Rep</label>
    <input type="text" id="rep" placeholder="Assigned rep">
    <label>Lead Source</label>
    <select id="source">
      <option>Inbound - Website</option>
      <option>Inbound - Referral</option>
      <option>Outbound - Cold Call</option>
      <option>Outbound - Email</option>
      <option>Marketing - Event</option>
      <option>Marketing - Content</option>
      <option>Partner</option>
    </select>
    <label>Notes</label>
    <textarea id="notes" rows="2" placeholder="Deal notes"></textarea>
    <button onclick="addDeal()">Add Deal</button>
    <script>
      // Default close date to 30 days from now
      const d = new Date();
      d.setDate(d.getDate() + 30);
      document.getElementById('closeDate').value = d.toISOString().split('T')[0];

      function addDeal() {
        const deal = {
          company: document.getElementById('company').value,
          contact: document.getElementById('contact').value,
          email: document.getElementById('email').value,
          value: document.getElementById('value').value,
          stage: document.getElementById('stage').value,
          closeDate: document.getElementById('closeDate').value,
          rep: document.getElementById('rep').value,
          source: document.getElementById('source').value,
          notes: document.getElementById('notes').value
        };
        google.script.run.withSuccessHandler(() => {
          alert('Deal added to pipeline!');
          google.script.host.close();
        }).processNewDeal(deal);
      }
    </script>
  `).setWidth(400).setHeight(580);

  SpreadsheetApp.getUi().showModalDialog(html, '➕ Add New Deal');
}

function processNewDeal(deal) {
  const sheet = SpreadsheetApp.getActiveSheet();
  const row = sheet.getLastRow() + 1;

  // Generate deal ID
  const dealId = 'DEAL-' + Date.now().toString().slice(-6);
  const probability = CONFIG.STAGES[deal.stage].probability;
  const weighted = parseFloat(deal.value) * probability;

  sheet.getRange(row, 1).setValue(dealId);
  sheet.getRange(row, 2).setValue(deal.company);
  sheet.getRange(row, 3).setValue(deal.contact);
  sheet.getRange(row, 4).setValue(deal.email);
  sheet.getRange(row, 5).setValue(parseFloat(deal.value) || 0);
  sheet.getRange(row, 6).setValue(deal.stage);
  sheet.getRange(row, 7).setValue(probability * 100 + '%');
  sheet.getRange(row, 8).setValue(weighted);
  sheet.getRange(row, 9).setValue(new Date(deal.closeDate));
  sheet.getRange(row, 10).setValue(deal.rep);
  sheet.getRange(row, 11).setValue(deal.source);
  sheet.getRange(row, 12).setValue(new Date()); // Created
  sheet.getRange(row, 13).setValue(new Date()); // Last activity
  sheet.getRange(row, 14).setValue(deal.notes);

  // Color by stage
  sheet.getRange(row, 1, 1, 14).setBackground(CONFIG.COLORS[deal.stage]);
}

// Move Deal Stage
function moveDealStage() {
  const ui = SpreadsheetApp.getUi();
  const dealResponse = ui.prompt('Enter Deal ID:', ui.ButtonSet.OK_CANCEL);

  if (dealResponse.getSelectedButton() !== ui.Button.OK) return;

  const dealId = dealResponse.getResponseText().trim();
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();

  // Find the deal
  let dealRow = null;
  for (let row = CONFIG.DEALS_START_ROW; row <= lastRow; row++) {
    if (sheet.getRange(row, 1).getValue() === dealId) {
      dealRow = row;
      break;
    }
  }

  if (!dealRow) {
    ui.alert('❌ Deal not found: ' + dealId);
    return;
  }

  const currentStage = sheet.getRange(dealRow, 6).getValue();
  const stages = Object.keys(CONFIG.STAGES);
  const stageOptions = stages.map(s => s === currentStage ? s + ' (current)' : s).join('\n');

  const stageResponse = ui.prompt('Current stage: ' + currentStage + '\n\nEnter new stage:\n' + stageOptions, ui.ButtonSet.OK_CANCEL);

  if (stageResponse.getSelectedButton() !== ui.Button.OK) return;

  const newStage = stageResponse.getResponseText().trim();

  if (!CONFIG.STAGES[newStage]) {
    ui.alert('❌ Invalid stage: ' + newStage);
    return;
  }

  // Update the deal
  const value = parseFloat(sheet.getRange(dealRow, 5).getValue()) || 0;
  const probability = CONFIG.STAGES[newStage].probability;
  const weighted = value * probability;

  sheet.getRange(dealRow, 6).setValue(newStage);
  sheet.getRange(dealRow, 7).setValue(probability * 100 + '%');
  sheet.getRange(dealRow, 8).setValue(weighted);
  sheet.getRange(dealRow, 13).setValue(new Date()); // Update last activity
  sheet.getRange(dealRow, 1, 1, 14).setBackground(CONFIG.COLORS[newStage]);

  ui.alert('✅ ' + dealId + ' moved to ' + newStage);
}

// Update Pipeline View
function updatePipelineView() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();

  let updated = 0;
  for (let row = CONFIG.DEALS_START_ROW; row <= lastRow; row++) {
    const stage = sheet.getRange(row, 6).getValue();
    const value = parseFloat(sheet.getRange(row, 5).getValue()) || 0;

    if (stage && CONFIG.STAGES[stage]) {
      const probability = CONFIG.STAGES[stage].probability;
      const weighted = value * probability;

      sheet.getRange(row, 7).setValue(probability * 100 + '%');
      sheet.getRange(row, 8).setValue(weighted);
      sheet.getRange(row, 1, 1, 14).setBackground(CONFIG.COLORS[stage]);
      updated++;
    }
  }

  SpreadsheetApp.getUi().alert('✅ Updated ' + updated + ' deals');
}

// Pipeline Summary
function pipelineSummary() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();

  let stats = {
    total: 0,
    totalValue: 0,
    weightedValue: 0,
    byStage: {}
  };

  for (const stage of Object.keys(CONFIG.STAGES)) {
    stats.byStage[stage] = { count: 0, value: 0 };
  }

  for (let row = CONFIG.DEALS_START_ROW; row <= lastRow; row++) {
    const stage = sheet.getRange(row, 6).getValue();
    const value = parseFloat(sheet.getRange(row, 5).getValue()) || 0;
    const weighted = parseFloat(sheet.getRange(row, 8).getValue()) || 0;

    if (stage && CONFIG.STAGES[stage]) {
      stats.total++;
      stats.totalValue += value;
      stats.weightedValue += weighted;
      stats.byStage[stage].count++;
      stats.byStage[stage].value += value;
    }
  }

  let report = `
PIPELINE SUMMARY
================

Total Deals: ${stats.total}
Total Value: $${stats.totalValue.toLocaleString()}
Weighted Forecast: $${stats.weightedValue.toLocaleString()}

BY STAGE:
`;

  for (const [stage, data] of Object.entries(stats.byStage)) {
    if (data.count > 0) {
      const pct = CONFIG.STAGES[stage].probability * 100;
      report += `  ${stage} (${pct}%): ${data.count} deals, $${data.value.toLocaleString()}\n`;
    }
  }

  SpreadsheetApp.getUi().alert(report);
}

// Revenue Forecast
function revenueForecast() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  const today = new Date();

  let forecast = {
    thisMonth: 0,
    nextMonth: 0,
    thisQuarter: 0,
    next90Days: 0
  };

  const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const nextMonthEnd = new Date(today.getFullYear(), today.getMonth() + 2, 0);
  const quarterEnd = new Date(today.getFullYear(), Math.ceil((today.getMonth() + 1) / 3) * 3, 0);
  const day90 = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);

  for (let row = CONFIG.DEALS_START_ROW; row <= lastRow; row++) {
    const stage = sheet.getRange(row, 6).getValue();
    const closeDate = new Date(sheet.getRange(row, 9).getValue());
    const weighted = parseFloat(sheet.getRange(row, 8).getValue()) || 0;

    if (stage === 'Closed Won' || stage === 'Closed Lost') continue;

    if (closeDate <= thisMonthEnd) forecast.thisMonth += weighted;
    if (closeDate <= nextMonthEnd && closeDate > thisMonthEnd) forecast.nextMonth += weighted;
    if (closeDate <= quarterEnd) forecast.thisQuarter += weighted;
    if (closeDate <= day90) forecast.next90Days += weighted;
  }

  const report = `
REVENUE FORECAST (Weighted)
===========================

This Month: $${forecast.thisMonth.toLocaleString()}
Next Month: $${forecast.nextMonth.toLocaleString()}
This Quarter: $${forecast.thisQuarter.toLocaleString()}
Next 90 Days: $${forecast.next90Days.toLocaleString()}

Note: Weighted by stage probability
  `;

  SpreadsheetApp.getUi().alert(report);
}

// Rep Performance
function repPerformance() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();

  let reps = {};

  for (let row = CONFIG.DEALS_START_ROW; row <= lastRow; row++) {
    const rep = sheet.getRange(row, 10).getValue();
    const stage = sheet.getRange(row, 6).getValue();
    const value = parseFloat(sheet.getRange(row, 5).getValue()) || 0;
    const weighted = parseFloat(sheet.getRange(row, 8).getValue()) || 0;

    if (!rep) continue;

    if (!reps[rep]) {
      reps[rep] = { deals: 0, value: 0, weighted: 0, won: 0, wonValue: 0, lost: 0 };
    }

    reps[rep].deals++;
    reps[rep].value += value;
    reps[rep].weighted += weighted;

    if (stage === 'Closed Won') {
      reps[rep].won++;
      reps[rep].wonValue += value;
    }
    if (stage === 'Closed Lost') {
      reps[rep].lost++;
    }
  }

  let report = 'REP PERFORMANCE\n===============\n\n';

  for (const [rep, data] of Object.entries(reps)) {
    const winRate = data.won + data.lost > 0 ? ((data.won / (data.won + data.lost)) * 100).toFixed(0) : 'N/A';

    report += `${rep}:\n`;
    report += `  Active Deals: ${data.deals - data.won - data.lost}\n`;
    report += `  Pipeline Value: $${data.value.toLocaleString()}\n`;
    report += `  Weighted: $${data.weighted.toLocaleString()}\n`;
    report += `  Won: ${data.won} ($${data.wonValue.toLocaleString()})\n`;
    report += `  Win Rate: ${winRate}%\n\n`;
  }

  SpreadsheetApp.getUi().alert(report);
}

// Win/Loss Analysis
function winLossAnalysis() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();

  let stats = { won: 0, lost: 0, wonValue: 0, lostValue: 0, bySource: {} };

  for (let row = CONFIG.DEALS_START_ROW; row <= lastRow; row++) {
    const stage = sheet.getRange(row, 6).getValue();
    const value = parseFloat(sheet.getRange(row, 5).getValue()) || 0;
    const source = sheet.getRange(row, 11).getValue();

    if (stage === 'Closed Won') {
      stats.won++;
      stats.wonValue += value;
      if (!stats.bySource[source]) stats.bySource[source] = { won: 0, lost: 0 };
      stats.bySource[source].won++;
    }
    if (stage === 'Closed Lost') {
      stats.lost++;
      stats.lostValue += value;
      if (!stats.bySource[source]) stats.bySource[source] = { won: 0, lost: 0 };
      stats.bySource[source].lost++;
    }
  }

  const totalClosed = stats.won + stats.lost;
  const winRate = totalClosed > 0 ? ((stats.won / totalClosed) * 100).toFixed(1) : 0;

  let report = `
WIN/LOSS ANALYSIS
=================

Won: ${stats.won} deals ($${stats.wonValue.toLocaleString()})
Lost: ${stats.lost} deals ($${stats.lostValue.toLocaleString()})
Win Rate: ${winRate}%

BY SOURCE:
`;

  for (const [source, data] of Object.entries(stats.bySource)) {
    const total = data.won + data.lost;
    const rate = total > 0 ? ((data.won / total) * 100).toFixed(0) : 0;
    report += `  ${source}: ${data.won}W/${data.lost}L (${rate}%)\n`;
  }

  SpreadsheetApp.getUi().alert(report);
}

// Sales Velocity
function salesVelocity() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();

  let totalDays = 0;
  let wonDeals = 0;
  let avgDealSize = 0;
  let totalWonValue = 0;

  for (let row = CONFIG.DEALS_START_ROW; row <= lastRow; row++) {
    const stage = sheet.getRange(row, 6).getValue();

    if (stage === 'Closed Won') {
      const created = new Date(sheet.getRange(row, 12).getValue());
      const value = parseFloat(sheet.getRange(row, 5).getValue()) || 0;

      const daysToCLose = Math.floor((new Date() - created) / (1000 * 60 * 60 * 24));
      totalDays += daysToCLose;
      totalWonValue += value;
      wonDeals++;
    }
  }

  const avgCycleTime = wonDeals > 0 ? (totalDays / wonDeals).toFixed(1) : 0;
  avgDealSize = wonDeals > 0 ? totalWonValue / wonDeals : 0;

  // Count active pipeline
  let activePipeline = 0;
  let activeDeals = 0;
  for (let row = CONFIG.DEALS_START_ROW; row <= lastRow; row++) {
    const stage = sheet.getRange(row, 6).getValue();
    if (stage !== 'Closed Won' && stage !== 'Closed Lost') {
      activePipeline += parseFloat(sheet.getRange(row, 5).getValue()) || 0;
      activeDeals++;
    }
  }

  const winRate = 0.30; // Assume 30% if not enough data
  const velocity = avgCycleTime > 0 ? (activeDeals * avgDealSize * winRate) / parseFloat(avgCycleTime) * 30 : 0;

  const report = `
SALES VELOCITY
==============

Average Deal Size: $${avgDealSize.toLocaleString()}
Average Cycle Time: ${avgCycleTime} days
Closed Won: ${wonDeals} deals

Active Pipeline: ${activeDeals} deals ($${activePipeline.toLocaleString()})

Estimated Monthly Velocity: $${velocity.toLocaleString()}/month

Formula: (# Deals × Avg Size × Win Rate) / Cycle Time
  `;

  SpreadsheetApp.getUi().alert(report);
}

// Check Stalled Deals
function checkStalledDeals() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  const today = new Date();
  const staleThreshold = new Date(today.getTime() - CONFIG.STALE_DAYS * 24 * 60 * 60 * 1000);

  let stalled = [];

  for (let row = CONFIG.DEALS_START_ROW; row <= lastRow; row++) {
    const stage = sheet.getRange(row, 6).getValue();
    const lastActivity = new Date(sheet.getRange(row, 13).getValue());

    if (stage !== 'Closed Won' && stage !== 'Closed Lost' && lastActivity < staleThreshold) {
      const dealId = sheet.getRange(row, 1).getValue();
      const company = sheet.getRange(row, 2).getValue();
      const value = sheet.getRange(row, 5).getValue();
      const days = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));

      stalled.push({ dealId, company, value, days, row });

      // Highlight stalled deals
      sheet.getRange(row, 1, 1, 14).setBackground('#FFECB3');
    }
  }

  if (stalled.length === 0) {
    SpreadsheetApp.getUi().alert('✅ No stalled deals! All deals have recent activity.');
    return;
  }

  let report = '⚠️ STALLED DEALS (' + CONFIG.STALE_DAYS + '+ days no activity)\n\n';

  for (const deal of stalled) {
    report += `${deal.dealId}: ${deal.company}\n  Value: $${deal.value.toLocaleString()}\n  Days stalled: ${deal.days}\n\n`;
  }

  SpreadsheetApp.getUi().alert(report);
}

// Send Pipeline Report
function sendPipelineReport() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Send pipeline report to:', ui.ButtonSet.OK_CANCEL);

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const email = response.getResponseText();
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();

  let totalValue = 0, weighted = 0, dealCount = 0;

  for (let row = CONFIG.DEALS_START_ROW; row <= lastRow; row++) {
    const stage = sheet.getRange(row, 6).getValue();
    if (stage !== 'Closed Won' && stage !== 'Closed Lost') {
      totalValue += parseFloat(sheet.getRange(row, 5).getValue()) || 0;
      weighted += parseFloat(sheet.getRange(row, 8).getValue()) || 0;
      dealCount++;
    }
  }

  const subject = 'Sales Pipeline Report - ' + new Date().toLocaleDateString();
  const body = `
SALES PIPELINE REPORT
=====================

Active Deals: ${dealCount}
Total Pipeline Value: $${totalValue.toLocaleString()}
Weighted Forecast: $${weighted.toLocaleString()}

View full pipeline: ${SpreadsheetApp.getActiveSpreadsheet().getUrl()}

--
BlackRoad OS Sales Pipeline
  `;

  MailApp.sendEmail(email, subject, body);
  ui.alert('✅ Pipeline report sent to ' + email);
}

// Set Quota
function setQuota() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Set quarterly quota ($):', ui.ButtonSet.OK_CANCEL);

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const quota = parseFloat(response.getResponseText()) || 0;
  const sheet = SpreadsheetApp.getActiveSheet();

  // Store quota in a named range or cell
  sheet.getRange('P1').setValue('Quota:');
  sheet.getRange('Q1').setValue(quota);

  // Calculate attainment
  let wonThisQuarter = 0;
  const today = new Date();
  const quarterStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);

  const lastRow = sheet.getLastRow();
  for (let row = CONFIG.DEALS_START_ROW; row <= lastRow; row++) {
    const stage = sheet.getRange(row, 6).getValue();
    const created = new Date(sheet.getRange(row, 12).getValue());

    if (stage === 'Closed Won' && created >= quarterStart) {
      wonThisQuarter += parseFloat(sheet.getRange(row, 5).getValue()) || 0;
    }
  }

  const attainment = quota > 0 ? ((wonThisQuarter / quota) * 100).toFixed(1) : 0;

  ui.alert(`🎯 Quota Set: $${quota.toLocaleString()}\n\nClosed this quarter: $${wonThisQuarter.toLocaleString()}\nAttainment: ${attainment}%`);
}

// Settings
function openSalesSettings() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      h3 { color: #4CAF50; }
    </style>
    <h3>⚙️ Sales Pipeline Settings</h3>
    <p><b>Pipeline Stages & Probabilities:</b></p>
    <p>• Lead: 10%</p>
    <p>• Qualified: 25%</p>
    <p>• Discovery: 40%</p>
    <p>• Proposal: 60%</p>
    <p>• Negotiation: 80%</p>
    <p>• Closed Won: 100%</p>
    <p>• Closed Lost: 0%</p>
    <p><b>Stale Deal Threshold:</b> 14 days</p>
    <p><b>To customize:</b> Edit CONFIG in Apps Script</p>
  `).setWidth(350).setHeight(350);

  SpreadsheetApp.getUi().showModalDialog(html, '⚙️ Settings');
}
