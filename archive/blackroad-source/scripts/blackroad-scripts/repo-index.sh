#!/bin/bash
# Repository Indexing and Summarization
clear
echo "📚 Repository Index & Summarization"
echo ""
echo "1. Index all GitHub repos"
echo "2. Update existing index"
echo "3. Generate repo summaries"
echo "4. View indexed repos stats"
echo "5. Export index to JSON"
echo "6. Export index to CSV"
echo "7. Generate master README index"
echo "8. Analyze repo languages"
echo "9. Find repos without READMEs"
echo "a. Find repos without licenses"
echo "b. Scan for deployment configs"
echo "c. Build dependency graph"
echo "d. Generate repo health report"
echo "0. Back to menu"
echo ""
read -p "Select option: " opt

INDEX_DIR="$HOME/.blackroad/repo-index"
mkdir -p "$INDEX_DIR"

case $opt in
  1)
    echo "🔍 Indexing all GitHub repos..."
    gh repo list --limit 1000 --json name,description,url,isPrivate,language,stargazerCount,forkCount,createdAt,updatedAt,diskUsage > "$INDEX_DIR/all-repos.json"
    echo "✅ Indexed $(jq length "$INDEX_DIR/all-repos.json") repos"
    ;;
  2)
    echo "🔄 Updating index..."
    gh repo list --limit 1000 --json name,description,url,isPrivate,language,stargazerCount,forkCount,createdAt,updatedAt,diskUsage > "$INDEX_DIR/all-repos.json"
    echo "✅ Index updated: $(date)" | tee "$INDEX_DIR/last-update.txt"
    ;;
  3)
    echo "📝 Generating summaries for all repos..."
    jq -r '.[].name' "$INDEX_DIR/all-repos.json" | while read repo; do
      echo "Summarizing: $repo"
      {
        echo "# $repo"
        gh repo view "$repo" --json description,homepageUrl,languages,licenseInfo --jq '.description // "No description"'
        echo ""
        echo "**Languages:** $(gh repo view "$repo" --json languages --jq '.languages[].node.name' | tr '\n' ',' | sed 's/,$//')"
        echo ""
        gh repo view "$repo" --json licenseInfo --jq '"**License:** \(.licenseInfo.name // "None")"'
        echo ""
      } > "$INDEX_DIR/summaries/$repo.md"
    done
    echo "✅ Summaries saved to $INDEX_DIR/summaries/"
    ;;
  4)
    if [ -f "$INDEX_DIR/all-repos.json" ]; then
      echo "📊 Repository Statistics"
      echo "========================"
      echo "Total repos: $(jq length "$INDEX_DIR/all-repos.json")"
      echo "Public repos: $(jq '[.[] | select(.isPrivate == false)] | length' "$INDEX_DIR/all-repos.json")"
      echo "Private repos: $(jq '[.[] | select(.isPrivate == true)] | length' "$INDEX_DIR/all-repos.json")"
      echo ""
      echo "Top languages:"
      jq -r '.[].language // "Unknown"' "$INDEX_DIR/all-repos.json" | sort | uniq -c | sort -rn | head -10
      echo ""
      echo "Total stars: $(jq '[.[].stargazerCount] | add' "$INDEX_DIR/all-repos.json")"
      echo "Total forks: $(jq '[.[].forkCount] | add' "$INDEX_DIR/all-repos.json")"
    else
      echo "❌ No index found. Run option 1 first."
    fi
    ;;
  5)
    echo "💾 Exporting to JSON..."
    cp "$INDEX_DIR/all-repos.json" "./github-repos-export-$(date +%Y%m%d).json"
    echo "✅ Exported to github-repos-export-$(date +%Y%m%d).json"
    ;;
  6)
    echo "📄 Exporting to CSV..."
    jq -r '["name","description","language","stars","forks","private","url"], (.[] | [.name, .description // "", .language // "", .stargazerCount, .forkCount, .isPrivate, .url]) | @csv' "$INDEX_DIR/all-repos.json" > "./github-repos-export-$(date +%Y%m%d).csv"
    echo "✅ Exported to github-repos-export-$(date +%Y%m%d).csv"
    ;;
  7)
    echo "📖 Generating master README index..."
    {
      echo "# GitHub Repository Index"
      echo "Generated: $(date)"
      echo ""
      echo "Total Repositories: $(jq length "$INDEX_DIR/all-repos.json")"
      echo ""
      echo "## All Repositories"
      echo ""
      jq -r '.[] | "### [\(.name)](\(.url))\n\n\(.description // "No description")\n\n**Language:** \(.language // "Unknown") | **Stars:** \(.stargazerCount) | **Forks:** \(.forkCount)\n"' "$INDEX_DIR/all-repos.json"
    } > "GITHUB_REPOSITORY_INDEX.md"
    echo "✅ Created GITHUB_REPOSITORY_INDEX.md"
    ;;
  8)
    echo "📊 Analyzing languages across all repos..."
    {
      echo "# Language Analysis"
      echo "Generated: $(date)"
      echo ""
      jq -r '.[].language // "Unknown"' "$INDEX_DIR/all-repos.json" | sort | uniq -c | sort -rn | awk '{printf "| %s | %d |\n", $2, $1}'
    } | column -t
    ;;
  9)
    echo "🔍 Finding repos without READMEs..."
    jq -r '.[].name' "$INDEX_DIR/all-repos.json" | while read repo; do
      if ! gh repo view "$repo" --json readme --jq '.readme' &>/dev/null; then
        echo "❌ $repo - No README"
      fi
    done
    ;;
  a)
    echo "⚖️  Finding repos without licenses..."
    jq -r '.[] | select(.licenseInfo == null) | .name' "$INDEX_DIR/all-repos.json" 2>/dev/null || \
    jq -r '.[].name' "$INDEX_DIR/all-repos.json" | while read repo; do
      license=$(gh repo view "$repo" --json licenseInfo --jq '.licenseInfo.name' 2>/dev/null)
      if [ -z "$license" ] || [ "$license" = "null" ]; then
        echo "❌ $repo - No license"
      fi
    done
    ;;
  b)
    echo "🚀 Scanning for deployment configs..."
    jq -r '.[].name' "$INDEX_DIR/all-repos.json" | while read repo; do
      echo "Checking $repo..."
      configs=""
      gh api "repos/:owner/$repo/contents" --jq '.[].name' 2>/dev/null | grep -E "(Dockerfile|docker-compose|railway.json|vercel.json|netlify.toml|.github/workflows)" && echo "✅ $repo has deployment configs"
    done
    ;;
  c)
    echo "🔗 Building dependency graph..."
    mkdir -p "$INDEX_DIR/dependencies"
    jq -r '.[].name' "$INDEX_DIR/all-repos.json" | while read repo; do
      echo "Analyzing $repo..."
      gh api "repos/:owner/$repo/contents/package.json" --jq '.content' 2>/dev/null | base64 -d | jq -r '.dependencies // {} | keys[]' > "$INDEX_DIR/dependencies/$repo-deps.txt" 2>/dev/null
    done
    echo "✅ Dependencies extracted to $INDEX_DIR/dependencies/"
    ;;
  d)
    echo "🏥 Generating repo health report..."
    {
      echo "# Repository Health Report"
      echo "Generated: $(date)"
      echo ""
      jq -r '.[].name' "$INDEX_DIR/all-repos.json" | while read repo; do
        echo "## $repo"
        gh repo view "$repo" --json description,licenseInfo,hasIssuesEnabled,hasWikiEnabled,isArchived --jq '"Description: \(.description // "❌ None")\nLicense: \(.licenseInfo.name // "❌ None")\nIssues: \(if .hasIssuesEnabled then "✅" else "❌" end)\nWiki: \(if .hasWikiEnabled then "✅" else "❌" end)\nArchived: \(if .isArchived then "⚠️  Yes" else "✅ No" end)"'
        echo ""
      done
    } > "REPO_HEALTH_REPORT.md"
    echo "✅ Health report saved to REPO_HEALTH_REPORT.md"
    ;;
  0)
    exec ./menu.sh
    ;;
  *)
    echo "Invalid option"
    sleep 1
    exec ./repo-index.sh
    ;;
esac

read -p "Press enter to continue..."
exec ./repo-index.sh
