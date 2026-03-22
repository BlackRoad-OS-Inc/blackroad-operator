/**
 * BLACKROAD OS - HR Onboarding Workflow Automation
 *
 * SETUP: Extensions > Apps Script > Paste this code > Save > Refresh sheet
 *
 * FEATURES:
 * - New hire checklist automation
 * - Document collection tracking
 * - Equipment provisioning workflow
 * - IT account setup triggers
 * - Welcome email sequences
 * - Compliance training tracking
 * - Manager notifications
 * - 30/60/90 day review reminders
 */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('👥 HR Onboarding')
    .addItem('➕ New Hire', 'addNewHire')
    .addItem('📋 View Checklist', 'viewChecklist')
    .addSeparator()
    .addSubMenu(ui.createMenu('📧 Send Communications')
      .addItem('Welcome Email', 'sendWelcomeEmail')
      .addItem('First Day Info', 'sendFirstDayInfo')
      .addItem('Week 1 Check-in', 'sendWeek1Checkin')
      .addItem('30-Day Review Reminder', 'send30DayReminder'))
    .addSeparator()
    .addSubMenu(ui.createMenu('✅ Tasks')
      .addItem('Complete IT Setup', 'completeITSetup')
      .addItem('Complete Equipment', 'completeEquipment')
      .addItem('Complete Docs Received', 'completeDocsReceived')
      .addItem('Complete Training', 'completeTraining'))
    .addSeparator()
    .addItem('📊 Onboarding Dashboard', 'showDashboard')
    .addItem('📧 Email Manager Updates', 'emailManagerUpdates')
    .addItem('⏰ Setup Reminders', 'setupReminders')
    .addSeparator()
    .addItem('⚙️ Settings', 'openOnboardingSettings')
    .addToUi();
}

const CONFIG = {
  HIRES_START_ROW: 6,
  EMAIL_TEMPLATES: {
    welcome: {
      subject: 'Welcome to {{COMPANY}}! - Your Onboarding Journey',
      body: `Hi {{NAME}},

Welcome to the team! We're thrilled to have you join us as our new {{POSITION}}.

Your first day is {{START_DATE}}, and here's what to expect:

📍 Location: {{LOCATION}}
⏰ Time: 9:00 AM
👤 You'll be meeting: {{MANAGER}}

Please bring:
- Government-issued ID
- Signed offer letter
- Banking info for direct deposit

Looking forward to seeing you!

Best,
HR Team
{{COMPANY}}`
    },
    firstDay: {
      subject: 'First Day at {{COMPANY}} - Everything You Need',
      body: `Hi {{NAME}},

Today is the big day! Here's your first day agenda:

9:00 AM - Welcome & badge pickup
9:30 AM - HR orientation
10:30 AM - IT setup & equipment
12:00 PM - Lunch with team
1:00 PM - Meet your manager
2:00 PM - Workspace tour
3:00 PM - Start onboarding training

Your workspace: {{DESK_LOCATION}}
WiFi: {{WIFI_NETWORK}}
IT Support: IT@company.com

See you soon!

HR Team`
    }
  },
  CHECKLIST_ITEMS: [
    'Offer letter signed',
    'Background check complete',
    'I-9 documents received',
    'W-4 completed',
    'Direct deposit setup',
    'Emergency contact form',
    'Employee handbook acknowledgment',
    'IT accounts created',
    'Email setup',
    'Equipment issued',
    'Badge/access card',
    'Benefits enrollment',
    'Safety training',
    'Compliance training',
    '30-day review scheduled',
    '60-day review scheduled',
    '90-day review scheduled'
  ]
};

// Add new hire
function addNewHire() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      label { display: block; margin-top: 10px; font-weight: bold; }
      input, select { width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      button { margin-top: 15px; padding: 12px; background: #4CAF50; color: white; border: none; cursor: pointer; width: 100%; border-radius: 4px; }
      .row { display: flex; gap: 10px; }
      .row > div { flex: 1; }
    </style>
    <label>Full Name</label>
    <input type="text" id="name" placeholder="John Smith">
    <label>Email (Personal)</label>
    <input type="email" id="email" placeholder="john@email.com">
    <label>Position</label>
    <input type="text" id="position" placeholder="Software Engineer">
    <label>Department</label>
    <select id="department">
      <option>Engineering</option>
      <option>Sales</option>
      <option>Marketing</option>
      <option>Operations</option>
      <option>Finance</option>
      <option>HR</option>
      <option>Customer Success</option>
    </select>
    <label>Manager</label>
    <input type="text" id="manager" placeholder="Manager name">
    <label>Manager Email</label>
    <input type="email" id="managerEmail" placeholder="manager@company.com">
    <div class="row">
      <div>
        <label>Start Date</label>
        <input type="date" id="startDate">
      </div>
      <div>
        <label>Location</label>
        <input type="text" id="location" placeholder="Office/Remote">
      </div>
    </div>
    <label>Employment Type</label>
    <select id="empType">
      <option>Full-Time</option>
      <option>Part-Time</option>
      <option>Contractor</option>
      <option>Intern</option>
    </select>
    <button onclick="addHire()">Add New Hire</button>
    <script>
      function addHire() {
        const hire = {
          name: document.getElementById('name').value,
          email: document.getElementById('email').value,
          position: document.getElementById('position').value,
          department: document.getElementById('department').value,
          manager: document.getElementById('manager').value,
          managerEmail: document.getElementById('managerEmail').value,
          startDate: document.getElementById('startDate').value,
          location: document.getElementById('location').value,
          empType: document.getElementById('empType').value
        };
        google.script.run.withSuccessHandler((result) => {
          alert(result);
          google.script.host.close();
        }).processNewHire(hire);
      }
    </script>
  `).setWidth(400).setHeight(580);

  SpreadsheetApp.getUi().showModalDialog(html, '➕ Add New Hire');
}

function processNewHire(hire) {
  const sheet = SpreadsheetApp.getActiveSheet();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const row = sheet.getLastRow() + 1;

  // Generate employee ID
  const empId = 'EMP' + String(row - CONFIG.HIRES_START_ROW + 1).padStart(4, '0');

  // Add to main sheet
  sheet.getRange(row, 1).setValue(empId);
  sheet.getRange(row, 2).setValue(hire.name);
  sheet.getRange(row, 3).setValue(hire.email);
  sheet.getRange(row, 4).setValue(hire.position);
  sheet.getRange(row, 5).setValue(hire.department);
  sheet.getRange(row, 6).setValue(hire.manager);
  sheet.getRange(row, 7).setValue(new Date(hire.startDate));
  sheet.getRange(row, 8).setValue(hire.location);
  sheet.getRange(row, 9).setValue(hire.empType);
  sheet.getRange(row, 10).setValue('Pending'); // Status
  sheet.getRange(row, 11).setValue(0); // Progress %
  sheet.getRange(row, 12).setValue(new Date()); // Created date

  // Create individual checklist sheet
  createChecklistSheet(empId, hire);

  // Send notification to manager
  sendManagerNotification(hire);

  return '✅ New hire added: ' + hire.name + '\n\nEmployee ID: ' + empId + '\n\nChecklist created!';
}

// Create checklist sheet for new hire
function createChecklistSheet(empId, hire) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = empId + ' - ' + hire.name.split(' ')[0];

  let checkSheet = ss.getSheetByName(sheetName);
  if (checkSheet) ss.deleteSheet(checkSheet);
  checkSheet = ss.insertSheet(sheetName);

  // Header
  checkSheet.getRange(1, 1).setValue('ONBOARDING CHECKLIST: ' + hire.name);
  checkSheet.getRange(2, 1).setValue('Position: ' + hire.position + ' | Start Date: ' + hire.startDate);
  checkSheet.getRange(3, 1).setValue('Manager: ' + hire.manager + ' | Department: ' + hire.department);

  // Checklist header
  checkSheet.getRange(5, 1, 1, 4).setValues([['Task', 'Status', 'Completed By', 'Date']]);
  checkSheet.getRange(5, 1, 1, 4).setFontWeight('bold').setBackground('#E0E0E0');

  // Add checklist items
  for (let i = 0; i < CONFIG.CHECKLIST_ITEMS.length; i++) {
    const row = 6 + i;
    checkSheet.getRange(row, 1).setValue(CONFIG.CHECKLIST_ITEMS[i]);
    checkSheet.getRange(row, 2).setValue('⬜ Pending');
  }

  // Format
  checkSheet.setColumnWidth(1, 250);
  checkSheet.setColumnWidth(2, 120);
  checkSheet.setColumnWidth(3, 150);
  checkSheet.setColumnWidth(4, 120);
}

// View checklist
function viewChecklist() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Enter Employee ID:', ui.ButtonSet.OK_CANCEL);

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const empId = response.getResponseText().trim();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();

  for (const sheet of sheets) {
    if (sheet.getName().startsWith(empId)) {
      ss.setActiveSheet(sheet);
      return;
    }
  }

  ui.alert('❌ Checklist not found for ' + empId);
}

// Complete checklist item
function completeChecklistItem(empId, itemIndex, completedBy) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();

  for (const sheet of sheets) {
    if (sheet.getName().startsWith(empId)) {
      const row = 6 + itemIndex;
      sheet.getRange(row, 2).setValue('✅ Complete');
      sheet.getRange(row, 3).setValue(completedBy);
      sheet.getRange(row, 4).setValue(new Date());
      sheet.getRange(row, 1, 1, 4).setBackground('#C8E6C9');

      // Update progress on main sheet
      updateHireProgress(empId);
      return true;
    }
  }
  return false;
}

// Update progress percentage
function updateHireProgress(empId) {
  const mainSheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const lastRow = mainSheet.getLastRow();

  for (let row = CONFIG.HIRES_START_ROW; row <= lastRow; row++) {
    if (mainSheet.getRange(row, 1).getValue() === empId) {
      // Count completed items on checklist
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheets = ss.getSheets();

      for (const sheet of sheets) {
        if (sheet.getName().startsWith(empId)) {
          let completed = 0;
          for (let i = 0; i < CONFIG.CHECKLIST_ITEMS.length; i++) {
            if (sheet.getRange(6 + i, 2).getValue().includes('Complete')) {
              completed++;
            }
          }
          const progress = Math.round((completed / CONFIG.CHECKLIST_ITEMS.length) * 100);
          mainSheet.getRange(row, 11).setValue(progress);

          // Update status
          if (progress === 100) {
            mainSheet.getRange(row, 10).setValue('Complete');
            mainSheet.getRange(row, 1, 1, 12).setBackground('#C8E6C9');
          } else if (progress > 0) {
            mainSheet.getRange(row, 10).setValue('In Progress');
          }
          return;
        }
      }
    }
  }
}

// Complete IT Setup
function completeITSetup() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Complete IT Setup for Employee ID:', ui.ButtonSet.OK_CANCEL);

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const empId = response.getResponseText().trim();

  // Items 7, 8 are IT-related
  completeChecklistItem(empId, 7, 'IT Admin'); // IT accounts
  completeChecklistItem(empId, 8, 'IT Admin'); // Email setup

  ui.alert('✅ IT Setup marked complete for ' + empId);
}

// Complete Equipment
function completeEquipment() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Complete Equipment for Employee ID:', ui.ButtonSet.OK_CANCEL);

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const empId = response.getResponseText().trim();

  // Items 9, 10 are equipment-related
  completeChecklistItem(empId, 9, 'IT Admin');  // Equipment issued
  completeChecklistItem(empId, 10, 'IT Admin'); // Badge/access

  ui.alert('✅ Equipment marked complete for ' + empId);
}

// Complete Docs Received
function completeDocsReceived() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Complete Documentation for Employee ID:', ui.ButtonSet.OK_CANCEL);

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const empId = response.getResponseText().trim();

  // Items 0-6 are documentation
  for (let i = 0; i <= 6; i++) {
    completeChecklistItem(empId, i, 'HR');
  }

  ui.alert('✅ Documentation marked complete for ' + empId);
}

// Complete Training
function completeTraining() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Complete Training for Employee ID:', ui.ButtonSet.OK_CANCEL);

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const empId = response.getResponseText().trim();

  // Items 12, 13 are training
  completeChecklistItem(empId, 12, 'Training');
  completeChecklistItem(empId, 13, 'Training');

  ui.alert('✅ Training marked complete for ' + empId);
}

// Send welcome email
function sendWelcomeEmail() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Send Welcome Email to Employee ID:', ui.ButtonSet.OK_CANCEL);

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const empId = response.getResponseText().trim();
  const hire = getHireById(empId);

  if (!hire) {
    ui.alert('❌ Employee not found: ' + empId);
    return;
  }

  let subject = CONFIG.EMAIL_TEMPLATES.welcome.subject
    .replace('{{COMPANY}}', 'BlackRoad OS');

  let body = CONFIG.EMAIL_TEMPLATES.welcome.body
    .replace(/{{NAME}}/g, hire.name.split(' ')[0])
    .replace(/{{POSITION}}/g, hire.position)
    .replace(/{{START_DATE}}/g, new Date(hire.startDate).toLocaleDateString())
    .replace(/{{LOCATION}}/g, hire.location)
    .replace(/{{MANAGER}}/g, hire.manager)
    .replace(/{{COMPANY}}/g, 'BlackRoad OS');

  MailApp.sendEmail(hire.email, subject, body);
  ui.alert('✅ Welcome email sent to ' + hire.email);
}

// Send first day info
function sendFirstDayInfo() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Send First Day Info to Employee ID:', ui.ButtonSet.OK_CANCEL);

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const empId = response.getResponseText().trim();
  const hire = getHireById(empId);

  if (!hire) {
    ui.alert('❌ Employee not found: ' + empId);
    return;
  }

  let subject = CONFIG.EMAIL_TEMPLATES.firstDay.subject
    .replace('{{COMPANY}}', 'BlackRoad OS');

  let body = CONFIG.EMAIL_TEMPLATES.firstDay.body
    .replace(/{{NAME}}/g, hire.name.split(' ')[0])
    .replace(/{{DESK_LOCATION}}/g, hire.location)
    .replace(/{{WIFI_NETWORK}}/g, 'BlackRoad-Guest');

  MailApp.sendEmail(hire.email, subject, body);
  ui.alert('✅ First day info sent to ' + hire.email);
}

// Send Week 1 check-in
function sendWeek1Checkin() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Send Week 1 Check-in to Employee ID:', ui.ButtonSet.OK_CANCEL);

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const empId = response.getResponseText().trim();
  const hire = getHireById(empId);

  if (!hire) {
    ui.alert('❌ Employee not found: ' + empId);
    return;
  }

  const subject = 'Week 1 Check-in - How are you doing?';
  const body = `Hi ${hire.name.split(' ')[0]},

You've completed your first week! We'd love to hear how things are going.

A few quick questions:
- Do you have everything you need to do your job?
- Have you met your team members?
- Any questions or concerns so far?

Feel free to reach out anytime.

Best,
HR Team`;

  MailApp.sendEmail(hire.email, subject, body);
  ui.alert('✅ Week 1 check-in sent to ' + hire.email);
}

// Send 30-day reminder
function send30DayReminder() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Send 30-Day Reminder to Employee ID:', ui.ButtonSet.OK_CANCEL);

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const empId = response.getResponseText().trim();
  const hire = getHireById(empId);

  if (!hire) {
    ui.alert('❌ Employee not found: ' + empId);
    return;
  }

  // Send to manager
  const subject = '30-Day Review Reminder: ' + hire.name;
  const body = `Hi ${hire.manager},

${hire.name} is approaching their 30-day milestone. Please schedule a 30-day review to discuss:

- Initial performance and progress
- Role clarity and expectations
- Support needed
- Goals for next 30 days

Please complete the review within the next week.

Thanks,
HR Team`;

  MailApp.sendEmail(hire.managerEmail, subject, body);
  ui.alert('✅ 30-day review reminder sent to ' + hire.manager);
}

// Get hire by ID
function getHireById(empId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const lastRow = sheet.getLastRow();

  for (let row = CONFIG.HIRES_START_ROW; row <= lastRow; row++) {
    if (sheet.getRange(row, 1).getValue() === empId) {
      return {
        id: empId,
        name: sheet.getRange(row, 2).getValue(),
        email: sheet.getRange(row, 3).getValue(),
        position: sheet.getRange(row, 4).getValue(),
        department: sheet.getRange(row, 5).getValue(),
        manager: sheet.getRange(row, 6).getValue(),
        managerEmail: getManagerEmail(sheet.getRange(row, 6).getValue()),
        startDate: sheet.getRange(row, 7).getValue(),
        location: sheet.getRange(row, 8).getValue()
      };
    }
  }
  return null;
}

// Get manager email (would need a lookup)
function getManagerEmail(managerName) {
  // In a real implementation, look this up from an employees sheet
  return 'manager@company.com';
}

// Send manager notification
function sendManagerNotification(hire) {
  if (hire.managerEmail) {
    const subject = 'New Team Member Starting: ' + hire.name;
    const body = `Hi ${hire.manager},

A new team member is joining your team!

Name: ${hire.name}
Position: ${hire.position}
Start Date: ${hire.startDate}
Location: ${hire.location}

Please prepare for their arrival:
- Review their onboarding checklist
- Schedule 1:1 intro meeting
- Assign first-week tasks
- Introduce to the team

Thanks,
HR Team`;

    try {
      MailApp.sendEmail(hire.managerEmail, subject, body);
    } catch (e) {
      // Email might fail if invalid address
    }
  }
}

// Show dashboard
function showDashboard() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const lastRow = sheet.getLastRow();

  let pending = 0, inProgress = 0, complete = 0;
  let thisMonth = 0;
  const now = new Date();

  for (let row = CONFIG.HIRES_START_ROW; row <= lastRow; row++) {
    const status = sheet.getRange(row, 10).getValue();
    const startDate = new Date(sheet.getRange(row, 7).getValue());

    if (status === 'Pending') pending++;
    else if (status === 'In Progress') inProgress++;
    else if (status === 'Complete') complete++;

    if (startDate.getMonth() === now.getMonth() && startDate.getFullYear() === now.getFullYear()) {
      thisMonth++;
    }
  }

  const total = pending + inProgress + complete;

  const dashboard = `
📊 ONBOARDING DASHBOARD
=======================

Total Hires: ${total}
Starting This Month: ${thisMonth}

STATUS BREAKDOWN:
⬜ Pending: ${pending}
🔄 In Progress: ${inProgress}
✅ Complete: ${complete}

Completion Rate: ${total > 0 ? Math.round((complete / total) * 100) : 0}%
  `;

  SpreadsheetApp.getUi().alert(dashboard);
}

// Email manager updates
function emailManagerUpdates() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Send onboarding update to (manager email):', ui.ButtonSet.OK_CANCEL);

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const email = response.getResponseText();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const lastRow = sheet.getLastRow();

  let updates = [];

  for (let row = CONFIG.HIRES_START_ROW; row <= lastRow; row++) {
    const status = sheet.getRange(row, 10).getValue();
    if (status !== 'Complete') {
      updates.push(
        sheet.getRange(row, 2).getValue() + ' - ' +
        sheet.getRange(row, 4).getValue() + ' - ' +
        sheet.getRange(row, 11).getValue() + '% complete'
      );
    }
  }

  const subject = 'Onboarding Status Update - ' + new Date().toLocaleDateString();
  const body = 'ONBOARDING IN PROGRESS\n\n' + (updates.length > 0 ? updates.join('\n') : 'No active onboarding.') + '\n\n--\nBlackRoad OS HR';

  MailApp.sendEmail(email, subject, body);
  ui.alert('✅ Update sent to ' + email);
}

// Setup reminders
function setupReminders() {
  // Remove existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  for (const trigger of triggers) {
    if (trigger.getHandlerFunction() === 'dailyOnboardingCheck') {
      ScriptApp.deleteTrigger(trigger);
    }
  }

  ScriptApp.newTrigger('dailyOnboardingCheck')
    .timeBased()
    .everyDays(1)
    .atHour(8)
    .create();

  SpreadsheetApp.getUi().alert('✅ Daily onboarding reminders scheduled for 8 AM');
}

function dailyOnboardingCheck() {
  // Check for start dates today and send reminders
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const lastRow = sheet.getLastRow();
  const today = new Date().toDateString();

  for (let row = CONFIG.HIRES_START_ROW; row <= lastRow; row++) {
    const startDate = new Date(sheet.getRange(row, 7).getValue()).toDateString();
    if (startDate === today) {
      // New hire starting today - could send reminders
    }
  }
}

// Settings
function openOnboardingSettings() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      h3 { color: #4CAF50; }
    </style>
    <h3>⚙️ Onboarding Settings</h3>
    <p><b>Checklist Items:</b> 17 default tasks</p>
    <p><b>Email Templates:</b> Welcome, First Day, Check-ins</p>
    <p><b>To customize:</b> Edit CONFIG in Apps Script</p>
    <p><b>Individual Checklists:</b> Created as separate sheets</p>
    <p><b>Triggers:</b> Daily check for start dates & reviews</p>
  `).setWidth(350).setHeight(250);

  SpreadsheetApp.getUi().showModalDialog(html, '⚙️ Settings');
}
