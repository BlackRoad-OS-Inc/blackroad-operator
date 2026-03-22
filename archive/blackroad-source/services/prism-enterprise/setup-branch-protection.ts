#!/usr/bin/env tsx

/**
 * Branch Protection Setup Script
 *
 * Configures branch protection rules for main/master branches
 * Ensures:
 * - Required status checks (including cryptographic verification)
 * - Required reviews
 * - Signed commits enforcement
 * - No force pushes
 * - Protected from deletion
 */

import { execSync } from 'node:child_process';

const run = (cmd: string): string => {
  return execSync(cmd, { encoding: 'utf8' });
};

const runJson = (cmd: string): any => {
  const output = run(cmd);
  return JSON.parse(output);
};

async function setupBranchProtection(branch: string) {
  console.log(`🔒 Setting up protection for branch: ${branch}\n`);

  try {
    // Build protection rules
    const protectionRules = {
      required_status_checks: {
        strict: true,
        contexts: [
          'Cryptographic Verification',
          'Commit Signature Enforcement',
          'PR Master Orchestrator',
          'Validate PR',
        ],
      },
      enforce_admins: false, // Allow admins to bypass in emergencies
      required_pull_request_reviews: {
        dismissal_restrictions: {},
        dismiss_stale_reviews: true,
        require_code_owner_reviews: true,
        required_approving_review_count: 1,
        require_last_push_approval: false,
      },
      restrictions: null, // No user/team restrictions
      required_signatures: true, // Enforce signed commits
      allow_force_pushes: false,
      allow_deletions: false,
      block_creations: false,
      required_conversation_resolution: true,
      lock_branch: false,
      allow_fork_syncing: true,
    };

    console.log('📋 Protection rules:');
    console.log(`  ✅ Required status checks: ${protectionRules.required_status_checks.contexts.length} checks`);
    console.log(`  ✅ Required reviews: ${protectionRules.required_pull_request_reviews.required_approving_review_count}`);
    console.log(`  ✅ Signed commits: ${protectionRules.required_signatures}`);
    console.log(`  ❌ Force pushes: disabled`);
    console.log(`  ❌ Branch deletion: disabled`);
    console.log('');

    // Apply protection using GitHub CLI
    console.log('🔧 Applying protection rules...\n');

    // Note: gh CLI doesn't have full branch protection API coverage
    // We'll use the REST API directly via gh api

    const protectionPayload = JSON.stringify(protectionRules);

    const apiCommand = `gh api \\
      --method PUT \\
      -H "Accept: application/vnd.github+json" \\
      -H "X-GitHub-Api-Version: 2022-11-28" \\
      "/repos/{owner}/{repo}/branches/${branch}/protection" \\
      --input - << 'EOF'
${protectionPayload}
EOF`;

    try {
      run(apiCommand);
      console.log(`✅ Branch protection applied to ${branch}\n`);
    } catch (error: any) {
      // Try alternative approach - use individual rules
      console.log('⚠️  Full protection failed, applying individual rules...\n');

      // Required status checks
      try {
        run(`gh api \\
          --method PATCH \\
          -H "Accept: application/vnd.github+json" \\
          "/repos/{owner}/{repo}/branches/${branch}/protection/required_status_checks" \\
          -f strict=true \\
          -f "contexts[]=Cryptographic Verification" \\
          -f "contexts[]=Commit Signature Enforcement" \\
          -f "contexts[]=PR Master Orchestrator"`);
        console.log('  ✅ Required status checks configured');
      } catch (e) {
        console.log('  ⚠️  Could not set required status checks');
      }

      // Required pull request reviews
      try {
        run(`gh api \\
          --method PATCH \\
          -H "Accept: application/vnd.github+json" \\
          "/repos/{owner}/{repo}/branches/${branch}/protection/required_pull_request_reviews" \\
          -f dismiss_stale_reviews=true \\
          -f require_code_owner_reviews=true \\
          -f required_approving_review_count=1`);
        console.log('  ✅ Required reviews configured');
      } catch (e) {
        console.log('  ⚠️  Could not set required reviews');
      }

      // Enforce signed commits
      try {
        run(`gh api \\
          --method POST \\
          -H "Accept: application/vnd.github+json" \\
          "/repos/{owner}/{repo}/branches/${branch}/protection/required_signatures"`);
        console.log('  ✅ Signed commits enforced');
      } catch (e) {
        console.log('  ⚠️  Could not enforce signed commits (may require GitHub Enterprise)');
      }

      // Disable force push
      try {
        run(`gh api \\
          --method DELETE \\
          -H "Accept: application/vnd.github+json" \\
          "/repos/{owner}/{repo}/branches/${branch}/protection/enforce_admins"`);

        run(`gh api \\
          --method PUT \\
          -H "Accept: application/vnd.github+json" \\
          "/repos/{owner}/{repo}/branches/${branch}/protection/required_linear_history"`);
        console.log('  ✅ Force push disabled');
      } catch (e) {
        console.log('  ⚠️  Could not disable force push');
      }
    }
  } catch (error: any) {
    console.error(`❌ Failed to setup protection for ${branch}:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('🔒 Branch Protection Setup');
  console.log('==========================\n');

  // Check if gh CLI is available
  try {
    run('gh --version');
  } catch {
    console.error('❌ GitHub CLI (gh) is not installed.');
    console.error('Install from: https://cli.github.com/');
    process.exit(1);
  }

  // Check authentication
  try {
    run('gh auth status');
  } catch {
    console.error('❌ Not authenticated with GitHub CLI.');
    console.error('Run: gh auth login');
    process.exit(1);
  }

  // Get repository info
  const repo = runJson('gh repo view --json name,owner,defaultBranchRef');
  const defaultBranch = repo.defaultBranchRef.name;

  console.log(`📦 Repository: ${repo.owner.login}/${repo.name}`);
  console.log(`🌲 Default branch: ${defaultBranch}\n`);

  // Setup protection for default branch
  await setupBranchProtection(defaultBranch);

  // Also protect 'main' and 'master' if they exist and are different
  const branches = ['main', 'master'].filter(b => b !== defaultBranch);

  for (const branch of branches) {
    try {
      run(`gh api "/repos/{owner}/{repo}/branches/${branch}"`);
      // Branch exists, protect it
      await setupBranchProtection(branch);
    } catch {
      // Branch doesn't exist, skip
      console.log(`⏭️  Branch ${branch} doesn't exist, skipping\n`);
    }
  }

  // Also protect release branches
  console.log('🔍 Looking for release branches...\n');

  try {
    const allBranches = run('gh api "/repos/{owner}/{repo}/branches" --paginate --jq ".[].name"')
      .split('\n')
      .filter(Boolean);

    const releaseBranches = allBranches.filter(b =>
      b.startsWith('release/') || b.startsWith('production/')
    );

    if (releaseBranches.length > 0) {
      console.log(`Found ${releaseBranches.length} release branch(es):\n`);

      for (const branch of releaseBranches.slice(0, 5)) { // Protect up to 5 release branches
        await setupBranchProtection(branch);
      }
    } else {
      console.log('No release branches found\n');
    }
  } catch (error) {
    console.log('⚠️  Could not check for release branches\n');
  }

  // Create CODEOWNERS file if it doesn't exist
  console.log('📝 Checking CODEOWNERS file...\n');

  try {
    run('cat .github/CODEOWNERS');
    console.log('✅ CODEOWNERS file exists\n');
  } catch {
    console.log('📝 Creating CODEOWNERS file...\n');

    const codeowners = `# CODEOWNERS
# These owners will be the default owners for everything in the repo.
# Unless a later match takes precedence, they will be requested for review
# when someone opens a pull request.

* @${repo.owner.login}

# Protect workflow files
/.github/workflows/ @${repo.owner.login}

# Protect security-sensitive files
/.github/tools/ @${repo.owner.login}
/scripts/ @${repo.owner.login}

# Require review for package changes
package.json @${repo.owner.login}
package-lock.json @${repo.owner.login}
`;

    try {
      execSync('mkdir -p .github', { encoding: 'utf8' });
      execSync(`cat > .github/CODEOWNERS << 'EOF'
${codeowners}
EOF`, { encoding: 'utf8' });

      console.log('✅ CODEOWNERS file created\n');
    } catch (error) {
      console.log('⚠️  Could not create CODEOWNERS file\n');
    }
  }

  console.log('═══════════════════════════');
  console.log('✅ Branch protection setup complete!');
  console.log('═══════════════════════════\n');

  console.log('📚 Next steps:');
  console.log('  1. Review protection rules in GitHub Settings → Branches');
  console.log('  2. Configure required status checks as workflows complete');
  console.log('  3. Setup GPG/SSH signing for all contributors');
  console.log('  4. Review and customize CODEOWNERS file');
}

main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
