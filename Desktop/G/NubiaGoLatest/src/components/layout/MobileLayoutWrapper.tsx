'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import MobileHeader from '@/components/mobile/MobileHeader'
import BottomNavigation from '@/components/mobile/BottomNavigation'
import MobileMenu from '@/components/mobile/MobileMenu'
import ConditionalNavigation from '@/components/layout/conditional-navigation'
import { Footer } from '@/components/ui/footer'

interface MobileLayoutWrapperProps {
  children: React.ReactNode
}

export default function MobileLayoutWrapper({ children }: MobileLayoutWrapperProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Check if current route is a dashboard page
  const isDashboardPage = pathname?.startsWith('/admin') || pathname?.startsWith('/supplier') || pathname?.startsWith('/customer')

  // Minimum swipe distance to trigger navigation
  const minSwipeDistance = 50

  const handleMenuToggle = () => {
    // Prevent body scroll when menu is open
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'auto'
    } else {
      document.body.style.overflow = 'hidden'
    }
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleMenuClose = () => {
    document.body.style.overflow = 'auto'
    setIsMobileMenuOpen(false)
  }

  // Handle touch events for swipe gestures - only when menu is open
  const onTouchStart = (e: React.TouchEvent) => {
    // Only handle swipe gestures when menu is open to avoid interfering with navigation
    if (!isMobileMenuOpen) return
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    // Only handle swipe gestures when menu is open
    if (!isMobileMenuOpen) return
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    // Only handle swipe gestures when menu is open
    if (!isMobileMenuOpen || !touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isRightSwipe = distance < -minSwipeDistance

    // Close menu on right swipe when menu is open
    if (isRightSwipe) {
      handleMenuClose()
    }
  }

  return (
    <div 
      className="min-h-screen-safe flex flex-col"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Mobile-first navigation - hide on dashboard pages */}
      {!isDashboardPage && (
        <div className="md:hidden sticky top-0 z-50 bg-white">
          <MobileHeader onMenuToggle={handleMenuToggle} />
        </div>
      )}

      {/* Desktop navigation */}
      <div className="hidden md:block">
        <ConditionalNavigation onMenuToggle={handleMenuToggle} />
      </div>

      {/* Main content with mobile-optimized spacing */}
      <main className={`min-h-screen-safe ${isDashboardPage ? 'pb-0' : 'pb-20 md:pb-0'}`}>
        {children}
      </main>

      {/* Mobile bottom navigation - hide on dashboard pages */}
      {!isDashboardPage && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[1000] bg-white border-t border-gray-200">
          <BottomNavigation />
        </div>
      )}

      {/* Mobile Menu - hide on dashboard pages */}
      {!isDashboardPage && (
        <div className="md:hidden">
          <MobileMenu isOpen={isMobileMenuOpen} onClose={handleMenuClose} />
        </div>
      )}
      
      {/* Prevent body scroll when menu is open */}
      <style jsx global>{`
        html {
          height: 100%;
          overflow-x: hidden;
          position: relative;
        }
        body {
          height: 100%;
          overflow-x: hidden;
          position: relative;
          -webkit-overflow-scrolling: touch;
        }
        @media (max-width: 768px) {
          body.menu-open {
            overflow: hidden;
            position: fixed;
            width: 100%;
          }
        }
      `}</style>

      {/* Desktop footer - hide on dashboard pages */}
      {!isDashboardPage && (
        <div className="hidden md:block">
          <Footer />
        </div>
      )}
    </div>
  )
}
