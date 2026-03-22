#!/bin/bash
set -e
echo "Setting up roadwork-platform..."; [ ! -d "roadwork-platform" ] && gh repo clone BlackRoad-OS-Inc/roadwork-platform; echo Done.
