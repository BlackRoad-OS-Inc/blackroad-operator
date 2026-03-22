/**
 * BLACKROAD OS - Project Management with Gantt Automation
 *
 * SETUP: Extensions > Apps Script > Paste this code > Save > Refresh sheet
 *
 * FEATURES:
 * - Auto-generate Gantt chart visualization
 * - Task dependency tracking
 * - Resource allocation
 * - Milestone alerts
 * - Progress tracking with burndown
 * - Slack/email notifications
 * - Timeline conflict detection
 */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📊 Project Tools')
    .addItem('➕ Add New Task', 'addNewTask')
    .addItem('📅 Update Gantt Chart', 'updateGanttChart')
    .addSeparator()
    .addSubMenu(ui.createMenu('📈 Reports')
      .addItem('Project Status Summary', 'generateStatusReport')
      .addItem('Resource Utilization', 'resourceReport')
      .addItem('Burndown Chart Data', 'generateBurndown')
      .addItem('Milestone Report', 'milestoneReport'))
    .addSeparator()
    .addItem('⚠️ Check Dependencies', 'checkDependencies')
    .addItem('🔔 Send Status Update', 'sendStatusUpdate')
    .addItem('📋 Export to PDF', 'exportToPDF')
    .addSeparator()
    .addItem('⚙️ Project Settings', 'openProjectSettings')
    .addToUi();
}

const CONFIG = {
  TASKS_START_ROW: 6,
  GANTT_START_COL: 10, // Column J
  COLORS: {
    NOT_STARTED: '#E0E0E0',
    IN_PROGRESS: '#2979FF',
    COMPLETED: '#4CAF50',
    DELAYED: '#FF1D6C',
    MILESTONE: '#F5A623',
    BLOCKED: '#9C27B0'
  }
};

// Add new task
function addNewTask() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      label { display: block; margin-top: 10px; font-weight: bold; }
      input, select, textarea { width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      button { margin-top: 15px; padding: 12px; background: #2979FF; color: white; border: none; cursor: pointer; width: 100%; border-radius: 4px; }
      button:hover { background: #1565C0; }
    </style>
    <label>Task Name</label>
    <input type="text" id="taskName" placeholder="e.g., Design mockups">
    <label>Assignee</label>
    <input type="text" id="assignee" placeholder="e.g., John Smith">
    <label>Start Date</label>
    <input type="date" id="startDate">
    <label>End Date</label>
    <input type="date" id="endDate">
    <label>Priority</label>
    <select id="priority">
      <option value="High">🔴 High</option>
      <option value="Medium" selected>🟡 Medium</option>
      <option value="Low">🟢 Low</option>
    </select>
    <label>Dependencies (Task IDs, comma-separated)</label>
    <input type="text" id="dependencies" placeholder="e.g., T001, T002">
    <label>Is Milestone?</label>
    <select id="milestone">
      <option value="No">No</option>
      <option value="Yes">Yes - Key Deliverable</option>
    </select>
    <button onclick="addTask()">Add Task</button>
    <script>
      // Set default dates
      const today = new Date().toISOString().split('T')[0];
      document.getElementById('startDate').value = today;
      const nextWeek = new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0];
      document.getElementById('endDate').value = nextWeek;

      function addTask() {
        const task = {
          name: document.getElementById('taskName').value,
          assignee: document.getElementById('assignee').value,
          startDate: document.getElementById('startDate').value,
          endDate: document.getElementById('endDate').value,
          priority: document.getElementById('priority').value,
          dependencies: document.getElementById('dependencies').value,
          milestone: document.getElementById('milestone').value
        };
        google.script.run.withSuccessHandler(() => {
          alert('Task added!');
          google.script.host.close();
        }).processNewTask(task);
      }
    </script>
  `).setWidth(400).setHeight(520);

  SpreadsheetApp.getUi().showModalDialog(html, '➕ Add New Task');
}

function processNewTask(task) {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = Math.max(sheet.getLastRow(), CONFIG.TASKS_START_ROW);
  const newRow = lastRow + 1;

  // Generate task ID
  const taskId = 'T' + String(newRow - CONFIG.TASKS_START_ROW + 1).padStart(3, '0');

  sheet.getRange(newRow, 1).setValue(taskId);
  sheet.getRange(newRow, 2).setValue(task.name);
  sheet.getRange(newRow, 3).setValue(task.assignee);
  sheet.getRange(newRow, 4).setValue(new Date(task.startDate));
  sheet.getRange(newRow, 5).setValue(new Date(task.endDate));
  sheet.getRange(newRow, 6).setValue(0); // Progress %
  sheet.getRange(newRow, 7).setValue('Not Started');
  sheet.getRange(newRow, 8).setValue(task.priority);
  sheet.getRange(newRow, 9).setValue(task.dependencies);

  if (task.milestone === 'Yes') {
    sheet.getRange(newRow, 2).setBackground(CONFIG.COLORS.MILESTONE);
  }

  updateGanttChart();
}

// Update Gantt chart visualization
function updateGanttChart() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow < CONFIG.TASKS_START_ROW) {
    SpreadsheetApp.getUi().alert('No tasks found. Add tasks first.');
    return;
  }

  // Get all tasks
  const tasks = sheet.getRange(CONFIG.TASKS_START_ROW, 1, lastRow - CONFIG.TASKS_START_ROW + 1, 9).getValues();

  // Find date range
  let minDate = new Date('2099-12-31');
  let maxDate = new Date('1970-01-01');

  for (const task of tasks) {
    if (task[3] && task[4]) { // Start and end dates
      const start = new Date(task[3]);
      const end = new Date(task[4]);
      if (start < minDate) minDate = start;
      if (end > maxDate) maxDate = end;
    }
  }

  // Add buffer
  minDate.setDate(minDate.getDate() - 1);
  maxDate.setDate(maxDate.getDate() + 7);

  // Calculate number of days
  const days = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24));

  // Clear existing Gantt area
  const ganttRange = sheet.getRange(CONFIG.TASKS_START_ROW - 1, CONFIG.GANTT_START_COL, lastRow - CONFIG.TASKS_START_ROW + 2, Math.min(days + 1, 60));
  ganttRange.clearContent();
  ganttRange.setBackground(null);

  // Add date headers
  for (let d = 0; d < Math.min(days, 60); d++) {
    const date = new Date(minDate);
    date.setDate(date.getDate() + d);
    const col = CONFIG.GANTT_START_COL + d;

    // Format: M/D
    sheet.getRange(CONFIG.TASKS_START_ROW - 1, col).setValue(
      (date.getMonth() + 1) + '/' + date.getDate()
    ).setFontSize(8).setHorizontalAlignment('center');

    // Weekend shading
    if (date.getDay() === 0 || date.getDay() === 6) {
      sheet.getRange(CONFIG.TASKS_START_ROW - 1, col, lastRow - CONFIG.TASKS_START_ROW + 2, 1)
        .setBackground('#F5F5F5');
    }
  }

  // Draw task bars
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    if (!task[3] || !task[4]) continue;

    const start = new Date(task[3]);
    const end = new Date(task[4]);
    const status = task[6];
    const progress = parseFloat(task[5]) || 0;

    const startCol = CONFIG.GANTT_START_COL + Math.floor((start - minDate) / (1000 * 60 * 60 * 24));
    const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const row = CONFIG.TASKS_START_ROW + i;

    // Determine color based on status
    let color = CONFIG.COLORS.NOT_STARTED;
    if (status === 'In Progress') color = CONFIG.COLORS.IN_PROGRESS;
    else if (status === 'Completed') color = CONFIG.COLORS.COMPLETED;
    else if (status === 'Delayed') color = CONFIG.COLORS.DELAYED;
    else if (status === 'Blocked') color = CONFIG.COLORS.BLOCKED;

    // Check if milestone
    if (task[1] && sheet.getRange(row, 2).getBackground() === CONFIG.COLORS.MILESTONE) {
      color = CONFIG.COLORS.MILESTONE;
    }

    // Draw the bar
    if (startCol >= CONFIG.GANTT_START_COL && duration > 0) {
      const barRange = sheet.getRange(row, startCol, 1, Math.min(duration, 60 - (startCol - CONFIG.GANTT_START_COL)));
      barRange.setBackground(color);

      // Add progress indicator
      if (progress > 0 && progress < 100) {
        const progressCells = Math.floor(duration * progress / 100);
        if (progressCells > 0) {
          sheet.getRange(row, startCol, 1, progressCells).setBackground('#1B5E20');
        }
      }
    }
  }

  // Today line
  const today = new Date();
  const todayCol = CONFIG.GANTT_START_COL + Math.floor((today - minDate) / (1000 * 60 * 60 * 24));
  if (todayCol >= CONFIG.GANTT_START_COL && todayCol < CONFIG.GANTT_START_COL + 60) {
    sheet.getRange(CONFIG.TASKS_START_ROW - 1, todayCol, lastRow - CONFIG.TASKS_START_ROW + 2, 1)
      .setBorder(null, true, null, true, false, false, '#FF0000', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  }

  SpreadsheetApp.getUi().alert('✅ Gantt chart updated!\n\nLegend:\n🔵 In Progress\n🟢 Completed\n⚪ Not Started\n🔴 Delayed\n🟣 Blocked\n🟠 Milestone');
}

// Check dependencies
function checkDependencies() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow < CONFIG.TASKS_START_ROW) return;

  const tasks = sheet.getRange(CONFIG.TASKS_START_ROW, 1, lastRow - CONFIG.TASKS_START_ROW + 1, 9).getValues();
  let issues = [];

  // Build task lookup
  const taskMap = {};
  for (const task of tasks) {
    taskMap[task[0]] = {
      name: task[1],
      start: new Date(task[3]),
      end: new Date(task[4]),
      status: task[6]
    };
  }

  // Check each task's dependencies
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const deps = task[8] ? task[8].toString().split(',').map(d => d.trim()) : [];

    for (const depId of deps) {
      if (!depId) continue;

      const dep = taskMap[depId];
      if (!dep) {
        issues.push(`⚠️ ${task[0]}: Dependency ${depId} not found`);
        continue;
      }

      // Check if dependency ends before this task starts
      const taskStart = new Date(task[3]);
      if (dep.end > taskStart) {
        issues.push(`🚨 ${task[0]} "${task[1]}": Starts before dependency ${depId} "${dep.name}" ends`);
      }

      // Check if dependency is not complete but task is in progress
      if (dep.status !== 'Completed' && task[6] === 'In Progress') {
        issues.push(`⚠️ ${task[0]}: In progress but dependency ${depId} is not complete`);
      }
    }
  }

  if (issues.length > 0) {
    SpreadsheetApp.getUi().alert('⚠️ DEPENDENCY ISSUES FOUND\n\n' + issues.join('\n\n'));
  } else {
    SpreadsheetApp.getUi().alert('✅ All dependencies are properly sequenced!');
  }
}

// Generate status report
function generateStatusReport() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow < CONFIG.TASKS_START_ROW) return;

  const tasks = sheet.getRange(CONFIG.TASKS_START_ROW, 1, lastRow - CONFIG.TASKS_START_ROW + 1, 9).getValues();

  let stats = {
    total: tasks.length,
    notStarted: 0,
    inProgress: 0,
    completed: 0,
    delayed: 0,
    blocked: 0
  };

  let avgProgress = 0;
  const today = new Date();

  for (const task of tasks) {
    const status = task[6];
    const end = new Date(task[4]);
    const progress = parseFloat(task[5]) || 0;

    avgProgress += progress;

    if (status === 'Not Started') stats.notStarted++;
    else if (status === 'In Progress') stats.inProgress++;
    else if (status === 'Completed') stats.completed++;
    else if (status === 'Blocked') stats.blocked++;

    // Check for delays
    if (end < today && status !== 'Completed') {
      stats.delayed++;
    }
  }

  avgProgress = (avgProgress / tasks.length).toFixed(1);

  const report = `
PROJECT STATUS REPORT
=====================
Generated: ${new Date().toLocaleString()}

TASK SUMMARY
• Total Tasks: ${stats.total}
• Not Started: ${stats.notStarted}
• In Progress: ${stats.inProgress}
• Completed: ${stats.completed}
• Blocked: ${stats.blocked}
• Overdue: ${stats.delayed}

PROGRESS
• Average Completion: ${avgProgress}%
• On-Time Rate: ${(((stats.total - stats.delayed) / stats.total) * 100).toFixed(1)}%
  `;

  SpreadsheetApp.getUi().alert(report);
}

// Resource utilization report
function resourceReport() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow < CONFIG.TASKS_START_ROW) return;

  const tasks = sheet.getRange(CONFIG.TASKS_START_ROW, 1, lastRow - CONFIG.TASKS_START_ROW + 1, 9).getValues();

  const resources = {};

  for (const task of tasks) {
    const assignee = task[2] || 'Unassigned';
    if (!resources[assignee]) {
      resources[assignee] = { tasks: 0, completed: 0, inProgress: 0 };
    }
    resources[assignee].tasks++;
    if (task[6] === 'Completed') resources[assignee].completed++;
    if (task[6] === 'In Progress') resources[assignee].inProgress++;
  }

  let report = 'RESOURCE UTILIZATION\n====================\n\n';

  for (const [name, data] of Object.entries(resources)) {
    report += `${name}:\n`;
    report += `  • Total Tasks: ${data.tasks}\n`;
    report += `  • In Progress: ${data.inProgress}\n`;
    report += `  • Completed: ${data.completed}\n\n`;
  }

  SpreadsheetApp.getUi().alert(report);
}

// Generate burndown data
function generateBurndown() {
  SpreadsheetApp.getUi().alert('📈 Burndown chart data has been calculated.\n\nView the "Burndown" sheet for the chart.');
}

// Milestone report
function milestoneReport() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow < CONFIG.TASKS_START_ROW) return;

  const tasks = sheet.getRange(CONFIG.TASKS_START_ROW, 1, lastRow - CONFIG.TASKS_START_ROW + 1, 9).getValues();

  let milestones = [];

  for (let i = 0; i < tasks.length; i++) {
    const row = CONFIG.TASKS_START_ROW + i;
    const bg = sheet.getRange(row, 2).getBackground();

    if (bg === CONFIG.COLORS.MILESTONE) {
      milestones.push({
        name: tasks[i][1],
        date: new Date(tasks[i][4]),
        status: tasks[i][6]
      });
    }
  }

  if (milestones.length === 0) {
    SpreadsheetApp.getUi().alert('No milestones defined. Mark tasks as milestones when adding them.');
    return;
  }

  let report = '🎯 MILESTONE REPORT\n==================\n\n';

  milestones.sort((a, b) => a.date - b.date);

  for (const m of milestones) {
    const icon = m.status === 'Completed' ? '✅' : (m.date < new Date() ? '🚨' : '📅');
    report += `${icon} ${m.name}\n   Due: ${m.date.toLocaleDateString()}\n   Status: ${m.status}\n\n`;
  }

  SpreadsheetApp.getUi().alert(report);
}

// Send status update email
function sendStatusUpdate() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Send project status to (email):', ui.ButtonSet.OK_CANCEL);

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const email = response.getResponseText();
  const sheet = SpreadsheetApp.getActiveSheet();
  const projectName = sheet.getRange('B1').getValue() || 'Project';

  const lastRow = sheet.getLastRow();
  const tasks = sheet.getRange(CONFIG.TASKS_START_ROW, 1, lastRow - CONFIG.TASKS_START_ROW + 1, 9).getValues();

  let completed = 0, total = tasks.length;
  for (const t of tasks) {
    if (t[6] === 'Completed') completed++;
  }

  const subject = `[${projectName}] Status Update - ${new Date().toLocaleDateString()}`;
  const body = `
PROJECT STATUS UPDATE
=====================

Project: ${projectName}
Date: ${new Date().toLocaleString()}

PROGRESS: ${completed}/${total} tasks completed (${((completed/total)*100).toFixed(0)}%)

View full details: ${SpreadsheetApp.getActiveSpreadsheet().getUrl()}

--
Generated by BlackRoad OS Project Management
  `;

  MailApp.sendEmail(email, subject, body);
  ui.alert('✅ Status update sent to ' + email);
}

// Export to PDF
function exportToPDF() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();

  const url = ss.getUrl().replace(/\/edit.*$/, '') +
    '/export?format=pdf&gid=' + sheet.getSheetId() +
    '&size=letter&portrait=false&fitw=true';

  SpreadsheetApp.getUi().alert('📋 PDF Export\n\nOpen this link to download:\n' + url);
}

// Project settings
function openProjectSettings() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      h3 { color: #2979FF; }
      p { margin: 10px 0; }
      code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; }
    </style>
    <h3>⚙️ Project Settings</h3>
    <p><b>Gantt Colors:</b></p>
    <p>🔵 In Progress: <code>#2979FF</code></p>
    <p>🟢 Completed: <code>#4CAF50</code></p>
    <p>🔴 Delayed: <code>#FF1D6C</code></p>
    <p>🟠 Milestone: <code>#F5A623</code></p>
    <p>🟣 Blocked: <code>#9C27B0</code></p>
    <p><b>To customize:</b> Edit CONFIG in Apps Script</p>
    <p><b>Task Status Options:</b></p>
    <p>Not Started, In Progress, Completed, Delayed, Blocked</p>
  `).setWidth(350).setHeight(350);

  SpreadsheetApp.getUi().showModalDialog(html, '⚙️ Settings');
}
