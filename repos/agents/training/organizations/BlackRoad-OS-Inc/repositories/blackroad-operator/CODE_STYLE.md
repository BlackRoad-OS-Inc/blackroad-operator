# blackroad-operator — Code Style

## Shell Scripts
```bash
#!/bin/bash
set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
RESET='\033[0m'

# SQLite pattern
DB_FILE="$HOME/.blackroad/<feature>.db"
```

## TypeScript (src/)
- ESM (`"type": "module"`)
- Strict mode
- Single quotes, no semicolons, trailing commas
- Commander for CLI, Chalk for colors, Conf for config

## Python (agents/, scripts/)
- Type hints
- Docstrings on public functions
- asyncio for concurrent operations
- SQLite with WAL mode

## Brand Colors (UI)
```
Gradient: #FF6B2B → #FF2255 → #CC00AA → #8844FF → #4488FF → #00D4FF
Background: #000 | Card: #0a0a0a | Border: #1a1a1a
Font: Space Grotesk + JetBrains Mono
Text: #fff or #f5f5f5 only
```
