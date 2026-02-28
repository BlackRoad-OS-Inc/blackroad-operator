/**
 * roadbridge — Layer 3: Route executor
 *
 * Executes classified route decisions using scoped, short-lived credentials.
 * Every transfer (success or failure) is witnessed to roadchain.
 *
 * Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
 */

import * as github from './github.js';
import * as drive from './drive.js';
import { witness, hashPayload } from './witness.js';

/**
 * Execute a route decision produced by the classifier.
 * @param {object} env - Worker environment bindings
 * @param {import('./classifier.js').RouteDecision} route
 * @param {object} payload - Original webhook payload
 * @param {string} eventType - Original event type
 * @returns {Promise<{ok: boolean, witnessEntry: object, detail: string}>}
 */
export async function executeRoute(env, route, payload, eventType) {
  const payloadStr = JSON.stringify(payload);
  const payloadHash = await hashPayload(payloadStr);

  try {
    let detail;

    if (route.direction === 'github_to_drive') {
      detail = await executeGitHubToDrive(env, route, payload);
    } else if (route.direction === 'drive_to_github') {
      detail = await executeDriveToGitHub(env, route, payload);
    } else {
      throw new Error(`Unknown direction: ${route.direction}`);
    }

    // Witness success
    const witnessEntry = route.witness
      ? await witness(env.ROADCHAIN_LEDGER, {
          eventType,
          artifactType: route.artifactType,
          direction: route.direction,
          source: getSource(route, payload),
          destination: getDestination(route, detail),
          payloadHash,
          status: 'success',
        })
      : null;

    return { ok: true, witnessEntry, detail };
  } catch (err) {
    // Witness failure
    const witnessEntry = route.witness
      ? await witness(env.ROADCHAIN_LEDGER, {
          eventType,
          artifactType: route.artifactType,
          direction: route.direction,
          source: getSource(route, payload),
          destination: route.drivePath || route.githubPath,
          payloadHash,
          status: 'failure',
          error: err.message,
        })
      : null;

    return { ok: false, witnessEntry, detail: err.message };
  }
}

/**
 * Execute a GitHub → Drive transfer.
 */
async function executeGitHubToDrive(env, route, payload) {
  const driveToken = await getDriveToken(env);
  const rootFolderId = await getRootFolderId(env);

  switch (route.artifactType) {
    case 'release_artifact':
      return executeReleaseSync(env, route, payload, driveToken, rootFolderId);
    case 'memory_journal':
      return executeJournalSync(env, route, payload, driveToken, rootFolderId);
    case 'roadchain_entry':
      return executeRoadchainSync(env, route, payload, driveToken, rootFolderId);
    case 'design_asset':
    case 'agent_report':
      return executeFileSync(env, route, payload, driveToken, rootFolderId);
    default:
      return `No handler for artifact type: ${route.artifactType}`;
  }
}

/**
 * Execute a Drive → GitHub transfer (doc-to-markdown PR flow).
 */
async function executeDriveToGitHub(env, route, payload) {
  const driveToken = await getDriveToken(env);
  const fileId = payload.fileId || payload.resourceId;

  if (!fileId) {
    throw new Error('Drive event missing fileId');
  }

  // Download the Drive doc as plain text
  const { content } = await drive.downloadFile(
    driveToken,
    fileId,
    'text/plain',
  );

  // Get GitHub credentials
  const installationId = await getInstallationId(env);
  const { token: ghToken } = await github.getInstallationToken(
    env,
    installationId,
  );

  const repo = env.ROADBRIDGE_DEFAULT_REPO || 'blackroad-operator';
  const owner = env.ROADBRIDGE_DEFAULT_OWNER || 'BlackRoad-OS-Inc';
  const baseBranch = 'main';
  const branchName = `roadbridge/drive-sync-${Date.now()}`;

  // Create a branch for the PR
  const baseSha = await github.getBranchSha(ghToken, owner, repo, baseBranch);
  await github.createBranch(ghToken, owner, repo, branchName, baseSha);

  // Create the file on the new branch
  const filePath = route.githubPath.replace(/^\//, '');
  const commitMsg = `roadbridge: sync ${route.artifactType} from Drive`;
  await github.createOrUpdateFile(
    ghToken,
    owner,
    repo,
    filePath,
    content,
    commitMsg,
    branchName,
  );

  // Open a PR
  const pr = await github.createPullRequest(ghToken, owner, repo, {
    title: `[roadbridge] Sync: ${filePath}`,
    body: [
      '## roadbridge Drive → GitHub sync',
      '',
      `- **Artifact type:** ${route.artifactType}`,
      `- **Source:** Drive file \`${fileId}\``,
      `- **Transformation:** ${route.transformation}`,
      `- **Classifier:** ${route.classifierSource}`,
      '',
      '_This PR was created automatically by roadbridge._',
    ].join('\n'),
    head: branchName,
    base: baseBranch,
  });

  return `PR #${pr.number} created: ${pr.url}`;
}

/**
 * Sync release artifacts to Drive.
 */
async function executeReleaseSync(env, route, payload, driveToken, rootFolderId) {
  const assets = payload.release?.assets || [];
  if (assets.length === 0) return 'No release assets to sync';

  const folderId = await drive.ensureFolderPath(
    driveToken,
    rootFolderId,
    route.drivePath,
  );

  const installationId = await getInstallationId(env);
  const { token: ghToken } = await github.getInstallationToken(
    env,
    installationId,
  );

  const owner = payload.repository.owner.login;
  const repo = payload.repository.name;
  const results = [];

  for (const asset of assets) {
    const downloaded = await github.downloadReleaseAsset(
      ghToken,
      owner,
      repo,
      asset.id,
    );

    await drive.uploadFile(driveToken, {
      name: asset.name,
      folderId,
      content: downloaded.stream,
      mimeType: downloaded.contentType,
    });

    results.push(asset.name);
  }

  return `Synced ${results.length} release assets: ${results.join(', ')}`;
}

/**
 * Sync Lucidia memory journal entries to Drive as a Google Doc.
 */
async function executeJournalSync(env, route, payload, driveToken, rootFolderId) {
  const commits = payload.commits || [];
  const journalFiles = commits.flatMap((c) =>
    [...(c.added || []), ...(c.modified || [])].filter(
      (p) =>
        p.includes('journal') || p.includes('memory/') || p.endsWith('.jsonl'),
    ),
  );

  if (journalFiles.length === 0) return 'No journal files in push';

  const installationId = await getInstallationId(env);
  const { token: ghToken } = await github.getInstallationToken(
    env,
    installationId,
  );

  const owner = payload.repository.owner.login;
  const repo = payload.repository.name;
  const ref = payload.after; // commit SHA after push

  // Collect journal content
  const entries = [];
  for (const filePath of journalFiles) {
    try {
      const { content } = await github.getFileContent(
        ghToken,
        owner,
        repo,
        filePath,
        ref,
      );
      entries.push(`## ${filePath}\n\n${content}`);
    } catch {
      entries.push(`## ${filePath}\n\n_Failed to fetch content_`);
    }
  }

  const docContent = [
    `# Lucidia Memory Journal — ${new Date().toISOString().split('T')[0]}`,
    '',
    `**Repo:** ${owner}/${repo}`,
    `**Commit:** ${payload.after?.slice(0, 8)}`,
    `**Pusher:** ${payload.pusher?.name || 'unknown'}`,
    '',
    '---',
    '',
    ...entries,
  ].join('\n');

  // Ensure the lucidia/journals folder exists
  const folderId = await drive.ensureFolderPath(
    driveToken,
    rootFolderId,
    'lucidia/journals',
  );

  const date = new Date().toISOString().split('T')[0];
  await drive.uploadFile(driveToken, {
    name: `${date}-journal.gdoc`,
    folderId,
    content: docContent,
    mimeType: 'text/plain',
    driveMimeType: 'application/vnd.google-apps.document',
  });

  return `Journal synced: ${journalFiles.length} files → lucidia/journals/${date}`;
}

/**
 * Sync roadchain entries to Drive as human-readable docs.
 */
async function executeRoadchainSync(env, route, payload, driveToken, rootFolderId) {
  const commits = payload.commits || [];
  const auditFiles = commits.flatMap((c) =>
    [...(c.added || []), ...(c.modified || [])].filter(
      (p) =>
        p.includes('roadchain') || p.includes('ledger') || p.includes('audit'),
    ),
  );

  if (auditFiles.length === 0) return 'No roadchain files in push';

  const folderId = await drive.ensureFolderPath(
    driveToken,
    rootFolderId,
    route.drivePath,
  );

  const installationId = await getInstallationId(env);
  const { token: ghToken } = await github.getInstallationToken(
    env,
    installationId,
  );

  const owner = payload.repository.owner.login;
  const repo = payload.repository.name;

  for (const filePath of auditFiles) {
    try {
      const { content } = await github.getFileContent(
        ghToken,
        owner,
        repo,
        filePath,
        payload.after,
      );

      const docContent = [
        `# Roadchain Audit Entry`,
        '',
        `**Source:** ${owner}/${repo}`,
        `**File:** ${filePath}`,
        `**Commit:** ${payload.after?.slice(0, 8)}`,
        `**Date:** ${new Date().toISOString()}`,
        '',
        '---',
        '',
        '```',
        content,
        '```',
      ].join('\n');

      const fileName = filePath.split('/').pop() || 'audit-entry';
      await drive.uploadFile(driveToken, {
        name: `${fileName}.gdoc`,
        folderId,
        content: docContent,
        mimeType: 'text/plain',
        driveMimeType: 'application/vnd.google-apps.document',
      });
    } catch {
      // Continue with other files
    }
  }

  return `Roadchain audit: ${auditFiles.length} entries synced to Drive`;
}

/**
 * Generic file sync (design assets, reports, etc.)
 */
async function executeFileSync(env, route, payload, driveToken, rootFolderId) {
  const folderId = await drive.ensureFolderPath(
    driveToken,
    rootFolderId,
    route.drivePath,
  );

  const commits = payload.commits || [];
  const allFiles = commits.flatMap((c) => [
    ...(c.added || []),
    ...(c.modified || []),
  ]);

  if (allFiles.length === 0) return 'No files to sync';

  const installationId = await getInstallationId(env);
  const { token: ghToken } = await github.getInstallationToken(
    env,
    installationId,
  );

  const owner = payload.repository.owner.login;
  const repo = payload.repository.name;
  let synced = 0;

  for (const filePath of allFiles) {
    try {
      const { content } = await github.getFileContent(
        ghToken,
        owner,
        repo,
        filePath,
        payload.after,
      );

      const fileName = filePath.split('/').pop() || 'file';
      const mimeType = guessMimeType(fileName);

      await drive.uploadFile(driveToken, {
        name: fileName,
        folderId,
        content,
        mimeType,
      });
      synced++;
    } catch {
      // Skip files that fail to fetch
    }
  }

  return `Synced ${synced}/${allFiles.length} files to ${route.drivePath}`;
}

// --- Helpers ---

async function getDriveToken(env) {
  // In production, this fetches a short-lived token via Workload Identity Federation.
  // For now, read from KV where the token is rotated by a scheduled worker.
  const token = await env.ROADBRIDGE_KV.get('drive_access_token');
  if (!token) throw new Error('No Drive access token available — check WIF configuration');
  return token;
}

async function getRootFolderId(env) {
  const folderId = await env.ROADBRIDGE_KV.get('drive_root_folder_id');
  if (!folderId) throw new Error('No Drive root folder ID configured');
  return folderId;
}

async function getInstallationId(env) {
  const id = await env.ROADBRIDGE_KV.get('github_installation_id');
  if (!id) throw new Error('No GitHub App installation ID configured');
  return id;
}

function getSource(route, payload) {
  if (route.direction === 'github_to_drive') {
    const repo = payload.repository?.full_name || 'unknown';
    const ref = payload.after?.slice(0, 8) || payload.release?.tag_name || '';
    return `${repo}@${ref}`;
  }
  return payload.fileId || payload.resourceId || 'unknown';
}

function getDestination(route, detail) {
  return route.drivePath || route.githubPath || detail || 'unknown';
}

function guessMimeType(filename) {
  const ext = filename.split('.').pop()?.toLowerCase();
  const mimeMap = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    pdf: 'application/pdf',
    zip: 'application/zip',
    tar: 'application/x-tar',
    gz: 'application/gzip',
    json: 'application/json',
    md: 'text/markdown',
    txt: 'text/plain',
    js: 'text/javascript',
    ts: 'text/typescript',
    py: 'text/x-python',
    html: 'text/html',
    css: 'text/css',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };
  return mimeMap[ext] || 'application/octet-stream';
}
