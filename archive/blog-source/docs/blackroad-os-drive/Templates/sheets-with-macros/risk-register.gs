/**
 * BlackRoad OS - Risk Register & Mitigation
 * Enterprise risk management with mitigation tracking
 *
 * Features:
 * - Risk identification and categorization
 * - Probability x Impact scoring (Risk Matrix)
 * - Mitigation planning and tracking
 * - Risk owner assignment
 * - Trend analysis
 * - Audit trail
 * - Executive summary reports
 */

const CONFIG = {
  COMPANY_NAME: 'BlackRoad OS, Inc.',

  RISK_CATEGORIES: [
    'Strategic',
    'Operational',
    'Financial',
    'Compliance',
    'Technology',
    'Cybersecurity',
    'Reputational',
    'Legal',
    'HR/People',
    'Third Party/Vendor',
    'Environmental'
  ],

  PROBABILITY_LEVELS: {
    'Rare': { value: 1, description: '< 10% chance', color: '#E8F5E9' },
    'Unlikely': { value: 2, description: '10-25% chance', color: '#C8E6C9' },
    'Possible': { value: 3, description: '25-50% chance', color: '#FFF9C4' },
    'Likely': { value: 4, description: '50-75% chance', color: '#FFE0B2' },
    'Almost Certain': { value: 5, description: '> 75% chance', color: '#FFCDD2' }
  },

  IMPACT_LEVELS: {
    'Negligible': { value: 1, description: 'Minimal impact', color: '#E8F5E9' },
    'Minor': { value: 2, description: 'Some impact, manageable', color: '#C8E6C9' },
    'Moderate': { value: 3, description: 'Significant impact', color: '#FFF9C4' },
    'Major': { value: 4, description: 'Severe impact', color: '#FFE0B2' },
    'Catastrophic': { value: 5, description: 'Existential threat', color: '#FFCDD2' }
  },

  RISK_RATINGS: {
    'Critical': { min: 20, color: '#B71C1C', textColor: 'white' },
    'High': { min: 12, color: '#F44336', textColor: 'white' },
    'Medium': { min: 6, color: '#FF9800', textColor: 'black' },
    'Low': { min: 1, color: '#4CAF50', textColor: 'white' }
  },

  STATUSES: ['Identified', 'Assessing', 'Mitigating', 'Monitoring', 'Closed', 'Accepted'],

  RESPONSE_TYPES: ['Avoid', 'Transfer', 'Mitigate', 'Accept'],

  REVIEW_FREQUENCY_DAYS: 30
};

/**
 * Creates custom menu on spreadsheet open
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('⚠️ Risk Register')
    .addItem('➕ Add New Risk', 'showAddRiskDialog')
    .addItem('📝 Update Risk', 'showUpdateRiskDialog')
    .addSeparator()
    .addSubMenu(ui.createMenu('📊 Risk Analysis')
      .addItem('Calculate All Risk Scores', 'calculateAllRiskScores')
      .addItem('View Risk Matrix', 'showRiskMatrix')
      .addItem('View Heat Map', 'showHeatMap')
      .addItem('Risk Trend Analysis', 'showTrendAnalysis'))
    .addSeparator()
    .addSubMenu(ui.createMenu('🎯 Mitigation')
      .addItem('Add Mitigation Action', 'showAddMitigationDialog')
      .addItem('View Mitigation Status', 'showMitigationStatus')
      .addItem('Overdue Actions Report', 'showOverdueActions'))
    .addSeparator()
    .addSubMenu(ui.createMenu('📋 Reports')
      .addItem('Executive Summary', 'generateExecutiveSummary')
      .addItem('Risk by Category', 'showRiskByCategory')
      .addItem('Top 10 Risks', 'showTop10Risks')
      .addItem('Export Risk Report', 'exportRiskReport'))
    .addSeparator()
    .addSubMenu(ui.createMenu('🔔 Alerts')
      .addItem('Check Review Dates', 'checkReviewDates')
      .addItem('Send Risk Alerts', 'sendRiskAlerts')
      .addItem('Configure Alerts', 'configureAlerts'))
    .addSeparator()
    .addItem('📖 Risk Matrix Guide', 'showRiskMatrixGuide')
    .addItem('⚙️ Settings', 'showSettings')
    .addToUi();
}

/**
 * Shows dialog to add new risk
 */
function showAddRiskDialog() {
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
      .risk-calc { background: #FFF3E0; padding: 15px; border-radius: 8px; margin: 15px 0; }
      .score { font-size: 24px; font-weight: bold; text-align: center; padding: 10px; border-radius: 8px; }
    </style>

    <h2>➕ Add New Risk</h2>

    <div class="form-group">
      <label>Risk Title *</label>
      <input type="text" id="title" placeholder="Brief risk description">
    </div>

    <div class="row">
      <div class="form-group">
        <label>Category *</label>
        <select id="category">
          ${CONFIG.RISK_CATEGORIES.map(c => '<option>' + c + '</option>').join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Risk Owner *</label>
        <input type="text" id="owner" placeholder="Name or email">
      </div>
    </div>

    <div class="form-group">
      <label>Description</label>
      <textarea id="description" placeholder="Detailed description of the risk and potential consequences..."></textarea>
    </div>

    <div class="risk-calc">
      <h3>Risk Assessment</h3>
      <div class="row">
        <div class="form-group">
          <label>Probability</label>
          <select id="probability" onchange="calculateScore()">
            ${Object.entries(CONFIG.PROBABILITY_LEVELS).map(([k,v]) =>
              '<option value="' + v.value + '">' + k + ' (' + v.description + ')</option>'
            ).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Impact</label>
          <select id="impact" onchange="calculateScore()">
            ${Object.entries(CONFIG.IMPACT_LEVELS).map(([k,v]) =>
              '<option value="' + v.value + '">' + k + ' (' + v.description + ')</option>'
            ).join('')}
          </select>
        </div>
      </div>
      <div id="score-display" class="score">Risk Score: 1</div>
    </div>

    <div class="row">
      <div class="form-group">
        <label>Response Type</label>
        <select id="response">
          ${CONFIG.RESPONSE_TYPES.map(r => '<option>' + r + '</option>').join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Target Date</label>
        <input type="date" id="targetDate">
      </div>
    </div>

    <div class="form-group">
      <label>Initial Mitigation Plan</label>
      <textarea id="mitigation" placeholder="What actions will be taken to address this risk?"></textarea>
    </div>

    <br>
    <button onclick="submitRisk()">Add Risk</button>
    <button class="secondary" onclick="google.script.host.close()">Cancel</button>

    <script>
      function calculateScore() {
        const prob = parseInt(document.getElementById('probability').value);
        const impact = parseInt(document.getElementById('impact').value);
        const score = prob * impact;

        let rating = 'Low';
        let color = '#4CAF50';

        if (score >= 20) { rating = 'Critical'; color = '#B71C1C'; }
        else if (score >= 12) { rating = 'High'; color = '#F44336'; }
        else if (score >= 6) { rating = 'Medium'; color = '#FF9800'; }

        document.getElementById('score-display').innerHTML = 'Risk Score: ' + score + ' (' + rating + ')';
        document.getElementById('score-display').style.background = color;
        document.getElementById('score-display').style.color = score >= 6 ? 'white' : 'black';
      }

      function submitRisk() {
        const data = {
          title: document.getElementById('title').value,
          category: document.getElementById('category').value,
          owner: document.getElementById('owner').value,
          description: document.getElementById('description').value,
          probability: document.getElementById('probability').value,
          impact: document.getElementById('impact').value,
          response: document.getElementById('response').value,
          targetDate: document.getElementById('targetDate').value,
          mitigation: document.getElementById('mitigation').value
        };

        if (!data.title || !data.owner) {
          alert('Please fill in required fields');
          return;
        }

        google.script.run
          .withSuccessHandler(() => {
            alert('Risk added successfully!');
            google.script.host.close();
          })
          .withFailureHandler(err => alert('Error: ' + err))
          .addRisk(data);
      }

      calculateScore(); // Initial calculation
    </script>
  `)
  .setWidth(550)
  .setHeight(700);

  SpreadsheetApp.getUi().showModalDialog(html, 'Add New Risk');
}

/**
 * Adds a risk to the register
 */
function addRisk(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Risk Register');

  if (!sheet) {
    sheet = ss.insertSheet('Risk Register');
    sheet.appendRow(['Risk ID', 'Title', 'Category', 'Description', 'Owner', 'Status',
                     'Probability', 'Impact', 'Risk Score', 'Rating', 'Response Type',
                     'Mitigation Plan', 'Target Date', 'Created', 'Last Review', 'Next Review',
                     'Trend', 'Notes']);
    sheet.getRange(1, 1, 1, 18).setFontWeight('bold').setBackground('#E8EAF6');
  }

  // Generate ID
  const lastRow = sheet.getLastRow();
  const idNum = lastRow > 1 ? lastRow : 1;
  const id = 'RISK-' + String(idNum).padStart(4, '0');

  // Calculate risk score and rating
  const probability = parseInt(data.probability);
  const impact = parseInt(data.impact);
  const riskScore = probability * impact;

  let rating = 'Low';
  if (riskScore >= 20) rating = 'Critical';
  else if (riskScore >= 12) rating = 'High';
  else if (riskScore >= 6) rating = 'Medium';

  const today = new Date();
  const nextReview = new Date(today.getTime() + CONFIG.REVIEW_FREQUENCY_DAYS * 24 * 60 * 60 * 1000);

  sheet.appendRow([
    id,
    data.title,
    data.category,
    data.description,
    data.owner,
    'Identified',
    probability,
    impact,
    riskScore,
    rating,
    data.response,
    data.mitigation,
    data.targetDate ? new Date(data.targetDate) : '',
    today,
    today,
    nextReview,
    'New',
    ''
  ]);

  // Apply rating color
  const newRow = sheet.getLastRow();
  const ratingConfig = CONFIG.RISK_RATINGS[rating];
  if (ratingConfig) {
    sheet.getRange(newRow, 9, 1, 2).setBackground(ratingConfig.color).setFontColor(ratingConfig.textColor);
  }

  return id;
}

/**
 * Shows dialog to update existing risk
 */
function showUpdateRiskDialog() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Risk Register');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No risk register found.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const activeRisks = data.slice(1).filter(row => row[5] !== 'Closed');

  const riskOptions = activeRisks.map(row =>
    `<option value="${row[0]}">${row[0]} - ${row[1]} (${row[9]})</option>`
  ).join('');

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 15px; }
      label { display: block; margin-bottom: 5px; font-weight: bold; }
      select, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      textarea { height: 80px; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; }
    </style>

    <h2>📝 Update Risk</h2>

    <div class="form-group">
      <label>Select Risk</label>
      <select id="riskId">
        ${riskOptions}
      </select>
    </div>

    <div class="form-group">
      <label>New Status</label>
      <select id="status">
        ${CONFIG.STATUSES.map(s => '<option>' + s + '</option>').join('')}
      </select>
    </div>

    <div class="form-group">
      <label>Trend</label>
      <select id="trend">
        <option value="Stable">Stable - No change</option>
        <option value="Increasing">Increasing - Getting worse</option>
        <option value="Decreasing">Decreasing - Improving</option>
      </select>
    </div>

    <div class="form-group">
      <label>Update Notes</label>
      <textarea id="notes" placeholder="What has changed? Any new developments?"></textarea>
    </div>

    <button onclick="updateRisk()">Update Risk</button>
    <button style="background:#757575" onclick="google.script.host.close()">Cancel</button>

    <script>
      function updateRisk() {
        const data = {
          riskId: document.getElementById('riskId').value,
          status: document.getElementById('status').value,
          trend: document.getElementById('trend').value,
          notes: document.getElementById('notes').value
        };

        google.script.run
          .withSuccessHandler(() => {
            alert('Risk updated!');
            google.script.host.close();
          })
          .withFailureHandler(err => alert('Error: ' + err))
          .updateRisk(data);
      }
    </script>
  `)
  .setWidth(400)
  .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(html, 'Update Risk');
}

/**
 * Updates an existing risk
 */
function updateRisk(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Risk Register');
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.riskId) {
      sheet.getRange(i + 1, 6).setValue(data.status);
      sheet.getRange(i + 1, 15).setValue(new Date()); // Last review
      sheet.getRange(i + 1, 16).setValue(new Date(Date.now() + CONFIG.REVIEW_FREQUENCY_DAYS * 24 * 60 * 60 * 1000)); // Next review
      sheet.getRange(i + 1, 17).setValue(data.trend);

      // Append to notes
      const existingNotes = rows[i][17] || '';
      const timestamp = new Date().toLocaleDateString();
      const newNotes = existingNotes + (existingNotes ? '\n' : '') + '[' + timestamp + '] ' + data.notes;
      sheet.getRange(i + 1, 18).setValue(newNotes);
      break;
    }
  }
}

/**
 * Calculates all risk scores
 */
function calculateAllRiskScores() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Risk Register');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No risk register found.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  let updated = 0;

  for (let i = 1; i < data.length; i++) {
    const probability = parseInt(data[i][6]) || 1;
    const impact = parseInt(data[i][7]) || 1;
    const riskScore = probability * impact;

    let rating = 'Low';
    if (riskScore >= 20) rating = 'Critical';
    else if (riskScore >= 12) rating = 'High';
    else if (riskScore >= 6) rating = 'Medium';

    sheet.getRange(i + 1, 9).setValue(riskScore);
    sheet.getRange(i + 1, 10).setValue(rating);

    // Apply rating color
    const ratingConfig = CONFIG.RISK_RATINGS[rating];
    if (ratingConfig) {
      sheet.getRange(i + 1, 9, 1, 2).setBackground(ratingConfig.color).setFontColor(ratingConfig.textColor);
    }

    updated++;
  }

  SpreadsheetApp.getUi().alert('Updated ' + updated + ' risk scores.');
}

/**
 * Shows visual risk matrix
 */
function showRiskMatrix() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Risk Register');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No risk register found.');
    return;
  }

  const data = sheet.getDataRange().getValues();

  // Initialize matrix
  const matrix = {};
  for (let p = 1; p <= 5; p++) {
    for (let i = 1; i <= 5; i++) {
      matrix[p + '-' + i] = [];
    }
  }

  // Populate matrix
  data.slice(1).forEach(row => {
    if (row[5] !== 'Closed') {
      const key = row[6] + '-' + row[7];
      if (matrix[key]) {
        matrix[key].push(row[0]);
      }
    }
  });

  // Generate HTML
  let html = `
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .matrix { border-collapse: collapse; }
      .matrix td, .matrix th { border: 1px solid #ddd; padding: 10px; text-align: center; min-width: 80px; }
      .matrix th { background: #E8EAF6; }
      .critical { background: #B71C1C; color: white; }
      .high { background: #F44336; color: white; }
      .medium { background: #FF9800; }
      .low { background: #4CAF50; color: white; }
      .risk-id { font-size: 10px; display: block; }
      .y-label { writing-mode: vertical-lr; transform: rotate(180deg); background: #E8EAF6; }
    </style>

    <h2>Risk Matrix</h2>
    <table class="matrix">
      <tr>
        <th></th>
        <th colspan="5">IMPACT</th>
      </tr>
      <tr>
        <th class="y-label" rowspan="6">PROBABILITY</th>
        <th></th>
        <th>Negligible<br>(1)</th>
        <th>Minor<br>(2)</th>
        <th>Moderate<br>(3)</th>
        <th>Major<br>(4)</th>
        <th>Catastrophic<br>(5)</th>
      </tr>
  `;

  const probLabels = ['Almost Certain (5)', 'Likely (4)', 'Possible (3)', 'Unlikely (2)', 'Rare (1)'];

  for (let p = 5; p >= 1; p--) {
    html += `<tr><th>${probLabels[5-p]}</th>`;
    for (let i = 1; i <= 5; i++) {
      const score = p * i;
      let cssClass = 'low';
      if (score >= 20) cssClass = 'critical';
      else if (score >= 12) cssClass = 'high';
      else if (score >= 6) cssClass = 'medium';

      const risks = matrix[p + '-' + i];
      const content = risks.length > 0 ? risks.map(r => '<span class="risk-id">' + r + '</span>').join('') : score;

      html += `<td class="${cssClass}">${content}</td>`;
    }
    html += '</tr>';
  }

  html += '</table>';

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(600)
    .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(output, 'Risk Matrix');
}

/**
 * Shows heat map of risks by category
 */
function showHeatMap() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Risk Register');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No risk register found.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const byCategory = {};

  CONFIG.RISK_CATEGORIES.forEach(cat => {
    byCategory[cat] = { count: 0, totalScore: 0, critical: 0, high: 0, medium: 0, low: 0 };
  });

  data.slice(1).forEach(row => {
    if (row[5] !== 'Closed') {
      const cat = row[2];
      if (byCategory[cat]) {
        byCategory[cat].count++;
        byCategory[cat].totalScore += parseInt(row[8]) || 0;

        const rating = row[9];
        if (rating === 'Critical') byCategory[cat].critical++;
        else if (rating === 'High') byCategory[cat].high++;
        else if (rating === 'Medium') byCategory[cat].medium++;
        else byCategory[cat].low++;
      }
    }
  });

  let html = `
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .category { margin: 10px 0; padding: 15px; border-radius: 8px; }
      .bar { height: 20px; display: flex; border-radius: 4px; overflow: hidden; }
      .bar div { display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; }
      .critical { background: #B71C1C; }
      .high { background: #F44336; }
      .medium { background: #FF9800; color: black; }
      .low { background: #4CAF50; }
      .stats { font-size: 12px; color: #666; margin-top: 5px; }
    </style>

    <h2>Risk Heat Map by Category</h2>
  `;

  Object.entries(byCategory).forEach(([cat, stats]) => {
    if (stats.count === 0) return;

    const avgScore = (stats.totalScore / stats.count).toFixed(1);
    const total = stats.count;

    html += `
      <div class="category" style="background: #f5f5f5;">
        <strong>${cat}</strong> (${stats.count} risks, avg score: ${avgScore})
        <div class="bar">
          ${stats.critical > 0 ? '<div class="critical" style="flex:' + stats.critical + '">' + stats.critical + '</div>' : ''}
          ${stats.high > 0 ? '<div class="high" style="flex:' + stats.high + '">' + stats.high + '</div>' : ''}
          ${stats.medium > 0 ? '<div class="medium" style="flex:' + stats.medium + '">' + stats.medium + '</div>' : ''}
          ${stats.low > 0 ? '<div class="low" style="flex:' + stats.low + '">' + stats.low + '</div>' : ''}
        </div>
      </div>
    `;
  });

  html += '<p><strong>Legend:</strong> <span style="color:#B71C1C">Critical</span> | <span style="color:#F44336">High</span> | <span style="color:#FF9800">Medium</span> | <span style="color:#4CAF50">Low</span></p>';

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(500)
    .setHeight(500);

  SpreadsheetApp.getUi().showModalDialog(output, 'Risk Heat Map');
}

/**
 * Shows trend analysis
 */
function showTrendAnalysis() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Risk Register');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No risk register found.');
    return;
  }

  const data = sheet.getDataRange().getValues();

  let increasing = 0, stable = 0, decreasing = 0, newRisks = 0;

  data.slice(1).forEach(row => {
    if (row[5] !== 'Closed') {
      const trend = row[16];
      if (trend === 'Increasing') increasing++;
      else if (trend === 'Decreasing') decreasing++;
      else if (trend === 'New') newRisks++;
      else stable++;
    }
  });

  const total = increasing + stable + decreasing + newRisks;

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      .metric { background: #E3F2FD; padding: 20px; border-radius: 8px; margin: 10px 0; display: flex; justify-content: space-between; align-items: center; }
      .metric h2 { margin: 0; font-size: 36px; }
      .metric.danger { background: #FFEBEE; }
      .metric.warning { background: #FFF3E0; }
      .metric.success { background: #E8F5E9; }
      .metric.info { background: #E3F2FD; }
    </style>

    <h2>Risk Trend Analysis</h2>

    <div class="metric danger">
      <div>
        <h2>${increasing}</h2>
        <p>Increasing (Getting Worse)</p>
      </div>
      <span style="font-size:40px">📈</span>
    </div>

    <div class="metric info">
      <div>
        <h2>${stable}</h2>
        <p>Stable (No Change)</p>
      </div>
      <span style="font-size:40px">➡️</span>
    </div>

    <div class="metric success">
      <div>
        <h2>${decreasing}</h2>
        <p>Decreasing (Improving)</p>
      </div>
      <span style="font-size:40px">📉</span>
    </div>

    <div class="metric warning">
      <div>
        <h2>${newRisks}</h2>
        <p>New Risks (Not Yet Assessed)</p>
      </div>
      <span style="font-size:40px">🆕</span>
    </div>

    <p><strong>Total Active Risks:</strong> ${total}</p>
  `)
  .setWidth(400)
  .setHeight(450);

  SpreadsheetApp.getUi().showModalDialog(html, 'Trend Analysis');
}

/**
 * Shows dialog to add mitigation action
 */
function showAddMitigationDialog() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Risk Register');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No risk register found.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const activeRisks = data.slice(1).filter(row => row[5] !== 'Closed');

  const riskOptions = activeRisks.map(row =>
    `<option value="${row[0]}">${row[0]} - ${row[1]}</option>`
  ).join('');

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 15px; }
      label { display: block; margin-bottom: 5px; font-weight: bold; }
      input, select, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      textarea { height: 60px; }
      .row { display: flex; gap: 10px; }
      .row .form-group { flex: 1; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; }
    </style>

    <h2>🎯 Add Mitigation Action</h2>

    <div class="form-group">
      <label>Risk</label>
      <select id="riskId">${riskOptions}</select>
    </div>

    <div class="form-group">
      <label>Action Description *</label>
      <textarea id="action" placeholder="Describe the mitigation action..."></textarea>
    </div>

    <div class="row">
      <div class="form-group">
        <label>Assigned To</label>
        <input type="text" id="assignee" placeholder="Name">
      </div>
      <div class="form-group">
        <label>Due Date</label>
        <input type="date" id="dueDate">
      </div>
    </div>

    <div class="form-group">
      <label>Priority</label>
      <select id="priority">
        <option>High</option>
        <option selected>Medium</option>
        <option>Low</option>
      </select>
    </div>

    <button onclick="addAction()">Add Action</button>
    <button style="background:#757575" onclick="google.script.host.close()">Cancel</button>

    <script>
      function addAction() {
        const data = {
          riskId: document.getElementById('riskId').value,
          action: document.getElementById('action').value,
          assignee: document.getElementById('assignee').value,
          dueDate: document.getElementById('dueDate').value,
          priority: document.getElementById('priority').value
        };

        if (!data.action) {
          alert('Please enter an action description');
          return;
        }

        google.script.run
          .withSuccessHandler(() => {
            alert('Action added!');
            google.script.host.close();
          })
          .withFailureHandler(err => alert('Error: ' + err))
          .addMitigationAction(data);
      }
    </script>
  `)
  .setWidth(400)
  .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(html, 'Add Mitigation Action');
}

/**
 * Adds a mitigation action
 */
function addMitigationAction(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Mitigation Actions');

  if (!sheet) {
    sheet = ss.insertSheet('Mitigation Actions');
    sheet.appendRow(['Action ID', 'Risk ID', 'Action', 'Assigned To', 'Due Date', 'Priority', 'Status', 'Created', 'Completed', 'Notes']);
    sheet.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#E8EAF6');
  }

  const lastRow = sheet.getLastRow();
  const actionId = 'ACT-' + String(lastRow > 1 ? lastRow : 1).padStart(4, '0');

  sheet.appendRow([
    actionId,
    data.riskId,
    data.action,
    data.assignee,
    data.dueDate ? new Date(data.dueDate) : '',
    data.priority,
    'Open',
    new Date(),
    '',
    ''
  ]);

  return actionId;
}

/**
 * Shows mitigation status
 */
function showMitigationStatus() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Mitigation Actions');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No mitigation actions found.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  let open = 0, inProgress = 0, completed = 0, overdue = 0;
  const today = new Date();

  data.slice(1).forEach(row => {
    const status = row[6];
    const dueDate = row[4];

    if (status === 'Completed') completed++;
    else if (status === 'In Progress') inProgress++;
    else open++;

    if (status !== 'Completed' && dueDate && new Date(dueDate) < today) {
      overdue++;
    }
  });

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      .metric { display: inline-block; width: 45%; background: #f5f5f5; padding: 20px; margin: 5px; border-radius: 8px; text-align: center; }
      .metric h2 { margin: 0; font-size: 36px; color: #1976D2; }
      .metric.danger h2 { color: #F44336; }
      .metric.success h2 { color: #4CAF50; }
    </style>

    <h2>Mitigation Action Status</h2>

    <div class="metric">
      <h2>${open}</h2>
      <p>Open</p>
    </div>

    <div class="metric">
      <h2>${inProgress}</h2>
      <p>In Progress</p>
    </div>

    <div class="metric success">
      <h2>${completed}</h2>
      <p>Completed</p>
    </div>

    <div class="metric danger">
      <h2>${overdue}</h2>
      <p>Overdue</p>
    </div>

    <p><strong>Total Actions:</strong> ${data.length - 1}</p>
  `)
  .setWidth(350)
  .setHeight(350);

  SpreadsheetApp.getUi().showModalDialog(html, 'Mitigation Status');
}

/**
 * Shows overdue actions report
 */
function showOverdueActions() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Mitigation Actions');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No mitigation actions found.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const today = new Date();
  const overdue = [];

  data.slice(1).forEach(row => {
    if (row[6] !== 'Completed' && row[4] && new Date(row[4]) < today) {
      overdue.push({
        actionId: row[0],
        riskId: row[1],
        action: row[2],
        assignee: row[3],
        dueDate: row[4]
      });
    }
  });

  if (overdue.length === 0) {
    SpreadsheetApp.getUi().alert('No overdue actions! All on track.');
    return;
  }

  let html = '<style>body{font-family:Arial,sans-serif;padding:15px;} .action{background:#FFEBEE;padding:15px;margin:10px 0;border-radius:8px;border-left:4px solid #F44336;} .action h4{margin:0 0 5px;} .action p{margin:0;color:#666;}</style>';

  html += `<h2>⚠️ Overdue Actions (${overdue.length})</h2>`;

  overdue.forEach(item => {
    const daysOverdue = Math.ceil((today - new Date(item.dueDate)) / (1000 * 60 * 60 * 24));
    html += `
      <div class="action">
        <h4>${item.actionId}: ${item.action.substring(0, 50)}${item.action.length > 50 ? '...' : ''}</h4>
        <p><strong>Risk:</strong> ${item.riskId} | <strong>Assigned:</strong> ${item.assignee || 'Unassigned'}</p>
        <p><strong>Due:</strong> ${new Date(item.dueDate).toLocaleDateString()} (${daysOverdue} days overdue)</p>
      </div>
    `;
  });

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(500)
    .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(output, 'Overdue Actions');
}

/**
 * Generates executive summary
 */
function generateExecutiveSummary() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Risk Register');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No risk register found.');
    return;
  }

  const data = sheet.getDataRange().getValues();

  let total = 0, critical = 0, high = 0, medium = 0, low = 0;
  let increasing = 0, decreasing = 0;

  data.slice(1).forEach(row => {
    if (row[5] !== 'Closed') {
      total++;
      const rating = row[9];
      if (rating === 'Critical') critical++;
      else if (rating === 'High') high++;
      else if (rating === 'Medium') medium++;
      else low++;

      if (row[16] === 'Increasing') increasing++;
      else if (row[16] === 'Decreasing') decreasing++;
    }
  });

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      .header { background: #1976D2; color: white; padding: 20px; margin: -20px -20px 20px; }
      .header h1 { margin: 0; }
      .header p { margin: 5px 0 0; opacity: 0.8; }
      .metrics { display: flex; flex-wrap: wrap; gap: 10px; }
      .metric { flex: 1; min-width: 100px; background: #f5f5f5; padding: 15px; border-radius: 8px; text-align: center; }
      .metric h2 { margin: 0; font-size: 28px; }
      .metric.critical { background: #FFEBEE; color: #B71C1C; }
      .metric.high { background: #FBE9E7; color: #E64A19; }
      .summary { margin-top: 20px; padding: 15px; background: #E3F2FD; border-radius: 8px; }
      ul { margin: 10px 0; }
    </style>

    <div class="header">
      <h1>Risk Executive Summary</h1>
      <p>${CONFIG.COMPANY_NAME} | ${new Date().toLocaleDateString()}</p>
    </div>

    <div class="metrics">
      <div class="metric">
        <h2>${total}</h2>
        <p>Total Active</p>
      </div>
      <div class="metric critical">
        <h2>${critical}</h2>
        <p>Critical</p>
      </div>
      <div class="metric high">
        <h2>${high}</h2>
        <p>High</p>
      </div>
      <div class="metric">
        <h2>${medium}</h2>
        <p>Medium</p>
      </div>
      <div class="metric">
        <h2>${low}</h2>
        <p>Low</p>
      </div>
    </div>

    <div class="summary">
      <h3>Key Insights</h3>
      <ul>
        <li><strong>${critical + high}</strong> risks require immediate attention (Critical + High)</li>
        <li><strong>${increasing}</strong> risks are trending worse</li>
        <li><strong>${decreasing}</strong> risks are improving</li>
        ${critical > 0 ? '<li style="color:#B71C1C"><strong>Action Required:</strong> ' + critical + ' critical risk(s) need immediate mitigation</li>' : ''}
      </ul>
    </div>
  `)
  .setWidth(500)
  .setHeight(450);

  SpreadsheetApp.getUi().showModalDialog(html, 'Executive Summary');
}

/**
 * Shows top 10 risks
 */
function showTop10Risks() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Risk Register');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No risk register found.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const activeRisks = data.slice(1)
    .filter(row => row[5] !== 'Closed')
    .sort((a, b) => (parseInt(b[8]) || 0) - (parseInt(a[8]) || 0))
    .slice(0, 10);

  let html = '<style>body{font-family:Arial,sans-serif;padding:15px;} table{width:100%;border-collapse:collapse;} th,td{border:1px solid #ddd;padding:10px;text-align:left;} th{background:#E8EAF6;} .critical{background:#FFCDD2;} .high{background:#FFE0B2;} .medium{background:#FFF9C4;}</style>';

  html += '<h2>Top 10 Risks by Score</h2>';
  html += '<table><tr><th>Rank</th><th>ID</th><th>Title</th><th>Score</th><th>Rating</th></tr>';

  activeRisks.forEach((row, i) => {
    const rating = row[9];
    let cssClass = '';
    if (rating === 'Critical') cssClass = 'critical';
    else if (rating === 'High') cssClass = 'high';
    else if (rating === 'Medium') cssClass = 'medium';

    html += `<tr class="${cssClass}">
      <td>${i + 1}</td>
      <td>${row[0]}</td>
      <td>${row[1]}</td>
      <td>${row[8]}</td>
      <td>${row[9]}</td>
    </tr>`;
  });

  html += '</table>';

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(550)
    .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(output, 'Top 10 Risks');
}

/**
 * Shows risks by category
 */
function showRiskByCategory() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Risk Register');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No risk register found.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const byCategory = {};

  data.slice(1).forEach(row => {
    if (row[5] !== 'Closed') {
      const cat = row[2];
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push({ id: row[0], title: row[1], score: row[8], rating: row[9] });
    }
  });

  let html = '<style>body{font-family:Arial,sans-serif;padding:15px;} .category{margin:15px 0;} .category h3{background:#1976D2;color:white;padding:10px;margin:0;} .risks{border:1px solid #ddd;padding:10px;} .risk{padding:5px;border-bottom:1px solid #eee;display:flex;justify-content:space-between;} .score{font-weight:bold;}</style>';

  html += '<h2>Risks by Category</h2>';

  Object.entries(byCategory).sort((a, b) => b[1].length - a[1].length).forEach(([cat, risks]) => {
    html += `
      <div class="category">
        <h3>${cat} (${risks.length})</h3>
        <div class="risks">
          ${risks.sort((a, b) => b.score - a.score).map(r =>
            `<div class="risk"><span>${r.id}: ${r.title}</span><span class="score">${r.score} (${r.rating})</span></div>`
          ).join('')}
        </div>
      </div>
    `;
  });

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(550)
    .setHeight(500);

  SpreadsheetApp.getUi().showModalDialog(output, 'Risks by Category');
}

/**
 * Checks risks due for review
 */
function checkReviewDates() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Risk Register');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No risk register found.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const today = new Date();
  const overdueReviews = [];

  data.slice(1).forEach(row => {
    if (row[5] !== 'Closed' && row[15]) {
      const nextReview = new Date(row[15]);
      if (nextReview <= today) {
        overdueReviews.push({
          id: row[0],
          title: row[1],
          owner: row[4],
          nextReview: nextReview
        });
      }
    }
  });

  if (overdueReviews.length === 0) {
    SpreadsheetApp.getUi().alert('All risk reviews are up to date!');
    return;
  }

  SpreadsheetApp.getUi().alert(
    'Overdue Risk Reviews: ' + overdueReviews.length + '\n\n' +
    overdueReviews.slice(0, 10).map(r =>
      r.id + ': ' + r.title + ' (Owner: ' + r.owner + ')'
    ).join('\n')
  );
}

/**
 * Sends risk alert emails
 */
function sendRiskAlerts() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Risk Register');

  if (!sheet) return;

  const data = sheet.getDataRange().getValues();
  const criticalRisks = data.slice(1).filter(row =>
    row[5] !== 'Closed' && row[9] === 'Critical'
  );

  if (criticalRisks.length === 0) {
    SpreadsheetApp.getUi().alert('No critical risks to alert.');
    return;
  }

  // For demo, just show what would be sent
  SpreadsheetApp.getUi().alert(
    'Would send alerts for ' + criticalRisks.length + ' critical risks:\n\n' +
    criticalRisks.map(r => r[0] + ': ' + r[1] + ' (Owner: ' + r[4] + ')').join('\n')
  );
}

/**
 * Configure alerts (placeholder)
 */
function configureAlerts() {
  SpreadsheetApp.getUi().alert(
    'Alert Configuration\n\n' +
    'Edit CONFIG in script editor:\n' +
    '- REVIEW_FREQUENCY_DAYS: ' + CONFIG.REVIEW_FREQUENCY_DAYS + '\n\n' +
    'Set up triggers in Extensions > Apps Script > Triggers'
  );
}

/**
 * Exports risk report
 */
function exportRiskReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Risk Register');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No risk register found.');
    return;
  }

  const url = ss.getUrl().replace(/edit.*$/, '') +
    'export?format=pdf&gid=' + sheet.getSheetId() +
    '&size=letter&portrait=false&fitw=true';

  SpreadsheetApp.getUi().alert(
    'Export Risk Report\n\n' +
    'Open File > Download > PDF to export.\n\n' +
    'Or use Print (Ctrl+P) for formatted output.'
  );
}

/**
 * Shows risk matrix guide
 */
function showRiskMatrixGuide() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      h2 { color: #1976D2; }
      table { border-collapse: collapse; width: 100%; margin: 15px 0; }
      th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
      th { background: #E3F2FD; }
      .formula { background: #FFF9C4; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 16px; margin: 15px 0; }
      .rating { padding: 5px 10px; border-radius: 4px; color: white; display: inline-block; }
      .critical { background: #B71C1C; }
      .high { background: #F44336; }
      .medium { background: #FF9800; color: black; }
      .low { background: #4CAF50; }
    </style>

    <h2>Risk Matrix Guide</h2>

    <div class="formula">
      <strong>Risk Score = Probability × Impact</strong>
    </div>

    <h3>Probability Levels</h3>
    <table>
      <tr><th>Level</th><th>Value</th><th>Description</th></tr>
      <tr><td>Rare</td><td>1</td><td>Less than 10% chance</td></tr>
      <tr><td>Unlikely</td><td>2</td><td>10-25% chance</td></tr>
      <tr><td>Possible</td><td>3</td><td>25-50% chance</td></tr>
      <tr><td>Likely</td><td>4</td><td>50-75% chance</td></tr>
      <tr><td>Almost Certain</td><td>5</td><td>Greater than 75% chance</td></tr>
    </table>

    <h3>Impact Levels</h3>
    <table>
      <tr><th>Level</th><th>Value</th><th>Description</th></tr>
      <tr><td>Negligible</td><td>1</td><td>Minimal impact</td></tr>
      <tr><td>Minor</td><td>2</td><td>Some impact, manageable</td></tr>
      <tr><td>Moderate</td><td>3</td><td>Significant impact</td></tr>
      <tr><td>Major</td><td>4</td><td>Severe impact</td></tr>
      <tr><td>Catastrophic</td><td>5</td><td>Existential threat</td></tr>
    </table>

    <h3>Risk Ratings</h3>
    <p>
      <span class="rating critical">Critical: 20-25</span>
      <span class="rating high">High: 12-19</span>
      <span class="rating medium">Medium: 6-11</span>
      <span class="rating low">Low: 1-5</span>
    </p>
  `)
  .setWidth(500)
  .setHeight(550);

  SpreadsheetApp.getUi().showModalDialog(html, 'Risk Matrix Guide');
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
      <label>Company Name</label>
      <input type="text" value="${CONFIG.COMPANY_NAME}" disabled>
    </div>

    <div class="setting">
      <label>Review Frequency (days)</label>
      <input type="number" value="${CONFIG.REVIEW_FREQUENCY_DAYS}" disabled>
    </div>

    <div class="setting">
      <label>Risk Categories</label>
      <input type="text" value="${CONFIG.RISK_CATEGORIES.length} categories" disabled>
    </div>

    <p><em>Edit CONFIG in Extensions > Apps Script to customize.</em></p>

    <button onclick="google.script.host.close()">Close</button>
  `)
  .setWidth(350)
  .setHeight(300);

  SpreadsheetApp.getUi().showModalDialog(html, 'Settings');
}
