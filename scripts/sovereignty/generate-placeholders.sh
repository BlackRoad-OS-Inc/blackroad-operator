#!/bin/bash
# Generate branded placeholder pages for empty Gematria subdomain directories
# Usage: ./generate-placeholders.sh [--dry-run]
set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
AMBER='\033[38;5;214m'
RESET='\033[0m'

DRY_RUN=false
[[ "$1" == "--dry-run" ]] && DRY_RUN=true

GEMATRIA="root@gematria"
COUNT=0
SKIPPED=0

echo -e "${PINK}Generating placeholder pages for empty Gematria subdomain dirs${RESET}"
[[ "$DRY_RUN" == true ]] && echo -e "${AMBER}[DRY RUN] No files will be written${RESET}"
echo ""

# Get empty dirs
EMPTY_DIRS=$(ssh "$GEMATRIA" 'for d in /var/www/*/; do f=$(find "$d" -type f 2>/dev/null | wc -l); if [ "$f" -eq 0 ]; then basename "$d"; fi; done' 2>/dev/null)

for subdir in $EMPTY_DIRS; do
  # Skip internal/infra subdirs that shouldn't have public pages
  case "$subdir" in
    stats-proxy*|ollama-fallback|pi-primary|pi-secondary|staging|internal|logs)
      echo -e "  ${AMBER}SKIP${RESET} $subdir (infrastructure)"
      SKIPPED=$((SKIPPED + 1))
      continue
      ;;
  esac

  # Pretty name: replace dashes with spaces, title case
  PRETTY=$(echo "$subdir" | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2))}1')

  PLACEHOLDER="<!DOCTYPE html>
<html lang=\"en\">
<head>
<meta charset=\"UTF-8\">
<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
<title>${PRETTY} — BlackRoad OS</title>
<link rel=\"icon\" type=\"image/png\" sizes=\"32x32\" href=\"https://images.blackroad.io/brand/br-square-32.png\" />
<link rel=\"apple-touch-icon\" sizes=\"180x180\" href=\"https://images.blackroad.io/brand/apple-touch-icon.png\" />
<meta property=\"og:image\" content=\"https://images.blackroad.io/brand/br-square-512.png\" />
<meta name=\"description\" content=\"${PRETTY} — Part of BlackRoad OS. Pave Tomorrow.\">
<link href=\"https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=JetBrains+Mono:wght@400&display=swap\" rel=\"stylesheet\">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#000;color:#f5f5f5;font-family:'Space Grotesk',sans-serif;min-height:100vh;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:24px;text-align:center}
.bar{position:fixed;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);background-size:200% 100%;animation:gs 4s linear infinite}
@keyframes gs{0%{background-position:0%}100%{background-position:200%}}
.label{font-family:'JetBrains Mono',monospace;font-size:0.7rem;letter-spacing:0.15em;text-transform:uppercase;color:#444;margin-bottom:16px}
h1{font-size:clamp(2rem,6vw,4rem);font-weight:700;letter-spacing:-0.04em;margin-bottom:16px}
p{color:#737373;font-size:1rem;max-width:400px;line-height:1.7;margin-bottom:32px}
a.btn{display:inline-flex;align-items:center;gap:8px;background:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);color:#fff;padding:12px 24px;border-radius:6px;font-weight:600;font-size:0.9rem;text-decoration:none;transition:opacity 0.2s,transform 0.2s}
a.btn:hover{opacity:0.9;transform:translateY(-1px)}
.footer{position:fixed;bottom:0;left:0;right:0;padding:16px;text-align:center;font-family:'JetBrains Mono',monospace;font-size:0.7rem;color:#333}
.footer a{color:#444;text-decoration:none;margin:0 8px}
.footer a:hover{color:#f5f5f5}
</style>
</head>
<body>
<div class=\"bar\"></div>
<div class=\"label\">${subdir}.blackroad.io</div>
<h1>${PRETTY}</h1>
<p>This service is part of BlackRoad OS. Currently being built on sovereign infrastructure.</p>
<a href=\"https://blackroad.io\" class=\"btn\">Visit BlackRoad OS →</a>
<div class=\"footer\">
<span>© 2026 BlackRoad OS, Inc.</span><br>
<a href=\"https://blackroad.io\">Home</a>
<a href=\"https://blackroadai.com\">AI</a>
<a href=\"https://blackroad.network\">Network</a>
<a href=\"https://blackroad.systems\">Status</a>
</div>
</body>
</html>"

  if [[ "$DRY_RUN" == true ]]; then
    echo -e "  ${BLUE}WOULD${RESET} generate: $subdir"
  else
    echo "$PLACEHOLDER" | ssh "$GEMATRIA" "cat > /var/www/$subdir/index.html"
    echo -e "  ${GREEN}✓${RESET} $subdir"
  fi
  COUNT=$((COUNT + 1))
done

echo ""
echo -e "${GREEN}Done!${RESET} Generated: $COUNT | Skipped: $SKIPPED"
