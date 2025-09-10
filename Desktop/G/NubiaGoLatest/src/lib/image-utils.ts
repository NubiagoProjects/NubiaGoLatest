// ============================================================================
// IMAGE UTILITIES
// ============================================================================

// Image category type
export type ImageCategory = 'products' | 'categories' | 'avatars' | 'ui' | 'fallbacks' | 'product' | 'category' | 'user' | 'supplier' | 'banner'

// List of available images in downloads folder
const availableImages = [
  'fallback-product.jpg',
  'fallback-large.jpg',
  'product-headphones-1.jpg',
  'product-watch-1.jpg',
  'product-bag-1.jpg',
  'product-shoes-1.jpg',
  'product-cosmetics-1.jpg',
  'product-home-1.jpg',
  'product-lipstick-1.jpg',
  'avatar-user-1.jpg',
  'avatar-user-5.jpg',
  'product-recommendation-2.jpg',
  'product-laptop-1.jpg',
  'category-electronics.jpg',
  'category-men.jpg',
  'category-home-living.jpg',
  'category-shoes-bags.jpg',
  'category-cosmetics.jpg',
  'category-mother-child.jpg',
  'ui-logo-1.jpg',
  'ui-logo-2.jpg',
  'ui-logo-3.jpg',
  'ui-logo-4.jpg',
  'ui-hero-banner.jpg',
  'product-bag-2.jpg',
  'product-watch-3.jpg',
  'product-logo-1.jpg',
  'product-clothing-1.jpg',
  'product-brand-1.jpg',
  'product-fashion-1.jpg',
  'product-tech-1.jpg',
  'product-accessories-1.jpg',
  'product-lifestyle-1.jpg',
  'product-home-1.jpg',
  'category-electronics-2.jpg',
  'product-recommendation-1.jpg',
  'product-recommendation-3.jpg',
  'product-recommendation-4.jpg',
  'product-recommendation-6.jpg',
  'avatar-user-2.jpg',
  'avatar-user-3.jpg',
  'avatar-user-4.jpg',
  'category-api-1.jpg',
  'category-api-2.jpg',
  'category-api-3.jpg',
  'category-api-4.jpg',
  'category-api-5.jpg',
  'category-api-6.jpg',
  'product-api-1.jpg',
  'product-api-2.jpg',
  'product-api-3.jpg',
  'product-api-4.jpg',
  'product-order-1.jpg',
  'product-order-2.jpg',
  'product-orders-1.jpg',
  'product-orders-2.jpg',
  'product-edit-1.jpg',
  'product-customer-1.jpg',
  'product-electronics-1.jpg',
  'product-camera-1.jpg',
  'product-phone-1.jpg',
  'product-shoes-2.jpg',
  'product-shoes-3.jpg',
  'product-sunglasses-1.jpg',
  'product-watch-2.jpg',
  'product-headphones-2.jpg',
  'product-recommendation-5.jpg',
  'ui-supplier-logo-1.jpg',
  'ui-supplier-logo-2.jpg',
  'hero-banner.jpg'
];

// Fallback mapping for missing images
const fallbackMapping: Record<string, string> = {
  'product-lipstick-1.jpg': 'product-cosmetics-1.jpg',
  'avatar-user-5.jpg': 'avatar-user-1.jpg',
  'product-recommendation-2.jpg': 'product-recommendation-1.jpg',
  'avatar-user-1.jpg': 'avatar-user-2.jpg',
  'product-cosmetics-1.jpg': 'product-cosmetics-1.jpg',
  'product-laptop-1.jpg': 'product-tech-1.jpg',
  'category-cosmetics.jpg': 'product-cosmetics-1.jpg'
};

export function getImagePath(imageName: string): string {
  // If the image exists in available images, use it
  if (availableImages.includes(imageName)) {
    return `/${imageName}`;
  }
  
  // If there's a fallback mapping, use it
  if (fallbackMapping[imageName]) {
    return `/${fallbackMapping[imageName]}`;
  }
  
  // Default fallback
  return '/fallback-product.jpg';
}

export function validateImagePath(path: string): string {
  // Extract filename from path
  const filename = path.split('/').pop() || '';
  
  // If it's already a public path, validate it
  if (path.startsWith('/downloads/') || path.startsWith('/')) {
    return getImagePath(filename);
  }
  
  // If it's a Firebase URL, convert to local path
  if (path.includes('firebasestorage.googleapis.com')) {
    // Extract filename from Firebase URL
    const firebaseFilename = path.split('/').pop()?.split('?')[0] || '';
    return getImagePath(firebaseFilename);
  }
  
  return path;
}

export function handleImageError(event: React.SyntheticEvent<HTMLImageElement, Event>): void {
  const target = event.target as HTMLImageElement;
  target.src = '/fallback-product.jpg';
  target.alt = 'Image not available';
}

export function getOptimizedImageUrl(src: string, width: number, quality: number): string {
  // For now, return the original source since we're using local images
  return validateImagePath(src);
}

// Image optimization class for compatibility
export class ImageOptimization {
  static getOptimizedImageUrl(src: string, width: number, quality: number): string {
    return getOptimizedImageUrl(src, width, quality);
  }
}

// Function to check if an image exists
export function imageExists(imageName: string): boolean {
  return availableImages.includes(imageName);
}

// Function to get a random image from available images
export function getRandomImage(category?: string): string {
  const categoryImages = availableImages.filter(img => 
    category ? img.includes(category.toLowerCase()) : true
  );
  
  if (categoryImages.length > 0) {
    const randomImage = categoryImages[Math.floor(Math.random() * categoryImages.length)];
    return `/${randomImage}`;
  }
  
  return '/fallback-product.jpg';
}

// Function to preload images
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      resolve()
      return
    }
    const img = new window.Image()
    img.onload = () => resolve()
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    img.src = src
  })
}

// Function to check image dimensions
export function getImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      resolve({ width: 0, height: 0 })
      return
    }
    const img = new window.Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    img.src = src
  })
}

// File size formatting utility
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Image configuration constants
export const IMAGE_CONFIG = {
  maxFileSize: 5 * 1024 * 1024, // 5MB - Add this property
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.8,
  thumbnailWidth: 300,
  thumbnailHeight: 300
}

// Image metadata interface
export interface ImageMetadata {
  id: string
  originalName: string
  urls: {
    original: string
    thumbnail: string
  }
  size: number
  type: string
  width?: number
  height?: number
  uploadedAt: Date
  isActive: boolean
  tags?: string[]
  category?: string
  description?: string
} 
