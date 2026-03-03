'use client'

import { useState, useRef, useCallback } from 'react'
import './projects.css'

/* ────────────────────────────── TYPES ────────────────────────────── */

interface Task {
  id: string
  title: string
  desc: string
  status: 'Backlog' | 'To Do' | 'In Progress' | 'In Review' | 'Done'
  priority: 'HIGH' | 'MED' | 'LOW'
  tags: string[]
  due: string
  overdue?: boolean
  complete?: boolean
  assignees: string[]
  subtasks?: { text: string; done: boolean }[]
  progress?: number
  comments?: number
  branches?: number
  accentColor: string
}

interface ActivityItem {
  avatar: string
  avatarBg: string
  name: string
  action: string
  time: string
}

/* ────────────────────────────── DATA ────────────────────────────── */

const INITIAL_TASKS: Task[] = [
  // Backlog
  {
    id: 'BLK-041', title: 'RoadCoin wallet integration',
    desc: 'Connect RoadCoin economic layer to user accounts with deposit, withdraw, and balance display.',
    status: 'Backlog', priority: 'MED', tags: ['feature', 'roadcoin'],
    due: 'Apr 20', assignees: ['CE'],
    subtasks: [{ text: 'Wallet schema', done: false }, { text: 'Deposit flow', done: false }, { text: 'Withdraw flow', done: false }, { text: 'Balance UI', done: false }],
    accentColor: 'var(--purple)', comments: 0,
  },
  {
    id: 'BLK-040', title: 'Agent log viewer UI',
    desc: 'Build UI for browsing Cece ledger events with filters for actor, action, and resource.',
    status: 'Backlog', priority: 'LOW', tags: ['ui', 'cece'],
    due: 'Apr 28', assignees: ['AT'],
    subtasks: [{ text: 'Event list component', done: false }, { text: 'Filter sidebar', done: false }, { text: 'Detail panel', done: false }],
    accentColor: 'var(--blue)',
  },
  // To Do
  {
    id: 'BLK-038', title: 'Multi-region DNS setup',
    desc: 'Configure na1, eu1, ap1 subdomains on Cloudflare and wire to Railway regions.',
    status: 'To Do', priority: 'HIGH', tags: ['infra', 'dns'],
    due: 'Mar 28', overdue: true, assignees: ['AT', 'CE'],
    subtasks: [{ text: 'Create Cloudflare zones', done: true }, { text: 'Configure na1 routing', done: false }, { text: 'Configure eu1 routing', done: false }],
    progress: 33, accentColor: 'var(--orange)', comments: 2,
  },
  {
    id: 'BLK-037', title: 'PitStop K-12 content schema',
    desc: 'Define data models for subjects, lessons, difficulty levels, and student progress.',
    status: 'To Do', priority: 'HIGH', tags: ['pitstop', 'schema'],
    due: 'Apr 2', assignees: ['OL'],
    subtasks: [{ text: 'Subject model', done: false }, { text: 'Lesson model', done: false }, { text: 'Difficulty enum', done: false }, { text: 'Progress tracker', done: false }, { text: 'Curriculum map', done: false }, { text: 'Assessment schema', done: false }],
    accentColor: 'var(--pink)', comments: 1,
  },
  {
    id: 'BLK-036', title: 'Voice command parser',
    desc: 'Build NLP pipeline to parse RoadWork voice commands into structured agent intents.',
    status: 'To Do', priority: 'MED', tags: ['roadwork', 'nlp'],
    due: 'Apr 5', assignees: ['CE'],
    subtasks: [{ text: 'Tokenizer', done: false }, { text: 'Intent classifier', done: false }, { text: 'Entity extractor', done: false }, { text: 'Slot filler', done: false }, { text: 'Confidence scorer', done: false }, { text: 'Agent router', done: false }, { text: 'Fallback handler', done: false }, { text: 'Tests', done: false }],
    accentColor: 'var(--blue)',
  },
  // In Progress
  {
    id: 'BLK-034', title: 'User auth & session management',
    desc: 'Implement JWT-based auth with magic link + password options, session persistence, and refresh flow. Includes role-based gating for teacher, student, creator, and admin roles.',
    status: 'In Progress', priority: 'HIGH', tags: ['auth', 'core', 'sprint-08'],
    due: 'Apr 4', assignees: ['CE', 'EV'],
    subtasks: [{ text: 'Magic link email flow', done: true }, { text: 'JWT token issuance', done: true }, { text: 'Session refresh logic', done: false }, { text: 'Role-based gating', done: false }],
    progress: 50, accentColor: 'var(--orange)', comments: 5, branches: 3,
  },
  {
    id: 'BLK-033', title: 'Cece policy evaluate endpoint',
    desc: 'Build /policy/evaluate REST endpoint with subject/action/resource schema and allow/deny response.',
    status: 'In Progress', priority: 'HIGH', tags: ['governance', 'api'],
    due: 'Apr 3', assignees: ['CE'],
    subtasks: [{ text: 'Request/response schema', done: true }, { text: 'Basic allow/deny logic', done: true }, { text: 'Policy store DB layer', done: false }],
    progress: 67, accentColor: 'var(--purple)', comments: 3,
  },
  {
    id: 'BLK-031', title: 'Vault password storage layer',
    desc: 'AES-256 encrypted credential store with zero-knowledge architecture and master password derivation.',
    status: 'In Progress', priority: 'HIGH', tags: ['vault', 'security'],
    due: 'Apr 6', assignees: ['EV'],
    subtasks: [{ text: 'Key derivation (PBKDF2)', done: true }, { text: 'AES-256 encrypt/decrypt', done: false }, { text: 'Vault file format', done: false }, { text: 'Master password flow', done: false }, { text: 'CLI integration', done: false }],
    progress: 20, accentColor: 'var(--pink)',
  },
  // In Review
  {
    id: 'BLK-029', title: 'DB schema migrations v2',
    desc: 'Add ledger_events, policies, and assignments tables with proper indices and FK constraints.',
    status: 'In Review', priority: 'HIGH', tags: ['db', 'migrations'],
    due: 'Apr 1', assignees: ['AT'],
    subtasks: [{ text: 'ledger_events table', done: true }, { text: 'policies table', done: true }, { text: 'assignments table', done: true }, { text: 'Index optimization', done: true }],
    progress: 100, accentColor: 'var(--blue)', comments: 2,
  },
  {
    id: 'BLK-028', title: 'Responsive nav scaffold',
    desc: 'Global nav, breadcrumb, and mobile-responsive layout for all blackroad.io subdomains.',
    status: 'In Review', priority: 'MED', tags: ['ui', 'responsive'],
    due: 'Mar 31', assignees: ['CE'],
    subtasks: [{ text: 'Desktop nav', done: true }, { text: 'Mobile hamburger', done: true }, { text: 'Breadcrumb component', done: true }],
    progress: 100, accentColor: 'var(--orange)',
  },
  // Done
  {
    id: 'BLK-025', title: 'Railway service provisioning',
    desc: 'Create Railway projects for blackroad-os-web, api-gateway, and governance API.',
    status: 'Done', priority: 'MED', tags: ['infra'],
    due: 'Mar 26', complete: true, assignees: ['AT'],
    subtasks: [{ text: 'Web project', done: true }, { text: 'API gateway', done: true }, { text: 'Governance API', done: true }],
    progress: 100, accentColor: 'rgba(74,222,128,0.6)',
  },
  {
    id: 'BLK-022', title: 'Next.js app shell',
    desc: 'Scaffold blackroad-os-web with route structure, layout components, and Tailwind config.',
    status: 'Done', priority: 'HIGH', tags: ['core', 'frontend'],
    due: 'Mar 24', complete: true, assignees: ['CE'],
    subtasks: [{ text: 'Route structure', done: true }, { text: 'Layout system', done: true }, { text: 'Tailwind setup', done: true }, { text: 'Theme provider', done: true }, { text: 'Error boundaries', done: true }, { text: 'Loading states', done: true }],
    progress: 100, accentColor: 'rgba(74,222,128,0.6)', comments: 4,
  },
  {
    id: 'BLK-018', title: 'Cloudflare DNS baseline',
    desc: 'Add CNAME/A records for app., api., docs., status., and console. subdomains.',
    status: 'Done', priority: 'HIGH', tags: ['infra', 'dns'],
    due: 'Mar 20', complete: true, assignees: ['AT'],
    subtasks: [{ text: 'app CNAME', done: true }, { text: 'api CNAME', done: true }, { text: 'docs CNAME', done: true }, { text: 'status CNAME', done: true }, { text: 'console CNAME', done: true }, { text: 'SSL certs', done: true }, { text: 'WAF rules', done: true }, { text: 'Page rules', done: true }],
    progress: 100, accentColor: 'rgba(74,222,128,0.6)',
  },
]

const ACTIVITY: ActivityItem[] = [
  { avatar: 'CE', avatarBg: 'rgba(255,132,0,0.3)', name: 'Cecilia', action: 'completed subtask "JWT token issuance"', time: '2h ago' },
  { avatar: 'EV', avatarBg: 'rgba(255,0,102,0.3)', name: 'Eve', action: 'ran security audit on auth flow — 0 issues found', time: '4h ago' },
  { avatar: 'CE', avatarBg: 'rgba(255,132,0,0.3)', name: 'Cecilia', action: 'moved task from To Do → In Progress', time: 'Yesterday' },
  { avatar: 'AL', avatarBg: '#111', name: 'Alexa', action: 'created task and assigned to Cecilia + Eve', time: 'Mar 28' },
]

const STATUSES = ['Backlog', 'To Do', 'In Progress', 'In Review', 'Done'] as const
const STATUS_COLORS: Record<string, string> = {
  'Backlog': 'rgba(255,255,255,0.25)',
  'To Do': 'rgba(255,255,255,0.5)',
  'In Progress': 'var(--orange)',
  'In Review': 'var(--blue)',
  'Done': 'rgba(74,222,128,0.7)',
}

/* ────────────────────────────── COMPONENTS ────────────────────────────── */

function SubtaskRow({ subtask, onToggle }: { subtask: { text: string; done: boolean }; onToggle: () => void }) {
  return (
    <div className="tc-sub-row">
      <div
        className={`tc-sub-check${subtask.done ? ' done' : ''}`}
        onClick={(e) => { e.stopPropagation(); onToggle() }}
      >
        {subtask.done ? '✓' : ''}
      </div>
      <span className={`tc-sub-text${subtask.done ? ' done' : ''}`}>{subtask.text}</span>
    </div>
  )
}

function TaskCard({ task, selected, onSelect, onToggleSubtask }: {
  task: Task
  selected: boolean
  onSelect: () => void
  onToggleSubtask: (idx: number) => void
}) {
  const isDone = task.status === 'Done'
  const doneCount = task.subtasks?.filter(s => s.done).length ?? 0
  const totalCount = task.subtasks?.length ?? 0

  return (
    <div
      className={`task-card${selected ? ' selected' : ''}`}
      style={isDone ? { opacity: 0.55 } : undefined}
      onClick={onSelect}
    >
      <div className="task-card-accent" style={{ background: task.accentColor }} />
      <div className="tc-tags">
        {task.tags.map(t => <span key={t} className="tc-tag">{t}</span>)}
      </div>
      <div className="tc-title">{task.title}</div>

      {task.subtasks && task.subtasks.length > 0 && !isDone && (
        <div className="tc-subtasks">
          {task.subtasks.map((st, i) => (
            <SubtaskRow key={i} subtask={st} onToggle={() => onToggleSubtask(i)} />
          ))}
        </div>
      )}

      {task.progress !== undefined && !isDone && (
        <div className="tc-progress-bar">
          <div className="tc-progress-fill" style={{ width: `${task.progress}%`, background: task.accentColor }} />
        </div>
      )}

      <div className="tc-meta">
        <span className={`tc-priority pri-${task.priority.toLowerCase()}`}>{task.priority}</span>
        <span className={`tc-due${task.overdue ? ' overdue' : ''}${task.complete ? ' complete' : ''}`}>
          {task.complete ? `✓ ${task.due}` : task.overdue ? `${task.due} !` : task.due}
        </span>
      </div>

      <div className="tc-footer">
        {task.assignees.map(a => <div key={a} className="tc-assignee">{a}</div>)}
        <div className="tc-stats">
          <span className="tc-stat">◻ {doneCount}/{totalCount}</span>
          {task.comments !== undefined && task.comments > 0 && <span className="tc-stat">◎ {task.comments}</span>}
          {task.branches !== undefined && task.branches > 0 && <span className="tc-stat">↳ {task.branches}</span>}
        </div>
      </div>
    </div>
  )
}

/* ────────────────────────────── MAIN PAGE ────────────────────────────── */

export default function ProjectsPage() {
  const [view, setView] = useState<'kanban' | 'list' | 'timeline'>('kanban')
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS)
  const [selectedTaskId, setSelectedTaskId] = useState<string>('BLK-034')
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(['Priority']))
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(['In Progress', 'To Do']))
  const [activityItems, setActivityItems] = useState<ActivityItem[]>(ACTIVITY)
  const commentRef = useRef<HTMLTextAreaElement>(null)

  const selectedTask = tasks.find(t => t.id === selectedTaskId) ?? tasks[0]

  const toggleSubtask = useCallback((taskId: string, subtaskIdx: number) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId || !t.subtasks) return t
      const updated = [...t.subtasks]
      updated[subtaskIdx] = { ...updated[subtaskIdx], done: !updated[subtaskIdx].done }
      const doneCount = updated.filter(s => s.done).length
      const progress = Math.round((doneCount / updated.length) * 100)
      return { ...t, subtasks: updated, progress }
    }))
  }, [])

  const addCard = useCallback((status: Task['status']) => {
    const title = prompt('Task title:')
    if (!title) return
    const newTask: Task = {
      id: `BLK-${String(Date.now()).slice(-3)}`,
      title,
      desc: 'Newly created task.',
      status,
      priority: 'MED',
      tags: ['new'],
      due: 'TBD',
      assignees: ['CE'],
      accentColor: 'var(--orange)',
    }
    setTasks(prev => [...prev, newTask])
  }, [])

  const handleComment = useCallback(() => {
    if (!commentRef.current || !commentRef.current.value.trim()) return
    const text = commentRef.current.value.trim()
    setActivityItems(prev => [...prev, {
      avatar: 'AL', avatarBg: '#111', name: 'You', action: text, time: 'Just now',
    }])
    commentRef.current.value = ''
    commentRef.current.style.height = ''
  }, [])

  const autoResize = useCallback((el: HTMLTextAreaElement) => {
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 80) + 'px'
  }, [])

  const toggleFilter = useCallback((filter: string) => {
    setActiveFilters(prev => {
      const next = new Set(prev)
      if (next.has(filter)) next.delete(filter)
      else next.add(filter)
      return next
    })
  }, [])

  const toggleGroup = useCallback((group: string) => {
    setOpenGroups(prev => {
      const next = new Set(prev)
      if (next.has(group)) next.delete(group)
      else next.add(group)
      return next
    })
  }, [])

  const tasksByStatus = (status: string) => tasks.filter(t => t.status === status)
  const selectedSubtasksDone = selectedTask.subtasks?.filter(s => s.done).length ?? 0
  const selectedSubtasksTotal = selectedTask.subtasks?.length ?? 0

  return (
    <div className="projects-page">
      <div className="shell">
        <div className="grad-rule" />

        {/* ── TOP NAV ── */}
        <nav className="topnav">
          <div className="tn-brand">
            <div className="tn-mark">BR</div>
            <div>
              <span className="tn-name">BlackRoad</span>
              <span className="tn-product">Projects</span>
            </div>
          </div>

          <div className="tn-project">
            <div className="tnp-dot" />
            <span className="tnp-name">blackroad-os</span>
            <span className="tnp-arr">&#9662;</span>
          </div>

          <div className="tn-tabs">
            <button className={`tn-tab${view === 'kanban' ? ' active' : ''}`} onClick={() => setView('kanban')}>
              <span className="tn-tab-icon">&#8862;</span> Board
            </button>
            <button className={`tn-tab${view === 'list' ? ' active' : ''}`} onClick={() => setView('list')}>
              <span className="tn-tab-icon">&#9776;</span> List
            </button>
            <button className={`tn-tab${view === 'timeline' ? ' active' : ''}`} onClick={() => setView('timeline')}>
              <span className="tn-tab-icon">&#9473;</span> Timeline
            </button>
          </div>

          <div className="tn-right">
            <div className="tn-search">
              <span className="tn-search-icon">&#9678;</span>
              <input type="text" placeholder="Search tasks…" />
            </div>
            <button className="tn-btn primary" onClick={() => addCard('To Do')}>+ Task</button>
            <div className="tn-avatar">AL</div>
          </div>
        </nav>

        <div className="body-row">

          {/* ── SIDEBAR ── */}
          <aside className="sidebar">
            <div className="sb-section">
              <div className="sb-head">Projects</div>
              <div className="sb-item active">
                <div className="sbi-dot" style={{ background: 'var(--orange)' }} />
                <span className="sbi-label">blackroad-os</span>
                <span className="sbi-count">42</span>
              </div>
              <div className="sb-item">
                <div className="sbi-dot" style={{ background: 'var(--purple)' }} />
                <span className="sbi-label">lucidia</span>
                <span className="sbi-count">28</span>
              </div>
              <div className="sb-item">
                <div className="sbi-dot" style={{ background: 'var(--blue)' }} />
                <span className="sbi-label">roadwork</span>
                <span className="sbi-count">15</span>
              </div>
              <div className="sb-item">
                <div className="sbi-dot" style={{ background: 'var(--pink)' }} />
                <span className="sbi-label">pitstop</span>
                <span className="sbi-count">31</span>
              </div>
              <div className="sb-item" style={{ opacity: 0.4 }}>
                <div className="sbi-dot" style={{ background: 'rgba(255,255,255,0.2)' }} />
                <span className="sbi-label">+ New project</span>
              </div>
            </div>

            <div className="sprint-block">
              <div className="sb-sprint-label">Current Sprint</div>
              <div className="sb-sprint-name">Sprint 08 — Core Auth</div>
              <div className="sprint-progress-track">
                <div className="sprint-progress-fill" style={{ width: '64%' }} />
              </div>
              <div className="sprint-stats">
                <span>16/25 tasks</span>
                <span>6d left</span>
              </div>
            </div>

            <div className="sb-section">
              <div className="sb-head">My Tasks</div>
              <div className="sb-item">
                <span className="sbi-label">Assigned to me</span>
                <span className="sbi-count">8</span>
              </div>
              <div className="sb-item">
                <span className="sbi-label">Due this week</span>
                <span className="sbi-count" style={{ color: 'var(--pink)', opacity: 1 }}>3</span>
              </div>
              <div className="sb-item">
                <span className="sbi-label">Overdue</span>
                <span className="sbi-count" style={{ color: 'var(--pink)', opacity: 1 }}>1</span>
              </div>
            </div>

            <div className="sb-section">
              <div className="sb-head">Agents</div>
              <div style={{ padding: '6px 14px' }}>
                <div className="agent-stack">
                  <div className="agent-pip" title="Cecilia">CE</div>
                  <div className="agent-pip" title="Atlas">AT</div>
                  <div className="agent-pip" title="Olympia">OL</div>
                  <div className="agent-pip" title="Eve">EV</div>
                  <div className="agent-pip agent-more" title="+3 more">+3</div>
                </div>
                <div style={{ fontSize: '0.42rem', opacity: 0.25, paddingTop: 6 }}>4 agents active on this project</div>
              </div>
            </div>
          </aside>

          {/* ── MAIN ── */}
          <div className="main">

            {/* STAT BAR */}
            <div className="stat-bar">
              <div className="stat-cell">
                <div className="stat-val">42</div>
                <div className="stat-lbl">Total Tasks</div>
                <div className="stat-delta delta-up">&#9650; 6 this sprint</div>
              </div>
              <div className="stat-cell">
                <div className="stat-val">16</div>
                <div className="stat-lbl">In Progress</div>
                <div className="stat-delta" style={{ opacity: 0.3 }}>64% sprint done</div>
              </div>
              <div className="stat-cell">
                <div className="stat-val">3</div>
                <div className="stat-lbl">Due Soon</div>
                <div className="stat-delta delta-dn">1 overdue</div>
              </div>
              <div className="stat-cell">
                <div className="stat-val">78%</div>
                <div className="stat-lbl">Velocity</div>
                <div className="stat-delta delta-up">&#9650; vs last sprint</div>
              </div>
              <div className="stat-cell">
                <div className="stat-val">7</div>
                <div className="stat-lbl">Active Agents</div>
                <div className="stat-delta" style={{ opacity: 0.3 }}>Cecilia, Atlas +5</div>
              </div>
            </div>

            {/* SUBHEADER */}
            <div className="subheader">
              <span className="sh-title">blackroad-os</span>
              <span className="sh-badge">SPRINT 08</span>
              <div className="sh-divider" />
              {['Priority', 'Assignee', 'Label', 'Due date'].map(f => (
                <button
                  key={f}
                  className={`sh-filter${activeFilters.has(f) ? ' on' : ''}`}
                  onClick={() => toggleFilter(f)}
                >
                  &#9679; {f}
                </button>
              ))}
              <div className="sh-right">
                <button className="sh-group-btn">Group: Status &#9662;</button>
              </div>
            </div>

            {/* ══════════ KANBAN VIEW ══════════ */}
            {view === 'kanban' && (
              <div className="kanban-scroll">
                <div className="kanban-board">
                  {STATUSES.map(status => {
                    const colTasks = tasksByStatus(status)
                    return (
                      <div key={status} className="kanban-col">
                        <div className="kc-header">
                          <div className="kc-dot" style={{ background: STATUS_COLORS[status] }} />
                          <span className="kc-name">{status}</span>
                          <span className="kc-count">{colTasks.length}</span>
                          <button className="kc-add" onClick={() => addCard(status)}>+</button>
                        </div>
                        <div className="kc-cards">
                          {colTasks.map(task => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              selected={selectedTaskId === task.id}
                              onSelect={() => setSelectedTaskId(task.id)}
                              onToggleSubtask={(idx) => toggleSubtask(task.id, idx)}
                            />
                          ))}
                          <button className="drop-zone" onClick={() => addCard(status)}>+ Add task</button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ══════════ LIST VIEW ══════════ */}
            {view === 'list' && (
              <div className="list-view visible">
                {['In Progress', 'To Do', 'Backlog', 'In Review', 'Done'].map(status => {
                  const rows = tasksByStatus(status)
                  if (rows.length === 0) return null
                  const isOpen = openGroups.has(status)
                  return (
                    <div key={status} className="lv-section">
                      <div className="lv-group-header" onClick={() => toggleGroup(status)}>
                        <div className="lv-group-dot" style={{ background: STATUS_COLORS[status] }} />
                        <span className="lv-group-name">{status}</span>
                        <span className="lv-group-count">{rows.length}</span>
                        <span className={`lv-group-toggle${isOpen ? ' open' : ''}`}>&#9654;</span>
                      </div>
                      {isOpen && (
                        <>
                          <div className="lv-header">
                            <div className="lv-hcell">Task</div>
                            <div className="lv-hcell">Assignee</div>
                            <div className="lv-hcell">Priority</div>
                            <div className="lv-hcell">Status</div>
                            <div className="lv-hcell">Due</div>
                            <div className="lv-hcell">Progress</div>
                          </div>
                          {rows.map(task => (
                            <div
                              key={task.id}
                              className={`lv-row${selectedTaskId === task.id ? ' selected' : ''}`}
                              onClick={() => setSelectedTaskId(task.id)}
                            >
                              <div className="lv-name-cell">
                                <div className="lv-marker" style={{ background: task.accentColor }} />
                                <div>
                                  <div className="lv-title">{task.title}</div>
                                  <div className="lv-sub">{task.id} · {task.tags.join(' · ')}</div>
                                </div>
                              </div>
                              <div className="lv-assignees">
                                {task.assignees.map(a => <div key={a} className="lv-av">{a}</div>)}
                              </div>
                              <div className="lv-priority-cell">
                                <span className={`tc-priority pri-${task.priority.toLowerCase()}`}>{task.priority}</span>
                              </div>
                              <div className="lv-status-cell">
                                <div className="lv-status-dot" style={{ background: STATUS_COLORS[task.status] }} />
                                <span className="lv-status-text">{task.status === 'In Progress' ? 'Active' : task.status === 'To Do' ? 'Queued' : task.status}</span>
                              </div>
                              <div className={`lv-date${task.overdue ? ' overdue' : ''}`}>
                                {task.overdue ? `${task.due} !` : task.due}
                              </div>
                              <div className="lv-prog">
                                <div className="lv-prog-track">
                                  <div className="lv-prog-fill" style={{ width: `${task.progress ?? 0}%`, background: task.accentColor }} />
                                </div>
                                <span className="lv-prog-pct">{task.progress ?? 0}%</span>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* ══════════ TIMELINE VIEW ══════════ */}
            {view === 'timeline' && (
              <div className="timeline-view visible">
                <div className="tl-wrap">
                  <div className="tl-header">
                    <div className="tl-label-col" />
                    <div className="tl-months">
                      <div className="tl-month">MAR 2026</div>
                      <div className="tl-month current">APR 2026</div>
                      <div className="tl-month">MAY 2026</div>
                      <div className="tl-month">JUN 2026</div>
                    </div>
                  </div>

                  {[
                    { name: 'Auth & Session', sub: 'BLK-034 · CE, EV', left: '18%', width: '22%', bg: 'var(--orange)', color: '#000', label: 'Auth & Session', showToday: true },
                    { name: 'Cece Policy API', sub: 'BLK-033 · CE', left: '14%', width: '18%', bg: 'var(--purple)', color: '#fff', label: 'Policy Eval' },
                    { name: 'Vault Storage', sub: 'BLK-031 · EV', left: '22%', width: '24%', bg: 'var(--pink)', color: '#fff', label: 'Vault Layer' },
                    { name: 'Multi-region DNS', sub: 'BLK-038 · AT, CE', left: '4%', width: '14%', bg: 'rgba(255,132,0,0.5)', color: '#fff', label: 'DNS' },
                    { name: 'PitStop Schema', sub: 'BLK-037 · OL', left: '26%', width: '20%', bg: 'rgba(255,0,102,0.5)', color: '#fff', label: 'K-12 Schema' },
                    { name: 'Voice Parser', sub: 'BLK-036 · CE', left: '30%', width: '26%', bg: 'rgba(0,102,255,0.5)', color: '#fff', label: 'NLP Pipeline' },
                    { name: 'RoadCoin Integration', sub: 'BLK-041 · CE', left: '44%', width: '22%', bg: 'rgba(136,0,255,0.5)', color: '#fff', label: 'Wallet' },
                  ].map((row, i) => (
                    <div key={i} className="tl-row">
                      <div className="tl-row-label">
                        <div className="tl-row-label-name">{row.name}</div>
                        <div className="tl-row-label-sub">{row.sub}</div>
                      </div>
                      <div className="tl-row-track">
                        {row.showToday && <div className="tl-today" style={{ left: '28%' }} />}
                        <div className="tl-bar" style={{ left: row.left, width: row.width, background: row.bg, color: row.color }}>{row.label}</div>
                      </div>
                    </div>
                  ))}

                  {/* Milestone */}
                  <div className="tl-row">
                    <div className="tl-row-label">
                      <div className="tl-row-label-name" style={{ color: 'var(--orange)', fontWeight: 700 }}>&#9670; Sprint 08 Ship</div>
                      <div className="tl-row-label-sub">Milestone</div>
                    </div>
                    <div className="tl-row-track">
                      <div className="tl-milestone" style={{ left: '36%', background: 'var(--orange)' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>{/* main */}

          {/* ── DETAIL PANEL ── */}
          <aside className="detail-panel">
            <div className="dp-top">
              <div className="dp-top-row">
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.42rem', opacity: 0.3 }}>{selectedTask.id}</span>
                <select className="dp-status-select" value={selectedTask.status} onChange={(e) => {
                  const newStatus = e.target.value as Task['status']
                  setTasks(prev => prev.map(t => t.id === selectedTask.id ? { ...t, status: newStatus } : t))
                }}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="dp-title">{selectedTask.title}</div>
              <div className="dp-desc">{selectedTask.desc}</div>
            </div>

            <div className="dp-section">
              <div className="dp-sec-label">Details</div>
              <div className="dp-field">
                <span className="dp-field-label">Priority</span>
                <span className={`tc-priority pri-${selectedTask.priority.toLowerCase()}`}>{selectedTask.priority}</span>
              </div>
              <div className="dp-field">
                <span className="dp-field-label">Due</span>
                <span className="dp-field-mono">{selectedTask.due}, 2026</span>
              </div>
              <div className="dp-field">
                <span className="dp-field-label">Sprint</span>
                <span className="dp-field-mono">Sprint 08</span>
              </div>
              <div className="dp-field">
                <span className="dp-field-label">Project</span>
                <span className="dp-field-val">blackroad-os</span>
              </div>
              <div className="dp-field">
                <span className="dp-field-label">Labels</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {selectedTask.tags.map(t => <span key={t} className="tc-tag">{t}</span>)}
                </div>
              </div>
            </div>

            <div className="dp-section">
              <div className="dp-sec-label">Assigned Agents</div>
              <div className="dp-assignees">
                {selectedTask.assignees.map(a => {
                  const names: Record<string, string> = { CE: 'Cecilia', AT: 'Atlas', OL: 'Olympia', EV: 'Eve', AL: 'Alexa' }
                  const colors: Record<string, string> = { CE: 'rgba(255,132,0,0.3)', EV: 'rgba(255,0,102,0.3)', AT: 'rgba(0,102,255,0.3)', OL: 'rgba(136,0,255,0.3)' }
                  return (
                    <div key={a} className="dp-assignee">
                      <div className="dp-av" style={{ background: colors[a] ?? '#111' }}>{a}</div>
                      <span className="dp-aname">{names[a] ?? a}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {selectedTask.subtasks && selectedTask.subtasks.length > 0 && (
              <div className="dp-section">
                <div className="dp-sec-label">Progress · {selectedSubtasksDone} of {selectedSubtasksTotal} subtasks</div>
                <div className="tc-progress-bar" style={{ marginBottom: 10 }}>
                  <div className="tc-progress-fill" style={{ width: `${selectedTask.progress ?? 0}%`, background: selectedTask.accentColor }} />
                </div>
                {selectedTask.subtasks.map((st, i) => (
                  <div key={i} className="tc-sub-row" style={{ marginBottom: 5 }}>
                    <div
                      className={`tc-sub-check${st.done ? ' done' : ''}`}
                      style={{ width: 12, height: 12 }}
                      onClick={() => toggleSubtask(selectedTask.id, i)}
                    >
                      {st.done ? '✓' : ''}
                    </div>
                    <span className={`tc-sub-text${st.done ? ' done' : ''}`}>{st.text}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Activity */}
            <div className="dp-activity">
              <div className="dp-sec-label">Activity</div>
              {activityItems.map((item, i) => (
                <div key={i} className="dp-act-item">
                  <div className="dp-act-av" style={{ background: item.avatarBg }}>{item.avatar}</div>
                  <div className="dp-act-body">
                    <div className="dp-act-text"><strong>{item.name}</strong> {item.action}</div>
                    <div className="dp-act-time">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="dp-comment-row">
              <textarea
                ref={commentRef}
                className="dp-comment-input"
                placeholder="Add a comment or @mention an agent…"
                rows={1}
                onInput={(e) => autoResize(e.target as HTMLTextAreaElement)}
              />
              <button className="dp-send" onClick={handleComment}>Send</button>
            </div>
          </aside>

        </div>{/* body-row */}

        <div className="grad-rule" />
      </div>
    </div>
  )
}
