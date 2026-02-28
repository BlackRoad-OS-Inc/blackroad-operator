import React, { useState } from 'react';

const REPOS = [
  { id: 1, name: 'blackroad-os-core', desc: 'Core platform services, tokenless gateway, agent runtime', lang: 'TypeScript', langColor: '#3178c6', stars: 2847, forks: 342, issues: 23, prs: 7, updated: '2h ago', org: 'BlackRoad-OS-Inc' },
  { id: 2, name: 'lucidia-engine', desc: 'AI reasoning engine with trinary logic and PS-SHA∞ memory', lang: 'Python', langColor: '#3572A5', stars: 1923, forks: 256, issues: 15, prs: 4, updated: '4h ago', org: 'BlackRoad-AI' },
  { id: 3, name: 'roadverse-client', desc: 'Three.js metaverse client with WebXR VR support', lang: 'JavaScript', langColor: '#f1e05a', stars: 1456, forks: 189, issues: 31, prs: 12, updated: '1h ago', org: 'BlackRoad-Interactive' },
  { id: 4, name: 'roadchain-contracts', desc: 'ROAD token smart contracts, lottery, staking pools', lang: 'Solidity', langColor: '#AA6746', stars: 892, forks: 134, issues: 8, prs: 3, updated: '6h ago', org: 'BlackRoad-OS' },
  { id: 5, name: 'roadcomms-server', desc: 'Real-time messaging server with WebSocket mesh', lang: 'Go', langColor: '#00ADD8', stars: 1678, forks: 201, issues: 19, prs: 6, updated: '3h ago', org: 'BlackRoad-OS' },
  { id: 6, name: 'roadsearch-indexer', desc: 'Web crawler, indexer, and AI-powered search ranking', lang: 'Rust', langColor: '#dea584', stars: 734, forks: 98, issues: 42, prs: 9, updated: '5h ago', org: 'BlackRoad-OS' },
  { id: 7, name: 'roaddesk-os', desc: 'Virtual desktop OS with window manager and app ecosystem', lang: 'TypeScript', langColor: '#3178c6', stars: 567, forks: 87, issues: 14, prs: 5, updated: '8h ago', org: 'BlackRoad-OS' },
  { id: 8, name: 'pi-agent-cluster', desc: 'Raspberry Pi agent orchestration for 30K agent fleet', lang: 'Python', langColor: '#3572A5', stars: 2156, forks: 312, issues: 7, prs: 2, updated: '12h ago', org: 'BlackRoad-Hardware' },
  { id: 9, name: 'cloudflare-workers', desc: '75+ Cloudflare Workers powering BlackRoad infrastructure', lang: 'JavaScript', langColor: '#f1e05a', stars: 1234, forks: 156, issues: 5, prs: 8, updated: '1d ago', org: 'BlackRoad-Cloud' },
  { id: 10, name: 'roadfeed-api', desc: 'Social network API with posts, communities, and messaging', lang: 'TypeScript', langColor: '#3178c6', stars: 445, forks: 67, issues: 21, prs: 4, updated: '2d ago', org: 'BlackRoad-OS' },
];

const SAMPLE_FILES = [
  { name: 'src', type: 'dir', children: [
    { name: 'bin', type: 'dir', children: [{ name: 'br.ts', type: 'file', lang: 'typescript', size: '4.2 KB' }] },
    { name: 'core', type: 'dir', children: [
      { name: 'client.ts', type: 'file', lang: 'typescript', size: '2.8 KB' },
      { name: 'config.ts', type: 'file', lang: 'typescript', size: '1.9 KB' },
      { name: 'logger.ts', type: 'file', lang: 'typescript', size: '1.2 KB' },
    ]},
    { name: 'cli', type: 'dir', children: [
      { name: 'commands', type: 'dir', children: [
        { name: 'agents.ts', type: 'file', lang: 'typescript', size: '3.4 KB' },
        { name: 'deploy.ts', type: 'file', lang: 'typescript', size: '2.1 KB' },
        { name: 'status.ts', type: 'file', lang: 'typescript', size: '1.7 KB' },
      ]}
    ]},
    { name: 'index.ts', type: 'file', lang: 'typescript', size: '0.8 KB' },
  ]},
  { name: 'tests', type: 'dir', children: [
    { name: 'core.test.ts', type: 'file', lang: 'typescript', size: '2.3 KB' },
    { name: 'cli.test.ts', type: 'file', lang: 'typescript', size: '1.8 KB' },
  ]},
  { name: 'package.json', type: 'file', lang: 'json', size: '1.1 KB' },
  { name: 'tsconfig.json', type: 'file', lang: 'json', size: '0.4 KB' },
  { name: 'README.md', type: 'file', lang: 'markdown', size: '3.2 KB' },
  { name: '.github', type: 'dir', children: [
    { name: 'workflows', type: 'dir', children: [
      { name: 'ci.yml', type: 'file', lang: 'yaml', size: '0.9 KB' },
    ]}
  ]},
];

const SAMPLE_CODE = `import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { loadConfig } from '../core/config.js';
import { GatewayClient } from '../core/client.js';
import { formatTable } from '../formatters/table.js';

export function agentsCommand(program: Command) {
  const cmd = program.command('agents').description('Manage BlackRoad AI agents');

  cmd.command('list').description('List all active agents').action(async () => {
    const spinner = ora('Fetching agents...').start();
    const config = loadConfig();
    const client = new GatewayClient(config.gatewayUrl);

    try {
      const agents = await client.get('/agents');
      spinner.succeed(\`Found \${agents.length} agents\`);
      console.log(formatTable(agents, ['name', 'status', 'role', 'tasks']));
    } catch (err) {
      spinner.fail('Failed to fetch agents');
      console.error(chalk.red(err.message));
    }
  });

  cmd.command('invoke <agent> <task>').description('Invoke an agent task')
    .option('-p, --priority <level>', 'Task priority', 'normal')
    .action(async (agent, task, opts) => {
      const spinner = ora(\`Invoking \${agent}...\`).start();
      const config = loadConfig();
      const client = new GatewayClient(config.gatewayUrl);

      const result = await client.post(\`/agents/\${agent}/invoke\`, {
        task, priority: opts.priority,
      });
      spinner.succeed(\`Task \${result.taskId} assigned to \${agent}\`);
    });
}`;

const COMMITS = [
  { hash: 'a3f7c2e', message: 'feat: add parallel agent task distribution', author: 'alexa', date: '2 hours ago', additions: 247, deletions: 34 },
  { hash: 'b8d1f4a', message: 'fix: resolve WebSocket reconnection race condition', author: 'lucidia-bot', date: '4 hours ago', additions: 23, deletions: 8 },
  { hash: 'c5e9a1b', message: 'refactor: extract gateway client into shared module', author: 'mchen', date: '6 hours ago', additions: 156, deletions: 189 },
  { hash: 'd2b8c3f', message: 'chore: update dependencies, pin TypeScript 5.7.3', author: 'dependabot', date: '8 hours ago', additions: 45, deletions: 45 },
  { hash: 'e1a4d5c', message: 'feat: implement PS-SHA∞ hash-chain memory verification', author: 'echo-agent', date: '12 hours ago', additions: 312, deletions: 0 },
  { hash: 'f7c2b8d', message: 'docs: update CLAUDE.md with product ecosystem section', author: 'alexa', date: '1 day ago', additions: 890, deletions: 12 },
  { hash: 'g3e1a4d', message: 'ci: add parallel test runner for agent integration tests', author: 'alice-bot', date: '1 day ago', additions: 78, deletions: 15 },
  { hash: 'h9f7c2b', message: 'feat: RoadChain lottery smart contract deployment', author: 'cipher-agent', date: '2 days ago', additions: 445, deletions: 0 },
];

const ISSUES = [
  { id: 1, title: 'Agent memory leak when processing >10K concurrent tasks', labels: ['bug', 'high-priority'], author: 'mchen', status: 'open', comments: 12, date: '3h ago' },
  { id: 2, title: 'Add WebXR hand tracking support to RoadVerse', labels: ['enhancement', 'roadverse'], author: 'sarahk', status: 'open', comments: 8, date: '1d ago' },
  { id: 3, title: 'RoadSearch indexer crashes on non-UTF8 content', labels: ['bug'], author: 'lucidia-bot', status: 'open', comments: 5, date: '2d ago' },
  { id: 4, title: 'Implement ROAD token staking rewards calculator', labels: ['enhancement', 'roadchain'], author: 'alexa', status: 'closed', comments: 23, date: '3d ago' },
  { id: 5, title: 'Cloudflare Worker cold start optimization', labels: ['performance'], author: 'alice-bot', status: 'open', comments: 15, date: '4d ago' },
  { id: 6, title: 'Add dark mode toggle to RoadFeed mobile view', labels: ['enhancement', 'ui'], author: 'sarahk', status: 'closed', comments: 6, date: '5d ago' },
];

const PRS = [
  { id: 847, title: 'feat: parallel agent task distribution across Pi cluster', author: 'alexa', branch: 'feat/parallel-agents', status: 'open', reviewStatus: 'approved', additions: 247, deletions: 34, comments: 8, date: '2h ago' },
  { id: 846, title: 'fix: WebSocket mesh reconnection with exponential backoff', author: 'lucidia-bot', branch: 'fix/ws-reconnect', status: 'open', reviewStatus: 'changes-requested', additions: 23, deletions: 8, comments: 5, date: '4h ago' },
  { id: 845, title: 'refactor: extract shared gateway client', author: 'mchen', branch: 'refactor/gateway-client', status: 'merged', reviewStatus: 'approved', additions: 156, deletions: 189, comments: 12, date: '6h ago' },
  { id: 844, title: 'feat: RoadVerse zone teleportation system', author: 'sarahk', branch: 'feat/zone-teleport', status: 'merged', reviewStatus: 'approved', additions: 534, deletions: 12, comments: 15, date: '1d ago' },
  { id: 843, title: 'ci: GitHub Actions workflow for multi-cloud deploy', author: 'alice-bot', branch: 'ci/multi-cloud', status: 'open', reviewStatus: 'pending', additions: 78, deletions: 15, comments: 3, date: '1d ago' },
];

const ACTIONS = [
  { id: 1, name: 'CI / Build & Test', status: 'success', branch: 'main', commit: 'a3f7c2e', duration: '2m 34s', date: '2h ago' },
  { id: 2, name: 'Deploy to Cloudflare', status: 'success', branch: 'main', commit: 'a3f7c2e', duration: '1m 12s', date: '2h ago' },
  { id: 3, name: 'Security Scan', status: 'success', branch: 'main', commit: 'b8d1f4a', duration: '4m 56s', date: '4h ago' },
  { id: 4, name: 'CI / Build & Test', status: 'failure', branch: 'fix/ws-reconnect', commit: 'b8d1f4a', duration: '1m 48s', date: '5h ago' },
  { id: 5, name: 'Deploy to Railway', status: 'success', branch: 'main', commit: 'c5e9a1b', duration: '3m 22s', date: '6h ago' },
];

const CONTRIBUTION_DATA = Array.from({ length: 52 * 7 }, () => Math.random() > 0.3 ? Math.floor(Math.random() * 4) + 1 : 0);
const CONTRIB_COLORS = ['#0d0d14', '#0e4429', '#006d32', '#26a641', '#39d353'];

function FileIcon({ type, name }) {
  if (type === 'dir') return <span style={{ color: '#79b8ff' }}>📁</span>;
  const ext = name.split('.').pop();
  const colors = { ts: '#3178c6', js: '#f1e05a', json: '#5d5d5d', md: '#fff', yml: '#cb171e', py: '#3572A5' };
  return <span style={{ color: colors[ext] || '#aaa' }}>📄</span>;
}

export default function App() {
  const [page, setPage] = useState('repos');
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [repoTab, setRepoTab] = useState('code');
  const [expandedDirs, setExpandedDirs] = useState(new Set(['src', 'src/core', 'src/cli', 'src/cli/commands']));
  const [selectedFile, setSelectedFile] = useState(null);
  const [issueFilter, setIssueFilter] = useState('open');
  const [prFilter, setPrFilter] = useState('open');
  const [searchQuery, setSearchQuery] = useState('');

  const toggleDir = (path) => {
    const next = new Set(expandedDirs);
    next.has(path) ? next.delete(path) : next.add(path);
    setExpandedDirs(next);
  };

  const renderTree = (items, depth = 0, parentPath = '') => {
    const dirs = items.filter(i => i.type === 'dir').sort((a, b) => a.name.localeCompare(b.name));
    const files = items.filter(i => i.type === 'file').sort((a, b) => a.name.localeCompare(b.name));
    return [...dirs, ...files].map((item) => {
      const path = parentPath ? `${parentPath}/${item.name}` : item.name;
      const isExpanded = expandedDirs.has(path);
      return (
        <React.Fragment key={path}>
          <div
            className={`file-row ${selectedFile === path ? 'selected' : ''}`}
            style={{ paddingLeft: depth * 20 + 12 }}
            onClick={() => item.type === 'dir' ? toggleDir(path) : setSelectedFile(path)}
          >
            {item.type === 'dir' && <span className="dir-arrow">{isExpanded ? '▾' : '▸'}</span>}
            <FileIcon type={item.type} name={item.name} />
            <span className="file-name">{item.name}</span>
            {item.size && <span className="file-size">{item.size}</span>}
          </div>
          {item.type === 'dir' && isExpanded && item.children && renderTree(item.children, depth + 1, path)}
        </React.Fragment>
      );
    });
  };

  const filteredRepos = REPOS.filter(r => !searchQuery || r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.desc.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="app">
      <nav className="topnav">
        <div className="nav-left">
          <div className="logo" onClick={() => { setPage('repos'); setSelectedRepo(null); }}>
            <span className="logo-icon">💻</span>
            <span className="logo-text">RoadCode</span>
          </div>
          <div className="nav-links">
            <button className={page === 'repos' && !selectedRepo ? 'active' : ''} onClick={() => { setPage('repos'); setSelectedRepo(null); }}>Repositories</button>
            <button className={page === 'explore' ? 'active' : ''} onClick={() => setPage('explore')}>Explore</button>
            <button className={page === 'profile' ? 'active' : ''} onClick={() => setPage('profile')}>Profile</button>
          </div>
        </div>
        <div className="nav-right">
          <div className="nav-search">
            <span>🔍</span>
            <input placeholder="Search repositories..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <button className="btn-new" onClick={() => setPage('new')}>+ New Repo</button>
          <div className="avatar">A</div>
        </div>
      </nav>

      <main className="content">
        {/* REPO LIST */}
        {page === 'repos' && !selectedRepo && (
          <div className="repo-list-page">
            <div className="page-header">
              <h1>Repositories</h1>
              <span className="repo-count">{filteredRepos.length} repositories</span>
            </div>
            {filteredRepos.map((repo) => (
              <div key={repo.id} className="repo-card" onClick={() => { setSelectedRepo(repo); setRepoTab('code'); }}>
                <div className="repo-info">
                  <div className="repo-name-row">
                    <span className="repo-org">{repo.org}</span>
                    <span className="repo-slash">/</span>
                    <span className="repo-name">{repo.name}</span>
                  </div>
                  <p className="repo-desc">{repo.desc}</p>
                  <div className="repo-meta">
                    <span className="repo-lang"><span className="lang-dot" style={{ background: repo.langColor }} />{repo.lang}</span>
                    <span>⭐ {repo.stars.toLocaleString()}</span>
                    <span>🍴 {repo.forks}</span>
                    <span>Updated {repo.updated}</span>
                  </div>
                </div>
                <button className="star-btn">☆ Star</button>
              </div>
            ))}
          </div>
        )}

        {/* REPO DETAIL */}
        {selectedRepo && (
          <div className="repo-detail">
            <div className="repo-header">
              <div className="repo-name-row">
                <span className="repo-org">{selectedRepo.org}</span>
                <span className="repo-slash">/</span>
                <span className="repo-name">{selectedRepo.name}</span>
                <span className="visibility-badge">Private</span>
              </div>
              <p className="repo-desc">{selectedRepo.desc}</p>
              <div className="repo-actions">
                <button className="action-btn">⭐ Star <strong>{selectedRepo.stars.toLocaleString()}</strong></button>
                <button className="action-btn">🍴 Fork <strong>{selectedRepo.forks}</strong></button>
                <button className="action-btn">👁️ Watch</button>
              </div>
            </div>

            <div className="repo-tabs">
              {[
                { key: 'code', label: '💻 Code' },
                { key: 'issues', label: `🔴 Issues ${selectedRepo.issues}` },
                { key: 'prs', label: `🟢 Pull Requests ${selectedRepo.prs}` },
                { key: 'actions', label: '⚡ Actions' },
                { key: 'commits', label: '📝 Commits' },
              ].map((t) => (
                <button key={t.key} className={`tab-btn ${repoTab === t.key ? 'active' : ''}`} onClick={() => setRepoTab(t.key)}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* CODE TAB */}
            {repoTab === 'code' && (
              <div className="code-view">
                <div className="branch-bar">
                  <select className="branch-select"><option>main</option><option>develop</option><option>feat/parallel-agents</option></select>
                  <span className="branch-info">{COMMITS.length} commits · {SAMPLE_FILES.length} items</span>
                  <button className="btn-clone">⬇ Clone</button>
                </div>
                <div className="code-layout">
                  <div className="file-tree">
                    {renderTree(SAMPLE_FILES)}
                  </div>
                  <div className="code-panel">
                    {selectedFile ? (
                      <>
                        <div className="code-header">
                          <span className="code-filename">{selectedFile}</span>
                          <span className="code-actions"><button>📋 Copy</button><button>✏️ Edit</button></span>
                        </div>
                        <pre className="code-content"><code>{SAMPLE_CODE}</code></pre>
                      </>
                    ) : (
                      <div className="readme-panel">
                        <h2>📖 README.md</h2>
                        <h1>{selectedRepo.name}</h1>
                        <p>{selectedRepo.desc}</p>
                        <h2>Quick Start</h2>
                        <pre className="code-block">npm install{'\n'}npm run dev</pre>
                        <h2>Tech Stack</h2>
                        <ul>
                          <li>{selectedRepo.lang} — Primary language</li>
                          <li>Cloudflare Workers — Edge deployment</li>
                          <li>Railway — Backend services</li>
                          <li>Vitest — Testing</li>
                        </ul>
                        <p className="readme-footer">© 2026 BlackRoad OS, Inc. PROPRIETARY.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ISSUES TAB */}
            {repoTab === 'issues' && (
              <div className="issues-view">
                <div className="filter-bar">
                  <button className={issueFilter === 'open' ? 'active' : ''} onClick={() => setIssueFilter('open')}>🔴 Open {ISSUES.filter(i => i.status === 'open').length}</button>
                  <button className={issueFilter === 'closed' ? 'active' : ''} onClick={() => setIssueFilter('closed')}>✅ Closed {ISSUES.filter(i => i.status === 'closed').length}</button>
                </div>
                {ISSUES.filter(i => i.status === issueFilter).map((issue) => (
                  <div key={issue.id} className="issue-row">
                    <span className={`issue-icon ${issue.status}`}>{issue.status === 'open' ? '🔴' : '✅'}</span>
                    <div className="issue-info">
                      <h4>{issue.title}</h4>
                      <div className="issue-labels">{issue.labels.map((l, i) => <span key={i} className={`label label-${l}`}>{l}</span>)}</div>
                      <span className="issue-meta">#{issue.id} opened {issue.date} by {issue.author} · {issue.comments} comments</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* PRS TAB */}
            {repoTab === 'prs' && (
              <div className="prs-view">
                <div className="filter-bar">
                  <button className={prFilter === 'open' ? 'active' : ''} onClick={() => setPrFilter('open')}>🟢 Open {PRS.filter(p => p.status === 'open').length}</button>
                  <button className={prFilter === 'merged' ? 'active' : ''} onClick={() => setPrFilter('merged')}>🟣 Merged {PRS.filter(p => p.status === 'merged').length}</button>
                </div>
                {PRS.filter(p => p.status === prFilter).map((pr) => (
                  <div key={pr.id} className="pr-row">
                    <span className={`pr-icon ${pr.status}`}>{pr.status === 'open' ? '🟢' : '🟣'}</span>
                    <div className="pr-info">
                      <h4>{pr.title}</h4>
                      <span className="pr-meta">#{pr.id} · {pr.branch} · {pr.author} · {pr.date}</span>
                      <div className="pr-stats">
                        <span className="additions">+{pr.additions}</span>
                        <span className="deletions">-{pr.deletions}</span>
                        <span className={`review-status ${pr.reviewStatus}`}>
                          {pr.reviewStatus === 'approved' ? '✅ Approved' : pr.reviewStatus === 'changes-requested' ? '🔄 Changes Requested' : '⏳ Pending Review'}
                        </span>
                      </div>
                    </div>
                    {pr.status === 'open' && pr.reviewStatus === 'approved' && <button className="merge-btn">Merge</button>}
                  </div>
                ))}
              </div>
            )}

            {/* ACTIONS TAB */}
            {repoTab === 'actions' && (
              <div className="actions-view">
                <h3>Workflow Runs</h3>
                {ACTIONS.map((a) => (
                  <div key={a.id} className="action-row">
                    <span className={`action-status ${a.status}`}>{a.status === 'success' ? '✅' : '❌'}</span>
                    <div className="action-info">
                      <h4>{a.name}</h4>
                      <span className="action-meta">{a.branch} · {a.commit} · {a.duration} · {a.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* COMMITS TAB */}
            {repoTab === 'commits' && (
              <div className="commits-view">
                <h3>Commit History</h3>
                {COMMITS.map((c) => (
                  <div key={c.hash} className="commit-row">
                    <div className="commit-info">
                      <h4>{c.message}</h4>
                      <span className="commit-meta">{c.author} committed {c.date}</span>
                    </div>
                    <div className="commit-stats">
                      <span className="commit-hash">{c.hash}</span>
                      <span className="additions">+{c.additions}</span>
                      <span className="deletions">-{c.deletions}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PROFILE */}
        {page === 'profile' && (
          <div className="profile-page">
            <div className="profile-header">
              <div className="profile-avatar" style={{ background: 'linear-gradient(135deg, #FF1D6C, #9C27B0)' }}>A</div>
              <div className="profile-info">
                <h1>Alexa Amundson</h1>
                <p className="profile-handle">@alexa</p>
                <p className="profile-bio">Founder & CEO, BlackRoad OS, Inc. Building the future of AI-first operating systems.</p>
                <div className="profile-meta">
                  <span>🏢 BlackRoad OS, Inc.</span>
                  <span>📍 Earth</span>
                  <span>🔗 blackroad.io</span>
                </div>
              </div>
            </div>
            <h3 style={{ marginTop: 24, marginBottom: 12 }}>Contribution Graph</h3>
            <div className="contrib-graph">
              {Array.from({ length: 52 }).map((_, week) => (
                <div key={week} className="contrib-col">
                  {Array.from({ length: 7 }).map((_, day) => {
                    const level = CONTRIBUTION_DATA[week * 7 + day];
                    return <div key={day} className="contrib-cell" style={{ background: CONTRIB_COLORS[level] }} title={`${level} contributions`} />;
                  })}
                </div>
              ))}
            </div>
            <div className="contrib-legend">
              <span>Less</span>
              {CONTRIB_COLORS.map((c, i) => <div key={i} className="contrib-cell" style={{ background: c }} />)}
              <span>More</span>
            </div>
            <h3 style={{ marginTop: 24, marginBottom: 12 }}>Pinned Repositories</h3>
            <div className="pinned-repos">
              {REPOS.slice(0, 6).map((r) => (
                <div key={r.id} className="pinned-repo" onClick={() => { setPage('repos'); setSelectedRepo(r); setRepoTab('code'); }}>
                  <h4>{r.name}</h4>
                  <p>{r.desc}</p>
                  <div className="repo-meta">
                    <span className="repo-lang"><span className="lang-dot" style={{ background: r.langColor }} />{r.lang}</span>
                    <span>⭐ {r.stars.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NEW REPO */}
        {page === 'new' && (
          <div className="new-repo-page">
            <h1>Create a new repository</h1>
            <div className="form-group">
              <label>Owner</label>
              <select><option>BlackRoad-OS-Inc</option><option>BlackRoad-OS</option><option>BlackRoad-AI</option></select>
            </div>
            <div className="form-group">
              <label>Repository name</label>
              <input placeholder="my-new-repo" />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input placeholder="A short description of the repository" />
            </div>
            <div className="form-group">
              <label>Visibility</label>
              <div className="radio-group">
                <label><input type="radio" name="vis" defaultChecked /> Private</label>
                <label><input type="radio" name="vis" /> Public</label>
              </div>
            </div>
            <div className="form-group">
              <label>Initialize</label>
              <div className="checkbox-group">
                <label><input type="checkbox" defaultChecked /> Add README.md</label>
                <label><input type="checkbox" defaultChecked /> Add .gitignore</label>
                <label><input type="checkbox" /> Add LICENSE</label>
              </div>
            </div>
            <button className="btn-primary" onClick={() => setPage('repos')}>Create Repository</button>
          </div>
        )}

        {/* EXPLORE */}
        {page === 'explore' && (
          <div className="explore-page">
            <h1>Explore Trending Repositories</h1>
            <div className="trending-repos">
              {REPOS.sort((a, b) => b.stars - a.stars).map((r) => (
                <div key={r.id} className="repo-card" onClick={() => { setPage('repos'); setSelectedRepo(r); setRepoTab('code'); }}>
                  <div className="repo-info">
                    <div className="repo-name-row">
                      <span className="repo-org">{r.org}</span><span className="repo-slash">/</span><span className="repo-name">{r.name}</span>
                    </div>
                    <p className="repo-desc">{r.desc}</p>
                    <div className="repo-meta">
                      <span className="repo-lang"><span className="lang-dot" style={{ background: r.langColor }} />{r.lang}</span>
                      <span>⭐ {r.stars.toLocaleString()}</span>
                      <span>🍴 {r.forks}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <span>© 2026 BlackRoad OS, Inc. All rights reserved. PROPRIETARY.</span>
        <span>Your AI. Your Hardware. Your Rules.</span>
      </footer>
    </div>
  );
}
