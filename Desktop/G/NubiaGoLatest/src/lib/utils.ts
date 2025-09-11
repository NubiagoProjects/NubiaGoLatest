import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility functions for formatting
export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle utility
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Image utilities
export function getImageFallback(imageUrl: string | undefined, fallbackUrl: string = '/fallback-product.jpg'): string {
  return imageUrl || fallbackUrl
}

export function handleImageError(event: React.SyntheticEvent<HTMLImageElement, Event>): void {
  const target = event.target as HTMLImageElement
  target.src = '/fallback-product.jpg'
  target.alt = 'Image not available'
}

// Toast utility function
export const toast = {
  success: (message: string) => {
    console.log('✅ Success:', message)
    // In a real app, this would use the toast store
  },
  error: (message: string) => {
    console.error('❌ Error:', message)
    // In a real app, this would use the toast store
  },
  warning: (message: string) => {
    console.warn('⚠️ Warning:', message)
    // In a real app, this would use the toast store
  },
  info: (message: string) => {
    console.info('ℹ️ Info:', message)
    // In a real app, this would use the toast store
  }
} 
