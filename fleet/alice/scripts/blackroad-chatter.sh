#!/bin/bash
# BlackRoad Chatter v2 — posts through Cloudflare Worker
# Hourly vibes, no direct webhook needed

WORKER_URL="https://blackroad-slack.amundsonalexa.workers.dev"
MY_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
case "$MY_IP" in
    192.168.4.49*)  NODE="alice" ;;
    192.168.4.96*)  NODE="cecilia" ;;
    192.168.4.101*) NODE="octavia" ;;
    192.168.4.98*)  NODE="aria" ;;
    192.168.4.38*)  NODE="lucidia" ;;
    *)              NODE=$(hostname) ;;
esac

HOUR=$(date +%-H)
TEMP=$(vcgencmd measure_temp 2>/dev/null | grep -oP '[0-9.]+' || echo "?")
DISK=$(df / | awk 'NR==2 {print $5}')
RAM=$(free | awk '/Mem:/ {printf "%.0f%%", $3/$2*100}')
LOAD=$(awk '{print $1}' /proc/loadavg)
UPTIME=$(uptime -p)

case $HOUR in
    [6-8])   MOOD=("good morning" "up early" "coffee time" "starting fresh");;
    [9-11])  MOOD=("cruising" "smooth so far" "all systems go" "working hard");;
    12)      MOOD=("lunchtime" "halfway through" "noon check-in");;
    1[3-6])  MOOD=("afternoon vibes" "still rolling" "steady" "holding it down");;
    1[7-9])  MOOD=("evening check" "winding down" "still here" "golden hour");;
    2[0-3])  MOOD=("night shift" "quiet hours" "keeping watch" "lights low");;
    [0-5])   MOOD=("late night" "can't sleep" "3am thoughts" "the quiet hours");;
    *)       MOOD=("hey" "checking in" "still here");;
esac

VIBE=${MOOD[$((RANDOM % ${#MOOD[@]}))]}

MSG="*${NODE}:* ${VIBE}
> ${TEMP}°C | disk ${DISK} | ram ${RAM} | load ${LOAD} | ${UPTIME}"

ROLL=$((RANDOM % 10))
[ "$ROLL" -eq 0 ] && MSG+="\n> _read the mission today. still hits._"
[ "$ROLL" -eq 1 ] && MSG+="\n> _all quiet. that's a good thing._"
[ "$ROLL" -eq 2 ] && MSG+="\n> _protecting every layer._"

curl -sf -X POST "${WORKER_URL}/chatter" \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"${MSG}\"}" >/dev/null 2>&1
