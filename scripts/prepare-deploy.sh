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

# Build CSS first
echo "[build] Building optimized CSS..."
npm run build:css

# Copy and minify JS files
echo "[build] Minifying JavaScript files..."

# Minify app.js
npx terser "$ROOT_DIR/app.js" -o "$TEMP_DIR/app.js" -c -m --comments '/^!/'
echo "[build] ✓ app.js minified"

# Minify all src modules
mkdir -p "$TEMP_DIR/src"
for file in "$ROOT_DIR"/src/*.js; do
  filename=$(basename "$file")
  npx terser "$file" -o "$TEMP_DIR/src/$filename" -c -m --comments '/^!/'
  echo "[build] ✓ src/$filename minified"
done

# Copy static assets
echo "[build] Copying static assets..."
cp "$ROOT_DIR/index.html" "$DIST_DIR/"
cp "$ROOT_DIR/sw.js" "$DIST_DIR/"
cp "$ROOT_DIR/manifest.webmanifest" "$DIST_DIR/"
cp "$ROOT_DIR/offline.html" "$DIST_DIR/" 2>/dev/null || true
cp "$ROOT_DIR/robots.txt" "$DIST_DIR/" 2>/dev/null || true
cp "$ROOT_DIR/sitemap.xml" "$DIST_DIR/" 2>/dev/null || true

# Copy minified JS
cp "$TEMP_DIR/app.js" "$DIST_DIR/"
cp -R "$TEMP_DIR/src" "$DIST_DIR/"

# Copy assets
cp -R "$ROOT_DIR/assets" "$DIST_DIR/"

# Generate OG image if missing
if [[ ! -f "$DIST_DIR/assets/og-image.png" ]]; then
  echo "[build] Generating OG image placeholder..."
  # Create a simple SVG that can be used as OG image
  cat > "$DIST_DIR/assets/og-image.svg" << 'SVGEOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4f46e5"/>
      <stop offset="100%" style="stop-color:#7c3aed"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <text x="600" y="250" font-family="Arial,sans-serif" font-size="72" font-weight="bold" fill="white" text-anchor="middle">Mind Gym</text>
  <text x="600" y="330" font-family="Arial,sans-serif" font-size="36" fill="white" text-anchor="middle">Memory Training Game</text>
  <text x="600" y="400" font-family="Arial,sans-serif" font-size="24" fill="white" text-anchor="middle">Boost Your Cognitive Skills</text>
  <text x="600" y="500" font-family="Arial,sans-serif" font-size="20" fill="white" text-anchor="middle">lessup.github.io/mind-gym</text>
</svg>
SVGEOF
  echo "[build] ✓ OG image SVG created"
fi

# Copy icon.svg if exists
if [[ -f "$ROOT_DIR/assets/icon.svg" ]]; then
  cp "$ROOT_DIR/assets/icon.svg" "$DIST_DIR/assets/"
fi

# Create .nojekyll to bypass Jekyll
touch "$DIST_DIR/.nojekyll"

# Security headers file for GitHub Pages
cat > "$DIST_DIR/_headers" << 'EOF'
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
EOF

# Generate sitemap
if [[ ! -f "$ROOT_DIR/sitemap.xml" ]]; then
  echo "[build] Generating sitemap..."
  cat > "$DIST_DIR/sitemap.xml" << 'XMLEOF'
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://lessup.github.io/mind-gym/</loc>
    <lastmod>2026-04-17</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
XMLEOF
fi

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
)

for file in "${required_files[@]}"; do
  if [[ -f "$DIST_DIR/$file" ]]; then
    echo "  ✓ $file"
  else
    echo "  ✗ $file missing" >&2
    exit 1
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
find "$DIST_DIR" -type f -name "*.js" -o -name "*.css" | while read file; do
  size=$(du -h "$file" | cut -f1)
  rel_path=${file#$DIST_DIR/}
  echo "  $rel_path: $size"
done
