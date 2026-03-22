#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const channel = process.argv[2] || 'canary';
const sha = process.argv[3] || process.env.GITHUB_SHA || '';
const ref = process.argv[4] || '';

const file = path.join(process.cwd(), 'sites', 'blackroad', 'public', 'deploys.json');

function safeRead(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    return { history: [] };
  }
}

const data = safeRead(file);
const history = Array.isArray(data.history) ? data.history.slice(0) : [];

history.unshift({
  ts: new Date().toISOString(),
  channel,
  sha,
  ref,
});

const trimmed = history.slice(0, 25);
const channels = {};
for (const entry of trimmed) {
  if (!channels[entry.channel]) {
    channels[entry.channel] = [];
  }
  channels[entry.channel].push(entry);
}

const payload = { history: trimmed, channels };

fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, JSON.stringify(payload, null, 2));

console.log(`Recorded deploy for ${channel}: ${sha.slice(0, 7)}`);
