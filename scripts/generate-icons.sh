#!/usr/bin/env bash
# Generate PWA icons from SVG source
# Requires: ImageMagick (convert) or rsvg-convert

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
ASSETS_DIR="$ROOT_DIR/assets"

# Icon sizes for PWA
ICON_SIZES=(72 96 128 144 152 192 384 512)

# Colors
THEME_COLOR="#4f46e5"
BG_COLOR="#f8fafc"

echo "[icons] Generating PWA icons..."

# Try ImageMagick first, fallback to Node.js script
if command -v convert &> /dev/null && command -v rsvg-convert &> /dev/null; then
  echo "[icons] Using ImageMagick for icon generation..."
  
  # Generate icons from SVG if source exists
  if [[ -f "$ASSETS_DIR/icon.svg" ]]; then
    for size in "${ICON_SIZES[@]}"; do
      rsvg-convert -w "$size" -h "$size" "$ASSETS_DIR/icon.svg" -o "$ASSETS_DIR/icon-${size}.png"
      echo "  ✓ icon-${size}.png"
    done
    
    rsvg-convert -w 180 -h 180 "$ASSETS_DIR/icon.svg" -o "$ASSETS_DIR/apple-touch-icon.png"
    echo "  ✓ apple-touch-icon.png"
  fi
  
  # Generate OG image
  if [[ -f "$ASSETS_DIR/og-image.svg" ]]; then
    rsvg-convert -w 1200 -h 630 "$ASSETS_DIR/og-image.svg" -o "$ASSETS_DIR/og-image.png"
    echo "  ✓ og-image.png"
  fi
  
  # Generate screenshots
  for i in 1 2; do
    convert -size 1280x720 "xc:$THEME_COLOR" \
      -gravity center \
      -pointsize 48 -fill white -annotate +0+0 "Screenshot $i" \
      "$ASSETS_DIR/screenshot-${i}.png" 2>/dev/null || true
    echo "  ✓ screenshot-${i}.png"
  done
  
  convert -size 390x844 "xc:$THEME_COLOR" \
    -gravity center \
    -pointsize 32 -fill white -annotate +0+0 "Mobile Screenshot" \
    "$ASSETS_DIR/screenshot-mobile.png" 2>/dev/null || true
  echo "  ✓ screenshot-mobile.png"
  
else
  echo "[icons] ImageMagick not available, using Node.js fallback..."
  
  # Use Node.js script for SVG generation
  node "$SCRIPT_DIR/generate-icons.cjs"
fi

echo "[icons] Icon generation complete!"
