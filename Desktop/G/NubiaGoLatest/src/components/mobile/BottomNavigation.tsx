'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, Grid3X3, Search, ShoppingCart, User, Heart } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState, useCallback } from 'react'
import { navigateUniversally, getEventHandlingStrategy } from '@/lib/mobile-detection'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/store/cart'
import { wishlistService } from '@/lib/services/wishlist.service'

export default function BottomNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const { itemCount: cartItemCount } = useCartStore()
  const [wishlistItemCount, setWishlistItemCount] = useState(0)
  const [isClient, setIsClient] = useState(false)
  const [activeTab, setActiveTab] = useState('')

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

  const navigationItems = [
    {
      id: 'home',
      name: 'Home',
      href: '/',
      icon: Home,
      active: pathname === '/',
      prefetch: true
    },
    {
      id: 'categories',
      name: 'Categories',
      href: '/products',
      icon: Grid3X3,
      active: pathname.startsWith('/products') || pathname.startsWith('/categories'),
      prefetch: true
    },
    {
      id: 'search',
      name: 'Search',
      href: '/search',
      icon: Search,
      active: pathname.startsWith('/search'),
      prefetch: true
    },
    {
      id: 'wishlist',
      name: 'Wishlist',
      href: '/wishlist',
      icon: Heart,
      active: pathname.startsWith('/wishlist'),
      badge: isClient && wishlistItemCount > 0 ? wishlistItemCount : undefined,
      prefetch: true
    },
    {
      id: 'cart',
      name: 'Cart',
      href: '/cart',
      icon: ShoppingCart,
      active: pathname.startsWith('/cart') || pathname.startsWith('/checkout'),
      badge: isClient && cartItemCount > 0 ? cartItemCount : undefined,
      prefetch: true
    },
    {
      id: 'account',
      name: 'Account',
      href: user ? '/customer/profile' : '/login',
      icon: User,
      active: pathname.startsWith('/customer') || pathname.startsWith('/login') || pathname.startsWith('/register'),
      prefetch: true
    }
  ]


  const handleNavigation = useCallback((e: React.MouseEvent | React.TouchEvent, href: string, id: string) => {
    // Don't prevent default - allow normal navigation
    e.stopPropagation()
    
    // Universal navigation handling
    setActiveTab(id)
    
    // Use universal navigation method that works across all devices
    navigateUniversally(router, href)
    
    // Restore body scroll
    document.body.style.overflow = 'auto'
  }, [router])

  // Update active tab based on current pathname
  useEffect(() => {
    const currentItem = navigationItems.find(item => 
      item.active || pathname === item.href || pathname.startsWith(item.href + '/')
    )
    if (currentItem) {
      setActiveTab(currentItem.id)
    }
  }, [pathname])

  if (!isClient) return null

  return (
    <nav className="mobile-bottom-navigation md:hidden fixed bottom-0 left-0 right-0 z-[1000] bg-white/95 backdrop-blur-sm border-t border-gray-200/80 safe-area-bottom">
      <div className="flex items-center justify-around px-1 py-1.5">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = item.active || activeTab === item.id
          
          return (
            <button
              key={item.id}
              className={cn(
                'flex flex-col items-center justify-center p-2 rounded-lg transition-colors w-full h-full touch-manipulation hardware-accelerated',
                activeTab === item.id || item.active
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:bg-gray-50'
              )}
              onClick={(e) => handleNavigation(e, item.href, item.id)}
              style={{ 
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                touchAction: 'manipulation'
              }}
            >
              <div className="relative">
                <Icon 
                  className={cn(
                    'h-6 w-6 transition-transform duration-200',
                    isActive ? 'text-primary-600 scale-110' : 'text-gray-600',
                    'pointer-events-none' // Ensures the icon doesn't interfere with touch events
                  )} 
                />
                
                {/* Badge for cart/wishlist */}
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] flex items-center justify-center px-0.5">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              
              <span className={cn(
                'text-[10px] mt-0.5 font-medium transition-colors duration-200',
                isActive ? 'text-primary-600 font-semibold' : 'text-gray-600',
                'whitespace-nowrap overflow-hidden text-ellipsis max-w-full',
                'pointer-events-none' // Ensures text doesn't interfere with touch events
              )}>
                {item.name}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
