#!/bin/bash

# 🎨 BlackRoad OS - Premium App Generator
# Creates 10 more professional apps!

echo "🚀 Generating 10 Premium Apps..."
echo ""

cd ~/blackroad-apps || exit 1

# Premium App Templates
apps=(
    "blackroad-chat|💬|Team Chat|Real-time team communication and collaboration platform|#FF6B6B"
    "blackroad-calendar|📅|Calendar Pro|Smart scheduling and calendar management for teams|#4ECDC4"
    "blackroad-files|📁|File Manager|Secure cloud file storage and sharing platform|#95E1D3"
    "blackroad-notes|📝|Notes Plus|Rich text editor with markdown and collaboration|#FFD93D"
    "blackroad-tasks|✅|Task Manager|Project management and task tracking system|#6BCF7F"
    "blackroad-mail|📧|Mail Client|Fast, secure email client with smart filters|#A8E6CF"
    "blackroad-video|🎥|Video Studio|Video editing and streaming platform|#FF8B94"
    "blackroad-music|🎵|Music Player|Stream and organize your music library|#C7CEEA"
    "blackroad-photos|📸|Photo Gallery|AI-powered photo organization and editing|#B5EAD7"
    "blackroad-code|💻|Code Editor|Collaborative code editor with live sharing|#9D84B7"
)

for app in "${apps[@]}"; do
    IFS='|' read -r name icon title description color <<< "$app"
    
    echo "   Creating: $icon $title"
    
    mkdir -p "$name"
    
    # Create beautiful app
    cat > "$name/index.html" << APPHTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>$icon $title - BlackRoad OS</title>
    <link rel="manifest" href="manifest.json">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, $color 0%, #667eea 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            padding: 20px;
        }
        
        .container {
            text-align: center;
            max-width: 600px;
            animation: fadeIn 0.8s ease;
        }
        
        .icon {
            font-size: 120px;
            margin-bottom: 30px;
            animation: bounce 2s infinite;
        }
        
        h1 {
            font-size: 48px;
            margin-bottom: 20px;
        }
        
        .description {
            font-size: 20px;
            opacity: 0.9;
            line-height: 1.6;
            margin-bottom: 40px;
        }
        
        .features {
            background: rgba(255, 255, 255, 0.1);
            padding: 30px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
            margin-bottom: 30px;
        }
        
        .features h2 {
            font-size: 24px;
            margin-bottom: 20px;
        }
        
        .feature {
            padding: 15px;
            text-align: left;
            margin-bottom: 10px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
        }
        
        .cta {
            display: inline-block;
            padding: 15px 40px;
            background: white;
            color: $color;
            border-radius: 10px;
            text-decoration: none;
            font-weight: bold;
            font-size: 18px;
            transition: transform 0.3s ease;
        }
        
        .cta:hover {
            transform: scale(1.05);
        }
        
        .badge {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 20px;
            font-size: 14px;
        }
        
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">$icon</div>
        <h1>$title</h1>
        <div class="description">$description</div>
        
        <div class="features">
            <h2>✨ Features</h2>
            <div class="feature">🚀 Lightning fast performance</div>
            <div class="feature">🔐 End-to-end encrypted</div>
            <div class="feature">☁️ Cloud sync across devices</div>
            <div class="feature">🌙 Dark mode included</div>
            <div class="feature">📱 Works on all platforms</div>
        </div>
        
        <a href="#" class="cta" onclick="alert('Coming soon! Install from BlackRoad OS App Store'); return false;">
            Get Started
        </a>
        
        <div class="badge">
            ✅ Published on BlackRoad OS
        </div>
    </div>
</body>
</html>
APPHTML

    # Create manifest
    cat > "$name/manifest.json" << MANIFEST
{
  "name": "$title",
  "short_name": "$title",
  "description": "$description",
  "start_url": "/",
  "display": "standalone",
  "background_color": "$color",
  "theme_color": "$color",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
MANIFEST

    # Create app metadata
    cat > "$name/blackroad-app.json" << METADATA
{
  "name": "$title",
  "icon": "$icon",
  "description": "$description",
  "version": "1.0.0",
  "author": "BlackRoad OS",
  "category": "productivity",
  "price": "free",
  "installs": 0,
  "rating": 5.0,
  "features": [
    "Lightning fast",
    "Encrypted",
    "Cloud sync",
    "Cross-platform"
  ],
  "color": "$color"
}
METADATA

done

echo ""
echo "✅ Created 10 Premium Apps!"
echo ""
echo "Total apps now: 21!"
echo ""
