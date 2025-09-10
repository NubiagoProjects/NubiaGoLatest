'use client'

import { usePathname } from 'next/navigation'
import Navigation from './navigation'

interface ConditionalNavigationProps {
  onMenuToggle?: () => void;
}

export default function ConditionalNavigation({ onMenuToggle }: ConditionalNavigationProps) {
  const pathname = usePathname()
  
  // Don't show navigation on dashboard pages (routes starting with /dashboard or in (dashboard) group)
  const isDashboardRoute = pathname.startsWith('/admin') ||
                           pathname.startsWith('/customer') ||
                           pathname.startsWith('/supplier')
  
  // Don't show navigation if it's a dashboard route
  if (isDashboardRoute) {
    return null
  }
  
  return <Navigation onMenuToggle={onMenuToggle} />
}
