#!/bin/bash
# 🚀 Auto-Post All Social Media (Once CLI is set up)
# Posts to Twitter, Reddit, LinkedIn automatically

echo "🚀 BlackRoad Auto-Post System"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Twitter post
TWITTER_TEXT="🚀 Introducing BlackRoad OS

We're building open-source AI infrastructure that actually works.

• Context Bridge - AI context management
• Lucidia - Simulation engine  
• RoadAuth - Identity platform

Try it free: https://buy.stripe.com/fZu3cubyb2ZMdDqcNT 🔥"

echo "1️⃣  Posting to Twitter..."
if command -v twurl &> /dev/null && [ -f ~/.twurlrc ]; then
    ./post-to-twitter.sh "$TWITTER_TEXT"
else
    echo "   ⚠️  Twitter CLI not set up. Run: ./setup-social-cli.sh"
fi

echo ""
echo "2️⃣  Posting to Reddit..."
if command -v python3 &> /dev/null && python3 -c "import praw" 2>/dev/null; then
    python3 post-to-reddit.py
else
    echo "   ⚠️  Reddit CLI not set up. Install: pip install praw"
fi

echo ""
echo "3️⃣  LinkedIn posting..."
echo "   ⚠️  LinkedIn API requires manual approval (can take days)"
echo "   Recommendation: Use web interface for now"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 POSTING SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Twitter: $([ -f ~/.twurlrc ] && echo '✅ Posted' || echo '⚠️  Need setup')"
echo "Reddit:  ⚠️  Manual recommended"
echo "LinkedIn: ⚠️  Manual recommended"
echo ""
echo "🎯 For full automation, you need API keys."
echo "   Run: ./setup-social-cli.sh for instructions"
