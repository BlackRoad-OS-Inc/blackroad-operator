#!/usr/bin/env node

const { spawn } = require('child_process');

const port = process.env.PORT || '3000';
const args = ['serve', '--dir', 'build', '--host', '0.0.0.0', '--port', port];

const child = spawn('docusaurus', args, {
  stdio: 'inherit',
  shell: true
});

child.on('error', (err) => {
  console.error('Failed to start docusaurus:', err.message);
  process.exit(1);
});
process.on('SIGINT', () => {
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  child.kill('SIGTERM');
});
child.on('exit', (code) => {
  process.exit(code || 1);
});
