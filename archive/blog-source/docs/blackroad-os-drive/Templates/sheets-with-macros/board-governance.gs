/**
 * BlackRoad OS - Board Meeting & Governance
 * Manage board meetings, minutes, resolutions, and compliance
 *
 * Features:
 * - Board member directory
 * - Meeting scheduling and agendas
 * - Minutes and resolution tracking
 * - Voting records
 * - Compliance calendar
 * - Document management
 * - Director term tracking
 */

const CONFIG = {
  COMPANY_NAME: 'BlackRoad OS, Inc.',

  // Sheet names
  SHEETS: {
    DIRECTORS: 'Board Members',
    MEETINGS: 'Meetings',
    RESOLUTIONS: 'Resolutions',
    MINUTES: 'Minutes',
    COMPLIANCE: 'Compliance Calendar'
  },

  // Director roles
  DIRECTOR_ROLES: [
    'Chairman',
    'Vice Chairman',
    'Independent Director',
    'Executive Director',
    'Non-Executive Director',
    'Audit Committee Chair',
    'Compensation Committee Chair',
    'Nominating Committee Chair'
  ],

  // Meeting types
  MEETING_TYPES: [
    'Regular Board Meeting',
    'Special Board Meeting',
    'Annual General Meeting',
    'Extraordinary General Meeting',
    'Committee Meeting - Audit',
    'Committee Meeting - Compensation',
    'Committee Meeting - Nominating',
    'Shareholder Meeting'
  ],

  // Resolution types
  RESOLUTION_TYPES: [
    'Ordinary Resolution',
    'Special Resolution',
    'Written Resolution',
    'Board Resolution',
    'Unanimous Written Consent'
  ],

  // Resolution statuses
  RESOLUTION_STATUS: [
    'Proposed',
    'Under Discussion',
    'Approved',
    'Rejected',
    'Tabled',
    'Withdrawn'
  ],

  // Compliance items
  COMPLIANCE_ITEMS: [
    'Annual Report Filing',
    'Tax Return Filing',
    'Board Election',
    'Financial Audit',
    'Corporate Registration Renewal',
    'D&O Insurance Renewal',
    'SEC Filing',
    'Annual Meeting Notice'
  ]
};

// ============================================
// MENU SETUP
// ============================================

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🏛️ Governance')
    .addItem('👤 Add Board Member', 'addBoardMember')
    .addItem('📅 Schedule Meeting', 'scheduleMeeting')
    .addItem('📋 Create Agenda', 'createAgenda')
    .addSeparator()
    .addSubMenu(ui.createMenu('📝 Resolutions')
      .addItem('Draft Resolution', 'draftResolution')
      .addItem('Record Vote', 'recordVote')
      .addItem('View Resolution History', 'viewResolutionHistory'))
    .addSeparator()
    .addSubMenu(ui.createMenu('📄 Minutes')
      .addItem('Generate Minutes Template', 'generateMinutesTemplate')
      .addItem('Finalize Minutes', 'finalizeMinutes')
      .addItem('Send for Signature', 'sendForSignature'))
    .addSeparator()
    .addSubMenu(ui.createMenu('📊 Reports')
      .addItem('Board Dashboard', 'showBoardDashboard')
      .addItem('Attendance Report', 'showAttendanceReport')
      .addItem('Term Expiration Report', 'showTermReport')
      .addItem('Compliance Calendar', 'showComplianceCalendar'))
    .addSeparator()
    .addItem('📧 Send Meeting Notice', 'sendMeetingNotice')
    .addItem('📁 Document Library', 'openDocumentLibrary')
    .addItem('⚙️ Settings', 'showSettings')
    .addToUi();
}

// ============================================
// BOARD MEMBER MANAGEMENT
// ============================================

function addBoardMember() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 12px; }
      label { display: block; font-weight: bold; margin-bottom: 4px; }
      input, select, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      .row { display: flex; gap: 10px; }
      .row .form-group { flex: 1; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
      h3 { margin-top: 20px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
    </style>

    <h2>👤 Add Board Member</h2>

    <div class="form-group">
      <label>Full Name *</label>
      <input type="text" id="name">
    </div>

    <div class="form-group">
      <label>Email *</label>
      <input type="email" id="email">
    </div>

    <div class="row">
      <div class="form-group">
        <label>Role</label>
        <select id="role">
          ${CONFIG.DIRECTOR_ROLES.map(r => '<option>' + r + '</option>').join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Independence</label>
        <select id="independence">
          <option>Independent</option>
          <option>Non-Independent</option>
        </select>
      </div>
    </div>

    <h3>Term Information</h3>

    <div class="row">
      <div class="form-group">
        <label>Term Start</label>
        <input type="date" id="termStart">
      </div>
      <div class="form-group">
        <label>Term End</label>
        <input type="date" id="termEnd">
      </div>
    </div>

    <div class="form-group">
      <label>Committee Memberships</label>
      <select id="committees" multiple style="height: 80px;">
        <option>Audit Committee</option>
        <option>Compensation Committee</option>
        <option>Nominating Committee</option>
        <option>Executive Committee</option>
        <option>Risk Committee</option>
      </select>
    </div>

    <h3>Contact Information</h3>

    <div class="form-group">
      <label>Phone</label>
      <input type="tel" id="phone">
    </div>

    <div class="form-group">
      <label>Company/Affiliation</label>
      <input type="text" id="company">
    </div>

    <div class="form-group">
      <label>Bio/Background</label>
      <textarea id="bio" rows="2"></textarea>
    </div>

    <button onclick="saveMember()">Add Board Member</button>

    <script>
      function saveMember() {
        const committees = Array.from(document.getElementById('committees').selectedOptions)
          .map(o => o.value).join(', ');

        const data = {
          name: document.getElementById('name').value,
          email: document.getElementById('email').value,
          role: document.getElementById('role').value,
          independence: document.getElementById('independence').value,
          termStart: document.getElementById('termStart').value,
          termEnd: document.getElementById('termEnd').value,
          committees: committees,
          phone: document.getElementById('phone').value,
          company: document.getElementById('company').value,
          bio: document.getElementById('bio').value
        };

        if (!data.name || !data.email) {
          alert('Please fill in required fields');
          return;
        }

        google.script.run
          .withSuccessHandler(() => {
            alert('Board member added!');
            google.script.host.close();
          })
          .saveBoardMember(data);
      }
    </script>
  `)
  .setWidth(500)
  .setHeight(700);

  SpreadsheetApp.getUi().showModalDialog(html, 'Add Board Member');
}

function saveBoardMember(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEETS.DIRECTORS);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.DIRECTORS);
    sheet.appendRow([
      'Member ID', 'Name', 'Email', 'Role', 'Independence',
      'Term Start', 'Term End', 'Committees', 'Phone', 'Company',
      'Bio', 'Status', 'Meetings Attended', 'Total Meetings', 'Added Date'
    ]);
    sheet.getRange(1, 1, 1, 15).setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
  }

  const id = 'DIR-' + String(sheet.getLastRow()).padStart(3, '0');

  sheet.appendRow([
    id,
    data.name,
    data.email,
    data.role,
    data.independence,
    data.termStart ? new Date(data.termStart) : '',
    data.termEnd ? new Date(data.termEnd) : '',
    data.committees,
    data.phone,
    data.company,
    data.bio,
    'Active',
    0,
    0,
    new Date()
  ]);

  return id;
}

// ============================================
// MEETING MANAGEMENT
// ============================================

function scheduleMeeting() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const directorsSheet = ss.getSheetByName(CONFIG.SHEETS.DIRECTORS);

  let directorCheckboxes = '';
  if (directorsSheet && directorsSheet.getLastRow() > 1) {
    const directors = directorsSheet.getRange(2, 1, directorsSheet.getLastRow() - 1, 4).getValues();
    directorCheckboxes = directors.filter(d => d[3] !== 'Inactive').map(d =>
      `<label><input type="checkbox" value="${d[0]}" checked> ${d[1]} (${d[3]})</label>`
    ).join('<br>');
  }

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 12px; }
      label { display: block; font-weight: bold; margin-bottom: 4px; }
      input, select, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      .row { display: flex; gap: 10px; }
      .row .form-group { flex: 1; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
      .attendees { max-height: 150px; overflow-y: auto; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
      .attendees label { font-weight: normal; margin: 5px 0; }
    </style>

    <h2>📅 Schedule Board Meeting</h2>

    <div class="form-group">
      <label>Meeting Type *</label>
      <select id="meetingType">
        ${CONFIG.MEETING_TYPES.map(t => '<option>' + t + '</option>').join('')}
      </select>
    </div>

    <div class="form-group">
      <label>Meeting Title</label>
      <input type="text" id="title" placeholder="e.g., Q1 2024 Board Meeting">
    </div>

    <div class="row">
      <div class="form-group">
        <label>Date *</label>
        <input type="date" id="date">
      </div>
      <div class="form-group">
        <label>Time *</label>
        <input type="time" id="time" value="10:00">
      </div>
    </div>

    <div class="row">
      <div class="form-group">
        <label>Duration (hours)</label>
        <input type="number" id="duration" value="2" step="0.5">
      </div>
      <div class="form-group">
        <label>Location</label>
        <select id="locationType">
          <option>In-Person</option>
          <option>Video Conference</option>
          <option>Hybrid</option>
        </select>
      </div>
    </div>

    <div class="form-group">
      <label>Location/Link Details</label>
      <input type="text" id="locationDetails" placeholder="Address or video link">
    </div>

    <div class="form-group">
      <label>Invited Directors</label>
      <div class="attendees" id="attendees">
        ${directorCheckboxes || '<p>No directors found. Add board members first.</p>'}
      </div>
    </div>

    <div class="form-group">
      <label>Notes/Preparation Required</label>
      <textarea id="notes" rows="2"></textarea>
    </div>

    <button onclick="saveMeeting()">Schedule Meeting</button>

    <script>
      function saveMeeting() {
        const attendees = Array.from(document.querySelectorAll('#attendees input:checked'))
          .map(cb => cb.value).join(', ');

        const data = {
          meetingType: document.getElementById('meetingType').value,
          title: document.getElementById('title').value,
          date: document.getElementById('date').value,
          time: document.getElementById('time').value,
          duration: document.getElementById('duration').value,
          locationType: document.getElementById('locationType').value,
          locationDetails: document.getElementById('locationDetails').value,
          attendees: attendees,
          notes: document.getElementById('notes').value
        };

        if (!data.date || !data.time) {
          alert('Please select date and time');
          return;
        }

        google.script.run
          .withSuccessHandler(result => {
            alert(result);
            google.script.host.close();
          })
          .saveMeeting(data);
      }
    </script>
  `)
  .setWidth(500)
  .setHeight(700);

  SpreadsheetApp.getUi().showModalDialog(html, 'Schedule Meeting');
}

function saveMeeting(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEETS.MEETINGS);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.MEETINGS);
    sheet.appendRow([
      'Meeting ID', 'Type', 'Title', 'Date', 'Time', 'Duration (hrs)',
      'Location Type', 'Location Details', 'Invited', 'Attended',
      'Quorum Met', 'Status', 'Minutes ID', 'Notes', 'Created Date'
    ]);
    sheet.getRange(1, 1, 1, 15).setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
  }

  const id = 'MTG-' + Utilities.formatDate(new Date(), 'GMT', 'yyyyMMdd') + '-' + String(sheet.getLastRow()).padStart(3, '0');

  sheet.appendRow([
    id,
    data.meetingType,
    data.title || data.meetingType,
    new Date(data.date),
    data.time,
    data.duration,
    data.locationType,
    data.locationDetails,
    data.attendees,
    '',
    '',
    'Scheduled',
    '',
    data.notes,
    new Date()
  ]);

  return `Meeting scheduled!\n\nID: ${id}\nDate: ${data.date} at ${data.time}`;
}

// ============================================
// RESOLUTION MANAGEMENT
// ============================================

function draftResolution() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 12px; }
      label { display: block; font-weight: bold; margin-bottom: 4px; }
      input, select, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      textarea { min-height: 100px; }
      .row { display: flex; gap: 10px; }
      .row .form-group { flex: 1; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
    </style>

    <h2>📋 Draft Resolution</h2>

    <div class="form-group">
      <label>Resolution Title *</label>
      <input type="text" id="title" placeholder="e.g., Approval of Annual Budget">
    </div>

    <div class="row">
      <div class="form-group">
        <label>Type</label>
        <select id="resType">
          ${CONFIG.RESOLUTION_TYPES.map(t => '<option>' + t + '</option>').join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Category</label>
        <select id="category">
          <option>Financial</option>
          <option>Corporate</option>
          <option>Governance</option>
          <option>Compensation</option>
          <option>Strategic</option>
          <option>Compliance</option>
          <option>Other</option>
        </select>
      </div>
    </div>

    <div class="form-group">
      <label>Meeting Reference</label>
      <input type="text" id="meetingRef" placeholder="e.g., MTG-20240115-001">
    </div>

    <div class="form-group">
      <label>WHEREAS (Background/Recitals)</label>
      <textarea id="whereas" placeholder="WHEREAS, the Company needs to..."></textarea>
    </div>

    <div class="form-group">
      <label>RESOLVED (Resolution Text) *</label>
      <textarea id="resolved" placeholder="RESOLVED, that the Board hereby approves..."></textarea>
    </div>

    <div class="form-group">
      <label>Proposed By</label>
      <input type="text" id="proposedBy">
    </div>

    <div class="form-group">
      <label>Seconded By</label>
      <input type="text" id="secondedBy">
    </div>

    <button onclick="saveResolution()">Save Resolution</button>

    <script>
      function saveResolution() {
        const data = {
          title: document.getElementById('title').value,
          resType: document.getElementById('resType').value,
          category: document.getElementById('category').value,
          meetingRef: document.getElementById('meetingRef').value,
          whereas: document.getElementById('whereas').value,
          resolved: document.getElementById('resolved').value,
          proposedBy: document.getElementById('proposedBy').value,
          secondedBy: document.getElementById('secondedBy').value
        };

        if (!data.title || !data.resolved) {
          alert('Please fill in title and resolution text');
          return;
        }

        google.script.run
          .withSuccessHandler(result => {
            alert(result);
            google.script.host.close();
          })
          .saveResolution(data);
      }
    </script>
  `)
  .setWidth(550)
  .setHeight(700);

  SpreadsheetApp.getUi().showModalDialog(html, 'Draft Resolution');
}

function saveResolution(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEETS.RESOLUTIONS);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.RESOLUTIONS);
    sheet.appendRow([
      'Resolution ID', 'Title', 'Type', 'Category', 'Meeting Reference',
      'Whereas', 'Resolved', 'Proposed By', 'Seconded By',
      'For', 'Against', 'Abstain', 'Status', 'Date Adopted', 'Notes'
    ]);
    sheet.getRange(1, 1, 1, 15).setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
  }

  const year = new Date().getFullYear();
  const count = sheet.getLastRow();
  const id = `RES-${year}-${String(count).padStart(4, '0')}`;

  sheet.appendRow([
    id,
    data.title,
    data.resType,
    data.category,
    data.meetingRef,
    data.whereas,
    data.resolved,
    data.proposedBy,
    data.secondedBy,
    0,
    0,
    0,
    'Proposed',
    '',
    ''
  ]);

  return `Resolution drafted!\n\nID: ${id}`;
}

function recordVote() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const row = sheet.getActiveRange().getRow();

  if (sheet.getName() !== CONFIG.SHEETS.RESOLUTIONS || row < 2) {
    SpreadsheetApp.getUi().alert('Please select a resolution row in the Resolutions sheet.');
    return;
  }

  const resolution = sheet.getRange(row, 1, 1, 15).getValues()[0];

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .resolution-info { background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
      .form-group { margin-bottom: 15px; }
      label { display: block; font-weight: bold; margin-bottom: 5px; }
      input { width: 80px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 18px; text-align: center; }
      .vote-row { display: flex; gap: 20px; justify-content: center; margin: 20px 0; }
      .vote-box { text-align: center; }
      .vote-label { margin-top: 5px; font-size: 14px; }
      button { background: #34a853; color: white; padding: 12px 30px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
    </style>

    <h2>🗳️ Record Vote</h2>

    <div class="resolution-info">
      <strong>${resolution[0]}</strong><br>
      ${resolution[1]}<br>
      <small>Type: ${resolution[2]} | Category: ${resolution[3]}</small>
    </div>

    <div class="vote-row">
      <div class="vote-box">
        <input type="number" id="forVotes" value="${resolution[9] || 0}" min="0">
        <div class="vote-label">FOR ✅</div>
      </div>
      <div class="vote-box">
        <input type="number" id="againstVotes" value="${resolution[10] || 0}" min="0">
        <div class="vote-label">AGAINST ❌</div>
      </div>
      <div class="vote-box">
        <input type="number" id="abstainVotes" value="${resolution[11] || 0}" min="0">
        <div class="vote-label">ABSTAIN ⚪</div>
      </div>
    </div>

    <div class="form-group" style="text-align: center;">
      <label>Result</label>
      <select id="status" style="width: 200px; text-align: center;">
        ${CONFIG.RESOLUTION_STATUS.map(s => '<option' + (s === resolution[12] ? ' selected' : '') + '>' + s + '</option>').join('')}
      </select>
    </div>

    <div style="text-align: center;">
      <button onclick="saveVote()">Record Vote</button>
    </div>

    <script>
      function saveVote() {
        const data = {
          row: ${row},
          forVotes: document.getElementById('forVotes').value,
          againstVotes: document.getElementById('againstVotes').value,
          abstainVotes: document.getElementById('abstainVotes').value,
          status: document.getElementById('status').value
        };

        google.script.run
          .withSuccessHandler(() => {
            alert('Vote recorded!');
            google.script.host.close();
          })
          .saveVoteResults(data);
      }
    </script>
  `)
  .setWidth(400)
  .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(html, 'Record Vote');
}

function saveVoteResults(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.RESOLUTIONS);

  sheet.getRange(data.row, 10).setValue(parseInt(data.forVotes));
  sheet.getRange(data.row, 11).setValue(parseInt(data.againstVotes));
  sheet.getRange(data.row, 12).setValue(parseInt(data.abstainVotes));
  sheet.getRange(data.row, 13).setValue(data.status);

  if (data.status === 'Approved') {
    sheet.getRange(data.row, 14).setValue(new Date());
    sheet.getRange(data.row, 1, 1, 15).setBackground('#d9ead3');
  } else if (data.status === 'Rejected') {
    sheet.getRange(data.row, 1, 1, 15).setBackground('#fce8e6');
  }
}

// ============================================
// MINUTES MANAGEMENT
// ============================================

function generateMinutesTemplate() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const meetingsSheet = ss.getSheetByName(CONFIG.SHEETS.MEETINGS);

  if (!meetingsSheet || meetingsSheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('No meetings found. Schedule a meeting first.');
    return;
  }

  const meetings = meetingsSheet.getRange(2, 1, meetingsSheet.getLastRow() - 1, 15).getValues()
    .filter(m => m[11] !== 'Completed');

  if (meetings.length === 0) {
    SpreadsheetApp.getUi().alert('No pending meetings to create minutes for.');
    return;
  }

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 15px; }
      label { display: block; font-weight: bold; margin-bottom: 5px; }
      select, textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      button { background: #4285f4; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; }
      .template { background: #f5f5f5; padding: 15px; border-radius: 8px; margin-top: 15px; }
    </style>

    <h2>📄 Generate Minutes Template</h2>

    <div class="form-group">
      <label>Select Meeting</label>
      <select id="meeting" onchange="showTemplate()">
        <option value="">Choose a meeting...</option>
        ${meetings.map(m => `<option value="${m[0]}">${m[2]} - ${new Date(m[3]).toLocaleDateString()}</option>`).join('')}
      </select>
    </div>

    <div class="template" id="template" style="display: none;">
      <h3>MINUTES OF <span id="meetingType"></span></h3>
      <p><strong>Date:</strong> <span id="meetingDate"></span></p>
      <p><strong>Time:</strong> <span id="meetingTime"></span></p>
      <p><strong>Location:</strong> <span id="meetingLocation"></span></p>

      <h4>1. CALL TO ORDER</h4>
      <p>The meeting was called to order at _____ by _____.</p>

      <h4>2. ROLL CALL / ATTENDANCE</h4>
      <p>Present: _____</p>
      <p>Absent: _____</p>
      <p>Quorum: [Yes/No]</p>

      <h4>3. APPROVAL OF PREVIOUS MINUTES</h4>
      <p>Motion to approve minutes of _____ meeting.</p>

      <h4>4. REPORTS</h4>
      <p>- CEO Report</p>
      <p>- CFO Report</p>
      <p>- Committee Reports</p>

      <h4>5. OLD BUSINESS</h4>
      <p>[Items from previous meetings]</p>

      <h4>6. NEW BUSINESS</h4>
      <p>[New items for discussion]</p>

      <h4>7. RESOLUTIONS</h4>
      <p>[List resolutions considered]</p>

      <h4>8. ADJOURNMENT</h4>
      <p>Meeting adjourned at _____.</p>
    </div>

    <button onclick="createMinutes()" style="margin-top: 15px;">Create Minutes Document</button>

    <script>
      const meetings = ${JSON.stringify(meetings)};

      function showTemplate() {
        const id = document.getElementById('meeting').value;
        if (!id) {
          document.getElementById('template').style.display = 'none';
          return;
        }

        const meeting = meetings.find(m => m[0] === id);
        document.getElementById('meetingType').textContent = meeting[1];
        document.getElementById('meetingDate').textContent = new Date(meeting[3]).toLocaleDateString();
        document.getElementById('meetingTime').textContent = meeting[4];
        document.getElementById('meetingLocation').textContent = meeting[7] || meeting[6];
        document.getElementById('template').style.display = 'block';
      }

      function createMinutes() {
        const meetingId = document.getElementById('meeting').value;
        if (!meetingId) {
          alert('Please select a meeting');
          return;
        }

        google.script.run
          .withSuccessHandler(result => {
            alert(result);
            google.script.host.close();
          })
          .createMinutesRecord(meetingId);
      }
    </script>
  `)
  .setWidth(600)
  .setHeight(700);

  SpreadsheetApp.getUi().showModalDialog(html, 'Generate Minutes');
}

function createMinutesRecord(meetingId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEETS.MINUTES);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.MINUTES);
    sheet.appendRow([
      'Minutes ID', 'Meeting ID', 'Meeting Type', 'Date', 'Call to Order',
      'Attendees Present', 'Attendees Absent', 'Quorum', 'Previous Minutes Approved',
      'Reports Summary', 'Old Business', 'New Business', 'Resolutions',
      'Adjournment Time', 'Secretary', 'Status', 'Approved Date', 'Notes'
    ]);
    sheet.getRange(1, 1, 1, 18).setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
  }

  // Get meeting details
  const meetingsSheet = ss.getSheetByName(CONFIG.SHEETS.MEETINGS);
  const meetings = meetingsSheet.getRange(2, 1, meetingsSheet.getLastRow() - 1, 15).getValues();
  const meeting = meetings.find(m => m[0] === meetingId);

  if (!meeting) return 'Meeting not found';

  const minutesId = 'MIN-' + meetingId.replace('MTG-', '');

  sheet.appendRow([
    minutesId,
    meetingId,
    meeting[1],
    meeting[3],
    '', // Call to order
    '', // Present
    '', // Absent
    '', // Quorum
    '', // Previous minutes
    '', // Reports
    '', // Old business
    '', // New business
    '', // Resolutions
    '', // Adjournment
    '', // Secretary
    'Draft',
    '',
    ''
  ]);

  // Update meeting with minutes reference
  const meetingRowIndex = meetings.findIndex(m => m[0] === meetingId);
  if (meetingRowIndex !== -1) {
    meetingsSheet.getRange(meetingRowIndex + 2, 13).setValue(minutesId);
  }

  return `Minutes template created!\n\nID: ${minutesId}\n\nEdit the Minutes sheet to fill in details.`;
}

// ============================================
// DASHBOARD & REPORTS
// ============================================

function showBoardDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const directorsSheet = ss.getSheetByName(CONFIG.SHEETS.DIRECTORS);
  const meetingsSheet = ss.getSheetByName(CONFIG.SHEETS.MEETINGS);
  const resolutionsSheet = ss.getSheetByName(CONFIG.SHEETS.RESOLUTIONS);

  const directors = directorsSheet && directorsSheet.getLastRow() > 1
    ? directorsSheet.getRange(2, 1, directorsSheet.getLastRow() - 1, 15).getValues()
    : [];

  const meetings = meetingsSheet && meetingsSheet.getLastRow() > 1
    ? meetingsSheet.getRange(2, 1, meetingsSheet.getLastRow() - 1, 15).getValues()
    : [];

  const resolutions = resolutionsSheet && resolutionsSheet.getLastRow() > 1
    ? resolutionsSheet.getRange(2, 1, resolutionsSheet.getLastRow() - 1, 15).getValues()
    : [];

  const activeDirectors = directors.filter(d => d[11] === 'Active').length;
  const upcomingMeetings = meetings.filter(m => new Date(m[3]) >= new Date() && m[11] !== 'Completed').length;
  const pendingResolutions = resolutions.filter(r => r[12] === 'Proposed' || r[12] === 'Under Discussion').length;
  const approvedThisYear = resolutions.filter(r => {
    const date = new Date(r[13]);
    return r[12] === 'Approved' && date.getFullYear() === new Date().getFullYear();
  }).length;

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; background: #f0f4f8; }
      .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px; }
      .stat { background: white; padding: 20px; border-radius: 12px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
      .stat-value { font-size: 36px; font-weight: bold; color: #4285f4; }
      .stat-label { color: #666; margin-top: 5px; }
      .section { background: white; padding: 20px; border-radius: 12px; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
      .meeting-item { padding: 10px 0; border-bottom: 1px solid #eee; }
      .meeting-date { font-weight: bold; }
      .meeting-type { font-size: 12px; color: #666; }
    </style>

    <h2>🏛️ Board Dashboard</h2>

    <div class="stats">
      <div class="stat">
        <div class="stat-value">${activeDirectors}</div>
        <div class="stat-label">Board Members</div>
      </div>
      <div class="stat">
        <div class="stat-value">${upcomingMeetings}</div>
        <div class="stat-label">Upcoming Meetings</div>
      </div>
      <div class="stat">
        <div class="stat-value">${pendingResolutions}</div>
        <div class="stat-label">Pending Resolutions</div>
      </div>
      <div class="stat">
        <div class="stat-value">${approvedThisYear}</div>
        <div class="stat-label">Resolutions (YTD)</div>
      </div>
    </div>

    <div class="section">
      <h3>📅 Upcoming Meetings</h3>
      ${meetings.filter(m => new Date(m[3]) >= new Date()).slice(0, 5).map(m => `
        <div class="meeting-item">
          <div class="meeting-date">${new Date(m[3]).toLocaleDateString()} at ${m[4]}</div>
          <div class="meeting-type">${m[1]} - ${m[2]}</div>
        </div>
      `).join('') || '<p>No upcoming meetings scheduled</p>'}
    </div>

    <div class="section">
      <h3>📋 Recent Resolutions</h3>
      ${resolutions.slice(-5).reverse().map(r => `
        <div class="meeting-item">
          <div class="meeting-date">${r[1]}</div>
          <div class="meeting-type">${r[2]} - ${r[12]}</div>
        </div>
      `).join('') || '<p>No resolutions yet</p>'}
    </div>
  `)
  .setWidth(500)
  .setHeight(600);

  SpreadsheetApp.getUi().showModalDialog(html, 'Board Dashboard');
}

function showAttendanceReport() {
  SpreadsheetApp.getUi().alert(
    'Attendance Report\n\n' +
    'View attendance statistics in the Board Members sheet:\n' +
    '- Meetings Attended column\n' +
    '- Total Meetings column\n' +
    '- Calculate attendance % = Attended/Total\n\n' +
    'Update these counts after each meeting.'
  );
}

function showTermReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.DIRECTORS);

  if (!sheet || sheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('No board members found.');
    return;
  }

  const directors = sheet.getRange(2, 1, sheet.getLastRow() - 1, 15).getValues();
  const today = new Date();
  const sixMonths = new Date();
  sixMonths.setMonth(sixMonths.getMonth() + 6);

  const expiring = directors.filter(d => {
    if (!d[6]) return false;
    const termEnd = new Date(d[6]);
    return termEnd > today && termEnd <= sixMonths;
  });

  if (expiring.length === 0) {
    SpreadsheetApp.getUi().alert('No terms expiring in the next 6 months.');
    return;
  }

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .warning { background: #fff2cc; padding: 15px; border-radius: 8px; margin-bottom: 15px; }
      .director { padding: 10px; border-bottom: 1px solid #eee; }
    </style>

    <h2>📋 Term Expiration Report</h2>

    <div class="warning">
      <strong>${expiring.length} director term(s)</strong> expiring in the next 6 months
    </div>

    ${expiring.map(d => `
      <div class="director">
        <strong>${d[1]}</strong> (${d[3]})<br>
        <small>Term ends: ${new Date(d[6]).toLocaleDateString()}</small>
      </div>
    `).join('')}
  `)
  .setWidth(400)
  .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(html, 'Term Expiration');
}

function showComplianceCalendar() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEETS.COMPLIANCE);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.COMPLIANCE);
    sheet.appendRow([
      'Item ID', 'Compliance Item', 'Due Date', 'Frequency',
      'Responsible', 'Status', 'Completed Date', 'Notes'
    ]);
    sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#4285f4').setFontColor('white');

    // Add default items
    CONFIG.COMPLIANCE_ITEMS.forEach((item, i) => {
      sheet.appendRow([
        'COMP-' + String(i + 1).padStart(3, '0'),
        item,
        '',
        'Annual',
        '',
        'Pending',
        '',
        ''
      ]);
    });
  }

  ss.setActiveSheet(sheet);
  SpreadsheetApp.getUi().alert(
    'Compliance Calendar\n\n' +
    'Track important corporate compliance deadlines:\n' +
    '- Annual filings\n' +
    '- Tax deadlines\n' +
    '- Insurance renewals\n' +
    '- Board elections\n\n' +
    'Set due dates and mark items complete.'
  );
}

// ============================================
// OTHER FUNCTIONS
// ============================================

function createAgenda() {
  SpreadsheetApp.getUi().alert(
    'Create Agenda\n\n' +
    '1. Schedule the meeting first\n' +
    '2. Add agenda items in meeting notes\n' +
    '3. Standard agenda includes:\n' +
    '   - Call to Order\n' +
    '   - Approval of Minutes\n' +
    '   - Reports\n' +
    '   - Old Business\n' +
    '   - New Business\n' +
    '   - Resolutions\n' +
    '   - Adjournment'
  );
}

function viewResolutionHistory() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.RESOLUTIONS);
  if (sheet) ss.setActiveSheet(sheet);
}

function finalizeMinutes() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const row = sheet.getActiveRange().getRow();

  if (sheet.getName() !== CONFIG.SHEETS.MINUTES || row < 2) {
    SpreadsheetApp.getUi().alert('Please select a minutes row in the Minutes sheet.');
    return;
  }

  sheet.getRange(row, 16).setValue('Final');
  sheet.getRange(row, 1, 1, 18).setBackground('#d9ead3');
  SpreadsheetApp.getUi().alert('Minutes finalized!');
}

function sendForSignature() {
  SpreadsheetApp.getUi().alert(
    'Send for Signature\n\n' +
    'To get minutes signed:\n' +
    '1. Export minutes as PDF\n' +
    '2. Send via DocuSign/HelloSign\n' +
    '3. Or print and collect physical signatures\n\n' +
    'Required signatures:\n' +
    '- Chairman\n' +
    '- Secretary'
  );
}

function sendMeetingNotice() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const row = sheet.getActiveRange().getRow();

  if (sheet.getName() !== CONFIG.SHEETS.MEETINGS || row < 2) {
    SpreadsheetApp.getUi().alert('Please select a meeting row in the Meetings sheet.');
    return;
  }

  const meeting = sheet.getRange(row, 1, 1, 15).getValues()[0];

  // Get directors' emails
  const directorsSheet = ss.getSheetByName(CONFIG.SHEETS.DIRECTORS);
  const emails = directorsSheet && directorsSheet.getLastRow() > 1
    ? directorsSheet.getRange(2, 3, directorsSheet.getLastRow() - 1, 1).getValues()
        .map(r => r[0]).filter(e => e).join(', ')
    : '';

  if (!emails) {
    SpreadsheetApp.getUi().alert('No director emails found.');
    return;
  }

  const subject = `Notice: ${meeting[2]} - ${new Date(meeting[3]).toLocaleDateString()}`;
  const body = `
    <h2>Board Meeting Notice</h2>
    <p><strong>Meeting:</strong> ${meeting[2]}</p>
    <p><strong>Type:</strong> ${meeting[1]}</p>
    <p><strong>Date:</strong> ${new Date(meeting[3]).toLocaleDateString()}</p>
    <p><strong>Time:</strong> ${meeting[4]}</p>
    <p><strong>Location:</strong> ${meeting[7] || meeting[6]}</p>
    <p><strong>Duration:</strong> ${meeting[5]} hours</p>
    ${meeting[13] ? '<p><strong>Notes:</strong> ' + meeting[13] + '</p>' : ''}
    <hr>
    <p>Please confirm your attendance.</p>
    <p>${CONFIG.COMPANY_NAME}</p>
  `;

  MailApp.sendEmail({
    to: emails,
    subject: subject,
    htmlBody: body
  });

  SpreadsheetApp.getUi().alert('Meeting notice sent to all board members!');
}

function openDocumentLibrary() {
  SpreadsheetApp.getUi().alert(
    'Document Library\n\n' +
    'Store board documents in Google Drive:\n' +
    '- Meeting materials\n' +
    '- Financial reports\n' +
    '- Legal documents\n' +
    '- Signed resolutions\n\n' +
    'Link documents in the Document URL column of relevant sheets.'
  );
}

function showSettings() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .setting { margin-bottom: 15px; padding: 10px; background: #f5f5f5; border-radius: 4px; }
    </style>

    <h2>⚙️ Governance Settings</h2>

    <div class="setting">
      <strong>Company</strong>
      <p>${CONFIG.COMPANY_NAME}</p>
    </div>

    <div class="setting">
      <strong>Meeting Types</strong>
      <p style="font-size: 12px;">${CONFIG.MEETING_TYPES.join(', ')}</p>
    </div>

    <div class="setting">
      <strong>Resolution Types</strong>
      <p style="font-size: 12px;">${CONFIG.RESOLUTION_TYPES.join(', ')}</p>
    </div>

    <div class="setting">
      <strong>Director Roles</strong>
      <p style="font-size: 12px;">${CONFIG.DIRECTOR_ROLES.join(', ')}</p>
    </div>

    <h3>Best Practices</h3>
    <ul>
      <li>Send meeting notices 7-14 days in advance</li>
      <li>Circulate materials 3-5 days before</li>
      <li>Finalize minutes within 30 days</li>
      <li>Track compliance deadlines quarterly</li>
    </ul>
  `)
  .setWidth(400)
  .setHeight(500);

  SpreadsheetApp.getUi().showModalDialog(html, 'Settings');
}
