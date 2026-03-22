import { runCommand, ShellError } from "./shell";

export interface GitFileStatus {
  path: string;
  status: string;
}

export interface GitStatusSummary {
  branch: string;
  ahead: number;
  behind: number;
  files: GitFileStatus[];
}

export async function gitStatus(repoDir = process.cwd()): Promise<GitStatusSummary> {
  const [{ stdout: status }, { stdout: branchInfo }] = await Promise.all([
    runCommand("git", ["status", "--porcelain"], { cwd: repoDir }),
    runCommand("git", ["status", "--branch", "--short"], { cwd: repoDir }),
  ]);

  const files = status
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => ({ status: line.slice(0, 2).trim(), path: line.slice(2).trim() }));

  const branchLine = branchInfo.split("\n").find((line) => line.startsWith("##")) ?? "";
  const match = branchLine.match(/##\s+([^\.]+)(?:\.\.\.([^\s]+))?(?:\s+\[(.*)\])?/);
  const branch = match?.[1] ?? "unknown";
  const aheadBehind = match?.[3] ?? "";
  const ahead = parseAheadBehind(aheadBehind, "ahead");
  const behind = parseAheadBehind(aheadBehind, "behind");

  return { branch, ahead, behind, files };
}

function parseAheadBehind(segment: string, key: "ahead" | "behind"): number {
  const match = segment.match(new RegExp(`${key} (\\d+)`));
  return match ? Number(match[1]) : 0;
}

export async function applyPatch(patch: string, repoDir = process.cwd()): Promise<void> {
  try {
    await runCommand("git", ["apply", "--whitespace=fix"], { cwd: repoDir, input: patch });
  } catch (error) {
    if (error instanceof ShellError) {
      throw new Error(`Failed to apply patch: ${error.result.stderr || error.result.stdout}`);
    }
    throw error;
  }
}

export async function commit(
  message: string,
  options: { repoDir?: string; allowEmpty?: boolean } = {}
): Promise<void> {
  const repoDir = options.repoDir ?? process.cwd();
  const args = ["commit", "-am", message];
  if (options.allowEmpty) {
    args.push("--allow-empty");
  }
  await runCommand("git", args, { cwd: repoDir });
}

export async function currentBranch(repoDir = process.cwd()): Promise<string> {
  const { stdout } = await runCommand("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd: repoDir });
  return stdout.trim();
}

export async function ensureWorktreeClean(repoDir = process.cwd()): Promise<void> {
  const status = await gitStatus(repoDir);
  if (status.files.length > 0) {
    throw new Error("Working tree has uncommitted changes");
  }
}
