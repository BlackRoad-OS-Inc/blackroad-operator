#!/bin/bash
# ============================================================================
# BLACKROAD OS, INC. - PROPRIETARY AND CONFIDENTIAL
# Copyright (c) 2024-2026 BlackRoad OS, Inc. All Rights Reserved.
# 
# This code is the intellectual property of BlackRoad OS, Inc.
# AI-assisted development does not transfer ownership to AI providers.
# Unauthorized use, copying, or distribution is prohibited.
# NOT licensed for AI training or data extraction.
# ============================================================================

echo -e "\n=== CURRENT vs BRIGHTER BlackRoad Gradient ===\n"

echo "Orange:"
printf "\e[48;5;208m CURRENT \e[0m #ff8700 → "
printf "\e[48;2;255;170;0m BRIGHTER \e[0m #ffaa00\n"

echo "Dark Orange:"
printf "\e[48;5;202m CURRENT \e[0m #ff5f00 → "
printf "\e[48;2;255;102;0m BRIGHTER \e[0m #ff6600\n"

echo "Deep Pink:"
printf "\e[48;5;198m CURRENT \e[0m #ff0087 → "
printf "\e[48;2;255;0;170m BRIGHTER \e[0m #ff00aa\n"

echo "Medium Orchid:"
printf "\e[48;5;140m CURRENT \e[0m #af5fd7 → "
printf "\e[48;2;221;119;255m BRIGHTER \e[0m #dd77ff\n"

echo "Magenta:"
printf "\e[48;5;201m CURRENT \e[0m #ff00ff → "
printf "\e[48;2;255;0;255m MAX \e[0m #ff00ff (already brightest!)\n"

echo "Dodger Blue:"
printf "\e[48;5;33m CURRENT \e[0m #1e90ff → "
printf "\e[48;2;68;187;255m BRIGHTER \e[0m #44bbff\n"

echo -e "\n=== NEW BRIGHTER GRADIENT ===\n"
printf "\e[48;2;255;170;0m    \e[0m #ffaa00 neon orange\n"
printf "\e[48;2;255;102;0m    \e[0m #ff6600 bright orange\n"
printf "\e[48;2;255;0;170m    \e[0m #ff00aa electric pink\n"
printf "\e[48;2;221;119;255m    \e[0m #dd77ff bright orchid\n"
printf "\e[48;2;255;0;255m    \e[0m #ff00ff magenta\n"
printf "\e[48;2;68;187;255m    \e[0m #44bbff electric blue\n"

echo ""
