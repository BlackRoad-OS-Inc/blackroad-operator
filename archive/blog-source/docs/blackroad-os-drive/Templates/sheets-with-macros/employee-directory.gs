/**
 * BlackRoad OS - Employee Directory & Org Chart
 * Company-wide employee lookup and organizational structure
 *
 * Features:
 * - Employee profiles with photos
 * - Org chart visualization
 * - Skills matrix and expertise
 * - Team/department management
 * - Birthday and anniversary alerts
 * - Quick search and filters
 * - Emergency contact info
 * - Export org chart to PDF
 */

const CONFIG = {
  COMPANY_NAME: 'BlackRoad OS, Inc.',

  DEPARTMENTS: [
    'Engineering',
    'Product',
    'Design',
    'Sales',
    'Marketing',
    'Customer Success',
    'HR',
    'Finance',
    'Legal',
    'Operations',
    'Executive'
  ],

  EMPLOYMENT_TYPES: ['Full-time', 'Part-time', 'Contractor', 'Intern', 'Consultant'],

  LOCATIONS: ['San Francisco', 'New York', 'Austin', 'Remote - US', 'Remote - International'],

  SKILLS_CATEGORIES: [
    'Programming Languages',
    'Frameworks',
    'Cloud/DevOps',
    'Design',
    'Data/Analytics',
    'Management',
    'Communication',
    'Domain Expertise'
  ],

  SKILL_LEVELS: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],

  ANNIVERSARY_ALERT_DAYS: 14,
  BIRTHDAY_ALERT_DAYS: 7
};

/**
 * Creates custom menu on spreadsheet open
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('👥 Directory')
    .addItem('➕ Add Employee', 'showAddEmployeeDialog')
    .addItem('✏️ Edit Employee', 'showEditEmployeeDialog')
    .addItem('🔍 Search Directory', 'showSearchDialog')
    .addSeparator()
    .addSubMenu(ui.createMenu('📊 Org Chart')
      .addItem('View Org Chart', 'showOrgChart')
      .addItem('View Department Chart', 'showDepartmentChart')
      .addItem('Export Org Chart', 'exportOrgChart'))
    .addSeparator()
    .addSubMenu(ui.createMenu('👨‍👩‍👧‍👦 Teams')
      .addItem('View Teams', 'showTeamsView')
      .addItem('Team Directory', 'showTeamDirectory')
      .addItem('Direct Reports', 'showDirectReports'))
    .addSeparator()
    .addSubMenu(ui.createMenu('💡 Skills')
      .addItem('Skills Matrix', 'showSkillsMatrix')
      .addItem('Find by Skill', 'showFindBySkill')
      .addItem('Skills Gap Analysis', 'showSkillsGap'))
    .addSeparator()
    .addSubMenu(ui.createMenu('📅 Dates')
      .addItem('Upcoming Birthdays', 'showUpcomingBirthdays')
      .addItem('Work Anniversaries', 'showWorkAnniversaries')
      .addItem('New Hires', 'showNewHires'))
    .addSeparator()
    .addSubMenu(ui.createMenu('📋 Reports')
      .addItem('Headcount by Department', 'showHeadcountReport')
      .addItem('Headcount by Location', 'showLocationReport')
      .addItem('Tenure Distribution', 'showTenureReport')
      .addItem('Export Directory', 'exportDirectory'))
    .addSeparator()
    .addItem('⚙️ Settings', 'showSettings')
    .addToUi();
}

/**
 * Shows dialog to add new employee
 */
function showAddEmployeeDialog() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 12px; }
      label { display: block; margin-bottom: 4px; font-weight: bold; font-size: 13px; }
      input, select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      .row { display: flex; gap: 10px; }
      .row .form-group { flex: 1; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; }
      button:hover { background: #3367d6; }
      .section { background: #f5f5f5; padding: 10px; border-radius: 8px; margin: 15px 0; }
      .section h3 { margin: 0 0 10px; font-size: 14px; }
      h2 { margin-top: 0; }
    </style>

    <h2>➕ Add Employee</h2>

    <div class="section">
      <h3>Basic Information</h3>
      <div class="row">
        <div class="form-group">
          <label>First Name *</label>
          <input type="text" id="firstName" placeholder="First name">
        </div>
        <div class="form-group">
          <label>Last Name *</label>
          <input type="text" id="lastName" placeholder="Last name">
        </div>
      </div>

      <div class="row">
        <div class="form-group">
          <label>Email *</label>
          <input type="email" id="email" placeholder="email@company.com">
        </div>
        <div class="form-group">
          <label>Phone</label>
          <input type="tel" id="phone" placeholder="(555) 123-4567">
        </div>
      </div>
    </div>

    <div class="section">
      <h3>Position</h3>
      <div class="row">
        <div class="form-group">
          <label>Job Title *</label>
          <input type="text" id="jobTitle" placeholder="Software Engineer">
        </div>
        <div class="form-group">
          <label>Department *</label>
          <select id="department">
            ${CONFIG.DEPARTMENTS.map(d => '<option>' + d + '</option>').join('')}
          </select>
        </div>
      </div>

      <div class="row">
        <div class="form-group">
          <label>Manager</label>
          <input type="text" id="manager" placeholder="Manager's name or email">
        </div>
        <div class="form-group">
          <label>Employment Type</label>
          <select id="employmentType">
            ${CONFIG.EMPLOYMENT_TYPES.map(t => '<option>' + t + '</option>').join('')}
          </select>
        </div>
      </div>
    </div>

    <div class="section">
      <h3>Details</h3>
      <div class="row">
        <div class="form-group">
          <label>Location</label>
          <select id="location">
            ${CONFIG.LOCATIONS.map(l => '<option>' + l + '</option>').join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Start Date</label>
          <input type="date" id="startDate">
        </div>
      </div>

      <div class="row">
        <div class="form-group">
          <label>Birthday</label>
          <input type="date" id="birthday">
        </div>
        <div class="form-group">
          <label>Slack/Teams Handle</label>
          <input type="text" id="slackHandle" placeholder="@username">
        </div>
      </div>
    </div>

    <button onclick="addEmployee()">Add Employee</button>
    <button style="background:#757575" onclick="google.script.host.close()">Cancel</button>

    <script>
      function addEmployee() {
        const data = {
          firstName: document.getElementById('firstName').value,
          lastName: document.getElementById('lastName').value,
          email: document.getElementById('email').value,
          phone: document.getElementById('phone').value,
          jobTitle: document.getElementById('jobTitle').value,
          department: document.getElementById('department').value,
          manager: document.getElementById('manager').value,
          employmentType: document.getElementById('employmentType').value,
          location: document.getElementById('location').value,
          startDate: document.getElementById('startDate').value,
          birthday: document.getElementById('birthday').value,
          slackHandle: document.getElementById('slackHandle').value
        };

        if (!data.firstName || !data.lastName || !data.email || !data.jobTitle) {
          alert('Please fill in required fields');
          return;
        }

        google.script.run
          .withSuccessHandler(() => {
            alert('Employee added!');
            google.script.host.close();
          })
          .withFailureHandler(err => alert('Error: ' + err))
          .addEmployee(data);
      }
    </script>
  `)
  .setWidth(500)
  .setHeight(600);

  SpreadsheetApp.getUi().showModalDialog(html, 'Add Employee');
}

/**
 * Adds an employee to the directory
 */
function addEmployee(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Directory');

  if (!sheet) {
    sheet = ss.insertSheet('Directory');
    sheet.appendRow(['Employee ID', 'First Name', 'Last Name', 'Full Name', 'Email', 'Phone',
                     'Job Title', 'Department', 'Manager', 'Employment Type', 'Location',
                     'Start Date', 'Birthday', 'Slack Handle', 'Status', 'Photo URL',
                     'Emergency Contact', 'Emergency Phone', 'Notes']);
    sheet.getRange(1, 1, 1, 19).setFontWeight('bold').setBackground('#E8EAF6');
  }

  // Generate employee ID
  const lastRow = sheet.getLastRow();
  const empId = 'EMP-' + String(lastRow > 1 ? lastRow : 1).padStart(4, '0');
  const fullName = data.firstName + ' ' + data.lastName;

  sheet.appendRow([
    empId,
    data.firstName,
    data.lastName,
    fullName,
    data.email,
    data.phone,
    data.jobTitle,
    data.department,
    data.manager,
    data.employmentType,
    data.location,
    data.startDate ? new Date(data.startDate) : '',
    data.birthday ? new Date(data.birthday) : '',
    data.slackHandle,
    'Active',
    '', // Photo URL
    '', // Emergency contact
    '', // Emergency phone
    ''  // Notes
  ]);

  return empId;
}

/**
 * Shows edit employee dialog
 */
function showEditEmployeeDialog() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Directory');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No directory found.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const activeEmployees = data.slice(1).filter(row => row[14] === 'Active');

  const empOptions = activeEmployees.map(row =>
    `<option value="${row[0]}">${row[3]} (${row[0]})</option>`
  ).join('');

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 15px; }
      label { display: block; margin-bottom: 5px; font-weight: bold; }
      select, input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; }
      .danger { background: #F44336; }
    </style>

    <h2>✏️ Edit Employee</h2>

    <div class="form-group">
      <label>Select Employee</label>
      <select id="empId">${empOptions}</select>
    </div>

    <div class="form-group">
      <label>Update Status</label>
      <select id="status">
        <option>Active</option>
        <option>On Leave</option>
        <option>Terminated</option>
      </select>
    </div>

    <div class="form-group">
      <label>Update Manager</label>
      <input type="text" id="manager" placeholder="New manager name/email">
    </div>

    <div class="form-group">
      <label>Update Job Title</label>
      <input type="text" id="jobTitle" placeholder="New job title">
    </div>

    <button onclick="updateEmployee()">Update</button>
    <button class="danger" onclick="terminateEmployee()">Terminate</button>
    <button style="background:#757575" onclick="google.script.host.close()">Cancel</button>

    <script>
      function updateEmployee() {
        const data = {
          empId: document.getElementById('empId').value,
          status: document.getElementById('status').value,
          manager: document.getElementById('manager').value,
          jobTitle: document.getElementById('jobTitle').value
        };

        google.script.run
          .withSuccessHandler(() => {
            alert('Employee updated!');
            google.script.host.close();
          })
          .withFailureHandler(err => alert('Error: ' + err))
          .updateEmployee(data);
      }

      function terminateEmployee() {
        if (!confirm('Are you sure you want to mark this employee as terminated?')) return;
        document.getElementById('status').value = 'Terminated';
        updateEmployee();
      }
    </script>
  `)
  .setWidth(400)
  .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(html, 'Edit Employee');
}

/**
 * Updates an employee
 */
function updateEmployee(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Directory');
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.empId) {
      if (data.status) sheet.getRange(i + 1, 15).setValue(data.status);
      if (data.manager) sheet.getRange(i + 1, 9).setValue(data.manager);
      if (data.jobTitle) sheet.getRange(i + 1, 7).setValue(data.jobTitle);

      // Color code status
      if (data.status === 'Terminated') {
        sheet.getRange(i + 1, 1, 1, 19).setBackground('#FFCDD2');
      } else if (data.status === 'On Leave') {
        sheet.getRange(i + 1, 1, 1, 19).setBackground('#FFF9C4');
      }
      break;
    }
  }
}

/**
 * Shows search dialog
 */
function showSearchDialog() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 15px; }
      label { display: block; margin-bottom: 5px; font-weight: bold; }
      input, select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
      #results { margin-top: 15px; }
      .result { background: #f5f5f5; padding: 10px; margin: 5px 0; border-radius: 4px; border-left: 3px solid #1976D2; }
    </style>

    <h2>🔍 Search Directory</h2>

    <div class="form-group">
      <label>Search by Name, Email, or Title</label>
      <input type="text" id="query" placeholder="Type to search..." oninput="search()">
    </div>

    <div class="form-group">
      <label>Filter by Department</label>
      <select id="department" onchange="search()">
        <option value="">All Departments</option>
        ${CONFIG.DEPARTMENTS.map(d => '<option>' + d + '</option>').join('')}
      </select>
    </div>

    <div id="results"></div>

    <script>
      function search() {
        const query = document.getElementById('query').value.toLowerCase();
        const department = document.getElementById('department').value;

        google.script.run
          .withSuccessHandler(results => {
            const container = document.getElementById('results');
            if (results.length === 0) {
              container.innerHTML = '<p>No results found</p>';
              return;
            }
            container.innerHTML = results.map(r =>
              '<div class="result"><strong>' + r.name + '</strong><br>' +
              '<small>' + r.title + ' • ' + r.department + '</small><br>' +
              '<small>' + r.email + '</small></div>'
            ).join('');
          })
          .searchDirectory(query, department);
      }
    </script>
  `)
  .setWidth(400)
  .setHeight(450);

  SpreadsheetApp.getUi().showModalDialog(html, 'Search Directory');
}

/**
 * Searches the directory
 */
function searchDirectory(query, department) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Directory');

  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  const results = [];

  data.slice(1).forEach(row => {
    if (row[14] !== 'Active') return;

    const matchesQuery = !query ||
      row[3].toLowerCase().includes(query) ||
      row[4].toLowerCase().includes(query) ||
      row[6].toLowerCase().includes(query);

    const matchesDept = !department || row[7] === department;

    if (matchesQuery && matchesDept) {
      results.push({
        id: row[0],
        name: row[3],
        email: row[4],
        title: row[6],
        department: row[7]
      });
    }
  });

  return results.slice(0, 20);
}

/**
 * Shows org chart
 */
function showOrgChart() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Directory');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No directory found.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const employees = data.slice(1).filter(row => row[14] === 'Active');

  // Build hierarchy
  const byManager = {};
  const topLevel = [];

  employees.forEach(emp => {
    const manager = emp[8];
    if (!manager) {
      topLevel.push(emp);
    } else {
      if (!byManager[manager]) byManager[manager] = [];
      byManager[manager].push(emp);
    }
  });

  // Generate org chart HTML
  function renderEmployee(emp, level = 0) {
    const indent = level * 30;
    const reports = byManager[emp[3]] || byManager[emp[4]] || [];
    let html = `
      <div style="margin-left:${indent}px;padding:10px;margin:5px 0;background:${level === 0 ? '#E3F2FD' : '#f5f5f5'};border-radius:4px;border-left:3px solid ${level === 0 ? '#1976D2' : '#9E9E9E'}">
        <strong>${emp[3]}</strong><br>
        <small>${emp[6]} • ${emp[7]}</small>
      </div>
    `;
    reports.forEach(report => {
      html += renderEmployee(report, level + 1);
    });
    return html;
  }

  let chartHtml = '<style>body{font-family:Arial,sans-serif;padding:15px;}</style>';
  chartHtml += '<h2>Org Chart</h2>';
  chartHtml += '<p><em>' + employees.length + ' employees</em></p>';

  topLevel.forEach(emp => {
    chartHtml += renderEmployee(emp);
  });

  const output = HtmlService.createHtmlOutput(chartHtml)
    .setWidth(600)
    .setHeight(500);

  SpreadsheetApp.getUi().showModalDialog(output, 'Org Chart');
}

/**
 * Shows department chart
 */
function showDepartmentChart() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Directory');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No directory found.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const byDept = {};

  data.slice(1).forEach(row => {
    if (row[14] === 'Active') {
      const dept = row[7] || 'Unknown';
      if (!byDept[dept]) byDept[dept] = [];
      byDept[dept].push({
        name: row[3],
        title: row[6]
      });
    }
  });

  let html = '<style>body{font-family:Arial,sans-serif;padding:15px;} .dept{margin:15px 0;} .dept h3{background:#1976D2;color:white;padding:10px;margin:0;border-radius:4px 4px 0 0;} .employees{border:1px solid #ddd;border-top:none;padding:10px;} .emp{padding:5px;border-bottom:1px solid #eee;}</style>';

  html += '<h2>Department Chart</h2>';

  Object.entries(byDept).sort((a, b) => b[1].length - a[1].length).forEach(([dept, emps]) => {
    html += `
      <div class="dept">
        <h3>${dept} (${emps.length})</h3>
        <div class="employees">
          ${emps.map(e => '<div class="emp"><strong>' + e.name + '</strong> - ' + e.title + '</div>').join('')}
        </div>
      </div>
    `;
  });

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(500)
    .setHeight(500);

  SpreadsheetApp.getUi().showModalDialog(output, 'Department Chart');
}

/**
 * Exports org chart
 */
function exportOrgChart() {
  SpreadsheetApp.getUi().alert(
    'Export Org Chart\n\n' +
    'Use File > Download > PDF to export the directory.\n\n' +
    'For a visual org chart, copy data to Google Slides or use a tool like Lucidchart.'
  );
}

/**
 * Shows teams view
 */
function showTeamsView() {
  showDepartmentChart();
}

/**
 * Shows team directory
 */
function showTeamDirectory() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    'Team Directory',
    'Enter department name:',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const dept = response.getResponseText();
  const results = searchDirectory('', dept);

  if (results.length === 0) {
    ui.alert('No employees found in ' + dept);
    return;
  }

  ui.alert(
    dept + ' Team (' + results.length + ' members)\n\n' +
    results.map(r => r.name + ' - ' + r.title).join('\n')
  );
}

/**
 * Shows direct reports
 */
function showDirectReports() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    'Direct Reports',
    'Enter manager name or email:',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const manager = response.getResponseText().toLowerCase();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Directory');

  if (!sheet) {
    ui.alert('No directory found.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const reports = data.slice(1).filter(row =>
    row[14] === 'Active' &&
    row[8] &&
    row[8].toLowerCase().includes(manager)
  );

  if (reports.length === 0) {
    ui.alert('No direct reports found for ' + manager);
    return;
  }

  ui.alert(
    'Direct Reports (' + reports.length + ')\n\n' +
    reports.map(r => r[3] + ' - ' + r[6]).join('\n')
  );
}

/**
 * Shows skills matrix
 */
function showSkillsMatrix() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let skillsSheet = ss.getSheetByName('Skills');

  if (!skillsSheet) {
    SpreadsheetApp.getUi().alert(
      'Skills Matrix\n\n' +
      'To use the skills matrix:\n' +
      '1. Create a "Skills" sheet\n' +
      '2. Add columns: Employee ID, Employee Name, Skill, Category, Level\n' +
      '3. Add employee skills'
    );
    return;
  }

  const data = skillsSheet.getDataRange().getValues();

  // Group by skill
  const bySkill = {};
  data.slice(1).forEach(row => {
    const skill = row[2];
    const level = row[4];
    if (!bySkill[skill]) bySkill[skill] = { Beginner: 0, Intermediate: 0, Advanced: 0, Expert: 0 };
    if (bySkill[skill][level] !== undefined) bySkill[skill][level]++;
  });

  let html = '<style>body{font-family:Arial,sans-serif;padding:15px;} table{width:100%;border-collapse:collapse;} th,td{border:1px solid #ddd;padding:8px;text-align:center;} th{background:#E8EAF6;}</style>';

  html += '<h2>Skills Matrix</h2>';
  html += '<table><tr><th>Skill</th><th>Beginner</th><th>Intermediate</th><th>Advanced</th><th>Expert</th><th>Total</th></tr>';

  Object.entries(bySkill).forEach(([skill, levels]) => {
    const total = Object.values(levels).reduce((a, b) => a + b, 0);
    html += `<tr>
      <td>${skill}</td>
      <td>${levels.Beginner || 0}</td>
      <td>${levels.Intermediate || 0}</td>
      <td>${levels.Advanced || 0}</td>
      <td>${levels.Expert || 0}</td>
      <td><strong>${total}</strong></td>
    </tr>`;
  });

  html += '</table>';

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(550)
    .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(output, 'Skills Matrix');
}

/**
 * Shows find by skill
 */
function showFindBySkill() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    'Find by Skill',
    'Enter skill name (e.g., JavaScript, Python, Leadership):',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const skill = response.getResponseText().toLowerCase();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const skillsSheet = ss.getSheetByName('Skills');

  if (!skillsSheet) {
    ui.alert('No skills data found. Create a Skills sheet first.');
    return;
  }

  const data = skillsSheet.getDataRange().getValues();
  const matches = data.slice(1).filter(row =>
    row[2].toLowerCase().includes(skill)
  );

  if (matches.length === 0) {
    ui.alert('No employees found with skill: ' + skill);
    return;
  }

  ui.alert(
    'Employees with ' + skill + ' (' + matches.length + ')\n\n' +
    matches.map(r => r[1] + ' - ' + r[4]).join('\n')
  );
}

/**
 * Shows skills gap
 */
function showSkillsGap() {
  SpreadsheetApp.getUi().alert(
    'Skills Gap Analysis\n\n' +
    'To analyze skills gaps:\n' +
    '1. Define required skills for each role\n' +
    '2. Compare against current employee skills\n' +
    '3. Identify training needs\n\n' +
    'Use the Skills Matrix to view current skill distribution.'
  );
}

/**
 * Shows upcoming birthdays
 */
function showUpcomingBirthdays() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Directory');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No directory found.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const today = new Date();
  const upcoming = [];

  data.slice(1).forEach(row => {
    if (row[14] !== 'Active' || !row[12]) return;

    const birthday = new Date(row[12]);
    const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());

    if (thisYearBirthday < today) {
      thisYearBirthday.setFullYear(today.getFullYear() + 1);
    }

    const daysUntil = Math.ceil((thisYearBirthday - today) / (1000 * 60 * 60 * 24));

    if (daysUntil <= CONFIG.BIRTHDAY_ALERT_DAYS) {
      upcoming.push({
        name: row[3],
        date: thisYearBirthday,
        daysUntil: daysUntil
      });
    }
  });

  upcoming.sort((a, b) => a.daysUntil - b.daysUntil);

  if (upcoming.length === 0) {
    SpreadsheetApp.getUi().alert('No birthdays in the next ' + CONFIG.BIRTHDAY_ALERT_DAYS + ' days!');
    return;
  }

  let html = '<style>body{font-family:Arial,sans-serif;padding:15px;} .birthday{background:#FFF3E0;padding:15px;margin:10px 0;border-radius:8px;display:flex;justify-content:space-between;align-items:center;}</style>';

  html += '<h2>🎂 Upcoming Birthdays</h2>';

  upcoming.forEach(b => {
    html += `
      <div class="birthday">
        <div>
          <strong>${b.name}</strong><br>
          <small>${b.date.toDateString()}</small>
        </div>
        <div style="font-size:24px">${b.daysUntil === 0 ? '🎉 TODAY!' : b.daysUntil + ' days'}</div>
      </div>
    `;
  });

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(400)
    .setHeight(350);

  SpreadsheetApp.getUi().showModalDialog(output, 'Upcoming Birthdays');
}

/**
 * Shows work anniversaries
 */
function showWorkAnniversaries() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Directory');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No directory found.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const today = new Date();
  const upcoming = [];

  data.slice(1).forEach(row => {
    if (row[14] !== 'Active' || !row[11]) return;

    const startDate = new Date(row[11]);
    const thisYearAnniv = new Date(today.getFullYear(), startDate.getMonth(), startDate.getDate());

    if (thisYearAnniv < today) {
      thisYearAnniv.setFullYear(today.getFullYear() + 1);
    }

    const daysUntil = Math.ceil((thisYearAnniv - today) / (1000 * 60 * 60 * 24));
    const years = thisYearAnniv.getFullYear() - startDate.getFullYear();

    if (daysUntil <= CONFIG.ANNIVERSARY_ALERT_DAYS) {
      upcoming.push({
        name: row[3],
        date: thisYearAnniv,
        years: years,
        daysUntil: daysUntil
      });
    }
  });

  upcoming.sort((a, b) => a.daysUntil - b.daysUntil);

  if (upcoming.length === 0) {
    SpreadsheetApp.getUi().alert('No anniversaries in the next ' + CONFIG.ANNIVERSARY_ALERT_DAYS + ' days!');
    return;
  }

  let html = '<style>body{font-family:Arial,sans-serif;padding:15px;} .anniv{background:#E8F5E9;padding:15px;margin:10px 0;border-radius:8px;display:flex;justify-content:space-between;align-items:center;}</style>';

  html += '<h2>🎉 Work Anniversaries</h2>';

  upcoming.forEach(a => {
    html += `
      <div class="anniv">
        <div>
          <strong>${a.name}</strong><br>
          <small>${a.years} year${a.years > 1 ? 's' : ''}</small>
        </div>
        <div style="font-size:24px">${a.daysUntil === 0 ? '🎊 TODAY!' : a.daysUntil + ' days'}</div>
      </div>
    `;
  });

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(400)
    .setHeight(350);

  SpreadsheetApp.getUi().showModalDialog(output, 'Work Anniversaries');
}

/**
 * Shows new hires
 */
function showNewHires() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Directory');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No directory found.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const newHires = data.slice(1).filter(row => {
    if (row[14] !== 'Active' || !row[11]) return false;
    return new Date(row[11]) >= thirtyDaysAgo;
  });

  if (newHires.length === 0) {
    SpreadsheetApp.getUi().alert('No new hires in the last 30 days.');
    return;
  }

  let html = '<style>body{font-family:Arial,sans-serif;padding:15px;} .hire{background:#E3F2FD;padding:15px;margin:10px 0;border-radius:8px;}</style>';

  html += '<h2>👋 New Hires (Last 30 Days)</h2>';

  newHires.forEach(row => {
    html += `
      <div class="hire">
        <strong>${row[3]}</strong><br>
        <small>${row[6]} • ${row[7]}</small><br>
        <small>Started: ${new Date(row[11]).toDateString()}</small>
      </div>
    `;
  });

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(400)
    .setHeight(350);

  SpreadsheetApp.getUi().showModalDialog(output, 'New Hires');
}

/**
 * Shows headcount report
 */
function showHeadcountReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Directory');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No directory found.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const byDept = {};
  let total = 0;

  data.slice(1).forEach(row => {
    if (row[14] === 'Active') {
      const dept = row[7] || 'Unknown';
      byDept[dept] = (byDept[dept] || 0) + 1;
      total++;
    }
  });

  let html = '<style>body{font-family:Arial,sans-serif;padding:15px;} .bar-container{margin:10px 0;} .bar{background:#4CAF50;height:25px;display:flex;align-items:center;padding-left:10px;color:white;border-radius:4px;min-width:30px;}</style>';

  html += '<h2>Headcount by Department</h2>';
  html += '<p><strong>Total: ' + total + '</strong></p>';

  const maxCount = Math.max(...Object.values(byDept));

  Object.entries(byDept).sort((a, b) => b[1] - a[1]).forEach(([dept, count]) => {
    const width = (count / maxCount * 100);
    const pct = (count / total * 100).toFixed(1);
    html += `
      <div class="bar-container">
        <div style="display:flex;justify-content:space-between">
          <span>${dept}</span>
          <span>${count} (${pct}%)</span>
        </div>
        <div class="bar" style="width:${width}%">${count}</div>
      </div>
    `;
  });

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(450)
    .setHeight(450);

  SpreadsheetApp.getUi().showModalDialog(output, 'Headcount Report');
}

/**
 * Shows location report
 */
function showLocationReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Directory');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No directory found.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const byLocation = {};
  let total = 0;

  data.slice(1).forEach(row => {
    if (row[14] === 'Active') {
      const location = row[10] || 'Unknown';
      byLocation[location] = (byLocation[location] || 0) + 1;
      total++;
    }
  });

  let html = '<style>body{font-family:Arial,sans-serif;padding:15px;} .location{display:flex;justify-content:space-between;padding:10px;border-bottom:1px solid #eee;}</style>';

  html += '<h2>Headcount by Location</h2>';
  html += '<p><strong>Total: ' + total + '</strong></p>';

  Object.entries(byLocation).sort((a, b) => b[1] - a[1]).forEach(([location, count]) => {
    const pct = (count / total * 100).toFixed(1);
    html += `<div class="location"><span>📍 ${location}</span><span><strong>${count}</strong> (${pct}%)</span></div>`;
  });

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(400)
    .setHeight(350);

  SpreadsheetApp.getUi().showModalDialog(output, 'Location Report');
}

/**
 * Shows tenure report
 */
function showTenureReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Directory');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No directory found.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const today = new Date();
  const tenureBuckets = {
    '< 1 year': 0,
    '1-2 years': 0,
    '2-5 years': 0,
    '5-10 years': 0,
    '10+ years': 0
  };

  data.slice(1).forEach(row => {
    if (row[14] !== 'Active' || !row[11]) return;

    const startDate = new Date(row[11]);
    const years = (today - startDate) / (1000 * 60 * 60 * 24 * 365);

    if (years < 1) tenureBuckets['< 1 year']++;
    else if (years < 2) tenureBuckets['1-2 years']++;
    else if (years < 5) tenureBuckets['2-5 years']++;
    else if (years < 10) tenureBuckets['5-10 years']++;
    else tenureBuckets['10+ years']++;
  });

  let html = '<style>body{font-family:Arial,sans-serif;padding:15px;} .bucket{display:flex;justify-content:space-between;padding:15px;margin:5px 0;background:#f5f5f5;border-radius:4px;}</style>';

  html += '<h2>Tenure Distribution</h2>';

  Object.entries(tenureBuckets).forEach(([bucket, count]) => {
    html += `<div class="bucket"><span>${bucket}</span><strong>${count}</strong></div>`;
  });

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(350)
    .setHeight(300);

  SpreadsheetApp.getUi().showModalDialog(output, 'Tenure Report');
}

/**
 * Exports directory
 */
function exportDirectory() {
  SpreadsheetApp.getUi().alert(
    'Export Directory\n\n' +
    'Use File > Download to export:\n' +
    '- Microsoft Excel (.xlsx)\n' +
    '- PDF Document\n' +
    '- CSV (comma-separated values)'
  );
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
      <label>Departments</label>
      <input type="text" value="${CONFIG.DEPARTMENTS.length} departments" disabled>
    </div>

    <div class="setting">
      <label>Locations</label>
      <input type="text" value="${CONFIG.LOCATIONS.join(', ')}" disabled>
    </div>

    <div class="setting">
      <label>Birthday Alert (days ahead)</label>
      <input type="number" value="${CONFIG.BIRTHDAY_ALERT_DAYS}" disabled>
    </div>

    <div class="setting">
      <label>Anniversary Alert (days ahead)</label>
      <input type="number" value="${CONFIG.ANNIVERSARY_ALERT_DAYS}" disabled>
    </div>

    <p><em>Edit CONFIG in Extensions > Apps Script to customize.</em></p>

    <button onclick="google.script.host.close()">Close</button>
  `)
  .setWidth(350)
  .setHeight(350);

  SpreadsheetApp.getUi().showModalDialog(html, 'Settings');
}
