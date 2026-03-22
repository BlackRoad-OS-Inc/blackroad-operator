/**
 * BLACKROAD OS - Applicant Tracking System (ATS)
 *
 * SETUP: Extensions > Apps Script > Paste this code > Save > Refresh sheet
 *
 * FEATURES:
 * - Job requisition management
 * - Candidate pipeline tracking
 * - Interview scheduling
 * - Scorecards and evaluations
 * - Offer management
 * - Source tracking and analytics
 * - Automated email communications
 * - Hiring reports
 */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('👥 Recruiting')
    .addItem('➕ Create Job Requisition', 'createJobReq')
    .addItem('👤 Add Candidate', 'addCandidate')
    .addSeparator()
    .addSubMenu(ui.createMenu('📋 Pipeline')
      .addItem('Move to Next Stage', 'moveToNextStage')
      .addItem('Reject Candidate', 'rejectCandidate')
      .addItem('View Pipeline', 'viewPipeline'))
    .addSeparator()
    .addSubMenu(ui.createMenu('📅 Interviews')
      .addItem('Schedule Interview', 'scheduleInterview')
      .addItem('Submit Scorecard', 'submitScorecard')
      .addItem('View Interview Calendar', 'viewInterviews'))
    .addSeparator()
    .addSubMenu(ui.createMenu('📨 Offers')
      .addItem('Generate Offer', 'generateOffer')
      .addItem('Track Offer Status', 'trackOfferStatus'))
    .addSeparator()
    .addSubMenu(ui.createMenu('📊 Reports')
      .addItem('Pipeline Summary', 'pipelineSummary')
      .addItem('Time to Hire', 'timeToHire')
      .addItem('Source Analytics', 'sourceAnalytics')
      .addItem('Hiring Funnel', 'hiringFunnel'))
    .addSeparator()
    .addItem('📧 Send Email to Candidate', 'sendCandidateEmail')
    .addItem('⚙️ Settings', 'openATSSettings')
    .addToUi();
}

const CONFIG = {
  COMPANY_NAME: 'BlackRoad OS, Inc.',
  PIPELINE_STAGES: ['Applied', 'Phone Screen', 'Technical Interview', 'Onsite', 'Offer', 'Hired', 'Rejected'],
  DEPARTMENTS: ['Engineering', 'Product', 'Design', 'Sales', 'Marketing', 'Operations', 'HR', 'Finance', 'Legal'],
  SOURCES: ['LinkedIn', 'Indeed', 'Company Website', 'Referral', 'University', 'Recruiter', 'Conference', 'Other'],
  EMPLOYMENT_TYPES: ['Full-time', 'Part-time', 'Contract', 'Internship'],
  INTERVIEW_TYPES: ['Phone Screen', 'Technical', 'Behavioral', 'System Design', 'Culture Fit', 'Hiring Manager', 'Executive'],
  SCORECARD_CRITERIA: ['Technical Skills', 'Problem Solving', 'Communication', 'Culture Fit', 'Experience', 'Leadership'],
  EMAIL_TEMPLATES: {
    'Phone Screen Invite': 'We would like to schedule a phone screen with you...',
    'Interview Invite': 'We are excited to invite you for an interview...',
    'Rejection': 'Thank you for your interest. After careful consideration...',
    'Offer': 'We are pleased to extend an offer of employment...'
  }
};

// Create Job Requisition
function createJobReq() {
  const ui = SpreadsheetApp.getUi();

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      label { display: block; margin-top: 10px; font-weight: bold; }
      input, select, textarea { width: 100%; padding: 8px; margin-top: 5px; box-sizing: border-box; }
      button { margin-top: 20px; padding: 10px 20px; background: #2979FF; color: white; border: none; cursor: pointer; width: 100%; }
      .row { display: flex; gap: 10px; }
      .col { flex: 1; }
    </style>

    <label>Job Title:</label>
    <input type="text" id="title" placeholder="e.g., Senior Software Engineer">

    <label>Department:</label>
    <select id="department">
      ${CONFIG.DEPARTMENTS.map(d => '<option>' + d + '</option>').join('')}
    </select>

    <label>Hiring Manager:</label>
    <input type="text" id="manager" placeholder="Name or email">

    <div class="row">
      <div class="col">
        <label>Employment Type:</label>
        <select id="empType">
          ${CONFIG.EMPLOYMENT_TYPES.map(t => '<option>' + t + '</option>').join('')}
        </select>
      </div>
      <div class="col">
        <label>Location:</label>
        <input type="text" id="location" placeholder="e.g., Remote, NYC">
      </div>
    </div>

    <div class="row">
      <div class="col">
        <label>Salary Min ($):</label>
        <input type="number" id="salaryMin" value="0">
      </div>
      <div class="col">
        <label>Salary Max ($):</label>
        <input type="number" id="salaryMax" value="0">
      </div>
    </div>

    <label>Headcount:</label>
    <input type="number" id="headcount" value="1" min="1">

    <label>Target Start Date:</label>
    <input type="date" id="targetDate">

    <label>Job Description:</label>
    <textarea id="description" rows="3" placeholder="Key responsibilities and requirements"></textarea>

    <button onclick="submitJobReq()">Create Requisition</button>

    <script>
      function submitJobReq() {
        const data = {
          title: document.getElementById('title').value,
          department: document.getElementById('department').value,
          manager: document.getElementById('manager').value,
          empType: document.getElementById('empType').value,
          location: document.getElementById('location').value,
          salaryMin: parseFloat(document.getElementById('salaryMin').value),
          salaryMax: parseFloat(document.getElementById('salaryMax').value),
          headcount: parseInt(document.getElementById('headcount').value),
          targetDate: document.getElementById('targetDate').value,
          description: document.getElementById('description').value
        };
        google.script.run.withSuccessHandler(() => {
          google.script.host.close();
        }).processJobReq(data);
      }
    </script>
  `).setWidth(450).setHeight(650);

  ui.showModalDialog(html, '➕ Create Job Requisition');
}

function processJobReq(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Job Requisitions');

  if (!sheet) {
    sheet = ss.insertSheet('Job Requisitions');
    sheet.getRange(1, 1, 1, 14).setValues([['Req ID', 'Title', 'Department', 'Hiring Manager', 'Type', 'Location', 'Salary Range', 'Headcount', 'Filled', 'Target Date', 'Status', 'Posted Date', 'Description', 'Candidates']]);
    sheet.getRange(1, 1, 1, 14).setFontWeight('bold').setBackground('#2979FF').setFontColor('white');
  }

  const lastRow = Math.max(sheet.getLastRow(), 1);
  const id = 'REQ-' + new Date().getFullYear() + '-' + String(lastRow).padStart(3, '0');
  const salaryRange = '$' + data.salaryMin.toLocaleString() + ' - $' + data.salaryMax.toLocaleString();

  sheet.appendRow([
    id,
    data.title,
    data.department,
    data.manager,
    data.empType,
    data.location,
    salaryRange,
    data.headcount,
    0,
    data.targetDate,
    'Open',
    new Date().toLocaleDateString(),
    data.description,
    0
  ]);

  const deptColors = {
    'Engineering': '#E3F2FD',
    'Product': '#E8F5E9',
    'Design': '#F3E5F5',
    'Sales': '#FFF3E0',
    'Marketing': '#FCE4EC'
  };
  sheet.getRange(sheet.getLastRow(), 1, 1, 14).setBackground(deptColors[data.department] || '#FFFFFF');

  SpreadsheetApp.getUi().alert('✅ Job requisition created!\n\nReq ID: ' + id + '\nTitle: ' + data.title);
}

// Add Candidate
function addCandidate() {
  const ui = SpreadsheetApp.getUi();

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      label { display: block; margin-top: 10px; font-weight: bold; }
      input, select, textarea { width: 100%; padding: 8px; margin-top: 5px; box-sizing: border-box; }
      button { margin-top: 20px; padding: 10px 20px; background: #9C27B0; color: white; border: none; cursor: pointer; width: 100%; }
      .row { display: flex; gap: 10px; }
      .col { flex: 1; }
    </style>

    <label>Job Requisition ID:</label>
    <input type="text" id="reqId" placeholder="e.g., REQ-2024-001">

    <label>Candidate Name:</label>
    <input type="text" id="name" placeholder="Full name">

    <label>Email:</label>
    <input type="email" id="email" placeholder="candidate@email.com">

    <label>Phone:</label>
    <input type="tel" id="phone" placeholder="+1 555-0100">

    <label>Source:</label>
    <select id="source">
      ${CONFIG.SOURCES.map(s => '<option>' + s + '</option>').join('')}
    </select>

    <label>Current Title:</label>
    <input type="text" id="currentTitle" placeholder="Current job title">

    <label>Current Company:</label>
    <input type="text" id="currentCompany" placeholder="Current employer">

    <label>LinkedIn URL:</label>
    <input type="url" id="linkedin" placeholder="https://linkedin.com/in/...">

    <label>Resume Link:</label>
    <input type="url" id="resume" placeholder="Google Drive link to resume">

    <label>Notes:</label>
    <textarea id="notes" rows="2" placeholder="Initial notes"></textarea>

    <button onclick="submitCandidate()">Add Candidate</button>

    <script>
      function submitCandidate() {
        const data = {
          reqId: document.getElementById('reqId').value,
          name: document.getElementById('name').value,
          email: document.getElementById('email').value,
          phone: document.getElementById('phone').value,
          source: document.getElementById('source').value,
          currentTitle: document.getElementById('currentTitle').value,
          currentCompany: document.getElementById('currentCompany').value,
          linkedin: document.getElementById('linkedin').value,
          resume: document.getElementById('resume').value,
          notes: document.getElementById('notes').value
        };
        google.script.run.withSuccessHandler(() => {
          google.script.host.close();
        }).processCandidate(data);
      }
    </script>
  `).setWidth(450).setHeight(700);

  ui.showModalDialog(html, '👤 Add Candidate');
}

function processCandidate(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Candidates');

  if (!sheet) {
    sheet = ss.insertSheet('Candidates');
    sheet.getRange(1, 1, 1, 16).setValues([['Candidate ID', 'Req ID', 'Name', 'Email', 'Phone', 'Source', 'Current Title', 'Current Company', 'Stage', 'Score', 'LinkedIn', 'Resume', 'Applied Date', 'Last Activity', 'Notes', 'Interviews']]);
    sheet.getRange(1, 1, 1, 16).setFontWeight('bold').setBackground('#9C27B0').setFontColor('white');
  }

  const lastRow = Math.max(sheet.getLastRow(), 1);
  const id = 'CAN-' + new Date().getFullYear() + '-' + String(lastRow).padStart(4, '0');

  sheet.appendRow([
    id,
    data.reqId,
    data.name,
    data.email,
    data.phone,
    data.source,
    data.currentTitle,
    data.currentCompany,
    'Applied',
    0,
    data.linkedin,
    data.resume,
    new Date().toLocaleDateString(),
    new Date().toLocaleDateString(),
    data.notes,
    0
  ]);

  // Update candidate count on requisition
  updateReqCandidateCount(data.reqId);

  SpreadsheetApp.getUi().alert('✅ Candidate added!\n\nCandidate ID: ' + id + '\nName: ' + data.name + '\nStage: Applied');
}

function updateReqCandidateCount(reqId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const reqSheet = ss.getSheetByName('Job Requisitions');
  const candSheet = ss.getSheetByName('Candidates');

  if (!reqSheet || !candSheet) return;

  const candData = candSheet.getRange(2, 1, candSheet.getLastRow() - 1, 2).getValues();
  const count = candData.filter(row => row[1] === reqId).length;

  const reqData = reqSheet.getRange(2, 1, reqSheet.getLastRow() - 1, 14).getValues();
  for (let i = 0; i < reqData.length; i++) {
    if (reqData[i][0] === reqId) {
      reqSheet.getRange(i + 2, 14).setValue(count);
      return;
    }
  }
}

// Move to Next Stage
function moveToNextStage() {
  const ui = SpreadsheetApp.getUi();

  const candResponse = ui.prompt('Enter Candidate ID:', ui.ButtonSet.OK_CANCEL);
  if (candResponse.getSelectedButton() !== ui.Button.OK) return;
  const candId = candResponse.getResponseText().trim();

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Candidates');

  if (!sheet) {
    ui.alert('No Candidates sheet found.');
    return;
  }

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 16).getValues();

  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === candId) {
      const currentStage = data[i][8];
      const stageIndex = CONFIG.PIPELINE_STAGES.indexOf(currentStage);

      if (stageIndex === -1 || stageIndex >= CONFIG.PIPELINE_STAGES.length - 2) {
        ui.alert('Cannot advance: ' + currentStage);
        return;
      }

      const nextStage = CONFIG.PIPELINE_STAGES[stageIndex + 1];
      const row = i + 2;

      sheet.getRange(row, 9).setValue(nextStage);
      sheet.getRange(row, 14).setValue(new Date().toLocaleDateString());

      // Color code by stage
      const stageColors = {
        'Applied': '#ECEFF1',
        'Phone Screen': '#E3F2FD',
        'Technical Interview': '#E8F5E9',
        'Onsite': '#FFF3E0',
        'Offer': '#F3E5F5',
        'Hired': '#C8E6C9'
      };
      sheet.getRange(row, 1, 1, 16).setBackground(stageColors[nextStage] || '#FFFFFF');

      ui.alert('✅ Candidate advanced!\n\n' + data[i][2] + '\n' + currentStage + ' → ' + nextStage);
      return;
    }
  }

  ui.alert('❌ Candidate not found.');
}

// Reject Candidate
function rejectCandidate() {
  const ui = SpreadsheetApp.getUi();

  const candResponse = ui.prompt('Enter Candidate ID to reject:', ui.ButtonSet.OK_CANCEL);
  if (candResponse.getSelectedButton() !== ui.Button.OK) return;
  const candId = candResponse.getResponseText().trim();

  const reasonResponse = ui.prompt('Rejection reason:', ui.ButtonSet.OK_CANCEL);
  const reason = reasonResponse.getSelectedButton() === ui.Button.OK ? reasonResponse.getResponseText() : '';

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Candidates');

  if (!sheet) return;

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 16).getValues();

  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === candId) {
      const row = i + 2;
      sheet.getRange(row, 9).setValue('Rejected');
      sheet.getRange(row, 14).setValue(new Date().toLocaleDateString());
      sheet.getRange(row, 15).setValue((data[i][14] ? data[i][14] + '\n' : '') + 'Rejected: ' + reason);
      sheet.getRange(row, 1, 1, 16).setBackground('#FFCDD2');

      ui.alert('✅ Candidate rejected.\n\nReason logged.');
      return;
    }
  }

  ui.alert('❌ Candidate not found.');
}

// View Pipeline
function viewPipeline() {
  const ui = SpreadsheetApp.getUi();

  const reqResponse = ui.prompt('Enter Req ID (or blank for all):', ui.ButtonSet.OK_CANCEL);
  if (reqResponse.getSelectedButton() !== ui.Button.OK) return;
  const reqId = reqResponse.getResponseText().trim();

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Candidates');

  if (!sheet || sheet.getLastRow() < 2) {
    ui.alert('No candidates found.');
    return;
  }

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 16).getValues();
  const filtered = reqId ? data.filter(row => row[1] === reqId) : data;

  const byStage = {};
  for (const stage of CONFIG.PIPELINE_STAGES) {
    byStage[stage] = filtered.filter(row => row[8] === stage);
  }

  let report = `📋 PIPELINE VIEW\n${'='.repeat(20)}\n${reqId ? 'Req: ' + reqId : 'All Requisitions'}\n\n`;

  for (const stage of CONFIG.PIPELINE_STAGES) {
    const candidates = byStage[stage];
    report += `${stage} (${candidates.length})\n`;
    for (const cand of candidates.slice(0, 5)) {
      report += `  • ${cand[2]} (${cand[0]})\n`;
    }
    if (candidates.length > 5) {
      report += `  ... and ${candidates.length - 5} more\n`;
    }
    report += '\n';
  }

  ui.alert(report);
}

// Schedule Interview
function scheduleInterview() {
  const ui = SpreadsheetApp.getUi();

  const candResponse = ui.prompt('Enter Candidate ID:', ui.ButtonSet.OK_CANCEL);
  if (candResponse.getSelectedButton() !== ui.Button.OK) return;
  const candId = candResponse.getResponseText().trim();

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      label { display: block; margin-top: 10px; font-weight: bold; }
      input, select { width: 100%; padding: 8px; margin-top: 5px; box-sizing: border-box; }
      button { margin-top: 20px; padding: 10px 20px; background: #2979FF; color: white; border: none; cursor: pointer; width: 100%; }
    </style>

    <p><b>Candidate:</b> ${candId}</p>

    <label>Interview Type:</label>
    <select id="interviewType">
      ${CONFIG.INTERVIEW_TYPES.map(t => '<option>' + t + '</option>').join('')}
    </select>

    <label>Date:</label>
    <input type="date" id="date">

    <label>Time:</label>
    <input type="time" id="time" value="10:00">

    <label>Duration (minutes):</label>
    <input type="number" id="duration" value="60">

    <label>Interviewer(s):</label>
    <input type="text" id="interviewers" placeholder="Names or emails, comma-separated">

    <label>Location/Link:</label>
    <input type="text" id="location" placeholder="Zoom link or office location">

    <button onclick="submitInterview()">Schedule Interview</button>

    <script>
      function submitInterview() {
        const data = {
          candId: '${candId}',
          interviewType: document.getElementById('interviewType').value,
          date: document.getElementById('date').value,
          time: document.getElementById('time').value,
          duration: parseInt(document.getElementById('duration').value),
          interviewers: document.getElementById('interviewers').value,
          location: document.getElementById('location').value
        };
        google.script.run.withSuccessHandler(() => {
          google.script.host.close();
        }).processInterview(data);
      }
    </script>
  `).setWidth(400).setHeight(500);

  ui.showModalDialog(html, '📅 Schedule Interview');
}

function processInterview(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Interviews');

  if (!sheet) {
    sheet = ss.insertSheet('Interviews');
    sheet.getRange(1, 1, 1, 10).setValues([['Interview ID', 'Candidate ID', 'Type', 'Date', 'Time', 'Duration', 'Interviewer(s)', 'Location', 'Status', 'Scorecard']]);
    sheet.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#F5A623').setFontColor('white');
  }

  const lastRow = Math.max(sheet.getLastRow(), 1);
  const id = 'INT-' + String(lastRow).padStart(4, '0');

  sheet.appendRow([
    id,
    data.candId,
    data.interviewType,
    data.date,
    data.time,
    data.duration,
    data.interviewers,
    data.location,
    'Scheduled',
    ''
  ]);

  // Update interview count on candidate
  const candSheet = ss.getSheetByName('Candidates');
  if (candSheet) {
    const candData = candSheet.getRange(2, 1, candSheet.getLastRow() - 1, 16).getValues();
    for (let i = 0; i < candData.length; i++) {
      if (candData[i][0] === data.candId) {
        candSheet.getRange(i + 2, 16).setValue((candData[i][15] || 0) + 1);
        break;
      }
    }
  }

  SpreadsheetApp.getUi().alert('✅ Interview scheduled!\n\nInterview ID: ' + id + '\nType: ' + data.interviewType + '\nDate: ' + data.date);
}

// Submit Scorecard
function submitScorecard() {
  const ui = SpreadsheetApp.getUi();

  const intResponse = ui.prompt('Enter Interview ID:', ui.ButtonSet.OK_CANCEL);
  if (intResponse.getSelectedButton() !== ui.Button.OK) return;
  const intId = intResponse.getResponseText().trim();

  let scores = {};
  let total = 0;

  for (const criterion of CONFIG.SCORECARD_CRITERIA) {
    const response = ui.prompt(criterion + ' (1-5):', ui.ButtonSet.OK_CANCEL);
    if (response.getSelectedButton() !== ui.Button.OK) return;
    const score = parseInt(response.getResponseText());
    scores[criterion] = score;
    total += score;
  }

  const avg = total / CONFIG.SCORECARD_CRITERIA.length;

  const notesResponse = ui.prompt('Overall notes:', ui.ButtonSet.OK_CANCEL);
  const notes = notesResponse.getSelectedButton() === ui.Button.OK ? notesResponse.getResponseText() : '';

  const recResponse = ui.prompt('Recommendation (Strong Yes / Yes / No / Strong No):', ui.ButtonSet.OK_CANCEL);
  const recommendation = recResponse.getSelectedButton() === ui.Button.OK ? recResponse.getResponseText() : 'No Decision';

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const intSheet = ss.getSheetByName('Interviews');

  if (!intSheet) return;

  const data = intSheet.getRange(2, 1, intSheet.getLastRow() - 1, 10).getValues();

  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === intId) {
      const row = i + 2;
      const scorecard = Object.entries(scores).map(([k, v]) => k + ': ' + v).join(', ') +
        '\nAvg: ' + avg.toFixed(1) + '/5\nRec: ' + recommendation + '\nNotes: ' + notes;

      intSheet.getRange(row, 9).setValue('Completed');
      intSheet.getRange(row, 10).setValue(scorecard);

      // Update candidate score
      const candId = data[i][1];
      updateCandidateScore(candId, avg);

      ui.alert('✅ Scorecard submitted!\n\nAverage Score: ' + avg.toFixed(1) + '/5\nRecommendation: ' + recommendation);
      return;
    }
  }

  ui.alert('❌ Interview not found.');
}

function updateCandidateScore(candId, newScore) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Candidates');
  if (!sheet) return;

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 16).getValues();

  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === candId) {
      const currentScore = data[i][9] || 0;
      const interviews = data[i][15] || 1;
      const avgScore = ((currentScore * (interviews - 1)) + newScore) / interviews;
      sheet.getRange(i + 2, 10).setValue(avgScore.toFixed(1));
      return;
    }
  }
}

// View Interviews
function viewInterviews() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Interviews');

  if (!sheet || sheet.getLastRow() < 2) {
    ui.alert('No interviews scheduled.');
    return;
  }

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 10).getValues();
  const upcoming = data.filter(row => row[8] === 'Scheduled')
    .sort((a, b) => new Date(a[3]) - new Date(b[3]));

  let report = `📅 UPCOMING INTERVIEWS\n${'='.repeat(25)}\n\n`;

  for (const int of upcoming.slice(0, 10)) {
    report += `${int[3]} ${int[4]} - ${int[2]}\n`;
    report += `  Candidate: ${int[1]}\n`;
    report += `  Interviewer: ${int[6]}\n\n`;
  }

  if (upcoming.length === 0) {
    report += 'No upcoming interviews.';
  }

  ui.alert(report);
}

// Generate Offer
function generateOffer() {
  const ui = SpreadsheetApp.getUi();

  const candResponse = ui.prompt('Enter Candidate ID:', ui.ButtonSet.OK_CANCEL);
  if (candResponse.getSelectedButton() !== ui.Button.OK) return;
  const candId = candResponse.getResponseText().trim();

  const salaryResponse = ui.prompt('Base Salary ($):', ui.ButtonSet.OK_CANCEL);
  if (salaryResponse.getSelectedButton() !== ui.Button.OK) return;
  const salary = parseFloat(salaryResponse.getResponseText());

  const equityResponse = ui.prompt('Equity (shares or %):', ui.ButtonSet.OK_CANCEL);
  const equity = equityResponse.getSelectedButton() === ui.Button.OK ? equityResponse.getResponseText() : 'N/A';

  const bonusResponse = ui.prompt('Signing Bonus ($):', ui.ButtonSet.OK_CANCEL);
  const bonus = bonusResponse.getSelectedButton() === ui.Button.OK ? parseFloat(bonusResponse.getResponseText()) : 0;

  const startResponse = ui.prompt('Start Date (YYYY-MM-DD):', ui.ButtonSet.OK_CANCEL);
  const startDate = startResponse.getSelectedButton() === ui.Button.OK ? startResponse.getResponseText() : '';

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let offerSheet = ss.getSheetByName('Offers');

  if (!offerSheet) {
    offerSheet = ss.insertSheet('Offers');
    offerSheet.getRange(1, 1, 1, 10).setValues([['Offer ID', 'Candidate ID', 'Salary', 'Equity', 'Bonus', 'Start Date', 'Extended Date', 'Status', 'Response Date', 'Notes']]);
    offerSheet.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#C8E6C9');
  }

  const lastRow = Math.max(offerSheet.getLastRow(), 1);
  const offerId = 'OFF-' + String(lastRow).padStart(4, '0');

  offerSheet.appendRow([
    offerId,
    candId,
    salary,
    equity,
    bonus,
    startDate,
    new Date().toLocaleDateString(),
    'Extended',
    '',
    ''
  ]);

  // Move candidate to Offer stage
  const candSheet = ss.getSheetByName('Candidates');
  if (candSheet) {
    const candData = candSheet.getRange(2, 1, candSheet.getLastRow() - 1, 16).getValues();
    for (let i = 0; i < candData.length; i++) {
      if (candData[i][0] === candId) {
        candSheet.getRange(i + 2, 9).setValue('Offer');
        candSheet.getRange(i + 2, 1, 1, 16).setBackground('#F3E5F5');
        break;
      }
    }
  }

  ui.alert('✅ Offer generated!\n\nOffer ID: ' + offerId + '\nSalary: $' + salary.toLocaleString() + '\nStart: ' + startDate);
}

// Track Offer Status
function trackOfferStatus() {
  const ui = SpreadsheetApp.getUi();

  const offerResponse = ui.prompt('Enter Offer ID:', ui.ButtonSet.OK_CANCEL);
  if (offerResponse.getSelectedButton() !== ui.Button.OK) return;
  const offerId = offerResponse.getResponseText().trim();

  const statusResponse = ui.prompt('New Status (Accepted / Declined / Negotiating):', ui.ButtonSet.OK_CANCEL);
  if (statusResponse.getSelectedButton() !== ui.Button.OK) return;
  const newStatus = statusResponse.getResponseText();

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const offerSheet = ss.getSheetByName('Offers');

  if (!offerSheet) return;

  const data = offerSheet.getRange(2, 1, offerSheet.getLastRow() - 1, 10).getValues();

  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === offerId) {
      const row = i + 2;
      offerSheet.getRange(row, 8).setValue(newStatus);
      offerSheet.getRange(row, 9).setValue(new Date().toLocaleDateString());

      // If accepted, move candidate to Hired
      if (newStatus.toLowerCase() === 'accepted') {
        const candId = data[i][1];
        const candSheet = ss.getSheetByName('Candidates');
        if (candSheet) {
          const candData = candSheet.getRange(2, 1, candSheet.getLastRow() - 1, 16).getValues();
          for (let j = 0; j < candData.length; j++) {
            if (candData[j][0] === candId) {
              candSheet.getRange(j + 2, 9).setValue('Hired');
              candSheet.getRange(j + 2, 1, 1, 16).setBackground('#C8E6C9');
              break;
            }
          }
        }
      }

      ui.alert('✅ Offer status updated!\n\n' + offerId + ': ' + newStatus);
      return;
    }
  }

  ui.alert('❌ Offer not found.');
}

// Pipeline Summary
function pipelineSummary() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Candidates');

  if (!sheet || sheet.getLastRow() < 2) {
    ui.alert('No candidates found.');
    return;
  }

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 16).getValues();

  let byStage = {};
  for (const stage of CONFIG.PIPELINE_STAGES) {
    byStage[stage] = 0;
  }

  for (const row of data) {
    byStage[row[8]] = (byStage[row[8]] || 0) + 1;
  }

  let report = `📊 PIPELINE SUMMARY\n${'='.repeat(20)}\n\n`;

  for (const stage of CONFIG.PIPELINE_STAGES) {
    const count = byStage[stage] || 0;
    const bar = '█'.repeat(Math.min(count, 20));
    report += `${stage.padEnd(20)} ${bar} ${count}\n`;
  }

  report += `\nTotal Candidates: ${data.length}`;

  ui.alert(report);
}

// Time to Hire
function timeToHire() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Candidates');

  if (!sheet || sheet.getLastRow() < 2) {
    ui.alert('No candidates found.');
    return;
  }

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 16).getValues();
  const hired = data.filter(row => row[8] === 'Hired');

  if (hired.length === 0) {
    ui.alert('No hired candidates to analyze.');
    return;
  }

  let totalDays = 0;
  for (const cand of hired) {
    const applied = new Date(cand[12]);
    const lastActivity = new Date(cand[13]);
    const days = (lastActivity - applied) / (24 * 60 * 60 * 1000);
    totalDays += days;
  }

  const avgDays = totalDays / hired.length;

  ui.alert(`⏱️ TIME TO HIRE\n${'='.repeat(20)}\n\nTotal Hires: ${hired.length}\nAverage Time: ${Math.round(avgDays)} days`);
}

// Source Analytics
function sourceAnalytics() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Candidates');

  if (!sheet || sheet.getLastRow() < 2) {
    ui.alert('No candidates found.');
    return;
  }

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 16).getValues();

  let bySource = {};
  let hiredBySource = {};

  for (const row of data) {
    const source = row[5] || 'Unknown';
    bySource[source] = (bySource[source] || 0) + 1;
    if (row[8] === 'Hired') {
      hiredBySource[source] = (hiredBySource[source] || 0) + 1;
    }
  }

  let report = `📊 SOURCE ANALYTICS\n${'='.repeat(22)}\n\n`;
  report += `Source`.padEnd(15) + `Applied`.padEnd(10) + `Hired`.padEnd(8) + `Rate\n`;
  report += `${'─'.repeat(40)}\n`;

  for (const [source, count] of Object.entries(bySource).sort((a, b) => b[1] - a[1])) {
    const hired = hiredBySource[source] || 0;
    const rate = count > 0 ? Math.round(hired / count * 100) + '%' : '0%';
    report += `${source.padEnd(15)}${String(count).padEnd(10)}${String(hired).padEnd(8)}${rate}\n`;
  }

  ui.alert(report);
}

// Hiring Funnel
function hiringFunnel() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Candidates');

  if (!sheet || sheet.getLastRow() < 2) {
    ui.alert('No candidates found.');
    return;
  }

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 16).getValues();
  const total = data.length;

  const stageOrder = ['Applied', 'Phone Screen', 'Technical Interview', 'Onsite', 'Offer', 'Hired'];
  let stageCounts = {};

  for (const stage of stageOrder) {
    stageCounts[stage] = data.filter(row => stageOrder.indexOf(row[8]) >= stageOrder.indexOf(stage)).length;
  }

  let report = `🔽 HIRING FUNNEL\n${'='.repeat(20)}\n\n`;

  for (const stage of stageOrder) {
    const count = stageCounts[stage];
    const pct = total > 0 ? Math.round(count / total * 100) : 0;
    const bar = '█'.repeat(Math.round(pct / 5));
    report += `${stage.padEnd(20)} ${bar} ${count} (${pct}%)\n`;
  }

  ui.alert(report);
}

// Send Candidate Email
function sendCandidateEmail() {
  const ui = SpreadsheetApp.getUi();

  const candResponse = ui.prompt('Enter Candidate ID:', ui.ButtonSet.OK_CANCEL);
  if (candResponse.getSelectedButton() !== ui.Button.OK) return;
  const candId = candResponse.getResponseText().trim();

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Candidates');

  if (!sheet) return;

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 16).getValues();

  for (const row of data) {
    if (row[0] === candId) {
      const email = row[3];
      const name = row[2];

      const templateResponse = ui.prompt('Template (Phone Screen Invite / Interview Invite / Rejection / Offer):', ui.ButtonSet.OK_CANCEL);
      if (templateResponse.getSelectedButton() !== ui.Button.OK) return;
      const template = templateResponse.getResponseText();

      const subject = CONFIG.COMPANY_NAME + ' - ' + template;
      const body = `Dear ${name},\n\n${CONFIG.EMAIL_TEMPLATES[template] || 'Thank you for your application.'}\n\nBest regards,\n${CONFIG.COMPANY_NAME} Recruiting Team`;

      MailApp.sendEmail(email, subject, body);
      ui.alert('✅ Email sent to ' + name + ' (' + email + ')');
      return;
    }
  }

  ui.alert('❌ Candidate not found.');
}

// Settings
function openATSSettings() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      h3 { color: #9C27B0; }
    </style>
    <h3>⚙️ ATS Settings</h3>
    <p><b>Company:</b> ${CONFIG.COMPANY_NAME}</p>
    <p><b>Pipeline Stages:</b></p>
    <ol>${CONFIG.PIPELINE_STAGES.map(s => '<li>' + s + '</li>').join('')}</ol>
    <p><b>Sources:</b> ${CONFIG.SOURCES.join(', ')}</p>
    <p><b>Interview Types:</b> ${CONFIG.INTERVIEW_TYPES.join(', ')}</p>
    <p><b>To customize:</b> Edit CONFIG in Apps Script</p>
  `).setWidth(400).setHeight(450);

  SpreadsheetApp.getUi().showModalDialog(html, '⚙️ Settings');
}
