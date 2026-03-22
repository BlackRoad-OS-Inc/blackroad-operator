#!/usr/bin/env bash
# Mass deploy all website apps from ~/blackroad-operator/websites/ to CF Pages
# Each directory becomes a live site

WEBSITES_DIR="$HOME/blackroad-operator/websites"
COUNT=0
SUCCESS=0
FAIL=0

echo "Deploying all website apps to Cloudflare Pages..."
echo ""

for site_dir in "$WEBSITES_DIR"/*/; do
  site=$(basename "$site_dir")

  # Skip shared/scripts
  [[ "$site" == "_shared" ]] && continue
  [[ "$site" == "deploy.sh" ]] && continue
  [[ "$site" == "fix-design-system.sh" ]] && continue

  # Check if there's an index.html
  if [ ! -f "$site_dir/index.html" ]; then
    continue
  fi

  COUNT=$((COUNT + 1))

  # Map site name to CF Pages project name
  project=""
  case "$site" in
    blackroad-io) project="blackroad-io" ;;
    blackroad-company) project="blackroad-company" ;;
    blackroad-me) project="blackroad-me" ;;
    blackroad-network) project="blackroad-network" ;;
    blackroad-systems) project="blackroad-systems" ;;
    blackroad-ai) project="blackroadai-com" ;;
    blackroadinc-us) project="blackroadinc-us" ;;
    blackroadqi) project="blackroadqi-com" ;;
    blackroad-quantum) project="blackroadquantum-com" ;;
    blackroad-quantum-info) project="blackroadquantum-info" ;;
    blackroad-quantum-net) project="blackroadquantum-net" ;;
    blackroad-quantum-shop) project="blackroadquantum-shop" ;;
    blackroad-quantum-store) project="blackroadquantum-store" ;;
    lucidia-earth) project="lucidia-earth" ;;
    lucidia-studio) project="lucidia-studio" ;;
    lucidiaqi) project="lucidiaqi-com" ;;
    roadchain) project="roadchain-io" ;;
    roadcoin) project="roadcoin-io" ;;
    blackboxprogramming) project="blackboxprogramming-io" ;;
    *) project="blackroad-$site" ;;
  esac

  echo "[$COUNT] $site → $project"

  # Deploy
  result=$(npx wrangler pages deploy "$site_dir" --project-name="$project" --branch=main --commit-dirty=true 2>&1)

  if echo "$result" | grep -q "Deployment complete"; then
    url=$(echo "$result" | grep -oE 'https://[a-z0-9]+\.[a-z0-9-]+\.pages\.dev' | head -1)
    echo "  ✓ $url"
    SUCCESS=$((SUCCESS + 1))
  elif echo "$result" | grep -q "could not find project"; then
    # Create the project first
    npx wrangler pages project create "$project" --production-branch=main 2>/dev/null
    result2=$(npx wrangler pages deploy "$site_dir" --project-name="$project" --branch=main --commit-dirty=true 2>&1)
    if echo "$result2" | grep -q "Deployment complete"; then
      echo "  ✓ Created + deployed"
      SUCCESS=$((SUCCESS + 1))
    else
      echo "  ✗ Failed"
      FAIL=$((FAIL + 1))
    fi
  else
    echo "  ✗ Failed"
    FAIL=$((FAIL + 1))
  fi
done

echo ""
echo "════════════════════════════════════"
echo "Deployed: $SUCCESS / $COUNT"
echo "Failed: $FAIL"
echo "════════════════════════════════════"
