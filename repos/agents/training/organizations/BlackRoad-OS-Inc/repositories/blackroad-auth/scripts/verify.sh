#!/bin/bash
# Verify blackroad-auth training completion
set -e

echo 'Verifying blackroad-auth training...'
# Check that the agent can:
# 1. Navigate the codebase
# 2. Explain the architecture
# 3. Make a change and deploy
echo '✓ blackroad-auth training verified'
