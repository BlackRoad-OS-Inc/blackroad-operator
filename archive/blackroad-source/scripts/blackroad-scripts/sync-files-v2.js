#!/usr/bin/env node
// BlackRoad File Sync Engine - Phase 2
// Syncs files across repositories with safety features

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

const SYNC_HOME = path.join(process.env.HOME, '.blackroad-sync');
const DEPENDENCY_GRAPH = path.join(SYNC_HOME, 'dependency-graph.json');
const SYNC_LOG = path.join(SYNC_HOME, 'sync-log.json');

const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function exec(cmd, options = {}) {
  try {
    return execSync(cmd, { 
      encoding: 'utf-8', 
      stdio: options.silent ? 'pipe' : ['pipe', 'pipe', 'pipe']
    }).trim();
  } catch (err) {
    if (options.ignoreError) return null;
    throw err;
  }
}

function parseArgs(args) {
  const options = {
    pattern: null,
    source: null,
    sourceFile: null,
    exclude: [],
    include: [],
    org: null,
    dryRun: true, // Default to dry-run for safety
    force: false,
    concurrency: 10,
    branch: 'main',
    commitMessage: 'Sync files via br-sync'
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--pattern=')) {
      options.pattern = arg.split('=')[1];
    } else if (arg === '--pattern' && args[i + 1]) {
      options.pattern = args[++i];
    } else if (arg.startsWith('--source-file=')) {
      options.sourceFile = arg.split('=')[1];
    } else if (arg === '--source-file' && args[i + 1]) {
      options.sourceFile = args[++i];
    } else if (arg.startsWith('--source=')) {
      options.source = arg.split('=')[1];
    } else if (arg === '--source' && args[i + 1]) {
      options.source = args[++i];
    } else if (arg.startsWith('--exclude=')) {
      options.exclude = arg.split('=')[1].split(',');
    } else if (arg === '--exclude' && args[i + 1]) {
      options.exclude = args[++i].split(',');
    } else if (arg.startsWith('--include=')) {
      options.include = arg.split('=')[1].split(',');
    } else if (arg === '--include' && args[i + 1]) {
      options.include = args[++i].split(',');
    } else if (arg.startsWith('--org=')) {
      options.org = arg.split('=')[1];
    } else if (arg === '--org' && args[i + 1]) {
      options.org = args[++i];
    } else if (arg === '--no-dry-run' || arg === '--execute') {
      options.dryRun = false;
    } else if (arg === '--force') {
      options.force = true;
    } else if (arg.startsWith('--concurrency=')) {
      options.concurrency = parseInt(arg.split('=')[1]);
    } else if (arg === '--concurrency' && args[i + 1]) {
      options.concurrency = parseInt(args[++i]);
    } else if (arg.startsWith('--branch=')) {
      options.branch = arg.split('=')[1];
    } else if (arg === '--branch' && args[i + 1]) {
      options.branch = args[++i];
    } else if (arg.startsWith('--message=')) {
      options.commitMessage = arg.split('=')[1];
    } else if (arg === '--message' && args[i + 1]) {
      options.commitMessage = args[++i];
    }
  }
  
  return options;
}

async function loadGraph() {
  const data = await fs.readFile(DEPENDENCY_GRAPH, 'utf-8');
  return JSON.parse(data);
}

function filterRepos(nodes, options) {
  let filtered = nodes.filter(n => !n.isArchived);
  
  // Filter by org
  if (options.org) {
    filtered = filtered.filter(n => n.org === options.org);
  }
  
  // Exclude patterns
  for (const exclude of options.exclude) {
    if (exclude.startsWith('org:')) {
      const orgName = exclude.replace('org:', '');
      filtered = filtered.filter(n => n.org !== orgName);
    } else if (exclude.startsWith('name:')) {
      const namePattern = exclude.replace('name:', '');
      filtered = filtered.filter(n => !n.name.includes(namePattern));
    }
  }
  
  // Include patterns (if specified, only include matching)
  if (options.include.length > 0) {
    filtered = filtered.filter(n => {
      return options.include.some(inc => {
        if (inc.startsWith('org:')) {
          return n.org === inc.replace('org:', '');
        } else if (inc.startsWith('name:')) {
          return n.name.includes(inc.replace('name:', ''));
        } else if (inc === 'hasPackageJson') {
          return n.hasPackageJson;
        }
        return false;
      });
    });
  }
  
  return filtered;
}

async function readSourceFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return Buffer.from(content).toString('base64');
  } catch (err) {
    throw new Error(`Cannot read source file ${filePath}: ${err.message}`);
  }
}

function getFileFromRepo(org, repo, filePath, branch) {
  const cmd = `gh api repos/${org}/${repo}/contents/${filePath}?ref=${branch} --jq '.sha,.content' 2>/dev/null`;
  const result = exec(cmd, { ignoreError: true, silent: true });
  if (!result) return null;
  
  const lines = result.split('\n');
  return {
    sha: lines[0],
    content: lines[1]
  };
}

function createOrUpdateFile(org, repo, filePath, content, message, sha = null, branch = 'main') {
  const shaParam = sha ? `--field sha=${sha}` : '';
  const cmd = `gh api repos/${org}/${repo}/contents/${filePath} --method PUT --field message="${message}" --field content="${content}" --field branch="${branch}" ${shaParam}`;
  
  try {
    exec(cmd, { silent: true });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function syncFile(repo, filePath, content, message, branch, dryRun) {
  if (dryRun) {
    return { status: 'would-sync', repo: repo.fullName };
  }
  
  // Check if file exists
  const existing = getFileFromRepo(repo.org, repo.name, filePath, branch);
  
  // Create or update
  const result = createOrUpdateFile(
    repo.org,
    repo.name,
    filePath,
    content,
    message,
    existing?.sha,
    branch
  );
  
  if (result.success) {
    return { 
      status: existing ? 'updated' : 'created', 
      repo: repo.fullName 
    };
  } else {
    return { 
      status: 'failed', 
      repo: repo.fullName, 
      error: result.error 
    };
  }
}

async function syncBatch(repos, filePath, content, message, branch, dryRun, concurrency) {
  const results = [];
  const batches = [];
  
  for (let i = 0; i < repos.length; i += concurrency) {
    batches.push(repos.slice(i, i + concurrency));
  }
  
  log(`\n🚀 Syncing ${repos.length} repos in ${batches.length} batches (${concurrency} concurrent)...`, 'cyan');
  
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    log(`  Batch ${i + 1}/${batches.length}: ${batch.length} repos...`, 'blue');
    
    const batchResults = await Promise.all(
      batch.map(repo => syncFile(repo, filePath, content, message, branch, dryRun))
    );
    
    results.push(...batchResults);
    
    // Rate limit: wait 1 second between batches
    if (i < batches.length - 1 && !dryRun) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

async function saveSyncLog(operation) {
  let log = [];
  try {
    const data = await fs.readFile(SYNC_LOG, 'utf-8');
    log = JSON.parse(data);
  } catch (err) {
    // File doesn't exist yet
  }
  
  log.push({
    timestamp: new Date().toISOString(),
    ...operation
  });
  
  await fs.writeFile(SYNC_LOG, JSON.stringify(log, null, 2));
}

async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);
  
  // Validate
  if (!options.sourceFile) {
    log('❌ --source-file is required', 'red');
    log('\nUsage: br-sync files --source-file=<path> --pattern=<target-path> [options]', 'yellow');
    log('\nExample:', 'cyan');
    log('  br-sync files --source-file=.github/workflows/ci.yml --pattern=.github/workflows/ci.yml', 'gray');
    log('\nOptions:', 'cyan');
    log('  --org=<org>              Only sync to specific org', 'gray');
    log('  --include=<filter>       Include only matching repos (org:name, name:pattern, hasPackageJson)', 'gray');
    log('  --exclude=<filter>       Exclude matching repos', 'gray');
    log('  --no-dry-run             Execute the sync (default is dry-run)', 'gray');
    log('  --branch=<branch>        Target branch (default: main)', 'gray');
    log('  --message=<message>      Commit message', 'gray');
    log('  --concurrency=<n>        Concurrent operations (default: 10)', 'gray');
    process.exit(1);
  }
  
  if (!options.pattern) {
    options.pattern = options.sourceFile; // Default to same path
  }
  
  log('📁 BlackRoad File Sync Engine', 'cyan');
  log('═'.repeat(60), 'cyan');
  
  // Load graph
  const graph = await loadGraph();
  
  // Filter repos
  const targetRepos = filterRepos(graph.nodes, options);
  
  // Read source file
  log(`\n📄 Reading source file: ${options.sourceFile}`, 'blue');
  const content = await readSourceFile(options.sourceFile);
  
  // Show plan
  log(`\n📊 Sync Plan:`, 'yellow');
  log(`  Source file: ${options.sourceFile}`, 'blue');
  log(`  Target path: ${options.pattern}`, 'blue');
  log(`  Target repos: ${targetRepos.length}`, 'blue');
  log(`  Branch: ${options.branch}`, 'blue');
  log(`  Concurrency: ${options.concurrency}`, 'blue');
  log(`  Dry run: ${options.dryRun ? 'YES' : 'NO'}`, options.dryRun ? 'yellow' : 'green');
  
  if (options.org) {
    log(`  Organization: ${options.org}`, 'blue');
  }
  if (options.include.length > 0) {
    log(`  Include: ${options.include.join(', ')}`, 'blue');
  }
  if (options.exclude.length > 0) {
    log(`  Exclude: ${options.exclude.join(', ')}`, 'blue');
  }
  
  if (targetRepos.length === 0) {
    log('\n⚠️  No repos match the filters', 'yellow');
    process.exit(0);
  }
  
  // Show sample repos
  log(`\n📦 Target repositories (showing first 10):`, 'cyan');
  targetRepos.slice(0, 10).forEach(repo => {
    log(`  • ${repo.fullName}`, 'blue');
  });
  if (targetRepos.length > 10) {
    log(`  ... and ${targetRepos.length - 10} more`, 'gray');
  }
  
  if (options.dryRun) {
    log(`\n🔍 DRY RUN - No changes will be made`, 'yellow');
    log(`\n💡 To execute, add: --no-dry-run`, 'cyan');
    process.exit(0);
  }
  
  // Confirm
  if (!options.force) {
    log(`\n⚠️  About to sync ${targetRepos.length} repositories`, 'yellow');
    log(`Press Ctrl+C to cancel, or wait 5 seconds to continue...`, 'yellow');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  // Execute sync
  const results = await syncBatch(
    targetRepos,
    options.pattern,
    content,
    options.commitMessage,
    options.branch,
    false,
    options.concurrency
  );
  
  // Summarize
  const created = results.filter(r => r.status === 'created').length;
  const updated = results.filter(r => r.status === 'updated').length;
  const failed = results.filter(r => r.status === 'failed').length;
  
  log(`\n✨ Sync Complete!`, 'cyan');
  log('═'.repeat(60), 'cyan');
  log(`  Created: ${created}`, 'green');
  log(`  Updated: ${updated}`, 'green');
  log(`  Failed: ${failed}`, failed > 0 ? 'red' : 'gray');
  log(`  Total: ${results.length}`, 'blue');
  
  if (failed > 0) {
    log(`\n❌ Failed repositories:`, 'red');
    results
      .filter(r => r.status === 'failed')
      .slice(0, 10)
      .forEach(r => {
        log(`  • ${r.repo}: ${r.error}`, 'red');
      });
  }
  
  // Save log
  await saveSyncLog({
    operation: 'file-sync',
    sourceFile: options.sourceFile,
    targetPath: options.pattern,
    targetRepos: targetRepos.length,
    results: { created, updated, failed }
  });
  
  log(`\n📝 Log saved to: ${SYNC_LOG}`, 'gray');
}

main().catch(err => {
  log(`\n❌ Error: ${err.message}`, 'red');
  process.exit(1);
});
