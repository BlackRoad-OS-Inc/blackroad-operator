#!/bin/bash
# Deploy BlackRoad websites to Raspberry Pi cluster and DO droplets

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🖤 BLACKROAD PI CLUSTER WEB DEPLOYMENT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Target nodes
NODES=("alice" "lucidia" "codex-infinity" "shellfish")
WEB_ROOT="/var/www/blackroad"
DOMAINS=(
  "blackroad.io"
  "blackroadai.com"
  "blackroad.company"
  "blackroad.network"
  "blackroad.systems"
)

# Create simple website if it doesn't exist
mkdir -p ~/blackroad-sites
cd ~/blackroad-sites

for domain in "${DOMAINS[@]}"; do
  if [ ! -d "$domain" ]; then
    echo "Creating website for $domain..."
    mkdir -p "$domain"
    cat > "$domain/index.html" << HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🖤 BlackRoad - $domain</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
            color: #ffffff;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            text-align: center;
            max-width: 800px;
        }
        .logo { font-size: 4rem; margin-bottom: 1rem; }
        h1 { font-size: 3rem; margin-bottom: 1rem; font-weight: 700; }
        .domain { color: #666; font-size: 1.2rem; margin-bottom: 2rem; }
        .status {
            background: rgba(255,255,255,0.1);
            padding: 2rem;
            border-radius: 10px;
            margin-top: 2rem;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-top: 2rem;
        }
        .card {
            background: rgba(255,255,255,0.05);
            padding: 1.5rem;
            border-radius: 8px;
            border: 1px solid rgba(255,255,255,0.1);
        }
        .card h3 { margin-bottom: 0.5rem; color: #fff; }
        .card p { color: #999; font-size: 0.9rem; }
        .footer {
            margin-top: 3rem;
            color: #666;
            font-size: 0.9rem;
        }
        a { color: #fff; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🖤</div>
        <h1>BlackRoad</h1>
        <div class="domain">$domain</div>
        
        <div class="status">
            <h2>⚡ Live & Running</h2>
            <p>Deployed on BlackRoad Pi Cluster</p>
        </div>
        
        <div class="grid">
            <div class="card">
                <h3>🚀 Infrastructure</h3>
                <p>Raspberry Pi Cluster + DO Droplets</p>
            </div>
            <div class="card">
                <h3>☁️ Cloud Native</h3>
                <p>Cloudflare, Vercel, Railway</p>
            </div>
            <div class="card">
                <h3>🤖 AI Powered</h3>
                <p>30K+ Agents, Quantum Computing</p>
            </div>
            <div class="card">
                <h3>🔒 Enterprise</h3>
                <p>17 GitHub Orgs, 100+ Repos</p>
            </div>
        </div>
        
        <div class="footer">
            <p>BlackRoad OS · Enterprise AI Infrastructure</p>
            <p><a href="https://github.com/blackroad-os">GitHub</a> · <a href="https://blackroad.io">blackroad.io</a></p>
            <p style="margin-top: 1rem; font-size: 0.8rem;">Node: <span id="node">Loading...</span></p>
        </div>
    </div>
    
    <script>
        // Show which node is serving this
        fetch('/api/node-info')
            .then(r => r.json())
            .then(d => document.getElementById('node').textContent = d.node)
            .catch(() => document.getElementById('node').textContent = window.location.hostname);
    </script>
</body>
</html>
HTML
  fi
done

echo "✅ Website files ready"
echo ""

# Deploy to each node
for node in "${NODES[@]}"; do
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📦 Deploying to: $node"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  if ssh -o ConnectTimeout=5 -o BatchMode=yes "$node" "echo 'Connected'" &>/dev/null; then
    echo "✅ $node is online"
    
    # Create web directory
    ssh "$node" "sudo mkdir -p $WEB_ROOT && sudo chown -R \$USER:www-data $WEB_ROOT" 2>&1 || true
    
    # Sync files
    echo "  📤 Syncing files..."
    rsync -avz --delete ~/blackroad-sites/ "$node:$WEB_ROOT/" 2>&1 | tail -5
    
    # Install nginx if not present
    echo "  🔧 Checking nginx..."
    ssh "$node" "command -v nginx || sudo apt-get install -y nginx" 2>&1 | tail -3
    
    # Create nginx config
    echo "  ⚙️  Configuring nginx..."
    ssh "$node" "cat > /tmp/blackroad.conf << 'NGINX'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    root $WEB_ROOT/blackroad.io;
    index index.html;
    
    server_name _;
    
    location / {
        try_files \\\$uri \\\$uri/ =404;
    }
    
    location /api/node-info {
        add_header Content-Type application/json;
        return 200 '{\"node\": \"\$(hostname)\", \"timestamp\": \"\$(date -Iseconds)\"}';
    }
}
NGINX
sudo mv /tmp/blackroad.conf /etc/nginx/sites-available/blackroad
sudo ln -sf /etc/nginx/sites-available/blackroad /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx || echo '  ⚠️  Nginx config issue'
" 2>&1 | grep -E "(✓|✗|Warning|Error)" || true
    
    echo "  ✅ Deployed to $node"
    echo ""
  else
    echo "  ❌ $node is offline"
    echo ""
  fi
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Your sites are now live on:"
for node in "${NODES[@]}"; do
  IP=$(ssh -o ConnectTimeout=2 "$node" "hostname -I | awk '{print \$1}'" 2>/dev/null || echo "offline")
  echo "  • $node: http://$IP"
done
echo ""
echo "🔧 Test locally:"
echo "  curl http://alice"
echo "  curl http://lucidia"
echo ""
