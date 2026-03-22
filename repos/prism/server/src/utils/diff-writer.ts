import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { applyPatch } from 'diff';
import type { PrismDiff } from '@prism/core';

function resolveWorkRoot() {
  if (process.env.PRISM_WORK_ROOT) {
    return path.resolve(process.env.PRISM_WORK_ROOT);
  }
  const cwd = process.cwd();
  if (path.basename(cwd) === 'server') {
    return path.resolve(cwd, '../work');
  }
  return path.resolve(cwd, 'work');
}

export function ensureWorkdir() {
  const root = resolveWorkRoot();
  fs.mkdirSync(root, { recursive: true });
  return root;
}

export function applyDiffs(diffs: PrismDiff[], message: string) {
  const root = ensureWorkdir();
  for (const diff of diffs) {
    const target = path.resolve(root, diff.path);
    if (!target.startsWith(root + path.sep) && target !== root) {
      throw new Error('Invalid path');
    }
    fs.mkdirSync(path.dirname(target), { recursive: true });
    const result = applyPatch('', diff.patch);
    if (result === false) {
      throw new Error(`Failed to apply patch for ${diff.path}`);
    }
    fs.writeFileSync(target, result);
  }
  const commitSha = createHash('sha1').update(JSON.stringify({ diffs, message })).digest('hex');
  return { commitSha };
}
