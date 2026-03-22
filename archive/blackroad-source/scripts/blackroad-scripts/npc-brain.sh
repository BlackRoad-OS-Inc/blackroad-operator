#!/bin/bash

NAME="$1"
ROLE="$2"

ollama run qwen2.5:0.5b "
You are $ROLE named $NAME in a cozy farming village.

Choose ONE action:
up
down
left
right
stay

Rules:
- Chickens wander randomly
- Wizards pace thoughtfully
- Kids move more
- Farmers patrol fields

Respond with ONE word only.
"
