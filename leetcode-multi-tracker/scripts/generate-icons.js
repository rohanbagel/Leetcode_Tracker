const fs = require('fs');
const path = require('path');

// Simple function to create SVG icons
function createSVGIcon(size) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="#000000"/>
  
  <!-- Border -->
  <rect x="${size * 0.05}" y="${size * 0.05}" width="${size * 0.9}" height="${size * 0.9}" 
        fill="none" stroke="#ffffff" stroke-width="${size * 0.02}"/>
  
  <!-- Text LCMT -->
  <text x="50%" y="50%" 
        font-family="monospace, 'JetBrains Mono', 'Courier New'" 
        font-size="${size * 0.25}" 
        font-weight="bold"
        fill="#ffffff" 
        text-anchor="middle" 
        dominant-baseline="central">LCMT</text>
</svg>`;
}

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate icons
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

console.log('Generating PWA icons...\n');

sizes.forEach(size => {
  const svg = createSVGIcon(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(publicDir, filename);
  
  fs.writeFileSync(filepath, svg);
  console.log(`✓ Created ${filename}`);
});

console.log('\n✓ All icons generated successfully!');
console.log('\nNote: SVG icons work for PWAs. For PNG conversion, you can use:');
console.log('1. Online tools like https://cloudconvert.com/svg-to-png');
console.log('2. Or install sharp: npm install sharp --save-dev');
