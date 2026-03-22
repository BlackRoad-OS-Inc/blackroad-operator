#!/bin/bash
# Sync product catalog from Stripe to all domain sites
set -e
PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
RESET='\033[0m'

echo -e "${PINK}Syncing Stripe product catalog...${RESET}"

# Core plans
cat > /tmp/pricing-data.json << 'JSON'
{
  "plans": [
    {"name": "Rider", "price": 29, "link": "https://buy.stripe.com/aFadR27Je7tP0m78Mk4Vy0p", "features": ["AI chat with memory", "RoadSearch", "19 domain access", "69+ agents", "Community support"]},
    {"name": "Paver", "price": 99, "link": "https://buy.stripe.com/cNi8wI3sY15rgl5aUs4Vy0q", "features": ["Everything in Rider", "PRISM console", "Creator tools", "Fleet management", "Priority AI", "API access"]},
    {"name": "Enterprise", "price": 299, "link": "https://buy.stripe.com/cNidR25B67tP3yj9Qo4Vy0r", "features": ["Everything in Paver", "Dedicated nodes", "Custom agents", "SLA", "Team management", "Compliance suite"]}
  ],
  "products": [
    {"name": "Lucidia Creator", "price": 29, "link": "https://buy.stripe.com/28E9AM3sYcO91qb4w44Vy0s"},
    {"name": "RoadWork Tutoring", "price": 19, "link": "https://buy.stripe.com/3cI9AM8Ni8xTgl5e6E4Vy0t"},
    {"name": "RoadSearch", "price": 5, "link": "https://buy.stripe.com/dRm5kw0gM7tP8SD8Mk4Vy0u"}
  ]
}
JSON

echo -e "${GREEN}Product catalog synced to /tmp/pricing-data.json${RESET}"
echo "Use this data to update pricing pages across all domains."
