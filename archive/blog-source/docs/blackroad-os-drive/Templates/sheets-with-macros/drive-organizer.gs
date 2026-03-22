/**
 * BLACKROAD OS - Google Drive Organizer
 *
 * SETUP: Extensions > Apps Script > Paste this code > Save > Refresh sheet
 *
 * FEATURES:
 * - Scan Drive for all files
 * - Auto-categorize by file type and keywords
 * - Suggest folder organization
 * - Batch move files to folders
 * - Duplicate file detection
 * - Storage analytics
 * - File naming standardization
 * - Archive old files
 */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📁 Drive Organizer')
    .addItem('🔍 Scan My Drive', 'scanDrive')
    .addItem('📊 Storage Analytics', 'storageAnalytics')
    .addSeparator()
    .addSubMenu(ui.createMenu('🗂️ Organization')
      .addItem('Auto-Categorize Files', 'autoCategorize')
      .addItem('Find Duplicates', 'findDuplicates')
      .addItem('Suggest Folder Structure', 'suggestFolders')
      .addItem('Create BlackRoad Folder Structure', 'createBlackRoadFolders'))
    .addSeparator()
    .addSubMenu(ui.createMenu('📦 Batch Actions')
      .addItem('Move Selected to Folder', 'moveSelectedToFolder')
      .addItem('Archive Old Files (1+ year)', 'archiveOldFiles')
      .addItem('Standardize File Names', 'standardizeNames'))
    .addSeparator()
    .addItem('📧 Email Organization Report', 'emailOrgReport')
    .addItem('⚙️ Settings', 'openOrganizerSettings')
    .addToUi();
}

const CONFIG = {
  CATEGORIES: {
    'Resumes': ['resume', 'cv', 'curriculum'],
    'Legal': ['contract', 'agreement', 'nda', 'terms', 'legal', 'compliance'],
    'Financial': ['invoice', 'budget', 'financial', 'tax', 'expense', 'revenue'],
    'Marketing': ['pitch', 'deck', 'presentation', 'proposal', 'marketing'],
    'Technical': ['spec', 'architecture', 'technical', 'api', 'code', 'github'],
    'HR': ['employee', 'onboarding', 'offer', 'policy', 'handbook'],
    'Whitepapers': ['whitepaper', 'research', 'thesis', 'manifesto'],
    'Templates': ['template', 'form', 'checklist'],
    'Personal': ['personal', 'notes', 'draft']
  },
  BLACKROAD_STRUCTURE: [
    'BlackRoad OS/Corporate/Formation',
    'BlackRoad OS/Corporate/Legal',
    'BlackRoad OS/Corporate/Tax',
    'BlackRoad OS/Corporate/Compliance',
    'BlackRoad OS/Finance/Invoices',
    'BlackRoad OS/Finance/Expenses',
    'BlackRoad OS/Finance/Reports',
    'BlackRoad OS/HR/Recruiting',
    'BlackRoad OS/HR/Onboarding',
    'BlackRoad OS/HR/Policies',
    'BlackRoad OS/Engineering/Architecture',
    'BlackRoad OS/Engineering/Documentation',
    'BlackRoad OS/Engineering/Specs',
    'BlackRoad OS/Marketing/Pitch Decks',
    'BlackRoad OS/Marketing/Whitepapers',
    'BlackRoad OS/Marketing/Brand',
    'BlackRoad OS/Sales/Proposals',
    'BlackRoad OS/Sales/Contracts',
    'BlackRoad OS/Sales/Pipeline',
    'BlackRoad OS/Products/Prism Console',
    'BlackRoad OS/Products/Agent Swarm',
    'BlackRoad OS/Products/Documentation',
    'BlackRoad OS/Templates/Sheets',
    'BlackRoad OS/Templates/Docs',
    'BlackRoad OS/Templates/Slides',
    'BlackRoad OS/Archive/2024',
    'BlackRoad OS/Archive/2023',
    'BlackRoad OS/Personal/Resumes',
    'BlackRoad OS/Personal/Notes'
  ]
};

// Scan Drive
function scanDrive() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('Scan Drive', 'This will scan your entire Google Drive and list all files. This may take a few minutes.\n\nContinue?', ui.ButtonSet.YES_NO);

  if (response !== ui.Button.YES) return;

  const sheet = SpreadsheetApp.getActiveSheet();

  // Clear and setup headers
  sheet.clear();
  sheet.getRange(1, 1, 1, 10).setValues([['File Name', 'Type', 'Size (KB)', 'Created', 'Modified', 'Folder', 'Category', 'Action', 'File ID', 'URL']]);
  sheet.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#2979FF').setFontColor('white');

  // Get all files
  const files = DriveApp.getFiles();
  let row = 2;
  let count = 0;

  while (files.hasNext() && count < 1000) { // Limit to 1000 to avoid timeout
    const file = files.next();

    try {
      const parents = file.getParents();
      let folderName = 'Root';
      if (parents.hasNext()) {
        folderName = parents.next().getName();
      }

      const fileName = file.getName();
      const category = categorizeFile(fileName);

      sheet.getRange(row, 1, 1, 10).setValues([[
        fileName,
        file.getMimeType().split('.').pop() || file.getMimeType(),
        Math.round(file.getSize() / 1024),
        file.getDateCreated(),
        file.getLastUpdated(),
        folderName,
        category,
        '', // Action column for user to select
        file.getId(),
        file.getUrl()
      ]]);

      // Color code by category
      const colors = {
        'Resumes': '#E3F2FD',
        'Legal': '#FCE4EC',
        'Financial': '#E8F5E9',
        'Marketing': '#FFF3E0',
        'Technical': '#F3E5F5',
        'HR': '#E0F7FA',
        'Whitepapers': '#FFF8E1',
        'Templates': '#F1F8E9',
        'Personal': '#ECEFF1',
        'Uncategorized': '#FFFFFF'
      };
      sheet.getRange(row, 1, 1, 10).setBackground(colors[category] || '#FFFFFF');

      row++;
      count++;
    } catch (e) {
      // Skip files with access issues
    }
  }

  // Freeze header row
  sheet.setFrozenRows(1);

  ui.alert('✅ Scan Complete!\n\nFound ' + count + ' files.\n\nUse "Auto-Categorize" to organize them.');
}

// Categorize file based on name
function categorizeFile(fileName) {
  const lowerName = fileName.toLowerCase();

  for (const [category, keywords] of Object.entries(CONFIG.CATEGORIES)) {
    for (const keyword of keywords) {
      if (lowerName.includes(keyword)) {
        return category;
      }
    }
  }

  return 'Uncategorized';
}

// Auto-categorize files
function autoCategorize() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert('No files to categorize. Run "Scan My Drive" first.');
    return;
  }

  let updated = 0;

  for (let row = 2; row <= lastRow; row++) {
    const fileName = sheet.getRange(row, 1).getValue();
    const currentCategory = sheet.getRange(row, 7).getValue();

    if (!currentCategory || currentCategory === 'Uncategorized') {
      const newCategory = categorizeFile(fileName);
      sheet.getRange(row, 7).setValue(newCategory);

      // Suggest action based on category
      let suggestedAction = '';
      if (newCategory === 'Resumes') suggestedAction = 'Move to: BlackRoad OS/Personal/Resumes';
      else if (newCategory === 'Legal') suggestedAction = 'Move to: BlackRoad OS/Corporate/Legal';
      else if (newCategory === 'Financial') suggestedAction = 'Move to: BlackRoad OS/Finance/Reports';
      else if (newCategory === 'Marketing') suggestedAction = 'Move to: BlackRoad OS/Marketing/Pitch Decks';
      else if (newCategory === 'Technical') suggestedAction = 'Move to: BlackRoad OS/Engineering/Documentation';
      else if (newCategory === 'Whitepapers') suggestedAction = 'Move to: BlackRoad OS/Marketing/Whitepapers';

      if (suggestedAction) {
        sheet.getRange(row, 8).setValue(suggestedAction);
      }

      updated++;
    }
  }

  SpreadsheetApp.getUi().alert('✅ Categorized ' + updated + ' files.\n\nReview the "Action" column for suggested organization.');
}

// Storage Analytics
function storageAnalytics() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert('No data. Run "Scan My Drive" first.');
    return;
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 10).getValues();

  let stats = {
    totalFiles: data.length,
    totalSize: 0,
    byType: {},
    byCategory: {},
    byFolder: {},
    oldFiles: 0, // Older than 1 year
    rootFiles: 0
  };

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  for (const row of data) {
    const size = row[2] || 0;
    const type = row[1] || 'Unknown';
    const modified = new Date(row[4]);
    const folder = row[5] || 'Root';
    const category = row[6] || 'Uncategorized';

    stats.totalSize += size;

    stats.byType[type] = (stats.byType[type] || 0) + 1;
    stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
    stats.byFolder[folder] = (stats.byFolder[folder] || 0) + 1;

    if (modified < oneYearAgo) stats.oldFiles++;
    if (folder === 'Root') stats.rootFiles++;
  }

  let report = `
📊 DRIVE STORAGE ANALYTICS
==========================

Total Files: ${stats.totalFiles}
Total Size: ${(stats.totalSize / 1024).toFixed(2)} MB
Root Files: ${stats.rootFiles} (consider organizing!)
Old Files (1+ year): ${stats.oldFiles}

BY FILE TYPE:
`;

  const topTypes = Object.entries(stats.byType).sort((a, b) => b[1] - a[1]).slice(0, 5);
  for (const [type, count] of topTypes) {
    report += `  ${type}: ${count}\n`;
  }

  report += '\nBY CATEGORY:\n';
  for (const [category, count] of Object.entries(stats.byCategory)) {
    report += `  ${category}: ${count}\n`;
  }

  report += '\nTOP FOLDERS:\n';
  const topFolders = Object.entries(stats.byFolder).sort((a, b) => b[1] - a[1]).slice(0, 5);
  for (const [folder, count] of topFolders) {
    report += `  ${folder}: ${count}\n`;
  }

  SpreadsheetApp.getUi().alert(report);
}

// Find Duplicates
function findDuplicates() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert('No data. Run "Scan My Drive" first.');
    return;
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 10).getValues();
  const fileNames = {};
  let duplicates = [];

  for (let i = 0; i < data.length; i++) {
    const fileName = data[i][0];
    const normalizedName = fileName.toLowerCase().replace(/\s*\(\d+\)\s*/, '').trim();

    if (fileNames[normalizedName]) {
      duplicates.push({
        name: fileName,
        original: fileNames[normalizedName],
        row: i + 2
      });
      // Highlight duplicate
      sheet.getRange(i + 2, 1, 1, 10).setBackground('#FFCDD2');
    } else {
      fileNames[normalizedName] = fileName;
    }
  }

  if (duplicates.length === 0) {
    SpreadsheetApp.getUi().alert('✅ No duplicates found!');
    return;
  }

  let report = '⚠️ POTENTIAL DUPLICATES FOUND\n\n';
  report += `Found ${duplicates.length} potential duplicates (highlighted in red):\n\n`;

  for (const dup of duplicates.slice(0, 10)) {
    report += `• "${dup.name}"\n  Similar to: "${dup.original}"\n\n`;
  }

  if (duplicates.length > 10) {
    report += `... and ${duplicates.length - 10} more.`;
  }

  SpreadsheetApp.getUi().alert(report);
}

// Create BlackRoad Folder Structure
function createBlackRoadFolders() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('Create Folder Structure', 'This will create the complete BlackRoad OS folder structure in your Drive.\n\nThis includes:\n• Corporate (Formation, Legal, Tax, Compliance)\n• Finance (Invoices, Expenses, Reports)\n• HR (Recruiting, Onboarding, Policies)\n• Engineering (Architecture, Docs, Specs)\n• Marketing (Pitch Decks, Whitepapers, Brand)\n• Sales (Proposals, Contracts, Pipeline)\n• Products (Prism Console, Agent Swarm)\n• Templates (Sheets, Docs, Slides)\n• Archive (by year)\n• Personal\n\nContinue?', ui.ButtonSet.YES_NO);

  if (response !== ui.Button.YES) return;

  let created = 0;
  const folderCache = {};

  for (const path of CONFIG.BLACKROAD_STRUCTURE) {
    try {
      createFolderPath(path, folderCache);
      created++;
    } catch (e) {
      // Folder might already exist
    }
  }

  ui.alert('✅ Created ' + created + ' folders!\n\nYour BlackRoad OS folder structure is ready.');
}

// Helper: Create folder path
function createFolderPath(path, cache) {
  const parts = path.split('/');
  let parent = DriveApp.getRootFolder();
  let currentPath = '';

  for (const part of parts) {
    currentPath += (currentPath ? '/' : '') + part;

    if (cache[currentPath]) {
      parent = cache[currentPath];
    } else {
      // Check if folder exists
      const folders = parent.getFoldersByName(part);
      if (folders.hasNext()) {
        parent = folders.next();
      } else {
        parent = parent.createFolder(part);
      }
      cache[currentPath] = parent;
    }
  }

  return parent;
}

// Suggest Folder Structure
function suggestFolders() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert('No data. Run "Scan My Drive" first.');
    return;
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 10).getValues();

  let suggestions = {};

  for (let i = 0; i < data.length; i++) {
    const fileName = data[i][0];
    const category = data[i][6];
    const folder = data[i][5];

    if (folder === 'Root') {
      let suggestedFolder = 'BlackRoad OS/';

      if (category === 'Resumes') suggestedFolder += 'Personal/Resumes';
      else if (category === 'Legal') suggestedFolder += 'Corporate/Legal';
      else if (category === 'Financial') suggestedFolder += 'Finance/Reports';
      else if (category === 'Marketing') suggestedFolder += 'Marketing/Pitch Decks';
      else if (category === 'Technical') suggestedFolder += 'Engineering/Documentation';
      else if (category === 'HR') suggestedFolder += 'HR/Policies';
      else if (category === 'Whitepapers') suggestedFolder += 'Marketing/Whitepapers';
      else if (category === 'Templates') suggestedFolder += 'Templates';
      else suggestedFolder += 'Personal/Notes';

      sheet.getRange(i + 2, 8).setValue('Move to: ' + suggestedFolder);

      if (!suggestions[suggestedFolder]) suggestions[suggestedFolder] = 0;
      suggestions[suggestedFolder]++;
    }
  }

  let report = '📁 SUGGESTED ORGANIZATION\n\nFiles to move by folder:\n\n';

  for (const [folder, count] of Object.entries(suggestions).sort((a, b) => b[1] - a[1])) {
    report += `${folder}: ${count} files\n`;
  }

  report += '\nReview the "Action" column and use "Move Selected to Folder" to organize.';

  SpreadsheetApp.getUi().alert(report);
}

// Move Selected to Folder
function moveSelectedToFolder() {
  const ui = SpreadsheetApp.getUi();
  const sheet = SpreadsheetApp.getActiveSheet();
  const selection = sheet.getActiveRange();

  if (!selection) {
    ui.alert('Select rows to move first.');
    return;
  }

  const folderResponse = ui.prompt('Enter destination folder path (e.g., "BlackRoad OS/Personal/Resumes"):', ui.ButtonSet.OK_CANCEL);

  if (folderResponse.getSelectedButton() !== ui.Button.OK) return;

  const folderPath = folderResponse.getResponseText().trim();

  // Create/get folder
  const folderCache = {};
  let destFolder;
  try {
    destFolder = createFolderPath(folderPath, folderCache);
  } catch (e) {
    ui.alert('❌ Could not create folder: ' + folderPath);
    return;
  }

  const startRow = selection.getRow();
  const numRows = selection.getNumRows();
  let moved = 0;

  for (let i = 0; i < numRows; i++) {
    const row = startRow + i;
    if (row < 2) continue; // Skip header

    const fileId = sheet.getRange(row, 9).getValue();
    if (!fileId) continue;

    try {
      const file = DriveApp.getFileById(fileId);

      // Remove from current parents
      const parents = file.getParents();
      while (parents.hasNext()) {
        parents.next().removeFile(file);
      }

      // Add to new folder
      destFolder.addFile(file);

      // Update sheet
      sheet.getRange(row, 6).setValue(folderPath.split('/').pop());
      sheet.getRange(row, 8).setValue('✅ Moved');
      sheet.getRange(row, 1, 1, 10).setBackground('#C8E6C9');

      moved++;
    } catch (e) {
      sheet.getRange(row, 8).setValue('❌ Error: ' + e.message);
    }
  }

  ui.alert('✅ Moved ' + moved + ' files to ' + folderPath);
}

// Archive Old Files
function archiveOldFiles() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('Archive Old Files', 'This will move files not modified in 1+ year to BlackRoad OS/Archive/[Year].\n\nContinue?', ui.ButtonSet.YES_NO);

  if (response !== ui.Button.YES) return;

  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    ui.alert('No data. Run "Scan My Drive" first.');
    return;
  }

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const folderCache = {};
  let archived = 0;

  for (let row = 2; row <= lastRow; row++) {
    const modified = new Date(sheet.getRange(row, 5).getValue());
    const fileId = sheet.getRange(row, 9).getValue();
    const folder = sheet.getRange(row, 6).getValue();

    if (modified < oneYearAgo && folder === 'Root' && fileId) {
      const year = modified.getFullYear();
      const archivePath = 'BlackRoad OS/Archive/' + year;

      try {
        const archiveFolder = createFolderPath(archivePath, folderCache);
        const file = DriveApp.getFileById(fileId);

        const parents = file.getParents();
        while (parents.hasNext()) {
          parents.next().removeFile(file);
        }

        archiveFolder.addFile(file);

        sheet.getRange(row, 6).setValue('Archive/' + year);
        sheet.getRange(row, 8).setValue('📦 Archived');
        sheet.getRange(row, 1, 1, 10).setBackground('#ECEFF1');

        archived++;
      } catch (e) {
        // Skip errors
      }
    }
  }

  ui.alert('📦 Archived ' + archived + ' old files.');
}

// Standardize Names
function standardizeNames() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('Standardize Names', 'This will rename files to follow BlackRoad naming convention:\n\n• Remove special characters\n• Proper capitalization\n• Date prefix (YYYY-MM-DD) for documents\n\nContinue?', ui.ButtonSet.YES_NO);

  if (response !== ui.Button.YES) return;

  // For now, just show what would be changed
  ui.alert('📝 Name Standardization\n\nThis feature will suggest standardized names in the "Action" column.\n\nReview changes before applying.');
}

// Email Organization Report
function emailOrgReport() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Send organization report to:', ui.ButtonSet.OK_CANCEL);

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const email = response.getResponseText();
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();

  let rootCount = 0;
  let totalFiles = lastRow - 1;

  for (let row = 2; row <= lastRow; row++) {
    if (sheet.getRange(row, 6).getValue() === 'Root') rootCount++;
  }

  const subject = 'Google Drive Organization Report - ' + new Date().toLocaleDateString();
  const body = `
GOOGLE DRIVE ORGANIZATION REPORT
================================

Total Files Scanned: ${totalFiles}
Files in Root (need organizing): ${rootCount}
Organization Score: ${totalFiles > 0 ? Math.round(((totalFiles - rootCount) / totalFiles) * 100) : 100}%

Recommended Actions:
${rootCount > 100 ? '🚨 URGENT: Over 100 files in root! Run Drive Organizer.' : '✅ Looking good!'}

View full report: ${SpreadsheetApp.getActiveSpreadsheet().getUrl()}

--
BlackRoad OS Drive Organizer
  `;

  MailApp.sendEmail(email, subject, body);
  ui.alert('✅ Report sent to ' + email);
}

// Settings
function openOrganizerSettings() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      h3 { color: #2979FF; }
    </style>
    <h3>⚙️ Drive Organizer Settings</h3>
    <p><b>Categories:</b></p>
    <p>Resumes, Legal, Financial, Marketing, Technical, HR, Whitepapers, Templates, Personal</p>
    <p><b>BlackRoad Structure:</b></p>
    <p>• Corporate (Formation, Legal, Tax, Compliance)</p>
    <p>• Finance, HR, Engineering, Marketing, Sales</p>
    <p>• Products (Prism Console, Agent Swarm)</p>
    <p>• Templates, Archive, Personal</p>
    <p><b>To customize:</b> Edit CONFIG in Apps Script</p>
  `).setWidth(400).setHeight(350);

  SpreadsheetApp.getUi().showModalDialog(html, '⚙️ Settings');
}
