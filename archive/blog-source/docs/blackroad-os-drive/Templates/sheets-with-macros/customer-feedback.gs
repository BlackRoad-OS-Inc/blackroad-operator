/**
 * BlackRoad OS - Customer Feedback & NPS System
 * Collect, analyze, and act on customer feedback
 *
 * Features:
 * - NPS (Net Promoter Score) surveys
 * - CSAT (Customer Satisfaction) tracking
 * - CES (Customer Effort Score) measurement
 * - Feedback categorization and tagging
 * - Sentiment analysis
 * - Response management
 * - Trend reporting
 */

const CONFIG = {
  COMPANY_NAME: 'BlackRoad OS, Inc.',

  // Sheet names
  SHEETS: {
    NPS: 'NPS Surveys',
    CSAT: 'CSAT Scores',
    FEEDBACK: 'Feedback',
    RESPONSES: 'Responses',
    TRENDS: 'Trends'
  },

  // Feedback categories
  CATEGORIES: [
    'Product - Features',
    'Product - Usability',
    'Product - Performance',
    'Product - Bugs',
    'Support - Response Time',
    'Support - Quality',
    'Billing - Pricing',
    'Billing - Invoicing',
    'Onboarding',
    'Documentation',
    'Integration',
    'General'
  ],

  // Sentiment options
  SENTIMENTS: [
    'Very Positive',
    'Positive',
    'Neutral',
    'Negative',
    'Very Negative'
  ],

  // NPS segments
  NPS_SEGMENTS: {
    PROMOTER: { min: 9, max: 10, label: 'Promoter', color: '#34a853' },
    PASSIVE: { min: 7, max: 8, label: 'Passive', color: '#fbbc04' },
    DETRACTOR: { min: 0, max: 6, label: 'Detractor', color: '#ea4335' }
  },

  // CSAT scale
  CSAT_SCALE: [
    { value: 5, label: 'Very Satisfied', emoji: '😊' },
    { value: 4, label: 'Satisfied', emoji: '🙂' },
    { value: 3, label: 'Neutral', emoji: '😐' },
    { value: 2, label: 'Dissatisfied', emoji: '😕' },
    { value: 1, label: 'Very Dissatisfied', emoji: '😞' }
  ],

  // Response priorities
  PRIORITIES: [
    'Urgent - Respond within 24h',
    'High - Respond within 48h',
    'Medium - Respond within 1 week',
    'Low - No response needed'
  ]
};

// ============================================
// MENU SETUP
// ============================================

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('💬 Feedback')
    .addItem('📊 Record NPS Response', 'recordNPSResponse')
    .addItem('⭐ Record CSAT Score', 'recordCSATScore')
    .addItem('📝 Add Feedback', 'addFeedback')
    .addSeparator()
    .addSubMenu(ui.createMenu('📈 Analytics')
      .addItem('NPS Dashboard', 'showNPSDashboard')
      .addItem('CSAT Summary', 'showCSATSummary')
      .addItem('Feedback Breakdown', 'showFeedbackBreakdown')
      .addItem('Trend Analysis', 'showTrendAnalysis'))
    .addSeparator()
    .addSubMenu(ui.createMenu('📧 Actions')
      .addItem('Send NPS Survey', 'sendNPSSurvey')
      .addItem('Log Response to Feedback', 'logResponse')
      .addItem('Mark Feedback Resolved', 'markResolved')
      .addItem('Escalate to Team', 'escalateFeedback'))
    .addSeparator()
    .addSubMenu(ui.createMenu('📋 Reports')
      .addItem('Weekly NPS Report', 'generateWeeklyNPSReport')
      .addItem('Monthly Feedback Summary', 'generateMonthlyFeedbackSummary')
      .addItem('Export for Analysis', 'exportForAnalysis'))
    .addSeparator()
    .addItem('⚙️ Settings', 'showSettings')
    .addToUi();
}

// ============================================
// NPS TRACKING
// ============================================

function recordNPSResponse() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 15px; }
      label { display: block; font-weight: bold; margin-bottom: 5px; }
      input, select, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      textarea { height: 80px; }
      .nps-scale { display: flex; gap: 5px; margin: 10px 0; }
      .nps-btn { width: 40px; height: 40px; border: 2px solid #ddd; border-radius: 4px; cursor: pointer; font-weight: bold; transition: all 0.2s; }
      .nps-btn:hover { transform: scale(1.1); }
      .nps-btn.selected { border-color: #4285f4; background: #4285f4; color: white; }
      .nps-btn.detractor { background: #fce8e6; }
      .nps-btn.passive { background: #fef7e0; }
      .nps-btn.promoter { background: #e6f4ea; }
      .segment-label { padding: 5px 10px; border-radius: 4px; font-size: 14px; font-weight: bold; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
    </style>

    <h2>📊 Record NPS Response</h2>

    <div class="form-group">
      <label>Customer Email</label>
      <input type="email" id="email" placeholder="customer@company.com">
    </div>

    <div class="form-group">
      <label>Customer Name</label>
      <input type="text" id="customerName">
    </div>

    <div class="form-group">
      <label>Company</label>
      <input type="text" id="company">
    </div>

    <div class="form-group">
      <label>NPS Score (0-10): How likely are you to recommend us?</label>
      <div class="nps-scale">
        ${Array.from({length: 11}, (_, i) => {
          let cls = i <= 6 ? 'detractor' : (i <= 8 ? 'passive' : 'promoter');
          return `<button type="button" class="nps-btn ${cls}" onclick="selectNPS(${i})">${i}</button>`;
        }).join('')}
      </div>
      <input type="hidden" id="npsScore" value="">
      <div id="segmentLabel"></div>
    </div>

    <div class="form-group">
      <label>What's the primary reason for your score?</label>
      <textarea id="reason" placeholder="Customer's feedback..."></textarea>
    </div>

    <div class="form-group">
      <label>Survey Source</label>
      <select id="source">
        <option>Email Survey</option>
        <option>In-App Survey</option>
        <option>Post-Support Survey</option>
        <option>Quarterly Review</option>
        <option>Manual Entry</option>
      </select>
    </div>

    <button onclick="submitNPS()">Record NPS Response</button>

    <script>
      let selectedScore = null;

      function selectNPS(score) {
        selectedScore = score;
        document.getElementById('npsScore').value = score;

        // Update button styles
        document.querySelectorAll('.nps-btn').forEach(btn => btn.classList.remove('selected'));
        event.target.classList.add('selected');

        // Show segment
        let segment, color;
        if (score <= 6) { segment = 'Detractor'; color = '#ea4335'; }
        else if (score <= 8) { segment = 'Passive'; color = '#fbbc04'; }
        else { segment = 'Promoter'; color = '#34a853'; }

        document.getElementById('segmentLabel').innerHTML =
          '<span class="segment-label" style="background: ' + color + '; color: white;">' + segment + '</span>';
      }

      function submitNPS() {
        if (selectedScore === null) {
          alert('Please select an NPS score');
          return;
        }

        const data = {
          email: document.getElementById('email').value,
          customerName: document.getElementById('customerName').value,
          company: document.getElementById('company').value,
          score: selectedScore,
          reason: document.getElementById('reason').value,
          source: document.getElementById('source').value
        };

        google.script.run
          .withSuccessHandler(() => {
            alert('NPS response recorded!');
            google.script.host.close();
          })
          .withFailureHandler(err => alert('Error: ' + err))
          .saveNPSResponse(data);
      }
    </script>
  `)
  .setWidth(450)
  .setHeight(600);

  SpreadsheetApp.getUi().showModalDialog(html, 'Record NPS Response');
}

function saveNPSResponse(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEETS.NPS);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.NPS);
    sheet.appendRow([
      'Response ID', 'Date', 'Customer Email', 'Customer Name', 'Company',
      'NPS Score', 'Segment', 'Reason', 'Source', 'Follow-up Status', 'Notes'
    ]);
    sheet.getRange(1, 1, 1, 11).setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
  }

  const lastRow = sheet.getLastRow();
  const id = 'NPS-' + String(lastRow).padStart(5, '0');

  // Determine segment
  let segment;
  if (data.score <= 6) segment = 'Detractor';
  else if (data.score <= 8) segment = 'Passive';
  else segment = 'Promoter';

  sheet.appendRow([
    id,
    new Date(),
    data.email,
    data.customerName,
    data.company,
    data.score,
    segment,
    data.reason,
    data.source,
    'Pending',
    ''
  ]);

  // Color code by segment
  const newRow = sheet.getLastRow();
  const colors = {
    'Promoter': '#e6f4ea',
    'Passive': '#fef7e0',
    'Detractor': '#fce8e6'
  };
  sheet.getRange(newRow, 1, 1, 11).setBackground(colors[segment]);

  return id;
}

// ============================================
// NPS DASHBOARD
// ============================================

function showNPSDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.NPS);

  if (!sheet || sheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('No NPS data yet. Record some NPS responses first.');
    return;
  }

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 11).getValues();

  // Calculate NPS
  let promoters = 0, passives = 0, detractors = 0;
  let totalScore = 0;

  data.forEach(row => {
    const score = row[5];
    totalScore += score;
    if (score >= 9) promoters++;
    else if (score >= 7) passives++;
    else detractors++;
  });

  const total = data.length;
  const npsScore = Math.round(((promoters - detractors) / total) * 100);
  const avgScore = (totalScore / total).toFixed(1);

  // Last 30 days trend
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentData = data.filter(row => new Date(row[1]) >= thirtyDaysAgo);
  let recentPromoters = 0, recentDetractors = 0;
  recentData.forEach(row => {
    if (row[5] >= 9) recentPromoters++;
    else if (row[5] <= 6) recentDetractors++;
  });
  const recentNPS = recentData.length > 0
    ? Math.round(((recentPromoters - recentDetractors) / recentData.length) * 100)
    : 0;

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; background: #f8f9fa; }
      .nps-score { text-align: center; padding: 30px; background: white; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
      .nps-number { font-size: 72px; font-weight: bold; color: ${npsScore >= 50 ? '#34a853' : (npsScore >= 0 ? '#fbbc04' : '#ea4335')}; }
      .nps-label { font-size: 18px; color: #666; }
      .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px; }
      .stat-box { background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
      .stat-value { font-size: 32px; font-weight: bold; }
      .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
      .promoters .stat-value { color: #34a853; }
      .passives .stat-value { color: #fbbc04; }
      .detractors .stat-value { color: #ea4335; }
      .breakdown { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
      .bar-container { display: flex; height: 30px; border-radius: 4px; overflow: hidden; margin: 10px 0; }
      .bar-promoters { background: #34a853; }
      .bar-passives { background: #fbbc04; }
      .bar-detractors { background: #ea4335; }
      .trend { margin-top: 15px; padding: 10px; background: #f5f5f5; border-radius: 4px; }
    </style>

    <div class="nps-score">
      <div class="nps-number">${npsScore}</div>
      <div class="nps-label">Net Promoter Score</div>
    </div>

    <div class="stats">
      <div class="stat-box promoters">
        <div class="stat-value">${promoters}</div>
        <div class="stat-label">Promoters (9-10)</div>
        <div>${((promoters/total)*100).toFixed(0)}%</div>
      </div>
      <div class="stat-box passives">
        <div class="stat-value">${passives}</div>
        <div class="stat-label">Passives (7-8)</div>
        <div>${((passives/total)*100).toFixed(0)}%</div>
      </div>
      <div class="stat-box detractors">
        <div class="stat-value">${detractors}</div>
        <div class="stat-label">Detractors (0-6)</div>
        <div>${((detractors/total)*100).toFixed(0)}%</div>
      </div>
    </div>

    <div class="breakdown">
      <h3>Response Distribution</h3>
      <div class="bar-container">
        <div class="bar-promoters" style="width: ${(promoters/total)*100}%"></div>
        <div class="bar-passives" style="width: ${(passives/total)*100}%"></div>
        <div class="bar-detractors" style="width: ${(detractors/total)*100}%"></div>
      </div>

      <div class="trend">
        <strong>30-Day NPS:</strong> ${recentNPS} (${recentData.length} responses)
        ${recentNPS > npsScore ? ' 📈 Trending Up' : (recentNPS < npsScore ? ' 📉 Trending Down' : ' ➡️ Stable')}
      </div>

      <p style="margin-top: 15px;">
        <strong>Average Score:</strong> ${avgScore}/10<br>
        <strong>Total Responses:</strong> ${total}
      </p>
    </div>
  `)
  .setWidth(500)
  .setHeight(600);

  SpreadsheetApp.getUi().showModalDialog(html, 'NPS Dashboard');
}

// ============================================
// CSAT TRACKING
// ============================================

function recordCSATScore() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 15px; }
      label { display: block; font-weight: bold; margin-bottom: 5px; }
      input, select, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      .csat-scale { display: flex; gap: 10px; margin: 15px 0; justify-content: center; }
      .csat-btn { width: 60px; height: 60px; border: 2px solid #ddd; border-radius: 8px; cursor: pointer; font-size: 28px; transition: all 0.2s; background: white; }
      .csat-btn:hover { transform: scale(1.1); }
      .csat-btn.selected { border-color: #4285f4; box-shadow: 0 0 10px rgba(66,133,244,0.5); }
      .csat-label { font-size: 12px; color: #666; text-align: center; margin-top: 5px; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
    </style>

    <h2>⭐ Record CSAT Score</h2>

    <div class="form-group">
      <label>Customer Email</label>
      <input type="email" id="email">
    </div>

    <div class="form-group">
      <label>Interaction Type</label>
      <select id="interactionType">
        <option>Support Ticket</option>
        <option>Live Chat</option>
        <option>Phone Call</option>
        <option>Onboarding</option>
        <option>Feature Request</option>
        <option>Bug Report</option>
        <option>General Inquiry</option>
      </select>
    </div>

    <div class="form-group">
      <label>Reference/Ticket #</label>
      <input type="text" id="reference" placeholder="e.g., TKT-12345">
    </div>

    <div class="form-group">
      <label>How satisfied was the customer?</label>
      <div class="csat-scale">
        ${CONFIG.CSAT_SCALE.map(s =>
          `<div>
            <button type="button" class="csat-btn" onclick="selectCSAT(${s.value})" data-value="${s.value}">${s.emoji}</button>
            <div class="csat-label">${s.label}</div>
          </div>`
        ).join('')}
      </div>
      <input type="hidden" id="csatScore" value="">
    </div>

    <div class="form-group">
      <label>Agent/Team Member</label>
      <input type="text" id="agent">
    </div>

    <div class="form-group">
      <label>Customer Comments</label>
      <textarea id="comments" placeholder="Any additional feedback..."></textarea>
    </div>

    <button onclick="submitCSAT()">Record CSAT Score</button>

    <script>
      let selectedScore = null;

      function selectCSAT(score) {
        selectedScore = score;
        document.getElementById('csatScore').value = score;

        document.querySelectorAll('.csat-btn').forEach(btn => {
          btn.classList.remove('selected');
          if (parseInt(btn.dataset.value) === score) {
            btn.classList.add('selected');
          }
        });
      }

      function submitCSAT() {
        if (!selectedScore) {
          alert('Please select a satisfaction score');
          return;
        }

        const data = {
          email: document.getElementById('email').value,
          interactionType: document.getElementById('interactionType').value,
          reference: document.getElementById('reference').value,
          score: selectedScore,
          agent: document.getElementById('agent').value,
          comments: document.getElementById('comments').value
        };

        google.script.run
          .withSuccessHandler(() => {
            alert('CSAT score recorded!');
            google.script.host.close();
          })
          .saveCSATScore(data);
      }
    </script>
  `)
  .setWidth(400)
  .setHeight(600);

  SpreadsheetApp.getUi().showModalDialog(html, 'Record CSAT Score');
}

function saveCSATScore(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEETS.CSAT);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.CSAT);
    sheet.appendRow([
      'CSAT ID', 'Date', 'Customer Email', 'Interaction Type', 'Reference',
      'CSAT Score', 'Satisfaction Level', 'Agent', 'Comments', 'Notes'
    ]);
    sheet.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
  }

  const lastRow = sheet.getLastRow();
  const id = 'CSAT-' + String(lastRow).padStart(5, '0');

  const satisfactionLevel = CONFIG.CSAT_SCALE.find(s => s.value === data.score)?.label || 'Unknown';

  sheet.appendRow([
    id,
    new Date(),
    data.email,
    data.interactionType,
    data.reference,
    data.score,
    satisfactionLevel,
    data.agent,
    data.comments,
    ''
  ]);

  // Color code by score
  const newRow = sheet.getLastRow();
  const colors = {
    5: '#e6f4ea',
    4: '#d9ead3',
    3: '#fef7e0',
    2: '#fce8e6',
    1: '#f4cccc'
  };
  sheet.getRange(newRow, 1, 1, 10).setBackground(colors[data.score] || '#ffffff');

  return id;
}

// ============================================
// CSAT SUMMARY
// ============================================

function showCSATSummary() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.CSAT);

  if (!sheet || sheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('No CSAT data yet. Record some CSAT scores first.');
    return;
  }

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 10).getValues();

  // Calculate CSAT percentage (% of 4 and 5 scores)
  const satisfiedCount = data.filter(row => row[5] >= 4).length;
  const total = data.length;
  const csatPercent = ((satisfiedCount / total) * 100).toFixed(1);

  // Average score
  const avgScore = (data.reduce((sum, row) => sum + row[5], 0) / total).toFixed(2);

  // Score distribution
  const distribution = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0};
  data.forEach(row => {
    if (distribution.hasOwnProperty(row[5])) {
      distribution[row[5]]++;
    }
  });

  // By interaction type
  const byType = {};
  data.forEach(row => {
    const type = row[3];
    if (!byType[type]) byType[type] = { sum: 0, count: 0 };
    byType[type].sum += row[5];
    byType[type].count++;
  });

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .csat-score { text-align: center; padding: 25px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white; margin-bottom: 20px; }
      .csat-number { font-size: 56px; font-weight: bold; }
      .csat-label { font-size: 16px; opacity: 0.9; }
      .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
      .stat-box { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; }
      .stat-value { font-size: 24px; font-weight: bold; color: #4285f4; }
      .distribution { margin-bottom: 20px; }
      .dist-row { display: flex; align-items: center; margin: 8px 0; }
      .dist-label { width: 100px; }
      .dist-bar { flex: 1; height: 20px; background: #e8e8e8; border-radius: 4px; overflow: hidden; }
      .dist-fill { height: 100%; }
      .dist-count { width: 50px; text-align: right; }
      table { width: 100%; border-collapse: collapse; }
      th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
      th { background: #f5f5f5; }
    </style>

    <div class="csat-score">
      <div class="csat-number">${csatPercent}%</div>
      <div class="csat-label">Customer Satisfaction Rate</div>
    </div>

    <div class="stats">
      <div class="stat-box">
        <div class="stat-value">${avgScore}</div>
        <div>Average Score (out of 5)</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${total}</div>
        <div>Total Responses</div>
      </div>
    </div>

    <div class="distribution">
      <h3>Score Distribution</h3>
      ${[5, 4, 3, 2, 1].map(score => {
        const count = distribution[score];
        const percent = ((count / total) * 100).toFixed(0);
        const emoji = CONFIG.CSAT_SCALE.find(s => s.value === score)?.emoji || '';
        const colors = {5: '#34a853', 4: '#4caf50', 3: '#fbbc04', 2: '#ff9800', 1: '#ea4335'};
        return `
          <div class="dist-row">
            <div class="dist-label">${emoji} ${score}</div>
            <div class="dist-bar">
              <div class="dist-fill" style="width: ${percent}%; background: ${colors[score]};"></div>
            </div>
            <div class="dist-count">${count} (${percent}%)</div>
          </div>
        `;
      }).join('')}
    </div>

    <h3>By Interaction Type</h3>
    <table>
      <tr><th>Type</th><th>Avg Score</th><th>Count</th></tr>
      ${Object.entries(byType).map(([type, stats]) =>
        `<tr><td>${type}</td><td>${(stats.sum / stats.count).toFixed(2)}</td><td>${stats.count}</td></tr>`
      ).join('')}
    </table>
  `)
  .setWidth(450)
  .setHeight(650);

  SpreadsheetApp.getUi().showModalDialog(html, 'CSAT Summary');
}

// ============================================
// GENERAL FEEDBACK
// ============================================

function addFeedback() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 12px; }
      label { display: block; font-weight: bold; margin-bottom: 4px; }
      input, select, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      textarea { height: 100px; }
      .row { display: flex; gap: 10px; }
      .row .form-group { flex: 1; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
    </style>

    <h2>📝 Add Customer Feedback</h2>

    <div class="form-group">
      <label>Customer Email</label>
      <input type="email" id="email">
    </div>

    <div class="row">
      <div class="form-group">
        <label>Customer Name</label>
        <input type="text" id="customerName">
      </div>
      <div class="form-group">
        <label>Company</label>
        <input type="text" id="company">
      </div>
    </div>

    <div class="row">
      <div class="form-group">
        <label>Category</label>
        <select id="category">
          ${CONFIG.CATEGORIES.map(c => '<option>' + c + '</option>').join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Sentiment</label>
        <select id="sentiment">
          ${CONFIG.SENTIMENTS.map(s => '<option>' + s + '</option>').join('')}
        </select>
      </div>
    </div>

    <div class="form-group">
      <label>Feedback Subject</label>
      <input type="text" id="subject">
    </div>

    <div class="form-group">
      <label>Feedback Details</label>
      <textarea id="details" placeholder="Full feedback from the customer..."></textarea>
    </div>

    <div class="row">
      <div class="form-group">
        <label>Source</label>
        <select id="source">
          <option>Email</option>
          <option>Support Chat</option>
          <option>Phone Call</option>
          <option>Social Media</option>
          <option>Review Site</option>
          <option>In-App Feedback</option>
          <option>Sales Call</option>
          <option>Other</option>
        </select>
      </div>
      <div class="form-group">
        <label>Priority</label>
        <select id="priority">
          ${CONFIG.PRIORITIES.map(p => '<option>' + p + '</option>').join('')}
        </select>
      </div>
    </div>

    <div class="form-group">
      <label>Tags (comma-separated)</label>
      <input type="text" id="tags" placeholder="e.g., feature-request, pricing, mobile">
    </div>

    <button onclick="submitFeedback()">Save Feedback</button>

    <script>
      function submitFeedback() {
        const data = {
          email: document.getElementById('email').value,
          customerName: document.getElementById('customerName').value,
          company: document.getElementById('company').value,
          category: document.getElementById('category').value,
          sentiment: document.getElementById('sentiment').value,
          subject: document.getElementById('subject').value,
          details: document.getElementById('details').value,
          source: document.getElementById('source').value,
          priority: document.getElementById('priority').value,
          tags: document.getElementById('tags').value
        };

        google.script.run
          .withSuccessHandler(() => {
            alert('Feedback saved!');
            google.script.host.close();
          })
          .saveFeedback(data);
      }
    </script>
  `)
  .setWidth(500)
  .setHeight(650);

  SpreadsheetApp.getUi().showModalDialog(html, 'Add Feedback');
}

function saveFeedback(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEETS.FEEDBACK);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.FEEDBACK);
    sheet.appendRow([
      'Feedback ID', 'Date', 'Customer Email', 'Customer Name', 'Company',
      'Category', 'Sentiment', 'Subject', 'Details', 'Source',
      'Priority', 'Tags', 'Status', 'Assigned To', 'Resolved Date', 'Notes'
    ]);
    sheet.getRange(1, 1, 1, 16).setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
  }

  const lastRow = sheet.getLastRow();
  const id = 'FB-' + String(lastRow).padStart(5, '0');

  sheet.appendRow([
    id,
    new Date(),
    data.email,
    data.customerName,
    data.company,
    data.category,
    data.sentiment,
    data.subject,
    data.details,
    data.source,
    data.priority,
    data.tags,
    'Open',
    '',
    '',
    ''
  ]);

  // Color code by sentiment
  const newRow = sheet.getLastRow();
  const colors = {
    'Very Positive': '#e6f4ea',
    'Positive': '#d9ead3',
    'Neutral': '#ffffff',
    'Negative': '#fce8e6',
    'Very Negative': '#f4cccc'
  };
  sheet.getRange(newRow, 1, 1, 16).setBackground(colors[data.sentiment] || '#ffffff');

  return id;
}

// ============================================
// FEEDBACK BREAKDOWN
// ============================================

function showFeedbackBreakdown() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.FEEDBACK);

  if (!sheet || sheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('No feedback data yet. Add some feedback first.');
    return;
  }

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 16).getValues();

  // By category
  const byCategory = {};
  CONFIG.CATEGORIES.forEach(c => byCategory[c] = 0);
  data.forEach(row => {
    if (byCategory.hasOwnProperty(row[5])) {
      byCategory[row[5]]++;
    }
  });

  // By sentiment
  const bySentiment = {};
  CONFIG.SENTIMENTS.forEach(s => bySentiment[s] = 0);
  data.forEach(row => {
    if (bySentiment.hasOwnProperty(row[6])) {
      bySentiment[row[6]]++;
    }
  });

  // Status counts
  const open = data.filter(r => r[12] === 'Open').length;
  const inProgress = data.filter(r => r[12] === 'In Progress').length;
  const resolved = data.filter(r => r[12] === 'Resolved').length;

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .status-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; }
      .status-card { padding: 15px; border-radius: 8px; text-align: center; }
      .open { background: #fce8e6; }
      .progress { background: #fff2cc; }
      .resolved { background: #e6f4ea; }
      .count { font-size: 28px; font-weight: bold; }
      h3 { margin-top: 20px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
      .chart-row { display: flex; align-items: center; margin: 5px 0; }
      .chart-label { width: 150px; font-size: 12px; }
      .chart-bar { flex: 1; height: 20px; background: #e8e8e8; border-radius: 3px; overflow: hidden; }
      .chart-fill { height: 100%; background: #4285f4; }
      .chart-count { width: 40px; text-align: right; font-size: 12px; }
      .sentiment-row .chart-fill.vp { background: #34a853; }
      .sentiment-row .chart-fill.p { background: #4caf50; }
      .sentiment-row .chart-fill.n { background: #fbbc04; }
      .sentiment-row .chart-fill.neg { background: #ff9800; }
      .sentiment-row .chart-fill.vn { background: #ea4335; }
    </style>

    <h2>📊 Feedback Breakdown</h2>

    <div class="status-cards">
      <div class="status-card open">
        <div class="count">${open}</div>
        <div>Open</div>
      </div>
      <div class="status-card progress">
        <div class="count">${inProgress}</div>
        <div>In Progress</div>
      </div>
      <div class="status-card resolved">
        <div class="count">${resolved}</div>
        <div>Resolved</div>
      </div>
    </div>

    <h3>By Category</h3>
    ${Object.entries(byCategory).filter(([_, count]) => count > 0).sort((a, b) => b[1] - a[1]).map(([cat, count]) => {
      const percent = ((count / data.length) * 100).toFixed(0);
      return `
        <div class="chart-row">
          <div class="chart-label">${cat}</div>
          <div class="chart-bar"><div class="chart-fill" style="width: ${percent}%"></div></div>
          <div class="chart-count">${count}</div>
        </div>
      `;
    }).join('')}

    <h3>By Sentiment</h3>
    ${Object.entries(bySentiment).map(([sentiment, count]) => {
      const percent = data.length > 0 ? ((count / data.length) * 100).toFixed(0) : 0;
      const cls = sentiment === 'Very Positive' ? 'vp' : (sentiment === 'Positive' ? 'p' : (sentiment === 'Neutral' ? 'n' : (sentiment === 'Negative' ? 'neg' : 'vn')));
      return `
        <div class="chart-row sentiment-row">
          <div class="chart-label">${sentiment}</div>
          <div class="chart-bar"><div class="chart-fill ${cls}" style="width: ${percent}%"></div></div>
          <div class="chart-count">${count}</div>
        </div>
      `;
    }).join('')}

    <p style="margin-top: 20px; color: #666;">
      Total Feedback Items: <strong>${data.length}</strong>
    </p>
  `)
  .setWidth(500)
  .setHeight(600);

  SpreadsheetApp.getUi().showModalDialog(html, 'Feedback Breakdown');
}

// ============================================
// SEND NPS SURVEY
// ============================================

function sendNPSSurvey() {
  const ui = SpreadsheetApp.getUi();

  const response = ui.prompt(
    'Send NPS Survey',
    'Enter customer email address:',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const email = response.getResponseText().trim();
  if (!email || !email.includes('@')) {
    ui.alert('Please enter a valid email address.');
    return;
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const surveyLink = ss.getUrl(); // In production, this would link to a survey form

  const subject = `How likely are you to recommend ${CONFIG.COMPANY_NAME}?`;
  const body = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">We'd love your feedback!</h2>

      <p>Hi there,</p>

      <p>We're always looking to improve. Could you take 30 seconds to tell us how we're doing?</p>

      <h3 style="color: #4285f4;">How likely are you to recommend ${CONFIG.COMPANY_NAME} to a friend or colleague?</h3>

      <div style="text-align: center; margin: 30px 0;">
        <p style="color: #ea4335;">Not at all likely</p>
        <div style="display: inline-flex; gap: 5px;">
          ${Array.from({length: 11}, (_, i) => {
            const color = i <= 6 ? '#ea4335' : (i <= 8 ? '#fbbc04' : '#34a853');
            return `<a href="mailto:feedback@example.com?subject=NPS Response: ${i}" style="display: inline-block; width: 35px; height: 35px; line-height: 35px; text-align: center; border: 2px solid ${color}; border-radius: 4px; text-decoration: none; color: #333; font-weight: bold;">${i}</a>`;
          }).join('')}
        </div>
        <p style="color: #34a853;">Extremely likely</p>
      </div>

      <p style="color: #666; font-size: 14px;">
        Thank you for being a valued customer!<br>
        - The ${CONFIG.COMPANY_NAME} Team
      </p>
    </div>
  `;

  MailApp.sendEmail({
    to: email,
    subject: subject,
    htmlBody: body
  });

  ui.alert('NPS survey sent to ' + email);
}

// ============================================
// RESPONSE MANAGEMENT
// ============================================

function logResponse() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const row = sheet.getActiveRange().getRow();

  if (row < 2) {
    SpreadsheetApp.getUi().alert('Please select a feedback row first.');
    return;
  }

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 12px; }
      label { display: block; font-weight: bold; margin-bottom: 4px; }
      input, select, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      textarea { height: 120px; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
    </style>

    <h2>📧 Log Response</h2>

    <div class="form-group">
      <label>Response Type</label>
      <select id="responseType">
        <option>Email Reply</option>
        <option>Phone Call</option>
        <option>In-App Message</option>
        <option>Meeting</option>
        <option>Resolution Notification</option>
      </select>
    </div>

    <div class="form-group">
      <label>Responder</label>
      <input type="text" id="responder" placeholder="Your name">
    </div>

    <div class="form-group">
      <label>Response Summary</label>
      <textarea id="summary" placeholder="What was communicated to the customer..."></textarea>
    </div>

    <div class="form-group">
      <label>Update Status To</label>
      <select id="status">
        <option>Open</option>
        <option>In Progress</option>
        <option>Waiting on Customer</option>
        <option>Resolved</option>
        <option>Closed</option>
      </select>
    </div>

    <button onclick="saveResponse()">Log Response</button>

    <script>
      function saveResponse() {
        const data = {
          row: ${row},
          responseType: document.getElementById('responseType').value,
          responder: document.getElementById('responder').value,
          summary: document.getElementById('summary').value,
          status: document.getElementById('status').value
        };

        google.script.run
          .withSuccessHandler(() => {
            alert('Response logged!');
            google.script.host.close();
          })
          .saveResponseLog(data);
      }
    </script>
  `)
  .setWidth(400)
  .setHeight(450);

  SpreadsheetApp.getUi().showModalDialog(html, 'Log Response');
}

function saveResponseLog(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEETS.RESPONSES);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.RESPONSES);
    sheet.appendRow([
      'Response ID', 'Date', 'Original Feedback ID', 'Response Type',
      'Responder', 'Summary', 'Status Change'
    ]);
    sheet.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
  }

  // Get original feedback ID
  const feedbackSheet = ss.getSheetByName(CONFIG.SHEETS.FEEDBACK);
  const feedbackId = feedbackSheet ? feedbackSheet.getRange(data.row, 1).getValue() : 'Unknown';

  const id = 'RESP-' + String(sheet.getLastRow()).padStart(5, '0');

  sheet.appendRow([
    id,
    new Date(),
    feedbackId,
    data.responseType,
    data.responder,
    data.summary,
    data.status
  ]);

  // Update original feedback status
  if (feedbackSheet) {
    feedbackSheet.getRange(data.row, 13).setValue(data.status); // Status column
    if (data.status === 'Resolved') {
      feedbackSheet.getRange(data.row, 15).setValue(new Date()); // Resolved date
    }
  }

  return id;
}

function markResolved() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const row = sheet.getActiveRange().getRow();

  if (row < 2) {
    SpreadsheetApp.getUi().alert('Please select a feedback row first.');
    return;
  }

  sheet.getRange(row, 13).setValue('Resolved');
  sheet.getRange(row, 15).setValue(new Date());
  sheet.getRange(row, 1, 1, sheet.getLastColumn()).setBackground('#e6f4ea');

  SpreadsheetApp.getUi().alert('Feedback marked as resolved!');
}

function escalateFeedback() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    'Escalate Feedback',
    'Enter email address to escalate to:',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const email = response.getResponseText().trim();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const row = sheet.getActiveRange().getRow();

  if (row < 2) {
    ui.alert('Please select a feedback row first.');
    return;
  }

  const feedbackData = sheet.getRange(row, 1, 1, 16).getValues()[0];

  const subject = `[ESCALATED] Customer Feedback: ${feedbackData[7]}`;
  const body = `
    <h2>Escalated Customer Feedback</h2>
    <p><strong>ID:</strong> ${feedbackData[0]}</p>
    <p><strong>Customer:</strong> ${feedbackData[3]} (${feedbackData[2]})</p>
    <p><strong>Category:</strong> ${feedbackData[5]}</p>
    <p><strong>Sentiment:</strong> ${feedbackData[6]}</p>
    <p><strong>Priority:</strong> ${feedbackData[10]}</p>
    <hr>
    <p><strong>Subject:</strong> ${feedbackData[7]}</p>
    <p><strong>Details:</strong></p>
    <p>${feedbackData[8]}</p>
    <hr>
    <p><a href="${ss.getUrl()}">View in Spreadsheet</a></p>
  `;

  MailApp.sendEmail({
    to: email,
    subject: subject,
    htmlBody: body
  });

  sheet.getRange(row, 16).setValue('Escalated to ' + email + ' on ' + new Date().toLocaleDateString());

  ui.alert('Feedback escalated to ' + email);
}

// ============================================
// REPORTS
// ============================================

function generateWeeklyNPSReport() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    'Weekly NPS Report',
    'Enter recipient email(s) (comma-separated):',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const emails = response.getResponseText().split(',').map(e => e.trim());
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const npsSheet = ss.getSheetByName(CONFIG.SHEETS.NPS);

  if (!npsSheet || npsSheet.getLastRow() < 2) {
    ui.alert('No NPS data available for report.');
    return;
  }

  const data = npsSheet.getRange(2, 1, npsSheet.getLastRow() - 1, 11).getValues();

  // Filter to last 7 days
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weekData = data.filter(row => new Date(row[1]) >= oneWeekAgo);

  // Calculate NPS
  let promoters = 0, detractors = 0;
  weekData.forEach(row => {
    if (row[5] >= 9) promoters++;
    else if (row[5] <= 6) detractors++;
  });

  const nps = weekData.length > 0 ? Math.round(((promoters - detractors) / weekData.length) * 100) : 0;

  const subject = `Weekly NPS Report - ${new Date().toLocaleDateString()}`;
  const body = `
    <h1>Weekly NPS Report</h1>
    <h2>NPS Score: ${nps}</h2>
    <p>Based on ${weekData.length} responses this week</p>
    <ul>
      <li>Promoters: ${promoters}</li>
      <li>Detractors: ${detractors}</li>
    </ul>
    <p><a href="${ss.getUrl()}">View Full Dashboard</a></p>
  `;

  emails.forEach(email => {
    MailApp.sendEmail({
      to: email,
      subject: subject,
      htmlBody: body
    });
  });

  ui.alert('Report sent to ' + emails.length + ' recipient(s)');
}

function generateMonthlyFeedbackSummary() {
  SpreadsheetApp.getUi().alert(
    'Monthly Feedback Summary\n\n' +
    'This would generate a comprehensive monthly report including:\n' +
    '- NPS trend over 30 days\n' +
    '- CSAT scores by category\n' +
    '- Top feedback themes\n' +
    '- Resolution rates\n' +
    '- Response time metrics\n\n' +
    'Use the Analytics menu for live dashboards.'
  );
}

function exportForAnalysis() {
  SpreadsheetApp.getUi().alert(
    'Export for Analysis\n\n' +
    'To export data:\n' +
    '1. Select the sheet you want to export\n' +
    '2. Go to File > Download\n' +
    '3. Choose CSV or Excel format\n\n' +
    'For advanced analysis, connect to Google Data Studio or export to your BI tool.'
  );
}

// ============================================
// TREND ANALYSIS
// ============================================

function showTrendAnalysis() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const npsSheet = ss.getSheetByName(CONFIG.SHEETS.NPS);

  if (!npsSheet || npsSheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('Not enough data for trend analysis. Record more NPS responses.');
    return;
  }

  // Get all NPS data
  const data = npsSheet.getRange(2, 1, npsSheet.getLastRow() - 1, 11).getValues();

  // Group by month
  const byMonth = {};
  data.forEach(row => {
    const date = new Date(row[1]);
    const key = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
    if (!byMonth[key]) byMonth[key] = { promoters: 0, passives: 0, detractors: 0, total: 0 };

    byMonth[key].total++;
    if (row[5] >= 9) byMonth[key].promoters++;
    else if (row[5] >= 7) byMonth[key].passives++;
    else byMonth[key].detractors++;
  });

  // Calculate NPS for each month
  const monthlyNPS = Object.entries(byMonth).map(([month, stats]) => ({
    month,
    nps: Math.round(((stats.promoters - stats.detractors) / stats.total) * 100),
    responses: stats.total
  })).sort((a, b) => a.month.localeCompare(b.month));

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .trend-chart { margin: 20px 0; }
      .month-bar { display: flex; align-items: center; margin: 8px 0; }
      .month-label { width: 80px; font-size: 12px; }
      .bar-container { flex: 1; height: 25px; background: #e8e8e8; border-radius: 4px; position: relative; overflow: hidden; }
      .bar { height: 100%; position: absolute; left: 50%; }
      .positive { background: #34a853; }
      .negative { background: #ea4335; }
      .nps-value { width: 60px; text-align: right; font-weight: bold; }
      .legend { display: flex; gap: 20px; margin-top: 20px; justify-content: center; }
      .legend-item { display: flex; align-items: center; gap: 5px; }
      .legend-color { width: 16px; height: 16px; border-radius: 2px; }
    </style>

    <h2>📈 NPS Trend Analysis</h2>

    <div class="trend-chart">
      ${monthlyNPS.slice(-12).map(m => {
        const width = Math.abs(m.nps) / 2; // Scale to fit
        const cls = m.nps >= 0 ? 'positive' : 'negative';
        const style = m.nps >= 0
          ? `left: 50%; width: ${width}%;`
          : `right: 50%; width: ${width}%; left: auto;`;
        return `
          <div class="month-bar">
            <div class="month-label">${m.month}</div>
            <div class="bar-container">
              <div class="bar ${cls}" style="${style}"></div>
            </div>
            <div class="nps-value" style="color: ${m.nps >= 0 ? '#34a853' : '#ea4335'}">${m.nps > 0 ? '+' : ''}${m.nps}</div>
          </div>
        `;
      }).join('')}
    </div>

    <div class="legend">
      <div class="legend-item"><div class="legend-color" style="background: #34a853;"></div> Positive NPS</div>
      <div class="legend-item"><div class="legend-color" style="background: #ea4335;"></div> Negative NPS</div>
    </div>

    <h3>Monthly Details</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr style="background: #f5f5f5;"><th style="padding: 8px; text-align: left;">Month</th><th>NPS</th><th>Responses</th></tr>
      ${monthlyNPS.slice(-12).reverse().map(m =>
        `<tr><td style="padding: 8px;">${m.month}</td><td style="text-align: center;">${m.nps}</td><td style="text-align: center;">${m.responses}</td></tr>`
      ).join('')}
    </table>
  `)
  .setWidth(500)
  .setHeight(600);

  SpreadsheetApp.getUi().showModalDialog(html, 'NPS Trend Analysis');
}

// ============================================
// SETTINGS
// ============================================

function showSettings() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .setting { margin-bottom: 15px; padding: 10px; background: #f5f5f5; border-radius: 4px; }
      label { font-weight: bold; }
      code { background: #e8e8e8; padding: 2px 6px; border-radius: 3px; }
    </style>

    <h2>⚙️ Feedback System Settings</h2>

    <div class="setting">
      <label>Company Name</label>
      <p><code>${CONFIG.COMPANY_NAME}</code></p>
    </div>

    <div class="setting">
      <label>NPS Segments</label>
      <ul>
        <li>Promoters: 9-10</li>
        <li>Passives: 7-8</li>
        <li>Detractors: 0-6</li>
      </ul>
    </div>

    <div class="setting">
      <label>CSAT Scale</label>
      <p>1-5 (Very Dissatisfied to Very Satisfied)</p>
    </div>

    <div class="setting">
      <label>Feedback Categories</label>
      <p style="font-size: 12px;">${CONFIG.CATEGORIES.join(', ')}</p>
    </div>

    <div class="setting">
      <label>Response Priorities</label>
      <ul style="font-size: 12px;">
        ${CONFIG.PRIORITIES.map(p => '<li>' + p + '</li>').join('')}
      </ul>
    </div>

    <h3>Best Practices</h3>
    <ul>
      <li>Send NPS surveys quarterly</li>
      <li>Follow up with detractors within 24 hours</li>
      <li>Thank promoters and ask for referrals</li>
      <li>Track CSAT after every support interaction</li>
      <li>Review feedback trends weekly</li>
    </ul>
  `)
  .setWidth(400)
  .setHeight(550);

  SpreadsheetApp.getUi().showModalDialog(html, 'Settings');
}
