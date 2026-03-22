#!/usr/bin/env bash
# Rainbow text generator
text="${1:-BLACKROAD ROCKS!}"

colors=(31 32 33 34 35 36 91 92 93 94 95 96)

echo ""
for ((i=0; i<${#text}; i++)); do
  char="${text:$i:1}"
  color=${colors[$((i % ${#colors[@]}))]}
  echo -ne "\033[${color}m$char\033[0m"
done
echo ""
echo ""
