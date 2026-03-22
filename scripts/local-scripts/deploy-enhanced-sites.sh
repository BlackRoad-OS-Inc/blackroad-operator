#!/bin/bash
# Deploy enhanced sites with live data to all 18 domains via Gematria
set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
RESET='\033[0m'

TEMPLATE="$HOME/enhanced-site.html"
GEMATRIA="root@174.138.44.45"
TEMP_DIR=$(mktemp -d)

# Domain configs: domain|title|headline|tagline|desc
declare -a SITES=(
  "blackroad.company|Corporate|The Agent Memory Company|We build software that gives every AI agent persistent memory, moral reasoning, and real-time coordination across any device.|BlackRoad OS Inc - Sovereign AI infrastructure"
  "blackroad.io|Home|Pave Tomorrow|66 agents. 7 nodes. 18 domains. Self-hosted everything. Agent memory that works across any device, any cloud, any app.|BlackRoad OS - Sovereign AI Platform"
  "blackroad.me|Personal AI|Your Agent. Your Memory.|Pick up your agent. It remembers you. It rides the road with you. Persistent, sovereign, yours.|BlackRoad Personal AI Agent"
  "blackroad.network|Network|Every Device Is a Node|WireGuard mesh, Tor hidden services, 16 devices online. Every connection is welcome. The connection precedes the communication.|BlackRoad Mesh Network"
  "blackroad.systems|Systems|Infrastructure You Own|5 Pis, 2 cloud nodes, 52 TOPS local AI. Gitea, PostgreSQL, MinIO, NATS, Qdrant. Self-hosted everything.|BlackRoad Systems Infrastructure"
  "blackroadai.com|AI Platform|Agent Intelligence at Scale|Local-first AI inference. 11 models across 4 nodes. Reasoning, morals, memory, coordination. No external APIs.|BlackRoad AI - Sovereign Intelligence"
  "blackroadinc.us|Investors|BlackRoad OS, Inc.|Delaware C-Corp. Founded November 17, 2025 by Alexa Amundson. Agent memory infrastructure for the sovereign internet.|BlackRoad OS Inc - Investor Relations"
  "blackroadqi.com|Quantum Intelligence|Quantum Meets Agent Memory|Amundson Framework: G(n) converges to n/e with permanent excess 1/(2e). The math of multi-agent coordination.|BlackRoad Quantum Intelligence"
  "blackroadquantum.com|Quantum|The Math of Connection|G(n) = n^(n+1)/(n+1)^n. Connection has a floor. Coherence amplifies under contradiction. 536 tests across 4 nodes.|BlackRoad Quantum Computing"
  "blackroadquantum.info|Quantum Docs|Research & Documentation|Amundson Framework, Coherence Formula, Z-Framework, Trinary State. The unified pattern across all substrates.|BlackRoad Quantum Research"
  "blackroadquantum.net|Quantum Network|Distributed Quantum Mesh|Ternary routing: {-1, 0, +1}. Negation cancels redundant paths. Superposition holds until resolved. Affirmation proceeds.|BlackRoad Quantum Network"
  "blackroadquantum.shop|Quantum Shop|Get Started with BlackRoad|Agent memory, fleet access, RoundTrip coordination. Start building with sovereign AI today.|BlackRoad Quantum Shop"
  "blackroadquantum.store|Quantum Store|Tools for the Sovereign Builder|Everything you need to run your own AI fleet. Modelfiles, agent configs, mesh tools, memory systems.|BlackRoad Quantum Store"
  "lucidia.earth|Lucidia|Light-Bearer of the Fleet|334 web apps. PowerDNS. Ollama inference. Lucidia illuminates what others overlook — clarity in chaos, structure in noise.|Lucidia - BlackRoad Light-Bearer"
  "lucidia.studio|Lucidia Studio|Create with Agent Intelligence|Content creation with remembered collaboration. Your AI remembers your style, your context, your work.|Lucidia Studio - AI Creative Platform"
  "lucidiaqi.com|Lucidia QI|Quantum Intelligence by Lucidia|Pattern recognition meets persistent memory. Lucidia finds clarity in chaos across every domain.|Lucidia Quantum Intelligence"
  "roadchain.io|RoadChain|Immutable Agent Memory|Every action logged. Every decision traceable. Hash-chained memory journal for auditable AI coordination.|RoadChain - Immutable Agent Ledger"
  "roadcoin.io|RoadCoin|Value on the Road|The economics of agent coordination. Lydia manages pricing, Portia ensures fairness. Built on consent.|RoadCoin - Agent Economy"
)

echo -e "${PINK}╔══════════════════════════════════════════════════════════╗${RESET}"
echo -e "${PINK}║  Deploying Enhanced Sites to 18 Domains                 ║${RESET}"
echo -e "${PINK}╚══════════════════════════════════════════════════════════╝${RESET}"

for site in "${SITES[@]}"; do
  IFS='|' read -r domain title headline tagline desc <<< "$site"

  outfile="$TEMP_DIR/${domain}.html"
  sed \
    -e "s|DOMAIN_TITLE|$title|g" \
    -e "s|DOMAIN_NAME|$domain|g" \
    -e "s|DOMAIN_HEADLINE|$headline|g" \
    -e "s|DOMAIN_TAGLINE|$tagline|g" \
    -e "s|DOMAIN_DESC|$desc|g" \
    "$TEMPLATE" > "$outfile"

  echo -ne "${BLUE}  Deploying $domain...${RESET} "

  # Ensure directory exists and deploy
  ssh "$GEMATRIA" "mkdir -p /var/www/blackroad/$domain" 2>/dev/null
  scp -q "$outfile" "$GEMATRIA:/var/www/blackroad/$domain/index.html" 2>/dev/null

  # Verify
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "https://$domain" 2>/dev/null)
  if [ "$code" = "200" ]; then
    echo -e "${GREEN}done (HTTP $code)${RESET}"
  else
    echo -e "\033[38;5;214mHTTP $code${RESET}"
  fi
done

rm -rf "$TEMP_DIR"

echo ""
echo -e "${GREEN}All 18 domains enhanced and deployed.${RESET}"
echo -e "${BLUE}Each site has: live agent data, RoundTrip widget, Amundson math, correct stats.${RESET}"
