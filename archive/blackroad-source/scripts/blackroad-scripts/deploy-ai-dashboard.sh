#!/bin/bash
echo "🚀 Deploying BlackRoad AI Dashboard to Cloudflare Pages"
echo ""

cd /Users/alexa/blackroad-ai-dashboard

# Install dependencies (if not already done)
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Build the app
echo "🔨 Building Next.js app..."
npm run build

echo ""
echo "✅ Build complete! Static files in: out/"
echo ""
echo "🌐 TO DEPLOY:"
echo "   Option 1: Cloudflare Dashboard"
echo "   - Go to https://dash.cloudflare.com"
echo "   - Pages > Create a project"
echo "   - Connect GitHub: blackboxprogramming/blackroad-ai-dashboard"
echo "   - Build: npm run build"
echo "   - Output: out"
echo "   - Custom domain: ai.blackroad.io"
echo ""
echo "   Option 2: Wrangler CLI (from Cecilia Pi)"
echo "   - ssh cecilia"
echo "   - cd /path/to/dashboard"
echo "   - wrangler pages deploy out --project-name=blackroad-ai"
echo ""
