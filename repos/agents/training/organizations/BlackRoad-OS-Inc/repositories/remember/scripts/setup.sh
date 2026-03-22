#!/bin/bash
set -e
echo "Setting up remember..."; [ ! -d "remember" ] && gh repo clone BlackRoad-OS-Inc/remember; echo Done.
