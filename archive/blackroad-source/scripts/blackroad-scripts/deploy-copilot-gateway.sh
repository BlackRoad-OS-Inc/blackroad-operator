#!/bin/bash
# Deploy Copilot Agent Gateway to BlackRoad Pi Fleet

set -e

PINK='\033[38;5;205m'
BLUE='\033[38;5;69m'
GREEN='\033[38;5;82m'
RESET='\033[0m'

GATEWAY_DIR="copilot-agent-gateway"
PI_FLEET=(
  "cecilia"
  "lucidia" 
  "alice"
  "octavia"
  "anastasia"
  "aria"
  "cordelia"
)

echo -e "${PINK}🚀 BlackRoad Copilot Gateway Deployment${RESET}"
echo ""

# Check if gateway exists locally
if [ ! -d "$HOME/$GATEWAY_DIR" ]; then
  echo -e "${PINK}❌ Gateway not found at ~/$GATEWAY_DIR${RESET}"
  exit 1
fi

echo -e "${BLUE}📦 Packaging gateway...${RESET}"
cd "$HOME"
tar -czf /tmp/copilot-gateway.tar.gz "$GATEWAY_DIR"
echo -e "${GREEN}✅ Package created${RESET}"

# Deploy to each Pi
for PI in "${PI_FLEET[@]}"; do
  echo ""
  echo -e "${BLUE}🎯 Deploying to $PI...${RESET}"
  
  # Check if Pi is reachable
  if ! ping -c 1 -W 2 "$PI" > /dev/null 2>&1; then
    echo -e "${PINK}⚠️  $PI not reachable, skipping${RESET}"
    continue
  fi
  
  # Copy package
  scp -q /tmp/copilot-gateway.tar.gz "$PI:/tmp/" && \
  
  # Extract and install
  ssh "$PI" bash << 'ENDSSH'
    cd ~
    rm -rf copilot-agent-gateway
    tar -xzf /tmp/copilot-gateway.tar.gz
    cd copilot-agent-gateway
    
    # Install dependencies
    npm install --silent
    
    # Set local Ollama endpoint
    echo 'OLLAMA_ENDPOINT=http://localhost:11434' > .env
    
    # Create systemd service
    sudo tee /etc/systemd/system/copilot-gateway.service > /dev/null << 'EOF'
[Unit]
Description=BlackRoad Copilot Agent Gateway
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$HOME/copilot-agent-gateway
Environment=OLLAMA_ENDPOINT=http://localhost:11434
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    
    # Start service
    sudo systemctl daemon-reload
    sudo systemctl enable copilot-gateway
    sudo systemctl restart copilot-gateway
    
    echo "✅ Gateway deployed and running"
ENDSSH
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ $PI deployment complete${RESET}"
  else
    echo -e "${PINK}❌ $PI deployment failed${RESET}"
  fi
done

# Clean up
rm /tmp/copilot-gateway.tar.gz

echo ""
echo -e "${GREEN}🎉 Gateway deployed to all reachable Pis!${RESET}"
echo ""
echo -e "${BLUE}📊 Check status:${RESET}"
echo "  ssh <pi> 'sudo systemctl status copilot-gateway'"
echo ""
echo -e "${BLUE}📝 View logs:${RESET}"
echo "  ssh <pi> 'journalctl -u copilot-gateway -f'"
echo ""
echo -e "${BLUE}🔧 Configure Copilot CLI:${RESET}"
echo "  Add to ~/.copilot/mcp-config.json:"
echo '  {
    "mcpServers": {
      "blackroad-gateway": {
        "command": "node",
        "args": ["'$HOME/$GATEWAY_DIR'/server.js"],
        "env": {
          "OLLAMA_ENDPOINT": "http://octavia:11434"
        }
      }
    }
  }'
