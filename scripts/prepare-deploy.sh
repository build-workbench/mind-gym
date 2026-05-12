#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"
TEMP_DIR="$DIST_DIR/.build-temp"

echo "[build] Starting optimized build..."

# Clean and create dist
rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"
mkdir -p "$TEMP_DIR"

require_file() {
  local src="$1"
  if [[ ! -f "$ROOT_DIR/$src" ]]; then
    echo "[build] missing required file: $src" >&2
    exit 1
  fi
}

# Generate icons
echo "[build] Generating PWA icons..."
if [[ -f "$ROOT_DIR/scripts/generate-icons.sh" ]]; then
  bash "$ROOT_DIR/scripts/generate-icons.sh"
else
  echo "[build] Warning: Icon generation script not found"
fi

# Minify JS files
echo "[build] Minifying JavaScript files..."

# Minify app.js
npx terser "$ROOT_DIR/app.js" -o "$TEMP_DIR/app.js" -c -m --comments '/^!/'
echo "[build] ✓ app.js minified"

# Minify all src modules in parallel (preserving directory structure)
export TEMP_DIR ROOT_DIR
find "$ROOT_DIR/src" -name "*.js" -print0 | xargs -0 -I {} -P "$(nproc)" bash -c '
  file="{}"
  relative_path="${file#$ROOT_DIR/}"
  mkdir -p "$(dirname "$TEMP_DIR/$relative_path")"
  npx terser "$file" -o "$TEMP_DIR/$relative_path" -c -m --comments "/^!/"
  echo "[build] ✓ $relative_path minified"
'
echo "[build] All JavaScript files minified"

# Copy static assets
echo "[build] Copying static assets..."
cp "$ROOT_DIR/index.html" "$DIST_DIR/"
npx terser "$ROOT_DIR/sw.js" -o "$DIST_DIR/sw.js" -c -m --comments '/^!/'
echo "[build] ✓ sw.js minified"
cp "$ROOT_DIR/manifest.webmanifest" "$DIST_DIR/"
cp "$ROOT_DIR/offline.html" "$DIST_DIR/" 2>/dev/null || true
cp "$ROOT_DIR/robots.txt" "$DIST_DIR/" 2>/dev/null || true
cp "$ROOT_DIR/sitemap.xml" "$DIST_DIR/" 2>/dev/null || true
cp "$ROOT_DIR/browserconfig.xml" "$DIST_DIR/" 2>/dev/null || true

# Copy 404.html if exists, otherwise create it
if [[ -f "$ROOT_DIR/404.html" ]]; then
  cp "$ROOT_DIR/404.html" "$DIST_DIR/"
  echo "[build] ✓ 404.html copied"
else
  echo "[build] Warning: 404.html not found"
fi

# Copy minified JS
cp "$TEMP_DIR/app.js" "$DIST_DIR/"
cp -R "$TEMP_DIR/src" "$DIST_DIR/"

# Copy assets (including generated icons)
cp -R "$ROOT_DIR/assets" "$DIST_DIR/"

# Create .nojekyll to bypass Jekyll
touch "$DIST_DIR/.nojekyll"

# Remove _headers file - GitHub Pages doesn't support custom headers
# Headers are handled via meta tags in HTML instead
rm -f "$DIST_DIR/_headers"
echo "[build] Note: Security headers are set via meta tags in HTML"

# Cleanup temp
rm -rf "$TEMP_DIR"

# Verify
echo "[build] Verifying dist contents..."
required_files=(
  "index.html"
  "app.js"
  "sw.js"
  "manifest.webmanifest"
  "offline.html"
  "assets/app.css"
  "assets/icon.svg"
  "assets/icon-192.png"
  "assets/icon-512.png"
)

for file in "${required_files[@]}"; do
  if [[ -f "$DIST_DIR/$file" ]]; then
    echo "  ✓ $file"
  else
    echo "  ✗ $file missing" >&2
    # Don't fail for optional files
    if [[ "$file" == "assets/icon-192.png" ]] || [[ "$file" == "assets/icon-512.png" ]]; then
      echo "    Warning: PWA icons may be missing"
    fi
  fi
done

# Show size
echo ""
echo "[build] Build complete!"
echo "  Total size: $(du -sh "$DIST_DIR" | cut -f1)"
echo "  Files: $(find "$DIST_DIR" -type f | wc -l)"
echo ""

# Show file sizes for optimization
echo "[build] File size breakdown:"
find "$DIST_DIR" -type f \( -name "*.js" -o -name "*.css" -o -name "*.png" \) | while read file; do
  size=$(du -h "$file" | cut -f1)
  rel_path=${file#$DIST_DIR/}
  echo "  $rel_path: $size"
done
