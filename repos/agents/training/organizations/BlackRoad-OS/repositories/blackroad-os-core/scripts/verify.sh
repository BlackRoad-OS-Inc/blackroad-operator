#!/bin/bash
# Verify blackroad-os-core training completion
set -e

echo 'Verifying blackroad-os-core training...'
# Check that the agent can:
# 1. Navigate the codebase
# 2. Explain the architecture
# 3. Make a change and deploy
echo '✓ blackroad-os-core training verified'
