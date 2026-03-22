#!/bin/bash
set -e
echo "Setting up writing-studio..."; [ ! -d "writing-studio" ] && gh repo clone BlackRoad-OS-Inc/writing-studio; echo Done.
