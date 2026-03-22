/**
 * BlackRoad OS - Training & Certification Tracker
 * Manage employee training, certifications, and compliance
 *
 * Features:
 * - Training course catalog management
 * - Employee training assignments and progress
 * - Certification tracking with expiration alerts
 * - Compliance training management
 * - Learning path creation
 * - Training completion reports
 * - Automatic renewal reminders
 */

const CONFIG = {
  COMPANY_NAME: 'BlackRoad OS, Inc.',

  // Sheet names
  SHEETS: {
    COURSES: 'Courses',
    ASSIGNMENTS: 'Assignments',
    CERTIFICATIONS: 'Certifications',
    COMPLIANCE: 'Compliance',
    LEARNING_PATHS: 'Learning Paths'
  },

  // Training categories
  CATEGORIES: [
    'Technical - Engineering',
    'Technical - Product',
    'Technical - Security',
    'Leadership',
    'Management',
    'Soft Skills',
    'Compliance - HIPAA',
    'Compliance - SOC2',
    'Compliance - GDPR',
    'Compliance - Safety',
    'Onboarding',
    'Sales & Marketing',
    'Customer Success',
    'HR & Legal'
  ],

  // Training formats
  FORMATS: [
    'Online - Self-paced',
    'Online - Live Instructor',
    'In-Person - Classroom',
    'In-Person - Workshop',
    'Video Course',
    'Reading Material',
    'Hands-on Lab',
    'Certification Exam'
  ],

  // Status options
  ASSIGNMENT_STATUS: [
    'Assigned',
    'In Progress',
    'Completed',
    'Overdue',
    'Waived',
    'Expired'
  ],

  // Certification statuses
  CERT_STATUS: [
    'Active',
    'Expiring Soon',
    'Expired',
    'Pending Renewal',
    'Not Started'
  ],

  // Alert thresholds (days)
  ALERTS: {
    EXPIRING_SOON: 30,
    DUE_SOON: 7
  },

  // Skill levels
  SKILL_LEVELS: [
    'Beginner',
    'Intermediate',
    'Advanced',
    'Expert'
  ]
};

// ============================================
// MENU SETUP
// ============================================

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📚 Training')
    .addItem('➕ Add Course', 'addCourse')
    .addItem('📋 Assign Training', 'assignTraining')
    .addItem('✅ Record Completion', 'recordCompletion')
    .addSeparator()
    .addSubMenu(ui.createMenu('🏆 Certifications')
      .addItem('Add Certification', 'addCertification')
      .addItem('Record Cert Completion', 'recordCertCompletion')
      .addItem('View Expiring Certs', 'viewExpiringCerts'))
    .addSeparator()
    .addSubMenu(ui.createMenu('📊 Reports')
      .addItem('Training Dashboard', 'showTrainingDashboard')
      .addItem('Compliance Status', 'showComplianceStatus')
      .addItem('Employee Training History', 'showEmployeeHistory')
      .addItem('Department Summary', 'showDepartmentSummary'))
    .addSeparator()
    .addSubMenu(ui.createMenu('🔔 Alerts')
      .addItem('Check Overdue Training', 'checkOverdueTraining')
      .addItem('Check Expiring Certs', 'checkExpiringCerts')
      .addItem('Send Reminder Emails', 'sendReminderEmails'))
    .addSeparator()
    .addItem('🛤️ Create Learning Path', 'createLearningPath')
    .addItem('⚙️ Settings', 'showSettings')
    .addToUi();
}

// ============================================
// COURSE MANAGEMENT
// ============================================

function addCourse() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 12px; }
      label { display: block; font-weight: bold; margin-bottom: 4px; }
      input, select, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      textarea { height: 60px; }
      .row { display: flex; gap: 10px; }
      .row .form-group { flex: 1; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
    </style>

    <h2>➕ Add Training Course</h2>

    <div class="form-group">
      <label>Course Name *</label>
      <input type="text" id="courseName" required>
    </div>

    <div class="row">
      <div class="form-group">
        <label>Category</label>
        <select id="category">
          ${CONFIG.CATEGORIES.map(c => '<option>' + c + '</option>').join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Format</label>
        <select id="format">
          ${CONFIG.FORMATS.map(f => '<option>' + f + '</option>').join('')}
        </select>
      </div>
    </div>

    <div class="form-group">
      <label>Description</label>
      <textarea id="description" placeholder="What this course covers..."></textarea>
    </div>

    <div class="row">
      <div class="form-group">
        <label>Duration (hours)</label>
        <input type="number" id="duration" value="1" step="0.5">
      </div>
      <div class="form-group">
        <label>Skill Level</label>
        <select id="skillLevel">
          ${CONFIG.SKILL_LEVELS.map(l => '<option>' + l + '</option>').join('')}
        </select>
      </div>
    </div>

    <div class="row">
      <div class="form-group">
        <label>Provider/Vendor</label>
        <input type="text" id="provider" placeholder="e.g., Internal, Coursera, LinkedIn Learning">
      </div>
      <div class="form-group">
        <label>Cost ($)</label>
        <input type="number" id="cost" value="0">
      </div>
    </div>

    <div class="form-group">
      <label>Course URL</label>
      <input type="url" id="courseUrl" placeholder="https://">
    </div>

    <div class="row">
      <div class="form-group">
        <label>Is Mandatory?</label>
        <select id="mandatory">
          <option value="No">No - Optional</option>
          <option value="Yes">Yes - Required</option>
        </select>
      </div>
      <div class="form-group">
        <label>Recertification Period</label>
        <select id="recertPeriod">
          <option value="">None</option>
          <option value="90">Every 90 days</option>
          <option value="180">Every 6 months</option>
          <option value="365">Annually</option>
          <option value="730">Every 2 years</option>
        </select>
      </div>
    </div>

    <button onclick="saveCourse()">Save Course</button>

    <script>
      function saveCourse() {
        const data = {
          courseName: document.getElementById('courseName').value,
          category: document.getElementById('category').value,
          format: document.getElementById('format').value,
          description: document.getElementById('description').value,
          duration: document.getElementById('duration').value,
          skillLevel: document.getElementById('skillLevel').value,
          provider: document.getElementById('provider').value,
          cost: document.getElementById('cost').value,
          courseUrl: document.getElementById('courseUrl').value,
          mandatory: document.getElementById('mandatory').value,
          recertPeriod: document.getElementById('recertPeriod').value
        };

        if (!data.courseName) {
          alert('Please enter a course name');
          return;
        }

        google.script.run
          .withSuccessHandler(() => {
            alert('Course added!');
            google.script.host.close();
          })
          .saveCourse(data);
      }
    </script>
  `)
  .setWidth(500)
  .setHeight(650);

  SpreadsheetApp.getUi().showModalDialog(html, 'Add Course');
}

function saveCourse(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEETS.COURSES);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.COURSES);
    sheet.appendRow([
      'Course ID', 'Course Name', 'Category', 'Format', 'Description',
      'Duration (hrs)', 'Skill Level', 'Provider', 'Cost', 'URL',
      'Mandatory', 'Recert Period (days)', 'Status', 'Created Date', 'Notes'
    ]);
    sheet.getRange(1, 1, 1, 15).setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
  }

  const lastRow = sheet.getLastRow();
  const id = 'CRS-' + String(lastRow).padStart(4, '0');

  sheet.appendRow([
    id,
    data.courseName,
    data.category,
    data.format,
    data.description,
    data.duration,
    data.skillLevel,
    data.provider,
    data.cost,
    data.courseUrl,
    data.mandatory,
    data.recertPeriod || '',
    'Active',
    new Date(),
    ''
  ]);

  // Color mandatory courses
  if (data.mandatory === 'Yes') {
    const newRow = sheet.getLastRow();
    sheet.getRange(newRow, 1, 1, 15).setBackground('#fff2cc');
  }

  return id;
}

// ============================================
// TRAINING ASSIGNMENTS
// ============================================

function assignTraining() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const coursesSheet = ss.getSheetByName(CONFIG.SHEETS.COURSES);

  if (!coursesSheet || coursesSheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('No courses available. Add courses first.');
    return;
  }

  const courses = coursesSheet.getRange(2, 1, coursesSheet.getLastRow() - 1, 3).getValues();

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 12px; }
      label { display: block; font-weight: bold; margin-bottom: 4px; }
      input, select, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      .row { display: flex; gap: 10px; }
      .row .form-group { flex: 1; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
      .bulk-options { background: #f5f5f5; padding: 10px; border-radius: 4px; margin-bottom: 15px; }
    </style>

    <h2>📋 Assign Training</h2>

    <div class="form-group">
      <label>Select Course *</label>
      <select id="courseId">
        <option value="">Choose a course...</option>
        ${courses.map(c => '<option value="' + c[0] + '">' + c[1] + ' (' + c[2] + ')</option>').join('')}
      </select>
    </div>

    <div class="bulk-options">
      <label><input type="checkbox" id="bulkAssign" onchange="toggleBulk()"> Bulk Assign to Department</label>
      <div id="deptSelect" style="display: none; margin-top: 10px;">
        <select id="department">
          <option>Engineering</option>
          <option>Product</option>
          <option>Design</option>
          <option>Sales</option>
          <option>Marketing</option>
          <option>Customer Success</option>
          <option>HR</option>
          <option>Finance</option>
          <option>All Employees</option>
        </select>
      </div>
    </div>

    <div id="individualAssign">
      <div class="form-group">
        <label>Employee Name *</label>
        <input type="text" id="employeeName">
      </div>

      <div class="form-group">
        <label>Employee Email *</label>
        <input type="email" id="employeeEmail">
      </div>
    </div>

    <div class="row">
      <div class="form-group">
        <label>Due Date</label>
        <input type="date" id="dueDate">
      </div>
      <div class="form-group">
        <label>Priority</label>
        <select id="priority">
          <option>Required</option>
          <option>Recommended</option>
          <option>Optional</option>
        </select>
      </div>
    </div>

    <div class="form-group">
      <label>Assigned By</label>
      <input type="text" id="assignedBy" placeholder="Your name">
    </div>

    <div class="form-group">
      <label>Notes</label>
      <input type="text" id="notes" placeholder="Any special instructions...">
    </div>

    <div class="form-group">
      <label><input type="checkbox" id="sendEmail"> Send email notification to employee</label>
    </div>

    <button onclick="saveAssignment()">Assign Training</button>

    <script>
      function toggleBulk() {
        const bulk = document.getElementById('bulkAssign').checked;
        document.getElementById('deptSelect').style.display = bulk ? 'block' : 'none';
        document.getElementById('individualAssign').style.display = bulk ? 'none' : 'block';
      }

      function saveAssignment() {
        const data = {
          courseId: document.getElementById('courseId').value,
          bulkAssign: document.getElementById('bulkAssign').checked,
          department: document.getElementById('department').value,
          employeeName: document.getElementById('employeeName').value,
          employeeEmail: document.getElementById('employeeEmail').value,
          dueDate: document.getElementById('dueDate').value,
          priority: document.getElementById('priority').value,
          assignedBy: document.getElementById('assignedBy').value,
          notes: document.getElementById('notes').value,
          sendEmail: document.getElementById('sendEmail').checked
        };

        if (!data.courseId) {
          alert('Please select a course');
          return;
        }

        if (!data.bulkAssign && !data.employeeName) {
          alert('Please enter employee name');
          return;
        }

        google.script.run
          .withSuccessHandler(result => {
            alert(result);
            google.script.host.close();
          })
          .saveAssignment(data);
      }
    </script>
  `)
  .setWidth(450)
  .setHeight(650);

  SpreadsheetApp.getUi().showModalDialog(html, 'Assign Training');
}

function saveAssignment(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEETS.ASSIGNMENTS);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.ASSIGNMENTS);
    sheet.appendRow([
      'Assignment ID', 'Course ID', 'Course Name', 'Employee Name', 'Employee Email',
      'Department', 'Assigned Date', 'Due Date', 'Priority', 'Status',
      'Start Date', 'Completion Date', 'Score', 'Assigned By', 'Notes'
    ]);
    sheet.getRange(1, 1, 1, 15).setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
  }

  // Get course name
  const coursesSheet = ss.getSheetByName(CONFIG.SHEETS.COURSES);
  const coursesData = coursesSheet.getRange(2, 1, coursesSheet.getLastRow() - 1, 2).getValues();
  const course = coursesData.find(c => c[0] === data.courseId);
  const courseName = course ? course[1] : 'Unknown';

  if (data.bulkAssign) {
    // In production, this would pull from employee directory
    return 'Bulk assignment created for ' + data.department + '. Add employees manually or connect to HR system.';
  }

  const lastRow = sheet.getLastRow();
  const id = 'ASGN-' + String(lastRow).padStart(5, '0');

  sheet.appendRow([
    id,
    data.courseId,
    courseName,
    data.employeeName,
    data.employeeEmail,
    '',
    new Date(),
    data.dueDate ? new Date(data.dueDate) : '',
    data.priority,
    'Assigned',
    '',
    '',
    '',
    data.assignedBy,
    data.notes
  ]);

  // Send email if requested
  if (data.sendEmail && data.employeeEmail) {
    const subject = `Training Assigned: ${courseName}`;
    const body = `
      <h2>New Training Assignment</h2>
      <p>Hi ${data.employeeName},</p>
      <p>You have been assigned the following training:</p>
      <ul>
        <li><strong>Course:</strong> ${courseName}</li>
        <li><strong>Priority:</strong> ${data.priority}</li>
        <li><strong>Due Date:</strong> ${data.dueDate || 'No specific deadline'}</li>
      </ul>
      <p>${data.notes ? '<strong>Notes:</strong> ' + data.notes : ''}</p>
      <p>Please complete this training by the due date.</p>
      <p>Best regards,<br>${data.assignedBy || CONFIG.COMPANY_NAME}</p>
    `;

    MailApp.sendEmail({
      to: data.employeeEmail,
      subject: subject,
      htmlBody: body
    });
  }

  return 'Training assigned successfully! Assignment ID: ' + id;
}

// ============================================
// RECORD COMPLETION
// ============================================

function recordCompletion() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.ASSIGNMENTS);

  if (!sheet || sheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('No assignments found.');
    return;
  }

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 15).getValues();
  const pending = data.filter(r => r[9] !== 'Completed');

  if (pending.length === 0) {
    SpreadsheetApp.getUi().alert('No pending assignments.');
    return;
  }

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 12px; }
      label { display: block; font-weight: bold; margin-bottom: 4px; }
      input, select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      .row { display: flex; gap: 10px; }
      .row .form-group { flex: 1; }
      button { background: #34a853; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
    </style>

    <h2>✅ Record Training Completion</h2>

    <div class="form-group">
      <label>Select Assignment *</label>
      <select id="assignmentId">
        <option value="">Choose an assignment...</option>
        ${pending.map(r =>
          '<option value="' + r[0] + '">' + r[3] + ' - ' + r[2] + ' (' + r[9] + ')</option>'
        ).join('')}
      </select>
    </div>

    <div class="form-group">
      <label>Completion Date</label>
      <input type="date" id="completionDate" value="${new Date().toISOString().split('T')[0]}">
    </div>

    <div class="row">
      <div class="form-group">
        <label>Score/Grade (optional)</label>
        <input type="text" id="score" placeholder="e.g., 95%, Pass">
      </div>
      <div class="form-group">
        <label>Certificate Number (optional)</label>
        <input type="text" id="certNumber">
      </div>
    </div>

    <div class="form-group">
      <label>Notes</label>
      <input type="text" id="notes" placeholder="Any completion notes...">
    </div>

    <button onclick="completeTraining()">Mark as Completed</button>

    <script>
      function completeTraining() {
        const data = {
          assignmentId: document.getElementById('assignmentId').value,
          completionDate: document.getElementById('completionDate').value,
          score: document.getElementById('score').value,
          certNumber: document.getElementById('certNumber').value,
          notes: document.getElementById('notes').value
        };

        if (!data.assignmentId) {
          alert('Please select an assignment');
          return;
        }

        google.script.run
          .withSuccessHandler(() => {
            alert('Training marked as completed!');
            google.script.host.close();
          })
          .markTrainingComplete(data);
      }
    </script>
  `)
  .setWidth(450)
  .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(html, 'Record Completion');
}

function markTrainingComplete(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.ASSIGNMENTS);

  // Find the assignment row
  const allData = sheet.getRange(2, 1, sheet.getLastRow() - 1, 15).getValues();
  const rowIndex = allData.findIndex(r => r[0] === data.assignmentId);

  if (rowIndex === -1) return;

  const row = rowIndex + 2; // Account for header and 0-index

  // Update status, completion date, and score
  sheet.getRange(row, 10).setValue('Completed'); // Status
  sheet.getRange(row, 12).setValue(new Date(data.completionDate)); // Completion Date
  sheet.getRange(row, 13).setValue(data.score); // Score

  // Append to notes
  const existingNotes = sheet.getRange(row, 15).getValue();
  const newNotes = existingNotes + (existingNotes ? '; ' : '') + data.notes;
  sheet.getRange(row, 15).setValue(newNotes);

  // Color row green
  sheet.getRange(row, 1, 1, 15).setBackground('#d9ead3');
}

// ============================================
// CERTIFICATIONS
// ============================================

function addCertification() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 12px; }
      label { display: block; font-weight: bold; margin-bottom: 4px; }
      input, select, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      .row { display: flex; gap: 10px; }
      .row .form-group { flex: 1; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
    </style>

    <h2>🏆 Add Certification</h2>

    <div class="form-group">
      <label>Certification Name *</label>
      <input type="text" id="certName" placeholder="e.g., AWS Solutions Architect">
    </div>

    <div class="form-group">
      <label>Employee Name *</label>
      <input type="text" id="employeeName">
    </div>

    <div class="form-group">
      <label>Employee Email</label>
      <input type="email" id="employeeEmail">
    </div>

    <div class="row">
      <div class="form-group">
        <label>Issuing Organization</label>
        <input type="text" id="issuer" placeholder="e.g., Amazon Web Services">
      </div>
      <div class="form-group">
        <label>Credential ID</label>
        <input type="text" id="credentialId">
      </div>
    </div>

    <div class="row">
      <div class="form-group">
        <label>Issue Date</label>
        <input type="date" id="issueDate">
      </div>
      <div class="form-group">
        <label>Expiration Date</label>
        <input type="date" id="expirationDate">
      </div>
    </div>

    <div class="form-group">
      <label>Verification URL</label>
      <input type="url" id="verifyUrl" placeholder="https://">
    </div>

    <div class="row">
      <div class="form-group">
        <label>Category</label>
        <select id="category">
          <option>Technical</option>
          <option>Cloud (AWS/GCP/Azure)</option>
          <option>Security</option>
          <option>Project Management</option>
          <option>Agile/Scrum</option>
          <option>Compliance</option>
          <option>Industry Specific</option>
          <option>Other</option>
        </select>
      </div>
      <div class="form-group">
        <label>Level</label>
        <select id="level">
          <option>Associate</option>
          <option>Professional</option>
          <option>Expert</option>
          <option>Specialty</option>
          <option>N/A</option>
        </select>
      </div>
    </div>

    <button onclick="saveCert()">Save Certification</button>

    <script>
      function saveCert() {
        const data = {
          certName: document.getElementById('certName').value,
          employeeName: document.getElementById('employeeName').value,
          employeeEmail: document.getElementById('employeeEmail').value,
          issuer: document.getElementById('issuer').value,
          credentialId: document.getElementById('credentialId').value,
          issueDate: document.getElementById('issueDate').value,
          expirationDate: document.getElementById('expirationDate').value,
          verifyUrl: document.getElementById('verifyUrl').value,
          category: document.getElementById('category').value,
          level: document.getElementById('level').value
        };

        if (!data.certName || !data.employeeName) {
          alert('Please fill in required fields');
          return;
        }

        google.script.run
          .withSuccessHandler(() => {
            alert('Certification added!');
            google.script.host.close();
          })
          .saveCertification(data);
      }
    </script>
  `)
  .setWidth(500)
  .setHeight(600);

  SpreadsheetApp.getUi().showModalDialog(html, 'Add Certification');
}

function saveCertification(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEETS.CERTIFICATIONS);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.CERTIFICATIONS);
    sheet.appendRow([
      'Cert ID', 'Certification Name', 'Employee Name', 'Employee Email',
      'Issuing Org', 'Credential ID', 'Issue Date', 'Expiration Date',
      'Days Until Expiry', 'Status', 'Category', 'Level', 'Verify URL', 'Notes'
    ]);
    sheet.getRange(1, 1, 1, 14).setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
  }

  const lastRow = sheet.getLastRow();
  const id = 'CERT-' + String(lastRow).padStart(4, '0');

  // Calculate status
  let status = 'Active';
  let daysUntil = '';

  if (data.expirationDate) {
    const expDate = new Date(data.expirationDate);
    const today = new Date();
    daysUntil = Math.floor((expDate - today) / (1000 * 60 * 60 * 24));

    if (daysUntil < 0) status = 'Expired';
    else if (daysUntil <= CONFIG.ALERTS.EXPIRING_SOON) status = 'Expiring Soon';
  }

  sheet.appendRow([
    id,
    data.certName,
    data.employeeName,
    data.employeeEmail,
    data.issuer,
    data.credentialId,
    data.issueDate ? new Date(data.issueDate) : '',
    data.expirationDate ? new Date(data.expirationDate) : '',
    daysUntil,
    status,
    data.category,
    data.level,
    data.verifyUrl,
    ''
  ]);

  // Color code by status
  const newRow = sheet.getLastRow();
  const colors = {
    'Active': '#d9ead3',
    'Expiring Soon': '#fff2cc',
    'Expired': '#f4cccc'
  };
  sheet.getRange(newRow, 1, 1, 14).setBackground(colors[status] || '#ffffff');

  return id;
}

// ============================================
// VIEW EXPIRING CERTIFICATIONS
// ============================================

function viewExpiringCerts() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.CERTIFICATIONS);

  if (!sheet || sheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('No certifications found.');
    return;
  }

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 14).getValues();

  // Filter expiring and expired
  const expiring = data.filter(row => {
    const status = row[9];
    return status === 'Expiring Soon' || status === 'Expired';
  });

  if (expiring.length === 0) {
    SpreadsheetApp.getUi().alert('No expiring or expired certifications! 🎉');
    return;
  }

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
      th { background: #4285f4; color: white; }
      .expired { background: #fce8e6; }
      .expiring { background: #fef7e0; }
      .days { font-weight: bold; }
      .negative { color: #ea4335; }
      .warning { color: #f9a825; }
    </style>

    <h2>⚠️ Expiring & Expired Certifications</h2>

    <table>
      <tr>
        <th>Employee</th>
        <th>Certification</th>
        <th>Expires</th>
        <th>Status</th>
      </tr>
      ${expiring.map(row => {
        const isExpired = row[9] === 'Expired';
        const cls = isExpired ? 'expired' : 'expiring';
        const daysClass = isExpired ? 'negative' : 'warning';
        return `
          <tr class="${cls}">
            <td>${row[2]}</td>
            <td>${row[1]}<br><small>${row[4]}</small></td>
            <td><span class="days ${daysClass}">${row[8]} days</span></td>
            <td>${row[9]}</td>
          </tr>
        `;
      }).join('')}
    </table>

    <p style="margin-top: 20px;">
      <strong>Total:</strong> ${expiring.length} certifications need attention
    </p>
  `)
  .setWidth(550)
  .setHeight(450);

  SpreadsheetApp.getUi().showModalDialog(html, 'Expiring Certifications');
}

// ============================================
// TRAINING DASHBOARD
// ============================================

function showTrainingDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Get assignments data
  const assignSheet = ss.getSheetByName(CONFIG.SHEETS.ASSIGNMENTS);
  const assignData = assignSheet && assignSheet.getLastRow() > 1
    ? assignSheet.getRange(2, 1, assignSheet.getLastRow() - 1, 15).getValues()
    : [];

  // Get courses data
  const coursesSheet = ss.getSheetByName(CONFIG.SHEETS.COURSES);
  const coursesCount = coursesSheet ? coursesSheet.getLastRow() - 1 : 0;

  // Get certifications data
  const certSheet = ss.getSheetByName(CONFIG.SHEETS.CERTIFICATIONS);
  const certData = certSheet && certSheet.getLastRow() > 1
    ? certSheet.getRange(2, 1, certSheet.getLastRow() - 1, 14).getValues()
    : [];

  // Calculate stats
  const completed = assignData.filter(r => r[9] === 'Completed').length;
  const inProgress = assignData.filter(r => r[9] === 'In Progress').length;
  const assigned = assignData.filter(r => r[9] === 'Assigned').length;
  const overdue = assignData.filter(r => {
    if (r[9] === 'Completed') return false;
    if (!r[7]) return false;
    return new Date(r[7]) < new Date();
  }).length;

  const activeCerts = certData.filter(r => r[9] === 'Active').length;
  const expiringCerts = certData.filter(r => r[9] === 'Expiring Soon').length;

  // Completion rate
  const totalAssigned = assignData.length;
  const completionRate = totalAssigned > 0 ? ((completed / totalAssigned) * 100).toFixed(1) : 0;

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; background: #f8f9fa; }
      .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
      .stat-card { background: white; padding: 20px; border-radius: 12px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
      .stat-value { font-size: 36px; font-weight: bold; }
      .stat-label { font-size: 14px; color: #666; margin-top: 5px; }
      .completed { color: #34a853; }
      .progress { color: #4285f4; }
      .pending { color: #fbbc04; }
      .overdue { color: #ea4335; }
      .section { margin-top: 25px; }
      .section h3 { margin-bottom: 10px; color: #333; }
      .progress-bar { height: 30px; background: #e8e8e8; border-radius: 15px; overflow: hidden; }
      .progress-fill { height: 100%; background: linear-gradient(90deg, #34a853, #4caf50); }
      .cert-summary { display: flex; gap: 10px; margin-top: 10px; }
      .cert-badge { padding: 10px 15px; border-radius: 8px; text-align: center; flex: 1; }
      .cert-active { background: #d9ead3; }
      .cert-expiring { background: #fff2cc; }
    </style>

    <h2>📚 Training Dashboard</h2>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value completed">${completed}</div>
        <div class="stat-label">Completed</div>
      </div>
      <div class="stat-card">
        <div class="stat-value progress">${inProgress}</div>
        <div class="stat-label">In Progress</div>
      </div>
      <div class="stat-card">
        <div class="stat-value pending">${assigned}</div>
        <div class="stat-label">Assigned (Not Started)</div>
      </div>
      <div class="stat-card">
        <div class="stat-value overdue">${overdue}</div>
        <div class="stat-label">Overdue</div>
      </div>
    </div>

    <div class="section">
      <h3>📈 Completion Rate</h3>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${completionRate}%;"></div>
      </div>
      <p style="text-align: center; margin-top: 5px;"><strong>${completionRate}%</strong> of training completed</p>
    </div>

    <div class="section">
      <h3>🏆 Certifications</h3>
      <div class="cert-summary">
        <div class="cert-badge cert-active">
          <strong>${activeCerts}</strong><br>Active
        </div>
        <div class="cert-badge cert-expiring">
          <strong>${expiringCerts}</strong><br>Expiring Soon
        </div>
      </div>
    </div>

    <div class="section">
      <h3>📊 Summary</h3>
      <ul>
        <li><strong>${coursesCount}</strong> courses in catalog</li>
        <li><strong>${totalAssigned}</strong> total assignments</li>
        <li><strong>${certData.length}</strong> certifications tracked</li>
      </ul>
    </div>
  `)
  .setWidth(450)
  .setHeight(600);

  SpreadsheetApp.getUi().showModalDialog(html, 'Training Dashboard');
}

// ============================================
// COMPLIANCE STATUS
// ============================================

function showComplianceStatus() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const assignSheet = ss.getSheetByName(CONFIG.SHEETS.ASSIGNMENTS);

  if (!assignSheet || assignSheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('No training assignments found.');
    return;
  }

  // Get all courses to identify compliance training
  const coursesSheet = ss.getSheetByName(CONFIG.SHEETS.COURSES);
  const courses = coursesSheet ? coursesSheet.getRange(2, 1, coursesSheet.getLastRow() - 1, 15).getValues() : [];

  const complianceCourses = courses.filter(c =>
    c[2].includes('Compliance') || c[10] === 'Yes'
  ).map(c => c[0]);

  const data = assignSheet.getRange(2, 1, assignSheet.getLastRow() - 1, 15).getValues();

  // Filter to compliance training
  const complianceAssignments = data.filter(r => complianceCourses.includes(r[1]));

  const completed = complianceAssignments.filter(r => r[9] === 'Completed').length;
  const total = complianceAssignments.length;
  const complianceRate = total > 0 ? ((completed / total) * 100).toFixed(1) : 100;

  const overdue = complianceAssignments.filter(r => {
    if (r[9] === 'Completed') return false;
    if (!r[7]) return false;
    return new Date(r[7]) < new Date();
  });

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .compliance-score { text-align: center; padding: 30px; background: ${complianceRate >= 90 ? '#d9ead3' : (complianceRate >= 70 ? '#fff2cc' : '#fce8e6')}; border-radius: 12px; margin-bottom: 20px; }
      .score { font-size: 48px; font-weight: bold; color: ${complianceRate >= 90 ? '#34a853' : (complianceRate >= 70 ? '#f9a825' : '#ea4335')}; }
      .overdue-list { background: #fce8e6; padding: 15px; border-radius: 8px; margin-top: 15px; }
      .overdue-item { padding: 8px 0; border-bottom: 1px solid #f4cccc; }
    </style>

    <h2>📋 Compliance Training Status</h2>

    <div class="compliance-score">
      <div class="score">${complianceRate}%</div>
      <div>Compliance Rate</div>
      <p><strong>${completed}</strong> of <strong>${total}</strong> required trainings completed</p>
    </div>

    ${overdue.length > 0 ? `
      <div class="overdue-list">
        <h3>⚠️ Overdue Compliance Training (${overdue.length})</h3>
        ${overdue.map(r =>
          `<div class="overdue-item"><strong>${r[3]}</strong> - ${r[2]}<br><small>Due: ${new Date(r[7]).toLocaleDateString()}</small></div>`
        ).join('')}
      </div>
    ` : '<p style="color: #34a853; text-align: center;">✅ All compliance training is up to date!</p>'}

    <h3 style="margin-top: 20px;">Compliance Requirements</h3>
    <ul>
      <li>HIPAA training - Annual</li>
      <li>Security awareness - Annual</li>
      <li>Anti-harassment - Every 2 years</li>
      <li>Data privacy (GDPR) - Annual</li>
    </ul>
  `)
  .setWidth(450)
  .setHeight(550);

  SpreadsheetApp.getUi().showModalDialog(html, 'Compliance Status');
}

// ============================================
// EMPLOYEE HISTORY
// ============================================

function showEmployeeHistory() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    'Employee Training History',
    'Enter employee name or email:',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const search = response.getResponseText().toLowerCase();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Search assignments
  const assignSheet = ss.getSheetByName(CONFIG.SHEETS.ASSIGNMENTS);
  const assignments = assignSheet && assignSheet.getLastRow() > 1
    ? assignSheet.getRange(2, 1, assignSheet.getLastRow() - 1, 15).getValues()
        .filter(r => r[3].toLowerCase().includes(search) || r[4].toLowerCase().includes(search))
    : [];

  // Search certifications
  const certSheet = ss.getSheetByName(CONFIG.SHEETS.CERTIFICATIONS);
  const certs = certSheet && certSheet.getLastRow() > 1
    ? certSheet.getRange(2, 1, certSheet.getLastRow() - 1, 14).getValues()
        .filter(r => r[2].toLowerCase().includes(search) || r[3].toLowerCase().includes(search))
    : [];

  if (assignments.length === 0 && certs.length === 0) {
    ui.alert('No records found for "' + search + '"');
    return;
  }

  const employeeName = assignments[0]?.[3] || certs[0]?.[2] || search;

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      h2 { color: #333; }
      .section { margin: 20px 0; }
      table { width: 100%; border-collapse: collapse; }
      th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
      th { background: #f5f5f5; }
      .completed { color: #34a853; }
      .pending { color: #fbbc04; }
      .overdue { color: #ea4335; }
    </style>

    <h2>📋 Training History: ${employeeName}</h2>

    <div class="section">
      <h3>📚 Training (${assignments.length})</h3>
      ${assignments.length > 0 ? `
        <table>
          <tr><th>Course</th><th>Status</th><th>Completed</th></tr>
          ${assignments.map(r => {
            const statusClass = r[9] === 'Completed' ? 'completed' : (r[9] === 'Overdue' ? 'overdue' : 'pending');
            const completedDate = r[11] ? new Date(r[11]).toLocaleDateString() : '-';
            return `<tr><td>${r[2]}</td><td class="${statusClass}">${r[9]}</td><td>${completedDate}</td></tr>`;
          }).join('')}
        </table>
      ` : '<p>No training records</p>'}
    </div>

    <div class="section">
      <h3>🏆 Certifications (${certs.length})</h3>
      ${certs.length > 0 ? `
        <table>
          <tr><th>Certification</th><th>Status</th><th>Expires</th></tr>
          ${certs.map(r => {
            const expDate = r[7] ? new Date(r[7]).toLocaleDateString() : 'No expiry';
            return `<tr><td>${r[1]}<br><small>${r[4]}</small></td><td>${r[9]}</td><td>${expDate}</td></tr>`;
          }).join('')}
        </table>
      ` : '<p>No certifications</p>'}
    </div>
  `)
  .setWidth(500)
  .setHeight(500);

  ui.showModalDialog(html, 'Employee History');
}

// ============================================
// ALERTS
// ============================================

function checkOverdueTraining() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.ASSIGNMENTS);

  if (!sheet || sheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('No assignments found.');
    return;
  }

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 15).getValues();
  const today = new Date();

  let overdueCount = 0;

  data.forEach((row, index) => {
    if (row[9] === 'Completed' || row[9] === 'Waived') return;
    if (!row[7]) return;

    const dueDate = new Date(row[7]);
    if (dueDate < today) {
      // Mark as overdue
      sheet.getRange(index + 2, 10).setValue('Overdue');
      sheet.getRange(index + 2, 1, 1, 15).setBackground('#fce8e6');
      overdueCount++;
    }
  });

  SpreadsheetApp.getUi().alert(
    'Overdue Training Check Complete\n\n' +
    'Found ' + overdueCount + ' overdue training assignments.'
  );
}

function checkExpiringCerts() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.CERTIFICATIONS);

  if (!sheet || sheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('No certifications found.');
    return;
  }

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 14).getValues();
  const today = new Date();

  let updated = 0;

  data.forEach((row, index) => {
    if (!row[7]) return;

    const expDate = new Date(row[7]);
    const daysUntil = Math.floor((expDate - today) / (1000 * 60 * 60 * 24));

    // Update days until expiry
    sheet.getRange(index + 2, 9).setValue(daysUntil);

    // Update status
    let status = 'Active';
    let color = '#d9ead3';

    if (daysUntil < 0) {
      status = 'Expired';
      color = '#f4cccc';
    } else if (daysUntil <= CONFIG.ALERTS.EXPIRING_SOON) {
      status = 'Expiring Soon';
      color = '#fff2cc';
    }

    if (row[9] !== status) {
      sheet.getRange(index + 2, 10).setValue(status);
      sheet.getRange(index + 2, 1, 1, 14).setBackground(color);
      updated++;
    }
  });

  SpreadsheetApp.getUi().alert(
    'Certification Check Complete\n\n' +
    'Updated ' + updated + ' certification statuses.'
  );
}

function sendReminderEmails() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.alert(
    'Send Reminder Emails',
    'This will send reminders for:\n' +
    '- Overdue training\n' +
    '- Training due in ' + CONFIG.ALERTS.DUE_SOON + ' days\n' +
    '- Certifications expiring in ' + CONFIG.ALERTS.EXPIRING_SOON + ' days\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );

  if (result !== ui.Button.YES) return;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sentCount = 0;

  // Check assignments
  const assignSheet = ss.getSheetByName(CONFIG.SHEETS.ASSIGNMENTS);
  if (assignSheet && assignSheet.getLastRow() > 1) {
    const data = assignSheet.getRange(2, 1, assignSheet.getLastRow() - 1, 15).getValues();
    const today = new Date();

    data.forEach(row => {
      if (row[9] === 'Completed' || !row[4] || !row[7]) return;

      const dueDate = new Date(row[7]);
      const daysUntil = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));

      if (daysUntil <= CONFIG.ALERTS.DUE_SOON) {
        const isOverdue = daysUntil < 0;
        const subject = isOverdue
          ? `⚠️ OVERDUE: Training "${row[2]}" was due ${Math.abs(daysUntil)} days ago`
          : `📚 Reminder: Training "${row[2]}" due in ${daysUntil} days`;

        MailApp.sendEmail({
          to: row[4],
          subject: subject,
          htmlBody: `
            <p>Hi ${row[3]},</p>
            <p>This is a reminder about your assigned training:</p>
            <ul>
              <li><strong>Course:</strong> ${row[2]}</li>
              <li><strong>Due Date:</strong> ${dueDate.toLocaleDateString()}</li>
              <li><strong>Status:</strong> ${isOverdue ? 'OVERDUE' : 'Due Soon'}</li>
            </ul>
            <p>Please complete this training as soon as possible.</p>
          `
        });
        sentCount++;
      }
    });
  }

  ui.alert('Sent ' + sentCount + ' reminder emails.');
}

// ============================================
// LEARNING PATH
// ============================================

function createLearningPath() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 12px; }
      label { display: block; font-weight: bold; margin-bottom: 4px; }
      input, select, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
    </style>

    <h2>🛤️ Create Learning Path</h2>

    <div class="form-group">
      <label>Path Name</label>
      <input type="text" id="pathName" placeholder="e.g., New Engineer Onboarding">
    </div>

    <div class="form-group">
      <label>Target Role/Team</label>
      <input type="text" id="targetRole" placeholder="e.g., Software Engineer, Sales Team">
    </div>

    <div class="form-group">
      <label>Description</label>
      <textarea id="description" placeholder="What this learning path covers..."></textarea>
    </div>

    <div class="form-group">
      <label>Estimated Duration</label>
      <input type="text" id="duration" placeholder="e.g., 2 weeks, 40 hours">
    </div>

    <p>After creating, add courses to the Learning Paths sheet manually.</p>

    <button onclick="savePath()">Create Learning Path</button>

    <script>
      function savePath() {
        const data = {
          name: document.getElementById('pathName').value,
          role: document.getElementById('targetRole').value,
          description: document.getElementById('description').value,
          duration: document.getElementById('duration').value
        };

        google.script.run
          .withSuccessHandler(() => {
            alert('Learning path created!');
            google.script.host.close();
          })
          .saveLearningPath(data);
      }
    </script>
  `)
  .setWidth(400)
  .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(html, 'Create Learning Path');
}

function saveLearningPath(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEETS.LEARNING_PATHS);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.LEARNING_PATHS);
    sheet.appendRow([
      'Path ID', 'Path Name', 'Target Role', 'Description', 'Duration',
      'Courses (comma-separated IDs)', 'Status', 'Created Date'
    ]);
    sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
  }

  const id = 'PATH-' + String(sheet.getLastRow()).padStart(3, '0');

  sheet.appendRow([
    id,
    data.name,
    data.role,
    data.description,
    data.duration,
    '',
    'Active',
    new Date()
  ]);

  return id;
}

// ============================================
// DEPARTMENT SUMMARY
// ============================================

function showDepartmentSummary() {
  SpreadsheetApp.getUi().alert(
    'Department Summary\n\n' +
    'To view department-level training metrics:\n\n' +
    '1. Add department data to the Assignments sheet\n' +
    '2. Use Google Sheets filters to view by department\n' +
    '3. Create pivot tables for aggregate analysis\n\n' +
    'Tip: Connect to your HR system for automatic department mapping.'
  );
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
    </style>

    <h2>⚙️ Training System Settings</h2>

    <div class="setting">
      <label>Alert Thresholds</label>
      <ul>
        <li>Certification expiry warning: ${CONFIG.ALERTS.EXPIRING_SOON} days</li>
        <li>Training due soon: ${CONFIG.ALERTS.DUE_SOON} days</li>
      </ul>
    </div>

    <div class="setting">
      <label>Training Categories</label>
      <p style="font-size: 12px;">${CONFIG.CATEGORIES.join(', ')}</p>
    </div>

    <div class="setting">
      <label>Training Formats</label>
      <p style="font-size: 12px;">${CONFIG.FORMATS.join(', ')}</p>
    </div>

    <div class="setting">
      <label>Sheets</label>
      <ul>
        ${Object.entries(CONFIG.SHEETS).map(([key, name]) =>
          '<li>' + name + '</li>'
        ).join('')}
      </ul>
    </div>

    <h3>Automation Tips</h3>
    <ul>
      <li>Set up triggers for weekly overdue checks</li>
      <li>Connect to HR system for employee data</li>
      <li>Link to LMS for automatic completion tracking</li>
    </ul>
  `)
  .setWidth(400)
  .setHeight(500);

  SpreadsheetApp.getUi().showModalDialog(html, 'Settings');
}

function recordCertCompletion() {
  addCertification();
}
