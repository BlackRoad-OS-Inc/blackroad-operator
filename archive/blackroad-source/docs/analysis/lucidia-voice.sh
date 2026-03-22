#!/bin/bash
WHISPER="/opt/homebrew/Cellar/whisper-cpp/1.8.3/bin/whisper-cli"
MODEL="$HOME/.models/ggml-base.en.bin"
AGENTS=(Cecilia alice anastasia aria)

echo "🔊 Agent chain online"
while true; do
  rec -q /tmp/in.wav rate 16k silence 1 0.1 1% 1 1.5 1%
  TEXT=$($WHISPER -m "$MODEL" -f /tmp/in.wav -nt 2>/dev/null | grep -v "^\[" | tail -1 | xargs)
  [[ -z "$TEXT" ]] && continue
  
  echo "👤 $TEXT"
  
  CURRENT="$TEXT"
  for AGENT in "${AGENTS[@]}"; do
    echo "🔄 $AGENT thinking..."
    REPLY=$(ollama run "$AGENT" "Previous: $CURRENT. Add your perspective briefly.")
    echo "🌙 [$AGENT] $REPLY"
    say "$REPLY"
    CURRENT="$REPLY"
  done
done
