'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Home, Menu, X, Bell, Search, Settings, LogOut, 
  ChevronDown, User, Sun, Moon, MoreHorizontal,
  ChevronLeft, ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarItem {
  id: string
  icon: React.ComponentType<any>
  label: string
  path: string
  badge?: string | number
  children?: SidebarItem[]
}

interface ModernDashboardLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  sidebarItems: SidebarItem[]
  activeTab?: string
  onTabChange?: (tab: string) => void
  theme?: 'blue' | 'orange' | 'purple'
  user?: {
    name: string
    email: string
    avatar?: string
    role: string
  }
  onLogout?: () => void
  headerActions?: React.ReactNode
  breadcrumbs?: Array<{ label: string; href?: string }>
}

const themeConfig = {
  blue: {
    primary: 'bg-blue-600',
    primaryHover: 'hover:bg-blue-700',
    primaryLight: 'bg-blue-50',
    primaryText: 'text-blue-600',
    primaryBorder: 'border-blue-200',
    sidebar: 'bg-slate-900',
    sidebarText: 'text-slate-300',
    sidebarActive: 'bg-blue-600 text-white',
    sidebarHover: 'hover:bg-slate-800',
    accent: 'text-blue-500',
    gradient: 'from-blue-600 to-blue-700'
  },
  orange: {
    primary: 'bg-orange-600',
    primaryHover: 'hover:bg-orange-700',
    primaryLight: 'bg-orange-50',
    primaryText: 'text-orange-600',
    primaryBorder: 'border-orange-200',
    sidebar: 'bg-slate-900',
    sidebarText: 'text-slate-300',
    sidebarActive: 'bg-orange-600 text-white',
    sidebarHover: 'hover:bg-slate-800',
    accent: 'text-orange-500',
    gradient: 'from-orange-600 to-orange-700'
  },
  purple: {
    primary: 'bg-purple-600',
    primaryHover: 'hover:bg-purple-700',
    primaryLight: 'bg-purple-50',
    primaryText: 'text-purple-600',
    primaryBorder: 'border-purple-200',
    sidebar: 'bg-slate-900',
    sidebarText: 'text-slate-300',
    sidebarActive: 'bg-purple-600 text-white',
    sidebarHover: 'hover:bg-slate-800',
    accent: 'text-purple-500',
    gradient: 'from-purple-600 to-purple-700'
  }
}

export default function ModernDashboardLayout({
  children,
  title,
  subtitle,
  sidebarItems,
  activeTab,
  onTabChange,
  theme,
  user = { name: 'User', email: 'user@nubiago.com', role: 'Customer' },
  onLogout,
  headerActions,
  breadcrumbs
}: ModernDashboardLayoutProps) {
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  const colors = themeConfig[theme || 'orange']

  const handleNavigation = (item: SidebarItem) => {
    onTabChange?.(item.id)
    if (item.path) {
      router.push(item.path)
    }
    setMobileMenuOpen(false)
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen)
  }

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    } else {
      router.push('/auth/login')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out",
        // Mobile: full width sidebar, desktop: responsive width
        "w-full sm:w-80 lg:w-64",
        sidebarCollapsed && "lg:w-16",
        "lg:translate-x-0",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className={cn("h-full flex flex-col", colors.sidebar)}>
          {/* Welcome Section */}
          <div className="px-4 sm:px-6 py-6 border-b border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={toggleSidebar}
                className="hidden lg:flex p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
              </button>
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            {(!sidebarCollapsed || (typeof window !== 'undefined' && window.innerWidth < 1024)) && (
              <div className="text-center">
                <h2 className="text-white font-bold text-lg mb-2">Welcome back, {user.name}!</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Track your orders, manage your account, and discover amazing products.
                </p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 sm:px-4 py-6 space-y-2 overflow-y-auto">
            {sidebarItems.map((item) => {
              const isActive = activeTab === item.id
              const Icon = item.icon

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item)}
                  className={cn(
                    "w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                    // Enhanced touch targets for mobile (minimum 44px height)
                    "min-h-[44px]",
                    isActive
                      ? cn(colors.sidebarActive, "shadow-lg scale-[1.02]")
                      : cn(colors.sidebarText, colors.sidebarHover, "hover:scale-[1.01]")
                  )}
                >
                  <Icon className="h-6 w-6 flex-shrink-0" />
                  {(!sidebarCollapsed || (typeof window !== 'undefined' && window.innerWidth < 1024)) && (
                    <>
                      <span className="ml-4 truncate font-medium">{item.label}</span>
                      {item.badge && (
                        <span className={cn(
                          "ml-auto px-2.5 py-1 text-xs font-semibold rounded-full",
                          colors.primary,
                          "text-white shadow-sm"
                        )}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              )
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-slate-800">
            {(!sidebarCollapsed || window.innerWidth < 1024) ? (
              <div className="flex items-center space-x-4 p-3 rounded-xl hover:bg-slate-800 cursor-pointer transition-colors min-h-[60px]">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-lg", colors.primary)}>
                  <User className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user.role}</p>
                  <div className="flex items-center mt-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-xs text-slate-400">Online</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-lg", colors.primary)}>
                  <User className="h-6 w-6 text-white" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        "lg:ml-64",
        sidebarCollapsed && "lg:ml-16"
      )}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-20">
              {/* Mobile menu button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-3 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <Menu className="h-6 w-6" />
              </button>

              {/* Title Only */}
              <div className="flex-1 min-w-0 ml-4 lg:ml-0">
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">{title}</h1>
                  {subtitle && (
                    <p className="text-sm sm:text-base text-gray-600 mt-1 line-clamp-2">{subtitle}</p>
                  )}
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                {headerActions}
                
                {/* Search - Hidden on mobile, shown on larger screens */}
                <button className="hidden sm:flex p-3 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] items-center justify-center">
                  <Search className="h-5 w-5" />
                </button>

                {/* Notifications */}
                <button className="p-3 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 relative transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
                  <Bell className="h-5 w-5" />
                  <span className={cn("absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse", colors.primary)}></span>
                </button>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-2 p-2 sm:p-3 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors min-h-[44px]"
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-gray-300 to-gray-400 rounded-xl flex items-center justify-center shadow-sm">
                      <User className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <ChevronDown className="h-4 w-4 hidden sm:block" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <Link href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <User className="h-4 w-4 mr-3" />
                        Profile
                      </Link>
                      <Link href="/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <Settings className="h-4 w-4 mr-3" />
                        Settings
                      </Link>
                      <button
                        onClick={() => setDarkMode(!darkMode)}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        {darkMode ? <Sun className="h-4 w-4 mr-3" /> : <Moon className="h-4 w-4 mr-3" />}
                        {darkMode ? 'Light Mode' : 'Dark Mode'}
                      </button>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-4 sm:p-6 lg:p-8 min-h-screen">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
