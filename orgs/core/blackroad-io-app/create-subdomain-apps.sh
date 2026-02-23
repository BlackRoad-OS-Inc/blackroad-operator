#!/bin/bash
# Create apps for all BlackRoad subdomains

SUBDOMAINS=(
  "chat"
  "pay"
  "buy"
  "math"
  "agents"
  "docs"
  "console"
  "status"
)

for subdomain in "${SUBDOMAINS[@]}"; do
  echo "🔨 Creating app for $subdomain.blackroad.io..."
  
  cat > "${subdomain}.html" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BlackRoad ${subdomain^}</title>
  <script src="https://js.stripe.com/v3/"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --gradient: linear-gradient(135deg, #FF9D00, #FF6B00, #FF0066, #D600AA, #7700FF, #0066FF);
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #02030a;
      color: white;
      min-height: 100vh;
    }
    .navbar {
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(20px);
      padding: 16px 32px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .navbar h1 {
      background: var(--gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-size: 24px;
      font-weight: 900;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 48px 32px;
    }
    .hero {
      text-align: center;
      padding: 80px 0;
    }
    .hero h2 {
      font-size: 56px;
      margin-bottom: 24px;
    }
    .hero p {
      font-size: 20px;
      opacity: 0.8;
      margin-bottom: 48px;
    }
    .feature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 32px;
      margin-top: 48px;
    }
    .feature-card {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 32px;
      transition: transform 0.3s;
    }
    .feature-card:hover {
      transform: translateY(-8px);
      border-color: #7700FF;
    }
    .krak-banner {
      margin-top: 48px;
      padding: 32px;
      background: rgba(255,255,255,0.05);
      border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.1);
      text-align: center;
    }
    .krak-banner h3 {
      font-size: 24px;
      margin-bottom: 16px;
    }
    .krak-banner a {
      display: inline-block;
      padding: 16px 32px;
      background: var(--gradient);
      color: white;
      text-decoration: none;
      border-radius: 12px;
      font-weight: 700;
      transition: transform 0.2s;
    }
    .krak-banner a:hover {
      transform: scale(1.05);
    }
  </style>
</head>
<body>
  <div class="navbar">
    <h1>BlackRoad ${subdomain^}</h1>
  </div>
  <div class="container">
    <div class="hero">
      <h2>BlackRoad ${subdomain^}</h2>
      <p>Powered by 30,000 AI Agents</p>
    </div>
    <div class="feature-grid">
      <div class="feature-card">
        <h3>🚀 AI-Powered</h3>
        <p>Advanced AI capabilities integrated into every feature</p>
      </div>
      <div class="feature-card">
        <h3>⚡ Real-Time</h3>
        <p>Instant updates and live collaboration</p>
      </div>
      <div class="feature-card">
        <h3>🔒 Secure</h3>
        <p>Enterprise-grade security and encryption</p>
      </div>
    </div>
    <div class="krak-banner">
      <h3>💸 Send me money on Krak!</h3>
      <a href="https://krak.app/AAAAAAAA" target="_blank">Tap here to try Krak →</a>
    </div>
  </div>
</body>
</html>
EOF
  
  echo "  ✅ Created ${subdomain}.html"
done

echo ""
echo "✨ All subdomain apps created!"
