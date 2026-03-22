#!/bin/bash
set -e
echo "Setting up video-studio..."; [ ! -d "video-studio" ] && gh repo clone BlackRoad-OS-Inc/video-studio; echo Done.
