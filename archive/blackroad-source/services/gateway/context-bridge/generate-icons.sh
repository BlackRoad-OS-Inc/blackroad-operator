#!/bin/bash

# Generate PNG icons from SVG using sips (macOS built-in)
# Requires: macOS (for sips command)

set -e

echo "🎨 Generating PNG icons from SVG..."

# First, convert SVG to a large PNG that we can resize
# sips doesn't handle SVG directly, so we'll use a different approach

# Check if we have ImageMagick
if command -v convert &> /dev/null; then
    echo "Using ImageMagick..."
    convert -background none icon.svg -resize 16x16 icon16.png
    convert -background none icon.svg -resize 32x32 icon32.png
    convert -background none icon.svg -resize 48x48 icon48.png
    convert -background none icon.svg -resize 128x128 icon128.png
elif command -v rsvg-convert &> /dev/null; then
    echo "Using rsvg-convert..."
    rsvg-convert -w 16 -h 16 icon.svg -o icon16.png
    rsvg-convert -w 32 -h 32 icon.svg -o icon32.png
    rsvg-convert -w 48 -h 48 icon.svg -o icon48.png
    rsvg-convert -w 128 -h 128 icon.svg -o icon128.png
else
    echo "⚠️  No SVG converter found. Using fallback method..."
    echo "Please install ImageMagick: brew install imagemagick"
    echo "Or librsvg: brew install librsvg"
    exit 1
fi

echo "✅ Generated all icon sizes!"
ls -lh icon*.png

