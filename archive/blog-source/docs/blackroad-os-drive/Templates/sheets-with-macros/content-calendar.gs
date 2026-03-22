/**
 * BlackRoad OS - Content Calendar & Social Media
 * Marketing content planning and social media management
 *
 * Features:
 * - Content calendar with drag-and-drop
 * - Multi-platform scheduling
 * - Content pipeline management
 * - Campaign tracking
 * - Performance analytics
 * - Team assignments
 * - Approval workflows
 */

const CONFIG = {
  COMPANY_NAME: 'BlackRoad OS, Inc.',

  PLATFORMS: [
    { name: 'Twitter/X', icon: '🐦', charLimit: 280 },
    { name: 'LinkedIn', icon: '💼', charLimit: 3000 },
    { name: 'Facebook', icon: '📘', charLimit: 63206 },
    { name: 'Instagram', icon: '📸', charLimit: 2200 },
    { name: 'TikTok', icon: '🎵', charLimit: 2200 },
    { name: 'YouTube', icon: '📺', charLimit: 5000 },
    { name: 'Blog', icon: '📝', charLimit: null },
    { name: 'Newsletter', icon: '📧', charLimit: null }
  ],

  CONTENT_TYPES: [
    'Blog Post',
    'Social Post',
    'Video',
    'Infographic',
    'Case Study',
    'Whitepaper',
    'Webinar',
    'Podcast',
    'Newsletter',
    'Press Release',
    'Product Update',
    'User Generated'
  ],

  STATUSES: ['Idea', 'Drafting', 'Review', 'Approved', 'Scheduled', 'Published', 'Archived'],

  CAMPAIGNS: ['Brand Awareness', 'Lead Generation', 'Product Launch', 'Thought Leadership', 'Community', 'Sales Enablement'],

  PILLARS: ['Product', 'Industry', 'Culture', 'Education', 'Entertainment'],

  APPROVAL_LEVELS: ['Writer', 'Editor', 'Manager', 'Legal'],

  POST_TIMES: {
    'Twitter/X': ['9:00 AM', '12:00 PM', '3:00 PM', '6:00 PM'],
    'LinkedIn': ['7:30 AM', '12:00 PM', '5:00 PM'],
    'Facebook': ['9:00 AM', '1:00 PM', '4:00 PM'],
    'Instagram': ['11:00 AM', '2:00 PM', '7:00 PM']
  }
};

/**
 * Creates custom menu on spreadsheet open
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📅 Content')
    .addItem('➕ Create Content', 'showCreateContentDialog')
    .addItem('📝 Quick Social Post', 'showQuickPostDialog')
    .addItem('🗓️ Schedule Content', 'showScheduleDialog')
    .addSeparator()
    .addSubMenu(ui.createMenu('📊 Calendar Views')
      .addItem('Weekly Calendar', 'showWeeklyCalendar')
      .addItem('Monthly Calendar', 'showMonthlyCalendar')
      .addItem('Pipeline View', 'showPipelineView')
      .addItem('Platform View', 'showPlatformView'))
    .addSeparator()
    .addSubMenu(ui.createMenu('🎯 Campaigns')
      .addItem('Create Campaign', 'showCreateCampaignDialog')
      .addItem('Campaign Dashboard', 'showCampaignDashboard')
      .addItem('Campaign Performance', 'showCampaignPerformance'))
    .addSeparator()
    .addSubMenu(ui.createMenu('✅ Workflow')
      .addItem('Submit for Review', 'submitForReview')
      .addItem('Approve Content', 'approveContent')
      .addItem('Request Changes', 'requestChanges')
      .addItem('View Pending Approvals', 'showPendingApprovals'))
    .addSeparator()
    .addSubMenu(ui.createMenu('📈 Analytics')
      .addItem('Content Performance', 'showContentPerformance')
      .addItem('Platform Analytics', 'showPlatformAnalytics')
      .addItem('Best Performing Content', 'showBestContent')
      .addItem('Publishing Frequency', 'showPublishingFrequency'))
    .addSeparator()
    .addSubMenu(ui.createMenu('🔧 Tools')
      .addItem('Content Ideas Generator', 'showIdeasGenerator')
      .addItem('Hashtag Suggestions', 'showHashtagSuggestions')
      .addItem('Optimal Post Times', 'showOptimalTimes')
      .addItem('Content Repurposing', 'showRepurposingOptions'))
    .addSeparator()
    .addItem('⚙️ Settings', 'showSettings')
    .addToUi();
}

/**
 * Shows dialog to create new content
 */
function showCreateContentDialog() {
  const platformOptions = CONFIG.PLATFORMS.map(p =>
    `<option value="${p.name}">${p.icon} ${p.name}</option>`
  ).join('');

  const typeOptions = CONFIG.CONTENT_TYPES.map(t =>
    `<option>${t}</option>`
  ).join('');

  const campaignOptions = CONFIG.CAMPAIGNS.map(c =>
    `<option>${c}</option>`
  ).join('');

  const pillarOptions = CONFIG.PILLARS.map(p =>
    `<option>${p}</option>`
  ).join('');

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 15px; }
      label { display: block; margin-bottom: 5px; font-weight: bold; }
      input, select, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      textarea { height: 100px; }
      .row { display: flex; gap: 10px; }
      .row .form-group { flex: 1; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; }
      button:hover { background: #3367d6; }
      .char-count { text-align: right; font-size: 12px; color: #666; }
      .platform-tags { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 5px; }
      .tag { background: #E3F2FD; padding: 4px 8px; border-radius: 4px; font-size: 12px; cursor: pointer; }
      .tag.selected { background: #1976D2; color: white; }
    </style>

    <h2>➕ Create Content</h2>

    <div class="form-group">
      <label>Title *</label>
      <input type="text" id="title" placeholder="Content title or headline">
    </div>

    <div class="row">
      <div class="form-group">
        <label>Content Type</label>
        <select id="contentType">${typeOptions}</select>
      </div>
      <div class="form-group">
        <label>Content Pillar</label>
        <select id="pillar">${pillarOptions}</select>
      </div>
    </div>

    <div class="form-group">
      <label>Platforms (click to select)</label>
      <div class="platform-tags" id="platformTags">
        ${CONFIG.PLATFORMS.map(p =>
          `<span class="tag" data-platform="${p.name}" onclick="togglePlatform(this)">${p.icon} ${p.name}</span>`
        ).join('')}
      </div>
    </div>

    <div class="form-group">
      <label>Content / Copy</label>
      <textarea id="content" placeholder="Write your content here..." oninput="updateCharCount()"></textarea>
      <div class="char-count"><span id="charCount">0</span> characters</div>
    </div>

    <div class="row">
      <div class="form-group">
        <label>Campaign</label>
        <select id="campaign">
          <option value="">-- No Campaign --</option>
          ${campaignOptions}
        </select>
      </div>
      <div class="form-group">
        <label>Assigned To</label>
        <input type="text" id="assignee" placeholder="Team member name">
      </div>
    </div>

    <div class="row">
      <div class="form-group">
        <label>Target Date</label>
        <input type="date" id="targetDate">
      </div>
      <div class="form-group">
        <label>Target Time</label>
        <input type="time" id="targetTime" value="12:00">
      </div>
    </div>

    <div class="form-group">
      <label>Media/Assets URL</label>
      <input type="text" id="mediaUrl" placeholder="Link to images, videos, or Drive folder">
    </div>

    <div class="form-group">
      <label>Notes</label>
      <textarea id="notes" style="height:60px" placeholder="Additional notes, hashtags, mentions..."></textarea>
    </div>

    <button onclick="createContent()">Create Content</button>
    <button style="background:#757575" onclick="google.script.host.close()">Cancel</button>

    <script>
      let selectedPlatforms = [];

      function togglePlatform(el) {
        const platform = el.dataset.platform;
        if (selectedPlatforms.includes(platform)) {
          selectedPlatforms = selectedPlatforms.filter(p => p !== platform);
          el.classList.remove('selected');
        } else {
          selectedPlatforms.push(platform);
          el.classList.add('selected');
        }
      }

      function updateCharCount() {
        const count = document.getElementById('content').value.length;
        document.getElementById('charCount').textContent = count;
      }

      function createContent() {
        const data = {
          title: document.getElementById('title').value,
          contentType: document.getElementById('contentType').value,
          pillar: document.getElementById('pillar').value,
          platforms: selectedPlatforms,
          content: document.getElementById('content').value,
          campaign: document.getElementById('campaign').value,
          assignee: document.getElementById('assignee').value,
          targetDate: document.getElementById('targetDate').value,
          targetTime: document.getElementById('targetTime').value,
          mediaUrl: document.getElementById('mediaUrl').value,
          notes: document.getElementById('notes').value
        };

        if (!data.title) {
          alert('Please enter a title');
          return;
        }

        if (selectedPlatforms.length === 0) {
          alert('Please select at least one platform');
          return;
        }

        google.script.run
          .withSuccessHandler(() => {
            alert('Content created!');
            google.script.host.close();
          })
          .withFailureHandler(err => alert('Error: ' + err))
          .createContent(data);
      }
    </script>
  `)
  .setWidth(550)
  .setHeight(700);

  SpreadsheetApp.getUi().showModalDialog(html, 'Create Content');
}

/**
 * Creates content entry
 */
function createContent(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Content Calendar');

  if (!sheet) {
    sheet = ss.insertSheet('Content Calendar');
    sheet.appendRow(['Content ID', 'Title', 'Type', 'Pillar', 'Platforms', 'Content',
                     'Campaign', 'Assignee', 'Status', 'Target Date', 'Target Time',
                     'Published Date', 'Media URL', 'Notes', 'Created', 'Engagement', 'Reach']);
    sheet.getRange(1, 1, 1, 17).setFontWeight('bold').setBackground('#E8EAF6');
  }

  const contentId = 'CNT-' + String(sheet.getLastRow()).padStart(5, '0');

  sheet.appendRow([
    contentId,
    data.title,
    data.contentType,
    data.pillar,
    data.platforms.join(', '),
    data.content,
    data.campaign,
    data.assignee,
    'Idea',
    data.targetDate ? new Date(data.targetDate) : '',
    data.targetTime,
    '',
    data.mediaUrl,
    data.notes,
    new Date(),
    '',
    ''
  ]);

  return contentId;
}

/**
 * Shows quick social post dialog
 */
function showQuickPostDialog() {
  const platformOptions = CONFIG.PLATFORMS.filter(p =>
    ['Twitter/X', 'LinkedIn', 'Facebook', 'Instagram'].includes(p.name)
  ).map(p =>
    `<option value="${p.name}" data-limit="${p.charLimit}">${p.icon} ${p.name} (${p.charLimit} chars)</option>`
  ).join('');

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 15px; }
      label { display: block; margin-bottom: 5px; font-weight: bold; }
      select, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      textarea { height: 150px; resize: none; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; }
      .char-counter { display: flex; justify-content: space-between; font-size: 12px; margin-top: 5px; }
      .over-limit { color: #F44336; font-weight: bold; }
      .preview { background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0; }
    </style>

    <h2>📝 Quick Social Post</h2>

    <div class="form-group">
      <label>Platform</label>
      <select id="platform" onchange="updateLimit()">${platformOptions}</select>
    </div>

    <div class="form-group">
      <label>Post Content</label>
      <textarea id="content" placeholder="What's on your mind?" oninput="updateCount()"></textarea>
      <div class="char-counter">
        <span id="charCount">0</span> / <span id="charLimit">280</span> characters
      </div>
    </div>

    <div class="form-group">
      <label>Schedule</label>
      <select id="schedule">
        <option value="now">Post Now (add to Published)</option>
        <option value="schedule">Schedule for Later</option>
      </select>
    </div>

    <div id="scheduleFields" style="display:none;">
      <div class="form-group">
        <label>Date & Time</label>
        <input type="datetime-local" id="scheduleTime">
      </div>
    </div>

    <button onclick="createQuickPost()">Create Post</button>
    <button style="background:#757575" onclick="google.script.host.close()">Cancel</button>

    <script>
      document.getElementById('schedule').onchange = function() {
        document.getElementById('scheduleFields').style.display =
          this.value === 'schedule' ? 'block' : 'none';
      };

      function updateLimit() {
        const select = document.getElementById('platform');
        const limit = select.options[select.selectedIndex].dataset.limit;
        document.getElementById('charLimit').textContent = limit;
        updateCount();
      }

      function updateCount() {
        const count = document.getElementById('content').value.length;
        const limit = parseInt(document.getElementById('charLimit').textContent);
        const countEl = document.getElementById('charCount');
        countEl.textContent = count;
        countEl.className = count > limit ? 'over-limit' : '';
      }

      function createQuickPost() {
        const data = {
          platform: document.getElementById('platform').value,
          content: document.getElementById('content').value,
          schedule: document.getElementById('schedule').value,
          scheduleTime: document.getElementById('scheduleTime').value
        };

        if (!data.content) {
          alert('Please enter post content');
          return;
        }

        google.script.run
          .withSuccessHandler(() => {
            alert('Post created!');
            google.script.host.close();
          })
          .withFailureHandler(err => alert('Error: ' + err))
          .createQuickPost(data);
      }
    </script>
  `)
  .setWidth(450)
  .setHeight(450);

  SpreadsheetApp.getUi().showModalDialog(html, 'Quick Social Post');
}

/**
 * Creates a quick social post
 */
function createQuickPost(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Content Calendar');

  if (!sheet) {
    createContent({ title: 'Setup', platforms: ['Twitter/X'], content: '' });
    sheet = ss.getSheetByName('Content Calendar');
  }

  const contentId = 'CNT-' + String(sheet.getLastRow()).padStart(5, '0');
  const status = data.schedule === 'now' ? 'Published' : 'Scheduled';
  const targetDate = data.schedule === 'now' ? new Date() : (data.scheduleTime ? new Date(data.scheduleTime) : '');

  // Create title from first 50 chars
  const title = data.content.substring(0, 50) + (data.content.length > 50 ? '...' : '');

  sheet.appendRow([
    contentId,
    title,
    'Social Post',
    '',
    data.platform,
    data.content,
    '',
    '',
    status,
    targetDate,
    '',
    data.schedule === 'now' ? new Date() : '',
    '',
    '',
    new Date(),
    '',
    ''
  ]);

  return contentId;
}

/**
 * Shows schedule dialog
 */
function showScheduleDialog() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Content Calendar');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No content found.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const unscheduled = data.slice(1).filter(row =>
    row[8] === 'Approved' || row[8] === 'Review'
  );

  if (unscheduled.length === 0) {
    SpreadsheetApp.getUi().alert('No approved content to schedule.');
    return;
  }

  const contentOptions = unscheduled.map(row =>
    `<option value="${row[0]}">${row[0]} - ${row[1]}</option>`
  ).join('');

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 15px; }
      label { display: block; margin-bottom: 5px; font-weight: bold; }
      select, input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; }
      .optimal-times { background: #E8F5E9; padding: 10px; border-radius: 4px; margin: 10px 0; font-size: 13px; }
    </style>

    <h2>🗓️ Schedule Content</h2>

    <div class="form-group">
      <label>Select Content</label>
      <select id="contentId">${contentOptions}</select>
    </div>

    <div class="form-group">
      <label>Publish Date</label>
      <input type="date" id="publishDate">
    </div>

    <div class="form-group">
      <label>Publish Time</label>
      <input type="time" id="publishTime" value="12:00">
    </div>

    <div class="optimal-times">
      <strong>💡 Optimal posting times:</strong><br>
      Twitter: 9am, 12pm, 3pm, 6pm<br>
      LinkedIn: 7:30am, 12pm, 5pm<br>
      Instagram: 11am, 2pm, 7pm
    </div>

    <button onclick="scheduleContent()">Schedule</button>
    <button style="background:#757575" onclick="google.script.host.close()">Cancel</button>

    <script>
      function scheduleContent() {
        const data = {
          contentId: document.getElementById('contentId').value,
          publishDate: document.getElementById('publishDate').value,
          publishTime: document.getElementById('publishTime').value
        };

        if (!data.publishDate) {
          alert('Please select a date');
          return;
        }

        google.script.run
          .withSuccessHandler(() => {
            alert('Content scheduled!');
            google.script.host.close();
          })
          .withFailureHandler(err => alert('Error: ' + err))
          .scheduleContentPost(data);
      }
    </script>
  `)
  .setWidth(400)
  .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(html, 'Schedule Content');
}

/**
 * Schedules content
 */
function scheduleContentPost(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Content Calendar');
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.contentId) {
      sheet.getRange(i + 1, 9).setValue('Scheduled');
      sheet.getRange(i + 1, 10).setValue(new Date(data.publishDate));
      sheet.getRange(i + 1, 11).setValue(data.publishTime);
      sheet.getRange(i + 1, 1, 1, 17).setBackground('#E3F2FD');
      break;
    }
  }
}

/**
 * Shows weekly calendar view
 */
function showWeeklyCalendar() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Content Calendar');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No content found.');
    return;
  }

  const data = sheet.getDataRange().getValues();

  // Get this week's dates
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekDates = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    weekDates.push(d);
  }

  // Group content by day
  const byDay = weekDates.map(() => []);

  data.slice(1).forEach(row => {
    const targetDate = row[9];
    if (targetDate) {
      const td = new Date(targetDate);
      const dayIndex = weekDates.findIndex(wd =>
        wd.toDateString() === td.toDateString()
      );
      if (dayIndex >= 0) {
        byDay[dayIndex].push({
          id: row[0],
          title: row[1],
          platforms: row[4],
          status: row[8],
          time: row[10]
        });
      }
    }
  });

  let html = `
    <style>
      body { font-family: Arial, sans-serif; padding: 10px; }
      .calendar { display: flex; gap: 5px; }
      .day { flex: 1; min-width: 100px; border: 1px solid #ddd; border-radius: 8px; }
      .day-header { background: #1976D2; color: white; padding: 10px; text-align: center; border-radius: 8px 8px 0 0; }
      .day-content { padding: 10px; min-height: 200px; }
      .content-item { background: #E3F2FD; padding: 8px; margin: 5px 0; border-radius: 4px; font-size: 12px; border-left: 3px solid #1976D2; }
      .content-item.published { background: #E8F5E9; border-color: #4CAF50; }
      .content-item.scheduled { background: #FFF3E0; border-color: #FF9800; }
      .today { background: #E8F5E9; }
    </style>

    <h2>Weekly Calendar</h2>
    <div class="calendar">
  `;

  weekDates.forEach((date, i) => {
    const isToday = date.toDateString() === today.toDateString();
    const items = byDay[i];

    html += `
      <div class="day">
        <div class="day-header ${isToday ? 'today' : ''}">
          <strong>${days[i]}</strong><br>
          ${date.getMonth() + 1}/${date.getDate()}
        </div>
        <div class="day-content">
          ${items.length === 0 ? '<em style="color:#999;font-size:11px">No content</em>' :
            items.map(item => `
              <div class="content-item ${item.status.toLowerCase()}">
                <strong>${item.title.substring(0, 20)}${item.title.length > 20 ? '...' : ''}</strong><br>
                <small>${item.platforms}</small>
              </div>
            `).join('')}
        </div>
      </div>
    `;
  });

  html += '</div>';

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(800)
    .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(output, 'Weekly Calendar');
}

/**
 * Shows monthly calendar
 */
function showMonthlyCalendar() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Content Calendar');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No content found.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const today = new Date();
  const month = today.getMonth();
  const year = today.getFullYear();

  // Count content per day
  const contentByDay = {};

  data.slice(1).forEach(row => {
    const targetDate = row[9];
    if (targetDate) {
      const td = new Date(targetDate);
      if (td.getMonth() === month && td.getFullYear() === year) {
        const day = td.getDate();
        contentByDay[day] = (contentByDay[day] || 0) + 1;
      }
    }
  });

  // Generate calendar HTML
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  let html = `
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .calendar { display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; }
      .day-header { background: #1976D2; color: white; padding: 10px; text-align: center; font-weight: bold; }
      .day { border: 1px solid #ddd; padding: 10px; min-height: 60px; text-align: center; }
      .day.has-content { background: #E3F2FD; }
      .day .date { font-size: 14px; font-weight: bold; }
      .day .count { background: #1976D2; color: white; padding: 2px 6px; border-radius: 10px; font-size: 11px; display: inline-block; margin-top: 5px; }
      .day.today { border: 2px solid #4CAF50; }
    </style>

    <h2>${today.toLocaleString('default', { month: 'long' })} ${year}</h2>
    <div class="calendar">
      <div class="day-header">Sun</div>
      <div class="day-header">Mon</div>
      <div class="day-header">Tue</div>
      <div class="day-header">Wed</div>
      <div class="day-header">Thu</div>
      <div class="day-header">Fri</div>
      <div class="day-header">Sat</div>
  `;

  // Empty cells for days before first
  for (let i = 0; i < firstDay; i++) {
    html += '<div class="day"></div>';
  }

  // Days of month
  for (let day = 1; day <= daysInMonth; day++) {
    const count = contentByDay[day] || 0;
    const isToday = day === today.getDate();
    const hasContent = count > 0;

    html += `
      <div class="day ${hasContent ? 'has-content' : ''} ${isToday ? 'today' : ''}">
        <div class="date">${day}</div>
        ${count > 0 ? `<span class="count">${count}</span>` : ''}
      </div>
    `;
  }

  html += '</div>';

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(600)
    .setHeight(450);

  SpreadsheetApp.getUi().showModalDialog(output, 'Monthly Calendar');
}

/**
 * Shows pipeline view
 */
function showPipelineView() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Content Calendar');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No content found.');
    return;
  }

  const data = sheet.getDataRange().getValues();

  // Group by status
  const byStatus = {};
  CONFIG.STATUSES.forEach(s => byStatus[s] = []);

  data.slice(1).forEach(row => {
    const status = row[8];
    if (byStatus[status]) {
      byStatus[status].push({
        id: row[0],
        title: row[1],
        type: row[2],
        platforms: row[4]
      });
    }
  });

  const statusColors = {
    'Idea': '#9E9E9E',
    'Drafting': '#2196F3',
    'Review': '#FF9800',
    'Approved': '#9C27B0',
    'Scheduled': '#00BCD4',
    'Published': '#4CAF50',
    'Archived': '#607D8B'
  };

  let html = `
    <style>
      body { font-family: Arial, sans-serif; padding: 10px; overflow-x: auto; }
      .pipeline { display: flex; gap: 10px; min-width: 1200px; }
      .column { flex: 1; min-width: 150px; background: #f5f5f5; border-radius: 8px; padding: 10px; }
      .column-header { padding: 10px; color: white; border-radius: 4px; text-align: center; font-weight: bold; margin-bottom: 10px; }
      .card { background: white; padding: 10px; margin: 5px 0; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); font-size: 12px; }
      .card-title { font-weight: bold; margin-bottom: 5px; }
      .card-meta { color: #666; }
    </style>

    <h2>Content Pipeline</h2>
    <div class="pipeline">
  `;

  CONFIG.STATUSES.forEach(status => {
    const items = byStatus[status];
    html += `
      <div class="column">
        <div class="column-header" style="background:${statusColors[status]}">${status} (${items.length})</div>
        ${items.map(item => `
          <div class="card">
            <div class="card-title">${item.title.substring(0, 25)}${item.title.length > 25 ? '...' : ''}</div>
            <div class="card-meta">${item.type}<br>${item.platforms}</div>
          </div>
        `).join('')}
      </div>
    `;
  });

  html += '</div>';

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(900)
    .setHeight(450);

  SpreadsheetApp.getUi().showModalDialog(output, 'Pipeline View');
}

/**
 * Shows platform view
 */
function showPlatformView() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Content Calendar');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No content found.');
    return;
  }

  const data = sheet.getDataRange().getValues();

  // Count by platform
  const byPlatform = {};
  CONFIG.PLATFORMS.forEach(p => byPlatform[p.name] = { total: 0, published: 0, scheduled: 0 });

  data.slice(1).forEach(row => {
    const platforms = (row[4] || '').split(', ');
    const status = row[8];

    platforms.forEach(platform => {
      if (byPlatform[platform]) {
        byPlatform[platform].total++;
        if (status === 'Published') byPlatform[platform].published++;
        if (status === 'Scheduled') byPlatform[platform].scheduled++;
      }
    });
  });

  let html = '<style>body{font-family:Arial,sans-serif;padding:15px;} .platform{display:flex;align-items:center;padding:15px;border-bottom:1px solid #eee;} .icon{font-size:24px;margin-right:15px;} .stats{display:flex;gap:20px;margin-left:auto;} .stat{text-align:center;} .stat-value{font-size:20px;font-weight:bold;} .stat-label{font-size:11px;color:#666;}</style>';

  html += '<h2>Content by Platform</h2>';

  Object.entries(byPlatform).forEach(([platform, stats]) => {
    const platformConfig = CONFIG.PLATFORMS.find(p => p.name === platform);
    html += `
      <div class="platform">
        <span class="icon">${platformConfig ? platformConfig.icon : '📱'}</span>
        <strong>${platform}</strong>
        <div class="stats">
          <div class="stat">
            <div class="stat-value">${stats.total}</div>
            <div class="stat-label">Total</div>
          </div>
          <div class="stat">
            <div class="stat-value" style="color:#4CAF50">${stats.published}</div>
            <div class="stat-label">Published</div>
          </div>
          <div class="stat">
            <div class="stat-value" style="color:#FF9800">${stats.scheduled}</div>
            <div class="stat-label">Scheduled</div>
          </div>
        </div>
      </div>
    `;
  });

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(500)
    .setHeight(500);

  SpreadsheetApp.getUi().showModalDialog(output, 'Platform View');
}

/**
 * Shows create campaign dialog
 */
function showCreateCampaignDialog() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 15px; }
      label { display: block; margin-bottom: 5px; font-weight: bold; }
      input, select, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      textarea { height: 80px; }
      .row { display: flex; gap: 10px; }
      .row .form-group { flex: 1; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; }
    </style>

    <h2>🎯 Create Campaign</h2>

    <div class="form-group">
      <label>Campaign Name *</label>
      <input type="text" id="name" placeholder="e.g., Q1 Product Launch">
    </div>

    <div class="form-group">
      <label>Objective</label>
      <select id="objective">
        ${CONFIG.CAMPAIGNS.map(c => '<option>' + c + '</option>').join('')}
      </select>
    </div>

    <div class="row">
      <div class="form-group">
        <label>Start Date</label>
        <input type="date" id="startDate">
      </div>
      <div class="form-group">
        <label>End Date</label>
        <input type="date" id="endDate">
      </div>
    </div>

    <div class="form-group">
      <label>Description</label>
      <textarea id="description" placeholder="Campaign goals and strategy..."></textarea>
    </div>

    <div class="form-group">
      <label>Target Metrics</label>
      <input type="text" id="targets" placeholder="e.g., 10K impressions, 500 clicks, 50 leads">
    </div>

    <button onclick="createCampaign()">Create Campaign</button>
    <button style="background:#757575" onclick="google.script.host.close()">Cancel</button>

    <script>
      function createCampaign() {
        const data = {
          name: document.getElementById('name').value,
          objective: document.getElementById('objective').value,
          startDate: document.getElementById('startDate').value,
          endDate: document.getElementById('endDate').value,
          description: document.getElementById('description').value,
          targets: document.getElementById('targets').value
        };

        if (!data.name) {
          alert('Please enter a campaign name');
          return;
        }

        google.script.run
          .withSuccessHandler(() => {
            alert('Campaign created!');
            google.script.host.close();
          })
          .withFailureHandler(err => alert('Error: ' + err))
          .createCampaign(data);
      }
    </script>
  `)
  .setWidth(450)
  .setHeight(450);

  SpreadsheetApp.getUi().showModalDialog(html, 'Create Campaign');
}

/**
 * Creates a campaign
 */
function createCampaign(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Campaigns');

  if (!sheet) {
    sheet = ss.insertSheet('Campaigns');
    sheet.appendRow(['Campaign ID', 'Name', 'Objective', 'Start Date', 'End Date',
                     'Description', 'Target Metrics', 'Status', 'Content Count', 'Created']);
    sheet.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#E8EAF6');
  }

  const campaignId = 'CMP-' + String(sheet.getLastRow()).padStart(4, '0');

  sheet.appendRow([
    campaignId,
    data.name,
    data.objective,
    data.startDate ? new Date(data.startDate) : '',
    data.endDate ? new Date(data.endDate) : '',
    data.description,
    data.targets,
    'Active',
    0,
    new Date()
  ]);

  return campaignId;
}

/**
 * Shows campaign dashboard
 */
function showCampaignDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const campaignSheet = ss.getSheetByName('Campaigns');
  const contentSheet = ss.getSheetByName('Content Calendar');

  if (!campaignSheet) {
    SpreadsheetApp.getUi().alert('No campaigns found.');
    return;
  }

  const campaigns = campaignSheet.getDataRange().getValues();

  // Count content per campaign
  const contentCount = {};
  if (contentSheet) {
    const content = contentSheet.getDataRange().getValues();
    content.slice(1).forEach(row => {
      const campaign = row[6];
      if (campaign) {
        contentCount[campaign] = (contentCount[campaign] || 0) + 1;
      }
    });
  }

  let html = '<style>body{font-family:Arial,sans-serif;padding:15px;} .campaign{background:#f5f5f5;padding:15px;margin:10px 0;border-radius:8px;border-left:4px solid #1976D2;} .campaign h3{margin:0 0 10px;} .stats{display:flex;gap:20px;}</style>';

  html += '<h2>Campaign Dashboard</h2>';

  campaigns.slice(1).forEach(row => {
    const count = contentCount[row[1]] || 0;
    html += `
      <div class="campaign">
        <h3>${row[1]}</h3>
        <p><strong>Objective:</strong> ${row[2]} | <strong>Status:</strong> ${row[7]}</p>
        <p>${row[3] ? 'From ' + new Date(row[3]).toLocaleDateString() : ''} ${row[4] ? 'to ' + new Date(row[4]).toLocaleDateString() : ''}</p>
        <div class="stats">
          <span><strong>${count}</strong> pieces of content</span>
        </div>
      </div>
    `;
  });

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(500)
    .setHeight(450);

  SpreadsheetApp.getUi().showModalDialog(output, 'Campaign Dashboard');
}

/**
 * Shows campaign performance
 */
function showCampaignPerformance() {
  SpreadsheetApp.getUi().alert(
    'Campaign Performance\n\n' +
    'To track campaign performance:\n' +
    '1. Add engagement metrics to content rows\n' +
    '2. Update Engagement and Reach columns\n' +
    '3. View aggregated metrics in Campaign Dashboard'
  );
}

/**
 * Submits content for review
 */
function submitForReview() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Content Calendar');
  const range = sheet.getActiveRange();

  if (!range) {
    SpreadsheetApp.getUi().alert('Please select a content row first.');
    return;
  }

  const row = range.getRow();
  if (row < 2) {
    SpreadsheetApp.getUi().alert('Please select a content row (not the header).');
    return;
  }

  const currentStatus = sheet.getRange(row, 9).getValue();
  if (currentStatus !== 'Idea' && currentStatus !== 'Drafting') {
    SpreadsheetApp.getUi().alert('Content must be in Idea or Drafting status to submit for review.');
    return;
  }

  sheet.getRange(row, 9).setValue('Review');
  sheet.getRange(row, 1, 1, 17).setBackground('#FFF3E0');

  SpreadsheetApp.getUi().alert('Content submitted for review!');
}

/**
 * Approves content
 */
function approveContent() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Content Calendar');
  const range = sheet.getActiveRange();

  if (!range) {
    SpreadsheetApp.getUi().alert('Please select a content row first.');
    return;
  }

  const row = range.getRow();
  if (row < 2) {
    SpreadsheetApp.getUi().alert('Please select a content row (not the header).');
    return;
  }

  const currentStatus = sheet.getRange(row, 9).getValue();
  if (currentStatus !== 'Review') {
    SpreadsheetApp.getUi().alert('Content must be in Review status to approve.');
    return;
  }

  sheet.getRange(row, 9).setValue('Approved');
  sheet.getRange(row, 1, 1, 17).setBackground('#E8F5E9');

  SpreadsheetApp.getUi().alert('Content approved!');
}

/**
 * Requests changes
 */
function requestChanges() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Content Calendar');
  const range = sheet.getActiveRange();

  if (!range) {
    SpreadsheetApp.getUi().alert('Please select a content row first.');
    return;
  }

  const row = range.getRow();
  sheet.getRange(row, 9).setValue('Drafting');
  sheet.getRange(row, 1, 1, 17).setBackground('#FFF9C4');

  SpreadsheetApp.getUi().alert('Content returned for revisions.');
}

/**
 * Shows pending approvals
 */
function showPendingApprovals() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Content Calendar');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No content found.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const pending = data.slice(1).filter(row => row[8] === 'Review');

  if (pending.length === 0) {
    SpreadsheetApp.getUi().alert('No content pending approval!');
    return;
  }

  let html = '<style>body{font-family:Arial,sans-serif;padding:15px;} .item{background:#FFF3E0;padding:15px;margin:10px 0;border-radius:8px;border-left:4px solid #FF9800;}</style>';

  html += `<h2>Pending Approvals (${pending.length})</h2>`;

  pending.forEach(row => {
    html += `
      <div class="item">
        <strong>${row[0]}: ${row[1]}</strong><br>
        <small>Type: ${row[2]} | Platforms: ${row[4]}</small><br>
        <small>Assigned: ${row[7] || 'Unassigned'}</small>
      </div>
    `;
  });

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(450)
    .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(output, 'Pending Approvals');
}

/**
 * Shows content performance
 */
function showContentPerformance() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Content Calendar');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No content found.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const published = data.slice(1).filter(row => row[8] === 'Published');

  let totalEngagement = 0;
  let totalReach = 0;

  published.forEach(row => {
    totalEngagement += parseInt(row[15]) || 0;
    totalReach += parseInt(row[16]) || 0;
  });

  const avgEngagement = published.length > 0 ? Math.round(totalEngagement / published.length) : 0;
  const avgReach = published.length > 0 ? Math.round(totalReach / published.length) : 0;

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      .metric { background: #E3F2FD; padding: 20px; border-radius: 8px; margin: 10px 0; text-align: center; }
      .metric h2 { margin: 0; font-size: 32px; color: #1565C0; }
    </style>

    <h2>Content Performance</h2>

    <div class="metric">
      <h2>${published.length}</h2>
      <p>Published Content</p>
    </div>

    <div class="metric">
      <h2>${totalEngagement.toLocaleString()}</h2>
      <p>Total Engagement</p>
    </div>

    <div class="metric">
      <h2>${avgEngagement.toLocaleString()}</h2>
      <p>Avg Engagement per Post</p>
    </div>

    <div class="metric">
      <h2>${totalReach.toLocaleString()}</h2>
      <p>Total Reach</p>
    </div>

    <p><em>Update Engagement and Reach columns in Content Calendar for accurate tracking.</em></p>
  `)
  .setWidth(350)
  .setHeight(450);

  SpreadsheetApp.getUi().showModalDialog(html, 'Content Performance');
}

/**
 * Shows platform analytics
 */
function showPlatformAnalytics() {
  SpreadsheetApp.getUi().alert(
    'Platform Analytics\n\n' +
    'For detailed platform analytics:\n' +
    '1. Connect native platform analytics APIs\n' +
    '2. Or manually update engagement metrics\n' +
    '3. Use Platform View for content distribution'
  );
}

/**
 * Shows best performing content
 */
function showBestContent() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Content Calendar');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No content found.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const published = data.slice(1)
    .filter(row => row[8] === 'Published' && (row[15] || row[16]))
    .sort((a, b) => ((parseInt(b[15]) || 0) + (parseInt(b[16]) || 0)) - ((parseInt(a[15]) || 0) + (parseInt(a[16]) || 0)))
    .slice(0, 10);

  if (published.length === 0) {
    SpreadsheetApp.getUi().alert('No content with engagement data yet.');
    return;
  }

  let html = '<style>body{font-family:Arial,sans-serif;padding:15px;} table{width:100%;border-collapse:collapse;} th,td{border:1px solid #ddd;padding:10px;text-align:left;} th{background:#E8EAF6;}</style>';

  html += '<h2>Top Performing Content</h2>';
  html += '<table><tr><th>Title</th><th>Platform</th><th>Engagement</th><th>Reach</th></tr>';

  published.forEach(row => {
    html += `<tr>
      <td>${row[1].substring(0, 30)}${row[1].length > 30 ? '...' : ''}</td>
      <td>${row[4]}</td>
      <td>${(row[15] || 0).toLocaleString()}</td>
      <td>${(row[16] || 0).toLocaleString()}</td>
    </tr>`;
  });

  html += '</table>';

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(550)
    .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(output, 'Best Content');
}

/**
 * Shows publishing frequency
 */
function showPublishingFrequency() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Content Calendar');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No content found.');
    return;
  }

  const data = sheet.getDataRange().getValues();

  // Count by month
  const byMonth = {};

  data.slice(1).forEach(row => {
    if (row[8] === 'Published' && row[11]) {
      const date = new Date(row[11]);
      const key = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      byMonth[key] = (byMonth[key] || 0) + 1;
    }
  });

  let html = '<style>body{font-family:Arial,sans-serif;padding:15px;} .month{display:flex;align-items:center;margin:10px 0;} .bar{background:#4CAF50;height:30px;display:flex;align-items:center;padding-left:10px;color:white;border-radius:4px;min-width:30px;}</style>';

  html += '<h2>Publishing Frequency</h2>';

  const maxCount = Math.max(...Object.values(byMonth));

  Object.entries(byMonth).forEach(([month, count]) => {
    const width = (count / maxCount * 100);
    html += `
      <div class="month">
        <span style="width:100px">${month}</span>
        <div class="bar" style="width:${width}%">${count}</div>
      </div>
    `;
  });

  if (Object.keys(byMonth).length === 0) {
    html += '<p><em>No published content yet.</em></p>';
  }

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(450)
    .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(output, 'Publishing Frequency');
}

/**
 * Shows ideas generator
 */
function showIdeasGenerator() {
  const ideas = [
    'Behind-the-scenes look at your team',
    'Customer success story / case study',
    'Industry trend analysis',
    'How-to tutorial or guide',
    'Product feature spotlight',
    'Team member Q&A',
    'User-generated content showcase',
    'Myth vs. Reality in your industry',
    'Predictions for next year',
    'Lessons learned from a failure',
    'Data-driven insights infographic',
    'Expert interview or podcast',
    'Day in the life at your company',
    'Before and after transformation',
    'Poll or survey results',
    'FAQ answered in detail',
    'Industry news commentary',
    'Tool or resource roundup',
    'Common mistakes and how to avoid them',
    'Celebration of a milestone'
  ];

  // Random selection
  const shuffled = ideas.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 5);

  let html = '<style>body{font-family:Arial,sans-serif;padding:15px;} .idea{background:#E3F2FD;padding:15px;margin:10px 0;border-radius:8px;border-left:4px solid #1976D2;cursor:pointer;} .idea:hover{background:#BBDEFB;}</style>';

  html += '<h2>💡 Content Ideas</h2>';
  html += '<p>Click an idea to add it to your calendar:</p>';

  selected.forEach((idea, i) => {
    html += `<div class="idea" onclick="useIdea('${idea}')">${i + 1}. ${idea}</div>`;
  });

  html += `
    <button onclick="location.reload()" style="margin-top:15px;background:#4285f4;color:white;padding:10px 20px;border:none;border-radius:4px;cursor:pointer;">🔄 Generate More</button>

    <script>
      function useIdea(idea) {
        google.script.run
          .withSuccessHandler(() => {
            alert('Idea added to calendar!');
          })
          .createContent({
            title: idea,
            platforms: ['Twitter/X'],
            content: '',
            contentType: 'Social Post'
          });
      }
    </script>
  `;

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(400)
    .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(output, 'Content Ideas');
}

/**
 * Shows hashtag suggestions
 */
function showHashtagSuggestions() {
  const hashtags = {
    'General Business': ['#business', '#entrepreneur', '#startup', '#smallbusiness', '#success'],
    'Tech/SaaS': ['#tech', '#saas', '#software', '#innovation', '#digital', '#ai'],
    'Marketing': ['#marketing', '#digitalmarketing', '#contentmarketing', '#socialmedia', '#branding'],
    'Leadership': ['#leadership', '#management', '#ceo', '#founder', '#teamwork'],
    'Motivation': ['#motivation', '#inspiration', '#mondaymotivation', '#growth', '#mindset'],
    'Industry Events': ['#conference', '#webinar', '#networking', '#event', '#learning']
  };

  let html = '<style>body{font-family:Arial,sans-serif;padding:15px;} .category{margin:15px 0;} .category h3{margin:0 0 10px;} .tags{display:flex;flex-wrap:wrap;gap:5px;} .tag{background:#E3F2FD;padding:5px 10px;border-radius:15px;font-size:13px;cursor:pointer;} .tag:hover{background:#1976D2;color:white;}</style>';

  html += '<h2>#️⃣ Hashtag Suggestions</h2>';

  Object.entries(hashtags).forEach(([category, tags]) => {
    html += `
      <div class="category">
        <h3>${category}</h3>
        <div class="tags">
          ${tags.map(tag => `<span class="tag" onclick="copyTag('${tag}')">${tag}</span>`).join('')}
        </div>
      </div>
    `;
  });

  html += `
    <script>
      function copyTag(tag) {
        navigator.clipboard.writeText(tag);
        alert('Copied: ' + tag);
      }
    </script>
  `;

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(450)
    .setHeight(450);

  SpreadsheetApp.getUi().showModalDialog(output, 'Hashtag Suggestions');
}

/**
 * Shows optimal posting times
 */
function showOptimalTimes() {
  let html = '<style>body{font-family:Arial,sans-serif;padding:15px;} .platform{margin:15px 0;padding:15px;background:#f5f5f5;border-radius:8px;} .platform h3{margin:0 0 10px;} .times{display:flex;gap:10px;flex-wrap:wrap;} .time{background:#E8F5E9;padding:8px 15px;border-radius:20px;font-size:13px;}</style>';

  html += '<h2>⏰ Optimal Posting Times</h2>';
  html += '<p>Best times to post based on typical engagement patterns:</p>';

  Object.entries(CONFIG.POST_TIMES).forEach(([platform, times]) => {
    const platformConfig = CONFIG.PLATFORMS.find(p => p.name === platform);
    html += `
      <div class="platform">
        <h3>${platformConfig ? platformConfig.icon : ''} ${platform}</h3>
        <div class="times">
          ${times.map(t => `<span class="time">${t}</span>`).join('')}
        </div>
      </div>
    `;
  });

  html += '<p><em>Note: Test different times with your audience for best results.</em></p>';

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(450)
    .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(output, 'Optimal Post Times');
}

/**
 * Shows repurposing options
 */
function showRepurposingOptions() {
  const repurposing = [
    { from: 'Blog Post', to: ['LinkedIn Article', 'Twitter Thread', 'Newsletter', 'Infographic', 'Video Script'] },
    { from: 'Video', to: ['Blog Post', 'Short Clips', 'Audio Podcast', 'Quote Graphics', 'GIFs'] },
    { from: 'Podcast', to: ['Blog Post', 'Audiogram', 'Quote Graphics', 'Video Highlights', 'Newsletter'] },
    { from: 'Webinar', to: ['Blog Post', 'Video Clips', 'Slides Download', 'FAQ Post', 'Case Study'] }
  ];

  let html = '<style>body{font-family:Arial,sans-serif;padding:15px;} .row{margin:15px 0;padding:15px;background:#f5f5f5;border-radius:8px;} .from{font-weight:bold;margin-bottom:10px;} .to{display:flex;flex-wrap:wrap;gap:5px;} .format{background:#E3F2FD;padding:5px 10px;border-radius:4px;font-size:13px;}</style>';

  html += '<h2>♻️ Content Repurposing</h2>';
  html += '<p>Transform one piece of content into many:</p>';

  repurposing.forEach(item => {
    html += `
      <div class="row">
        <div class="from">📄 ${item.from} →</div>
        <div class="to">
          ${item.to.map(t => `<span class="format">${t}</span>`).join('')}
        </div>
      </div>
    `;
  });

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(500)
    .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(output, 'Content Repurposing');
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
      <label>Platforms</label>
      <input type="text" value="${CONFIG.PLATFORMS.map(p => p.name).join(', ')}" disabled>
    </div>

    <div class="setting">
      <label>Content Types</label>
      <input type="text" value="${CONFIG.CONTENT_TYPES.length} types configured" disabled>
    </div>

    <div class="setting">
      <label>Campaigns</label>
      <input type="text" value="${CONFIG.CAMPAIGNS.join(', ')}" disabled>
    </div>

    <div class="setting">
      <label>Content Pillars</label>
      <input type="text" value="${CONFIG.PILLARS.join(', ')}" disabled>
    </div>

    <p><em>Edit CONFIG in Extensions > Apps Script to customize.</em></p>

    <button onclick="google.script.host.close()">Close</button>
  `)
  .setWidth(400)
  .setHeight(350);

  SpreadsheetApp.getUi().showModalDialog(html, 'Settings');
}
