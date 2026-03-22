#!/bin/bash
set -e
echo "Setting up lucidia..."; [ ! -d "lucidia" ] && gh repo clone BlackRoad-OS-Inc/lucidia; echo Done.
