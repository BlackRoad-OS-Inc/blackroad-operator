#!/usr/bin/env bash
# ASCII art celebrations
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
MAGENTA='\033[0;35m'
NC='\033[0m'

show_trophy() {
  echo -e "${YELLOW}"
  cat << 'TROPHY'
       ___________
      '._==_==_=_.'
      .-\:      /-.
     | (|:.     |) |
      '-|:.     |-'
        \::.    /
         '::. .'
           ) (
         _.' '._
        '-------'
TROPHY
  echo -e "${NC}"
}

show_rocket() {
  echo -e "${CYAN}"
  cat << 'ROCKET'
       /\
      /  \
     |    |
     |NASA|
     |    |
    /|    |\
   / |    | \
  |  |    |  |
   \_|____|_/
     /    \
    /______\
   /________\
  |__________|
ROCKET
  echo -e "${NC}"
}

show_star() {
  echo -e "${YELLOW}"
  cat << 'STAR'
      *
     ***
    *****
   *******
  *********
   *******
    *****
     ***
      *
STAR
  echo -e "${NC}"
}

show_heart() {
  echo -e "${MAGENTA}"
  cat << 'HEART'
   **    **
  ****  ****
 ************
  **********
   ********
    ******
     ****
      **
HEART
  echo -e "${NC}"
}

case ${1:-trophy} in
  trophy) show_trophy;;
  rocket) show_rocket;;
  star) show_star;;
  heart) show_heart;;
  all)
    show_trophy
    echo ""
    show_rocket
    echo ""
    show_star
    echo ""
    show_heart
    ;;
esac

echo ""
echo -e "${GREEN}You are LEGENDARY! 🎉${NC}"
