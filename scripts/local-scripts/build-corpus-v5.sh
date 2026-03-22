#!/bin/bash
# Build BlackRoad Training Corpus v5 — gather EVERYTHING
# Previous: v4 was 5.8MB from 687 docs
# Goal: 15MB+ from all available sources
set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
RESET='\033[0m'

OUT="$HOME/.blackroad/training-corpus-v5.txt"
> "$OUT"

count=0
add() {
  local label="$1"
  local pattern="$2"
  local dir="${3:-.}"
  local before=$count

  find "$dir" -type f -name "$pattern" 2>/dev/null | while read -r f; do
    # Skip binary, node_modules, .git, images
    case "$f" in
      *node_modules*|*.git/*|*.png|*.jpg|*.gif|*.ico|*.woff*|*.ttf|*.pdf|*.mp4|*.zip|*.tar*|*.pyc|*__pycache__*|*.db|*.sqlite*) continue ;;
    esac
    # Only text files under 500KB
    size=$(wc -c < "$f" 2>/dev/null || echo 0)
    if [ "$size" -lt 500000 ] && [ "$size" -gt 100 ]; then
      echo "--- SOURCE: $f ---" >> "$OUT"
      cat "$f" >> "$OUT" 2>/dev/null
      echo "" >> "$OUT"
      count=$((count + 1))
    fi
  done

  local after=$(wc -l < "$OUT" 2>/dev/null)
  echo -e "  ${BLUE}$label${RESET}: added files"
}

echo -e "${PINK}╔══════════════════════════════════════════════════════════╗${RESET}"
echo -e "${PINK}║  Building Training Corpus v5                            ║${RESET}"
echo -e "${PINK}╚══════════════════════════════════════════════════════════╝${RESET}"

# Start with v4 as base
echo -e "${BLUE}Starting with v4 base (5.8MB)...${RESET}"
cat "$HOME/.blackroad/training-corpus-v4.txt" >> "$OUT"

# 1. All markdown docs in home directory
echo -e "${BLUE}Gathering markdown docs...${RESET}"
for f in ~/CLAUDE.md ~/README.md ~/*.md ~/ARCHITECTURE.md ~/BLACKROAD*.md ~/CLAUDE*.md; do
  [ -f "$f" ] && echo "--- SOURCE: $f ---" >> "$OUT" && cat "$f" >> "$OUT" 2>/dev/null && echo "" >> "$OUT"
done

# 2. BlackRoad operator docs
echo -e "${BLUE}Gathering operator docs...${RESET}"
find ~/blackroad-operator/docs -type f -name "*.md" 2>/dev/null | head -100 | while read -r f; do
  echo "--- SOURCE: $f ---" >> "$OUT" && cat "$f" >> "$OUT" 2>/dev/null && echo "" >> "$OUT"
done

# 3. Memory system scripts (the AI should understand its own tools)
echo -e "${BLUE}Gathering memory system scripts...${RESET}"
for f in ~/blackroad-operator/scripts/memory/*.sh; do
  [ -f "$f" ] && echo "--- SOURCE: $f ---" >> "$OUT" && cat "$f" >> "$OUT" 2>/dev/null && echo "" >> "$OUT"
done

# 4. Agent memory data (what agents know)
echo -e "${BLUE}Gathering agent memories...${RESET}"
for f in ~/agent-memory/data/*.json; do
  [ -f "$f" ] && echo "--- SOURCE: $f ---" >> "$OUT" && cat "$f" >> "$OUT" 2>/dev/null && echo "" >> "$OUT"
done

# 5. Claude memory files
echo -e "${BLUE}Gathering Claude memory files...${RESET}"
for f in ~/.claude/projects/-Users-alexa/memory/*.md; do
  [ -f "$f" ] && echo "--- SOURCE: $f ---" >> "$OUT" && cat "$f" >> "$OUT" 2>/dev/null && echo "" >> "$OUT"
done

# 6. Website content (what the company presents to the world)
echo -e "${BLUE}Gathering website content...${RESET}"
for f in ~/blackroad-io-site/index.html ~/enhanced-site.html ~/blackroad-chat/index.html; do
  [ -f "$f" ] && echo "--- SOURCE: $f ---" >> "$OUT" && cat "$f" >> "$OUT" 2>/dev/null && echo "" >> "$OUT"
done

# 7. RoundTrip source (agent communication)
echo -e "${BLUE}Gathering RoundTrip code...${RESET}"
for f in ~/roundtrip/server.js ~/roundtrip/src/worker.js ~/roundtrip/dispatch.js; do
  [ -f "$f" ] && echo "--- SOURCE: $f ---" >> "$OUT" && cat "$f" >> "$OUT" 2>/dev/null && echo "" >> "$OUT"
done

# 8. Operator CLI tools
echo -e "${BLUE}Gathering operator tools...${RESET}"
find ~/blackroad-operator/tools -type f -name "*.sh" 2>/dev/null | head -50 | while read -r f; do
  size=$(wc -c < "$f" 2>/dev/null || echo 0)
  [ "$size" -lt 200000 ] && echo "--- SOURCE: $f ---" >> "$OUT" && cat "$f" >> "$OUT" 2>/dev/null && echo "" >> "$OUT"
done

# 9. TypeScript source (the modern CLI)
echo -e "${BLUE}Gathering TypeScript source...${RESET}"
find ~/blackroad-operator/src -type f -name "*.ts" 2>/dev/null | while read -r f; do
  echo "--- SOURCE: $f ---" >> "$OUT" && cat "$f" >> "$OUT" 2>/dev/null && echo "" >> "$OUT"
done

# 10. Shell libraries
echo -e "${BLUE}Gathering shell libraries...${RESET}"
for f in ~/blackroad-operator/lib/*.sh; do
  [ -f "$f" ] && echo "--- SOURCE: $f ---" >> "$OUT" && cat "$f" >> "$OUT" 2>/dev/null && echo "" >> "$OUT"
done

# 11. Modelfiles and system prompts
echo -e "${BLUE}Gathering model configs...${RESET}"
for f in ~/Desktop/templates/Modelfile.blackroad ~/Desktop/templates/BLACKROAD-SYSTEM-PROMPT.md ~/Desktop/templates/BLACKROAD-STORY.md; do
  [ -f "$f" ] && echo "--- SOURCE: $f ---" >> "$OUT" && cat "$f" >> "$OUT" 2>/dev/null && echo "" >> "$OUT"
done

# 12. Information universe docs
echo -e "${BLUE}Gathering information docs...${RESET}"
find ~/information -type f -name "*.md" 2>/dev/null | head -50 | while read -r f; do
  size=$(wc -c < "$f" 2>/dev/null || echo 0)
  [ "$size" -lt 200000 ] && echo "--- SOURCE: $f ---" >> "$OUT" && cat "$f" >> "$OUT" 2>/dev/null && echo "" >> "$OUT"
done

# 13. Math content (Amundson framework)
echo -e "${BLUE}Gathering math content...${RESET}"
for f in ~/blackroad-operator/blackroad-math/*.py ~/blackroad-operator/blackroad-math/*.md; do
  [ -f "$f" ] && echo "--- SOURCE: $f ---" >> "$OUT" && cat "$f" >> "$OUT" 2>/dev/null && echo "" >> "$OUT"
done

# 14. Resume and corporate docs (identity)
echo -e "${BLUE}Gathering identity docs...${RESET}"
for f in ~/resume.md ~/ALEXA_AMUNDSON_RESUME_2025.md ~/ALEXA_AMUNDSON_BLACKROAD_CEO_RESUME.md; do
  [ -f "$f" ] && echo "--- SOURCE: $f ---" >> "$OUT" && cat "$f" >> "$OUT" 2>/dev/null && echo "" >> "$OUT"
done

# 15. Codex export
echo -e "${BLUE}Exporting codex to corpus...${RESET}"
bash ~/blackroad-operator/scripts/memory/memory-codex.sh export markdown >> "$OUT" 2>/dev/null

# 16. TIL broadcasts
echo -e "${BLUE}Exporting TILs to corpus...${RESET}"
bash ~/blackroad-operator/scripts/memory/memory-til-broadcast.sh list >> "$OUT" 2>/dev/null

# 17. Gateway and agent code
echo -e "${BLUE}Gathering gateway code...${RESET}"
find ~/blackroad-operator/blackroad-core -type f \( -name "*.js" -o -name "*.json" -o -name "*.md" \) 2>/dev/null | head -30 | while read -r f; do
  size=$(wc -c < "$f" 2>/dev/null || echo 0)
  [ "$size" -lt 200000 ] && echo "--- SOURCE: $f ---" >> "$OUT" && cat "$f" >> "$OUT" 2>/dev/null && echo "" >> "$OUT"
done

# Stats
echo ""
echo -e "${PINK}╔══════════════════════════════════════════════════════════╗${RESET}"
CHARS=$(wc -c < "$OUT")
WORDS=$(wc -w < "$OUT")
LINES=$(wc -l < "$OUT")
SOURCES=$(grep -c "^--- SOURCE:" "$OUT")
MB=$(echo "scale=1; $CHARS / 1048576" | bc)
echo -e "${PINK}║  Corpus v5: ${GREEN}${MB}MB${PINK} | ${GREEN}${WORDS} words${PINK} | ${GREEN}${SOURCES} sources${PINK}  ║${RESET}"
echo -e "${PINK}╚══════════════════════════════════════════════════════════╝${RESET}"
