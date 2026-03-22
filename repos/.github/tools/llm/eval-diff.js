#!/usr/bin/env node
'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const dir = path.join('artifacts', 'llm-eval');

if (!fs.existsSync(dir)) {
  console.log('No eval artifacts; skipping.');
  process.exit(0);
}

try {
  execSync('git fetch origin main:refs/remotes/origin/main', { stdio: 'ignore' });
} catch (error) {
  // fetching main is best-effort only
}

try {
  execSync(`git show origin/main:${dir} > /dev/null 2>&1`, { stdio: 'ignore', shell: '/bin/bash' });
} catch (error) {
  console.log('No prior artifacts on main; skipping diff.');
  process.exit(0);
}

const files = fs
  .readdirSync(dir)
  .filter((file) => file.endsWith('.json') && file !== 'latency.json');

if (!files.length) {
  console.log('No eval artifacts; skipping.');
  process.exit(0);
}

let md = '### LLM Eval Diff (advisory)\n';

for (const file of files) {
  const nowPath = path.join(dir, file);
  let prevContent = '';
  try {
    prevContent = execSync(`git show origin/main:${dir}/${file}`, {
      encoding: 'utf8',
      stdio: 'pipe',
      shell: '/bin/bash',
    });
  } catch (error) {
    const nowObj = JSON.parse(fs.readFileSync(nowPath, 'utf8'));
    const nowCount = nowObj.results?.length || 0;
    md += `- ${file}: new file with ${nowCount} cases\n`;
    continue;
  }

  try {
    const prevObj = JSON.parse(prevContent);
    const nowObj = JSON.parse(fs.readFileSync(nowPath, 'utf8'));
    const prevCount = prevObj.results?.length || 0;
    const nowCount = nowObj.results?.length || 0;
    md += `- ${file}: cases ${prevCount} → ${nowCount}\n`;
  } catch (error) {
    md += `- ${file}: unable to parse JSON diff\n`;
  }
}

process.stdout.write(md);
