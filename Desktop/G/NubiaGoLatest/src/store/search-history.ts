import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { logger } from '@/lib/utils/logger'

export interface SearchHistoryItem {
  id: string
  query: string
  timestamp: number
  category?: string
  subcategory?: string
  filters?: Record<string, any>
}

interface SearchHistoryState {
  history: SearchHistoryItem[]
  recentSearches: string[]
  popularSearches: string[]
  addToHistory: (item: Omit<SearchHistoryItem, 'id' | 'timestamp'>) => void
  removeFromHistory: (id: string) => void
  clearHistory: () => void
  getRecentSearches: (limit?: number) => string[]
  getPopularSearches: (limit?: number) => string[]
}

// Safe localStorage access
const getSafeStorage = () => {
  if (typeof window === 'undefined') return undefined
  
  try {
    // Test localStorage access
    const testKey = '__zustand_test__'
    window.localStorage.setItem(testKey, 'test')
    window.localStorage.removeItem(testKey)
    return window.localStorage
  } catch (error) {
    logger.warn('localStorage access blocked, using memory storage:', error)
    return undefined
  }
}

export const useSearchHistoryStore = create<SearchHistoryState>()(
  persist(
    (set, get) => ({
      history: [],
      recentSearches: [],
      popularSearches: [],

      addToHistory: (item) => set((state) => {
        const newItem: SearchHistoryItem = {
          ...item,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now()
        }

        // Add to history
        const newHistory = [newItem, ...state.history].slice(0, 100) // Keep last 100 searches

        // Update recent searches
        const recentSearches = Array.from(new Set([
          item.query,
          ...state.recentSearches
        ])).slice(0, 10) // Keep last 10 unique searches

        // Update popular searches
        const searchCounts = newHistory.reduce((acc, curr) => {
          acc[curr.query] = (acc[curr.query] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        const popularSearches = Object.entries(searchCounts)
          .sort(([, a], [, b]) => b - a)
          .map(([query]) => query)
          .slice(0, 10) // Keep top 10 searches

        return {
          history: newHistory,
          recentSearches,
          popularSearches
        }
      }),

      removeFromHistory: (id) => set((state) => ({
        history: state.history.filter((item) => item.id !== id)
      })),

      clearHistory: () => set({
        history: [],
        recentSearches: [],
        popularSearches: []
      }),

      getRecentSearches: (limit = 5) => {
        const { recentSearches } = get()
        return recentSearches.slice(0, limit)
      },

      getPopularSearches: (limit = 5) => {
        const { popularSearches } = get()
        return popularSearches.slice(0, limit)
      }
    }),
    {
      name: 'search-history-storage',
      storage: getSafeStorage() ? createJSONStorage(() => getSafeStorage()!) : undefined,
      partialize: (state) => ({
        history: state.history,
        recentSearches: state.recentSearches,
        popularSearches: state.popularSearches,
      }) as unknown as SearchHistoryState,
      onRehydrateStorage: () => (state) => {
        logger.log('Search history store rehydrated:', state)
      },
    }
  )
)
