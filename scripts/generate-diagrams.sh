#!/usr/bin/env bash
# regenerates the learn page diagrams from the mermaid sources
# pipeline: mmdc renders the excalidraw look, resvg rasterizes with excalifont
#
# usage:
#   scripts/generate-diagrams.sh
#
# requires:
#   mmdc    npm install -g @mermaid-js/mermaid-cli
#   resvg   brew install resvg

set -Eeuo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/assets/diagrams"
OUT="$ROOT/apps/frontend/src/generated"
FONT="$SRC/Excalifont-Regular.ttf"

command -v mmdc >/dev/null || {
    echo "mmdc not found: npm install -g @mermaid-js/mermaid-cli" >&2
    exit 1
}
command -v resvg >/dev/null || {
    echo "resvg not found: brew install resvg" >&2
    exit 1
}

for spec in "$SRC"/*.mmd; do
    name="$(basename "$spec" .mmd)"
    echo "rendering $name" >&2
    mmdc -i "$spec" \
        -o "$OUT/diagram-$name.svg" \
        -c "$SRC/$name.config.json" \
        -b transparent \
        --svgId "sketch-$name" \
        -q
    resvg --use-font-file "$FONT" --zoom 2 \
        "$OUT/diagram-$name.svg" "$OUT/diagram-$name.png" 2>/dev/null
done

echo "diagrams written to $OUT" >&2
