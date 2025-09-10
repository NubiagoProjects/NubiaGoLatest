// Bundle Optimization Utility
// Helps monitor and optimize bundle sizes for better performance

import { logger } from '@/lib/utils/logger'

// Bundle size thresholds
const BUNDLE_THRESHOLDS = {
  CRITICAL: 500, // 500KB - Critical performance impact
  HIGH: 300,     // 300KB - High performance impact
  MEDIUM: 200,   // 200KB - Medium performance impact
  LOW: 100,      // 100KB - Low performance impact
  OPTIMAL: 50    // 50KB - Optimal performance
} as const

// Bundle size categories
export type BundleSizeCategory = keyof typeof BUNDLE_THRESHOLDS

// Bundle analysis result
export interface BundleAnalysis {
  totalSize: number
  category: BundleSizeCategory
  recommendations: string[]
  performanceImpact: 'critical' | 'high' | 'medium' | 'low' | 'optimal'
  estimatedLoadTime: number // in milliseconds
}

/**
 * Analyze bundle size and provide optimization recommendations
 */
export function analyzeBundleSize(bundleSizeKB: number): BundleAnalysis {
  let category: BundleSizeCategory = 'OPTIMAL'
  let performanceImpact: BundleAnalysis['performanceImpact'] = 'optimal'
  let estimatedLoadTime = 0

  // Determine category and performance impact
  if (bundleSizeKB >= BUNDLE_THRESHOLDS.CRITICAL) {
    category = 'CRITICAL'
    performanceImpact = 'critical'
    estimatedLoadTime = bundleSizeKB * 2.5 // 2.5ms per KB on slow connections
  } else if (bundleSizeKB >= BUNDLE_THRESHOLDS.HIGH) {
    category = 'HIGH'
    performanceImpact = 'high'
    estimatedLoadTime = bundleSizeKB * 2.0 // 2.0ms per KB on medium connections
  } else if (bundleSizeKB >= BUNDLE_THRESHOLDS.MEDIUM) {
    category = 'MEDIUM'
    performanceImpact = 'medium'
    estimatedLoadTime = bundleSizeKB * 1.5 // 1.5ms per KB on good connections
  } else if (bundleSizeKB >= BUNDLE_THRESHOLDS.LOW) {
    category = 'LOW'
    performanceImpact = 'low'
    estimatedLoadTime = bundleSizeKB * 1.0 // 1.0ms per KB on fast connections
  } else {
    category = 'OPTIMAL'
    performanceImpact = 'optimal'
    estimatedLoadTime = bundleSizeKB * 0.5 // 0.5ms per KB on excellent connections
  }

  // Generate optimization recommendations
  const recommendations = generateRecommendations(bundleSizeKB, category)

  return {
    totalSize: bundleSizeKB,
    category,
    recommendations,
    performanceImpact,
    estimatedLoadTime: Math.round(estimatedLoadTime)
  }
}

/**
 * Generate optimization recommendations based on bundle size
 */
function generateRecommendations(bundleSizeKB: number, category: BundleSizeCategory): string[] {
  const recommendations: string[] = []

  if (category === 'CRITICAL' || category === 'HIGH') {
    recommendations.push(
      'Implement aggressive code splitting and lazy loading',
      'Remove unused dependencies and dead code',
      'Optimize and compress images and assets',
      'Consider using dynamic imports for heavy components',
      'Implement service worker for caching'
    )
  }

  if (category === 'MEDIUM' || category === 'HIGH') {
    recommendations.push(
      'Lazy load non-critical components',
      'Optimize bundle splitting strategy',
      'Remove duplicate dependencies',
      'Implement tree shaking for better optimization'
    )
  }

  if (category === 'LOW' || category === 'MEDIUM') {
    recommendations.push(
      'Fine-tune code splitting',
      'Optimize critical rendering path',
      'Implement resource hints (preload, prefetch)'
    )
  }

  if (category === 'OPTIMAL') {
    recommendations.push(
      'Maintain current optimization level',
      'Monitor for bundle size regressions',
      'Consider implementing advanced optimizations'
    )
  }

  // Specific recommendations based on size
  if (bundleSizeKB > 400) {
    recommendations.push('Consider implementing micro-frontends architecture')
  }

  if (bundleSizeKB > 300) {
    recommendations.push('Implement aggressive dependency optimization')
  }

  if (bundleSizeKB > 200) {
    recommendations.push('Use bundle analyzer to identify large packages')
  }

  return recommendations
}

/**
 * Monitor bundle size and log warnings
 */
export function monitorBundleSize(bundleSizeKB: number, pageName: string) {
  const analysis = analyzeBundleSize(bundleSizeKB)
  
  // Log bundle size information
  logger.info(`Bundle size for ${pageName}: ${bundleSizeKB}KB (${analysis.category})`)
  
  // Log warnings for large bundles
  if (analysis.performanceImpact === 'critical' || analysis.performanceImpact === 'high') {
    logger.warn(`Large bundle detected for ${pageName}: ${bundleSizeKB}KB`)
    logger.warn(`Performance impact: ${analysis.performanceImpact}`)
    logger.warn(`Estimated load time: ${analysis.estimatedLoadTime}ms`)
    
    // Log recommendations
    analysis.recommendations.forEach((rec, index) => {
      logger.warn(`Recommendation ${index + 1}: ${rec}`)
    })
  }
  
  return analysis
}

/**
 * Calculate bundle size reduction percentage
 */
export function calculateBundleReduction(originalSize: number, newSize: number): {
  reductionKB: number
  reductionPercent: number
  improvement: 'significant' | 'moderate' | 'minimal' | 'none'
} {
  const reductionKB = originalSize - newSize
  const reductionPercent = (reductionKB / originalSize) * 100
  
  let improvement: 'significant' | 'moderate' | 'minimal' | 'none' = 'none'
  
  if (reductionPercent >= 30) {
    improvement = 'significant'
  } else if (reductionPercent >= 15) {
    improvement = 'moderate'
  } else if (reductionPercent >= 5) {
    improvement = 'minimal'
  }
  
  return {
    reductionKB: Math.round(reductionKB * 100) / 100,
    reductionPercent: Math.round(reductionPercent * 100) / 100,
    improvement
  }
}

/**
 * Get bundle size thresholds
 */
export function getBundleThresholds() {
  return { ...BUNDLE_THRESHOLDS }
}

/**
 * Check if bundle size is within acceptable limits
 */
export function isBundleSizeAcceptable(bundleSizeKB: number): boolean {
  return bundleSizeKB <= BUNDLE_THRESHOLDS.MEDIUM
}

/**
 * Generate bundle optimization report
 */
export function generateBundleReport(bundleSizes: Record<string, number>) {
  const report = {
    summary: {
      totalPages: Object.keys(bundleSizes).length,
      averageSize: 0,
      largestBundle: { page: '', size: 0 },
      smallestBundle: { page: '', size: 0 },
      criticalBundles: [] as string[],
      highBundles: [] as string[]
    },
    recommendations: [] as string[],
    performanceImpact: 'optimal' as BundleAnalysis['performanceImpact']
  }
  
  let totalSize = 0
  let largestSize = 0
  let smallestSize = Infinity
  
  // Analyze each bundle
  Object.entries(bundleSizes).forEach(([page, size]) => {
    totalSize += size
    
    if (size > largestSize) {
      largestSize = size
      report.summary.largestBundle = { page, size }
    }
    
    if (size < smallestSize) {
      smallestSize = size
      report.summary.smallestBundle = { page, size }
    }
    
    const analysis = analyzeBundleSize(size)
    if (analysis.performanceImpact === 'critical') {
      report.summary.criticalBundles.push(page)
    } else if (analysis.performanceImpact === 'high') {
      report.summary.highBundles.push(page)
    }
  })
  
  report.summary.averageSize = Math.round(totalSize / Object.keys(bundleSizes).length)
  
  // Determine overall performance impact
  if (report.summary.criticalBundles.length > 0) {
    report.performanceImpact = 'critical'
  } else if (report.summary.highBundles.length > 0) {
    report.performanceImpact = 'high'
  } else if (report.summary.averageSize > BUNDLE_THRESHOLDS.MEDIUM) {
    report.performanceImpact = 'medium'
  } else if (report.summary.averageSize > BUNDLE_THRESHOLDS.LOW) {
    report.performanceImpact = 'low'
  }
  
  // Generate overall recommendations
  if (report.performanceImpact === 'critical' || report.performanceImpact === 'high') {
    report.recommendations.push(
      'Implement comprehensive bundle optimization strategy',
      'Focus on critical and high-impact bundles first',
      'Consider architectural changes for large applications'
    )
  }
  
  return report
}
