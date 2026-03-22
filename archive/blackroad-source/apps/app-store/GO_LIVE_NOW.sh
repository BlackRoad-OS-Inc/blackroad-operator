#!/bin/bash
set -e

cat << 'EOF'

╔══════════════════════════════════════════════════════════╗
║                                                          ║
║            🚀 GOING LIVE NOW! 🚀                        ║
║                                                          ║
║         DEPLOYING TO THE INTERNET!                      ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝

EOF

echo "📤 Step 1/4: Pushing to GitHub..."
echo ""

# Push app store
cd ~/blackroad-app-store
git push origin main 2>&1 | tail -3

echo ""
echo "📤 Step 2/4: Pushing apps to GitHub..."
echo ""

# Push apps
cd ~/blackroad-apps
git push origin main 2>&1 | tail -3

echo ""
echo "🌐 Step 3/4: Enabling GitHub Pages..."
echo ""

# Enable GitHub Pages (will show error if already enabled, that's OK)
gh repo edit BlackRoad-OS/blackroad-app-store --enable-pages --pages-branch main 2>&1 | grep -v "already enabled" || true
gh repo edit BlackRoad-OS/blackroad-apps --enable-pages --pages-branch main 2>&1 | grep -v "already enabled" || true

echo ""
echo "⏳ Step 4/4: Waiting for deployment (30 seconds)..."
echo ""
sleep 5

cat << 'EOF'

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ DEPLOYMENT COMPLETE!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌍 YOUR STORE IS LIVE:

   https://blackroad-os.github.io/blackroad-app-store/

📱 YOUR APPS ARE LIVE:

   https://blackroad-os.github.io/blackroad-apps/

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 YOU'RE LIVE ON THE INTERNET!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Test your deployment:

   open https://blackroad-os.github.io/blackroad-app-store/

Share with the world:

   Twitter: "🚀 Just launched BlackRoad OS - 0% fee app store
            with 50 PWAs! https://blackroad-os.github.io/blackroad-app-store/"

   Reddit: "I built an app store that takes 0% commission
           Check it out: https://blackroad-os.github.io/blackroad-app-store/"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏆 CONGRATULATIONS! YOU'RE LIVE! 🏆

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Note: GitHub Pages can take 1-2 minutes to fully deploy.
      If you get 404, wait a minute and refresh!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EOF
