#!/bin/bash

# Set environment variables for Railway projects
# Usage: ./scripts/set-env-vars.sh <project_number>
# Example: ./scripts/set-env-vars.sh 01

set -e  # Exit on error

PROJECT_NUM=$1

if [ -z "$PROJECT_NUM" ]; then
  echo "❌ Error: Project number required"
  echo "Usage: ./scripts/set-env-vars.sh <project_number>"
  echo "Example: ./scripts/set-env-vars.sh 01"
  exit 1
fi

# Railway Project IDs
declare -A RAILWAY_PROJECTS=(
  ["01"]="9d3d2549-3778-4c86-8afd-cefceaaa74d2"
  ["02"]="6d4ab1b5-3e97-460e-bba0-4db86691c476"
  ["03"]="aa968fb7-ec35-4a8b-92dc-1eba70fa8478"
  ["04"]="e8b256aa-8708-4eb2-ba24-99eba4fe7c2e"
  ["05"]="85e6de55-fefd-4e8d-a9ec-d20c235c2551"
  ["06"]="8ac583cb-ffad-40bd-8676-6569783274d1"
  ["07"]="b61ecd98-adb2-4788-a2e0-f98e322af53a"
)

PROJECT_ID="${RAILWAY_PROJECTS[$PROJECT_NUM]}"

if [ -z "$PROJECT_ID" ]; then
  echo "❌ Error: Invalid project number: $PROJECT_NUM"
  exit 1
fi

echo "🔐 Setting environment variables for Project $PROJECT_NUM"
echo ""

# Link to project
railway link "$PROJECT_ID"

# Project-specific environment variables
case $PROJECT_NUM in
  "01"|"02")
    echo "📋 RoadWork Environment Variables"
    echo ""

    # Check if .env.local exists
    if [ -f "roadwork/.env.local" ]; then
      echo "✅ Found roadwork/.env.local"
      echo ""
      read -p "Load variables from .env.local? (y/N) " -n 1 -r
      echo
      if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Load from .env.local
        set -a
        source roadwork/.env.local
        set +a

        echo "Setting variables from .env.local..."

        # AI Services
        [ ! -z "$ANTHROPIC_API_KEY" ] && railway variables set ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY"
        [ ! -z "$OPENAI_API_KEY" ] && railway variables set OPENAI_API_KEY="$OPENAI_API_KEY"

        # Email
        [ ! -z "$SENDGRID_API_KEY" ] && railway variables set SENDGRID_API_KEY="$SENDGRID_API_KEY"
        [ ! -z "$SENDGRID_FROM_EMAIL" ] && railway variables set SENDGRID_FROM_EMAIL="$SENDGRID_FROM_EMAIL"

        # Payment
        [ ! -z "$STRIPE_SECRET_KEY" ] && railway variables set STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY"
        [ ! -z "$STRIPE_PUBLISHABLE_KEY" ] && railway variables set STRIPE_PUBLISHABLE_KEY="$STRIPE_PUBLISHABLE_KEY"
        [ ! -z "$STRIPE_WEBHOOK_SECRET" ] && railway variables set STRIPE_WEBHOOK_SECRET="$STRIPE_WEBHOOK_SECRET"

        # JWT
        [ ! -z "$JWT_SECRET_KEY" ] && railway variables set JWT_SECRET_KEY="$JWT_SECRET_KEY"
        [ ! -z "$JWT_ALGORITHM" ] && railway variables set JWT_ALGORITHM="$JWT_ALGORITHM"
        [ ! -z "$ACCESS_TOKEN_EXPIRE_MINUTES" ] && railway variables set ACCESS_TOKEN_EXPIRE_MINUTES="$ACCESS_TOKEN_EXPIRE_MINUTES"

        # Encryption
        [ ! -z "$FERNET_KEY" ] && railway variables set FERNET_KEY="$FERNET_KEY"

        # Google OAuth
        [ ! -z "$GOOGLE_CLIENT_ID" ] && railway variables set GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID"
        [ ! -z "$GOOGLE_CLIENT_SECRET" ] && railway variables set GOOGLE_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET"
        [ ! -z "$GOOGLE_REDIRECT_URI" ] && railway variables set GOOGLE_REDIRECT_URI="$GOOGLE_REDIRECT_URI"

        # URLs
        [ ! -z "$API_URL" ] && railway variables set API_URL="$API_URL"
        [ ! -z "$FRONTEND_URL" ] && railway variables set FRONTEND_URL="$FRONTEND_URL"
        [ ! -z "$ENVIRONMENT" ] && railway variables set ENVIRONMENT="$ENVIRONMENT"

        # Monitoring
        [ ! -z "$SENTRY_DSN" ] && railway variables set SENTRY_DSN="$SENTRY_DSN"

        # Rate Limiting
        [ ! -z "$MAX_REQUESTS_PER_MINUTE" ] && railway variables set MAX_REQUESTS_PER_MINUTE="$MAX_REQUESTS_PER_MINUTE"

        # Application Limits
        [ ! -z "$FREE_TIER_DAILY_LIMIT" ] && railway variables set FREE_TIER_DAILY_LIMIT="$FREE_TIER_DAILY_LIMIT"
        [ ! -z "$PRO_TIER_DAILY_LIMIT" ] && railway variables set PRO_TIER_DAILY_LIMIT="$PRO_TIER_DAILY_LIMIT"
        [ ! -z "$PREMIUM_TIER_DAILY_LIMIT" ] && railway variables set PREMIUM_TIER_DAILY_LIMIT="$PREMIUM_TIER_DAILY_LIMIT"

        echo ""
        echo "✅ Environment variables set!"
      fi
    else
      echo "⚠️  .env.local not found"
      echo "Create roadwork/.env.local with your API keys first"
      echo ""
      echo "Example:"
      echo "  cp roadwork/.env.example roadwork/.env.local"
      echo "  # Edit .env.local with your keys"
      echo "  ./scripts/set-env-vars.sh $PROJECT_NUM"
    fi
    ;;

  "03")
    echo "📋 BlackRoad Core Services Environment Variables"
    railway variables set NODE_ENV="production"
    railway variables set PORT="8080"
    echo "✅ Basic variables set"
    ;;

  "04")
    echo "📋 BlackRoad Operator Environment Variables"
    echo ""
    echo "⚠️  Required: ANTHROPIC_API_KEY, OPENAI_API_KEY"
    echo ""
    read -p "Enter ANTHROPIC_API_KEY: " anthropic_key
    read -p "Enter OPENAI_API_KEY: " openai_key

    railway variables set ANTHROPIC_API_KEY="$anthropic_key"
    railway variables set OPENAI_API_KEY="$openai_key"
    railway variables set NODE_ENV="production"
    railway variables set PORT="8080"

    echo "✅ Operator variables set"
    ;;

  "05")
    echo "📋 BlackRoad Master Environment Variables"
    railway variables set NODE_ENV="production"
    railway variables set PORT="8080"
    echo "✅ Master variables set"
    ;;

  "06")
    echo "📋 BlackRoad Beacon Environment Variables"
    railway variables set NODE_ENV="production"
    railway variables set PORT="8080"

    echo ""
    echo "Optional: Set monitoring URLs"
    read -p "Set monitoring URLs now? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      read -p "SLACK_WEBHOOK_URL: " slack_url
      [ ! -z "$slack_url" ] && railway variables set SLACK_WEBHOOK_URL="$slack_url"

      railway variables set ALERT_EMAIL="blackroad.systems@gmail.com"
    fi

    echo "✅ Beacon variables set"
    ;;

  "07")
    echo "📋 BlackRoad Packs Environment Variables"
    echo ""
    read -p "Enter ANTHROPIC_API_KEY: " anthropic_key

    railway variables set ANTHROPIC_API_KEY="$anthropic_key"
    railway variables set PORT="8080"

    echo "✅ Pack variables set"
    echo "⚠️  Remember to set PACK_NAME for each pack service"
    ;;

  *)
    echo "⚠️  No environment variable template for project $PROJECT_NUM"
    ;;
esac

echo ""
echo "📊 Current variables:"
railway variables

echo ""
echo "✅ Done!"
echo ""
