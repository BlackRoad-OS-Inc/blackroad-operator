/**
 * BlackRoad OS - Event Planning & Management
 * Conference, webinar, and event management system
 *
 * Features:
 * - Event creation and scheduling
 * - Attendee registration and tracking
 * - Budget management
 * - Vendor/venue coordination
 * - Task checklists
 * - Communication templates
 * - Post-event analytics
 */

const CONFIG = {
  COMPANY_NAME: 'BlackRoad OS, Inc.',

  EVENT_TYPES: [
    'Conference',
    'Webinar',
    'Workshop',
    'Meetup',
    'Trade Show',
    'Product Launch',
    'Customer Event',
    'Internal Event',
    'Networking',
    'Training'
  ],

  EVENT_STATUSES: ['Planning', 'Confirmed', 'Open for Registration', 'Sold Out', 'In Progress', 'Completed', 'Cancelled'],

  ATTENDEE_STATUSES: ['Registered', 'Confirmed', 'Waitlisted', 'Cancelled', 'Attended', 'No Show'],

  TICKET_TYPES: ['Free', 'Early Bird', 'Regular', 'VIP', 'Speaker', 'Sponsor', 'Staff'],

  TASK_CATEGORIES: ['Venue', 'Catering', 'Marketing', 'Speakers', 'Technology', 'Registration', 'Logistics', 'Follow-up'],

  DEFAULT_CHECKLIST: [
    { task: 'Define event objectives and KPIs', category: 'Planning', daysBeforeEvent: 90 },
    { task: 'Set budget', category: 'Planning', daysBeforeEvent: 90 },
    { task: 'Book venue', category: 'Venue', daysBeforeEvent: 60 },
    { task: 'Confirm speakers/presenters', category: 'Speakers', daysBeforeEvent: 45 },
    { task: 'Create event landing page', category: 'Marketing', daysBeforeEvent: 45 },
    { task: 'Set up registration', category: 'Registration', daysBeforeEvent: 40 },
    { task: 'Launch email campaign', category: 'Marketing', daysBeforeEvent: 30 },
    { task: 'Order catering', category: 'Catering', daysBeforeEvent: 14 },
    { task: 'Prepare presentations', category: 'Speakers', daysBeforeEvent: 7 },
    { task: 'Send reminder emails', category: 'Marketing', daysBeforeEvent: 3 },
    { task: 'Final venue walkthrough', category: 'Venue', daysBeforeEvent: 1 },
    { task: 'Send post-event survey', category: 'Follow-up', daysBeforeEvent: -1 },
    { task: 'Send thank you emails', category: 'Follow-up', daysBeforeEvent: -2 }
  ]
};

/**
 * Creates custom menu on spreadsheet open
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🎪 Events')
    .addItem('➕ Create Event', 'showCreateEventDialog')
    .addItem('✏️ Edit Event', 'showEditEventDialog')
    .addSeparator()
    .addSubMenu(ui.createMenu('👥 Attendees')
      .addItem('Register Attendee', 'showRegisterAttendeeDialog')
      .addItem('View Attendees', 'showAttendeesView')
      .addItem('Check In Attendee', 'showCheckInDialog')
      .addItem('Export Attendee List', 'exportAttendeeList'))
    .addSeparator()
    .addSubMenu(ui.createMenu('💰 Budget')
      .addItem('Add Budget Item', 'showAddBudgetDialog')
      .addItem('View Budget Summary', 'showBudgetSummary')
      .addItem('Track Expenses', 'showExpenseTracking'))
    .addSeparator()
    .addSubMenu(ui.createMenu('✅ Tasks')
      .addItem('View Task Checklist', 'showTaskChecklist')
      .addItem('Add Task', 'showAddTaskDialog')
      .addItem('Generate Default Checklist', 'generateDefaultChecklist')
      .addItem('Overdue Tasks', 'showOverdueTasks'))
    .addSeparator()
    .addSubMenu(ui.createMenu('📧 Communications')
      .addItem('Send Registration Confirmation', 'sendConfirmation')
      .addItem('Send Event Reminder', 'sendReminder')
      .addItem('Send Post-Event Survey', 'sendSurvey')
      .addItem('Email Templates', 'showEmailTemplates'))
    .addSeparator()
    .addSubMenu(ui.createMenu('📊 Reports')
      .addItem('Event Dashboard', 'showEventDashboard')
      .addItem('Registration Report', 'showRegistrationReport')
      .addItem('Attendance Report', 'showAttendanceReport')
      .addItem('ROI Analysis', 'showROIAnalysis'))
    .addSeparator()
    .addItem('⚙️ Settings', 'showSettings')
    .addToUi();
}

/**
 * Shows create event dialog
 */
function showCreateEventDialog() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 12px; }
      label { display: block; margin-bottom: 4px; font-weight: bold; font-size: 13px; }
      input, select, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      textarea { height: 60px; }
      .row { display: flex; gap: 10px; }
      .row .form-group { flex: 1; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; }
      .section { background: #f5f5f5; padding: 10px; border-radius: 8px; margin: 10px 0; }
      .section h3 { margin: 0 0 10px; font-size: 14px; }
    </style>

    <h2>➕ Create Event</h2>

    <div class="section">
      <h3>Event Details</h3>
      <div class="form-group">
        <label>Event Name *</label>
        <input type="text" id="eventName" placeholder="Annual Customer Conference 2024">
      </div>

      <div class="row">
        <div class="form-group">
          <label>Event Type</label>
          <select id="eventType">
            ${CONFIG.EVENT_TYPES.map(t => '<option>' + t + '</option>').join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Capacity</label>
          <input type="number" id="capacity" placeholder="100">
        </div>
      </div>

      <div class="form-group">
        <label>Description</label>
        <textarea id="description" placeholder="Event description..."></textarea>
      </div>
    </div>

    <div class="section">
      <h3>Date & Location</h3>
      <div class="row">
        <div class="form-group">
          <label>Start Date *</label>
          <input type="date" id="startDate">
        </div>
        <div class="form-group">
          <label>End Date</label>
          <input type="date" id="endDate">
        </div>
      </div>

      <div class="row">
        <div class="form-group">
          <label>Start Time</label>
          <input type="time" id="startTime" value="09:00">
        </div>
        <div class="form-group">
          <label>End Time</label>
          <input type="time" id="endTime" value="17:00">
        </div>
      </div>

      <div class="form-group">
        <label>Venue / Location</label>
        <input type="text" id="venue" placeholder="Venue name or 'Virtual'">
      </div>
    </div>

    <div class="section">
      <h3>Budget</h3>
      <div class="row">
        <div class="form-group">
          <label>Budget ($)</label>
          <input type="number" id="budget" placeholder="10000">
        </div>
        <div class="form-group">
          <label>Ticket Price ($)</label>
          <input type="number" id="ticketPrice" placeholder="0 for free">
        </div>
      </div>
    </div>

    <button onclick="createEvent()">Create Event</button>
    <button style="background:#757575" onclick="google.script.host.close()">Cancel</button>

    <script>
      function createEvent() {
        const data = {
          eventName: document.getElementById('eventName').value,
          eventType: document.getElementById('eventType').value,
          capacity: document.getElementById('capacity').value,
          description: document.getElementById('description').value,
          startDate: document.getElementById('startDate').value,
          endDate: document.getElementById('endDate').value,
          startTime: document.getElementById('startTime').value,
          endTime: document.getElementById('endTime').value,
          venue: document.getElementById('venue').value,
          budget: document.getElementById('budget').value,
          ticketPrice: document.getElementById('ticketPrice').value
        };

        if (!data.eventName || !data.startDate) {
          alert('Please fill in required fields');
          return;
        }

        google.script.run
          .withSuccessHandler(() => {
            alert('Event created! Use "Generate Default Checklist" to add tasks.');
            google.script.host.close();
          })
          .withFailureHandler(err => alert('Error: ' + err))
          .createEvent(data);
      }
    </script>
  `)
  .setWidth(500)
  .setHeight(650);

  SpreadsheetApp.getUi().showModalDialog(html, 'Create Event');
}

/**
 * Creates an event
 */
function createEvent(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Events');

  if (!sheet) {
    sheet = ss.insertSheet('Events');
    sheet.appendRow(['Event ID', 'Event Name', 'Type', 'Description', 'Start Date', 'End Date',
                     'Start Time', 'End Time', 'Venue', 'Capacity', 'Registered', 'Attended',
                     'Budget', 'Spent', 'Ticket Price', 'Revenue', 'Status', 'Created', 'Notes']);
    sheet.getRange(1, 1, 1, 19).setFontWeight('bold').setBackground('#E8EAF6');
  }

  const eventId = 'EVT-' + String(sheet.getLastRow()).padStart(4, '0');

  sheet.appendRow([
    eventId,
    data.eventName,
    data.eventType,
    data.description,
    data.startDate ? new Date(data.startDate) : '',
    data.endDate ? new Date(data.endDate) : '',
    data.startTime,
    data.endTime,
    data.venue,
    data.capacity || 0,
    0, // Registered
    0, // Attended
    data.budget || 0,
    0, // Spent
    data.ticketPrice || 0,
    0, // Revenue
    'Planning',
    new Date(),
    ''
  ]);

  return eventId;
}

/**
 * Shows edit event dialog
 */
function showEditEventDialog() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Events');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No events found.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const events = data.slice(1).filter(row => row[16] !== 'Cancelled');

  const eventOptions = events.map(row =>
    `<option value="${row[0]}">${row[0]} - ${row[1]}</option>`
  ).join('');

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 15px; }
      label { display: block; margin-bottom: 5px; font-weight: bold; }
      select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; }
      .danger { background: #F44336; }
    </style>

    <h2>✏️ Edit Event</h2>

    <div class="form-group">
      <label>Select Event</label>
      <select id="eventId">${eventOptions}</select>
    </div>

    <div class="form-group">
      <label>Update Status</label>
      <select id="status">
        ${CONFIG.EVENT_STATUSES.map(s => '<option>' + s + '</option>').join('')}
      </select>
    </div>

    <button onclick="updateEvent()">Update</button>
    <button class="danger" onclick="cancelEvent()">Cancel Event</button>
    <button style="background:#757575" onclick="google.script.host.close()">Close</button>

    <script>
      function updateEvent() {
        const data = {
          eventId: document.getElementById('eventId').value,
          status: document.getElementById('status').value
        };

        google.script.run
          .withSuccessHandler(() => {
            alert('Event updated!');
            google.script.host.close();
          })
          .withFailureHandler(err => alert('Error: ' + err))
          .updateEventStatus(data);
      }

      function cancelEvent() {
        if (!confirm('Are you sure you want to cancel this event?')) return;
        document.getElementById('status').value = 'Cancelled';
        updateEvent();
      }
    </script>
  `)
  .setWidth(400)
  .setHeight(300);

  SpreadsheetApp.getUi().showModalDialog(html, 'Edit Event');
}

/**
 * Updates event status
 */
function updateEventStatus(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Events');
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.eventId) {
      sheet.getRange(i + 1, 17).setValue(data.status);

      if (data.status === 'Cancelled') {
        sheet.getRange(i + 1, 1, 1, 19).setBackground('#FFCDD2');
      } else if (data.status === 'Completed') {
        sheet.getRange(i + 1, 1, 1, 19).setBackground('#E8F5E9');
      }
      break;
    }
  }
}

/**
 * Shows register attendee dialog
 */
function showRegisterAttendeeDialog() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Events');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No events found. Create an event first.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const openEvents = data.slice(1).filter(row =>
    row[16] === 'Open for Registration' || row[16] === 'Planning' || row[16] === 'Confirmed'
  );

  if (openEvents.length === 0) {
    SpreadsheetApp.getUi().alert('No events open for registration.');
    return;
  }

  const eventOptions = openEvents.map(row =>
    `<option value="${row[0]}">${row[1]} (${new Date(row[4]).toLocaleDateString()})</option>`
  ).join('');

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 15px; }
      label { display: block; margin-bottom: 5px; font-weight: bold; }
      input, select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      .row { display: flex; gap: 10px; }
      .row .form-group { flex: 1; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; }
    </style>

    <h2>👥 Register Attendee</h2>

    <div class="form-group">
      <label>Event</label>
      <select id="eventId">${eventOptions}</select>
    </div>

    <div class="row">
      <div class="form-group">
        <label>First Name *</label>
        <input type="text" id="firstName">
      </div>
      <div class="form-group">
        <label>Last Name *</label>
        <input type="text" id="lastName">
      </div>
    </div>

    <div class="form-group">
      <label>Email *</label>
      <input type="email" id="email">
    </div>

    <div class="row">
      <div class="form-group">
        <label>Company</label>
        <input type="text" id="company">
      </div>
      <div class="form-group">
        <label>Ticket Type</label>
        <select id="ticketType">
          ${CONFIG.TICKET_TYPES.map(t => '<option>' + t + '</option>').join('')}
        </select>
      </div>
    </div>

    <button onclick="registerAttendee()">Register</button>
    <button style="background:#757575" onclick="google.script.host.close()">Cancel</button>

    <script>
      function registerAttendee() {
        const data = {
          eventId: document.getElementById('eventId').value,
          firstName: document.getElementById('firstName').value,
          lastName: document.getElementById('lastName').value,
          email: document.getElementById('email').value,
          company: document.getElementById('company').value,
          ticketType: document.getElementById('ticketType').value
        };

        if (!data.firstName || !data.lastName || !data.email) {
          alert('Please fill in required fields');
          return;
        }

        google.script.run
          .withSuccessHandler(() => {
            alert('Attendee registered!');
            google.script.host.close();
          })
          .withFailureHandler(err => alert('Error: ' + err))
          .registerAttendee(data);
      }
    </script>
  `)
  .setWidth(450)
  .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(html, 'Register Attendee');
}

/**
 * Registers an attendee
 */
function registerAttendee(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Attendees');

  if (!sheet) {
    sheet = ss.insertSheet('Attendees');
    sheet.appendRow(['Registration ID', 'Event ID', 'First Name', 'Last Name', 'Email',
                     'Company', 'Ticket Type', 'Status', 'Registered', 'Checked In', 'Notes']);
    sheet.getRange(1, 1, 1, 11).setFontWeight('bold').setBackground('#E8EAF6');
  }

  const regId = 'REG-' + String(sheet.getLastRow()).padStart(5, '0');

  sheet.appendRow([
    regId,
    data.eventId,
    data.firstName,
    data.lastName,
    data.email,
    data.company,
    data.ticketType,
    'Registered',
    new Date(),
    '',
    ''
  ]);

  // Update event registration count
  const eventsSheet = ss.getSheetByName('Events');
  const events = eventsSheet.getDataRange().getValues();

  for (let i = 1; i < events.length; i++) {
    if (events[i][0] === data.eventId) {
      const currentCount = parseInt(events[i][10]) || 0;
      eventsSheet.getRange(i + 1, 11).setValue(currentCount + 1);
      break;
    }
  }

  return regId;
}

/**
 * Shows attendees view
 */
function showAttendeesView() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Attendees');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No attendees found.');
    return;
  }

  const data = sheet.getDataRange().getValues();

  // Group by event
  const byEvent = {};
  data.slice(1).forEach(row => {
    const eventId = row[1];
    if (!byEvent[eventId]) byEvent[eventId] = [];
    byEvent[eventId].push({
      name: row[2] + ' ' + row[3],
      email: row[4],
      status: row[7]
    });
  });

  let html = '<style>body{font-family:Arial,sans-serif;padding:15px;} .event{margin:15px 0;} .event h3{background:#1976D2;color:white;padding:10px;margin:0;} .attendees{border:1px solid #ddd;border-top:none;padding:10px;max-height:200px;overflow-y:auto;} .att{padding:5px;border-bottom:1px solid #eee;font-size:13px;}</style>';

  html += '<h2>Attendee Overview</h2>';

  Object.entries(byEvent).forEach(([eventId, attendees]) => {
    const attended = attendees.filter(a => a.status === 'Attended').length;
    html += `
      <div class="event">
        <h3>${eventId} (${attendees.length} registered, ${attended} attended)</h3>
        <div class="attendees">
          ${attendees.map(a => '<div class="att">' + a.name + ' - ' + a.email + ' <em>(' + a.status + ')</em></div>').join('')}
        </div>
      </div>
    `;
  });

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(550)
    .setHeight(500);

  SpreadsheetApp.getUi().showModalDialog(output, 'Attendees');
}

/**
 * Shows check-in dialog
 */
function showCheckInDialog() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Attendees');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No attendees found.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const registered = data.slice(1).filter(row =>
    row[7] === 'Registered' || row[7] === 'Confirmed'
  );

  const attendeeOptions = registered.map(row =>
    `<option value="${row[0]}">${row[2]} ${row[3]} (${row[4]})</option>`
  ).join('');

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 15px; }
      label { display: block; margin-bottom: 5px; font-weight: bold; }
      select, input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
      button { background: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
    </style>

    <h2>✅ Check In Attendee</h2>

    <div class="form-group">
      <label>Search by Name or Email</label>
      <input type="text" id="search" placeholder="Type to filter..." oninput="filterAttendees()">
    </div>

    <div class="form-group">
      <label>Select Attendee</label>
      <select id="regId" size="10">${attendeeOptions}</select>
    </div>

    <button onclick="checkIn()">Check In</button>

    <script>
      const allOptions = document.getElementById('regId').innerHTML;

      function filterAttendees() {
        const search = document.getElementById('search').value.toLowerCase();
        const select = document.getElementById('regId');
        const options = select.querySelectorAll('option');

        options.forEach(opt => {
          opt.style.display = opt.text.toLowerCase().includes(search) ? '' : 'none';
        });
      }

      function checkIn() {
        const regId = document.getElementById('regId').value;
        if (!regId) {
          alert('Please select an attendee');
          return;
        }

        google.script.run
          .withSuccessHandler(() => {
            alert('Attendee checked in!');
            location.reload();
          })
          .withFailureHandler(err => alert('Error: ' + err))
          .checkInAttendee(regId);
      }
    </script>
  `)
  .setWidth(400)
  .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(html, 'Check In');
}

/**
 * Checks in an attendee
 */
function checkInAttendee(regId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Attendees');
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === regId) {
      sheet.getRange(i + 1, 8).setValue('Attended');
      sheet.getRange(i + 1, 10).setValue(new Date());
      sheet.getRange(i + 1, 1, 1, 11).setBackground('#E8F5E9');

      // Update event attendance count
      const eventId = rows[i][1];
      const eventsSheet = ss.getSheetByName('Events');
      const events = eventsSheet.getDataRange().getValues();

      for (let j = 1; j < events.length; j++) {
        if (events[j][0] === eventId) {
          const currentCount = parseInt(events[j][11]) || 0;
          eventsSheet.getRange(j + 1, 12).setValue(currentCount + 1);
          break;
        }
      }
      break;
    }
  }
}

/**
 * Exports attendee list
 */
function exportAttendeeList() {
  SpreadsheetApp.getUi().alert(
    'Export Attendee List\n\n' +
    'Go to the Attendees sheet and use:\n' +
    'File > Download > CSV or Excel'
  );
}

/**
 * Shows add budget dialog
 */
function showAddBudgetDialog() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const eventsSheet = ss.getSheetByName('Events');

  if (!eventsSheet) {
    SpreadsheetApp.getUi().alert('No events found.');
    return;
  }

  const events = eventsSheet.getDataRange().getValues();
  const eventOptions = events.slice(1).map(row =>
    `<option value="${row[0]}">${row[1]}</option>`
  ).join('');

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 15px; }
      label { display: block; margin-bottom: 5px; font-weight: bold; }
      input, select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; }
    </style>

    <h2>💰 Add Budget Item</h2>

    <div class="form-group">
      <label>Event</label>
      <select id="eventId">${eventOptions}</select>
    </div>

    <div class="form-group">
      <label>Category</label>
      <select id="category">
        <option>Venue</option>
        <option>Catering</option>
        <option>Marketing</option>
        <option>Speakers</option>
        <option>Technology</option>
        <option>Staffing</option>
        <option>Materials</option>
        <option>Travel</option>
        <option>Other</option>
      </select>
    </div>

    <div class="form-group">
      <label>Description</label>
      <input type="text" id="description" placeholder="e.g., Venue rental">
    </div>

    <div class="form-group">
      <label>Amount ($)</label>
      <input type="number" id="amount" placeholder="0.00">
    </div>

    <div class="form-group">
      <label>Status</label>
      <select id="status">
        <option>Estimated</option>
        <option>Committed</option>
        <option>Paid</option>
      </select>
    </div>

    <button onclick="addBudgetItem()">Add</button>
    <button style="background:#757575" onclick="google.script.host.close()">Cancel</button>

    <script>
      function addBudgetItem() {
        const data = {
          eventId: document.getElementById('eventId').value,
          category: document.getElementById('category').value,
          description: document.getElementById('description').value,
          amount: document.getElementById('amount').value,
          status: document.getElementById('status').value
        };

        if (!data.description || !data.amount) {
          alert('Please fill in required fields');
          return;
        }

        google.script.run
          .withSuccessHandler(() => {
            alert('Budget item added!');
            google.script.host.close();
          })
          .withFailureHandler(err => alert('Error: ' + err))
          .addBudgetItem(data);
      }
    </script>
  `)
  .setWidth(400)
  .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(html, 'Add Budget Item');
}

/**
 * Adds a budget item
 */
function addBudgetItem(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Event Budget');

  if (!sheet) {
    sheet = ss.insertSheet('Event Budget');
    sheet.appendRow(['Item ID', 'Event ID', 'Category', 'Description', 'Amount', 'Status', 'Vendor', 'Date Added']);
    sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#E8EAF6');
  }

  const itemId = 'BUD-' + String(sheet.getLastRow()).padStart(4, '0');

  sheet.appendRow([
    itemId,
    data.eventId,
    data.category,
    data.description,
    parseFloat(data.amount) || 0,
    data.status,
    '',
    new Date()
  ]);

  // Update event spent amount if paid
  if (data.status === 'Paid') {
    const eventsSheet = ss.getSheetByName('Events');
    const events = eventsSheet.getDataRange().getValues();

    for (let i = 1; i < events.length; i++) {
      if (events[i][0] === data.eventId) {
        const currentSpent = parseFloat(events[i][13]) || 0;
        eventsSheet.getRange(i + 1, 14).setValue(currentSpent + parseFloat(data.amount));
        break;
      }
    }
  }

  return itemId;
}

/**
 * Shows budget summary
 */
function showBudgetSummary() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const eventsSheet = ss.getSheetByName('Events');
  const budgetSheet = ss.getSheetByName('Event Budget');

  if (!eventsSheet) {
    SpreadsheetApp.getUi().alert('No events found.');
    return;
  }

  const events = eventsSheet.getDataRange().getValues();

  let html = '<style>body{font-family:Arial,sans-serif;padding:15px;} .event{margin:15px 0;padding:15px;background:#f5f5f5;border-radius:8px;} .budget-bar{background:#E0E0E0;height:20px;border-radius:10px;overflow:hidden;margin-top:10px;} .budget-fill{height:100%;}</style>';

  html += '<h2>Budget Summary</h2>';

  events.slice(1).forEach(row => {
    const budget = parseFloat(row[12]) || 0;
    const spent = parseFloat(row[13]) || 0;
    const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
    const color = pct > 90 ? '#F44336' : pct > 70 ? '#FF9800' : '#4CAF50';

    html += `
      <div class="event">
        <strong>${row[1]}</strong><br>
        <small>Budget: $${budget.toLocaleString()} | Spent: $${spent.toLocaleString()} | Remaining: $${(budget - spent).toLocaleString()}</small>
        <div class="budget-bar">
          <div class="budget-fill" style="width:${pct}%;background:${color}"></div>
        </div>
        <small>${pct.toFixed(1)}% used</small>
      </div>
    `;
  });

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(500)
    .setHeight(450);

  SpreadsheetApp.getUi().showModalDialog(output, 'Budget Summary');
}

/**
 * Shows expense tracking
 */
function showExpenseTracking() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Event Budget');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No budget items found.');
    return;
  }

  const data = sheet.getDataRange().getValues();

  // Group by category
  const byCategory = {};
  data.slice(1).forEach(row => {
    const cat = row[2];
    if (!byCategory[cat]) byCategory[cat] = 0;
    byCategory[cat] += parseFloat(row[4]) || 0;
  });

  const total = Object.values(byCategory).reduce((a, b) => a + b, 0);

  let html = '<style>body{font-family:Arial,sans-serif;padding:15px;} .cat{display:flex;justify-content:space-between;padding:10px;border-bottom:1px solid #eee;}</style>';

  html += '<h2>Expense Tracking</h2>';
  html += '<p><strong>Total: $' + total.toLocaleString() + '</strong></p>';

  Object.entries(byCategory).sort((a, b) => b[1] - a[1]).forEach(([cat, amount]) => {
    const pct = total > 0 ? (amount / total * 100).toFixed(1) : 0;
    html += `<div class="cat"><span>${cat}</span><span>$${amount.toLocaleString()} (${pct}%)</span></div>`;
  });

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(400)
    .setHeight(350);

  SpreadsheetApp.getUi().showModalDialog(output, 'Expense Tracking');
}

/**
 * Shows task checklist
 */
function showTaskChecklist() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Event Tasks');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No tasks found. Use "Generate Default Checklist" first.');
    return;
  }

  const data = sheet.getDataRange().getValues();

  let completed = 0, pending = 0, overdue = 0;
  const today = new Date();

  data.slice(1).forEach(row => {
    if (row[5] === 'Completed') completed++;
    else {
      pending++;
      if (row[4] && new Date(row[4]) < today) overdue++;
    }
  });

  const total = completed + pending;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  let html = '<style>body{font-family:Arial,sans-serif;padding:15px;} .progress{background:#E0E0E0;height:30px;border-radius:15px;overflow:hidden;} .progress-bar{background:#4CAF50;height:100%;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;} .stats{display:flex;gap:20px;margin:15px 0;} .stat{text-align:center;flex:1;padding:15px;background:#f5f5f5;border-radius:8px;}</style>';

  html += '<h2>Task Checklist</h2>';

  html += `<div class="progress"><div class="progress-bar" style="width:${pct}%">${pct}%</div></div>`;

  html += `
    <div class="stats">
      <div class="stat"><strong>${completed}</strong><br>Completed</div>
      <div class="stat"><strong>${pending}</strong><br>Pending</div>
      <div class="stat" style="color:#F44336"><strong>${overdue}</strong><br>Overdue</div>
    </div>
  `;

  html += '<p>View the "Event Tasks" sheet for full task list.</p>';

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(400)
    .setHeight(300);

  SpreadsheetApp.getUi().showModalDialog(output, 'Task Checklist');
}

/**
 * Shows add task dialog
 */
function showAddTaskDialog() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const eventsSheet = ss.getSheetByName('Events');

  if (!eventsSheet) {
    SpreadsheetApp.getUi().alert('No events found.');
    return;
  }

  const events = eventsSheet.getDataRange().getValues();
  const eventOptions = events.slice(1).map(row =>
    `<option value="${row[0]}">${row[1]}</option>`
  ).join('');

  const catOptions = CONFIG.TASK_CATEGORIES.map(c =>
    `<option>${c}</option>`
  ).join('');

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 15px; }
      label { display: block; margin-bottom: 5px; font-weight: bold; }
      input, select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; }
    </style>

    <h2>✅ Add Task</h2>

    <div class="form-group">
      <label>Event</label>
      <select id="eventId">${eventOptions}</select>
    </div>

    <div class="form-group">
      <label>Task</label>
      <input type="text" id="task" placeholder="Task description">
    </div>

    <div class="form-group">
      <label>Category</label>
      <select id="category">${catOptions}</select>
    </div>

    <div class="form-group">
      <label>Due Date</label>
      <input type="date" id="dueDate">
    </div>

    <div class="form-group">
      <label>Assigned To</label>
      <input type="text" id="assignee" placeholder="Name">
    </div>

    <button onclick="addTask()">Add Task</button>
    <button style="background:#757575" onclick="google.script.host.close()">Cancel</button>

    <script>
      function addTask() {
        const data = {
          eventId: document.getElementById('eventId').value,
          task: document.getElementById('task').value,
          category: document.getElementById('category').value,
          dueDate: document.getElementById('dueDate').value,
          assignee: document.getElementById('assignee').value
        };

        if (!data.task) {
          alert('Please enter a task');
          return;
        }

        google.script.run
          .withSuccessHandler(() => {
            alert('Task added!');
            google.script.host.close();
          })
          .withFailureHandler(err => alert('Error: ' + err))
          .addEventTask(data);
      }
    </script>
  `)
  .setWidth(400)
  .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(html, 'Add Task');
}

/**
 * Adds an event task
 */
function addEventTask(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Event Tasks');

  if (!sheet) {
    sheet = ss.insertSheet('Event Tasks');
    sheet.appendRow(['Task ID', 'Event ID', 'Task', 'Category', 'Due Date', 'Status', 'Assignee', 'Completed Date', 'Notes']);
    sheet.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#E8EAF6');
  }

  const taskId = 'TSK-' + String(sheet.getLastRow()).padStart(4, '0');

  sheet.appendRow([
    taskId,
    data.eventId,
    data.task,
    data.category,
    data.dueDate ? new Date(data.dueDate) : '',
    'Pending',
    data.assignee,
    '',
    ''
  ]);

  return taskId;
}

/**
 * Generates default checklist for an event
 */
function generateDefaultChecklist() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const eventsSheet = ss.getSheetByName('Events');

  if (!eventsSheet) {
    SpreadsheetApp.getUi().alert('No events found.');
    return;
  }

  const ui = SpreadsheetApp.getUi();
  const events = eventsSheet.getDataRange().getValues();
  const eventList = events.slice(1).map(r => r[0] + ' - ' + r[1]).join('\n');

  const response = ui.prompt(
    'Generate Checklist',
    'Enter Event ID:\n\n' + eventList,
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const eventId = response.getResponseText().split(' ')[0];

  // Find event date
  let eventDate = new Date();
  for (let i = 1; i < events.length; i++) {
    if (events[i][0] === eventId) {
      eventDate = new Date(events[i][4]);
      break;
    }
  }

  // Create tasks
  let tasksSheet = ss.getSheetByName('Event Tasks');
  if (!tasksSheet) {
    tasksSheet = ss.insertSheet('Event Tasks');
    tasksSheet.appendRow(['Task ID', 'Event ID', 'Task', 'Category', 'Due Date', 'Status', 'Assignee', 'Completed Date', 'Notes']);
    tasksSheet.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#E8EAF6');
  }

  CONFIG.DEFAULT_CHECKLIST.forEach(item => {
    const dueDate = new Date(eventDate.getTime() - item.daysBeforeEvent * 24 * 60 * 60 * 1000);
    const taskId = 'TSK-' + String(tasksSheet.getLastRow()).padStart(4, '0');

    tasksSheet.appendRow([
      taskId,
      eventId,
      item.task,
      item.category,
      dueDate,
      'Pending',
      '',
      '',
      ''
    ]);
  });

  ui.alert('Created ' + CONFIG.DEFAULT_CHECKLIST.length + ' tasks for ' + eventId);
}

/**
 * Shows overdue tasks
 */
function showOverdueTasks() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Event Tasks');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No tasks found.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const today = new Date();

  const overdue = data.slice(1).filter(row =>
    row[5] !== 'Completed' && row[4] && new Date(row[4]) < today
  );

  if (overdue.length === 0) {
    SpreadsheetApp.getUi().alert('No overdue tasks!');
    return;
  }

  let html = '<style>body{font-family:Arial,sans-serif;padding:15px;} .task{background:#FFEBEE;padding:15px;margin:10px 0;border-radius:8px;border-left:4px solid #F44336;}</style>';

  html += `<h2>⚠️ Overdue Tasks (${overdue.length})</h2>`;

  overdue.forEach(row => {
    const daysOverdue = Math.ceil((today - new Date(row[4])) / (1000 * 60 * 60 * 24));
    html += `
      <div class="task">
        <strong>${row[2]}</strong><br>
        <small>Event: ${row[1]} | Category: ${row[3]}</small><br>
        <small style="color:#F44336">${daysOverdue} days overdue</small>
      </div>
    `;
  });

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(450)
    .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(output, 'Overdue Tasks');
}

/**
 * Sends confirmation email
 */
function sendConfirmation() {
  SpreadsheetApp.getUi().alert(
    'Send Confirmation\n\n' +
    'To send registration confirmations:\n' +
    '1. Select attendee row in Attendees sheet\n' +
    '2. Use the email template\n\n' +
    'Or set up a trigger for automatic confirmations.'
  );
}

/**
 * Sends reminder email
 */
function sendReminder() {
  SpreadsheetApp.getUi().alert(
    'Send Reminder\n\n' +
    'To send event reminders:\n' +
    '1. Filter attendees by event\n' +
    '2. Use MailApp.sendEmail() in a script\n\n' +
    'Typically sent 1 week and 1 day before the event.'
  );
}

/**
 * Sends survey
 */
function sendSurvey() {
  SpreadsheetApp.getUi().alert(
    'Post-Event Survey\n\n' +
    'Create a Google Form for feedback and send link to attendees.\n\n' +
    'Key questions:\n' +
    '- Overall satisfaction (1-5)\n' +
    '- Would you recommend? (NPS)\n' +
    '- What did you like most?\n' +
    '- What could be improved?'
  );
}

/**
 * Shows email templates
 */
function showEmailTemplates() {
  const templates = {
    'Registration Confirmation': `Subject: You're registered for {{EVENT_NAME}}!

Hi {{FIRST_NAME}},

Thank you for registering for {{EVENT_NAME}}!

Event Details:
- Date: {{EVENT_DATE}}
- Time: {{EVENT_TIME}}
- Location: {{VENUE}}

We look forward to seeing you there!

Best regards,
${CONFIG.COMPANY_NAME}`,

    'Event Reminder': `Subject: Reminder: {{EVENT_NAME}} is coming up!

Hi {{FIRST_NAME}},

Just a friendly reminder that {{EVENT_NAME}} is happening soon!

Event Details:
- Date: {{EVENT_DATE}}
- Time: {{EVENT_TIME}}
- Location: {{VENUE}}

See you there!

Best regards,
${CONFIG.COMPANY_NAME}`,

    'Post-Event Thank You': `Subject: Thank you for attending {{EVENT_NAME}}!

Hi {{FIRST_NAME}},

Thank you for attending {{EVENT_NAME}}! We hope you found it valuable.

We'd love to hear your feedback: [Survey Link]

Stay tuned for future events!

Best regards,
${CONFIG.COMPANY_NAME}`
  };

  let html = '<style>body{font-family:Arial,sans-serif;padding:15px;} .template{background:#f5f5f5;padding:15px;margin:15px 0;border-radius:8px;} .template h4{margin:0 0 10px;} pre{background:white;padding:10px;border-radius:4px;font-size:12px;white-space:pre-wrap;}</style>';

  html += '<h2>📧 Email Templates</h2>';

  Object.entries(templates).forEach(([name, content]) => {
    html += `
      <div class="template">
        <h4>${name}</h4>
        <pre>${content}</pre>
      </div>
    `;
  });

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(550)
    .setHeight(500);

  SpreadsheetApp.getUi().showModalDialog(output, 'Email Templates');
}

/**
 * Shows event dashboard
 */
function showEventDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const eventsSheet = ss.getSheetByName('Events');

  if (!eventsSheet) {
    SpreadsheetApp.getUi().alert('No events found.');
    return;
  }

  const events = eventsSheet.getDataRange().getValues();

  let totalEvents = 0, totalAttendees = 0, totalRevenue = 0;

  events.slice(1).forEach(row => {
    if (row[16] !== 'Cancelled') {
      totalEvents++;
      totalAttendees += parseInt(row[11]) || 0;
      totalRevenue += parseFloat(row[15]) || 0;
    }
  });

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      .metrics { display: flex; flex-wrap: wrap; gap: 15px; }
      .metric { flex: 1; min-width: 120px; background: #E3F2FD; padding: 20px; border-radius: 8px; text-align: center; }
      .metric h2 { margin: 0; font-size: 32px; color: #1565C0; }
      .metric.success { background: #E8F5E9; }
      .metric.success h2 { color: #2E7D32; }
    </style>

    <h2>Event Dashboard</h2>

    <div class="metrics">
      <div class="metric">
        <h2>${totalEvents}</h2>
        <p>Total Events</p>
      </div>
      <div class="metric">
        <h2>${totalAttendees.toLocaleString()}</h2>
        <p>Total Attendees</p>
      </div>
      <div class="metric success">
        <h2>$${totalRevenue.toLocaleString()}</h2>
        <p>Total Revenue</p>
      </div>
    </div>
  `)
  .setWidth(450)
  .setHeight(250);

  SpreadsheetApp.getUi().showModalDialog(html, 'Event Dashboard');
}

/**
 * Shows registration report
 */
function showRegistrationReport() {
  showAttendeesView();
}

/**
 * Shows attendance report
 */
function showAttendanceReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const eventsSheet = ss.getSheetByName('Events');

  if (!eventsSheet) {
    SpreadsheetApp.getUi().alert('No events found.');
    return;
  }

  const events = eventsSheet.getDataRange().getValues();

  let html = '<style>body{font-family:Arial,sans-serif;padding:15px;} table{width:100%;border-collapse:collapse;} th,td{border:1px solid #ddd;padding:10px;text-align:left;} th{background:#E8EAF6;}</style>';

  html += '<h2>Attendance Report</h2>';
  html += '<table><tr><th>Event</th><th>Capacity</th><th>Registered</th><th>Attended</th><th>Rate</th></tr>';

  events.slice(1).forEach(row => {
    if (row[16] === 'Completed') {
      const capacity = parseInt(row[9]) || 0;
      const registered = parseInt(row[10]) || 0;
      const attended = parseInt(row[11]) || 0;
      const rate = registered > 0 ? Math.round((attended / registered) * 100) : 0;

      html += `<tr>
        <td>${row[1]}</td>
        <td>${capacity}</td>
        <td>${registered}</td>
        <td>${attended}</td>
        <td>${rate}%</td>
      </tr>`;
    }
  });

  html += '</table>';

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(550)
    .setHeight(350);

  SpreadsheetApp.getUi().showModalDialog(output, 'Attendance Report');
}

/**
 * Shows ROI analysis
 */
function showROIAnalysis() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const eventsSheet = ss.getSheetByName('Events');

  if (!eventsSheet) {
    SpreadsheetApp.getUi().alert('No events found.');
    return;
  }

  const events = eventsSheet.getDataRange().getValues();

  let html = '<style>body{font-family:Arial,sans-serif;padding:15px;} .event{margin:15px 0;padding:15px;background:#f5f5f5;border-radius:8px;} .positive{color:#4CAF50;} .negative{color:#F44336;}</style>';

  html += '<h2>ROI Analysis</h2>';

  events.slice(1).forEach(row => {
    const budget = parseFloat(row[12]) || 0;
    const spent = parseFloat(row[13]) || 0;
    const revenue = parseFloat(row[15]) || 0;
    const profit = revenue - spent;
    const roi = spent > 0 ? ((profit / spent) * 100).toFixed(1) : 0;

    html += `
      <div class="event">
        <strong>${row[1]}</strong><br>
        <small>Revenue: $${revenue.toLocaleString()} | Cost: $${spent.toLocaleString()}</small><br>
        <strong class="${profit >= 0 ? 'positive' : 'negative'}">
          Profit: $${profit.toLocaleString()} (ROI: ${roi}%)
        </strong>
      </div>
    `;
  });

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(450)
    .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(output, 'ROI Analysis');
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
      <label>Event Types</label>
      <input type="text" value="${CONFIG.EVENT_TYPES.length} types" disabled>
    </div>

    <div class="setting">
      <label>Ticket Types</label>
      <input type="text" value="${CONFIG.TICKET_TYPES.join(', ')}" disabled>
    </div>

    <div class="setting">
      <label>Default Checklist Tasks</label>
      <input type="text" value="${CONFIG.DEFAULT_CHECKLIST.length} tasks" disabled>
    </div>

    <p><em>Edit CONFIG in Extensions > Apps Script to customize.</em></p>

    <button onclick="google.script.host.close()">Close</button>
  `)
  .setWidth(350)
  .setHeight(300);

  SpreadsheetApp.getUi().showModalDialog(html, 'Settings');
}
