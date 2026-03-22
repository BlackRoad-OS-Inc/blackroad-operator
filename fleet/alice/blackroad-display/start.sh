#!/bin/bash
# BlackRoad Brady Bunch Display Launcher

export SDL_VIDEODRIVER=fbcon
export SDL_FBDEV=/dev/fb0
export DISPLAY=:0

cd ~/blackroad-display

# Try framebuffer first, then X11
if [ -e /dev/fb0 ]; then
  python3 brady-bunch.py --fullscreen
elif [ -n "$DISPLAY" ]; then
  export SDL_VIDEODRIVER=x11
  python3 brady-bunch.py
else
  echo 'No display available'
  exit 1
fi
