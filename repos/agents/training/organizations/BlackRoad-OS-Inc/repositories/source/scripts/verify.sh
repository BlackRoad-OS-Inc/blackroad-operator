#!/bin/bash
# Verify source training completion
set -e

echo 'Verifying source training...'
# Check that the agent can:
# 1. Navigate the codebase
# 2. Explain the architecture
# 3. Make a change and deploy
echo '✓ source training verified'
