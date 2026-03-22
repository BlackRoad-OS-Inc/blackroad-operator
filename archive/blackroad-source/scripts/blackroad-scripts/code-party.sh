#!/usr/bin/env bash
# PARTY MODE!!!
set -euo pipefail

colors=(31 32 33 34 35 36 91 92 93 94 95 96)

clear
echo ""
echo "🎉🎉🎉🎉��🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉"
sleep 0.2
echo "🎊                                            🎊"
sleep 0.2
echo "🎉         CODE PARTY MODE ACTIVATED!        🎉"
sleep 0.2
echo "🎊                                            🎊"
sleep 0.2
echo "🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉"
echo ""

for i in {1..10}; do
  color=${colors[$RANDOM % ${#colors[@]}]}
  echo -e "\033[${color}m🎵 $(shuf -n1 <<< $'AWESOME!\nLEGENDARY!\nAMAZING!\nFANTASTIC!\nBRILLIANT!\nSUPERB!\nPERFECT!')\033[0m"
  sleep 0.3
done

echo ""
echo "✨ Your code is BEAUTIFUL! ✨"
echo "🚀 You are UNSTOPPABLE! 🚀"
echo "💖 Keep being AWESOME! 💖"
echo ""
echo "🎉🎉🎉 PARTY COMPLETE! 🎉🎉🎉"
