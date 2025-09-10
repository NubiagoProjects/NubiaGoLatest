import React, { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

// Skip to main content link
export function SkipToMainContent() {
  const mainRef = useRef<HTMLElement>(null)

  const handleSkip = () => {
    if (mainRef.current) {
      mainRef.current.focus()
      mainRef.current.scrollIntoView()
    }
  }

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50"
        onClick={handleSkip}
      >
        Skip to main content
      </a>
      <main id="main-content" ref={mainRef} tabIndex={-1} />
    </>
  )
}

// Focus trap for modals
export function useFocusTrap(enabled: boolean = true) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!enabled || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    firstElement?.focus()

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled])

  return containerRef
}

// Screen reader only text
export function SrOnly({ children }: { children: React.ReactNode }) {
  return <span className="sr-only">{children}</span>
}

// Live region for announcements
export function LiveRegion({ 
  children, 
  role = 'status', 
  'aria-live': ariaLive = 'polite' 
}: { 
  children: React.ReactNode
  role?: string
  'aria-live'?: 'polite' | 'assertive' | 'off'
}) {
  return (
    <div role={role} aria-live={ariaLive} className="sr-only">
      {children}
    </div>
  )
}

// Keyboard navigation hook
export function useKeyboardNavigation() {
  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key to close modals/dropdowns
      if (e.key === 'Escape') {
        const event = new CustomEvent('escape-pressed')
        window.dispatchEvent(event)
      }

      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        const event = new CustomEvent('search-triggered')
        window.dispatchEvent(event)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router])
}

// High contrast mode support
export function useHighContrast() {
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        document.documentElement.classList.add('high-contrast')
      } else {
        document.documentElement.classList.remove('high-contrast')
      }
    }

    if (mediaQuery.matches) {
      document.documentElement.classList.add('high-contrast')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])
}

// Reduced motion support
export function useReducedMotion() {
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        document.documentElement.classList.add('reduce-motion')
      } else {
        document.documentElement.classList.remove('reduce-motion')
      }
    }

    if (mediaQuery.matches) {
      document.documentElement.classList.add('reduce-motion')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])
}

// Announcement component
export function Announcement({ message }: { message: string }) {
  return (
    <LiveRegion aria-live="assertive">
      {message}
    </LiveRegion>
  )
}

// Focus indicator component
export function FocusIndicator({ children }: { children: React.ReactNode }) {
  return (
    <div className="focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 rounded">
      {children}
    </div>
  )
}

// Loading announcement
export function LoadingAnnouncement({ isLoading }: { isLoading: boolean }) {
  return (
    <LiveRegion>
      {isLoading ? 'Loading content' : 'Content loaded'}
    </LiveRegion>
  )
}

// Error announcement
export function ErrorAnnouncement({ error }: { error: string | null }) {
  return (
    <LiveRegion aria-live="assertive">
      {error ? `Error: ${error}` : ''}
    </LiveRegion>
  )
} 
