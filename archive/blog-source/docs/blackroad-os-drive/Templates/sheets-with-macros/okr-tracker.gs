/**
 * BLACKROAD OS - OKR Tracker (Objectives & Key Results)
 *
 * SETUP: Extensions > Apps Script > Paste this code > Save > Refresh sheet
 *
 * FEATURES:
 * - Create and manage OKRs by quarter
 * - Cascading objectives (Company → Team → Individual)
 * - Key Results with measurable targets
 * - Progress tracking and scoring (0.0 - 1.0)
 * - Weekly check-ins
 * - Alignment visualization
 * - Quarterly reviews
 * - Historical tracking
 */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🎯 OKR Tools')
    .addItem('➕ Create New Objective', 'createObjective')
    .addItem('📊 Add Key Result', 'addKeyResult')
    .addSeparator()
    .addSubMenu(ui.createMenu('📈 Progress')
      .addItem('Update Progress', 'updateProgress')
      .addItem('Weekly Check-in', 'weeklyCheckin')
      .addItem('Score Key Result', 'scoreKeyResult'))
    .addSeparator()
    .addSubMenu(ui.createMenu('📋 Views')
      .addItem('Company Overview', 'companyOverview')
      .addItem('Team View', 'teamView')
      .addItem('My OKRs', 'myOKRs')
      .addItem('Alignment Map', 'alignmentMap'))
    .addSeparator()
    .addSubMenu(ui.createMenu('📅 Quarterly')
      .addItem('Start New Quarter', 'startNewQuarter')
      .addItem('Quarterly Review', 'quarterlyReview')
      .addItem('Archive Quarter', 'archiveQuarter'))
    .addSeparator()
    .addItem('📧 Send OKR Report', 'sendOKRReport')
    .addItem('⚙️ Settings', 'openOKRSettings')
    .addToUi();
}

const CONFIG = {
  COMPANY_NAME: 'BlackRoad OS, Inc.',
  CURRENT_QUARTER: 'Q1 2024',
  LEVELS: ['Company', 'Team', 'Individual'],
  TEAMS: ['Engineering', 'Product', 'Sales', 'Marketing', 'Operations', 'HR', 'Finance'],
  SCORE_THRESHOLDS: {
    'green': 0.7,   // 70%+ is on track
    'yellow': 0.4,  // 40-69% needs attention
    'red': 0       // Below 40% at risk
  },
  KEY_RESULT_TYPES: ['Metric', 'Milestone', 'Binary'],
  MAX_KEY_RESULTS: 5
};

// Create New Objective
function createObjective() {
  const ui = SpreadsheetApp.getUi();

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      label { display: block; margin-top: 10px; font-weight: bold; }
      input, select, textarea { width: 100%; padding: 8px; margin-top: 5px; box-sizing: border-box; }
      button { margin-top: 20px; padding: 10px 20px; background: #2979FF; color: white; border: none; cursor: pointer; width: 100%; }
      .tip { font-size: 12px; color: #666; margin-top: 5px; }
    </style>

    <label>Objective Title:</label>
    <input type="text" id="title" placeholder="e.g., Become the market leader in AI infrastructure">
    <p class="tip">Start with a verb. Make it ambitious but achievable.</p>

    <label>Level:</label>
    <select id="level">
      ${CONFIG.LEVELS.map(l => '<option>' + l + '</option>').join('')}
    </select>

    <label>Team (if Team/Individual):</label>
    <select id="team">
      <option value="">N/A - Company Level</option>
      ${CONFIG.TEAMS.map(t => '<option>' + t + '</option>').join('')}
    </select>

    <label>Owner:</label>
    <input type="text" id="owner" placeholder="Name or email">

    <label>Quarter:</label>
    <select id="quarter">
      <option>${CONFIG.CURRENT_QUARTER}</option>
      <option>Q2 2024</option>
      <option>Q3 2024</option>
      <option>Q4 2024</option>
    </select>

    <label>Parent Objective (for alignment):</label>
    <input type="text" id="parent" placeholder="OBJ-XXXX or leave blank for top-level">

    <label>Description:</label>
    <textarea id="description" rows="2" placeholder="Why is this objective important?"></textarea>

    <button onclick="submitObjective()">Create Objective</button>

    <script>
      function submitObjective() {
        const data = {
          title: document.getElementById('title').value,
          level: document.getElementById('level').value,
          team: document.getElementById('team').value,
          owner: document.getElementById('owner').value,
          quarter: document.getElementById('quarter').value,
          parent: document.getElementById('parent').value,
          description: document.getElementById('description').value
        };
        google.script.run.withSuccessHandler(() => {
          google.script.host.close();
        }).processObjective(data);
      }
    </script>
  `).setWidth(450).setHeight(550);

  ui.showModalDialog(html, '🎯 Create New Objective');
}

function processObjective(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Objectives') ||
    SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  const lastRow = Math.max(sheet.getLastRow(), 1);
  const id = 'OBJ-' + data.quarter.replace(' ', '-') + '-' + String(lastRow).padStart(3, '0');

  sheet.appendRow([
    id,
    data.title,
    data.level,
    data.team,
    data.owner,
    data.quarter,
    data.parent,
    0,  // Progress
    0,  // Score
    'Active',
    data.description,
    new Date(),
    ''  // Key Results count
  ]);

  // Color code by level
  const levelColors = {
    'Company': '#E3F2FD',
    'Team': '#E8F5E9',
    'Individual': '#FFF3E0'
  };
  sheet.getRange(sheet.getLastRow(), 1, 1, 13).setBackground(levelColors[data.level] || '#FFFFFF');

  SpreadsheetApp.getUi().alert('✅ Objective created!\n\nID: ' + id + '\n\nNow add Key Results using "Add Key Result"');
}

// Add Key Result
function addKeyResult() {
  const ui = SpreadsheetApp.getUi();

  const objResponse = ui.prompt('Enter Objective ID (e.g., OBJ-Q1-2024-001):', ui.ButtonSet.OK_CANCEL);
  if (objResponse.getSelectedButton() !== ui.Button.OK) return;
  const objectiveId = objResponse.getResponseText().trim();

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      label { display: block; margin-top: 10px; font-weight: bold; }
      input, select { width: 100%; padding: 8px; margin-top: 5px; box-sizing: border-box; }
      button { margin-top: 20px; padding: 10px 20px; background: #2979FF; color: white; border: none; cursor: pointer; width: 100%; }
      .row { display: flex; gap: 10px; }
      .col { flex: 1; }
      .tip { font-size: 12px; color: #666; margin-top: 5px; }
    </style>

    <p><b>Objective:</b> ${objectiveId}</p>

    <label>Key Result Description:</label>
    <input type="text" id="description" placeholder="e.g., Increase MRR from $50K to $100K">
    <p class="tip">Make it measurable with a clear target.</p>

    <label>Type:</label>
    <select id="type">
      <option value="Metric">Metric (numeric target)</option>
      <option value="Milestone">Milestone (date-based)</option>
      <option value="Binary">Binary (yes/no)</option>
    </select>

    <div class="row">
      <div class="col">
        <label>Start Value:</label>
        <input type="number" id="startValue" value="0">
      </div>
      <div class="col">
        <label>Target Value:</label>
        <input type="number" id="targetValue" value="100">
      </div>
    </div>

    <label>Current Value:</label>
    <input type="number" id="currentValue" value="0">

    <label>Unit:</label>
    <input type="text" id="unit" placeholder="e.g., $, %, users, deals">

    <label>Owner:</label>
    <input type="text" id="owner" placeholder="Name or email">

    <label>Due Date:</label>
    <input type="date" id="dueDate">

    <button onclick="submitKeyResult()">Add Key Result</button>

    <script>
      function submitKeyResult() {
        const data = {
          objectiveId: '${objectiveId}',
          description: document.getElementById('description').value,
          type: document.getElementById('type').value,
          startValue: parseFloat(document.getElementById('startValue').value),
          targetValue: parseFloat(document.getElementById('targetValue').value),
          currentValue: parseFloat(document.getElementById('currentValue').value),
          unit: document.getElementById('unit').value,
          owner: document.getElementById('owner').value,
          dueDate: document.getElementById('dueDate').value
        };
        google.script.run.withSuccessHandler(() => {
          google.script.host.close();
        }).processKeyResult(data);
      }
    </script>
  `).setWidth(450).setHeight(550);

  ui.showModalDialog(html, '📊 Add Key Result');
}

function processKeyResult(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Get or create Key Results sheet
  let krSheet = ss.getSheetByName('Key Results');
  if (!krSheet) {
    krSheet = ss.insertSheet('Key Results');
    krSheet.getRange(1, 1, 1, 12).setValues([['KR ID', 'Objective ID', 'Description', 'Type', 'Start', 'Target', 'Current', 'Unit', 'Progress %', 'Score', 'Owner', 'Due Date']]);
    krSheet.getRange(1, 1, 1, 12).setFontWeight('bold').setBackground('#2979FF').setFontColor('white');
  }

  const lastRow = Math.max(krSheet.getLastRow(), 1);
  const krId = 'KR-' + String(lastRow).padStart(3, '0');

  // Calculate progress
  const range = data.targetValue - data.startValue;
  const progress = range !== 0 ? (data.currentValue - data.startValue) / range : 0;
  const progressPct = Math.min(Math.max(progress, 0), 1);

  krSheet.appendRow([
    krId,
    data.objectiveId,
    data.description,
    data.type,
    data.startValue,
    data.targetValue,
    data.currentValue,
    data.unit,
    progressPct,
    progressPct, // Initial score = progress
    data.owner,
    data.dueDate
  ]);

  // Color code by progress
  const newRow = krSheet.getLastRow();
  if (progressPct >= CONFIG.SCORE_THRESHOLDS.green) {
    krSheet.getRange(newRow, 1, 1, 12).setBackground('#C8E6C9');
  } else if (progressPct >= CONFIG.SCORE_THRESHOLDS.yellow) {
    krSheet.getRange(newRow, 1, 1, 12).setBackground('#FFF9C4');
  } else {
    krSheet.getRange(newRow, 1, 1, 12).setBackground('#FFCDD2');
  }

  // Format progress column
  krSheet.getRange(newRow, 9).setNumberFormat('0%');

  SpreadsheetApp.getUi().alert('✅ Key Result added!\n\nKR ID: ' + krId + '\nProgress: ' + Math.round(progressPct * 100) + '%');
}

// Update Progress
function updateProgress() {
  const ui = SpreadsheetApp.getUi();

  const krResponse = ui.prompt('Enter Key Result ID (e.g., KR-001):', ui.ButtonSet.OK_CANCEL);
  if (krResponse.getSelectedButton() !== ui.Button.OK) return;
  const krId = krResponse.getResponseText().trim();

  const valueResponse = ui.prompt('Enter new current value:', ui.ButtonSet.OK_CANCEL);
  if (valueResponse.getSelectedButton() !== ui.Button.OK) return;
  const newValue = parseFloat(valueResponse.getResponseText());

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const krSheet = ss.getSheetByName('Key Results');

  if (!krSheet) {
    ui.alert('No Key Results sheet found.');
    return;
  }

  const data = krSheet.getRange(2, 1, krSheet.getLastRow() - 1, 12).getValues();

  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === krId) {
      const row = i + 2;
      const startValue = data[i][4];
      const targetValue = data[i][5];

      // Update current value
      krSheet.getRange(row, 7).setValue(newValue);

      // Recalculate progress
      const range = targetValue - startValue;
      const progress = range !== 0 ? (newValue - startValue) / range : 0;
      const progressPct = Math.min(Math.max(progress, 0), 1);

      krSheet.getRange(row, 9).setValue(progressPct);

      // Update color
      if (progressPct >= CONFIG.SCORE_THRESHOLDS.green) {
        krSheet.getRange(row, 1, 1, 12).setBackground('#C8E6C9');
      } else if (progressPct >= CONFIG.SCORE_THRESHOLDS.yellow) {
        krSheet.getRange(row, 1, 1, 12).setBackground('#FFF9C4');
      } else {
        krSheet.getRange(row, 1, 1, 12).setBackground('#FFCDD2');
      }

      ui.alert('✅ Progress updated!\n\n' + krId + '\nNew Value: ' + newValue + '\nProgress: ' + Math.round(progressPct * 100) + '%');
      return;
    }
  }

  ui.alert('❌ Key Result not found: ' + krId);
}

// Weekly Check-in
function weeklyCheckin() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const krSheet = ss.getSheetByName('Key Results');

  if (!krSheet || krSheet.getLastRow() < 2) {
    ui.alert('No Key Results to check in on.');
    return;
  }

  // Get or create Check-ins sheet
  let checkinSheet = ss.getSheetByName('Weekly Check-ins');
  if (!checkinSheet) {
    checkinSheet = ss.insertSheet('Weekly Check-ins');
    checkinSheet.getRange(1, 1, 1, 6).setValues([['Date', 'KR ID', 'Previous', 'Current', 'Notes', 'Confidence']]);
    checkinSheet.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#9C27B0').setFontColor('white');
  }

  const data = krSheet.getRange(2, 1, krSheet.getLastRow() - 1, 12).getValues();
  const today = new Date().toLocaleDateString();

  let checkinCount = 0;

  for (const row of data) {
    const krId = row[0];
    const currentValue = row[6];
    const description = row[2];

    const response = ui.prompt(
      'Check-in: ' + krId + '\n' + description + '\n\nCurrent: ' + currentValue + '\n\nEnter new value (or same to skip):',
      ui.ButtonSet.OK_CANCEL
    );

    if (response.getSelectedButton() !== ui.Button.OK) continue;

    const newValue = response.getResponseText().trim();
    if (!newValue || newValue === String(currentValue)) continue;

    const notesResponse = ui.prompt('Notes for this update:', ui.ButtonSet.OK_CANCEL);
    const notes = notesResponse.getSelectedButton() === ui.Button.OK ? notesResponse.getResponseText() : '';

    const confResponse = ui.prompt('Confidence level (1-5, 5 = very confident):', ui.ButtonSet.OK_CANCEL);
    const confidence = confResponse.getSelectedButton() === ui.Button.OK ? parseInt(confResponse.getResponseText()) : 3;

    // Log check-in
    checkinSheet.appendRow([today, krId, currentValue, parseFloat(newValue), notes, confidence]);

    // Update KR
    updateKRValue(krId, parseFloat(newValue));
    checkinCount++;
  }

  ui.alert('✅ Weekly check-in complete!\n\nUpdated ' + checkinCount + ' Key Results.');
}

function updateKRValue(krId, newValue) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const krSheet = ss.getSheetByName('Key Results');
  const data = krSheet.getRange(2, 1, krSheet.getLastRow() - 1, 12).getValues();

  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === krId) {
      const row = i + 2;
      const startValue = data[i][4];
      const targetValue = data[i][5];

      krSheet.getRange(row, 7).setValue(newValue);

      const range = targetValue - startValue;
      const progress = range !== 0 ? (newValue - startValue) / range : 0;
      const progressPct = Math.min(Math.max(progress, 0), 1);

      krSheet.getRange(row, 9).setValue(progressPct);

      if (progressPct >= CONFIG.SCORE_THRESHOLDS.green) {
        krSheet.getRange(row, 1, 1, 12).setBackground('#C8E6C9');
      } else if (progressPct >= CONFIG.SCORE_THRESHOLDS.yellow) {
        krSheet.getRange(row, 1, 1, 12).setBackground('#FFF9C4');
      } else {
        krSheet.getRange(row, 1, 1, 12).setBackground('#FFCDD2');
      }

      return;
    }
  }
}

// Score Key Result
function scoreKeyResult() {
  const ui = SpreadsheetApp.getUi();

  const krResponse = ui.prompt('Enter Key Result ID to score:', ui.ButtonSet.OK_CANCEL);
  if (krResponse.getSelectedButton() !== ui.Button.OK) return;
  const krId = krResponse.getResponseText().trim();

  const scoreResponse = ui.prompt('Enter final score (0.0 to 1.0):\n\n0.0-0.3 = Failed to deliver\n0.4-0.6 = Made progress\n0.7-1.0 = Delivered', ui.ButtonSet.OK_CANCEL);
  if (scoreResponse.getSelectedButton() !== ui.Button.OK) return;
  const score = parseFloat(scoreResponse.getResponseText());

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const krSheet = ss.getSheetByName('Key Results');
  const data = krSheet.getRange(2, 1, krSheet.getLastRow() - 1, 12).getValues();

  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === krId) {
      krSheet.getRange(i + 2, 10).setValue(score);
      ui.alert('✅ Score recorded!\n\n' + krId + ': ' + score.toFixed(1));
      return;
    }
  }

  ui.alert('❌ Key Result not found.');
}

// Company Overview
function companyOverview() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const objSheet = ss.getSheetByName('Objectives');
  const krSheet = ss.getSheetByName('Key Results');

  if (!objSheet || objSheet.getLastRow() < 2) {
    ui.alert('No objectives found.');
    return;
  }

  const objectives = objSheet.getRange(2, 1, objSheet.getLastRow() - 1, 13).getValues();
  const keyResults = krSheet ? krSheet.getRange(2, 1, krSheet.getLastRow() - 1, 12).getValues() : [];

  // Calculate stats
  let stats = {
    total: objectives.length,
    byLevel: { Company: 0, Team: 0, Individual: 0 },
    avgProgress: 0
  };

  for (const obj of objectives) {
    stats.byLevel[obj[2]] = (stats.byLevel[obj[2]] || 0) + 1;
  }

  // Calculate KR progress
  let totalProgress = 0;
  for (const kr of keyResults) {
    totalProgress += kr[8] || 0;
  }
  stats.avgProgress = keyResults.length > 0 ? totalProgress / keyResults.length : 0;

  let report = `
🎯 OKR COMPANY OVERVIEW
=======================
Quarter: ${CONFIG.CURRENT_QUARTER}

OBJECTIVES:
  Total: ${stats.total}
  Company: ${stats.byLevel.Company}
  Team: ${stats.byLevel.Team}
  Individual: ${stats.byLevel.Individual}

KEY RESULTS:
  Total: ${keyResults.length}
  Average Progress: ${Math.round(stats.avgProgress * 100)}%

STATUS:
  ${stats.avgProgress >= 0.7 ? '✅ On Track' : stats.avgProgress >= 0.4 ? '⚠️ Needs Attention' : '❌ At Risk'}
  `;

  ui.alert(report);
}

// Team View
function teamView() {
  const ui = SpreadsheetApp.getUi();

  const teamResponse = ui.prompt('Enter team name:', ui.ButtonSet.OK_CANCEL);
  if (teamResponse.getSelectedButton() !== ui.Button.OK) return;
  const team = teamResponse.getResponseText().trim();

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const objSheet = ss.getSheetByName('Objectives');

  if (!objSheet || objSheet.getLastRow() < 2) {
    ui.alert('No objectives found.');
    return;
  }

  const objectives = objSheet.getRange(2, 1, objSheet.getLastRow() - 1, 13).getValues();
  const teamObjs = objectives.filter(obj => obj[3] === team);

  if (teamObjs.length === 0) {
    ui.alert('No objectives found for team: ' + team);
    return;
  }

  let report = `📊 ${team.toUpperCase()} TEAM OKRs\n${'='.repeat(30)}\n\n`;

  for (const obj of teamObjs) {
    report += `${obj[0]}: ${obj[1]}\n`;
    report += `  Owner: ${obj[4]}\n`;
    report += `  Status: ${obj[9]}\n\n`;
  }

  ui.alert(report);
}

// My OKRs
function myOKRs() {
  const ui = SpreadsheetApp.getUi();

  const ownerResponse = ui.prompt('Enter your name or email:', ui.ButtonSet.OK_CANCEL);
  if (ownerResponse.getSelectedButton() !== ui.Button.OK) return;
  const owner = ownerResponse.getResponseText().trim().toLowerCase();

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const objSheet = ss.getSheetByName('Objectives');
  const krSheet = ss.getSheetByName('Key Results');

  let report = `🎯 MY OKRs\n${'='.repeat(20)}\n\n`;

  if (objSheet && objSheet.getLastRow() > 1) {
    const objectives = objSheet.getRange(2, 1, objSheet.getLastRow() - 1, 13).getValues();
    const myObjs = objectives.filter(obj => obj[4].toLowerCase().includes(owner));

    report += `OBJECTIVES (${myObjs.length}):\n`;
    for (const obj of myObjs) {
      report += `  ${obj[0]}: ${obj[1]}\n`;
    }
  }

  if (krSheet && krSheet.getLastRow() > 1) {
    const keyResults = krSheet.getRange(2, 1, krSheet.getLastRow() - 1, 12).getValues();
    const myKRs = keyResults.filter(kr => kr[10].toLowerCase().includes(owner));

    report += `\nKEY RESULTS (${myKRs.length}):\n`;
    for (const kr of myKRs) {
      report += `  ${kr[0]}: ${kr[2]} - ${Math.round(kr[8] * 100)}%\n`;
    }
  }

  ui.alert(report);
}

// Alignment Map
function alignmentMap() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const objSheet = ss.getSheetByName('Objectives');

  if (!objSheet || objSheet.getLastRow() < 2) {
    ui.alert('No objectives found.');
    return;
  }

  const objectives = objSheet.getRange(2, 1, objSheet.getLastRow() - 1, 13).getValues();

  let report = `🔗 OKR ALIGNMENT MAP\n${'='.repeat(25)}\n\n`;

  // Group by parent
  const topLevel = objectives.filter(obj => !obj[6]);
  const byParent = {};

  for (const obj of objectives) {
    if (obj[6]) {
      if (!byParent[obj[6]]) byParent[obj[6]] = [];
      byParent[obj[6]].push(obj);
    }
  }

  for (const top of topLevel) {
    report += `📌 ${top[0]}: ${top[1]}\n`;
    const children = byParent[top[0]] || [];
    for (const child of children) {
      report += `   └─ ${child[0]}: ${child[1]}\n`;
      const grandchildren = byParent[child[0]] || [];
      for (const gc of grandchildren) {
        report += `      └─ ${gc[0]}: ${gc[1]}\n`;
      }
    }
    report += '\n';
  }

  ui.alert(report);
}

// Start New Quarter
function startNewQuarter() {
  const ui = SpreadsheetApp.getUi();

  const quarterResponse = ui.prompt('Enter new quarter (e.g., Q2 2024):', ui.ButtonSet.OK_CANCEL);
  if (quarterResponse.getSelectedButton() !== ui.Button.OK) return;
  const newQuarter = quarterResponse.getResponseText().trim();

  // Create new objectives sheet for the quarter
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let newSheet = ss.getSheetByName('Objectives ' + newQuarter);

  if (!newSheet) {
    newSheet = ss.insertSheet('Objectives ' + newQuarter);
    newSheet.getRange(1, 1, 1, 13).setValues([['ID', 'Title', 'Level', 'Team', 'Owner', 'Quarter', 'Parent', 'Progress', 'Score', 'Status', 'Description', 'Created', 'Key Results']]);
    newSheet.getRange(1, 1, 1, 13).setFontWeight('bold').setBackground('#2979FF').setFontColor('white');
  }

  ui.alert('✅ New quarter started: ' + newQuarter + '\n\nNew objectives sheet created.');
}

// Quarterly Review
function quarterlyReview() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const krSheet = ss.getSheetByName('Key Results');

  if (!krSheet || krSheet.getLastRow() < 2) {
    ui.alert('No Key Results to review.');
    return;
  }

  const keyResults = krSheet.getRange(2, 1, krSheet.getLastRow() - 1, 12).getValues();

  let totalScore = 0;
  let scoredCount = 0;
  let greenCount = 0;
  let yellowCount = 0;
  let redCount = 0;

  for (const kr of keyResults) {
    const progress = kr[8] || 0;
    totalScore += progress;
    scoredCount++;

    if (progress >= CONFIG.SCORE_THRESHOLDS.green) greenCount++;
    else if (progress >= CONFIG.SCORE_THRESHOLDS.yellow) yellowCount++;
    else redCount++;
  }

  const avgScore = scoredCount > 0 ? totalScore / scoredCount : 0;

  let report = `
📅 QUARTERLY REVIEW
===================
Quarter: ${CONFIG.CURRENT_QUARTER}

OVERALL SCORE: ${(avgScore).toFixed(2)} / 1.0 (${Math.round(avgScore * 100)}%)

KEY RESULTS BREAKDOWN:
  ✅ On Track (70%+): ${greenCount}
  ⚠️ Needs Attention (40-69%): ${yellowCount}
  ❌ At Risk (<40%): ${redCount}

ASSESSMENT:
  ${avgScore >= 0.7 ? '🎉 Excellent quarter! Goals largely achieved.' :
    avgScore >= 0.5 ? '👍 Good progress. Some goals need attention.' :
    avgScore >= 0.3 ? '⚠️ Mixed results. Review and adjust.' :
    '❌ Challenging quarter. Major review needed.'}

NEXT STEPS:
  1. Score all Key Results (use "Score Key Result")
  2. Archive this quarter (use "Archive Quarter")
  3. Start new quarter (use "Start New Quarter")
  `;

  ui.alert(report);
}

// Archive Quarter
function archiveQuarter() {
  const ui = SpreadsheetApp.getUi();

  const response = ui.alert('Archive Quarter', 'This will mark all current OKRs as archived and create a snapshot.\n\nContinue?', ui.ButtonSet.YES_NO);

  if (response !== ui.Button.YES) return;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const objSheet = ss.getSheetByName('Objectives');

  if (objSheet && objSheet.getLastRow() > 1) {
    for (let row = 2; row <= objSheet.getLastRow(); row++) {
      objSheet.getRange(row, 10).setValue('Archived');
      objSheet.getRange(row, 1, 1, 13).setBackground('#ECEFF1');
    }
  }

  ui.alert('✅ Quarter archived!\n\nUse "Start New Quarter" to begin fresh.');
}

// Send OKR Report
function sendOKRReport() {
  const ui = SpreadsheetApp.getUi();

  const emailResponse = ui.prompt('Send OKR report to:', ui.ButtonSet.OK_CANCEL);
  if (emailResponse.getSelectedButton() !== ui.Button.OK) return;
  const email = emailResponse.getResponseText();

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const krSheet = ss.getSheetByName('Key Results');

  let avgProgress = 0;
  let krCount = 0;

  if (krSheet && krSheet.getLastRow() > 1) {
    const keyResults = krSheet.getRange(2, 1, krSheet.getLastRow() - 1, 12).getValues();
    for (const kr of keyResults) {
      avgProgress += kr[8] || 0;
      krCount++;
    }
    avgProgress = krCount > 0 ? avgProgress / krCount : 0;
  }

  const subject = CONFIG.COMPANY_NAME + ' - OKR Report ' + CONFIG.CURRENT_QUARTER;
  const body = `
${CONFIG.COMPANY_NAME} OKR REPORT
================================
Quarter: ${CONFIG.CURRENT_QUARTER}

Key Results: ${krCount}
Average Progress: ${Math.round(avgProgress * 100)}%

Status: ${avgProgress >= 0.7 ? '✅ On Track' : avgProgress >= 0.4 ? '⚠️ Needs Attention' : '❌ At Risk'}

View full OKRs: ${ss.getUrl()}

--
Generated by BlackRoad OS OKR Tracker
  `;

  MailApp.sendEmail(email, subject, body);
  ui.alert('✅ OKR report sent to ' + email);
}

// Settings
function openOKRSettings() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      h3 { color: #2979FF; }
    </style>
    <h3>⚙️ OKR Settings</h3>
    <p><b>Company:</b> ${CONFIG.COMPANY_NAME}</p>
    <p><b>Current Quarter:</b> ${CONFIG.CURRENT_QUARTER}</p>
    <p><b>Score Thresholds:</b></p>
    <ul>
      <li>Green (On Track): 70%+</li>
      <li>Yellow (Attention): 40-69%</li>
      <li>Red (At Risk): Below 40%</li>
    </ul>
    <p><b>Teams:</b> ${CONFIG.TEAMS.join(', ')}</p>
    <p><b>Levels:</b> ${CONFIG.LEVELS.join(' → ')}</p>
    <p><b>To customize:</b> Edit CONFIG in Apps Script</p>
  `).setWidth(400).setHeight(350);

  SpreadsheetApp.getUi().showModalDialog(html, '⚙️ Settings');
}
