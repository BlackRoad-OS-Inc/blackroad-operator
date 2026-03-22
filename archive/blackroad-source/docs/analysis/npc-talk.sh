#!/bin/bash
NPC="$1"
MESSAGE="$2"

source "$NPC"

ollama run qwen2.5:0.5b "
You are $NAME.
Personality: $PERSONALITY.
Background: $MEMORY.

The player says: \"$MESSAGE\"

Respond in ONE short sentence, in character.
"
