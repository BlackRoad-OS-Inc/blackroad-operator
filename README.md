# blackroad-operator

> CLI tooling, node bootstrap scripts, and operational control utilities for BlackRoad OS.

Part of the [BlackRoad OS](https://blackroad.io) ecosystem — [BlackRoad-OS-Inc](https://github.com/BlackRoad-OS-Inc)

---

# BlackRoad Operator

The operational brain of BlackRoad OS. Scripts, tools, configs, and automation for managing the entire fleet.

## What's Inside

```
blackroad-operator/
├── scripts/memory/     # Memory system (journal, codex, TIL, collaboration, todos)
├── tools/search/       # Unified search index (4,036 entries, FTS5)
├── tools/test/         # E2E test suite (73 checks, 94.5% pass rate)
├── workers/            # Cloudflare Worker sources
├── websites/           # Domain website templates
├── config/             # Fleet configuration
└── br                  # CLI entry point
```

## Key Commands

```bash
# Memory
bash scripts/memory/memory-system.sh status
bash scripts/memory/memory-codex.sh search "query"
bash scripts/memory/memory-infinite-todos.sh dashboard

# Search
python3 tools/search/index-all.py --rebuild
bash tools/test/e2e-test.sh

# Fleet
br status        # Fleet health
br deploy        # Deploy to fleet
br search "q"    # Search everything
```

## Stats

- **88 projects, 1,038 todos** in the infinite todo system
- **284 codex solutions**, 52 patterns, 30 best practices
- **4,036 search index entries** across 28 entity types
- **34 active cron jobs** on Mac
- **73 E2E tests** running daily at 6am

---

© 2026 BlackRoad OS, Inc. Proprietary.
