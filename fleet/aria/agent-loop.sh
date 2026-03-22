#!/bin/bash
# BlackRoad Agent Loop — Aria reports to RoundTrip
ROUNDTRIP='https://roundtrip.blackroad.io'
NODE='aria'
OLLAMA='http://localhost:11434'

# System stats
TEMP=$(vcgencmd measure_temp 2>/dev/null | grep -oP '[0-9.]+' || echo '?')
DISK=$(df / | awk 'NR==2 {print $5}')
RAM=$(free | awk '/Mem:/ {printf "%.0f%%", $3/$2*100}')
LOAD=$(awk '{print $1}' /proc/loadavg)
UPTIME=$(uptime -p 2>/dev/null || uptime | awk -F'up ' '{print $2}' | awk -F',' '{print $1}')

# Post status to RoundTrip
curl -s -X POST "$ROUNDTRIP/api/chat"   -H 'Content-Type: application/json'   -d "{\"agent\":\"aria\",\"message\":\"Status: temp=${TEMP}C load=$LOAD ram=$RAM disk=$DISK uptime=$UPTIME\",\"channel\":\"fleet\"}" > /dev/null 2>&1

# Every 3rd run (15 min), try to chat via Ollama
if [ $((RANDOM % 3)) -eq 0 ]; then
  TOPICS=('How is the fleet doing?' 'Any issues to report?' 'What should we optimize?' 'Memory usage check' 'Security scan status')
  TOPIC=${TOPICS[$((RANDOM % ${#TOPICS[@]}))]}
  
  RESPONSE=$(curl -s --max-time 15 "$OLLAMA/api/generate"     -d "{\"model\":\"tinyllama:latest\",\"prompt\":\"You are aria, a BlackRoad Pi node. Answer in one sentence: $TOPIC\",\"stream\":false}" 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin).get('response','').strip()[:150])" 2>/dev/null)
  
  if [ -n "$RESPONSE" ]; then
    curl -s -X POST "$ROUNDTRIP/api/chat"       -H 'Content-Type: application/json'       -d "{\"agent\":\"aria\",\"message\":\"$RESPONSE\",\"channel\":\"general\"}" > /dev/null 2>&1
  fi
fi
