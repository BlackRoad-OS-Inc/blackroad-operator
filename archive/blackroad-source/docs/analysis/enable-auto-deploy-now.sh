#!/usr/bin/env bash
# Quick enable auto-deploy (works around permission issues)
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}[AUTO-DEPLOY]${NC} Enabling in writable BlackRoad projects..."

cd "$HOME"
ENABLED=0

for dir in blackroad-* my-awesome-app blackroad-test-deploy-*; do
  [[ ! -d "$dir/.git" ]] && continue
  [[ -f "$dir/.git-auto-commit.sh" ]] && continue
  
  # Try to create script
  if cat > "$dir/.git-auto-commit.sh" 2>/dev/null <<'SCRIPT'
#!/bin/bash
MESSAGE="${1:-Auto-commit: $(date +%Y-%m-%d\ %H:%M:%S)}"
git add -A && git commit -m "$MESSAGE" && git push 2>/dev/null || echo "⚠ Check remote"
echo "✅ Done!"
SCRIPT
  then
    chmod +x "$dir/.git-auto-commit.sh" 2>/dev/null
    mkdir -p "$dir/.git/hooks" 2>/dev/null
    echo '#!/bin/bash' > "$dir/.git/hooks/post-commit" 2>/dev/null
    echo 'git push 2>/dev/null || true' >> "$dir/.git/hooks/post-commit" 2>/dev/null
    chmod +x "$dir/.git/hooks/post-commit" 2>/dev/null
    echo -e "${GREEN}✓${NC} $(basename $dir)"
    ((ENABLED++))
  fi
done

echo ""
echo -e "${GREEN}✅ Enabled in $ENABLED projects!${NC}"
