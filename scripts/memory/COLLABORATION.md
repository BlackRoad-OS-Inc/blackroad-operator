# BlackRoad Collaboration Protocol

Every Claude session is part of a team. You are never working alone.

## On Session Start
1. `memory-collaboration.sh inbox` — check for handoffs from previous sessions
2. `memory-collaboration.sh register "<what you're working on>"` — announce yourself
3. Check codex before solving — don't reinvent what's already solved

## During Work
- `memory-collaboration.sh announce "<update>"` — share progress with the team
- `memory-collaboration.sh post "<message>"` — quick Slack message
- `memory-agent-dispatch.sh progress "<update>"` — structured progress update
- `memory-slack.sh ask <agent> "<question>"` — ask an AI agent for help

## When Done
- `memory-collaboration.sh handoff "<what's next>"` — leave context for the next session
- `memory-planner.sh wrap` — auto-generate handoff from session activity
- `memory-collaboration.sh complete` — mark session as done

## Slack Agents
| Agent | Specialty | Use for |
|-------|-----------|---------|
| alice | Network, DNS, security | Infrastructure questions |
| cecilia | AI, models, embedding | ML/AI questions |
| octavia | Architecture, Gitea, Docker | Systems design |
| lucidia | Web apps, GitHub Actions | Frontend, deployment |
| shellfish | Security, vulnerabilities | Security review |
| caddy | CI/CD, builds | Build issues |
| alexa | CEO, strategy | Business decisions |
| road | BlackRoad OS overall | General questions |

## CLI Shortcuts
```bash
br collab status        # Full collaboration dashboard
br collab inbox         # Check messages
br collab announce "x"  # Broadcast update
br collab handoff "x"   # Leave handoff note
br collab ask agent "q" # Ask an AI agent
br collab debate "topic"# Multi-agent debate
br collab standup       # Generate standup
br collab roadmap       # Project roadmap
br collab sprint        # Sprint board
br collab wrap          # End-of-session wrap-up
br slack say "message"  # Quick Slack post
br plan next            # What to work on next
br dispatch queue       # Show all available work
br watchdog heartbeat   # Health check
```

## Key Principle
**Every session leaves the system better than it found it.** Log your work, broadcast your learnings, and leave a clear handoff for the next Claude.
