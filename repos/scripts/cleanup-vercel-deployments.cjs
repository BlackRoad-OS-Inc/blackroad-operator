#!/usr/bin/env node

/**
 * Vercel Deployment Cleanup Script
 * Removes old/failed deployments from Vercel projects
 *
 * Prerequisites:
 * - Vercel CLI installed: npm i -g vercel
 * - Authenticated: vercel login
 *
 * Usage:
 *   node cleanup-vercel-deployments.cjs [options]
 *
 * Options:
 *   --project <name>    Target specific project (default: all projects)
 *   --failed            Remove only failed deployments
 *   --older-than <days> Remove deployments older than N days (default: 30)
 *   --dry-run           Show what would be deleted without deleting
 *   --team <id>         Specify team ID
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const args = process.argv.slice(2);

// Parse arguments
const options = {
  project: null,
  failedOnly: args.includes('--failed'),
  olderThanDays: parseInt(args[args.indexOf('--older-than') + 1] || '30'),
  dryRun: args.includes('--dry-run'),
  team: args[args.indexOf('--team') + 1] || null
};

if (args.includes('--project')) {
  options.project = args[args.indexOf('--project') + 1];
}

console.log('🧹 Vercel Deployment Cleanup Tool\n');
console.log('Options:', options, '\n');

async function runCommand(cmd) {
  try {
    const { stdout, stderr } = await execAsync(cmd);
    if (stderr && !stderr.includes('Retrieving')) {
      console.error('Warning:', stderr);
    }
    return stdout.trim();
  } catch (error) {
    throw new Error(`Command failed: ${cmd}\n${error.message}`);
  }
}

async function getProjects() {
  console.log('📋 Fetching projects...');
  const teamFlag = options.team ? `--team ${options.team}` : '';
  const output = await runCommand(`vercel project ls ${teamFlag} --json`);

  try {
    const projects = JSON.parse(output);
    return Array.isArray(projects) ? projects : projects.projects || [];
  } catch (e) {
    // Fallback: parse line-by-line output
    return output.split('\n').filter(line => line.trim()).map(name => ({ name }));
  }
}

async function getDeployments(projectName) {
  console.log(`  📦 Fetching deployments for: ${projectName}`);
  const teamFlag = options.team ? `--team ${options.team}` : '';

  try {
    const output = await runCommand(`vercel ls ${projectName} ${teamFlag} --json 2>/dev/null || echo "[]"`);
    const data = JSON.parse(output);
    return Array.isArray(data) ? data : data.deployments || [];
  } catch (e) {
    console.warn(`  ⚠️  Could not fetch deployments for ${projectName}`);
    return [];
  }
}

async function deleteDeployment(deploymentUrl, projectName) {
  const teamFlag = options.team ? `--team ${options.team}` : '';

  if (options.dryRun) {
    console.log(`  🔍 [DRY RUN] Would delete: ${deploymentUrl}`);
    return { success: true, dryRun: true };
  }

  try {
    await runCommand(`vercel rm ${deploymentUrl} ${teamFlag} --yes`);
    console.log(`  ✅ Deleted: ${deploymentUrl}`);
    return { success: true };
  } catch (error) {
    console.error(`  ❌ Failed to delete ${deploymentUrl}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function cleanupProject(project) {
  const projectName = typeof project === 'string' ? project : project.name;
  console.log(`\n🔍 Processing project: ${projectName}`);

  const deployments = await getDeployments(projectName);

  if (!deployments || deployments.length === 0) {
    console.log('  ℹ️  No deployments found');
    return { deleted: 0, failed: 0, skipped: 0 };
  }

  console.log(`  Found ${deployments.length} deployments`);

  const now = Date.now();
  const cutoffTime = now - (options.olderThanDays * 24 * 60 * 60 * 1000);

  let deleted = 0, failed = 0, skipped = 0;

  for (const deployment of deployments) {
    const deploymentTime = deployment.created || deployment.createdAt || 0;
    const state = deployment.state || deployment.readyState || 'UNKNOWN';
    const url = deployment.url || deployment.uid;

    // Skip if only cleaning failed and this one isn't failed
    if (options.failedOnly && !['ERROR', 'CANCELED', 'FAILED'].includes(state)) {
      skipped++;
      continue;
    }

    // Skip if not old enough
    if (deploymentTime > cutoffTime) {
      skipped++;
      continue;
    }

    // Skip production deployments unless they're failed
    if (deployment.target === 'production' && state !== 'ERROR' && state !== 'FAILED') {
      console.log(`  ⏭️  Skipping production deployment: ${url}`);
      skipped++;
      continue;
    }

    const age = Math.floor((now - deploymentTime) / (24 * 60 * 60 * 1000));
    console.log(`  🗑️  ${state} deployment (${age}d old): ${url}`);

    const result = await deleteDeployment(url, projectName);

    if (result.success) {
      deleted++;
    } else {
      failed++;
    }

    // Rate limiting: wait a bit between deletions
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return { deleted, failed, skipped };
}

async function main() {
  try {
    // Check if vercel CLI is installed
    try {
      await runCommand('vercel --version');
    } catch (e) {
      console.error('❌ Vercel CLI not found. Install it with: npm i -g vercel');
      process.exit(1);
    }

    // Get projects to clean
    const projects = options.project
      ? [{ name: options.project }]
      : await getProjects();

    if (!projects || projects.length === 0) {
      console.log('❌ No projects found');
      process.exit(1);
    }

    console.log(`Found ${projects.length} project(s)\n`);

    let totalDeleted = 0, totalFailed = 0, totalSkipped = 0;

    // Process each project
    for (const project of projects) {
      const result = await cleanupProject(project);
      totalDeleted += result.deleted;
      totalFailed += result.failed;
      totalSkipped += result.skipped;
    }

    // Summary
    console.log('\n' + '═'.repeat(60));
    console.log('📊 CLEANUP SUMMARY');
    console.log('═'.repeat(60));
    console.log(`Projects processed: ${projects.length}`);
    console.log(`Deployments deleted: ${totalDeleted} ✅`);
    console.log(`Deletion failures:   ${totalFailed} ❌`);
    console.log(`Deployments skipped: ${totalSkipped} ⏭️`);

    if (options.dryRun) {
      console.log('\n⚠️  DRY RUN MODE - No deployments were actually deleted');
      console.log('Run without --dry-run to perform actual deletion');
    }

    console.log('═'.repeat(60));

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Help text
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Vercel Deployment Cleanup Script

Usage:
  node cleanup-vercel-deployments.cjs [options]

Options:
  --project <name>      Target specific project (default: all projects)
  --failed              Remove only failed deployments
  --older-than <days>   Remove deployments older than N days (default: 30)
  --dry-run             Show what would be deleted without deleting
  --team <id>           Specify team ID
  --help, -h            Show this help message

Examples:
  # Dry run to see what would be deleted
  node cleanup-vercel-deployments.cjs --dry-run

  # Delete only failed deployments
  node cleanup-vercel-deployments.cjs --failed

  # Delete deployments older than 7 days
  node cleanup-vercel-deployments.cjs --older-than 7

  # Clean specific project
  node cleanup-vercel-deployments.cjs --project portals

  # Clean failed deployments older than 14 days (dry run)
  node cleanup-vercel-deployments.cjs --failed --older-than 14 --dry-run
  `);
  process.exit(0);
}

main();
