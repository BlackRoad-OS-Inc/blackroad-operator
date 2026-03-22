const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const name = path.basename(__dirname);
const base = path.join(__dirname, '..', '..', 'prism');
const logDir = path.join(base, 'logs');
const contrDir = path.join(base, 'contradictions');

function ensure() {
  fs.mkdirSync(logDir, { recursive: true });
  fs.mkdirSync(contrDir, { recursive: true });
}

function log(msg) {
  ensure();
  fs.appendFileSync(path.join(logDir, `${name}.log`), msg + '\n');
}

function contradiction(detail) {
  ensure();
  fs.writeFileSync(path.join(contrDir, `${name}.json`), JSON.stringify({ detail }));
}

function runDiagnostics(options = {}) {
  ensure();
  const scriptPath = path.join(__dirname, 'debug_program.py');
  const args = [scriptPath, '--json'];

  if (options.fix) {
    args.push('--fix');
  }

  if (options.reportPath) {
    args.push('--report', options.reportPath);
  }

  const result = spawnSync('python3', args, { encoding: 'utf8' });

  if (result.error) {
    return {
      status: 'error',
      detail: `Failed to run debug program: ${result.error.message}`
    };
  }

  const rawOutput = result.stdout || '';
  try {
    const parsed = rawOutput ? JSON.parse(rawOutput) : null;
    if (parsed) {
      parsed.exitCode = result.status;
      return parsed;
    }
  } catch (error) {
    return {
      status: 'error',
      detail: `Debug program returned invalid JSON: ${error.message}`,
      raw: result.stdout
    };
  }

  if (result.status !== 0) {
    return {
      status: 'attention',
      detail: rawOutput || result.stderr,
      exitCode: result.status
    };
  }

  return {
    status: 'ok',
    detail: 'Debug program finished without output.',
    exitCode: result.status
  };
}

module.exports = {
  name,
  handle(msg) {
    switch (msg.type) {
      case 'ping':
        log('ping');
        return `pong: ${name}`;
      case 'analyze':
        log(`analyze:${msg.path}`);
        return 'analysis complete';
      case 'codegen':
        log(`codegen:${msg.spec}`);
        return `code stub for ${msg.spec}`;
      case 'diagnose':
        log('diagnose');
        return runDiagnostics({ fix: msg.fix, reportPath: msg.reportPath });
      case 'contradiction':
        contradiction(msg.detail || 'unknown');
        return 'contradiction logged';
      default:
        return 'unknown';
    }
  }
};
