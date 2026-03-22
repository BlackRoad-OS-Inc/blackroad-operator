#!/usr/bin/env zsh
# BR Watchdog — Collaboration system health monitoring
# Alias to memory-watchdog.sh
exec "$HOME/blackroad-operator/scripts/memory/memory-watchdog.sh" "${@:-help}"
