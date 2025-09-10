// ============================================================================
// COMPREHENSIVE IMAGE OPTIMIZATION UTILITY
// ============================================================================

export interface ImageOptimizationOptions {
  width: number
  height: number
  quality?: number
  format?: 'webp' | 'avif' | 'jpeg' | 'png' | 'auto'
  breakpoints?: number[]
  sizes?: string
  networkSpeed?: 'slow' | 'medium' | 'fast'
  priority?: boolean
}

export interface OptimizedImageData {
  src: string
  srcSet: string
  sizes: string
  formats: {
    webp?: string
    avif?: string
    jpeg: string
    png?: string
  }
  placeholder: string
  loading: 'lazy' | 'eager'
}

export class ImageOptimizer {
  private static instance: ImageOptimizer
  private supportsWebP: boolean | null = null
  private supportsAVIF: boolean | null = null

  private constructor() {
    this.detectFormatSupport()
  }

  static getInstance(): ImageOptimizer {
    if (!ImageOptimizer.instance) {
      ImageOptimizer.instance = new ImageOptimizer()
    }
    return ImageOptimizer.instance
  }

  /**
   * Detect browser format support
   */
  private detectFormatSupport() {
    if (typeof window === 'undefined') return

    // Check WebP support
    const webP = document.createElement('img')
    webP.onload = webP.onerror = () => {
      this.supportsWebP = webP.height === 2
    }
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'

    // Check AVIF support
    const avif = document.createElement('img')
    avif.onload = avif.onerror = () => {
      this.supportsAVIF = avif.height === 2
    }
    avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A='
  }

  /**
   * Get optimal format based on browser support and network conditions
   */
  getOptimalFormat(networkSpeed: 'slow' | 'medium' | 'fast' = 'medium'): 'webp' | 'avif' | 'jpeg' | 'png' {
    // Use JPEG for slow networks (better compatibility)
    if (networkSpeed === 'slow') {
      return 'jpeg'
    }

    // Use best available format for faster networks
    if (this.supportsAVIF) {
      return 'avif' // Best compression
    } else if (this.supportsWebP) {
      return 'webp' // Good compression, wide support
    }

    return 'jpeg' // Fallback
  }

  /**
   * Generate responsive srcset for different screen sizes
   */
  generateSrcSet(
    baseSrc: string, 
    width: number, 
    height: number, 
    breakpoints: number[] = [320, 480, 640, 768, 1024, 1280],
    quality: number = 75
  ): string {
    if (!baseSrc || baseSrc.startsWith('data:')) return baseSrc

    try {
      const baseUrl = new URL(baseSrc, typeof window !== 'undefined' ? window.location.origin : 'https://nubiago.com')
      
      return breakpoints
        .map(breakpoint => {
          const scale = breakpoint / width
          const scaledWidth = Math.round(width * scale)
          const scaledHeight = Math.round(height * scale)
          
          // Create optimized URL with size parameters
          const optimizedUrl = new URL(baseUrl)
          optimizedUrl.searchParams.set('w', scaledWidth.toString())
          optimizedUrl.searchParams.set('h', scaledHeight.toString())
          optimizedUrl.searchParams.set('q', quality.toString())
          
          return `${optimizedUrl.toString()} ${breakpoint}w`
        })
        .join(', ')
    } catch (error) {
      console.warn('Error generating srcset:', error)
      return baseSrc
    }
  }

  /**
   * Generate format-specific srcset
   */
  generateFormatSrcSet(
    baseSrc: string,
    format: 'webp' | 'avif' | 'jpeg' | 'png',
    width: number,
    height: number,
    breakpoints: number[] = [320, 480, 640, 768, 1024, 1280],
    quality: number = 75
  ): string {
    if (!baseSrc || baseSrc.startsWith('data:')) return baseSrc

    try {
      const baseUrl = new URL(baseSrc, typeof window !== 'undefined' ? window.location.origin : 'https://nubiago.com')
      
      return breakpoints
        .map(breakpoint => {
          const scale = breakpoint / width
          const scaledWidth = Math.round(width * scale)
          const scaledHeight = Math.round(height * scale)
          
          // Create optimized URL with format and size parameters
          const optimizedUrl = new URL(baseUrl)
          optimizedUrl.searchParams.set('w', scaledWidth.toString())
          optimizedUrl.searchParams.set('h', scaledHeight.toString())
          optimizedUrl.searchParams.set('q', quality.toString())
          optimizedUrl.searchParams.set('f', format)
          
          return `${optimizedUrl.toString()} ${breakpoint}w`
        })
        .join(', ')
    } catch (error) {
      console.warn('Error generating format srcset:', error)
      return baseSrc
    }
  }

  /**
   * Generate responsive sizes attribute
   */
  generateSizes(
    width: number,
    breakpoints: number[] = [320, 480, 640, 768, 1024, 1280]
  ): string {
    const mobileSize = Math.min(breakpoints[0], 480)
    const tabletSize = Math.min(breakpoints[3], 768)
    
    return `(max-width: ${mobileSize}px) 100vw, (max-width: ${tabletSize}px) 50vw, ${Math.min(width, 33)}vw`
  }

  /**
   * Generate blur placeholder for images
   */
  generateBlurPlaceholder(width: number, height: number): string {
    // Create a simple SVG placeholder
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="placeholder" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#e5e7eb;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#placeholder)" />
      </svg>
    `
    
    return `data:image/svg+xml;base64,${btoa(svg)}`
  }

  /**
   * Optimize image URL with format and quality
   */
  optimizeImageUrl(
    src: string,
    format: 'webp' | 'avif' | 'jpeg' | 'png' | 'auto' = 'auto',
    quality: number = 75,
    width?: number,
    height?: number
  ): string {
    if (!src || src.startsWith('data:')) return src

    try {
      const url = new URL(src, typeof window !== 'undefined' ? window.location.origin : 'https://nubiago.com')
      
      // Set format if specified
      if (format !== 'auto') {
        url.searchParams.set('f', format)
      }
      
      // Set quality
      url.searchParams.set('q', quality.toString())
      
      // Set dimensions if provided
      if (width) url.searchParams.set('w', width.toString())
      if (height) url.searchParams.set('h', height.toString())
      
      return url.toString()
    } catch (error) {
      console.warn('Error optimizing image URL:', error)
      return src
    }
  }

  /**
   * Get network-optimized quality settings
   */
  getNetworkOptimizedQuality(networkSpeed: 'slow' | 'medium' | 'fast'): number {
    switch (networkSpeed) {
      case 'slow':
        return 60 // Lower quality for slow networks
      case 'medium':
        return 75 // Balanced quality
      case 'fast':
        return 85 // Higher quality for fast networks
      default:
        return 75
    }
  }

  /**
   * Generate complete optimized image data
   */
  optimizeImage(
    src: string,
    options: ImageOptimizationOptions
  ): OptimizedImageData {
    const {
      width,
      height,
      quality = 75,
      format = 'auto',
      breakpoints = [320, 480, 640, 768, 1024, 1280],
      sizes,
      networkSpeed = 'medium',
      priority = false
    } = options

    const optimalFormat = format === 'auto' ? this.getOptimalFormat(networkSpeed) : format
    const networkQuality = this.getNetworkOptimizedQuality(networkSpeed)
    const finalQuality = Math.min(quality, networkQuality)
    const finalSizes = sizes || this.generateSizes(width, breakpoints)

    // Generate format-specific URLs
    const formats = {
      webp: this.supportsWebP ? this.optimizeImageUrl(src, 'webp', finalQuality, width, height) : undefined,
      avif: this.supportsAVIF ? this.optimizeImageUrl(src, 'avif', finalQuality, width, height) : undefined,
      jpeg: this.optimizeImageUrl(src, 'jpeg', finalQuality, width, height),
      png: this.optimizeImageUrl(src, 'png', finalQuality, width, height)
    }

    // Generate srcset for optimal format
    const srcSet = this.generateFormatSrcSet(src, optimalFormat, width, height, breakpoints, finalQuality)

    return {
      src: formats[optimalFormat] || formats.jpeg,
      srcSet,
      sizes: finalSizes,
      formats,
      placeholder: this.generateBlurPlaceholder(width, height),
      loading: priority ? 'eager' : 'lazy'
    }
  }

  /**
   * Check if image should be optimized
   */
  shouldOptimize(src: string): boolean {
    if (!src) return false
    
    // Don't optimize data URLs, SVGs, or already optimized images
    if (src.startsWith('data:') || 
        src.includes('.svg') || 
        src.includes('?') ||
        src.includes('optimized')) {
      return false
    }
    
    return true
  }

  /**
   * Get image dimensions from URL or element
   */
  getImageDimensions(src: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve({ width: 400, height: 400 }) // Default fallback
        return
      }

      const img = new Image()
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight })
      }
      img.onerror = () => {
        resolve({ width: 400, height: 400 }) // Default fallback
      }
      img.src = src
    })
  }
}

// Export singleton instance
export const imageOptimizer = ImageOptimizer.getInstance()

// Export utility functions
export const optimizeImage = (src: string, options: ImageOptimizationOptions) => 
  imageOptimizer.optimizeImage(src, options)

export const generateSrcSet = (src: string, width: number, height: number, breakpoints?: number[], quality?: number) =>
  imageOptimizer.generateSrcSet(src, width, height, breakpoints, quality)

export const getOptimalFormat = (networkSpeed?: 'slow' | 'medium' | 'fast') =>
  imageOptimizer.getOptimalFormat(networkSpeed)

export default imageOptimizer
