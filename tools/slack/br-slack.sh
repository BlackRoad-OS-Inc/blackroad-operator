#!/usr/bin/env zsh
# BR Slack — Direct Slack agent communication
# Alias to memory-slack.sh
exec "$HOME/blackroad-operator/scripts/memory/memory-slack.sh" "${@:-help}"
