#!/bin/bash

# BlackRoad Developer API - Quick Deploy Script

set -e

echo "🚀 BlackRoad Developer API - Deployment"
echo "========================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    echo "Please run this script from services/developer/"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔨 Building Next.js application..."
npm run build

echo ""
echo "✅ Build complete!"
echo ""
echo "🎯 Next steps:"
echo ""
echo "1. Start the server:"
echo "   npm start"
echo ""
echo "2. Or deploy to Railway:"
echo "   railway up"
echo ""
echo "3. Or deploy to Vercel:"
echo "   vercel --prod"
echo ""
echo "4. Visit your deployment at:"
echo "   http://localhost:3003         (local)"
echo "   https://developer.blackroad.io (production)"
echo ""
echo "📚 Documentation:"
echo "   • Homepage:  /"
echo "   • Dashboard: /dashboard"
echo "   • API Docs:  /docs"
echo ""
echo "🎉 Ready to go!"
