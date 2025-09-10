# ⚡ HomeBase Performance Guide

Comprehensive performance optimization and monitoring guide for the HomeBase e-commerce platform.

## 📋 Table of Contents

1. [Performance Overview](#performance-overview)
2. [Bundle Optimization](#bundle-optimization)
3. [Webpack Configuration](#webpack-configuration)
4. [Mobile Optimization](#mobile-optimization)
5. [Image Optimization](#image-optimization)
6. [Caching Strategies](#caching-strategies)
7. [Performance Monitoring](#performance-monitoring)
8. [Performance Best Practices](#performance-best-practices)
9. [Troubleshooting](#troubleshooting)

---

## 🚀 Performance Overview

### Performance Goals
- **First Contentful Paint (FCP):** < 1.5 seconds
- **Largest Contentful Paint (LCP):** < 2.5 seconds
- **First Input Delay (FID):** < 100ms
- **Cumulative Layout Shift (CLS):** < 0.1
- **Time to Interactive (TTI):** < 3.8 seconds

### Current Performance Status
- ✅ Bundle size optimized
- ✅ Image optimization implemented
- ✅ Lazy loading enabled
- ✅ Caching strategies in place
- ✅ Mobile-first responsive design
- 🔄 Performance monitoring setup
- 🔄 Advanced analytics implementation

### Performance Metrics
```typescript
interface PerformanceMetrics {
  fcp: number;        // First Contentful Paint
  lcp: number;        // Largest Contentful Paint
  fid: number;        // First Input Delay
  cls: number;        // Cumulative Layout Shift
  tti: number;        // Time to Interactive
  tbt: number;        // Total Blocking Time
  fmp: number;        // First Meaningful Paint
}
```

---

## 📦 Bundle Optimization

### Bundle Analysis

#### Current Bundle Status
- **Total Bundle Size:** Optimized for production
- **JavaScript Bundle:** Tree-shaken and minified
- **CSS Bundle:** Purged and optimized
- **Asset Optimization:** Compressed and cached

#### Bundle Optimization Strategies

##### 1. Tree Shaking
```typescript
// Import only what you need
// ❌ Bad - imports entire library
import _ from 'lodash';

// ✅ Good - imports only specific functions
import { debounce, throttle } from 'lodash-es';
```

##### 2. Code Splitting
```typescript
// Dynamic imports for route-based splitting
const ProductPage = dynamic(() => import('./ProductPage'), {
  loading: () => <ProductPageSkeleton />,
  ssr: false
});

// Component-based splitting
const AdminDashboard = dynamic(() => import('./AdminDashboard'), {
  loading: () => <DashboardSkeleton />,
  ssr: false
});
```

##### 3. Lazy Loading
```typescript
// Lazy load non-critical components
const LazyComponent = lazy(() => import('./LazyComponent'));

// Lazy load images
const LazyImage = ({ src, alt, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onLoad={() => setIsLoaded(true)}
      className={`transition-opacity duration-300 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      }`}
      {...props}
    />
  );
};
```

### Bundle Optimization Implementation

#### Recent Optimizations Applied
- ✅ Implemented dynamic imports for route-based splitting
- ✅ Added tree shaking for unused code elimination
- ✅ Optimized third-party library imports
- ✅ Implemented lazy loading for non-critical components
- ✅ Added bundle analysis and monitoring

#### Bundle Analysis Tools
```bash
# Analyze bundle size
npm run analyze

# Build with bundle analysis
npm run build:analyze

# Check bundle dependencies
npm run bundle:check
```

---

## ⚙️ Webpack Configuration

### Next.js Webpack Optimization

#### Custom Webpack Configuration
```javascript
// next.config.js
const nextConfig = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Bundle analyzer
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          analyzerPort: 8888,
          openAnalyzer: true,
        })
      );
    }

    // Optimize bundle splitting
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          enforce: true,
        },
      },
    };

    // Optimize images
    config.module.rules.push({
      test: /\.(png|jpe?g|gif|svg)$/i,
      use: [
        {
          loader: 'image-webpack-loader',
          options: {
            mozjpeg: { progressive: true, quality: 65 },
            optipng: { enabled: false },
            pngquant: { quality: [0.65, 0.90], speed: 4 },
            gifsicle: { interlaced: false },
            webp: { quality: 75 },
          },
        },
      ],
    });

    return config;
  },
};
```

#### Webpack Performance Hints
```javascript
// Performance optimization hints
config.performance = {
  hints: 'warning',
  maxEntrypointSize: 512000,
  maxAssetSize: 512000,
  assetFilter: (assetFilename) => {
    return !assetFilename.endsWith('.map');
  },
};
```

### Bundle Optimization Plugins

#### Essential Plugins
```javascript
// Compression plugin for production
const CompressionPlugin = require('compression-webpack-plugin');

// Terser plugin for JavaScript minification
const TerserPlugin = require('terser-webpack-plugin');

// CSS optimization
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

// Bundle analyzer
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
```

---

## 📱 Mobile Optimization

### Mobile-First Design

#### Responsive Design Principles
```css
/* Mobile-first CSS approach */
.container {
  width: 100%;
  padding: 1rem;
}

/* Tablet and up */
@media (min-width: 768px) {
  .container {
    width: 750px;
    margin: 0 auto;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .container {
    width: 970px;
  }
}
```

#### Mobile Performance Optimizations

##### 1. Touch Optimization
```typescript
// Optimize touch interactions
const TouchOptimizedButton = ({ children, onClick, ...props }) => {
  const handleTouchStart = (e) => {
    // Add touch feedback
    e.currentTarget.style.transform = 'scale(0.95)';
  };

  const handleTouchEnd = (e) => {
    // Remove touch feedback
    e.currentTarget.style.transform = 'scale(1)';
  };

  return (
    <button
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};
```

##### 2. Mobile-Specific Components
```typescript
// Mobile navigation component
const MobileNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="mobile-nav">
      <button
        className="mobile-nav-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation"
      >
        <span className="hamburger"></span>
      </button>
      
      <div className={`mobile-nav-menu ${isOpen ? 'open' : ''}`}>
        <NavLinks />
      </div>
    </nav>
  );
};
```

### Mobile Performance Status

#### Current Mobile Optimizations
- ✅ Responsive design implemented
- ✅ Touch-optimized interactions
- ✅ Mobile-first CSS approach
- ✅ Optimized images for mobile
- ✅ Reduced bundle size for mobile
- 🔄 Progressive Web App (PWA) features
- 🔄 Mobile-specific caching strategies

---

## 🖼️ Image Optimization

### Image Optimization Strategies

#### 1. Next.js Image Component
```typescript
import Image from 'next/image';

// Optimized image component
const OptimizedImage = ({ src, alt, width, height, ...props }) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      {...props}
    />
  );
};
```

#### 2. Image Formats and Compression
```typescript
// Image format optimization
const getOptimizedImageUrl = (originalUrl: string, format: 'webp' | 'avif' = 'webp') => {
  // Convert to WebP or AVIF for better compression
  if (format === 'webp') {
    return originalUrl.replace(/\.(jpg|jpeg|png)$/, '.webp');
  }
  
  if (format === 'avif') {
    return originalUrl.replace(/\.(jpg|jpeg|png|webp)$/, '.avif');
  }
  
  return originalUrl;
};

// Responsive images
const ResponsiveImage = ({ src, alt, sizes, ...props }) => {
  return (
    <picture>
      <source
        srcSet={`${src.replace('.jpg', '.avif')}`}
        type="image/avif"
      />
      <source
        srcSet={`${src.replace('.jpg', '.webp')}`}
        type="image/webp"
      />
      <img src={src} alt={alt} {...props} />
    </picture>
  );
};
```

#### 3. Lazy Loading Images
```typescript
// Intersection Observer for lazy loading
const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [ref, setRef] = useState(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(ref);

    return () => observer.disconnect();
  }, [ref, options]);

  return [setRef, isIntersecting];
};

// Lazy image component
const LazyImage = ({ src, alt, ...props }) => {
  const [ref, isIntersecting] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px',
  });

  return (
    <img
      ref={ref}
      src={isIntersecting ? src : ''}
      alt={alt}
      loading="lazy"
      {...props}
    />
  );
};
```

### Image Optimization Status

#### Current Image Optimizations
- ✅ Next.js Image component implemented
- ✅ WebP and AVIF format support
- ✅ Lazy loading for images
- ✅ Responsive image sizes
- ✅ Image compression and optimization
- ✅ Placeholder and blur effects
- 🔄 CDN integration for images
- 🔄 Advanced image caching strategies

---

## 💾 Caching Strategies

### Browser Caching

#### Cache Headers Configuration
```typescript
// Next.js API route with cache headers
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set cache headers
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  res.setHeader('ETag', generateETag(req.body));
  
  // Check if client has cached version
  const ifNoneMatch = req.headers['if-none-match'];
  if (ifNoneMatch === generateETag(req.body)) {
    return res.status(304).end();
  }
  
  // Return data with cache headers
  res.json({ data: 'cached data' });
}
```

#### Service Worker Caching
```typescript
// Service worker for offline caching
const CACHE_NAME = 'homebase-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/images/logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

### Server-Side Caching

#### Redis Caching
```typescript
// Redis cache implementation
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export class CacheService {
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async invalidate(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache invalidate error:', error);
    }
  }
}
```

#### Memory Caching
```typescript
// In-memory cache for frequently accessed data
class MemoryCache {
  private cache = new Map<string, { value: any; expiry: number }>();

  set(key: string, value: any, ttl: number = 60000): void {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { value, expiry });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  clear(): void {
    this.cache.clear();
  }
}

export const memoryCache = new MemoryCache();
```

---

## 📊 Performance Monitoring

### Core Web Vitals Monitoring

#### Performance Metrics Collection
```typescript
// Performance monitoring service
export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];

  collectMetrics(): void {
    // Collect Core Web Vitals
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric(entry);
        }
      });

      observer.observe({ entryTypes: ['measure', 'navigation'] });
    }
  }

  private recordMetric(entry: PerformanceEntry): void {
    const metric: PerformanceMetrics = {
      name: entry.name,
      value: entry.startTime,
      timestamp: Date.now(),
      type: entry.entryType
    };

    this.metrics.push(metric);
    this.sendToAnalytics(metric);
  }

  private sendToAnalytics(metric: PerformanceMetrics): void {
    // Send to analytics service
    if (process.env.NODE_ENV === 'production') {
      analytics.track('performance_metric', metric);
    }
  }
}
```

#### Real User Monitoring (RUM)
```typescript
// Real user monitoring implementation
export class RealUserMonitoring {
  private observer: PerformanceObserver;

  constructor() {
    this.setupObservers();
  }

  private setupObservers(): void {
    // Observe navigation timing
    this.observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.handleNavigationTiming(entry as PerformanceNavigationTiming);
      }
    });

    this.observer.observe({ entryTypes: ['navigation'] });
  }

  private handleNavigationTiming(entry: PerformanceNavigationTiming): void {
    const metrics = {
      dns: entry.domainLookupEnd - entry.domainLookupStart,
      tcp: entry.connectEnd - entry.connectStart,
      ttfb: entry.responseStart - entry.requestStart,
      domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      loadComplete: entry.loadEventEnd - entry.loadEventStart
    };

    this.sendMetrics(metrics);
  }

  private sendMetrics(metrics: any): void {
    // Send to monitoring service
    fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metrics)
    });
  }
}
```

### Performance Dashboard

#### Metrics Visualization
```typescript
// Performance dashboard component
const PerformanceDashboard = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);

  useEffect(() => {
    // Fetch performance metrics
    fetchMetrics().then(setMetrics);
  }, []);

  return (
    <div className="performance-dashboard">
      <h2>Performance Metrics</h2>
      
      <div className="metrics-grid">
        <MetricCard
          title="First Contentful Paint"
          value={`${metrics.fcp?.toFixed(2)}s`}
          status={getMetricStatus(metrics.fcp, 1.5)}
        />
        
        <MetricCard
          title="Largest Contentful Paint"
          value={`${metrics.lcp?.toFixed(2)}s`}
          status={getMetricStatus(metrics.lcp, 2.5)}
        />
        
        <MetricCard
          title="First Input Delay"
          value={`${metrics.fid?.toFixed(0)}ms`}
          status={getMetricStatus(metrics.fid, 100)}
        />
      </div>
    </div>
  );
};
```

---

## 🎯 Performance Best Practices

### Code Optimization

#### 1. React Performance
```typescript
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* Expensive rendering logic */}</div>;
});

// Use useMemo for expensive calculations
const ExpensiveCalculation = ({ items }) => {
  const processedItems = useMemo(() => {
    return items.map(item => expensiveProcessing(item));
  }, [items]);

  return <div>{processedItems}</div>;
};

// Use useCallback for function references
const ParentComponent = ({ onAction }) => {
  const handleAction = useCallback((data) => {
    onAction(data);
  }, [onAction]);

  return <ChildComponent onAction={handleAction} />;
};
```

#### 2. Bundle Optimization
```typescript
// Avoid large dependencies
// ❌ Bad
import * as lodash from 'lodash';

// ✅ Good
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';

// Use dynamic imports for large components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false
});
```

#### 3. Image Optimization
```typescript
// Optimize image loading
const OptimizedProductImage = ({ product }) => {
  return (
    <Image
      src={product.image}
      alt={product.name}
      width={400}
      height={400}
      placeholder="blur"
      blurDataURL={product.blurDataURL}
      priority={product.featured}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
};
```

### Database Performance

#### 1. Query Optimization
```typescript
// Optimize Firestore queries
const getProducts = async (category: string, limit: number = 20) => {
  const productsRef = collection(db, 'products');
  
  // Use compound queries efficiently
  const q = query(
    productsRef,
    where('category', '==', category),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc'),
    limit(limit)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
```

#### 2. Caching Strategy
```typescript
// Implement query caching
const useCachedQuery = (key: string, queryFn: () => Promise<any>) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = sessionStorage.getItem(key);
    if (cached) {
      setData(JSON.parse(cached));
      setLoading(false);
      return;
    }

    queryFn().then(result => {
      setData(result);
      sessionStorage.setItem(key, JSON.stringify(result));
      setLoading(false);
    });
  }, [key, queryFn]);

  return { data, loading };
};
```

---

## 🔍 Troubleshooting

### Common Performance Issues

#### 1. Slow Page Loads
```bash
# Check bundle size
npm run analyze

# Check network requests
# Use browser DevTools Network tab

# Check Core Web Vitals
# Use Lighthouse or PageSpeed Insights
```

#### 2. Large Bundle Size
```bash
# Identify large dependencies
npm run bundle:analyze

# Check for duplicate packages
npm ls

# Optimize imports
# Use tree shaking and code splitting
```

#### 3. Image Performance Issues
```bash
# Check image formats
# Convert to WebP/AVIF

# Optimize image sizes
# Use responsive images

# Implement lazy loading
# Use Intersection Observer
```

### Performance Debugging

#### Debug Tools
```typescript
// Performance debugging utilities
export const performanceDebug = {
  // Measure function execution time
  measure: (name: string, fn: () => void) => {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`${name} took ${end - start}ms`);
  },

  // Monitor memory usage
  memory: () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      console.log('Memory usage:', {
        used: `${Math.round(memory.usedJSHeapSize / 1048576)}MB`,
        total: `${Math.round(memory.totalJSHeapSize / 1048576)}MB`,
        limit: `${Math.round(memory.jsHeapSizeLimit / 1048576)}MB`
      });
    }
  },

  // Check bundle size
  bundleSize: async () => {
    const response = await fetch('/_next/static/chunks/');
    const html = await response.text();
    // Parse and analyze bundle sizes
  }
};
```

---

## 📚 Additional Resources

### Documentation
- [Development Guide](./DEVELOPMENT.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Security Guide](./SECURITY.md)
- [API Documentation](./API.md)

### Performance Tools
- **Lighthouse:** [developers.google.com/web/tools/lighthouse](https://developers.google.com/web/tools/lighthouse)
- **PageSpeed Insights:** [pagespeed.web.dev](https://pagespeed.web.dev)
- **WebPageTest:** [webpagetest.org](https://webpagetest.org)
- **Bundle Analyzer:** [github.com/webpack-contrib/webpack-bundle-analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)

### Performance Resources
- **Core Web Vitals:** [web.dev/vitals](https://web.dev/vitals)
- **Performance Best Practices:** [web.dev/fast](https://web.dev/fast)
- **Optimization Techniques:** [web.dev/optimize](https://web.dev/optimize)

---

**Last Updated:** $(Get-Date -Format "yyyy-MM-dd")  
**Version:** 1.0.0  
**Maintainer:** Performance Team
