const https = require('https');
const fs = require('fs');
const path = require('path');

// Function to download image from URL (follows redirects)
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, 'public', filename);
    const file = fs.createWriteStream(filePath);

    const fetch = (currentUrl) => {
      https.get(currentUrl, (response) => {
        const status = response.statusCode;
        // Handle HTTP redirects (3xx)
        if (status >= 300 && status < 400 && response.headers.location) {
          file.close();
          fs.unlink(filePath, () => {});
          return fetch(response.headers.location);
        }
        if (status !== 200) {
          file.close();
          fs.unlink(filePath, () => {});
          return reject(new Error(`HTTP ${status} when downloading ${currentUrl}`));
        }
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`Downloaded: ${filename}`);
          resolve();
        });
      }).on('error', (err) => {
        file.close();
        fs.unlink(filePath, () => {});
        reject(err);
      });
    };

    fetch(url);
  });
}

// Unsplash images with appropriate categories and sizes
const imagesToDownload = [
  // Category images
  { url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop', filename: 'category-electronics.jpg' },
  { url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop', filename: 'category-men.jpg' },
  { url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop', filename: 'category-mother-child.jpg' },
  { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop', filename: 'category-home-living.jpg' },
  { url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop', filename: 'category-shoes-bags.jpg' },
  { url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop', filename: 'category-electronics-2.jpg' },
  
  // Product images
  { url: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400&h=400&fit=crop', filename: 'product-tech-1.jpg' },
  { url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop', filename: 'product-fashion-1.jpg' },
  { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop', filename: 'product-accessories-1.jpg' },
  { url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=400&fit=crop', filename: 'product-lifestyle-1.jpg' },
  { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop', filename: 'product-home-1.jpg' },
  { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop', filename: 'product-bag-2.jpg' },
  { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop', filename: 'product-watch-3.jpg' },
  { url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop', filename: 'product-clothing-1.jpg' },
  { url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop', filename: 'product-lipstick-1.jpg' },
  
  // UI images
  { url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop', filename: 'ui-hero-banner.jpg' },
  { url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=50&fit=crop', filename: 'ui-logo-1.jpg' },
  { url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=150&h=50&fit=crop', filename: 'ui-logo-2.jpg' },
  { url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=150&h=50&fit=crop', filename: 'ui-logo-3.jpg' },
  { url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=150&h=50&fit=crop', filename: 'ui-logo-4.jpg' },
  
  // Hero cosmetics images (using working images.unsplash.com URLs)
  { url: 'https://source.unsplash.com/qnKhZJPKFD8/2400x1600', filename: 'hero-cosmetics.jpg' },
  { url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=2400&h=1600&fit=crop&crop=center', filename: 'hero-cosmetics-banner.jpg' },
  
  // Missing avatar images (causing 404s)
  { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', filename: 'avatar-user-2.jpg' },
  { url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', filename: 'avatar-user-3.jpg' },
  { url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', filename: 'avatar-user-5.jpg' },
  
  // Brand and fallback
  { url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop', filename: 'product-brand-1.jpg' },
  { url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop', filename: 'product-logo-1.jpg' },
  { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop', filename: 'fallback-product.jpg' }
];

async function downloadAllImages() {
  console.log('Starting to download images from Unsplash...');
  
  for (const image of imagesToDownload) {
    try {
      await downloadImage(image.url, image.filename);
      // Add a small delay to be respectful to Unsplash
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Failed to download ${image.filename}:`, error.message);
    }
  }
  
  console.log('All images downloaded successfully!');
}

downloadAllImages();
