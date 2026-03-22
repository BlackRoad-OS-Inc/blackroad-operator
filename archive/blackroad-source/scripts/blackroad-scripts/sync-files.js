#!/usr/bin/env node
// Sync files across repositories

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

const SYNC_HOME = path.join(process.env.HOME, '.blackroad-sync');
const DEPENDENCY_GRAPH = path.join(SYNC_HOME, 'dependency-graph.json');

const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m'
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function exec(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf-8' });
  } catch (err) {
    return null;
  }
}

function parseArgs(args) {
  const options = {
    pattern: null,
    source: null,
    exclude: [],
    dryRun: false,
    force: false
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--pattern' && args[i + 1]) {
      options.pattern = args[++i];
    } else if (arg === '--source' && args[i + 1]) {
      options.source = args[++i];
    } else if (arg === '--exclude' && args[i + 1]) {
      options.exclude = args[++i].split(',');
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--force') {
      options.force = true;
    }
  }
  
  return options;
}

async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);
  
  if (!options.pattern) {
    log('❌ --pattern is required', 'red');
    log('Usage: br-sync files --pattern=".github/workflows/*" [--source=repo] [--dry-run]', 'yellow');
    process.exit(1);
  }
  
  log('📁 BlackRoad File Sync', 'cyan');
  log('═'.repeat(60), 'cyan');
  
  // Load graph
  const graphData = await fs.readFile(DEPENDENCY_GRAPH, 'utf-8');
  const graph = JSON.parse(graphData);
  
  // Filter repos
  const activeRepos = graph.nodes.filter(n => 
    !n.isArchived && 
    !options.exclude.some(ex => n.org.includes(ex))
  );
  
  log(`\n📊 Sync Plan:`, 'yellow');
  log(`  Pattern: ${options.pattern}`, 'blue');
  log(`  Target repos: ${activeRepos.length}`, 'blue');
  log(`  Dry run: ${options.dryRun ? 'YES' : 'NO'}`, options.dryRun ? 'yellow' : 'green');
  
  if (options.source) {
    log(`  Source repo: ${options.source}`, 'blue');
  } else {
    log(`  Source: Current directory`, 'blue');
  }
  
  if (options.dryRun) {
    log(`\n🔍 DRY RUN - No changes will be made`, 'yellow');
    log(`\nWould sync to:`, 'cyan');
    activeRepos.slice(0, 10).forEach(repo => {
      log(`  • ${repo.fullName}`, 'blue');
    });
    if (activeRepos.length > 10) {
      log(`  ... and ${activeRepos.length - 10} more`, 'gray');
    }
    log(`\n💡 Remove --dry-run to execute`, 'cyan');
  } else {
    log(`\n🚀 Starting sync...`, 'green');
    log(`This feature is coming in Phase 2!`, 'yellow');
    log(`\nFor now, use these commands:`, 'cyan');
    log(`  # Copy a file to all repos`, 'blue');
    log(`  for repo in $(gh repo list BlackRoad-OS --json name -q '.[].name'); do`, 'gray');
    log(`    gh api repos/BlackRoad-OS/$repo/contents/.github/workflows/ci.yml --method PUT --field content="$(base64 ci.yml)"`, 'gray');
    log(`  done`, 'gray');
  }
}

main().catch(err => {
  log(`❌ Error: ${err.message}`, 'red');
  process.exit(1);
});
