/**
 * Context Bridge API Worker
 * Handles GitHub OAuth and auto-creates context gists
 */

const GITHUB_AUTHORIZE_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_API = 'https://api.github.com';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const DEFAULT_CONTEXT = `# My Context

**Last Updated**: ${new Date().toISOString().split('T')[0]}
**Active Work**: [Your current project]
**Status**: Getting started

## Who I Am
- **Name**: [Your name]
- **Role**: [What you do]

## Current Project
- **Project**: [Project name]
- **Stack**: [Technologies]
- **Goal**: [What you're building]

## My Preferences
- [How you like to work with AI]

## What I'm Working On Now
[Current task]

## For AI Continuity
Read this file at the start of every conversation.
Update it at the end of each session.

---
*Created with [Context Bridge](https://context-bridge.pages.dev)*
`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    // Routes
    if (url.pathname === '/auth') {
      return handleAuth(env);
    }

    if (url.pathname === '/callback') {
      return handleCallback(request, env);
    }

    if (url.pathname === '/create-gist') {
      return handleCreateGist(request, env);
    }

    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', service: 'context-bridge-api' }), {
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
      });
    }

    return new Response('Context Bridge API\n\nEndpoints:\n- /auth - Start GitHub OAuth\n- /callback - OAuth callback\n- /create-gist - Create context gist (POST)', {
      headers: { 'Content-Type': 'text/plain', ...CORS_HEADERS }
    });
  }
};

// Redirect to GitHub OAuth
function handleAuth(env) {
  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    redirect_uri: env.REDIRECT_URI,
    scope: 'gist',
    state: crypto.randomUUID(),
  });

  return Response.redirect(`${GITHUB_AUTHORIZE_URL}?${params}`, 302);
}

// Handle OAuth callback
async function handleCallback(request, env) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return new Response('Missing code', { status: 400 });
  }

  // Exchange code for token
  const tokenResponse = await fetch(GITHUB_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code: code,
    }),
  });

  const tokenData = await tokenResponse.json();

  if (tokenData.error) {
    return new Response(`OAuth error: ${tokenData.error_description}`, { status: 400 });
  }

  const accessToken = tokenData.access_token;

  // Get user info
  const userResponse = await fetch(`${GITHUB_API}/user`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'User-Agent': 'Context-Bridge',
    },
  });
  const user = await userResponse.json();

  // Create the gist
  const gistResponse = await fetch(`${GITHUB_API}/gists`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'User-Agent': 'Context-Bridge',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      description: 'My AI Context File - Context Bridge',
      public: false,
      files: {
        'CONTEXT.md': {
          content: DEFAULT_CONTEXT.replace('[Your name]', user.name || user.login),
        },
      },
    }),
  });

  const gist = await gistResponse.json();

  if (gist.id) {
    // Success! Redirect to success page with gist URL
    const rawUrl = gist.files['CONTEXT.md'].raw_url;
    const successUrl = `https://context-bridge.pages.dev/success.html?gist=${encodeURIComponent(gist.html_url)}&raw=${encodeURIComponent(rawUrl)}`;
    return Response.redirect(successUrl, 302);
  } else {
    return new Response(`Failed to create gist: ${JSON.stringify(gist)}`, { status: 500 });
  }
}

// Create gist with custom content (POST)
async function handleCreateGist(request, env) {
  if (request.method !== 'POST') {
    return new Response('POST required', { status: 405, headers: CORS_HEADERS });
  }

  const body = await request.json();
  const { token, content, filename = 'CONTEXT.md' } = body;

  if (!token || !content) {
    return new Response(JSON.stringify({ error: 'Missing token or content' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
    });
  }

  const gistResponse = await fetch(`${GITHUB_API}/gists`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'User-Agent': 'Context-Bridge',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      description: 'My AI Context File - Context Bridge',
      public: false,
      files: {
        [filename]: { content },
      },
    }),
  });

  const gist = await gistResponse.json();

  return new Response(JSON.stringify({
    success: !!gist.id,
    gist_url: gist.html_url,
    raw_url: gist.files?.[filename]?.raw_url,
    error: gist.message,
  }), {
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
  });
}
