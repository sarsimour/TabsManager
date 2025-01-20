#!/bin/bash

# Create necessary directories
mkdir -p icons
mkdir -p store_assets

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Preparing Chrome Web Store assets...${NC}"

# Function to check if file exists
check_file() {
    if [ ! -f "$1" ]; then
        echo "Error: $1 not found!"
        return 1
    fi
    return 0
}

# Generate extension icons
if [ -f "store_assets/icon_original.png" ]; then
    echo "Generating extension icons..."
    
    # Create 128x128 icon with 16px padding (actual icon is 96x96)
    convert "store_assets/icon_original.png" \
        -resize 96x96 \
        -background none \
        -gravity center \
        -extent 128x128 \
        icons/icon128.png
    
    # Generate other sizes
    convert "store_assets/icon_original.png" -resize 48x48 icons/icon48.png
    convert "store_assets/icon_original.png" -resize 32x32 icons/icon32.png
    convert "store_assets/icon_original.png" -resize 16x16 icons/icon16.png
    
    echo -e "${GREEN}✓ Extension icons generated${NC}"
else
    echo "Please place a high-resolution icon (at least 128x128) at store_assets/icon_original.png"
fi

# Generate store promotional images
echo "Generating promotional images..."

# Small promotional image (REQUIRED)
if [ -f "store_assets/promo_small.png" ]; then
    convert "store_assets/promo_small.png" \
        -resize 440x280^ \
        -gravity center \
        -extent 440x280 \
        "store_assets/store_promo_small.png"
    echo -e "${GREEN}✓ Small promo image generated (440x280)${NC}"
else
    echo -e "${YELLOW}⚠ Missing small promo image (REQUIRED)${NC}"
    echo "Please provide store_assets/promo_small.png (440x280)"
fi

# Marquee promotional image (Optional)
if [ -f "store_assets/promo_marquee.png" ]; then
    convert "store_assets/promo_marquee.png" \
        -resize 1400x560^ \
        -gravity center \
        -extent 1400x560 \
        "store_assets/store_promo_marquee.png"
    echo -e "${GREEN}✓ Marquee promo image generated (1400x560)${NC}"
fi

# Generate screenshots (at least 1 required, max 5)
echo "Processing screenshots..."
count=0
for img in store_assets/screenshot_*.{png,jpg,jpeg}; do
    if [ -f "$img" ] && [ $count -lt 5 ]; then
        filename=$(basename -- "$img")
        number="${filename##*_}"
        number="${number%.*}"
        
        # Convert to 1280x800
        convert "$img" \
            -resize 1280x800^ \
            -gravity center \
            -extent 1280x800 \
            "store_assets/store_screenshot_$number.png"
        
        count=$((count + 1))
        echo -e "${GREEN}✓ Screenshot $number generated (1280x800)${NC}"
    fi
done

if [ $count -eq 0 ]; then
    echo -e "${YELLOW}⚠ No screenshots found (at least 1 REQUIRED)${NC}"
    echo "Please provide screenshots as store_assets/screenshot_1.png, screenshot_2.png, etc."
fi

echo "
${YELLOW}Chrome Web Store Image Requirements:${NC}

1. Extension Icons (in icons/):
   ✓ icon128.png (128x128 with 16px padding, actual icon 96x96)
   ✓ icon48.png (48x48)
   ✓ icon32.png (32x32)
   ✓ icon16.png (16x16)

2. Promotional Images (in store_assets/):
   □ store_promo_small.png (440x280) - REQUIRED
   □ store_promo_marquee.png (1400x560) - Optional

3. Screenshots (in store_assets/):
   □ store_screenshot_*.png (1280x800) - At least 1 REQUIRED, max 5
   - Must be clear and readable
   - Should demonstrate features
   - No padding, full bleed

Note: For best results:
- Icons should be front-facing, no dramatic angles
- Promotional images should avoid text
- Screenshots should focus on core features
- All images should be high quality PNG format" 