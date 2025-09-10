/* Safari-Compatible Service Worker Configuration */

export interface SafariSWConfig {
  cacheName: string;
  version: string;
  staticAssets: string[];
  dynamicRoutes: string[];
  excludeRoutes: string[];
  maxCacheSize: number;
  maxCacheAge: number;
}

export class SafariServiceWorkerManager {
  private static instance: SafariServiceWorkerManager;
  private registration: ServiceWorkerRegistration | null = null;
  private config: SafariSWConfig;

  constructor() {
    this.config = {
      cacheName: 'nubiago-safari-cache',
      version: 'v1.0.0',
      staticAssets: [
        '/',
        '/manifest.json',
        '/favicon.ico',
        '/safari-fixes.css'
      ],
      dynamicRoutes: [
        '/api/',
        '/products/',
        '/categories/'
      ],
      excludeRoutes: [
        '/api/auth/',
        '/api/admin/',
        '/api/webhook/'
      ],
      maxCacheSize: 50, // Limit cache size for Safari memory constraints
      maxCacheAge: 24 * 60 * 60 * 1000 // 24 hours
    };
  }

  static getInstance(): SafariServiceWorkerManager {
    if (!SafariServiceWorkerManager.instance) {
      SafariServiceWorkerManager.instance = new SafariServiceWorkerManager();
    }
    return SafariServiceWorkerManager.instance;
  }

  async register(): Promise<boolean> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return false;
    }

    // Check if Safari supports service workers properly
    if (!this.isSafariServiceWorkerSupported()) {
      console.warn('Safari Service Worker support limited, skipping registration');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw-safari.js', {
        scope: '/',
        updateViaCache: 'none' // Important for Safari
      });

      console.log('Safari Service Worker registered successfully');

      // Handle updates
      this.registration.addEventListener('updatefound', () => {
        this.handleServiceWorkerUpdate();
      });

      return true;
    } catch (error) {
      console.error('Safari Service Worker registration failed:', error);
      return false;
    }
  }

  private isSafariServiceWorkerSupported(): boolean {
    const userAgent = navigator.userAgent;
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
    
    if (!isSafari) return true; // Not Safari, assume full support

    // Extract Safari version
    const safariMatch = userAgent.match(/Version\/(\d+\.\d+)/);
    const safariVersion = safariMatch ? parseFloat(safariMatch[1]) : 0;

    // Safari 11.1+ has better service worker support
    return safariVersion >= 11.1;
  }

  private handleServiceWorkerUpdate() {
    if (!this.registration) return;

    const newWorker = this.registration.installing;
    if (!newWorker) return;

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        // New service worker is available
        this.showUpdateNotification();
      }
    });
  }

  private showUpdateNotification() {
    // Simple update notification for Safari
    if (confirm('A new version is available. Refresh to update?')) {
      window.location.reload();
    }
  }

  generateServiceWorkerCode(): string {
    return `
// Safari-Compatible Service Worker
const CACHE_NAME = '${this.config.cacheName}-${this.config.version}';
const STATIC_ASSETS = ${JSON.stringify(this.config.staticAssets)};
const DYNAMIC_ROUTES = ${JSON.stringify(this.config.dynamicRoutes)};
const EXCLUDE_ROUTES = ${JSON.stringify(this.config.excludeRoutes)};
const MAX_CACHE_SIZE = ${this.config.maxCacheSize};
const MAX_CACHE_AGE = ${this.config.maxCacheAge};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Safari SW: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Safari SW: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Safari SW: Installation complete');
        return self.skipWaiting(); // Important for Safari
      })
      .catch((error) => {
        console.error('Safari SW: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Safari SW: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName.startsWith('${this.config.cacheName}') && 
                     cacheName !== CACHE_NAME;
            })
            .map((cacheName) => {
              console.log('Safari SW: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('Safari SW: Activation complete');
        return self.clients.claim(); // Important for Safari
      })
  );
});

// Fetch event - serve from cache with Safari-specific handling
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip excluded routes
  if (EXCLUDE_ROUTES.some(route => url.pathname.startsWith(route))) {
    return;
  }
  
  // Handle static assets
  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          return response || fetch(request);
        })
    );
    return;
  }
  
  // Handle dynamic routes with network-first strategy (better for Safari)
  if (DYNAMIC_ROUTES.some(route => url.pathname.startsWith(route))) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone);
                // Limit cache size for Safari memory constraints
                limitCacheSize(cache, MAX_CACHE_SIZE);
              });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request);
        })
    );
    return;
  }
  
  // Default: network first, cache fallback
  event.respondWith(
    fetch(request)
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Safari-specific cache management
async function limitCacheSize(cache, maxSize) {
  try {
    const keys = await cache.keys();
    if (keys.length > maxSize) {
      // Remove oldest entries
      const keysToDelete = keys.slice(0, keys.length - maxSize);
      await Promise.all(keysToDelete.map(key => cache.delete(key)));
    }
  } catch (error) {
    console.error('Safari SW: Cache size limiting failed', error);
  }
}

// Clean up expired cache entries
async function cleanExpiredCache() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    const now = Date.now();
    
    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const dateHeader = response.headers.get('date');
        if (dateHeader) {
          const cacheDate = new Date(dateHeader).getTime();
          if (now - cacheDate > MAX_CACHE_AGE) {
            await cache.delete(request);
          }
        }
      }
    }
  } catch (error) {
    console.error('Safari SW: Cache cleanup failed', error);
  }
}

// Run cache cleanup periodically
setInterval(cleanExpiredCache, 60 * 60 * 1000); // Every hour

// Handle Safari-specific events
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('Safari Service Worker loaded successfully');
`;
  }

  async unregister(): Promise<boolean> {
    if (!this.registration) return false;

    try {
      const result = await this.registration.unregister();
      console.log('Safari Service Worker unregistered:', result);
      return result;
    } catch (error) {
      console.error('Safari Service Worker unregistration failed:', error);
      return false;
    }
  }

  async update(): Promise<void> {
    if (!this.registration) return;

    try {
      await this.registration.update();
      console.log('Safari Service Worker update check completed');
    } catch (error) {
      console.error('Safari Service Worker update failed:', error);
    }
  }

  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }
}

// Utility function to create Safari-compatible service worker file
export async function createSafariServiceWorker(): Promise<void> {
  if (typeof window === 'undefined') return;

  const manager = SafariServiceWorkerManager.getInstance();
  const swCode = manager.generateServiceWorkerCode();

  // Create service worker file dynamically
  const blob = new Blob([swCode], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);

  // Register the service worker
  try {
    await navigator.serviceWorker.register(url, {
      scope: '/',
      updateViaCache: 'none'
    });
    console.log('Dynamic Safari Service Worker registered');
  } catch (error) {
    console.error('Dynamic Safari Service Worker registration failed:', error);
  } finally {
    URL.revokeObjectURL(url);
  }
}

import { useState, useEffect } from 'react';

// React hook for service worker management
export const useSafariServiceWorker = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    const manager = SafariServiceWorkerManager.getInstance();
    
    const checkSupport = () => {
      const supported = 'serviceWorker' in navigator;
      setIsSupported(supported);
      
      if (supported) {
        manager.register().then((success) => {
          setIsRegistered(success);
          setRegistration(manager.getRegistration());
        });
      }
    };

    checkSupport();
  }, []);

  return {
    isSupported,
    isRegistered,
    registration,
    update: () => SafariServiceWorkerManager.getInstance().update(),
    unregister: () => SafariServiceWorkerManager.getInstance().unregister()
  };
};

// Auto-initialize for Safari
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    const userAgent = navigator.userAgent;
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
    
    if (isSafari && 'serviceWorker' in navigator) {
      SafariServiceWorkerManager.getInstance().register();
    }
  });
}
