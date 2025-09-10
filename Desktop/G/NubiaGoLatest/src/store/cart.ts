import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ============================================================================
// CART TYPES
// ============================================================================

// Simplified Product interface that matches our needs
export interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  category?: string
  rating?: number
  reviewCount?: number
  inStock?: boolean
}

// Helper type to ensure category is always defined when used in the cart
interface CartProduct extends Omit<Product, 'category'> {
  category: string
}

export interface CartItem {
  productId: string
  quantity: number
  price: number
  product: CartProduct
}

export interface CartStoreState {
  items: CartItem[]
  total: number
  itemCount: number
  loading: boolean
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  setLoading: (loading: boolean) => void
  getTotal: () => number
}

export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      itemCount: 0,
      loading: false,
      
      addItem: (product: Product, quantity = 1) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(item => item.productId === product.id)
          
          if (existingItemIndex >= 0) {
            // Update existing item
            const updatedItems = [...state.items]
            const existingItem = updatedItems[existingItemIndex]
            const newQuantity = existingItem.quantity + quantity
            updatedItems[existingItemIndex] = {
              ...existingItem,
              quantity: newQuantity
            }
            
            const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
            const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0)
            
            return {
              ...state,
              items: updatedItems,
              total: newTotal,
              itemCount: newItemCount
            }
          } else {
            // Add new item
            const newItem: CartItem = {
              productId: product.id,
              quantity,
              price: product.price,
              product: {
                ...product,
                category: product.category || 'Uncategorized',
                inStock: product.inStock ?? true,
                rating: product.rating ?? 0,
                reviewCount: product.reviewCount ?? 0
              } as CartProduct
            }
            
            const newItems = [...state.items, newItem]
            const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
            const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
            
            return {
              ...state,
              items: newItems,
              total: newTotal,
              itemCount: newItemCount
            }
          }
        })
      },
      
      removeItem: (productId: string) => {
        set((state) => {
          const newItems = state.items.filter(item => item.productId !== productId)
          const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
          const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
          
          return {
            ...state,
            items: newItems,
            total: newTotal,
            itemCount: newItemCount
          }
        })
      },
      
      updateQuantity: (productId: string, quantity: number) => {
        set((state) => {
          if (quantity <= 0) {
            const newItems = state.items.filter(item => item.productId !== productId)
            const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
            const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
            
            return {
              ...state,
              items: newItems,
              total: newTotal,
              itemCount: newItemCount
            }
          }
          
          const updatedItems = state.items.map(item => 
            item.productId === productId ? { ...item, quantity } : item
          )
          
          const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
          const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0)
          
          return {
            ...state,
            items: updatedItems,
            total: newTotal,
            itemCount: newItemCount
          }
        })
      },
      
      clearCart: () => set({ items: [], total: 0, itemCount: 0 }),
      setLoading: (loading) => set({ loading }),
      getTotal: () => get().total,
    }),
    {
      name: 'nubiago-cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        total: state.total,
        itemCount: state.itemCount,
      }),
    }
  )
)
