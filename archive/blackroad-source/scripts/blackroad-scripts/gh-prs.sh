#!/bin/bash
# GitHub Pull Requests Management
clear
echo "🔀 GitHub Pull Requests"
echo ""
echo "1. List open PRs"
echo "2. Create new PR"
echo "3. View PR details"
echo "4. Review PR (approve/comment/request changes)"
echo "5. Merge PR"
echo "6. Close PR"
echo "7. Checkout PR locally"
echo "8. List PR checks/status"
echo "9. Auto-merge all approved PRs"
echo "0. Back to menu"
echo ""
read -p "Select option: " opt

case $opt in
  1)
    gh pr list
    ;;
  2)
    read -p "Title: " title
    read -p "Body: " body
    read -p "Base branch (default: main): " base
    base=${base:-main}
    gh pr create --title "$title" --body "$body" --base "$base"
    ;;
  3)
    read -p "PR number: " pr
    gh pr view "$pr"
    ;;
  4)
    read -p "PR number: " pr
    read -p "Action (approve/comment/request-changes): " action
    read -p "Comment: " comment
    gh pr review "$pr" --"$action" --body "$comment"
    ;;
  5)
    read -p "PR number: " pr
    read -p "Merge method (merge/squash/rebase): " method
    method=${method:-merge}
    gh pr merge "$pr" --"$method" --delete-branch
    ;;
  6)
    read -p "PR number: " pr
    gh pr close "$pr"
    ;;
  7)
    read -p "PR number: " pr
    gh pr checkout "$pr"
    ;;
  8)
    read -p "PR number: " pr
    gh pr checks "$pr"
    ;;
  9)
    echo "Auto-merging approved PRs..."
    gh pr list --state open --json number,reviewDecision --jq '.[] | select(.reviewDecision=="APPROVED") | .number' | while read pr; do
      echo "Merging PR #$pr"
      gh pr merge "$pr" --auto --squash
    done
    ;;
  0)
    exec ./menu.sh
    ;;
  *)
    echo "Invalid option"
    sleep 1
    exec ./gh-prs.sh
    ;;
esac

read -p "Press enter to continue..."
exec ./gh-prs.sh
