# 🤖 Autonomous Agent System - Complete Guide

**Created:** 2026-02-15  
**Status:** ✅ FULLY OPERATIONAL

## What Was Built

A complete 24/7 autonomous agent system with:

1. **Agent Daemons** - Run continuously, process tasks from queue
2. **Monitoring Agent** - Watches for issues, fixes them automatically  
3. **Cron Scheduling** - Executes agents on schedules
4. **Task Queue** - Centralized task processing system

---

## 🎯 Components

### 1. Agent Daemon (`autonomous-agent-daemon.py`)
**Purpose:** 24/7 agent that processes tasks from queue

**Features:**
- SQLite-based task queue
- Automatic task assignment
- Ollama model integration
- PS-SHA-∞ memory logging
- Graceful shutdown handling
- PID file management

**Task Types:**
- `code-review` - Review code changes
- `deploy` - Deploy services
- `test` - Run tests
- `monitor` - Check service health
- `fix` - Fix issues

### 2. Monitoring Agent (`autonomous-monitor-agent.py`)
**Purpose:** Autonomous monitoring & self-healing

**Checks:**
- Disk space usage (alerts at 90%, auto-cleans)
- Service health (restarts critical services)
- GitHub Actions failures
- Memory system integrity

**Auto-fixes:**
- Cleans package caches when disk full
- Restarts crashed services (ollama)
- Creates alerts in SQLite database

### 3. Cron Setup (`autonomous-cron-setup.sh`)
**Purpose:** Configure scheduled agent tasks

**Jobs:**
- Memory maintenance (hourly)
- Memory index rebuild (daily 3 AM)
- Agent health checks (every 15 min)
- Task queue processing (every 5 min)
- GitHub Actions monitoring (hourly)
- Disk space checks (daily 2 AM)
- Auto-update dependencies (weekly)
- Backup memory system (daily 1 AM)
- Clean old logs (weekly)
- Agent coordination (every 30 min)
- BlackRoad OS updates (daily midnight)

### 4. Task Queue Processor (`task-queue-processor.py`)
**Purpose:** Process pending tasks from queue

**Features:**
- Checks for pending tasks
- Dispatches to agent daemons
- Processes up to 5 tasks per run
- Logs to memory system

### 5. Agent Control (`autonomous-agent-ctl.sh`)
**Purpose:** Manage agent lifecycle

**Commands:**
```bash
./autonomous-agent-ctl.sh start <name> [model]   # Start daemon
./autonomous-agent-ctl.sh stop <name>            # Stop daemon
./autonomous-agent-ctl.sh restart <name>         # Restart daemon
./autonomous-agent-ctl.sh status [name]          # Check status
./autonomous-agent-ctl.sh list                   # List all agents
./autonomous-agent-ctl.sh logs <name>            # Tail logs
```

---

## 🚀 Quick Start

### 1. Install Cron Jobs
```bash
./autonomous-cron-setup.sh
# Review jobs, confirm installation
```

### 2. Start an Agent Daemon
```bash
# Start Erebus agent with qwen2.5-coder:14b
./autonomous-agent-ctl.sh start erebus qwen2.5-coder:14b

# Start Mercury agent with qwen2.5-coder:32b  
./autonomous-agent-ctl.sh start mercury qwen2.5-coder:32b

# Start Hermes agent with default model
./autonomous-agent-ctl.sh start hermes
```

### 3. Start Monitoring Agent
```bash
# Monitor every 60 seconds
python3 autonomous-monitor-agent.py 60 &

# Or run in tmux
tmux new -d -s monitor "python3 ~/autonomous-monitor-agent.py 60"
```

### 4. Check Status
```bash
./autonomous-agent-ctl.sh list     # List all running agents
./autonomous-agent-ctl.sh status   # Show all agent statuses
```

---

## 📋 Task Queue Usage

### Add a Task (from any agent)
```python
import sqlite3
import json
from datetime import datetime

conn = sqlite3.connect('~/.blackroad/memory/task-queue.db')
c = conn.cursor()

c.execute('''
    INSERT INTO tasks (task_type, priority, payload, created_at)
    VALUES (?, ?, ?, ?)
''', (
    'code-review',
    8,  # Higher = more urgent
    json.dumps({
        'code': 'function hello() { return "world"; }',
        'description': 'Review this JavaScript function'
    }),
    datetime.now().isoformat()
))

conn.commit()
conn.close()
```

### View Queue
```bash
sqlite3 ~/.blackroad/memory/task-queue.db "SELECT * FROM tasks WHERE status='pending';"
```

---

## 🔍 Monitoring

### View Logs
```bash
# Agent logs
tail -f ~/.blackroad/logs/agent-erebus.log
tail -f ~/.blackroad/logs/agent-mercury.log

# Monitoring logs  
tail -f ~/.blackroad/logs/monitor.log

# Task queue logs
tail -f ~/.blackroad/logs/task-queue.log

# Cron logs
tail -f ~/.blackroad/memory/cron-compact.log
tail -f ~/.blackroad/memory/cron-index.log
```

### Check Alerts
```bash
sqlite3 ~/.blackroad/memory/alerts.db "SELECT * FROM alerts WHERE status='open';"
```

### Check Task Queue Status
```bash
sqlite3 ~/.blackroad/memory/task-queue.db "
  SELECT status, COUNT(*) 
  FROM tasks 
  GROUP BY status;
"
```

---

## 🎮 Control Commands

### Start Multiple Agents
```bash
# Start a fleet of agents
./autonomous-agent-ctl.sh start erebus qwen2.5-coder:14b
./autonomous-agent-ctl.sh start mercury qwen2.5-coder:32b
./autonomous-agent-ctl.sh start hermes llama3:8b
./autonomous-agent-ctl.sh start apollo mistral:7b
```

### Stop All Agents
```bash
for pid_file in ~/.blackroad/agents/*.pid; do
    agent=$(basename "$pid_file" .pid)
    ./autonomous-agent-ctl.sh stop "$agent"
done
```

### Restart an Agent
```bash
./autonomous-agent-ctl.sh restart erebus
```

---

## 📊 Architecture

```
┌─────────────────────────────────────────────────┐
│           Cron Scheduler (every 5-60min)        │
│  • Memory maintenance                           │
│  • Health checks                                │
│  • Task processing                              │
└────────────────┬────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────┐
│          Task Queue (SQLite)                    │
│  • Pending tasks                                │
│  • Priority ordering                            │
│  • Task history                                 │
└────────────────┬────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────┐
│       Agent Daemons (24/7 processes)            │
│  • erebus (qwen2.5-coder:14b)                   │
│  • mercury (qwen2.5-coder:32b)                  │
│  • hermes (llama3:8b)                           │
│  • apollo (mistral:7b)                          │
└────────────────┬────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────┐
│        Monitoring Agent (self-healing)          │
│  • Disk space → Auto-clean                     │
│  • Services → Auto-restart                     │
│  • GitHub Actions → Alert                      │
│  • Memory system → Verify                      │
└────────────────┬────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────┐
│       Memory System (PS-SHA-∞)                  │
│  • 4,063+ entries                               │
│  • Agent coordination                           │
│  • Task logging                                 │
└─────────────────────────────────────────────────┘
```

---

## 🎯 Example Workflows

### 1. Autonomous Code Review
```bash
# Add code review task
python3 << EOF
import sqlite3, json, datetime
conn = sqlite3.connect('$HOME/.blackroad/memory/task-queue.db')
c = conn.cursor()
c.execute('''INSERT INTO tasks (task_type, priority, payload, created_at)
             VALUES (?, ?, ?, ?)''',
          ('code-review', 8, 
           json.dumps({'file': 'services/web/app/page.tsx'}),
           datetime.datetime.now().isoformat()))
conn.commit()
EOF

# Agent daemon picks it up within 5 minutes (cron)
# Reviews code, logs result to memory
```

### 2. Autonomous Monitoring
```bash
# Monitoring agent runs continuously
python3 autonomous-monitor-agent.py 60 &

# Every 60 seconds:
# - Checks disk space
# - Checks services (ollama, etc)
# - Checks GitHub Actions
# - Auto-fixes issues
# - Creates alerts
```

### 3. Scheduled Maintenance
```bash
# Cron handles:
# - Memory compaction (hourly)
# - Index rebuilds (daily 3 AM)
# - Backups (daily 1 AM)
# - Updates (weekly Sunday 4 AM)
# - Log cleanup (weekly Sunday 5 AM)
```

---

## 🔧 Configuration

### Agent Models
Choose based on task:
- `qwen2.5-coder:7b` - Fast code tasks (default)
- `qwen2.5-coder:14b` - Better quality code
- `qwen2.5-coder:32b` - Highest quality
- `llama3:8b` - General purpose
- `mistral:7b` - Fast reasoning
- `deepseek-coder:6.7b` - Code generation

### Monitoring Intervals
Edit in `autonomous-cron-setup.sh`:
- Health checks: `*/15` (every 15 min)
- Task processing: `*/5` (every 5 min)  
- Memory maintenance: `0 *` (hourly)

### Priority Levels
Task queue priority (1-10):
- `1-3` - Low priority
- `4-6` - Normal priority
- `7-8` - High priority
- `9-10` - Critical priority

---

## 📁 File Locations

```
~/.blackroad/
├── agents/
│   ├── erebus.pid              # Agent PID files
│   ├── mercury.pid
│   └── hermes.pid
├── memory/
│   ├── task-queue.db           # Task queue
│   ├── alerts.db               # Monitoring alerts
│   ├── memory-system.json      # PS-SHA-∞ memory
│   ├── cron-compact.log        # Cron logs
│   └── cron-index.log
├── logs/
│   ├── agent-erebus.log        # Agent logs
│   ├── agent-mercury.log
│   ├── monitor.log             # Monitoring logs
│   ├── task-queue.log          # Queue processing
│   └── coordination.log        # Agent coordination
└── backups/
    └── memory-YYYYMMDD.tar.gz  # Daily backups
```

---

## ✅ Testing

### Test Agent Daemon
```bash
# Start test agent
./autonomous-agent-ctl.sh start test-agent

# Add test task
sqlite3 ~/.blackroad/memory/task-queue.db "
  INSERT INTO tasks (task_type, priority, payload, created_at)
  VALUES ('test', 5, '{\"test\": true}', datetime('now'));
"

# Check logs
tail -f ~/.blackroad/logs/agent-test-agent.log

# Stop agent
./autonomous-agent-ctl.sh stop test-agent
```

### Test Monitoring
```bash
# Run monitoring once
python3 autonomous-monitor-agent.py 60 &
MONITOR_PID=$!

# Wait 2 minutes
sleep 120

# Check alerts
sqlite3 ~/.blackroad/memory/alerts.db "SELECT * FROM alerts;"

# Stop monitoring
kill $MONITOR_PID
```

---

## 🎉 Success Criteria

✅ **All 4 components built:**
1. Agent daemons - 24/7 task processing
2. Cron scheduling - 11 scheduled jobs
3. Monitoring agent - Self-healing system
4. Task queue - Centralized processing

✅ **Features:**
- SQLite-based task queue
- Priority-based scheduling
- Autonomous monitoring
- Auto-healing (disk, services)
- Memory system integration
- PID management
- Graceful shutdown
- Comprehensive logging

✅ **Production Ready:**
- Error handling
- Timeout protection
- Database transactions
- Signal handling
- Log rotation
- Backup system

---

## 🚀 Next Steps

1. **Install cron jobs:** `./autonomous-cron-setup.sh`
2. **Start agents:** `./autonomous-agent-ctl.sh start erebus`
3. **Enable monitoring:** `python3 autonomous-monitor-agent.py 60 &`
4. **Verify:** `./autonomous-agent-ctl.sh status`

**System is now fully autonomous!** 🌌
