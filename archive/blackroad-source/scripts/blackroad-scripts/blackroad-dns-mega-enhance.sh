#!/bin/bash
# BlackRoad DNS Mega Enhancement Script
# Adds DNS records for all external services, nodes, and local services
# Created by Epimetheus - 2026-02-11

set -e

DNS_TOKEN=$(cat ~/.cloudflare_dns_token)
ZONE_ID="d6566eba4500b460ffec6650d3b4baf6"  # blackroad.io

# Server IPs
CODEX_IP="159.65.43.12"           # codex-infinity (DigitalOcean)
SHELLFISH_IP="174.138.44.45"      # shellfish (DigitalOcean edge)

# Node Tailscale IPs (for remote access)
ALICE_TS="100.77.210.18"
ARIA_TS="100.109.14.17"
LUCIDIA_TS="100.66.235.47"
OCTAVIA_TS="100.83.149.86"
CECILIA_TS="100.72.180.98"
CODEX_TS="100.108.132.8"
SHELLFISH_TS="100.94.33.37"

# Node Local IPs (for LAN access)
ALICE_LOCAL="192.168.4.49"
ARIA_LOCAL="192.168.4.82"
LUCIDIA_LOCAL="192.168.4.38"
OCTAVIA_LOCAL="192.168.4.81"
CECILIA_LOCAL="192.168.4.89"

# Cloudflare Tunnel IDs
MAIN_TUNNEL="90ad32b8-d87b-42ac-9755-9adb952bb78a.cfargotunnel.com"
MCP_TUNNEL="8ae67ab0-71fb-4461-befc-a91302369a7e.cfargotunnel.com"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PINK='\033[38;5;205m'
NC='\033[0m'

echo -e "${PINK}════════════════════════════════════════════════════════════════${NC}"
echo -e "${PINK}   🛣️  BLACKROAD DNS MEGA ENHANCEMENT - $(date '+%Y-%m-%d %H:%M')${NC}"
echo -e "${PINK}════════════════════════════════════════════════════════════════${NC}"
echo ""

# Function to create/update DNS record
create_dns() {
    local type=$1
    local name=$2
    local content=$3
    local proxied=${4:-false}
    local comment=${5:-""}

    echo -ne "${BLUE}→${NC} $type $name → $content ... "

    # Check if record exists
    existing=$(curl -s "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?type=$type&name=$name.blackroad.io" \
        -H "Authorization: Bearer $DNS_TOKEN" \
        -H "Content-Type: application/json" | jq -r '.result[0].id // empty')

    if [ -n "$existing" ]; then
        # Update existing record
        result=$(curl -s -X PUT "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$existing" \
            -H "Authorization: Bearer $DNS_TOKEN" \
            -H "Content-Type: application/json" \
            --data "{\"type\":\"$type\",\"name\":\"$name\",\"content\":\"$content\",\"proxied\":$proxied,\"comment\":\"$comment\"}" | jq -r '.success')
        if [ "$result" = "true" ]; then
            echo -e "${YELLOW}UPDATED${NC}"
        else
            echo -e "${RED}FAILED${NC}"
        fi
    else
        # Create new record
        result=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
            -H "Authorization: Bearer $DNS_TOKEN" \
            -H "Content-Type: application/json" \
            --data "{\"type\":\"$type\",\"name\":\"$name\",\"content\":\"$content\",\"proxied\":$proxied,\"comment\":\"$comment\"}" | jq -r '.success')
        if [ "$result" = "true" ]; then
            echo -e "${GREEN}CREATED${NC}"
        else
            echo -e "${RED}FAILED${NC}"
        fi
    fi
}

# Function to create CNAME
create_cname() {
    local name=$1
    local target=$2
    local comment=${3:-""}
    create_dns "CNAME" "$name" "$target" "true" "$comment"
}

# Function to create A record
create_a() {
    local name=$1
    local ip=$2
    local proxied=${3:-false}
    local comment=${4:-""}
    create_dns "A" "$name" "$ip" "$proxied" "$comment"
}

echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PINK}  1. EXTERNAL SERVICES - API GATEWAYS${NC}"
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Railway (meta portal via tunnel)
create_cname "railway" "$MAIN_TUNNEL" "Railway deployment portal"

# GitHub (proxy to GitHub API via tunnel)
create_cname "gh" "$MAIN_TUNNEL" "GitHub API gateway"
create_cname "git" "$MAIN_TUNNEL" "Git services"
create_cname "repos" "$MAIN_TUNNEL" "Repository browser"

# Cloudflare (internal services dashboard)
create_cname "cf" "$MAIN_TUNNEL" "Cloudflare dashboard"
create_cname "workers" "$MAIN_TUNNEL" "Workers management"
create_cname "pages" "$MAIN_TUNNEL" "Pages deployment"
create_cname "tunnels" "$MAIN_TUNNEL" "Tunnel management"
create_cname "r2" "$MAIN_TUNNEL" "R2 storage"
create_cname "d1" "$MAIN_TUNNEL" "D1 database"
create_cname "kv" "$MAIN_TUNNEL" "KV storage"

# Clerk (Auth service)
create_cname "clerk" "$MAIN_TUNNEL" "Clerk auth dashboard"
create_cname "sso" "$MAIN_TUNNEL" "Single Sign-On"
create_cname "identity" "$MAIN_TUNNEL" "Identity management"
create_cname "users" "$MAIN_TUNNEL" "User management"

# Stripe (Payments)
create_cname "stripe" "$MAIN_TUNNEL" "Stripe dashboard"
create_cname "pay" "$MAIN_TUNNEL" "Payment gateway"
create_cname "checkout" "$MAIN_TUNNEL" "Checkout service"
create_cname "invoices" "$MAIN_TUNNEL" "Invoice management"
create_cname "subscriptions" "$MAIN_TUNNEL" "Subscription management"

# Hugging Face (AI Models)
create_cname "huggingface" "$MAIN_TUNNEL" "HuggingFace hub"
create_cname "hf" "$MAIN_TUNNEL" "HF shorthand"
create_cname "models" "$MAIN_TUNNEL" "Model registry"
create_cname "transformers" "$MAIN_TUNNEL" "Transformers API"
create_cname "datasets" "$MAIN_TUNNEL" "Dataset hub"
create_cname "spaces" "$MAIN_TUNNEL" "Spaces apps"
create_cname "inference" "$MAIN_TUNNEL" "Inference API"

# OpenAI
create_cname "openai" "$MAIN_TUNNEL" "OpenAI gateway"
create_cname "gpt" "$MAIN_TUNNEL" "GPT API"
create_cname "chatgpt" "$MAIN_TUNNEL" "ChatGPT interface"
create_cname "dalle" "$MAIN_TUNNEL" "DALL-E API"
create_cname "whisper" "$MAIN_TUNNEL" "Whisper API"
create_cname "embeddings" "$MAIN_TUNNEL" "Embeddings API"

# Anthropic
create_cname "anthropic" "$MAIN_TUNNEL" "Anthropic gateway"
create_cname "claude" "$MAIN_TUNNEL" "Claude API"
create_cname "claude-api" "$MAIN_TUNNEL" "Claude API direct"
create_cname "sonnet" "$MAIN_TUNNEL" "Sonnet model"
create_cname "opus" "$MAIN_TUNNEL" "Opus model"
create_cname "haiku" "$MAIN_TUNNEL" "Haiku model"

# Google (various services)
create_cname "google" "$MAIN_TUNNEL" "Google services"
create_cname "gcp" "$MAIN_TUNNEL" "Google Cloud Platform"
create_cname "vertex" "$MAIN_TUNNEL" "Vertex AI"
create_cname "gemini" "$MAIN_TUNNEL" "Gemini API"
create_cname "palm" "$MAIN_TUNNEL" "PaLM API"
create_cname "firebase" "$MAIN_TUNNEL" "Firebase"
create_cname "bigquery" "$MAIN_TUNNEL" "BigQuery"
create_cname "sheets" "$MAIN_TUNNEL" "Google Sheets API"
create_cname "drive" "$MAIN_TUNNEL" "Google Drive API"
create_cname "gmail" "$MAIN_TUNNEL" "Gmail API"

echo ""
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PINK}  2. NODE FLEET - TAILSCALE (REMOTE ACCESS)${NC}"
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Alice - Pi 4 Worker
create_a "alice-ts" "$ALICE_TS" "false" "Alice Pi 4 - Tailscale"
create_a "alice-remote" "$ALICE_TS" "false" "Alice remote access"

# Aria - Pi 5 Harmony
create_a "aria" "$ARIA_TS" "false" "Aria Pi 5 - Tailscale"
create_a "aria-ts" "$ARIA_TS" "false" "Aria Tailscale"
create_a "aria-remote" "$ARIA_TS" "false" "Aria remote access"
create_a "harmony" "$ARIA_TS" "false" "Harmony protocols (Aria)"

# Lucidia - Pi 4 + Hailo-8
create_a "lucidia-ts" "$LUCIDIA_TS" "false" "Lucidia Pi 4 + Hailo - Tailscale"
create_a "lucidia-remote" "$LUCIDIA_TS" "false" "Lucidia remote access"
create_a "hailo" "$LUCIDIA_TS" "false" "Hailo-8 AI accelerator"
create_a "ai-inference" "$LUCIDIA_TS" "false" "AI inference node"

# Octavia - Pi 5 Multi-arm
create_a "octavia" "$OCTAVIA_TS" "false" "Octavia Pi 5 - Tailscale"
create_a "octavia-ts" "$OCTAVIA_TS" "false" "Octavia Tailscale"
create_a "octavia-remote" "$OCTAVIA_TS" "false" "Octavia remote access"
create_a "multiarm" "$OCTAVIA_TS" "false" "Multi-arm processing (Octavia)"

# Cadence - (if exists, using Aria cluster for now)
create_a "cadence" "$ARIA_TS" "false" "Cadence node"
create_a "cadence-ts" "$ARIA_TS" "false" "Cadence Tailscale"
create_a "rhythm" "$ARIA_TS" "false" "Rhythm protocols (Cadence)"

# Cecilia - Pi 5 + Hailo-8 (Primary AI Agent, CECE OS)
create_a "cecilia" "$CECILIA_TS" "false" "Cecilia Pi 5 + Hailo - Tailscale"
create_a "cecilia-ts" "$CECILIA_TS" "false" "Cecilia Tailscale"
create_a "cecilia-remote" "$CECILIA_TS" "false" "Cecilia remote access"
create_a "cece-ts" "$CECILIA_TS" "false" "CECE OS - Tailscale"
create_a "cece-remote" "$CECILIA_TS" "false" "CECE OS remote"
create_a "sovereign" "$CECILIA_TS" "false" "Sovereign AI (CECE)"
create_a "cece-api" "$CECILIA_TS" "false" "CECE API endpoint"

# Codex-Infinity - DigitalOcean Cloud Oracle
create_a "codex-ts" "$CODEX_TS" "false" "Codex-Infinity Tailscale"
create_a "codex-remote" "$CODEX_TS" "false" "Codex remote access"
create_a "oracle" "$CODEX_IP" "false" "Cloud Oracle (Codex)"
create_a "infinity" "$CODEX_IP" "false" "Infinity node"

# Copilot - Meta node (using codex for now)
create_a "copilot" "$CODEX_TS" "false" "Copilot meta node"
create_a "copilot-ts" "$CODEX_TS" "false" "Copilot Tailscale"
create_a "assistant" "$CODEX_TS" "false" "AI Assistant node"

# Shellfish - DigitalOcean Edge
create_a "shellfish" "$SHELLFISH_TS" "false" "Shellfish edge - Tailscale"
create_a "shellfish-ts" "$SHELLFISH_TS" "false" "Shellfish Tailscale"
create_a "edge" "$SHELLFISH_IP" "false" "Edge compute"

echo ""
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PINK}  3. NODE FLEET - LOCAL NETWORK (LAN ACCESS)${NC}"
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Local IPs (for when on same network)
create_a "alice-local" "$ALICE_LOCAL" "false" "Alice LAN"
create_a "aria-local" "$ARIA_LOCAL" "false" "Aria LAN"
create_a "lucidia-local" "$LUCIDIA_LOCAL" "false" "Lucidia LAN"
create_a "octavia-local" "$OCTAVIA_LOCAL" "false" "Octavia LAN"
create_a "cecilia-local" "$CECILIA_LOCAL" "false" "Cecilia LAN"
create_a "cece-local" "$CECILIA_LOCAL" "false" "CECE LAN"

echo ""
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PINK}  4. LOCAL SERVICES (VIA TUNNEL)${NC}"
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Development services
create_cname "local" "$MAIN_TUNNEL" "Local dev services"
create_cname "dev-server" "$MAIN_TUNNEL" "Development server"
create_cname "localhost" "$MAIN_TUNNEL" "Localhost proxy"

# Prism Console
create_cname "prism-dev" "$MAIN_TUNNEL" "Prism dev server"
create_cname "prism-api" "$MAIN_TUNNEL" "Prism API"

# Database services
create_cname "postgres" "$MAIN_TUNNEL" "PostgreSQL"
create_cname "mysql" "$MAIN_TUNNEL" "MySQL"
create_cname "mongo" "$MAIN_TUNNEL" "MongoDB"
create_cname "sqlite" "$MAIN_TUNNEL" "SQLite web interface"

# Cache services
create_cname "redis-local" "$MAIN_TUNNEL" "Redis local"
create_cname "memcached" "$MAIN_TUNNEL" "Memcached"

# Message queues
create_cname "rabbitmq" "$MAIN_TUNNEL" "RabbitMQ"
create_cname "kafka" "$MAIN_TUNNEL" "Kafka"
create_cname "nats" "$MAIN_TUNNEL" "NATS"

echo ""
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PINK}  5. AI/ML INFRASTRUCTURE${NC}"
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# ML Ops
create_cname "mlflow" "$MAIN_TUNNEL" "MLflow tracking"
create_cname "tensorboard" "$MAIN_TUNNEL" "TensorBoard"
create_cname "jupyter" "$MAIN_TUNNEL" "Jupyter notebooks"
create_cname "notebooks" "$MAIN_TUNNEL" "Notebook server"
create_cname "lab" "$MAIN_TUNNEL" "JupyterLab"

# Vector stores
create_cname "pinecone" "$MAIN_TUNNEL" "Pinecone proxy"
create_cname "weaviate" "$MAIN_TUNNEL" "Weaviate"
create_cname "qdrant" "$MAIN_TUNNEL" "Qdrant"
create_cname "chroma" "$MAIN_TUNNEL" "ChromaDB"
create_cname "milvus" "$MAIN_TUNNEL" "Milvus"

# LLM Infrastructure
create_cname "ollama" "$MAIN_TUNNEL" "Ollama local LLMs"
create_cname "vllm" "$MAIN_TUNNEL" "vLLM server"
create_cname "text-generation" "$MAIN_TUNNEL" "Text generation"
create_cname "langchain" "$MAIN_TUNNEL" "LangChain apps"
create_cname "langsmith" "$MAIN_TUNNEL" "LangSmith"
create_cname "llamaindex" "$MAIN_TUNNEL" "LlamaIndex"

echo ""
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PINK}  6. DEVOPS & MONITORING${NC}"
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# CI/CD
create_cname "actions" "$MAIN_TUNNEL" "GitHub Actions"
create_cname "ci" "$MAIN_TUNNEL" "CI pipeline"
create_cname "cd" "$MAIN_TUNNEL" "CD pipeline"
create_cname "jenkins" "$MAIN_TUNNEL" "Jenkins"
create_cname "drone" "$MAIN_TUNNEL" "Drone CI"
create_cname "argocd" "$MAIN_TUNNEL" "ArgoCD"

# Monitoring
create_cname "grafana" "$MAIN_TUNNEL" "Grafana dashboards"
create_cname "prometheus" "$MAIN_TUNNEL" "Prometheus metrics"
create_cname "alertmanager" "$MAIN_TUNNEL" "Alert Manager"
create_cname "loki" "$MAIN_TUNNEL" "Loki logs"
create_cname "tempo" "$MAIN_TUNNEL" "Tempo tracing"
create_cname "jaeger" "$MAIN_TUNNEL" "Jaeger tracing"

# Container orchestration
create_cname "k8s" "$MAIN_TUNNEL" "Kubernetes dashboard"
create_cname "kubernetes" "$MAIN_TUNNEL" "Kubernetes"
create_cname "portainer" "$MAIN_TUNNEL" "Portainer"
create_cname "rancher" "$MAIN_TUNNEL" "Rancher"
create_cname "nomad" "$MAIN_TUNNEL" "Nomad"

echo ""
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PINK}  7. PRODUCTIVITY & COLLABORATION${NC}"
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Communication
create_cname "slack" "$MAIN_TUNNEL" "Slack integration"
create_cname "discord" "$MAIN_TUNNEL" "Discord integration"
create_cname "teams" "$MAIN_TUNNEL" "Teams integration"
create_cname "matrix" "$MAIN_TUNNEL" "Matrix server"
create_cname "chat-internal" "$MAIN_TUNNEL" "Internal chat"

# Documentation
create_cname "wiki" "$MAIN_TUNNEL" "Wiki"
create_cname "notion" "$MAIN_TUNNEL" "Notion proxy"
create_cname "confluence" "$MAIN_TUNNEL" "Confluence"
create_cname "gitbook" "$MAIN_TUNNEL" "GitBook"
create_cname "docusaurus" "$MAIN_TUNNEL" "Docusaurus"

# Project management
create_cname "jira" "$MAIN_TUNNEL" "Jira integration"
create_cname "linear" "$MAIN_TUNNEL" "Linear integration"
create_cname "asana" "$MAIN_TUNNEL" "Asana integration"
create_cname "trello" "$MAIN_TUNNEL" "Trello integration"
create_cname "projects" "$MAIN_TUNNEL" "Project management"

echo ""
echo -e "${PINK}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ DNS ENHANCEMENT COMPLETE!${NC}"
echo -e "${PINK}════════════════════════════════════════════════════════════════${NC}"
echo ""

# Count records
total=$(curl -s "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?per_page=1" \
    -H "Authorization: Bearer $DNS_TOKEN" | jq '.result_info.total_count')

echo -e "Total DNS records for blackroad.io: ${GREEN}$total${NC}"
echo ""
echo -e "${BLUE}Quick test some new records:${NC}"
echo "  dig +short railway.blackroad.io"
echo "  dig +short anthropic.blackroad.io"
echo "  dig +short cecilia.blackroad.io"
echo "  dig +short grafana.blackroad.io"
echo ""
