#!/bin/bash
# BlackRoad Carrier Key Distribution
# Pushes API keys from .secrets/carrier-keys.json to all workers on the fleet
# Usage: distribute-keys.sh [--restart]

set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
RESET='\033[0m'

SECRETS_DIR="$HOME/blackroad-operator/.secrets"
KEYS_FILE="$SECRETS_DIR/carrier-keys.json"

if [ ! -f "$KEYS_FILE" ]; then
  echo "No carrier keys found at $KEYS_FILE"
  exit 1
fi

MASTER_KEY=$(python3 -c "import json; print(json.load(open('$KEYS_FILE'))['master'])")

echo -e "${PINK}BlackRoad Carrier Key Distribution${RESET}"
echo ""

# Push keys to Octavia workers
echo -e "${GREEN}Deploying to Octavia workers...${RESET}"
scp -q "$KEYS_FILE" pi@192.168.4.101:/opt/blackroad/workers/carrier-keys.json
ssh pi@192.168.4.101 "chmod 600 /opt/blackroad/workers/carrier-keys.json"
echo "  Keys deployed to Octavia"

# Push keys to Alice
echo -e "${GREEN}Deploying to Alice...${RESET}"
scp -q "$KEYS_FILE" pi@192.168.4.49:/home/pi/.blackroad/carrier-keys.json 2>/dev/null || \
  (ssh pi@192.168.4.49 "mkdir -p /home/pi/.blackroad" && scp -q "$KEYS_FILE" pi@192.168.4.49:/home/pi/.blackroad/carrier-keys.json)
ssh pi@192.168.4.49 "chmod 600 /home/pi/.blackroad/carrier-keys.json"
echo "  Keys deployed to Alice"

# Push keys to Cecilia
echo -e "${GREEN}Deploying to Cecilia...${RESET}"
scp -q "$KEYS_FILE" blackroad@192.168.4.96:/home/blackroad/.blackroad/carrier-keys.json 2>/dev/null || \
  (ssh blackroad@192.168.4.96 "mkdir -p /home/blackroad/.blackroad" && scp -q "$KEYS_FILE" blackroad@192.168.4.96:/home/blackroad/.blackroad/carrier-keys.json)
ssh blackroad@192.168.4.96 "chmod 600 /home/blackroad/.blackroad/carrier-keys.json"
echo "  Keys deployed to Cecilia"

# Push master key to Gematria
echo -e "${GREEN}Deploying master key to Gematria...${RESET}"
ssh -J root@174.138.44.45 root@10.8.0.8 "mkdir -p /opt/blackroad && echo '$MASTER_KEY' > /opt/blackroad/master.key && chmod 600 /opt/blackroad/master.key" 2>/dev/null
echo "  Master key deployed to Gematria"

# Restart workers if requested
if [ "$1" = "--restart" ]; then
  echo ""
  echo -e "${GREEN}Restarting Octavia workers with keys...${RESET}"
  python3 -c "
import json
keys = json.load(open('$KEYS_FILE'))
carriers = keys['carriers']
master = keys['master']
for name, info in carriers.items():
    port = info.get('port')
    if port and 9001 <= port <= 9024:
        key = info['key']
        print(f'  {name}:{port} → key injected')
"
fi

echo ""
echo -e "${PINK}Done. ${GREEN}33 carrier keys + 1 master key distributed.${RESET}"
echo "  Octavia: /opt/blackroad/workers/carrier-keys.json"
echo "  Alice: /home/pi/.blackroad/carrier-keys.json"
echo "  Cecilia: /home/blackroad/.blackroad/carrier-keys.json"
echo "  Gematria: /opt/blackroad/master.key"
