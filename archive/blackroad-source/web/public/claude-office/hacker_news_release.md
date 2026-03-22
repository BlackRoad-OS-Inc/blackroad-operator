# Hacker News Release

## Title (80 char limit: 74/80)
Show HN: Claude Office – Real-time pixel art visualization of Claude Code ops

## URL
https://github.com/paulrobello/claude-office

## Demo URL (optional, can be included in text)
https://youtu.be/AM2UjKYB8Ew

## Text (2000 char limit: ~1850/2000)

Hey HN! I built Claude Office Visualizer, a real-time pixel art office simulation that visualizes Claude Code operations as they happen.

**What it does:**

• Transforms Claude Code CLI activity into an animated office scene

• Main Claude agent appears as "the boss" who delegates work

• Subagents spawn as "employees" who walk to desks and work

• Visual state indicators show working, delegating, waiting states

• Thought/speech bubbles display agent activities and tool usage

**Key features:**

• Multi-mode whiteboard: 10 display modes including todo list, tool usage pie chart, org chart, timeline, news ticker, and heat map

• Context window tracking: Animated trashcan fills with paper as context increases

• Compaction animation: Boss stomps on trashcan when context compacts

• Day/night cycle: City skyline window reflects your local time

• Git status panel: Real-time repository status display

• Printer station: Animates when Claude produces reports/documents

**Technical highlights:**

Built with Next.js + PixiJS for the frontend, FastAPI + WebSocket for the backend. Uses Claude Code hooks to capture events in real-time. XState v5 manages agent lifecycle state machines. Zustand handles global state.

The hook system intercepts Claude Code events (tool use, subagent spawn/stop, context compaction) and sends them via HTTP to the backend, which broadcasts state updates over WebSocket to all connected frontends.

**Installation:**

```bash
git clone https://github.com/paulrobello/claude-office.git
cd claude-office
make install-all
make dev-tmux
```

Then open localhost:3000 and run any Claude Code command.

Works on macOS, Linux, and Windows. Docker deployment also available.

The project is MIT licensed. Demo video in my profile.

Happy to answer questions about the architecture, Claude Code hooks, or PixiJS rendering!
