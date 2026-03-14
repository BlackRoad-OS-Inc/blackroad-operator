#!/usr/bin/env zsh
# ◆ BR SEARCH-ALL — Unified search across the entire BlackRoad ecosystem
# Indexes: codex, TILs, journal, repos, websites, tools, agents, wiki, snippets, memories
# br search-all <query> [--rebuild] [--type TYPE] [--limit N] [--stats]

exec python3 "$(dirname "$0")/index-all.py" "$@"
