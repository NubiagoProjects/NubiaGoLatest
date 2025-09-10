'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { X, User, ShoppingCart, Heart, Settings, LogOut, Home, Grid3X3, Search, Bell, HelpCircle, Shield, FileText, Star, Gift, Truck, CreditCard, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/store/cart'
import { wishlistService } from '@/lib/services/wishlist.service'
import { navigateUniversally, getEventHandlingStrategy } from '@/lib/mobile-detection'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

interface MenuItem {
  id: string
  label: string
  href: string
  icon: React.ReactNode
  badge?: number
  isExternal?: boolean
  prefetch?: boolean
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const { itemCount: cartItemCount } = useCartStore()
  const [wishlistItemCount, setWishlistItemCount] = useState(0)
  const [isClient, setIsClient] = useState(false)
  const [activeItem, setActiveItem] = useState('')

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

  // Close menu on escape key or outside click
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault()
        onClose()
      }
    }

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement
      const menu = document.querySelector('.mobile-menu-container')
      if (menu && !menu.contains(target) && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleLogout = useCallback(async () => {
    try {
      await signOut()
      onClose()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }, [onClose, signOut])

  const handleNavigation = useCallback((e: React.MouseEvent | React.TouchEvent, href: string, id: string) => {
    // Don't prevent default - allow normal navigation
    e.stopPropagation()
    
    // Universal navigation handling
    setActiveItem(id)
    onClose()
    
    // Use universal navigation method that works across all devices
    navigateUniversally(router, href)
  }, [onClose, router])

  const mainMenuItems: MenuItem[] = [
    {
      id: 'profile',
      label: 'My Profile',
      href: user ? '/customer/profile' : '/login',
      icon: <User className="h-5 w-5 flex-shrink-0" />,
      prefetch: true
    },
    {
      id: 'orders',
      label: 'My Orders',
      href: user ? '/customer/orders' : '/login',
      icon: <ShoppingBag className="h-5 w-5 flex-shrink-0" />,
      prefetch: true
    },
    {
      id: 'wishlist',
      label: 'Wishlist',
      href: '/wishlist',
      icon: <Heart className="h-5 w-5 flex-shrink-0" />,
      badge: isClient && wishlistItemCount > 0 ? wishlistItemCount : undefined,
      prefetch: true
    },
    {
      id: 'cart',
      label: 'Shopping Cart',
      href: '/cart',
      icon: <ShoppingBag className="h-5 w-5 flex-shrink-0" />,
      badge: isClient && cartItemCount > 0 ? cartItemCount : undefined,
      prefetch: true
    }
  ]

  const categoryMenuItems: MenuItem[] = [
    {
      id: 'electronics',
      label: 'Electronics',
      href: '/products?category=electronics',
      icon: <Star className="h-5 w-5 flex-shrink-0" />,
      prefetch: true
    },
    {
      id: 'fashion',
      label: 'Fashion',
      href: '/products?category=fashion',
      icon: <Gift className="h-5 w-5 flex-shrink-0" />,
      prefetch: true
    },
    {
      id: 'home-living',
      label: 'Home & Living',
      href: '/products?category=home-living',
      icon: <Truck className="h-5 w-5 flex-shrink-0" />,
      prefetch: true
    },
    {
      id: 'beauty',
      label: 'Beauty & Cosmetics',
      href: '/products?category=beauty-cosmetics',
      icon: <Star className="h-5 w-5 flex-shrink-0" />,
      prefetch: true
    }
  ]

  const supportMenuItems: MenuItem[] = [
    {
      id: 'help',
      label: 'Help Center',
      href: '/help',
      icon: <HelpCircle className="h-5 w-5" />
    },
    {
      id: 'shipping',
      label: 'Shipping Info',
      href: '/shipping',
      icon: <Truck className="h-5 w-5" />
    },
    {
      id: 'returns',
      label: 'Returns & Refunds',
      href: '/returns',
      icon: <Shield className="h-5 w-5" />
    },
    {
      id: 'payment',
      label: 'Payment Methods',
      href: '/payment',
      icon: <CreditCard className="h-5 w-5" />
    }
  ]

  const renderMenuItem = (item: MenuItem) => (
    <button
      key={item.id}
      onClick={(e) => handleNavigation(e, item.href, item.id)}
      className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors touch-manipulation hardware-accelerated w-full text-left"
      style={{ 
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'manipulation'
      }}
    >
      <div className="flex items-center space-x-3">
        <div className="text-gray-600">{item.icon}</div>
        <span className="text-gray-900 font-medium">{item.label}</span>
      </div>
      {item.badge && item.badge > 0 && (
        <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {item.badge > 99 ? '99+' : item.badge}
        </span>
      )}
    </button>
  )

  if (!isOpen) return null

  return (
    <div
      className={cn(
        'mobile-menu-container fixed inset-0 z-50 transition-opacity duration-300 ease-in-out',
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        'bg-black/50 backdrop-blur-sm',
        'flex flex-col',
        'touch-none' // Prevent default touch behavior
      )}
    >
      {/* Menu Panel */}
      <div className="fixed inset-y-0 left-0 w-80 bg-white z-50 transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-primary-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">N</span>
            </div>
            <span className="text-xl font-bold text-gray-900">NubiaGo</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* User Section */}
        <div className="p-4 border-b border-gray-200">
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-primary-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {user.name || user.email}
                </p>
                <p className="text-sm text-gray-500">
                  {user.email}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-3">Sign in to access your account</p>
              <button
                onClick={(e) => handleNavigation(e, '/login', 'login')}
                className="inline-block bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Sign In
              </button>
            </div>
          )}
        </div>

        {/* Menu Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Main Menu */}
          <div className="py-2">
            <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Account
            </h3>
            {mainMenuItems.map(renderMenuItem)}
          </div>

          {/* Categories */}
          <div className="py-2 border-t border-gray-100">
            <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Shop by Category
            </h3>
            {categoryMenuItems.map(renderMenuItem)}
          </div>

          {/* Support */}
          <div className="py-2 border-t border-gray-100">
            <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Support
            </h3>
            {supportMenuItems.map(renderMenuItem)}
          </div>

          {/* Settings & Logout */}
          {user && (
            <div className="py-2 border-t border-gray-100">
              <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Account
              </h3>
              <button
                onClick={(e) => handleNavigation(e, '/customer/settings', 'settings')}
                className="flex items-center space-x-3 p-4 hover:bg-gray-50 transition-colors touch-manipulation hardware-accelerated w-full text-left"
                style={{ 
                  WebkitTouchCallout: 'none',
                  WebkitUserSelect: 'none',
                  touchAction: 'manipulation'
                }}
              >
                <Settings className="h-5 w-5 text-gray-600" />
                <span className="text-gray-900 font-medium">Settings</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 p-4 hover:bg-gray-50 transition-colors text-red-600 touch-manipulation hardware-accelerated"
                style={{ 
                  WebkitTouchCallout: 'none',
                  WebkitUserSelect: 'none',
                  touchAction: 'manipulation'
                }}
              >
                <LogOut className="h-5 w-5 text-gray-600" />
                <span className="text-gray-900 font-medium">Sign Out</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">
              © 2024 NubiaGo. All rights reserved.
            </p>
            <div className="flex justify-center space-x-4 text-xs text-gray-400">
              <button onClick={(e) => handleNavigation(e, '/privacy', 'privacy')} className="hover:text-gray-600">Privacy</button>
              <button onClick={(e) => handleNavigation(e, '/terms', 'terms')} className="hover:text-gray-600">Terms</button>
              <button onClick={(e) => handleNavigation(e, '/cookies', 'cookies')} className="hover:text-gray-600">Cookies</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
