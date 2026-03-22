# 🎯 CECE's Context Radar

**Smart workspace monitoring and intelligent suggestions for BlackRoad**

## What is Context Radar?

Context Radar is an intelligent file monitoring system that learns your work patterns and proactively suggests relevant files, documentation, and agents. It watches what you work on and builds a contextual map of your codebase relationships.

## Features

### 🔍 Smart File Suggestions

- Automatically detects files you often work on together
- Identifies test files related to source code
- Finds documentation related to code modules
- Shows connection strength based on access patterns

### 🤖 Agent Recommendations

- Suggests the best agent for your current task
- Based on file types and naming patterns
- Learns from your usage over time

### 📊 Context Analysis

- Visualizes your recent work activity
- Shows relationship strength between files
- Creates "context bundles" for common workflows

### 📦 Context Bundles

- Save groups of related files
- Quick access to frequently used file sets
- Perfect for complex features or bug fixes

## Quick Start

```bash
# Start the daemon (watches for file changes)
br radar daemon start

# Check daemon status
br radar daemon status

# Get smart suggestions for current directory
br radar smart

# Get suggestions for a specific file
br radar suggest ./src/api.py

# Ask which agent to use
br radar agent

# Show recent activity
br radar context

# Create a context bundle
br radar bundle my-feature ./file1.py ./file2.py ./test.py

# List all bundles
br radar bundles
```

## How It Works

1. **File Watching**: The daemon monitors file access using `fswatch`
2. **Pattern Detection**: Analyzes which files are accessed together within a time window
3. **Relationship Building**: Creates weighted connections between related files
4. **Smart Suggestions**: Uses the relationship graph to suggest relevant files
5. **Learning**: Improves suggestions based on your feedback and patterns

## Commands

### Daemon Control

```bash
br radar daemon start    # Start file watching
br radar daemon stop     # Stop daemon
br radar daemon restart  # Restart daemon
br radar daemon status   # Check status & stats
```

### Suggestions

```bash
br radar suggest [file] [limit]   # Get file suggestions
br radar agent [context]          # Get agent suggestion
br radar smart                    # Smart analysis of current directory
br radar context                  # Show recent activity
```

### Context Bundles

```bash
br radar bundle <name> <files...>  # Create bundle
br radar bundles                   # List all bundles
```

### Database

```bash
br radar db stats                 # Show database statistics
br radar db recent [limit]        # Show recent activity
br radar db related <file>        # Show related files
```

## Architecture

```
tools/context-radar/
├── radar-daemon.sh      # File watcher daemon
├── radar-db.sh         # Database layer (SQLite)
├── radar-suggest.sh    # Suggestion engine
└── data/
    ├── radar.db        # SQLite database
    ├── radar.pid       # Daemon PID
    └── radar.log       # Activity logs
```

## Database Schema

- **file_access**: Tracks every file access event
- **file_relationships**: Stores weighted connections between files
- **suggestions_feedback**: Learns from accepted/rejected suggestions
- **context_bundles**: Saved file groups
- **agent_suggestions**: Learns agent preferences

## Privacy & Performance

- ✅ All data stays local (SQLite database)
- ✅ Respects .gitignore patterns
- ✅ Minimal CPU/memory footprint
- ✅ No external services or telemetry
- ✅ Can be disabled per-directory

## Examples

### Example 1: Working on an API

```bash
$ cd ~/project/api
$ br radar smart

🧠 Smart Context Analysis
Analyzing: api

📦 Node.js project detected
  Suggestions:
  - Review package.json dependencies
  - Check for tests in __tests__/ or *.test.js

→ OCTAVIA - The Architect (code design & structure)
```

### Example 2: Finding Related Files

```bash
$ br radar suggest ./src/users.py

🎯 Context Suggestions
Context: users.py

Suggested files:

  1. 🧪 test_users.py
     tests/
     Strength: ████████ (12 co-accesses)

  2. 🔗 auth.py
     src/
     Strength: ████ (5 co-accesses)

  3. 📖 users_README.md
     docs/
     Strength: ██ (2 co-accesses)
```

## Future Enhancements

- [ ] ML-powered pattern detection
- [ ] Visual graph of file relationships
- [ ] Integration with git history
- [ ] Team collaboration features
- [ ] Voice notifications
- [ ] Browser extension for web-based editors

## Credits

Built with ❤️ by CECE for Alexa
Part of the BlackRoad Agent System
