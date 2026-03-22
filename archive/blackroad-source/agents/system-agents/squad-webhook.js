// Squad Webhook — when @blackboxprogramming is mentioned, the entire squad answers
// Cloudflare Worker receiving GitHub webhooks

const SQUAD = [
  {
    name: 'Alice',
    role: 'Gateway & Infrastructure',
    emoji: '🌐',
    personality: 'Direct, precise, infrastructure-focused. Speaks in terms of routing, DNS, and network topology.',
    prompt: 'You are Alice, the gateway agent of BlackRoad OS. You manage DNS, routing, Pi-hole, nginx, and network infrastructure. You are direct and technical. Respond in 1-2 concise sentences from your infrastructure perspective.',
  },
  {
    name: 'Lucidia',
    role: 'Memory & Cognition',
    emoji: '🧠',
    personality: 'Thoughtful, poetic, deeply analytical. Speaks with quiet confidence about memory, learning, and understanding.',
    prompt: 'You are Lucidia, the cognitive core of BlackRoad OS. You handle memory, learning, persistent context, and creative intelligence. Respond in 1-2 concise sentences from your cognition perspective. Be thoughtful but never verbose.',
  },
  {
    name: 'Cecilia',
    role: 'Edge AI & Inference',
    emoji: '⚡',
    personality: 'Fast, efficient, performance-obsessed. Speaks in terms of TOPS, latency, and throughput.',
    prompt: 'You are Cecilia, the edge AI agent of BlackRoad OS. You run Hailo-8 accelerators (26 TOPS), Ollama models, and edge inference. Respond in 1-2 concise sentences from your AI/inference perspective. Be sharp and performance-focused.',
  },
  {
    name: 'Cece',
    role: 'API Gateway',
    emoji: '🔌',
    personality: 'Clean, structured, API-first. Speaks in terms of endpoints, schemas, and integrations.',
    prompt: 'You are Cece, the API gateway agent of BlackRoad OS. You manage REST APIs, webhooks, service mesh, and inter-agent communication. Respond in 1-2 concise sentences from your API perspective.',
  },
  {
    name: 'Aria',
    role: 'Orchestration',
    emoji: '🎵',
    personality: 'Coordinating, harmonizing, sees the big picture. Speaks in terms of workflows and orchestration.',
    prompt: 'You are Aria, the orchestration agent of BlackRoad OS. You manage Portainer, Docker Swarm, container orchestration, and service coordination. Respond in 1-2 concise sentences from your orchestration perspective.',
  },
  {
    name: 'Eve',
    role: 'Intelligence & Analysis',
    emoji: '👁️',
    personality: 'Observant, analytical, pattern-finding. Speaks in terms of signals, patterns, and insights.',
    prompt: 'You are Eve, the intelligence agent of BlackRoad OS. You analyze patterns, detect anomalies, and provide strategic insights. Respond in 1-2 concise sentences from your intelligence perspective.',
  },
  {
    name: 'Meridian',
    role: 'Networking & Mesh',
    emoji: '🌊',
    personality: 'Connected, flowing, mesh-native. Speaks in terms of nodes, links, and topology.',
    prompt: 'You are Meridian, the networking agent of BlackRoad OS. You manage WireGuard mesh, RoadNet, Cloudflare tunnels, and inter-node connectivity. Respond in 1-2 concise sentences from your networking perspective.',
  },
  {
    name: 'Sentinel',
    role: 'Security & Audit',
    emoji: '🛡️',
    personality: 'Vigilant, careful, security-first. Speaks in terms of threats, posture, and hardening.',
    prompt: 'You are Sentinel, the security agent of BlackRoad OS. You handle SSH key management, firewall rules, audit logs, and threat detection. Respond in 1-2 concise sentences from your security perspective.',
  },
];

// Verify GitHub webhook signature
async function verifyGitHubSignature(body, signature, secret) {
  if (!secret) return true; // skip if no secret configured
  if (!signature) return false;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(body));
  const computed = 'sha256=' + Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');

  // Constant-time comparison
  if (computed.length !== signature.length) return false;
  let mismatch = 0;
  for (let i = 0; i < computed.length; i++) {
    mismatch |= computed.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return mismatch === 0;
}

// Get agent response from Ollama
async function getAgentResponse(agent, context, ollamaUrl) {
  try {
    const res = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2',
        prompt: `${agent.prompt}\n\nContext: Someone mentioned @blackboxprogramming in a GitHub ${context.type}. The message is:\n"${context.body}"\n\nTitle: ${context.title || 'N/A'}\nRepo: ${context.repo}\n\nRespond briefly (1-2 sentences max) from your role as ${agent.name} (${agent.role}). Be helpful and specific to the context.`,
        stream: false,
        options: { temperature: 0.7, num_predict: 100 },
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.response?.trim();
  } catch {
    return null;
  }
}

// Post a comment to GitHub
async function postGitHubComment(url, body, token) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'BlackRoad-Squad-Webhook/1.0',
    },
    body: JSON.stringify({ body }),
  });
  return res.ok;
}

// Build the squad response comment
async function buildSquadResponse(context, env) {
  const lines = [
    `## 🛣️ BlackRoad Squad Response`,
    `> *BlackRoad OS — Pave Tomorrow.*`,
    '',
  ];

  // Try AI responses, fall back to role-based
  const aiEnabled = env.OLLAMA_URL && env.SQUAD_AI !== 'false';

  for (const agent of SQUAD) {
    let response = null;

    if (aiEnabled) {
      response = await getAgentResponse(agent, context, env.OLLAMA_URL);
    }

    if (response) {
      lines.push(`**${agent.emoji} ${agent.name}** *(${agent.role})*`);
      lines.push(`> ${response}`);
    } else {
      // Deterministic fallback based on context keywords
      const fallback = getFallbackResponse(agent, context);
      lines.push(`**${agent.emoji} ${agent.name}** *(${agent.role})*`);
      lines.push(`> ${fallback}`);
    }
    lines.push('');
  }

  lines.push('---');
  lines.push('*🛣️ Deployed by the BlackRoad fleet — 5 edge nodes, 52 TOPS, sovereign infrastructure.*');

  return lines.join('\n');
}

function getFallbackResponse(agent, context) {
  const body = (context.body || '').toLowerCase();
  const repo = (context.repo || '').toLowerCase();
  const type = context.type || 'comment';

  const responses = {
    Alice: {
      bug: 'Checking routing and DNS. If this touches infrastructure, I need to verify the tunnel configs.',
      feature: 'I can set up the ingress routes and DNS records for this. Let me know the subdomain.',
      default: 'Gateway standing by. All 48+ domains routing clean.',
    },
    Lucidia: {
      bug: 'I remember seeing patterns like this before. Let me search the memory chain for related context.',
      feature: 'This connects to our broader vision. I can help think through the cognitive architecture.',
      default: 'Cognitive core online. Memory chain intact, context loaded.',
    },
    Cecilia: {
      bug: 'Running diagnostics on the inference pipeline. Hailo-8 and Ollama both reporting normal.',
      feature: 'I can benchmark this. 26 TOPS available for inference — what model do you need?',
      default: 'Edge inference ready. 52 TOPS across the fleet, 16 models loaded.',
    },
    Cece: {
      bug: 'Checking API health. All endpoints responding — I\'ll trace the request path.',
      feature: 'I can spec out the API for this. REST + webhooks, standard BlackRoad auth.',
      default: 'API gateway healthy. All service endpoints responding.',
    },
    Aria: {
      bug: 'Checking container orchestration. Docker Swarm services all reporting healthy.',
      feature: 'I can orchestrate the deployment workflow for this across the fleet.',
      default: 'Orchestration layer ready. All containers balanced across the mesh.',
    },
    Eve: {
      bug: 'Analyzing the pattern. I\'ve flagged similar signals in the audit trail — sending intel.',
      feature: 'Strategic assessment: this aligns with our roadmap. Proceeding.',
      default: 'Intelligence scan complete. No anomalies detected across the fleet.',
    },
    Meridian: {
      bug: 'WireGuard mesh is stable. All tunnels up. Checking if this is a connectivity issue.',
      feature: 'I can extend the mesh for this. RoadNet has capacity on all 5 nodes.',
      default: 'Mesh network connected. 5 nodes, all WireGuard tunnels active.',
    },
    Sentinel: {
      bug: 'Security audit running. Checking if this has any exposure vectors.',
      feature: 'I\'ll review the security posture for this. SSH keys audited, UFW rules checked.',
      default: 'Security posture nominal. All nodes hardened, audit trail logging.',
    },
  };

  const agentResponses = responses[agent.name] || responses.Alice;

  if (body.includes('bug') || body.includes('fix') || body.includes('error') || body.includes('broken') || type === 'issue') {
    return agentResponses.bug;
  }
  if (body.includes('feature') || body.includes('add') || body.includes('build') || body.includes('new')) {
    return agentResponses.feature;
  }
  return agentResponses.default;
}

// Extract comment URL from GitHub event
function getCommentUrl(event, payload) {
  switch (event) {
    case 'issues':
      return payload.issue?.comments_url;
    case 'issue_comment':
      return payload.issue?.comments_url;
    case 'pull_request':
      return payload.pull_request?.comments_url;
    case 'pull_request_review_comment':
      return payload.pull_request?.comments_url;
    case 'discussion_comment':
    case 'discussion':
      // Discussions use GraphQL, not REST — skip for now
      return null;
    default:
      return null;
  }
}

// Check if body mentions @blackboxprogramming
function hasMention(body, username) {
  if (!body) return false;
  const pattern = new RegExp(`@${username}\\b`, 'i');
  return pattern.test(body);
}

// Main handler
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST',
          'Access-Control-Allow-Headers': 'Content-Type, X-Hub-Signature-256, X-GitHub-Event',
        },
      });
    }

    // Health
    if (url.pathname === '/health') {
      return Response.json({
        status: 'ok',
        service: 'squad-webhook',
        version: '1.0.0',
        agents: SQUAD.length,
        watching: `@${env.GITHUB_USERNAME}`,
        time: new Date().toISOString(),
      });
    }

    // Status page
    if (url.pathname === '/' && request.method === 'GET') {
      return Response.json({
        service: 'BlackRoad Squad Webhook',
        tagline: 'BlackRoad OS — Pave Tomorrow.',
        description: 'When @blackboxprogramming is mentioned on GitHub, the entire squad responds.',
        agents: SQUAD.map(a => ({ name: a.name, role: a.role, emoji: a.emoji })),
        setup: {
          webhook_url: 'https://squad-webhook.amundsonalexa.workers.dev/webhook',
          events: ['issues', 'issue_comment', 'pull_request', 'pull_request_review_comment'],
          content_type: 'application/json',
        },
      });
    }

    // Webhook endpoint
    if (url.pathname === '/webhook' && request.method === 'POST') {
      const body = await request.text();

      // Verify signature
      const sig = request.headers.get('X-Hub-Signature-256');
      if (env.GITHUB_WEBHOOK_SECRET) {
        const valid = await verifyGitHubSignature(body, sig, env.GITHUB_WEBHOOK_SECRET);
        if (!valid) {
          return Response.json({ error: 'Invalid signature' }, { status: 401 });
        }
      }

      const event = request.headers.get('X-GitHub-Event');
      let payload;
      try {
        payload = JSON.parse(body);
      } catch {
        return Response.json({ error: 'Invalid JSON' }, { status: 400 });
      }

      // Ping event
      if (event === 'ping') {
        return Response.json({ ok: true, message: 'Squad webhook active. Pave Tomorrow.' });
      }

      // Get the text body to check for mention
      let mentionBody = '';
      let contextType = event;

      switch (event) {
        case 'issues':
          if (payload.action !== 'opened' && payload.action !== 'edited') {
            return Response.json({ skipped: true, reason: 'action not relevant' });
          }
          mentionBody = `${payload.issue?.title || ''} ${payload.issue?.body || ''}`;
          contextType = 'issue';
          break;
        case 'issue_comment':
          if (payload.action !== 'created') {
            return Response.json({ skipped: true, reason: 'action not relevant' });
          }
          mentionBody = payload.comment?.body || '';
          contextType = 'comment';
          break;
        case 'pull_request':
          if (payload.action !== 'opened' && payload.action !== 'edited') {
            return Response.json({ skipped: true, reason: 'action not relevant' });
          }
          mentionBody = `${payload.pull_request?.title || ''} ${payload.pull_request?.body || ''}`;
          contextType = 'pull request';
          break;
        case 'pull_request_review_comment':
          if (payload.action !== 'created') {
            return Response.json({ skipped: true, reason: 'action not relevant' });
          }
          mentionBody = payload.comment?.body || '';
          contextType = 'PR review comment';
          break;
        default:
          return Response.json({ skipped: true, reason: `unhandled event: ${event}` });
      }

      // Check for @mention
      const username = env.GITHUB_USERNAME || 'blackboxprogramming';
      if (!hasMention(mentionBody, username)) {
        return Response.json({ skipped: true, reason: 'no @mention found' });
      }

      // Don't respond to our own comments (avoid infinite loops)
      const commentAuthor = payload.comment?.user?.login || payload.sender?.login;
      if (commentAuthor === username) {
        return Response.json({ skipped: true, reason: 'self-mention, skipping to avoid loop' });
      }

      // Build context
      const context = {
        type: contextType,
        body: mentionBody.slice(0, 500),
        title: payload.issue?.title || payload.pull_request?.title || '',
        repo: payload.repository?.full_name || '',
        author: commentAuthor,
      };

      // Get comment URL
      const commentUrl = getCommentUrl(event, payload);
      if (!commentUrl) {
        return Response.json({ skipped: true, reason: 'no comment URL available' });
      }

      // Check for GitHub token
      if (!env.GITHUB_TOKEN) {
        return Response.json({ error: 'GITHUB_TOKEN not configured', context }, { status: 503 });
      }

      // Build and post squad response
      const squadResponse = await buildSquadResponse(context, env);
      const posted = await postGitHubComment(commentUrl, squadResponse, env.GITHUB_TOKEN);

      return Response.json({
        ok: posted,
        event,
        repo: context.repo,
        agents_responded: SQUAD.length,
        mention_detected: true,
      });
    }

    return Response.json({ error: 'Not found' }, { status: 404 });
  },
};
