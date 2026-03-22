#!/bin/bash
# br domain-deploy <domain> — Deploy domain site to Gematria + Anastasia
# Usage: br domain-deploy blackroad.io
#        br domain-deploy --all

set -e
PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
RESET='\033[0m'

DOMAINS=(blackroad.company blackroad.io blackroad.me blackroad.network blackroad.systems blackroadai.com blackroadinc.us blackroadqi.com blackroadquantum.com blackroadquantum.info blackroadquantum.net blackroadquantum.shop blackroadquantum.store lucidia.earth lucidia.studio lucidiaqi.com roadchain.io roadcoin.io blackboxprogramming.io)

deploy_domain() {
  local domain="$1"
  echo -e "${PINK}Deploying ${domain}...${RESET}"
  
  TMPDIR=$(mktemp -d)
  cd "$TMPDIR"
  git clone --depth 1 "https://github.com/BlackRoad-OS-Inc/${domain}.git" . 2>/dev/null
  
  if [ -d "web/public" ]; then
    scp -r web/public/* "gematria:/var/www/${domain}/" 2>/dev/null && echo -e "  ${GREEN}→ Gematria${RESET}"
    scp -r web/public/* "anastasia:/srv/domains/${domain}/" 2>/dev/null && echo -e "  ${GREEN}→ Anastasia${RESET}"
  else
    echo "  ⚠️  No web/public/ directory"
  fi
  
  rm -rf "$TMPDIR"
  echo -e "${GREEN}✅ ${domain}${RESET}"
}

if [ "$1" = "--all" ]; then
  for d in "${DOMAINS[@]}"; do
    deploy_domain "$d"
  done
  echo -e "\n${GREEN}All 19 domains deployed.${RESET}"
elif [ -n "$1" ]; then
  deploy_domain "$1"
else
  echo "Usage: br domain-deploy <domain>"
  echo "       br domain-deploy --all"
  echo ""
  echo "Domains:"
  printf '  %s\n' "${DOMAINS[@]}"
fi
