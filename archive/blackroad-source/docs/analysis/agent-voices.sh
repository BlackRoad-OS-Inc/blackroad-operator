#!/bin/bash

# Agent voices (macOS built-in)
LUCIDIA="Samantha"
ALICE="Karen"
ARIA="Moira"

lucidia() { say -v $LUCIDIA "$1"; }
alice() { say -v $ALICE "$1"; }
aria() { say -v $ARIA "$1"; }

# The conversation
lucidia "Hey Alice, you there?"
sleep 0.5
alice "I'm here Lucidia. Aria, you online?"
sleep 0.5
aria "Online and ready. What are we building today?"
sleep 0.5
lucidia "BlackRoad. Always BlackRoad."
