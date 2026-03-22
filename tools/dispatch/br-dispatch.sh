#!/usr/bin/env zsh
# BR Dispatch — Agent task dispatch and sprint management
# Alias to memory-agent-dispatch.sh
exec "$HOME/blackroad-operator/scripts/memory/memory-agent-dispatch.sh" "${@:-help}"
