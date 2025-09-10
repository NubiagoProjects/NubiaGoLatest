'use client'

import { openDB, DBSchema, IDBPDatabase } from 'idb'

// Define the database schema
interface OfflineDB extends DBSchema {
  products: {
    key: string
    value: {
      id: string
      name: string
      description: string
      price: number
      images: string[]
      category: string
      inStock: boolean
      rating: number
      reviews: number
      lastUpdated: number
      compressed?: boolean
    }
  }
  categories: {
    key: string
    value: {
      id: string
      name: string
      description: string
      image: string
      productCount: number
      lastUpdated: number
    }
  }
  userActions: {
    key: string
    value: {
      id: string
      type: 'add_to_cart' | 'add_to_wishlist' | 'remove_from_cart' | 'remove_from_wishlist' | 'view_product'
      productId: string
      data: any
      timestamp: number
      synced: boolean
    }
  }
  searchCache: {
    key: string
    value: {
      query: string
      results: string[] // product IDs
      timestamp: number
      filters?: any
    }
  }
  imageCache: {
    key: string
    value: {
      url: string
      blob: Blob
      compressed: boolean
      timestamp: number
      size: number
    }
  }
}

class OfflineStorageManager {
  private db: IDBPDatabase<OfflineDB> | null = null
  private readonly DB_NAME = 'NubiaGoOfflineDB'
  private readonly DB_VERSION = 1

  async init(): Promise<void> {
    if (this.db) return

    this.db = await openDB<OfflineDB>(this.DB_NAME, this.DB_VERSION, {
      upgrade(db: any) {
        // Products store
        if (!db.objectStoreNames.contains('products')) {
          const productStore = db.createObjectStore('products', { keyPath: 'id' })
          productStore.createIndex('category', 'category')
          productStore.createIndex('lastUpdated', 'lastUpdated')
        }

        // Categories store
        if (!db.objectStoreNames.contains('categories')) {
          const categoryStore = db.createObjectStore('categories', { keyPath: 'id' })
          categoryStore.createIndex('lastUpdated', 'lastUpdated')
        }

        // User actions store (for offline sync)
        if (!db.objectStoreNames.contains('userActions')) {
          const actionStore = db.createObjectStore('userActions', { keyPath: 'id' })
          actionStore.createIndex('type', 'type')
          actionStore.createIndex('synced', 'synced')
          actionStore.createIndex('timestamp', 'timestamp')
        }

        // Search cache store
        if (!db.objectStoreNames.contains('searchCache')) {
          const searchStore = db.createObjectStore('searchCache', { keyPath: 'query' })
          searchStore.createIndex('timestamp', 'timestamp')
        }

        // Image cache store
        if (!db.objectStoreNames.contains('imageCache')) {
          const imageStore = db.createObjectStore('imageCache', { keyPath: 'url' })
          imageStore.createIndex('timestamp', 'timestamp')
          imageStore.createIndex('compressed', 'compressed')
        }
      },
    })
  }

  // Product management
  async cacheProducts(products: any[], compressed = false): Promise<void> {
    await this.init()
    const tx = this.db!.transaction('products', 'readwrite')
    
    for (const product of products) {
      await tx.store.put({
        ...product,
        lastUpdated: Date.now(),
        compressed,
      })
    }
    
    await tx.done
  }

  async getProduct(id: string): Promise<any | null> {
    await this.init()
    return await this.db!.get('products', id)
  }

  async getProductsByCategory(category: string): Promise<any[]> {
    await this.init()
    return await (this.db as any).getAllFromIndex('products', 'category', category)
  }

  async getAllProducts(limit?: number): Promise<any[]> {
    await this.init()
    const products = await this.db!.getAll('products')
    return limit ? products.slice(0, limit) : products
  }

  async searchProducts(query: string): Promise<any[]> {
    await this.init()
    
    // Check search cache first
    const cached = await this.db!.get('searchCache', query.toLowerCase())
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) { // 5 minutes cache
      const products = await Promise.all(
        cached.results.map(id => this.getProduct(id))
      )
      return products.filter(Boolean)
    }

    // Perform search
    const allProducts = await this.getAllProducts()
    const results = allProducts.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase())
    )

    // Cache results
    await this.db!.put('searchCache', {
      query: query.toLowerCase(),
      results: results.map(p => p.id),
      timestamp: Date.now(),
    })

    return results
  }

  // Category management
  async cacheCategories(categories: any[]): Promise<void> {
    await this.init()
    const tx = this.db!.transaction('categories', 'readwrite')
    
    for (const category of categories) {
      await tx.store.put({
        ...category,
        lastUpdated: Date.now(),
      })
    }
    
    await tx.done
  }

  async getAllCategories(): Promise<any[]> {
    await this.init()
    return await this.db!.getAll('categories')
  }

  // User actions for offline sync
  async addUserAction(action: Omit<OfflineDB['userActions']['value'], 'id' | 'timestamp' | 'synced'>): Promise<void> {
    await this.init()
    await this.db!.add('userActions', {
      ...action,
      id: `${action.type}_${action.productId}_${Date.now()}`,
      timestamp: Date.now(),
      synced: false,
    })
  }

  async getUnsyncedActions(): Promise<OfflineDB['userActions']['value'][]> {
    await this.init()
    return await (this.db as any).getAllFromIndex('userActions', 'synced', false)
  }

  async markActionSynced(id: string): Promise<void> {
    await this.init()
    const action = await this.db!.get('userActions', id)
    if (action) {
      action.synced = true
      await this.db!.put('userActions', action)
    }
  }

  // Image caching with compression support
  async cacheImage(url: string, blob: Blob, compressed = false): Promise<void> {
    await this.init()
    await this.db!.put('imageCache', {
      url,
      blob,
      compressed,
      timestamp: Date.now(),
      size: blob.size,
    })
  }

  async getCachedImage(url: string): Promise<Blob | null> {
    await this.init()
    const cached = await this.db!.get('imageCache', url)
    return cached?.blob || null
  }

  async getCachedImageUrl(url: string): Promise<string | null> {
    const blob = await this.getCachedImage(url)
    return blob ? URL.createObjectURL(blob) : null
  }

  // Storage management
  async getStorageUsage(): Promise<{ used: number; quota: number; available: number }> {
    if (typeof navigator !== 'undefined' && 'storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate()
        return {
          used: estimate.usage || 0,
          quota: estimate.quota || 0,
          available: (estimate.quota || 0) - (estimate.usage || 0),
        }
      } catch (error) {
        console.warn('Failed to get storage estimate:', error)
      }
    }
    return { used: 0, quota: 0, available: 0 }
  }

  async clearExpiredCache(maxAge = 7 * 24 * 60 * 60 * 1000): Promise<void> { // 7 days
    await this.init()
    const cutoff = Date.now() - maxAge

    // Clear expired products
    const tx1 = (this.db as any).transaction('products', 'readwrite')
    const products = await tx1.store.index('lastUpdated').getAll(IDBKeyRange.upperBound(cutoff))
    for (const product of products) {
      await tx1.store.delete(product.id)
    }
    await tx1.done

    // Clear expired search cache
    const tx2 = (this.db as any).transaction('searchCache', 'readwrite')
    const searches = await tx2.store.index('timestamp').getAll(IDBKeyRange.upperBound(cutoff))
    for (const search of searches) {
      await tx2.store.delete(search.query)
    }
    await tx2.done

    // Clear expired images
    const tx3 = (this.db as any).transaction('imageCache', 'readwrite')
    const images = await tx3.store.index('timestamp').getAll(IDBKeyRange.upperBound(cutoff))
    for (const image of images) {
      await tx3.store.delete(image.url)
    }
    await tx3.done
  }

  async clearAllCache(): Promise<void> {
    await this.init()
    const tx = this.db!.transaction(['products', 'categories', 'searchCache', 'imageCache'], 'readwrite')
    await Promise.all([
      tx.objectStore('products').clear(),
      tx.objectStore('categories').clear(),
      tx.objectStore('searchCache').clear(),
      tx.objectStore('imageCache').clear(),
    ])
    await tx.done
  }

  // Data export/import for backup
  async exportData(): Promise<any> {
    await this.init()
    return {
      products: await this.getAllProducts(),
      categories: await this.getAllCategories(),
      timestamp: Date.now(),
    }
  }

  async importData(data: any): Promise<void> {
    await this.init()
    if (data.products) {
      await this.cacheProducts(data.products)
    }
    if (data.categories) {
      await this.cacheCategories(data.categories)
    }
  }
}

// Singleton instance
export const offlineStorage = new OfflineStorageManager()

// Utility functions for offline-first data fetching
export async function getProductOfflineFirst(id: string): Promise<any | null> {
  // Try offline first
  const cached = await offlineStorage.getProduct(id)
  if (cached) return cached

  // Fallback to network if available
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      const response = await fetch(`/api/products/${id}`)
      if (response.ok) {
        const product = await response.json()
        await offlineStorage.cacheProducts([product])
        return product
      }
    } catch (error) {
      console.warn('Network request failed, using offline data only')
    }
  }

  return cached
}

export async function searchProductsOfflineFirst(query: string): Promise<any[]> {
  // Try offline first
  const cached = await offlineStorage.searchProducts(query)
  if (cached.length > 0) return cached

  // Fallback to network if available
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const results = await response.json()
        await offlineStorage.cacheProducts(results.products || [])
        return results.products || []
      }
    } catch (error) {
      console.warn('Network search failed, using offline data only')
    }
  }

  return cached
}
