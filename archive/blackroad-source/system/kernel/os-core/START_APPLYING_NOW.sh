#!/bin/bash
# START_APPLYING_NOW.sh
# Quick start script to begin your job search immediately

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚗 applier - Your Job Application System"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Everything is ready. Let's get you hired."
echo ""

# Check if setup is done
if [ ! -f "$HOME/.applier/config.json" ]; then
    echo "📝 First time setup needed..."
    echo ""
    echo "This will take 2 minutes. You'll need:"
    echo "  1. Your name and email"
    echo "  2. A password"
    echo "  3. Your resume (copy/paste)"
    echo ""
    read -p "Press Enter to start setup..."

    cd ~/blackroad-sandbox
    ./applier-real setup

    echo ""
    echo "✅ Setup complete!"
    echo ""
fi

# Main menu
while true; do
    echo ""
    echo "What would you like to do?"
    echo ""
    echo "  1) Search for new jobs"
    echo "  2) Apply to saved jobs"
    echo "  3) List my applications"
    echo "  4) Open resume file"
    echo "  5) View web dashboard"
    echo "  6) Exit"
    echo ""
    read -p "Choose (1-6): " choice

    case $choice in
        1)
            echo ""
            echo "🔍 Let's find some jobs..."
            echo ""
            cd ~/blackroad-sandbox
            ./applier-real search
            echo ""
            read -p "Press Enter to continue..."
            ;;
        2)
            echo ""
            echo "📋 Let's apply to jobs..."
            echo ""
            cd ~/blackroad-sandbox
            ./applier-real apply
            echo ""
            read -p "Press Enter to continue..."
            ;;
        3)
            echo ""
            echo "📊 Your applications..."
            echo ""
            cd ~/blackroad-sandbox
            ./applier-real list
            echo ""
            read -p "Press Enter to continue..."
            ;;
        4)
            echo ""
            echo "📄 Opening resume..."
            open -e "$HOME/.applier/resume.txt"
            echo "✅ Resume opened in TextEdit"
            echo ""
            read -p "Press Enter to continue..."
            ;;
        5)
            echo ""
            echo "🌐 Opening dashboard..."
            open "https://cc14d1fd.applier-blackroad.pages.dev/dashboard"
            echo "✅ Dashboard opened in browser"
            echo ""
            read -p "Press Enter to continue..."
            ;;
        6)
            echo ""
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo "Keep going. You got this. 💪"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo ""
            exit 0
            ;;
        *)
            echo ""
            echo "❌ Invalid choice. Please choose 1-6."
            ;;
    esac
done
