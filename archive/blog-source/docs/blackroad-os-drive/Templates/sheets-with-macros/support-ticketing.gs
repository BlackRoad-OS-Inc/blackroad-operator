/**
 * BLACKROAD OS - Customer Support Ticketing System
 *
 * SETUP: Extensions > Apps Script > Paste this code > Save > Refresh sheet
 *
 * FEATURES:
 * - Ticket creation and tracking
 * - Priority management (P1-P4)
 * - SLA monitoring
 * - Agent assignment
 * - Customer communication
 * - Ticket categorization
 * - Knowledge base linking
 * - Performance metrics
 */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🎫 Support')
    .addItem('➕ Create Ticket', 'createTicket')
    .addItem('📧 Log Email as Ticket', 'logEmailTicket')
    .addSeparator()
    .addSubMenu(ui.createMenu('📋 Ticket Actions')
      .addItem('Assign Ticket', 'assignTicket')
      .addItem('Update Status', 'updateTicketStatus')
      .addItem('Change Priority', 'changePriority')
      .addItem('Add Note', 'addTicketNote')
      .addItem('Resolve Ticket', 'resolveTicket'))
    .addSeparator()
    .addSubMenu(ui.createMenu('📊 Reports')
      .addItem('Ticket Summary', 'ticketSummary')
      .addItem('SLA Report', 'slaReport')
      .addItem('Agent Performance', 'agentPerformance')
      .addItem('Category Analysis', 'categoryAnalysis')
      .addItem('Customer Satisfaction', 'csatReport'))
    .addSeparator()
    .addSubMenu(ui.createMenu('🔔 Alerts')
      .addItem('SLA Breaches', 'slaBreaches')
      .addItem('Unassigned Tickets', 'unassignedTickets')
      .addItem('Overdue Tickets', 'overdueTickets'))
    .addSeparator()
    .addItem('📧 Send Customer Update', 'sendCustomerUpdate')
    .addItem('⚙️ Settings', 'openSupportSettings')
    .addToUi();
}

const CONFIG = {
  COMPANY_NAME: 'BlackRoad OS, Inc.',
  SUPPORT_EMAIL: 'support@blackroad.io',
  PRIORITIES: {
    'P1 - Critical': { slaHours: 1, color: '#FFCDD2' },
    'P2 - High': { slaHours: 4, color: '#FFE0B2' },
    'P3 - Medium': { slaHours: 24, color: '#FFF9C4' },
    'P4 - Low': { slaHours: 72, color: '#E0F7FA' }
  },
  STATUSES: ['New', 'Open', 'In Progress', 'Waiting on Customer', 'Waiting on Third Party', 'Resolved', 'Closed'],
  CATEGORIES: ['Bug Report', 'Feature Request', 'How-to Question', 'Billing', 'Account Access', 'Performance', 'Security', 'Integration', 'Other'],
  CHANNELS: ['Email', 'Chat', 'Phone', 'Web Form', 'Social Media'],
  AGENTS: ['Support Team'],
  CSAT_SCALE: [1, 2, 3, 4, 5]
};

// Create Ticket
function createTicket() {
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

    <label>Subject:</label>
    <input type="text" id="subject" placeholder="Brief description of the issue">

    <label>Customer Name:</label>
    <input type="text" id="customerName" placeholder="Customer's name">

    <label>Customer Email:</label>
    <input type="email" id="customerEmail" placeholder="customer@email.com">

    <div class="row">
      <div class="col">
        <label>Priority:</label>
        <select id="priority">
          ${Object.keys(CONFIG.PRIORITIES).map(p => '<option>' + p + '</option>').join('')}
        </select>
      </div>
      <div class="col">
        <label>Category:</label>
        <select id="category">
          ${CONFIG.CATEGORIES.map(c => '<option>' + c + '</option>').join('')}
        </select>
      </div>
    </div>

    <label>Channel:</label>
    <select id="channel">
      ${CONFIG.CHANNELS.map(c => '<option>' + c + '</option>').join('')}
    </select>

    <label>Description:</label>
    <textarea id="description" rows="4" placeholder="Detailed description of the issue"></textarea>

    <label>Assign To:</label>
    <select id="assignee">
      <option value="">Unassigned</option>
      ${CONFIG.AGENTS.map(a => '<option>' + a + '</option>').join('')}
    </select>

    <button onclick="submitTicket()">Create Ticket</button>

    <script>
      function submitTicket() {
        const data = {
          subject: document.getElementById('subject').value,
          customerName: document.getElementById('customerName').value,
          customerEmail: document.getElementById('customerEmail').value,
          priority: document.getElementById('priority').value,
          category: document.getElementById('category').value,
          channel: document.getElementById('channel').value,
          description: document.getElementById('description').value,
          assignee: document.getElementById('assignee').value
        };
        google.script.run.withSuccessHandler(() => {
          google.script.host.close();
        }).processTicket(data);
      }
    </script>
  `).setWidth(450).setHeight(650);

  ui.showModalDialog(html, '🎫 Create Ticket');
}

function processTicket(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Tickets');

  if (!sheet) {
    sheet = ss.insertSheet('Tickets');
    sheet.getRange(1, 1, 1, 18).setValues([['Ticket ID', 'Subject', 'Customer Name', 'Customer Email', 'Priority', 'Category', 'Channel', 'Status', 'Assignee', 'Created', 'SLA Due', 'First Response', 'Resolved', 'CSAT', 'Description', 'Notes', 'Resolution', 'Time Spent']]);
    sheet.getRange(1, 1, 1, 18).setFontWeight('bold').setBackground('#2979FF').setFontColor('white');
  }

  const lastRow = Math.max(sheet.getLastRow(), 1);
  const id = 'TKT-' + new Date().getFullYear() + '-' + String(lastRow).padStart(5, '0');

  // Calculate SLA due time
  const created = new Date();
  const slaHours = CONFIG.PRIORITIES[data.priority].slaHours;
  const slaDue = new Date(created.getTime() + slaHours * 60 * 60 * 1000);

  sheet.appendRow([
    id,
    data.subject,
    data.customerName,
    data.customerEmail,
    data.priority,
    data.category,
    data.channel,
    data.assignee ? 'Open' : 'New',
    data.assignee,
    created,
    slaDue,
    '',
    '',
    '',
    data.description,
    '',
    '',
    0
  ]);

  // Color code by priority
  const color = CONFIG.PRIORITIES[data.priority].color;
  sheet.getRange(sheet.getLastRow(), 1, 1, 18).setBackground(color);

  SpreadsheetApp.getUi().alert('✅ Ticket created!\n\nTicket ID: ' + id + '\nPriority: ' + data.priority + '\nSLA Due: ' + slaDue.toLocaleString());
}

// Log Email as Ticket
function logEmailTicket() {
  const ui = SpreadsheetApp.getUi();

  const subjectResponse = ui.prompt('Email Subject:', ui.ButtonSet.OK_CANCEL);
  if (subjectResponse.getSelectedButton() !== ui.Button.OK) return;
  const subject = subjectResponse.getResponseText();

  const fromResponse = ui.prompt('From (customer email):', ui.ButtonSet.OK_CANCEL);
  if (fromResponse.getSelectedButton() !== ui.Button.OK) return;
  const customerEmail = fromResponse.getResponseText();

  const bodyResponse = ui.prompt('Email Body (brief summary):', ui.ButtonSet.OK_CANCEL);
  const body = bodyResponse.getSelectedButton() === ui.Button.OK ? bodyResponse.getResponseText() : '';

  processTicket({
    subject: subject,
    customerName: customerEmail.split('@')[0],
    customerEmail: customerEmail,
    priority: 'P3 - Medium',
    category: 'Other',
    channel: 'Email',
    description: body,
    assignee: ''
  });
}

// Assign Ticket
function assignTicket() {
  const ui = SpreadsheetApp.getUi();

  const ticketResponse = ui.prompt('Enter Ticket ID:', ui.ButtonSet.OK_CANCEL);
  if (ticketResponse.getSelectedButton() !== ui.Button.OK) return;
  const ticketId = ticketResponse.getResponseText().trim();

  const agentResponse = ui.prompt('Assign to (agent name):', ui.ButtonSet.OK_CANCEL);
  if (agentResponse.getSelectedButton() !== ui.Button.OK) return;
  const agent = agentResponse.getResponseText();

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Tickets');

  if (!sheet) return;

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 18).getValues();

  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === ticketId) {
      const row = i + 2;
      sheet.getRange(row, 9).setValue(agent);
      if (data[i][7] === 'New') {
        sheet.getRange(row, 8).setValue('Open');
      }

      logTicketNote(ticketId, 'Assigned to ' + agent);

      ui.alert('✅ Ticket assigned!\n\n' + ticketId + ' → ' + agent);
      return;
    }
  }

  ui.alert('❌ Ticket not found.');
}

// Update Status
function updateTicketStatus() {
  const ui = SpreadsheetApp.getUi();

  const ticketResponse = ui.prompt('Enter Ticket ID:', ui.ButtonSet.OK_CANCEL);
  if (ticketResponse.getSelectedButton() !== ui.Button.OK) return;
  const ticketId = ticketResponse.getResponseText().trim();

  const statusHtml = CONFIG.STATUSES.map(s => '<option>' + s + '</option>').join('');
  const statusResponse = ui.prompt('New Status (' + CONFIG.STATUSES.join(' / ') + '):', ui.ButtonSet.OK_CANCEL);
  if (statusResponse.getSelectedButton() !== ui.Button.OK) return;
  const newStatus = statusResponse.getResponseText();

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Tickets');

  if (!sheet) return;

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 18).getValues();

  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === ticketId) {
      const row = i + 2;
      sheet.getRange(row, 8).setValue(newStatus);

      // Record first response time
      if (!data[i][11] && newStatus !== 'New') {
        sheet.getRange(row, 12).setValue(new Date());
      }

      logTicketNote(ticketId, 'Status changed to ' + newStatus);

      ui.alert('✅ Status updated!\n\n' + ticketId + ': ' + newStatus);
      return;
    }
  }

  ui.alert('❌ Ticket not found.');
}

// Change Priority
function changePriority() {
  const ui = SpreadsheetApp.getUi();

  const ticketResponse = ui.prompt('Enter Ticket ID:', ui.ButtonSet.OK_CANCEL);
  if (ticketResponse.getSelectedButton() !== ui.Button.OK) return;
  const ticketId = ticketResponse.getResponseText().trim();

  const priorityResponse = ui.prompt('New Priority (P1 - Critical / P2 - High / P3 - Medium / P4 - Low):', ui.ButtonSet.OK_CANCEL);
  if (priorityResponse.getSelectedButton() !== ui.Button.OK) return;
  const newPriority = priorityResponse.getResponseText();

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Tickets');

  if (!sheet) return;

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 18).getValues();

  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === ticketId) {
      const row = i + 2;
      sheet.getRange(row, 5).setValue(newPriority);

      // Update SLA
      const created = new Date(data[i][9]);
      const slaHours = CONFIG.PRIORITIES[newPriority]?.slaHours || 24;
      const newSlaDue = new Date(created.getTime() + slaHours * 60 * 60 * 1000);
      sheet.getRange(row, 11).setValue(newSlaDue);

      // Update color
      const color = CONFIG.PRIORITIES[newPriority]?.color || '#FFFFFF';
      sheet.getRange(row, 1, 1, 18).setBackground(color);

      logTicketNote(ticketId, 'Priority changed to ' + newPriority);

      ui.alert('✅ Priority updated!\n\n' + ticketId + ': ' + newPriority);
      return;
    }
  }

  ui.alert('❌ Ticket not found.');
}

// Add Note
function addTicketNote() {
  const ui = SpreadsheetApp.getUi();

  const ticketResponse = ui.prompt('Enter Ticket ID:', ui.ButtonSet.OK_CANCEL);
  if (ticketResponse.getSelectedButton() !== ui.Button.OK) return;
  const ticketId = ticketResponse.getResponseText().trim();

  const noteResponse = ui.prompt('Note:', ui.ButtonSet.OK_CANCEL);
  if (noteResponse.getSelectedButton() !== ui.Button.OK) return;
  const note = noteResponse.getResponseText();

  logTicketNote(ticketId, note);
  ui.alert('✅ Note added to ' + ticketId);
}

function logTicketNote(ticketId, note) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Tickets');

  if (!sheet) return;

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 18).getValues();

  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === ticketId) {
      const row = i + 2;
      const existingNotes = data[i][15] || '';
      const timestamp = new Date().toLocaleString();
      const newNote = '[' + timestamp + '] ' + note;
      sheet.getRange(row, 16).setValue(existingNotes ? existingNotes + '\n' + newNote : newNote);
      return;
    }
  }
}

// Resolve Ticket
function resolveTicket() {
  const ui = SpreadsheetApp.getUi();

  const ticketResponse = ui.prompt('Enter Ticket ID:', ui.ButtonSet.OK_CANCEL);
  if (ticketResponse.getSelectedButton() !== ui.Button.OK) return;
  const ticketId = ticketResponse.getResponseText().trim();

  const resolutionResponse = ui.prompt('Resolution summary:', ui.ButtonSet.OK_CANCEL);
  if (resolutionResponse.getSelectedButton() !== ui.Button.OK) return;
  const resolution = resolutionResponse.getResponseText();

  const timeResponse = ui.prompt('Time spent (minutes):', ui.ButtonSet.OK_CANCEL);
  const timeSpent = timeResponse.getSelectedButton() === ui.Button.OK ? parseInt(timeResponse.getResponseText()) : 0;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Tickets');

  if (!sheet) return;

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 18).getValues();

  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === ticketId) {
      const row = i + 2;
      sheet.getRange(row, 8).setValue('Resolved');
      sheet.getRange(row, 13).setValue(new Date());
      sheet.getRange(row, 17).setValue(resolution);
      sheet.getRange(row, 18).setValue(timeSpent);
      sheet.getRange(row, 1, 1, 18).setBackground('#C8E6C9');

      logTicketNote(ticketId, 'Resolved: ' + resolution);

      ui.alert('✅ Ticket resolved!\n\n' + ticketId + '\nTime: ' + timeSpent + ' minutes');
      return;
    }
  }

  ui.alert('❌ Ticket not found.');
}

// Ticket Summary
function ticketSummary() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Tickets');

  if (!sheet || sheet.getLastRow() < 2) {
    ui.alert('No tickets found.');
    return;
  }

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 18).getValues();

  let stats = {
    total: data.length,
    byStatus: {},
    byPriority: {},
    avgResolutionTime: 0,
    resolved: 0
  };

  let totalResTime = 0;

  for (const row of data) {
    const status = row[7];
    const priority = row[4];
    const created = new Date(row[9]);
    const resolved = row[12] ? new Date(row[12]) : null;

    stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
    stats.byPriority[priority] = (stats.byPriority[priority] || 0) + 1;

    if (resolved) {
      stats.resolved++;
      totalResTime += (resolved - created) / (60 * 60 * 1000); // hours
    }
  }

  stats.avgResolutionTime = stats.resolved > 0 ? totalResTime / stats.resolved : 0;

  let report = `
🎫 TICKET SUMMARY
=================

Total Tickets: ${stats.total}
Resolved: ${stats.resolved}
Avg Resolution Time: ${stats.avgResolutionTime.toFixed(1)} hours

BY STATUS:
${Object.entries(stats.byStatus).map(([s, c]) => '  ' + s + ': ' + c).join('\n')}

BY PRIORITY:
${Object.entries(stats.byPriority).map(([p, c]) => '  ' + p + ': ' + c).join('\n')}
  `;

  ui.alert(report);
}

// SLA Report
function slaReport() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Tickets');

  if (!sheet || sheet.getLastRow() < 2) {
    ui.alert('No tickets found.');
    return;
  }

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 18).getValues();
  const now = new Date();

  let withinSLA = 0;
  let breached = 0;
  let atRisk = 0;

  for (const row of data) {
    const status = row[7];
    if (status === 'Resolved' || status === 'Closed') continue;

    const slaDue = new Date(row[10]);
    const firstResponse = row[11] ? new Date(row[11]) : null;

    if (firstResponse) {
      if (firstResponse <= slaDue) {
        withinSLA++;
      } else {
        breached++;
      }
    } else {
      if (now > slaDue) {
        breached++;
      } else if ((slaDue - now) < 60 * 60 * 1000) { // Less than 1 hour
        atRisk++;
      } else {
        withinSLA++;
      }
    }
  }

  const total = withinSLA + breached + atRisk;
  const slaCompliance = total > 0 ? (withinSLA / total * 100).toFixed(1) : 100;

  let report = `
📊 SLA REPORT
=============

SLA Compliance: ${slaCompliance}%

Within SLA: ${withinSLA}
At Risk (< 1 hour): ${atRisk}
Breached: ${breached}

${breached > 0 ? '⚠️ ACTION NEEDED: ' + breached + ' tickets have breached SLA!' : '✅ All tickets within SLA'}
  `;

  ui.alert(report);
}

// Agent Performance
function agentPerformance() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Tickets');

  if (!sheet || sheet.getLastRow() < 2) {
    ui.alert('No tickets found.');
    return;
  }

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 18).getValues();

  let byAgent = {};

  for (const row of data) {
    const agent = row[8] || 'Unassigned';
    const status = row[7];
    const csat = row[13];

    if (!byAgent[agent]) {
      byAgent[agent] = { total: 0, resolved: 0, csatSum: 0, csatCount: 0 };
    }

    byAgent[agent].total++;
    if (status === 'Resolved' || status === 'Closed') {
      byAgent[agent].resolved++;
    }
    if (csat) {
      byAgent[agent].csatSum += csat;
      byAgent[agent].csatCount++;
    }
  }

  let report = `👤 AGENT PERFORMANCE\n${'='.repeat(22)}\n\n`;

  for (const [agent, stats] of Object.entries(byAgent).sort((a, b) => b[1].resolved - a[1].resolved)) {
    const avgCsat = stats.csatCount > 0 ? (stats.csatSum / stats.csatCount).toFixed(1) : 'N/A';
    report += `${agent}\n`;
    report += `  Total: ${stats.total} | Resolved: ${stats.resolved}\n`;
    report += `  CSAT: ${avgCsat}/5\n\n`;
  }

  ui.alert(report);
}

// Category Analysis
function categoryAnalysis() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Tickets');

  if (!sheet || sheet.getLastRow() < 2) {
    ui.alert('No tickets found.');
    return;
  }

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 18).getValues();

  let byCategory = {};

  for (const row of data) {
    const category = row[5];
    byCategory[category] = (byCategory[category] || 0) + 1;
  }

  let report = `📊 CATEGORY ANALYSIS\n${'='.repeat(22)}\n\n`;

  const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

  for (const [category, count] of sorted) {
    const pct = (count / data.length * 100).toFixed(1);
    const bar = '█'.repeat(Math.round(count / data.length * 20));
    report += `${category.padEnd(18)} ${bar} ${count} (${pct}%)\n`;
  }

  ui.alert(report);
}

// CSAT Report
function csatReport() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Tickets');

  if (!sheet || sheet.getLastRow() < 2) {
    ui.alert('No tickets found.');
    return;
  }

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 18).getValues();

  let csatScores = [];
  let distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  for (const row of data) {
    const csat = row[13];
    if (csat && csat >= 1 && csat <= 5) {
      csatScores.push(csat);
      distribution[csat]++;
    }
  }

  const avg = csatScores.length > 0 ? (csatScores.reduce((a, b) => a + b, 0) / csatScores.length) : 0;
  const promoters = distribution[5];
  const detractors = distribution[1] + distribution[2];
  const nps = csatScores.length > 0 ? Math.round((promoters - detractors) / csatScores.length * 100) : 0;

  let report = `
⭐ CUSTOMER SATISFACTION
========================

Average CSAT: ${avg.toFixed(2)}/5
Total Responses: ${csatScores.length}

DISTRIBUTION:
  ⭐⭐⭐⭐⭐ (5): ${distribution[5]}
  ⭐⭐⭐⭐ (4): ${distribution[4]}
  ⭐⭐⭐ (3): ${distribution[3]}
  ⭐⭐ (2): ${distribution[2]}
  ⭐ (1): ${distribution[1]}

NPS Score: ${nps}
${nps >= 50 ? '🎉 Excellent!' : nps >= 0 ? '👍 Good' : '⚠️ Needs improvement'}
  `;

  ui.alert(report);
}

// SLA Breaches
function slaBreaches() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Tickets');

  if (!sheet || sheet.getLastRow() < 2) {
    ui.alert('No tickets found.');
    return;
  }

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 18).getValues();
  const now = new Date();

  let breaches = [];

  for (const row of data) {
    const status = row[7];
    if (status === 'Resolved' || status === 'Closed') continue;

    const ticketId = row[0];
    const subject = row[1];
    const slaDue = new Date(row[10]);
    const firstResponse = row[11];

    if (!firstResponse && now > slaDue) {
      const hoursOver = ((now - slaDue) / (60 * 60 * 1000)).toFixed(1);
      breaches.push({
        id: ticketId,
        subject: subject.substring(0, 30),
        hoursOver: hoursOver
      });
    }
  }

  if (breaches.length === 0) {
    ui.alert('✅ No SLA breaches!');
    return;
  }

  let report = `🚨 SLA BREACHES (${breaches.length})\n${'='.repeat(25)}\n\n`;

  for (const breach of breaches.sort((a, b) => b.hoursOver - a.hoursOver)) {
    report += `${breach.id}: ${breach.subject}\n`;
    report += `  ⏰ ${breach.hoursOver} hours overdue\n\n`;
  }

  ui.alert(report);
}

// Unassigned Tickets
function unassignedTickets() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Tickets');

  if (!sheet || sheet.getLastRow() < 2) {
    ui.alert('No tickets found.');
    return;
  }

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 18).getValues();

  let unassigned = data.filter(row => !row[8] && row[7] !== 'Resolved' && row[7] !== 'Closed');

  if (unassigned.length === 0) {
    ui.alert('✅ All tickets are assigned!');
    return;
  }

  let report = `📋 UNASSIGNED TICKETS (${unassigned.length})\n${'='.repeat(30)}\n\n`;

  for (const ticket of unassigned) {
    report += `${ticket[0]}: ${ticket[1].substring(0, 35)}\n`;
    report += `  Priority: ${ticket[4]} | Status: ${ticket[7]}\n\n`;
  }

  ui.alert(report);
}

// Overdue Tickets
function overdueTickets() {
  slaBreaches(); // Same as SLA breaches
}

// Send Customer Update
function sendCustomerUpdate() {
  const ui = SpreadsheetApp.getUi();

  const ticketResponse = ui.prompt('Enter Ticket ID:', ui.ButtonSet.OK_CANCEL);
  if (ticketResponse.getSelectedButton() !== ui.Button.OK) return;
  const ticketId = ticketResponse.getResponseText().trim();

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Tickets');

  if (!sheet) return;

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 18).getValues();

  for (const row of data) {
    if (row[0] === ticketId) {
      const customerEmail = row[3];
      const customerName = row[2];
      const subject = row[1];
      const status = row[7];

      const updateResponse = ui.prompt('Message to customer:', ui.ButtonSet.OK_CANCEL);
      if (updateResponse.getSelectedButton() !== ui.Button.OK) return;
      const message = updateResponse.getResponseText();

      const emailSubject = 'Re: [' + ticketId + '] ' + subject;
      const body = `Dear ${customerName},

${message}

Ticket Status: ${status}

If you have any questions, please reply to this email or reference ticket ${ticketId}.

Best regards,
${CONFIG.COMPANY_NAME} Support Team`;

      MailApp.sendEmail(customerEmail, emailSubject, body);

      logTicketNote(ticketId, 'Customer update sent: ' + message.substring(0, 50) + '...');

      ui.alert('✅ Update sent to ' + customerEmail);
      return;
    }
  }

  ui.alert('❌ Ticket not found.');
}

// Settings
function openSupportSettings() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      h3 { color: #2979FF; }
    </style>
    <h3>⚙️ Support Settings</h3>
    <p><b>Company:</b> ${CONFIG.COMPANY_NAME}</p>
    <p><b>Support Email:</b> ${CONFIG.SUPPORT_EMAIL}</p>
    <p><b>SLA Targets:</b></p>
    <ul>
      ${Object.entries(CONFIG.PRIORITIES).map(([p, d]) => '<li>' + p + ': ' + d.slaHours + ' hours</li>').join('')}
    </ul>
    <p><b>Categories:</b> ${CONFIG.CATEGORIES.join(', ')}</p>
    <p><b>To customize:</b> Edit CONFIG in Apps Script</p>
  `).setWidth(400).setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(html, '⚙️ Settings');
}
