#!/usr/bin/env bash
# 从 SVG 源生成真 PNG 图标。
# 优先使用 rsvg-convert（librsvg），其次 Node.js + sharp。
# 工具都缺失时跳过并警告——已提交的 PNG 保持不变，绝不生成 SVG 伪装的假 PNG。

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
ASSETS_DIR="$ROOT_DIR/assets"

echo "[icons] Generating PWA PNG icons from SVG sources..."

if command -v rsvg-convert &>/dev/null; then
  echo "[icons] Using rsvg-convert..."
  for size in 72 96 128 144 152 192 384 512; do
    rsvg-convert -w "$size" -h "$size" "$ASSETS_DIR/icon.svg" -o "$ASSETS_DIR/icon-${size}.png"
  done
  rsvg-convert -w 180 -h 180 "$ASSETS_DIR/icon.svg" -o "$ASSETS_DIR/apple-touch-icon.png"
  rsvg-convert -w 1200 -h 630 "$ASSETS_DIR/og-image.svg" -o "$ASSETS_DIR/og-image.png"
  rsvg-convert -w 1280 -h 720 "$ASSETS_DIR/screenshot-1.svg" -o "$ASSETS_DIR/screenshot-1.png"
  rsvg-convert -w 1280 -h 720 "$ASSETS_DIR/screenshot-2.svg" -o "$ASSETS_DIR/screenshot-2.png"
  rsvg-convert -w 390 -h 844 "$ASSETS_DIR/screenshot-mobile.svg" -o "$ASSETS_DIR/screenshot-mobile.png"
  echo "  ✓ icon-*/apple-touch-icon/og-image/screenshot-* 已生成"
elif node -e "require('sharp')" 2>/dev/null; then
  echo "[icons] Using Node.js + sharp..."
  node "$SCRIPT_DIR/generate-icons.cjs"
else
  echo "[icons] Warning: 未找到 rsvg-convert 或 sharp，跳过 PNG 生成" >&2
  echo "[icons] 已提交的 PNG 图标保持不变。" >&2
  exit 0
fi

echo "[icons] Icon generation complete!"
