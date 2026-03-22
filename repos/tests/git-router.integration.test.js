/* eslint-env node, jest */
const {
  afterAll,
  beforeAll,
  describe,
  expect,
  test,
} = require('@jest/globals');
const process = require('node:process');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');

const gitServiceModule = require('../var/www/blackroad/server/routes/git-service.js');

const execFileAsync = promisify(execFile);
const gitService = gitServiceModule.default || gitServiceModule;

let tmpRoot;
let previousRoot;

describe('git service integration', () => {
  beforeAll(async () => {
    tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'git-router-'));
    previousRoot = process.env.GIT_REPO_ROOT;

    await execFileAsync('git', ['init'], { cwd: tmpRoot });
    await execFileAsync('git', ['config', 'user.email', 'git@example.com'], {
      cwd: tmpRoot,
    });
    await execFileAsync('git', ['config', 'user.name', 'Git Test'], {
      cwd: tmpRoot,
    });
    await fs.writeFile(path.join(tmpRoot, 'notes.txt'), 'hello\n');
    await execFileAsync('git', ['add', 'notes.txt'], { cwd: tmpRoot });
    await execFileAsync('git', ['commit', '-m', 'initial commit'], {
      cwd: tmpRoot,
    });

    process.env.GIT_REPO_ROOT = tmpRoot;
  });

  afterAll(async () => {
    if (previousRoot === undefined) delete process.env.GIT_REPO_ROOT;
    else process.env.GIT_REPO_ROOT = previousRoot;
    if (tmpRoot) {
      await fs.rm(tmpRoot, { recursive: true, force: true });
    }
  });

  test('performs end-to-end git operations', async () => {
    const health = await gitService.gitHealth();
    expect(health.ok).toBe(true);
    expect(health.insideWorkTree).toBe(true);

    const status = await gitService.gitStatus();
    expect(typeof status.branch).toBe('string');

    let changes = await gitService.gitChanges();
    expect(changes.staged.length).toBe(0);
    expect(changes.unstaged.length).toBe(0);

    await fs.writeFile(path.join(tmpRoot, 'notes.txt'), 'hello world\n');
    await gitService.gitStage(['notes.txt']);

    changes = await gitService.gitChanges();
    expect(changes.staged.length).toBe(1);

    const commitResult = await gitService.gitCommit({
      subject: 'feat: update notes',
    });
    expect(commitResult.ok).toBe(true);
    expect(commitResult.commit.subject).toBe('feat: update notes');

    const history = await gitService.gitHistory({ limit: 2 });
    expect(Array.isArray(history.history)).toBe(true);
    expect(history.history.length).toBeGreaterThanOrEqual(1);
    expect(history.history[0].subject).toBe('feat: update notes');

    await fs.writeFile(path.join(tmpRoot, 'scratch.txt'), 'temp\n');
    await gitService.gitStage(['scratch.txt']);
    await gitService.gitUnstage(['scratch.txt']);

    const finalChanges = await gitService.gitChanges();
    expect(
      finalChanges.unstaged.some((entry) => entry.path === 'scratch.txt')
    ).toBe(true);
  });
});
