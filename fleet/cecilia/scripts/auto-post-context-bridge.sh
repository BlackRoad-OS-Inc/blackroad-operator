#!/bin/bash
# Automated social media posting for Context Bridge launch

set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
RESET='\033[0m'

echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${PINK}    🚀 AUTOMATED SOCIAL MEDIA POSTING${RESET}"
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo

# Check for Twitter API credentials
if [ -f ~/.twitter_api_keys ]; then
    echo -e "${GREEN}✓${RESET} Twitter API keys found"
    source ~/.twitter_api_keys
else
    echo -e "${BLUE}[INFO]${RESET} Twitter API not configured"
    echo "To enable auto-posting, create ~/.twitter_api_keys with:"
    echo "  TWITTER_API_KEY=..."
    echo "  TWITTER_API_SECRET=..."
    echo "  TWITTER_ACCESS_TOKEN=..."
    echo "  TWITTER_ACCESS_SECRET=..."
    echo
fi

# Create Twitter post script
cat > ~/post-to-twitter.sh << 'TWEET'
#!/bin/bash
# Post to Twitter using API

TWEET_TEXT="$1"

if [ -f ~/.twitter_api_keys ]; then
    source ~/.twitter_api_keys
    
    # Using Twitter API v2
    curl -X POST "https://api.twitter.com/2/tweets" \
      -H "Authorization: Bearer $TWITTER_BEARER_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"text\": \"$TWEET_TEXT\"}"
else
    echo "Twitter API not configured. Opening Twitter manually..."
    echo "Tweet text copied to clipboard:"
    echo "$TWEET_TEXT"
    echo "$TWEET_TEXT" | pbcopy
    open "https://twitter.com/intent/tweet?text=$(echo "$TWEET_TEXT" | jq -sRr @uri)"
fi
TWEET

chmod +x ~/post-to-twitter.sh

# Create Reddit post script
cat > ~/post-to-reddit.sh << 'REDDIT'
#!/bin/bash
# Post to Reddit

SUBREDDIT="$1"
TITLE="$2"
URL="$3"

if [ -f ~/.reddit_api_keys ]; then
    source ~/.reddit_api_keys
    
    # Get OAuth token
    TOKEN=$(curl -X POST -u "$REDDIT_CLIENT_ID:$REDDIT_CLIENT_SECRET" \
      --data "grant_type=password&username=$REDDIT_USERNAME&password=$REDDIT_PASSWORD" \
      https://www.reddit.com/api/v1/access_token | jq -r '.access_token')
    
    # Post submission
    curl -X POST "https://oauth.reddit.com/api/submit" \
      -H "Authorization: Bearer $TOKEN" \
      -H "User-Agent: context-bridge-bot/1.0" \
      -d "kind=link&sr=$SUBREDDIT&title=$TITLE&url=$URL"
else
    echo "Reddit API not configured. Opening Reddit manually..."
    echo "Title: $TITLE"
    echo "URL: $URL"
    open "https://www.reddit.com/r/$SUBREDDIT/submit?url=$(echo "$URL" | jq -sRr @uri)&title=$(echo "$TITLE" | jq -sRr @uri)"
fi
REDDIT

chmod +x ~/post-to-reddit.sh

# Create HackerNews post script
cat > ~/post-to-hackernews.sh << 'HN'
#!/bin/bash
# Post to HackerNews

TITLE="$1"
URL="$2"

echo "Opening HackerNews submit page..."
echo "Title: $TITLE"
echo "URL: $URL"

# Copy title to clipboard
echo "$TITLE" | pbcopy

# Open HN submit
open "https://news.ycombinator.com/submit"

echo
echo "Title copied to clipboard!"
echo "Paste it in the form and add URL: $URL"
HN

chmod +x ~/post-to-hackernews.sh

echo -e "${GREEN}✓${RESET} Automation scripts created"
echo

# Execute posts
echo -e "${BLUE}[TWITTER]${RESET} Preparing thread..."

TWEET1="🧵 1/5 Ever hit the context limit in Claude/ChatGPT mid-project?

Your AI forgets everything. You have to re-explain. Productivity dies.

I built Context Bridge to fix this. Here's how it works:

🔗 https://context-bridge.pages.dev"

echo "$TWEET1"
echo
read -p "Post this to Twitter? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ~/post-to-twitter.sh "$TWEET1"
    echo -e "${GREEN}✓${RESET} Tweet 1 posted (or opened in browser)"
fi

echo
echo -e "${BLUE}[REDDIT]${RESET} Preparing r/SideProject post..."

REDDIT_TITLE="Context Bridge - Unlimited AI context for \$10/mo (just launched!)"
REDDIT_URL="https://context-bridge.pages.dev"

read -p "Post to Reddit? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ~/post-to-reddit.sh "SideProject" "$REDDIT_TITLE" "$REDDIT_URL"
    echo -e "${GREEN}✓${RESET} Reddit post created (or opened in browser)"
fi

echo
echo -e "${BLUE}[HACKERNEWS]${RESET} Preparing HN submission..."

HN_TITLE="Context Bridge – Unlimited context for AI coding assistants"
HN_URL="https://context-bridge.pages.dev"

read -p "Post to HackerNews? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ~/post-to-hackernews.sh "$HN_TITLE" "$HN_URL"
    echo -e "${GREEN}✓${RESET} HN submission opened"
fi

echo
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${GREEN}✅ POSTS READY!${RESET} Check your browser windows"
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo
echo "Next: Engage with comments as they come in!"
echo "Monitor: https://dashboard.stripe.com"
