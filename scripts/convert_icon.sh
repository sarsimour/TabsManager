#!/bin/bash

# Create store_assets directory if it doesn't exist
mkdir -p store_assets

# Convert JPG to PNG
echo "Converting icon to PNG format..."
convert your_icon.jpg -background none store_assets/icon_original.png

echo "✓ Icon converted to PNG format at store_assets/icon_original.png" 