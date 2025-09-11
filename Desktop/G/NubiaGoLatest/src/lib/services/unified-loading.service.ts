/**
 * Unified Loading Management Service
 * Centralized loading state management with performance optimization
 */

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { errorLogger } from './error-logging.service'

export interface LoadingState {
  id: string
  isLoading: boolean
  progress?: number
  message?: string
  priority: 'critical' | 'high' | 'normal' | 'low'
  startTime: number
  timeout?: number
  retryCount: number
  maxRetries: number
  error?: Error
  metadata?: Record<string, any>
}

export interface LoadingStore {
  // State
  loadingStates: Map<string, LoadingState>
  globalLoading: boolean
  criticalLoading: boolean
  
  // Actions
  startLoading: (id: string, options?: Partial<LoadingState>) => void
  updateProgress: (id: string, progress: number, message?: string) => void
  stopLoading: (id: string, error?: Error) => void
  retryLoading: (id: string) => void
  clearLoading: (id: string) => void
  clearAllLoading: () => void
  
  // Getters
  isLoading: (id: string) => boolean
  getLoadingState: (id: string) => LoadingState | undefined
  getCriticalLoadingStates: () => LoadingState[]
  getLoadingProgress: (id: string) => number
}

export const useLoadingStore = create<LoadingStore>()(
  subscribeWithSelector((set, get) => ({
    loadingStates: new Map(),
    globalLoading: false,
    criticalLoading: false,

    startLoading: (id: string, options = {}) => {
      const state: LoadingState = {
        id,
        isLoading: true,
        priority: 'normal',
        startTime: Date.now(),
        retryCount: 0,
        maxRetries: 3,
        timeout: 30000, // 30 seconds default
        ...options,
      }

      set((store) => {
        const newStates = new Map(store.loadingStates)
        newStates.set(id, state)
        
        const criticalLoading = Array.from(newStates.values()).some(
          s => s.isLoading && s.priority === 'critical'
        )
        
        const globalLoading = newStates.size > 0

        return {
          loadingStates: newStates,
          globalLoading,
          criticalLoading,
        }
      })

      // Set timeout if specified
      if (state.timeout) {
        setTimeout(() => {
          const currentState = get().getLoadingState(id)
          if (currentState?.isLoading) {
            const timeoutError = new Error(`Loading timeout for ${id}`)
            get().stopLoading(id, timeoutError)
          }
        }, state.timeout)
      }
    },

    updateProgress: (id: string, progress: number, message?: string) => {
      set((store) => {
        const newStates = new Map(store.loadingStates)
        const currentState = newStates.get(id)
        
        if (currentState) {
          newStates.set(id, {
            ...currentState,
            progress: Math.max(0, Math.min(100, progress)),
            message,
          })
        }

        return { loadingStates: newStates }
      })
    },

    stopLoading: (id: string, error?: Error) => {
      set((store) => {
        const newStates = new Map(store.loadingStates)
        const currentState = newStates.get(id)
        
        if (currentState) {
          const duration = Date.now() - currentState.startTime
          
          // Log performance metrics
          if (duration > 5000) { // Log slow operations
            console.warn(`[Loading] Slow operation: ${id} took ${duration}ms`)
          }
          
          // Log error if present
          if (error) {
            errorLogger.logError(error, {
              category: 'ui',
              context: {
                action: 'loading_failed',
                metadata: {
                  loadingId: id,
                  duration,
                  retryCount: currentState.retryCount,
                  priority: currentState.priority,
                }
              },
              tags: ['loading', 'performance']
            })
          }

          if (error && currentState.retryCount < currentState.maxRetries) {
            // Update for retry
            newStates.set(id, {
              ...currentState,
              retryCount: currentState.retryCount + 1,
              error,
            })
          } else {
            // Remove completed/failed loading
            newStates.delete(id)
          }
        }

        const criticalLoading = Array.from(newStates.values()).some(
          s => s.isLoading && s.priority === 'critical'
        )
        
        const globalLoading = newStates.size > 0

        return {
          loadingStates: newStates,
          globalLoading,
          criticalLoading,
        }
      })
    },

    retryLoading: (id: string) => {
      const state = get().getLoadingState(id)
      if (state && state.error) {
        get().startLoading(id, {
          ...state,
          retryCount: state.retryCount,
          error: undefined,
        })
      }
    },

    clearLoading: (id: string) => {
      set((store) => {
        const newStates = new Map(store.loadingStates)
        newStates.delete(id)
        
        const criticalLoading = Array.from(newStates.values()).some(
          s => s.isLoading && s.priority === 'critical'
        )
        
        const globalLoading = newStates.size > 0

        return {
          loadingStates: newStates,
          globalLoading,
          criticalLoading,
        }
      })
    },

    clearAllLoading: () => {
      set({
        loadingStates: new Map(),
        globalLoading: false,
        criticalLoading: false,
      })
    },

    isLoading: (id: string) => {
      return get().loadingStates.get(id)?.isLoading ?? false
    },

    getLoadingState: (id: string) => {
      return get().loadingStates.get(id)
    },

    getCriticalLoadingStates: () => {
      return Array.from(get().loadingStates.values()).filter(
        state => state.priority === 'critical' && state.isLoading
      )
    },

    getLoadingProgress: (id: string) => {
      return get().loadingStates.get(id)?.progress ?? 0
    },
  }))
)

// Hooks for easy component integration
export function useLoading(id: string) {
  const startLoading = useLoadingStore(state => state.startLoading)
  const stopLoading = useLoadingStore(state => state.stopLoading)
  const updateProgress = useLoadingStore(state => state.updateProgress)
  const isLoading = useLoadingStore(state => state.isLoading(id))
  const loadingState = useLoadingStore(state => state.getLoadingState(id))
  const retryLoading = useLoadingStore(state => state.retryLoading)

  return {
    isLoading,
    loadingState,
    startLoading: (options?: Partial<LoadingState>) => startLoading(id, options),
    stopLoading: (error?: Error) => stopLoading(id, error),
    updateProgress: (progress: number, message?: string) => updateProgress(id, progress, message),
    retry: () => retryLoading(id),
  }
}

export function useGlobalLoading() {
  return useLoadingStore(state => ({
    globalLoading: state.globalLoading,
    criticalLoading: state.criticalLoading,
    criticalStates: state.getCriticalLoadingStates(),
  }))
}

// Async operation wrapper with automatic loading management
export async function withLoading<T>(
  id: string,
  operation: (updateProgress?: (progress: number, message?: string) => void) => Promise<T>,
  options?: Partial<LoadingState>
): Promise<T> {
  const store = useLoadingStore.getState()
  
  store.startLoading(id, options)
  
  try {
    const result = await operation((progress, message) => {
      store.updateProgress(id, progress, message)
    })
    
    store.stopLoading(id)
    return result
  } catch (error) {
    store.stopLoading(id, error as Error)
    throw error
  }
}

// Performance monitoring integration
export class LoadingPerformanceMonitor {
  private static instance: LoadingPerformanceMonitor
  private metrics: Map<string, number[]> = new Map()

  static getInstance(): LoadingPerformanceMonitor {
    if (!LoadingPerformanceMonitor.instance) {
      LoadingPerformanceMonitor.instance = new LoadingPerformanceMonitor()
    }
    return LoadingPerformanceMonitor.instance
  }

  recordLoadingTime(id: string, duration: number) {
    if (!this.metrics.has(id)) {
      this.metrics.set(id, [])
    }
    this.metrics.get(id)!.push(duration)
  }

  getAverageLoadingTime(id: string): number {
    const times = this.metrics.get(id)
    if (!times || times.length === 0) return 0
    return times.reduce((sum, time) => sum + time, 0) / times.length
  }

  getSlowOperations(threshold: number = 3000): Array<{ id: string; averageTime: number }> {
    const slow: Array<{ id: string; averageTime: number }> = []
    
    for (const [id, times] of this.metrics) {
      const average = this.getAverageLoadingTime(id)
      if (average > threshold) {
        slow.push({ id, averageTime: average })
      }
    }
    
    return slow.sort((a, b) => b.averageTime - a.averageTime)
  }
}

export const loadingMonitor = LoadingPerformanceMonitor.getInstance()

// Subscribe to loading state changes for monitoring
useLoadingStore.subscribe(
  (state) => state.loadingStates,
  (loadingStates, prevLoadingStates) => {
    // Monitor completed operations
    for (const [id, prevState] of prevLoadingStates) {
      if (prevState.isLoading && !loadingStates.has(id)) {
        const duration = Date.now() - prevState.startTime
        loadingMonitor.recordLoadingTime(id, duration)
      }
    }
  }
)
