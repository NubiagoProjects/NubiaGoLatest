import { productService } from './product.service'
import { Product } from '@/types/product'

export class SearchService {
  // Simple search implementation (can be replaced with Algolia)
  async searchProducts(query: string, filters?: {
    category?: string
    priceRange?: { min: number; max: number }
    rating?: number
    brand?: string[]
    availability?: 'in-stock' | 'out-of-stock'
    sortBy?: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'rating' | 'newest'
  }): Promise<{
    products: Product[]
    total: number
    facets: {
      categories: { [key: string]: number }
      brands: { [key: string]: number }
      priceRanges: { [key: string]: number }
    }
  }> {
    try {
      // Get all products for search
      const allProducts = await productService.getProducts(1, 1000)
      let products = allProducts.products

      // Apply search query
      if (query) {
        const lowercaseQuery = query.toLowerCase()
        products = products.filter((product: Product) => 
          product.name.toLowerCase().includes(lowercaseQuery) ||
          (product.description && product.description.toLowerCase().includes(lowercaseQuery)) ||
          product.category.toLowerCase().includes(lowercaseQuery) ||
          // Remove brand references as Product interface doesn't have brand property
          (product.tags && product.tags.some((tag: string) => tag.toLowerCase().includes(lowercaseQuery)))
        )
      }

      // Apply filters
      if (filters?.category) {
        products = products.filter((product: Product) => product.category === filters.category)
      }

      if (filters?.priceRange) {
        products = products.filter((product: Product) => 
          product.price >= filters.priceRange!.min && product.price <= filters.priceRange!.max
        )
      }

      if (filters?.rating) {
        products = products.filter((product: Product) => (product.rating || 0) >= filters.rating!)
      }

      // Remove brand filter as Product interface doesn't have brand property

      if (filters?.availability) {
        if (filters.availability === 'in-stock') {
          products = products.filter((product: Product) => product.inStock === true)
        } else if (filters.availability === 'out-of-stock') {
          products = products.filter((product: Product) => product.inStock === false)
        }
      }

      // Apply sorting
      if (filters?.sortBy) {
        switch (filters.sortBy) {
          case 'price-asc':
            products.sort((a: Product, b: Product) => a.price - b.price)
            break
          case 'price-desc':
            products.sort((a: Product, b: Product) => b.price - a.price)
            break
          case 'name-asc':
            products.sort((a: Product, b: Product) => a.name.localeCompare(b.name))
            break
          case 'name-desc':
            products.sort((a: Product, b: Product) => b.name.localeCompare(a.name))
            break
          case 'rating':
            products.sort((a: Product, b: Product) => (b.rating || 0) - (a.rating || 0))
            break
          case 'newest':
            products.sort((a: Product, b: Product) => {
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
              return dateB - dateA
            })
            break
        }
      }

      // Calculate facets
      const facets = this.calculateFacets(allProducts.products)

      return {
        products,
        total: products.length,
        facets
      }
    } catch (error) {
      console.error('Error searching products:', error)
      throw new Error('Failed to search products')
    }
  }

  // Calculate search facets
  private calculateFacets(products: Product[]): {
    categories: { [key: string]: number }
    brands: { [key: string]: number }
    priceRanges: { [key: string]: number }
  } {
    const categories: { [key: string]: number } = {}
    const brands: { [key: string]: number } = {}
    const priceRanges: { [key: string]: number } = {
      '0-50': 0,
      '50-100': 0,
      '100-200': 0,
      '200-500': 0,
      '500+': 0
    }

    products.forEach(product => {
      // Categories
      categories[product.category] = (categories[product.category] || 0) + 1

      // Remove brand facet calculation as Product interface doesn't have brand property

      // Price ranges
      if (product.price <= 50) {
        priceRanges['0-50']++
      } else if (product.price <= 100) {
        priceRanges['50-100']++
      } else if (product.price <= 200) {
        priceRanges['100-200']++
      } else if (product.price <= 500) {
        priceRanges['200-500']++
      } else {
        priceRanges['500+']++
      }
    })

    return { categories, brands, priceRanges }
  }

  // Get search suggestions
  async getSearchSuggestions(query: string, limit: number = 5): Promise<string[]> {
    try {
      const allProducts = await productService.getProducts(1, 1000)
      const suggestions = new Set<string>()

      const lowercaseQuery = query.toLowerCase()

      allProducts.products.forEach((product: Product) => {
        // Product names
        if (product.name.toLowerCase().includes(lowercaseQuery)) {
          suggestions.add(product.name)
        }

        // Categories
        if (product.category.toLowerCase().includes(lowercaseQuery)) {
          suggestions.add(product.category)
        }

        // Remove brand suggestions as Product interface doesn't have brand property

        // Tags
        if (product.tags) {
          product.tags.forEach((tag: string) => {
            if (tag.toLowerCase().includes(lowercaseQuery)) {
              suggestions.add(tag)
            }
          })
        }
      })

      return Array.from(suggestions).slice(0, limit)
    } catch (error) {
      console.error('Error getting search suggestions:', error)
      return []
    }
  }

  // Get trending searches
  async getTrendingSearches(): Promise<string[]> {
    try {
      // Get trending searches based on recent search analytics
      const analytics = await this.getSearchAnalytics()
      const recentSearches = analytics.filter((event: any) => {
        const eventDate = new Date(event.timestamp)
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        return eventDate > weekAgo && event.hasResults
      })

      const queryCount: { [key: string]: number } = {}
      recentSearches.forEach((event: any) => {
        if (event.query) {
          queryCount[event.query] = (queryCount[event.query] || 0) + 1
        }
      })

      const trendingQueries = Object.entries(queryCount)
        .map(([query, count]) => ({ query, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map(item => item.query)

      // Fallback to popular categories if no trending searches
      if (trendingQueries.length === 0) {
        const categories = await productService.getCategories()
        return categories.slice(0, 5).map(cat => cat.name)
      }

      return trendingQueries
    } catch (error) {
      console.error('Error getting trending searches:', error)
      return []
    }
  }

  // Get search analytics
  async trackSearch(query: string, results: number, filters?: any): Promise<void> {
    try {
      const searchEvent = {
        id: `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        query: query.toLowerCase().trim(),
        results,
        filters: filters || {},
        timestamp: new Date(),
        sessionId: this.getSessionId(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
        hasResults: results > 0,
        queryLength: query.length,
        filterCount: filters ? Object.keys(filters).length : 0
      }

      // Store in localStorage for demo purposes
      // In production, this would be sent to analytics service
      if (typeof window !== 'undefined') {
        const existingAnalytics = JSON.parse(localStorage.getItem('search_analytics') || '[]')
        existingAnalytics.push(searchEvent)
        
        // Keep only last 1000 search events to prevent storage bloat
        if (existingAnalytics.length > 1000) {
          existingAnalytics.splice(0, existingAnalytics.length - 1000)
        }
        
        localStorage.setItem('search_analytics', JSON.stringify(existingAnalytics))
      }

      // Log for debugging
      console.log('Search analytics tracked:', {
        query: searchEvent.query,
        results: searchEvent.results,
        hasResults: searchEvent.hasResults,
        timestamp: searchEvent.timestamp
      })
    } catch (error) {
      console.error('Error tracking search analytics:', error)
    }
  }

  // Get session ID for analytics
  private getSessionId(): string {
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('search_session_id')
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        sessionStorage.setItem('search_session_id', sessionId)
      }
      return sessionId
    }
    return 'server_session'
  }

  // Get search analytics data
  async getSearchAnalytics(): Promise<any[]> {
    try {
      if (typeof window !== 'undefined') {
        return JSON.parse(localStorage.getItem('search_analytics') || '[]')
      }
      return []
    } catch (error) {
      console.error('Error getting search analytics:', error)
      return []
    }
  }

  // Get popular search terms
  async getPopularSearchTerms(limit: number = 10): Promise<{ query: string; count: number }[]> {
    try {
      const analytics = await this.getSearchAnalytics()
      const queryCount: { [key: string]: number } = {}
      
      analytics.forEach((event: any) => {
        if (event.query && event.hasResults) {
          queryCount[event.query] = (queryCount[event.query] || 0) + 1
        }
      })
      
      return Object.entries(queryCount)
        .map(([query, count]) => ({ query, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)
    } catch (error) {
      console.error('Error getting popular search terms:', error)
      return []
    }
  }

  // Get personalized recommendations
  async getPersonalizedRecommendations(userId: string, limit: number = 10): Promise<Product[]> {
    try {
      // Get user's search history for personalization
      const analytics = await this.getSearchAnalytics()
      const userSearches = analytics.filter((event: any) => 
        event.sessionId && event.hasResults
      )

      // Extract categories and terms from user searches
      const userInterests: { [key: string]: number } = {}
      userSearches.forEach((event: any) => {
        const query = event.query.toLowerCase()
        // Simple keyword extraction for categories
        const categories = ['electronics', 'fashion', 'home', 'beauty', 'sports', 'books']
        categories.forEach(category => {
          if (query.includes(category)) {
            userInterests[category] = (userInterests[category] || 0) + 1
          }
        })
      })

      // Get products based on user interests
      if (Object.keys(userInterests).length > 0) {
        const topCategory = Object.entries(userInterests)
          .sort(([,a], [,b]) => b - a)[0][0]
        
        try {
          const categoryResult = await productService.getProductsByCategory(topCategory, limit)
          if (categoryResult.products && categoryResult.products.length > 0) {
            return categoryResult.products
          }
        } catch (error) {
          console.log('Category-based recommendations failed, falling back to featured products')
        }
      }

      // Fallback to featured products
      return await productService.getFeaturedProducts(limit)
    } catch (error) {
      console.error('Error getting personalized recommendations:', error)
      return []
    }
  }

  // Search with autocomplete
  async autocompleteSearch(query: string, limit: number = 5): Promise<{
    products: Product[]
    categories: string[]
    brands: string[]
  }> {
    try {
      const allProducts = await productService.getProducts(1, 1000)
      const lowercaseQuery = query.toLowerCase()

      const products = allProducts.products
        .filter((product: Product) => 
          product.name.toLowerCase().includes(lowercaseQuery) ||
          product.category.toLowerCase().includes(lowercaseQuery) ||
          // Remove brand search as Product interface doesn't have brand property
          false
        )
        .slice(0, limit)

      const categories = [...new Set(
        allProducts.products
          .filter((product: Product) => product.category.toLowerCase().includes(lowercaseQuery))
          .map((product: Product) => product.category)
      )].slice(0, 3)

      const brands: string[] = [] // Remove brand autocomplete as Product interface doesn't have brand property

      return { products, categories: categories as string[], brands }
    } catch (error) {
      console.error('Error with autocomplete search:', error)
      return { products: [], categories: [], brands: [] }
    }
  }
}

export const searchService = new SearchService() 
