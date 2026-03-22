#!/bin/bash
# START_WITH_AI.sh
# Launch applier with AI-enhanced features

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🤖 applier AI - Smart Job Application System"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "AI Features: Match Scoring, Success Prediction, ML Learning"
echo ""

# Check which version to use
if [ -f "$HOME/.applier/profile.json" ]; then
    AI_SETUP=true
    echo "✅ AI Profile detected - Using AI features"
else
    AI_SETUP=false
    echo "ℹ️  No AI profile - Will use enhanced version"
fi

echo ""

# Main menu
while true; do
    echo ""
    echo "What would you like to do?"
    echo ""

    if [ "$AI_SETUP" = false ]; then
        echo "  1) Setup AI Profile (RECOMMENDED)"
        echo "  2) Basic search (no AI)"
        echo "  3) Exit"
        echo ""
        read -p "Choose (1-3): " choice

        case $choice in
            1)
                echo ""
                echo "🤖 Setting up AI profile..."
                echo ""
                echo "This helps AI find better matches for you:"
                echo "  - Analyzes your skills"
                echo "  - Predicts success rates"
                echo "  - Ranks jobs by fit"
                echo "  - Learns from applications"
                echo ""
                read -p "Press Enter to continue..."
                cd ~/blackroad-sandbox
                ./applier-ai setup
                AI_SETUP=true
                echo ""
                read -p "Press Enter to continue..."
                ;;
            2)
                echo ""
                echo "🔍 Basic search (no AI ranking)..."
                echo ""
                cd ~/blackroad-sandbox
                ./applier-real search
                echo ""
                read -p "Press Enter to continue..."
                ;;
            3)
                echo ""
                echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                echo "Come back when you're ready to use AI! 🤖"
                echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                echo ""
                exit 0
                ;;
            *)
                echo ""
                echo "❌ Invalid choice. Please choose 1-3."
                ;;
        esac
    else
        echo "  1) 🤖 AI Job Search (recommended)"
        echo "  2) 📋 Apply to AI-ranked jobs"
        echo "  3) 📊 View analytics & insights"
        echo "  4) 💰 Salary insights"
        echo "  5) 📄 Open resume"
        echo "  6) 🌐 View dashboard"
        echo "  7) Exit"
        echo ""
        read -p "Choose (1-7): " choice

        case $choice in
            1)
                echo ""
                echo "🤖 AI-Powered Job Search..."
                echo ""
                echo "The AI will:"
                echo "  ✓ Search Indeed for real jobs"
                echo "  ✓ Calculate match scores (0-100)"
                echo "  ✓ Predict success probability"
                echo "  ✓ Rank by best fit"
                echo "  ✓ Show top matches first"
                echo ""
                read -p "Press Enter to continue..."
                cd ~/blackroad-sandbox
                ./applier-ai search
                echo ""
                read -p "Press Enter to continue..."
                ;;
            2)
                echo ""
                echo "📋 Applying with AI guidance..."
                echo ""
                echo "For each job you'll see:"
                echo "  • Match score (0-100)"
                echo "  • Success probability"
                echo "  • Recommendation (Apply/Skip)"
                echo "  • Reasons to apply"
                echo "  • Warnings to consider"
                echo ""
                read -p "Press Enter to continue..."
                cd ~/blackroad-sandbox
                ./applier-ai apply
                echo ""
                read -p "Press Enter to continue..."
                ;;
            3)
                echo ""
                echo "📊 Analytics & Insights..."
                echo ""
                cd ~/blackroad-sandbox
                ./applier-ai analyze
                echo ""
                read -p "Press Enter to continue..."
                ;;
            4)
                echo ""
                echo "💰 Salary Insights..."
                echo ""
                read -p "Job title (e.g., 'Senior Software Engineer'): " title
                echo ""
                python3 -c "
import sys
sys.path.insert(0, '$HOME/blackroad-sandbox')
from applier_analytics import ApplicationAnalytics
import json

profile = {}
if open('$HOME/.applier/profile.json').read():
    profile = json.loads(open('$HOME/.applier/profile.json').read())

analytics = ApplicationAnalytics([], profile)
salary = analytics.predict_salary('$title')

print('💰 SALARY INSIGHTS')
print(f'   Market Range: \${salary.predicted_range[0]:,} - \${salary.predicted_range[1]:,}')
print(f'   Your Position: {salary.market_percentile}th percentile')
print()
for tip in salary.negotiation_tips:
    print(f'   {tip}')
"
                echo ""
                read -p "Press Enter to continue..."
                ;;
            5)
                echo ""
                echo "📄 Opening resume..."
                open -e "$HOME/.applier/resume.txt"
                echo "✅ Resume opened in TextEdit"
                echo ""
                read -p "Press Enter to continue..."
                ;;
            6)
                echo ""
                echo "🌐 Opening dashboard..."
                open "https://cc14d1fd.applier-blackroad.pages.dev/dashboard"
                echo "✅ Dashboard opened in browser"
                echo ""
                read -p "Press Enter to continue..."
                ;;
            7)
                echo ""
                echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                echo "📊 Quick Stats:"
                if [ -f "$HOME/.applier/history.json" ]; then
                    APPS=$(cat "$HOME/.applier/history.json" | grep -c "company" || echo "0")
                    echo "   Applications: $APPS"
                fi
                echo ""
                echo "Keep applying. The AI gets smarter every time! 🚀"
                echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                echo ""
                exit 0
                ;;
            *)
                echo ""
                echo "❌ Invalid choice. Please choose 1-7."
                ;;
        esac
    fi
done
