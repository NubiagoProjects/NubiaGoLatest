'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface WishlistItem {
  id: string
  name: string
  price: number
  image: string
  category: string
  addedAt: string
}

interface WishlistStore {
  items: WishlistItem[]
  addItem: (item: Omit<WishlistItem, 'addedAt'>) => void
  removeItem: (id: string) => void
  isInWishlist: (id: string) => boolean
  clearWishlist: () => void
  toggleItem: (item: Omit<WishlistItem, 'addedAt'>) => void
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        const { items } = get()
        const exists = items.some(item => item.id === newItem.id)
        
        if (!exists) {
          set({
            items: [...items, { ...newItem, addedAt: new Date().toISOString() }],
          })
        }
      },

      removeItem: (id) => {
        const { items } = get()
        set({
          items: items.filter(item => item.id !== id),
        })
      },

      isInWishlist: (id) => {
        const { items } = get()
        return items.some(item => item.id === id)
      },

      clearWishlist: () => {
        set({ items: [] })
      },

      toggleItem: (item) => {
        const { isInWishlist, addItem, removeItem } = get()
        
        if (isInWishlist(item.id)) {
          removeItem(item.id)
        } else {
          addItem(item)
        }
      },
    }),
    {
      name: 'wishlist-storage',
      storage: createJSONStorage(() => {
        // Use localStorage in browser, fallback to memory storage
        if (typeof window !== 'undefined') {
          return localStorage
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      }),
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
)
