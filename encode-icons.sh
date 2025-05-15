#!/bin/bash

SRC_DIR="lib/icons"
DEST_DIR="$SRC_DIR/base64"

# Create base64 directory if it doesn't exist
mkdir -p "$DEST_DIR"

# Loop through each SVG in the icons folder
for svg_file in "$SRC_DIR"/*.svg; do
  [ -e "$svg_file" ] || continue  # skip if no SVGs
  filename=$(basename "$svg_file")
  base64_content=$(base64 -w 0 "$svg_file")
  echo "data:image/svg+xml;base64,$base64_content" > "$DEST_DIR/$filename.txt"
  echo "✅ Encoded: $filename → $DEST_DIR/$filename.txt"
done

echo "🎉 All icons encoded with proper base64 URI prefix."
