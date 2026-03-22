/**
 * BlackRoad OS - Employee Performance Reviews
 * 360-degree feedback and performance management
 *
 * Features:
 * - Annual/quarterly performance reviews
 * - 360-degree feedback (self, manager, peer, direct report)
 * - Goal tracking and OKR alignment
 * - Competency ratings
 * - Calibration support
 * - Review reminders and scheduling
 * - Performance improvement plans (PIP)
 */

const CONFIG = {
  COMPANY_NAME: 'BlackRoad OS, Inc.',

  REVIEW_CYCLES: ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024', 'Annual 2024'],

  RATING_SCALE: {
    5: { label: 'Exceptional', description: 'Consistently exceeds expectations', color: '#1B5E20' },
    4: { label: 'Exceeds', description: 'Often exceeds expectations', color: '#4CAF50' },
    3: { label: 'Meets', description: 'Meets expectations', color: '#FFC107' },
    2: { label: 'Developing', description: 'Partially meets expectations', color: '#FF9800' },
    1: { label: 'Needs Improvement', description: 'Does not meet expectations', color: '#F44336' }
  },

  COMPETENCIES: [
    'Technical Skills',
    'Problem Solving',
    'Communication',
    'Collaboration',
    'Leadership',
    'Initiative',
    'Adaptability',
    'Time Management',
    'Customer Focus',
    'Innovation'
  ],

  FEEDBACK_TYPES: ['Self', 'Manager', 'Peer', 'Direct Report', 'Skip Level'],

  REVIEW_STATUSES: ['Not Started', 'In Progress', 'Submitted', 'Calibrated', 'Delivered', 'Acknowledged'],

  DEPARTMENTS: ['Engineering', 'Product', 'Sales', 'Marketing', 'Operations', 'HR', 'Finance', 'Legal', 'Executive'],

  PIP_DURATION_DAYS: 90
};

/**
 * Creates custom menu on spreadsheet open
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📊 Performance')
    .addItem('📝 Start New Review', 'showStartReviewDialog')
    .addItem('✍️ Submit Self Review', 'showSelfReviewDialog')
    .addItem('👥 Add 360 Feedback', 'show360FeedbackDialog')
    .addSeparator()
    .addSubMenu(ui.createMenu('🎯 Goals')
      .addItem('Add Goal', 'showAddGoalDialog')
      .addItem('Update Goal Progress', 'showUpdateGoalDialog')
      .addItem('View Goal Summary', 'showGoalSummary'))
    .addSeparator()
    .addSubMenu(ui.createMenu('📈 Reviews')
      .addItem('Complete Manager Review', 'showManagerReviewDialog')
      .addItem('View Review Summary', 'showReviewSummary')
      .addItem('Generate Review Document', 'generateReviewDocument')
      .addItem('Schedule Review Meeting', 'scheduleReviewMeeting'))
    .addSeparator()
    .addSubMenu(ui.createMenu('⚖️ Calibration')
      .addItem('View Calibration Grid', 'showCalibrationGrid')
      .addItem('Rating Distribution', 'showRatingDistribution')
      .addItem('Department Comparison', 'showDepartmentComparison'))
    .addSeparator()
    .addSubMenu(ui.createMenu('📋 Reports')
      .addItem('Review Status Dashboard', 'showStatusDashboard')
      .addItem('Competency Analysis', 'showCompetencyAnalysis')
      .addItem('High/Low Performers', 'showPerformerAnalysis')
      .addItem('Export All Reviews', 'exportAllReviews'))
    .addSeparator()
    .addSubMenu(ui.createMenu('⚠️ PIP Management')
      .addItem('Create PIP', 'showCreatePIPDialog')
      .addItem('View Active PIPs', 'showActivePIPs')
      .addItem('Update PIP Status', 'updatePIPStatus'))
    .addSeparator()
    .addItem('🔔 Send Review Reminders', 'sendReviewReminders')
    .addItem('⚙️ Settings', 'showSettings')
    .addToUi();
}

/**
 * Shows dialog to start a new review cycle
 */
function showStartReviewDialog() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 15px; }
      label { display: block; margin-bottom: 5px; font-weight: bold; }
      input, select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      .row { display: flex; gap: 10px; }
      .row .form-group { flex: 1; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; }
      button:hover { background: #3367d6; }
      .info { background: #E3F2FD; padding: 10px; border-radius: 4px; margin-bottom: 15px; }
    </style>

    <h2>📝 Start New Review</h2>

    <div class="info">
      Creates a new performance review entry for an employee.
    </div>

    <div class="form-group">
      <label>Employee Name *</label>
      <input type="text" id="employeeName" placeholder="Full name">
    </div>

    <div class="row">
      <div class="form-group">
        <label>Employee Email *</label>
        <input type="email" id="employeeEmail" placeholder="email@company.com">
      </div>
      <div class="form-group">
        <label>Employee ID</label>
        <input type="text" id="employeeId" placeholder="EMP-001">
      </div>
    </div>

    <div class="row">
      <div class="form-group">
        <label>Department</label>
        <select id="department">
          ${CONFIG.DEPARTMENTS.map(d => '<option>' + d + '</option>').join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Job Title</label>
        <input type="text" id="jobTitle" placeholder="Software Engineer">
      </div>
    </div>

    <div class="row">
      <div class="form-group">
        <label>Manager Name</label>
        <input type="text" id="managerName" placeholder="Manager's name">
      </div>
      <div class="form-group">
        <label>Manager Email</label>
        <input type="email" id="managerEmail" placeholder="manager@company.com">
      </div>
    </div>

    <div class="form-group">
      <label>Review Cycle</label>
      <select id="reviewCycle">
        ${CONFIG.REVIEW_CYCLES.map(c => '<option>' + c + '</option>').join('')}
      </select>
    </div>

    <button onclick="startReview()">Create Review</button>
    <button style="background:#757575" onclick="google.script.host.close()">Cancel</button>

    <script>
      function startReview() {
        const data = {
          employeeName: document.getElementById('employeeName').value,
          employeeEmail: document.getElementById('employeeEmail').value,
          employeeId: document.getElementById('employeeId').value,
          department: document.getElementById('department').value,
          jobTitle: document.getElementById('jobTitle').value,
          managerName: document.getElementById('managerName').value,
          managerEmail: document.getElementById('managerEmail').value,
          reviewCycle: document.getElementById('reviewCycle').value
        };

        if (!data.employeeName || !data.employeeEmail) {
          alert('Please fill in required fields');
          return;
        }

        google.script.run
          .withSuccessHandler(() => {
            alert('Review created! Employee can now submit self-assessment.');
            google.script.host.close();
          })
          .withFailureHandler(err => alert('Error: ' + err))
          .createReview(data);
      }
    </script>
  `)
  .setWidth(500)
  .setHeight(500);

  SpreadsheetApp.getUi().showModalDialog(html, 'Start New Review');
}

/**
 * Creates a new review entry
 */
function createReview(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Reviews');

  if (!sheet) {
    sheet = ss.insertSheet('Reviews');
    sheet.appendRow(['Review ID', 'Employee Name', 'Employee Email', 'Employee ID', 'Department',
                     'Job Title', 'Manager Name', 'Manager Email', 'Review Cycle', 'Status',
                     'Self Rating', 'Manager Rating', 'Final Rating', 'Created', 'Submitted',
                     'Calibrated', 'Delivered', 'Notes']);
    sheet.getRange(1, 1, 1, 18).setFontWeight('bold').setBackground('#E8EAF6');
  }

  // Generate review ID
  const lastRow = sheet.getLastRow();
  const reviewId = 'REV-' + data.reviewCycle.replace(/\s/g, '-') + '-' + String(lastRow > 1 ? lastRow : 1).padStart(4, '0');

  sheet.appendRow([
    reviewId,
    data.employeeName,
    data.employeeEmail,
    data.employeeId,
    data.department,
    data.jobTitle,
    data.managerName,
    data.managerEmail,
    data.reviewCycle,
    'Not Started',
    '', // Self rating
    '', // Manager rating
    '', // Final rating
    new Date(),
    '', // Submitted
    '', // Calibrated
    '', // Delivered
    ''  // Notes
  ]);

  return reviewId;
}

/**
 * Shows self-review dialog
 */
function showSelfReviewDialog() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const reviewSheet = ss.getSheetByName('Reviews');

  if (!reviewSheet) {
    SpreadsheetApp.getUi().alert('No reviews found. Create a review first.');
    return;
  }

  const data = reviewSheet.getDataRange().getValues();
  const pendingReviews = data.slice(1).filter(row =>
    row[9] === 'Not Started' || row[9] === 'In Progress'
  );

  const reviewOptions = pendingReviews.map(row =>
    `<option value="${row[0]}">${row[0]} - ${row[1]} (${row[8]})</option>`
  ).join('');

  const competencyInputs = CONFIG.COMPETENCIES.map((comp, i) => `
    <div class="competency">
      <label>${comp}</label>
      <select id="comp${i}" name="competencies">
        <option value="5">5 - Exceptional</option>
        <option value="4">4 - Exceeds</option>
        <option value="3" selected>3 - Meets</option>
        <option value="2">2 - Developing</option>
        <option value="1">1 - Needs Improvement</option>
      </select>
    </div>
  `).join('');

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 15px; }
      label { display: block; margin-bottom: 5px; font-weight: bold; }
      select, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      textarea { height: 100px; }
      .competency { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #eee; }
      .competency label { margin: 0; font-weight: normal; }
      .competency select { width: 200px; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; }
      .section { background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0; }
    </style>

    <h2>✍️ Self Assessment</h2>

    <div class="form-group">
      <label>Select Your Review</label>
      <select id="reviewId">${reviewOptions}</select>
    </div>

    <div class="section">
      <h3>Competency Ratings</h3>
      ${competencyInputs}
    </div>

    <div class="form-group">
      <label>Key Accomplishments</label>
      <textarea id="accomplishments" placeholder="List your key accomplishments this period..."></textarea>
    </div>

    <div class="form-group">
      <label>Areas for Development</label>
      <textarea id="development" placeholder="What areas would you like to improve?"></textarea>
    </div>

    <div class="form-group">
      <label>Goals for Next Period</label>
      <textarea id="goals" placeholder="What are your goals for the next review period?"></textarea>
    </div>

    <button onclick="submitSelfReview()">Submit Self Assessment</button>
    <button style="background:#757575" onclick="google.script.host.close()">Cancel</button>

    <script>
      function submitSelfReview() {
        const competencies = {};
        ${CONFIG.COMPETENCIES.map((comp, i) => `competencies['${comp}'] = document.getElementById('comp${i}').value;`).join('\n')}

        const data = {
          reviewId: document.getElementById('reviewId').value,
          competencies: competencies,
          accomplishments: document.getElementById('accomplishments').value,
          development: document.getElementById('development').value,
          goals: document.getElementById('goals').value
        };

        google.script.run
          .withSuccessHandler(() => {
            alert('Self assessment submitted!');
            google.script.host.close();
          })
          .withFailureHandler(err => alert('Error: ' + err))
          .submitSelfReview(data);
      }
    </script>
  `)
  .setWidth(550)
  .setHeight(650);

  SpreadsheetApp.getUi().showModalDialog(html, 'Self Assessment');
}

/**
 * Submits self-review
 */
function submitSelfReview(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Update reviews sheet
  const reviewSheet = ss.getSheetByName('Reviews');
  const reviewData = reviewSheet.getDataRange().getValues();

  for (let i = 1; i < reviewData.length; i++) {
    if (reviewData[i][0] === data.reviewId) {
      // Calculate average self rating
      const ratings = Object.values(data.competencies).map(Number);
      const avgRating = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2);

      reviewSheet.getRange(i + 1, 10).setValue('Submitted');
      reviewSheet.getRange(i + 1, 11).setValue(avgRating);
      reviewSheet.getRange(i + 1, 15).setValue(new Date());
      break;
    }
  }

  // Store detailed self-review
  let selfSheet = ss.getSheetByName('Self Reviews');
  if (!selfSheet) {
    selfSheet = ss.insertSheet('Self Reviews');
    selfSheet.appendRow(['Review ID', 'Submitted', ...CONFIG.COMPETENCIES, 'Accomplishments', 'Development', 'Goals']);
    selfSheet.getRange(1, 1, 1, selfSheet.getLastColumn()).setFontWeight('bold').setBackground('#E8EAF6');
  }

  const competencyValues = CONFIG.COMPETENCIES.map(c => data.competencies[c] || 3);
  selfSheet.appendRow([
    data.reviewId,
    new Date(),
    ...competencyValues,
    data.accomplishments,
    data.development,
    data.goals
  ]);
}

/**
 * Shows 360 feedback dialog
 */
function show360FeedbackDialog() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const reviewSheet = ss.getSheetByName('Reviews');

  if (!reviewSheet) {
    SpreadsheetApp.getUi().alert('No reviews found.');
    return;
  }

  const data = reviewSheet.getDataRange().getValues();
  const activeReviews = data.slice(1).filter(row => row[9] !== 'Delivered');

  const reviewOptions = activeReviews.map(row =>
    `<option value="${row[0]}">${row[1]} - ${row[8]}</option>`
  ).join('');

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
      .rating-group { display: flex; gap: 5px; margin: 10px 0; }
      .rating-group label { display: flex; align-items: center; gap: 5px; cursor: pointer; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; }
      .rating-group input:checked + span { background: #4285f4; color: white; }
    </style>

    <h2>👥 360 Feedback</h2>

    <div class="form-group">
      <label>Employee Being Reviewed</label>
      <select id="reviewId">${reviewOptions}</select>
    </div>

    <div class="row">
      <div class="form-group">
        <label>Your Name</label>
        <input type="text" id="reviewerName" placeholder="Your name">
      </div>
      <div class="form-group">
        <label>Feedback Type</label>
        <select id="feedbackType">
          ${CONFIG.FEEDBACK_TYPES.map(t => '<option>' + t + '</option>').join('')}
        </select>
      </div>
    </div>

    <div class="form-group">
      <label>Overall Rating</label>
      <select id="overallRating">
        <option value="5">5 - Exceptional</option>
        <option value="4">4 - Exceeds Expectations</option>
        <option value="3" selected>3 - Meets Expectations</option>
        <option value="2">2 - Developing</option>
        <option value="1">1 - Needs Improvement</option>
      </select>
    </div>

    <div class="form-group">
      <label>Strengths</label>
      <textarea id="strengths" placeholder="What does this person do well?"></textarea>
    </div>

    <div class="form-group">
      <label>Areas for Improvement</label>
      <textarea id="improvements" placeholder="What could this person do better?"></textarea>
    </div>

    <div class="form-group">
      <label>Additional Comments</label>
      <textarea id="comments" placeholder="Any other feedback..."></textarea>
    </div>

    <button onclick="submit360Feedback()">Submit Feedback</button>
    <button style="background:#757575" onclick="google.script.host.close()">Cancel</button>

    <script>
      function submit360Feedback() {
        const data = {
          reviewId: document.getElementById('reviewId').value,
          reviewerName: document.getElementById('reviewerName').value,
          feedbackType: document.getElementById('feedbackType').value,
          overallRating: document.getElementById('overallRating').value,
          strengths: document.getElementById('strengths').value,
          improvements: document.getElementById('improvements').value,
          comments: document.getElementById('comments').value
        };

        if (!data.reviewerName) {
          alert('Please enter your name');
          return;
        }

        google.script.run
          .withSuccessHandler(() => {
            alert('Thank you for your feedback!');
            google.script.host.close();
          })
          .withFailureHandler(err => alert('Error: ' + err))
          .add360Feedback(data);
      }
    </script>
  `)
  .setWidth(500)
  .setHeight(550);

  SpreadsheetApp.getUi().showModalDialog(html, '360 Feedback');
}

/**
 * Adds 360 feedback
 */
function add360Feedback(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('360 Feedback');

  if (!sheet) {
    sheet = ss.insertSheet('360 Feedback');
    sheet.appendRow(['Feedback ID', 'Review ID', 'Reviewer Name', 'Feedback Type', 'Rating',
                     'Strengths', 'Improvements', 'Comments', 'Submitted']);
    sheet.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#E8EAF6');
  }

  const feedbackId = 'FB-' + String(sheet.getLastRow()).padStart(4, '0');

  sheet.appendRow([
    feedbackId,
    data.reviewId,
    data.reviewerName,
    data.feedbackType,
    data.overallRating,
    data.strengths,
    data.improvements,
    data.comments,
    new Date()
  ]);

  return feedbackId;
}

/**
 * Shows add goal dialog
 */
function showAddGoalDialog() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const reviewSheet = ss.getSheetByName('Reviews');

  if (!reviewSheet) {
    SpreadsheetApp.getUi().alert('No reviews found. Create a review first.');
    return;
  }

  const data = reviewSheet.getDataRange().getValues();
  const reviewOptions = data.slice(1).map(row =>
    `<option value="${row[0]}">${row[1]} - ${row[8]}</option>`
  ).join('');

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 15px; }
      label { display: block; margin-bottom: 5px; font-weight: bold; }
      input, select, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      textarea { height: 60px; }
      .row { display: flex; gap: 10px; }
      .row .form-group { flex: 1; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; }
    </style>

    <h2>🎯 Add Goal</h2>

    <div class="form-group">
      <label>Employee</label>
      <select id="reviewId">${reviewOptions}</select>
    </div>

    <div class="form-group">
      <label>Goal Title *</label>
      <input type="text" id="title" placeholder="Brief goal description">
    </div>

    <div class="form-group">
      <label>Description</label>
      <textarea id="description" placeholder="Detailed description and success criteria..."></textarea>
    </div>

    <div class="row">
      <div class="form-group">
        <label>Category</label>
        <select id="category">
          <option>Performance</option>
          <option>Development</option>
          <option>Project</option>
          <option>Learning</option>
        </select>
      </div>
      <div class="form-group">
        <label>Weight %</label>
        <input type="number" id="weight" value="25" min="0" max="100">
      </div>
    </div>

    <div class="row">
      <div class="form-group">
        <label>Target Date</label>
        <input type="date" id="targetDate">
      </div>
      <div class="form-group">
        <label>Linked OKR (optional)</label>
        <input type="text" id="okrLink" placeholder="OKR-001">
      </div>
    </div>

    <button onclick="addGoal()">Add Goal</button>
    <button style="background:#757575" onclick="google.script.host.close()">Cancel</button>

    <script>
      function addGoal() {
        const data = {
          reviewId: document.getElementById('reviewId').value,
          title: document.getElementById('title').value,
          description: document.getElementById('description').value,
          category: document.getElementById('category').value,
          weight: document.getElementById('weight').value,
          targetDate: document.getElementById('targetDate').value,
          okrLink: document.getElementById('okrLink').value
        };

        if (!data.title) {
          alert('Please enter a goal title');
          return;
        }

        google.script.run
          .withSuccessHandler(() => {
            alert('Goal added!');
            google.script.host.close();
          })
          .withFailureHandler(err => alert('Error: ' + err))
          .addGoal(data);
      }
    </script>
  `)
  .setWidth(450)
  .setHeight(450);

  SpreadsheetApp.getUi().showModalDialog(html, 'Add Goal');
}

/**
 * Adds a goal
 */
function addGoal(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Goals');

  if (!sheet) {
    sheet = ss.insertSheet('Goals');
    sheet.appendRow(['Goal ID', 'Review ID', 'Title', 'Description', 'Category', 'Weight %',
                     'Target Date', 'Progress %', 'Status', 'OKR Link', 'Created', 'Updated', 'Notes']);
    sheet.getRange(1, 1, 1, 13).setFontWeight('bold').setBackground('#E8EAF6');
  }

  const goalId = 'GOAL-' + String(sheet.getLastRow()).padStart(4, '0');

  sheet.appendRow([
    goalId,
    data.reviewId,
    data.title,
    data.description,
    data.category,
    data.weight,
    data.targetDate ? new Date(data.targetDate) : '',
    0,
    'Not Started',
    data.okrLink,
    new Date(),
    new Date(),
    ''
  ]);

  return goalId;
}

/**
 * Shows update goal dialog
 */
function showUpdateGoalDialog() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const goalsSheet = ss.getSheetByName('Goals');

  if (!goalsSheet) {
    SpreadsheetApp.getUi().alert('No goals found.');
    return;
  }

  const data = goalsSheet.getDataRange().getValues();
  const activeGoals = data.slice(1).filter(row => row[8] !== 'Completed');

  const goalOptions = activeGoals.map(row =>
    `<option value="${row[0]}">${row[0]}: ${row[2]} (${row[7]}%)</option>`
  ).join('');

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 15px; }
      label { display: block; margin-bottom: 5px; font-weight: bold; }
      select, textarea, input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; }
    </style>

    <h2>📈 Update Goal Progress</h2>

    <div class="form-group">
      <label>Select Goal</label>
      <select id="goalId">${goalOptions}</select>
    </div>

    <div class="form-group">
      <label>Progress (%)</label>
      <input type="range" id="progress" min="0" max="100" value="0" oninput="document.getElementById('progressValue').textContent = this.value + '%'">
      <div id="progressValue" style="text-align:center;font-size:24px;font-weight:bold;">0%</div>
    </div>

    <div class="form-group">
      <label>Status</label>
      <select id="status">
        <option>Not Started</option>
        <option>In Progress</option>
        <option>On Track</option>
        <option>At Risk</option>
        <option>Completed</option>
      </select>
    </div>

    <div class="form-group">
      <label>Notes</label>
      <textarea id="notes" placeholder="Progress update notes..."></textarea>
    </div>

    <button onclick="updateGoal()">Update Goal</button>
    <button style="background:#757575" onclick="google.script.host.close()">Cancel</button>

    <script>
      function updateGoal() {
        const data = {
          goalId: document.getElementById('goalId').value,
          progress: document.getElementById('progress').value,
          status: document.getElementById('status').value,
          notes: document.getElementById('notes').value
        };

        google.script.run
          .withSuccessHandler(() => {
            alert('Goal updated!');
            google.script.host.close();
          })
          .withFailureHandler(err => alert('Error: ' + err))
          .updateGoalProgress(data);
      }
    </script>
  `)
  .setWidth(400)
  .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(html, 'Update Goal');
}

/**
 * Updates goal progress
 */
function updateGoalProgress(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Goals');
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.goalId) {
      sheet.getRange(i + 1, 8).setValue(data.progress);
      sheet.getRange(i + 1, 9).setValue(data.status);
      sheet.getRange(i + 1, 12).setValue(new Date());

      const existingNotes = rows[i][12] || '';
      const timestamp = new Date().toLocaleDateString();
      const newNotes = existingNotes + (existingNotes ? '\n' : '') + '[' + timestamp + '] ' + data.notes;
      sheet.getRange(i + 1, 13).setValue(newNotes);
      break;
    }
  }
}

/**
 * Shows goal summary
 */
function showGoalSummary() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const goalsSheet = ss.getSheetByName('Goals');

  if (!goalsSheet) {
    SpreadsheetApp.getUi().alert('No goals found.');
    return;
  }

  const data = goalsSheet.getDataRange().getValues();

  let notStarted = 0, inProgress = 0, onTrack = 0, atRisk = 0, completed = 0;
  let totalProgress = 0;

  data.slice(1).forEach(row => {
    const status = row[8];
    totalProgress += parseInt(row[7]) || 0;

    if (status === 'Not Started') notStarted++;
    else if (status === 'In Progress') inProgress++;
    else if (status === 'On Track') onTrack++;
    else if (status === 'At Risk') atRisk++;
    else if (status === 'Completed') completed++;
  });

  const total = data.length - 1;
  const avgProgress = total > 0 ? Math.round(totalProgress / total) : 0;

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      .metrics { display: flex; flex-wrap: wrap; gap: 10px; }
      .metric { flex: 1; min-width: 80px; padding: 15px; border-radius: 8px; text-align: center; }
      .metric h2 { margin: 0; font-size: 28px; }
      .metric p { margin: 5px 0 0; font-size: 12px; }
      .progress-bar { background: #E0E0E0; border-radius: 10px; height: 30px; overflow: hidden; margin: 20px 0; }
      .progress-fill { background: #4CAF50; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
    </style>

    <h2>Goal Summary</h2>

    <div class="progress-bar">
      <div class="progress-fill" style="width:${avgProgress}%">${avgProgress}% Average Progress</div>
    </div>

    <div class="metrics">
      <div class="metric" style="background:#E3F2FD;">
        <h2>${notStarted}</h2>
        <p>Not Started</p>
      </div>
      <div class="metric" style="background:#FFF3E0;">
        <h2>${inProgress}</h2>
        <p>In Progress</p>
      </div>
      <div class="metric" style="background:#E8F5E9;">
        <h2>${onTrack}</h2>
        <p>On Track</p>
      </div>
      <div class="metric" style="background:#FFEBEE;">
        <h2>${atRisk}</h2>
        <p>At Risk</p>
      </div>
      <div class="metric" style="background:#C8E6C9;">
        <h2>${completed}</h2>
        <p>Completed</p>
      </div>
    </div>

    <p><strong>Total Goals:</strong> ${total}</p>
  `)
  .setWidth(450)
  .setHeight(300);

  SpreadsheetApp.getUi().showModalDialog(html, 'Goal Summary');
}

/**
 * Shows manager review dialog
 */
function showManagerReviewDialog() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const reviewSheet = ss.getSheetByName('Reviews');

  if (!reviewSheet) {
    SpreadsheetApp.getUi().alert('No reviews found.');
    return;
  }

  const data = reviewSheet.getDataRange().getValues();
  const submittedReviews = data.slice(1).filter(row =>
    row[9] === 'Submitted' || row[9] === 'In Progress'
  );

  if (submittedReviews.length === 0) {
    SpreadsheetApp.getUi().alert('No reviews ready for manager assessment.');
    return;
  }

  const reviewOptions = submittedReviews.map(row =>
    `<option value="${row[0]}">${row[1]} - Self: ${row[10] || 'N/A'}</option>`
  ).join('');

  const competencyInputs = CONFIG.COMPETENCIES.map((comp, i) => `
    <div class="competency">
      <label>${comp}</label>
      <select id="comp${i}">
        <option value="5">5 - Exceptional</option>
        <option value="4">4 - Exceeds</option>
        <option value="3" selected>3 - Meets</option>
        <option value="2">2 - Developing</option>
        <option value="1">1 - Needs Improvement</option>
      </select>
    </div>
  `).join('');

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 15px; }
      label { display: block; margin-bottom: 5px; font-weight: bold; }
      select, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      textarea { height: 80px; }
      .competency { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #eee; }
      .competency label { margin: 0; font-weight: normal; }
      .competency select { width: 180px; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; }
      .section { background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0; }
    </style>

    <h2>📋 Manager Review</h2>

    <div class="form-group">
      <label>Select Employee</label>
      <select id="reviewId">${reviewOptions}</select>
    </div>

    <div class="section">
      <h3>Competency Ratings</h3>
      ${competencyInputs}
    </div>

    <div class="form-group">
      <label>Overall Assessment</label>
      <select id="overallRating">
        <option value="5">5 - Exceptional Performance</option>
        <option value="4">4 - Exceeds Expectations</option>
        <option value="3" selected>3 - Meets Expectations</option>
        <option value="2">2 - Developing</option>
        <option value="1">1 - Needs Improvement</option>
      </select>
    </div>

    <div class="form-group">
      <label>Strengths & Accomplishments</label>
      <textarea id="strengths" placeholder="What did the employee do well?"></textarea>
    </div>

    <div class="form-group">
      <label>Development Areas</label>
      <textarea id="development" placeholder="What areas need improvement?"></textarea>
    </div>

    <div class="form-group">
      <label>Goals for Next Period</label>
      <textarea id="goals" placeholder="Recommended goals..."></textarea>
    </div>

    <button onclick="submitManagerReview()">Submit Manager Review</button>
    <button style="background:#757575" onclick="google.script.host.close()">Cancel</button>

    <script>
      function submitManagerReview() {
        const competencies = {};
        ${CONFIG.COMPETENCIES.map((comp, i) => `competencies['${comp}'] = document.getElementById('comp${i}').value;`).join('\n')}

        const data = {
          reviewId: document.getElementById('reviewId').value,
          competencies: competencies,
          overallRating: document.getElementById('overallRating').value,
          strengths: document.getElementById('strengths').value,
          development: document.getElementById('development').value,
          goals: document.getElementById('goals').value
        };

        google.script.run
          .withSuccessHandler(() => {
            alert('Manager review submitted!');
            google.script.host.close();
          })
          .withFailureHandler(err => alert('Error: ' + err))
          .submitManagerReview(data);
      }
    </script>
  `)
  .setWidth(550)
  .setHeight(650);

  SpreadsheetApp.getUi().showModalDialog(html, 'Manager Review');
}

/**
 * Submits manager review
 */
function submitManagerReview(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Update main review sheet
  const reviewSheet = ss.getSheetByName('Reviews');
  const reviewData = reviewSheet.getDataRange().getValues();

  for (let i = 1; i < reviewData.length; i++) {
    if (reviewData[i][0] === data.reviewId) {
      reviewSheet.getRange(i + 1, 10).setValue('Calibrated');
      reviewSheet.getRange(i + 1, 12).setValue(data.overallRating);
      reviewSheet.getRange(i + 1, 16).setValue(new Date());
      break;
    }
  }

  // Store detailed manager review
  let mgrSheet = ss.getSheetByName('Manager Reviews');
  if (!mgrSheet) {
    mgrSheet = ss.insertSheet('Manager Reviews');
    mgrSheet.appendRow(['Review ID', 'Submitted', 'Overall Rating', ...CONFIG.COMPETENCIES,
                        'Strengths', 'Development', 'Goals']);
    mgrSheet.getRange(1, 1, 1, mgrSheet.getLastColumn()).setFontWeight('bold').setBackground('#E8EAF6');
  }

  const competencyValues = CONFIG.COMPETENCIES.map(c => data.competencies[c] || 3);
  mgrSheet.appendRow([
    data.reviewId,
    new Date(),
    data.overallRating,
    ...competencyValues,
    data.strengths,
    data.development,
    data.goals
  ]);
}

/**
 * Shows review summary
 */
function showReviewSummary() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const reviewSheet = ss.getSheetByName('Reviews');

  if (!reviewSheet) {
    SpreadsheetApp.getUi().alert('No reviews found.');
    return;
  }

  const data = reviewSheet.getDataRange().getValues();

  const statusCounts = {};
  CONFIG.REVIEW_STATUSES.forEach(s => statusCounts[s] = 0);

  data.slice(1).forEach(row => {
    const status = row[9];
    if (statusCounts[status] !== undefined) {
      statusCounts[status]++;
    }
  });

  const total = data.length - 1;

  let html = '<style>body{font-family:Arial,sans-serif;padding:15px;} .status{display:flex;justify-content:space-between;padding:10px;border-bottom:1px solid #eee;} .bar{background:#E0E0E0;height:20px;border-radius:10px;flex:1;margin-left:20px;overflow:hidden;} .bar-fill{background:#4285f4;height:100%;}</style>';

  html += '<h2>Review Status Summary</h2>';

  Object.entries(statusCounts).forEach(([status, count]) => {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    html += `
      <div class="status">
        <span>${status}: <strong>${count}</strong></span>
        <div class="bar"><div class="bar-fill" style="width:${pct}%"></div></div>
        <span style="width:50px;text-align:right">${pct}%</span>
      </div>
    `;
  });

  html += `<p style="margin-top:20px"><strong>Total Reviews:</strong> ${total}</p>`;

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(450)
    .setHeight(350);

  SpreadsheetApp.getUi().showModalDialog(output, 'Review Summary');
}

/**
 * Shows calibration grid
 */
function showCalibrationGrid() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const reviewSheet = ss.getSheetByName('Reviews');

  if (!reviewSheet) {
    SpreadsheetApp.getUi().alert('No reviews found.');
    return;
  }

  const data = reviewSheet.getDataRange().getValues();

  // Group by rating
  const byRating = { 5: [], 4: [], 3: [], 2: [], 1: [] };

  data.slice(1).forEach(row => {
    const rating = parseInt(row[12]) || parseInt(row[11]) || 3;
    if (byRating[rating]) {
      byRating[rating].push({
        name: row[1],
        department: row[4],
        selfRating: row[10],
        mgrRating: row[11]
      });
    }
  });

  let html = '<style>body{font-family:Arial,sans-serif;padding:15px;} .rating-group{margin:15px 0;} .rating-group h3{margin:0;padding:10px;color:white;border-radius:4px 4px 0 0;} .employees{border:1px solid #ddd;border-top:none;padding:10px;} .employee{padding:5px;border-bottom:1px solid #eee;font-size:13px;}</style>';

  html += '<h2>Calibration Grid</h2>';

  Object.entries(byRating).reverse().forEach(([rating, employees]) => {
    const config = CONFIG.RATING_SCALE[rating];
    html += `
      <div class="rating-group">
        <h3 style="background:${config.color}">${rating} - ${config.label} (${employees.length})</h3>
        <div class="employees">
          ${employees.length === 0 ? '<em>No employees</em>' :
            employees.map(e => `<div class="employee">${e.name} (${e.department}) - Self: ${e.selfRating || 'N/A'}</div>`).join('')}
        </div>
      </div>
    `;
  });

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(500)
    .setHeight(500);

  SpreadsheetApp.getUi().showModalDialog(output, 'Calibration Grid');
}

/**
 * Shows rating distribution
 */
function showRatingDistribution() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const reviewSheet = ss.getSheetByName('Reviews');

  if (!reviewSheet) {
    SpreadsheetApp.getUi().alert('No reviews found.');
    return;
  }

  const data = reviewSheet.getDataRange().getValues();
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  data.slice(1).forEach(row => {
    const rating = parseInt(row[12]) || parseInt(row[11]);
    if (rating && distribution[rating] !== undefined) {
      distribution[rating]++;
    }
  });

  const total = Object.values(distribution).reduce((a, b) => a + b, 0);
  const maxCount = Math.max(...Object.values(distribution));

  let html = '<style>body{font-family:Arial,sans-serif;padding:15px;} .bar-container{margin:10px 0;} .bar-label{display:flex;justify-content:space-between;margin-bottom:5px;} .bar{height:30px;border-radius:4px;display:flex;align-items:center;padding-left:10px;color:white;font-weight:bold;}</style>';

  html += '<h2>Rating Distribution</h2>';

  Object.entries(distribution).reverse().forEach(([rating, count]) => {
    const config = CONFIG.RATING_SCALE[rating];
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    const width = maxCount > 0 ? (count / maxCount * 100) : 0;

    html += `
      <div class="bar-container">
        <div class="bar-label">
          <span>${rating} - ${config.label}</span>
          <span>${count} (${pct}%)</span>
        </div>
        <div class="bar" style="width:${width}%;background:${config.color}">${count}</div>
      </div>
    `;
  });

  html += `<p><strong>Total Rated:</strong> ${total}</p>`;

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(450)
    .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(output, 'Rating Distribution');
}

/**
 * Shows department comparison
 */
function showDepartmentComparison() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const reviewSheet = ss.getSheetByName('Reviews');

  if (!reviewSheet) {
    SpreadsheetApp.getUi().alert('No reviews found.');
    return;
  }

  const data = reviewSheet.getDataRange().getValues();
  const byDept = {};

  data.slice(1).forEach(row => {
    const dept = row[4] || 'Unknown';
    const rating = parseFloat(row[12]) || parseFloat(row[11]);

    if (!byDept[dept]) byDept[dept] = { total: 0, sum: 0 };
    if (rating) {
      byDept[dept].total++;
      byDept[dept].sum += rating;
    }
  });

  let html = '<style>body{font-family:Arial,sans-serif;padding:15px;} table{width:100%;border-collapse:collapse;} th,td{border:1px solid #ddd;padding:10px;text-align:left;} th{background:#E8EAF6;}</style>';

  html += '<h2>Department Comparison</h2>';
  html += '<table><tr><th>Department</th><th>Employees</th><th>Avg Rating</th></tr>';

  Object.entries(byDept).sort((a, b) => {
    const avgA = a[1].total > 0 ? a[1].sum / a[1].total : 0;
    const avgB = b[1].total > 0 ? b[1].sum / b[1].total : 0;
    return avgB - avgA;
  }).forEach(([dept, stats]) => {
    const avg = stats.total > 0 ? (stats.sum / stats.total).toFixed(2) : 'N/A';
    html += `<tr><td>${dept}</td><td>${stats.total}</td><td>${avg}</td></tr>`;
  });

  html += '</table>';

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(400)
    .setHeight(350);

  SpreadsheetApp.getUi().showModalDialog(output, 'Department Comparison');
}

/**
 * Shows status dashboard
 */
function showStatusDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const reviewSheet = ss.getSheetByName('Reviews');

  if (!reviewSheet) {
    SpreadsheetApp.getUi().alert('No reviews found.');
    return;
  }

  const data = reviewSheet.getDataRange().getValues();

  let notStarted = 0, inProgress = 0, submitted = 0, calibrated = 0, delivered = 0;

  data.slice(1).forEach(row => {
    const status = row[9];
    if (status === 'Not Started') notStarted++;
    else if (status === 'In Progress') inProgress++;
    else if (status === 'Submitted') submitted++;
    else if (status === 'Calibrated') calibrated++;
    else if (status === 'Delivered') delivered++;
  });

  const total = data.length - 1;
  const completionRate = total > 0 ? Math.round((delivered / total) * 100) : 0;

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      .funnel { display: flex; flex-direction: column; gap: 5px; }
      .stage { padding: 15px; color: white; text-align: center; border-radius: 4px; }
      .stage .count { font-size: 24px; font-weight: bold; }
      .progress { margin: 20px 0; background: #E0E0E0; height: 30px; border-radius: 15px; overflow: hidden; }
      .progress-bar { height: 100%; background: #4CAF50; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
    </style>

    <h2>Review Status Dashboard</h2>

    <div class="progress">
      <div class="progress-bar" style="width:${completionRate}%">${completionRate}% Complete</div>
    </div>

    <div class="funnel">
      <div class="stage" style="background:#9E9E9E">
        <div class="count">${notStarted}</div>
        <div>Not Started</div>
      </div>
      <div class="stage" style="background:#2196F3">
        <div class="count">${inProgress}</div>
        <div>In Progress</div>
      </div>
      <div class="stage" style="background:#FF9800">
        <div class="count">${submitted}</div>
        <div>Submitted (Awaiting Manager)</div>
      </div>
      <div class="stage" style="background:#9C27B0">
        <div class="count">${calibrated}</div>
        <div>Calibrated (Ready to Deliver)</div>
      </div>
      <div class="stage" style="background:#4CAF50">
        <div class="count">${delivered}</div>
        <div>Delivered</div>
      </div>
    </div>

    <p><strong>Total Reviews:</strong> ${total}</p>
  `)
  .setWidth(350)
  .setHeight(450);

  SpreadsheetApp.getUi().showModalDialog(html, 'Status Dashboard');
}

/**
 * Shows competency analysis
 */
function showCompetencyAnalysis() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const selfSheet = ss.getSheetByName('Self Reviews');
  const mgrSheet = ss.getSheetByName('Manager Reviews');

  if (!selfSheet && !mgrSheet) {
    SpreadsheetApp.getUi().alert('No review data found.');
    return;
  }

  // Aggregate competency scores
  const competencyScores = {};
  CONFIG.COMPETENCIES.forEach(c => competencyScores[c] = { total: 0, count: 0 });

  if (mgrSheet) {
    const data = mgrSheet.getDataRange().getValues();
    data.slice(1).forEach(row => {
      CONFIG.COMPETENCIES.forEach((comp, i) => {
        const score = parseFloat(row[3 + i]);
        if (score) {
          competencyScores[comp].total += score;
          competencyScores[comp].count++;
        }
      });
    });
  }

  let html = '<style>body{font-family:Arial,sans-serif;padding:15px;} .comp{margin:10px 0;} .comp-label{display:flex;justify-content:space-between;margin-bottom:5px;} .bar{background:#E0E0E0;height:20px;border-radius:10px;overflow:hidden;} .bar-fill{height:100%;border-radius:10px;}</style>';

  html += '<h2>Competency Analysis</h2>';
  html += '<p>Average scores across all manager reviews:</p>';

  Object.entries(competencyScores).forEach(([comp, stats]) => {
    const avg = stats.count > 0 ? (stats.total / stats.count) : 0;
    const pct = (avg / 5) * 100;
    const color = avg >= 4 ? '#4CAF50' : avg >= 3 ? '#FFC107' : '#F44336';

    html += `
      <div class="comp">
        <div class="comp-label">
          <span>${comp}</span>
          <span>${avg.toFixed(2)}</span>
        </div>
        <div class="bar"><div class="bar-fill" style="width:${pct}%;background:${color}"></div></div>
      </div>
    `;
  });

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(450)
    .setHeight(500);

  SpreadsheetApp.getUi().showModalDialog(output, 'Competency Analysis');
}

/**
 * Shows high/low performers analysis
 */
function showPerformerAnalysis() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const reviewSheet = ss.getSheetByName('Reviews');

  if (!reviewSheet) {
    SpreadsheetApp.getUi().alert('No reviews found.');
    return;
  }

  const data = reviewSheet.getDataRange().getValues();
  const rated = data.slice(1)
    .filter(row => row[12] || row[11])
    .map(row => ({
      name: row[1],
      department: row[4],
      rating: parseFloat(row[12]) || parseFloat(row[11])
    }))
    .sort((a, b) => b.rating - a.rating);

  const top = rated.slice(0, 5);
  const bottom = rated.slice(-5).reverse();

  let html = '<style>body{font-family:Arial,sans-serif;padding:15px;} .section{margin:15px 0;} .section h3{background:#1976D2;color:white;padding:10px;margin:0;} .list{border:1px solid #ddd;border-top:none;} .item{padding:10px;border-bottom:1px solid #eee;display:flex;justify-content:space-between;} .high{color:#4CAF50;} .low{color:#F44336;}</style>';

  html += '<h2>Performance Analysis</h2>';

  html += '<div class="section"><h3>Top Performers</h3><div class="list">';
  top.forEach(e => {
    html += `<div class="item"><span>${e.name} (${e.department})</span><span class="high">${e.rating}</span></div>`;
  });
  html += '</div></div>';

  html += '<div class="section"><h3>Needs Attention</h3><div class="list">';
  bottom.forEach(e => {
    html += `<div class="item"><span>${e.name} (${e.department})</span><span class="low">${e.rating}</span></div>`;
  });
  html += '</div></div>';

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(450)
    .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(output, 'Performance Analysis');
}

/**
 * Generates review document
 */
function generateReviewDocument() {
  SpreadsheetApp.getUi().alert(
    'Generate Review Document\n\n' +
    'To generate a formal review document:\n\n' +
    '1. Select an employee row in the Reviews sheet\n' +
    '2. Use File > Download > PDF\n' +
    '3. Or copy data to a Google Doc template'
  );
}

/**
 * Schedules review meeting
 */
function scheduleReviewMeeting() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    'Schedule Review Meeting',
    'Enter employee email:',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const email = response.getResponseText();

  // Would create calendar event here
  ui.alert(
    'Meeting Scheduled\n\n' +
    'A calendar invite would be sent to:\n' + email + '\n\n' +
    'To actually send, set up Calendar API in the script.'
  );
}

/**
 * Shows create PIP dialog
 */
function showCreatePIPDialog() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const reviewSheet = ss.getSheetByName('Reviews');

  if (!reviewSheet) {
    SpreadsheetApp.getUi().alert('No reviews found.');
    return;
  }

  const data = reviewSheet.getDataRange().getValues();
  const reviewOptions = data.slice(1).map(row =>
    `<option value="${row[0]}">${row[1]} - ${row[4]}</option>`
  ).join('');

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 15px; }
      label { display: block; margin-bottom: 5px; font-weight: bold; }
      input, select, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      textarea { height: 100px; }
      button { background: #F44336; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; }
      .warning { background: #FFEBEE; padding: 10px; border-radius: 4px; margin-bottom: 15px; border-left: 4px solid #F44336; }
    </style>

    <h2>⚠️ Create Performance Improvement Plan</h2>

    <div class="warning">
      <strong>Important:</strong> PIPs are serious HR actions. Consult with HR before creating.
    </div>

    <div class="form-group">
      <label>Employee</label>
      <select id="reviewId">${reviewOptions}</select>
    </div>

    <div class="form-group">
      <label>Performance Issues</label>
      <textarea id="issues" placeholder="Describe the performance issues that need to be addressed..."></textarea>
    </div>

    <div class="form-group">
      <label>Expected Improvements</label>
      <textarea id="improvements" placeholder="What improvements are expected?"></textarea>
    </div>

    <div class="form-group">
      <label>Support Provided</label>
      <textarea id="support" placeholder="What support will be provided (training, mentoring, etc.)?"></textarea>
    </div>

    <div class="form-group">
      <label>Duration (days)</label>
      <input type="number" id="duration" value="${CONFIG.PIP_DURATION_DAYS}">
    </div>

    <button onclick="createPIP()">Create PIP</button>
    <button style="background:#757575" onclick="google.script.host.close()">Cancel</button>

    <script>
      function createPIP() {
        const data = {
          reviewId: document.getElementById('reviewId').value,
          issues: document.getElementById('issues').value,
          improvements: document.getElementById('improvements').value,
          support: document.getElementById('support').value,
          duration: document.getElementById('duration').value
        };

        if (!data.issues || !data.improvements) {
          alert('Please fill in required fields');
          return;
        }

        google.script.run
          .withSuccessHandler(() => {
            alert('PIP created. Please notify HR.');
            google.script.host.close();
          })
          .withFailureHandler(err => alert('Error: ' + err))
          .createPIP(data);
      }
    </script>
  `)
  .setWidth(500)
  .setHeight(550);

  SpreadsheetApp.getUi().showModalDialog(html, 'Create PIP');
}

/**
 * Creates a PIP
 */
function createPIP(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('PIPs');

  if (!sheet) {
    sheet = ss.insertSheet('PIPs');
    sheet.appendRow(['PIP ID', 'Review ID', 'Employee', 'Start Date', 'End Date', 'Status',
                     'Issues', 'Expected Improvements', 'Support', 'Check-ins', 'Outcome', 'Notes']);
    sheet.getRange(1, 1, 1, 12).setFontWeight('bold').setBackground('#FFCDD2');
  }

  // Get employee name from review
  const reviewSheet = ss.getSheetByName('Reviews');
  const reviewData = reviewSheet.getDataRange().getValues();
  let employeeName = '';
  for (let i = 1; i < reviewData.length; i++) {
    if (reviewData[i][0] === data.reviewId) {
      employeeName = reviewData[i][1];
      break;
    }
  }

  const pipId = 'PIP-' + String(sheet.getLastRow()).padStart(4, '0');
  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + parseInt(data.duration) * 24 * 60 * 60 * 1000);

  sheet.appendRow([
    pipId,
    data.reviewId,
    employeeName,
    startDate,
    endDate,
    'Active',
    data.issues,
    data.improvements,
    data.support,
    '', // Check-ins
    '', // Outcome
    ''  // Notes
  ]);

  return pipId;
}

/**
 * Shows active PIPs
 */
function showActivePIPs() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('PIPs');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('No PIPs found.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const active = data.slice(1).filter(row => row[5] === 'Active');

  if (active.length === 0) {
    SpreadsheetApp.getUi().alert('No active PIPs.');
    return;
  }

  let html = '<style>body{font-family:Arial,sans-serif;padding:15px;} .pip{background:#FFEBEE;padding:15px;margin:10px 0;border-radius:8px;border-left:4px solid #F44336;} .pip h4{margin:0 0 10px;}</style>';

  html += `<h2>Active PIPs (${active.length})</h2>`;

  active.forEach(row => {
    const daysRemaining = Math.ceil((new Date(row[4]) - new Date()) / (1000 * 60 * 60 * 24));
    html += `
      <div class="pip">
        <h4>${row[0]}: ${row[2]}</h4>
        <p><strong>Days Remaining:</strong> ${daysRemaining}</p>
        <p><strong>End Date:</strong> ${new Date(row[4]).toLocaleDateString()}</p>
        <p><strong>Issues:</strong> ${row[6].substring(0, 100)}...</p>
      </div>
    `;
  });

  const output = HtmlService.createHtmlOutput(html)
    .setWidth(450)
    .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(output, 'Active PIPs');
}

/**
 * Updates PIP status
 */
function updatePIPStatus() {
  SpreadsheetApp.getUi().alert(
    'Update PIP Status\n\n' +
    'To update a PIP:\n' +
    '1. Go to the PIPs sheet\n' +
    '2. Update the Status column (Active/Completed/Extended/Terminated)\n' +
    '3. Add notes in the Outcome column'
  );
}

/**
 * Sends review reminders
 */
function sendReviewReminders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const reviewSheet = ss.getSheetByName('Reviews');

  if (!reviewSheet) {
    SpreadsheetApp.getUi().alert('No reviews found.');
    return;
  }

  const data = reviewSheet.getDataRange().getValues();
  const pending = data.slice(1).filter(row =>
    row[9] === 'Not Started' || row[9] === 'In Progress'
  );

  if (pending.length === 0) {
    SpreadsheetApp.getUi().alert('No pending reviews to remind.');
    return;
  }

  // Show what would be sent
  SpreadsheetApp.getUi().alert(
    'Review Reminders\n\n' +
    'Would send reminders to ' + pending.length + ' employees:\n\n' +
    pending.slice(0, 5).map(r => r[1] + ' (' + r[2] + ')').join('\n') +
    (pending.length > 5 ? '\n...and ' + (pending.length - 5) + ' more' : '')
  );
}

/**
 * Exports all reviews
 */
function exportAllReviews() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  SpreadsheetApp.getUi().alert(
    'Export Reviews\n\n' +
    'Use File > Download > Microsoft Excel (.xlsx)\n' +
    'or File > Download > PDF to export all review data.'
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
      <label>Company Name</label>
      <input type="text" value="${CONFIG.COMPANY_NAME}" disabled>
    </div>

    <div class="setting">
      <label>Rating Scale</label>
      <input type="text" value="1-5 (Needs Improvement to Exceptional)" disabled>
    </div>

    <div class="setting">
      <label>Competencies</label>
      <input type="text" value="${CONFIG.COMPETENCIES.length} competencies" disabled>
    </div>

    <div class="setting">
      <label>PIP Duration (days)</label>
      <input type="number" value="${CONFIG.PIP_DURATION_DAYS}" disabled>
    </div>

    <p><em>Edit CONFIG in Extensions > Apps Script to customize.</em></p>

    <button onclick="google.script.host.close()">Close</button>
  `)
  .setWidth(350)
  .setHeight(350);

  SpreadsheetApp.getUi().showModalDialog(html, 'Settings');
}
