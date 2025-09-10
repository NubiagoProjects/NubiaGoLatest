'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Search, 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  ChevronDown,
  Heart,
  Bell,
  Settings,
  LogOut,
  Package,
  Store,
  Users,
  BarChart3,
  HelpCircle
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { CartService } from '@/lib/services/cart.service'
import { Logo } from './Logo'

// ============================================================================
// TYPES
// ============================================================================

interface NavigationItem {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  children?: NavigationItem[]
}

interface UserDropdownProps {
  user: any
  onLogout: () => void
}

// ============================================================================
// NAVIGATION DATA
// ============================================================================

const navigationItems: NavigationItem[] = [
  {
    label: 'Home',
    href: '/',
  },
  {
    label: 'Products',
    href: '/products',
  },
  {
    label: 'About',
    href: '/about',
  },
  {
    label: 'Contact',
    href: '/contact',
  },
]

const userMenuItems = [
  {
    label: 'Profile',
    href: '/customer/profile',
    icon: User,
  },
  {
    label: 'Orders',
    href: '/customer/orders',
    icon: Package,
  },
  {
    label: 'Wishlist',
    href: '/customer/wishlist',
    icon: Heart,
  },
  {
    label: 'Notifications',
    href: '/customer/notifications',
    icon: Bell,
  },
  {
    label: 'Settings',
    href: '/customer/settings',
    icon: Settings,
  },
]

const supplierMenuItems = [
  {
    label: 'Dashboard',
    href: '/supplier',
    icon: BarChart3,
  },
  {
    label: 'Products',
    href: '/supplier/products',
    icon: Package,
  },
  {
    label: 'Orders',
    href: '/supplier/orders',
    icon: Store,
  },
  {
    label: 'Customers',
    href: '/supplier/customers',
    icon: Users,
  },
  {
    label: 'Analytics',
    href: '/supplier/analytics',
    icon: BarChart3,
  },
]

const adminMenuItems = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: BarChart3,
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    label: 'Products',
    href: '/admin/products',
    icon: Package,
  },
  {
    label: 'Orders',
    href: '/admin/orders',
    icon: Store,
  },
  {
    label: 'Approvals',
    href: '/admin/approvals',
    icon: HelpCircle,
  },
]

// ============================================================================
// SEARCH COMPONENT
// ============================================================================

function SearchBar() {
  const [query, setQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`)
      setIsSearchOpen(false)
    }
  }

  return (
    <div className="relative">
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </form>
    </div>
  )
}

// ============================================================================
// USER DROPDOWN COMPONENT
// ============================================================================

function UserDropdown({ user, onLogout }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const menuItems = user?.role === 'admin' 
    ? adminMenuItems 
    : user?.role === 'supplier' 
    ? supplierMenuItems 
    : userMenuItems

  const handleLogout = async () => {
    try {
      await onLogout()
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-white" />
        </div>
        <span className="hidden md:block text-sm font-medium text-gray-700">
          {user?.displayName || user?.email}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="py-2">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">
                  {user?.displayName || 'User'}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              
              <div className="py-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon && <item.icon className="h-4 w-4 mr-3" />}
                    {item.label}
                  </Link>
                ))}
              </div>
              
              <div className="border-t border-gray-100 pt-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ============================================================================
// MOBILE MENU COMPONENT
// ============================================================================

function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      // Add logout logic here
      router.push('/auth/login')
      onClose()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <nav className="p-4">
              <div className="space-y-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={onClose}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              
              {user && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account
                  </p>
                  <div className="mt-2 space-y-1">
                    <Link
                      href="/customer/profile"
                      className="block px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                      onClick={onClose}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/customer/orders"
                      className="block px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                      onClick={onClose}
                    >
                      Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}

// ============================================================================
// MAIN NAVIGATION COMPONENT
// ============================================================================

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { user } = useAuth()
  const cartService = new CartService()
  const [cartItemCount, setCartItemCount] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const loadCartCount = async () => {
      if (!user?.uid) {
        setCartItemCount(0)
        return
      }
      
      try {
        const cart = await cartService.getCart(user.uid)
        setCartItemCount(cart.itemCount)
      } catch (error) {
        console.error('Error loading cart count:', error)
        setCartItemCount(0)
      }
    }
    
    loadCartCount()
  }, [user?.uid])

  const handleLogout = async () => {
    // Add logout logic here
    // Logging out...
  }



  return (
    <header className={`sticky top-0 z-40 bg-white border-b border-gray-200 transition-all duration-200 ${
      isScrolled ? 'shadow-md' : ''
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Logo size="md" />
              <span className="text-xl font-bold text-gray-900">NubiaGo</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'text-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <SearchBar />
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ShoppingCart className="h-5 w-5 text-gray-700" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <UserDropdown user={user} onLogout={handleLogout} />
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="lg:hidden pb-4">
          <SearchBar />
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
    </header>
  )
} 
