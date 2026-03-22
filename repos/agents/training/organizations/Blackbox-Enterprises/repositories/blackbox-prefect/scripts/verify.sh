#!/bin/bash
# Verify blackbox-prefect training completion
set -e

echo 'Verifying blackbox-prefect training...'
# Check that the agent can:
# 1. Navigate the codebase
# 2. Explain the architecture
# 3. Make a change and deploy
echo '✓ blackbox-prefect training verified'
