const fs = require('fs');
const path = require('path');

// Create a simple SVG placeholder function
function createSVGPlaceholder(width, height, text, bgColor = '#f3f4f6', textColor = '#6b7280') {
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="${bgColor}"/>
    <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" fill="${textColor}" text-anchor="middle" dominant-baseline="middle">${text}</text>
  </svg>`;
}

// List of images that need to be created based on terminal errors
const imagesToCreate = [
  { name: 'fallback-product.jpg', width: 400, height: 400, text: 'Product Image' },
  { name: 'category-electronics.jpg', width: 300, height: 200, text: 'Electronics' },
  { name: 'category-men.jpg', width: 300, height: 200, text: 'Men\'s Fashion' },
  { name: 'category-mother-child.jpg', width: 300, height: 200, text: 'Mother & Child' },
  { name: 'category-home-living.jpg', width: 300, height: 200, text: 'Home & Living' },
  { name: 'category-shoes-bags.jpg', width: 300, height: 200, text: 'Shoes & Bags' },
  { name: 'category-electronics-2.jpg', width: 300, height: 200, text: 'Electronics' },
  { name: 'ui-hero-banner.jpg', width: 1200, height: 400, text: 'Hero Banner' },
  { name: 'ui-logo-1.jpg', width: 150, height: 50, text: 'Logo 1' },
  { name: 'ui-logo-2.jpg', width: 150, height: 50, text: 'Logo 2' },
  { name: 'ui-logo-3.jpg', width: 150, height: 50, text: 'Logo 3' },
  { name: 'ui-logo-4.jpg', width: 150, height: 50, text: 'Logo 4' },
  { name: 'product-tech-1.jpg', width: 300, height: 300, text: 'Tech Product' },
  { name: 'product-fashion-1.jpg', width: 300, height: 300, text: 'Fashion Item' },
  { name: 'product-accessories-1.jpg', width: 300, height: 300, text: 'Accessory' },
  { name: 'product-lifestyle-1.jpg', width: 300, height: 300, text: 'Lifestyle' },
  { name: 'product-home-1.jpg', width: 300, height: 300, text: 'Home Product' },
  { name: 'product-bag-2.jpg', width: 300, height: 300, text: 'Bag' },
  { name: 'product-watch-3.jpg', width: 300, height: 300, text: 'Watch' },
  { name: 'product-logo-1.jpg', width: 300, height: 300, text: 'Brand Logo' },
  { name: 'product-clothing-1.jpg', width: 300, height: 300, text: 'Clothing' },
  { name: 'product-brand-1.jpg', width: 300, height: 300, text: 'Brand Product' },
  { name: 'product-lipstick-1.jpg', width: 300, height: 300, text: 'Lipstick' }
];

// Ensure public directory exists
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Create SVG placeholder files
imagesToCreate.forEach(image => {
  const svgContent = createSVGPlaceholder(image.width, image.height, image.text);
  const filePath = path.join(publicDir, image.name.replace('.jpg', '.svg'));
  fs.writeFileSync(filePath, svgContent);
  console.log(`Created: ${image.name.replace('.jpg', '.svg')}`);
});

console.log('All placeholder images created successfully!');
