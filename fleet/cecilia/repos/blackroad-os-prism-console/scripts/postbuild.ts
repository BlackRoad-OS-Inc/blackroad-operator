import { writeFileSync } from 'fs';
import { join } from 'path';

const payload = {
  ts: new Date().toISOString(),
  commit: process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.COMMIT_SHA ?? 'dev-local',
  agent: 'Prism-Gen-0'
};

const outputPath = join(process.cwd(), 'public', 'sig.beacon.json');
writeFileSync(outputPath, JSON.stringify(payload, null, 2));
console.log(`sig beacon emitted to ${outputPath}`);
