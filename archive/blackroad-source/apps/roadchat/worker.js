// ── BlackRoad Chat v2 — AI Chat + Tasks + Multi-AI + Memory ──
// Streaming chat with Ollama, task handoff, background work, notifications

const MODELS = [
  { id: 'llama3.2:3b', name: 'Llama 3.2 3B', desc: 'Fast + smart (default)', code: false, role: 'general' },
  { id: 'tinyllama:latest', name: 'TinyLlama', desc: 'Instant replies', code: false, role: 'quick' },
  { id: 'qwen2.5-coder:3b', name: 'Qwen Coder 3B', desc: 'Fast code generation', code: true, role: 'coder' },
  { id: 'deepseek-coder:1.3b', name: 'DeepSeek Coder 1.3B', desc: 'Lightweight code', code: true, role: 'coder' },
  { id: 'qwen3:8b', name: 'Qwen 3 8B', desc: 'Best reasoning (slower)', code: true, role: 'reasoning' },
  { id: 'codellama:7b', name: 'Code Llama 7B', desc: 'Meta code specialist', code: true, role: 'coder' },
  { id: 'llama3:8b-instruct-q4_K_M', name: 'Llama 3 8B', desc: 'General chat', code: false, role: 'general' },
  { id: 'deepseek-r1:1.5b', name: 'DeepSeek R1 1.5B', desc: 'Reasoning', code: false, role: 'reasoning' },
  { id: 'cece:latest', name: 'CECE', desc: 'BlackRoad custom agent', code: false, role: 'agent' },
];

// AI pipelines — chain models for complex tasks
const PIPELINES = {
  'plan-and-code': {
    name: 'Plan → Code',
    desc: 'Reason through the problem, then generate code',
    steps: [
      { model: 'qwen3:8b', role: 'planner', prompt: 'Break this task into clear steps. Output a numbered plan. Task: {input}' },
      { model: 'qwen2.5-coder:3b', role: 'coder', prompt: 'Implement the following plan in code:\n\n{prev}\n\nOriginal request: {input}' },
    ],
  },
  'code-review': {
    name: 'Code → Review',
    desc: 'Generate code then review it for bugs',
    steps: [
      { model: 'qwen2.5-coder:3b', role: 'coder', prompt: '{input}' },
      { model: 'qwen3:8b', role: 'reviewer', prompt: 'Review this code for bugs, security issues, and improvements. Be specific.\n\n{prev}' },
    ],
  },
  'research': {
    name: 'Think → Summarize',
    desc: 'Deep reasoning then concise summary',
    steps: [
      { model: 'qwen3:8b', role: 'researcher', prompt: 'Think deeply about this. Consider multiple angles and edge cases: {input}' },
      { model: 'llama3.2:3b', role: 'summarizer', prompt: 'Summarize the key findings concisely in bullet points:\n\n{prev}' },
    ],
  },
  'reflect': {
    name: 'Generate → Critique → Improve',
    desc: 'Self-reflection loop: generate, critique, then improve',
    steps: [
      { model: 'qwen3:8b', role: 'generator', prompt: '{input}' },
      { model: 'llama3.2:3b', role: 'critic', prompt: 'Critique this response. Find weaknesses, errors, missing points, and areas for improvement. Be specific and harsh:\n\n{prev}\n\nOriginal question: {input}' },
      { model: 'qwen3:8b', role: 'improver', prompt: 'Improve the original response based on this critique. Fix all issues mentioned. Output ONLY the improved response, not the critique.\n\nOriginal response:\n{steps[0]}\n\nCritique:\n{prev}\n\nOriginal question: {input}' },
    ],
  },
  'verify': {
    name: 'Reason → Verify',
    desc: 'Chain-of-thought reasoning with independent verification',
    steps: [
      { model: 'deepseek-r1:1.5b', role: 'reasoner', prompt: 'Think step by step. Show your reasoning process clearly for: {input}' },
      { model: 'qwen3:8b', role: 'verifier', prompt: 'Verify this chain-of-thought reasoning. Check each step for logical errors, incorrect assumptions, or wrong conclusions. Mark each step as CORRECT or INCORRECT with explanation:\n\n{prev}\n\nOriginal question: {input}' },
    ],
  },
  'red-team': {
    name: 'Build → Attack → Harden',
    desc: 'Write code, red-team it for vulnerabilities, then harden',
    steps: [
      { model: 'qwen2.5-coder:3b', role: 'builder', prompt: '{input}' },
      { model: 'qwen3:8b', role: 'attacker', prompt: 'You are a security researcher. Find ALL vulnerabilities in this code: injection, XSS, auth bypass, race conditions, data leaks, SSRF, etc. For each vuln, show a proof-of-concept exploit:\n\n{prev}' },
      { model: 'qwen2.5-coder:3b', role: 'hardener', prompt: 'Fix ALL the security vulnerabilities found below. Output the complete hardened code with comments explaining each fix.\n\nOriginal code:\n{steps[0]}\n\nVulnerabilities found:\n{prev}' },
    ],
  },
};

// ── Mixture of Agents (MoA) ──
// Multiple models answer in parallel, then an aggregator synthesizes the best response
async function runMoA(env, prompt, models = null) {
  const moaModels = models || ['qwen3:8b', 'llama3.2:3b', 'qwen2.5-coder:3b'];
  const memCtx = await loadMemoryContext(env);

  // Phase 1: Run all models in parallel (sequential on Pi to avoid OOM)
  const responses = [];
  for (const model of moaModels) {
    const content = await runModel(env, model, [
      { role: 'system', content: `You are one of several AI models answering this question. Give your best, most accurate response. Be concise.\n${memCtx}` },
      { role: 'user', content: prompt },
    ]);
    responses.push({ model, content: stripActions(content) });
  }

  // Phase 2: Aggregator synthesizes the best response
  const aggregatorPrompt = `You are an AI aggregator. Multiple models answered the same question. Synthesize the BEST possible response by:
1. Taking the strongest points from each
2. Resolving any contradictions (pick the most accurate)
3. Adding anything important that all models missed
4. Outputting one clean, unified response

Question: ${prompt}

${responses.map((r, i) => `--- Model ${i + 1} (${r.model}) ---\n${r.content}`).join('\n\n')}

--- Your synthesized response (do not mention the models, just give the best answer): ---`;

  const synthesis = await runModel(env, 'qwen3:8b', [
    { role: 'system', content: 'You are an expert synthesizer. Combine multiple AI responses into one superior answer.' },
    { role: 'user', content: aggregatorPrompt },
  ]);

  return { responses, synthesis: stripActions(synthesis), models: moaModels };
}

// ── Consensus Voting ──
// Run multiple models, have them vote on the best answer
async function runConsensus(env, prompt) {
  const models = ['qwen3:8b', 'llama3.2:3b', 'deepseek-r1:1.5b'];
  const memCtx = await loadMemoryContext(env);

  // Get answers from all models
  const answers = [];
  for (const model of models) {
    const content = await runModel(env, model, [
      { role: 'system', content: `Answer concisely and accurately.\n${memCtx}` },
      { role: 'user', content: prompt },
    ]);
    answers.push({ model, content: stripActions(content) });
  }

  // Have each model vote on which answer is best (excluding their own)
  const votes = {};
  for (let i = 0; i < answers.length; i++) {
    const others = answers.filter((_, j) => j !== i);
    const votePrompt = `Which answer is better? Reply with ONLY "A" or "B".\n\nQuestion: ${prompt}\n\nAnswer A:\n${others[0].content}\n\nAnswer B:\n${others[1].content}`;
    const vote = await runModel(env, answers[i].model, [
      { role: 'system', content: 'You are a judge. Pick the better answer. Reply ONLY with the letter A or B.' },
      { role: 'user', content: votePrompt },
    ]);
    const pick = vote.trim().toUpperCase().includes('A') ? 0 : 1;
    const votedFor = others[pick].model;
    votes[votedFor] = (votes[votedFor] || 0) + 1;
  }

  // Find winner
  const winner = Object.entries(votes).sort((a, b) => b[1] - a[1])[0];
  const winnerAnswer = answers.find(a => a.model === winner?.[0]) || answers[0];

  return { answers, votes, winner: winnerAnswer };
}

// ── Smart Auto-Router ──
// Classify user intent and route to the best model automatically
async function autoRoute(env, prompt) {
  const classifyPrompt = `Classify this user message into EXACTLY ONE category. Reply with ONLY the category word:
- CODE: wants code written, debugging, programming
- REASON: needs deep thinking, math, logic, analysis
- QUICK: simple question, greeting, short answer
- CREATIVE: brainstorming, writing, ideas
- REVIEW: wants code reviewed, audited, improved

Message: "${prompt.slice(0, 200)}"

Category:`;

  const category = await runModel(env, 'tinyllama:latest', [
    { role: 'system', content: 'You are a classifier. Reply with ONLY one word.' },
    { role: 'user', content: classifyPrompt },
  ]);

  const cat = category.trim().toUpperCase();
  const routing = {
    'CODE': 'qwen2.5-coder:3b',
    'REASON': 'qwen3:8b',
    'QUICK': 'llama3.2:3b',
    'CREATIVE': 'llama3.2:3b',
    'REVIEW': 'qwen3:8b',
  };

  return routing[cat] || 'llama3.2:3b';
}

// ── Embeddings (via Ollama nomic-embed-text) ──
async function getEmbedding(env, text) {
  const res = await fetch(`${env.OLLAMA_URL}/api/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'nomic-embed-text', prompt: text }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.embedding;
}

// ── Semantic Memory Search ──
// Store memories with embeddings, search by similarity
async function semanticMemorySave(env, key, value) {
  await memorySet(env, key, value);
  // Generate and store embedding
  const embedding = await getEmbedding(env, `${key}: ${value}`);
  if (embedding) {
    await env.MEMORY.put(`emb:${key}`, JSON.stringify(embedding));
  }
}

async function semanticMemorySearch(env, query, topK = 5) {
  const queryEmb = await getEmbedding(env, query);
  if (!queryEmb) return [];

  // Get all embeddings
  const embKeys = await env.MEMORY.list({ prefix: 'emb:' });
  const results = [];

  for (const k of embKeys.keys.slice(0, 50)) {
    const memKey = k.name.replace('emb:', '');
    const embRaw = await env.MEMORY.get(k.name);
    if (!embRaw) continue;
    const emb = JSON.parse(embRaw);
    const sim = cosineSim(queryEmb, emb);
    const value = await memoryGet(env, memKey);
    results.push({ key: memKey, value, similarity: sim });
  }

  return results.sort((a, b) => b.similarity - a.similarity).slice(0, topK);
}

function cosineSim(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

// ── Web Search (DuckDuckGo Instant Answer API) ──
async function webSearch(query) {
  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return { results: [], error: 'search failed' };
    const data = await res.json();
    const results = [];

    if (data.AbstractText) {
      results.push({ title: data.Heading || query, snippet: data.AbstractText, url: data.AbstractURL || '', source: data.AbstractSource || 'DuckDuckGo' });
    }
    if (data.Answer) {
      results.push({ title: 'Direct Answer', snippet: data.Answer, url: '', source: 'DuckDuckGo' });
    }
    for (const topic of (data.RelatedTopics || []).slice(0, 5)) {
      if (topic.Text) {
        results.push({ title: topic.Text.slice(0, 80), snippet: topic.Text, url: topic.FirstURL || '', source: 'DuckDuckGo' });
      }
    }
    return { results, query };
  } catch (e) {
    return { results: [], error: e.message };
  }
}

// ── Agent Daemon (remote shell, files, git on Pi fleet) ──
const AGENT_URL = 'https://agents.blackroad.io';

async function agentFetch(path, body = null) {
  const opts = { headers: { 'Content-Type': 'application/json' } };
  if (body) { opts.method = 'POST'; opts.body = JSON.stringify(body); }
  opts.signal = AbortSignal.timeout(30000);
  const res = await fetch(`${AGENT_URL}${path}`, opts);
  if (!res.ok) throw new Error(`Agent ${res.status}: ${await res.text()}`);
  return res.json();
}

async function executeCode(env, language, code) {
  try {
    return await agentFetch('/exec', { language, code, timeout: 15 });
  } catch (e) {
    return { output: null, error: `Agent daemon unavailable: ${e.message}`, simulated: true };
  }
}

async function agentShell(command, cwd) {
  return agentFetch('/exec', { command, cwd, timeout: 30 });
}

async function agentFileRead(path) {
  return agentFetch('/file/read', { path });
}

async function agentFileWrite(path, content) {
  return agentFetch('/file/write', { path, content });
}

async function agentFileEdit(path, old_string, new_string) {
  return agentFetch('/file/edit', { path, old_string, new_string });
}

async function agentSearch(pattern, directory) {
  return agentFetch('/search', { pattern, directory });
}

async function agentGlob(pattern, directory) {
  return agentFetch('/glob', { pattern, directory });
}

async function agentGit(repo, op, args) {
  return agentFetch('/git', { repo, op, args });
}

// ── Suggested Follow-ups ──
async function generateFollowUps(env, conversation) {
  const lastExchange = conversation.slice(-4).map(m => `${m.role}: ${m.content.slice(0, 200)}`).join('\n');
  const result = await runModel(env, 'tinyllama:latest', [
    { role: 'system', content: 'Generate exactly 3 follow-up questions the user might ask next. Output ONLY a JSON array of 3 short strings. No markdown.' },
    { role: 'user', content: `Based on this conversation, suggest 3 follow-up questions:\n\n${lastExchange}` },
  ]);
  try {
    return JSON.parse(result.replace(/```json?\n?/g, '').replace(/```/g, '').trim());
  } catch {
    return result.split('\n').filter(l => l.trim()).slice(0, 3).map(l => l.replace(/^\d+\.\s*/, '').replace(/^["']|["']$/g, '').trim());
  }
}

// ── Custom Personas ──
async function getPersona(env, name) {
  const raw = await env.MEMORY.get(`persona:${name}`);
  return raw ? JSON.parse(raw) : null;
}

async function savePersona(env, name, config) {
  await env.MEMORY.put(`persona:${name}`, JSON.stringify({ ...config, name, updated: Date.now() }));
  // Update persona index
  const idx = JSON.parse(await env.MEMORY.get('persona:index') || '[]');
  if (!idx.includes(name)) { idx.push(name); await env.MEMORY.put('persona:index', JSON.stringify(idx)); }
}

async function listPersonas(env) {
  return JSON.parse(await env.MEMORY.get('persona:index') || '[]');
}

// ── Conversation Sharing ──
async function shareConversation(env, messages, title) {
  const id = genId();
  const share = { id, title, messages, created: Date.now(), views: 0 };
  await env.MEMORY.put(`share:${id}`, JSON.stringify(share));
  return id;
}

const SYSTEM_PROMPT = `You are BlackRoad AI, a helpful coding assistant running on the BlackRoad edge AI fleet.
You have deep knowledge of programming, systems, and infrastructure.
When writing code, always use markdown code blocks with language tags. Be concise and direct.
The fleet runs on Raspberry Pi 5s with Hailo-8 AI acceleration, Cloudflare Workers, and a mesh compute network.

You can take DIRECT actions by including action tags in your responses. These execute automatically:
${ACTION_INSTRUCTIONS}

When users ask you to remember, track, or do something — DO IT with actions. Don't just suggest commands.
If a task needs a specialist (e.g., complex code needs a coder model, architecture needs a reasoning model), hand off with [ACTION:handoff].`;

function escapeHtml(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ── Task System ──
async function taskCreate(env, task) {
  const id = genId();
  const record = {
    id, ...task,
    status: task.status || 'pending',
    created: Date.now(),
    updated: Date.now(),
    subtasks: task.subtasks || [],
    history: [{ action: 'created', at: Date.now() }],
  };
  await env.TASKS.put(`task:${id}`, JSON.stringify(record));
  // Update index
  const idx = JSON.parse(await env.TASKS.get('task:index') || '[]');
  idx.unshift(id);
  await env.TASKS.put('task:index', JSON.stringify(idx));
  return record;
}

async function taskList(env) {
  const idx = JSON.parse(await env.TASKS.get('task:index') || '[]');
  const tasks = [];
  for (const id of idx.slice(0, 50)) {
    const t = await env.TASKS.get(`task:${id}`);
    if (t) tasks.push(JSON.parse(t));
  }
  return tasks;
}

async function taskGet(env, id) {
  const t = await env.TASKS.get(`task:${id}`);
  return t ? JSON.parse(t) : null;
}

async function taskUpdate(env, id, updates) {
  const t = await taskGet(env, id);
  if (!t) return null;
  Object.assign(t, updates, { updated: Date.now() });
  t.history.push({ action: 'updated', fields: Object.keys(updates), at: Date.now() });
  await env.TASKS.put(`task:${id}`, JSON.stringify(t));
  return t;
}

// ── Memory System ──
async function memorySet(env, key, value) {
  await env.MEMORY.put(`mem:${key}`, JSON.stringify({ value, updated: Date.now() }));
}

async function memoryGet(env, key) {
  const v = await env.MEMORY.get(`mem:${key}`);
  return v ? JSON.parse(v).value : null;
}

async function memoryList(env) {
  const list = await env.MEMORY.list({ prefix: 'mem:' });
  return list.keys.map(k => k.name.replace('mem:', ''));
}

// ── Memory Context Loader ──
// Loads all memories + active tasks into a context string for AI injection
async function loadMemoryContext(env) {
  let ctx = '';
  try {
    const keys = await memoryList(env);
    if (keys.length) {
      const entries = [];
      for (const key of keys.slice(0, 20)) {
        const val = await memoryGet(env, key);
        if (val) entries.push(`  ${key}: ${typeof val === 'string' ? val.slice(0, 200) : JSON.stringify(val).slice(0, 200)}`);
      }
      ctx += `\n\n[SHARED MEMORY]\n${entries.join('\n')}`;
    }
  } catch {}
  try {
    const tasks = await taskList(env);
    const active = tasks.filter(t => t.status !== 'done').slice(0, 10);
    if (active.length) {
      const lines = active.map(t => {
        let line = `  [${t.status}] ${t.title} (${t.id})`;
        if (t.subtasks?.length) {
          const done = t.subtasks.filter(s => s.done).length;
          line += ` — ${done}/${t.subtasks.length} subtasks`;
        }
        return line;
      });
      ctx += `\n\n[ACTIVE TASKS]\n${lines.join('\n')}`;
    }
  } catch {}
  return ctx;
}

// ── Action System ──
// Agents can emit actions in their responses to make changes directly.
// Format: [ACTION:type:param1:param2:...]
// The system parses and executes these after each response.
const ACTION_INSTRUCTIONS = `
You can take actions directly by including action tags in your response. Actions are executed automatically:

[ACTION:memory_save:key:value] — Save something to shared memory
[ACTION:memory_delete:key] — Remove a memory
[ACTION:task_create:title] — Create a new task
[ACTION:task_done:id] — Mark a task complete
[ACTION:task_plan:description] — Create a task with AI-generated subtasks
[ACTION:notify:message] — Send a Slack notification
[ACTION:handoff:model_id:prompt] — Hand off to a specialist AI model

Examples:
- "I'll save that for later. [ACTION:memory_save:api_endpoint:https://api.example.com/v2]"
- "Let me create a task for this. [ACTION:task_create:Build user auth system with JWT]"
- "This needs a code specialist. [ACTION:handoff:qwen2.5-coder:3b:Write the auth middleware]"
- "All done! [ACTION:task_done:m3k9x2] [ACTION:notify:Auth system is complete]"

You can include multiple actions in one response. Always explain what you're doing alongside the actions.`;

async function executeActions(env, text) {
  const actionRegex = /\[ACTION:([^\]]+)\]/g;
  const results = [];
  let match;
  while ((match = actionRegex.exec(text)) !== null) {
    const parts = match[1].split(':');
    const type = parts[0];
    try {
      switch (type) {
        case 'memory_save': {
          const key = parts[1];
          const value = parts.slice(2).join(':');
          if (key && value) {
            await memorySet(env, key, value);
            results.push({ type, key, status: 'saved' });
          }
          break;
        }
        case 'memory_delete': {
          const key = parts[1];
          if (key) {
            await env.MEMORY.delete(`mem:${key}`);
            results.push({ type, key, status: 'deleted' });
          }
          break;
        }
        case 'task_create': {
          const title = parts.slice(1).join(':');
          if (title) {
            const task = await taskCreate(env, { title, type: 'task' });
            results.push({ type, id: task.id, title, status: 'created' });
          }
          break;
        }
        case 'task_done': {
          const id = parts[1];
          if (id) {
            const task = await taskUpdate(env, id, { status: 'done' });
            if (task) {
              await sendSlackNotification(env, `Task completed by AI: *${task.title}*`, ':white_check_mark:');
              results.push({ type, id, status: 'completed' });
            }
          }
          break;
        }
        case 'task_plan': {
          const desc = parts.slice(1).join(':');
          if (desc) {
            const planResult = await runModel(env, 'qwen3:8b', [
              { role: 'system', content: 'You output only valid JSON arrays of strings. No markdown, no explanation.' },
              { role: 'user', content: `Break this task into 3-7 concrete subtasks. Output ONLY a JSON array. Task: ${desc}` },
            ]);
            let subtasks = [];
            try {
              subtasks = JSON.parse(planResult.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
            } catch { subtasks = planResult.split('\n').filter(l => l.trim()).map(l => l.replace(/^\d+\.\s*/, '').trim()); }
            const task = await taskCreate(env, { title: desc, type: 'plan', subtasks: subtasks.map((s, i) => ({ id: i + 1, title: s, done: false })) });
            results.push({ type, id: task.id, subtasks: subtasks.length, status: 'planned' });
          }
          break;
        }
        case 'notify': {
          const msg = parts.slice(1).join(':');
          if (msg) {
            await sendSlackNotification(env, msg, ':robot_face:');
            results.push({ type, status: 'sent' });
          }
          break;
        }
        case 'handoff': {
          const model = parts.slice(1, -1).join(':');
          const prompt = parts[parts.length - 1];
          if (model && prompt) {
            results.push({ type, model, prompt, status: 'queued' });
          }
          break;
        }
      }
    } catch (e) {
      results.push({ type, status: 'error', error: e.message });
    }
  }
  return results;
}

// Strip action tags from display text
function stripActions(text) {
  return text.replace(/\[ACTION:[^\]]+\]/g, '').replace(/\n{3,}/g, '\n\n').trim();
}

// ── Notification System ──
async function sendSlackNotification(env, message, emoji = ':robot_face:') {
  const webhookUrl = await env.MEMORY.get('config:slack_webhook');
  if (!webhookUrl) return { sent: false, reason: 'no webhook configured' };
  const payload = JSON.stringify({
    blocks: [
      { type: 'section', text: { type: 'mrkdwn', text: `${emoji} *BlackRoad Chat*\n${message}` } },
      { type: 'context', elements: [{ type: 'mrkdwn', text: `${new Date().toISOString()} | chat.blackroad.io` }] },
    ],
  });
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload,
    });
    return { sent: res.ok };
  } catch (e) {
    return { sent: false, reason: e.message };
  }
}

// ── Group Chat Presets ──
const GROUP_PRESETS = {
  'dev-team': {
    name: 'Dev Team',
    desc: 'Architect + Coder + Reviewer working together',
    members: [
      { model: 'qwen3:8b', name: 'Architect', color: '#8844FF', system: 'You are the Architect. You focus on system design, architecture decisions, and high-level planning. Be concise. Address other team members by name when responding to their points.' },
      { model: 'qwen2.5-coder:3b', name: 'Coder', color: '#00D4FF', system: 'You are the Coder. You focus on implementation, writing clean code, and practical solutions. Be concise. Address other team members by name when responding to their points.' },
      { model: 'llama3.2:3b', name: 'Reviewer', color: '#FF6B2B', system: 'You are the Reviewer. You focus on finding bugs, security issues, edge cases, and suggesting improvements. Be concise. Address other team members by name when responding to their points.' },
    ],
  },
  'debate': {
    name: 'Debate',
    desc: 'Two AIs argue different perspectives',
    members: [
      { model: 'qwen3:8b', name: 'Pro', color:'rgba(255,255,255,0.8)', system: 'You are arguing FOR the topic. Present strong arguments in favor. Be persuasive and concise. Respond to Counter\'s points directly.' },
      { model: 'llama3.2:3b', name: 'Counter', color:'rgba(255,100,100,0.9)', system: 'You are arguing AGAINST the topic. Present strong counterarguments. Be persuasive and concise. Respond to Pro\'s points directly.' },
    ],
  },
  'brainstorm': {
    name: 'Brainstorm',
    desc: 'Creative + Technical + Critic ideation',
    members: [
      { model: 'llama3.2:3b', name: 'Creative', color: '#FF2255', system: 'You are the Creative thinker. Generate wild, innovative ideas. Think outside the box. Be concise.' },
      { model: 'qwen2.5-coder:3b', name: 'Builder', color: '#4488FF', system: 'You are the Builder. Take ideas and figure out how to actually implement them technically. Be practical and concise.' },
      { model: 'qwen3:8b', name: 'Critic', color:'rgba(255,200,100,0.9)', system: 'You are the Critic. Evaluate ideas for feasibility, find holes, and rank them. Be honest and concise.' },
    ],
  },
  'fullstack': {
    name: 'Full Stack',
    desc: 'Frontend + Backend + DevOps collaboration',
    members: [
      { model: 'qwen2.5-coder:3b', name: 'Frontend', color: '#00D4FF', system: 'You are the Frontend developer. Focus on UI/UX, React/HTML/CSS, client-side concerns. Be concise.' },
      { model: 'codellama:7b', name: 'Backend', color: '#8844FF', system: 'You are the Backend developer. Focus on APIs, databases, server logic, performance. Be concise.' },
      { model: 'llama3.2:3b', name: 'DevOps', color:'rgba(255,255,255,0.8)', system: 'You are the DevOps engineer. Focus on deployment, CI/CD, infrastructure, monitoring. Be concise.' },
    ],
  },
};

// ── Group Chat Runner ──
async function runGroupChat(env, groupName, prompt, rounds = 1) {
  const group = GROUP_PRESETS[groupName];
  if (!group) throw new Error(`Unknown group: ${groupName}`);

  const memCtx = await loadMemoryContext(env);
  const transcript = [];
  const actionLog = [];

  for (let round = 0; round < rounds; round++) {
    for (const member of group.members) {
      const systemContent = `${member.system}

You are in a group chat with: ${group.members.filter(m => m.name !== member.name).map(m => m.name).join(', ')}.
Keep responses under 200 words.

You have access to shared memory and can take direct actions:
${ACTION_INSTRUCTIONS}
${memCtx}`;

      const userContent = transcript.length === 0
        ? prompt
        : `${prompt}\n\n--- Conversation so far ---\n${transcript.map(t => `**${t.name}:** ${t.content}`).join('\n\n')}\n\n--- Your turn, ${member.name}. Respond to the conversation above. If you need to save decisions, create tasks, or hand off work, use actions. ---`;

      const messages = [
        { role: 'system', content: systemContent },
        { role: 'user', content: userContent },
      ];

      const rawContent = await runModel(env, member.model, messages, { executeActs: true });
      const content = stripActions(rawContent);

      // Log any actions this agent took
      const actions = await executeActions(env, rawContent);
      if (actions.length) {
        actionLog.push({ agent: member.name, actions });
      }

      // Handle handoff actions — run the specialist and add their response to transcript
      for (const a of actions.filter(r => r.type === 'handoff' && r.status === 'queued')) {
        const specialistModel = MODELS.find(m => m.id === a.model || m.id.startsWith(a.model));
        if (specialistModel) {
          const handoffContent = await runModel(env, specialistModel.id, [
            { role: 'system', content: `You are a specialist AI (${specialistModel.name}). You were called in by ${member.name} to help. Be concise and focused.\n${ACTION_INSTRUCTIONS}${memCtx}` },
            { role: 'user', content: a.prompt },
          ], { executeActs: true });
          transcript.push({
            name: `${specialistModel.name} (via ${member.name})`,
            model: specialistModel.id,
            color: '#CC00AA',
            content: stripActions(handoffContent),
            round: round + 1,
            handoff: true,
          });
        }
      }

      transcript.push({ name: member.name, model: member.model, color: member.color, content, round: round + 1 });
    }
  }

  return { group: groupName, groupInfo: group, transcript, prompt, actionLog };
}

// ── AI Pipeline Runner (non-streaming, for background/handoff) ──
async function runModel(env, model, messages, { injectMemory = false, executeActs = false } = {}) {
  // Optionally inject memory context into the system message
  if (injectMemory) {
    const memCtx = await loadMemoryContext(env);
    if (memCtx && messages.length > 0 && messages[0].role === 'system') {
      messages = [...messages];
      messages[0] = { ...messages[0], content: messages[0].content + memCtx };
    }
  }

  const res = await fetch(`${env.OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model, messages, stream: false, keep_alive: -1,
      options: { num_predict: 512, num_ctx: 4096 },
    }),
  });
  if (!res.ok) throw new Error(`Model ${model} error: ${res.status}`);
  const data = await res.json();
  let content = data.message?.content || '';

  // Execute any actions the AI embedded in its response
  if (executeActs) {
    const actionResults = await executeActions(env, content);
    // Process handoff actions — run the specialist and append results
    for (const a of actionResults.filter(r => r.type === 'handoff' && r.status === 'queued')) {
      const handoffResult = await runModel(env, a.model, [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: a.prompt },
      ], { injectMemory: true, executeActs: true });
      content += `\n\n---\n**Handoff to ${a.model}:**\n${handoffResult}`;
    }
  }

  return content;
}

async function runPipeline(env, pipelineName, input) {
  const pipeline = PIPELINES[pipelineName];
  if (!pipeline) throw new Error(`Unknown pipeline: ${pipelineName}`);

  const results = [];
  let prev = '';
  for (const step of pipeline.steps) {
    let prompt = step.prompt
      .replace(/\{input\}/g, input)
      .replace(/\{prev\}/g, prev);
    // Support {steps[N]} to reference earlier step outputs
    prompt = prompt.replace(/\{steps\[(\d+)\]\}/g, (_, idx) => {
      const i = parseInt(idx);
      return results[i]?.content || '';
    });
    const rawContent = await runModel(env, step.model, [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ], { injectMemory: true, executeActs: true });
    const content = stripActions(rawContent);
    results.push({ model: step.model, role: step.role, content });
    prev = content;
  }
  return results;
}

// ── Command Parser ──
function parseCommand(text) {
  const t = text.trim();
  if (!t.startsWith('/')) return null;
  const parts = t.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);
  const rest = args.join(' ');
  return { cmd, args, rest };
}

// ── Command Handler ──
async function handleCommand(env, parsed) {
  const { cmd, args, rest } = parsed;

  if (cmd === '/task') {
    const sub = args[0];
    if (sub === 'add' || sub === 'create') {
      const desc = args.slice(1).join(' ');
      if (!desc) return { response: 'Usage: /task add <description>' };
      const task = await taskCreate(env, { title: desc, type: 'task' });
      return { response: `Created task **${task.id}**: ${desc}` };
    }
    if (sub === 'list' || sub === 'ls') {
      const tasks = await taskList(env);
      if (!tasks.length) return { response: 'No tasks yet. Create one with `/task add <description>`' };
      const lines = tasks.map(t => {
        const icon = t.status === 'done' ? '~~' : t.status === 'running' ? '>' : '-';
        const strike = t.status === 'done';
        const title = strike ? `~~${t.title}~~` : t.title;
        return `${icon} **${t.id}** ${title} [${t.status}]${t.subtasks.length ? ` (${t.subtasks.filter(s => s.done).length}/${t.subtasks.length} subtasks)` : ''}`;
      });
      return { response: `**Tasks:**\n${lines.join('\n')}` };
    }
    if (sub === 'done' || sub === 'complete') {
      const id = args[1];
      if (!id) return { response: 'Usage: /task done <id>' };
      const task = await taskUpdate(env, id, { status: 'done' });
      if (!task) return { response: `Task ${id} not found` };
      await sendSlackNotification(env, `Task completed: *${task.title}*`, ':white_check_mark:');
      return { response: `Completed task **${id}**: ${task.title}` };
    }
    if (sub === 'plan') {
      const desc = args.slice(1).join(' ');
      if (!desc) return { response: 'Usage: /task plan <description>' };
      // Use reasoning model to break down
      const planPrompt = `Break this task into 3-7 concrete subtasks. Output ONLY a JSON array of strings, no other text. Task: ${desc}`;
      const planResult = await runModel(env, 'qwen3:8b', [
        { role: 'system', content: 'You output only valid JSON arrays. No markdown, no explanation.' },
        { role: 'user', content: planPrompt },
      ]);
      let subtasks = [];
      try {
        const cleaned = planResult.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        subtasks = JSON.parse(cleaned);
      } catch {
        subtasks = planResult.split('\n').filter(l => l.trim()).map(l => l.replace(/^\d+\.\s*/, '').trim());
      }
      const task = await taskCreate(env, {
        title: desc,
        type: 'plan',
        subtasks: subtasks.map((s, i) => ({ id: i + 1, title: s, done: false })),
      });
      const lines = task.subtasks.map(s => `  ${s.done ? '~~' : '-'} ${s.id}. ${s.title}`);
      return { response: `Created plan **${task.id}**: ${desc}\n\n**Subtasks:**\n${lines.join('\n')}` };
    }
    if (sub === 'subtask') {
      // /task subtask <task-id> done <subtask-id>
      const taskId = args[1];
      const action = args[2];
      const subId = parseInt(args[3]);
      if (!taskId || action !== 'done' || isNaN(subId)) return { response: 'Usage: /task subtask <task-id> done <subtask-num>' };
      const task = await taskGet(env, taskId);
      if (!task) return { response: `Task ${taskId} not found` };
      const st = task.subtasks.find(s => s.id === subId);
      if (!st) return { response: `Subtask ${subId} not found` };
      st.done = true;
      const allDone = task.subtasks.every(s => s.done);
      await taskUpdate(env, taskId, { subtasks: task.subtasks, status: allDone ? 'done' : task.status });
      if (allDone) {
        await sendSlackNotification(env, `Plan completed: *${task.title}* - all ${task.subtasks.length} subtasks done`, ':tada:');
      }
      return { response: `Subtask ${subId} done${allDone ? ` — plan **${taskId}** fully complete!` : ''}` };
    }
    if (sub === 'delete' || sub === 'rm') {
      const id = args[1];
      if (!id) return { response: 'Usage: /task delete <id>' };
      await env.TASKS.delete(`task:${id}`);
      const idx = JSON.parse(await env.TASKS.get('task:index') || '[]');
      await env.TASKS.put('task:index', JSON.stringify(idx.filter(i => i !== id)));
      return { response: `Deleted task **${id}**` };
    }
    return { response: 'Task commands: `add`, `list`, `done <id>`, `plan <desc>`, `subtask <id> done <n>`, `delete <id>`' };
  }

  if (cmd === '/pipeline' || cmd === '/pipe') {
    const pipeName = args[0];
    const input = args.slice(1).join(' ');
    if (!pipeName || !input) {
      const available = Object.entries(PIPELINES).map(([k, v]) => `  **${k}** — ${v.desc}`).join('\n');
      return { response: `Usage: /pipeline <name> <prompt>\n\n**Available pipelines:**\n${available}` };
    }
    if (!PIPELINES[pipeName]) return { response: `Unknown pipeline: ${pipeName}. Available: ${Object.keys(PIPELINES).join(', ')}` };

    // Create a task for tracking
    const task = await taskCreate(env, { title: `Pipeline: ${pipeName} — ${input.slice(0, 60)}`, type: 'pipeline', status: 'running' });

    try {
      const results = await runPipeline(env, pipeName, input);
      await taskUpdate(env, task.id, { status: 'done', results });
      const output = results.map(r => `### ${r.role} (${r.model})\n${r.content}`).join('\n\n---\n\n');
      await sendSlackNotification(env, `Pipeline *${pipeName}* completed for: "${input.slice(0, 80)}"`, ':gear:');
      return { response: `**Pipeline: ${PIPELINES[pipeName].name}** [${task.id}]\n\n${output}` };
    } catch (e) {
      await taskUpdate(env, task.id, { status: 'failed', error: e.message });
      return { response: `Pipeline failed: ${e.message}` };
    }
  }

  if (cmd === '/handoff') {
    const modelId = args[0];
    const prompt = args.slice(1).join(' ');
    if (!modelId || !prompt) return { response: 'Usage: /handoff <model-id> <prompt>\nModels: ' + MODELS.map(m => m.id).join(', ') };
    const task = await taskCreate(env, { title: `Handoff to ${modelId}: ${prompt.slice(0, 60)}`, type: 'handoff', status: 'running' });
    try {
      const rawResult = await runModel(env, modelId, [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ], { injectMemory: true, executeActs: true });
      const result = stripActions(rawResult);
      await taskUpdate(env, task.id, { status: 'done' });
      return { response: `**Handoff to ${modelId}** [${task.id}]\n\n${result}` };
    } catch (e) {
      await taskUpdate(env, task.id, { status: 'failed', error: e.message });
      return { response: `Handoff failed: ${e.message}` };
    }
  }

  if (cmd === '/memory' || cmd === '/mem') {
    const sub = args[0];
    if (sub === 'save' || sub === 'set') {
      const key = args[1];
      const value = args.slice(2).join(' ');
      if (!key || !value) return { response: 'Usage: /memory save <key> <value>' };
      await memorySet(env, key, value);
      return { response: `Saved to memory: **${key}**` };
    }
    if (sub === 'get' || sub === 'recall') {
      const key = args[1];
      if (!key) return { response: 'Usage: /memory get <key>' };
      const value = await memoryGet(env, key);
      return { response: value ? `**${key}:** ${value}` : `No memory found for "${key}"` };
    }
    if (sub === 'list' || sub === 'ls') {
      const keys = await memoryList(env);
      return { response: keys.length ? `**Memories:**\n${keys.map(k => `- ${k}`).join('\n')}` : 'No memories saved yet.' };
    }
    if (sub === 'delete' || sub === 'rm') {
      const key = args[1];
      if (!key) return { response: 'Usage: /memory delete <key>' };
      await env.MEMORY.delete(`mem:${key}`);
      return { response: `Deleted memory: **${key}**` };
    }
    return { response: 'Memory commands: `save <key> <value>`, `get <key>`, `list`, `delete <key>`' };
  }

  if (cmd === '/group') {
    const groupName = args[0];
    const roundsMatch = rest.match(/--rounds?\s+(\d+)/);
    const rounds = roundsMatch ? parseInt(roundsMatch[1]) : 1;
    const input = args.slice(1).join(' ').replace(/--rounds?\s+\d+/, '').trim();

    if (!groupName || !input) {
      const available = Object.entries(GROUP_PRESETS).map(([k, v]) =>
        `  **${k}** — ${v.desc} (${v.members.map(m => m.name).join(', ')})`
      ).join('\n');
      return { response: `Usage: /group <preset> <topic> [--rounds N]\n\n**Available groups:**\n${available}` };
    }
    if (!GROUP_PRESETS[groupName]) {
      return { response: `Unknown group: ${groupName}. Available: ${Object.keys(GROUP_PRESETS).join(', ')}` };
    }

    const task = await taskCreate(env, {
      title: `Group: ${groupName} — ${input.slice(0, 60)}`,
      type: 'group-chat',
      status: 'running',
    });

    try {
      const result = await runGroupChat(env, groupName, input, rounds);
      await taskUpdate(env, task.id, { status: 'done' });

      const header = `**Group Chat: ${result.groupInfo.name}** [${task.id}]  \n*${result.groupInfo.members.map(m => m.name).join(' + ')}* — ${rounds > 1 ? rounds + ' rounds' : '1 round'}\n\n`;
      const body = result.transcript.map(t =>
        `**${t.name}** *(${t.model}${rounds > 1 ? ', round ' + t.round : ''})*\n${t.content}`
      ).join('\n\n---\n\n');

      await sendSlackNotification(env, `Group chat *${groupName}* completed: "${input.slice(0, 80)}"`, ':busts_in_silhouette:');
      return { response: header + body, groupChat: result };
    } catch (e) {
      await taskUpdate(env, task.id, { status: 'failed', error: e.message });
      return { response: `Group chat failed: ${e.message}` };
    }
  }

  // ── Mixture of Agents ──
  if (cmd === '/moa' || cmd === '/mixture') {
    if (!rest) return { response: 'Usage: `/moa <prompt>` — 3 models answer, best response synthesized' };
    const task = await taskCreate(env, { title: `MoA: ${rest.slice(0, 60)}`, type: 'moa', status: 'running' });
    try {
      const result = await runMoA(env, rest);
      await taskUpdate(env, task.id, { status: 'done' });
      const individual = result.responses.map(r => `**${r.model}:**\n${r.content}`).join('\n\n---\n\n');
      return { response: `**Mixture of Agents** — ${result.models.length} models synthesized\n\n### Individual Responses\n\n${individual}\n\n---\n\n### Synthesized Best Answer\n\n${result.synthesis}` };
    } catch (e) {
      await taskUpdate(env, task.id, { status: 'failed', error: e.message });
      return { response: `MoA failed: ${e.message}` };
    }
  }

  // ── Consensus Voting ──
  if (cmd === '/consensus' || cmd === '/vote') {
    if (!rest) return { response: 'Usage: `/consensus <prompt>` — 3 models answer and vote on the best' };
    const task = await taskCreate(env, { title: `Consensus: ${rest.slice(0, 60)}`, type: 'consensus', status: 'running' });
    try {
      const result = await runConsensus(env, rest);
      await taskUpdate(env, task.id, { status: 'done' });
      const answers = result.answers.map(a => `**${a.model}** (${result.votes[a.model] || 0} votes):\n${a.content}`).join('\n\n---\n\n');
      return { response: `**Consensus Vote** — Winner: **${result.winner.model}**\n\n${answers}\n\n---\n\n### Winning Answer (${result.votes[result.winner.model] || 0} votes)\n\n${result.winner.content}` };
    } catch (e) {
      await taskUpdate(env, task.id, { status: 'failed', error: e.message });
      return { response: `Consensus failed: ${e.message}` };
    }
  }

  // ── Smart Auto-Route ──
  if (cmd === '/auto' || cmd === '/smart') {
    if (!rest) return { response: 'Usage: `/auto <prompt>` — AI classifies your intent and routes to the best model' };
    const bestModel = await autoRoute(env, rest);
    return { response: `Routed to **${bestModel}** — sending your prompt now...\n\n*Use this model by selecting it in the sidebar, or the AI chose it for you.*`, autoRoute: bestModel, autoPrompt: rest };
  }

  // ── Semantic Memory Search ──
  if (cmd === '/recall') {
    if (!rest) return { response: 'Usage: `/recall <query>` — search memory by meaning, not just keywords' };
    try {
      const results = await semanticMemorySearch(env, rest, 5);
      if (!results.length) return { response: 'No semantic matches found. Save memories with `/memory save` first.' };
      const lines = results.map((r, i) => `${i + 1}. **${r.key}** (${(r.similarity * 100).toFixed(1)}% match)\n   ${r.value}`);
      return { response: `**Semantic Search:** "${rest}"\n\n${lines.join('\n\n')}` };
    } catch (e) {
      return { response: `Semantic search error: ${e.message}` };
    }
  }

  // ── Embed + Save ──
  if (cmd === '/remember') {
    const parts = rest.split(' ');
    const key = parts[0];
    const value = parts.slice(1).join(' ');
    if (!key || !value) return { response: 'Usage: `/remember <key> <value>` — save with semantic embedding for AI recall' };
    await semanticMemorySave(env, key, value);
    return { response: `Saved **${key}** with semantic embedding — findable via \`/recall\`` };
  }

  // ── Web Search ──
  if (cmd === '/search' || cmd === '/web') {
    if (!rest) return { response: 'Usage: `/search <query>` — search the web with AI-enhanced results' };
    const searchResults = await webSearch(rest);
    if (!searchResults.results.length) return { response: `No results for "${rest}". ${searchResults.error || ''}` };

    // Feed search results to AI for synthesis
    const context = searchResults.results.map((r, i) => `[${i + 1}] ${r.title}\n${r.snippet}\nSource: ${r.source}${r.url ? ' — ' + r.url : ''}`).join('\n\n');
    const synthesis = await runModel(env, 'llama3.2:3b', [
      { role: 'system', content: 'You are a research assistant. Synthesize search results into a clear, cited answer. Reference sources by number [1], [2], etc.' },
      { role: 'user', content: `Question: ${rest}\n\nSearch Results:\n${context}\n\nSynthesize a clear answer with citations:` },
    ], { injectMemory: true });

    const sources = searchResults.results.map((r, i) => `${i + 1}. [${r.title.slice(0, 60)}](${r.url || '#'}) — ${r.source}`).join('\n');
    return { response: `**Web Search:** ${rest}\n\n${stripActions(synthesis)}\n\n---\n**Sources:**\n${sources}` };
  }

  // ── Code Execution ──
  if (cmd === '/run' || cmd === '/exec') {
    if (!rest) return { response: 'Usage: `/run python print("hello")` or `/run js console.log(42)`' };
    const langMatch = rest.match(/^(python|js|javascript|bash|sh|node)\s+/i);
    const lang = langMatch ? langMatch[1].toLowerCase().replace('javascript', 'js').replace('node', 'js').replace('sh', 'bash') : 'python';
    const code = langMatch ? rest.slice(langMatch[0].length) : rest;
    const result = await executeCode(env, lang, code);
    if (result.simulated) {
      const simResult = await runModel(env, 'qwen2.5-coder:3b', [
        { role: 'system', content: `You are a code executor. Simulate running this ${lang} code and show the exact output. Only output what the program would print. If there would be an error, show the error message.` },
        { role: 'user', content: code },
      ]);
      return { response: `**Simulated Execution** (${lang}):\n\`\`\`\n${stripActions(simResult)}\n\`\`\`\n\n*Note: Live execution coming soon. This is AI-simulated output.*` };
    }
    const output = result.output || result.error || 'No output';
    return { response: `**Code Output** (${lang}):\n\`\`\`\n${output}\n\`\`\`${result.exitCode !== 0 ? '\n\nExit code: ' + result.exitCode : ''}` };
  }

  // ── Shell (direct shell execution on Pi fleet) ──
  if (cmd === '/shell' || cmd === '/sh' || cmd === '/bash' || cmd === '/ssh') {
    if (!rest) return { response: 'Usage: `/shell ls -la /home/pi` — Run any command on the Pi fleet' };
    try {
      const result = await agentShell(rest);
      const out = (result.output || '').trim() || '(no output)';
      const exit = result.exitCode === 0 ? '' : `\n**Exit code:** ${result.exitCode}`;
      return { response: `**alice\$** \`${rest}\`\n\`\`\`\n${out}\n\`\`\`${exit}` };
    } catch (e) {
      return { response: `**Shell error:** ${e.message}` };
    }
  }

  // ── File Operations ──
  if (cmd === '/file' || cmd === '/cat' || cmd === '/read') {
    const sub = args[0];
    if (sub === 'write' || sub === 'save') {
      const filePath = args[1];
      const content = args.slice(2).join(' ');
      if (!filePath || !content) return { response: 'Usage: `/file write /path/to/file content here`' };
      try {
        const result = await agentFileWrite(filePath, content);
        return { response: `**Written:** \`${result.written}\` (${result.size} bytes)` };
      } catch (e) { return { response: `**Write error:** ${e.message}` }; }
    }
    if (sub === 'edit') {
      const filePath = args[1];
      const parts = args.slice(2).join(' ').split('>>>');
      if (!filePath || parts.length < 2) return { response: 'Usage: `/file edit /path old text >>> new text`' };
      try {
        const result = await agentFileEdit(filePath, parts[0].trim(), parts[1].trim());
        return { response: `**Edited:** \`${result.edited}\` (${result.replacements} replacement${result.replacements > 1 ? 's' : ''})` };
      } catch (e) { return { response: `**Edit error:** ${e.message}` }; }
    }
    // Default: read
    const filePath = sub || rest;
    if (!filePath) return { response: 'Usage: `/file /path/to/file` — Read files or directories\n`/file write /path content` — Write files\n`/file edit /path old >>> new` — Edit files' };
    try {
      const result = await agentFileRead(filePath);
      if (result.type === 'directory') {
        const entries = result.entries.map(e => `${e.type === 'dir' ? '📁' : '📄'} ${e.name}${e.size ? ` (${e.size}b)` : ''}`).join('\n');
        return { response: `**📂 ${result.path}**\n\`\`\`\n${entries}\n\`\`\`` };
      }
      const content = result.content?.length > 3000 ? result.content.slice(0, 3000) + '\n... (truncated)' : result.content;
      return { response: `**📄 ${result.path}** (${result.lines} lines, ${result.size}b)\n\`\`\`\n${content}\n\`\`\`` };
    } catch (e) { return { response: `**File error:** ${e.message}` }; }
  }

  // ── Git Operations ──
  if (cmd === '/git') {
    const op = args[0] || 'status';
    const repo = args[1] || '/home/pi/projects';
    const gitArgs = args.slice(2).join(' ');
    const validOps = ['status', 'log', 'diff', 'branch', 'add', 'commit', 'pull', 'push', 'stash', 'stash-pop', 'remote', 'blame', 'clone'];
    if (!validOps.includes(op)) return { response: `**Git ops:** ${validOps.map(o => '`' + o + '`').join(', ')}\nUsage: \`/git status /repo/path\`` };
    try {
      const result = await agentGit(repo, op, gitArgs);
      const out = (result.output || '').trim() || '(no output)';
      return { response: `**git ${op}** on \`${result.repo || repo}\`\n\`\`\`\n${out}\n\`\`\`${result.exitCode && result.exitCode !== 0 ? '\nExit code: ' + result.exitCode : ''}` };
    } catch (e) { return { response: `**Git error:** ${e.message}` }; }
  }

  // ── Codebase Search ──
  if (cmd === '/grep' || cmd === '/find') {
    if (!rest) return { response: 'Usage: `/grep pattern` — Search codebase for pattern\n`/find *.py` — Find files by glob' };
    try {
      if (cmd === '/grep') {
        const result = await agentSearch(rest);
        const matches = result.matches?.slice(0, 20).join('\n') || 'No matches';
        return { response: `**Search:** \`${rest}\` (${result.count} matches)\n\`\`\`\n${matches}\n\`\`\`` };
      } else {
        const result = await agentGlob(rest);
        const files = result.files?.join('\n') || 'No files found';
        return { response: `**Files matching** \`${rest}\`:\n\`\`\`\n${files}\n\`\`\`` };
      }
    } catch (e) { return { response: `**Search error:** ${e.message}` }; }
  }

  // ── Agent Task (agentic loop: AI plans + executes) ──
  if (cmd === '/agent' || cmd === '/do') {
    if (!rest) return { response: 'Usage: `/agent fix the bug in app.py` — AI agent plans and executes tasks on the Pi fleet' };
    try {
      // Step 1: AI plans the steps
      const planResult = await runModel(env, 'qwen2.5-coder:3b', [
        { role: 'system', content: `You are a coding agent. Given a task, output a JSON array of steps. Each step is: {"tool":"shell|file_read|file_write|file_edit|search|git","params":{...}}. Available tools:
- shell: {"command":"..."}
- file_read: {"path":"..."}
- file_write: {"path":"...","content":"..."}
- file_edit: {"path":"...","old_string":"...","new_string":"..."}
- search: {"pattern":"..."}
- git: {"repo":"...","op":"status|add|commit|diff","args":"..."}
Output ONLY the JSON array, no explanation.` },
        { role: 'user', content: rest },
      ]);
      let steps;
      try {
        const jsonMatch = stripActions(planResult).match(/\[[\s\S]*\]/);
        steps = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      } catch { steps = []; }
      if (!steps.length) return { response: `**Agent:** Couldn't plan steps for: "${rest}". Try being more specific.` };

      // Step 2: Execute each step
      let output = `**🤖 Agent Task:** ${rest}\n\n`;
      for (let i = 0; i < Math.min(steps.length, 5); i++) {
        const step = steps[i];
        output += `**Step ${i + 1}:** \`${step.tool}\`\n`;
        try {
          let result;
          switch (step.tool) {
            case 'shell': result = await agentShell(step.params?.command); break;
            case 'file_read': result = await agentFileRead(step.params?.path); break;
            case 'file_write': result = await agentFileWrite(step.params?.path, step.params?.content); break;
            case 'file_edit': result = await agentFileEdit(step.params?.path, step.params?.old_string, step.params?.new_string); break;
            case 'search': result = await agentSearch(step.params?.pattern); break;
            case 'git': result = await agentGit(step.params?.repo, step.params?.op, step.params?.args); break;
            default: result = { error: `Unknown tool: ${step.tool}` };
          }
          const preview = JSON.stringify(result).slice(0, 500);
          output += `\`\`\`\n${preview}\n\`\`\`\n`;
        } catch (e) {
          output += `Error: ${e.message}\n`;
        }
      }
      return { response: output };
    } catch (e) { return { response: `**Agent error:** ${e.message}` }; }
  }

  // ── Suggested Follow-ups ──
  if (cmd === '/followup' || cmd === '/next') {
    const conv = messages || [];
    if (conv.length < 2) return { response: 'Need at least one exchange to suggest follow-ups.' };
    const suggestions = await generateFollowUps(env, conv);
    return { response: `**Suggested follow-ups:**\n\n${(Array.isArray(suggestions) ? suggestions : []).map((s, i) => `${i + 1}. ${s}`).join('\n')}`, suggestions };
  }

  // ── Custom Personas ──
  if (cmd === '/persona') {
    const sub = args[0];
    if (sub === 'create' || sub === 'new') {
      const name = args[1];
      const systemPrompt = args.slice(2).join(' ');
      if (!name || !systemPrompt) return { response: 'Usage: `/persona create <name> <system prompt>`' };
      await savePersona(env, name, { system: systemPrompt, model: 'llama3.2:3b' });
      return { response: `Persona **${name}** created. Use \`/persona use ${name}\` to activate.` };
    }
    if (sub === 'list') {
      const personas = await listPersonas(env);
      if (!personas.length) return { response: 'No personas yet. Create one with `/persona create <name> <prompt>`' };
      const lines = [];
      for (const p of personas) {
        const data = await getPersona(env, p);
        lines.push(`- **${p}** — ${data?.system?.slice(0, 80) || ''}...`);
      }
      return { response: `**Custom Personas:**\n\n${lines.join('\n')}` };
    }
    if (sub === 'use') {
      const name = args[1];
      if (!name) return { response: 'Usage: `/persona use <name>`' };
      const persona = await getPersona(env, name);
      if (!persona) return { response: `Persona "${name}" not found. Create one with \`/persona create\`.` };
      return { response: `Activated persona **${name}**. All responses will use this personality.`, persona };
    }
    if (sub === 'delete') {
      const name = args[1];
      if (!name) return { response: 'Usage: `/persona delete <name>`' };
      await env.MEMORY.delete(`persona:${name}`);
      const idx = JSON.parse(await env.MEMORY.get('persona:index') || '[]');
      await env.MEMORY.put('persona:index', JSON.stringify(idx.filter(p => p !== name)));
      return { response: `Persona **${name}** deleted.` };
    }
    return { response: 'Usage: `/persona create|list|use|delete`' };
  }

  // ── Share Conversation ──
  if (cmd === '/share') {
    const conv = messages || [];
    if (conv.length < 2) return { response: 'Nothing to share yet. Have a conversation first.' };
    const title = rest || conv[0]?.content?.slice(0, 50) || 'Shared Chat';
    const id = await shareConversation(env, conv.slice(-20), title);
    return { response: `**Shared!** View at: \`https://chat.blackroad.io/s/${id}\`\n\nAnyone with the link can view this conversation.` };
  }

  // ── Export Conversation ──
  if (cmd === '/export') {
    return { response: 'export', exportConversation: true };
  }

  if (cmd === '/notify') {
    if (!rest) return { response: 'Usage: /notify <message>' };
    const result = await sendSlackNotification(env, rest, ':speech_balloon:');
    return { response: result.sent ? 'Notification sent to Slack' : `Failed: ${result.reason || 'unknown error'}. Configure with /memory save slack_webhook <url>` };
  }

  if (cmd === '/config') {
    const sub = args[0];
    if (sub === 'slack') {
      const url = args[1];
      if (!url) return { response: 'Usage: /config slack <webhook-url>' };
      await env.MEMORY.put('config:slack_webhook', url);
      return { response: 'Slack webhook configured' };
    }
    return { response: 'Config commands: `slack <webhook-url>`' };
  }

  if (cmd === '/test') {
    const sub = args[0] || 'status';
    if (sub === 'status' || sub === 'latest') {
      const raw = await env.MEMORY.get('test-results:latest');
      if (!raw) return { response: 'No test results yet. Deploy the site tester to a Pi first.' };
      const data = JSON.parse(raw);
      const ago = Math.round((Date.now() - new Date(data.timestamp).getTime()) / 60000);
      const lines = data.results.map(r => {
        const icon = r.status === 'up' ? '**UP**' : r.status === 'down' ? '**DOWN**' : '**SLOW**';
        const time = r.response_time_ms > 0 ? ` (${r.response_time_ms}ms)` : '';
        const err = r.error ? ` — ${r.error}` : '';
        return `- ${r.site} — ${icon}${time}${err}`;
      });
      return { response: `**Site Health Report** (${ago} min ago, runner: ${data.runner})\n\n${lines.join('\n')}\n\n**Summary:** ${data.summary.up} up, ${data.summary.down} down, ${data.summary.degraded} degraded | Tested in ${data.duration_ms}ms` };
    }
    if (sub === 'history') {
      const list = await env.MEMORY.list({ prefix: 'test-results:2' });
      if (!list.keys.length) return { response: 'No test history yet.' };
      const entries = list.keys.slice(0, 10).map(k => {
        const ts = k.name.replace('test-results:', '');
        return `- ${ts}`;
      });
      return { response: `**Test History** (last ${entries.length} runs)\n\n${entries.join('\n')}` };
    }
    return { response: 'Usage: `/test` — show latest results, `/test history` — show past runs' };
  }

  if (cmd === '/help') {
    return {
      response: `**BlackRoad Chat Commands:**

**Tasks:**
- \`/task add <description>\` — create a task
- \`/task list\` — show all tasks
- \`/task done <id>\` — mark complete
- \`/task plan <description>\` — AI breaks it into subtasks
- \`/task subtask <task-id> done <n>\` — complete a subtask
- \`/task delete <id>\` — remove a task

**Multi-AI:**
- \`/pipeline <name> <prompt>\` — run a multi-model pipeline
- \`/handoff <model> <prompt>\` — hand off to a specific model
- \`/group <preset> <topic>\` — multi-AI group chat
- \`/group <preset> <topic> --rounds N\` — multi-round discussion
- Pipelines: ${Object.keys(PIPELINES).join(', ')}
- Groups: ${Object.keys(GROUP_PRESETS).join(', ')}

**ML / Advanced AI:**
- \`/moa <prompt>\` — Mixture of Agents: 3 models answer, best synthesized
- \`/consensus <prompt>\` — Consensus voting: 3 models answer + vote on best
- \`/auto <prompt>\` — Smart router: AI classifies intent, picks best model
- \`/recall <query>\` — Semantic memory search (embeddings + cosine similarity)
- \`/remember <key> <value>\` — Save with semantic embedding for AI recall
- \`/pipeline reflect <prompt>\` — Self-reflection: generate → critique → improve
- \`/pipeline verify <prompt>\` — Chain-of-thought with independent verification
- \`/pipeline red-team <prompt>\` — Build → Attack → Harden security loop

**Memory:**
- \`/memory save <key> <value>\` — persist information
- \`/memory get <key>\` — recall
- \`/memory list\` — show all keys

**Web & Code:**
- \`/search <query>\` — search the web + AI synthesis with citations
- \`/run <lang> <code>\` — execute code (python/js/bash)

**Personas:**
- \`/persona create <name> <system prompt>\` — create custom AI personality
- \`/persona list\` — show all personas
- \`/persona use <name>\` — activate a persona
- \`/persona delete <name>\` — remove a persona

**Share & Export:**
- \`/share [title]\` — create shareable link to this conversation
- \`/export\` — download conversation as markdown

**Site Health:**
- \`/test\` — show latest website test results from Pi fleet
- \`/test history\` — show past test runs

**Notifications:**
- \`/notify <message>\` — send to Slack
- \`/config slack <webhook-url>\` — configure webhook

**AI Actions (automatic):**
All AIs can take actions directly in their responses — memory, tasks, handoffs, notifications.
Just ask naturally — "remember this", "create a task", "have a coder write this", "search the web for..."`
    };
  }

  return null; // not a recognized command
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

    // ── Chat API (streaming) ──
    if (path === '/api/chat' && request.method === 'POST') {
      const body = await request.json();
      const { messages = [], model = 'llama3.2:3b', stream = true } = body;

      // Check if the last user message is a command
      const lastMsg = messages[messages.length - 1];
      if (lastMsg?.role === 'user') {
        const parsed = parseCommand(lastMsg.content);
        if (parsed) {
          const result = await handleCommand(env, parsed);
          if (result) {
            const response = {
              message: { role: 'assistant', content: result.response },
              done: true,
              command: true,
            };
            if (result.groupChat) response.groupChat = result.groupChat;
            return Response.json(response, { headers: cors });
          }
        }
      }

      // Inject full memory context (tasks + memories) into system prompt
      let systemPrompt = SYSTEM_PROMPT;
      const memCtx = await loadMemoryContext(env);
      if (memCtx) systemPrompt += memCtx;

      const fullMessages = [
        { role: 'system', content: systemPrompt },
        ...messages,
      ];

      // Non-streaming: execute actions after response
      if (!stream) {
        const rawContent = await runModel(env, model, fullMessages, { executeActs: true });
        const content = stripActions(rawContent);
        const actionResults = await executeActions(env, rawContent);

        // Process handoffs
        const handoffs = [];
        for (const a of actionResults.filter(r => r.type === 'handoff' && r.status === 'queued')) {
          const hResult = await runModel(env, a.model, [
            { role: 'system', content: SYSTEM_PROMPT + memCtx },
            { role: 'user', content: a.prompt },
          ], { injectMemory: false, executeActs: true });
          handoffs.push({ model: a.model, content: stripActions(hResult) });
        }

        return Response.json({
          message: { role: 'assistant', content },
          done: true,
          actions: actionResults.length ? actionResults : undefined,
          handoffs: handoffs.length ? handoffs : undefined,
        }, { headers: cors });
      }

      // Streaming: pass through from Ollama, then execute actions via trailing JSON line
      const ollamaRes = await fetch(`${env.OLLAMA_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model, messages: fullMessages, stream: true,
          keep_alive: -1,
          options: { num_predict: 512, num_ctx: 4096 },
        }),
      });

      if (!ollamaRes.ok) {
        const err = await ollamaRes.text();
        return Response.json({ error: `Ollama error: ${ollamaRes.status} ${err}` }, { status: 502, headers: cors });
      }

      // Collect full response while streaming for post-stream action processing
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      const reader = ollamaRes.body.getReader();
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      let fullContent = '';

      (async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            await writer.write(value);
            const chunk = decoder.decode(value, { stream: true });
            for (const line of chunk.split('\n')) {
              if (!line.trim()) continue;
              try { const j = JSON.parse(line); if (j.message?.content) fullContent += j.message.content; } catch {}
            }
          }
          // After stream completes, execute any actions the AI embedded
          if (fullContent.includes('[ACTION:')) {
            const actionResults = await executeActions(env, fullContent);
            // Process handoffs
            for (const a of actionResults.filter(r => r.type === 'handoff' && r.status === 'queued')) {
              const hResult = await runModel(env, a.model, [
                { role: 'system', content: SYSTEM_PROMPT + memCtx },
                { role: 'user', content: a.prompt },
              ], { executeActs: true });
              const handoffLine = JSON.stringify({
                message: { role: 'assistant', content: `\n\n---\n**Handoff → ${a.model}:**\n${stripActions(hResult)}` },
                done: false,
                handoff: true,
              }) + '\n';
              await writer.write(encoder.encode(handoffLine));
            }
            // Send action results as final metadata line
            if (actionResults.length) {
              const metaLine = JSON.stringify({ actions: actionResults, done: true }) + '\n';
              await writer.write(encoder.encode(metaLine));
            }
          }
        } finally {
          await writer.close();
        }
      })();

      return new Response(readable, {
        headers: { 'Content-Type': 'application/x-ndjson', 'Transfer-Encoding': 'chunked', ...cors },
      });
    }

    // ── Task API (REST) ──
    if (path === '/api/tasks' && request.method === 'GET') {
      const tasks = await taskList(env);
      return Response.json({ tasks }, { headers: cors });
    }
    if (path === '/api/tasks' && request.method === 'POST') {
      const body = await request.json();
      const task = await taskCreate(env, body);
      return Response.json({ task }, { headers: cors });
    }
    if (path.startsWith('/api/tasks/') && request.method === 'PUT') {
      const id = path.split('/').pop();
      const body = await request.json();
      const task = await taskUpdate(env, id, body);
      return Response.json({ task }, { headers: cors });
    }
    if (path.startsWith('/api/tasks/') && request.method === 'DELETE') {
      const id = path.split('/').pop();
      await env.TASKS.delete(`task:${id}`);
      const idx = JSON.parse(await env.TASKS.get('task:index') || '[]');
      await env.TASKS.put('task:index', JSON.stringify(idx.filter(i => i !== id)));
      return Response.json({ deleted: id }, { headers: cors });
    }

    // ── Memory API ──
    if (path === '/api/memory' && request.method === 'GET') {
      const keys = await memoryList(env);
      return Response.json({ keys }, { headers: cors });
    }
    if (path === '/api/memory' && request.method === 'POST') {
      const { key, value } = await request.json();
      await memorySet(env, key, value);
      return Response.json({ saved: key }, { headers: cors });
    }
    if (path.startsWith('/api/memory/') && request.method === 'GET') {
      const key = path.split('/').pop();
      const value = await memoryGet(env, key);
      return Response.json({ key, value }, { headers: cors });
    }

    // ── Pipeline API ──
    if (path === '/api/pipeline' && request.method === 'POST') {
      const { pipeline: pipeName, input } = await request.json();
      if (!PIPELINES[pipeName]) return Response.json({ error: 'Unknown pipeline' }, { status: 400, headers: cors });
      try {
        const results = await runPipeline(env, pipeName, input);
        return Response.json({ pipeline: pipeName, results }, { headers: cors });
      } catch (e) {
        return Response.json({ error: e.message }, { status: 502, headers: cors });
      }
    }
    if (path === '/api/pipelines' && request.method === 'GET') {
      return Response.json({ pipelines: PIPELINES }, { headers: cors });
    }

    // ── Group Chat API ──
    if (path === '/api/group' && request.method === 'POST') {
      const { group: groupName, prompt, rounds = 1 } = await request.json();
      if (!GROUP_PRESETS[groupName]) return Response.json({ error: 'Unknown group' }, { status: 400, headers: cors });
      try {
        const result = await runGroupChat(env, groupName, prompt, Math.min(rounds, 5));
        return Response.json(result, { headers: cors });
      } catch (e) {
        return Response.json({ error: e.message }, { status: 502, headers: cors });
      }
    }
    if (path === '/api/groups' && request.method === 'GET') {
      return Response.json({ groups: GROUP_PRESETS }, { headers: cors });
    }

    // ── Test Results API ──
    if (path === '/api/test-results' && request.method === 'POST') {
      const body = await request.json();
      await env.MEMORY.put('test-results:latest', JSON.stringify(body));
      await env.MEMORY.put('test-results:' + body.timestamp, JSON.stringify(body));
      // Prune old results — keep last 48
      const list = await env.MEMORY.list({ prefix: 'test-results:2' });
      if (list.keys.length > 48) {
        const toDelete = list.keys.slice(48);
        for (const k of toDelete) await env.MEMORY.delete(k.name);
      }
      return Response.json({ saved: true, timestamp: body.timestamp }, { headers: cors });
    }
    if (path === '/api/test-results' && request.method === 'GET') {
      const raw = await env.MEMORY.get('test-results:latest');
      if (!raw) return Response.json({ error: 'no results yet' }, { headers: cors });
      return new Response(raw, { headers: { 'Content-Type': 'application/json', ...cors } });
    }

    // ── Shared Conversation View ──
    if (path.startsWith('/s/')) {
      const id = path.slice(3);
      const raw = await env.MEMORY.get(`share:${id}`);
      if (!raw) return new Response('Shared conversation not found', { status: 404, headers: cors });
      const share = JSON.parse(raw);
      share.views++;
      await env.MEMORY.put(`share:${id}`, JSON.stringify(share));
      const msgHtml = share.messages.map(m => {
        const role = m.role === 'user' ? 'You' : 'BlackRoad AI';
        return `<div style="margin:12px 0;padding:12px 16px;border:1px solid #1a1a1a;border-radius:10px;background:${m.role === 'user' ? '#4488FF06' : '#060606'}"><strong style="color:${m.role === 'user' ? '#4488FF' : '#FF2255'};font-size:0.7rem;text-transform:uppercase;letter-spacing:1px">${role}</strong><div style="margin-top:6px;color:rgba(255,255,255,0.7);line-height:1.6;white-space:pre-wrap">${escapeHtml(m.content)}</div></div>`;
      }).join('');
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(share.title)} — BlackRoad Chat</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#000;color:#fff;font-family:Inter,sans-serif;max-width:800px;margin:0 auto;padding:20px}h1{font-family:Space Grotesk;font-size:1.5rem;margin-bottom:4px}h1::before{content:'';display:block;height:3px;background:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);margin-bottom:10px;border-radius:2px}.meta{color:rgba(255,255,255,0.3);font-family:JetBrains Mono;font-size:0.65rem;margin-bottom:20px}a{color:#4488FF}</style></head><body><h1>${escapeHtml(share.title)}</h1><div class="meta">Shared from <a href="https://chat.blackroad.io">chat.blackroad.io</a> — ${share.views} views</div>${msgHtml}<div style="margin-top:30px;text-align:center;padding:16px;border-top:1px solid #111"><a href="https://chat.blackroad.io" style="color:#FF2255;font-family:Space Grotesk;font-weight:700;text-decoration:none">Start your own chat on BlackRoad</a></div></body></html>`;
      return new Response(html, { headers: { 'Content-Type': 'text/html', ...cors } });
    }

    // ── Follow-ups API ──
    if (path === '/api/followups' && request.method === 'POST') {
      const { messages: msgs } = await request.json();
      const suggestions = await generateFollowUps(env, msgs || []);
      return Response.json({ suggestions }, { headers: cors });
    }

    // ── Search API ──
    if (path === '/api/search' && request.method === 'POST') {
      const { query } = await request.json();
      const results = await webSearch(query);
      return Response.json(results, { headers: cors });
    }

    // ── Personas API ──
    if (path === '/api/personas' && request.method === 'GET') {
      const personas = await listPersonas(env);
      return Response.json({ personas }, { headers: cors });
    }

    // ── Notify API ──
    if (path === '/api/notify' && request.method === 'POST') {
      const { message, emoji } = await request.json();
      const result = await sendSlackNotification(env, message, emoji);
      return Response.json(result, { headers: cors });
    }

    // ── Models API ──
    if (path === '/api/models') {
      try {
        const res = await fetch(`${env.OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(10000) });
        if (res.ok) {
          const data = await res.json();
          const live = (data.models || []).map(m => m.name);
          const models = MODELS.map(m => ({ ...m, online: live.includes(m.id) }));
          return Response.json({ models, live_count: live.length, pipelines: Object.keys(PIPELINES) }, { headers: cors });
        }
      } catch {}
      return Response.json({ models: MODELS.map(m => ({ ...m, online: false })), live_count: 0, pipelines: Object.keys(PIPELINES) }, { headers: cors });
    }

    // ── Health ──
    if (path === '/api/health') {
      try {
        const res = await fetch(`${env.OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(10000) });
        const ok = res.ok;
        const tasks = await taskList(env);
        return Response.json({ status: ok ? 'up' : 'down', ollama: ok, active_tasks: tasks.filter(t => t.status !== 'done').length }, { headers: cors });
      } catch {
        return Response.json({ status: 'down', ollama: false }, { headers: cors });
      }
    }

    // ── Chat UI ──
    if (path === '/' || path === '') {
      return new Response(renderChat(), { headers: { 'Content-Type': 'text/html;charset=utf-8', ...cors } });
    }

    return new Response('Not found', { status: 404 });
  },
};


function renderChat() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>BlackRoad Chat</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=JetBrains+Mono:wght@400;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root {
    --grad: linear-gradient(90deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF);
    --pink: #FF2255; --blue: #4488FF; --violet: #8844FF; --cyan: #00D4FF; --amber: #F5A623;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { height: 100%; }
  body { background: #000; color: #fff; font-family: 'Space Grotesk', sans-serif; display: flex; flex-direction: column; overflow: hidden; }

  /* ── Nav ── */
  .topnav {
    display: flex; align-items: center; justify-content: space-between; padding: 10px 20px;
    border-bottom: 1px solid #111; background: rgba(0,0,0,0.95); backdrop-filter: blur(12px); z-index: 100; flex-shrink: 0;
  }
  .topnav-brand { font-family: 'Space Grotesk'; font-weight: 700; font-size: 0.85rem; color: #fff; text-decoration: none; }
  .topnav-links { display: flex; gap: 4px; align-items: center; }
  .topnav-links a {
    padding: 4px 10px; border-radius: 6px; font-size: 0.7rem; font-family: 'JetBrains Mono';
    color:rgba(255,255,255,0.35); text-decoration: none; transition: all 0.2s; border: 1px solid transparent;
  }
  .topnav-links a:hover { color: #fff; border-color:rgba(255,255,255,0.25); background: #111; }
  .topnav-links a.active { color: #f5f5f5; border-color: #FF225533; background: #FF225508; }
  .topnav-sep { width: 1px; height: 14px; background: #222; margin: 0 4px; }

  /* ── Sidebar ── */
  .layout { display: flex; flex: 1; overflow: hidden; }
  .sidebar {
    width: 260px; border-right: 1px solid #111; padding: 12px; overflow-y: auto; flex-shrink: 0;
    display: flex; flex-direction: column; gap: 8px; background: #030303; z-index: 50;
    transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
  }
  .sidebar.collapsed { transform: translateX(-260px); position: absolute; height: calc(100% - 45px); }
  .sidebar-toggle {
    position: fixed; left: 10px; top: 56px; z-index: 60; background: #111; border: 1px solid #222;
    border-radius: 8px; color:rgba(255,255,255,0.35); font-size: 1rem; width: 32px; height: 32px; cursor: pointer;
    display: none; align-items: center; justify-content: center; transition: all 0.2s;
  }
  .sidebar-toggle:hover { color: #fff; border-color:rgba(255,255,255,0.3); }
  .sidebar-toggle.visible { display: flex; }
  .sidebar-title { font-family: 'Space Grotesk'; font-size: 0.7rem; color:rgba(255,255,255,0.25); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
  .model-card {
    padding: 8px 10px; border: 1px solid #1a1a1a; border-radius: 8px; cursor: pointer;
    transition: all 0.2s; background: #060606;
  }
  .model-card:hover { border-color:rgba(255,255,255,0.25); }
  .model-card.active { border-color: #FF225544; background: #FF225508; }
  .model-card .mn { font-family: 'JetBrains Mono'; font-size: 0.75rem; color:rgba(255,255,255,0.7); font-weight: 600; }
  .model-card .md { font-size: 0.6rem; color:rgba(255,255,255,0.3); margin-top: 2px; }
  .model-card .ms { display: inline-flex; align-items: center; gap: 4px; margin-top: 3px; }
  .model-dot { width: 5px; height: 5px; border-radius: 50%; display: inline-block; }
  .model-dot.on { background: #00D4FF; box-shadow: 0 0 4px rgba(0,212,255,0.4); }
  .model-dot.off { background: #333; }
  .code-badge { font-family: 'JetBrains Mono'; font-size: 0.5rem; padding: 1px 5px; border: 1px solid #8844FF22; color: #f5f5f5; border-radius: 3px; }
  .conv-btn {
    padding: 8px; border: 1px solid #1a1a1a; border-radius: 8px; background: #060606;
    color:rgba(255,255,255,0.4); font-size: 0.72rem; font-family: 'JetBrains Mono'; cursor: pointer; transition: all 0.2s; text-align: center;
  }
  .conv-btn:hover { border-color:rgba(255,255,255,0.25); color: #fff; }
  .conv-item {
    padding: 6px 8px; border-radius: 6px; cursor: pointer; font-size: 0.68rem; color:rgba(255,255,255,0.35);
    font-family: 'JetBrains Mono'; transition: all 0.15s; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .conv-item:hover { background: #111; color:rgba(255,255,255,0.5); }
  .conv-item.active { background: #FF225508; color: #f5f5f5; border-left: 2px solid #FF2255; }
  .tab-bar { display: flex; gap: 2px; margin-bottom: 4px; }
  .tab-btn {
    flex: 1; padding: 6px 4px; border: 1px solid #1a1a1a; border-radius: 6px; background: #060606;
    color:rgba(255,255,255,0.3); font-size: 0.6rem; font-family: 'JetBrains Mono'; cursor: pointer; text-align: center; transition: all 0.2s;
  }
  .tab-btn:hover { color:rgba(255,255,255,0.5); border-color:rgba(255,255,255,0.25); }
  .tab-btn.active { color: #f5f5f5; border-color: #FF225544; background: #FF225508; }
  .tab-content { display: none; }
  .tab-content.active { display: block; }

  /* ── Task/Pipe/Group cards ── */
  .task-card { padding: 8px 10px; border: 1px solid #1a1a1a; border-radius: 8px; margin-bottom: 4px; background: #060606; font-size: 0.68rem; transition: all 0.2s; }
  .task-card:hover { border-color:rgba(255,255,255,0.25); }
  .task-title { font-family: 'JetBrains Mono'; color:rgba(255,255,255,0.7); margin-bottom: 3px; }
  .task-title.done { color:rgba(255,255,255,0.3); text-decoration: line-through; }
  .task-meta { display: flex; gap: 6px; align-items: center; }
  .task-status { font-family: 'JetBrains Mono'; font-size: 0.55rem; padding: 1px 6px; border-radius: 3px; border: 1px solid #1a1a1a; }
  .task-status.pending { color: rgba(255,255,255,0.7); border-color: rgba(255,255,255,0.7)22; }
  .task-status.running { color: #00D4FF; border-color: #00D4FF22; }
  .task-status.done { color:rgba(255,255,255,0.8); border-color:rgba(255,255,255,0.8)22; }
  .task-status.failed { color:rgba(255,100,100,0.9); border-color:rgba(255,100,100,0.9)22; }
  .task-id { font-family: 'JetBrains Mono'; font-size: 0.5rem; color:rgba(255,255,255,0.25); }
  .task-subtasks { margin-top: 4px; padding-left: 8px; }
  .task-subtask { font-size: 0.6rem; color:rgba(255,255,255,0.35); padding: 2px 0; cursor: pointer; }
  .task-subtask:hover { color:rgba(255,255,255,0.5); }
  .task-subtask.done { color:rgba(255,255,255,0.25); text-decoration: line-through; }
  .task-actions { display: flex; gap: 4px; margin-top: 4px; }
  .task-act-btn {
    font-family: 'JetBrains Mono'; font-size: 0.5rem; padding: 2px 6px; border: 1px solid #1a1a1a;
    border-radius: 3px; background: none; color:rgba(255,255,255,0.3); cursor: pointer; transition: all 0.2s;
  }
  .task-act-btn:hover { color: #fff; border-color:rgba(255,255,255,0.25); }
  .pipe-card { padding: 8px 10px; border: 1px solid #1a1a1a; border-radius: 8px; cursor: pointer; background: #060606; transition: all 0.2s; margin-bottom: 4px; }
  .pipe-card:hover { border-color: #8844FF44; background: #8844FF06; }
  .pipe-name { font-family: 'JetBrains Mono'; font-size: 0.72rem; color:rgba(255,255,255,0.7); font-weight: 600; }
  .pipe-desc { font-size: 0.6rem; color:rgba(255,255,255,0.3); margin-top: 2px; }
  .pipe-steps { font-family: 'JetBrains Mono'; font-size: 0.5rem; color: #8844FF; margin-top: 3px; }
  .group-card { padding: 8px 10px; border: 1px solid #1a1a1a; border-radius: 8px; cursor: pointer; background: #060606; transition: all 0.2s; margin-bottom: 4px; }
  .group-card:hover { border-color: #FF225544; background: #FF225506; }
  .group-name { font-family: 'JetBrains Mono'; font-size: 0.72rem; color:rgba(255,255,255,0.7); font-weight: 600; }
  .group-desc { font-size: 0.6rem; color:rgba(255,255,255,0.3); margin-top: 2px; }
  .group-members { display: flex; gap: 4px; margin-top: 4px; flex-wrap: wrap; }
  .group-member-tag { font-family: 'JetBrains Mono'; font-size: 0.5rem; padding: 1px 6px; border-radius: 3px; border: 1px solid; display: flex; align-items: center; gap: 3px; }
  .group-member-dot { width: 5px; height: 5px; border-radius: 50%; display: inline-block; }

  /* ── Group chat messages ── */
  .msg-group { margin-left: 0; margin-right: 0; }
  .msg-group .msg-body { border-left: 3px solid var(--agent-color, #555); }
  .msg-group .msg-role { font-weight: 600; }
  .group-separator { display: flex; align-items: center; gap: 12px; margin: 16px 0; color:rgba(255,255,255,0.2); font-family: 'JetBrains Mono'; font-size: 0.6rem; }
  .group-separator::before, .group-separator::after { content: ''; flex: 1; height: 1px; background: #1a1a1a; }
  .group-header { text-align: center; padding: 12px; margin-bottom: 12px; border: 1px solid #1a1a1a; border-radius: 10px; background: #060606; }
  .group-header-title { font-family: 'Space Grotesk'; font-size: 1rem; color: #f5f5f5; font-weight: 700; }
  .group-header-sub { font-family: 'JetBrains Mono'; font-size: 0.6rem; color:rgba(255,255,255,0.3); margin-top: 4px; }
  .group-header-members { display: flex; gap: 6px; justify-content: center; margin-top: 8px; flex-wrap: wrap; }

  /* ── Chat area ── */
  .chat-area { flex: 1; display: flex; flex-direction: column; min-width: 0; position: relative; }
  .messages {
    flex: 1; overflow-y: auto; padding: 16px 20px; padding-bottom: 320px; scroll-behavior: smooth;
  }
  .msg { margin-bottom: 16px; max-width: 800px; animation: fadeIn 0.2s ease; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; } }
  .msg-user { margin-left: auto; }
  .msg-header { font-family: 'JetBrains Mono'; font-size: 0.6rem; color:rgba(255,255,255,0.25); margin-bottom: 4px; display: flex; align-items: center; gap: 6px; }
  .msg-role { text-transform: uppercase; letter-spacing: 1px; }
  .msg-role.user { color: #f5f5f5; }
  .msg-role.assistant { color: #f5f5f5; }
  .msg-role.system { color: #8844FF; }
  .msg-body { padding: 12px 16px; border-radius: 10px; font-size: 0.88rem; line-height: 1.65; border: 1px solid #1a1a1a; background: #060606; }
  .msg-user .msg-body { border-color: #4488FF22; background: #4488FF06; }
  .msg-system .msg-body { border-color: #8844FF22; background: #8844FF06; }
  .msg-body p { margin-bottom: 8px; }
  .msg-body p:last-child { margin-bottom: 0; }
  .msg-body ul, .msg-body ol { margin: 8px 0 8px 20px; }
  .msg-body li { margin-bottom: 4px; }
  .msg-body strong { color: #fff; }
  .msg-body em { color:rgba(255,255,255,0.5); }
  .msg-body a { color: #f5f5f5; text-decoration: none; border-bottom: 1px solid #4488FF; }
  .msg-body a:hover { text-decoration: underline; }

  /* ── Code blocks ── */
  .code-block { position: relative; margin: 10px 0; border-radius: 8px; overflow: hidden; border: 1px solid #1a1a1a; }
  .code-header { display: flex; justify-content: space-between; align-items: center; padding: 6px 12px; background: #0a0a0a; border-bottom: 1px solid #1a1a1a; }
  .code-lang { font-family: 'JetBrains Mono'; font-size: 0.6rem; color: #f5f5f5; text-transform: uppercase; }
  .code-copy { font-family: 'JetBrains Mono'; font-size: 0.58rem; color:rgba(255,255,255,0.25); cursor: pointer; padding: 2px 8px; border: 1px solid #1a1a1a; border-radius: 4px; transition: all 0.2s; background: none; }
  .code-copy:hover { color:rgba(255,255,255,0.5); border-color:rgba(255,255,255,0.25); }
  .code-copy.copied { color: #f5f5f5; border-color: #00D4FF33; }
  pre.code-content { padding: 12px 14px; margin: 0; overflow-x: auto; font-family: 'JetBrains Mono'; font-size: 0.78rem; line-height: 1.5; color:rgba(255,255,255,0.65); background: #0a0a0a; }
  .code-content .kw { color: rgba(255,255,255,0.85); }
  .code-content .str { color:rgba(255,255,255,0.7); }
  .code-content .cm { color:rgba(255,255,255,0.3); font-style: italic; }
  .code-content .fn { color: #f5f5f5; }
  .code-content .num { color:rgba(255,255,255,0.6); }
  .code-content .op { color:rgba(255,255,255,0.55); }
  .msg-body code:not(.code-content code) { background: #111; padding: 2px 6px; border-radius: 4px; font-family: 'JetBrains Mono'; font-size: 0.82rem; color: #f5f5f5; border: 1px solid #1a1a1a; }

  /* ── Streaming cursor ── */
  .streaming::after { content: '\\25AE'; animation: blink 0.6s step-end infinite; color: #f5f5f5; margin-left: 2px; }
  @keyframes blink { 50% { opacity: 0; } }

  /* ── Voice Hub ── */
  .voice-hub {
    position: absolute; bottom: 0; left: 0; right: 0; z-index: 30;
    display: flex; flex-direction: column; align-items: center;
    padding: 0 20px 16px;
    background: linear-gradient(to top, #000 60%, transparent);
    pointer-events: none;
  }
  .voice-hub > * { pointer-events: auto; }

  /* Transcript preview */
  .voice-transcript {
    font-family: 'JetBrains Mono'; font-size: 0.82rem; color:rgba(255,255,255,0.35);
    max-width: 600px; text-align: center; margin-bottom: 12px;
    min-height: 22px; transition: color 0.2s; pointer-events: none;
  }
  .voice-transcript.interim { color:rgba(255,255,255,0.35); }
  .voice-transcript.final { color:rgba(255,255,255,0.8); }

  /* Mic container */
  .mic-zone { position: relative; width: 180px; height: 180px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; pointer-events: none; }
  .mic-zone .mic-btn { pointer-events: auto; }

  /* Canvas for audio visualizer */
  .viz-canvas { position: absolute; top: 0; left: 0; width: 180px; height: 180px; pointer-events: none; }

  /* Mic button */
  .mic-btn {
    position: relative; z-index: 5; width: 80px; height: 80px; border-radius: 50%;
    background: #0a0a0a; border: 2px solid #222; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
    box-shadow: 0 0 0 0 rgba(255,34,85,0), 0 4px 24px rgba(0,0,0,0.5);
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .mic-btn svg { width: 32px; height: 32px; fill: #555; transition: fill 0.3s; }
  .mic-btn:hover { border-color: #FF2255; }
  .mic-btn:hover svg { fill: #FF2255; }

  /* Listening state */
  .mic-btn.listening {
    border-color: #FF2255; background: #1a0008;
    box-shadow: 0 0 30px rgba(255,34,85,0.3), 0 0 60px rgba(255,34,85,0.1);
    animation: micPulse 2s ease-in-out infinite;
  }
  .mic-btn.listening svg { fill: #FF2255; }
  @keyframes micPulse {
    0%, 100% { box-shadow: 0 0 30px rgba(255,34,85,0.3), 0 0 60px rgba(255,34,85,0.1); }
    50% { box-shadow: 0 0 50px rgba(255,34,85,0.5), 0 0 100px rgba(255,34,85,0.2); }
  }

  /* AI thinking state */
  .mic-btn.thinking { border-color: #4488FF; background: #000818; animation: thinkPulse 1.5s ease-in-out infinite; }
  .mic-btn.thinking svg { fill: #4488FF; }
  @keyframes thinkPulse {
    0%, 100% { box-shadow: 0 0 20px rgba(68,136,255,0.2); transform: scale(1); }
    50% { box-shadow: 0 0 40px rgba(68,136,255,0.4); transform: scale(1.03); }
  }

  /* Outer ring */
  .mic-ring {
    position: absolute; top: 50%; left: 50%; width: 120px; height: 120px;
    transform: translate(-50%, -50%); border-radius: 50%;
    border: 1px solid #1a1a1a; transition: all 0.5s; z-index: 1; pointer-events: none;
  }
  .mic-btn.listening ~ .mic-ring {
    border-color: transparent;
    background: conic-gradient(from 0deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF, #FF6B2B);
    -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px));
    mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px));
    animation: ringRotate 3s linear infinite;
  }
  @keyframes ringRotate { to { transform: translate(-50%, -50%) rotate(360deg); } }

  /* Voice controls row */
  .voice-controls {
    display: flex; align-items: center; gap: 12px; margin-bottom: 10px;
  }
  .voice-ctrl-btn {
    background: none; border: 1px solid #1a1a1a; border-radius: 8px; padding: 6px 12px;
    color:rgba(255,255,255,0.3); font-family: 'JetBrains Mono'; font-size: 0.6rem; cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; gap: 4px;
  }
  .voice-ctrl-btn:hover { color:rgba(255,255,255,0.6); border-color:rgba(255,255,255,0.25); }
  .voice-ctrl-btn.active { color: #00D4FF; border-color: #00D4FF44; background: #00D4FF08; }
  .voice-ctrl-btn .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

  /* Text input fallback */
  .input-area { padding: 0 20px 12px; flex-shrink: 0; }
  .input-row { display: flex; gap: 8px; max-width: 600px; margin: 0 auto; align-items: flex-end; }
  .input-wrap { flex: 1; position: relative; }
  .input-wrap textarea {
    width: 100%; padding: 12px 14px; background: #0a0a0a; color: #fff; border: 1px solid #1a1a1a;
    border-radius: 12px; outline: none; font-size: 0.85rem; font-family: 'Space Grotesk'; resize: none;
    min-height: 44px; max-height: 160px; line-height: 1.4; transition: border-color 0.3s;
  }
  .input-wrap textarea:focus { border-color: #FF2255; box-shadow: 0 0 20px rgba(255,34,85,0.06); }
  .input-wrap textarea::placeholder { color:rgba(255,255,255,0.2); }
  .send-btn {
    padding: 12px 20px; background: transparent; color: #fff; border: 1px solid #FF2255; cursor: pointer;
    font-weight: 600; font-size: 0.8rem; font-family: 'Space Grotesk'; border-radius: 12px; transition: all 0.2s; white-space: nowrap;
  }
  .send-btn:hover { background: #FF225512; }
  .send-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .input-hint {
    font-family: 'JetBrains Mono'; font-size: 0.55rem; color: #1a1a1a; margin-top: 4px;
    display: flex; gap: 12px; align-items: center; justify-content: center;
  }
  .input-hint kbd { padding: 1px 5px; border: 1px solid #1a1a1a; border-radius: 3px; font-size: 0.5rem; }

  /* ── Welcome ── */
  .welcome { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 30px 20px; text-align: center; overflow-y: auto; }
  .welcome h1 { font-family: 'Space Grotesk'; font-size: 2.2rem; font-weight: 700; color: #f5f5f5; margin-bottom: 6px; }
  .welcome h1::before { content: ''; display: block; height: 3px; background: var(--grad); margin-bottom: 10px; border-radius: 2px; }
  .welcome p { color:rgba(255,255,255,0.3); font-size: 0.85rem; margin-bottom: 16px; }
  .welcome-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; max-width: 900px; width: 100%; padding-bottom: 200px; }
  .welcome-card { padding: 10px 12px; border: 1px solid #1a1a1a; border-radius: 10px; background: #060606; text-align: left; cursor: pointer; transition: all 0.25s; position: relative; overflow: hidden; }
  .welcome-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: var(--grad); opacity: 0; transition: opacity 0.25s; }
  .welcome-card:hover { border-color:rgba(255,255,255,0.25); transform: translateY(-2px); box-shadow: 0 4px 20px rgba(0,0,0,0.4); }
  .welcome-card:hover::before { opacity: 1; }
  .welcome-card:active { transform: translateY(0) scale(0.98); }
  .welcome-card .wt { font-family: 'JetBrains Mono'; font-size: 0.7rem; color:rgba(255,255,255,0.7); margin-bottom: 3px; font-weight: 600; }
  .welcome-card .wd { font-size: 0.6rem; color:rgba(255,255,255,0.3); line-height: 1.4; }

  /* ── Space hint overlay ── */
  .space-hint {
    position: fixed; bottom: 200px; left: 50%; transform: translateX(-50%);
    background: #111; border: 1px solid #333; border-radius: 8px; padding: 6px 14px;
    font-family: 'JetBrains Mono'; font-size: 0.65rem; color:rgba(255,255,255,0.5);
    opacity: 0; transition: opacity 0.2s; pointer-events: none; z-index: 40;
  }
  .space-hint.show { opacity: 1; }

  /* ── Blacklinks ── */
  .bl { font-family: 'JetBrains Mono'; font-size: 0.6rem; color:rgba(255,255,255,0.3); text-decoration: none; padding: 2px 8px; border: 1px solid #1a1a1a; border-radius: 4px; transition: all 0.2s; }
  .bl:hover { color: #4488FF; border-color: #4488FF33; background: #4488FF08; }
  .chat-footer { padding: 6px 20px; border-top: 1px solid #0a0a0a; display: flex; gap: 8px; justify-content: center; flex-shrink: 0; }

  /* ── Mobile ── */
  @media (max-width: 700px) {
    .sidebar { display: none; }
    .sidebar.open { display: flex; transform: translateX(0); position: absolute; height: calc(100% - 45px); top: 45px; }
    .sidebar-toggle { display: flex; }
    .welcome h1 { font-size: 1.6rem; }
    .welcome-grid { grid-template-columns: repeat(2, 1fr); }
    .mic-btn { width: 70px; height: 70px; }
    .mic-zone { width: 160px; height: 160px; }
    .viz-canvas { width: 160px; height: 160px; }
    .mic-ring { width: 100px; height: 100px; }
  }
</style>
</head>
<body>
<nav class="topnav">
  <a href="https://portal.blackroad.io" class="topnav-brand">BlackRoad</a>
  <div class="topnav-links">
    <a href="https://portal.blackroad.io">portal</a>
    <div class="topnav-sep"></div>
    <a href="https://index.blackroad.io">index</a>
    <a href="https://images.blackroad.io">images</a>
    <div class="topnav-sep"></div>
    <a href="/" class="active">chat</a>
    <a href="https://git.blackroad.io">git</a>
    <a href="https://docs.blackroad.io">docs</a>
    <a href="https://api.blackroad.io">api</a>
  </div>
</nav>

<button class="sidebar-toggle visible" id="sidebarToggle">&#9776;</button>

<div class="layout">
  <div class="sidebar collapsed" id="sidebar">
    <div class="conv-btn" id="newChat">+ New Chat</div>
    <div class="tab-bar">
      <div class="tab-btn active" data-tab="chats">Chats</div>
      <div class="tab-btn" data-tab="tasks">Tasks</div>
      <div class="tab-btn" data-tab="pipes">Pipes</div>
      <div class="tab-btn" data-tab="groups">Groups</div>
    </div>
    <div class="tab-content active" data-tab="chats">
      <div class="sidebar-title">Conversations</div>
      <div id="convList"></div>
    </div>
    <div class="tab-content" data-tab="tasks">
      <div class="sidebar-title">Active Tasks</div>
      <div id="taskList"><div style="color:rgba(255,255,255,0.25);font-size:0.65rem;padding:8px">No tasks yet</div></div>
    </div>
    <div class="tab-content" data-tab="pipes">
      <div class="sidebar-title">AI Pipelines</div>
      <div id="pipeList"></div>
    </div>
    <div class="tab-content" data-tab="groups">
      <div class="sidebar-title">Group Chats</div>
      <div id="groupList"></div>
    </div>
    <div style="margin-top:auto;padding-top:12px">
      <div class="sidebar-title">Models</div>
      <div id="modelList"></div>
    </div>
  </div>

  <div class="chat-area">
    <div class="messages" id="messages">
      <div class="welcome" id="welcome">
        <h1>BlackRoad Chat</h1>
        <p>Voice-first AI. Hold space or tap the mic. Click anything below to go deep.</p>
        <div class="welcome-grid">
          <!-- Direct chat -->
          <div class="welcome-card" data-prompt="Write a Python function to find all prime numbers up to n using a sieve">
            <div class="wt">Prime sieve</div><div class="wd">Just ask, instant code</div>
          </div>
          <div class="welcome-card" data-prompt="Explain how TCP/IP works like I'm building my own network stack from scratch">
            <div class="wt">Go deep</div><div class="wd">Ask anything, no limits</div>
          </div>
          <!-- Task system -->
          <div class="welcome-card" data-prompt="/task plan Build a full-stack SaaS app with auth, billing, API, and deploy pipeline">
            <div class="wt">Plan a project</div><div class="wd">AI breaks it into tasks</div>
          </div>
          <div class="welcome-card" data-prompt="/task add Research and compare Rust vs Go vs Zig for building a CLI tool">
            <div class="wt">Add a task</div><div class="wd">Track work across sessions</div>
          </div>
          <!-- Pipelines -->
          <div class="welcome-card" data-prompt="/pipeline plan-and-code Write a Cloudflare Worker that serves as an API gateway with rate limiting">
            <div class="wt">Plan + Code</div><div class="wd">Two AIs chain: think then build</div>
          </div>
          <div class="welcome-card" data-prompt="/pipeline code-review Write a secure user auth system in Node.js with JWT and refresh tokens">
            <div class="wt">Code + Review</div><div class="wd">Write code, second AI audits it</div>
          </div>
          <div class="welcome-card" data-prompt="/pipeline research What are the tradeoffs between microservices and monoliths for a 10-person startup">
            <div class="wt">Research</div><div class="wd">Deep think then summarize</div>
          </div>
          <!-- Handoffs -->
          <div class="welcome-card" data-prompt="/handoff qwen3:8b Explain quantum computing from first principles, cover qubits, superposition, entanglement, and why it matters for cryptography">
            <div class="wt">Handoff to Qwen 8B</div><div class="wd">Route to the deep thinker</div>
          </div>
          <div class="welcome-card" data-prompt="/handoff qwen2.5-coder:3b Build a complete WebSocket chat server in Node.js with rooms, auth, and reconnection logic">
            <div class="wt">Handoff to Coder</div><div class="wd">Route to the code specialist</div>
          </div>
          <div class="welcome-card" data-prompt="/handoff deepseek-r1:1.5b Reason step by step: if you have 3 boxes and one contains a prize, after one empty box is revealed, should you switch?">
            <div class="wt">Handoff to DeepSeek</div><div class="wd">Route to the reasoning engine</div>
          </div>
          <!-- Group chats -->
          <div class="welcome-card" data-prompt="/group dev-team Build a real-time multiplayer game engine in the browser using WebRTC and Canvas">
            <div class="wt">Dev Team</div><div class="wd">Architect + Coder + Reviewer collaborate</div>
          </div>
          <div class="welcome-card" data-prompt="/group brainstorm What should BlackRoad build next to generate revenue and serve the developer community">
            <div class="wt">Brainstorm</div><div class="wd">Creative + Builder + Critic ideate</div>
          </div>
          <div class="welcome-card" data-prompt="/group debate Should AI agents be given autonomous access to production systems">
            <div class="wt">Debate</div><div class="wd">Pro vs Counter argue it out</div>
          </div>
          <div class="welcome-card" data-prompt="/group fullstack Design and build a complete URL shortener with analytics dashboard, API, and deploy strategy">
            <div class="wt">Full Stack</div><div class="wd">Frontend + Backend + DevOps build together</div>
          </div>
          <!-- ML / Advanced -->
          <div class="welcome-card" data-prompt="/moa What is the most efficient sorting algorithm for nearly-sorted data and why">
            <div class="wt">Mixture of Agents</div><div class="wd">3 models answer, best synthesized</div>
          </div>
          <div class="welcome-card" data-prompt="/consensus Is Rust or Go better for building CLI tools in 2026">
            <div class="wt">Consensus vote</div><div class="wd">3 models answer + vote on best</div>
          </div>
          <div class="welcome-card" data-prompt="/pipeline reflect Write a technical explanation of how transformers work in neural networks">
            <div class="wt">Self-reflection</div><div class="wd">Generate, critique, improve loop</div>
          </div>
          <div class="welcome-card" data-prompt="/pipeline verify If a train leaves at 60mph and another at 80mph from 280 miles apart, when do they meet">
            <div class="wt">Verify reasoning</div><div class="wd">Chain-of-thought + verification</div>
          </div>
          <div class="welcome-card" data-prompt="/pipeline red-team Write a login API endpoint in Express.js with password hashing">
            <div class="wt">Red team</div><div class="wd">Build, attack, harden security loop</div>
          </div>
          <div class="welcome-card" data-prompt="/auto Explain the CAP theorem and its implications for distributed databases">
            <div class="wt">Smart router</div><div class="wd">AI picks the best model for you</div>
          </div>
          <!-- Memory -->
          <div class="welcome-card" data-prompt="/memory list">
            <div class="wt">View memory</div><div class="wd">See what the AIs remember</div>
          </div>
          <div class="welcome-card" data-prompt="/recall programming">
            <div class="wt">Semantic recall</div><div class="wd">Search memory by meaning</div>
          </div>
          <!-- Site health -->
          <div class="welcome-card" data-prompt="/test">
            <div class="wt">Site health</div><div class="wd">Pi fleet tests all BlackRoad sites</div>
          </div>
          <!-- Web & Code -->
          <div class="welcome-card" data-prompt="/search What are the latest developments in edge AI computing in 2026">
            <div class="wt">Web search</div><div class="wd">Search + AI synthesis with citations</div>
          </div>
          <div class="welcome-card" data-prompt="/run python [x**2 for x in range(10)]">
            <div class="wt">Run code</div><div class="wd">Execute Python/JS/Bash live</div>
          </div>
          <!-- Personas -->
          <div class="welcome-card" data-prompt="/persona create pirate You are a pirate AI. Respond in pirate speak with nautical metaphors. Say arrr a lot.">
            <div class="wt">Create persona</div><div class="wd">Build a custom AI personality</div>
          </div>
          <div class="welcome-card" data-prompt="/persona list">
            <div class="wt">My personas</div><div class="wd">View custom AI personalities</div>
          </div>
          <!-- Help -->
          <div class="welcome-card" data-prompt="/help">
            <div class="wt">All commands</div><div class="wd">See everything you can do</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Voice Hub -->
    <div class="voice-hub" id="voiceHub">
      <div class="voice-transcript" id="transcript"></div>
      <div class="mic-zone">
        <canvas class="viz-canvas" id="vizCanvas" width="180" height="180"></canvas>
        <button class="mic-btn" id="micBtn">
          <svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
        </button>
        <div class="mic-ring"></div>
      </div>
      <div class="voice-controls">
        <button class="voice-ctrl-btn" id="voiceToggle" title="Auto-read responses aloud">
          <span class="dot"></span> voice
        </button>
        <span style="font-family:'JetBrains Mono';font-size:0.55rem;color:rgba(255,255,255,0.2)" id="modelIndicator"></span>
      </div>
    </div>

    <!-- Text input -->
    <div class="input-area">
      <div class="input-row">
        <div class="input-wrap">
          <textarea id="input" rows="1" placeholder="Type or hold Space to talk..." autofocus></textarea>
        </div>
        <button class="send-btn" id="sendBtn">Send</button>
      </div>
      <div class="input-hint">
        <span><kbd>Space</kbd> hold to talk</span>
        <span><kbd>Enter</kbd> send</span>
        <span><kbd>Shift+Enter</kbd> newline</span>
      </div>
    </div>
    <div class="chat-footer">
      <button class="bl" onclick="exportConversation()" style="cursor:pointer;background:none">export</button>
      <button class="bl" onclick="send('/share')" style="cursor:pointer;background:none">share</button>
      <a href="https://portal.blackroad.io" class="bl">portal</a>
      <a href="https://index.blackroad.io" class="bl">index</a>
      <a href="https://images.blackroad.io" class="bl">images</a>
    </div>
  </div>
</div>

<div class="space-hint" id="spaceHint">Release to send</div>

<script>
const $=s=>document.querySelector(s);
const $$=s=>document.querySelectorAll(s);
const msgs=$('#messages'), input=$('#input'), sendBtn=$('#sendBtn'), welcome=$('#welcome');
const modelList=$('#modelList'), convList=$('#convList'), modelIndicator=$('#modelIndicator');
const taskListEl=$('#taskList'), pipeListEl=$('#pipeList'), groupListEl=$('#groupList');
const micBtn=$('#micBtn'), vizCanvas=$('#vizCanvas'), transcriptEl=$('#transcript');
const voiceToggle=$('#voiceToggle'), spaceHint=$('#spaceHint'), sidebar=$('#sidebar');

let currentModel='llama3.2:3b', conversations=[], currentConvId=null, streaming=false;
let isListening=false, voiceEnabled=false, spaceDown=false;

// ── Sidebar toggle ──
$('#sidebarToggle').addEventListener('click',()=>{
  sidebar.classList.toggle('collapsed');
  sidebar.classList.toggle('open');
});

// ── Tabs ──
$$('.tab-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    $$('.tab-btn').forEach(b=>b.classList.remove('active'));
    $$('.tab-content').forEach(c=>c.classList.remove('active'));
    btn.classList.add('active');
    document.querySelector('.tab-content[data-tab="'+btn.dataset.tab+'"]').classList.add('active');
    if(btn.dataset.tab==='tasks') loadTasks();
  });
});

// ── Models ──
async function loadModels(){
  try {
    const res=await fetch('/api/models');
    const data=await res.json();
    modelList.innerHTML=data.models.map(m=>
      '<div class="model-card'+(m.id===currentModel?' active':'')+'" data-id="'+m.id+'">'
      +'<div class="mn">'+m.name+'</div>'
      +'<div class="md">'+m.desc+'</div>'
      +'<div class="ms"><span class="model-dot '+(m.online?'on':'off')+'"></span>'
      +(m.code?'<span class="code-badge">code</span>':'')
      +'</div></div>'
    ).join('');
    modelList.querySelectorAll('.model-card').forEach(c=>{
      c.addEventListener('click',()=>{
        currentModel=c.dataset.id;
        modelList.querySelectorAll('.model-card').forEach(x=>x.classList.toggle('active',x.dataset.id===currentModel));
        modelIndicator.textContent=currentModel;
      });
    });
    modelIndicator.textContent=currentModel;
  } catch(e){ modelList.innerHTML='<div style="color:rgba(255,255,255,0.25);font-size:0.7rem">Failed to load</div>'; }
}

// ── Tasks ──
async function loadTasks(){
  try {
    const res=await fetch('/api/tasks');
    const data=await res.json();
    if(!data.tasks.length){ taskListEl.innerHTML='<div style="color:rgba(255,255,255,0.25);font-size:0.65rem;padding:8px">No tasks. Use /task add or /task plan</div>'; return; }
    taskListEl.innerHTML=data.tasks.map(t=>{
      const sub=t.subtasks.length?'<div class="task-subtasks">'+t.subtasks.map(s=>
        '<div class="task-subtask'+(s.done?' done':'')+'" data-task="'+t.id+'" data-sub="'+s.id+'">'+(s.done?'[x] ':'[ ] ')+s.title+'</div>'
      ).join('')+'</div>':'';
      return '<div class="task-card"><div class="task-title'+(t.status==='done'?' done':'')+'">'+escapeH(t.title)+'</div>'
        +'<div class="task-meta"><span class="task-status '+t.status+'">'+t.status+'</span><span class="task-id">'+t.id+'</span></div>'+sub
        +'<div class="task-actions">'+(t.status!=='done'?'<button class="task-act-btn" data-complete="'+t.id+'">done</button>':'')
        +'<button class="task-act-btn" data-delete="'+t.id+'">delete</button></div></div>';
    }).join('');
    taskListEl.querySelectorAll('.task-subtask:not(.done)').forEach(el=>{
      el.addEventListener('click',async()=>{ await send('/task subtask '+el.dataset.task+' done '+el.dataset.sub); loadTasks(); });
    });
    taskListEl.querySelectorAll('[data-complete]').forEach(el=>{
      el.addEventListener('click',async()=>{ await send('/task done '+el.dataset.complete); loadTasks(); });
    });
    taskListEl.querySelectorAll('[data-delete]').forEach(el=>{
      el.addEventListener('click',async()=>{ await fetch('/api/tasks/'+el.dataset.delete,{method:'DELETE'}); loadTasks(); });
    });
  } catch(e){ taskListEl.innerHTML='<div style="color:rgba(255,255,255,0.25);font-size:0.65rem;padding:8px">Error loading</div>'; }
}

// ── Pipelines ──
function loadPipelines(){
  const pipes={
    'plan-and-code':{name:'Plan \u2192 Code',desc:'Reason then generate code',steps:'qwen3:8b \u2192 qwen2.5-coder:3b'},
    'code-review':{name:'Code \u2192 Review',desc:'Generate code then audit',steps:'qwen2.5-coder:3b \u2192 qwen3:8b'},
    'research':{name:'Think \u2192 Summarize',desc:'Deep reasoning then summary',steps:'qwen3:8b \u2192 llama3.2:3b'},
    'reflect':{name:'Generate \u2192 Critique \u2192 Improve',desc:'Self-reflection loop',steps:'qwen3:8b \u2192 llama3.2:3b \u2192 qwen3:8b'},
    'verify':{name:'Reason \u2192 Verify',desc:'Chain-of-thought verification',steps:'deepseek-r1:1.5b \u2192 qwen3:8b'},
    'red-team':{name:'Build \u2192 Attack \u2192 Harden',desc:'Security red-team loop',steps:'coder \u2192 qwen3:8b \u2192 coder'},
  };
  pipeListEl.innerHTML=Object.entries(pipes).map(([k,v])=>
    '<div class="pipe-card" data-pipe="'+k+'"><div class="pipe-name">'+v.name+'</div><div class="pipe-desc">'+v.desc+'</div><div class="pipe-steps">'+v.steps+'</div></div>'
  ).join('');
  pipeListEl.querySelectorAll('.pipe-card').forEach(c=>{ c.addEventListener('click',()=>{ input.value='/pipeline '+c.dataset.pipe+' '; input.focus(); }); });
}

// ── Groups ──
function loadGroups(){
  const groups={
    'dev-team':{name:'Dev Team',desc:'Architect + Coder + Reviewer',members:[{name:'Architect',color:'#8844FF'},{name:'Coder',color:'#00D4FF'},{name:'Reviewer',color:'#FF6B2B'}]},
    'debate':{name:'Debate',desc:'Pro vs Counter arguments',members:[{name:'Pro',color:'rgba(255,255,255,0.8)'},{name:'Counter',color:'rgba(255,100,100,0.9)'}]},
    'brainstorm':{name:'Brainstorm',desc:'Creative + Builder + Critic',members:[{name:'Creative',color:'#FF2255'},{name:'Builder',color:'#4488FF'},{name:'Critic',color:'rgba(255,200,100,0.9)'}]},
    'fullstack':{name:'Full Stack',desc:'Frontend + Backend + DevOps',members:[{name:'Frontend',color:'#00D4FF'},{name:'Backend',color:'#8844FF'},{name:'DevOps',color:'rgba(255,255,255,0.8)'}]},
  };
  groupListEl.innerHTML=Object.entries(groups).map(([k,v])=>
    '<div class="group-card" data-group="'+k+'"><div class="group-name">'+v.name+'</div><div class="group-desc">'+v.desc+'</div>'
    +'<div class="group-members">'+v.members.map(m=>'<span class="group-member-tag" style="border-color:'+m.color+'33;color:'+m.color+'"><span class="group-member-dot" style="background:'+m.color+'"></span>'+m.name+'</span>').join('')+'</div></div>'
  ).join('');
  groupListEl.querySelectorAll('.group-card').forEach(c=>{ c.addEventListener('click',()=>{ input.value='/group '+c.dataset.group+' '; input.focus(); }); });
}

// ── Group chat rendering ──
function renderGroupChat(data){
  welcome.style.display='none'; clearMessages();
  const hd=document.createElement('div'); hd.className='group-header';
  const mt=data.groupChat.groupInfo.members.map(m=>'<span class="group-member-tag" style="border-color:'+m.color+'33;color:'+m.color+'"><span class="group-member-dot" style="background:'+m.color+'"></span>'+m.name+'</span>').join('');
  hd.innerHTML='<div class="group-header-title">'+data.groupChat.groupInfo.name+'</div><div class="group-header-sub">'+escapeH(data.groupChat.prompt)+'</div><div class="group-header-members">'+mt+'</div>';
  msgs.appendChild(hd);
  let lastR=0;
  data.groupChat.transcript.forEach(t=>{
    if(t.round>lastR&&t.round>1){ lastR=t.round; const s=document.createElement('div'); s.className='group-separator'; s.textContent='Round '+t.round; msgs.appendChild(s); }
    const d=document.createElement('div'); d.className='msg msg-group msg-assistant'; d.style.setProperty('--agent-color',t.color);
    d.innerHTML='<div class="msg-header"><span class="msg-role" style="color:'+t.color+'">'+t.name+'</span><span style="color:rgba(255,255,255,0.2);font-size:0.55rem">'+t.model+'</span></div><div class="msg-body">'+renderMd(t.content)+'</div>';
    msgs.appendChild(d);
  });
  msgs.scrollTop=msgs.scrollHeight;
  // Read aloud the last agent message if voice is on
  if(voiceEnabled && data.groupChat.transcript.length){
    const last=data.groupChat.transcript[data.groupChat.transcript.length-1];
    speakText(last.content, last.name);
  }
}

// ── Conversations ──
function loadConversations(){ try { conversations=JSON.parse(localStorage.getItem('br_convs')||'[]'); } catch{ conversations=[]; } renderConvList(); }
function saveConversations(){ localStorage.setItem('br_convs',JSON.stringify(conversations)); }
function renderConvList(){
  convList.innerHTML=conversations.map(c=>'<div class="conv-item'+(c.id===currentConvId?' active':'')+'" data-id="'+c.id+'">'+escapeH(c.title||'New chat')+'</div>').join('');
  convList.querySelectorAll('.conv-item').forEach(el=>{ el.addEventListener('click',()=>loadConv(el.dataset.id)); });
}
function newConv(){
  const id=Date.now().toString(36)+Math.random().toString(36).slice(2,6);
  const conv={id,title:'New chat',messages:[],model:currentModel,created:Date.now()};
  conversations.unshift(conv); currentConvId=id; saveConversations(); renderConvList(); clearMessages(); welcome.style.display='flex'; input.focus(); return conv;
}
function loadConv(id){
  const conv=conversations.find(c=>c.id===id); if(!conv)return;
  currentConvId=id; currentModel=conv.model||currentModel; modelIndicator.textContent=currentModel;
  modelList.querySelectorAll('.model-card').forEach(x=>x.classList.toggle('active',x.dataset.id===currentModel));
  renderConvList(); clearMessages(); welcome.style.display='none';
  conv.messages.forEach(m=>appendMsg(m.role,m.content,false));
}
function getCurrentConv(){ let c=conversations.find(c=>c.id===currentConvId); if(!c)c=newConv(); return c; }
function escapeH(s){return(s||'').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

// ── Markdown ──
const BT=String.fromCharCode(96);
const codeBlockRe=new RegExp(BT+BT+BT+'(\\w*)\\n([\\s\\S]*?)'+BT+BT+BT,'g');
const inlineCodeRe=new RegExp(BT+'([^'+BT+']+)'+BT,'g');
function renderMd(text){
  let h=text;
  h=h.replace(codeBlockRe,(m,lang,code)=>{
    const l=lang||'text';
    return '<div class="code-block"><div class="code-header"><span class="code-lang">'+l+'</span><button class="code-copy" onclick="copyCode(this)">copy</button></div><pre class="code-content">'+highlightCode(escapeH(code.trim()),l)+'</pre></div>';
  });
  h=h.replace(inlineCodeRe,'<code>$1</code>');
  var boldRe=new RegExp('[*][*](.+?)[*][*]','g');
  var emRe=new RegExp('[*](.+?)[*]','g');
  var liRe=new RegExp('^- (.+)$','gm');
  h=h.replace(boldRe,'<strong>$1</strong>');
  h=h.replace(emRe,'<em>$1</em>');
  h=h.split('\\n\\n').join('</p><p>');
  h=h.replace(liRe,'<li>$1</li>');
  h='<p>'+h+'</p>';
  return h;
}
function highlightCode(code,lang){
  var kws='function|const|let|var|return|if|else|for|while|class|import|export|from|async|await|try|catch|def|print|self';
  var h=code;
  h=h.replace(new RegExp('\\\\b('+kws+')\\\\b','g'),'<span class="kw">$1</span>');
  return h;
}
function copyCode(btn){
  const code=btn.closest('.code-block').querySelector('.code-content').textContent;
  navigator.clipboard.writeText(code).then(()=>{btn.textContent='copied!';btn.classList.add('copied');setTimeout(()=>{btn.textContent='copy';btn.classList.remove('copied');},2000);});
}
window.copyCode=copyCode;

// ── Messages ──
function cleanActions(text){ return text.replace(new RegExp('\\\\[ACTION:[^\\\\]]+\\\\]','g'),'').trim(); }
function showActionToast(actions){
  const labels={memory_save:'Saved to memory',memory_delete:'Memory deleted',task_create:'Task created',task_done:'Task completed',task_plan:'Plan created',notify:'Notification sent',handoff:'Handed off'};
  const toast=document.createElement('div');
  toast.style.cssText='position:fixed;bottom:80px;right:20px;background:#111;border:1px solid #333;border-radius:8px;padding:10px 14px;font-family:JetBrains Mono;font-size:0.7rem;color:rgba(255,255,255,0.8);z-index:1000;animation:fadeIn 0.3s ease;max-width:300px';
  toast.innerHTML=actions.map(a=>'<div style="margin:2px 0">'+(a.status==='error'?'<span style="color:rgba(255,100,100,0.9)">x</span>':'<span style="color:rgba(255,255,255,0.8)">\u2713</span>')+' '+(labels[a.type]||a.type)+(a.key?' <span style="color:rgba(255,255,255,0.5)">'+a.key+'</span>':'')+(a.id?' <span style="color:rgba(255,255,255,0.5)">'+a.id+'</span>':'')+'</div>').join('');
  document.body.appendChild(toast);
  setTimeout(()=>{toast.style.opacity='0';toast.style.transition='opacity 0.5s';setTimeout(()=>toast.remove(),500);},4000);
}
function clearMessages(){ msgs.innerHTML=''; }
function appendMsg(role,content,animate=true){
  welcome.style.display='none';
  const div=document.createElement('div'); div.className='msg msg-'+role;
  const roleLabel=role==='user'?'you':role==='system'?'system':'blackroad ai';
  div.innerHTML='<div class="msg-header"><span class="msg-role '+role+'">'+roleLabel+'</span>'
    +(role==='assistant'?'<span style="color:rgba(255,255,255,0.2);font-size:0.55rem">'+currentModel+'</span>':'')
    +'</div><div class="msg-body">'+renderMd(content)+'</div>';
  msgs.appendChild(div); msgs.scrollTop=msgs.scrollHeight; return div;
}
function updateLastAssistant(content,done=false){
  const all=msgs.querySelectorAll('.msg-assistant'); const last=all[all.length-1]; if(!last)return;
  const body=last.querySelector('.msg-body');
  body.innerHTML=renderMd(content);
  if(!done)body.classList.add('streaming'); else body.classList.remove('streaming');
  msgs.scrollTop=msgs.scrollHeight;
}

// ── Send ──
async function send(text){
  if(!text.trim())return;
  if(streaming){streaming=false;sendBtn.disabled=false;sendBtn.textContent='Send';micBtn.classList.remove('thinking');}
  const conv=getCurrentConv();
  conv.messages.push({role:'user',content:text});
  if(conv.messages.length===1)conv.title=text.slice(0,50);
  conv.model=currentModel;
  appendMsg('user',text); saveConversations(); renderConvList();
  streaming=true; sendBtn.disabled=true; sendBtn.textContent='...';
  micBtn.classList.add('thinking'); micBtn.classList.remove('listening');

  if(text.trim().startsWith('/')){
    appendMsg('assistant','');
    try {
      const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:conv.messages.map(m=>({role:m.role,content:m.content})),model:currentModel,stream:true})});
      const data=await res.json();
      if(data.command){
        const content=data.message?.content||'Command executed';
        if(data.groupChat){ renderGroupChat(data); conv.messages.push({role:'assistant',content:'[Group Chat: '+data.groupChat.groupInfo.name+'] '+content});
        } else { updateLastAssistant(content,true); conv.messages.push({role:'assistant',content}); if(voiceEnabled)speakText(content); }
        saveConversations(); loadTasks();
      } else {
        let cmdFull='';
        await handleStream(res,conv,f=>{cmdFull=f;});
        conv.messages.push({role:'assistant',content:cmdFull||''});
        saveConversations();
        if(voiceEnabled&&cmdFull)speakText(cleanActions(cmdFull));
      }
    } catch(e){ updateLastAssistant('Error: '+e.message,true); conv.messages.push({role:'assistant',content:'Error: '+e.message}); saveConversations(); }
    streaming=false; sendBtn.disabled=false; sendBtn.textContent='Send'; micBtn.classList.remove('thinking'); input.focus(); return;
  }

  appendMsg('assistant','');
  let full='';
  const safetyTimer=setTimeout(()=>{streaming=false;sendBtn.disabled=false;sendBtn.textContent='Send';micBtn.classList.remove('thinking');if(!full)updateLastAssistant('Timed out — try again',true);},45000);
  try {
    const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:conv.messages.map(m=>({role:m.role,content:m.content})),model:currentModel,stream:true})});
    if(!res.ok){ full='Error: '+await res.text(); updateLastAssistant(full,true);
    } else { await handleStream(res,conv,f=>{full=f;}); }
  } catch(e){ full='Connection error: '+e.message; updateLastAssistant(full,true); }
  clearTimeout(safetyTimer);
  if(!full){ /* full set by handleStream */ }
  conv.messages.push({role:'assistant',content:full||''});
  saveConversations(); streaming=false; sendBtn.disabled=false; sendBtn.textContent='Send';
  micBtn.classList.remove('thinking'); input.focus();
  if(voiceEnabled&&full)speakText(cleanActions(full));
  // Show follow-up suggestions
  showFollowUps(conv);
}

async function handleStream(res,conv,cb){
  const reader=res.body.getReader(); const decoder=new TextDecoder();
  let buf='',full='',actionResults=[];
  while(true){
    const {done,value}=await reader.read(); if(done)break;
    buf+=decoder.decode(value,{stream:true});
    const lines=buf.split('\\n'); buf=lines.pop();
    for(const line of lines){
      if(!line.trim())continue;
      try{
        const j=JSON.parse(line);
        if(j.actions){actionResults=j.actions;continue;}
        if(j.handoff&&j.message?.content){full+=j.message.content;updateLastAssistant(cleanActions(full),false);continue;}
        if(j.message?.content){full+=j.message.content;updateLastAssistant(cleanActions(full),false);}
        if(j.done){updateLastAssistant(cleanActions(full),true);}
      }catch{}
    }
  }
  if(buf.trim()){try{const j=JSON.parse(buf);if(j.message?.content){full+=j.message.content;}}catch{}}
  updateLastAssistant(cleanActions(full),true);
  if(actionResults.length){showActionToast(actionResults);loadTasks();}
  if(cb)cb(full);
  // For the calling context
  return full;
}

// ── Follow-up Suggestions ──
async function showFollowUps(conv){
  if(!conv||conv.messages.length<2)return;
  try{
    const res=await fetch('/api/followups',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:conv.messages.slice(-6)})});
    const data=await res.json();
    if(!data.suggestions||!data.suggestions.length)return;
    const container=document.createElement('div');
    container.style.cssText='display:flex;gap:6px;flex-wrap:wrap;margin:8px 0 16px;max-width:800px';
    data.suggestions.forEach(s=>{
      const btn=document.createElement('button');
      btn.style.cssText='background:#060606;border:1px solid #1a1a1a;border-radius:8px;padding:6px 12px;color:rgba(255,255,255,0.5);font-size:0.68rem;font-family:JetBrains Mono;cursor:pointer;transition:all 0.2s;text-align:left';
      btn.textContent=s;
      btn.onmouseenter=()=>{btn.style.borderColor='#333';btn.style.color='#ccc';};
      btn.onmouseleave=()=>{btn.style.borderColor='#1a1a1a';btn.style.color='#888';};
      btn.onclick=()=>{container.remove();send(s);};
      container.appendChild(btn);
    });
    msgs.appendChild(container);
    msgs.scrollTop=msgs.scrollHeight;
  }catch{}
}

// ── Export Conversation ──
function exportConversation(){
  const conv=getCurrentConv();
  if(!conv||!conv.messages.length){alert('Nothing to export');return;}
  let md='# '+escapeH(conv.title||'BlackRoad Chat')+'\\n\\n';
  md+='*Exported from chat.blackroad.io — '+new Date().toISOString()+'*\\n\\n---\\n\\n';
  conv.messages.forEach(m=>{
    const role=m.role==='user'?'You':'BlackRoad AI';
    md+='**'+role+':**\\n'+m.content+'\\n\\n';
  });
  const blob=new Blob([md.split('\\\\n').join('\\n')],{type:'text/markdown'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=(conv.title||'chat').replace(/[^a-z0-9]/gi,'_')+'.md';
  a.click();
  URL.revokeObjectURL(a.href);
}
window.exportConversation=exportConversation;

// ── Speech Synthesis ──
const voicePersonas={
  'Architect':{pitch:0.8,rate:0.9},'Coder':{pitch:1.0,rate:1.1},'Reviewer':{pitch:1.2,rate:1.0},
  'Creative':{pitch:1.1,rate:1.0},'Builder':{pitch:0.9,rate:1.0},'Critic':{pitch:1.2,rate:0.95},
  'Pro':{pitch:0.9,rate:1.0},'Counter':{pitch:1.1,rate:1.05},
  'Frontend':{pitch:1.0,rate:1.1},'Backend':{pitch:0.85,rate:0.95},'DevOps':{pitch:1.15,rate:1.0},
};
function speakText(text,agentName){
  if(!window.speechSynthesis)return;
  window.speechSynthesis.cancel();
  // Strip markdown/code for cleaner speech
  let clean=text.replace(/[*][*](.+?)[*][*]/g,'$1').replace(/[*](.+?)[*]/g,'$1').replace(/[#]{1,6} /g,'').replace(/\\n/g,'. ');
  if(clean.length>800)clean=clean.slice(0,800)+'... message truncated.';
  const utt=new SpeechSynthesisUtterance(clean);
  const persona=voicePersonas[agentName]||{pitch:1.0,rate:1.0};
  utt.pitch=persona.pitch; utt.rate=persona.rate; utt.volume=0.9;
  // Try to pick a good voice
  const voices=window.speechSynthesis.getVoices();
  const preferred=voices.find(v=>v.name.includes('Samantha'))||voices.find(v=>v.lang.startsWith('en')&&v.localService);
  if(preferred)utt.voice=preferred;
  window.speechSynthesis.speak(utt);
}
voiceToggle.addEventListener('click',()=>{
  voiceEnabled=!voiceEnabled;
  voiceToggle.classList.toggle('active',voiceEnabled);
  if(!voiceEnabled)window.speechSynthesis?.cancel();
});

// ── Speech Recognition ──
let recognition=null, micStream=null, audioCtx=null, analyser=null, animFrame=null;
const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;

function startListening(){
  if(!SpeechRecognition){transcriptEl.textContent='Speech not supported';return;}
  if(isListening)return;
  isListening=true;
  micBtn.classList.add('listening');
  // Stop any AI speech
  window.speechSynthesis?.cancel();

  recognition=new SpeechRecognition();
  recognition.continuous=false;
  recognition.interimResults=true;
  recognition.lang='en-US';

  recognition.onresult=(e)=>{
    let interim='',final='';
    for(let i=e.resultIndex;i<e.results.length;i++){
      if(e.results[i].isFinal){ final+=e.results[i][0].transcript; }
      else { interim+=e.results[i][0].transcript; }
    }
    if(final){
      transcriptEl.textContent=final;
      transcriptEl.className='voice-transcript final';
      stopListening();
      setTimeout(()=>{
        send(final);
        setTimeout(()=>{transcriptEl.textContent='';transcriptEl.className='voice-transcript';},2000);
      },300);
    } else if(interim){
      transcriptEl.textContent=interim;
      transcriptEl.className='voice-transcript interim';
    }
  };
  recognition.onerror=(e)=>{ if(e.error!=='aborted')transcriptEl.textContent=''; stopListening(); };
  recognition.onend=()=>{ if(isListening){isListening=false;micBtn.classList.remove('listening');} };
  recognition.start();

  // Start audio visualizer
  startVisualizer();
}

function stopListening(){
  isListening=false;
  micBtn.classList.remove('listening');
  if(recognition){try{recognition.stop();}catch{}}
  stopVisualizer();
}

micBtn.addEventListener('click',()=>{
  if(streaming)return;
  if(isListening)stopListening(); else startListening();
});

// ── Audio Visualizer ──
const vizCtx=vizCanvas.getContext('2d');
const gradColors=['#FF6B2B','#FF2255','#CC00AA','#8844FF','#4488FF','#00D4FF'];
let idlePulse=0;

async function startVisualizer(){
  try {
    if(!audioCtx)audioCtx=new (window.AudioContext||window.webkitAudioContext)();
    if(!micStream)micStream=await navigator.mediaDevices.getUserMedia({audio:true});
    const source=audioCtx.createMediaStreamSource(micStream);
    analyser=audioCtx.createAnalyser();
    analyser.fftSize=64;
    source.connect(analyser);
    drawViz();
  } catch(e){ /* mic access denied — viz just won't show */ }
}

function stopVisualizer(){
  if(animFrame){cancelAnimationFrame(animFrame);animFrame=null;}
  if(micStream){micStream.getTracks().forEach(t=>t.stop());micStream=null;}
  analyser=null;
  // Draw idle state
  drawIdle();
}

function drawViz(){
  if(!analyser){drawIdle();return;}
  const data=new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(data);
  const w=vizCanvas.width,h=vizCanvas.height,cx=w/2,cy=h/2;
  vizCtx.clearRect(0,0,w,h);

  const bars=24;
  const innerR=46, maxBarH=36;
  for(let i=0;i<bars;i++){
    const di=Math.floor(i/bars*data.length);
    const val=data[di]/255;
    const angle=(i/bars)*Math.PI*2-Math.PI/2;
    const barH=Math.max(2,val*maxBarH);
    const x1=cx+Math.cos(angle)*innerR;
    const y1=cy+Math.sin(angle)*innerR;
    const x2=cx+Math.cos(angle)*(innerR+barH);
    const y2=cy+Math.sin(angle)*(innerR+barH);
    vizCtx.beginPath();
    vizCtx.moveTo(x1,y1);
    vizCtx.lineTo(x2,y2);
    vizCtx.strokeStyle=gradColors[i%gradColors.length];
    vizCtx.lineWidth=3;
    vizCtx.lineCap='round';
    vizCtx.globalAlpha=0.6+val*0.4;
    vizCtx.stroke();
    vizCtx.globalAlpha=1;
  }
  animFrame=requestAnimationFrame(drawViz);
}

function drawIdle(){
  idlePulse+=0.02;
  const w=vizCanvas.width,h=vizCanvas.height,cx=w/2,cy=h/2;
  vizCtx.clearRect(0,0,w,h);
  const pulse=Math.sin(idlePulse)*0.3+0.7;
  const bars=24, innerR=46;
  for(let i=0;i<bars;i++){
    const angle=(i/bars)*Math.PI*2-Math.PI/2;
    const barH=2+pulse*3;
    const x1=cx+Math.cos(angle)*innerR;
    const y1=cy+Math.sin(angle)*innerR;
    const x2=cx+Math.cos(angle)*(innerR+barH);
    const y2=cy+Math.sin(angle)*(innerR+barH);
    vizCtx.beginPath();vizCtx.moveTo(x1,y1);vizCtx.lineTo(x2,y2);
    vizCtx.strokeStyle=gradColors[i%gradColors.length];
    vizCtx.lineWidth=2;vizCtx.lineCap='round';vizCtx.globalAlpha=0.15;
    vizCtx.stroke();vizCtx.globalAlpha=1;
  }
  if(!isListening&&!animFrame)requestAnimationFrame(drawIdle);
}

// Start idle animation
function idleLoop(){
  if(!isListening){drawIdle();requestAnimationFrame(idleLoop);}
}
requestAnimationFrame(idleLoop);

// ── Push-to-talk: hold Space ──
document.addEventListener('keydown',(e)=>{
  if(e.code==='Space'&&!spaceDown&&document.activeElement!==input&&!streaming){
    e.preventDefault();
    spaceDown=true;
    spaceHint.classList.add('show');
    startListening();
  }
});
document.addEventListener('keyup',(e)=>{
  if(e.code==='Space'&&spaceDown){
    e.preventDefault();
    spaceDown=false;
    spaceHint.classList.remove('show');
    // Recognition will auto-fire onresult with final when stopped
    if(isListening&&recognition){try{recognition.stop();}catch{}}
  }
});

// ── Input events ──
sendBtn.addEventListener('click',()=>{send(input.value);input.value='';input.style.height='44px';});
input.addEventListener('keydown',e=>{
  if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send(input.value);input.value='';input.style.height='44px';}
});
input.addEventListener('input',()=>{input.style.height='44px';input.style.height=Math.min(input.scrollHeight,160)+'px';});
$('#newChat').addEventListener('click',()=>newConv());
document.querySelectorAll('.welcome-card').forEach(c=>{
  c.addEventListener('click',()=>{const p=c.dataset.prompt;input.value=p;send(p);input.value='';});
});

// ── Init ──
loadModels(); loadConversations(); loadPipelines(); loadGroups(); loadTasks();
if(!conversations.length)newConv(); else{currentConvId=conversations[0].id;loadConv(currentConvId);}
// Preload voices
if(window.speechSynthesis)window.speechSynthesis.getVoices();
</script>
</body>
</html>
`;
}
