#!/bin/bash
# R2 → MinIO Migration — Sovereignty Migration
# Syncs Cloudflare R2 bucket data to MinIO on Cecilia
# Usage: ./migrate-r2-to-minio.sh [--dry-run] [--bucket <name>]
set -e

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
VIOLET='\033[38;5;135m'
RED='\033[38;5;196m'
RESET='\033[0m'

CECILIA="blackroad@192.168.4.96"
EXPORT_DIR="$HOME/.blackroad/r2-exports"
DRY_RUN=false
SINGLE_BUCKET=""
TOTAL_OBJECTS=0
TOTAL_SYNCED=0
TOTAL_FAILED=0

while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run) DRY_RUN=true; shift;;
    --bucket) SINGLE_BUCKET="$2"; shift 2;;
    -h|--help)
      echo -e "${PINK}R2 → MinIO Migration${RESET}"
      echo ""
      echo "Usage: ./migrate-r2-to-minio.sh [--dry-run] [--bucket <name>]"
      echo ""
      echo "Options:"
      echo "  --dry-run              Show what would be synced without writing"
      echo "  --bucket <name>        Sync only the named bucket"
      echo "  -h, --help             Show this help"
      exit 0
      ;;
    *) echo -e "${RED}Unknown option: $1${RESET}"; exit 1;;
  esac
done

mkdir -p "$EXPORT_DIR"

echo -e "${PINK}R2 → MinIO Migration${RESET}"
echo -e "${BLUE}Source: Cloudflare R2${RESET}"
echo -e "${BLUE}Target: ${CECILIA} (MinIO :9000)${RESET}"
if [[ "$DRY_RUN" == true ]]; then
  echo -e "${AMBER}[DRY RUN] No data will be written${RESET}"
fi
echo ""

# Verify MinIO is reachable
echo -n "Checking MinIO on Cecilia... "
MINIO_CODE=$(ssh -o ConnectTimeout=5 "$CECILIA" "curl -s -o /dev/null -w '%{http_code}' http://localhost:9000/minio/health/live" 2>/dev/null)
if [[ "$MINIO_CODE" == "200" ]]; then
  echo -e "${GREEN}connected (HTTP 200)${RESET}"
else
  echo -e "${RED}FAILED (HTTP ${MINIO_CODE})${RESET}"
  exit 1
fi

# Load MinIO credentials
MINIO_CREDS=$(ssh "$CECILIA" "cat /etc/default/minio" 2>/dev/null)
MINIO_USER=$(echo "$MINIO_CREDS" | grep MINIO_ROOT_USER | cut -d= -f2)
MINIO_PASS=$(echo "$MINIO_CREDS" | grep MINIO_ROOT_PASSWORD | cut -d= -f2)
echo -e "MinIO user: ${GREEN}${MINIO_USER}${RESET}"
echo ""

# Get R2 buckets
echo -e "${BLUE}Discovering R2 buckets...${RESET}"
BUCKETS=$(npx wrangler r2 bucket list 2>/dev/null | grep "^name:" | awk '{print $2}')
BUCKET_COUNT=$(echo "$BUCKETS" | grep -c . 2>/dev/null || echo 0)
echo -e "Found ${GREEN}${BUCKET_COUNT}${RESET} R2 buckets"
echo ""

for bucket in $BUCKETS; do
  [[ -z "$bucket" ]] && continue
  [[ -n "$SINGLE_BUCKET" && "$bucket" != "$SINGLE_BUCKET" ]] && continue

  echo -e "${VIOLET}[${bucket}]${RESET}"

  # List objects in R2 bucket
  objects=$(npx wrangler r2 object list "$bucket" 2>/dev/null | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    for obj in data.get('objects', []):
        print(obj['key'])
except:
    pass
" 2>/dev/null)

  obj_count=$(echo "$objects" | grep -c . 2>/dev/null || true)
  obj_count=$(echo "$obj_count" | tr -d '[:space:]')
  [[ -z "$obj_count" ]] && obj_count=0
  echo -e "  Objects: ${obj_count}"

  if [[ "$obj_count" -eq 0 ]]; then
    echo -e "  ${AMBER}Empty bucket, skipping${RESET}"
    echo ""
    continue
  fi

  # Ensure bucket exists on MinIO
  if [[ "$DRY_RUN" == false ]]; then
    ssh "$CECILIA" "
      export MC_HOST_local=http://${MINIO_USER}:${MINIO_PASS}@localhost:9000
      mc mb --ignore-existing local/${bucket} 2>/dev/null
    " 2>/dev/null
  fi

  # Download each object from R2 and upload to MinIO
  bucket_dir="${EXPORT_DIR}/${bucket}"
  mkdir -p "$bucket_dir"
  synced=0
  failed=0

  while IFS= read -r key; do
    [[ -z "$key" ]] && continue

    # Create subdirectories if key has path separators
    key_dir=$(dirname "$key")
    [[ "$key_dir" != "." ]] && mkdir -p "${bucket_dir}/${key_dir}"

    if [[ "$DRY_RUN" == true ]]; then
      echo -e "    ${BLUE}WOULD SYNC${RESET} ${key}"
      synced=$((synced + 1))
    else
      # Download from R2
      if npx wrangler r2 object get "${bucket}/${key}" --file="${bucket_dir}/${key}" 2>/dev/null; then
        # Upload to MinIO via SCP + mc
        scp -q "${bucket_dir}/${key}" "${CECILIA}:/tmp/minio-upload-tmp" 2>/dev/null
        ssh "$CECILIA" "
          export MC_HOST_local=http://${MINIO_USER}:${MINIO_PASS}@localhost:9000
          mc cp /tmp/minio-upload-tmp local/${bucket}/${key} 2>/dev/null
          rm -f /tmp/minio-upload-tmp
        " 2>/dev/null
        synced=$((synced + 1))
      else
        failed=$((failed + 1))
        echo -e "    ${RED}FAILED${RESET} ${key}"
      fi
    fi
  done <<< "$objects"

  TOTAL_OBJECTS=$((TOTAL_OBJECTS + obj_count))
  TOTAL_SYNCED=$((TOTAL_SYNCED + synced))
  TOTAL_FAILED=$((TOTAL_FAILED + failed))

  echo -e "  ${GREEN}✓ Synced: ${synced}/${obj_count}${RESET}"
  [[ "$failed" -gt 0 ]] && echo -e "  ${RED}Failed: ${failed}${RESET}"
  echo ""
done

echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${PINK}R2 → MinIO Migration Complete${RESET}"
echo -e "  Buckets:  ${BUCKET_COUNT}"
echo -e "  Objects:  ${TOTAL_OBJECTS}"
echo -e "  Synced:   ${GREEN}${TOTAL_SYNCED}${RESET}"
echo -e "  Failed:   ${RED}${TOTAL_FAILED}${RESET}"
echo -e "  Exports:  ${EXPORT_DIR}/"
echo ""
echo -e "${BLUE}Verify: ssh ${CECILIA} 'MC_HOST_local=http://${MINIO_USER}:${MINIO_PASS}@localhost:9000 mc ls --recursive local/'${RESET}"
