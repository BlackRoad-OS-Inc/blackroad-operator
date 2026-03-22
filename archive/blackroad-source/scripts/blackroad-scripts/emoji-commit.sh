#!/usr/bin/env bash
# Emoji commit helper
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GREEN='\033[0;32m'
NC='\033[0m'

clear
echo ""
echo -e "${CYAN}🎨 EMOJI COMMIT HELPER 🎨${NC}"
echo ""
echo "Choose your commit type:"
echo ""
echo "  1) ✨ feat     - New feature"
echo "  2) 🐛 fix      - Bug fix"
echo "  3) 📚 docs     - Documentation"
echo "  4) 💄 style    - Styling"
echo "  5) ♻️  refactor - Code refactor"
echo "  6) 🧪 test     - Tests"
echo "  7) 🔧 chore    - Maintenance"
echo "  8) 🚀 deploy   - Deployment"
echo ""

read -p "Type (1-8): " type

case $type in
  1) PREFIX="✨ feat:";;
  2) PREFIX="🐛 fix:";;
  3) PREFIX="📚 docs:";;
  4) PREFIX="💄 style:";;
  5) PREFIX="♻️ refactor:";;
  6) PREFIX="🧪 test:";;
  7) PREFIX="🔧 chore:";;
  8) PREFIX="🚀 deploy:";;
  *) PREFIX="✨ feat:";;
esac

echo ""
read -p "Message: " msg

FULL_MSG="$PREFIX $msg"

echo ""
echo -e "${YELLOW}Full commit:${NC}"
echo -e "${GREEN}$FULL_MSG${NC}"
echo ""

read -p "Commit? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  git add -A
  git commit -m "$FULL_MSG"
  echo -e "${GREEN}✓ Committed! 🎉${NC}"
fi
