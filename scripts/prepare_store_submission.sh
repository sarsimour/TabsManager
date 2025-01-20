#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Preparing Chrome Web Store submission package...${NC}"

# Verify required assets
MISSING_REQUIRED=0

# Check icons
if [ ! -f "icons/icon128.png" ] || [ ! -f "icons/icon48.png" ] || [ ! -f "icons/icon32.png" ] || [ ! -f "icons/icon16.png" ]; then
    echo -e "${RED}✘ Missing required icons${NC}"
    echo "Please run ./scripts/generate_store_assets.sh first"
    MISSING_REQUIRED=1
fi

# Check small promo image
if [ ! -f "store_assets/store_promo_small.png" ]; then
    echo -e "${RED}✘ Missing required small promotional image${NC}"
    echo "Please run ./scripts/generate_store_assets.sh first"
    MISSING_REQUIRED=1
fi

# Check screenshots
SCREENSHOT_COUNT=$(ls store_assets/store_screenshot_*.png 2>/dev/null | wc -l)
if [ "$SCREENSHOT_COUNT" -eq "0" ]; then
    echo -e "${RED}✘ Missing required screenshots (at least 1 needed)${NC}"
    echo "Please run ./scripts/generate_store_assets.sh first"
    MISSING_REQUIRED=1
fi

if [ "$MISSING_REQUIRED" -eq "1" ]; then
    echo -e "${RED}Cannot create submission package: missing required assets${NC}"
    exit 1
fi

# Create a temporary directory for the package
TEMP_DIR="store_package"
mkdir -p $TEMP_DIR

# Copy required files
echo "Copying files..."

# Core extension files
cp -r \
    manifest.json \
    floating.html \
    floating.js \
    tab_scorer.js \
    styles \
    lib \
    LICENSE \
    $TEMP_DIR/

# Icons (required)
mkdir -p $TEMP_DIR/icons
cp icons/icon*.png $TEMP_DIR/icons/

# Create the ZIP file
echo "Creating ZIP file..."
cd $TEMP_DIR
zip -r ../TabsManager.zip ./* -x "*.DS_Store" -x "*.git*"
cd ..

# Cleanup
echo "Cleaning up..."
rm -rf $TEMP_DIR

echo -e "${GREEN}✓ Package created: TabsManager.zip${NC}"
echo -e "
${YELLOW}Chrome Web Store Submission Checklist:${NC}

1. Extension Package:
   ✓ manifest.json
   ✓ All required icons
   ✓ Core extension files

2. Store Assets (upload separately in Chrome Web Store):
   □ Small promo image (440x280) - store_assets/store_promo_small.png
   □ Screenshots (1280x800) - store_assets/store_screenshot_*.png
   □ Marquee image (optional, 1400x560) - store_assets/store_promo_marquee.png

3. Store Listing:
   □ Description (from store/listing.md)
   □ Privacy policy
   □ Developer email
   □ Website URL

${YELLOW}Next steps:${NC}
1. Visit https://chrome.google.com/webstore/devconsole
2. Click 'New Item'
3. Upload TabsManager.zip
4. Upload store assets from store_assets/ directory
5. Fill in store listing information from store/listing.md
6. Submit for review" 