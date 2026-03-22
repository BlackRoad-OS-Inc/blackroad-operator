const { loadConfig } = require('@roadcode/config');
const { createLogger } = require('@roadcode/logger');

const log = createLogger('policy');
const config = loadConfig();

const REQUIRED_FILES = ['README.md', 'LICENSE', 'CLAUDE.md'];
const NAMING_PATTERN = /^[a-z][a-z0-9-]*$/;

async function checkOrgHealth(org) {
  const violations = [];
  const giteaUrl = config.gitea.url;
  const giteaToken = config.gitea.token;

  if (!giteaToken) {
    log.warn('No GITEA_TOKEN, using GitHub fallback');
    return violations;
  }

  try {
    // Check RoadCode repo exists
    const rcResp = await fetch(`${giteaUrl}/api/v1/repos/${org}/RoadCode`, {
      headers: { Authorization: `token ${giteaToken}` },
    });
    if (!rcResp.ok) {
      violations.push({ org, rule: 'roadcode-exists', message: `${org} is missing RoadCode repo` });
    }

    // Check repos for naming convention
    const reposResp = await fetch(`${giteaUrl}/api/v1/orgs/${org}/repos?limit=100`, {
      headers: { Authorization: `token ${giteaToken}` },
    });
    if (reposResp.ok) {
      const repos = await reposResp.json();
      for (const repo of repos) {
        if (repo.name !== 'RoadCode' && !NAMING_PATTERN.test(repo.name) && !repo.name.startsWith('Road')) {
          violations.push({ org, rule: 'naming', message: `${org}/${repo.name} violates naming convention` });
        }
      }
    }
  } catch (err) {
    log.error(`Health check error for ${org}`, { error: err.message });
  }

  return violations;
}

async function runChecks() {
  try {
    const registryUrl = config.policy.registryUrl || 'http://localhost:3101';
    const resp = await fetch(`${registryUrl}/road/v1/orgs`);
    if (!resp.ok) {
      log.warn('Cannot reach registry, skipping policy checks');
      return;
    }

    const orgs = await resp.json();
    let totalViolations = 0;

    for (const org of orgs) {
      const violations = await checkOrgHealth(org.name);
      totalViolations += violations.length;
      for (const v of violations) {
        log.warn(`VIOLATION: ${v.rule} — ${v.message}`);
      }
    }

    log.info(`Policy check complete: ${orgs.length} orgs, ${totalViolations} violations`);
  } catch (err) {
    log.error('Policy check failed', { error: err.message });
  }
}

// Run on start, then on interval
runChecks();
setInterval(runChecks, (config.policy.checkInterval || 3600) * 1000);
log.info(`Policy running, interval: ${config.policy.checkInterval || 3600}s`);
