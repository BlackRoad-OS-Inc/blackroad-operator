/**
 * BLACKROAD OS - Vendor Scoring & Management System
 *
 * SETUP: Extensions > Apps Script > Paste this code > Save > Refresh sheet
 *
 * FEATURES:
 * - Vendor evaluation scorecards
 * - Weighted criteria scoring
 * - RFP/RFI tracking
 * - Contract value tracking
 * - Performance monitoring
 * - Risk assessment
 * - Compliance verification
 * - Vendor comparison reports
 * - Renewal tracking
 */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🏢 Vendor Tools')
    .addItem('➕ Add New Vendor', 'addVendor')
    .addItem('📊 Score Vendor', 'scoreVendor')
    .addSeparator()
    .addSubMenu(ui.createMenu('📋 Evaluation')
      .addItem('Create Scorecard', 'createScorecard')
      .addItem('Run Evaluation', 'runEvaluation')
      .addItem('Compare Vendors', 'compareVendors')
      .addItem('Generate RFP', 'generateRFP'))
    .addSeparator()
    .addSubMenu(ui.createMenu('📈 Performance')
      .addItem('Update Performance Metrics', 'updatePerformance')
      .addItem('SLA Tracking', 'slaTracking')
      .addItem('Issue Log', 'issueLog'))
    .addSeparator()
    .addSubMenu(ui.createMenu('⚠️ Risk & Compliance')
      .addItem('Risk Assessment', 'riskAssessment')
      .addItem('Compliance Checklist', 'complianceChecklist')
      .addItem('Security Review', 'securityReview'))
    .addSeparator()
    .addItem('🔔 Renewal Alerts', 'renewalAlerts')
    .addItem('📧 Send Vendor Report', 'sendVendorReport')
    .addItem('⚙️ Settings', 'openVendorSettings')
    .addToUi();
}

const CONFIG = {
  COMPANY_NAME: 'BlackRoad OS, Inc.',
  CATEGORIES: ['SaaS/Software', 'Cloud Infrastructure', 'Professional Services', 'Hardware', 'Marketing', 'Legal', 'HR Services', 'Security', 'Other'],
  EVALUATION_CRITERIA: {
    'Price/Value': { weight: 0.20, description: 'Cost competitiveness and value for money' },
    'Quality': { weight: 0.20, description: 'Product/service quality and reliability' },
    'Support': { weight: 0.15, description: 'Customer support responsiveness and quality' },
    'Security': { weight: 0.15, description: 'Security certifications and practices' },
    'Scalability': { weight: 0.10, description: 'Ability to scale with our needs' },
    'Integration': { weight: 0.10, description: 'Integration capabilities with existing systems' },
    'Reputation': { weight: 0.10, description: 'Market reputation and stability' }
  },
  RISK_LEVELS: ['Critical', 'High', 'Medium', 'Low'],
  STATUS_OPTIONS: ['Prospect', 'Evaluating', 'Approved', 'Active', 'On Hold', 'Terminated'],
  RENEWAL_ALERT_DAYS: 60
};

// Add New Vendor
function addVendor() {
  const ui = SpreadsheetApp.getUi();

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      label { display: block; margin-top: 10px; font-weight: bold; }
      input, select, textarea { width: 100%; padding: 8px; margin-top: 5px; box-sizing: border-box; }
      button { margin-top: 20px; padding: 10px 20px; background: #2979FF; color: white; border: none; cursor: pointer; }
      .row { display: flex; gap: 10px; }
      .col { flex: 1; }
    </style>

    <label>Vendor Name:</label>
    <input type="text" id="name" placeholder="Acme Corp">

    <label>Category:</label>
    <select id="category">
      ${CONFIG.CATEGORIES.map(c => '<option>' + c + '</option>').join('')}
    </select>

    <label>Primary Contact:</label>
    <input type="text" id="contact" placeholder="John Smith">

    <label>Contact Email:</label>
    <input type="email" id="email" placeholder="john@acme.com">

    <label>Contact Phone:</label>
    <input type="tel" id="phone" placeholder="+1 555-0100">

    <label>Website:</label>
    <input type="url" id="website" placeholder="https://acme.com">

    <div class="row">
      <div class="col">
        <label>Contract Value ($):</label>
        <input type="number" id="value" value="0">
      </div>
      <div class="col">
        <label>Contract Term:</label>
        <select id="term">
          <option>Monthly</option>
          <option>Annual</option>
          <option>2 Year</option>
          <option>3 Year</option>
          <option>One-time</option>
        </select>
      </div>
    </div>

    <label>Contract End Date:</label>
    <input type="date" id="endDate">

    <label>Products/Services:</label>
    <textarea id="products" rows="2" placeholder="List products or services provided"></textarea>

    <label>Notes:</label>
    <textarea id="notes" rows="2" placeholder="Additional notes"></textarea>

    <button onclick="submitVendor()">Add Vendor</button>

    <script>
      function submitVendor() {
        const data = {
          name: document.getElementById('name').value,
          category: document.getElementById('category').value,
          contact: document.getElementById('contact').value,
          email: document.getElementById('email').value,
          phone: document.getElementById('phone').value,
          website: document.getElementById('website').value,
          value: parseFloat(document.getElementById('value').value),
          term: document.getElementById('term').value,
          endDate: document.getElementById('endDate').value,
          products: document.getElementById('products').value,
          notes: document.getElementById('notes').value
        };
        google.script.run.withSuccessHandler(() => {
          google.script.host.close();
        }).processVendor(data);
      }
    </script>
  `).setWidth(450).setHeight(700);

  ui.showModalDialog(html, '➕ Add New Vendor');
}

function processVendor(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = Math.max(sheet.getLastRow(), 1);
  const id = 'VEN-' + new Date().getFullYear() + '-' + String(lastRow).padStart(4, '0');

  sheet.appendRow([
    id,
    data.name,
    data.category,
    data.contact,
    data.email,
    data.phone,
    data.website,
    data.value,
    data.term,
    data.endDate,
    'Prospect',
    0, // Overall Score
    '',
    data.products,
    data.notes,
    new Date()
  ]);

  // Color code by category
  const categoryColors = {
    'SaaS/Software': '#E3F2FD',
    'Cloud Infrastructure': '#E8F5E9',
    'Professional Services': '#FFF3E0',
    'Hardware': '#F3E5F5',
    'Marketing': '#FCE4EC',
    'Legal': '#FFEBEE',
    'HR Services': '#E0F7FA',
    'Security': '#FFF8E1',
    'Other': '#ECEFF1'
  };

  sheet.getRange(sheet.getLastRow(), 1, 1, 16).setBackground(categoryColors[data.category] || '#FFFFFF');

  SpreadsheetApp.getUi().alert('✅ Vendor added!\n\nVendor ID: ' + id + '\nUse "Score Vendor" to evaluate.');
}

// Score Vendor
function scoreVendor() {
  const ui = SpreadsheetApp.getUi();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const row = sheet.getActiveRange().getRow();

  if (row < 2) {
    ui.alert('Please select a vendor row first.');
    return;
  }

  const vendorName = sheet.getRange(row, 2).getValue();

  const criteriaHtml = Object.entries(CONFIG.EVALUATION_CRITERIA).map(([criterion, data]) => `
    <div style="margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 4px;">
      <label style="font-weight: bold;">${criterion} (${data.weight * 100}%)</label>
      <p style="font-size: 12px; color: #666; margin: 5px 0;">${data.description}</p>
      <select id="score_${criterion.replace(/[^a-zA-Z]/g, '')}" style="width: 100%; padding: 8px;">
        <option value="5">5 - Excellent</option>
        <option value="4">4 - Good</option>
        <option value="3" selected>3 - Average</option>
        <option value="2">2 - Below Average</option>
        <option value="1">1 - Poor</option>
      </select>
    </div>
  `).join('');

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      h3 { color: #2979FF; margin-bottom: 20px; }
      button { margin-top: 20px; padding: 10px 20px; background: #2979FF; color: white; border: none; cursor: pointer; width: 100%; }
    </style>

    <h3>Score: ${vendorName}</h3>
    ${criteriaHtml}

    <label style="display: block; margin-top: 15px; font-weight: bold;">Comments:</label>
    <textarea id="comments" rows="3" style="width: 100%; padding: 8px; box-sizing: border-box;"></textarea>

    <button onclick="submitScores()">Save Scores</button>

    <script>
      function submitScores() {
        const scores = {};
        ${Object.keys(CONFIG.EVALUATION_CRITERIA).map(c => `scores['${c}'] = parseInt(document.getElementById('score_${c.replace(/[^a-zA-Z]/g, '')}').value);`).join('\n')}
        scores.comments = document.getElementById('comments').value;
        scores.row = ${row};
        google.script.run.withSuccessHandler(() => {
          google.script.host.close();
        }).processScores(scores);
      }
    </script>
  `).setWidth(450).setHeight(600);

  ui.showModalDialog(html, '📊 Score Vendor');
}

function processScores(scores) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // Calculate weighted score
  let weightedScore = 0;
  let scoreBreakdown = [];

  for (const [criterion, data] of Object.entries(CONFIG.EVALUATION_CRITERIA)) {
    const score = scores[criterion] || 3;
    weightedScore += score * data.weight;
    scoreBreakdown.push(criterion + ': ' + score + '/5');
  }

  // Normalize to 100
  const finalScore = Math.round(weightedScore * 20);

  // Update sheet
  sheet.getRange(scores.row, 12).setValue(finalScore);
  sheet.getRange(scores.row, 13).setValue(scoreBreakdown.join(', ') + (scores.comments ? '\n\nComments: ' + scores.comments : ''));

  // Update status based on score
  if (finalScore >= 80) {
    sheet.getRange(scores.row, 11).setValue('Approved');
    sheet.getRange(scores.row, 1, 1, 16).setBackground('#C8E6C9');
  } else if (finalScore >= 60) {
    sheet.getRange(scores.row, 11).setValue('Evaluating');
    sheet.getRange(scores.row, 1, 1, 16).setBackground('#FFF9C4');
  } else {
    sheet.getRange(scores.row, 11).setValue('On Hold');
    sheet.getRange(scores.row, 1, 1, 16).setBackground('#FFCDD2');
  }

  SpreadsheetApp.getUi().alert('✅ Vendor scored!\n\nOverall Score: ' + finalScore + '/100\n\n' + (finalScore >= 80 ? '✅ Recommended for approval' : finalScore >= 60 ? '⚠️ Needs further evaluation' : '❌ Not recommended'));
}

// Create Scorecard
function createScorecard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let scorecardSheet = ss.getSheetByName('Vendor Scorecard');
  if (!scorecardSheet) scorecardSheet = ss.insertSheet('Vendor Scorecard');
  scorecardSheet.clear();

  const headers = ['Criteria', 'Weight', 'Description', 'Vendor A', 'Vendor B', 'Vendor C'];
  const rows = [
    headers,
    ['', '', '', '', '', ''],
    ['=== EVALUATION CRITERIA ===', '', '', '', '', '']
  ];

  for (const [criterion, data] of Object.entries(CONFIG.EVALUATION_CRITERIA)) {
    rows.push([criterion, data.weight, data.description, '', '', '']);
  }

  rows.push(['', '', '', '', '', '']);
  rows.push(['WEIGHTED SCORE', '', '', '=SUMPRODUCT(B4:B10,D4:D10)*20', '=SUMPRODUCT(B4:B10,E4:E10)*20', '=SUMPRODUCT(B4:B10,F4:F10)*20']);
  rows.push(['RECOMMENDATION', '', '', '=IF(D12>=80,"✅ Approve",IF(D12>=60,"⚠️ Review","❌ Reject"))', '=IF(E12>=80,"✅ Approve",IF(E12>=60,"⚠️ Review","❌ Reject"))', '=IF(F12>=80,"✅ Approve",IF(F12>=60,"⚠️ Review","❌ Reject"))']);

  scorecardSheet.getRange(1, 1, rows.length, 6).setValues(rows);
  scorecardSheet.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#2979FF').setFontColor('white');
  scorecardSheet.getRange(3, 1, 1, 6).setFontWeight('bold').setBackground('#E3F2FD');
  scorecardSheet.getRange(12, 1, 2, 6).setFontWeight('bold');

  SpreadsheetApp.getUi().alert('✅ Scorecard created!\n\nEnter vendor names in row 1 and scores (1-5) for each criterion.');
}

// Run Evaluation
function runEvaluation() {
  const ui = SpreadsheetApp.getUi();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    ui.alert('No vendors to evaluate.');
    return;
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 16).getValues();

  let evaluated = 0;
  let approved = 0;
  let onHold = 0;

  for (let i = 0; i < data.length; i++) {
    const score = data[i][11];
    if (score > 0) {
      evaluated++;
      if (score >= 80) approved++;
      else if (score < 60) onHold++;
    }
  }

  const report = `
📊 VENDOR EVALUATION SUMMARY
============================

Total Vendors: ${data.length}
Evaluated: ${evaluated}
Not Evaluated: ${data.length - evaluated}

SCORE DISTRIBUTION:
  ✅ Approved (80+): ${approved}
  ⚠️ Under Review (60-79): ${evaluated - approved - onHold}
  ❌ On Hold (<60): ${onHold}

Approval Rate: ${evaluated > 0 ? Math.round(approved / evaluated * 100) : 0}%
  `;

  ui.alert(report);
}

// Compare Vendors
function compareVendors() {
  const ui = SpreadsheetApp.getUi();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow < 3) {
    ui.alert('Need at least 2 vendors to compare.');
    return;
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 16).getValues();

  // Filter to vendors with scores
  const scoredVendors = data.filter(row => row[11] > 0)
    .sort((a, b) => b[11] - a[11])
    .slice(0, 5);

  if (scoredVendors.length < 2) {
    ui.alert('Need at least 2 scored vendors. Use "Score Vendor" first.');
    return;
  }

  let report = '🏆 VENDOR COMPARISON (Top 5)\n============================\n\n';

  for (let i = 0; i < scoredVendors.length; i++) {
    const vendor = scoredVendors[i];
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '  ';

    report += `${medal} ${i + 1}. ${vendor[1]}\n`;
    report += `   Score: ${vendor[11]}/100\n`;
    report += `   Category: ${vendor[2]}\n`;
    report += `   Value: $${(vendor[7] || 0).toLocaleString()}\n\n`;
  }

  ui.alert(report);
}

// Generate RFP
function generateRFP() {
  const ui = SpreadsheetApp.getUi();

  const categoryResponse = ui.prompt('Enter category for RFP:', ui.ButtonSet.OK_CANCEL);
  if (categoryResponse.getSelectedButton() !== ui.Button.OK) return;
  const category = categoryResponse.getResponseText();

  const requirementsResponse = ui.prompt('Enter key requirements (comma-separated):', ui.ButtonSet.OK_CANCEL);
  if (requirementsResponse.getSelectedButton() !== ui.Button.OK) return;
  const requirements = requirementsResponse.getResponseText().split(',').map(r => r.trim());

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let rfpSheet = ss.getSheetByName('RFP Template');
  if (!rfpSheet) rfpSheet = ss.insertSheet('RFP Template');
  rfpSheet.clear();

  const rfpContent = [
    ['REQUEST FOR PROPOSAL (RFP)', ''],
    ['', ''],
    ['Company:', CONFIG.COMPANY_NAME],
    ['Category:', category],
    ['Issue Date:', new Date().toLocaleDateString()],
    ['Response Due:', ''],
    ['', ''],
    ['=== COMPANY OVERVIEW ===', ''],
    ['[Insert company description]', ''],
    ['', ''],
    ['=== PROJECT REQUIREMENTS ===', ''],
    ...requirements.map((r, i) => [i + 1 + '. ' + r, '']),
    ['', ''],
    ['=== EVALUATION CRITERIA ===', ''],
    ...Object.entries(CONFIG.EVALUATION_CRITERIA).map(([c, d]) => [c + ' (' + (d.weight * 100) + '%)', d.description]),
    ['', ''],
    ['=== RESPONSE FORMAT ===', ''],
    ['1. Company Profile', ''],
    ['2. Solution Overview', ''],
    ['3. Pricing', ''],
    ['4. References', ''],
    ['5. Security/Compliance Certifications', ''],
    ['6. Implementation Timeline', ''],
    ['', ''],
    ['=== SUBMISSION INSTRUCTIONS ===', ''],
    ['Email responses to: [procurement@company.com]', ''],
    ['Questions deadline: [Date]', ''],
    ['Response deadline: [Date]', '']
  ];

  rfpSheet.getRange(1, 1, rfpContent.length, 2).setValues(rfpContent);
  rfpSheet.getRange(1, 1, 1, 2).setFontWeight('bold').setFontSize(14).setBackground('#2979FF').setFontColor('white');
  rfpSheet.getRange(8, 1).setFontWeight('bold').setBackground('#E3F2FD');
  rfpSheet.getRange(11, 1).setFontWeight('bold').setBackground('#E3F2FD');

  ui.alert('✅ RFP Template generated!\n\nCustomize the template and send to potential vendors.');
}

// Update Performance
function updatePerformance() {
  const ui = SpreadsheetApp.getUi();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const row = sheet.getActiveRange().getRow();

  if (row < 2) {
    ui.alert('Please select a vendor row first.');
    return;
  }

  const vendorName = sheet.getRange(row, 2).getValue();

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      label { display: block; margin-top: 10px; font-weight: bold; }
      input, select { width: 100%; padding: 8px; margin-top: 5px; box-sizing: border-box; }
      button { margin-top: 20px; padding: 10px 20px; background: #2979FF; color: white; border: none; cursor: pointer; width: 100%; }
    </style>

    <h3>Performance Update: ${vendorName}</h3>

    <label>Delivery Performance (1-5):</label>
    <select id="delivery">
      <option value="5">5 - Always on time</option>
      <option value="4">4 - Mostly on time</option>
      <option value="3" selected>3 - Occasional delays</option>
      <option value="2">2 - Frequent delays</option>
      <option value="1">1 - Consistently late</option>
    </select>

    <label>Quality Performance (1-5):</label>
    <select id="quality">
      <option value="5">5 - Exceeds expectations</option>
      <option value="4">4 - Meets expectations</option>
      <option value="3" selected>3 - Acceptable</option>
      <option value="2">2 - Below expectations</option>
      <option value="1">1 - Unacceptable</option>
    </select>

    <label>Support Responsiveness (1-5):</label>
    <select id="support">
      <option value="5">5 - Excellent (< 1 hour)</option>
      <option value="4">4 - Good (< 4 hours)</option>
      <option value="3" selected>3 - Average (< 24 hours)</option>
      <option value="2">2 - Slow (> 24 hours)</option>
      <option value="1">1 - Poor (> 48 hours)</option>
    </select>

    <label>Issues This Period:</label>
    <input type="number" id="issues" value="0" min="0">

    <label>Notes:</label>
    <textarea id="notes" rows="3" style="width: 100%; padding: 8px;"></textarea>

    <button onclick="submitPerformance()">Update Performance</button>

    <script>
      function submitPerformance() {
        const data = {
          row: ${row},
          delivery: parseInt(document.getElementById('delivery').value),
          quality: parseInt(document.getElementById('quality').value),
          support: parseInt(document.getElementById('support').value),
          issues: parseInt(document.getElementById('issues').value),
          notes: document.getElementById('notes').value
        };
        google.script.run.withSuccessHandler(() => {
          google.script.host.close();
        }).processPerformance(data);
      }
    </script>
  `).setWidth(400).setHeight(500);

  ui.showModalDialog(html, '📈 Update Performance');
}

function processPerformance(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  const avgScore = Math.round((data.delivery + data.quality + data.support) / 3 * 20);
  const currentNotes = sheet.getRange(data.row, 15).getValue();
  const perfNote = `[${new Date().toLocaleDateString()}] Perf: ${avgScore}/100 (D:${data.delivery} Q:${data.quality} S:${data.support}) Issues: ${data.issues}${data.notes ? ' - ' + data.notes : ''}`;

  sheet.getRange(data.row, 15).setValue(currentNotes ? currentNotes + '\n' + perfNote : perfNote);

  // Update overall score (blend with evaluation score)
  const currentScore = sheet.getRange(data.row, 12).getValue() || avgScore;
  const newScore = Math.round((currentScore + avgScore) / 2);
  sheet.getRange(data.row, 12).setValue(newScore);

  SpreadsheetApp.getUi().alert('✅ Performance updated!\n\nPeriod Score: ' + avgScore + '/100\nIssues: ' + data.issues);
}

// SLA Tracking
function slaTracking() {
  const ui = SpreadsheetApp.getUi();

  ui.alert(`
📊 SLA TRACKING
===============

Add SLA metrics to your vendor contracts:

1. Uptime SLA (e.g., 99.9%)
2. Response Time SLA (e.g., < 1 hour)
3. Resolution Time SLA (e.g., < 24 hours)
4. Escalation SLA (e.g., P1 = immediate)

Track violations in the Notes column for each vendor.
Use "Update Performance" to log issues.
  `);
}

// Issue Log
function issueLog() {
  const ui = SpreadsheetApp.getUi();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const row = sheet.getActiveRange().getRow();

  if (row < 2) {
    ui.alert('Please select a vendor row first.');
    return;
  }

  const vendorName = sheet.getRange(row, 2).getValue();
  const response = ui.prompt('Log issue for ' + vendorName + ':\n\n(Format: Severity: Description)', ui.ButtonSet.OK_CANCEL);

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const issue = response.getResponseText();
  const currentNotes = sheet.getRange(row, 15).getValue();
  const issueLog = `[${new Date().toLocaleDateString()}] ISSUE: ${issue}`;

  sheet.getRange(row, 15).setValue(currentNotes ? currentNotes + '\n' + issueLog : issueLog);

  ui.alert('⚠️ Issue logged for ' + vendorName);
}

// Risk Assessment
function riskAssessment() {
  const ui = SpreadsheetApp.getUi();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const row = sheet.getActiveRange().getRow();

  if (row < 2) {
    ui.alert('Please select a vendor row first.');
    return;
  }

  const vendorName = sheet.getRange(row, 2).getValue();

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      label { display: block; margin-top: 10px; font-weight: bold; }
      select { width: 100%; padding: 8px; margin-top: 5px; }
      button { margin-top: 20px; padding: 10px 20px; background: #2979FF; color: white; border: none; cursor: pointer; width: 100%; }
      .risk { padding: 10px; margin: 10px 0; border-radius: 4px; }
      .critical { background: #FFCDD2; }
      .high { background: #FFE0B2; }
      .medium { background: #FFF9C4; }
      .low { background: #C8E6C9; }
    </style>

    <h3>Risk Assessment: ${vendorName}</h3>

    <div class="risk">
      <label>Business Continuity Risk:</label>
      <select id="continuity">
        <option value="Critical">Critical - Single point of failure</option>
        <option value="High">High - Few alternatives exist</option>
        <option value="Medium" selected>Medium - Alternatives available</option>
        <option value="Low">Low - Easy to replace</option>
      </select>
    </div>

    <div class="risk">
      <label>Financial Risk:</label>
      <select id="financial">
        <option value="Critical">Critical - Major financial exposure</option>
        <option value="High">High - Significant spend</option>
        <option value="Medium" selected>Medium - Moderate spend</option>
        <option value="Low">Low - Minimal spend</option>
      </select>
    </div>

    <div class="risk">
      <label>Security/Data Risk:</label>
      <select id="security">
        <option value="Critical">Critical - Access to sensitive data</option>
        <option value="High">High - Some data access</option>
        <option value="Medium" selected>Medium - Limited access</option>
        <option value="Low">Low - No data access</option>
      </select>
    </div>

    <div class="risk">
      <label>Compliance Risk:</label>
      <select id="compliance">
        <option value="Critical">Critical - Regulatory requirements</option>
        <option value="High">High - Some compliance needs</option>
        <option value="Medium" selected>Medium - Standard requirements</option>
        <option value="Low">Low - Minimal compliance</option>
      </select>
    </div>

    <button onclick="submitRisk()">Save Risk Assessment</button>

    <script>
      function submitRisk() {
        const data = {
          row: ${row},
          continuity: document.getElementById('continuity').value,
          financial: document.getElementById('financial').value,
          security: document.getElementById('security').value,
          compliance: document.getElementById('compliance').value
        };
        google.script.run.withSuccessHandler(() => {
          google.script.host.close();
        }).processRiskAssessment(data);
      }
    </script>
  `).setWidth(400).setHeight(500);

  ui.showModalDialog(html, '⚠️ Risk Assessment');
}

function processRiskAssessment(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // Calculate overall risk level
  const riskLevels = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
  const avgRisk = (riskLevels[data.continuity] + riskLevels[data.financial] + riskLevels[data.security] + riskLevels[data.compliance]) / 4;

  let overallRisk;
  if (avgRisk >= 3.5) overallRisk = 'Critical';
  else if (avgRisk >= 2.5) overallRisk = 'High';
  else if (avgRisk >= 1.5) overallRisk = 'Medium';
  else overallRisk = 'Low';

  const riskNote = `RISK ASSESSMENT: ${overallRisk} (BC:${data.continuity}, Fin:${data.financial}, Sec:${data.security}, Comp:${data.compliance})`;

  const currentNotes = sheet.getRange(data.row, 15).getValue();
  sheet.getRange(data.row, 15).setValue(currentNotes ? currentNotes + '\n' + riskNote : riskNote);

  SpreadsheetApp.getUi().alert('⚠️ Risk Assessment Complete\n\nOverall Risk Level: ' + overallRisk);
}

// Compliance Checklist
function complianceChecklist() {
  const ui = SpreadsheetApp.getUi();

  const checklist = `
✅ VENDOR COMPLIANCE CHECKLIST
==============================

SECURITY:
☐ SOC 2 Type II certified
☐ ISO 27001 certified
☐ Penetration testing (annual)
☐ Encryption at rest and in transit
☐ MFA enabled

LEGAL:
☐ NDA signed
☐ MSA/Contract executed
☐ DPA (Data Processing Agreement) if applicable
☐ Insurance certificates on file

PRIVACY:
☐ GDPR compliant (if EU data)
☐ CCPA compliant (if CA data)
☐ Privacy policy reviewed

BUSINESS:
☐ Financial stability verified
☐ References checked
☐ Business continuity plan

Add these to vendor notes as verified.
  `;

  ui.alert(checklist);
}

// Security Review
function securityReview() {
  const ui = SpreadsheetApp.getUi();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const row = sheet.getActiveRange().getRow();

  if (row < 2) {
    ui.alert('Please select a vendor row first.');
    return;
  }

  const vendorName = sheet.getRange(row, 2).getValue();

  const certs = ui.prompt('Enter security certifications for ' + vendorName + ':\n\n(e.g., SOC 2, ISO 27001, HIPAA)', ui.ButtonSet.OK_CANCEL);

  if (certs.getSelectedButton() !== ui.Button.OK) return;

  const secNote = `[${new Date().toLocaleDateString()}] SECURITY REVIEW: ${certs.getResponseText()}`;
  const currentNotes = sheet.getRange(row, 15).getValue();
  sheet.getRange(row, 15).setValue(currentNotes ? currentNotes + '\n' + secNote : secNote);

  ui.alert('🔒 Security review recorded for ' + vendorName);
}

// Renewal Alerts
function renewalAlerts() {
  const ui = SpreadsheetApp.getUi();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    ui.alert('No vendors to check.');
    return;
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 16).getValues();
  const today = new Date();
  const alertDate = new Date(today.getTime() + CONFIG.RENEWAL_ALERT_DAYS * 24 * 60 * 60 * 1000);

  let alerts = [];

  for (let i = 0; i < data.length; i++) {
    const endDate = new Date(data[i][9]);
    const vendorName = data[i][1];
    const value = data[i][7];

    if (endDate && endDate <= alertDate && endDate >= today) {
      const daysUntil = Math.ceil((endDate - today) / (24 * 60 * 60 * 1000));
      alerts.push({
        vendor: vendorName,
        endDate: endDate.toLocaleDateString(),
        daysUntil: daysUntil,
        value: value,
        row: i + 2
      });

      // Highlight row
      sheet.getRange(i + 2, 1, 1, 16).setBackground('#FFE0B2');
    }
  }

  if (alerts.length === 0) {
    ui.alert('✅ No renewals due in the next ' + CONFIG.RENEWAL_ALERT_DAYS + ' days.');
    return;
  }

  let report = '🔔 RENEWAL ALERTS\n=================\n\n';
  report += alerts.length + ' contracts expiring within ' + CONFIG.RENEWAL_ALERT_DAYS + ' days:\n\n';

  for (const alert of alerts.sort((a, b) => a.daysUntil - b.daysUntil)) {
    report += `⚠️ ${alert.vendor}\n`;
    report += `   Expires: ${alert.endDate} (${alert.daysUntil} days)\n`;
    report += `   Value: $${(alert.value || 0).toLocaleString()}\n\n`;
  }

  ui.alert(report);
}

// Send Vendor Report
function sendVendorReport() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Send vendor summary to:', ui.ButtonSet.OK_CANCEL);

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const email = response.getResponseText();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    ui.alert('No vendor data to report.');
    return;
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 16).getValues();

  let totalValue = 0;
  let byCategory = {};
  let byStatus = {};

  for (const row of data) {
    totalValue += row[7] || 0;
    const category = row[2] || 'Other';
    const status = row[10] || 'Unknown';
    byCategory[category] = (byCategory[category] || 0) + 1;
    byStatus[status] = (byStatus[status] || 0) + 1;
  }

  const subject = CONFIG.COMPANY_NAME + ' - Vendor Summary ' + new Date().toLocaleDateString();
  const body = `
${CONFIG.COMPANY_NAME} VENDOR SUMMARY
======================================

Total Vendors: ${data.length}
Total Contract Value: $${totalValue.toLocaleString()}

BY STATUS:
${Object.entries(byStatus).map(([s, c]) => '  ' + s + ': ' + c).join('\n')}

BY CATEGORY:
${Object.entries(byCategory).map(([c, n]) => '  ' + c + ': ' + n).join('\n')}

View full details: ${SpreadsheetApp.getActiveSpreadsheet().getUrl()}

--
Generated by BlackRoad OS Vendor Management
  `;

  MailApp.sendEmail(email, subject, body);
  ui.alert('✅ Vendor report sent to ' + email);
}

// Settings
function openVendorSettings() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      h3 { color: #2979FF; }
      code { background: #f5f5f5; padding: 2px 6px; }
    </style>
    <h3>⚙️ Vendor Management Settings</h3>
    <p><b>Company:</b> ${CONFIG.COMPANY_NAME}</p>
    <p><b>Renewal Alert Days:</b> ${CONFIG.RENEWAL_ALERT_DAYS}</p>
    <p><b>Categories:</b></p>
    <ul>${CONFIG.CATEGORIES.map(c => '<li>' + c + '</li>').join('')}</ul>
    <p><b>Evaluation Criteria:</b></p>
    <ul>${Object.entries(CONFIG.EVALUATION_CRITERIA).map(([c, d]) => '<li>' + c + ' (' + (d.weight * 100) + '%)</li>').join('')}</ul>
    <p><b>To customize:</b> Edit <code>CONFIG</code> in Apps Script</p>
  `).setWidth(400).setHeight(450);

  SpreadsheetApp.getUi().showModalDialog(html, '⚙️ Settings');
}
