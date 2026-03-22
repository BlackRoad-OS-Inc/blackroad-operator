#!/bin/bash

# Deploy individual Railway project
# Usage: ./scripts/deploy-railway-project.sh <project_number>
# Example: ./scripts/deploy-railway-project.sh 01

set -e  # Exit on error

PROJECT_NUM=$1

if [ -z "$PROJECT_NUM" ]; then
  echo "❌ Error: Project number required"
  echo "Usage: ./scripts/deploy-railway-project.sh <project_number>"
  echo "Example: ./scripts/deploy-railway-project.sh 01"
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
  ["08"]="47f557cf-09b8-40df-8d77-b34f91ba90cc"
  ["09"]="1a039a7e-a60c-42c5-be68-e66f9e269209"
  ["10"]="21f5c719-4d84-4647-83bb-eacdae864f09"
  ["11"]="d7ff931b-1f04-4a9d-8f2a-66b33c369399"
  ["12"]="ce5ff80f-fc2f-4757-8b19-51c5a2c16080"
  ["13"]="a0a19f39-10e1-48d4-8873-c262cfd4c319"
  ["14"]="e790fa90-b70f-463e-98ac-d545a5b2b620"
)

declare -A PROJECT_NAMES=(
  ["01"]="RoadWork Production"
  ["02"]="RoadWork Staging"
  ["03"]="BlackRoad Core Services"
  ["04"]="BlackRoad Operator"
  ["05"]="BlackRoad Master"
  ["06"]="BlackRoad Beacon"
  ["07"]="BlackRoad Packs"
  ["08"]="Prism Console"
  ["09"]="BlackRoad Home"
  ["10"]="Available"
  ["11"]="Available"
  ["12"]="Available"
  ["13"]="Available"
  ["14"]="Available"
)

PROJECT_ID="${RAILWAY_PROJECTS[$PROJECT_NUM]}"
PROJECT_NAME="${PROJECT_NAMES[$PROJECT_NUM]}"

if [ -z "$PROJECT_ID" ]; then
  echo "❌ Error: Invalid project number: $PROJECT_NUM"
  echo "Valid project numbers: 01-14"
  exit 1
fi

echo "🚂 Deploying Railway Project $PROJECT_NUM: $PROJECT_NAME"
echo "📋 Project ID: $PROJECT_ID"
echo ""

# Link to Railway project
echo "🔗 Linking to Railway project..."
railway link "$PROJECT_ID"

echo ""
echo "✅ Linked to project: $PROJECT_NAME"
echo ""

# Project-specific deployment
case $PROJECT_NUM in
  "01")
    echo "🚀 Deploying RoadWork Production..."
    echo ""
    echo "📦 Step 1: Add PostgreSQL"
    railway add postgresql
    echo ""
    echo "📦 Step 2: Add Redis"
    railway add redis
    echo ""
    echo "📦 Step 3: Deploy API"
    cd roadwork
    railway up
    echo ""
    echo "📦 Step 4: Run database migrations"
    railway run alembic upgrade head
    echo ""
    echo "⚠️  Manual steps required:"
    echo "  1. Create Worker service in Railway dashboard"
    echo "     - Start command: celery -A worker.celery_app worker --loglevel=info"
    echo "  2. Create Beat service in Railway dashboard"
    echo "     - Start command: celery -A worker.celery_app beat --loglevel=info"
    echo "  3. Set all environment variables (see RAILWAY_PROJECT_CONFIGURATION.md)"
    ;;

  "02")
    echo "🚀 Deploying RoadWork Staging..."
    echo ""
    echo "📦 Step 1: Add PostgreSQL"
    railway add postgresql
    echo ""
    echo "📦 Step 2: Add Redis"
    railway add redis
    echo ""
    echo "📦 Step 3: Deploy API"
    cd roadwork
    railway up
    echo ""
    echo "⚠️  Remember to set ENVIRONMENT=staging"
    ;;

  "03")
    echo "🚀 Deploying BlackRoad Core Services..."
    echo ""
    echo "📦 Step 1: Add PostgreSQL"
    railway add postgresql
    echo ""
    echo "📦 Step 2: Add Redis"
    railway add redis
    echo ""
    echo "📦 Step 3: Deploy Core Service"
    railway up
    echo ""
    echo "⚠️  Manual step: Deploy Core API service separately"
    ;;

  "04")
    echo "🚀 Deploying BlackRoad Operator..."
    echo ""
    echo "📦 Step 1: Add PostgreSQL"
    railway add postgresql
    echo ""
    echo "📦 Step 2: Deploy Operator"
    cd _personal/BlackRoad-Operating-System/operator_engine
    railway up
    ;;

  "05")
    echo "🚀 Deploying BlackRoad Master..."
    echo ""
    echo "📦 Step 1: Add PostgreSQL"
    railway add postgresql
    echo ""
    echo "📦 Step 2: Deploy Master"
    cd blackroad-os-master
    railway up
    ;;

  "06")
    echo "🚀 Deploying BlackRoad Beacon..."
    echo ""
    echo "📦 Step 1: Add Redis"
    railway add redis
    echo ""
    echo "📦 Step 2: Deploy Beacon"
    cd _personal/BlackRoad-Operating-System/services/beacon
    railway up
    ;;

  "07")
    echo "🚀 Deploying BlackRoad Packs..."
    echo ""
    echo "📦 Step 1: Add PostgreSQL"
    railway add postgresql
    echo ""
    echo "⚠️  Manual steps required:"
    echo "  Deploy each pack service separately in Railway dashboard:"
    echo "  1. pack-finance"
    echo "  2. pack-legal"
    echo "  3. pack-research-lab"
    echo "  4. pack-creator-studio"
    echo "  5. pack-infra-devops"
    ;;

  "08")
    echo "🚀 Deploying Prism Console..."
    echo ""
    echo "💡 Recommendation: Use Cloudflare Pages instead (free)"
    echo ""
    echo "If deploying to Railway:"
    cd _personal/BlackRoad-Operating-System/prism-console
    railway up
    ;;

  "09")
    echo "🚀 Deploying BlackRoad Home..."
    echo ""
    echo "💡 Recommendation: Use Cloudflare Pages instead (free)"
    echo ""
    echo "If deploying to Railway:"
    cd _personal/BlackRoad-Operating-System/blackroad-os-home
    railway up
    ;;

  *)
    echo "⚠️  Project $PROJECT_NUM is available for future use"
    echo "No deployment configured yet."
    ;;
esac

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📊 Check status:"
echo "  railway status"
echo "  railway logs -f"
echo "  railway open"
echo ""
