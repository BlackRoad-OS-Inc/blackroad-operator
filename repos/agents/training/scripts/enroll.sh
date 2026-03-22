#!/bin/bash
# Enroll a new agent in BlackRoad training
set -e

AGENT_ID="${1:-agent-$(date +%s)}"
echo "Enrolling agent: $AGENT_ID"
echo "Step 1: Read CLAUDE.md"
echo "Step 2: Search codex for existing solutions"
echo "Step 3: Complete Observer certification"
echo "Step 4: Pick a repo and start Contributor track"
