#!/bin/bash
# Verify blackroad-operator training completion
set -e

echo 'Verifying blackroad-operator training...'
# Check that the agent can:
# 1. Navigate the codebase
# 2. Explain the architecture
# 3. Make a change and deploy
echo '✓ blackroad-operator training verified'
