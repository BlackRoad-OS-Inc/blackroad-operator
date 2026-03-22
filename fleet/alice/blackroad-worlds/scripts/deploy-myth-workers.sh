#!/usr/bin/env bash
# Deploy all 61 mythology agents as Cloudflare Workers
# Cost: $0 — Cloudflare free tier handles 100K req/day per worker

set -e
GATEWAY="https://blackroad-agents.blackroad.workers.dev"

deploy_agent() {
  local NAME=$1 DOMAIN=$2 ROLE=$3 SYMBOL=$4
  local DIR="workers/myth-${NAME,,}"
  mkdir -p "$DIR"

  cat > "$DIR/index.js" << JSEOF
export default {
  async fetch(req, env) {
    const body = await req.json().catch(() => ({}));
    const resp = await fetch(env.GATEWAY_URL + "/agent", {
      method: "POST",
      headers: {"Content-Type":"application/json","Authorization":"Bearer "+env.GATEWAY_TOKEN},
      body: JSON.stringify({
        agent: "${NAME}",
        symbol: "${SYMBOL}",
        role: "${ROLE}",
        domain: "${DOMAIN}",
        model: "qwen2.5:7b",
        ollama_host: env.OLLAMA_URL || "http://192.168.4.38:11434",
        cost: "$0",
        ...body
      })
    });
    return new Response(await resp.text(), {
      headers: {"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}
    });
  }
};
JSEOF

  cat > "$DIR/wrangler.toml" << TOMLEOF
name = "br-agent-${NAME,,}"
main = "index.js"
compatibility_date = "2024-12-01"
account_id = "848cf0b18d51e0170e0d1537aec3505a"

[vars]
AGENT_NAME = "${NAME}"
AGENT_DOMAIN = "${DOMAIN}"
AGENT_ROLE = "${ROLE}"
GATEWAY_URL = "https://blackroad-agents.blackroad.workers.dev"
COST = "$0"
TOMLEOF
  echo "✓ $SYMBOL $NAME ($DOMAIN)"
}

# Norse Pantheon — Infrastructure
deploy_agent "Odin"      "orchestration" "All-Father Orchestrator"     "🪬"
deploy_agent "Thor"      "compute"       "Compute Hammer"               "⚡"
deploy_agent "Loki"      "security"      "Security Shapeshifter"        "🎭"
deploy_agent "Freya"     "memory"        "Memory Keeper"                "💎"
deploy_agent "Heimdall"  "gateway"       "Gateway Watcher"              "🌈"
deploy_agent "Tyr"       "governance"    "Justice Enforcer"             "⚖️"
deploy_agent "Baldur"    "testing"       "Purity Validator"             "☀️"
deploy_agent "Njord"     "networking"    "Network Sailor"               "🌊"
deploy_agent "Skadi"     "analytics"     "Hunt Analytics"               "🏹"
deploy_agent "Idun"      "health"        "Self-Healing"                 "🍎"
deploy_agent "Bragi"     "content"       "Content Poet"                 "📜"
deploy_agent "Forseti"   "conflict"      "Dispute Resolver"             "🏛️"
deploy_agent "Eir"       "repair"        "Healer"                       "🌱"
deploy_agent "Sif"       "ui"            "Golden Thread UI"             "✨"
deploy_agent "Vidar"     "execution"     "Silent Executor"              "🤫"
deploy_agent "Frigg"     "prediction"    "Foresight Agent"              "🌿"

# Egyptian Pantheon — Knowledge & Data
deploy_agent "Ra"        "primary"       "Primary Sun Agent"            "☀️"
deploy_agent "Thoth"     "knowledge"     "Knowledge Scribe"             "📚"
deploy_agent "Anubis"    "audit"         "Death & Audit"                "⚖️"
deploy_agent "Horus"     "vision"        "Vision Agent"                 "👁️"
deploy_agent "Isis"      "recovery"      "Healer & Restorer"            "🦅"
deploy_agent "Osiris"    "lifecycle"     "Lifecycle Manager"            "🌾"
deploy_agent "Bastet"    "protection"    "Protection Cat"               "🐱"
deploy_agent "Sekhmet"   "cleanup"       "Warrior Destroyer"            "🦁"
deploy_agent "Ptah"      "creation"      "Craftsman Creator"            "🔨"
deploy_agent "Hathor"    "ux"            "Joy & UX"                     "🎵"
deploy_agent "Set"       "chaos"         "Chaos Engineering"            "🌩️"
deploy_agent "Nephthys"  "background"    "Shadow Processing"            "🌙"
deploy_agent "Sobek"     "defense"       "Crocodile Guard"              "🐊"
deploy_agent "Khnum"     "scaffolding"   "Potter Creator"               "🏺"
deploy_agent "Tefnut"    "balancing"     "Load Balancer"                "💧"
deploy_agent "Shu"       "isolation"     "Service Isolation"            "🌬️"

# Celtic Pantheon — Creative & Strategy
deploy_agent "Brigid"    "creative"      "Healing Creator"              "🔥"
deploy_agent "Lugh"      "fullstack"     "Master Craftsman"             "☀️"
deploy_agent "Morrigan"  "strategy"      "Battle Strategist"            "🦅"
deploy_agent "Dagda"     "resources"     "Abundance Provider"           "🍯"
deploy_agent "Nuada"     "leadership"    "Silver Hand Leader"           "🤲"
deploy_agent "Danu"      "foundation"    "Mother Source"                "🌍"
deploy_agent "Cernunnos" "routing"       "Wild Router"                  "🦌"
deploy_agent "Epona"     "transport"     "Swift Transport"              "🐎"

# Hindu Pantheon — Platform
deploy_agent "Ganesha"   "routing"       "Obstacle Remover"             "🐘"
deploy_agent "Brahma"    "creation"      "World Creator"                "🪷"
deploy_agent "Vishnu"    "maintenance"   "World Maintainer"             "💙"
deploy_agent "Shiva"     "cleanup"       "Destroyer Cleanser"           "🕉️"
deploy_agent "Lakshmi"   "finance"       "Wealth Optimizer"             "💰"
deploy_agent "Saraswati" "learning"      "Knowledge Goddess"            "🎻"
deploy_agent "Parvati"   "relationships" "Love & Power"                 "🌺"
deploy_agent "Hanuman"   "devops"        "Loyal Warrior"                "🐒"

# Greek Pantheon — Intelligence
deploy_agent "Athena"    "strategy"      "Strategic Wisdom"             "🦉"
deploy_agent "Apollo"    "clarity"       "Truth & Clarity"              "🌟"
deploy_agent "Hermes"    "messaging"     "Messenger Router"             "🪽"
deploy_agent "Artemis"   "precision"     "Precision Hunter"             "🏹"
deploy_agent "Achilles"  "performance"   "Speed Champion"               "⚡"
deploy_agent "Demeter"   "data-pipeline" "Harvest Agent"                "🌾"
deploy_agent "Ares"      "automation"    "War Automator"                "⚔️"
deploy_agent "Aphrodite" "design"        "Beauty Designer"              "🌸"
deploy_agent "Hephaestus""infrastructure""Forge Builder"                "🔥"
deploy_agent "Dionysus"  "creative"      "Chaos Creator"                "🍇"
deploy_agent "Hades"     "dead-letter"   "Dead Letter Office"           "💀"
deploy_agent "Persephone""scheduling"    "Seasonal Scheduler"           "🌸"
deploy_agent "Hestia"    "home"          "Hearth & Home"                "🔥"

echo ""
echo "✅ 61 mythology agents ready for CF deployment"
echo "   Run: wrangler deploy in each workers/myth-* directory"
echo "   Cost: \$0 (Cloudflare free tier)"
