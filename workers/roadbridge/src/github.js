/**
 * roadbridge — GitHub API client
 *
 * Uses GitHub App installation tokens (1-hour TTL, auto-refreshed).
 * Never uses PATs. Token negotiation events are logged but tokens
 * themselves are never persisted.
 *
 * Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
 */

const GITHUB_API = 'https://api.github.com';

/**
 * Fetch a GitHub App installation token.
 * Tokens have a 1-hour TTL and are scoped to the installation.
 * @param {object} env - Worker env with GITHUB_APP_ID, GITHUB_APP_PRIVATE_KEY
 * @param {string} installationId
 * @returns {Promise<{token: string, expiresAt: string}>}
 */
export async function getInstallationToken(env, installationId) {
  const jwt = await createAppJwt(env.GITHUB_APP_ID, env.GITHUB_APP_PRIVATE_KEY);

  const res = await fetch(
    `${GITHUB_API}/app/installations/${installationId}/access_tokens`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'roadbridge/1.0',
      },
    },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub token fetch failed: ${res.status} ${body}`);
  }

  const data = await res.json();
  return { token: data.token, expiresAt: data.expires_at };
}

/**
 * Download a release asset from GitHub.
 * @param {string} token - Installation token
 * @param {string} owner
 * @param {string} repo
 * @param {number} assetId
 * @returns {Promise<{stream: ReadableStream, name: string, size: number, contentType: string}>}
 */
export async function downloadReleaseAsset(token, owner, repo, assetId) {
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/releases/assets/${assetId}`,
    {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/octet-stream',
        'User-Agent': 'roadbridge/1.0',
      },
      redirect: 'follow',
    },
  );

  if (!res.ok) {
    throw new Error(`Asset download failed: ${res.status}`);
  }

  return {
    stream: res.body,
    name: res.headers.get('content-disposition')?.match(/filename="?(.+?)"?$/)?.[1] || `asset-${assetId}`,
    size: parseInt(res.headers.get('content-length') || '0', 10),
    contentType: res.headers.get('content-type') || 'application/octet-stream',
  };
}

/**
 * Get file content from a GitHub repository.
 * @param {string} token - Installation token
 * @param {string} owner
 * @param {string} repo
 * @param {string} path - File path within the repo
 * @param {string} [ref] - Branch or commit SHA
 * @returns {Promise<{content: string, sha: string, encoding: string}>}
 */
export async function getFileContent(token, owner, repo, path, ref) {
  const url = new URL(`${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`);
  if (ref) url.searchParams.set('ref', ref);

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'roadbridge/1.0',
    },
  });

  if (!res.ok) {
    throw new Error(`File fetch failed: ${res.status} ${path}`);
  }

  const data = await res.json();
  const content =
    data.encoding === 'base64' ? atob(data.content.replace(/\n/g, '')) : data.content;

  return { content, sha: data.sha, encoding: data.encoding };
}

/**
 * Create or update a file in a GitHub repository.
 * @param {string} token
 * @param {string} owner
 * @param {string} repo
 * @param {string} path
 * @param {string} content - File content (will be base64-encoded)
 * @param {string} message - Commit message
 * @param {string} [branch] - Target branch
 * @param {string} [sha] - SHA of existing file (for updates)
 * @returns {Promise<{sha: string, commitSha: string}>}
 */
export async function createOrUpdateFile(
  token,
  owner,
  repo,
  path,
  content,
  message,
  branch,
  sha,
) {
  const body = {
    message,
    content: btoa(unescape(encodeURIComponent(content))),
  };
  if (branch) body.branch = branch;
  if (sha) body.sha = sha;

  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'User-Agent': 'roadbridge/1.0',
      },
      body: JSON.stringify(body),
    },
  );

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`File create/update failed: ${res.status} ${errBody}`);
  }

  const data = await res.json();
  return {
    sha: data.content.sha,
    commitSha: data.commit.sha,
  };
}

/**
 * Create a pull request.
 * @param {string} token
 * @param {string} owner
 * @param {string} repo
 * @param {object} params
 * @param {string} params.title
 * @param {string} params.body
 * @param {string} params.head - Source branch
 * @param {string} params.base - Target branch
 * @returns {Promise<{number: number, url: string}>}
 */
export async function createPullRequest(token, owner, repo, params) {
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/pulls`, {
    method: 'POST',
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'roadbridge/1.0',
    },
    body: JSON.stringify({
      title: params.title,
      body: params.body,
      head: params.head,
      base: params.base,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`PR creation failed: ${res.status} ${errBody}`);
  }

  const data = await res.json();
  return { number: data.number, url: data.html_url };
}

/**
 * Create a new branch from a base ref.
 * @param {string} token
 * @param {string} owner
 * @param {string} repo
 * @param {string} branchName
 * @param {string} baseSha - SHA to branch from
 * @returns {Promise<void>}
 */
export async function createBranch(token, owner, repo, branchName, baseSha) {
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/git/refs`,
    {
      method: 'POST',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'User-Agent': 'roadbridge/1.0',
      },
      body: JSON.stringify({
        ref: `refs/heads/${branchName}`,
        sha: baseSha,
      }),
    },
  );

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Branch creation failed: ${res.status} ${errBody}`);
  }
}

/**
 * Get the SHA of the HEAD of a branch.
 * @param {string} token
 * @param {string} owner
 * @param {string} repo
 * @param {string} branch
 * @returns {Promise<string>}
 */
export async function getBranchSha(token, owner, repo, branch) {
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/git/refs/heads/${branch}`,
    {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'roadbridge/1.0',
      },
    },
  );

  if (!res.ok) {
    throw new Error(`Branch SHA fetch failed: ${res.status}`);
  }

  const data = await res.json();
  return data.object.sha;
}

// --- Internal: GitHub App JWT creation ---

/**
 * Create a short-lived JWT for GitHub App authentication.
 * JWT is used only to request installation tokens.
 * @param {string} appId
 * @param {string} privateKeyPem
 * @returns {Promise<string>}
 */
async function createAppJwt(appId, privateKeyPem) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iat: now - 60, // clock skew tolerance
    exp: now + 600, // 10 minutes max
    iss: appId,
  };

  const headerB64 = b64url(JSON.stringify(header));
  const payloadB64 = b64url(JSON.stringify(payload));
  const signingInput = `${headerB64}.${payloadB64}`;

  const key = await importPkcs8(privateKeyPem);
  const signature = await crypto.subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5' },
    key,
    new TextEncoder().encode(signingInput),
  );

  const sigB64 = b64url(signature);
  return `${signingInput}.${sigB64}`;
}

function b64url(input) {
  const str =
    typeof input === 'string'
      ? btoa(input)
      : btoa(String.fromCharCode(...new Uint8Array(input)));
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function importPkcs8(pem) {
  const pemBody = pem
    .replace(/-----BEGIN RSA PRIVATE KEY-----/g, '')
    .replace(/-----END RSA PRIVATE KEY-----/g, '')
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\s/g, '');

  const binaryDer = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));

  return crypto.subtle.importKey(
    'pkcs8',
    binaryDer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
}
