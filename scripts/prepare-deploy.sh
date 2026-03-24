#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"

rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"

require_file() {
  local src="$1"
  if [[ ! -f "$ROOT_DIR/$src" ]]; then
    echo "[prepare-deploy] missing required file: $src" >&2
    exit 1
  fi
}

copy_static() {
  local src="$1"
  local dest="$DIST_DIR/$(basename "$src")"
  require_file "$src"
  cp "$ROOT_DIR/$src" "$dest"
  echo "[prepare-deploy] copied $src"
}

require_file "index.html"
require_file "app.js"
require_file "sw.js"
require_file "manifest.webmanifest"
require_file "assets/app.css"

copy_static "index.html"
copy_static "app.js"
copy_static "sw.js"
copy_static "manifest.webmanifest"

if [[ ! -d "$ROOT_DIR/src" ]]; then
  echo "[prepare-deploy] missing required directory: src/" >&2
  exit 1
fi
cp -R "$ROOT_DIR/src" "$DIST_DIR/"
echo "[prepare-deploy] copied src/ directory"

if [[ ! -d "$ROOT_DIR/assets" ]]; then
  echo "[prepare-deploy] missing required directory: assets/" >&2
  exit 1
fi
cp -R "$ROOT_DIR/assets" "$DIST_DIR/"
echo "[prepare-deploy] copied assets/ directory"

for required in index.html app.js sw.js manifest.webmanifest assets/app.css assets/icon.svg; do
  if [[ ! -e "$DIST_DIR/$required" ]]; then
    echo "[prepare-deploy] dist missing expected artifact: $required" >&2
    exit 1
  fi
done

echo "[prepare-deploy] bundle ready at $DIST_DIR"
