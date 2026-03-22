#!/usr/bin/env node
/**
 * Import/refresh repos.json from all GitHub orgs.
 * Pulls real repo data from GitHub API and writes to registries/repos.json.
 *
 * Usage: GITHUB_TOKEN=ghp_xxx node scripts/import-github.js
 * Or:    node scripts/import-github.js  (uses gh CLI auth)
 */
const fs = require('fs');
const path = require('path');
const { createLogger } = require('../packages/logger/src');

const log = createLogger('import-github');

const ORGS = [
  'BlackRoad-OS-Inc', 'BlackRoad-OS', 'BlackRoad-AI', 'BlackRoad-Cloud',
  'BlackRoad-Security', 'BlackRoad-Labs', 'BlackRoad-Studio', 'BlackRoad-Media',
  'BlackRoad-Interactive', 'BlackRoad-Hardware', 'BlackRoad-Education',
  'BlackRoad-Foundation', 'BlackRoad-Gov', 'BlackRoad-Ventures',
  'BlackRoad-Archive', 'Blackbox-Enterprises',
];

const TOKEN = process.env.GITHUB_TOKEN || '';
const headers = {
  Accept: 'application/vnd.github.v3+json',
  'User-Agent': 'RoadCode-Importer/0.1',
};
if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;

async function fetchOrgRepos(org) {
  const repos = [];
  let page = 1;
  while (true) {
    const url = `https://api.github.com/orgs/${org}/repos?per_page=100&sort=updated&page=${page}`;
    const res = await fetch(url, { headers });
    if (!res.ok) {
      log.warn(`GitHub API error for ${org}: ${res.status}`);
      break;
    }
    const data = await res.json();
    if (!data.length) break;
    for (const r of data) {
      repos.push({
        org,
        name: r.name,
        purpose: r.description || '',
        status: r.archived ? 'archived' : 'active',
        github_url: r.html_url,
        stars: r.stargazers_count,
        language: r.language,
        updated_at: r.updated_at,
        default_branch: r.default_branch,
      });
    }
    page++;
    if (data.length < 100) break;
  }
  return repos;
}

async function main() {
  log.info(`Importing from ${ORGS.length} orgs...`);
  const allRepos = [];

  for (const org of ORGS) {
    const repos = await fetchOrgRepos(org);
    log.info(`${org}: ${repos.length} repos`);
    allRepos.push(...repos);
  }

  const outPath = path.join(__dirname, '..', 'registries', 'repos.json');
  fs.writeFileSync(outPath, JSON.stringify(allRepos, null, 2));
  log.info(`Written ${allRepos.length} repos to ${outPath}`);

  // Stats
  const byOrg = {};
  for (const r of allRepos) {
    byOrg[r.org] = (byOrg[r.org] || 0) + 1;
  }
  const active = allRepos.filter(r => r.status === 'active').length;
  const archived = allRepos.filter(r => r.status === 'archived').length;
  log.info(`Total: ${allRepos.length} (${active} active, ${archived} archived)`);
}

main().catch(err => {
  log.error('Import failed', { error: err.message });
  process.exit(1);
});
