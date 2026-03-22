/**
 * BlackRoad OS - Product Roadmap & Sprint Planning
 * Enterprise product management with agile sprint tracking
 *
 * Features:
 * - Product roadmap with quarters/releases
 * - Feature requests and prioritization (RICE scoring)
 * - Sprint planning and velocity tracking
 * - Epic/Story/Task hierarchy
 * - Release notes generation
 * - Burndown charts
 * - Team capacity planning
 */

const CONFIG = {
  COMPANY_NAME: 'BlackRoad OS, Inc.',
  CURRENT_QUARTER: 'Q1 2024',
  SPRINT_LENGTH_DAYS: 14,
  VELOCITY_SPRINTS_TO_AVERAGE: 3,

  ROADMAP_QUARTERS: ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024', 'Q1 2025'],

  ITEM_TYPES: ['Epic', 'Feature', 'Story', 'Task', 'Bug', 'Tech Debt'],

  PRIORITIES: {
    'P0 - Critical': { color: '#FFCDD2', weight: 100 },
    'P1 - High': { color: '#FFE0B2', weight: 75 },
    'P2 - Medium': { color: '#FFF9C4', weight: 50 },
    'P3 - Low': { color: '#E8F5E9', weight: 25 }
  },

  STATUSES: ['Backlog', 'Ready', 'In Sprint', 'In Progress', 'In Review', 'Done', 'Blocked', 'Cancelled'],

  TEAMS: ['Platform', 'Frontend', 'Backend', 'Mobile', 'DevOps', 'Data', 'Design'],

  STORY_POINTS: [1, 2, 3, 5, 8, 13, 21],

  RICE_WEIGHTS: {
    reach: 1,
    impact: 1,
    confidence: 1,
    effort: 1
  }
};

/**
 * Creates custom menu on spreadsheet open
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🗺️ Roadmap')
    .addItem('📝 Add Feature Request', 'showAddFeatureDialog')
    .addItem('🎯 Add to Sprint', 'showAddToSprintDialog')
    .addSeparator()
    .addSubMenu(ui.createMenu('📊 RICE Scoring')
      .addItem('Calculate RICE Scores', 'calculateRICEScores')
      .addItem('Sort by RICE Score', 'sortByRICEScore')
      .addItem('RICE Score Guide', 'showRICEGuide'))
    .addSeparator()
    .addSubMenu(ui.createMenu('🏃 Sprint Management')
      .addItem('Create New Sprint', 'createNewSprint')
      .addItem('Close Current Sprint', 'closeCurrentSprint')
      .addItem('Calculate Velocity', 'calculateVelocity')
      .addItem('Generate Burndown', 'generateBurndown'))
    .addSeparator()
    .addSubMenu(ui.createMenu('📅 Roadmap')
      .addItem('View Quarterly Roadmap', 'showQuarterlyRoadmap')
      .addItem('Generate Release Notes', 'generateReleaseNotes')
      .addItem('Export Roadmap PDF', 'exportRoadmapPDF'))
    .addSeparator()
    .addSubMenu(ui.createMenu('📈 Reports')
      .addItem('Team Velocity Report', 'showVelocityReport')
      .addItem('Capacity Planning', 'showCapacityPlanning')
      .addItem('Feature Completion Rate', 'showCompletionRate')
      .addItem('Blocked Items Report', 'showBlockedItems'))
    .addSeparator()
    .addItem('⚙️ Settings', 'showSettings')
    .addToUi();
}

/**
 * Shows dialog to add new feature request
 */
function showAddFeatureDialog() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 15px; }
      label { display: block; margin-bottom: 5px; font-weight: bold; }
      input, select, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      textarea { height: 80px; }
      .row { display: flex; gap: 10px; }
      .row .form-group { flex: 1; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; }
      button:hover { background: #3367d6; }
      button.secondary { background: #757575; }
      .rice-section { background: #f5f5f5; padding: 15px; border-radius: 8px; margin-top: 15px; }
      .rice-section h3 { margin-top: 0; }
    </style>

    <h2>📝 Add Feature Request</h2>

    <div class="form-group">
      <label>Title *</label>
      <input type="text" id="title" placeholder="Brief feature description">
    </div>

    <div class="row">
      <div class="form-group">
        <label>Type</label>
        <select id="type">
          ${CONFIG.ITEM_TYPES.map(t => '<option>' + t + '</option>').join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Priority</label>
        <select id="priority">
          ${Object.keys(CONFIG.PRIORITIES).map(p => '<option>' + p + '</option>').join('')}
        </select>
      </div>
    </div>

    <div class="row">
      <div class="form-group">
        <label>Team</label>
        <select id="team">
          <option value="">-- Select Team --</option>
          ${CONFIG.TEAMS.map(t => '<option>' + t + '</option>').join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Target Quarter</label>
        <select id="quarter">
          <option value="">-- Unscheduled --</option>
          ${CONFIG.ROADMAP_QUARTERS.map(q => '<option>' + q + '</option>').join('')}
        </select>
      </div>
    </div>

    <div class="form-group">
      <label>Description</label>
      <textarea id="description" placeholder="Detailed description of the feature..."></textarea>
    </div>

    <div class="rice-section">
      <h3>RICE Score (Optional)</h3>
      <div class="row">
        <div class="form-group">
          <label>Reach (users/quarter)</label>
          <input type="number" id="reach" placeholder="1000">
        </div>
        <div class="form-group">
          <label>Impact (0.25-3)</label>
          <select id="impact">
            <option value="3">3 - Massive</option>
            <option value="2">2 - High</option>
            <option value="1" selected>1 - Medium</option>
            <option value="0.5">0.5 - Low</option>
            <option value="0.25">0.25 - Minimal</option>
          </select>
        </div>
      </div>
      <div class="row">
        <div class="form-group">
          <label>Confidence %</label>
          <select id="confidence">
            <option value="100">100% - High</option>
            <option value="80" selected>80% - Medium</option>
            <option value="50">50% - Low</option>
          </select>
        </div>
        <div class="form-group">
          <label>Effort (person-weeks)</label>
          <input type="number" id="effort" placeholder="4">
        </div>
      </div>
    </div>

    <div class="form-group">
      <label>Requestor</label>
      <input type="text" id="requestor" placeholder="Name or email">
    </div>

    <br>
    <button onclick="submitFeature()">Add Feature</button>
    <button class="secondary" onclick="google.script.host.close()">Cancel</button>

    <script>
      function submitFeature() {
        const data = {
          title: document.getElementById('title').value,
          type: document.getElementById('type').value,
          priority: document.getElementById('priority').value,
          team: document.getElementById('team').value,
          quarter: document.getElementById('quarter').value,
          description: document.getElementById('description').value,
          reach: document.getElementById('reach').value,
          impact: document.getElementById('impact').value,
          confidence: document.getElementById('confidence').value,
          effort: document.getElementById('effort').value,
          requestor: document.getElementById('requestor').value
        };

        if (!data.title) {
          alert('Please enter a title');
          return;
        }

        google.script.run
          .withSuccessHandler(() => {
            alert('Feature added successfully!');
            google.script.host.close();
          })
          .withFailureHandler(err => alert('Error: ' + err))
          .addFeatureRequest(data);
      }
    </script>
  `)
  .setWidth(500)
  .setHeight(650);

  SpreadsheetApp.getUi().showModalDialog(html, 'Add Feature Request');
}

/**
 * Adds a feature request to the backlog
 */
function addFeatureRequest(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Backlog');

  if (!sheet) {
    sheet = ss.insertSheet('Backlog');
    sheet.appendRow(['ID', 'Title', 'Type', 'Priority', 'Status', 'Team', 'Quarter', 'Story Points',
                     'Reach', 'Impact', 'Confidence', 'Effort', 'RICE Score', 'Description',
                     'Requestor', 'Created', 'Sprint', 'Epic']);
    sheet.getRange(1, 1, 1, 18).setFontWeight('bold').setBackground('#E8EAF6');
  }

  // Generate ID
  const lastRow = sheet.getLastRow();
  const idNum = lastRow > 1 ? lastRow : 1;
  const id = 'FEAT-' + String(idNum).padStart(4, '0');

  // Calculate RICE score
  let riceScore = '';
  if (data.reach && data.effort) {
    const reach = parseFloat(data.reach) || 0;
    const impact = parseFloat(data.impact) || 1;
    const confidence = parseFloat(data.confidence) / 100 || 0.8;
    const effort = parseFloat(data.effort) || 1;
    riceScore = Math.round((reach * impact * confidence) / effort);
  }

  sheet.appendRow([
    id,
    data.title,
    data.type,
    data.priority,
    'Backlog',
    data.team,
    data.quarter,
    '', // Story points
    data.reach,
    data.impact,
    data.confidence,
    data.effort,
    riceScore,
    data.description,
    data.requestor,
    new Date(),
    '', // Sprint
    ''  // Epic
  ]);

  // Apply priority color
  const newRow = sheet.getLastRow();
  if (CONFIG.PRIORITIES[data.priority]) {
    sheet.getRange(newRow, 1, 1, 18).setBackground(CONFIG.PRIORITIES[data.priority].color);
  }

  return id;
}

/**
 * Shows dialog to add items to sprint
 */
function showAddToSprintDialog() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const backlogSheet = ss.getSheetByName('Backlog');
  const sprintSheet = ss.getSheetByName('Sprints');

  if (!backlogSheet) {
    SpreadsheetApp.getUi().alert('No backlog found. Add features first.');
    return;
  }

  // Get ready items
  const data = backlogSheet.getDataRange().getValues();
  const readyItems = data.slice(1).filter(row =>
    row[4] === 'Backlog' || row[4] === 'Ready'
  );

  // Get current sprint
  let currentSprint = 'Sprint 1';
  if (sprintSheet) {
    const sprintData = sprintSheet.getDataRange().getValues();
    const activeSprint = sprintData.find(row => row[2] === 'Active');
    if (activeSprint) currentSprint = activeSprint[0];
  }

  const itemOptions = readyItems.map(row =>
    `<option value="${row[0]}">${row[0]} - ${row[1]} (${row[7] || '?'} pts)</option>`
  ).join('');

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 15px; }
      label { display: block; margin-bottom: 5px; font-weight: bold; }
      select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
      select[multiple] { height: 200px; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; }
      button:hover { background: #3367d6; }
      .info { background: #E3F2FD; padding: 10px; border-radius: 4px; margin-bottom: 15px; }
    </style>

    <h2>🎯 Add to Sprint</h2>

    <div class="info">
      <strong>Current Sprint:</strong> ${currentSprint}<br>
      <strong>Available Items:</strong> ${readyItems.length}
    </div>

    <div class="form-group">
      <label>Select Items to Add (Ctrl+Click for multiple)</label>
      <select id="items" multiple>
        ${itemOptions}
      </select>
    </div>

    <button onclick="addToSprint()">Add to Sprint</button>
    <button style="background:#757575" onclick="google.script.host.close()">Cancel</button>

    <script>
      function addToSprint() {
        const select = document.getElementById('items');
        const selected = Array.from(select.selectedOptions).map(o => o.value);

        if (selected.length === 0) {
          alert('Please select at least one item');
          return;
        }

        google.script.run
          .withSuccessHandler(() => {
            alert(selected.length + ' items added to sprint!');
            google.script.host.close();
          })
          .withFailureHandler(err => alert('Error: ' + err))
          .addItemsToSprint(selected, '${currentSprint}');
      }
    </script>
  `)
  .setWidth(400)
  .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(html, 'Add to Sprint');
}

/**
 * Adds selected items to current sprint
 */
function addItemsToSprint(itemIds, sprintName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const backlogSheet = ss.getSheetByName('Backlog');
  const data = backlogSheet.getDataRange().getValues();

  itemIds.forEach(id => {
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === id) {
        backlogSheet.getRange(i + 1, 5).setValue('In Sprint');
        backlogSheet.getRange(i + 1, 17).setValue(sprintName);
        break;
      }
    }
  });
}

/**
 * Creates a new sprint
 */
function createNewSprint() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sprintSheet = ss.getSheetByName('Sprints');

  if (!sprintSheet) {
    sprintSheet = ss.insertSheet('Sprints');
    sprintSheet.appendRow(['Sprint', 'Start Date', 'Status', 'End Date', 'Planned Points',
                           'Completed Points', 'Velocity', 'Goal', 'Notes']);
    sprintSheet.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#E8EAF6');
  }

  // Calculate next sprint number
  const data = sprintSheet.getDataRange().getValues();
  const sprintNum = data.length;
  const sprintName = 'Sprint ' + sprintNum;

  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + CONFIG.SPRINT_LENGTH_DAYS * 24 * 60 * 60 * 1000);

  // Close any active sprints
  for (let i = 1; i < data.length; i++) {
    if (data[i][2] === 'Active') {
      sprintSheet.getRange(i + 1, 3).setValue('Closed');
    }
  }

  sprintSheet.appendRow([
    sprintName,
    startDate,
    'Active',
    endDate,
    0, // Planned points
    0, // Completed points
    '', // Velocity
    '', // Goal
    ''  // Notes
  ]);

  SpreadsheetApp.getUi().alert('Created: ' + sprintName + '\nEnd Date: ' + endDate.toDateString());
}

/**
 * Closes current sprint and calculates velocity
 */
function closeCurrentSprint() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sprintSheet = ss.getSheetByName('Sprints');
  const backlogSheet = ss.getSheetByName('Backlog');

  if (!sprintSheet) {
    SpreadsheetApp.getUi().alert('No sprints found.');
    return;
  }

  const sprintData = sprintSheet.getDataRange().getValues();
  let activeSprintRow = -1;
  let activeSprintName = '';

  for (let i = 1; i < sprintData.length; i++) {
    if (sprintData[i][2] === 'Active') {
      activeSprintRow = i + 1;
      activeSprintName = sprintData[i][0];
      break;
    }
  }

  if (activeSprintRow === -1) {
    SpreadsheetApp.getUi().alert('No active sprint found.');
    return;
  }

  // Calculate completed points
  const backlogData = backlogSheet.getDataRange().getValues();
  let completedPoints = 0;
  let plannedPoints = 0;

  for (let i = 1; i < backlogData.length; i++) {
    if (backlogData[i][16] === activeSprintName) {
      const points = parseInt(backlogData[i][7]) || 0;
      plannedPoints += points;
      if (backlogData[i][4] === 'Done') {
        completedPoints += points;
      }
    }
  }

  // Update sprint
  sprintSheet.getRange(activeSprintRow, 3).setValue('Closed');
  sprintSheet.getRange(activeSprintRow, 4).setValue(new Date());
  sprintSheet.getRange(activeSprintRow, 5).setValue(plannedPoints);
  sprintSheet.getRange(activeSprintRow, 6).setValue(completedPoints);
  sprintSheet.getRange(activeSprintRow, 7).setValue(completedPoints); // Velocity = completed

  SpreadsheetApp.getUi().alert(
    activeSprintName + ' Closed!\n\n' +
    'Planned: ' + plannedPoints + ' points\n' +
    'Completed: ' + completedPoints + ' points\n' +
    'Velocity: ' + completedPoints
  );
}

/**
 * Calculates RICE scores for all items
 */
function calculateRICEScores() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Backlog');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No backlog found.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  let updated = 0;

  for (let i = 1; i < data.length; i++) {
    const reach = parseFloat(data[i][8]) || 0;
    const impact = parseFloat(data[i][9]) || 1;
    const confidence = parseFloat(data[i][10]) / 100 || 0.8;
    const effort = parseFloat(data[i][11]) || 1;

    if (reach > 0 && effort > 0) {
      const riceScore = Math.round((reach * impact * confidence) / effort);
      sheet.getRange(i + 1, 13).setValue(riceScore);
      updated++;
    }
  }

  SpreadsheetApp.getUi().alert('Updated ' + updated + ' RICE scores.');
}

/**
 * Sorts backlog by RICE score
 */
function sortByRICEScore() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Backlog');

  if (!sheet || sheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('No items to sort.');
    return;
  }

  const range = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn());
  range.sort({column: 13, ascending: false});

  SpreadsheetApp.getUi().alert('Backlog sorted by RICE score (highest first).');
}

/**
 * Shows RICE scoring guide
 */
function showRICEGuide() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      h2 { color: #1976D2; }
      table { border-collapse: collapse; width: 100%; margin: 15px 0; }
      th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
      th { background: #E3F2FD; }
      .formula { background: #FFF9C4; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 16px; }
      .example { background: #E8F5E9; padding: 15px; border-radius: 8px; margin-top: 15px; }
    </style>

    <h2>RICE Scoring Framework</h2>

    <div class="formula">
      <strong>RICE Score = (Reach × Impact × Confidence) / Effort</strong>
    </div>

    <h3>Components</h3>
    <table>
      <tr><th>Factor</th><th>Description</th><th>Values</th></tr>
      <tr>
        <td><strong>Reach</strong></td>
        <td>Number of users/customers impacted per quarter</td>
        <td>Actual number (e.g., 1000, 5000)</td>
      </tr>
      <tr>
        <td><strong>Impact</strong></td>
        <td>How much will this impact each user?</td>
        <td>3=Massive, 2=High, 1=Medium, 0.5=Low, 0.25=Minimal</td>
      </tr>
      <tr>
        <td><strong>Confidence</strong></td>
        <td>How confident are you in estimates?</td>
        <td>100%=High, 80%=Medium, 50%=Low</td>
      </tr>
      <tr>
        <td><strong>Effort</strong></td>
        <td>Total person-weeks to complete</td>
        <td>Actual estimate (e.g., 2, 4, 8 weeks)</td>
      </tr>
    </table>

    <div class="example">
      <strong>Example:</strong><br>
      Feature: Add dark mode<br>
      Reach: 5000 users | Impact: 1 (medium) | Confidence: 80% | Effort: 2 weeks<br><br>
      RICE = (5000 × 1 × 0.8) / 2 = <strong>2000</strong>
    </div>
  `)
  .setWidth(550)
  .setHeight(500);

  SpreadsheetApp.getUi().showModalDialog(html, 'RICE Scoring Guide');
}

/**
 * Calculates team velocity
 */
function calculateVelocity() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sprintSheet = ss.getSheetByName('Sprints');

  if (!sprintSheet) {
    SpreadsheetApp.getUi().alert('No sprints found.');
    return;
  }

  const data = sprintSheet.getDataRange().getValues();
  const closedSprints = data.slice(1).filter(row => row[2] === 'Closed');

  if (closedSprints.length === 0) {
    SpreadsheetApp.getUi().alert('No closed sprints to calculate velocity.');
    return;
  }

  // Get last N sprints for average
  const recentSprints = closedSprints.slice(-CONFIG.VELOCITY_SPRINTS_TO_AVERAGE);
  const totalVelocity = recentSprints.reduce((sum, sprint) => sum + (parseInt(sprint[6]) || 0), 0);
  const avgVelocity = Math.round(totalVelocity / recentSprints.length);

  SpreadsheetApp.getUi().alert(
    'Team Velocity Analysis\n\n' +
    'Sprints analyzed: ' + recentSprints.length + '\n' +
    'Average velocity: ' + avgVelocity + ' points/sprint\n\n' +
    'Recent sprints:\n' +
    recentSprints.map(s => s[0] + ': ' + s[6] + ' pts').join('\n')
  );
}

/**
 * Generates burndown chart data
 */
function generateBurndown() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sprintSheet = ss.getSheetByName('Sprints');
  const backlogSheet = ss.getSheetByName('Backlog');

  if (!sprintSheet) {
    SpreadsheetApp.getUi().alert('No sprints found.');
    return;
  }

  // Find active sprint
  const sprintData = sprintSheet.getDataRange().getValues();
  const activeSprint = sprintData.find(row => row[2] === 'Active');

  if (!activeSprint) {
    SpreadsheetApp.getUi().alert('No active sprint found.');
    return;
  }

  // Calculate total points in sprint
  const backlogData = backlogSheet.getDataRange().getValues();
  let totalPoints = 0;
  let completedPoints = 0;

  for (let i = 1; i < backlogData.length; i++) {
    if (backlogData[i][16] === activeSprint[0]) {
      const points = parseInt(backlogData[i][7]) || 0;
      totalPoints += points;
      if (backlogData[i][4] === 'Done') {
        completedPoints += points;
      }
    }
  }

  const remainingPoints = totalPoints - completedPoints;
  const startDate = new Date(activeSprint[1]);
  const endDate = new Date(activeSprint[3]);
  const today = new Date();

  const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24));
  const remainingDays = totalDays - elapsedDays;

  // Ideal burndown rate
  const idealBurnRate = totalPoints / totalDays;
  const idealRemaining = Math.max(0, totalPoints - (idealBurnRate * elapsedDays));

  // Create or update burndown sheet
  let burndownSheet = ss.getSheetByName('Burndown');
  if (!burndownSheet) {
    burndownSheet = ss.insertSheet('Burndown');
    burndownSheet.appendRow(['Date', 'Ideal', 'Actual']);
  }

  // Add today's data point
  burndownSheet.appendRow([today, Math.round(idealRemaining), remainingPoints]);

  SpreadsheetApp.getUi().alert(
    'Burndown Updated: ' + activeSprint[0] + '\n\n' +
    'Total points: ' + totalPoints + '\n' +
    'Completed: ' + completedPoints + '\n' +
    'Remaining: ' + remainingPoints + '\n\n' +
    'Day ' + elapsedDays + ' of ' + totalDays + '\n' +
    'Ideal remaining: ' + Math.round(idealRemaining) + '\n' +
    'Actual remaining: ' + remainingPoints + '\n\n' +
    (remainingPoints <= idealRemaining ? '✅ On track!' : '⚠️ Behind schedule')
  );
}

/**
 * Shows quarterly roadmap view
 */
function showQuarterlyRoadmap() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const backlogSheet = ss.getSheetByName('Backlog');

  if (!backlogSheet) {
    SpreadsheetApp.getUi().alert('No backlog found.');
    return;
  }

  const data = backlogSheet.getDataRange().getValues();
  const byQuarter = {};

  CONFIG.ROADMAP_QUARTERS.forEach(q => byQuarter[q] = []);
  byQuarter['Unscheduled'] = [];

  for (let i = 1; i < data.length; i++) {
    const quarter = data[i][6] || 'Unscheduled';
    const item = {
      id: data[i][0],
      title: data[i][1],
      type: data[i][2],
      priority: data[i][3],
      status: data[i][4],
      team: data[i][5]
    };

    if (byQuarter[quarter]) {
      byQuarter[quarter].push(item);
    } else {
      byQuarter['Unscheduled'].push(item);
    }
  }

  let roadmapHtml = '<style>body{font-family:Arial,sans-serif;padding:15px;} .quarter{margin-bottom:20px;} .quarter h3{background:#1976D2;color:white;padding:10px;margin:0;} .items{border:1px solid #ddd;padding:10px;} .item{padding:5px;border-bottom:1px solid #eee;} .item:last-child{border:none;} .tag{display:inline-block;padding:2px 6px;border-radius:3px;font-size:11px;margin-right:5px;} .epic{background:#E1BEE7;} .feature{background:#BBDEFB;} .story{background:#C8E6C9;} .done{text-decoration:line-through;color:#888;}</style>';

  Object.keys(byQuarter).forEach(quarter => {
    const items = byQuarter[quarter];
    roadmapHtml += `
      <div class="quarter">
        <h3>${quarter} (${items.length} items)</h3>
        <div class="items">
          ${items.length === 0 ? '<em>No items scheduled</em>' :
            items.map(item => `
              <div class="item ${item.status === 'Done' ? 'done' : ''}">
                <span class="tag ${item.type.toLowerCase()}">${item.type}</span>
                <strong>${item.id}</strong>: ${item.title}
                ${item.team ? '(' + item.team + ')' : ''}
              </div>
            `).join('')}
        </div>
      </div>
    `;
  });

  const html = HtmlService.createHtmlOutput(roadmapHtml)
    .setWidth(600)
    .setHeight(500);

  SpreadsheetApp.getUi().showModalDialog(html, 'Quarterly Roadmap');
}

/**
 * Generates release notes from completed items
 */
function generateReleaseNotes() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    'Generate Release Notes',
    'Enter version number (e.g., v1.2.0):',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const version = response.getResponseText();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const backlogSheet = ss.getSheetByName('Backlog');

  const data = backlogSheet.getDataRange().getValues();
  const completed = data.slice(1).filter(row => row[4] === 'Done');

  // Group by type
  const byType = {};
  completed.forEach(row => {
    const type = row[2] || 'Other';
    if (!byType[type]) byType[type] = [];
    byType[type].push({ id: row[0], title: row[1], description: row[13] });
  });

  // Generate markdown
  let notes = `# Release Notes - ${version}\n\n`;
  notes += `**Release Date:** ${new Date().toDateString()}\n\n`;

  Object.keys(byType).forEach(type => {
    notes += `## ${type}s\n\n`;
    byType[type].forEach(item => {
      notes += `- **${item.id}**: ${item.title}\n`;
      if (item.description) {
        notes += `  ${item.description}\n`;
      }
    });
    notes += '\n';
  });

  notes += `---\n*Generated by BlackRoad OS Product Roadmap*\n`;

  // Create release notes sheet
  let notesSheet = ss.getSheetByName('Release Notes');
  if (!notesSheet) {
    notesSheet = ss.insertSheet('Release Notes');
  }

  notesSheet.appendRow([version, new Date(), notes]);

  // Show preview
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      pre { background: #f5f5f5; padding: 15px; border-radius: 4px; white-space: pre-wrap; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
    </style>
    <h2>Release Notes Generated</h2>
    <pre>${notes}</pre>
    <button onclick="google.script.host.close()">Close</button>
  `)
  .setWidth(600)
  .setHeight(500);

  ui.showModalDialog(html, 'Release Notes: ' + version);
}

/**
 * Shows velocity report
 */
function showVelocityReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sprintSheet = ss.getSheetByName('Sprints');

  if (!sprintSheet) {
    SpreadsheetApp.getUi().alert('No sprints found.');
    return;
  }

  const data = sprintSheet.getDataRange().getValues();
  const closedSprints = data.slice(1).filter(row => row[2] === 'Closed');

  let chartHtml = '<style>body{font-family:Arial,sans-serif;padding:15px;} .bar{background:#4CAF50;height:30px;margin:5px 0;color:white;display:flex;align-items:center;padding-left:10px;} .sprint{display:flex;align-items:center;margin:5px 0;} .label{width:100px;} .stats{margin-top:20px;background:#f5f5f5;padding:15px;border-radius:8px;}</style>';

  chartHtml += '<h2>Sprint Velocity</h2>';

  const maxVelocity = Math.max(...closedSprints.map(s => parseInt(s[6]) || 0));

  closedSprints.forEach(sprint => {
    const velocity = parseInt(sprint[6]) || 0;
    const width = maxVelocity > 0 ? (velocity / maxVelocity * 100) : 0;
    chartHtml += `
      <div class="sprint">
        <div class="label">${sprint[0]}</div>
        <div class="bar" style="width:${width}%">${velocity} pts</div>
      </div>
    `;
  });

  // Calculate stats
  const velocities = closedSprints.map(s => parseInt(s[6]) || 0);
  const avg = Math.round(velocities.reduce((a, b) => a + b, 0) / velocities.length);
  const max = Math.max(...velocities);
  const min = Math.min(...velocities);

  chartHtml += `
    <div class="stats">
      <strong>Statistics (${velocities.length} sprints)</strong><br>
      Average: ${avg} pts | Max: ${max} pts | Min: ${min} pts
    </div>
  `;

  const html = HtmlService.createHtmlOutput(chartHtml)
    .setWidth(500)
    .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(html, 'Velocity Report');
}

/**
 * Shows capacity planning
 */
function showCapacityPlanning() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sprintSheet = ss.getSheetByName('Sprints');
  const backlogSheet = ss.getSheetByName('Backlog');

  // Calculate average velocity
  let avgVelocity = 0;
  if (sprintSheet) {
    const sprintData = sprintSheet.getDataRange().getValues();
    const closedSprints = sprintData.slice(1).filter(row => row[2] === 'Closed');
    if (closedSprints.length > 0) {
      avgVelocity = Math.round(
        closedSprints.reduce((sum, s) => sum + (parseInt(s[6]) || 0), 0) / closedSprints.length
      );
    }
  }

  // Count backlog points
  let backlogPoints = 0;
  if (backlogSheet) {
    const backlogData = backlogSheet.getDataRange().getValues();
    backlogPoints = backlogData.slice(1).reduce((sum, row) => {
      if (row[4] !== 'Done' && row[4] !== 'Cancelled') {
        return sum + (parseInt(row[7]) || 0);
      }
      return sum;
    }, 0);
  }

  const sprintsNeeded = avgVelocity > 0 ? Math.ceil(backlogPoints / avgVelocity) : 'N/A';
  const weeksNeeded = typeof sprintsNeeded === 'number' ? sprintsNeeded * 2 : 'N/A';

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      .metric { background: #E3F2FD; padding: 20px; border-radius: 8px; margin: 10px 0; text-align: center; }
      .metric h2 { margin: 0; font-size: 36px; color: #1976D2; }
      .metric p { margin: 5px 0 0; color: #666; }
      .timeline { margin-top: 20px; }
    </style>

    <h2>📊 Capacity Planning</h2>

    <div class="metric">
      <h2>${avgVelocity}</h2>
      <p>Average Velocity (pts/sprint)</p>
    </div>

    <div class="metric">
      <h2>${backlogPoints}</h2>
      <p>Total Backlog Points</p>
    </div>

    <div class="metric">
      <h2>${sprintsNeeded}</h2>
      <p>Sprints to Complete Backlog</p>
    </div>

    <div class="metric">
      <h2>${weeksNeeded}</h2>
      <p>Estimated Weeks</p>
    </div>

    <div class="timeline">
      <p><em>Based on ${CONFIG.SPRINT_LENGTH_DAYS}-day sprints and current velocity.</em></p>
    </div>
  `)
  .setWidth(350)
  .setHeight(450);

  SpreadsheetApp.getUi().showModalDialog(html, 'Capacity Planning');
}

/**
 * Shows completion rate report
 */
function showCompletionRate() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const backlogSheet = ss.getSheetByName('Backlog');

  if (!backlogSheet) {
    SpreadsheetApp.getUi().alert('No backlog found.');
    return;
  }

  const data = backlogSheet.getDataRange().getValues();
  const statusCounts = {};

  data.slice(1).forEach(row => {
    const status = row[4] || 'Unknown';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  const total = data.length - 1;
  const done = statusCounts['Done'] || 0;
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

  let reportHtml = '<style>body{font-family:Arial,sans-serif;padding:15px;} .progress{background:#E0E0E0;border-radius:10px;height:30px;overflow:hidden;} .progress-bar{background:#4CAF50;height:100%;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;} .status{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee;}</style>';

  reportHtml += `
    <h2>Feature Completion Rate</h2>
    <div class="progress">
      <div class="progress-bar" style="width:${completionRate}%">${completionRate}%</div>
    </div>
    <p><strong>${done}</strong> of <strong>${total}</strong> items completed</p>
    <h3>Status Breakdown</h3>
  `;

  Object.keys(statusCounts).sort().forEach(status => {
    const count = statusCounts[status];
    const pct = Math.round((count / total) * 100);
    reportHtml += `<div class="status"><span>${status}</span><span>${count} (${pct}%)</span></div>`;
  });

  const html = HtmlService.createHtmlOutput(reportHtml)
    .setWidth(400)
    .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(html, 'Completion Rate');
}

/**
 * Shows blocked items report
 */
function showBlockedItems() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const backlogSheet = ss.getSheetByName('Backlog');

  if (!backlogSheet) {
    SpreadsheetApp.getUi().alert('No backlog found.');
    return;
  }

  const data = backlogSheet.getDataRange().getValues();
  const blocked = data.slice(1).filter(row => row[4] === 'Blocked');

  if (blocked.length === 0) {
    SpreadsheetApp.getUi().alert('No blocked items! 🎉');
    return;
  }

  let reportHtml = '<style>body{font-family:Arial,sans-serif;padding:15px;} .item{background:#FFEBEE;padding:15px;margin:10px 0;border-radius:8px;border-left:4px solid #F44336;} .item h4{margin:0 0 5px;} .item p{margin:0;color:#666;}</style>';

  reportHtml += `<h2>⚠️ Blocked Items (${blocked.length})</h2>`;

  blocked.forEach(row => {
    reportHtml += `
      <div class="item">
        <h4>${row[0]}: ${row[1]}</h4>
        <p><strong>Team:</strong> ${row[5] || 'Unassigned'} | <strong>Sprint:</strong> ${row[16] || 'None'}</p>
        ${row[13] ? '<p>' + row[13] + '</p>' : ''}
      </div>
    `;
  });

  const html = HtmlService.createHtmlOutput(reportHtml)
    .setWidth(500)
    .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(html, 'Blocked Items');
}

/**
 * Exports roadmap to PDF
 */
function exportRoadmapPDF() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const backlogSheet = ss.getSheetByName('Backlog');

  if (!backlogSheet) {
    SpreadsheetApp.getUi().alert('No backlog to export.');
    return;
  }

  // Create PDF
  const url = ss.getUrl().replace(/edit.*$/, '') +
    'export?format=pdf&gid=' + backlogSheet.getSheetId() +
    '&size=letter&portrait=false&fitw=true';

  SpreadsheetApp.getUi().alert(
    'PDF Export\n\n' +
    'Open this URL in a new tab to download:\n\n' +
    url.substring(0, 50) + '...\n\n' +
    '(Full URL copied to clipboard not available in Apps Script)'
  );
}

/**
 * Shows settings dialog
 */
function showSettings() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .setting { margin-bottom: 15px; }
      label { display: block; font-weight: bold; margin-bottom: 5px; }
      input, select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
      .info { background: #E3F2FD; padding: 10px; border-radius: 4px; margin-bottom: 15px; }
    </style>

    <h2>⚙️ Settings</h2>

    <div class="info">
      Edit CONFIG in script editor for full customization.
    </div>

    <div class="setting">
      <label>Company Name</label>
      <input type="text" value="${CONFIG.COMPANY_NAME}" disabled>
    </div>

    <div class="setting">
      <label>Sprint Length (days)</label>
      <input type="number" value="${CONFIG.SPRINT_LENGTH_DAYS}" disabled>
    </div>

    <div class="setting">
      <label>Story Point Options</label>
      <input type="text" value="${CONFIG.STORY_POINTS.join(', ')}" disabled>
    </div>

    <div class="setting">
      <label>Teams</label>
      <input type="text" value="${CONFIG.TEAMS.join(', ')}" disabled>
    </div>

    <p><em>To modify settings, go to Extensions > Apps Script and edit the CONFIG object.</em></p>

    <button onclick="google.script.host.close()">Close</button>
  `)
  .setWidth(400)
  .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(html, 'Settings');
}
