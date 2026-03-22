/**
 * BlackRoad OS - Competitive Intelligence Tracker
 * Track competitors, market positioning, and strategic insights
 *
 * Features:
 * - Competitor profiles with SWOT analysis
 * - Product/feature comparison matrix
 * - Pricing intelligence tracking
 * - Win/loss analysis
 * - Market positioning maps
 * - News and updates monitoring
 * - Battle cards for sales
 */

const CONFIG = {
  COMPANY_NAME: 'BlackRoad OS, Inc.',

  // Sheet names
  SHEETS: {
    COMPETITORS: 'Competitors',
    FEATURES: 'Features',
    PRICING: 'Pricing',
    WIN_LOSS: 'Win/Loss',
    NEWS: 'News',
    BATTLE_CARDS: 'Battle Cards'
  },

  // Competitor categories
  COMPETITOR_TYPES: [
    'Direct Competitor',
    'Indirect Competitor',
    'Potential Entrant',
    'Substitute Product',
    'Emerging Threat'
  ],

  // Threat levels
  THREAT_LEVELS: [
    'Critical',
    'High',
    'Medium',
    'Low',
    'Minimal'
  ],

  // Market segments
  MARKET_SEGMENTS: [
    'Enterprise',
    'Mid-Market',
    'SMB',
    'Startup',
    'Consumer'
  ],

  // Feature categories
  FEATURE_CATEGORIES: [
    'Core Product',
    'Integration',
    'Security',
    'Analytics',
    'Support',
    'Pricing',
    'Usability'
  ],

  // Win/loss reasons
  WIN_REASONS: [
    'Better Price',
    'Superior Features',
    'Better Support',
    'Brand Recognition',
    'Existing Relationship',
    'Better Integration',
    'Faster Implementation'
  ],

  LOSS_REASONS: [
    'Price Too High',
    'Missing Features',
    'Poor Support Experience',
    'Competitor Relationship',
    'Budget Constraints',
    'Technical Limitations',
    'No Decision Made'
  ]
};

// ============================================
// MENU SETUP
// ============================================

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🔍 Intel')
    .addItem('➕ Add Competitor', 'addCompetitor')
    .addItem('📊 SWOT Analysis', 'showSWOTAnalysis')
    .addSeparator()
    .addSubMenu(ui.createMenu('📋 Comparisons')
      .addItem('Feature Matrix', 'showFeatureMatrix')
      .addItem('Pricing Comparison', 'showPricingComparison')
      .addItem('Market Position Map', 'showPositionMap'))
    .addSeparator()
    .addSubMenu(ui.createMenu('📈 Analysis')
      .addItem('Win/Loss Analysis', 'showWinLossAnalysis')
      .addItem('Threat Assessment', 'showThreatAssessment')
      .addItem('Competitor Trends', 'showCompetitorTrends'))
    .addSeparator()
    .addSubMenu(ui.createMenu('🎯 Sales Tools')
      .addItem('Generate Battle Card', 'generateBattleCard')
      .addItem('View All Battle Cards', 'viewBattleCards')
      .addItem('Email Battle Card', 'emailBattleCard'))
    .addSeparator()
    .addItem('📰 Add News/Update', 'addNewsItem')
    .addItem('📧 Weekly Intel Digest', 'sendWeeklyDigest')
    .addItem('⚙️ Settings', 'showSettings')
    .addToUi();
}

// ============================================
// COMPETITOR MANAGEMENT
// ============================================

function addCompetitor() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 12px; }
      label { display: block; font-weight: bold; margin-bottom: 4px; }
      input, select, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      textarea { height: 60px; }
      .row { display: flex; gap: 10px; }
      .row .form-group { flex: 1; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-right: 8px; }
      button:hover { background: #3367d6; }
      .cancel { background: #666; }
      h3 { margin-top: 15px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
    </style>

    <h2>Add New Competitor</h2>

    <div class="form-group">
      <label>Company Name *</label>
      <input type="text" id="companyName" required>
    </div>

    <div class="row">
      <div class="form-group">
        <label>Type</label>
        <select id="type">
          ${CONFIG.COMPETITOR_TYPES.map(t => '<option>' + t + '</option>').join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Threat Level</label>
        <select id="threatLevel">
          ${CONFIG.THREAT_LEVELS.map(t => '<option>' + t + '</option>').join('')}
        </select>
      </div>
    </div>

    <div class="row">
      <div class="form-group">
        <label>Website</label>
        <input type="url" id="website" placeholder="https://">
      </div>
      <div class="form-group">
        <label>Founded</label>
        <input type="number" id="founded" placeholder="Year">
      </div>
    </div>

    <div class="row">
      <div class="form-group">
        <label>Employees</label>
        <input type="text" id="employees" placeholder="e.g., 100-500">
      </div>
      <div class="form-group">
        <label>Funding/Revenue</label>
        <input type="text" id="funding" placeholder="e.g., $50M raised">
      </div>
    </div>

    <div class="form-group">
      <label>Target Markets</label>
      <select id="markets" multiple style="height: 80px;">
        ${CONFIG.MARKET_SEGMENTS.map(m => '<option>' + m + '</option>').join('')}
      </select>
    </div>

    <div class="form-group">
      <label>Description</label>
      <textarea id="description" placeholder="Brief description of the competitor..."></textarea>
    </div>

    <h3>SWOT Analysis</h3>

    <div class="row">
      <div class="form-group">
        <label>Strengths</label>
        <textarea id="strengths" placeholder="Key strengths..."></textarea>
      </div>
      <div class="form-group">
        <label>Weaknesses</label>
        <textarea id="weaknesses" placeholder="Key weaknesses..."></textarea>
      </div>
    </div>

    <div class="row">
      <div class="form-group">
        <label>Opportunities</label>
        <textarea id="opportunities" placeholder="Market opportunities..."></textarea>
      </div>
      <div class="form-group">
        <label>Threats</label>
        <textarea id="threats" placeholder="Threats they pose..."></textarea>
      </div>
    </div>

    <div style="margin-top: 20px;">
      <button onclick="submitCompetitor()">Add Competitor</button>
      <button class="cancel" onclick="google.script.host.close()">Cancel</button>
    </div>

    <script>
      function submitCompetitor() {
        const markets = Array.from(document.getElementById('markets').selectedOptions).map(o => o.value);

        const data = {
          companyName: document.getElementById('companyName').value,
          type: document.getElementById('type').value,
          threatLevel: document.getElementById('threatLevel').value,
          website: document.getElementById('website').value,
          founded: document.getElementById('founded').value,
          employees: document.getElementById('employees').value,
          funding: document.getElementById('funding').value,
          markets: markets.join(', '),
          description: document.getElementById('description').value,
          strengths: document.getElementById('strengths').value,
          weaknesses: document.getElementById('weaknesses').value,
          opportunities: document.getElementById('opportunities').value,
          threats: document.getElementById('threats').value
        };

        if (!data.companyName) {
          alert('Please enter a company name');
          return;
        }

        google.script.run
          .withSuccessHandler(() => {
            alert('Competitor added successfully!');
            google.script.host.close();
          })
          .withFailureHandler(err => alert('Error: ' + err))
          .saveCompetitor(data);
      }
    </script>
  `)
  .setWidth(550)
  .setHeight(700);

  SpreadsheetApp.getUi().showModalDialog(html, 'Add Competitor');
}

function saveCompetitor(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEETS.COMPETITORS);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.COMPETITORS);
    sheet.appendRow([
      'Competitor ID', 'Company Name', 'Type', 'Threat Level', 'Website',
      'Founded', 'Employees', 'Funding/Revenue', 'Target Markets', 'Description',
      'Strengths', 'Weaknesses', 'Opportunities', 'Threats',
      'Last Updated', 'Added Date', 'Notes'
    ]);
    sheet.getRange(1, 1, 1, 17).setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
  }

  const lastRow = sheet.getLastRow();
  const id = 'COMP-' + String(lastRow).padStart(4, '0');
  const now = new Date();

  sheet.appendRow([
    id,
    data.companyName,
    data.type,
    data.threatLevel,
    data.website,
    data.founded,
    data.employees,
    data.funding,
    data.markets,
    data.description,
    data.strengths,
    data.weaknesses,
    data.opportunities,
    data.threats,
    now,
    now,
    ''
  ]);

  // Color code by threat level
  const newRow = sheet.getLastRow();
  const threatColors = {
    'Critical': '#f4cccc',
    'High': '#fce5cd',
    'Medium': '#fff2cc',
    'Low': '#d9ead3',
    'Minimal': '#d0e0e3'
  };

  if (threatColors[data.threatLevel]) {
    sheet.getRange(newRow, 1, 1, 17).setBackground(threatColors[data.threatLevel]);
  }

  return id;
}

// ============================================
// SWOT ANALYSIS
// ============================================

function showSWOTAnalysis() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.COMPETITORS);

  if (!sheet || sheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('No competitors found. Add competitors first.');
    return;
  }

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 17).getValues();

  let competitorOptions = data.map(row => {
    return `<option value="${row[0]}">${row[1]} (${row[3]})</option>`;
  }).join('');

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      select { width: 100%; padding: 10px; margin-bottom: 20px; }
      .swot-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
      .swot-box { padding: 15px; border-radius: 8px; }
      .strengths { background: #d9ead3; border: 2px solid #6aa84f; }
      .weaknesses { background: #f4cccc; border: 2px solid #cc0000; }
      .opportunities { background: #cfe2f3; border: 2px solid #3d85c6; }
      .threats { background: #fff2cc; border: 2px solid #f1c232; }
      h3 { margin: 0 0 10px 0; }
      .content { white-space: pre-wrap; min-height: 80px; }
      .meta { background: #f5f5f5; padding: 10px; border-radius: 4px; margin-bottom: 15px; }
    </style>

    <h2>SWOT Analysis</h2>

    <select id="competitor" onchange="loadSWOT()">
      <option value="">Select a competitor...</option>
      ${competitorOptions}
    </select>

    <div id="swotContent" style="display: none;">
      <div class="meta" id="meta"></div>

      <div class="swot-grid">
        <div class="swot-box strengths">
          <h3>💪 Strengths</h3>
          <div class="content" id="strengths"></div>
        </div>
        <div class="swot-box weaknesses">
          <h3>⚠️ Weaknesses</h3>
          <div class="content" id="weaknesses"></div>
        </div>
        <div class="swot-box opportunities">
          <h3>🎯 Opportunities</h3>
          <div class="content" id="opportunities"></div>
        </div>
        <div class="swot-box threats">
          <h3>🔥 Threats</h3>
          <div class="content" id="threats"></div>
        </div>
      </div>
    </div>

    <script>
      const competitors = ${JSON.stringify(data)};

      function loadSWOT() {
        const id = document.getElementById('competitor').value;
        if (!id) {
          document.getElementById('swotContent').style.display = 'none';
          return;
        }

        const comp = competitors.find(c => c[0] === id);
        if (comp) {
          document.getElementById('meta').innerHTML =
            '<strong>Type:</strong> ' + comp[2] + ' | ' +
            '<strong>Threat:</strong> ' + comp[3] + ' | ' +
            '<strong>Markets:</strong> ' + comp[8];
          document.getElementById('strengths').textContent = comp[10] || 'Not documented';
          document.getElementById('weaknesses').textContent = comp[11] || 'Not documented';
          document.getElementById('opportunities').textContent = comp[12] || 'Not documented';
          document.getElementById('threats').textContent = comp[13] || 'Not documented';
          document.getElementById('swotContent').style.display = 'block';
        }
      }
    </script>
  `)
  .setWidth(650)
  .setHeight(550);

  SpreadsheetApp.getUi().showModalDialog(html, 'SWOT Analysis');
}

// ============================================
// FEATURE COMPARISON
// ============================================

function showFeatureMatrix() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEETS.FEATURES);

  if (!sheet) {
    // Create sample feature matrix
    sheet = ss.insertSheet(CONFIG.SHEETS.FEATURES);
    const headers = ['Feature', 'Category', 'Our Product'];
    sheet.appendRow(headers);

    // Add sample features
    const sampleFeatures = [
      ['SSO/SAML Integration', 'Security', '✅'],
      ['API Access', 'Integration', '✅'],
      ['Custom Reports', 'Analytics', '✅'],
      ['Mobile App', 'Core Product', '✅'],
      ['24/7 Support', 'Support', '✅'],
      ['White Labeling', 'Core Product', '❌'],
      ['Audit Logs', 'Security', '✅']
    ];

    sampleFeatures.forEach(f => sheet.appendRow(f));
    sheet.getRange(1, 1, 1, 3).setFontWeight('bold').setBackground('#4285f4').setFontColor('white');

    SpreadsheetApp.getUi().alert(
      'Feature Matrix Created!\n\n' +
      'Instructions:\n' +
      '1. Add features in column A\n' +
      '2. Add categories in column B\n' +
      '3. Use ✅ (has), ❌ (missing), ⚠️ (partial)\n' +
      '4. Add competitor columns as needed (D, E, F...)\n\n' +
      'Tip: Name columns after competitors'
    );
    return;
  }

  ss.setActiveSheet(sheet);
  SpreadsheetApp.getUi().alert(
    'Feature Matrix\n\n' +
    'Legend:\n' +
    '✅ = Feature available\n' +
    '❌ = Feature missing\n' +
    '⚠️ = Partial/Limited\n' +
    '🔜 = Coming soon\n\n' +
    'Add competitor columns and mark their feature availability.'
  );
}

// ============================================
// PRICING COMPARISON
// ============================================

function showPricingComparison() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEETS.PRICING);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.PRICING);
    sheet.appendRow([
      'Competitor', 'Plan Name', 'Price/Month', 'Price/Year', 'Billing',
      'Users Included', 'Per User Cost', 'Storage', 'Key Features',
      'Free Trial', 'Contract Required', 'Last Updated', 'Notes'
    ]);
    sheet.getRange(1, 1, 1, 13).setFontWeight('bold').setBackground('#4285f4').setFontColor('white');

    // Add our pricing as first row
    sheet.appendRow([
      CONFIG.COMPANY_NAME, 'Professional', '$99', '$990', 'Monthly/Annual',
      '5', '$19.80', '100 GB', 'All features', 'Yes - 14 days', 'No', new Date(), ''
    ]);
  }

  ss.setActiveSheet(sheet);

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      table { width: 100%; border-collapse: collapse; margin-top: 15px; }
      th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
      th { background: #4285f4; color: white; }
      tr:nth-child(even) { background: #f9f9f9; }
      .price { font-weight: bold; color: #0b8043; }
      .add-btn { background: #34a853; color: white; padding: 8px 15px; border: none; border-radius: 4px; cursor: pointer; }
    </style>

    <h2>💰 Pricing Intelligence</h2>

    <p>Track competitor pricing across different tiers and plans.</p>

    <button class="add-btn" onclick="google.script.run.addPricingEntry()">➕ Add Pricing Entry</button>

    <h3>Tips for Pricing Analysis:</h3>
    <ul>
      <li>Track monthly AND annual pricing</li>
      <li>Note per-user costs for comparison</li>
      <li>Document feature differences between tiers</li>
      <li>Update quarterly or when changes detected</li>
      <li>Include hidden costs (setup, support, etc.)</li>
    </ul>

    <h3>Price Positioning</h3>
    <p>Use the Pricing sheet to:</p>
    <ol>
      <li>Compare our pricing to competitors</li>
      <li>Identify pricing gaps and opportunities</li>
      <li>Support sales negotiations</li>
      <li>Track competitor price changes over time</li>
    </ol>
  `)
  .setWidth(500)
  .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(html, 'Pricing Intelligence');
}

function addPricingEntry() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 12px; }
      label { display: block; font-weight: bold; margin-bottom: 4px; }
      input, select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      .row { display: flex; gap: 10px; }
      .row .form-group { flex: 1; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
    </style>

    <h2>Add Pricing Entry</h2>

    <div class="form-group">
      <label>Competitor Name</label>
      <input type="text" id="competitor">
    </div>

    <div class="form-group">
      <label>Plan Name</label>
      <input type="text" id="planName" placeholder="e.g., Professional, Enterprise">
    </div>

    <div class="row">
      <div class="form-group">
        <label>Price/Month ($)</label>
        <input type="number" id="monthlyPrice">
      </div>
      <div class="form-group">
        <label>Price/Year ($)</label>
        <input type="number" id="annualPrice">
      </div>
    </div>

    <div class="row">
      <div class="form-group">
        <label>Users Included</label>
        <input type="number" id="users">
      </div>
      <div class="form-group">
        <label>Storage</label>
        <input type="text" id="storage" placeholder="e.g., 100 GB">
      </div>
    </div>

    <div class="form-group">
      <label>Key Features</label>
      <input type="text" id="features" placeholder="Comma-separated features">
    </div>

    <div class="row">
      <div class="form-group">
        <label>Free Trial?</label>
        <select id="freeTrial">
          <option>Yes - 14 days</option>
          <option>Yes - 30 days</option>
          <option>Yes - 7 days</option>
          <option>Freemium</option>
          <option>No</option>
        </select>
      </div>
      <div class="form-group">
        <label>Contract Required?</label>
        <select id="contract">
          <option>No</option>
          <option>Yes - Annual</option>
          <option>Yes - Multi-year</option>
        </select>
      </div>
    </div>

    <button onclick="savePricing()">Save Pricing</button>

    <script>
      function savePricing() {
        const data = {
          competitor: document.getElementById('competitor').value,
          planName: document.getElementById('planName').value,
          monthlyPrice: document.getElementById('monthlyPrice').value,
          annualPrice: document.getElementById('annualPrice').value,
          users: document.getElementById('users').value,
          storage: document.getElementById('storage').value,
          features: document.getElementById('features').value,
          freeTrial: document.getElementById('freeTrial').value,
          contract: document.getElementById('contract').value
        };

        google.script.run
          .withSuccessHandler(() => {
            alert('Pricing saved!');
            google.script.host.close();
          })
          .savePricingData(data);
      }
    </script>
  `)
  .setWidth(450)
  .setHeight(500);

  SpreadsheetApp.getUi().showModalDialog(html, 'Add Pricing Entry');
}

function savePricingData(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.PRICING);

  const perUser = data.users > 0 ? (data.monthlyPrice / data.users).toFixed(2) : 'N/A';

  sheet.appendRow([
    data.competitor,
    data.planName,
    '$' + data.monthlyPrice,
    '$' + data.annualPrice,
    'Monthly/Annual',
    data.users,
    '$' + perUser,
    data.storage,
    data.features,
    data.freeTrial,
    data.contract,
    new Date(),
    ''
  ]);
}

// ============================================
// WIN/LOSS ANALYSIS
// ============================================

function showWinLossAnalysis() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEETS.WIN_LOSS);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.WIN_LOSS);
    sheet.appendRow([
      'Record ID', 'Date', 'Opportunity', 'Deal Size', 'Result',
      'Competitor Lost To/Won Against', 'Primary Reason', 'Secondary Reasons',
      'Decision Maker', 'Industry', 'Company Size', 'Sales Rep', 'Notes'
    ]);
    sheet.getRange(1, 1, 1, 13).setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
  }

  const data = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 13).getValues() : [];

  // Calculate win/loss stats
  const wins = data.filter(r => r[4] === 'Won').length;
  const losses = data.filter(r => r[4] === 'Lost').length;
  const total = wins + losses;
  const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : 0;

  const winValue = data.filter(r => r[4] === 'Won').reduce((sum, r) => sum + (parseFloat(r[3]) || 0), 0);
  const lossValue = data.filter(r => r[4] === 'Lost').reduce((sum, r) => sum + (parseFloat(r[3]) || 0), 0);

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
      .stat-box { padding: 15px; border-radius: 8px; text-align: center; }
      .wins { background: #d9ead3; }
      .losses { background: #f4cccc; }
      .rate { background: #cfe2f3; }
      .value { background: #fff2cc; }
      .stat-value { font-size: 24px; font-weight: bold; }
      .stat-label { font-size: 12px; color: #666; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin: 5px; }
      .green { background: #34a853; }
      .red { background: #ea4335; }
    </style>

    <h2>📊 Win/Loss Analysis</h2>

    <div class="stats">
      <div class="stat-box wins">
        <div class="stat-value">${wins}</div>
        <div class="stat-label">Wins</div>
      </div>
      <div class="stat-box losses">
        <div class="stat-value">${losses}</div>
        <div class="stat-label">Losses</div>
      </div>
      <div class="stat-box rate">
        <div class="stat-value">${winRate}%</div>
        <div class="stat-label">Win Rate</div>
      </div>
      <div class="stat-box value">
        <div class="stat-value">$${(winValue/1000).toFixed(0)}k</div>
        <div class="stat-label">Won Value</div>
      </div>
    </div>

    <div style="text-align: center;">
      <button class="green" onclick="google.script.run.recordWin()">✅ Record Win</button>
      <button class="red" onclick="google.script.run.recordLoss()">❌ Record Loss</button>
    </div>

    <h3>Win Reasons to Emphasize:</h3>
    <ul>
      ${CONFIG.WIN_REASONS.map(r => '<li>' + r + '</li>').join('')}
    </ul>

    <h3>Loss Reasons to Address:</h3>
    <ul>
      ${CONFIG.LOSS_REASONS.map(r => '<li>' + r + '</li>').join('')}
    </ul>
  `)
  .setWidth(500)
  .setHeight(550);

  SpreadsheetApp.getUi().showModalDialog(html, 'Win/Loss Analysis');
}

function recordWin() {
  recordWinLoss('Won');
}

function recordLoss() {
  recordWinLoss('Lost');
}

function recordWinLoss(result) {
  const reasons = result === 'Won' ? CONFIG.WIN_REASONS : CONFIG.LOSS_REASONS;

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 12px; }
      label { display: block; font-weight: bold; margin-bottom: 4px; }
      input, select, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      button { background: ${result === 'Won' ? '#34a853' : '#ea4335'}; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
    </style>

    <h2>${result === 'Won' ? '✅ Record Win' : '❌ Record Loss'}</h2>

    <div class="form-group">
      <label>Opportunity/Deal Name</label>
      <input type="text" id="opportunity">
    </div>

    <div class="form-group">
      <label>Deal Size ($)</label>
      <input type="number" id="dealSize">
    </div>

    <div class="form-group">
      <label>Competitor ${result === 'Won' ? 'Won Against' : 'Lost To'}</label>
      <input type="text" id="competitor">
    </div>

    <div class="form-group">
      <label>Primary Reason</label>
      <select id="primaryReason">
        ${reasons.map(r => '<option>' + r + '</option>').join('')}
      </select>
    </div>

    <div class="form-group">
      <label>Industry</label>
      <input type="text" id="industry">
    </div>

    <div class="form-group">
      <label>Sales Rep</label>
      <input type="text" id="salesRep">
    </div>

    <div class="form-group">
      <label>Notes</label>
      <textarea id="notes"></textarea>
    </div>

    <button onclick="save()">Save ${result}</button>

    <script>
      function save() {
        const data = {
          result: '${result}',
          opportunity: document.getElementById('opportunity').value,
          dealSize: document.getElementById('dealSize').value,
          competitor: document.getElementById('competitor').value,
          primaryReason: document.getElementById('primaryReason').value,
          industry: document.getElementById('industry').value,
          salesRep: document.getElementById('salesRep').value,
          notes: document.getElementById('notes').value
        };

        google.script.run
          .withSuccessHandler(() => {
            alert('Recorded!');
            google.script.host.close();
          })
          .saveWinLossRecord(data);
      }
    </script>
  `)
  .setWidth(400)
  .setHeight(550);

  SpreadsheetApp.getUi().showModalDialog(html, 'Record ' + result);
}

function saveWinLossRecord(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.WIN_LOSS);

  const lastRow = sheet.getLastRow();
  const id = 'WL-' + String(lastRow).padStart(4, '0');

  sheet.appendRow([
    id,
    new Date(),
    data.opportunity,
    data.dealSize,
    data.result,
    data.competitor,
    data.primaryReason,
    '',
    '',
    data.industry,
    '',
    data.salesRep,
    data.notes
  ]);

  // Color code row
  const newRow = sheet.getLastRow();
  const color = data.result === 'Won' ? '#d9ead3' : '#f4cccc';
  sheet.getRange(newRow, 1, 1, 13).setBackground(color);
}

// ============================================
// BATTLE CARDS
// ============================================

function generateBattleCard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const compSheet = ss.getSheetByName(CONFIG.SHEETS.COMPETITORS);

  if (!compSheet || compSheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('Add competitors first before generating battle cards.');
    return;
  }

  const data = compSheet.getRange(2, 1, compSheet.getLastRow() - 1, 14).getValues();

  const competitorOptions = data.map(row => {
    return `<option value="${row[0]}">${row[1]}</option>`;
  }).join('');

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      select { width: 100%; padding: 10px; margin-bottom: 20px; font-size: 16px; }
      .battle-card { display: none; background: #f8f9fa; padding: 20px; border-radius: 8px; }
      .section { margin-bottom: 15px; }
      .section-title { font-weight: bold; color: #4285f4; margin-bottom: 5px; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
      .us { background: #d9ead3; padding: 10px; border-radius: 4px; }
      .them { background: #f4cccc; padding: 10px; border-radius: 4px; }
      h4 { margin: 0 0 5px 0; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px; }
    </style>

    <h2>🎯 Generate Battle Card</h2>

    <select id="competitor" onchange="showBattleCard()">
      <option value="">Select competitor...</option>
      ${competitorOptions}
    </select>

    <div class="battle-card" id="battleCard">
      <h3 id="compName">Battle Card: [Competitor]</h3>

      <div class="section">
        <div class="section-title">📊 Overview</div>
        <div id="overview"></div>
      </div>

      <div class="grid">
        <div class="us">
          <h4>✅ Our Strengths vs Them</h4>
          <div id="ourStrengths">Loading...</div>
        </div>
        <div class="them">
          <h4>⚠️ Their Strengths</h4>
          <div id="theirStrengths">Loading...</div>
        </div>
      </div>

      <div class="section" style="margin-top: 15px;">
        <div class="section-title">🎤 Talking Points</div>
        <ul id="talkingPoints"></ul>
      </div>

      <div class="section">
        <div class="section-title">❓ Objection Handlers</div>
        <div id="objections"></div>
      </div>

      <button onclick="saveBattleCard()">💾 Save to Battle Cards Sheet</button>
      <button onclick="copyToClipboard()">📋 Copy as Text</button>
    </div>

    <script>
      const competitors = ${JSON.stringify(data)};
      let currentComp = null;

      function showBattleCard() {
        const id = document.getElementById('competitor').value;
        const card = document.getElementById('battleCard');

        if (!id) {
          card.style.display = 'none';
          return;
        }

        currentComp = competitors.find(c => c[0] === id);
        if (!currentComp) return;

        document.getElementById('compName').textContent = 'Battle Card: ' + currentComp[1];
        document.getElementById('overview').innerHTML =
          '<strong>Type:</strong> ' + currentComp[2] + '<br>' +
          '<strong>Threat Level:</strong> ' + currentComp[3] + '<br>' +
          '<strong>Markets:</strong> ' + currentComp[8] + '<br>' +
          '<strong>Funding:</strong> ' + currentComp[7];

        document.getElementById('theirStrengths').textContent = currentComp[10] || 'Not documented';
        document.getElementById('ourStrengths').textContent = currentComp[11] || 'Analyze their weaknesses';

        // Generate talking points from their weaknesses
        const weaknesses = (currentComp[11] || '').split(',').map(w => w.trim()).filter(w => w);
        const talkingPointsHtml = weaknesses.length > 0
          ? weaknesses.map(w => '<li>Address: ' + w + '</li>').join('')
          : '<li>Emphasize our unique value proposition</li><li>Focus on customer success stories</li>';
        document.getElementById('talkingPoints').innerHTML = talkingPointsHtml;

        document.getElementById('objections').innerHTML =
          '<p><strong>"Why not [Competitor]?"</strong></p>' +
          '<p>Response: Focus on ' + (currentComp[11] || 'our superior solution') + '</p>';

        card.style.display = 'block';
      }

      function saveBattleCard() {
        if (!currentComp) return;
        google.script.run
          .withSuccessHandler(() => alert('Battle card saved!'))
          .saveBattleCardToSheet(currentComp[0], currentComp[1]);
      }

      function copyToClipboard() {
        const text = document.getElementById('battleCard').innerText;
        navigator.clipboard.writeText(text).then(() => alert('Copied!'));
      }
    </script>
  `)
  .setWidth(600)
  .setHeight(650);

  SpreadsheetApp.getUi().showModalDialog(html, 'Battle Card Generator');
}

function saveBattleCardToSheet(compId, compName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEETS.BATTLE_CARDS);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.BATTLE_CARDS);
    sheet.appendRow(['Battle Card ID', 'Competitor', 'Generated Date', 'Last Updated', 'Version', 'Notes']);
    sheet.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
  }

  const id = 'BC-' + String(sheet.getLastRow()).padStart(4, '0');
  sheet.appendRow([id, compName, new Date(), new Date(), '1.0', '']);

  return id;
}

// ============================================
// NEWS & UPDATES
// ============================================

function addNewsItem() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 12px; }
      label { display: block; font-weight: bold; margin-bottom: 4px; }
      input, select, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      textarea { height: 80px; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
    </style>

    <h2>📰 Add Competitor News/Update</h2>

    <div class="form-group">
      <label>Competitor</label>
      <input type="text" id="competitor">
    </div>

    <div class="form-group">
      <label>News Type</label>
      <select id="newsType">
        <option>Product Launch</option>
        <option>Funding Round</option>
        <option>Acquisition</option>
        <option>Partnership</option>
        <option>Leadership Change</option>
        <option>Pricing Change</option>
        <option>Expansion</option>
        <option>Layoffs</option>
        <option>Other</option>
      </select>
    </div>

    <div class="form-group">
      <label>Headline</label>
      <input type="text" id="headline">
    </div>

    <div class="form-group">
      <label>Summary</label>
      <textarea id="summary"></textarea>
    </div>

    <div class="form-group">
      <label>Source URL</label>
      <input type="url" id="sourceUrl" placeholder="https://">
    </div>

    <div class="form-group">
      <label>Impact Assessment</label>
      <select id="impact">
        <option>High - Requires immediate action</option>
        <option>Medium - Monitor closely</option>
        <option>Low - Informational only</option>
      </select>
    </div>

    <button onclick="saveNews()">Save News Item</button>

    <script>
      function saveNews() {
        const data = {
          competitor: document.getElementById('competitor').value,
          newsType: document.getElementById('newsType').value,
          headline: document.getElementById('headline').value,
          summary: document.getElementById('summary').value,
          sourceUrl: document.getElementById('sourceUrl').value,
          impact: document.getElementById('impact').value
        };

        google.script.run
          .withSuccessHandler(() => {
            alert('News item saved!');
            google.script.host.close();
          })
          .saveNewsItem(data);
      }
    </script>
  `)
  .setWidth(450)
  .setHeight(550);

  SpreadsheetApp.getUi().showModalDialog(html, 'Add News Item');
}

function saveNewsItem(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEETS.NEWS);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.NEWS);
    sheet.appendRow([
      'News ID', 'Date', 'Competitor', 'Type', 'Headline',
      'Summary', 'Source URL', 'Impact', 'Action Taken', 'Notes'
    ]);
    sheet.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
  }

  const id = 'NEWS-' + String(sheet.getLastRow()).padStart(4, '0');

  sheet.appendRow([
    id,
    new Date(),
    data.competitor,
    data.newsType,
    data.headline,
    data.summary,
    data.sourceUrl,
    data.impact,
    '',
    ''
  ]);

  // Color code by impact
  const newRow = sheet.getLastRow();
  const impactColors = {
    'High - Requires immediate action': '#f4cccc',
    'Medium - Monitor closely': '#fff2cc',
    'Low - Informational only': '#d9ead3'
  };

  if (impactColors[data.impact]) {
    sheet.getRange(newRow, 1, 1, 10).setBackground(impactColors[data.impact]);
  }
}

// ============================================
// WEEKLY DIGEST
// ============================================

function sendWeeklyDigest() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    'Weekly Intel Digest',
    'Enter recipient email addresses (comma-separated):',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const emails = response.getResponseText().split(',').map(e => e.trim());
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Gather intel
  let newsItems = [];
  const newsSheet = ss.getSheetByName(CONFIG.SHEETS.NEWS);
  if (newsSheet && newsSheet.getLastRow() > 1) {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const newsData = newsSheet.getRange(2, 1, newsSheet.getLastRow() - 1, 10).getValues();
    newsItems = newsData.filter(row => new Date(row[1]) >= oneWeekAgo);
  }

  // Get competitor count
  const compSheet = ss.getSheetByName(CONFIG.SHEETS.COMPETITORS);
  const compCount = compSheet ? compSheet.getLastRow() - 1 : 0;

  // Build email
  const subject = `Weekly Competitive Intel Digest - ${new Date().toLocaleDateString()}`;

  let body = `
    <h1>Weekly Competitive Intelligence Digest</h1>
    <p>Generated: ${new Date().toLocaleString()}</p>

    <h2>📊 Summary</h2>
    <ul>
      <li>Competitors tracked: ${compCount}</li>
      <li>News items this week: ${newsItems.length}</li>
    </ul>
  `;

  if (newsItems.length > 0) {
    body += '<h2>📰 This Week\'s News</h2><ul>';
    newsItems.forEach(item => {
      body += `<li><strong>${item[2]}</strong>: ${item[4]} (${item[3]})</li>`;
    });
    body += '</ul>';
  }

  body += `
    <hr>
    <p><em>Generated by ${CONFIG.COMPANY_NAME} Competitive Intelligence System</em></p>
    <p><a href="${ss.getUrl()}">View Full Dashboard</a></p>
  `;

  emails.forEach(email => {
    MailApp.sendEmail({
      to: email,
      subject: subject,
      htmlBody: body
    });
  });

  ui.alert('Weekly digest sent to ' + emails.length + ' recipient(s)!');
}

// ============================================
// THREAT ASSESSMENT
// ============================================

function showThreatAssessment() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.COMPETITORS);

  if (!sheet || sheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('No competitors found. Add competitors first.');
    return;
  }

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 14).getValues();

  // Count by threat level
  const threatCounts = {};
  CONFIG.THREAT_LEVELS.forEach(t => threatCounts[t] = 0);
  data.forEach(row => {
    if (threatCounts.hasOwnProperty(row[3])) {
      threatCounts[row[3]]++;
    }
  });

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .threat-summary { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
      .threat-box { padding: 15px; border-radius: 8px; text-align: center; min-width: 80px; }
      .critical { background: #f4cccc; border: 2px solid #cc0000; }
      .high { background: #fce5cd; border: 2px solid #e69138; }
      .medium { background: #fff2cc; border: 2px solid #f1c232; }
      .low { background: #d9ead3; border: 2px solid #6aa84f; }
      .minimal { background: #d0e0e3; border: 2px solid #76a5af; }
      .count { font-size: 28px; font-weight: bold; }
      .label { font-size: 12px; }
      table { width: 100%; border-collapse: collapse; margin-top: 15px; }
      th, td { padding: 8px; border: 1px solid #ddd; text-align: left; }
      th { background: #4285f4; color: white; }
    </style>

    <h2>⚠️ Threat Assessment</h2>

    <div class="threat-summary">
      <div class="threat-box critical">
        <div class="count">${threatCounts['Critical'] || 0}</div>
        <div class="label">Critical</div>
      </div>
      <div class="threat-box high">
        <div class="count">${threatCounts['High'] || 0}</div>
        <div class="label">High</div>
      </div>
      <div class="threat-box medium">
        <div class="count">${threatCounts['Medium'] || 0}</div>
        <div class="label">Medium</div>
      </div>
      <div class="threat-box low">
        <div class="count">${threatCounts['Low'] || 0}</div>
        <div class="label">Low</div>
      </div>
      <div class="threat-box minimal">
        <div class="count">${threatCounts['Minimal'] || 0}</div>
        <div class="label">Minimal</div>
      </div>
    </div>

    <h3>High Priority Threats</h3>
    <table>
      <tr><th>Competitor</th><th>Type</th><th>Threat</th><th>Markets</th></tr>
      ${data.filter(r => r[3] === 'Critical' || r[3] === 'High').map(r =>
        '<tr><td>' + r[1] + '</td><td>' + r[2] + '</td><td>' + r[3] + '</td><td>' + r[8] + '</td></tr>'
      ).join('') || '<tr><td colspan="4">No high-priority threats</td></tr>'}
    </table>
  `)
  .setWidth(550)
  .setHeight(450);

  SpreadsheetApp.getUi().showModalDialog(html, 'Threat Assessment');
}

// ============================================
// MARKET POSITION MAP
// ============================================

function showPositionMap() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .map-container { position: relative; width: 400px; height: 400px; border: 2px solid #333; margin: 20px auto; }
      .axis-label { position: absolute; font-size: 12px; color: #666; }
      .x-axis { bottom: -25px; left: 50%; transform: translateX(-50%); }
      .y-axis { left: -60px; top: 50%; transform: rotate(-90deg); }
      .quadrant { position: absolute; width: 50%; height: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #666; }
      .q1 { top: 0; right: 0; background: #d9ead3; }
      .q2 { top: 0; left: 0; background: #fff2cc; }
      .q3 { bottom: 0; left: 0; background: #f4cccc; }
      .q4 { bottom: 0; right: 0; background: #cfe2f3; }
      p { text-align: center; color: #666; }
    </style>

    <h2>🗺️ Market Position Map</h2>

    <div class="map-container">
      <div class="quadrant q1">Leaders<br>(High Price, High Features)</div>
      <div class="quadrant q2">Niche Players<br>(Low Price, High Features)</div>
      <div class="quadrant q3">Budget Options<br>(Low Price, Low Features)</div>
      <div class="quadrant q4">Overpriced<br>(High Price, Low Features)</div>
      <div class="axis-label x-axis">Price →</div>
      <div class="axis-label y-axis">Features →</div>
    </div>

    <p>Use the Competitors sheet to map where each competitor falls.<br>
    Add columns for "Price Score" (1-10) and "Feature Score" (1-10).</p>

    <h3>How to Use:</h3>
    <ol>
      <li>Score each competitor on Price (1=cheap, 10=expensive)</li>
      <li>Score each competitor on Features (1=basic, 10=comprehensive)</li>
      <li>Plot competitors on this 2x2 matrix</li>
      <li>Identify market gaps and positioning opportunities</li>
    </ol>
  `)
  .setWidth(500)
  .setHeight(600);

  SpreadsheetApp.getUi().showModalDialog(html, 'Market Position Map');
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

    <h2>⚙️ Settings</h2>

    <div class="setting">
      <label>Company Name</label>
      <p><code>${CONFIG.COMPANY_NAME}</code></p>
      <p style="font-size: 12px; color: #666;">Edit CONFIG.COMPANY_NAME in Apps Script</p>
    </div>

    <div class="setting">
      <label>Sheets Created</label>
      <ul>
        ${Object.values(CONFIG.SHEETS).map(s => '<li>' + s + '</li>').join('')}
      </ul>
    </div>

    <div class="setting">
      <label>Competitor Types</label>
      <p>${CONFIG.COMPETITOR_TYPES.join(', ')}</p>
    </div>

    <div class="setting">
      <label>Threat Levels</label>
      <p>${CONFIG.THREAT_LEVELS.join(' → ')}</p>
    </div>

    <h3>Tips</h3>
    <ul>
      <li>Review competitors quarterly</li>
      <li>Update SWOT analysis after major news</li>
      <li>Generate fresh battle cards before big deals</li>
      <li>Track win/loss for every competitive deal</li>
    </ul>
  `)
  .setWidth(400)
  .setHeight(500);

  SpreadsheetApp.getUi().showModalDialog(html, 'Settings');
}

function showCompetitorTrends() {
  SpreadsheetApp.getUi().alert(
    'Competitor Trends\n\n' +
    'To track trends over time:\n\n' +
    '1. Record news items regularly\n' +
    '2. Update threat levels as situations change\n' +
    '3. Track win/loss patterns by competitor\n' +
    '4. Monitor pricing changes in Pricing sheet\n\n' +
    'Use filters on each sheet to analyze trends by date, competitor, or category.'
  );
}

function viewBattleCards() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.BATTLE_CARDS);

  if (sheet) {
    ss.setActiveSheet(sheet);
  } else {
    SpreadsheetApp.getUi().alert('No battle cards generated yet. Use "Generate Battle Card" first.');
  }
}

function emailBattleCard() {
  SpreadsheetApp.getUi().alert(
    'Email Battle Card\n\n' +
    '1. Generate a battle card first\n' +
    '2. Save it to the Battle Cards sheet\n' +
    '3. Share the sheet with your sales team\n\n' +
    'Or copy the battle card text and paste into an email.'
  );
}
