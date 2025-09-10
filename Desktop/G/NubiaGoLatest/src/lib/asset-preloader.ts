// ============================================================================
// CRITICAL ASSET PRELOADING UTILITY
// ============================================================================

interface PreloadResource {
  href: string
  as: 'image' | 'style' | 'script' | 'font' | 'fetch' | 'document'
  type?: string
  crossOrigin?: 'anonymous' | 'use-credentials'
  media?: string
}

interface PrefetchResource {
  href: string
  as?: 'image' | 'style' | 'script' | 'font' | 'fetch' | 'document'
  type?: string
}

class AssetPreloader {
  private preloadedResources = new Set<string>()
  private prefetchedResources = new Set<string>()

  /**
   * Preload critical resources immediately
   */
  preloadCriticalAssets() {
    if (typeof window === 'undefined') return

    const criticalAssets: PreloadResource[] = [
      // Critical images
      { href: '/logo.svg', as: 'image', type: 'image/svg+xml' },
      { href: '/hero-image.webp', as: 'image', type: 'image/webp' },
      { href: '/fallback-product.jpg', as: 'image', type: 'image/jpeg' },
      
      // Critical fonts
      { 
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap', 
        as: 'style' 
      },
      
      // Critical API endpoints
      { href: '/api/products', as: 'fetch', crossOrigin: 'anonymous' },
      { href: '/api/categories', as: 'fetch', crossOrigin: 'anonymous' },
      
      // Critical CSS
      { href: '/globals.css', as: 'style' },
      
      // Critical JavaScript
      { href: '/sw.js', as: 'script' },
    ]

    criticalAssets.forEach(resource => {
      this.preloadResource(resource)
    })
  }

  /**
   * Preload resource with performance optimization
   */
  private preloadResource({ href, as, type, crossOrigin, media }: PreloadResource) {
    if (this.preloadedResources.has(href)) return

    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = href
    link.as = as
    
    if (type) link.type = type
    if (crossOrigin) link.crossOrigin = crossOrigin
    if (media) link.media = media

    // Add to head
    document.head.appendChild(link)
    this.preloadedResources.add(href)
  }

  /**
   * Prefetch next page resources based on user behavior
   */
  prefetchNextPageResources() {
    if (typeof window === 'undefined') return

    // Common navigation paths for e-commerce
    const likelyPages = [
      '/products',
      '/categories',
      '/cart',
      '/account',
      '/search',
      '/about',
      '/contact'
    ]

    // Prefetch main navigation pages
    likelyPages.forEach(page => {
      this.prefetchResource({ href: page, as: 'document' })
    })

    // Prefetch critical product images
    this.prefetchProductImages()
  }

  /**
   * Prefetch product images for better UX
   */
  private prefetchProductImages() {
    // Prefetch common product image sizes
    const imageSizes = [320, 480, 640, 768]
    const imageFormats = ['webp', 'jpeg']
    
    // This would typically come from your product data
    // For now, we'll prefetch placeholder images
    imageSizes.forEach(size => {
      imageFormats.forEach(format => {
        const imageUrl = `/api/placeholder/${size}x${size}.${format}`
        this.prefetchResource({ href: imageUrl, as: 'image' })
      })
    })
  }

  /**
   * Prefetch resource with intelligent timing
   */
  prefetchResource({ href, as, type }: PrefetchResource) {
    if (this.prefetchedResources.has(href)) return

    // Only prefetch on fast connections
    if (this.shouldPrefetch()) {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = href
      
      if (as) link.as = as
      if (type) link.type = type

      document.head.appendChild(link)
      this.prefetchedResources.add(href)
    }
  }

  /**
   * Check if prefetching is appropriate based on network conditions
   */
  private shouldPrefetch(): boolean {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      
      // Don't prefetch on slow connections
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        return false
      }
      
      // Limit prefetching on metered connections
      if (connection.metered) {
        return false
      }
    }
    
    return true
  }

  /**
   * Preload images with intersection observer
   */
  preloadImagesOnScroll(imageUrls: string[]) {
    if (typeof window === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            const src = img.dataset.src
            if (src && !this.preloadedResources.has(src)) {
              this.preloadResource({ href: src, as: 'image' })
            }
          }
        })
      },
      { rootMargin: '100px' }
    )

    // Create placeholder elements for intersection observation
    imageUrls.forEach(url => {
      if (!this.preloadedResources.has(url)) {
        const placeholder = document.createElement('div')
        placeholder.dataset.src = url
        placeholder.style.position = 'absolute'
        placeholder.style.top = '-1px'
        placeholder.style.left = '-1px'
        placeholder.style.width = '1px'
        placeholder.style.height = '1px'
        placeholder.style.opacity = '0'
        
        document.body.appendChild(placeholder)
        observer.observe(placeholder)
      }
    })
  }

  /**
   * DNS prefetch for external domains
   */
  prefetchDNS(domains: string[]) {
    if (typeof window === 'undefined') return

    domains.forEach(domain => {
      if (!this.preloadedResources.has(domain)) {
        const link = document.createElement('link')
        link.rel = 'dns-prefetch'
        link.href = domain
        document.head.appendChild(link)
        this.preloadedResources.add(domain)
      }
    })
  }

  /**
   * Preconnect to critical origins
   */
  preconnectOrigins(origins: string[]) {
    if (typeof window === 'undefined') return

    origins.forEach(origin => {
      if (!this.preloadedResources.has(origin)) {
        const link = document.createElement('link')
        link.rel = 'preconnect'
        link.href = origin
        link.crossOrigin = 'anonymous'
        document.head.appendChild(link)
        this.preloadedResources.add(origin)
      }
    })
  }

  /**
   * Module preload for critical JavaScript modules
   */
  preloadModules(moduleUrls: string[]) {
    if (typeof window === 'undefined') return

    moduleUrls.forEach(url => {
      if (!this.preloadedResources.has(url)) {
        const link = document.createElement('link')
        link.rel = 'modulepreload'
        link.href = url
        document.head.appendChild(link)
        this.preloadedResources.add(url)
      }
    })
  }

  /**
   * Preload critical CSS with media queries
   */
  preloadCriticalCSS() {
    if (typeof window === 'undefined') return

    // Preload mobile-first CSS
    const criticalCSS = [
      { href: '/globals.css', media: 'all' },
      { href: '/mobile.css', media: '(max-width: 768px)' },
      { href: '/desktop.css', media: '(min-width: 769px)' }
    ]

    criticalCSS.forEach(css => {
      this.preloadResource({ 
        href: css.href, 
        as: 'style', 
        media: css.media 
      })
    })
  }

  /**
   * Intelligent prefetching based on user behavior
   */
  setupIntelligentPrefetching() {
    if (typeof window === 'undefined') return

    // Prefetch on hover
    document.addEventListener('mouseover', (e) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')
      
      if (link && link.href) {
        const url = new URL(link.href, window.location.origin)
        if (url.origin === window.location.origin) {
          // Small delay to avoid prefetching on accidental hovers
          setTimeout(() => {
            this.prefetchResource({ href: link.href, as: 'document' })
          }, 100)
        }
      }
    })

    // Prefetch on scroll (for infinite scroll)
    let scrollTimeout: NodeJS.Timeout
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        if (this.isNearBottom()) {
          this.prefetchNextPageResources()
        }
      }, 150)
    })
  }

  /**
   * Check if user is near bottom of page
   */
  private isNearBottom(): boolean {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const windowHeight = window.innerHeight
    const documentHeight = document.documentElement.scrollHeight
    
    return scrollTop + windowHeight >= documentHeight - 500
  }

  /**
   * Clear preloaded resources cache
   */
  clearCache() {
    this.preloadedResources.clear()
    this.prefetchedResources.clear()
  }

  /**
   * Get preloading statistics
   */
  getStats() {
    return {
      preloaded: this.preloadedResources.size,
      prefetched: this.prefetchedResources.size,
      total: this.preloadedResources.size + this.prefetchedResources.size
    }
  }
}

// Singleton instance
export const assetPreloader = new AssetPreloader()

// Initialize critical assets on load
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      assetPreloader.preloadCriticalAssets()
      assetPreloader.preloadCriticalCSS()
      assetPreloader.setupIntelligentPrefetching()
    })
  } else {
    assetPreloader.preloadCriticalAssets()
    assetPreloader.preloadCriticalCSS()
    assetPreloader.setupIntelligentPrefetching()
  }
}

export default assetPreloader
