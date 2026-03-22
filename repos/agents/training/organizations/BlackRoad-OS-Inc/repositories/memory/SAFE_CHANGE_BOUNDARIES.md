# memory — Safe Change Boundaries

## SAFE (do freely)
- Read any memory script
- Run `status`, `stats`, `list`, `search` commands (read-only)
- Read Memory 2048 source code
- Edit documentation
- Add new read-only query functions

## CAUTION (test first, verify after)
- Modify existing memory scripts (all sessions depend on them)
- Change SQLite schema (migration needed)
- Edit the codex add/update functions
- Modify TIL broadcast format (all consumers depend on it)
- Change Memory 2048 compression parameters

## DANGEROUS (ask before doing)
- Modify the hash chain logic in memory-system.sh
- Change the journal entry format
- Run database migrations on production SQLite files
- Modify the task marketplace schema (146K tasks)
- Change the sync daemon behavior

## NEVER
- Delete or truncate the journal
- Reset the hash chain
- Drop SQLite tables with production data
- Modify journal entries after they're written (append-only)
- Force push to main
