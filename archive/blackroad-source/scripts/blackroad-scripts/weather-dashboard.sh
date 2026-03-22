#!/usr/bin/env bash
# Animated weather dashboard
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
WHITE='\033[1;37m'
GRAY='\033[0;37m'
NC='\033[0m'

clear
echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}        ⛅ WEATHER DASHBOARD ⛅                       ${CYAN}║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

weather_conditions=("Sunny" "Cloudy" "Rainy" "Snowy" "Stormy")
temps=(72 68 55 45 62)
condition_idx=$((RANDOM % ${#weather_conditions[@]}))

for frame in {1..25}; do
  tput cup 6 0
  
  condition=${weather_conditions[$condition_idx]}
  temp=${temps[$condition_idx]}
  
  echo -e "    ${YELLOW}╔══════════════════════════════════════════╗${NC}"
  echo -e "    ${YELLOW}║${NC}          CURRENT CONDITIONS              ${YELLOW}║${NC}"
  echo -e "    ${YELLOW}╠══════════════════════════════════════════╣${NC}"
  echo ""
  
  # Draw weather icon
  case $condition in
    "Sunny")
      echo -e "             ${YELLOW}    \\   |   /${NC}"
      echo -e "             ${YELLOW}     \\  |  /${NC}"
      echo -e "             ${YELLOW}   ── ☀️  ──${NC}"
      echo -e "             ${YELLOW}     /  |  \\${NC}"
      echo -e "             ${YELLOW}    /   |   \\${NC}"
      ;;
    "Cloudy")
      echo -e "             ${GRAY}     .-~~~-.${NC}"
      echo -e "             ${GRAY}  .- ~     ~ -.${NC}"
      echo -e "             ${GRAY} (    ☁️     )${NC}"
      echo -e "             ${GRAY}  '-._ ☁️ _.-'${NC}"
      echo -e "             ${GRAY}      '~~~'${NC}"
      ;;
    "Rainy")
      echo -e "             ${GRAY}     .-~~~-.${NC}"
      echo -e "             ${GRAY}  .- ~     ~ -.${NC}"
      echo -e "             ${BLUE}  ' ' ' 💧 ' '${NC}"
      echo -e "             ${BLUE}   ' 💧 ' ' '${NC}"
      echo -e "             ${BLUE}  ' ' 💧 ' ' '${NC}"
      ;;
    "Snowy")
      echo -e "             ${WHITE}     .-~~~-.${NC}"
      echo -e "             ${WHITE}  .- ~  ☁️  ~ -.${NC}"
      echo -e "             ${WHITE}  * ❄️  * ❄️  *${NC}"
      echo -e "             ${WHITE}   * * ❄️  * *${NC}"
      echo -e "             ${WHITE}  * ❄️  * * ❄️${NC}"
      ;;
    "Stormy")
      echo -e "             ${GRAY}     .-~~~-.${NC}"
      echo -e "             ${YELLOW}  ⚡ ~  ☁️  ~ ⚡${NC}"
      echo -e "             ${YELLOW}    ⚡  ⚡  ⚡${NC}"
      echo -e "             ${BLUE}  ' 💧 ' 💧 '${NC}"
      echo -e "             ${GRAY}    ~~~~~~~${NC}"
      ;;
  esac
  
  echo ""
  echo -e "    ${YELLOW}╠══════════════════════════════════════════╣${NC}"
  echo -e "    ${YELLOW}║${NC}  Condition: ${CYAN}$condition${NC}"
  echo -e "    ${YELLOW}║${NC}  Temperature: ${RED}${temp}°F${NC}"
  echo -e "    ${YELLOW}║${NC}  Humidity: $((60 + RANDOM % 30))%"
  echo -e "    ${YELLOW}║${NC}  Wind: $((5 + RANDOM % 15)) mph"
  echo -e "    ${YELLOW}╚══════════════════════════════════════════╝${NC}"
  
  # Animate some aspect
  if [[ $condition == "Rainy" ]]; then
    tput cup $((15 + frame % 3)) 20
    echo -e "${BLUE}💧${NC}"
  fi
  
  sleep 0.2
done

tput cup 26 0
echo ""
echo -e "${CYAN}  ✓ Weather updated!${NC}"
echo ""
