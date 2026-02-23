#!/bin/bash
# Deploy dynamic apps to all BlackRoad domains

DOMAINS=(
  "blackroad.io"
  "blackroad.systems"
  "blackroad.me"
  "blackroad.network"
  "blackroadai.com"
  "blackroadqi.com"
  "blackroadquantum.com"
  "blackroadquantum.net"
  "blackroadquantum.info"
  "blackroadquantum.store"
  "blackroadquantum.shop"
  "blackroadinc.us"
  "aliceqi.com"
  "lucidiaqi.com"
  "lucidia.studio"
  "lucidia.earth"
)

SUBDOMAINS=(
  "api"
  "app"
  "chat"
  "pay"
  "buy"
  "math"
  "home"
  "docs"
  "console"
  "status"
  "agents"
  "core"
  "operator"
)

echo "🚀 Deploying dynamic apps to all BlackRoad domains..."
echo ""

for domain in "${DOMAINS[@]}"; do
  echo "📦 Processing $domain..."

  # Create domain directory if it doesn't exist
  mkdir -p ~/blackroad-domains/${domain//./}-

  # Generate dynamic app for root domain
  cat > ~/blackroad-domains/${domain//./}-/index.html << EOF
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BlackRoad OS - $domain</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #FF9D00, #FF6B00, #FF0066, #D600AA, #7700FF, #0066FF);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    .container {
      text-align: center;
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(20px);
      padding: 64px;
      border-radius: 24px;
      max-width: 600px;
    }
    h1 { font-size: 48px; margin-bottom: 16px; }
    p { font-size: 20px; opacity: 0.9; margin-bottom: 32px; }
    a {
      display: inline-block;
      padding: 16px 32px;
      background: white;
      color: #000;
      text-decoration: none;
      border-radius: 12px;
      font-weight: 700;
      margin: 8px;
      transition: transform 0.2s;
    }
    a:hover { transform: scale(1.05); }
    .krak {
      margin-top: 32px;
      padding: 24px;
      background: rgba(255,255,255,0.1);
      border-radius: 16px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🛣️ BlackRoad OS</h1>
    <p>$domain</p>
    <a href="https://blackroad.io">Main App</a>
    <a href="https://core.blackroad.systems/api/docs">API Docs</a>
    <div class="krak">
      <p>💸 Send me money on Krak!</p>
      <a href="https://krak.app/AAAAAAAA" target="_blank">Tap here to try →</a>
    </div>
  </div>
</body>
</html>
EOF

  echo "  ✅ Created app for $domain"
done

echo ""
echo "✨ All domain apps created!"
echo "📁 Location: ~/blackroad-domains/"
