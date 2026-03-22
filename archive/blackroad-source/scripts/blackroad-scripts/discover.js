#!/usr/bin/env node
// BlackRoad Repository Discovery & Dependency Graph Generator
// Scans all GitHub orgs and builds dependency map

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

const SYNC_HOME = path.join(process.env.HOME, '.blackroad-sync');
const DEPENDENCY_GRAPH = path.join(SYNC_HOME, 'dependency-graph.json');
const REPO_CACHE = path.join(SYNC_HOME, 'repo-cache.json');

// GitHub orgs to scan
const ORGS = [
  'BlackRoad-OS',
  'BlackRoad-AI',
  'BlackRoad-Cloud',
  'BlackRoad-Foundation',
  'BlackRoad-Archive',
  'BlackRoad-Education',
  'BlackRoad-Gov',
  'BlackRoad-Hardware',
  'BlackRoad-Interactive',
  'BlackRoad-Labs',
  'BlackRoad-Media',
  'BlackRoad-Security',
  'BlackRoad-Studio',
  'BlackRoad-Ventures',
  'Blackbox-Enterprises'
];

// Colors
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
    return execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch (err) {
    return null;
  }
}

async function listRepos(org) {
  log(`  Fetching repos from ${org}...`, 'blue');
  const result = exec(`gh repo list ${org} --json name,url,isArchived,languages --limit 1000`);
  if (!result) return [];
  return JSON.parse(result);
}

async function getPackageJson(org, repo) {
  try {
    const result = exec(`gh api repos/${org}/${repo}/contents/package.json --jq '.content' 2>/dev/null`);
    if (!result) return null;
    const decoded = Buffer.from(result, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch (err) {
    return null;
  }
}

async function discoverRepos() {
  log('🔍 Discovering repositories across all orgs...', 'cyan');
  
  const allRepos = [];
  const repoMap = new Map();
  
  for (const org of ORGS) {
    const repos = await listRepos(org);
    log(`  Found ${repos.length} repos in ${org}`, 'green');
    
    for (const repo of repos) {
      const fullName = `${org}/${repo.name}`;
      repoMap.set(fullName, {
        org,
        name: repo.name,
        fullName,
        url: repo.url,
        isArchived: repo.isArchived,
        languages: repo.languages,
        dependencies: null,
        hasPackageJson: false
      });
      allRepos.push(fullName);
    }
  }
  
  log(`\n✅ Total repos discovered: ${allRepos.length}`, 'green');
  return { allRepos, repoMap };
}

async function analyzeDependencies(repoMap) {
  log('\n📦 Analyzing package.json dependencies...', 'cyan');
  
  let analyzed = 0;
  let withPackageJson = 0;
  const dependencies = new Map();
  
  for (const [fullName, repo] of repoMap.entries()) {
    if (repo.isArchived) continue;
    
    analyzed++;
    if (analyzed % 10 === 0) {
      process.stdout.write(`\r  Progress: ${analyzed}/${repoMap.size}`);
    }
    
    const pkg = await getPackageJson(repo.org, repo.name);
    if (pkg) {
      withPackageJson++;
      repo.hasPackageJson = true;
      repo.dependencies = {
        dependencies: pkg.dependencies || {},
        devDependencies: pkg.devDependencies || {},
        version: pkg.version || '0.0.0',
        name: pkg.name
      };
      
      // Track which BlackRoad packages this repo depends on
      const blackroadDeps = [];
      for (const dep of Object.keys({...pkg.dependencies, ...pkg.devDependencies})) {
        if (dep.includes('blackroad') || dep.includes('road')) {
          blackroadDeps.push(dep);
        }
      }
      repo.blackroadDependencies = blackroadDeps;
    }
  }
  
  console.log('\n');
  log(`✅ Analyzed: ${analyzed} repos`, 'green');
  log(`📦 With package.json: ${withPackageJson}`, 'green');
  
  return { analyzed, withPackageJson };
}

async function buildDependencyGraph(repoMap) {
  log('\n🕸️  Building dependency graph...', 'cyan');
  
  const graph = {
    nodes: [],
    edges: [],
    metadata: {
      totalRepos: repoMap.size,
      withPackageJson: 0,
      archived: 0,
      generatedAt: new Date().toISOString()
    }
  };
  
  const nodeIndex = new Map();
  let nodeId = 0;
  
  // Create nodes
  for (const [fullName, repo] of repoMap.entries()) {
    const node = {
      id: nodeId++,
      fullName,
      org: repo.org,
      name: repo.name,
      url: repo.url,
      isArchived: repo.isArchived,
      hasPackageJson: repo.hasPackageJson,
      languages: repo.languages,
      version: repo.dependencies?.version || null,
      packageName: repo.dependencies?.name || null
    };
    
    graph.nodes.push(node);
    nodeIndex.set(fullName, node.id);
    
    if (repo.hasPackageJson) graph.metadata.withPackageJson++;
    if (repo.isArchived) graph.metadata.archived++;
  }
  
  // Create edges based on dependencies
  for (const [fullName, repo] of repoMap.entries()) {
    if (!repo.blackroadDependencies || repo.blackroadDependencies.length === 0) continue;
    
    const sourceId = nodeIndex.get(fullName);
    
    for (const dep of repo.blackroadDependencies) {
      // Try to find matching repo by package name
      for (const [targetName, targetRepo] of repoMap.entries()) {
        if (targetRepo.dependencies?.name === dep) {
          const targetId = nodeIndex.get(targetName);
          graph.edges.push({
            source: sourceId,
            target: targetId,
            dependency: dep
          });
        }
      }
    }
  }
  
  log(`  Nodes: ${graph.nodes.length}`, 'green');
  log(`  Edges: ${graph.edges.length}`, 'green');
  log(`  With package.json: ${graph.metadata.withPackageJson}`, 'green');
  
  return graph;
}

async function main() {
  try {
    log('🚀 BlackRoad Repository Discovery', 'cyan');
    log('━'.repeat(50), 'cyan');
    
    // Ensure directory exists
    await fs.mkdir(SYNC_HOME, { recursive: true });
    
    // Discover repos
    const { allRepos, repoMap } = await discoverRepos();
    
    // Analyze dependencies
    await analyzeDependencies(repoMap);
    
    // Build graph
    const graph = await buildDependencyGraph(repoMap);
    
    // Save results
    log('\n💾 Saving results...', 'cyan');
    await fs.writeFile(DEPENDENCY_GRAPH, JSON.stringify(graph, null, 2));
    await fs.writeFile(REPO_CACHE, JSON.stringify(Array.from(repoMap.entries()), null, 2));
    
    log(`  Dependency graph: ${DEPENDENCY_GRAPH}`, 'green');
    log(`  Repo cache: ${REPO_CACHE}`, 'green');
    
    // Summary
    log('\n✨ Discovery Complete!', 'cyan');
    log('━'.repeat(50), 'cyan');
    log(`Total repositories: ${graph.metadata.totalRepos}`, 'yellow');
    log(`With package.json: ${graph.metadata.withPackageJson}`, 'yellow');
    log(`Archived: ${graph.metadata.archived}`, 'yellow');
    log(`Dependencies tracked: ${graph.edges.length}`, 'yellow');
    
    log('\n💡 Next steps:', 'cyan');
    log('  • View map: br-sync map', 'blue');
    log('  • Sync files: br-sync files --pattern=".github/*"', 'blue');
    log('  • Sync versions: br-sync version --bump=patch', 'blue');
    
  } catch (err) {
    log(`\n❌ Error: ${err.message}`, 'red');
    process.exit(1);
  }
}

main();
