import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product } from '@/types'

// ============================================================================
// WISHLIST TYPES
// ============================================================================

export interface WishlistItem {
  productId: string
  product: Product
  addedAt: Date
}

export interface Wishlist {
  items: WishlistItem[]
  updatedAt: Date
}

// ============================================================================
// WISHLIST STORE
// ============================================================================

interface WishlistState {
  items: WishlistItem[]
  loading: boolean
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  clearWishlist: () => void
  isInWishlist: (productId: string) => boolean
  getItemCount: () => number
  setLoading: (loading: boolean) => void
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      
      addItem: (product: Product) => {
        set((state) => {
          const existingItem = state.items.find(item => item.productId === product.id)
          
          if (!existingItem) {
            const newItem: WishlistItem = {
              productId: product.id,
              product,
              addedAt: new Date()
            }
            return {
              ...state,
              items: [...state.items, newItem]
            }
          }
          return state
        })
      },
      
      removeItem: (productId: string) => {
        set((state) => ({
          ...state,
          items: state.items.filter(item => item.productId !== productId)
        }))
      },
      
      clearWishlist: () => {
        set({ items: [] })
      },
      
      isInWishlist: (productId: string) => {
        return get().items.some(item => item.productId === productId)
      },
      
      getItemCount: () => {
        return get().items.length
      },
      
      setLoading: (loading: boolean) => {
        set({ loading })
      }
    }),
    {
      name: 'wishlist-storage',
      partialize: (state) => ({ items: state.items })
    }
  )
) 
