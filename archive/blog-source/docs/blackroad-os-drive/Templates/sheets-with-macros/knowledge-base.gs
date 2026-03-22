/**
 * BlackRoad OS - Knowledge Base Manager
 * Internal wiki, FAQs, and documentation management
 *
 * Features:
 * - Article/document management
 * - Category organization
 * - Search functionality
 * - Version history
 * - FAQ management
 * - Access analytics
 * - Content review workflow
 */

const CONFIG = {
  COMPANY_NAME: 'BlackRoad OS, Inc.',

  // Sheet names
  SHEETS: {
    ARTICLES: 'Articles',
    CATEGORIES: 'Categories',
    FAQS: 'FAQs',
    HISTORY: 'Version History',
    ANALYTICS: 'Analytics'
  },

  // Article statuses
  STATUSES: [
    'Draft',
    'In Review',
    'Published',
    'Archived',
    'Outdated'
  ],

  // Article types
  ARTICLE_TYPES: [
    'How-To Guide',
    'Policy Document',
    'Process/Procedure',
    'FAQ',
    'Reference',
    'Troubleshooting',
    'Best Practices',
    'Template',
    'Announcement'
  ],

  // Default categories
  DEFAULT_CATEGORIES: [
    'Getting Started',
    'Product',
    'Engineering',
    'HR & People',
    'IT & Security',
    'Finance',
    'Sales',
    'Marketing',
    'Customer Success',
    'Legal & Compliance',
    'Company Policies',
    'Tools & Software'
  ],

  // Access levels
  ACCESS_LEVELS: [
    'Public - All employees',
    'Internal - Department only',
    'Restricted - Team only',
    'Confidential - Leadership only'
  ]
};

// ============================================
// MENU SETUP
// ============================================

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📚 Knowledge Base')
    .addItem('📝 Create Article', 'createArticle')
    .addItem('❓ Add FAQ', 'addFAQ')
    .addItem('🔍 Search', 'searchKnowledgeBase')
    .addSeparator()
    .addSubMenu(ui.createMenu('📁 Organization')
      .addItem('Manage Categories', 'manageCategories')
      .addItem('View by Category', 'viewByCategory')
      .addItem('Tag Management', 'manageTags'))
    .addSeparator()
    .addSubMenu(ui.createMenu('✏️ Editing')
      .addItem('Edit Selected Article', 'editArticle')
      .addItem('Update Article Status', 'updateStatus')
      .addItem('View Version History', 'viewVersionHistory'))
    .addSeparator()
    .addSubMenu(ui.createMenu('📊 Reports')
      .addItem('Content Dashboard', 'showContentDashboard')
      .addItem('Popular Articles', 'showPopularArticles')
      .addItem('Outdated Content', 'showOutdatedContent')
      .addItem('Content Gaps', 'showContentGaps'))
    .addSeparator()
    .addItem('📤 Publish Article', 'publishArticle')
    .addItem('🔗 Generate Share Link', 'generateShareLink')
    .addItem('⚙️ Settings', 'showSettings')
    .addToUi();
}

// ============================================
// ARTICLE MANAGEMENT
// ============================================

function createArticle() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 12px; }
      label { display: block; font-weight: bold; margin-bottom: 4px; }
      input, select, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      textarea { min-height: 150px; }
      .row { display: flex; gap: 10px; }
      .row .form-group { flex: 1; }
      button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-right: 8px; }
      .publish { background: #34a853; }
      .tags { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 5px; }
      .tag { padding: 3px 8px; background: #e8f0fe; border-radius: 12px; font-size: 12px; }
    </style>

    <h2>📝 Create Knowledge Base Article</h2>

    <div class="form-group">
      <label>Title *</label>
      <input type="text" id="title" placeholder="Clear, descriptive title">
    </div>

    <div class="row">
      <div class="form-group">
        <label>Category</label>
        <select id="category">
          ${CONFIG.DEFAULT_CATEGORIES.map(c => '<option>' + c + '</option>').join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Type</label>
        <select id="articleType">
          ${CONFIG.ARTICLE_TYPES.map(t => '<option>' + t + '</option>').join('')}
        </select>
      </div>
    </div>

    <div class="form-group">
      <label>Summary (shown in search results)</label>
      <input type="text" id="summary" placeholder="Brief description of what this article covers">
    </div>

    <div class="form-group">
      <label>Content *</label>
      <textarea id="content" placeholder="Article content... Use markdown formatting:
# Heading
## Subheading
- Bullet point
1. Numbered list
**bold** *italic*
[link text](url)"></textarea>
    </div>

    <div class="row">
      <div class="form-group">
        <label>Author</label>
        <input type="text" id="author">
      </div>
      <div class="form-group">
        <label>Access Level</label>
        <select id="accessLevel">
          ${CONFIG.ACCESS_LEVELS.map(a => '<option>' + a + '</option>').join('')}
        </select>
      </div>
    </div>

    <div class="form-group">
      <label>Tags (comma-separated)</label>
      <input type="text" id="tags" placeholder="e.g., onboarding, slack, setup">
    </div>

    <div class="form-group">
      <label>Related Document URL (optional)</label>
      <input type="url" id="docUrl" placeholder="https://docs.google.com/...">
    </div>

    <div style="margin-top: 15px;">
      <button onclick="saveArticle('Draft')">Save as Draft</button>
      <button class="publish" onclick="saveArticle('Published')">Publish Now</button>
    </div>

    <script>
      function saveArticle(status) {
        const data = {
          title: document.getElementById('title').value,
          category: document.getElementById('category').value,
          articleType: document.getElementById('articleType').value,
          summary: document.getElementById('summary').value,
          content: document.getElementById('content').value,
          author: document.getElementById('author').value,
          accessLevel: document.getElementById('accessLevel').value,
          tags: document.getElementById('tags').value,
          docUrl: document.getElementById('docUrl').value,
          status: status
        };

        if (!data.title || !data.content) {
          alert('Please fill in title and content');
          return;
        }

        google.script.run
          .withSuccessHandler(result => {
            alert(result);
            google.script.host.close();
          })
          .saveArticle(data);
      }
    </script>
  `)
  .setWidth(600)
  .setHeight(700);

  SpreadsheetApp.getUi().showModalDialog(html, 'Create Article');
}

function saveArticle(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEETS.ARTICLES);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.ARTICLES);
    sheet.appendRow([
      'Article ID', 'Title', 'Category', 'Type', 'Summary',
      'Content', 'Author', 'Access Level', 'Tags', 'Document URL',
      'Status', 'Version', 'Views', 'Created Date', 'Last Updated',
      'Published Date', 'Review Date', 'Notes'
    ]);
    sheet.getRange(1, 1, 1, 18).setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
  }

  const lastRow = sheet.getLastRow();
  const id = 'KB-' + String(lastRow).padStart(5, '0');
  const now = new Date();

  sheet.appendRow([
    id,
    data.title,
    data.category,
    data.articleType,
    data.summary,
    data.content,
    data.author,
    data.accessLevel,
    data.tags,
    data.docUrl,
    data.status,
    '1.0',
    0,
    now,
    now,
    data.status === 'Published' ? now : '',
    '', // Review date
    ''
  ]);

  // Color code by status
  const newRow = sheet.getLastRow();
  const statusColors = {
    'Draft': '#fff2cc',
    'In Review': '#cfe2f3',
    'Published': '#d9ead3',
    'Archived': '#d9d9d9',
    'Outdated': '#fce8e6'
  };
  sheet.getRange(newRow, 1, 1, 18).setBackground(statusColors[data.status] || '#ffffff');

  return `Article ${data.status === 'Published' ? 'published' : 'saved'}!\n\nID: ${id}`;
}

// ============================================
// SEARCH
// ============================================

function searchKnowledgeBase() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .search-box { display: flex; gap: 10px; margin-bottom: 20px; }
      .search-box input { flex: 1; padding: 12px; border: 2px solid #4285f4; border-radius: 8px; font-size: 16px; }
      .search-box button { padding: 12px 24px; background: #4285f4; color: white; border: none; border-radius: 8px; cursor: pointer; }
      .filters { display: flex; gap: 10px; margin-bottom: 15px; }
      .filters select { padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
      .results { max-height: 400px; overflow-y: auto; }
      .result { padding: 15px; border: 1px solid #eee; border-radius: 8px; margin-bottom: 10px; cursor: pointer; }
      .result:hover { background: #f8f9fa; }
      .result-title { font-weight: bold; color: #4285f4; }
      .result-meta { font-size: 12px; color: #666; margin-top: 5px; }
      .result-summary { margin-top: 8px; font-size: 14px; }
      .tag { display: inline-block; padding: 2px 6px; background: #e8f0fe; border-radius: 10px; font-size: 11px; margin-right: 5px; }
      .no-results { text-align: center; padding: 40px; color: #666; }
    </style>

    <h2>🔍 Search Knowledge Base</h2>

    <div class="search-box">
      <input type="text" id="searchQuery" placeholder="Search articles, FAQs, guides..." onkeypress="if(event.key==='Enter')search()">
      <button onclick="search()">Search</button>
    </div>

    <div class="filters">
      <select id="categoryFilter">
        <option value="">All Categories</option>
        ${CONFIG.DEFAULT_CATEGORIES.map(c => '<option>' + c + '</option>').join('')}
      </select>
      <select id="typeFilter">
        <option value="">All Types</option>
        ${CONFIG.ARTICLE_TYPES.map(t => '<option>' + t + '</option>').join('')}
      </select>
    </div>

    <div class="results" id="results">
      <div class="no-results">Enter a search term to find articles</div>
    </div>

    <script>
      function search() {
        const query = document.getElementById('searchQuery').value;
        const category = document.getElementById('categoryFilter').value;
        const type = document.getElementById('typeFilter').value;

        google.script.run
          .withSuccessHandler(showResults)
          .searchArticles(query, category, type);
      }

      function showResults(results) {
        const container = document.getElementById('results');

        if (results.length === 0) {
          container.innerHTML = '<div class="no-results">No articles found. Try different search terms.</div>';
          return;
        }

        container.innerHTML = results.map(r => \`
          <div class="result" onclick="viewArticle('\${r.id}')">
            <div class="result-title">\${r.title}</div>
            <div class="result-meta">
              \${r.category} • \${r.type} • \${r.views} views
            </div>
            <div class="result-summary">\${r.summary || r.content.substring(0, 150) + '...'}</div>
            <div style="margin-top: 8px;">
              \${r.tags.split(',').map(t => '<span class="tag">' + t.trim() + '</span>').join('')}
            </div>
          </div>
        \`).join('');
      }

      function viewArticle(id) {
        google.script.run.viewArticleById(id);
      }
    </script>
  `)
  .setWidth(600)
  .setHeight(600);

  SpreadsheetApp.getUi().showModalDialog(html, 'Search Knowledge Base');
}

function searchArticles(query, category, type) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.ARTICLES);

  if (!sheet || sheet.getLastRow() < 2) {
    return [];
  }

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 18).getValues();
  const queryLower = query.toLowerCase();

  let results = data.filter(row => {
    // Only show published articles
    if (row[10] !== 'Published') return false;

    // Category filter
    if (category && row[2] !== category) return false;

    // Type filter
    if (type && row[3] !== type) return false;

    // Search in title, content, tags, summary
    const searchable = (row[1] + ' ' + row[4] + ' ' + row[5] + ' ' + row[8]).toLowerCase();
    return searchable.includes(queryLower);
  });

  return results.map(row => ({
    id: row[0],
    title: row[1],
    category: row[2],
    type: row[3],
    summary: row[4],
    content: row[5],
    tags: row[8],
    views: row[12]
  }));
}

function viewArticleById(id) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.ARTICLES);

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 18).getValues();
  const rowIndex = data.findIndex(r => r[0] === id);

  if (rowIndex === -1) return;

  const article = data[rowIndex];

  // Increment view count
  sheet.getRange(rowIndex + 2, 13).setValue((article[12] || 0) + 1);

  // Log analytics
  logArticleView(id);

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      .meta { color: #666; font-size: 14px; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #eee; }
      .content { line-height: 1.6; }
      .tag { display: inline-block; padding: 3px 10px; background: #e8f0fe; border-radius: 12px; font-size: 12px; margin-right: 5px; }
    </style>

    <h1>${article[1]}</h1>

    <div class="meta">
      <strong>${article[2]}</strong> • ${article[3]}<br>
      By ${article[6] || 'Unknown'} • Updated ${new Date(article[14]).toLocaleDateString()}<br>
      <div style="margin-top: 8px;">
        ${article[8].split(',').map(t => '<span class="tag">' + t.trim() + '</span>').join('')}
      </div>
    </div>

    <div class="content">
      ${article[5].replace(/\n/g, '<br>')}
    </div>

    ${article[9] ? '<p style="margin-top: 20px;"><a href="' + article[9] + '" target="_blank">View Full Document</a></p>' : ''}
  `)
  .setWidth(700)
  .setHeight(600);

  SpreadsheetApp.getUi().showModalDialog(html, 'Article: ' + article[1]);
}

function logArticleView(articleId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEETS.ANALYTICS);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.ANALYTICS);
    sheet.appendRow(['Date', 'Article ID', 'Action', 'User']);
    sheet.getRange(1, 1, 1, 4).setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
  }

  sheet.appendRow([new Date(), articleId, 'View', Session.getActiveUser().getEmail() || 'Unknown']);
}

// ============================================
// FAQ MANAGEMENT
// ============================================

function addFAQ() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .form-group { margin-bottom: 15px; }
      label { display: block; font-weight: bold; margin-bottom: 5px; }
      input, select, textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      textarea { min-height: 100px; }
      button { background: #4285f4; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; }
    </style>

    <h2>❓ Add FAQ</h2>

    <div class="form-group">
      <label>Question *</label>
      <input type="text" id="question" placeholder="What is the question?">
    </div>

    <div class="form-group">
      <label>Answer *</label>
      <textarea id="answer" placeholder="Provide a clear, helpful answer..."></textarea>
    </div>

    <div class="form-group">
      <label>Category</label>
      <select id="category">
        ${CONFIG.DEFAULT_CATEGORIES.map(c => '<option>' + c + '</option>').join('')}
      </select>
    </div>

    <div class="form-group">
      <label>Tags (comma-separated)</label>
      <input type="text" id="tags" placeholder="e.g., benefits, vacation, time-off">
    </div>

    <div class="form-group">
      <label>Priority/Order</label>
      <input type="number" id="priority" value="10" placeholder="Lower = shown first">
    </div>

    <button onclick="saveFAQ()">Add FAQ</button>

    <script>
      function saveFAQ() {
        const data = {
          question: document.getElementById('question').value,
          answer: document.getElementById('answer').value,
          category: document.getElementById('category').value,
          tags: document.getElementById('tags').value,
          priority: document.getElementById('priority').value
        };

        if (!data.question || !data.answer) {
          alert('Please fill in question and answer');
          return;
        }

        google.script.run
          .withSuccessHandler(() => {
            alert('FAQ added!');
            google.script.host.close();
          })
          .saveFAQItem(data);
      }
    </script>
  `)
  .setWidth(500)
  .setHeight(500);

  SpreadsheetApp.getUi().showModalDialog(html, 'Add FAQ');
}

function saveFAQItem(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEETS.FAQS);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.FAQS);
    sheet.appendRow([
      'FAQ ID', 'Question', 'Answer', 'Category', 'Tags',
      'Priority', 'Views', 'Helpful Count', 'Status', 'Created Date'
    ]);
    sheet.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
  }

  const id = 'FAQ-' + String(sheet.getLastRow()).padStart(4, '0');

  sheet.appendRow([
    id,
    data.question,
    data.answer,
    data.category,
    data.tags,
    data.priority,
    0,
    0,
    'Published',
    new Date()
  ]);

  return id;
}

// ============================================
// CATEGORY MANAGEMENT
// ============================================

function manageCategories() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEETS.CATEGORIES);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.CATEGORIES);
    sheet.appendRow(['Category ID', 'Name', 'Description', 'Icon', 'Parent Category', 'Article Count', 'Order']);
    sheet.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#4285f4').setFontColor('white');

    // Add default categories
    CONFIG.DEFAULT_CATEGORIES.forEach((cat, i) => {
      sheet.appendRow(['CAT-' + String(i + 1).padStart(3, '0'), cat, '', '', '', 0, i + 1]);
    });
  }

  ss.setActiveSheet(sheet);

  SpreadsheetApp.getUi().alert(
    'Category Management\n\n' +
    'Edit categories directly in this sheet:\n' +
    '- Add new rows for new categories\n' +
    '- Edit names and descriptions\n' +
    '- Set order for display priority\n' +
    '- Use parent category for hierarchy'
  );
}

function viewByCategory() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.ARTICLES);

  if (!sheet || sheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('No articles found.');
    return;
  }

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 18).getValues();

  // Group by category
  const byCategory = {};
  data.forEach(row => {
    if (row[10] !== 'Published') return;
    const cat = row[2];
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push({ id: row[0], title: row[1], type: row[3], views: row[12] });
  });

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .category { margin-bottom: 25px; }
      .category-name { font-weight: bold; font-size: 18px; color: #4285f4; border-bottom: 2px solid #4285f4; padding-bottom: 5px; margin-bottom: 10px; }
      .article { padding: 8px 0; border-bottom: 1px solid #eee; }
      .article-title { cursor: pointer; color: #333; }
      .article-title:hover { color: #4285f4; }
      .article-meta { font-size: 12px; color: #666; }
    </style>

    <h2>📁 Articles by Category</h2>

    ${Object.entries(byCategory).map(([category, articles]) => `
      <div class="category">
        <div class="category-name">${category} (${articles.length})</div>
        ${articles.map(a => `
          <div class="article">
            <div class="article-title" onclick="google.script.run.viewArticleById('${a.id}')">${a.title}</div>
            <div class="article-meta">${a.type} • ${a.views} views</div>
          </div>
        `).join('')}
      </div>
    `).join('')}
  `)
  .setWidth(500)
  .setHeight(600);

  SpreadsheetApp.getUi().showModalDialog(html, 'Browse by Category');
}

// ============================================
// VERSION HISTORY
// ============================================

function viewVersionHistory() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const row = sheet.getActiveRange().getRow();

  if (sheet.getName() !== CONFIG.SHEETS.ARTICLES || row < 2) {
    SpreadsheetApp.getUi().alert('Please select an article row in the Articles sheet.');
    return;
  }

  const article = sheet.getRange(row, 1, 1, 18).getValues()[0];

  // Check history sheet
  const historySheet = ss.getSheetByName(CONFIG.SHEETS.HISTORY);
  let history = [];

  if (historySheet && historySheet.getLastRow() > 1) {
    const historyData = historySheet.getRange(2, 1, historySheet.getLastRow() - 1, 6).getValues();
    history = historyData.filter(h => h[0] === article[0]);
  }

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .current { background: #e8f5e9; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
      .version { padding: 10px; border-bottom: 1px solid #eee; }
      .version-num { font-weight: bold; }
      .version-date { font-size: 12px; color: #666; }
    </style>

    <h2>📜 Version History: ${article[1]}</h2>

    <div class="current">
      <strong>Current Version: ${article[11]}</strong><br>
      Last updated: ${new Date(article[14]).toLocaleString()}<br>
      Status: ${article[10]}
    </div>

    <h3>Previous Versions</h3>
    ${history.length > 0 ? history.map(h => `
      <div class="version">
        <div class="version-num">Version ${h[1]}</div>
        <div class="version-date">${new Date(h[2]).toLocaleString()} by ${h[3]}</div>
        <div>${h[4]}</div>
      </div>
    `).join('') : '<p>No previous versions recorded.</p>'}

    <p style="margin-top: 20px; font-size: 12px; color: #666;">
      Versions are automatically saved when articles are updated.
    </p>
  `)
  .setWidth(450)
  .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(html, 'Version History');
}

// ============================================
// CONTENT DASHBOARD
// ============================================

function showContentDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const articlesSheet = ss.getSheetByName(CONFIG.SHEETS.ARTICLES);
  const faqsSheet = ss.getSheetByName(CONFIG.SHEETS.FAQS);

  const articles = articlesSheet && articlesSheet.getLastRow() > 1
    ? articlesSheet.getRange(2, 1, articlesSheet.getLastRow() - 1, 18).getValues()
    : [];

  const faqs = faqsSheet && faqsSheet.getLastRow() > 1
    ? faqsSheet.getRange(2, 1, faqsSheet.getLastRow() - 1, 10).getValues()
    : [];

  // Calculate stats
  const published = articles.filter(a => a[10] === 'Published').length;
  const drafts = articles.filter(a => a[10] === 'Draft').length;
  const inReview = articles.filter(a => a[10] === 'In Review').length;
  const outdated = articles.filter(a => a[10] === 'Outdated').length;

  const totalViews = articles.reduce((sum, a) => sum + (a[12] || 0), 0);

  // By category
  const byCategory = {};
  articles.forEach(a => {
    if (!byCategory[a[2]]) byCategory[a[2]] = 0;
    byCategory[a[2]]++;
  });

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; background: #f8f9fa; }
      .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px; }
      .stat { background: white; padding: 20px; border-radius: 12px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
      .stat-value { font-size: 36px; font-weight: bold; }
      .stat-label { color: #666; margin-top: 5px; }
      .published { color: #34a853; }
      .drafts { color: #fbbc04; }
      .review { color: #4285f4; }
      .outdated { color: #ea4335; }
      .section { background: white; padding: 20px; border-radius: 12px; margin-bottom: 15px; }
      .bar { display: flex; align-items: center; margin: 8px 0; }
      .bar-label { width: 120px; font-size: 12px; }
      .bar-fill { height: 20px; background: #4285f4; border-radius: 4px; min-width: 5px; }
      .bar-count { margin-left: 10px; font-size: 12px; }
    </style>

    <h2>📊 Knowledge Base Dashboard</h2>

    <div class="stats">
      <div class="stat">
        <div class="stat-value published">${published}</div>
        <div class="stat-label">Published Articles</div>
      </div>
      <div class="stat">
        <div class="stat-value drafts">${drafts}</div>
        <div class="stat-label">Drafts</div>
      </div>
      <div class="stat">
        <div class="stat-value review">${inReview}</div>
        <div class="stat-label">In Review</div>
      </div>
      <div class="stat">
        <div class="stat-value">${faqs.length}</div>
        <div class="stat-label">FAQs</div>
      </div>
    </div>

    <div class="section">
      <h3>📈 Total Views: ${totalViews.toLocaleString()}</h3>
      ${outdated > 0 ? `<p style="color: #ea4335;">⚠️ ${outdated} articles marked as outdated</p>` : ''}
    </div>

    <div class="section">
      <h3>By Category</h3>
      ${Object.entries(byCategory).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([cat, count]) => {
        const maxCount = Math.max(...Object.values(byCategory));
        const width = (count / maxCount) * 100;
        return `
          <div class="bar">
            <div class="bar-label">${cat}</div>
            <div class="bar-fill" style="width: ${width}%"></div>
            <div class="bar-count">${count}</div>
          </div>
        `;
      }).join('')}
    </div>
  `)
  .setWidth(500)
  .setHeight(600);

  SpreadsheetApp.getUi().showModalDialog(html, 'Content Dashboard');
}

function showPopularArticles() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.ARTICLES);

  if (!sheet || sheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('No articles found.');
    return;
  }

  const articles = sheet.getRange(2, 1, sheet.getLastRow() - 1, 18).getValues()
    .filter(a => a[10] === 'Published')
    .sort((a, b) => (b[12] || 0) - (a[12] || 0))
    .slice(0, 10);

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .article { display: flex; padding: 15px 0; border-bottom: 1px solid #eee; }
      .rank { width: 40px; font-size: 24px; font-weight: bold; color: #fbbc04; }
      .info { flex: 1; }
      .title { font-weight: bold; }
      .meta { font-size: 12px; color: #666; margin-top: 5px; }
      .views { width: 80px; text-align: right; font-weight: bold; color: #34a853; }
    </style>

    <h2>🔥 Most Popular Articles</h2>

    ${articles.map((a, i) => `
      <div class="article">
        <div class="rank">${i + 1}</div>
        <div class="info">
          <div class="title">${a[1]}</div>
          <div class="meta">${a[2]} • ${a[3]}</div>
        </div>
        <div class="views">${(a[12] || 0).toLocaleString()} views</div>
      </div>
    `).join('')}
  `)
  .setWidth(500)
  .setHeight(500);

  SpreadsheetApp.getUi().showModalDialog(html, 'Popular Articles');
}

function showOutdatedContent() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.ARTICLES);

  if (!sheet || sheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('No articles found.');
    return;
  }

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const articles = sheet.getRange(2, 1, sheet.getLastRow() - 1, 18).getValues()
    .filter(a => a[10] !== 'Archived' && new Date(a[14]) < sixMonthsAgo);

  if (articles.length === 0) {
    SpreadsheetApp.getUi().alert('All content is up to date! 🎉');
    return;
  }

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .warning { background: #fff2cc; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
      .article { padding: 10px; border-bottom: 1px solid #eee; }
      .title { font-weight: bold; }
      .date { font-size: 12px; color: #666; }
    </style>

    <h2>⚠️ Outdated Content Review</h2>

    <div class="warning">
      <strong>${articles.length} articles</strong> haven't been updated in over 6 months and may need review.
    </div>

    ${articles.map(a => `
      <div class="article">
        <div class="title">${a[1]}</div>
        <div class="date">Last updated: ${new Date(a[14]).toLocaleDateString()} • ${a[2]}</div>
      </div>
    `).join('')}
  `)
  .setWidth(450)
  .setHeight(450);

  SpreadsheetApp.getUi().showModalDialog(html, 'Outdated Content');
}

function showContentGaps() {
  SpreadsheetApp.getUi().alert(
    'Content Gaps Analysis\n\n' +
    'To identify content gaps:\n\n' +
    '1. Review search queries with no results\n' +
    '2. Check support tickets for common questions\n' +
    '3. Survey teams about missing documentation\n' +
    '4. Audit categories with few articles\n\n' +
    'Use the Category view to see article distribution.'
  );
}

// ============================================
// OTHER FUNCTIONS
// ============================================

function editArticle() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const row = sheet.getActiveRange().getRow();

  if (sheet.getName() !== CONFIG.SHEETS.ARTICLES || row < 2) {
    SpreadsheetApp.getUi().alert('Please select an article row in the Articles sheet.');
    return;
  }

  SpreadsheetApp.getUi().alert('Edit the article directly in the sheet, then use "Update Article Status" to publish changes.');
}

function updateStatus() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const row = sheet.getActiveRange().getRow();

  if (sheet.getName() !== CONFIG.SHEETS.ARTICLES || row < 2) {
    SpreadsheetApp.getUi().alert('Please select an article row in the Articles sheet.');
    return;
  }

  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    'Update Status',
    'Enter new status (' + CONFIG.STATUSES.join(', ') + '):',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const newStatus = response.getResponseText();
  if (!CONFIG.STATUSES.includes(newStatus)) {
    ui.alert('Invalid status. Please use: ' + CONFIG.STATUSES.join(', '));
    return;
  }

  sheet.getRange(row, 11).setValue(newStatus);
  sheet.getRange(row, 15).setValue(new Date()); // Last updated

  // Update color
  const statusColors = {
    'Draft': '#fff2cc',
    'In Review': '#cfe2f3',
    'Published': '#d9ead3',
    'Archived': '#d9d9d9',
    'Outdated': '#fce8e6'
  };
  sheet.getRange(row, 1, 1, 18).setBackground(statusColors[newStatus] || '#ffffff');

  if (newStatus === 'Published') {
    sheet.getRange(row, 16).setValue(new Date()); // Published date
  }

  ui.alert('Status updated to: ' + newStatus);
}

function publishArticle() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const row = sheet.getActiveRange().getRow();

  if (sheet.getName() !== CONFIG.SHEETS.ARTICLES || row < 2) {
    SpreadsheetApp.getUi().alert('Please select an article row in the Articles sheet.');
    return;
  }

  sheet.getRange(row, 11).setValue('Published');
  sheet.getRange(row, 15).setValue(new Date());
  sheet.getRange(row, 16).setValue(new Date());
  sheet.getRange(row, 1, 1, 18).setBackground('#d9ead3');

  SpreadsheetApp.getUi().alert('Article published!');
}

function generateShareLink() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  SpreadsheetApp.getUi().alert(
    'Share Link\n\n' +
    'Share this spreadsheet URL:\n' +
    ss.getUrl() + '\n\n' +
    'Or create a Google Site/Doc that links to specific articles.'
  );
}

function manageTags() {
  SpreadsheetApp.getUi().alert(
    'Tag Management\n\n' +
    'Tags are stored in the Tags column of each article.\n' +
    'Use consistent tags across articles:\n\n' +
    'Examples:\n' +
    '- onboarding, new-hire\n' +
    '- policy, hr, benefits\n' +
    '- troubleshooting, it-support\n' +
    '- product, feature, how-to'
  );
}

function showSettings() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      .setting { margin-bottom: 15px; padding: 10px; background: #f5f5f5; border-radius: 4px; }
    </style>

    <h2>⚙️ Knowledge Base Settings</h2>

    <div class="setting">
      <strong>Article Statuses</strong>
      <p style="font-size: 12px;">${CONFIG.STATUSES.join(' → ')}</p>
    </div>

    <div class="setting">
      <strong>Article Types</strong>
      <p style="font-size: 12px;">${CONFIG.ARTICLE_TYPES.join(', ')}</p>
    </div>

    <div class="setting">
      <strong>Default Categories</strong>
      <p style="font-size: 12px;">${CONFIG.DEFAULT_CATEGORIES.join(', ')}</p>
    </div>

    <div class="setting">
      <strong>Access Levels</strong>
      <ul style="font-size: 12px; margin: 0; padding-left: 20px;">
        ${CONFIG.ACCESS_LEVELS.map(a => '<li>' + a + '</li>').join('')}
      </ul>
    </div>

    <h3>Best Practices</h3>
    <ul>
      <li>Use clear, searchable titles</li>
      <li>Add relevant tags for discoverability</li>
      <li>Review content quarterly</li>
      <li>Mark outdated content for update</li>
    </ul>
  `)
  .setWidth(400)
  .setHeight(500);

  SpreadsheetApp.getUi().showModalDialog(html, 'Settings');
}
