// ============================================================================
// UNIVERSAL DEVICE DETECTION AND RESPONSIVE COMPONENT RENDERING UTILITY
// ============================================================================

export interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  screenWidth: number
  screenHeight: number
  userAgent: string
  touchSupport: boolean
  networkSpeed: 'slow' | 'medium' | 'fast'
  hasHover: boolean
  supportsPointer: boolean
  devicePixelRatio: number
  orientation: 'portrait' | 'landscape'
  isLowEndDevice: boolean
  capabilities: DeviceCapabilities
}

export interface DeviceCapabilities {
  touch: boolean
  hover: boolean
  pointer: 'none' | 'coarse' | 'fine'
  orientation: boolean
  vibration: boolean
  geolocation: boolean
  webgl: boolean
  serviceWorker: boolean
  localStorage: boolean
  sessionStorage: boolean
  indexedDB: boolean
}

export interface ResponsiveBreakpoints {
  mobile: number
  tablet: number
  desktop: number
  largeDesktop: number
}

export class UniversalDeviceDetector {
  private static instance: UniversalDeviceDetector
  private deviceInfo: DeviceInfo | null = null
  private breakpoints: ResponsiveBreakpoints = {
    mobile: 640,      // Lowered for better mobile coverage
    tablet: 1024,
    desktop: 1280,
    largeDesktop: 1920
  }

  private constructor() {
    if (typeof window !== 'undefined') {
      this.detectDevice()
      this.setupResizeListener()
    }
  }

  static getInstance(): UniversalDeviceDetector {
    if (!UniversalDeviceDetector.instance) {
      UniversalDeviceDetector.instance = new UniversalDeviceDetector()
    }
    return UniversalDeviceDetector.instance
  }

  /**
   * Detect device characteristics using feature detection
   */
  private detectDevice(): void {
    if (typeof window === 'undefined') return

    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : ''
    const devicePixelRatio = window.devicePixelRatio || 1

    // Detect capabilities first
    const capabilities = this.detectCapabilities()
    
    // Enhanced mobile detection using multiple signals
    const isMobile = this.detectMobileDevice(screenWidth, capabilities, userAgent)
    
    // Tablet detection based on size and capabilities
    const isTablet = this.detectTabletDevice(screenWidth, screenHeight, capabilities, userAgent)
    
    // Desktop detection
    const isDesktop = !isMobile && !isTablet

    // Touch support detection
    const touchSupport = capabilities.touch

    // Hover support detection
    const hasHover = capabilities.hover

    // Pointer type detection
    const supportsPointer = capabilities.pointer !== 'none'

    // Orientation detection
    const orientation = screenHeight > screenWidth ? 'portrait' : 'landscape'

    // Low-end device detection
    const isLowEndDevice = this.detectLowEndDevice(capabilities)

    // Network speed estimation
    const networkSpeed = this.estimateNetworkSpeed()

    this.deviceInfo = {
      isMobile,
      isTablet,
      isDesktop,
      screenWidth,
      screenHeight,
      userAgent,
      touchSupport,
      networkSpeed,
      hasHover,
      supportsPointer,
      devicePixelRatio,
      orientation,
      isLowEndDevice,
      capabilities
    }
  }

  /**
   * Detect device capabilities using feature detection
   */
  private detectCapabilities(): DeviceCapabilities {
    if (typeof window === 'undefined') {
      return {
        touch: false,
        hover: false,
        pointer: 'none',
        orientation: false,
        vibration: false,
        geolocation: false,
        webgl: false,
        serviceWorker: false,
        localStorage: false,
        sessionStorage: false,
        indexedDB: false
      }
    }

    return {
      // Touch capability
      touch: 'ontouchstart' in window || 
             (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0) ||
             (typeof navigator !== 'undefined' && (navigator as any).msMaxTouchPoints > 0),
      
      // Hover capability
      hover: window.matchMedia('(hover: hover)').matches,
      
      // Pointer capability
      pointer: window.matchMedia('(pointer: fine)').matches ? 'fine' :
               window.matchMedia('(pointer: coarse)').matches ? 'coarse' : 'none',
      
      // Orientation support
      orientation: 'orientation' in window || 'onorientationchange' in window,
      
      // Vibration API
      vibration: 'vibrate' in navigator,
      
      // Geolocation API
      geolocation: 'geolocation' in navigator,
      
      // WebGL support
      webgl: (() => {
        try {
          const canvas = document.createElement('canvas')
          return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
        } catch {
          return false
        }
      })(),
      
      // Service Worker support
      serviceWorker: 'serviceWorker' in navigator,
      
      // Storage APIs
      localStorage: (() => {
        try {
          return typeof localStorage !== 'undefined'
        } catch {
          return false
        }
      })(),
      
      sessionStorage: (() => {
        try {
          return typeof sessionStorage !== 'undefined'
        } catch {
          return false
        }
      })(),
      
      indexedDB: 'indexedDB' in window
    }
  }

  /**
   * Enhanced mobile device detection
   */
  private detectMobileDevice(screenWidth: number, capabilities: DeviceCapabilities, userAgent: string): boolean {
    // Primary: Screen size check with flexible threshold
    if (screenWidth <= this.breakpoints.mobile) return true
    
    // Secondary: Touch-only devices (no hover, coarse pointer)
    if (capabilities.touch && !capabilities.hover && capabilities.pointer === 'coarse') return true
    
    // Tertiary: User agent fallback for edge cases
    if (/Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) return true
    
    // Quaternary: Orientation support on small screens (likely mobile)
    if (screenWidth <= 900 && capabilities.orientation) return true
    
    return false
  }

  /**
   * Enhanced tablet device detection
   */
  private detectTabletDevice(screenWidth: number, screenHeight: number, capabilities: DeviceCapabilities, userAgent: string): boolean {
    // Skip if already detected as mobile
    if (this.detectMobileDevice(screenWidth, capabilities, userAgent)) return false
    
    // Primary: Screen size range
    const isTabletSize = screenWidth > this.breakpoints.mobile && screenWidth < this.breakpoints.desktop
    
    // Secondary: Touch support with larger screen
    const isTouchLargeScreen = capabilities.touch && screenWidth > 600
    
    // Tertiary: User agent detection for known tablets
    const isTabletUA = /iPad|Android(?!.*Mobile)|Tablet/i.test(userAgent)
    
    // Quaternary: Aspect ratio check (tablets often have different ratios)
    const aspectRatio = Math.max(screenWidth, screenHeight) / Math.min(screenWidth, screenHeight)
    const isTabletAspectRatio = aspectRatio < 1.8 && screenWidth > 600
    
    return isTabletSize || (isTouchLargeScreen && (isTabletUA || isTabletAspectRatio))
  }

  /**
   * Detect low-end devices for performance optimization
   */
  private detectLowEndDevice(capabilities: DeviceCapabilities): boolean {
    // Check device memory
    if (typeof navigator !== 'undefined' && 'deviceMemory' in navigator) {
      const memory = (navigator as any).deviceMemory
      if (memory && memory < 2) return true
    }
    
    // Check hardware concurrency
    if (typeof navigator !== 'undefined' && 'hardwareConcurrency' in navigator) {
      const cores = navigator.hardwareConcurrency
      if (cores && cores < 2) return true
    }
    
    // Check for missing modern capabilities
    const modernFeatures = [
      capabilities.webgl,
      capabilities.serviceWorker,
      capabilities.indexedDB
    ]
    
    const missingFeatures = modernFeatures.filter(feature => !feature).length
    if (missingFeatures >= 2) return true
    
    return false
  }

  /**
   * Estimate network speed using available APIs
   */
  private estimateNetworkSpeed(): 'slow' | 'medium' | 'fast' {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return 'medium'

    // Check for Network Information API
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      if (connection?.effectiveType) {
        switch (connection.effectiveType) {
          case 'slow-2g':
          case '2g':
            return 'slow'
          case '3g':
            return 'medium'
          case '4g':
            return 'fast'
          default:
            return 'medium'
        }
      }
    }

    // Check for device memory (rough indicator)
    if ('deviceMemory' in navigator) {
      const memory = (navigator as any).deviceMemory
      if (memory < 2) return 'slow'
      if (memory > 4) return 'fast'
      return 'medium'
    }

    // Check for hardware concurrency
    if ('hardwareConcurrency' in navigator) {
      const cores = (navigator as any).hardwareConcurrency
      if (cores < 2) return 'slow'
      if (cores > 4) return 'fast'
      return 'medium'
    }

    return 'medium'
  }

  /**
   * Setup resize listener for responsive updates
   */
  private setupResizeListener(): void {
    if (typeof window === 'undefined') return

    let resizeTimeout: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        this.detectDevice()
      }, 250) // Debounce resize events
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)
  }

  /**
   * Get current device information
   */
  getDeviceInfo(): DeviceInfo | null {
    return this.deviceInfo
  }

  /**
   * Check if current device is mobile
   */
  isMobile(): boolean {
    return this.deviceInfo?.isMobile || false
  }

  /**
   * Check if current device is tablet
   */
  isTablet(): boolean {
    return this.deviceInfo?.isTablet || false
  }

  /**
   * Check if current device is desktop
   */
  isDesktop(): boolean {
    return this.deviceInfo?.isDesktop || false
  }

  /**
   * Check if device supports touch
   */
  hasTouchSupport(): boolean {
    return this.deviceInfo?.touchSupport || false
  }

  /**
   * Check if device has hover capability
   */
  hasHoverSupport(): boolean {
    return this.deviceInfo?.hasHover || false
  }

  /**
   * Get pointer type
   */
  getPointerType(): 'none' | 'coarse' | 'fine' {
    return this.deviceInfo?.capabilities.pointer || 'none'
  }

  /**
   * Check if device is low-end
   */
  isLowEndDevice(): boolean {
    return this.deviceInfo?.isLowEndDevice || false
  }

  /**
   * Get device capabilities
   */
  getCapabilities(): DeviceCapabilities | null {
    return this.deviceInfo?.capabilities || null
  }

  /**
   * Get estimated network speed
   */
  getNetworkSpeed(): 'slow' | 'medium' | 'fast' {
    return this.deviceInfo?.networkSpeed || 'medium'
  }

  /**
   * Check if screen width is below a specific breakpoint
   */
  isBelowBreakpoint(breakpoint: number): boolean {
    if (typeof window === 'undefined') return false
    return window.innerWidth < breakpoint
  }

  /**
   * Check if screen width is above a specific breakpoint
   */
  isAboveBreakpoint(breakpoint: number): boolean {
    if (typeof window === 'undefined') return false
    return window.innerWidth >= breakpoint
  }

  /**
   * Get current screen dimensions
   */
  getScreenDimensions(): { width: number; height: number } {
    if (typeof window === 'undefined') {
      return { width: 1024, height: 768 }
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight
    }
  }

  /**
   * Check if device is in landscape mode
   */
  isLandscape(): boolean {
    if (typeof window === 'undefined') return false
    return window.innerWidth > window.innerHeight
  }

  /**
   * Check if device is in portrait mode
   */
  isPortrait(): boolean {
    if (typeof window === 'undefined') return false
    return window.innerHeight > window.innerWidth
  }

  /**
   * Get device pixel ratio
   */
  getPixelRatio(): number {
    if (typeof window === 'undefined') return 1
    return window.devicePixelRatio || 1
  }

  /**
   * Get recommended image quality for current device
   */
  getRecommendedImageQuality(): number {
    if (this.isLowEndDevice()) return 60
    if (this.deviceInfo?.networkSpeed === 'slow') return 70
    if (this.deviceInfo?.networkSpeed === 'fast') return 85
    return 75
  }

  /**
   * Get recommended image format for current device
   */
  getRecommendedImageFormat(): 'webp' | 'avif' | 'jpeg' | 'png' {
    if (this.deviceInfo?.networkSpeed === 'slow') return 'jpeg' // Better compatibility
    return 'webp' // Better compression
  }

  /**
   * Universal navigation method that works across all devices
   */
  navigateUniversally(router: any, href: string, options?: { replace?: boolean }): void {
    if (typeof window === 'undefined') return

    const navigate = () => {
      if (options?.replace) {
        router.replace(href)
      } else {
        router.push(href)
      }
    }

    // Use requestIdleCallback for better performance on low-end devices
    if ('requestIdleCallback' in window && this.isLowEndDevice()) {
      (window as any).requestIdleCallback(navigate, { timeout: 100 })
    } else if ('requestAnimationFrame' in window) {
      requestAnimationFrame(navigate)
    } else {
      // Fallback for older browsers
      setTimeout(navigate, 0)
    }
  }

  /**
   * Get optimal event handling strategy for current device
   */
  getEventHandlingStrategy(): {
    useTouch: boolean
    useMouse: boolean
    useKeyboard: boolean
    preventDefaults: boolean
  } {
    const capabilities = this.getCapabilities()
    
    return {
      useTouch: capabilities?.touch || false,
      useMouse: capabilities?.hover || false,
      useKeyboard: !this.isMobile(),
      preventDefaults: this.isMobile() && !capabilities?.hover
    }
  }
}

// Export singleton instance with new name
export const universalDeviceDetector = UniversalDeviceDetector.getInstance()

// Backward compatibility - keep old exports
export const mobileDetector = universalDeviceDetector

// Export utility functions with enhanced capabilities
export const isMobile = () => universalDeviceDetector.isMobile()
export const isTablet = () => universalDeviceDetector.isTablet()
export const isDesktop = () => universalDeviceDetector.isDesktop()
export const hasTouchSupport = () => universalDeviceDetector.hasTouchSupport()
export const hasHoverSupport = () => universalDeviceDetector.hasHoverSupport()
export const getPointerType = () => universalDeviceDetector.getPointerType()
export const getNetworkSpeed = () => universalDeviceDetector.getNetworkSpeed()
export const getDeviceInfo = () => universalDeviceDetector.getDeviceInfo()
export const getCapabilities = () => universalDeviceDetector.getCapabilities()
export const isLowEndDevice = () => universalDeviceDetector.isLowEndDevice()
export const getEventHandlingStrategy = () => universalDeviceDetector.getEventHandlingStrategy()
export const navigateUniversally = (router: any, href: string, options?: { replace?: boolean }) => 
  universalDeviceDetector.navigateUniversally(router, href, options)

export default universalDeviceDetector
