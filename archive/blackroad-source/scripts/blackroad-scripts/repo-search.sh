#!/bin/bash
# Repository Search and Query
clear
echo "🔍 Repository Search"
echo ""
echo "1. Search by name"
echo "2. Search by language"
echo "3. Search by topic/tag"
echo "4. Search code across all repos"
echo "5. Find repos modified recently"
echo "6. Find largest repos"
echo "7. Find most starred repos"
echo "8. Search by description keyword"
echo "9. Find archived repos"
echo "a. Advanced query builder"
echo "0. Back to menu"
echo ""
read -p "Select option: " opt

INDEX_DIR="$HOME/.blackroad/repo-index"

case $opt in
  1)
    read -p "Search repo name: " query
    if [ -f "$INDEX_DIR/all-repos.json" ]; then
      jq -r ".[] | select(.name | contains(\"$query\")) | \"\(.name) - \(.description // \"No description\")\"" "$INDEX_DIR/all-repos.json"
    else
      gh repo list --limit 100 | grep -i "$query"
    fi
    ;;
  2)
    read -p "Language: " lang
    if [ -f "$INDEX_DIR/all-repos.json" ]; then
      jq -r ".[] | select(.language == \"$lang\") | \"\(.name) - \(.description // \"No description\")\"" "$INDEX_DIR/all-repos.json"
    else
      gh repo list --limit 100 --language "$lang"
    fi
    ;;
  3)
    read -p "Topic/tag: " topic
    gh repo list --limit 100 --topic "$topic"
    ;;
  4)
    read -p "Code search query: " query
    read -p "File extension (optional, e.g., js, py): " ext
    if [ -n "$ext" ]; then
      gh search code "$query" --extension "$ext" --limit 50
    else
      gh search code "$query" --limit 50
    fi
    ;;
  5)
    echo "📅 Repos modified in last 7 days:"
    if [ -f "$INDEX_DIR/all-repos.json" ]; then
      jq -r '.[] | select(.updatedAt > (now - 604800 | todate)) | "\(.name) - Updated: \(.updatedAt)"' "$INDEX_DIR/all-repos.json"
    else
      gh repo list --limit 100 --json name,updatedAt --jq '.[] | "\(.name) - \(.updatedAt)"' | head -20
    fi
    ;;
  6)
    echo "💾 Largest repos by disk usage:"
    if [ -f "$INDEX_DIR/all-repos.json" ]; then
      jq -r '.[] | "\(.diskUsage // 0) KB - \(.name)"' "$INDEX_DIR/all-repos.json" | sort -rn | head -20
    else
      echo "Run repo index first for disk usage stats"
    fi
    ;;
  7)
    echo "⭐ Most starred repos:"
    if [ -f "$INDEX_DIR/all-repos.json" ]; then
      jq -r '.[] | "\(.stargazerCount) stars - \(.name) - \(.description // \"\")"' "$INDEX_DIR/all-repos.json" | sort -rn | head -20
    else
      gh repo list --limit 100 --json name,stargazerCount,description --jq '.[] | "\(.stargazerCount) - \(.name)"' | sort -rn | head -20
    fi
    ;;
  8)
    read -p "Search description for keyword: " keyword
    if [ -f "$INDEX_DIR/all-repos.json" ]; then
      jq -r ".[] | select(.description // \"\" | ascii_downcase | contains(\"${keyword,,}\")) | \"\(.name) - \(.description)\"" "$INDEX_DIR/all-repos.json"
    else
      gh repo list --limit 100 --json name,description --jq ".[] | select(.description // \"\" | ascii_downcase | contains(\"${keyword,,}\")) | \"\(.name) - \(.description)\""
    fi
    ;;
  9)
    echo "🗄️  Archived repos:"
    gh repo list --limit 100 --json name,isArchived,description --jq '.[] | select(.isArchived == true) | "\(.name) - \(.description // \"No description\")"'
    ;;
  a)
    echo "🔧 Advanced Query Builder"
    read -p "Owner/org: " owner
    read -p "Language (optional): " lang
    read -p "Min stars (optional): " stars
    read -p "Is archived? (y/n, optional): " archived
    
    query="user:${owner:-$USER}"
    [ -n "$lang" ] && query="$query language:$lang"
    [ -n "$stars" ] && query="$query stars:>=$stars"
    [ "$archived" = "y" ] && query="$query archived:true"
    
    echo "Searching: $query"
    gh search repos "$query" --limit 50
    ;;
  0)
    exec ./menu.sh
    ;;
  *)
    echo "Invalid option"
    sleep 1
    exec ./repo-search.sh
    ;;
esac

read -p "Press enter to continue..."
exec ./repo-search.sh
