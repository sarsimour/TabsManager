#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Create store_assets directory if it doesn't exist
mkdir -p store_assets

echo -e "${YELLOW}Creating promotional images from promo.png...${NC}"

# Check if source image exists
if [ ! -f "promo.png" ]; then
    echo -e "${RED}Error: promo.png not found!${NC}"
    echo "Please place your promotional image as promo.png in the root directory"
    exit 1
fi

# Small Promo (440x280) - REQUIRED
echo "Creating small promotional image..."
convert promo.png \
    -resize 440x280^ \
    -gravity center \
    -extent 440x280 \
    store_assets/store_promo_small.png

echo -e "${GREEN}✓ Created small promo image (440x280)${NC}"

# Marquee (1400x560) - Optional
echo "Creating marquee promotional image..."
convert promo.png \
    -resize 1400x560^ \
    -gravity center \
    -extent 1400x560 \
    store_assets/store_promo_marquee.png

echo -e "${GREEN}✓ Created marquee image (1400x560)${NC}"

echo -e "
${YELLOW}Promotional images created:${NC}
1. store_assets/store_promo_small.png (440x280) - REQUIRED
   - Used in Chrome Web Store search results
   - Main visibility point for your extension

2. store_assets/store_promo_marquee.png (1400x560) - Optional
   - Used for featured extensions
   - Banner-style promotional image

${YELLOW}Note:${NC}
- The '^' in resize ensures the image covers the entire area
- 'gravity center' keeps the important parts centered
- Check the output images to ensure nothing important is cropped

Next step: Run ./scripts/generate_store_assets.sh to prepare the final package" 