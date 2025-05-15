#!/bin/bash

# Source and destination directories
SRC_DIR="lib/images"
DEST_DIR="$SRC_DIR/base64"

# Create output directory if it doesn't exist
mkdir -p "$DEST_DIR"

# Supported image extensions
EXTENSIONS=("svg" "png" "jpg" "jpeg" "gif")

# Loop through all matching image files
for ext in "${EXTENSIONS[@]}"; do
  for img in "$SRC_DIR"/*."$ext"; do
    [ -e "$img" ] || continue  # skip if no file found
    filename=$(basename "$img")
    mime_type=$(file --mime-type -b "$img")
    encoded=$(base64 -w 0 "$img")
    echo "data:$mime_type;base64,$encoded" > "$DEST_DIR/$filename.txt"
    echo "✅ Encoded: $filename → $DEST_DIR/$filename.txt"
  done
done

echo "🎉 All images converted to base64 in $DEST_DIR"

# to run these scripts, use the following commands:
# chmod +x encode-images-to-base64.sh
# ./encode-images-to-base64.sh
  
