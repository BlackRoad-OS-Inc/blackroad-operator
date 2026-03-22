#!/bin/bash
# GitHub Issues Management
clear
echo "📋 GitHub Issues Management"
echo ""
echo "1. List open issues"
echo "2. Create new issue"
echo "3. View issue details"
echo "4. Close issue"
echo "5. Reopen issue"
echo "6. Add label to issue"
echo "7. Assign issue"
echo "8. Comment on issue"
echo "9. Search issues"
echo "0. Back to menu"
echo ""
read -p "Select option: " opt

case $opt in
  1)
    gh issue list
    ;;
  2)
    read -p "Title: " title
    read -p "Body: " body
    gh issue create --title "$title" --body "$body"
    ;;
  3)
    read -p "Issue number: " issue
    gh issue view "$issue"
    ;;
  4)
    read -p "Issue number: " issue
    gh issue close "$issue"
    ;;
  5)
    read -p "Issue number: " issue
    gh issue reopen "$issue"
    ;;
  6)
    read -p "Issue number: " issue
    read -p "Label: " label
    gh issue edit "$issue" --add-label "$label"
    ;;
  7)
    read -p "Issue number: " issue
    read -p "Assignee username: " assignee
    gh issue edit "$issue" --add-assignee "$assignee"
    ;;
  8)
    read -p "Issue number: " issue
    read -p "Comment: " comment
    gh issue comment "$issue" --body "$comment"
    ;;
  9)
    read -p "Search query: " query
    gh issue list --search "$query"
    ;;
  0)
    exec ./menu.sh
    ;;
  *)
    echo "Invalid option"
    sleep 1
    exec ./gh-issues.sh
    ;;
esac

read -p "Press enter to continue..."
exec ./gh-issues.sh
