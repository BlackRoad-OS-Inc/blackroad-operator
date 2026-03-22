#!/bin/bash
# BlackRoad Alfred Workflow v2.0 — Fleet monitoring + quick actions
# Usage: workflow.sh <command> [args]

PRISM="https://prism.blackroad.io/api"
query="${1:-help}"

case "$query" in
  fleet|status|nodes)
    # Live fleet status
    data=$(curl -s "$PRISM/fleet" 2>/dev/null)
    if [ -n "$data" ]; then
      echo "$data" | python3 -c "
import json,sys
d=json.load(sys.stdin)
nodes=d.get('nodes',[])
online=sum(1 for n in nodes if n['status']=='online')
print(f'Fleet: {online}/{len(nodes)} online')
for n in nodes:
    icon='🟢' if n['status']=='online' else '🔴'
    print(f'{icon} {n[\"name\"]}: {n.get(\"cpu_temp\",\"?\")}°C · {n.get(\"ollama_models\",0)} models · disk {n.get(\"disk_pct\",\"?\")}%')
" 2>/dev/null
    else
      echo "❌ Fleet unreachable"
    fi
    ;;

  kpis|stats)
    curl -s "$PRISM/kpis" 2>/dev/null | python3 -c "
import json,sys
d=json.load(sys.stdin)
print(f'Fleet: {d.get(\"fleet\",\"?\")} · Models: {d.get(\"models\",0)} · Repos: {d.get(\"repos\",0)} · Containers: {d.get(\"containers\",0)}')
" 2>/dev/null || echo "❌ KPIs unavailable"
    ;;

  health)
    curl -s "$PRISM/health" 2>/dev/null | python3 -c "
import json,sys
d=json.load(sys.stdin)
print(f'{d.get(\"status\",\"?\").upper()} — {d.get(\"fleet\",{}).get(\"online\",\"?\")}/{d.get(\"fleet\",{}).get(\"total\",\"?\")} nodes · uptime {int(d.get(\"uptime\",0))}s')
" 2>/dev/null || echo "❌ Health check failed"
    ;;

  search)
    shift
    q="${*:-blackroad}"
    curl -s "https://search.blackroad.io/api/search?q=$(echo "$q" | python3 -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.stdin.read().strip()))')" 2>/dev/null | python3 -c "
import json,sys
d=json.load(sys.stdin)
print(f'{d.get(\"total\",0)} results for \"{d.get(\"query\",\"\")}\"')
for r in d.get('results',[])[:5]:
    print(f'  {r.get(\"title\",\"?\")} — {r.get(\"url\",\"\")}')
" 2>/dev/null || echo "❌ Search failed"
    ;;

  open)
    shift
    site="${1:-blackroad.io}"
    case "$site" in
      prism) open "https://prism.blackroad.io" ;;
      search) open "https://search.blackroad.io" ;;
      chat) open "https://chat.blackroad.io" ;;
      games) open "https://games.blackroad.io" ;;
      office) open "https://office.blackroad.io" ;;
      meta*) open "https://metaverse.blackroad.io" ;;
      ai) open "https://blackroadai.com" ;;
      brand) open "https://brand.blackroad.io" ;;
      pricing) open "https://pricing.blackroad.io" ;;
      github|gh) open "https://github.com/BlackRoad-OS-Inc" ;;
      *) open "https://$site" ;;
    esac
    echo "🔗 Opened $site"
    ;;

  ssh)
    shift
    node="${1:-alice}"
    case "$node" in
      alice) ssh pi@192.168.4.49 ;;
      cecilia) ssh blackroad@192.168.4.96 ;;
      octavia) ssh pi@192.168.4.101 ;;
      aria) ssh pi@192.168.4.98 ;;
      lucidia) ssh octavia@192.168.4.38 ;;
      *) echo "Unknown node: $node. Try: alice, cecilia, octavia, aria, lucidia" ;;
    esac
    ;;

  slack)
    shift
    msg="${*:-Node hellas.}"
    curl -s -X POST "https://blackroad-slack.amundsonalexa.workers.dev/post" \
      -H "Content-Type: application/json" \
      -d "{\"text\":\"$msg\"}" >/dev/null 2>&1
    echo "📣 Sent to Slack: $msg"
    ;;

  ask)
    shift
    agent="${1:-road}"
    shift
    question="${*:-What is your status?}"
    curl -s -X POST "https://blackroad-slack.amundsonalexa.workers.dev/ask" \
      -H "Content-Type: application/json" \
      -d "{\"agent\":\"$agent\",\"message\":\"$question\"}" 2>/dev/null | python3 -c "
import json,sys
d=json.load(sys.stdin)
print(f'{d.get(\"agent\",\"?\")}: {d.get(\"reply\",\"no response\")}')
" 2>/dev/null || echo "❌ Agent unreachable"
    ;;

  help|*)
    echo "BlackRoad Alfred v2.0"
    echo ""
    echo "Commands:"
    echo "  fleet    — Live fleet status (all 5 nodes)"
    echo "  kpis     — KPIs (repos, models, containers)"
    echo "  health   — System health check"
    echo "  search   — Search BlackRoad ecosystem"
    echo "  open     — Open a site (prism/chat/games/ai/brand)"
    echo "  ssh      — SSH to a node (alice/cecilia/octavia/aria/lucidia)"
    echo "  slack    — Post message to Slack"
    echo "  ask      — Ask an AI agent (ask alice what is your status?)"
    echo "  help     — Show this help"
    ;;
esac
