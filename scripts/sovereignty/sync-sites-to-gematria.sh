#!/bin/bash
# Sync websites to Gematria edge — Sovereignty Migration
# Rsyncs all website content from local monorepo to Gematria /var/www/
# Usage: ./sync-sites-to-gematria.sh [--dry-run] [--site <name>]
set -e

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
RED='\033[38;5;196m'
RESET='\033[0m'

GEMATRIA="root@gematria"
SITES_DIR="$HOME/blackroad-operator/websites"
DRY_RUN=false
SINGLE_SITE=""
TOTAL_SITES=0
TOTAL_FILES=0

while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run) DRY_RUN=true; shift;;
    --site) SINGLE_SITE="$2"; shift 2;;
    -h|--help)
      echo -e "${PINK}Sync Sites to Gematria${RESET}"
      echo ""
      echo "Usage: ./sync-sites-to-gematria.sh [--dry-run] [--site <name>]"
      echo ""
      echo "Options:"
      echo "  --dry-run          Show what would be synced without writing"
      echo "  --site <name>      Sync only the named site"
      echo "  -h, --help         Show this help"
      exit 0
      ;;
    *) echo -e "${RED}Unknown option: $1${RESET}"; exit 1;;
  esac
done

echo -e "${PINK}Sync Sites to Gematria${RESET}"
echo -e "${BLUE}Source: ${SITES_DIR}${RESET}"
echo -e "${BLUE}Target: ${GEMATRIA}:/var/www/${RESET}"
if [[ "$DRY_RUN" == true ]]; then
  echo -e "${AMBER}[DRY RUN] No files will be written${RESET}"
fi
echo ""

# Check SSH connectivity
echo -n "Checking SSH to gematria... "
if ssh -o ConnectTimeout=5 "$GEMATRIA" "echo ok" >/dev/null 2>&1; then
  echo -e "${GREEN}connected${RESET}"
else
  echo -e "${RED}FAILED${RESET}"
  echo "Cannot reach gematria via SSH. Check your connection."
  exit 1
fi
echo ""

RSYNC_FLAGS="-az --delete --exclude='.DS_Store'"
if [[ "$DRY_RUN" == true ]]; then
  RSYNC_FLAGS="$RSYNC_FLAGS --dry-run"
fi

# Sync _shared first so CSS works
echo -e "${BLUE}Syncing _shared design system...${RESET}"
SHARED_OUT=$(rsync $RSYNC_FLAGS "$SITES_DIR/_shared/" "$GEMATRIA:/var/www/_shared/" 2>&1)
SHARED_COUNT=$(echo "$SHARED_OUT" | grep -c "^>" 2>/dev/null || echo "0")
echo -e "  ${GREEN}✓${RESET} _shared ($SHARED_COUNT files)"
echo ""

# Build site list
if [[ -n "$SINGLE_SITE" ]]; then
  if [[ -d "$SITES_DIR/$SINGLE_SITE" ]]; then
    SITE_LIST="$SINGLE_SITE"
  else
    echo -e "${RED}Site not found: $SINGLE_SITE${RESET}"
    exit 1
  fi
else
  SITE_LIST=$(ls "$SITES_DIR" | grep -v -E '^(_shared|deploy\.sh|fix-design-system\.sh)$')
fi

# Sync each site
for site in $SITE_LIST; do
  # Skip non-directories
  [[ ! -d "$SITES_DIR/$site" ]] && continue

  FILE_COUNT=$(find "$SITES_DIR/$site" -type f ! -name '.DS_Store' 2>/dev/null | wc -l | tr -d ' ')

  echo -n "  Syncing $site ($FILE_COUNT files)... "
  rsync $RSYNC_FLAGS "$SITES_DIR/$site/" "$GEMATRIA:/var/www/$site/" 2>&1 >/dev/null
  echo -e "${GREEN}done${RESET}"

  TOTAL_SITES=$((TOTAL_SITES + 1))
  TOTAL_FILES=$((TOTAL_FILES + FILE_COUNT))
done

echo ""
echo -e "${GREEN}Done!${RESET} Synced ${TOTAL_SITES} sites, ${TOTAL_FILES} total files"
if [[ "$DRY_RUN" == true ]]; then
  echo -e "${AMBER}(dry run — no files were actually written)${RESET}"
fi

# ─── Auto-sync suggestions ───────────────────────────────────────
# Cron (every 30 minutes):
#   */30 * * * * /Users/alexa/blackroad-operator/scripts/sovereignty/sync-sites-to-gematria.sh >> /tmp/blackroad-sync-sites.log 2>&1
#
# launchd plist: ~/Library/LaunchAgents/io.blackroad.sync-sites.plist
#   See: scripts/sovereignty/io.blackroad.sync-sites.plist
