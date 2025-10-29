#!/bin/bash
# Create placeholder SVG icons and convert to PNG using ImageMagick (if available)

# Create SVG icon
cat > icon.svg << 'SVGEOF'
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1e40af;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#grad)" rx="80"/>
  <text x="256" y="320" font-family="system-ui, sans-serif" font-size="300" font-weight="bold" fill="white" text-anchor="middle">P</text>
  <text x="256" y="420" font-family="monospace" font-size="60" fill="rgba(255,255,255,0.9)" text-anchor="middle">{ }</text>
</svg>
SVGEOF

echo "SVG icon created: icon.svg"

# Check if ImageMagick is available
if command -v convert &> /dev/null; then
    echo "Converting to PNG using ImageMagick..."
    convert icon.svg -resize 192x192 icon-192.png
    convert icon.svg -resize 512x512 icon-512.png
    echo "PNG icons created successfully!"
else
    echo "ImageMagick not found. Please either:"
    echo "1. Install ImageMagick: sudo dnf install ImageMagick"
    echo "2. Open generate-icons.html in a browser to create icons manually"
    echo "3. Use icon.svg with an online converter"
fi
