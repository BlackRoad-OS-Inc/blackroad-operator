const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'flaky-tests.json');

function loadDB() {
  if (!fs.existsSync(DB_PATH)) {
    return { version: '1.0', last_updated: new Date().toISOString(), tests: {} };
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function saveDB(db) {
  db.last_updated = new Date().toISOString();
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function addTest(testPath, reason = 'flaky behavior detected') {
  const db = loadDB();
  if (!db.tests[testPath]) {
    db.tests[testPath] = {
      added: new Date().toISOString(),
      reason,
      failures: 1,
      consecutive_passes: 0,
      last_run: null,
      history: []
    };
  } else {
    db.tests[testPath].failures += 1;
    db.tests[testPath].consecutive_passes = 0;
  }
  saveDB(db);
  return db.tests[testPath];
}

function removeTest(testPath) {
  const db = loadDB();
  if (db.tests[testPath]) {
    delete db.tests[testPath];
    saveDB(db);
    return true;
  }
  return false;
}

function recordResult(testPath, passed) {
  const db = loadDB();
  if (db.tests[testPath]) {
    db.tests[testPath].last_run = new Date().toISOString();
    db.tests[testPath].history.push({
      timestamp: new Date().toISOString(),
      passed
    });

    if (passed) {
      db.tests[testPath].consecutive_passes += 1;
    } else {
      db.tests[testPath].consecutive_passes = 0;
      db.tests[testPath].failures += 1;
    }

    // Auto-remove if 10 consecutive passes
    if (db.tests[testPath].consecutive_passes >= 10) {
      console.log(`✅ Auto-removing ${testPath} - 10 consecutive passes`);
      delete db.tests[testPath];
    }

    saveDB(db);
  }
}

function listTests() {
  const db = loadDB();
  return Object.keys(db.tests).map(testPath => ({
    path: testPath,
    ...db.tests[testPath]
  }));
}

const action = process.argv[2];
const testPath = process.argv[3];
const reason = process.argv[4];

switch (action) {
  case 'add':
    console.log(JSON.stringify(addTest(testPath, reason)));
    break;
  case 'remove':
    console.log(removeTest(testPath) ? 'Removed' : 'Not found');
    break;
  case 'record':
    const passed = process.argv[4] === 'true';
    recordResult(testPath, passed);
    break;
  case 'list':
    console.log(JSON.stringify(listTests(), null, 2));
    break;
  default:
    console.error('Unknown action:', action);
    process.exit(1);
}
