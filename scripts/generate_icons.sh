#!/bin/bash

# Create icons directory if it doesn't exist
mkdir -p icons

# Define the source icon (assuming it's named icon_original.png)
SOURCE_ICON="icon_original.png"

# Check if source icon exists
if [ ! -f "$SOURCE_ICON" ]; then
    echo "Error: $SOURCE_ICON not found!"
    echo "Please place your original high-resolution icon (at least 128x128) in the root directory"
    exit 1
fi

# Generate different sizes
convert "$SOURCE_ICON" -resize 16x16 icons/icon16.png
convert "$SOURCE_ICON" -resize 32x32 icons/icon32.png
convert "$SOURCE_ICON" -resize 48x48 icons/icon48.png
convert "$SOURCE_ICON" -resize 128x128 icons/icon128.png

echo "Icons generated successfully in 'icons' directory:"
ls -l icons/

# Update manifest.json with new icon paths
echo "Remember to update manifest.json with these paths:
{
  \"icons\": {
    \"16\": \"icons/icon16.png\",
    \"32\": \"icons/icon32.png\",
    \"48\": \"icons/icon48.png\",
    \"128\": \"icons/icon128.png\"
  }
}" 