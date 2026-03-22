/**
 * BLACKROAD OS - Meeting Scheduler with Calendar Integration
 *
 * SETUP: Extensions > Apps Script > Paste this code > Save > Refresh sheet
 *
 * FEATURES:
 * - Create calendar events directly from sheet
 * - Recurring meeting templates
 * - Attendee management
 * - Meeting rooms/resources
 * - Availability checking
 * - Meeting notes and action items
 * - Automated reminders
 * - Meeting cost calculator
 * - Agenda templates
 */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📅 Meeting Tools')
    .addItem('➕ Schedule New Meeting', 'scheduleMeeting')
    .addItem('🔄 Create Recurring Meeting', 'createRecurringMeeting')
    .addSeparator()
    .addSubMenu(ui.createMenu('📆 Calendar Sync')
      .addItem('Sync to Google Calendar', 'syncToCalendar')
      .addItem('Import from Calendar', 'importFromCalendar')
      .addItem('Check Availability', 'checkAvailability'))
    .addSeparator()
    .addSubMenu(ui.createMenu('📋 Templates')
      .addItem('1:1 Meeting', 'templateOneOnOne')
      .addItem('Team Standup', 'templateStandup')
      .addItem('Sprint Planning', 'templateSprintPlanning')
      .addItem('Board Meeting', 'templateBoardMeeting')
      .addItem('Client Call', 'templateClientCall'))
    .addSeparator()
    .addSubMenu(ui.createMenu('📝 Notes & Actions')
      .addItem('Add Meeting Notes', 'addMeetingNotes')
      .addItem('Create Action Items', 'createActionItems')
      .addItem('Send Meeting Summary', 'sendMeetingSummary'))
    .addSeparator()
    .addItem('💰 Meeting Cost Calculator', 'meetingCostCalculator')
    .addItem('📊 Meeting Analytics', 'meetingAnalytics')
    .addItem('⚙️ Settings', 'openMeetingSettings')
    .addToUi();
}

const CONFIG = {
  COMPANY_NAME: 'BlackRoad OS, Inc.',
  DEFAULT_DURATION: 30, // minutes
  DEFAULT_REMINDER: 15, // minutes before
  MEETING_ROOMS: ['Conference Room A', 'Conference Room B', 'Zoom', 'Google Meet', 'Phone'],
  MEETING_TYPES: ['1:1', 'Team Meeting', 'All Hands', 'Client Call', 'Interview', 'Training', 'Workshop', 'Board Meeting'],
  HOURLY_COST_DEFAULT: 75, // $ per person per hour
  CALENDAR_ID: 'primary',
  TIMEZONE: 'America/New_York'
};

// Schedule New Meeting
function scheduleMeeting() {
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

    <label>Meeting Title:</label>
    <input type="text" id="title" placeholder="Weekly Team Sync">

    <label>Type:</label>
    <select id="type">
      ${CONFIG.MEETING_TYPES.map(t => '<option>' + t + '</option>').join('')}
    </select>

    <div class="row">
      <div class="col">
        <label>Date:</label>
        <input type="date" id="date" value="${new Date().toISOString().split('T')[0]}">
      </div>
      <div class="col">
        <label>Time:</label>
        <input type="time" id="time" value="09:00">
      </div>
    </div>

    <div class="row">
      <div class="col">
        <label>Duration (min):</label>
        <input type="number" id="duration" value="${CONFIG.DEFAULT_DURATION}">
      </div>
      <div class="col">
        <label>Reminder (min):</label>
        <input type="number" id="reminder" value="${CONFIG.DEFAULT_REMINDER}">
      </div>
    </div>

    <label>Location/Room:</label>
    <select id="location">
      ${CONFIG.MEETING_ROOMS.map(r => '<option>' + r + '</option>').join('')}
    </select>

    <label>Attendees (comma-separated emails):</label>
    <input type="text" id="attendees" placeholder="person@company.com, person2@company.com">

    <label>Agenda:</label>
    <textarea id="agenda" rows="3" placeholder="1. Topic one\n2. Topic two\n3. Action items"></textarea>

    <label>
      <input type="checkbox" id="createCalendarEvent" checked>
      Create Google Calendar event
    </label>

    <button onclick="submitMeeting()">Schedule Meeting</button>

    <script>
      function submitMeeting() {
        const data = {
          title: document.getElementById('title').value,
          type: document.getElementById('type').value,
          date: document.getElementById('date').value,
          time: document.getElementById('time').value,
          duration: parseInt(document.getElementById('duration').value),
          reminder: parseInt(document.getElementById('reminder').value),
          location: document.getElementById('location').value,
          attendees: document.getElementById('attendees').value,
          agenda: document.getElementById('agenda').value,
          createCalendarEvent: document.getElementById('createCalendarEvent').checked
        };
        google.script.run.withSuccessHandler(() => {
          google.script.host.close();
        }).processMeeting(data);
      }
    </script>
  `).setWidth(450).setHeight(650);

  ui.showModalDialog(html, '📅 Schedule New Meeting');
}

function processMeeting(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = Math.max(sheet.getLastRow(), 1);
  const id = 'MTG-' + new Date().getFullYear() + '-' + String(lastRow).padStart(4, '0');

  // Parse datetime
  const startDateTime = new Date(data.date + 'T' + data.time);
  const endDateTime = new Date(startDateTime.getTime() + data.duration * 60000);

  // Add to sheet
  sheet.appendRow([
    id,
    data.title,
    data.type,
    data.date,
    data.time,
    data.duration,
    endDateTime.toTimeString().slice(0, 5),
    data.location,
    data.attendees,
    data.agenda,
    'Scheduled',
    '',
    '',
    new Date(),
    ''
  ]);

  // Color code by type
  const typeColors = {
    '1:1': '#E3F2FD',
    'Team Meeting': '#E8F5E9',
    'All Hands': '#FFF3E0',
    'Client Call': '#FCE4EC',
    'Interview': '#F3E5F5',
    'Training': '#E0F7FA',
    'Workshop': '#FFF8E1',
    'Board Meeting': '#FFEBEE'
  };
  sheet.getRange(sheet.getLastRow(), 1, 1, 15).setBackground(typeColors[data.type] || '#FFFFFF');

  // Create calendar event if requested
  if (data.createCalendarEvent) {
    try {
      const calendar = CalendarApp.getDefaultCalendar();
      const event = calendar.createEvent(data.title, startDateTime, endDateTime, {
        location: data.location,
        description: data.agenda,
        guests: data.attendees,
        sendInvites: true
      });

      // Add reminder
      event.addPopupReminder(data.reminder);

      // Update sheet with event ID
      sheet.getRange(sheet.getLastRow(), 15).setValue(event.getId());

      SpreadsheetApp.getUi().alert('✅ Meeting scheduled and calendar event created!\n\nMeeting ID: ' + id + '\nCalendar invites sent to attendees.');
    } catch (e) {
      SpreadsheetApp.getUi().alert('⚠️ Meeting added to sheet but calendar event failed:\n' + e.message);
    }
  } else {
    SpreadsheetApp.getUi().alert('✅ Meeting scheduled!\n\nMeeting ID: ' + id);
  }
}

// Create Recurring Meeting
function createRecurringMeeting() {
  const ui = SpreadsheetApp.getUi();

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      label { display: block; margin-top: 10px; font-weight: bold; }
      input, select { width: 100%; padding: 8px; margin-top: 5px; box-sizing: border-box; }
      button { margin-top: 20px; padding: 10px 20px; background: #2979FF; color: white; border: none; cursor: pointer; }
    </style>

    <label>Meeting Title:</label>
    <input type="text" id="title" placeholder="Weekly Team Sync">

    <label>Recurrence:</label>
    <select id="recurrence">
      <option value="daily">Daily</option>
      <option value="weekly" selected>Weekly</option>
      <option value="biweekly">Bi-weekly</option>
      <option value="monthly">Monthly</option>
    </select>

    <label>Day of Week (for weekly):</label>
    <select id="dayOfWeek">
      <option value="1">Monday</option>
      <option value="2">Tuesday</option>
      <option value="3">Wednesday</option>
      <option value="4">Thursday</option>
      <option value="5">Friday</option>
    </select>

    <label>Time:</label>
    <input type="time" id="time" value="09:00">

    <label>Duration (min):</label>
    <input type="number" id="duration" value="30">

    <label>Number of Occurrences:</label>
    <input type="number" id="occurrences" value="12">

    <label>Attendees:</label>
    <input type="text" id="attendees" placeholder="email@company.com">

    <button onclick="submitRecurring()">Create Series</button>

    <script>
      function submitRecurring() {
        const data = {
          title: document.getElementById('title').value,
          recurrence: document.getElementById('recurrence').value,
          dayOfWeek: parseInt(document.getElementById('dayOfWeek').value),
          time: document.getElementById('time').value,
          duration: parseInt(document.getElementById('duration').value),
          occurrences: parseInt(document.getElementById('occurrences').value),
          attendees: document.getElementById('attendees').value
        };
        google.script.run.withSuccessHandler(() => {
          google.script.host.close();
        }).processRecurringMeeting(data);
      }
    </script>
  `).setWidth(400).setHeight(500);

  ui.showModalDialog(html, '🔄 Create Recurring Meeting');
}

function processRecurringMeeting(data) {
  const calendar = CalendarApp.getDefaultCalendar();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // Find next occurrence of the specified day
  let startDate = new Date();
  while (startDate.getDay() !== data.dayOfWeek) {
    startDate.setDate(startDate.getDate() + 1);
  }

  // Parse time
  const [hours, minutes] = data.time.split(':').map(Number);
  startDate.setHours(hours, minutes, 0, 0);

  // Create recurrence rule
  let recurrence;
  switch (data.recurrence) {
    case 'daily':
      recurrence = CalendarApp.newRecurrence().addDailyRule().times(data.occurrences);
      break;
    case 'weekly':
      recurrence = CalendarApp.newRecurrence().addWeeklyRule().times(data.occurrences);
      break;
    case 'biweekly':
      recurrence = CalendarApp.newRecurrence().addWeeklyRule().interval(2).times(data.occurrences);
      break;
    case 'monthly':
      recurrence = CalendarApp.newRecurrence().addMonthlyRule().times(data.occurrences);
      break;
  }

  const endDate = new Date(startDate.getTime() + data.duration * 60000);

  try {
    const eventSeries = calendar.createEventSeries(
      data.title,
      startDate,
      endDate,
      recurrence,
      {
        guests: data.attendees,
        sendInvites: true
      }
    );

    // Add to sheet
    const seriesId = 'SER-' + Date.now();
    sheet.appendRow([
      seriesId,
      data.title + ' (Recurring)',
      'Recurring',
      startDate.toISOString().split('T')[0],
      data.time,
      data.duration,
      '',
      '',
      data.attendees,
      data.recurrence + ' x ' + data.occurrences,
      'Active',
      '',
      '',
      new Date(),
      eventSeries.getId()
    ]);

    sheet.getRange(sheet.getLastRow(), 1, 1, 15).setBackground('#E8EAF6');

    SpreadsheetApp.getUi().alert('✅ Recurring meeting series created!\n\n' + data.occurrences + ' ' + data.recurrence + ' meetings scheduled.\nCalendar invites sent.');
  } catch (e) {
    SpreadsheetApp.getUi().alert('❌ Error creating recurring meeting:\n' + e.message);
  }
}

// Sync to Calendar
function syncToCalendar() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert('No meetings to sync.');
    return;
  }

  const calendar = CalendarApp.getDefaultCalendar();
  let synced = 0;

  for (let row = 2; row <= lastRow; row++) {
    const eventId = sheet.getRange(row, 15).getValue();
    const status = sheet.getRange(row, 11).getValue();

    if (!eventId && status === 'Scheduled') {
      const title = sheet.getRange(row, 2).getValue();
      const date = sheet.getRange(row, 4).getValue();
      const time = sheet.getRange(row, 5).getValue();
      const duration = sheet.getRange(row, 6).getValue();
      const location = sheet.getRange(row, 8).getValue();
      const attendees = sheet.getRange(row, 9).getValue();
      const agenda = sheet.getRange(row, 10).getValue();

      try {
        const startDateTime = new Date(date + 'T' + time);
        const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

        const event = calendar.createEvent(title, startDateTime, endDateTime, {
          location: location,
          description: agenda,
          guests: attendees,
          sendInvites: true
        });

        sheet.getRange(row, 15).setValue(event.getId());
        synced++;
      } catch (e) {
        // Skip events with errors
      }
    }
  }

  SpreadsheetApp.getUi().alert('✅ Synced ' + synced + ' meetings to Google Calendar.');
}

// Import from Calendar
function importFromCalendar() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Import meetings from the next N days:', ui.ButtonSet.OK_CANCEL);

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const days = parseInt(response.getResponseText()) || 7;
  const calendar = CalendarApp.getDefaultCalendar();
  const now = new Date();
  const endDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const events = calendar.getEvents(now, endDate);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  let imported = 0;

  for (const event of events) {
    const id = 'IMP-' + event.getId().slice(0, 8);
    const duration = (event.getEndTime().getTime() - event.getStartTime().getTime()) / 60000;

    sheet.appendRow([
      id,
      event.getTitle(),
      'Imported',
      event.getStartTime().toISOString().split('T')[0],
      event.getStartTime().toTimeString().slice(0, 5),
      duration,
      event.getEndTime().toTimeString().slice(0, 5),
      event.getLocation() || '',
      event.getGuestList().map(g => g.getEmail()).join(', '),
      event.getDescription() || '',
      'Scheduled',
      '',
      '',
      new Date(),
      event.getId()
    ]);

    imported++;
  }

  ui.alert('✅ Imported ' + imported + ' meetings from the next ' + days + ' days.');
}

// Check Availability
function checkAvailability() {
  const ui = SpreadsheetApp.getUi();

  const dateResponse = ui.prompt('Enter date to check (YYYY-MM-DD):', ui.ButtonSet.OK_CANCEL);
  if (dateResponse.getSelectedButton() !== ui.Button.OK) return;

  const dateStr = dateResponse.getResponseText();
  const checkDate = new Date(dateStr);
  const endDate = new Date(checkDate.getTime() + 24 * 60 * 60 * 1000);

  const calendar = CalendarApp.getDefaultCalendar();
  const events = calendar.getEvents(checkDate, endDate);

  let busyTimes = [];
  for (const event of events) {
    busyTimes.push({
      title: event.getTitle(),
      start: event.getStartTime().toTimeString().slice(0, 5),
      end: event.getEndTime().toTimeString().slice(0, 5)
    });
  }

  if (busyTimes.length === 0) {
    ui.alert('✅ ' + dateStr + ' is completely open!');
    return;
  }

  let report = '📅 SCHEDULE FOR ' + dateStr + '\n\n';
  report += 'BUSY TIMES:\n';

  for (const slot of busyTimes.sort((a, b) => a.start.localeCompare(b.start))) {
    report += `  ${slot.start} - ${slot.end}: ${slot.title}\n`;
  }

  // Find free slots
  report += '\nFREE SLOTS (30+ min):\n';
  const workStart = '09:00';
  const workEnd = '18:00';

  // Simplified free slot detection
  let lastEnd = workStart;
  for (const slot of busyTimes.sort((a, b) => a.start.localeCompare(b.start))) {
    if (slot.start > lastEnd) {
      report += `  ${lastEnd} - ${slot.start}\n`;
    }
    if (slot.end > lastEnd) lastEnd = slot.end;
  }
  if (lastEnd < workEnd) {
    report += `  ${lastEnd} - ${workEnd}\n`;
  }

  ui.alert(report);
}

// Meeting Templates
function templateOneOnOne() {
  applyTemplate('1:1 Check-in', '1:1', 30, '1. How are you doing?\n2. What are you working on?\n3. Any blockers?\n4. Feedback/support needed');
}

function templateStandup() {
  applyTemplate('Daily Standup', 'Team Meeting', 15, '1. What did you do yesterday?\n2. What are you doing today?\n3. Any blockers?');
}

function templateSprintPlanning() {
  applyTemplate('Sprint Planning', 'Team Meeting', 120, '1. Sprint retrospective (15 min)\n2. Velocity review (10 min)\n3. Backlog grooming (30 min)\n4. Sprint commitment (45 min)\n5. Task breakdown (20 min)');
}

function templateBoardMeeting() {
  applyTemplate('Board Meeting', 'Board Meeting', 120, '1. Call to order\n2. Previous minutes approval\n3. Financial review\n4. Operational update\n5. Strategic discussion\n6. New business\n7. Adjournment');
}

function templateClientCall() {
  applyTemplate('Client Call', 'Client Call', 60, '1. Introductions\n2. Project status update\n3. Deliverables review\n4. Issues & risks\n5. Next steps\n6. Q&A');
}

function applyTemplate(title, type, duration, agenda) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = Math.max(sheet.getLastRow(), 1);
  const id = 'MTG-' + new Date().getFullYear() + '-' + String(lastRow).padStart(4, '0');

  sheet.appendRow([
    id,
    title,
    type,
    '',
    '',
    duration,
    '',
    '',
    '',
    agenda,
    'Draft',
    '',
    '',
    new Date(),
    ''
  ]);

  SpreadsheetApp.getUi().alert('📋 Template applied!\n\nFill in the date, time, and attendees.\nMeeting ID: ' + id);
}

// Add Meeting Notes
function addMeetingNotes() {
  const ui = SpreadsheetApp.getUi();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const row = sheet.getActiveRange().getRow();

  if (row < 2) {
    ui.alert('Please select a meeting row first.');
    return;
  }

  const meetingTitle = sheet.getRange(row, 2).getValue();
  const response = ui.prompt('Add notes for: ' + meetingTitle, ui.ButtonSet.OK_CANCEL);

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const notes = response.getResponseText();
  const existingNotes = sheet.getRange(row, 12).getValue();

  sheet.getRange(row, 12).setValue(existingNotes ? existingNotes + '\n---\n' + notes : notes);
  sheet.getRange(row, 11).setValue('Completed');
  sheet.getRange(row, 1, 1, 15).setBackground('#C8E6C9');

  ui.alert('✅ Notes added to meeting.');
}

// Create Action Items
function createActionItems() {
  const ui = SpreadsheetApp.getUi();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const row = sheet.getActiveRange().getRow();

  if (row < 2) {
    ui.alert('Please select a meeting row first.');
    return;
  }

  const meetingTitle = sheet.getRange(row, 2).getValue();
  const response = ui.prompt('Enter action items for: ' + meetingTitle + '\n\n(Format: Owner: Task, Owner: Task)', ui.ButtonSet.OK_CANCEL);

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const actions = response.getResponseText();
  sheet.getRange(row, 13).setValue(actions);

  ui.alert('✅ Action items added.');
}

// Send Meeting Summary
function sendMeetingSummary() {
  const ui = SpreadsheetApp.getUi();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const row = sheet.getActiveRange().getRow();

  if (row < 2) {
    ui.alert('Please select a meeting row first.');
    return;
  }

  const title = sheet.getRange(row, 2).getValue();
  const date = sheet.getRange(row, 4).getValue();
  const attendees = sheet.getRange(row, 9).getValue();
  const agenda = sheet.getRange(row, 10).getValue();
  const notes = sheet.getRange(row, 12).getValue();
  const actions = sheet.getRange(row, 13).getValue();

  if (!attendees) {
    ui.alert('No attendees to send summary to.');
    return;
  }

  const subject = 'Meeting Summary: ' + title + ' - ' + date;
  const body = `
MEETING SUMMARY
===============

Meeting: ${title}
Date: ${date}

AGENDA:
${agenda || 'No agenda recorded'}

NOTES:
${notes || 'No notes recorded'}

ACTION ITEMS:
${actions || 'No action items'}

--
Sent via BlackRoad OS Meeting Scheduler
  `;

  MailApp.sendEmail(attendees, subject, body);
  ui.alert('✅ Meeting summary sent to all attendees.');
}

// Meeting Cost Calculator
function meetingCostCalculator() {
  const ui = SpreadsheetApp.getUi();

  const attendeesResponse = ui.prompt('Number of attendees:', ui.ButtonSet.OK_CANCEL);
  if (attendeesResponse.getSelectedButton() !== ui.Button.OK) return;
  const attendees = parseInt(attendeesResponse.getResponseText());

  const durationResponse = ui.prompt('Meeting duration (minutes):', ui.ButtonSet.OK_CANCEL);
  if (durationResponse.getSelectedButton() !== ui.Button.OK) return;
  const duration = parseInt(durationResponse.getResponseText());

  const hourlyResponse = ui.prompt('Average hourly cost per person ($):', ui.ButtonSet.OK_CANCEL);
  if (hourlyResponse.getSelectedButton() !== ui.Button.OK) return;
  const hourlyRate = parseFloat(hourlyResponse.getResponseText()) || CONFIG.HOURLY_COST_DEFAULT;

  const totalHours = (attendees * duration) / 60;
  const totalCost = totalHours * hourlyRate;
  const perMinute = totalCost / duration;

  const report = `
💰 MEETING COST CALCULATOR
==========================

Attendees: ${attendees}
Duration: ${duration} minutes
Hourly Rate: $${hourlyRate}/person

TOTAL COST: $${totalCost.toFixed(2)}

Cost per minute: $${perMinute.toFixed(2)}
Collective hours spent: ${totalHours.toFixed(1)} hours

💡 TIP: Could this meeting be an email?
   A 30-min meeting with 6 people = 3 hours of productivity!
  `;

  ui.alert(report);
}

// Meeting Analytics
function meetingAnalytics() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert('No meeting data to analyze.');
    return;
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 15).getValues();

  let stats = {
    total: data.length,
    byType: {},
    totalDuration: 0,
    completed: 0,
    cancelled: 0
  };

  for (const row of data) {
    const type = row[2] || 'Other';
    const duration = row[5] || 0;
    const status = row[10];

    stats.byType[type] = (stats.byType[type] || 0) + 1;
    stats.totalDuration += duration;

    if (status === 'Completed') stats.completed++;
    if (status === 'Cancelled') stats.cancelled++;
  }

  let report = `
📊 MEETING ANALYTICS
====================

Total Meetings: ${stats.total}
Completed: ${stats.completed}
Cancelled: ${stats.cancelled}

Total Meeting Time: ${Math.round(stats.totalDuration / 60)} hours
Average Duration: ${Math.round(stats.totalDuration / stats.total)} minutes

BY TYPE:
`;

  for (const [type, count] of Object.entries(stats.byType).sort((a, b) => b[1] - a[1])) {
    report += `  ${type}: ${count} (${Math.round(count / stats.total * 100)}%)\n`;
  }

  SpreadsheetApp.getUi().alert(report);
}

// Settings
function openMeetingSettings() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      h3 { color: #2979FF; }
      code { background: #f5f5f5; padding: 2px 6px; }
    </style>
    <h3>⚙️ Meeting Scheduler Settings</h3>
    <p><b>Company:</b> ${CONFIG.COMPANY_NAME}</p>
    <p><b>Default Duration:</b> ${CONFIG.DEFAULT_DURATION} minutes</p>
    <p><b>Default Reminder:</b> ${CONFIG.DEFAULT_REMINDER} minutes</p>
    <p><b>Hourly Cost Default:</b> $${CONFIG.HOURLY_COST_DEFAULT}/person</p>
    <p><b>Meeting Rooms:</b></p>
    <ul>${CONFIG.MEETING_ROOMS.map(r => '<li>' + r + '</li>').join('')}</ul>
    <p><b>Meeting Types:</b></p>
    <ul>${CONFIG.MEETING_TYPES.map(t => '<li>' + t + '</li>').join('')}</ul>
    <p><b>To customize:</b> Edit <code>CONFIG</code> in Apps Script</p>
  `).setWidth(400).setHeight(450);

  SpreadsheetApp.getUi().showModalDialog(html, '⚙️ Settings');
}
