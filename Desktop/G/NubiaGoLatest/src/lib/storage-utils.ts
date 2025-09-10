import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import app from './firebase/config';

const storage = getStorage(app);

// Base Firebase Storage URL for your project
const STORAGE_BASE_URL = 'https://firebasestorage.googleapis.com/v0/b/nubiago-aa411.firebasestorage.app/o';

/**
 * Get Firebase Storage URL for an asset
 * @param path - The path to the asset (e.g., '/hero-banner.jpg')
 * @returns Firebase Storage URL
 */
export function getStorageUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Encode the path for Firebase Storage
  const encodedPath = encodeURIComponent(`assets/${cleanPath}`);
  
  // Return direct Firebase Storage URL
  return `${STORAGE_BASE_URL}/${encodedPath}?alt=media`;
}

/**
 * Get optimized image URL from Firebase Storage
 * @param path - The path to the image
 * @param width - Optional width for optimization
 * @param height - Optional height for optimization
 * @returns Optimized Firebase Storage URL
 */
export function getOptimizedImageUrl(path: string, width?: number, height?: number): string {
  const baseUrl = getStorageUrl(path);
  
  if (width || height) {
    const params = new URLSearchParams();
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    return `${baseUrl}&${params.toString()}`;
  }
  
  return baseUrl;
}

/**
 * Preload critical images
 */
export const CRITICAL_IMAGES = [
  '/hero-banner.jpg',
  '/ui-hero-banner.jpg',
  '/fallback-product.jpg',
  '/fallback-large.jpg'
];

/**
 * Get all critical image URLs for preloading
 */
export function getCriticalImageUrls(): string[] {
  return CRITICAL_IMAGES.map(path => getStorageUrl(path));
}

