/* FILE: /var/www/blackroad/src/routes/aider.js */
import express from 'express';
import cors from 'cors';
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs/promises';
import process from 'node:process';
import { randomUUID } from 'node:crypto';

import config from '../config/appConfig.js';

const router = express.Router();

if (config.security.enableCors) {
  router.use(cors({ origin: config.corsOrigin, credentials: true }));
}

const { jsonLimit } = config;
router.use(express.json({ limit: jsonLimit }));

const MAX_FILES = 32;
const SUPPORTED_MODES = new Set(['ask', 'apply']);

function resolveSafe(filePath) {
  const absolutePath = path.resolve(config.aider.repoRoot, filePath);
  const repoRoot = path.resolve(config.aider.repoRoot);
  if (absolutePath !== repoRoot && !absolutePath.startsWith(repoRoot + path.sep)) {
    throw new Error(`Illegal path: ${filePath}`);
  }
  return absolutePath;
}

function runCommand(cmd, args, options = {}, timeoutMs = config.aider.timeoutMs) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { ...options });
    let stdout = '';
    let stderr = '';
    const timeout = timeoutMs
      ? setTimeout(() => {
          stderr += `\n[blackroad] aider command timed out after ${timeoutMs}ms`;
          child.kill('SIGTERM');
        }, timeoutMs)
      : null;

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (err) => {
      if (timeout) clearTimeout(timeout);
      reject(err);
    });

    child.on('close', (code) => {
      if (timeout) clearTimeout(timeout);
      resolve({ code, stdout, stderr });
    });
  });
}

async function collectLatestCommit(repoRoot) {
  const log = await runCommand('git', ['log', '-1', '--pretty=%H%n%s'], { cwd: repoRoot });
  if (log.code !== 0 || !log.stdout.trim()) {
    return null;
  }
  const [hash = '', title = ''] = log.stdout.split('\n');
  const diff = await runCommand('git', ['diff', '--name-status', 'HEAD~1..HEAD'], { cwd: repoRoot });
  return {
    commit: { hash: hash.trim(), title: title.trim() },
    diff: diff.code === 0 ? diff.stdout : null
  };
}

router.post('/', async (req, res, next) => {
  try {
    const { message, files = [], model, mode = 'apply' } = req.body || {};

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ status: 'error', error: 'message is required' });
    }

    if (!SUPPORTED_MODES.has(mode)) {
      return res.status(400).json({ status: 'error', error: `unsupported mode: ${mode}` });
    }

    if (!Array.isArray(files)) {
      return res.status(400).json({ status: 'error', error: 'files must be an array' });
    }

    if (files.length > MAX_FILES) {
      return res.status(400).json({ status: 'error', error: `too many files requested (max ${MAX_FILES})` });
    }

    const safeFiles = [];
    for (const file of files) {
      const absolute = resolveSafe(file);
      try {
        await fs.access(absolute);
      } catch (err) {
        return res.status(400).json({ status: 'error', error: `file not found: ${file}` });
      }
      safeFiles.push(path.relative(config.aider.repoRoot, absolute));
    }

    const args = ['--yes', '--auto-commits', '--dirty-commits', '--message', message, ...safeFiles];
    if (model) {
      args.push('--model', model);
    }
    if (mode === 'ask') {
      args.push('--chat-mode', 'ask');
    }

    const runId = randomUUID();
    req.log?.info({ runId, files: safeFiles, model, mode }, 'executing aider command');

    const aiderResult = await runCommand(config.aider.binary, args, {
      cwd: config.aider.repoRoot,
      env: process.env
    });

    if (aiderResult.code !== 0) {
      const errorBody = {
        status: 'error',
        code: aiderResult.code,
        error: 'aider command failed',
        console: (aiderResult.stdout + '\n' + aiderResult.stderr).trim(),
        runId
      };
      req.log?.error({ runId, code: aiderResult.code }, 'aider command failed');
      return res.status(502).json(errorBody);
    }

    let commitInfo = null;
    let diff = null;
    if (mode !== 'ask') {
      const latest = await collectLatestCommit(config.aider.repoRoot);
      if (latest) {
        commitInfo = latest.commit;
        diff = latest.diff;
      }
    }

    return res.json({
      status: 'ok',
      code: aiderResult.code,
      console: (aiderResult.stdout + '\n' + aiderResult.stderr).trim(),
      commit: commitInfo,
      diff,
      runId
    });
  } catch (error) {
    req.log?.error({ err: error }, 'unexpected error during aider command');
    return next(error);
  }
});

export default router;
