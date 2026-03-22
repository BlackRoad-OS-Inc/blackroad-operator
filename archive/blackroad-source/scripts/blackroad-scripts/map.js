#!/usr/bin/env node
// Display dependency map visualization

const fs = require('fs').promises;
const path = require('path');

const SYNC_HOME = path.join(process.env.HOME, '.blackroad-sync');
const DEPENDENCY_GRAPH = path.join(SYNC_HOME, 'dependency-graph.json');

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

async function main() {
  try {
    // Load graph
    const graphData = await fs.readFile(DEPENDENCY_GRAPH, 'utf-8');
    const graph = JSON.parse(graphData);
    
    log('🗺️  BlackRoad Dependency Map', 'cyan');
    log('═'.repeat(60), 'cyan');
    
    // Metadata
    log(`\n📊 Overview:`, 'yellow');
    log(`  Total repositories: ${graph.metadata.totalRepos}`, 'blue');
    log(`  With package.json: ${graph.metadata.withPackageJson}`, 'blue');
    log(`  Archived: ${graph.metadata.archived}`, 'blue');
    log(`  Dependencies: ${graph.edges.length}`, 'blue');
    log(`  Generated: ${new Date(graph.metadata.generatedAt).toLocaleString()}`, 'gray');
    
    // Breakdown by org
    log(`\n🏢 By Organization:`, 'yellow');
    const byOrg = {};
    graph.nodes.forEach(node => {
      byOrg[node.org] = (byOrg[node.org] || 0) + 1;
    });
    Object.entries(byOrg)
      .sort((a, b) => b[1] - a[1])
      .forEach(([org, count]) => {
        log(`  ${org}: ${count} repos`, 'blue');
      });
    
    // Top languages
    log(`\n💻 Top Languages:`, 'yellow');
    const langCount = {};
    graph.nodes.forEach(node => {
      if (node.languages) {
        node.languages.forEach(lang => {
          langCount[lang.name] = (langCount[lang.name] || 0) + 1;
        });
      }
    });
    Object.entries(langCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([lang, count]) => {
        log(`  ${lang}: ${count} repos`, 'blue');
      });
    
    // Most connected nodes (most dependencies)
    log(`\n🔗 Most Connected Repos:`, 'yellow');
    const inDegree = new Map();
    const outDegree = new Map();
    
    graph.edges.forEach(edge => {
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
      outDegree.set(edge.source, (outDegree.get(edge.source) || 0) + 1);
    });
    
    // Most depended upon
    log(`  Most depended upon (incoming):`, 'cyan');
    const topIncoming = Array.from(inDegree.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    if (topIncoming.length > 0) {
      topIncoming.forEach(([nodeId, count]) => {
        const node = graph.nodes.find(n => n.id === nodeId);
        log(`    ${node.fullName}: ${count} dependent repos`, 'green');
      });
    } else {
      log(`    (No internal dependencies found)`, 'gray');
    }
    
    // Most dependencies
    log(`  Most dependencies (outgoing):`, 'cyan');
    const topOutgoing = Array.from(outDegree.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    if (topOutgoing.length > 0) {
      topOutgoing.forEach(([nodeId, count]) => {
        const node = graph.nodes.find(n => n.id === nodeId);
        log(`    ${node.fullName}: depends on ${count} repos`, 'green');
      });
    } else {
      log(`    (No dependencies found)`, 'gray');
    }
    
    // Repos with package.json
    log(`\n📦 Node.js Projects:`, 'yellow');
    const withPkg = graph.nodes.filter(n => n.hasPackageJson && !n.isArchived);
    log(`  Active Node.js repos: ${withPkg.length}`, 'blue');
    
    if (withPkg.length > 0 && withPkg.length <= 20) {
      withPkg.forEach(node => {
        const version = node.version || 'no version';
        log(`    ${node.fullName} (${version})`, 'green');
      });
    }
    
    log(`\n💡 Use "br-sync files --help" to sync across these repos`, 'cyan');
    
  } catch (err) {
    if (err.code === 'ENOENT') {
      log('❌ No dependency graph found', 'red');
      log('   Run: br-sync discover', 'yellow');
    } else {
      log(`❌ Error: ${err.message}`, 'red');
    }
    process.exit(1);
  }
}

main();
