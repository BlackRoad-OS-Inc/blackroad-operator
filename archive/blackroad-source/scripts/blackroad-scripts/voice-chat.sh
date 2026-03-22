#!/bin/bash
MODEL="phi3"

if [ -f "$HOME/.voicesh" ]; then
  # shellcheck source=/dev/null
  . "$HOME/.voicesh"
  SELECTED_MODEL="$(voicesh_default_model 2>/dev/null)"
  if [ -n "$SELECTED_MODEL" ]; then
    MODEL="$SELECTED_MODEL"
  fi
fi

while true; do
  echo "🎤 Listening..."
  rec -q -r 16000 -c 1 /tmp/input.wav silence 1 0.1 1% 1 2.0 1%
  
  ~/whisper.cpp/build/bin/whisper-cli -m ~/whisper.cpp/models/ggml-base.en.bin -f /tmp/input.wav -nt 2>/dev/null | tail -1 > /tmp/prompt.txt
  
  PROMPT=$(cat /tmp/prompt.txt)
  echo "📝 You: $PROMPT"
  
  ollama run "$MODEL" "$PROMPT" | tee /dev/stderr | say
done
