/**
 * BlackRoad OS - Resource Booking System
 * Book conference rooms, equipment, and shared resources
 *
 * Features:
 * - Conference room booking with calendar sync
 * - Equipment checkout/return tracking
 * - Vehicle reservation
 * - Shared resource management
 * - Availability calendar view
 * - Conflict detection
 * - Usage analytics
 */

const CONFIG = {
  COMPANY_NAME: 'BlackRoad OS, Inc.',

  // Sheet names
  SHEETS: {
    RESOURCES: 'Resources',
    BOOKINGS: 'Bookings',
    EQUIPMENT: 'Equipment',
    CHECKOUTS: 'Checkouts'
  },

  // Resource types
  RESOURCE_TYPES: [
    'Conference Room',
    'Meeting Room',
    'Phone Booth',
    'Hot Desk',
    'Parking Spot',
    'Vehicle',
    'AV Equipment',
    'Laptop/Device',
    'Camera/Video',
    'Presentation Kit',
    'Event Space',
    'Kitchen/Catering'
  ],

  // Booking statuses
  BOOKING_STATUS: [
    'Confirmed',
    'Pending',
    'Cancelled',
    'Completed',
    'No Show'
  ],

  // Checkout statuses
  CHECKOUT_STATUS: [
    'Checked Out',
    'Returned',
    'Overdue',
    'Lost/Damaged'
  ],

  // Time slots
  TIME_SLOTS: [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00'
  ],

  // Default booking durations (minutes)
  DURATIONS: [15, 30, 45, 60, 90, 120, 180, 240, 480]
};

// ============================================
// MENU SETUP
// ============================================

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📅 Bookings')
    .addItem('🏢 Book Conference Room', 'bookConferenceRoom')
    .addItem('📱 Check Out Equipment', 'checkOutEquipment')
    .addItem('🔙 Return Equipment', 'returnEquipment')
    .addSeparator()
    .addSubMenu(ui.createMenu('📋 Resources')
      .addItem('Add Resource', 'addResource')
      .addItem('Add Equipment', 'addEquipment')
      .addItem('View All Resources', 'viewAllResources'))
    .addSeparator()
    .addSubMenu(ui.createMenu('📊 Availability')
      .addItem('Room Availability Today', 'showTodayAvailability')
      .addItem('Weekly Calendar View', 'showWeeklyCalendar')
      .addItem('Equipment Status', 'showEquipmentStatus'))
    .addSeparator()
    .addSubMenu(ui.createMenu('📈 Reports')
      .addItem('Usage Report', 'showUsageReport')
      .addItem('Popular Resources', 'showPopularResources')
      .addItem('Overdue Equipment', 'showOverdueEquipment'))
    .addSeparator()
    .addItem('❌ Cancel Booking', 'cancelBooking')
    .addItem('📧 Send Confirmation', 'sendBookingConfirmation')
    .addItem('⚙️ Settings', 'showSettings')
    .addToUi();
}

// ============================================
// RESOURCE MANAGEMENT
// ============================================

function addResource() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 12px; }
      label { display: block; font-weight: bold; margin-bottom: 4px; }
      input, select, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      .row { display: flex; gap: 10px; }
      .row .form-group { flex: 1; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
      .amenities { display: flex; flex-wrap: wrap; gap: 10px; }
      .amenity { padding: 5px 10px; background: #e8f0fe; border-radius: 15px; font-size: 12px; cursor: pointer; }
      .amenity.selected { background: #4285f4; color: white; }
    </style>

    <h2>🏢 Add Resource</h2>

    <div class="form-group">
      <label>Resource Name *</label>
      <input type="text" id="name" placeholder="e.g., Conference Room A">
    </div>

    <div class="row">
      <div class="form-group">
        <label>Type</label>
        <select id="type">
          ${CONFIG.RESOURCE_TYPES.map(t => '<option>' + t + '</option>').join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Capacity</label>
        <input type="number" id="capacity" value="6">
      </div>
    </div>

    <div class="row">
      <div class="form-group">
        <label>Location/Floor</label>
        <input type="text" id="location" placeholder="e.g., 3rd Floor, Building A">
      </div>
      <div class="form-group">
        <label>Building</label>
        <input type="text" id="building" placeholder="e.g., HQ">
      </div>
    </div>

    <div class="form-group">
      <label>Amenities (click to select)</label>
      <div class="amenities" id="amenities">
        <span class="amenity" onclick="toggleAmenity(this)">TV/Display</span>
        <span class="amenity" onclick="toggleAmenity(this)">Whiteboard</span>
        <span class="amenity" onclick="toggleAmenity(this)">Video Conferencing</span>
        <span class="amenity" onclick="toggleAmenity(this)">Phone</span>
        <span class="amenity" onclick="toggleAmenity(this)">Projector</span>
        <span class="amenity" onclick="toggleAmenity(this)">Catering Available</span>
        <span class="amenity" onclick="toggleAmenity(this)">Natural Light</span>
        <span class="amenity" onclick="toggleAmenity(this)">Standing Desk</span>
      </div>
    </div>

    <div class="form-group">
      <label>Booking Rules</label>
      <select id="rules">
        <option>Anyone can book</option>
        <option>Manager approval required</option>
        <option>Admin only</option>
        <option>Executive only</option>
      </select>
    </div>

    <div class="form-group">
      <label>Description/Notes</label>
      <textarea id="description" rows="2"></textarea>
    </div>

    <button onclick="saveResource()">Add Resource</button>

    <script>
      function toggleAmenity(el) {
        el.classList.toggle('selected');
      }

      function saveResource() {
        const amenities = Array.from(document.querySelectorAll('.amenity.selected'))
          .map(el => el.textContent).join(', ');

        const data = {
          name: document.getElementById('name').value,
          type: document.getElementById('type').value,
          capacity: document.getElementById('capacity').value,
          location: document.getElementById('location').value,
          building: document.getElementById('building').value,
          amenities: amenities,
          rules: document.getElementById('rules').value,
          description: document.getElementById('description').value
        };

        if (!data.name) {
          alert('Please enter a resource name');
          return;
        }

        google.script.run
          .withSuccessHandler(() => {
            alert('Resource added!');
            google.script.host.close();
          })
          .saveResource(data);
      }
    </script>
  `)
  .setWidth(450)
  .setHeight(600);

  SpreadsheetApp.getUi().showModalDialog(html, 'Add Resource');
}

function saveResource(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEETS.RESOURCES);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.RESOURCES);
    sheet.appendRow([
      'Resource ID', 'Name', 'Type', 'Capacity', 'Location',
      'Building', 'Amenities', 'Booking Rules', 'Description',
      'Status', 'Calendar ID', 'Created Date'
    ]);
    sheet.getRange(1, 1, 1, 12).setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
  }

  const lastRow = sheet.getLastRow();
  const id = 'RES-' + String(lastRow).padStart(4, '0');

  sheet.appendRow([
    id,
    data.name,
    data.type,
    data.capacity,
    data.location,
    data.building,
    data.amenities,
    data.rules,
    data.description,
    'Available',
    '', // Calendar ID for sync
    new Date()
  ]);

  return id;
}

// ============================================
// CONFERENCE ROOM BOOKING
// ============================================

function bookConferenceRoom() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const resourcesSheet = ss.getSheetByName(CONFIG.SHEETS.RESOURCES);

  let roomOptions = '<option value="">Select a room...</option>';
  if (resourcesSheet && resourcesSheet.getLastRow() > 1) {
    const resources = resourcesSheet.getRange(2, 1, resourcesSheet.getLastRow() - 1, 6).getValues();
    const rooms = resources.filter(r => r[2].includes('Room') || r[2].includes('Space'));
    roomOptions += rooms.map(r =>
      `<option value="${r[0]}">${r[1]} (${r[3]} people) - ${r[4]}</option>`
    ).join('');
  }

  const today = new Date().toISOString().split('T')[0];

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 12px; }
      label { display: block; font-weight: bold; margin-bottom: 4px; }
      input, select, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      .row { display: flex; gap: 10px; }
      .row .form-group { flex: 1; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
      .preview { background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 15px 0; }
    </style>

    <h2>🏢 Book Conference Room</h2>

    <div class="form-group">
      <label>Select Room *</label>
      <select id="roomId">${roomOptions}</select>
    </div>

    <div class="form-group">
      <label>Meeting Title *</label>
      <input type="text" id="title" placeholder="e.g., Team Standup, Client Call">
    </div>

    <div class="form-group">
      <label>Date *</label>
      <input type="date" id="date" value="${today}">
    </div>

    <div class="row">
      <div class="form-group">
        <label>Start Time</label>
        <select id="startTime">
          ${CONFIG.TIME_SLOTS.map(t => '<option>' + t + '</option>').join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Duration</label>
        <select id="duration">
          ${CONFIG.DURATIONS.map(d => '<option value="' + d + '">' + (d >= 60 ? (d/60) + ' hr' : d + ' min') + '</option>').join('')}
        </select>
      </div>
    </div>

    <div class="form-group">
      <label>Booked By *</label>
      <input type="text" id="bookedBy" placeholder="Your name">
    </div>

    <div class="form-group">
      <label>Email *</label>
      <input type="email" id="email" placeholder="your.email@company.com">
    </div>

    <div class="form-group">
      <label>Attendees (optional)</label>
      <input type="number" id="attendees" placeholder="Number of attendees">
    </div>

    <div class="form-group">
      <label>Notes</label>
      <textarea id="notes" rows="2" placeholder="Special requirements, catering needs, etc."></textarea>
    </div>

    <div class="form-group">
      <label><input type="checkbox" id="recurring"> Recurring meeting</label>
    </div>

    <div class="form-group">
      <label><input type="checkbox" id="addToCalendar" checked> Add to Google Calendar</label>
    </div>

    <button onclick="submitBooking()">Book Room</button>

    <script>
      function submitBooking() {
        const data = {
          roomId: document.getElementById('roomId').value,
          title: document.getElementById('title').value,
          date: document.getElementById('date').value,
          startTime: document.getElementById('startTime').value,
          duration: document.getElementById('duration').value,
          bookedBy: document.getElementById('bookedBy').value,
          email: document.getElementById('email').value,
          attendees: document.getElementById('attendees').value,
          notes: document.getElementById('notes').value,
          recurring: document.getElementById('recurring').checked,
          addToCalendar: document.getElementById('addToCalendar').checked
        };

        if (!data.roomId || !data.title || !data.date || !data.bookedBy || !data.email) {
          alert('Please fill in all required fields');
          return;
        }

        google.script.run
          .withSuccessHandler(result => {
            alert(result);
            google.script.host.close();
          })
          .withFailureHandler(err => alert('Error: ' + err))
          .saveBooking(data);
      }
    </script>
  `)
  .setWidth(450)
  .setHeight(650);

  SpreadsheetApp.getUi().showModalDialog(html, 'Book Conference Room');
}

function saveBooking(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEETS.BOOKINGS);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.BOOKINGS);
    sheet.appendRow([
      'Booking ID', 'Resource ID', 'Resource Name', 'Title', 'Date',
      'Start Time', 'End Time', 'Duration (min)', 'Booked By', 'Email',
      'Attendees', 'Status', 'Calendar Event ID', 'Notes', 'Created'
    ]);
    sheet.getRange(1, 1, 1, 15).setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
  }

  // Check for conflicts
  const existingBookings = sheet.getLastRow() > 1
    ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 15).getValues()
    : [];

  const requestedStart = new Date(data.date + 'T' + data.startTime);
  const requestedEnd = new Date(requestedStart.getTime() + parseInt(data.duration) * 60000);

  const conflict = existingBookings.find(booking => {
    if (booking[1] !== data.roomId) return false;
    if (booking[11] === 'Cancelled') return false;

    const bookingDate = new Date(booking[4]).toDateString();
    const requestDate = new Date(data.date).toDateString();
    if (bookingDate !== requestDate) return false;

    const existingStart = new Date(booking[4].toDateString() + ' ' + booking[5]);
    const existingEnd = new Date(booking[4].toDateString() + ' ' + booking[6]);

    return (requestedStart < existingEnd && requestedEnd > existingStart);
  });

  if (conflict) {
    throw new Error('This room is already booked during that time. Please choose a different time or room.');
  }

  // Get resource name
  const resourcesSheet = ss.getSheetByName(CONFIG.SHEETS.RESOURCES);
  let resourceName = data.roomId;
  if (resourcesSheet) {
    const resources = resourcesSheet.getRange(2, 1, resourcesSheet.getLastRow() - 1, 2).getValues();
    const resource = resources.find(r => r[0] === data.roomId);
    if (resource) resourceName = resource[1];
  }

  // Calculate end time
  const endTime = new Date(requestedStart.getTime() + parseInt(data.duration) * 60000);
  const endTimeStr = endTime.getHours().toString().padStart(2, '0') + ':' +
                     endTime.getMinutes().toString().padStart(2, '0');

  const lastRow = sheet.getLastRow();
  const bookingId = 'BK-' + Utilities.formatDate(new Date(), 'GMT', 'yyyyMMdd') + '-' + String(lastRow).padStart(4, '0');

  let calendarEventId = '';

  // Create calendar event if requested
  if (data.addToCalendar) {
    try {
      const event = CalendarApp.getDefaultCalendar().createEvent(
        data.title + ' - ' + resourceName,
        requestedStart,
        requestedEnd,
        {
          description: 'Room: ' + resourceName + '\nBooked by: ' + data.bookedBy + '\n\n' + (data.notes || ''),
          location: resourceName
        }
      );
      calendarEventId = event.getId();
    } catch (e) {
      // Calendar access may not be available
    }
  }

  sheet.appendRow([
    bookingId,
    data.roomId,
    resourceName,
    data.title,
    new Date(data.date),
    data.startTime,
    endTimeStr,
    data.duration,
    data.bookedBy,
    data.email,
    data.attendees || '',
    'Confirmed',
    calendarEventId,
    data.notes,
    new Date()
  ]);

  // Color code row
  sheet.getRange(sheet.getLastRow(), 1, 1, 15).setBackground('#d9ead3');

  return `Booking confirmed!\n\nID: ${bookingId}\nRoom: ${resourceName}\nDate: ${data.date}\nTime: ${data.startTime} - ${endTimeStr}`;
}

// ============================================
// EQUIPMENT MANAGEMENT
// ============================================

function addEquipment() {
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

    <h2>📱 Add Equipment</h2>

    <div class="form-group">
      <label>Equipment Name *</label>
      <input type="text" id="name" placeholder="e.g., MacBook Pro #3">
    </div>

    <div class="row">
      <div class="form-group">
        <label>Type</label>
        <select id="type">
          <option>Laptop</option>
          <option>Monitor</option>
          <option>Camera</option>
          <option>Microphone</option>
          <option>Projector</option>
          <option>Webcam</option>
          <option>Tripod</option>
          <option>Lighting Kit</option>
          <option>AV Equipment</option>
          <option>Vehicle</option>
          <option>Other</option>
        </select>
      </div>
      <div class="form-group">
        <label>Asset Tag/Serial</label>
        <input type="text" id="assetTag">
      </div>
    </div>

    <div class="form-group">
      <label>Description</label>
      <textarea id="description" rows="2" placeholder="Model, specs, accessories included..."></textarea>
    </div>

    <div class="row">
      <div class="form-group">
        <label>Location</label>
        <input type="text" id="location" placeholder="e.g., IT Closet, Reception">
      </div>
      <div class="form-group">
        <label>Max Checkout Days</label>
        <input type="number" id="maxDays" value="7">
      </div>
    </div>

    <div class="form-group">
      <label>Condition</label>
      <select id="condition">
        <option>Excellent</option>
        <option>Good</option>
        <option>Fair</option>
        <option>Needs Repair</option>
      </select>
    </div>

    <button onclick="saveEquipment()">Add Equipment</button>

    <script>
      function saveEquipment() {
        const data = {
          name: document.getElementById('name').value,
          type: document.getElementById('type').value,
          assetTag: document.getElementById('assetTag').value,
          description: document.getElementById('description').value,
          location: document.getElementById('location').value,
          maxDays: document.getElementById('maxDays').value,
          condition: document.getElementById('condition').value
        };

        if (!data.name) {
          alert('Please enter equipment name');
          return;
        }

        google.script.run
          .withSuccessHandler(() => {
            alert('Equipment added!');
            google.script.host.close();
          })
          .saveEquipmentItem(data);
      }
    </script>
  `)
  .setWidth(400)
  .setHeight(500);

  SpreadsheetApp.getUi().showModalDialog(html, 'Add Equipment');
}

function saveEquipmentItem(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEETS.EQUIPMENT);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.EQUIPMENT);
    sheet.appendRow([
      'Equipment ID', 'Name', 'Type', 'Asset Tag', 'Description',
      'Location', 'Max Checkout Days', 'Condition', 'Status',
      'Current User', 'Due Date', 'Added Date'
    ]);
    sheet.getRange(1, 1, 1, 12).setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
  }

  const id = 'EQ-' + String(sheet.getLastRow()).padStart(4, '0');

  sheet.appendRow([
    id,
    data.name,
    data.type,
    data.assetTag,
    data.description,
    data.location,
    data.maxDays,
    data.condition,
    'Available',
    '',
    '',
    new Date()
  ]);

  return id;
}

// ============================================
// EQUIPMENT CHECKOUT
// ============================================

function checkOutEquipment() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const equipmentSheet = ss.getSheetByName(CONFIG.SHEETS.EQUIPMENT);

  if (!equipmentSheet || equipmentSheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('No equipment found. Add equipment first.');
    return;
  }

  const equipment = equipmentSheet.getRange(2, 1, equipmentSheet.getLastRow() - 1, 12).getValues();
  const available = equipment.filter(e => e[8] === 'Available');

  if (available.length === 0) {
    SpreadsheetApp.getUi().alert('No equipment currently available for checkout.');
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

    <h2>📱 Check Out Equipment</h2>

    <div class="form-group">
      <label>Select Equipment *</label>
      <select id="equipmentId">
        <option value="">Choose equipment...</option>
        ${available.map(e => `<option value="${e[0]}">${e[1]} (${e[2]}) - ${e[5]}</option>`).join('')}
      </select>
    </div>

    <div class="form-group">
      <label>Your Name *</label>
      <input type="text" id="userName">
    </div>

    <div class="form-group">
      <label>Your Email *</label>
      <input type="email" id="userEmail">
    </div>

    <div class="form-group">
      <label>Department</label>
      <input type="text" id="department">
    </div>

    <div class="form-group">
      <label>Return Date *</label>
      <input type="date" id="returnDate">
    </div>

    <div class="form-group">
      <label>Purpose/Project</label>
      <input type="text" id="purpose" placeholder="What will you use this for?">
    </div>

    <button onclick="checkOut()">Check Out</button>

    <script>
      // Set default return date to 7 days from now
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      document.getElementById('returnDate').value = defaultDate.toISOString().split('T')[0];

      function checkOut() {
        const data = {
          equipmentId: document.getElementById('equipmentId').value,
          userName: document.getElementById('userName').value,
          userEmail: document.getElementById('userEmail').value,
          department: document.getElementById('department').value,
          returnDate: document.getElementById('returnDate').value,
          purpose: document.getElementById('purpose').value
        };

        if (!data.equipmentId || !data.userName || !data.userEmail || !data.returnDate) {
          alert('Please fill in all required fields');
          return;
        }

        google.script.run
          .withSuccessHandler(result => {
            alert(result);
            google.script.host.close();
          })
          .processCheckout(data);
      }
    </script>
  `)
  .setWidth(400)
  .setHeight(500);

  SpreadsheetApp.getUi().showModalDialog(html, 'Check Out Equipment');
}

function processCheckout(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Update equipment status
  const equipmentSheet = ss.getSheetByName(CONFIG.SHEETS.EQUIPMENT);
  const equipmentData = equipmentSheet.getRange(2, 1, equipmentSheet.getLastRow() - 1, 12).getValues();
  const rowIndex = equipmentData.findIndex(e => e[0] === data.equipmentId);

  if (rowIndex === -1) throw new Error('Equipment not found');

  const row = rowIndex + 2;
  equipmentSheet.getRange(row, 9).setValue('Checked Out');
  equipmentSheet.getRange(row, 10).setValue(data.userName);
  equipmentSheet.getRange(row, 11).setValue(new Date(data.returnDate));
  equipmentSheet.getRange(row, 1, 1, 12).setBackground('#fff2cc');

  // Log checkout
  let checkoutsSheet = ss.getSheetByName(CONFIG.SHEETS.CHECKOUTS);
  if (!checkoutsSheet) {
    checkoutsSheet = ss.insertSheet(CONFIG.SHEETS.CHECKOUTS);
    checkoutsSheet.appendRow([
      'Checkout ID', 'Equipment ID', 'Equipment Name', 'Checked Out By',
      'Email', 'Department', 'Checkout Date', 'Due Date', 'Return Date',
      'Status', 'Purpose', 'Notes'
    ]);
    checkoutsSheet.getRange(1, 1, 1, 12).setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
  }

  const checkoutId = 'CO-' + Utilities.formatDate(new Date(), 'GMT', 'yyyyMMdd') + '-' + String(checkoutsSheet.getLastRow()).padStart(4, '0');
  const equipmentName = equipmentData[rowIndex][1];

  checkoutsSheet.appendRow([
    checkoutId,
    data.equipmentId,
    equipmentName,
    data.userName,
    data.userEmail,
    data.department,
    new Date(),
    new Date(data.returnDate),
    '',
    'Checked Out',
    data.purpose,
    ''
  ]);

  return `Equipment checked out!\n\nID: ${checkoutId}\nEquipment: ${equipmentName}\nDue: ${data.returnDate}`;
}

// ============================================
// EQUIPMENT RETURN
// ============================================

function returnEquipment() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const equipmentSheet = ss.getSheetByName(CONFIG.SHEETS.EQUIPMENT);

  if (!equipmentSheet || equipmentSheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('No equipment found.');
    return;
  }

  const equipment = equipmentSheet.getRange(2, 1, equipmentSheet.getLastRow() - 1, 12).getValues();
  const checkedOut = equipment.filter(e => e[8] === 'Checked Out');

  if (checkedOut.length === 0) {
    SpreadsheetApp.getUi().alert('No equipment is currently checked out.');
    return;
  }

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 12px; }
      label { display: block; font-weight: bold; margin-bottom: 4px; }
      input, select, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
    </style>

    <h2>🔙 Return Equipment</h2>

    <div class="form-group">
      <label>Select Equipment *</label>
      <select id="equipmentId">
        <option value="">Choose equipment...</option>
        ${checkedOut.map(e => `<option value="${e[0]}">${e[1]} - Checked out by ${e[9]}</option>`).join('')}
      </select>
    </div>

    <div class="form-group">
      <label>Condition on Return</label>
      <select id="condition">
        <option>Excellent</option>
        <option>Good</option>
        <option>Fair</option>
        <option>Damaged - Needs Repair</option>
        <option>Lost</option>
      </select>
    </div>

    <div class="form-group">
      <label>Return Notes</label>
      <textarea id="notes" rows="3" placeholder="Any issues or notes..."></textarea>
    </div>

    <button onclick="processReturn()">Process Return</button>

    <script>
      function processReturn() {
        const data = {
          equipmentId: document.getElementById('equipmentId').value,
          condition: document.getElementById('condition').value,
          notes: document.getElementById('notes').value
        };

        if (!data.equipmentId) {
          alert('Please select equipment');
          return;
        }

        google.script.run
          .withSuccessHandler(result => {
            alert(result);
            google.script.host.close();
          })
          .processEquipmentReturn(data);
      }
    </script>
  `)
  .setWidth(400)
  .setHeight(350);

  SpreadsheetApp.getUi().showModalDialog(html, 'Return Equipment');
}

function processEquipmentReturn(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Update equipment status
  const equipmentSheet = ss.getSheetByName(CONFIG.SHEETS.EQUIPMENT);
  const equipmentData = equipmentSheet.getRange(2, 1, equipmentSheet.getLastRow() - 1, 12).getValues();
  const rowIndex = equipmentData.findIndex(e => e[0] === data.equipmentId);

  if (rowIndex === -1) throw new Error('Equipment not found');

  const row = rowIndex + 2;
  const needsRepair = data.condition.includes('Damaged') || data.condition === 'Lost';

  equipmentSheet.getRange(row, 8).setValue(data.condition);
  equipmentSheet.getRange(row, 9).setValue(needsRepair ? 'Needs Repair' : 'Available');
  equipmentSheet.getRange(row, 10).setValue('');
  equipmentSheet.getRange(row, 11).setValue('');
  equipmentSheet.getRange(row, 1, 1, 12).setBackground(needsRepair ? '#fce8e6' : '#d9ead3');

  // Update checkout record
  const checkoutsSheet = ss.getSheetByName(CONFIG.SHEETS.CHECKOUTS);
  if (checkoutsSheet && checkoutsSheet.getLastRow() > 1) {
    const checkouts = checkoutsSheet.getRange(2, 1, checkoutsSheet.getLastRow() - 1, 12).getValues();
    const checkoutIndex = checkouts.findIndex(c => c[1] === data.equipmentId && c[9] === 'Checked Out');

    if (checkoutIndex !== -1) {
      const checkoutRow = checkoutIndex + 2;
      checkoutsSheet.getRange(checkoutRow, 9).setValue(new Date()); // Return date
      checkoutsSheet.getRange(checkoutRow, 10).setValue('Returned');
      checkoutsSheet.getRange(checkoutRow, 12).setValue(data.notes);
    }
  }

  return `Equipment returned!\n\nCondition: ${data.condition}`;
}

// ============================================
// AVAILABILITY VIEWS
// ============================================

function showTodayAvailability() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const resourcesSheet = ss.getSheetByName(CONFIG.SHEETS.RESOURCES);
  const bookingsSheet = ss.getSheetByName(CONFIG.SHEETS.BOOKINGS);

  if (!resourcesSheet || resourcesSheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('No resources found. Add resources first.');
    return;
  }

  const resources = resourcesSheet.getRange(2, 1, resourcesSheet.getLastRow() - 1, 12).getValues()
    .filter(r => r[2].includes('Room') || r[2].includes('Space'));

  const today = new Date();
  const todayStr = today.toDateString();

  const bookings = bookingsSheet && bookingsSheet.getLastRow() > 1
    ? bookingsSheet.getRange(2, 1, bookingsSheet.getLastRow() - 1, 15).getValues()
        .filter(b => new Date(b[4]).toDateString() === todayStr && b[11] !== 'Cancelled')
    : [];

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .room { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
      .room-name { font-weight: bold; font-size: 16px; }
      .room-info { font-size: 12px; color: #666; margin: 5px 0; }
      .timeline { display: flex; gap: 2px; margin-top: 10px; }
      .slot { flex: 1; height: 30px; border-radius: 3px; font-size: 10px; text-align: center; line-height: 30px; }
      .available { background: #d9ead3; }
      .booked { background: #fce8e6; }
      .current { border: 2px solid #4285f4; }
      .legend { display: flex; gap: 15px; margin-bottom: 15px; font-size: 12px; }
      .legend-item { display: flex; align-items: center; gap: 5px; }
      .legend-color { width: 16px; height: 16px; border-radius: 3px; }
    </style>

    <h2>📅 Room Availability - ${today.toLocaleDateString()}</h2>

    <div class="legend">
      <div class="legend-item"><div class="legend-color available"></div> Available</div>
      <div class="legend-item"><div class="legend-color booked"></div> Booked</div>
    </div>

    ${resources.map(room => {
      const roomBookings = bookings.filter(b => b[1] === room[0]);

      return `
        <div class="room">
          <div class="room-name">${room[1]}</div>
          <div class="room-info">${room[4]} • Capacity: ${room[3]} • ${room[6] || 'No amenities listed'}</div>
          <div class="timeline">
            ${CONFIG.TIME_SLOTS.slice(0, -1).map((slot, i) => {
              const isBooked = roomBookings.some(b => {
                const startMin = parseInt(b[5].split(':')[0]) * 60 + parseInt(b[5].split(':')[1]);
                const endMin = parseInt(b[6].split(':')[0]) * 60 + parseInt(b[6].split(':')[1]);
                const slotMin = parseInt(slot.split(':')[0]) * 60 + parseInt(slot.split(':')[1]);
                return slotMin >= startMin && slotMin < endMin;
              });
              return `<div class="slot ${isBooked ? 'booked' : 'available'}" title="${slot}">${slot.split(':')[0]}</div>`;
            }).join('')}
          </div>
        </div>
      `;
    }).join('')}
  `)
  .setWidth(600)
  .setHeight(500);

  SpreadsheetApp.getUi().showModalDialog(html, 'Today\'s Availability');
}

function showEquipmentStatus() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.EQUIPMENT);

  if (!sheet || sheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('No equipment found.');
    return;
  }

  const equipment = sheet.getRange(2, 1, sheet.getLastRow() - 1, 12).getValues();

  const available = equipment.filter(e => e[8] === 'Available').length;
  const checkedOut = equipment.filter(e => e[8] === 'Checked Out').length;
  const needsRepair = equipment.filter(e => e[8] === 'Needs Repair').length;

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px; }
      .stat { padding: 20px; border-radius: 8px; text-align: center; }
      .available { background: #d9ead3; }
      .out { background: #fff2cc; }
      .repair { background: #fce8e6; }
      .stat-value { font-size: 32px; font-weight: bold; }
      table { width: 100%; border-collapse: collapse; }
      th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
      th { background: #f5f5f5; }
      .status-badge { padding: 3px 8px; border-radius: 10px; font-size: 11px; }
    </style>

    <h2>📱 Equipment Status</h2>

    <div class="stats">
      <div class="stat available">
        <div class="stat-value">${available}</div>
        <div>Available</div>
      </div>
      <div class="stat out">
        <div class="stat-value">${checkedOut}</div>
        <div>Checked Out</div>
      </div>
      <div class="stat repair">
        <div class="stat-value">${needsRepair}</div>
        <div>Needs Repair</div>
      </div>
    </div>

    <table>
      <tr><th>Equipment</th><th>Type</th><th>Status</th><th>User/Location</th></tr>
      ${equipment.map(e => {
        const statusColors = {
          'Available': '#d9ead3',
          'Checked Out': '#fff2cc',
          'Needs Repair': '#fce8e6'
        };
        return `
          <tr>
            <td>${e[1]}</td>
            <td>${e[2]}</td>
            <td><span class="status-badge" style="background: ${statusColors[e[8]] || '#f5f5f5'}">${e[8]}</span></td>
            <td>${e[8] === 'Checked Out' ? e[9] : e[5]}</td>
          </tr>
        `;
      }).join('')}
    </table>
  `)
  .setWidth(550)
  .setHeight(500);

  SpreadsheetApp.getUi().showModalDialog(html, 'Equipment Status');
}

// ============================================
// REPORTS
// ============================================

function showUsageReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const bookingsSheet = ss.getSheetByName(CONFIG.SHEETS.BOOKINGS);

  if (!bookingsSheet || bookingsSheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('No booking data available.');
    return;
  }

  const bookings = bookingsSheet.getRange(2, 1, bookingsSheet.getLastRow() - 1, 15).getValues();

  // Group by resource
  const byResource = {};
  bookings.forEach(b => {
    const resource = b[2];
    if (!byResource[resource]) byResource[resource] = { count: 0, totalMinutes: 0 };
    byResource[resource].count++;
    byResource[resource].totalMinutes += parseInt(b[7]) || 0;
  });

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .resource { padding: 15px; border-bottom: 1px solid #eee; }
      .resource-name { font-weight: bold; }
      .resource-stats { display: flex; gap: 20px; margin-top: 5px; font-size: 14px; color: #666; }
    </style>

    <h2>📊 Resource Usage Report</h2>

    <p>Total Bookings: ${bookings.length}</p>

    ${Object.entries(byResource).sort((a, b) => b[1].count - a[1].count).map(([name, stats]) => `
      <div class="resource">
        <div class="resource-name">${name}</div>
        <div class="resource-stats">
          <span>${stats.count} bookings</span>
          <span>${(stats.totalMinutes / 60).toFixed(1)} hours total</span>
          <span>${(stats.totalMinutes / stats.count).toFixed(0)} min avg</span>
        </div>
      </div>
    `).join('')}
  `)
  .setWidth(450)
  .setHeight(500);

  SpreadsheetApp.getUi().showModalDialog(html, 'Usage Report');
}

function showPopularResources() {
  showUsageReport();
}

function showOverdueEquipment() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.EQUIPMENT);

  if (!sheet || sheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('No equipment found.');
    return;
  }

  const equipment = sheet.getRange(2, 1, sheet.getLastRow() - 1, 12).getValues();
  const today = new Date();

  const overdue = equipment.filter(e => {
    if (e[8] !== 'Checked Out') return false;
    if (!e[10]) return false;
    return new Date(e[10]) < today;
  });

  if (overdue.length === 0) {
    SpreadsheetApp.getUi().alert('No overdue equipment! 🎉');
    return;
  }

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .overdue-item { padding: 15px; background: #fce8e6; border-radius: 8px; margin-bottom: 10px; }
      .item-name { font-weight: bold; }
      .item-info { font-size: 12px; color: #666; margin-top: 5px; }
      .days-overdue { color: #ea4335; font-weight: bold; }
    </style>

    <h2>⚠️ Overdue Equipment (${overdue.length})</h2>

    ${overdue.map(e => {
      const dueDate = new Date(e[10]);
      const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
      return `
        <div class="overdue-item">
          <div class="item-name">${e[1]}</div>
          <div class="item-info">
            Checked out by: <strong>${e[9]}</strong><br>
            Due: ${dueDate.toLocaleDateString()} (<span class="days-overdue">${daysOverdue} days overdue</span>)
          </div>
        </div>
      `;
    }).join('')}
  `)
  .setWidth(400)
  .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(html, 'Overdue Equipment');
}

// ============================================
// OTHER FUNCTIONS
// ============================================

function cancelBooking() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const row = sheet.getActiveRange().getRow();

  if (sheet.getName() !== CONFIG.SHEETS.BOOKINGS || row < 2) {
    SpreadsheetApp.getUi().alert('Please select a booking row in the Bookings sheet.');
    return;
  }

  sheet.getRange(row, 12).setValue('Cancelled');
  sheet.getRange(row, 1, 1, 15).setBackground('#f4cccc');

  SpreadsheetApp.getUi().alert('Booking cancelled.');
}

function sendBookingConfirmation() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const row = sheet.getActiveRange().getRow();

  if (sheet.getName() !== CONFIG.SHEETS.BOOKINGS || row < 2) {
    SpreadsheetApp.getUi().alert('Please select a booking row in the Bookings sheet.');
    return;
  }

  const booking = sheet.getRange(row, 1, 1, 15).getValues()[0];
  const email = booking[9];

  if (!email) {
    SpreadsheetApp.getUi().alert('No email found for this booking.');
    return;
  }

  MailApp.sendEmail({
    to: email,
    subject: `Booking Confirmation: ${booking[3]}`,
    htmlBody: `
      <h2>Booking Confirmation</h2>
      <p><strong>ID:</strong> ${booking[0]}</p>
      <p><strong>Room:</strong> ${booking[2]}</p>
      <p><strong>Date:</strong> ${new Date(booking[4]).toLocaleDateString()}</p>
      <p><strong>Time:</strong> ${booking[5]} - ${booking[6]}</p>
      <p><strong>Meeting:</strong> ${booking[3]}</p>
    `
  });

  SpreadsheetApp.getUi().alert('Confirmation sent to ' + email);
}

function viewAllResources() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.RESOURCES);
  if (sheet) ss.setActiveSheet(sheet);
}

function showWeeklyCalendar() {
  showTodayAvailability();
}

function showSettings() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .setting { margin-bottom: 15px; padding: 10px; background: #f5f5f5; border-radius: 4px; }
    </style>

    <h2>⚙️ Settings</h2>

    <div class="setting">
      <strong>Resource Types</strong>
      <p style="font-size: 12px;">${CONFIG.RESOURCE_TYPES.join(', ')}</p>
    </div>

    <div class="setting">
      <strong>Time Slots</strong>
      <p style="font-size: 12px;">${CONFIG.TIME_SLOTS[0]} - ${CONFIG.TIME_SLOTS[CONFIG.TIME_SLOTS.length - 1]}</p>
    </div>

    <div class="setting">
      <strong>Booking Durations</strong>
      <p style="font-size: 12px;">${CONFIG.DURATIONS.map(d => d >= 60 ? (d/60) + 'h' : d + 'm').join(', ')}</p>
    </div>

    <h3>Tips</h3>
    <ul>
      <li>Set up resources before booking</li>
      <li>Enable calendar sync for automatic events</li>
      <li>Check overdue equipment weekly</li>
    </ul>
  `)
  .setWidth(400)
  .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(html, 'Settings');
}
