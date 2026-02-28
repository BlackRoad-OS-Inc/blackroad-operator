import React, { useState, useEffect, useRef, useCallback } from 'react';

// ============================================================
// DATA: Apps, Desktop Icons, File System, etc.
// ============================================================

const APP_REGISTRY = {
  terminal:     { id: 'terminal',     name: 'Terminal',       icon: '\u{1F5A5}',  color: '#33ff33', defaultW: 680, defaultH: 420 },
  filemanager:  { id: 'filemanager',  name: 'Files',          icon: '\u{1F4C1}',  color: '#F5A623', defaultW: 750, defaultH: 480 },
  settings:     { id: 'settings',     name: 'Settings',       icon: '\u2699\uFE0F',  color: '#9898b0', defaultW: 720, defaultH: 480 },
  editor:       { id: 'editor',       name: 'Text Editor',    icon: '\u{1F4DD}',  color: '#2979FF', defaultW: 700, defaultH: 500 },
  calculator:   { id: 'calculator',   name: 'Calculator',     icon: '\u{1F5A9}',  color: '#FF1D6C', defaultW: 340, defaultH: 500 },
  sysmon:       { id: 'sysmon',       name: 'System Monitor', icon: '\u{1F4CA}',  color: '#28c840', defaultW: 480, defaultH: 520 },
  browser:      { id: 'browser',      name: 'Browser',        icon: '\u{1F310}',  color: '#2979FF', defaultW: 800, defaultH: 540 },
  imageviewer:  { id: 'imageviewer',  name: 'Gallery',        icon: '\u{1F5BC}\uFE0F',  color: '#9C27B0', defaultW: 600, defaultH: 480 },
  music:        { id: 'music',        name: 'Music',          icon: '\u{1F3B5}',  color: '#FF1D6C', defaultW: 380, defaultH: 480 },
  notes:        { id: 'notes',        name: 'Notes',          icon: '\u{1F4CB}',  color: '#F5A623', defaultW: 600, defaultH: 440 },
  roadchain:    { id: 'roadchain',    name: 'RoadChain',      icon: '\u26D3\uFE0F',  color: '#F5A623', defaultW: 700, defaultH: 500 },
  roadstream:   { id: 'roadstream',   name: 'RoadStream',     icon: '\u{1F4F9}',  color: '#FF1D6C', defaultW: 700, defaultH: 500 },
  roadfeed:     { id: 'roadfeed',     name: 'RoadFeed',       icon: '\u{1F4E1}',  color: '#9C27B0', defaultW: 700, defaultH: 500 },
  roadsearch:   { id: 'roadsearch',   name: 'RoadSearch',     icon: '\u{1F50D}',  color: '#2979FF', defaultW: 700, defaultH: 500 },
  roadcode:     { id: 'roadcode',     name: 'RoadCode',       icon: '\u{1F4BB}',  color: '#28c840', defaultW: 800, defaultH: 560 },
  roadcomms:    { id: 'roadcomms',    name: 'RoadComms',      icon: '\u{1F4AC}',  color: '#2979FF', defaultW: 700, defaultH: 500 },
  roadverse:    { id: 'roadverse',    name: 'RoadVerse',      icon: '\u{1F30D}',  color: '#9C27B0', defaultW: 800, defaultH: 560 },
};

const DESKTOP_ICONS = [
  { appId: 'terminal',    label: 'Terminal' },
  { appId: 'filemanager', label: 'Files' },
  { appId: 'browser',     label: 'Browser' },
  { appId: 'editor',      label: 'Editor' },
  { appId: 'settings',    label: 'Settings' },
  { appId: 'sysmon',      label: 'Monitor' },
  { appId: 'calculator',  label: 'Calculator' },
  { appId: 'music',       label: 'Music' },
  { appId: 'notes',       label: 'Notes' },
  { appId: 'imageviewer', label: 'Gallery' },
  { appId: 'roadchain',   label: 'RoadChain' },
  { appId: 'roadverse',   label: 'RoadVerse' },
];

const PINNED_APPS = ['roadchain','roadstream','roadfeed','roadsearch','roadcode','roadcomms','roadverse'];

const START_MENU_APPS = [
  { appId: 'terminal',   label: 'Terminal' },
  { appId: 'filemanager',label: 'Files' },
  { appId: 'browser',    label: 'Browser' },
  { appId: 'editor',     label: 'Editor' },
  { appId: 'calculator', label: 'Calculator' },
  { appId: 'sysmon',     label: 'Monitor' },
  { appId: 'settings',   label: 'Settings' },
  { appId: 'music',      label: 'Music' },
  { appId: 'notes',      label: 'Notes' },
  { appId: 'imageviewer',label: 'Gallery' },
  { appId: 'roadchain',  label: 'RoadChain' },
  { appId: 'roadstream', label: 'RoadStream' },
  { appId: 'roadfeed',   label: 'RoadFeed' },
  { appId: 'roadsearch', label: 'RoadSearch' },
  { appId: 'roadcode',   label: 'RoadCode' },
  { appId: 'roadcomms',  label: 'RoadComms' },
  { appId: 'roadverse',  label: 'RoadVerse' },
];

const FILESYSTEM = {
  '/': { type: 'dir', children: ['home', 'system', 'apps', 'tmp'] },
  '/home': { type: 'dir', children: ['Documents', 'Desktop', 'Downloads', 'Pictures', 'Music', 'Projects'] },
  '/home/Documents': { type: 'dir', children: ['roadmap.md', 'notes.txt', 'budget.xlsx'] },
  '/home/Desktop': { type: 'dir', children: ['screenshot.png', 'todo.txt'] },
  '/home/Downloads': { type: 'dir', children: ['installer.dmg', 'archive.zip', 'report.pdf'] },
  '/home/Pictures': { type: 'dir', children: ['avatar.png', 'wallpaper.jpg', 'logo.svg'] },
  '/home/Music': { type: 'dir', children: ['ambient.mp3', 'synthwave.flac', 'chill.ogg'] },
  '/home/Projects': { type: 'dir', children: ['blackroad-os', 'roaddesk', 'lucidia-core'] },
  '/home/Projects/blackroad-os': { type: 'dir', children: ['package.json', 'src', 'README.md'] },
  '/home/Projects/roaddesk': { type: 'dir', children: ['package.json', 'vite.config.js', 'src'] },
  '/home/Projects/lucidia-core': { type: 'dir', children: ['setup.py', 'lucidia', 'tests'] },
  '/system': { type: 'dir', children: ['config', 'logs', 'cache'] },
  '/system/config': { type: 'dir', children: ['settings.json', 'theme.json'] },
  '/system/logs': { type: 'dir', children: ['system.log', 'agent.log', 'error.log'] },
  '/system/cache': { type: 'dir', children: ['thumbnails', 'temp'] },
  '/apps': { type: 'dir', children: ['Terminal.app', 'Browser.app', 'Editor.app', 'Music.app'] },
  '/tmp': { type: 'dir', children: ['session-xyz', 'swap'] },
};

function isDir(path) {
  return !!FILESYSTEM[path];
}

function getChildren(path) {
  const entry = FILESYSTEM[path];
  if (!entry) return [];
  return entry.children.map(name => {
    const childPath = path === '/' ? '/' + name : path + '/' + name;
    return { name, path: childPath, isDir: !!FILESYSTEM[childPath] };
  });
}

function getFileIcon(name, dir) {
  if (dir) return '\u{1F4C1}';
  const ext = name.split('.').pop().toLowerCase();
  const map = {
    md: '\u{1F4C4}', txt: '\u{1F4C4}', json: '\u{1F4CB}', js: '\u{1F4DC}', py: '\u{1F40D}',
    xlsx: '\u{1F4CA}', pdf: '\u{1F4D5}', png: '\u{1F5BC}\uFE0F', jpg: '\u{1F5BC}\uFE0F', svg: '\u{1F3A8}',
    mp3: '\u{1F3B5}', flac: '\u{1F3B5}', ogg: '\u{1F3B5}', dmg: '\u{1F4E6}', zip: '\u{1F4E6}',
    app: '\u{1F4E6}', log: '\u{1F4DC}', cfg: '\u2699\uFE0F',
  };
  return map[ext] || '\u{1F4C4}';
}

const INITIAL_NOTIFICATIONS = [
  { id: 1, type: 'urgent', title: 'Agent Alert', body: 'Octavia detected unusual traffic pattern on edge cluster.', time: '2 min ago' },
  { id: 2, type: 'info', title: 'Deployment Complete', body: 'RoadChain v2.4.1 deployed to production successfully.', time: '15 min ago' },
  { id: 3, type: 'success', title: 'Build Passed', body: 'blackroad-os-web CI pipeline completed. All 847 tests passing.', time: '28 min ago' },
  { id: 4, type: 'info', title: 'Memory Sync', body: 'PS-SHA hash chain verified. 12,592 agent memories synchronized.', time: '1 hr ago' },
  { id: 5, type: 'urgent', title: 'Security Scan', body: 'Cipher completed security audit. 2 medium-severity issues found.', time: '2 hr ago' },
];

const TERMINAL_WELCOME = `BlackRoad OS v3.0.0 - RoadDesk Terminal
Copyright (c) 2026 BlackRoad OS, Inc. All rights reserved.
Type "help" for available commands.
`;

const TERMINAL_COMMANDS = {
  help: `Available commands:
  help        Show this help message
  ls          List files in current directory
  pwd         Print working directory
  whoami      Display current user
  date        Show current date and time
  agents      List active agents
  status      System status overview
  neofetch    System information
  clear       Clear terminal
  uname       System name
  uptime      System uptime`,
  pwd: '/home/blackroad',
  whoami: 'blackroad',
  uname: 'RoadDesk OS 3.0.0 (blackroad-kernel x86_64)',
  uptime: () => `up ${Math.floor(Math.random() * 30 + 1)} days, ${Math.floor(Math.random()*24)}:${String(Math.floor(Math.random()*60)).padStart(2,'0')}`,
  date: () => new Date().toString(),
  ls: 'Desktop  Documents  Downloads  Music  Pictures  Projects  .blackroad  .config',
  agents: `AGENT        STATUS    TASKS    UPTIME
LUCIDIA      active    1,247    14d 7h
ALICE        active      892    14d 7h
OCTAVIA      active    2,103    14d 7h
PRISM        active      634    14d 7h
ECHO         active      456    14d 7h
CIPHER       active      781    14d 7h

Total: 6 agents active | 30,000 distributed agents online`,
  status: `BlackRoad OS Status
====================
CPU:       23% (8 cores)
Memory:    6.2 / 16 GB (38%)
Disk:      234 / 512 GB (45%)
Network:   12.4 Mbps up / 87.2 Mbps down
Agents:    30,000 online
Services:  47 running
Uptime:    14 days 7 hours`,
  neofetch: `
   ____  ____     blackroad@roaddesk
  | __ )|  _ \\    ------------------
  |  _ \\| |_) |   OS: RoadDesk OS 3.0.0 x86_64
  | |_) |  _ <    Host: BlackRoad Virtual Desktop
  |____/|_| \\_\\   Kernel: roaddesk-kernel 3.0.0
                  Shell: br-shell 2.1
  [\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588]  Terminal: RoadTerm
  [\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588]  CPU: BlackRoad V-Core (8) @ 3.6GHz
                  GPU: Virtual Accelerator
                  Memory: 6.2 GiB / 16.0 GiB`,
};

const SAMPLE_CODE = `// blackroad-agent.js - Agent Orchestration
import { createSDK } from '@blackroad/skills-sdk';

const sdk = createSDK({ agentId: 'agent-0001' });

async function processTask(task) {
  // Store observation in memory
  await sdk.memory.observe(\`Processing: \${task.title}\`);

  // Evaluate with trinary logic
  const result = await sdk.reasoning.evaluate(task.claim);

  if (result.contradictions.detected) {
    await sdk.reasoning.quarantine(
      result.contradictions.claims.map(c => c.id)
    );
    return { status: 'quarantined' };
  }

  // Delegate to specialized agent
  const agent = await sdk.agents.findByCapabilities(task.skills);
  await sdk.coordination.delegate({
    taskType: task.type,
    description: task.description,
    assignTo: agent.id,
  });

  await sdk.memory.remember(\`Delegated \${task.title} to \${agent.name}\`);
  return { status: 'delegated', agent: agent.name };
}

export default processTask;
`;

const INITIAL_NOTES = [
  { id: 1, title: 'Sprint Goals', content: 'Q1 2026 Sprint 4:\n- RoadDesk v1.0 launch\n- Agent mesh optimization\n- Memory bridge v2 deployment\n- 30K agent milestone celebration' },
  { id: 2, title: 'Architecture Notes', content: 'Tokenless Gateway pattern:\n[Agent CLI] -> [Gateway :8787] -> [Provider]\n\nAgents never hold API keys.\nGateway validates via agent-permissions.json.' },
  { id: 3, title: 'Quick Ideas', content: '- Add voice commands to RoadDesk\n- Pi cluster auto-scaling\n- CECE multi-provider sync\n- Trinity dashboard widgets' },
];


// ============================================================
// HELPER: useInterval hook
// ============================================================
function useInterval(callback, delay) {
  const savedCallback = useRef();
  useEffect(() => { savedCallback.current = callback; }, [callback]);
  useEffect(() => {
    if (delay !== null) {
      const id = setInterval(() => savedCallback.current(), delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

let windowIdCounter = 0;
function nextWindowId() {
  return ++windowIdCounter;
}


// ============================================================
// SUB-COMPONENTS: App content renderers
// ============================================================

function TerminalApp() {
  const [lines, setLines] = useState([TERMINAL_WELCOME]);
  const [input, setInput] = useState('');
  const outputRef = useRef(null);

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [lines]);

  const handleCommand = (e) => {
    if (e.key !== 'Enter') return;
    const cmd = input.trim();
    const newLines = [...lines, `blackroad@roaddesk:~$ ${cmd}`];
    if (cmd === 'clear') {
      setLines([]);
      setInput('');
      return;
    }
    if (cmd === '') {
      setLines(newLines);
      setInput('');
      return;
    }
    const handler = TERMINAL_COMMANDS[cmd];
    if (handler) {
      newLines.push(typeof handler === 'function' ? handler() : handler);
    } else if (cmd.startsWith('echo ')) {
      newLines.push(cmd.slice(5));
    } else {
      newLines.push(`br-shell: command not found: ${cmd}`);
    }
    setLines(newLines);
    setInput('');
  };

  return (
    <div className="app-terminal">
      <div className="terminal-output" ref={outputRef}>
        {lines.map((l, i) => <div key={i}>{l}</div>)}
      </div>
      <div className="terminal-input-line">
        <span className="terminal-prompt">blackroad@roaddesk:~$&nbsp;</span>
        <input className="terminal-input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleCommand} autoFocus spellCheck={false} />
      </div>
    </div>
  );
}

function FileManagerApp() {
  const [currentPath, setCurrentPath] = useState('/home');
  const items = getChildren(currentPath);
  const pathParts = currentPath.split('/').filter(Boolean);

  const navigate = (path) => { if (isDir(path)) setCurrentPath(path); };
  const goUp = () => {
    const parts = currentPath.split('/').filter(Boolean);
    if (parts.length > 0) {
      parts.pop();
      setCurrentPath('/' + parts.join('/') || '/');
    }
  };

  const sidebarItems = [
    { icon: '\u{1F3E0}', label: 'Home', path: '/home' },
    { icon: '\u{1F4C4}', label: 'Documents', path: '/home/Documents' },
    { icon: '\u2B07\uFE0F', label: 'Downloads', path: '/home/Downloads' },
    { icon: '\u{1F5BC}\uFE0F', label: 'Pictures', path: '/home/Pictures' },
    { icon: '\u{1F3B5}', label: 'Music', path: '/home/Music' },
    { icon: '\u{1F4BB}', label: 'Projects', path: '/home/Projects' },
    { icon: '\u2699\uFE0F', label: 'System', path: '/system' },
  ];

  return (
    <div className="app-filemanager">
      <div className="fm-toolbar">
        <button className="fm-nav-btn" onClick={goUp} title="Up">\u2191</button>
        <button className="fm-nav-btn" onClick={() => setCurrentPath('/home')} title="Home">\u{1F3E0}</button>
        <div className="fm-breadcrumb">
          <span onClick={() => setCurrentPath('/')}>/</span>
          {pathParts.map((p, i) => (
            <React.Fragment key={i}>
              <span className="fm-breadcrumb-sep">/</span>
              <span onClick={() => setCurrentPath('/' + pathParts.slice(0, i + 1).join('/'))}>{p}</span>
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="fm-body">
        <div className="fm-sidebar">
          {sidebarItems.map(s => (
            <div key={s.path} className={`fm-sidebar-item ${currentPath === s.path ? 'active' : ''}`} onClick={() => navigate(s.path)}>
              <span>{s.icon}</span> {s.label}
            </div>
          ))}
        </div>
        <div className="fm-content">
          {items.map(item => (
            <div key={item.name} className="fm-item" onDoubleClick={() => item.isDir && navigate(item.path)}>
              <span className="fm-item-icon">{getFileIcon(item.name, item.isDir)}</span>
              <span className="fm-item-name">{item.name}</span>
            </div>
          ))}
          {items.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>Empty folder</div>}
        </div>
      </div>
    </div>
  );
}

function SettingsApp() {
  const [active, setActive] = useState('display');
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(false);
  const [animations, setAnimations] = useState(true);
  const [blur, setBlur] = useState(true);

  const navItems = [
    { id: 'display', icon: '\u{1F5A5}', label: 'Display' },
    { id: 'network', icon: '\u{1F310}', label: 'Network' },
    { id: 'notifications', icon: '\u{1F514}', label: 'Notifications' },
    { id: 'about', icon: '\u2139\uFE0F', label: 'About' },
  ];

  return (
    <div className="app-settings">
      <div className="settings-nav">
        {navItems.map(n => (
          <div key={n.id} className={`settings-nav-item ${active === n.id ? 'active' : ''}`} onClick={() => setActive(n.id)}>
            <span>{n.icon}</span> {n.label}
          </div>
        ))}
      </div>
      <div className="settings-content">
        {active === 'display' && (
          <>
            <h2>Display</h2>
            <div className="settings-group">
              <div className="settings-group-title">Appearance</div>
              <div className="settings-row">
                <div><div className="settings-row-label">Dark Mode</div><div className="settings-row-desc">Use dark color scheme</div></div>
                <button className={`toggle ${darkMode ? 'on' : ''}`} onClick={() => setDarkMode(!darkMode)} />
              </div>
              <div className="settings-row">
                <div><div className="settings-row-label">Animations</div><div className="settings-row-desc">Enable window animations</div></div>
                <button className={`toggle ${animations ? 'on' : ''}`} onClick={() => setAnimations(!animations)} />
              </div>
              <div className="settings-row">
                <div><div className="settings-row-label">Blur Effects</div><div className="settings-row-desc">Enable backdrop blur on windows</div></div>
                <button className={`toggle ${blur ? 'on' : ''}`} onClick={() => setBlur(!blur)} />
              </div>
            </div>
            <div className="settings-group">
              <div className="settings-group-title">Wallpaper</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {['linear-gradient(135deg, #0a0a14, #1a0a20)', 'linear-gradient(135deg, #0a0a14, #0a1a20)', 'linear-gradient(135deg, #1a1a28, #0a0a14)', 'linear-gradient(135deg, #F5A623, #FF1D6C, #9C27B0, #2979FF)'].map((g, i) => (
                  <div key={i} style={{ height: 60, borderRadius: 8, background: g, border: i === 0 ? '2px solid var(--hot-pink)' : '2px solid transparent', cursor: 'pointer' }} />
                ))}
              </div>
            </div>
          </>
        )}
        {active === 'network' && (
          <>
            <h2>Network</h2>
            <div className="settings-group">
              <div className="settings-group-title">Connection</div>
              <div className="settings-row"><div><div className="settings-row-label">Wi-Fi</div><div className="settings-row-desc">BlackRoad-5G (Connected)</div></div><span style={{ color: '#28c840' }}>Connected</span></div>
              <div className="settings-row"><div><div className="settings-row-label">IP Address</div><div className="settings-row-desc">192.168.4.100</div></div></div>
              <div className="settings-row"><div><div className="settings-row-label">Gateway</div><div className="settings-row-desc">192.168.4.1</div></div></div>
              <div className="settings-row"><div><div className="settings-row-label">DNS</div><div className="settings-row-desc">1.1.1.1, 8.8.8.8</div></div></div>
            </div>
            <div className="settings-group">
              <div className="settings-group-title">Infrastructure</div>
              <div className="settings-row"><div><div className="settings-row-label">Cloudflare Tunnel</div><div className="settings-row-desc">blackroad (QUIC)</div></div><span style={{ color: '#28c840' }}>Active</span></div>
              <div className="settings-row"><div><div className="settings-row-label">Mesh Nodes</div><div className="settings-row-desc">3 Raspberry Pis connected</div></div><span>3/3</span></div>
            </div>
          </>
        )}
        {active === 'notifications' && (
          <>
            <h2>Notifications</h2>
            <div className="settings-group">
              <div className="settings-group-title">Preferences</div>
              <div className="settings-row">
                <div><div className="settings-row-label">Enable Notifications</div><div className="settings-row-desc">Show notification cards</div></div>
                <button className={`toggle ${notifications ? 'on' : ''}`} onClick={() => setNotifications(!notifications)} />
              </div>
              <div className="settings-row">
                <div><div className="settings-row-label">Sound</div><div className="settings-row-desc">Play notification sounds</div></div>
                <button className={`toggle ${sounds ? 'on' : ''}`} onClick={() => setSounds(!sounds)} />
              </div>
            </div>
          </>
        )}
        {active === 'about' && (
          <>
            <h2>About RoadDesk</h2>
            <div className="settings-group">
              <div className="settings-group-title">System</div>
              <div className="settings-row"><div><div className="settings-row-label">Version</div></div><span>3.0.0</span></div>
              <div className="settings-row"><div><div className="settings-row-label">Build</div></div><span>2026.02.28-prod</span></div>
              <div className="settings-row"><div><div className="settings-row-label">Kernel</div></div><span>roaddesk-kernel 3.0.0</span></div>
              <div className="settings-row"><div><div className="settings-row-label">Agents Online</div></div><span style={{ color: '#28c840' }}>30,000</span></div>
              <div className="settings-row"><div><div className="settings-row-label">Repositories</div></div><span>1,825+</span></div>
              <div className="settings-row"><div><div className="settings-row-label">Organizations</div></div><span>17</span></div>
            </div>
            <div style={{ marginTop: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
              BlackRoad OS, Inc. All rights reserved.
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function TextEditorApp() {
  const [code, setCode] = useState(SAMPLE_CODE);
  const lineCount = code.split('\n').length;
  return (
    <div className="app-editor">
      <div className="editor-tabs">
        <div className="editor-tab active"><span>\u{1F4DC}</span> blackroad-agent.js</div>
        <div className="editor-tab"><span>\u{1F4CB}</span> package.json</div>
        <div className="editor-tab"><span>\u{1F4C4}</span> README.md</div>
      </div>
      <div className="editor-body">
        <div className="editor-line-numbers">
          {Array.from({ length: lineCount }, (_, i) => <div key={i}>{i + 1}</div>)}
        </div>
        <textarea className="editor-code" value={code} onChange={e => setCode(e.target.value)} spellCheck={false} />
      </div>
      <div className="editor-statusbar">
        <span>JavaScript | UTF-8 | LF</span>
        <span>Ln {lineCount}, Col 1 | Spaces: 2</span>
      </div>
    </div>
  );
}

function CalculatorApp() {
  const [display, setDisplay] = useState('0');
  const [expr, setExpr] = useState('');
  const [freshResult, setFreshResult] = useState(false);

  const handleBtn = (val) => {
    if (val === 'C') { setDisplay('0'); setExpr(''); setFreshResult(false); return; }
    if (val === '\u232B') { setDisplay(d => d.length > 1 ? d.slice(0, -1) : '0'); return; }
    if (val === '=') {
      try {
        const sanitized = display.replace(/[^0-9+\-*/().%]/g, '');
        const result = Function('"use strict"; return (' + sanitized + ')')();
        setExpr(display + ' =');
        setDisplay(String(result));
        setFreshResult(true);
      } catch { setDisplay('Error'); setFreshResult(true); }
      return;
    }
    if (val === '%') { setDisplay(d => String(parseFloat(d) / 100)); return; }
    if (val === '\u00B1') { setDisplay(d => d.startsWith('-') ? d.slice(1) : '-' + d); return; }
    if (['+','-','*','/'].includes(val)) {
      setDisplay(d => d + val);
      setFreshResult(false);
      return;
    }
    if (freshResult) { setDisplay(val); setFreshResult(false); setExpr(''); return; }
    setDisplay(d => d === '0' && val !== '.' ? val : d + val);
  };

  const buttons = [
    ['C', '\u00B1', '%', '/'],
    ['7', '8', '9', '*'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '\u232B', '='],
  ];

  return (
    <div className="app-calculator">
      <div className="calc-display">
        <div className="calc-display-expr">{expr}</div>
        <div className="calc-display-value">{display}</div>
      </div>
      <div className="calc-grid">
        {buttons.flat().map(b => (
          <button key={b} className={`calc-btn ${['/','*','-','+'].includes(b) ? 'op' : ''} ${['C','\u00B1','%'].includes(b) ? 'func' : ''} ${b === '=' ? 'equals' : ''}`}
            onClick={() => handleBtn(b)}>{b}</button>
        ))}
      </div>
    </div>
  );
}

function SystemMonitorApp() {
  const [cpu, setCpu] = useState(23);
  const [ram, setRam] = useState(38);
  const [disk] = useState(45);
  const [gpu, setGpu] = useState(12);

  useInterval(() => {
    setCpu(c => Math.max(5, Math.min(95, c + (Math.random() - 0.48) * 8)));
    setRam(r => Math.max(20, Math.min(85, r + (Math.random() - 0.5) * 3)));
    setGpu(g => Math.max(0, Math.min(90, g + (Math.random() - 0.45) * 6)));
  }, 1500);

  const processes = [
    { name: 'lucidia-core', cpu: '4.2%', mem: '1.2 GB' },
    { name: 'agent-mesh', cpu: '3.8%', mem: '842 MB' },
    { name: 'roaddesk-renderer', cpu: '2.1%', mem: '624 MB' },
    { name: 'gateway-proxy', cpu: '1.7%', mem: '256 MB' },
    { name: 'ollama-server', cpu: '1.4%', mem: '2.1 GB' },
    { name: 'memory-bridge', cpu: '0.9%', mem: '384 MB' },
    { name: 'cloudflared', cpu: '0.6%', mem: '128 MB' },
    { name: 'hash-chain-journal', cpu: '0.3%', mem: '96 MB' },
  ];

  return (
    <div className="app-sysmon">
      <div className="sysmon-card">
        <div className="sysmon-card-header">
          <span className="sysmon-card-title">\u{1F9E0} CPU</span>
          <span className="sysmon-card-value">{cpu.toFixed(1)}%</span>
        </div>
        <div className="sysmon-bar"><div className="sysmon-bar-fill cpu" style={{ width: `${cpu}%` }} /></div>
      </div>
      <div className="sysmon-card">
        <div className="sysmon-card-header">
          <span className="sysmon-card-title">\u{1F4BE} Memory</span>
          <span className="sysmon-card-value">{(ram * 0.16).toFixed(1)} / 16 GB</span>
        </div>
        <div className="sysmon-bar"><div className="sysmon-bar-fill ram" style={{ width: `${ram}%` }} /></div>
      </div>
      <div className="sysmon-card">
        <div className="sysmon-card-header">
          <span className="sysmon-card-title">\u{1F4BF} Disk</span>
          <span className="sysmon-card-value">234 / 512 GB</span>
        </div>
        <div className="sysmon-bar"><div className="sysmon-bar-fill disk" style={{ width: `${disk}%` }} /></div>
      </div>
      <div className="sysmon-card">
        <div className="sysmon-card-header">
          <span className="sysmon-card-title">\u26A1 GPU</span>
          <span className="sysmon-card-value">{gpu.toFixed(1)}%</span>
        </div>
        <div className="sysmon-bar"><div className="sysmon-bar-fill gpu" style={{ width: `${gpu}%` }} /></div>
      </div>
      <div className="sysmon-processes">
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Processes</div>
        {processes.map(p => (
          <div key={p.name} className="sysmon-process">
            <span className="sysmon-process-name">{p.name}</span>
            <span className="sysmon-process-value">{p.cpu}</span>
            <span className="sysmon-process-value">{p.mem}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BrowserApp() {
  const [url, setUrl] = useState('https://blackroad.io');
  return (
    <div className="app-browser">
      <div className="browser-toolbar">
        <button className="browser-nav-btn">\u2190</button>
        <button className="browser-nav-btn">\u2192</button>
        <button className="browser-nav-btn">\u21BB</button>
        <input className="browser-address" value={url} onChange={e => setUrl(e.target.value)} spellCheck={false} />
      </div>
      <div className="browser-body" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 48 }}>\u{1F310}</div>
        <div style={{ fontSize: 18, fontWeight: 600 }}>BlackRoad Browser</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Navigate to {url}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>Sandboxed browsing environment</div>
      </div>
    </div>
  );
}

function ImageViewerApp() {
  const thumbs = [
    { color: 'linear-gradient(135deg, #FF1D6C, #F5A623)', icon: '\u{1F305}' },
    { color: 'linear-gradient(135deg, #2979FF, #9C27B0)', icon: '\u{1F30C}' },
    { color: 'linear-gradient(135deg, #28c840, #2979FF)', icon: '\u{1F3DE}\uFE0F' },
    { color: 'linear-gradient(135deg, #9C27B0, #FF1D6C)', icon: '\u{1F308}' },
    { color: 'linear-gradient(135deg, #F5A623, #FF1D6C)', icon: '\u{1F307}' },
    { color: 'linear-gradient(135deg, #2979FF, #28c840)', icon: '\u{1F30A}' },
    { color: 'linear-gradient(135deg, #FF1D6C, #9C27B0)', icon: '\u2728' },
    { color: 'linear-gradient(135deg, #F5A623, #9C27B0)', icon: '\u{1F3A8}' },
    { color: 'linear-gradient(135deg, #28c840, #F5A623)', icon: '\u{1F33F}' },
  ];

  return (
    <div className="app-imageviewer">
      <div className="iv-toolbar">
        <button className="fm-nav-btn">\u2B05\uFE0F</button>
        <button className="fm-nav-btn">\u27A1\uFE0F</button>
        <span style={{ flex: 1, fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center' }}>Gallery - 9 items</span>
        <button className="fm-nav-btn">\u{1F50D}</button>
      </div>
      <div className="iv-gallery">
        {thumbs.map((t, i) => (
          <div key={i} className="iv-thumb" style={{ background: t.color }}>{t.icon}</div>
        ))}
      </div>
    </div>
  );
}

function MusicPlayerApp() {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(32);

  useInterval(() => {
    if (playing) setProgress(p => p >= 100 ? 0 : p + 0.4);
  }, 1000);

  const formatTime = (pct) => {
    const total = 234;
    const s = Math.floor(total * pct / 100);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };

  return (
    <div className="app-music">
      <div className="music-art">\u{1F3B5}</div>
      <div className="music-title">Midnight Protocol</div>
      <div className="music-artist">BlackRoad OST</div>
      <div className="music-progress">
        <div className="music-progress-bar" onClick={e => { const r = e.currentTarget.getBoundingClientRect(); setProgress((e.clientX - r.left) / r.width * 100); }}>
          <div className="music-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="music-times">
          <span>{formatTime(progress)}</span>
          <span>3:54</span>
        </div>
      </div>
      <div className="music-controls">
        <button className="music-btn">\u23EE</button>
        <button className="music-btn play" onClick={() => setPlaying(!playing)}>{playing ? '\u23F8' : '\u25B6'}</button>
        <button className="music-btn">\u23ED</button>
      </div>
    </div>
  );
}

function NotesApp() {
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [activeNote, setActiveNote] = useState(0);

  const addNote = () => {
    const n = { id: Date.now(), title: 'New Note', content: '' };
    setNotes([n, ...notes]);
    setActiveNote(0);
  };

  const updateContent = (content) => {
    const updated = [...notes];
    updated[activeNote] = { ...updated[activeNote], content };
    if (content.length > 0 && updated[activeNote].title === 'New Note') {
      updated[activeNote].title = content.split('\n')[0].slice(0, 30) || 'New Note';
    }
    setNotes(updated);
  };

  return (
    <div className="app-notes">
      <div className="notes-sidebar">
        <div className="notes-sidebar-header">
          <span className="notes-sidebar-title">Notes</span>
          <button className="notes-new-btn" onClick={addNote}>+</button>
        </div>
        <div className="notes-list">
          {notes.map((n, i) => (
            <div key={n.id} className={`notes-list-item ${i === activeNote ? 'active' : ''}`} onClick={() => setActiveNote(i)}>
              <div className="notes-list-item-title">{n.title}</div>
              <div className="notes-list-item-preview">{n.content.split('\n')[0]}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="notes-editor">
        {notes[activeNote] && (
          <textarea value={notes[activeNote].content} onChange={e => updateContent(e.target.value)} placeholder="Start typing..." spellCheck={false} />
        )}
      </div>
    </div>
  );
}

function RoadAppPlaceholder({ appId }) {
  const app = APP_REGISTRY[appId];
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '100%', gap: 16, background: 'var(--bg-secondary)',
    }}>
      <div style={{ fontSize: 64 }}>{app?.icon}</div>
      <div style={{ fontSize: 22, fontWeight: 600 }} className="text-gradient">{app?.name || appId}</div>
      <div style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 300, textAlign: 'center', lineHeight: 1.6 }}>
        {appId === 'roadchain' && 'Decentralized ledger dashboard. Track transactions, mine blocks, and manage your wallet.'}
        {appId === 'roadstream' && 'Live streaming platform. Watch and broadcast real-time content across the BlackRoad network.'}
        {appId === 'roadfeed' && 'Social feed aggregator. Stay updated with posts from across the BlackRoad ecosystem.'}
        {appId === 'roadsearch' && 'Intelligent search engine. Find anything across 1,825+ repositories and services.'}
        {appId === 'roadcode' && 'Cloud IDE powered by BlackRoad agents. Write, test, and deploy code from your browser.'}
        {appId === 'roadcomms' && 'Encrypted messaging and video calls. Secure communication for teams and agents.'}
        {appId === 'roadverse' && '3D metaverse environment. Explore virtual spaces and interact with AI agents.'}
      </div>
      <div style={{ marginTop: 12, padding: '8px 20px', borderRadius: 20, background: 'var(--gradient-brand)', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
        Launch {app?.name}
      </div>
    </div>
  );
}

function renderAppContent(appId) {
  switch (appId) {
    case 'terminal': return <TerminalApp />;
    case 'filemanager': return <FileManagerApp />;
    case 'settings': return <SettingsApp />;
    case 'editor': return <TextEditorApp />;
    case 'calculator': return <CalculatorApp />;
    case 'sysmon': return <SystemMonitorApp />;
    case 'browser': return <BrowserApp />;
    case 'imageviewer': return <ImageViewerApp />;
    case 'music': return <MusicPlayerApp />;
    case 'notes': return <NotesApp />;
    default: return <RoadAppPlaceholder appId={appId} />;
  }
}


// ============================================================
// MAIN APP COMPONENT
// ============================================================

export default function App() {
  // ----- Lock screen -----
  const [locked, setLocked] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [lockPassword, setLockPassword] = useState('');

  // ----- Clock -----
  const [now, setNow] = useState(new Date());
  useInterval(() => setNow(new Date()), 1000);

  // ----- Windows -----
  const [windows, setWindows] = useState([]);
  const [focusedId, setFocusedId] = useState(null);
  const [nextZIndex, setNextZIndex] = useState(100);

  // ----- Start menu -----
  const [startOpen, setStartOpen] = useState(false);
  const [startSearch, setStartSearch] = useState('');

  // ----- Context menu -----
  const [contextMenu, setContextMenu] = useState(null);

  // ----- Notifications -----
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  // ----- Workspaces -----
  const [currentWorkspace, setCurrentWorkspace] = useState(0);
  const [showWorkspaceSwitcher, setShowWorkspaceSwitcher] = useState(false);
  const workspaceCount = 4;

  // ----- Dragging -----
  const [dragging, setDragging] = useState(null);
  const dragRef = useRef(null);

  // ----- Resizing -----
  const [resizing, setResizing] = useState(null);
  const resizeRef = useRef(null);

  // ----- Snap -----
  const [snapPreview, setSnapPreview] = useState(null);

  // ----- Selected desktop icon -----
  const [selectedIcon, setSelectedIcon] = useState(null);

  // ----- Desktop ref -----
  const desktopRef = useRef(null);

  // == UNLOCK ==
  const handleUnlock = (e) => {
    e.preventDefault();
    setUnlocking(true);
    setTimeout(() => { setLocked(false); setUnlocking(false); }, 600);
  };

  // == OPEN APP ==
  const openApp = useCallback((appId) => {
    const reg = APP_REGISTRY[appId];
    if (!reg) return;

    // Check if already open (not minimized) - bring to front
    const existing = windows.find(w => w.appId === appId && !w.minimized);
    if (existing) {
      focusWindow(existing.id);
      return;
    }

    // Check if minimized - restore
    const minimized = windows.find(w => w.appId === appId && w.minimized);
    if (minimized) {
      setWindows(ws => ws.map(w => w.id === minimized.id ? { ...w, minimized: false } : w));
      focusWindow(minimized.id);
      return;
    }

    const id = nextWindowId();
    const dw = desktopRef.current?.clientWidth || 1200;
    const dh = desktopRef.current?.clientHeight || 700;
    const w = Math.min(reg.defaultW, dw - 40);
    const h = Math.min(reg.defaultH, dh - 40);
    const offset = (windows.length % 8) * 28;

    const win = {
      id, appId,
      x: Math.min(60 + offset, dw - w - 20),
      y: Math.min(30 + offset, dh - h - 20),
      w, h,
      minimized: false,
      maximized: false,
      snapped: null,
      zIndex: nextZIndex,
      workspace: currentWorkspace,
      // Store pre-maximize/pre-snap position
      prevRect: null,
    };

    setNextZIndex(z => z + 1);
    setWindows(ws => [...ws, win]);
    setFocusedId(id);
    setStartOpen(false);
  }, [windows, nextZIndex, currentWorkspace]);

  // == FOCUS ==
  const focusWindow = useCallback((id) => {
    setFocusedId(id);
    setNextZIndex(z => z + 1);
    setWindows(ws => ws.map(w => w.id === id ? { ...w, zIndex: nextZIndex + 1 } : w));
  }, [nextZIndex]);

  // == CLOSE ==
  const closeWindow = (id) => {
    setWindows(ws => ws.filter(w => w.id !== id));
    if (focusedId === id) {
      const remaining = windows.filter(w => w.id !== id && !w.minimized);
      setFocusedId(remaining.length ? remaining[remaining.length - 1].id : null);
    }
  };

  // == MINIMIZE ==
  const minimizeWindow = (id) => {
    setWindows(ws => ws.map(w => w.id === id ? { ...w, minimized: true } : w));
    if (focusedId === id) {
      const remaining = windows.filter(w => w.id !== id && !w.minimized);
      setFocusedId(remaining.length ? remaining[remaining.length - 1].id : null);
    }
  };

  // == MAXIMIZE / RESTORE ==
  const toggleMaximize = (id) => {
    setWindows(ws => ws.map(w => {
      if (w.id !== id) return w;
      if (w.maximized) {
        // Restore
        const pr = w.prevRect || { x: 80, y: 40, w: APP_REGISTRY[w.appId]?.defaultW || 600, h: APP_REGISTRY[w.appId]?.defaultH || 400 };
        return { ...w, maximized: false, snapped: null, x: pr.x, y: pr.y, w: pr.w, h: pr.h };
      }
      // Maximize
      const dw = desktopRef.current?.clientWidth || 1200;
      const dh = desktopRef.current?.clientHeight || 700;
      return { ...w, maximized: true, snapped: null, prevRect: { x: w.x, y: w.y, w: w.w, h: w.h }, x: 0, y: 0, w: dw, h: dh };
    }));
  };

  // == DRAG START ==
  const handleDragStart = (e, winId) => {
    if (e.button !== 0) return;
    const win = windows.find(w => w.id === winId);
    if (!win) return;

    // If maximized, un-maximize but keep mouse position relative
    if (win.maximized || win.snapped) {
      const dw = desktopRef.current?.clientWidth || 1200;
      const dh = desktopRef.current?.clientHeight || 700;
      const pr = win.prevRect || { x: 0, y: 0, w: APP_REGISTRY[win.appId]?.defaultW || 600, h: APP_REGISTRY[win.appId]?.defaultH || 400 };
      const ratio = (e.clientX - win.x) / win.w;
      const newX = e.clientX - pr.w * ratio;
      const newY = e.clientY - 20;
      setWindows(ws => ws.map(w => w.id === winId ? { ...w, maximized: false, snapped: null, x: Math.max(0, newX), y: Math.max(0, newY), w: pr.w, h: pr.h } : w));
      setDragging({ winId, offsetX: pr.w * ratio, offsetY: 20 });
    } else {
      focusWindow(winId);
      setDragging({ winId, offsetX: e.clientX - win.x, offsetY: e.clientY - win.y });
    }

    e.preventDefault();
  };

  // == DRAG MOVE ==
  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e) => {
      const dw = desktopRef.current?.clientWidth || 1200;
      const dh = desktopRef.current?.clientHeight || 700;
      const nx = e.clientX - dragging.offsetX;
      const ny = e.clientY - dragging.offsetY;

      setWindows(ws => ws.map(w => w.id === dragging.winId ? { ...w, x: nx, y: Math.max(0, ny) } : w));

      // Snap preview
      const snapMargin = 20;
      if (e.clientX <= snapMargin) {
        setSnapPreview({ left: 0, top: 0, width: dw / 2, height: dh });
      } else if (e.clientX >= dw - snapMargin) {
        setSnapPreview({ left: dw / 2, top: 0, width: dw / 2, height: dh });
      } else if (e.clientY <= snapMargin) {
        setSnapPreview({ left: 0, top: 0, width: dw, height: dh });
      } else {
        setSnapPreview(null);
      }
    };

    const handleMouseUp = (e) => {
      const dw = desktopRef.current?.clientWidth || 1200;
      const dh = desktopRef.current?.clientHeight || 700;
      const snapMargin = 20;

      if (e.clientX <= snapMargin) {
        // Snap left
        setWindows(ws => ws.map(w => {
          if (w.id !== dragging.winId) return w;
          return { ...w, snapped: 'left', prevRect: w.prevRect || { x: w.x, y: w.y, w: w.w, h: w.h }, x: 0, y: 0, w: dw / 2, h: dh };
        }));
      } else if (e.clientX >= dw - snapMargin) {
        // Snap right
        setWindows(ws => ws.map(w => {
          if (w.id !== dragging.winId) return w;
          return { ...w, snapped: 'right', prevRect: w.prevRect || { x: w.x, y: w.y, w: w.w, h: w.h }, x: dw / 2, y: 0, w: dw / 2, h: dh };
        }));
      } else if (e.clientY <= snapMargin) {
        // Snap maximize
        setWindows(ws => ws.map(w => {
          if (w.id !== dragging.winId) return w;
          return { ...w, maximized: true, prevRect: w.prevRect || { x: w.x, y: w.y, w: w.w, h: w.h }, x: 0, y: 0, w: dw, h: dh };
        }));
      }

      setDragging(null);
      setSnapPreview(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging]);

  // == RESIZE START ==
  const handleResizeStart = (e, winId, direction) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const win = windows.find(w => w.id === winId);
    if (!win || win.maximized) return;
    focusWindow(winId);
    setResizing({ winId, direction, startX: e.clientX, startY: e.clientY, startW: win.w, startH: win.h, startLeft: win.x, startTop: win.y });
  };

  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e) => {
      const dx = e.clientX - resizing.startX;
      const dy = e.clientY - resizing.startY;
      setWindows(ws => ws.map(w => {
        if (w.id !== resizing.winId) return w;
        let nw = w.w, nh = w.h;
        if (resizing.direction === 'right' || resizing.direction === 'corner') nw = Math.max(320, resizing.startW + dx);
        if (resizing.direction === 'bottom' || resizing.direction === 'corner') nh = Math.max(200, resizing.startH + dy);
        return { ...w, w: nw, h: nh };
      }));
    };

    const handleMouseUp = () => setResizing(null);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing]);

  // == CONTEXT MENU ==
  const handleDesktopContext = (e) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
    setStartOpen(false);
  };

  // Click away to close menus
  const handleDesktopClick = (e) => {
    setContextMenu(null);
    setSelectedIcon(null);
    if (startOpen && !e.target.closest('.start-menu') && !e.target.closest('.taskbar-start')) {
      setStartOpen(false);
    }
    if (notifOpen && !e.target.closest('.notification-panel') && !e.target.closest('.tray-notif-btn')) {
      setNotifOpen(false);
    }
  };

  // == WORKSPACE SWITCH ==
  const switchWorkspace = (idx) => {
    setCurrentWorkspace(idx);
    setShowWorkspaceSwitcher(true);
    setTimeout(() => setShowWorkspaceSwitcher(false), 2000);
  };

  // Keyboard shortcut for workspaces
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key >= '1' && e.key <= '4') {
        e.preventDefault();
        switchWorkspace(parseInt(e.key) - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // == TIME FORMATTING ==
  const formatTime = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatTimeFull = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formatDate = (d) => d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  const formatDateShort = (d) => d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

  // Visible windows for current workspace
  const visibleWindows = windows.filter(w => w.workspace === currentWorkspace);
  const runningApps = windows.filter(w => !w.minimized);

  // Filtered start menu apps
  const filteredStartApps = START_MENU_APPS.filter(a =>
    a.label.toLowerCase().includes(startSearch.toLowerCase())
  );

  // == TASKBAR APP CLICK ==
  const handleTaskbarAppClick = (appId) => {
    const appWindows = windows.filter(w => w.appId === appId);
    if (appWindows.length === 0) {
      openApp(appId);
    } else {
      const visible = appWindows.find(w => !w.minimized);
      if (visible && focusedId === visible.id) {
        minimizeWindow(visible.id);
      } else if (visible) {
        focusWindow(visible.id);
      } else {
        // Restore minimized
        const min = appWindows.find(w => w.minimized);
        if (min) {
          setWindows(ws => ws.map(w => w.id === min.id ? { ...w, minimized: false } : w));
          focusWindow(min.id);
        }
      }
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  // == LOCK SCREEN ==
  if (locked) {
    return (
      <div className={`lock-screen ${unlocking ? 'unlocking' : ''}`}>
        <div className="lock-clock">{formatTime(now)}</div>
        <div className="lock-date">{formatDate(now)}</div>
        <div className="lock-avatar">\u{1F9D1}\u200D\u{1F4BB}</div>
        <div className="lock-user">BlackRoad</div>
        <form onSubmit={handleUnlock}>
          <div className="lock-input-row">
            <input
              className="lock-input"
              type="password"
              placeholder="Enter password..."
              value={lockPassword}
              onChange={e => setLockPassword(e.target.value)}
              autoFocus
            />
            <button className="lock-submit" type="submit">\u2192</button>
          </div>
        </form>
        <div className="lock-hint">Press Enter or click arrow to unlock</div>
      </div>
    );
  }

  return (
    <div className="desktop" onClick={handleDesktopClick}>
      {/* ===== DESKTOP AREA ===== */}
      <div className="desktop-area" ref={desktopRef} onContextMenu={handleDesktopContext}>

        {/* Desktop Icons */}
        <div className="desktop-icons">
          {DESKTOP_ICONS.map((icon, i) => {
            const app = APP_REGISTRY[icon.appId];
            return (
              <div
                key={icon.appId}
                className={`desktop-icon ${selectedIcon === icon.appId ? 'selected' : ''}`}
                onClick={(e) => { e.stopPropagation(); setSelectedIcon(icon.appId); }}
                onDoubleClick={() => openApp(icon.appId)}
              >
                <div className="desktop-icon-img" style={{ background: `${app.color}22`, border: `1px solid ${app.color}33` }}>
                  {app.icon}
                </div>
                <span className="desktop-icon-label">{icon.label}</span>
              </div>
            );
          })}
        </div>

        {/* Windows */}
        {visibleWindows.map(win => {
          if (win.minimized) return null;
          const app = APP_REGISTRY[win.appId];
          const isFocused = focusedId === win.id;
          return (
            <div
              key={win.id}
              className={`window ${isFocused ? 'focused' : ''} ${win.maximized ? 'maximized' : ''} ${win.snapped === 'left' ? 'snapped-left' : ''} ${win.snapped === 'right' ? 'snapped-right' : ''}`}
              style={{
                left: win.x,
                top: win.y,
                width: win.w,
                height: win.h,
                zIndex: win.zIndex,
              }}
              onMouseDown={() => focusWindow(win.id)}
            >
              <div className="window-titlebar" onMouseDown={e => handleDragStart(e, win.id)} onDoubleClick={() => toggleMaximize(win.id)}>
                <span className="window-titlebar-icon">{app?.icon}</span>
                <span className="window-titlebar-text">{app?.name || win.appId}</span>
                <div className="window-controls">
                  <button className="window-control minimize" onClick={(e) => { e.stopPropagation(); minimizeWindow(win.id); }} title="Minimize" />
                  <button className="window-control maximize" onClick={(e) => { e.stopPropagation(); toggleMaximize(win.id); }} title="Maximize" />
                  <button className="window-control close" onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }} title="Close" />
                </div>
              </div>
              <div className="window-body">
                {renderAppContent(win.appId)}
              </div>
              {!win.maximized && !win.snapped && (
                <>
                  <div className="resize-handle right" onMouseDown={e => handleResizeStart(e, win.id, 'right')} />
                  <div className="resize-handle bottom" onMouseDown={e => handleResizeStart(e, win.id, 'bottom')} />
                  <div className="resize-handle corner" onMouseDown={e => handleResizeStart(e, win.id, 'corner')} />
                </>
              )}
            </div>
          );
        })}

        {/* Snap preview */}
        {snapPreview && (
          <div className="snap-indicator" style={{
            left: snapPreview.left,
            top: snapPreview.top,
            width: snapPreview.width,
            height: snapPreview.height,
          }} />
        )}
      </div>

      {/* ===== TASKBAR ===== */}
      <div className="taskbar">
        {/* Start button */}
        <button className={`taskbar-start ${startOpen ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); setStartOpen(!startOpen); }}>
          <span className="text-gradient" style={{ fontSize: 18, fontWeight: 800 }}>B</span>
        </button>

        <div className="taskbar-divider" />

        {/* Pinned + Running apps */}
        <div className="taskbar-apps">
          {PINNED_APPS.map(appId => {
            const app = APP_REGISTRY[appId];
            const isRunning = windows.some(w => w.appId === appId);
            const isFocusedApp = windows.some(w => w.appId === appId && w.id === focusedId);
            return (
              <button
                key={appId}
                className={`taskbar-app ${isRunning ? 'running' : ''} ${isFocusedApp ? 'focused' : ''}`}
                onClick={() => handleTaskbarAppClick(appId)}
                title={app.name}
              >
                <span className="taskbar-app-icon">{app.icon}</span>
              </button>
            );
          })}
          <div className="taskbar-divider" />
          {/* Non-pinned running apps */}
          {windows.filter(w => !PINNED_APPS.includes(w.appId)).map(w => {
            const app = APP_REGISTRY[w.appId];
            const isFocusedApp = w.id === focusedId;
            return (
              <button
                key={w.id}
                className={`taskbar-app running ${isFocusedApp ? 'focused' : ''}`}
                onClick={() => {
                  if (w.minimized) {
                    setWindows(ws => ws.map(wn => wn.id === w.id ? { ...wn, minimized: false } : wn));
                    focusWindow(w.id);
                  } else if (isFocusedApp) {
                    minimizeWindow(w.id);
                  } else {
                    focusWindow(w.id);
                  }
                }}
                title={app?.name}
              >
                <span className="taskbar-app-icon">{app?.icon}</span>
                <span style={{ fontSize: 12 }}>{app?.name}</span>
              </button>
            );
          })}
        </div>

        {/* System tray */}
        <div className="taskbar-tray">
          <button className="tray-item" onClick={() => switchWorkspace((currentWorkspace + 1) % workspaceCount)} title={`Workspace ${currentWorkspace + 1}`}>
            \u{1F5A5} {currentWorkspace + 1}
          </button>
          <button className="tray-item" title="Volume">\u{1F50A}</button>
          <button className="tray-item" title="Wi-Fi">\u{1F4F6}</button>
          <button className="tray-item" title="Battery">\u{1F50B}</button>
          <button className="tray-item tray-notif-btn" onClick={(e) => { e.stopPropagation(); setNotifOpen(!notifOpen); }} title="Notifications">
            \u{1F514}
            {notifications.length > 0 && <span className="notification-badge">{notifications.length}</span>}
          </button>
          <div className="tray-clock" onClick={() => switchWorkspace((currentWorkspace + 1) % workspaceCount)} style={{ cursor: 'pointer' }}>
            <div className="tray-clock-time">{formatTime(now)}</div>
            <div className="tray-clock-date">{formatDateShort(now)}</div>
          </div>
        </div>
      </div>

      {/* ===== START MENU ===== */}
      {startOpen && (
        <div className="start-menu" onClick={e => e.stopPropagation()}>
          <div className="start-search" style={{ position: 'relative' }}>
            <span className="start-search-icon">\u{1F50D}</span>
            <input placeholder="Search apps..." value={startSearch} onChange={e => setStartSearch(e.target.value)} autoFocus />
          </div>
          <div className="start-body">
            <div className="start-apps">
              <div className="start-section-title">All Apps</div>
              <div className="start-app-grid">
                {filteredStartApps.map(a => {
                  const app = APP_REGISTRY[a.appId];
                  return (
                    <div key={a.appId} className="start-app-item" onClick={() => openApp(a.appId)}>
                      <div className="start-app-item-icon" style={{ background: `${app.color}18` }}>{app.icon}</div>
                      <div className="start-app-item-label">{a.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="start-sidebar">
              <div className="start-sidebar-section">
                <div className="start-sidebar-title">Recent</div>
                <div className="start-sidebar-item">\u{1F4C4} roadmap.md</div>
                <div className="start-sidebar-item">\u{1F4DC} agent.js</div>
                <div className="start-sidebar-item">\u{1F4CB} config.json</div>
                <div className="start-sidebar-item">\u{1F4CA} metrics.xlsx</div>
              </div>
              <div className="start-sidebar-section">
                <div className="start-sidebar-title">Quick Actions</div>
                <div className="start-sidebar-item" onClick={() => openApp('terminal')}>\u{1F5A5} Terminal</div>
                <div className="start-sidebar-item" onClick={() => openApp('filemanager')}>\u{1F4C1} Files</div>
                <div className="start-sidebar-item" onClick={() => openApp('settings')}>\u2699\uFE0F Settings</div>
              </div>
            </div>
          </div>
          <div className="start-footer">
            <div className="start-user">
              <div className="start-user-avatar">\u{1F9D1}\u200D\u{1F4BB}</div>
              <span className="start-user-name">BlackRoad</span>
            </div>
            <div className="start-power">
              <button className="start-power-btn" title="Sleep">\u{1F319}</button>
              <button className="start-power-btn" title="Restart">\u{1F504}</button>
              <button className="start-power-btn shutdown" title="Shut Down" onClick={() => { setLocked(true); setStartOpen(false); setLockPassword(''); }}>\u23FB</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== CONTEXT MENU ===== */}
      {contextMenu && (
        <div className="context-menu" style={{ left: contextMenu.x, top: contextMenu.y }} onClick={() => setContextMenu(null)}>
          <div className="context-item" onClick={() => openApp('filemanager')}><span className="context-item-icon">\u{1F4C1}</span> New Folder</div>
          <div className="context-item"><span className="context-item-icon">\u{1F4C4}</span> New File</div>
          <div className="context-divider" />
          <div className="context-item" onClick={() => openApp('terminal')}><span className="context-item-icon">\u{1F5A5}</span> Terminal Here</div>
          <div className="context-divider" />
          <div className="context-item"><span className="context-item-icon">\u{1F504}</span> Refresh</div>
          <div className="context-item" onClick={() => openApp('settings')}><span className="context-item-icon">\u2699\uFE0F</span> Display Settings</div>
          <div className="context-divider" />
          <div className="context-item"><span className="context-item-icon">\u{1F4CB}</span> Paste</div>
          <div className="context-item"><span className="context-item-icon">\u2139\uFE0F</span> Properties</div>
        </div>
      )}

      {/* ===== NOTIFICATION CENTER ===== */}
      {notifOpen && (
        <div className="notification-panel" onClick={e => e.stopPropagation()}>
          <div className="notification-header">
            <h3>Notifications</h3>
            <button className="notification-clear" onClick={() => setNotifications([])}>Clear all</button>
          </div>
          <div className="notification-list">
            {notifications.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>\u{1F514}</div>
                No notifications
              </div>
            )}
            {notifications.map(n => (
              <div key={n.id} className={`notification-card ${n.type}`}>
                <div className="notification-card-title">{n.title}</div>
                <div className="notification-card-body">{n.body}</div>
                <div className="notification-card-time">{n.time}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== WORKSPACE SWITCHER ===== */}
      {showWorkspaceSwitcher && (
        <div className="workspace-switcher">
          {Array.from({ length: workspaceCount }, (_, i) => (
            <div key={i} className={`workspace-dot ${i === currentWorkspace ? 'active' : ''}`} onClick={() => switchWorkspace(i)} />
          ))}
        </div>
      )}
    </div>
  );
}
