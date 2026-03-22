#!/usr/bin/env node
/**
 * Validate registry JSON files
 * Usage: node scripts/validate.js
 */
const fs = require('fs');
const path = require('path');

const registriesDir = path.join(__dirname, '..', 'registries');
const files = ['orgs.json', 'repos.json', 'domains.json', 'nodes.json', 'agents.json', 'services.json'];
let errors = 0;

for (const file of files) {
  const filePath = path.join(registriesDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`MISSING: ${file}`);
    errors++;
    continue;
  }

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!Array.isArray(data)) {
      console.error(`INVALID: ${file} — must be an array`);
      errors++;
      continue;
    }
    console.log(`OK: ${file} — ${data.length} entries`);
  } catch (err) {
    console.error(`PARSE ERROR: ${file} — ${err.message}`);
    errors++;
  }
}

// Cross-validate: domains reference valid orgs
const orgs = JSON.parse(fs.readFileSync(path.join(registriesDir, 'orgs.json'), 'utf8'));
const orgNames = new Set(orgs.map(o => o.name));
const domains = JSON.parse(fs.readFileSync(path.join(registriesDir, 'domains.json'), 'utf8'));
for (const d of domains) {
  if (!orgNames.has(d.org)) {
    console.error(`INVALID REF: domain ${d.domain} references unknown org ${d.org}`);
    errors++;
  }
}

// Cross-validate: repos reference valid orgs
const repos = JSON.parse(fs.readFileSync(path.join(registriesDir, 'repos.json'), 'utf8'));
const repoOrgs = new Set(repos.map(r => r.org));
for (const org of repoOrgs) {
  if (!orgNames.has(org)) {
    console.error(`INVALID REF: repos reference unknown org ${org}`);
    errors++;
  }
}

// Cross-validate: agents reference valid orgs
const agents = JSON.parse(fs.readFileSync(path.join(registriesDir, 'agents.json'), 'utf8'));
for (const a of agents) {
  if (!orgNames.has(a.org)) {
    console.error(`INVALID REF: agent ${a.name} references unknown org ${a.org}`);
    errors++;
  }
}

if (errors) {
  console.error(`\n${errors} error(s) found`);
  process.exit(1);
} else {
  console.log('\nAll registries valid');
}
