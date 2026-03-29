#!/bin/bash
# Enhance all BlackRoad-Forge repos — descriptions, topics, homepages
# Rate-limit aware, runs after license push

set -e

ORG="BlackRoad-Forge"
LOGFILE="$HOME/forge-enhance.log"
echo "=== Forge Enhancement Started $(date -u) ===" > "$LOGFILE"

wait_for_rate_limit() {
  while true; do
    remaining=$(gh api /rate_limit -q '.rate.remaining' 2>/dev/null || echo "0")
    if [ "$remaining" -gt 50 ]; then
      return
    fi
    reset=$(gh api /rate_limit -q '.rate.reset' 2>/dev/null || echo "0")
    now=$(date +%s)
    wait=$((reset - now + 5))
    if [ "$wait" -gt 0 ]; then
      echo "  Rate limit: $remaining remaining. Sleeping ${wait}s..."
      sleep "$wait"
    fi
  done
}

# Map of new forks to enhance
declare -a NEW_FORKS=(
  "RoadAuth|Self-hosted authentication for BlackRoad OS — fork of SuperTokens|auth,authentication,self-hosted,blackroad,identity,sso|https://auth.blackroad.io"
  "RoadRecall|Spaced repetition engine for RoadWork education — fork of FSRS|spaced-repetition,education,learning,blackroad,adaptive-learning,fsrs|https://tutor.blackroad.io"
  "RoadCal|Sovereign scheduling for BlackRoad OS — fork of Cal.com|scheduling,calendar,self-hosted,blackroad,booking,appointments|https://blackroad.io"
  "RoadMail|Self-hosted email and newsletters for BlackRoad — fork of listmonk|email,newsletter,self-hosted,blackroad,smtp,marketing|https://blackroad.io"
  "RoadMeet|WebRTC video conferencing for BlackRoad OS — fork of LiveKit|video-conferencing,webrtc,self-hosted,blackroad,real-time,streaming|https://blackroad.io"
  "RoadChat-Support|Customer support and CRM for BlackRoad — fork of Chatwoot|crm,customer-support,chat,blackroad,self-hosted,helpdesk|https://chat.blackroad.io"
  "RoadStore|Headless e-commerce for BlackRoad marketplace — fork of Medusa|ecommerce,headless-commerce,blackroad,self-hosted,marketplace,payments|https://pay.blackroad.io"
  "RoadCadence|Music production DAW for BlackRoad creator studio — fork of LMMS|music,daw,audio,blackroad,creative-tools,production|https://blackroad.io"
  "RoadChain-Core|Blockchain infrastructure for RoadCoin — fork of go-ethereum|blockchain,ethereum,cryptocurrency,blackroad,web3,smart-contracts|https://blackroad.io"
  "RoadSign|Document signing for BlackRoad legal — fork of Documenso|document-signing,esignature,blackroad,self-hosted,legal,contracts|https://blackroad.io"
  "RoadCompass|Business intelligence dashboard for BlackRoad — fork of Metabase|analytics,business-intelligence,blackroad,self-hosted,dashboard,data|https://blackroad.io"
  "RoadLoop|Workflow automation for BlackRoad OS — fork of n8n|workflow-automation,integration,blackroad,self-hosted,automation,nocode|https://blackroad.io"
  "RoadLang|Self-hosted translation for BlackRoad i18n — fork of LibreTranslate|translation,i18n,self-hosted,blackroad,language,nlp|https://blackroad.io"
  "RoadForms|Form builder for BlackRoad — fork of Formbricks|forms,surveys,blackroad,self-hosted,feedback,data-collection|https://blackroad.io"
  "RoadStatus|GitHub-powered status page for BlackRoad — fork of Upptime|status-page,monitoring,blackroad,uptime,health-check,devops|https://status.blackroad.io"
  "RoadVault|Self-hosted password management for BlackRoad — fork of Bitwarden|password-manager,security,blackroad,self-hosted,encryption,vault|https://blackroad.io"
  "RoadWiki|Team knowledge base for BlackRoad — fork of Outline|wiki,knowledge-base,blackroad,self-hosted,documentation,team|https://blackroad.io"
  "RoadSync|P2P file synchronization for BlackRoad mesh — fork of Syncthing|file-sync,p2p,blackroad,self-hosted,mesh,decentralized|https://blackroad.io"
  "RoadBoard|Kanban project management for BlackRoad — fork of Planka|kanban,project-management,blackroad,self-hosted,trello-alternative,agile|https://blackroad.io"
  "RoadInvoice|Invoicing and billing for BlackRoad — fork of InvoiceNinja|invoicing,billing,blackroad,self-hosted,accounting,payments|https://pay.blackroad.io"
)

# Existing forks to ensure have blackroad topic + descriptions
declare -a EXISTING_FORKS=(
  "RoadOS|Agent Operating System for BlackRoad autonomous fleet|operating-system,blackroad,rust,self-hosted,fleet,agents"
  "RoadLegend|Zelda-like RPG framework for BlackRoad agent quests|gamedev,rpg,blackroad,agents,pixel-art,adventure"
  "RoadValley|Farming and IoT simulation for BlackRoad — fork of Stardew|gamedev,simulation,blackroad,farming,iot,agents"
  "RoadBloc|Multiplayer isometric building for BlackRoad|gamedev,multiplayer,blackroad,isometric,building,voxel"
  "RoadPolis|SimCity-style network dashboard for BlackRoad fleet|simulation,city-builder,blackroad,network,dashboard,fleet"
  "RoadBound|Multiplayer city sim with 30K agents|gamedev,city-builder,blackroad,multiplayer,agents,simulation"
  "RoadSurvive3D|3D survival game for BlackRoad|gamedev,3d,blackroad,survival,threejs,browser-game"
  "RoadCubeWorld|Voxel world engine for BlackRoad metaverse|gamedev,voxel,blackroad,minecraft,metaverse,3d"
  "RoadDrive|3D drive-through BlackRoad network visualization|visualization,3d,blackroad,threejs,network,interactive"
  "Road3D|3D SimCity in browser for BlackRoad|gamedev,3d,blackroad,city-builder,browser-game,simulation"
  "RoadFarm|Farming simulator for BlackRoad|gamedev,farming,blackroad,simulation,multiplayer,agents"
  "ai-town|AI town where BlackRoad agents live and socialize|ai,agents,blackroad,simulation,social,autonomous"
  "RoadPhaser|2D browser game framework for BlackRoad|gamedev,2d,blackroad,phaser,browser-game,html5"
  "RoadCraft|HTML5 multiplayer game server for BlackRoad|gamedev,multiplayer,blackroad,html5,server,real-time"
  "RoadRL|Reinforcement learning multi-agent urban sims|ai,reinforcement-learning,blackroad,agents,simulation,research"
  "RoadSprite|Pixel art sprite editor for BlackRoad assets|pixel-art,sprite,blackroad,creative-tools,editor,assets"
  "RoadPiskel|Browser pixel art editor for BlackRoad|pixel-art,editor,blackroad,creative-tools,browser,animation"
  "RoadTiled|Tile map editor for BlackRoad game worlds|tilemap,editor,blackroad,gamedev,level-design,maps"
  "RoadFlow|Traffic flow simulation and data pipeline for BlackRoad|traffic,simulation,blackroad,data-pipeline,visualization,network"
  "RoadSUMO|Industrial-grade traffic simulation for BlackRoad|traffic,simulation,blackroad,sumo,transport,urban"
  "RoadTopology|Real-time mesh topology visualizer for BlackRoad|network,topology,blackroad,visualization,mesh,real-time"
  "RoadShadow|30K-node network simulator for BlackRoad fleet|network,simulation,blackroad,fleet,distributed,testing"
  "RoadEdge|Hailo AI SDK for BlackRoad edge compute|edge-computing,hailo,blackroad,ai,hardware,inference"
  "RoadVision|Hailo-8 coprocessor guide for BlackRoad fleet|hailo,computer-vision,blackroad,hardware,ai,edge"
  "RoadHome|AI smart home on Pi + Hailo-8 for BlackRoad|smart-home,iot,blackroad,raspberry-pi,hailo,automation"
  "RoadDokku|Docker PaaS for BlackRoad app deployment|paas,docker,blackroad,self-hosted,deployment,devops"
  "RoadUptime|Self-hosted service health monitoring for BlackRoad|monitoring,uptime,blackroad,self-hosted,health-check,devops"
  "RoadDash|Self-hostable fleet dashboard for BlackRoad|dashboard,blackroad,self-hosted,fleet,monitoring,devops"
  "RoadHuginn|Autonomous monitoring agents for BlackRoad|automation,agents,blackroad,monitoring,self-hosted,scraping"
  "RoadGit|Terminal git UI for BlackRoad developers|git,terminal,blackroad,developer-tools,tui,cli"
  "RoadYazi|Blazing fast terminal file manager for BlackRoad|file-manager,terminal,blackroad,developer-tools,tui,rust"
  "RoadArchive|Self-hosted web archiving for BlackRoad|archiving,self-hosted,blackroad,preservation,web,knowledge"
  "RoadDB|Analytical SQL database for BlackRoad — fork of DuckDB|database,analytics,blackroad,sql,olap,data"
  "BR-Rag-Fork|LightRAG knowledge retrieval for BlackRoad AI|rag,ai,blackroad,knowledge-retrieval,llm,search"
  "LocalRoad|Local-first AI for BlackRoad — no GPU required|ai,local-first,blackroad,llm,privacy,edge"
  "RoadMCP|MCP servers for BlackRoad agent tools|mcp,agents,blackroad,ai,tools,integration"
  "RoadHLS|HLS live video segmenter for BlackRoad streaming|streaming,hls,blackroad,video,live,media"
  "RoadRelay|WebRTC P2P streaming for BlackRoad|webrtc,p2p,blackroad,streaming,real-time,media"
  "RoadAPI|API development ecosystem for BlackRoad — fork of Hoppscotch|api,developer-tools,blackroad,testing,rest,graphql"
  "RoadResume|Resume builder for BlackRoad careers platform|resume,careers,blackroad,self-hosted,job,portfolio"
  "RoadText|Markdown editor for BlackRoad documentation|markdown,editor,blackroad,documentation,writing,developer-tools"
  "RoadWhisper|Speech-to-text on Hailo-8 for BlackRoad voice agents|speech-to-text,whisper,blackroad,hailo,voice,ai"
  "RoadTrain|Interactive coding education for BlackRoad|education,coding,blackroad,interactive,learning,tutorial"
)

TOTAL=0

echo ""
echo "=== Enhancing 20 NEW critical forks ==="
for entry in "${NEW_FORKS[@]}"; do
  IFS='|' read -r repo desc topics homepage <<< "$entry"
  wait_for_rate_limit

  gh repo edit "$ORG/$repo" --description "$desc" --homepage "$homepage" 2>/dev/null || true

  # Build topics JSON
  topics_json=$(echo "$topics" | tr ',' '\n' | sed 's/^/"/;s/$/"/' | tr '\n' ',' | sed 's/,$//')
  gh api "/repos/$ORG/$repo/topics" --method PUT --input - <<< "{\"names\":[$topics_json]}" 2>/dev/null || true

  TOTAL=$((TOTAL + 1))
  echo "  OK [$TOTAL] $repo"
  sleep 1.5
done

echo ""
echo "=== Enhancing existing forks ==="
for entry in "${EXISTING_FORKS[@]}"; do
  IFS='|' read -r repo desc topics <<< "$entry"
  wait_for_rate_limit

  gh repo edit "$ORG/$repo" --description "$desc" 2>/dev/null || true

  topics_json=$(echo "$topics" | tr ',' '\n' | sed 's/^/"/;s/$/"/' | tr '\n' ',' | sed 's/,$//')
  gh api "/repos/$ORG/$repo/topics" --method PUT --input - <<< "{\"names\":[$topics_json]}" 2>/dev/null || true

  TOTAL=$((TOTAL + 1))
  echo "  OK [$TOTAL] $repo"
  sleep 1.5
done

echo ""
echo "=== Adding 'blackroad' topic to ALL remaining Forge repos ==="
page=1
while true; do
  repos=$(gh api "/orgs/$ORG/repos?per_page=100&page=$page" -q '.[].name' 2>/dev/null)
  if [ -z "$repos" ]; then break; fi

  while IFS= read -r repo; do
    wait_for_rate_limit

    # Get existing topics
    existing=$(gh api "/repos/$ORG/$repo/topics" -q '.names | join(",")' 2>/dev/null || echo "")

    # Skip if already has blackroad topic
    if echo "$existing" | grep -q "blackroad"; then
      continue
    fi

    # Add blackroad topic to existing ones
    if [ -n "$existing" ]; then
      all_topics="blackroad,$existing"
    else
      all_topics="blackroad,blackroad-forge,self-hosted"
    fi

    topics_json=$(echo "$all_topics" | tr ',' '\n' | sort -u | sed 's/^/"/;s/$/"/' | tr '\n' ',' | sed 's/,$//')
    gh api "/repos/$ORG/$repo/topics" --method PUT --input - <<< "{\"names\":[$topics_json]}" 2>/dev/null || true

    TOTAL=$((TOTAL + 1))
    echo "  TAG [$TOTAL] $repo"
    sleep 0.8
  done

  page=$((page + 1))
done

echo ""
echo "========================================="
echo "  FORGE ENHANCEMENT COMPLETE"
echo "  Total repos processed: $TOTAL"
echo "========================================="
echo "DONE Total=$TOTAL" >> "$LOGFILE"
