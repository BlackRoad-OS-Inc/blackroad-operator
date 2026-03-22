// BlackRoad Autonomous Agents API
// Enhanced worker supporting the autonomous workflow system
// Deploy: wrangler deploy

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-BR-API-KEY',
  'Content-Type': 'application/json'
};

// =============================================================================
// Main Worker
// =============================================================================
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    try {
      // Route handling
      const router = new Router(env);

      // Health & Info
      if (path === '/' || path === '/health') {
        return router.health();
      }

      // ===========================================
      // Agent Endpoints
      // ===========================================
      if (path === '/agents' && method === 'GET') {
        return router.listAgents(url.searchParams);
      }

      if (path.match(/^\/agents\/(agent-\d{4})$/) && method === 'GET') {
        const id = path.split('/')[2];
        return router.getAgent(id);
      }

      if (path === '/agents/stats') {
        return router.getAgentStats();
      }

      // ===========================================
      // Memory Endpoints (for persistent context)
      // ===========================================
      if (path === '/memory' && method === 'POST') {
        const body = await request.json();
        return router.saveMemory(body);
      }

      if (path.match(/^\/memory\/(.+)$/) && method === 'GET') {
        const key = decodeURIComponent(path.split('/memory/')[1]);
        return router.getMemory(key);
      }

      if (path === '/memory/search' && method === 'GET') {
        const query = url.searchParams.get('q');
        return router.searchMemory(query);
      }

      // ===========================================
      // Autonomous Workflow Endpoints
      // ===========================================

      // AI Agent Response (for @blackroad-agents mentions)
      if (path === '/agent' && method === 'POST') {
        const body = await request.json();
        return router.agentResponse(body);
      }

      // Code Review
      if (path === '/review' && method === 'POST') {
        const body = await request.json();
        return router.codeReview(body);
      }

      // Auto-Fix
      if (path === '/autofix' && method === 'POST') {
        const body = await request.json();
        return router.autoFix(body);
      }

      // Fix (for self-healer)
      if (path === '/fix' && method === 'POST') {
        const body = await request.json();
        return router.suggestFix(body);
      }

      // Issue Analysis
      if (path === '/analyze-issue' && method === 'POST') {
        const body = await request.json();
        return router.analyzeIssue(body);
      }

      // Cross-Repo Coordination
      if (path === '/coordinate' && method === 'POST') {
        const body = await request.json();
        return router.coordinate(body);
      }

      // Broadcast
      if (path === '/broadcast' && method === 'POST') {
        const body = await request.json();
        return router.broadcast(body);
      }

      // ===========================================
      // Task Queue Endpoints
      // ===========================================
      if (path === '/tasks' && method === 'POST') {
        const body = await request.json();
        return router.createTask(body);
      }

      if (path === '/tasks' && method === 'GET') {
        return router.listTasks(url.searchParams);
      }

      if (path.match(/^\/tasks\/(.+)\/claim$/) && method === 'POST') {
        const taskId = path.split('/')[2];
        const body = await request.json();
        return router.claimTask(taskId, body);
      }

      if (path.match(/^\/tasks\/(.+)\/complete$/) && method === 'POST') {
        const taskId = path.split('/')[2];
        const body = await request.json();
        return router.completeTask(taskId, body);
      }

      // ===========================================
      // Metrics & Reporting
      // ===========================================
      if (path === '/metrics') {
        return router.getMetrics();
      }

      if (path === '/report' && method === 'GET') {
        const repo = url.searchParams.get('repo');
        return router.getRepoReport(repo);
      }

      return json({ error: 'Not found', path, method }, 404);

    } catch (e) {
      console.error('Error:', e);
      return json({ error: e.message, stack: e.stack }, 500);
    }
  }
};

// =============================================================================
// Router Class
// =============================================================================
class Router {
  constructor(env) {
    this.env = env;
    this.db = env.DB;
    this.kv = env.MEMORY;
  }

  // ---------------------------------------------------------------------------
  // Health
  // ---------------------------------------------------------------------------
  async health() {
    let agentCount = 0;
    let memoryCount = 0;

    try {
      if (this.db) {
        const result = await this.db.prepare('SELECT COUNT(*) as total FROM agents').first();
        agentCount = result?.total || 0;
      }
    } catch (e) { /* DB not initialized */ }

    return json({
      service: 'BlackRoad Autonomous Agents API',
      version: '2.0.0',
      status: 'online',
      agents_count: agentCount,
      features: [
        'agent-response',
        'code-review',
        'auto-fix',
        'self-healing',
        'memory-persistence',
        'task-queue',
        'cross-repo-coordination',
        'issue-analysis',
        'metrics'
      ],
      endpoints: {
        agents: ['GET /agents', 'GET /agents/:id', 'GET /agents/stats'],
        memory: ['POST /memory', 'GET /memory/:key', 'GET /memory/search'],
        autonomous: ['POST /agent', 'POST /review', 'POST /autofix', 'POST /fix', 'POST /analyze-issue'],
        coordination: ['POST /coordinate', 'POST /broadcast'],
        tasks: ['POST /tasks', 'GET /tasks', 'POST /tasks/:id/claim', 'POST /tasks/:id/complete'],
        metrics: ['GET /metrics', 'GET /report']
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Agents
  // ---------------------------------------------------------------------------
  async listAgents(params) {
    if (!this.db) return json({ agents: [], message: 'DB not configured' });

    const limit = parseInt(params.get('limit')) || 50;
    const offset = parseInt(params.get('offset')) || 0;
    const type = params.get('type');

    let query = 'SELECT * FROM agents WHERE status = ?';
    const bindings = ['active'];

    if (type) {
      query += ' AND type = ?';
      bindings.push(type);
    }

    query += ' ORDER BY name LIMIT ? OFFSET ?';
    bindings.push(limit, offset);

    const results = await this.db.prepare(query).bind(...bindings).all();
    return json({ agents: results.results, count: results.results.length, limit, offset });
  }

  async getAgent(id) {
    if (!this.db) return json({ error: 'DB not configured' }, 500);

    const agent = await this.db.prepare('SELECT * FROM agents WHERE id = ?').bind(id).first();
    if (!agent) return json({ error: 'Agent not found' }, 404);
    return json(agent);
  }

  async getAgentStats() {
    if (!this.db) return json({ total: 0, by_type: [] });

    const total = await this.db.prepare('SELECT COUNT(*) as c FROM agents').first();
    const byType = await this.db.prepare(
      'SELECT type, COUNT(*) as count FROM agents GROUP BY type ORDER BY count DESC'
    ).all();

    return json({ total: total?.c || 0, by_type: byType.results });
  }

  // ---------------------------------------------------------------------------
  // Memory
  // ---------------------------------------------------------------------------
  async saveMemory(body) {
    const { repo, event, run_id, results, timestamp, ...rest } = body;

    if (!repo) return json({ error: 'repo is required' }, 400);

    const key = `memory:${repo}:${run_id || Date.now()}`;
    const value = {
      repo,
      event,
      run_id,
      results,
      timestamp: timestamp || new Date().toISOString(),
      ...rest
    };

    if (this.kv) {
      await this.kv.put(key, JSON.stringify(value), { expirationTtl: 86400 * 30 }); // 30 days
    }

    // Also store latest per repo
    if (this.kv) {
      await this.kv.put(`memory:${repo}:latest`, JSON.stringify(value), { expirationTtl: 86400 * 7 });
    }

    return json({ success: true, key });
  }

  async getMemory(key) {
    if (!this.kv) return json({ error: 'KV not configured' }, 500);

    // Try exact key first
    let value = await this.kv.get(key);

    // Try with memory prefix
    if (!value) {
      value = await this.kv.get(`memory:${key}`);
    }

    // Try latest for repo
    if (!value) {
      value = await this.kv.get(`memory:${key}:latest`);
    }

    if (!value) return json({ error: 'Memory not found' }, 404);

    try {
      return json(JSON.parse(value));
    } catch {
      return json({ value });
    }
  }

  async searchMemory(query) {
    if (!this.kv || !query) return json({ results: [] });

    const list = await this.kv.list({ prefix: 'memory:' });
    const results = [];

    for (const key of list.keys.slice(0, 50)) {
      const value = await this.kv.get(key.name);
      if (value && value.toLowerCase().includes(query.toLowerCase())) {
        try {
          results.push({ key: key.name, ...JSON.parse(value) });
        } catch {
          results.push({ key: key.name, value });
        }
      }
    }

    return json({ query, results, count: results.length });
  }

  // ---------------------------------------------------------------------------
  // Agent Response (for @blackroad-agents mentions)
  // ---------------------------------------------------------------------------
  async agentResponse(body) {
    const { request, repo, context } = body;

    // Generate intelligent response based on request
    const response = this.generateAgentResponse(request, repo, context);

    return json({
      response,
      agent: 'BlackRoad Autonomous Agent',
      repo,
      timestamp: new Date().toISOString()
    });
  }

  generateAgentResponse(request, repo, context) {
    const lowerRequest = (request || '').toLowerCase();

    // Pattern matching for common requests
    if (lowerRequest.includes('help') || lowerRequest.includes('what can you do')) {
      return `## BlackRoad Agent

I can help with:
- **Code Review**: Analyze PRs for issues
- **Auto-Fix**: Attempt to fix common problems
- **Deployment**: Trigger deployments
- **Issue Triage**: Categorize and prioritize issues
- **Dependency Updates**: Check for outdated packages

Just mention \`@blackroad-agents\` followed by what you need!

*Autonomous Agent v2.0*`;
    }

    if (lowerRequest.includes('deploy')) {
      return `Deployment request received for \`${repo}\`.

The autonomous deployment workflow will:
1. Run tests
2. Build the project
3. Deploy to the configured target

Check the Actions tab for progress.

*Autonomous Agent*`;
    }

    if (lowerRequest.includes('review')) {
      return `Code review initiated for \`${repo}\`.

The code review agent will analyze:
- Code quality patterns
- Security issues
- Performance concerns
- Best practices

Results will be posted as a PR comment.

*Autonomous Agent*`;
    }

    if (lowerRequest.includes('fix') || lowerRequest.includes('repair')) {
      return `Self-healing initiated for \`${repo}\`.

The self-healer will attempt to:
- Diagnose the issue
- Apply automatic fixes where possible
- Create an issue for manual review if needed

*Autonomous Agent*`;
    }

    // Default response
    return `Received your request for \`${repo}\`.

I've logged this request and will process it accordingly. For specific actions, try:
- \`@blackroad-agents deploy\`
- \`@blackroad-agents review\`
- \`@blackroad-agents fix\`
- \`@blackroad-agents help\`

*Autonomous Agent*`;
  }

  // ---------------------------------------------------------------------------
  // Code Review
  // ---------------------------------------------------------------------------
  async codeReview(body) {
    const { repo, pr_number, files, test_result, build_result } = body;

    const review = {
      repo,
      pr_number,
      files_analyzed: files?.split?.('\n')?.length || 0,
      test_result: test_result || 'unknown',
      build_result: build_result || 'unknown',
      recommendation: this.getRecommendation(test_result, build_result),
      timestamp: new Date().toISOString()
    };

    // Store review in memory
    if (this.kv) {
      await this.kv.put(
        `review:${repo}:${pr_number}`,
        JSON.stringify(review),
        { expirationTtl: 86400 * 7 }
      );
    }

    return json(review);
  }

  getRecommendation(testResult, buildResult) {
    if (testResult === 'passed' && buildResult !== 'failed') {
      return 'approve';
    }
    if (testResult === 'failed') {
      return 'request_changes';
    }
    return 'review_needed';
  }

  // ---------------------------------------------------------------------------
  // Auto-Fix
  // ---------------------------------------------------------------------------
  async autoFix(body) {
    const { file, repo } = body;

    // Log the auto-fix request
    const fixRequest = {
      repo,
      file,
      status: 'queued',
      timestamp: new Date().toISOString()
    };

    if (this.kv) {
      await this.kv.put(
        `autofix:${repo}:${Date.now()}`,
        JSON.stringify(fixRequest),
        { expirationTtl: 86400 }
      );
    }

    return json({
      status: 'queued',
      message: `Auto-fix queued for ${file}`,
      repo
    });
  }

  // ---------------------------------------------------------------------------
  // Suggest Fix (for self-healer)
  // ---------------------------------------------------------------------------
  async suggestFix(body) {
    const { repo, failure_type, details, run_id } = body;

    const suggestions = this.getSuggestions(failure_type, details);

    const fix = {
      repo,
      failure_type,
      run_id,
      suggestions,
      timestamp: new Date().toISOString()
    };

    if (this.kv) {
      await this.kv.put(
        `fix:${repo}:${run_id || Date.now()}`,
        JSON.stringify(fix),
        { expirationTtl: 86400 * 7 }
      );
    }

    return json(fix);
  }

  getSuggestions(failureType, details) {
    const suggestions = [];

    switch (failureType) {
      case 'test_failure':
        suggestions.push(
          'Check recent changes to test files',
          'Verify test dependencies are installed',
          'Run tests locally to reproduce'
        );
        break;
      case 'build_failure':
        suggestions.push(
          'Check for TypeScript/compilation errors',
          'Verify all imports are correct',
          'Ensure dependencies are compatible'
        );
        break;
      case 'lint_failure':
        suggestions.push(
          'Run npm run lint:fix or equivalent',
          'Check for formatting issues',
          'Verify ESLint configuration'
        );
        break;
      case 'dependency_failure':
        suggestions.push(
          'Delete node_modules and reinstall',
          'Check for conflicting versions',
          'Update lock file'
        );
        break;
      case 'security_failure':
        suggestions.push(
          'Run npm audit fix',
          'Update vulnerable dependencies',
          'Review security advisories'
        );
        break;
      default:
        suggestions.push(
          'Review workflow logs',
          'Check recent commits',
          'Verify environment configuration'
        );
    }

    return suggestions;
  }

  // ---------------------------------------------------------------------------
  // Issue Analysis
  // ---------------------------------------------------------------------------
  async analyzeIssue(body) {
    const { title, body: issueBody, repo } = body;
    const text = `${title} ${issueBody}`.toLowerCase();

    const labels = [];
    let priority = 'normal';
    let assignee = '';

    // Type detection
    if (/bug|error|broken|crash|fail|not working/.test(text)) labels.push('bug');
    if (/feature|add|new|enhance|request/.test(text)) labels.push('enhancement');
    if (/question|how|help|what|why/.test(text)) labels.push('question');
    if (/doc|documentation|readme|typo/.test(text)) labels.push('documentation');

    // Area detection
    if (/security|vulnerability|cve|auth/.test(text)) labels.push('security');
    if (/performance|slow|memory|cpu/.test(text)) labels.push('performance');
    if (/ui|frontend|css|style|design/.test(text)) labels.push('frontend');
    if (/api|backend|server|database/.test(text)) labels.push('backend');

    // Priority detection
    if (/urgent|critical|asap|important|blocker/.test(text)) {
      labels.push('priority:high');
      priority = 'high';
    } else if (/minor|low|when possible/.test(text)) {
      labels.push('priority:low');
      priority = 'low';
    }

    return json({
      labels,
      priority,
      assignee,
      repo,
      analysis: {
        is_bug: labels.includes('bug'),
        is_feature: labels.includes('enhancement'),
        is_security: labels.includes('security')
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Coordination
  // ---------------------------------------------------------------------------
  async coordinate(body) {
    const { action, source, repos, timestamp } = body;

    const coordination = {
      action,
      source,
      repos,
      timestamp: timestamp || new Date().toISOString(),
      status: 'received'
    };

    if (this.kv) {
      await this.kv.put(
        `coordination:${Date.now()}`,
        JSON.stringify(coordination),
        { expirationTtl: 86400 }
      );
    }

    return json(coordination);
  }

  // ---------------------------------------------------------------------------
  // Broadcast
  // ---------------------------------------------------------------------------
  async broadcast(body) {
    const { event, source, repos, sync_type, timestamp } = body;

    const broadcast = {
      event,
      source,
      repos,
      sync_type,
      timestamp: timestamp || new Date().toISOString(),
      received: true
    };

    if (this.kv) {
      await this.kv.put(
        `broadcast:${Date.now()}`,
        JSON.stringify(broadcast),
        { expirationTtl: 86400 }
      );
    }

    return json(broadcast);
  }

  // ---------------------------------------------------------------------------
  // Tasks
  // ---------------------------------------------------------------------------
  async createTask(body) {
    const { type, repo, description, priority, metadata } = body;

    const task = {
      id: `task-${Date.now()}`,
      type,
      repo,
      description,
      priority: priority || 'normal',
      status: 'pending',
      created_at: new Date().toISOString(),
      metadata
    };

    if (this.kv) {
      await this.kv.put(`task:${task.id}`, JSON.stringify(task), { expirationTtl: 86400 * 7 });
    }

    return json(task);
  }

  async listTasks(params) {
    if (!this.kv) return json({ tasks: [] });

    const status = params.get('status');
    const repo = params.get('repo');

    const list = await this.kv.list({ prefix: 'task:' });
    const tasks = [];

    for (const key of list.keys.slice(0, 100)) {
      const value = await this.kv.get(key.name);
      if (value) {
        try {
          const task = JSON.parse(value);
          if (status && task.status !== status) continue;
          if (repo && task.repo !== repo) continue;
          tasks.push(task);
        } catch { /* invalid JSON */ }
      }
    }

    return json({ tasks, count: tasks.length });
  }

  async claimTask(taskId, body) {
    if (!this.kv) return json({ error: 'KV not configured' }, 500);

    const key = `task:${taskId}`;
    const value = await this.kv.get(key);

    if (!value) return json({ error: 'Task not found' }, 404);

    const task = JSON.parse(value);
    if (task.status !== 'pending') {
      return json({ error: 'Task already claimed or completed' }, 400);
    }

    task.status = 'in_progress';
    task.claimed_by = body.agent || 'unknown';
    task.claimed_at = new Date().toISOString();

    await this.kv.put(key, JSON.stringify(task), { expirationTtl: 86400 * 7 });

    return json(task);
  }

  async completeTask(taskId, body) {
    if (!this.kv) return json({ error: 'KV not configured' }, 500);

    const key = `task:${taskId}`;
    const value = await this.kv.get(key);

    if (!value) return json({ error: 'Task not found' }, 404);

    const task = JSON.parse(value);
    task.status = 'completed';
    task.result = body.result;
    task.completed_at = new Date().toISOString();

    await this.kv.put(key, JSON.stringify(task), { expirationTtl: 86400 * 7 });

    return json(task);
  }

  // ---------------------------------------------------------------------------
  // Metrics
  // ---------------------------------------------------------------------------
  async getMetrics() {
    const metrics = {
      timestamp: new Date().toISOString(),
      agents: { total: 0 },
      memory: { entries: 0 },
      tasks: { total: 0, pending: 0, in_progress: 0, completed: 0 }
    };

    // Agent count
    if (this.db) {
      try {
        const result = await this.db.prepare('SELECT COUNT(*) as total FROM agents').first();
        metrics.agents.total = result?.total || 0;
      } catch { /* DB not ready */ }
    }

    // Memory entries
    if (this.kv) {
      const memoryList = await this.kv.list({ prefix: 'memory:' });
      metrics.memory.entries = memoryList.keys.length;

      // Task counts
      const taskList = await this.kv.list({ prefix: 'task:' });
      metrics.tasks.total = taskList.keys.length;

      for (const key of taskList.keys) {
        const value = await this.kv.get(key.name);
        if (value) {
          try {
            const task = JSON.parse(value);
            if (task.status === 'pending') metrics.tasks.pending++;
            else if (task.status === 'in_progress') metrics.tasks.in_progress++;
            else if (task.status === 'completed') metrics.tasks.completed++;
          } catch { /* invalid JSON */ }
        }
      }
    }

    return json(metrics);
  }

  async getRepoReport(repo) {
    if (!repo) return json({ error: 'repo parameter required' }, 400);

    const report = {
      repo,
      timestamp: new Date().toISOString(),
      memory: [],
      reviews: [],
      tasks: []
    };

    if (this.kv) {
      // Get memory entries for repo
      const memoryList = await this.kv.list({ prefix: `memory:${repo}:` });
      for (const key of memoryList.keys.slice(0, 10)) {
        const value = await this.kv.get(key.name);
        if (value) {
          try {
            report.memory.push(JSON.parse(value));
          } catch { /* invalid JSON */ }
        }
      }

      // Get reviews for repo
      const reviewList = await this.kv.list({ prefix: `review:${repo}:` });
      for (const key of reviewList.keys.slice(0, 10)) {
        const value = await this.kv.get(key.name);
        if (value) {
          try {
            report.reviews.push(JSON.parse(value));
          } catch { /* invalid JSON */ }
        }
      }
    }

    return json(report);
  }
}

// =============================================================================
// Utility Functions
// =============================================================================
function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: CORS
  });
}
