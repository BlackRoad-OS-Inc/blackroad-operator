#!/bin/bash
# Create 10 BlackRoad OS Apps

echo "🏭 Creating 10 BlackRoad OS Apps..."
echo ""

APPS=(
  "BlackRoad Dashboard:📊:Real-time analytics and monitoring"
  "BlackRoad Metrics:📈:Performance tracking and KPIs"
  "BlackRoad Vault:🔐:Secure credential management"
  "BlackRoad Agent Hub:🤖:AI agent coordination center"
  "BlackRoad Commander:⚡:Command and control interface"
  "BlackRoad Analytics:📉:Deep data insights"
  "BlackRoad Monitor:👁️:System health monitoring"
  "BlackRoad Deployer:🚀:One-click deployments"
  "BlackRoad Studio:🎨:Visual app builder"
  "BlackRoad Sync:🔄:Real-time data synchronization"
)

for app_config in "${APPS[@]}"; do
  IFS=':' read -r name icon desc <<< "$app_config"
  
  app_dir=~/blackroad-apps/$(echo $name | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
  
  echo "📱 Creating: $name $icon"
  mkdir -p "$app_dir"
  
  cat > "$app_dir/index.html" << APPHTML
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#FF6B35">
  <title>$name</title>
  <link rel="manifest" href="manifest.json">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #000 0%, #1a1a1a 100%);
      color: #fff;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      text-align: center;
    }
    .logo {
      font-size: 120px;
      margin-bottom: 20px;
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    h1 {
      font-size: 48px;
      margin-bottom: 20px;
      background: linear-gradient(90deg, #FF6B35, #F7931E);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .tagline {
      font-size: 20px;
      color: #999;
      margin-bottom: 40px;
    }
    .button {
      background: #FF6B35;
      color: #fff;
      border: none;
      padding: 15px 40px;
      border-radius: 8px;
      font-size: 18px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .button:hover {
      background: #F7931E;
      transform: translateY(-2px);
    }
    .badge {
      display: inline-block;
      background: rgba(255,107,53,0.2);
      border: 1px solid #FF6B35;
      color: #FF6B35;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      margin: 20px 5px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">$icon</div>
    <h1>$name</h1>
    <p class="tagline">$desc</p>
    
    <div>
      <span class="badge">📱 PWA</span>
      <span class="badge">🤖 Android</span>
      <span class="badge">💻 Desktop</span>
      <span class="badge">🍎 iOS</span>
    </div>
    
    <button class="button" onclick="alert('$name is live!')">
      Launch App
    </button>
    
    <p style="margin-top: 40px; color: #666; font-size: 14px;">
      Published on BlackRoad OS App Store<br>
      Zero gatekeepers • Zero fees • Total freedom
    </p>
  </div>
</body>
</html>
APPHTML

  cat > "$app_dir/manifest.json" << MANIFEST
{
  "name": "$name",
  "short_name": "$(echo $name | cut -d' ' -f2)",
  "description": "$desc",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#FF6B35",
  "icons": [{
    "src": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='0.9em' font-size='90'%3E$icon%3C/text%3E%3C/svg%3E",
    "sizes": "512x512",
    "type": "image/svg+xml"
  }]
}
MANIFEST

  cat > "$app_dir/blackroad-app.json" << METADATA
{
  "name": "$name",
  "version": "1.0.0",
  "description": "$desc",
  "platforms": ["web", "pwa", "android", "desktop", "ios"],
  "icon": "$icon",
  "published_date": "$(date -Iseconds)"
}
METADATA

  echo "  ✅ Created at: $app_dir"
  
done

echo ""
echo "🎉 10 apps created!"
echo ""
echo "📁 Location: ~/blackroad-apps/"
echo ""
echo "🚀 Publish them all:"
echo "  cd ~/blackroad-apps"
echo "  for app in */; do"
echo "    ~/blackroad-app-store/cli/blackroad-store.sh publish \$app"
echo "  done"
echo ""
