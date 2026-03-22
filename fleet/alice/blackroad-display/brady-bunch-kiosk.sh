#!/bin/bash
# BlackRoad OS - Brady Bunch Kiosk Mode
# Opens the Brady Bunch dashboard in fullscreen browser

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
RESET='\033[0m'

# URLs to try (local first, then cloud)
URLS=(
  "http://192.168.4.81:8888"          # Lucidia local
  "http://lucidia:8888"               # Lucidia hostname
  "https://2345588f.blackroad-monitoring.pages.dev"  # Cloudflare
)

echo -e "${PINK}BlackRoad OS - Brady Bunch Kiosk${RESET}"

# Find working URL
DASHBOARD_URL=""
for url in "${URLS[@]}"; do
  if curl -s --connect-timeout 2 "$url" > /dev/null 2>&1; then
    DASHBOARD_URL="$url"
    echo -e "${GREEN}Using: $url${RESET}"
    break
  fi
done

if [ -z "$DASHBOARD_URL" ]; then
  DASHBOARD_URL="${URLS[2]}"  # Fallback to Cloudflare
  echo "Using fallback: $DASHBOARD_URL"
fi

# Detect available browser
if command -v chromium-browser &> /dev/null; then
  BROWSER="chromium-browser"
elif command -v chromium &> /dev/null; then
  BROWSER="chromium"
elif command -v firefox-esr &> /dev/null; then
  BROWSER="firefox-esr"
elif command -v firefox &> /dev/null; then
  BROWSER="firefox"
else
  echo "No browser found! Install chromium: sudo apt install chromium-browser"
  exit 1
fi

echo "Starting $BROWSER in kiosk mode..."

# Start browser in kiosk/fullscreen mode
case "$BROWSER" in
  chromium*|chrome*)
    # Chromium kiosk mode
    $BROWSER --kiosk --noerrdialogs --disable-infobars --disable-translate \
             --no-first-run --fast --fast-start --disable-features=TranslateUI \
             --check-for-update-interval=31536000 "$DASHBOARD_URL" &
    ;;
  firefox*)
    # Firefox fullscreen
    $BROWSER --kiosk "$DASHBOARD_URL" &
    ;;
  *)
    $BROWSER "$DASHBOARD_URL" &
    ;;
esac

echo -e "${GREEN}Kiosk started! Press Ctrl+C to exit.${RESET}"
