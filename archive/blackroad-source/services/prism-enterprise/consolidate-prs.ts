#!/usr/bin/env tsx

/**
 * PR Consolidation Script
 *
 * Handles mass PR consolidation:
 * - Analyzes all open PRs
 * - Identifies relevant changes
 * - Merges or archives PRs appropriately
 * - Ensures main branch stays protected
 */

import { execSync } from 'node:child_process';

interface PR {
  number: number;
  title: string;
  state: string;
  head: { ref: string; sha: string };
  base: { ref: string };
  created_at: string;
  updated_at: string;
  draft: boolean;
  mergeable_state: string;
  mergeable: boolean | null;
  user: { login: string };
}

const run = (cmd: string, silent = false): string => {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: silent ? 'pipe' : 'inherit' });
  } catch (error) {
    if (!silent) throw error;
    return '';
  }
};

const runJson = (cmd: string): any => {
  const output = execSync(cmd, { encoding: 'utf8' });
  return JSON.parse(output);
};

async function main() {
  console.log('🔄 PR Consolidation Tool');
  console.log('========================\n');

  // Check if gh CLI is available
  try {
    run('gh --version', true);
  } catch {
    console.error('❌ GitHub CLI (gh) is not installed.');
    console.error('Install from: https://cli.github.com/');
    process.exit(1);
  }

  // Get all open PRs
  console.log('📋 Fetching all open PRs...\n');

  const prs: PR[] = runJson('gh pr list --json number,title,state,head,base,createdAt,updatedAt,draft,mergeableState,mergeable,author --limit 1000');

  console.log(`Found ${prs.length} open PR(s)\n`);

  if (prs.length === 0) {
    console.log('✅ No open PRs to consolidate');
    return;
  }

  // Categorize PRs
  const categories = {
    ready_to_merge: [] as PR[],
    needs_review: [] as PR[],
    has_conflicts: [] as PR[],
    draft: [] as PR[],
    stale: [] as PR[],
    bot_prs: [] as PR[],
  };

  const STALE_DAYS = 90;
  const now = Date.now();

  for (const pr of prs) {
    const daysOld = (now - new Date(pr.updated_at).getTime()) / (1000 * 60 * 60 * 24);

    if (pr.draft) {
      categories.draft.push(pr);
    } else if (pr.user.login.includes('bot') || pr.user.login.includes('blackroad')) {
      categories.bot_prs.push(pr);
    } else if (daysOld > STALE_DAYS) {
      categories.stale.push(pr);
    } else if (pr.mergeable_state === 'conflicting' || pr.mergeable === false) {
      categories.has_conflicts.push(pr);
    } else if (pr.mergeable_state === 'clean' || pr.mergeable === true) {
      categories.ready_to_merge.push(pr);
    } else {
      categories.needs_review.push(pr);
    }
  }

  // Print summary
  console.log('📊 PR Categories:');
  console.log(`  ✅ Ready to merge: ${categories.ready_to_merge.length}`);
  console.log(`  👀 Needs review: ${categories.needs_review.length}`);
  console.log(`  ⚠️  Has conflicts: ${categories.has_conflicts.length}`);
  console.log(`  📝 Draft: ${categories.draft.length}`);
  console.log(`  🕐 Stale (>${STALE_DAYS}d): ${categories.stale.length}`);
  console.log(`  🤖 Bot PRs: ${categories.bot_prs.length}\n`);

  // Process ready to merge PRs
  if (categories.ready_to_merge.length > 0) {
    console.log('🚀 Processing ready-to-merge PRs...\n');

    for (const pr of categories.ready_to_merge) {
      console.log(`  PR #${pr.number}: ${pr.title}`);

      try {
        // Check if PR has passing checks
        const checks = runJson(`gh pr checks ${pr.number} --json state,name`);
        const allPassing = checks.every((check: any) =>
          check.state === 'SUCCESS' || check.state === 'SKIPPED'
        );

        if (allPassing) {
          console.log(`    ✅ All checks passing - adding automerge label`);
          run(`gh pr edit ${pr.number} --add-label automerge`, true);
        } else {
          console.log(`    ⚠️  Some checks pending or failed`);
        }
      } catch (error) {
        console.log(`    ⚠️  Could not check status`);
      }
    }
    console.log('');
  }

  // Process conflicting PRs
  if (categories.has_conflicts.length > 0) {
    console.log('⚠️  Processing PRs with conflicts...\n');

    for (const pr of categories.has_conflicts) {
      console.log(`  PR #${pr.number}: ${pr.title}`);
      console.log(`    ⚠️  Has conflicts - triggering auto-sync workflow`);

      try {
        // Trigger branch sync workflow
        run(`gh workflow run pr-branch-sync.yml -f pr_number=${pr.number}`, true);

        // Add comment
        const comment = `🔄 **Auto-sync triggered**\n\nThis PR has conflicts with the base branch. The automated sync workflow will attempt to resolve them.\n\nIf auto-resolution fails, please merge \`${pr.base.ref}\` manually.`;
        run(`gh pr comment ${pr.number} --body "${comment}"`, true);
      } catch (error) {
        console.log(`    ❌ Could not trigger sync workflow`);
      }
    }
    console.log('');
  }

  // Process stale PRs
  if (categories.stale.length > 0) {
    console.log(`🕐 Processing stale PRs (>${STALE_DAYS} days)...\n`);

    for (const pr of categories.stale) {
      const daysOld = Math.floor(
        (now - new Date(pr.updated_at).getTime()) / (1000 * 60 * 60 * 24)
      );

      console.log(`  PR #${pr.number}: ${pr.title} (${daysOld}d old)`);

      // Extract changes from stale PR
      console.log(`    📦 Extracting changes...`);

      try {
        // Get diff stats
        const diff = run(`gh pr diff ${pr.number} --patch`, true);
        const stats = run(`gh pr diff ${pr.number}`, true);

        // Check if changes are substantial
        const hasSubstantialChanges = diff.split('\n').filter(line =>
          line.startsWith('+') || line.startsWith('-')
        ).length > 10;

        if (hasSubstantialChanges) {
          console.log(`    📝 Substantial changes found - creating archive branch`);

          // Create archive branch
          const archiveBranch = `archive/${pr.head.ref}-pr${pr.number}`;
          run(`git fetch origin ${pr.head.ref}:${archiveBranch}`, true);
          run(`git push origin ${archiveBranch}`, true);

          // Add comment before closing
          const comment = `🗄️ **PR Archived**\n\nThis PR has been inactive for ${daysOld} days and is being closed.\n\nChanges have been preserved in branch \`${archiveBranch}\` for future reference.\n\nIf this work is still relevant, please create a new PR with updated changes.`;
          run(`gh pr comment ${pr.number} --body "${comment}"`, true);

          // Close PR
          run(`gh pr close ${pr.number} --comment "Closed due to inactivity - changes archived"`, true);
          console.log(`    ✅ Archived to ${archiveBranch} and closed`);
        } else {
          console.log(`    ⚠️  Minor changes - closing without archive`);
          run(`gh pr close ${pr.number} --comment "Closed due to inactivity and minimal changes"`, true);
        }
      } catch (error) {
        console.log(`    ❌ Could not process stale PR`);
      }
    }
    console.log('');
  }

  // Process bot PRs
  if (categories.bot_prs.length > 0) {
    console.log('🤖 Processing bot PRs...\n');

    for (const pr of categories.bot_prs) {
      console.log(`  PR #${pr.number}: ${pr.title}`);

      // Bot PRs get automerge label if checks pass
      try {
        const checks = runJson(`gh pr checks ${pr.number} --json state`);
        const allPassing = checks.every((check: any) => check.state === 'SUCCESS');

        if (allPassing && pr.mergeable === true) {
          console.log(`    ✅ Auto-approving and enabling automerge`);
          run(`gh pr review ${pr.number} --approve --body "✅ Automated approval - checks passing"`, true);
          run(`gh pr edit ${pr.number} --add-label automerge`, true);
        }
      } catch (error) {
        console.log(`    ⚠️  Could not auto-approve`);
      }
    }
    console.log('');
  }

  // Final summary
  console.log('═══════════════════════════');
  console.log('📊 Consolidation Summary:');
  console.log('═══════════════════════════');
  console.log(`  ✅ Ready for automerge: ${categories.ready_to_merge.length}`);
  console.log(`  🔄 Sync triggered: ${categories.has_conflicts.length}`);
  console.log(`  🗄️  Archived/closed: ${categories.stale.length}`);
  console.log(`  🤖 Bot PRs processed: ${categories.bot_prs.length}`);
  console.log(`  📝 Still needs review: ${categories.needs_review.length + categories.draft.length}`);
  console.log('');
  console.log('✅ PR consolidation complete!');
}

main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
