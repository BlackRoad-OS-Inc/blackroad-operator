# lucidia-cli — Agent Training Curriculum

**Type:** cli | **Languages:** python

## Overview

Full terminal operating system — web browser, virtual filesystem, Ollama AI agents, mini apps, process manager, kanban board, notes, and 30+ components. Built on Textual/Rich. A complete TUI experience for interacting with the BlackRoad ecosystem from the terminal.

## Key Files

- `br_splash.py` — Splash screen and entry point
- `agents.py` — Ollama AI agent integration
- `tests/test_apps.py` — App tests
- `tests/test_virtual_fs.py` — Virtual filesystem tests
- `tests/test_tui.py` — TUI component tests
- `setup.sh` — Setup script

## Learning Objectives

1. Understand the purpose and architecture of lucidia-cli
2. Navigate the codebase and identify key components
3. Make modifications following BlackRoad coding standards
4. Deploy changes and verify correctness
5. Document work in codex and broadcast TILs

## Exercises

### Level 1: Observer
- [ ] Run `setup.sh` and launch the TUI
- [ ] List all 30+ components and their purposes
- [ ] Read `agents.py` and understand Ollama integration

### Level 2: Contributor
- [ ] Fix a bug in the virtual filesystem
- [ ] Add a new mini app to the TUI
- [ ] Improve a test case

### Level 3: Builder
- [ ] Build a new TUI component (e.g., fleet monitor widget)
- [ ] Add AI-powered command suggestions
- [ ] Implement tab completion for all commands

### Level 4: Architect
- [ ] Design a plugin system for third-party components
- [ ] Propose a remote session sharing feature
- [ ] Review the virtual filesystem for security
