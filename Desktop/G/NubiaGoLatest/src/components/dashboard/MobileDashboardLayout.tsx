'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, X, ChevronLeft, Bell, Settings, LogOut, Sun, Moon } from 'lucide-react'
import { isMobile as checkIsMobile, navigateUniversally, getEventHandlingStrategy } from '@/lib/mobile-detection'

interface SidebarItem {
  id: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  path?: string
  onClick?: () => void
}

interface MobileDashboardLayoutProps {
  title: string
  subtitle?: string
  sidebarItems: SidebarItem[]
  activeTab: string
  onTabChange: (tab: string) => void
  children: React.ReactNode
  headerActions?: React.ReactNode
  quickActions?: React.ReactNode
  darkMode?: boolean
  onThemeToggle?: () => void
  onLogout?: () => void
  showBackButton?: boolean
  onBack?: () => void
}

export default function MobileDashboardLayout({
  title,
  subtitle,
  sidebarItems,
  activeTab,
  onTabChange,
  children,
  headerActions,
  quickActions,
  darkMode = false,
  onThemeToggle,
  onLogout,
  showBackButton = false,
  onBack
}: MobileDashboardLayoutProps) {
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(checkIsMobile())
    }
    
    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const handleSidebarItemClick = (item: SidebarItem) => {
    const eventStrategy = getEventHandlingStrategy()
    
    if (item.onClick) {
      item.onClick()
    } else if (item.path) {
      navigateUniversally(router, item.path)
    }
    
    if (item.id !== 'overview') {
      onTabChange(item.id)
    }
    
    // Close sidebar on mobile after navigation
    if (isMobile) {
      setIsSidebarOpen(false)
    }
  }

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout()
    }
  }

  const handleBackClick = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          {showBackButton && (
            <button
              onClick={handleBackClick}
              className="w-11 h-11 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center transition-colors touch-manipulation"
              aria-label="Go back"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={handleSidebarToggle}
            className="w-11 h-11 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center transition-colors touch-manipulation"
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        
        <div className="flex-1 min-w-0 mx-3">
          <h1 className="text-lg font-semibold text-gray-900 truncate">{title}</h1>
          {subtitle && (
            <p className="text-sm text-gray-600 truncate">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {onThemeToggle && (
            <button
              onClick={onThemeToggle}
              className="w-11 h-11 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center transition-colors touch-manipulation"
              aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          )}
          {headerActions}
        </div>
      </header>

      {/* Desktop Header */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col">
        <header className="bg-white shadow-sm px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{title}</h1>
              {subtitle && (
                <p className="text-gray-600 mt-1 text-sm lg:text-base">{subtitle}</p>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {onThemeToggle && (
                <button
                  onClick={onThemeToggle}
                  className="w-11 h-11 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center transition-colors touch-manipulation"
                  aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
              )}
              {headerActions}
              {onLogout && (
                <button
                  onClick={handleLogoutClick}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium touch-manipulation"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area for Desktop */}
        <div className="flex-1 flex">
          {/* Desktop Sidebar */}
          <div className="w-64 xl:w-80 bg-white shadow-sm border-r border-gray-200 p-4 lg:p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Navigation</h3>
              <p className="text-sm text-gray-600">Access all sections quickly</p>
            </div>
            
            <div className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSidebarItemClick(item)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors touch-manipulation ${
                      activeTab === item.id 
                        ? 'bg-primary-50 border border-primary-200 text-primary-700' 
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      activeTab === item.id 
                        ? 'bg-primary-100 text-primary-600' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{item.label}</p>
                      <p className="text-xs text-gray-500 truncate">Manage {item.label.toLowerCase()}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Quick Actions */}
            {quickActions && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h4>
                {quickActions}
              </div>
            )}
          </div>

          {/* Desktop Main Content */}
          <div className="flex-1 p-4 lg:p-8 overflow-auto">
            {children}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobile && isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleSidebarToggle} />
          <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-xl">
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Navigation</h3>
                <p className="text-sm text-gray-600">Access all sections quickly</p>
              </div>
              
              <div className="space-y-2">
                {sidebarItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSidebarItemClick(item)}
                      className={`w-full flex items-center space-x-3 p-4 rounded-lg text-left transition-colors touch-manipulation ${
                        activeTab === item.id 
                          ? 'bg-primary-50 border border-primary-200 text-primary-700' 
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${
                        activeTab === item.id 
                          ? 'bg-primary-100 text-primary-600' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{item.label}</p>
                        <p className="text-xs text-gray-500">Manage {item.label.toLowerCase()}</p>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Mobile Quick Actions */}
              {quickActions && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h4>
                  {quickActions}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Main Content */}
      <div className="lg:hidden flex-1 p-4 overflow-auto">
        {children}
      </div>
    </div>
  )
}
