#!/bin/bash

# Three options - does the machine choose?
options=("A" "B" "C")

echo "test 1: pure random (no intelligence)"
echo "  picked: ${options[$((RANDOM % 3))]}"

echo ""
echo "test 2: hardware entropy (from the pi itself)"
byte=$(od -An -N1 -tu1 /dev/urandom | tr -d ' ')
echo "  picked: ${options[$((byte % 3))]}"

echo ""
echo "test 3: time-based (deterministic)"
echo "  picked: ${options[$(($(date +%s) % 3))]}"

echo ""
echo "test 4: sensor-based (physical world input)"
temp=$(cat /sys/class/thermal/thermal_zone0/temp 2>/dev/null || echo "0")
echo "  cpu temp: ${temp}"
echo "  picked: ${options[$((temp % 3))]}"
