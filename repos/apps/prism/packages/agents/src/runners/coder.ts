import { createWorkspaceFS, WorkspaceFS } from "../tools/fs";
import { PrismDiff } from "../../../prism-core/src";

export interface ApplyDiffOptions {
  workspace?: WorkspaceFS;
  dryRun?: boolean;
}

export interface ApplyDiffResult {
  path: string;
  hunks: number;
  applied: boolean;
}

class PatchMismatchError extends Error {}

export function applyUnifiedDiff(content: string, patch: string): string {
  const originalLines = content.split("\n");
  const output: string[] = [];
  const lines = patch.split(/\r?\n/);
  let index = 0;
  let pointer = 0; // 0-based index in originalLines

  const copyUntil = (lineNumber: number) => {
    while (pointer < lineNumber - 1 && pointer < originalLines.length) {
      output.push(originalLines[pointer]);
      pointer += 1;
    }
  };

  const expectLine = (expected: string) => {
    const current = originalLines[pointer] ?? "";
    if (current !== expected) {
      throw new PatchMismatchError(`Patch mismatch at line ${pointer + 1}: expected "${expected}", saw "${current}"`);
    }
    pointer += 1;
  };

  while (index < lines.length) {
    const line = lines[index];
    if (!line) {
      index += 1;
      continue;
    }
    if (line.startsWith("---") || line.startsWith("+++")) {
      index += 1;
      continue;
    }
    if (!line.startsWith("@@")) {
      index += 1;
      continue;
    }

    const hunkHeader = line;
    const match = hunkHeader.match(/@@ -(?<oldStart>\d+)(?:,(?<oldCount>\d+))? \+(?<newStart>\d+)(?:,(?<newCount>\d+))? @@/);
    if (!match || !match.groups) {
      throw new Error(`Invalid hunk header: ${hunkHeader}`);
    }
    const oldStart = Number(match.groups.oldStart);
    copyUntil(oldStart);
    index += 1;

    while (index < lines.length) {
      const current = lines[index];
      if (current.startsWith("@@")) break;
      if (current.startsWith("+")) {
        output.push(current.slice(1));
      } else if (current.startsWith("-")) {
        expectLine(current.slice(1));
      } else if (current.startsWith(" ")) {
        expectLine(current.slice(1));
        output.push(originalLines[pointer - 1] ?? "");
      }
      index += 1;
    }
  }

  while (pointer < originalLines.length) {
    output.push(originalLines[pointer]);
    pointer += 1;
  }

  // Remove potential trailing empty string introduced by split
  if (originalLines.at(-1) === "" && output.at(-1) !== "") {
    output.push("");
  }

  return output.join("\n");
}

export async function applyDiffs(
  diffs: PrismDiff[],
  options: ApplyDiffOptions = {}
): Promise<ApplyDiffResult[]> {
  const workspace = options.workspace ?? createWorkspaceFS();
  const results: ApplyDiffResult[] = [];

  for (const diff of diffs) {
    const current = (await workspace.exists(diff.path))
      ? await workspace.readFile(diff.path)
      : "";
    const patch = diff.patch;
    let applied = false;
    let nextContent = current;
    try {
      nextContent = applyUnifiedDiff(current, patch);
      applied = true;
    } catch (error) {
      if (error instanceof PatchMismatchError) {
        applied = false;
      } else {
        throw error;
      }
    }

    if (!options.dryRun && applied) {
      await workspace.writeFile(diff.path, nextContent);
    }

    const hunkCount = (patch.match(/\n@@/g)?.length ?? 0) + (patch.startsWith("@@") ? 1 : 0);
    results.push({ path: diff.path, hunks: hunkCount, applied });
  }

  return results;
}
