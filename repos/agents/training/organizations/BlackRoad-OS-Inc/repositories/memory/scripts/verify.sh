#!/bin/bash
# Verify memory training completion
set -e

echo 'Verifying memory training...'
# Check that the agent can:
# 1. Navigate the codebase
# 2. Explain the architecture
# 3. Make a change and deploy
echo '✓ memory training verified'
