/**
 * BlackRoad Deploy Dispatcher
 * Cloudflare Worker that receives GitHub webhooks
 * and dispatches deployments to appropriate Pi nodes
 *
 * Version: 1.0.0
 */

// Pi node registry with roles
const PI_NODES = {
  'lucidia-pi': {
    url: 'http://192.168.4.38:9001',
    role: 'ops',
    capabilities: ['frontend', 'build', 'cloudflare'],
  },
  'alice-pi': {
    url: 'http://192.168.4.49:9002',
    role: 'ops',
    capabilities: ['kubernetes', 'backend', 'api'],
  },
  'aria-pi': {
    url: 'http://192.168.4.64:9003',
    role: 'sim',
    capabilities: ['test', 'benchmark', 'simulation'],
  },
  'octavia-pi': {
    url: 'http://192.168.4.74:9004',
    role: 'holo',
    capabilities: ['3d', 'render', 'print'],
  },
};

// Task routing rules based on file patterns
const ROUTING_RULES = [
  {
    pattern: /^(src\/frontend|frontend|client|web)\//,
    nodes: ['lucidia-pi'],
    task: 'deploy-frontend',
  },
  {
    pattern: /^(src\/backend|backend|server|api)\//,
    nodes: ['alice-pi'],
    task: 'deploy-backend',
  },
  {
    pattern: /^(tests?|__tests__|spec)\//,
    nodes: ['aria-pi'],
    task: 'run-tests',
  },
  {
    pattern: /\.(stl|obj|3mf|gcode)$/,
    nodes: ['octavia-pi'],
    task: 'render-3d',
  },
  {
    pattern: /^(k8s|kubernetes)\//,
    nodes: ['alice-pi'],
    task: 'deploy-k8s',
  },
];

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

/**
 * Main request handler
 */
async function handleRequest(request) {
  const url = new URL(request.url);

  // Health check endpoint
  if (url.pathname === '/health') {
    return new Response(
      JSON.stringify({
        status: 'healthy',
        version: '1.0.0',
        nodes: Object.keys(PI_NODES),
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // GitHub webhook endpoint
  if (url.pathname === '/webhook/github' && request.method === 'POST') {
    return handleGitHubWebhook(request);
  }

  // Node status endpoint
  if (url.pathname === '/nodes/status') {
    return handleNodeStatus(request);
  }

  return new Response('Not Found', { status: 404 });
}

/**
 * Handle GitHub webhook
 */
async function handleGitHubWebhook(request) {
  try {
    // Verify GitHub signature (recommended)
    // const signature = request.headers.get('X-Hub-Signature-256');
    // if (!verifyGitHubSignature(signature, await request.text())) {
    //   return new Response('Unauthorized', { status: 401 });
    // }

    const payload = await request.json();

    // Only handle push events for now
    if (payload.ref && payload.commits) {
      const result = await handlePushEvent(payload);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ message: 'Event ignored' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Handle push event
 */
async function handlePushEvent(payload) {
  const repository = payload.repository.full_name;
  const branch = payload.ref.replace('refs/heads/', '');
  const commit = payload.after;
  const pusher = payload.pusher.name;

  console.log(`Push event: ${repository}@${branch} by ${pusher}`);

  // Analyze changed files
  const changedFiles = [];
  for (const commit of payload.commits) {
    changedFiles.push(...(commit.added || []));
    changedFiles.push(...(commit.modified || []));
    changedFiles.push(...(commit.removed || []));
  }

  // Determine which nodes should handle this deployment
  const deployments = routeDeployment(changedFiles);

  console.log(`Routing to ${deployments.length} node(s)`);

  // Dispatch to each node
  const results = await Promise.allSettled(
    deployments.map((deployment) =>
      deployToNode(deployment.node, {
        repository,
        branch,
        commit,
        task: deployment.task,
        files: deployment.files,
      })
    )
  );

  // Store deployment record in KV (optional)
  const deploymentId = `${repository}/${commit}`;
  // await DEPLOYMENTS.put(deploymentId, JSON.stringify({
  //   repository,
  //   branch,
  //   commit,
  //   timestamp: new Date().toISOString(),
  //   results: results.map(r => r.status),
  // }));

  return {
    success: true,
    repository,
    branch,
    commit,
    deployments: results.map((r, i) => ({
      node: deployments[i].node,
      task: deployments[i].task,
      status: r.status,
      result: r.status === 'fulfilled' ? r.value : r.reason,
    })),
  };
}

/**
 * Route deployment based on changed files
 */
function routeDeployment(changedFiles) {
  const deployments = new Map();

  for (const file of changedFiles) {
    for (const rule of ROUTING_RULES) {
      if (rule.pattern.test(file)) {
        for (const node of rule.nodes) {
          if (!deployments.has(node)) {
            deployments.set(node, {
              node,
              task: rule.task,
              files: [],
            });
          }
          deployments.get(node).files.push(file);
        }
      }
    }
  }

  // If no specific rules matched, deploy to lucidia-pi (primary)
  if (deployments.size === 0) {
    deployments.set('lucidia-pi', {
      node: 'lucidia-pi',
      task: 'deploy',
      files: changedFiles,
    });
  }

  return Array.from(deployments.values());
}

/**
 * Deploy to a specific Pi node
 */
async function deployToNode(nodeName, payload) {
  const node = PI_NODES[nodeName];
  if (!node) {
    throw new Error(`Unknown node: ${nodeName}`);
  }

  console.log(`Deploying to ${nodeName}: ${payload.task}`);

  // Send deployment request to Pi
  const response = await fetch(`${node.url}/deploy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Secret': WEBHOOK_SECRET || 'changeme',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Deployment to ${nodeName} failed: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Get status of all nodes
 */
async function handleNodeStatus(request) {
  const statusChecks = Object.entries(PI_NODES).map(async ([name, node]) => {
    try {
      const response = await fetch(`${node.url}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const health = await response.json();
        return { name, ...health, online: true };
      } else {
        return { name, online: false, error: response.statusText };
      }
    } catch (error) {
      return { name, online: false, error: error.message };
    }
  });

  const results = await Promise.allSettled(statusChecks);

  return new Response(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      nodes: results.map((r) => (r.status === 'fulfilled' ? r.value : { error: r.reason })),
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Verify GitHub webhook signature (recommended for production)
 */
async function verifyGitHubSignature(signature, body) {
  if (!signature) return false;

  const secret = GITHUB_WEBHOOK_SECRET || '';
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signed = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  const expectedSignature = `sha256=${Array.from(new Uint8Array(signed))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')}`;

  return signature === expectedSignature;
}
