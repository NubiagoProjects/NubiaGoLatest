const https = require('https');
const fs = require('fs');
const path = require('path');

// Function to download image from URL
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, 'public', filename);
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded: ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}); // Delete the file on error
      reject(err);
    });
  });
}

// Product images based on mock data requirements
const productImages = [
  // Headphones (prod-1)
  { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop', filename: 'product-headphones-1.jpg' },
  { url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop', filename: 'product-headphones-2.jpg' },
  
  // Smart Watch (prod-2)
  { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop', filename: 'product-watch-1.jpg' },
  { url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop', filename: 'product-watch-2.jpg' },
  { url: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&h=400&fit=crop', filename: 'product-watch-3.jpg' },
  
  // Leather Bag (prod-3)
  { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop', filename: 'product-bag-1.jpg' },
  { url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop', filename: 'product-bag-2.jpg' },
  
  // Running Shoes (prod-4)
  { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop', filename: 'product-shoes-1.jpg' },
  { url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop', filename: 'product-shoes-2.jpg' },
  { url: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400&h=400&fit=crop', filename: 'product-shoes-3.jpg' },
  
  // Cosmetics (prod-5)
  { url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop', filename: 'product-cosmetics-1.jpg' },
  
  // Additional product images for variety
  { url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop', filename: 'product-cosmetics-2.jpg' },
  { url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop', filename: 'product-cosmetics-3.jpg' },
  
  // User avatars
  { url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', filename: 'avatar-user-1.jpg' },
  { url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', filename: 'avatar-user-2.jpg' },
  { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', filename: 'avatar-user-3.jpg' },
  
  // Supplier logos
  { url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=100&fit=crop', filename: 'ui-supplier-logo-1.jpg' },
  
  // Category image that was missing
  { url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop', filename: 'category-cosmetics.jpg' },
  
  // Additional product variations for more diverse catalog
  { url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop', filename: 'product-clothing-2.jpg' },
  { url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop', filename: 'product-clothing-3.jpg' },
  { url: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400&h=400&fit=crop', filename: 'product-electronics-1.jpg' },
  { url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop', filename: 'product-electronics-2.jpg' },
  { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop', filename: 'product-furniture-1.jpg' },
  { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop', filename: 'product-furniture-2.jpg' },
  
  // More specific product images
  { url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop', filename: 'product-sunglasses-1.jpg' },
  { url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&h=400&fit=crop', filename: 'product-perfume-1.jpg' },
  { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop', filename: 'product-sneakers-1.jpg' },
  { url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop', filename: 'product-jacket-1.jpg' }
];

async function downloadAllProductImages() {
  console.log('Starting to download product images from Unsplash...');
  
  for (const image of productImages) {
    try {
      await downloadImage(image.url, image.filename);
      // Add a small delay to be respectful to Unsplash
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Failed to download ${image.filename}:`, error.message);
    }
  }
  
  console.log('All product images downloaded successfully!');
}

downloadAllProductImages();
