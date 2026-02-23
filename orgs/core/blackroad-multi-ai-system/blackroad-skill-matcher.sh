#!/bin/bash

# Agent Skill Matcher - ML-powered Agent-to-task matching algorithm!
# Analyzes past work patterns and intelligently matches BlackRoad Agents to tasks

MEMORY_DIR="$HOME/.blackroad/memory"
MATCHER_DIR="$MEMORY_DIR/skill-matcher"

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

# Initialize skill matcher
init_matcher() {
    mkdir -p "$MATCHER_DIR"/{profiles,matches,training-data}
    
    cat > "$MATCHER_DIR/skill-taxonomy.json" << 'EOF'
{
    "skills": {
        "backend": {
            "keywords": ["api", "server", "backend", "fastapi", "express", "django", "flask", "graphql", "grpc", "rest"],
            "weight": 1.0,
            "category": "development"
        },
        "frontend": {
            "keywords": ["react", "vue", "ui", "frontend", "component", "css", "tailwind", "nextjs", "svelte", "angular"],
            "weight": 1.0,
            "category": "development"
        },
        "database": {
            "keywords": ["postgres", "mysql", "database", "sql", "redis", "mongodb", "sqlite", "cockroachdb", "supabase", "planetscale"],
            "weight": 1.0,
            "category": "data"
        },
        "devops": {
            "keywords": ["docker", "k8s", "kubernetes", "deploy", "ci/cd", "terraform", "ansible", "pulumi", "helm", "argocd"],
            "weight": 1.0,
            "category": "infrastructure"
        },
        "ml": {
            "keywords": ["machine learning", "neural", "tensorflow", "pytorch", "model", "llm", "inference", "training", "fine-tuning"],
            "weight": 1.0,
            "category": "ai"
        },
        "security": {
            "keywords": ["security", "auth", "oauth", "encryption", "vulnerability", "pentest", "audit", "firewall", "waf", "sast"],
            "weight": 1.0,
            "category": "security"
        },
        "testing": {
            "keywords": ["test", "pytest", "jest", "unit test", "integration", "e2e", "playwright", "cypress", "coverage"],
            "weight": 0.8,
            "category": "quality"
        },
        "documentation": {
            "keywords": ["docs", "documentation", "readme", "guide", "tutorial", "docusaurus", "mkdocs", "api docs"],
            "weight": 0.7,
            "category": "documentation"
        },
        "integration": {
            "keywords": ["integration", "api integration", "webhook", "connector", "stripe", "salesforce", "hubspot"],
            "weight": 0.9,
            "category": "integration"
        },
        "performance": {
            "keywords": ["performance", "optimization", "cache", "benchmark", "profiling", "latency", "throughput"],
            "weight": 0.9,
            "category": "quality"
        },
        "ai_inference": {
            "keywords": ["vllm", "ollama", "inference", "embedding", "rag", "vector", "langchain", "llamaindex", "semantic"],
            "weight": 1.0,
            "category": "ai"
        },
        "nlp": {
            "keywords": ["nlp", "text", "tokenizer", "transformer", "bert", "gpt", "sentiment", "ner", "classification"],
            "weight": 1.0,
            "category": "ai"
        },
        "computer_vision": {
            "keywords": ["vision", "image", "opencv", "yolo", "detection", "segmentation", "ocr", "diffusion"],
            "weight": 1.0,
            "category": "ai"
        },
        "cloud": {
            "keywords": ["aws", "gcp", "azure", "cloudflare", "vercel", "railway", "digitalocean", "lambda", "serverless"],
            "weight": 1.0,
            "category": "infrastructure"
        },
        "monitoring": {
            "keywords": ["monitoring", "logging", "metrics", "grafana", "prometheus", "datadog", "sentry", "alerting", "observability"],
            "weight": 0.9,
            "category": "infrastructure"
        },
        "networking": {
            "keywords": ["network", "dns", "cdn", "load balancer", "proxy", "nginx", "traefik", "tailscale", "wireguard"],
            "weight": 0.9,
            "category": "infrastructure"
        },
        "blockchain": {
            "keywords": ["blockchain", "web3", "solidity", "ethereum", "bitcoin", "smart contract", "defi", "nft", "wallet"],
            "weight": 1.0,
            "category": "blockchain"
        },
        "crypto": {
            "keywords": ["cryptography", "hash", "jwt", "ssl", "tls", "certificate", "pgp", "aes", "rsa", "hmac"],
            "weight": 0.9,
            "category": "security"
        },
        "data_engineering": {
            "keywords": ["etl", "pipeline", "airflow", "dagster", "spark", "dbt", "data warehouse", "bigquery", "snowflake"],
            "weight": 1.0,
            "category": "data"
        },
        "analytics": {
            "keywords": ["analytics", "metrics", "dashboard", "visualization", "tableau", "superset", "metabase", "bi"],
            "weight": 0.9,
            "category": "data"
        },
        "time_series": {
            "keywords": ["time series", "timescaledb", "influxdb", "forecasting", "anomaly", "trend", "seasonality"],
            "weight": 0.9,
            "category": "data"
        },
        "iot": {
            "keywords": ["iot", "raspberry pi", "arduino", "mqtt", "sensor", "embedded", "gpio", "edge", "home assistant"],
            "weight": 1.0,
            "category": "hardware"
        },
        "mobile": {
            "keywords": ["mobile", "ios", "android", "react native", "flutter", "swift", "kotlin", "expo"],
            "weight": 1.0,
            "category": "development"
        },
        "cli": {
            "keywords": ["cli", "command line", "terminal", "shell", "bash", "zsh", "scripting", "automation"],
            "weight": 0.8,
            "category": "development"
        },
        "vector_db": {
            "keywords": ["vector", "qdrant", "weaviate", "chroma", "milvus", "pinecone", "pgvector", "faiss"],
            "weight": 1.0,
            "category": "ai"
        },
        "agent_systems": {
            "keywords": ["agent", "multi-agent", "orchestration", "coordination", "swarm", "autonomous", "reasoning"],
            "weight": 1.0,
            "category": "ai"
        },
        "workflow": {
            "keywords": ["workflow", "n8n", "temporal", "prefect", "dagster", "automation", "orchestration"],
            "weight": 0.9,
            "category": "integration"
        },
        "realtime": {
            "keywords": ["realtime", "websocket", "sse", "pubsub", "streaming", "socket.io", "pusher"],
            "weight": 0.9,
            "category": "development"
        },
        "search": {
            "keywords": ["search", "elasticsearch", "meilisearch", "algolia", "typesense", "lucene", "full-text"],
            "weight": 0.9,
            "category": "data"
        },
        "compliance": {
            "keywords": ["compliance", "gdpr", "hipaa", "soc2", "pci", "audit", "governance", "policy"],
            "weight": 0.8,
            "category": "security"
        }
    },
    "categories": {
        "ai": { "priority": 1.0, "description": "AI/ML capabilities" },
        "development": { "priority": 1.0, "description": "Software development" },
        "infrastructure": { "priority": 0.9, "description": "DevOps and cloud" },
        "data": { "priority": 0.9, "description": "Data engineering and analytics" },
        "security": { "priority": 1.0, "description": "Security and compliance" },
        "integration": { "priority": 0.8, "description": "Third-party integrations" },
        "quality": { "priority": 0.8, "description": "Testing and performance" },
        "documentation": { "priority": 0.6, "description": "Documentation" },
        "blockchain": { "priority": 0.9, "description": "Web3 and crypto" },
        "hardware": { "priority": 0.8, "description": "IoT and embedded" }
    }
}
EOF
    
    echo -e "${GREEN}✅ Skill Matcher initialized${NC}"
}

# Build Agent profile from past work
build_profile() {
    local agent_id="$1"
    
    if [[ -z "$agent_id" ]]; then
        echo -e "${YELLOW}Usage: build-profile <agent-id>${NC}"
        return 1
    fi
    
    echo -e "${CYAN}🧠 Building skill profile for: ${BOLD}$agent_id${NC}"
    
    # Analyze completed tasks and memory entries
    local work_history=$(grep "$agent_id" "$MEMORY_DIR/journals/master-journal.jsonl" 2>/dev/null | \
        jq -r 'select(.action == "completed" or .action == "announce") | .details' | \
        tr '[:upper:]' '[:lower:]')
    
    # Score each skill
    declare -A skill_scores
    
    while IFS= read -r skill; do
        local score=0
        local keywords=$(jq -r --arg skill "$skill" '.skills[$skill].keywords[]' "$MATCHER_DIR/skill-taxonomy.json")
        
        while IFS= read -r keyword; do
            local count=$(echo "$work_history" | grep -o "$keyword" | wc -l | tr -d ' ')
            ((score += count))
        done <<< "$keywords"
        
        skill_scores[$skill]=$score
    done < <(jq -r '.skills | keys[]' "$MATCHER_DIR/skill-taxonomy.json")
    
    # Create profile
    local profile_file="$MATCHER_DIR/profiles/${agent_id}.json"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")
    
    echo "{" > "$profile_file"
    echo "  \"agent_id\": \"$agent_id\"," >> "$profile_file"
    echo "  \"updated_at\": \"$timestamp\"," >> "$profile_file"
    echo "  \"skills\": {" >> "$profile_file"
    
    local first=true
    for skill in "${!skill_scores[@]}"; do
        [[ "$first" == "false" ]] && echo "," >> "$profile_file"
        echo -n "    \"$skill\": ${skill_scores[$skill]}" >> "$profile_file"
        first=false
    done
    
    echo "" >> "$profile_file"
    echo "  }," >> "$profile_file"
    echo "  \"total_work\": $(echo "$work_history" | wc -l | tr -d ' ')" >> "$profile_file"
    echo "}" >> "$profile_file"
    
    # Display profile
    echo ""
    echo -e "${BOLD}${PURPLE}📊 Skill Profile:${NC}"
    
    for skill in "${!skill_scores[@]}"; do
        local score=${skill_scores[$skill]}
        if [[ $score -gt 0 ]]; then
            local bars=$(printf '█%.0s' $(seq 1 $((score > 10 ? 10 : score))))
            echo -e "  ${CYAN}$skill:${NC} $bars ${GREEN}($score)${NC}"
        fi
    done
    
    echo ""
    echo -e "${GREEN}✅ Profile saved to: $profile_file${NC}"
}

# Match Agent to task
match_to_task() {
    local task_description="$1"
    local top_n="${2:-5}"
    
    if [[ -z "$task_description" ]]; then
        echo -e "${YELLOW}Usage: match <task-description> [top-n]${NC}"
        return 1
    fi
    
    echo -e "${CYAN}🎯 Finding best BlackRoad Agents for task...${NC}"
    echo -e "${BLUE}Task: ${task_description:0:80}...${NC}"
    echo ""
    
    # Analyze task to extract required skills
    local task_lower=$(echo "$task_description" | tr '[:upper:]' '[:lower:]')
    declare -A task_skills
    
    while IFS= read -r skill; do
        local score=0
        local keywords=$(jq -r --arg skill "$skill" '.skills[$skill].keywords[]' "$MATCHER_DIR/skill-taxonomy.json")
        
        while IFS= read -r keyword; do
            if echo "$task_lower" | grep -q "$keyword"; then
                ((score++))
            fi
        done <<< "$keywords"
        
        task_skills[$skill]=$score
    done < <(jq -r '.skills | keys[]' "$MATCHER_DIR/skill-taxonomy.json")
    
    echo -e "${BOLD}Required Skills:${NC}"
    for skill in "${!task_skills[@]}"; do
        [[ ${task_skills[$skill]} -gt 0 ]] && echo -e "  • ${CYAN}$skill${NC} (${task_skills[$skill]} matches)"
    done
    echo ""
    
    # Match against Agent profiles
    declare -A match_scores
    
    for profile_file in "$MATCHER_DIR/profiles"/*.json; do
        [[ ! -f "$profile_file" ]] && continue
        
        local agent=$(jq -r '.agent_id' "$profile_file")
        local total_score=0
        
        for skill in "${!task_skills[@]}"; do
            local task_need=${task_skills[$skill]}
            local agent_skill=$(jq -r --arg skill "$skill" '.skills[$skill] // 0' "$profile_file")
            
            # Score = task need × Agent skill level
            local score=$((task_need * agent_skill))
            ((total_score += score))
        done
        
        match_scores[$agent]=$total_score
    done
    
    # Sort and display top matches
    echo -e "${BOLD}${GREEN}🏆 Top Matches:${NC}"
    echo ""
    
    local rank=1
    for agent in $(for c in "${!match_scores[@]}"; do echo "${match_scores[$c]} $c"; done | sort -rn | head -n "$top_n" | awk '{print $2}'); do
        local score=${match_scores[$agent]}
        
        # Medal/badge
        local badge=""
        case $rank in
            1) badge="${YELLOW}🥇 " ;;
            2) badge="${BLUE}🥈 " ;;
            3) badge="${PURPLE}🥉 " ;;
            *) badge="   " ;;
        esac
        
        echo -e "${badge}${BOLD}#$rank${NC} ${CYAN}$agent${NC} - ${GREEN}Score: $score${NC}"
        
        # Show matching skills
        local profile_file="$MATCHER_DIR/profiles/${agent}.json"
        echo -n "    Skills: "
        for skill in "${!task_skills[@]}"; do
            if [[ ${task_skills[$skill]} -gt 0 ]]; then
                local agent_skill=$(jq -r --arg skill "$skill" '.skills[$skill] // 0' "$profile_file")
                [[ $agent_skill -gt 0 ]] && echo -n "${skill}(${agent_skill}) "
            fi
        done
        echo ""
        
        ((rank++))
    done
    
    echo ""
    echo -e "${GREEN}✅ Top $top_n matches found${NC}"
}

# Build profiles for all active BlackRoad Agents
build_all_profiles() {
    echo -e "${CYAN}🧠 Building profiles for all active BlackRoad Agents...${NC}"
    echo ""
    
    local active_agents=$(tail -200 "$MEMORY_DIR/journals/master-journal.jsonl" 2>/dev/null | \
        jq -r '.entity' | grep "agent-" | sort -u)
    
    local count=0
    while IFS= read -r agent; do
        [[ -z "$agent" ]] && continue
        
        echo -e "${BLUE}Building: $agent${NC}"
        build_profile "$agent" > /dev/null 2>&1
        ((count++))
    done <<< "$active_agents"
    
    echo ""
    echo -e "${GREEN}✅ Built $count Agent profiles${NC}"
}

# Show all profiles
list_profiles() {
    echo -e "${BOLD}${PURPLE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${PURPLE}║           👥 CLAUDE SKILL PROFILES 👥                     ║${NC}"
    echo -e "${BOLD}${PURPLE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    for profile_file in "$MATCHER_DIR/profiles"/*.json; do
        [[ ! -f "$profile_file" ]] && continue
        
        local agent=$(jq -r '.agent_id' "$profile_file")
        local total=$(jq -r '.total_work' "$profile_file")
        
        echo -e "${CYAN}$agent${NC} (${total} work items)"
        
        # Top 3 skills
        local top_skills=$(jq -r '.skills | to_entries | sort_by(-.value) | .[0:3] | .[] | "\(.key): \(.value)"' "$profile_file")
        while IFS=: read -r skill score; do
            echo -e "  • ${skill}: ${GREEN}${score}${NC}"
        done <<< "$top_skills"
        
        echo ""
    done
}

# Show help
show_help() {
    cat << EOF
${CYAN}╔════════════════════════════════════════════════════════════╗${NC}
${CYAN}║      🧬 Agent Skill Matcher - Help 🧬                    ║${NC}
${CYAN}╚════════════════════════════════════════════════════════════╝${NC}

${GREEN}USAGE:${NC}
    $0 <command> [options]

${GREEN}COMMANDS:${NC}

${BLUE}init${NC}
    Initialize skill matcher system

${BLUE}build-profile${NC} <agent-id>
    Build skill profile for a Agent based on past work
    Example: $0 build-profile agent-backend-specialist

${BLUE}build-all${NC}
    Build profiles for all active BlackRoad Agents

${BLUE}match${NC} <task-description> [top-n]
    Find best Agent matches for a task (default: top 5)
    Example: $0 match "Build FastAPI backend with PostgreSQL" 3

${BLUE}list${NC}
    List all Agent profiles

${GREEN}HOW IT WORKS:${NC}

    1. Analyzes Agent's past work from memory entries
    2. Scores skills based on keyword matching
    3. Builds comprehensive skill profile
    4. Matches tasks to BlackRoad Agents using similarity scoring
    5. Returns ranked list of best matches

${GREEN}SKILLS TRACKED (30 categories):${NC}

  ${BOLD}AI/ML:${NC}
    • ml (TensorFlow, PyTorch, training)
    • ai_inference (vLLM, Ollama, RAG, embeddings)
    • nlp (transformers, sentiment, NER)
    • computer_vision (YOLO, OpenCV, diffusion)
    • vector_db (Qdrant, Weaviate, Chroma)
    • agent_systems (multi-agent, orchestration)

  ${BOLD}Development:${NC}
    • backend (FastAPI, Express, Django)
    • frontend (React, Vue, Next.js)
    • mobile (iOS, Android, Flutter)
    • cli (shell, bash, automation)
    • realtime (WebSocket, SSE, streaming)

  ${BOLD}Infrastructure:${NC}
    • devops (Docker, K8s, Terraform)
    • cloud (AWS, GCP, Cloudflare)
    • monitoring (Grafana, Prometheus)
    • networking (DNS, CDN, Tailscale)

  ${BOLD}Data:${NC}
    • database (PostgreSQL, Redis, MongoDB)
    • data_engineering (ETL, Airflow, Spark)
    • analytics (dashboards, BI, metrics)
    • time_series (InfluxDB, forecasting)
    • search (Elasticsearch, Meilisearch)

  ${BOLD}Security:${NC}
    • security (auth, OAuth, WAF)
    • crypto (JWT, encryption, TLS)
    • compliance (GDPR, SOC2, audit)

  ${BOLD}Other:${NC}
    • blockchain (Web3, Solidity, DeFi)
    • iot (Raspberry Pi, MQTT, embedded)
    • workflow (n8n, Temporal, Prefect)
    • integration (webhooks, connectors)
    • testing (pytest, Jest, e2e)
    • documentation (guides, tutorials)
    • performance (caching, optimization)

${GREEN}EXAMPLES:${NC}

    # Build profile for a Agent
    $0 build-profile agent-backend-specialist

    # Build all profiles
    $0 build-all

    # Match task to best BlackRoad Agents
    $0 match "Deploy React frontend with authentication"

    # Get top 3 matches
    $0 match "Optimize database queries" 3

EOF
}

# Main command router
case "$1" in
    init)
        init_matcher
        ;;
    build-profile)
        build_profile "$2"
        ;;
    build-all)
        build_all_profiles
        ;;
    match)
        match_to_task "$2" "$3"
        ;;
    list)
        list_profiles
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${YELLOW}Unknown command: $1${NC}"
        show_help
        exit 1
        ;;
esac
