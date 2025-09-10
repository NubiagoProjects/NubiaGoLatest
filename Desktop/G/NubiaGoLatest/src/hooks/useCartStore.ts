'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  variant?: {
    size?: string
    color?: string
  }
}

interface CartStore {
  items: CartItem[]
  total: number
  itemCount: number
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getItem: (id: string) => CartItem | undefined
}

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0)
}

const calculateItemCount = (items: CartItem[]): number => {
  return items.reduce((count, item) => count + item.quantity, 0)
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      itemCount: 0,

      addItem: (newItem) => {
        const { items } = get()
        const existingItemIndex = items.findIndex(item => 
          item.id === newItem.id && 
          JSON.stringify(item.variant) === JSON.stringify(newItem.variant)
        )

        let updatedItems: CartItem[]

        if (existingItemIndex >= 0) {
          // Update existing item quantity
          updatedItems = items.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: item.quantity + (newItem.quantity || 1) }
              : item
          )
        } else {
          // Add new item
          updatedItems = [...items, { ...newItem, quantity: newItem.quantity || 1 }]
        }

        set({
          items: updatedItems,
          total: calculateTotal(updatedItems),
          itemCount: calculateItemCount(updatedItems),
        })
      },

      removeItem: (id) => {
        const { items } = get()
        const updatedItems = items.filter(item => item.id !== id)
        
        set({
          items: updatedItems,
          total: calculateTotal(updatedItems),
          itemCount: calculateItemCount(updatedItems),
        })
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }

        const { items } = get()
        const updatedItems = items.map(item =>
          item.id === id ? { ...item, quantity } : item
        )

        set({
          items: updatedItems,
          total: calculateTotal(updatedItems),
          itemCount: calculateItemCount(updatedItems),
        })
      },

      clearCart: () => {
        set({
          items: [],
          total: 0,
          itemCount: 0,
        })
      },

      getItem: (id) => {
        const { items } = get()
        return items.find(item => item.id === id)
      },
    }),
    {
      name: 'cart-storage',
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
        total: state.total,
        itemCount: state.itemCount,
      }),
    }
  )
)
