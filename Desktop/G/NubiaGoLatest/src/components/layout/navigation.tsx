'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createPortal } from 'react-dom'
import { CATEGORIES_DATA } from '@/lib/constants'
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  User, 
  Menu, 
  X, 
  ChevronDown,
  Bell,
  Settings,
  LogOut,
  Package,
  Store,
  HelpCircle,
  Phone,
  Mail,
  MapPin,
  Grid3X3,
  Shield,
  Truck,
  Clock,
  Smartphone,
  Laptop,
  Shirt,
  Home,
  Heart as HealthIcon,
  Dumbbell,
  BookOpen,
  Car,
  Baby,
  Palette,
  Utensils,
  Watch,
  Briefcase,
  Scissors,
  Camera,
  Gamepad2,
  Headphones,
  Monitor,
  Tablet,
  Zap,
  Flame,
  Star as StarIcon
} from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import { CartService } from '@/lib/services/cart.service'
import { WishlistService } from '@/lib/services/wishlist.service'
import { logger } from '@/lib/utils/logger'

interface NavigationProps {
  onMenuToggle?: () => void;
}

export default function Navigation({ onMenuToggle }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const [cartItemCount, setCartItemCount] = useState(0)
  const [wishlistItemCount, setWishlistItemCount] = useState(0)
  
  const router = useRouter()
  const pathname = usePathname()
  const { user, signOut } = useFirebaseAuth()
  
  const cartService = useMemo(() => new CartService(), [])
  const wishlistService = useMemo(() => new WishlistService(), [])

  // Map category data with icons
  const getCategoryIcon = useCallback((categoryName: string) => {
    const iconMap: { [key: string]: any } = {
      'Women': Shirt,
      'Men': Shirt,
      'Electronics': Smartphone,
      'Home & Living': Home,
      'Beauty & Cosmetics': HealthIcon,
      'Shoes & Bags': Briefcase,
      'Mother & Child': Baby
    }
    return iconMap[categoryName] || Shirt
  }, [])

  const categoryData = useMemo(() => CATEGORIES_DATA.map(category => ({
    name: category.name,
    icon: getCategoryIcon(category.name),
    href: `/products?category=${category.value}`,
    subcategories: category.subcategories.map(sub => ({
      name: sub.name,
      href: `/products?subcategory=${sub.value}`
    }))
  })), [getCategoryIcon])

  useEffect(() => {
    setIsClient(true)
  }, [])

  const toggleMenu = useCallback(() => {
    if (onMenuToggle) {
      onMenuToggle()
    } else {
      setIsMenuOpen(prev => !prev)
    }
  }, [onMenuToggle])

  // Fetch cart and wishlist counts
  const fetchCounts = useCallback(async () => {
    if (!user?.uid) {
      setCartItemCount(0)
      setWishlistItemCount(0)
      return
    }

    try {
      const [cart, wishlist] = await Promise.all([
        cartService.getCart(user.uid),
        wishlistService.getWishlist(user.uid)
      ])
      
      setCartItemCount(cart.itemCount)
      setWishlistItemCount(wishlist.items.length)
    } catch (error) {
      logger.error('Error fetching counts:', error)
    }
  }, [user?.uid, cartService, wishlistService])

  useEffect(() => {
    fetchCounts()
  }, [fetchCounts])

  useEffect(() => {
    if (!isClient) return

    const handleScroll = () => {
      try {
        setIsScrolled(window.scrollY > 10)
      } catch (error) {
        logger.error('Scroll handler error:', error)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isClient])

  // Click outside handler for categories dropdown
  useEffect(() => {
    if (!isClient) return

    const handleClickOutside = (event: MouseEvent) => {
      try {
        const target = event.target as Element
        const categoriesContainer = target.closest('.categories-dropdown-container')
        const categoriesDropdown = target.closest('.categories-dropdown')
        
        if (isCategoriesOpen && !categoriesContainer && !categoriesDropdown) {
          setIsCategoriesOpen(false)
        }
      } catch (error) {
        logger.error('Click outside handler error:', error)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isCategoriesOpen, isClient])

  const handleLogout = async () => {
    try {
      await signOut()
      setIsUserMenuOpen(false)
      router.push('/')
    } catch (error) {
              logger.error('Logout error:', error)
      setHasError(true)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (searchQuery.trim()) {
        router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      }
    } catch (error) {
              logger.error('Search error:', error)
    }
  }

  const handleCategoriesToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      logger.log('Categories toggle clicked, current state:', isCategoriesOpen)
      const newState = !isCategoriesOpen
      logger.log('Setting categories state to:', newState)
      
      if (newState) {
        // Calculate button position for dropdown
        const button = document.querySelector('.categories-dropdown-button') as HTMLElement
        if (button) {
          const rect = button.getBoundingClientRect()
          setDropdownPosition({
            top: rect.bottom + window.scrollY,
            left: rect.left,
            width: rect.width
          })
        }
      }
      
      setIsCategoriesOpen(newState)
    } catch (error) {
              logger.error('Categories toggle error:', error)
    }
  }

  const handleSubcategoryClick = (href: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
              logger.log('Subcategory clicked:', href)
      setIsCategoriesOpen(false)
      router.push(href)
    } catch (error) {
              logger.error('Subcategory click error:', error)
    }
  }

  // Only show error state if there's an actual error
  if (hasError) {
    return (
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                NubiaGo
              </Link>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  const userMenuItems = [
    { href: '/customer/profile', label: 'My Profile', icon: User },
    { href: '/customer', label: 'Dashboard', icon: Grid3X3 },
    { href: '/customer/orders', label: 'Orders', icon: Package },
  ]

  return (
    <>
      {/* Top Bar */}
      <div className="bg-gray-900 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+234 123 456 7890</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>support@nubiago.com</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Truck className="h-4 w-4" />
                <span>Free Shipping on Orders Over $50</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className={`bg-white border-b border-gray-200 transition-all duration-300 ${isScrolled ? 'shadow-lg' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Logo size="md" />
              <span className="text-xl font-bold text-gray-900">NubiaGo</span>
            </Link>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <form onSubmit={handleSearch} className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </form>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Browse Products Button */}
              <Link href="/products" className="hidden md:flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
                Browse Products
              </Link>
              
              {/* Wishlist */}
              <Link href="/wishlist" className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors">
                <Heart className="h-5 w-5" />
                {isClient && wishlistItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlistItemCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link href="/cart" className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors dark:text-gray-300 dark:hover:text-primary-400">
                <ShoppingCart className="h-5 w-5" />
                {isClient && cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* User Menu */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    <User className="h-5 w-5" />
                    <span className="text-sm font-medium">{user?.displayName || 'User'}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isUserMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                        {userMenuItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </Link>
                        ))}
                        <div className="border-t border-gray-200 my-1" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-gray-700 hover:text-primary-600 transition-colors"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {/* Mobile Contact Info */}
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <div className="flex items-center space-x-3 px-4 py-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">+234 123 456 7890</span>
                  </div>
                  <div className="flex items-center space-x-3 px-4 py-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">support@nubiago.com</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Categories Bar */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-8 py-3 overflow-x-auto scrollbar-hide">
            {/* Shop By Categories Dropdown */}
            <div className="relative flex-shrink-0 categories-dropdown-container" style={{ zIndex: 99999 }}>
              <button
                onClick={handleCategoriesToggle}
                className="categories-dropdown-button flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                <span>Shop By Categories</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Enhanced Categories Dropdown */}
              {isCategoriesOpen && isClient && createPortal(
                <>
                  <div 
                    className="fixed inset-0" 
                    style={{ zIndex: 99998 }}
                    onClick={() => setIsCategoriesOpen(false)}
                  />
                  <div 
                    className="categories-dropdown fixed bg-white rounded-lg shadow-xl border border-gray-200 py-6 max-h-[600px] overflow-y-auto" 
                    style={{ 
                      zIndex: 99999, 
                      top: dropdownPosition.top + 8,
                      left: dropdownPosition.left,
                      width: '800px'
                    }}
                  >
                    <div className="grid grid-cols-4 gap-6 px-6">
                      {categoryData.map((category) => (
                        <div key={category.name} className="space-y-4">
                          {/* Category Header */}
                          <div className="flex items-center space-x-3 pb-2 border-b border-gray-100">
                            <category.icon className="h-5 w-5 text-primary-600" />
                            <h3 className="font-semibold text-gray-900">{category.name}</h3>
                          </div>
                          
                          {/* Subcategories */}
                          <div className="space-y-2">
                            {category.subcategories.map((subcategory) => (
                              <button
                                key={subcategory.name}
                                onClick={(e) => handleSubcategoryClick(subcategory.href, e)}
                                className="block w-full text-left text-sm text-gray-600 hover:text-primary-600 hover:bg-gray-50 px-2 py-1 rounded transition-colors"
                              >
                                {subcategory.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>,
                document.body
              )}
            </div>

            {/* Quick Category Links */}
            {categoryData.slice(0, 6).map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-primary-600 transition-colors font-medium whitespace-nowrap"
              >
                <category.icon className="h-4 w-4" />
                <span>{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
} 
