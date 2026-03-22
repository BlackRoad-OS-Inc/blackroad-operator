const { loadConfig } = require('@roadcode/config');
const { createLogger } = require('@roadcode/logger');

const log = createLogger('mirror');
const config = loadConfig();

async function syncOrg(org) {
  const giteaUrl = config.gitea.url;
  const giteaToken = config.gitea.token;
  const githubToken = config.github.token;

  if (!giteaToken || !githubToken) {
    log.warn('Missing GITEA_TOKEN or GITHUB_TOKEN, skipping sync');
    return;
  }

  try {
    // List GitHub repos for this org
    const ghResp = await fetch(`https://api.github.com/orgs/${org}/repos?per_page=100`, {
      headers: { Authorization: `Bearer ${githubToken}`, Accept: 'application/vnd.github.v3+json' },
    });
    if (!ghResp.ok) {
      log.warn(`GitHub API error for ${org}: ${ghResp.status}`);
      return;
    }
    const ghRepos = await ghResp.json();

    // List Gitea repos for this org
    const gtResp = await fetch(`${giteaUrl}/api/v1/orgs/${org}/repos?limit=100`, {
      headers: { Authorization: `token ${giteaToken}` },
    });

    const gtRepos = gtResp.ok ? await gtResp.json() : [];
    const gtRepoNames = new Set(gtRepos.map(r => r.name));

    // Mirror repos that exist on GitHub but not on Gitea
    for (const repo of ghRepos) {
      if (!gtRepoNames.has(repo.name)) {
        log.info(`Would mirror: ${org}/${repo.name} (GitHub → Gitea)`);
        // TODO: create mirror repo in Gitea via API
      }
    }

    log.info(`Sync check complete: ${org} — ${ghRepos.length} GitHub, ${gtRepos.length} Gitea`);
  } catch (err) {
    log.error(`Sync error for ${org}`, { error: err.message });
  }
}

async function runSync() {
  const orgs = (process.env.GITHUB_ORGS || '').split(',').filter(Boolean);
  if (!orgs.length) {
    log.warn('No GITHUB_ORGS configured');
    return;
  }

  log.info(`Starting sync for ${orgs.length} orgs`);
  for (const org of orgs) {
    await syncOrg(org.trim());
  }
  log.info('Sync cycle complete');
}

// Run on start, then on interval
runSync();
setInterval(runSync, config.mirror.syncInterval * 1000);
log.info(`Mirror running, interval: ${config.mirror.syncInterval}s`);
