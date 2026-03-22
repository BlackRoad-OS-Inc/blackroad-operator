#!/bin/bash
# GitHub Actions Management
clear
echo "🔁 GitHub Actions Management"
echo ""
echo "1. List all workflows"
echo "2. View workflow runs"
echo "3. Trigger workflow dispatch"
echo "4. Download workflow artifacts"
echo "5. View workflow run logs"
echo "6. Cancel running workflow"
echo "7. Re-run failed workflow"
echo "0. Back to menu"
echo ""
read -p "Select option: " opt

case $opt in
  1)
    gh workflow list
    ;;
  2)
    gh run list --limit 20
    ;;
  3)
    read -p "Workflow name/ID: " wf
    read -p "Branch (default: main): " branch
    branch=${branch:-main}
    gh workflow run "$wf" --ref "$branch"
    ;;
  4)
    read -p "Run ID: " run_id
    gh run download "$run_id"
    ;;
  5)
    read -p "Run ID: " run_id
    gh run view "$run_id" --log
    ;;
  6)
    read -p "Run ID: " run_id
    gh run cancel "$run_id"
    ;;
  7)
    read -p "Run ID: " run_id
    gh run rerun "$run_id"
    ;;
  0)
    exec ./menu.sh
    ;;
  *)
    echo "Invalid option"
    sleep 1
    exec ./gh-actions.sh
    ;;
esac

read -p "Press enter to continue..."
exec ./gh-actions.sh
