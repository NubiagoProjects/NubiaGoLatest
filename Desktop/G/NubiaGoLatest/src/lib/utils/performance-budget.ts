/**
 * Performance Budget Management
 * Centralized performance budgets and monitoring thresholds
 */

export interface PerformanceBudget {
  // Core Web Vitals
  largestContentfulPaint: number // LCP - should be < 2.5s
  firstInputDelay: number // FID - should be < 100ms
  cumulativeLayoutShift: number // CLS - should be < 0.1
  
  // Custom Metrics
  timeToInteractive: number // TTI - should be < 3.8s
  firstContentfulPaint: number // FCP - should be < 1.8s
  totalBlockingTime: number // TBT - should be < 200ms
  
  // Resource Budgets
  totalBundleSize: number // KB
  imageSize: number // KB per image
  fontSize: number // KB total fonts
  
  // Runtime Performance
  renderTime: number // ms per render
  memoryUsage: number // MB
  networkLatency: number // ms
  
  // User Experience
  loadingStateTimeout: number // ms
  errorRecoveryTime: number // ms
  animationFrameRate: number // fps
}

export const DEFAULT_PERFORMANCE_BUDGET: PerformanceBudget = {
  // Core Web Vitals (Google recommendations)
  largestContentfulPaint: 2500,
  firstInputDelay: 100,
  cumulativeLayoutShift: 0.1,
  
  // Custom Metrics
  timeToInteractive: 3800,
  firstContentfulPaint: 1800,
  totalBlockingTime: 200,
  
  // Resource Budgets
  totalBundleSize: 250, // 250KB initial bundle
  imageSize: 100, // 100KB per image
  fontSize: 50, // 50KB total fonts
  
  // Runtime Performance
  renderTime: 16, // 60fps = 16ms per frame
  memoryUsage: 50, // 50MB
  networkLatency: 200, // 200ms
  
  // User Experience
  loadingStateTimeout: 3000, // 3 seconds
  errorRecoveryTime: 1000, // 1 second
  animationFrameRate: 60 // 60fps
}

// Network-specific budgets
export const NETWORK_BUDGETS: Record<string, Partial<PerformanceBudget>> = {
  'slow-2g': {
    largestContentfulPaint: 5000,
    timeToInteractive: 8000,
    totalBundleSize: 100,
    imageSize: 30,
    loadingStateTimeout: 10000,
    networkLatency: 2000
  },
  '2g': {
    largestContentfulPaint: 4000,
    timeToInteractive: 6000,
    totalBundleSize: 150,
    imageSize: 50,
    loadingStateTimeout: 8000,
    networkLatency: 1000
  },
  '3g': {
    largestContentfulPaint: 3000,
    timeToInteractive: 4500,
    totalBundleSize: 200,
    imageSize: 75,
    loadingStateTimeout: 5000,
    networkLatency: 500
  },
  '4g': DEFAULT_PERFORMANCE_BUDGET
}

// Device-specific budgets
export const DEVICE_BUDGETS: Record<string, Partial<PerformanceBudget>> = {
  mobile: {
    renderTime: 20, // Slower mobile CPUs
    memoryUsage: 30, // Limited mobile RAM
    totalBundleSize: 200,
    animationFrameRate: 30 // Battery optimization
  },
  tablet: {
    renderTime: 18,
    memoryUsage: 40,
    totalBundleSize: 225,
    animationFrameRate: 45
  },
  desktop: DEFAULT_PERFORMANCE_BUDGET
}

export class PerformanceBudgetManager {
  private static instance: PerformanceBudgetManager
  private currentBudget: PerformanceBudget
  private violations: Array<{
    metric: keyof PerformanceBudget
    actual: number
    budget: number
    severity: 'low' | 'medium' | 'high' | 'critical'
    timestamp: number
  }> = []

  private constructor() {
    this.currentBudget = { ...DEFAULT_PERFORMANCE_BUDGET }
    this.adaptBudgetToEnvironment()
  }

  static getInstance(): PerformanceBudgetManager {
    if (!PerformanceBudgetManager.instance) {
      PerformanceBudgetManager.instance = new PerformanceBudgetManager()
    }
    return PerformanceBudgetManager.instance
  }

  private adaptBudgetToEnvironment() {
    // Adapt based on network conditions
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      const networkType = connection.effectiveType || '4g'
      const networkBudget = NETWORK_BUDGETS[networkType]
      
      if (networkBudget) {
        this.currentBudget = { ...this.currentBudget, ...networkBudget }
      }
    }

    // Adapt based on device capabilities
    const deviceType = this.getDeviceType()
    const deviceBudget = DEVICE_BUDGETS[deviceType]
    
    if (deviceBudget) {
      this.currentBudget = { ...this.currentBudget, ...deviceBudget }
    }

    // Adapt based on memory constraints
    if ('memory' in navigator) {
      const deviceMemory = (navigator as any).deviceMemory
      if (deviceMemory && deviceMemory < 4) {
        this.currentBudget.memoryUsage = Math.min(this.currentBudget.memoryUsage, deviceMemory * 8)
        this.currentBudget.totalBundleSize = Math.min(this.currentBudget.totalBundleSize, 150)
      }
    }
  }

  private getDeviceType(): string {
    const userAgent = navigator.userAgent.toLowerCase()
    
    if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
      return 'mobile'
    }
    
    if (/tablet|ipad/i.test(userAgent)) {
      return 'tablet'
    }
    
    return 'desktop'
  }

  getBudget(): PerformanceBudget {
    return { ...this.currentBudget }
  }

  setBudget(budget: Partial<PerformanceBudget>) {
    this.currentBudget = { ...this.currentBudget, ...budget }
  }

  checkMetric(metric: keyof PerformanceBudget, actual: number): {
    withinBudget: boolean
    severity: 'low' | 'medium' | 'high' | 'critical'
    percentage: number
  } {
    const budget = this.currentBudget[metric]
    const percentage = (actual / budget) * 100
    const withinBudget = actual <= budget

    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low'
    
    if (percentage > 200) {
      severity = 'critical'
    } else if (percentage > 150) {
      severity = 'high'
    } else if (percentage > 120) {
      severity = 'medium'
    }

    if (!withinBudget) {
      this.violations.push({
        metric,
        actual,
        budget,
        severity,
        timestamp: Date.now()
      })
    }

    return { withinBudget, severity, percentage }
  }

  getViolations(since?: number): typeof this.violations {
    if (since) {
      return this.violations.filter(v => v.timestamp >= since)
    }
    return [...this.violations]
  }

  clearViolations() {
    this.violations = []
  }

  getPerformanceScore(): number {
    const recentViolations = this.getViolations(Date.now() - 60000) // Last minute
    
    if (recentViolations.length === 0) return 100

    let score = 100
    
    recentViolations.forEach(violation => {
      switch (violation.severity) {
        case 'critical':
          score -= 25
          break
        case 'high':
          score -= 15
          break
        case 'medium':
          score -= 10
          break
        case 'low':
          score -= 5
          break
      }
    })

    return Math.max(0, score)
  }

  // Core Web Vitals monitoring
  observeWebVitals() {
    if (typeof window === 'undefined') return

    // LCP Observer
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1] as any
          
          if (lastEntry) {
            this.checkMetric('largestContentfulPaint', lastEntry.startTime)
          }
        })
        
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      } catch (error) {
        console.warn('LCP observer failed:', error)
      }

      // FID Observer
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            this.checkMetric('firstInputDelay', entry.processingStart - entry.startTime)
          })
        })
        
        fidObserver.observe({ entryTypes: ['first-input'] })
      } catch (error) {
        console.warn('FID observer failed:', error)
      }

      // CLS Observer
      try {
        let clsValue = 0
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          })
          
          this.checkMetric('cumulativeLayoutShift', clsValue)
        })
        
        clsObserver.observe({ entryTypes: ['layout-shift'] })
      } catch (error) {
        console.warn('CLS observer failed:', error)
      }
    }
  }

  // Resource budget monitoring
  monitorResourceBudgets() {
    if (typeof window === 'undefined') return

    // Monitor bundle size
    if ('performance' in window && performance.getEntriesByType) {
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
      
      if (navigationEntries.length > 0) {
        const entry = navigationEntries[0]
        const transferSize = entry.transferSize || 0
        this.checkMetric('totalBundleSize', transferSize / 1024) // Convert to KB
      }

      // Monitor resource sizes
      const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      
      resourceEntries.forEach(entry => {
        if (entry.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
          const imageSize = (entry.transferSize || 0) / 1024
          this.checkMetric('imageSize', imageSize)
        }
      })
    }
  }

  // Memory monitoring
  monitorMemoryUsage() {
    if (typeof window === 'undefined') return

    if ('memory' in performance) {
      const memory = (performance as any).memory
      const memoryUsage = memory.usedJSHeapSize / 1024 / 1024 // MB
      this.checkMetric('memoryUsage', memoryUsage)
    }
  }

  // Start comprehensive monitoring
  startMonitoring() {
    this.observeWebVitals()
    this.monitorResourceBudgets()
    
    // Periodic monitoring
    setInterval(() => {
      this.monitorMemoryUsage()
    }, 5000)

    // Network change monitoring
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      connection.addEventListener('change', () => {
        this.adaptBudgetToEnvironment()
      })
    }
  }
}

export const performanceBudgetManager = PerformanceBudgetManager.getInstance()

// Auto-start monitoring in browser environment
if (typeof window !== 'undefined') {
  performanceBudgetManager.startMonitoring()
}
