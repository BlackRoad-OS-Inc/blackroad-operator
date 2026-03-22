#!/bin/bash
# GitHub Workflows Management
clear
echo "⚙️  GitHub Workflows Management"
echo ""
echo "1. Enable/disable workflow"
echo "2. View workflow details"
echo "3. Watch workflow runs (live)"
echo "4. View workflow usage/billing"
echo "5. List workflow jobs"
echo "6. View job logs"
echo "7. Create workflow template"
echo "0. Back to menu"
echo ""
read -p "Select option: " opt

case $opt in
  1)
    gh workflow list
    read -p "Workflow name/ID: " wf
    read -p "Enable or disable? (e/d): " action
    if [ "$action" = "e" ]; then
      gh workflow enable "$wf"
    else
      gh workflow disable "$wf"
    fi
    ;;
  2)
    read -p "Workflow name/ID: " wf
    gh workflow view "$wf"
    ;;
  3)
    gh run watch
    ;;
  4)
    gh api /repos/:owner/:repo/actions/workflows --jq '.workflows[] | "\(.name): \(.state)"'
    ;;
  5)
    read -p "Run ID: " run_id
    gh run view "$run_id" --json jobs --jq '.jobs[] | "\(.name): \(.conclusion)"'
    ;;
  6)
    read -p "Run ID: " run_id
    read -p "Job ID: " job_id
    gh run view "$run_id" --job "$job_id" --log
    ;;
  7)
    echo "Creating basic workflow template..."
    mkdir -p .github/workflows
    cat > .github/workflows/new-workflow.yml <<'EOF'
name: New Workflow
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run script
        run: echo "Hello from BlackRoad OS!"
EOF
    echo "✅ Created .github/workflows/new-workflow.yml"
    ;;
  0)
    exec ./menu.sh
    ;;
  *)
    echo "Invalid option"
    sleep 1
    exec ./gh-workflows.sh
    ;;
esac

read -p "Press enter to continue..."
exec ./gh-workflows.sh
