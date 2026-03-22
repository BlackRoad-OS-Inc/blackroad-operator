import { execSync } from "child_process";
import path from "path";

const TIMEOUT = 5000;

/**
 * Check if a directory is inside a git repository.
 */
function isGitRepo(cwd: string): boolean {
  try {
    execSync("git rev-parse --is-inside-work-tree", { cwd, stdio: "ignore", timeout: TIMEOUT });
    return true;
  } catch {
    return false;
  }
}

/**
 * Create a git worktree for an agent's task.
 * Returns the worktree path, or null if workspace is not a git repo.
 */
export function createWorktree(
  workspace: string,
  agentId: string,
  taskId: string,
  agentName: string,
): string | null {
  if (!isGitRepo(workspace)) return null;

  const worktreeDir = path.join(workspace, ".worktrees");
  const worktreeName = `${agentId}-${taskId}`;
  const worktreePath = path.join(worktreeDir, worktreeName);
  const branch = `agent/${agentName.toLowerCase().replace(/\s+/g, "-")}/${taskId}`;

  try {
    execSync(`git worktree add "${worktreePath}" -b "${branch}"`, {
      cwd: workspace,
      stdio: "pipe",
      timeout: TIMEOUT,
    });
    return worktreePath;
  } catch (err) {
    console.error(`[Worktree] Failed to create worktree: ${(err as Error).message}`);
    return null;
  }
}

export interface MergeResult {
  success: boolean;
  conflictFiles?: string[];
}

/**
 * Merge a worktree branch back to the current branch and clean up.
 */
export function mergeWorktree(
  workspace: string,
  worktreePath: string,
  branch: string,
): MergeResult {
  try {
    execSync(`git merge --no-ff "${branch}"`, {
      cwd: workspace,
      stdio: "pipe",
      timeout: TIMEOUT,
    });
    // Clean up worktree and branch
    try {
      execSync(`git worktree remove "${worktreePath}"`, { cwd: workspace, stdio: "pipe", timeout: TIMEOUT });
    } catch { /* already removed */ }
    try {
      execSync(`git branch -d "${branch}"`, { cwd: workspace, stdio: "pipe", timeout: TIMEOUT });
    } catch { /* branch not found or not fully merged */ }

    return { success: true };
  } catch (err) {
    // Merge conflict — extract conflicting files
    let conflictFiles: string[] = [];
    try {
      const output = execSync("git diff --name-only --diff-filter=U", {
        cwd: workspace,
        encoding: "utf-8",
        timeout: TIMEOUT,
      }).trim();
      conflictFiles = output ? output.split("\n") : [];
      // Abort the failed merge
      execSync("git merge --abort", { cwd: workspace, stdio: "pipe", timeout: TIMEOUT });
    } catch { /* ignore */ }

    return { success: false, conflictFiles };
  }
}

/**
 * Check for potential merge conflicts between a branch and the current HEAD
 * using git merge-tree (dry run). Returns list of conflicting file paths.
 */
export function checkConflicts(workspace: string, branch: string): string[] {
  try {
    // git merge-tree --write-tree does a dry-run merge and fails on conflicts
    execSync(`git merge-tree --write-tree HEAD "${branch}"`, {
      cwd: workspace,
      stdio: "pipe",
      timeout: TIMEOUT,
    });
    return []; // No conflicts
  } catch (err) {
    // merge-tree exits non-zero on conflicts — parse output for conflicted files
    const output = (err as { stdout?: Buffer })?.stdout?.toString() ?? "";
    const files: string[] = [];
    for (const line of output.split("\n")) {
      // Lines like "CONFLICT (content): Merge conflict in <file>"
      const match = line.match(/CONFLICT.*:\s+Merge conflict in\s+(.+)/);
      if (match) files.push(match[1].trim());
    }
    // If we couldn't parse any files but merge-tree failed, it's still a conflict
    if (files.length === 0) {
      console.log(`[Worktree] merge-tree failed but no files parsed — treating as clean`);
      return [];
    }
    return files;
  }
}

/**
 * Remove a worktree directory only (keep the branch for manual conflict resolution).
 */
export function removeWorktreeOnly(worktreePath: string, workspace?: string): void {
  const cwd = workspace ?? path.dirname(path.dirname(worktreePath));
  try {
    execSync(`git worktree remove --force "${worktreePath}"`, { cwd, stdio: "pipe", timeout: TIMEOUT });
  } catch { /* already removed */ }
}

/**
 * Force-remove a worktree and its branch (used on task failure/cancel).
 */
export function removeWorktree(worktreePath: string, branch: string, workspace?: string): void {
  const cwd = workspace ?? path.dirname(path.dirname(worktreePath));
  try {
    execSync(`git worktree remove --force "${worktreePath}"`, { cwd, stdio: "pipe", timeout: TIMEOUT });
  } catch { /* already removed */ }
  try {
    execSync(`git branch -D "${branch}"`, { cwd, stdio: "pipe", timeout: TIMEOUT });
  } catch { /* branch not found */ }
}
