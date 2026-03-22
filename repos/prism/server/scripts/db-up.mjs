import fs from 'fs';
import path from 'path';

const dataDir = path.resolve(process.cwd(), '../data');
const dbPath = path.join(dataDir, 'prism.sqlite');
fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, '');
}
const workDir = path.resolve(process.cwd(), '../work');
fs.mkdirSync(workDir, { recursive: true });
console.log(`SQLite database ready at ${dbPath}`);
console.log(`Workspace directory ready at ${workDir}`);
