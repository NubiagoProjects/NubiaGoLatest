'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, ShoppingCart, Menu, User, Heart, Bell } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { CartService } from '@/lib/services/cart.service'
import { WishlistService } from '@/lib/services/wishlist.service'
import { navigateUniversally } from '@/lib/mobile-detection'
import { Logo } from '@/components/ui/Logo'
import MobileSearch from './MobileSearch'

interface MobileHeaderProps {
  onMenuToggle?: () => void
  onSearch?: (query: string) => void
}

export default function MobileHeader({ onMenuToggle, onSearch }: MobileHeaderProps) {
  const router = useRouter()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const { itemCount: cartItemCount } = useCartStore()
  const [wishlistItemCount, setWishlistItemCount] = useState(0)

  const { user } = useAuth()

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    const fetchWishlistCount = async () => {
      try {
        if (user?.uid) {
          const wishlist = await wishlistService.getWishlist(user.uid)
          setWishlistItemCount(wishlist.items.length)
        }
      } catch (error) {
        console.error('Error fetching wishlist count:', error)
      }
    }

    fetchWishlistCount()
  }, [user?.uid])

  const handleSearchToggle = (e: React.MouseEvent | React.TouchEvent) => {
    // Don't prevent default - allow normal navigation
    e.stopPropagation()
    setIsSearchOpen(prev => !prev)
  }

  const handleSearch = (query: string) => {
    onSearch?.(query)
  }

  if (isSearchOpen) {
    return (
      <MobileSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={handleSearch}
      />
    )
  }

  return (
    <header className="mobile-header sticky top-0 z-40 bg-white border-b border-gray-200 safe-area-top">
      <div className="px-4 py-3">
        {/* Top Row - Logo and Actions */}
        <div className="flex items-center justify-between mb-3">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 active:opacity-80 transition-opacity touch-manipulation hardware-accelerated"
            style={{ 
              WebkitTouchCallout: 'none',
              WebkitUserSelect: 'none',
              touchAction: 'manipulation'
            }}
          >
            <Logo size="sm" />
            <span className="text-xl font-bold text-gray-900">NubiaGo</span>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <button 
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation hardware-accelerated"
              style={{ 
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                touchAction: 'manipulation'
              }}
            >
              <Bell className="h-5 w-5 text-gray-600" />
              {/* Notification badge would go here */}
            </button>

            {/* User Menu */}
            <Link
              href={user ? '/customer/profile' : '/login'}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors active:bg-gray-200 touch-manipulation hardware-accelerated"
              style={{ 
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                touchAction: 'manipulation'
              }}
            >
              <User className="h-5 w-5 text-gray-600" />
            </Link>

            {/* Menu Toggle */}
            <button
              onClick={onMenuToggle}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation hardware-accelerated"
              aria-label="Open menu"
              style={{ 
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                touchAction: 'manipulation'
              }}
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <button
                type="button"
                onClick={handleSearchToggle}
                className="w-full pl-10 pr-4 py-3 text-left text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors cursor-text"
              >
                <span className="text-gray-500">Search products...</span>
              </button>
            </div>
          </form>
        </div>

        {/* Bottom Row - Quick Actions */}
        <div className="flex items-center justify-between mt-3">
          {/* Cart */}
          <button 
            onClick={(e) => {
              e.stopPropagation()
              navigateUniversally(router, '/cart')
            }}
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
            style={{ 
              WebkitTouchCallout: 'none',
              WebkitUserSelect: 'none',
              touchAction: 'manipulation'
            }}
          >
            <ShoppingCart className="h-5 w-5 text-gray-600" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemCount > 9 ? '9+' : cartItemCount}
              </span>
            )}
          </button>
          <span className="text-sm font-medium text-gray-700">Cart</span>

          {/* Wishlist */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              navigateUniversally(router, '/wishlist')
            }}
            className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
            style={{ 
              WebkitTouchCallout: 'none',
              WebkitUserSelect: 'none',
              touchAction: 'manipulation'
            }}
          >
            <div className="relative">
              <Heart className="h-5 w-5 text-gray-600" />
              {isClient && wishlistItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {wishlistItemCount > 99 ? '99+' : wishlistItemCount}
                </span>
              )}
            </div>
            <span className="text-sm font-medium text-gray-700">Wishlist</span>
          </button>

          {/* Quick Categories */}
          <div className="flex items-center space-x-4">
            <button
              onClick={(e) => {
                e.stopPropagation()
                navigateUniversally(router, '/products?category=electronics')
              }}
              className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors touch-manipulation"
              style={{ touchAction: 'manipulation' }}
            >
              Electronics
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                navigateUniversally(router, '/products?category=fashion')
              }}
              className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors touch-manipulation"
              style={{ touchAction: 'manipulation' }}
            >
              Fashion
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
