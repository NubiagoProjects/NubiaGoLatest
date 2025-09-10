'use client'

import React, { useState, useEffect } from 'react'

interface ProgressiveEnhancementProps {
  children: React.ReactNode
  fallback: React.ReactNode
  className?: string
  enabledByDefault?: boolean
}

// Component that renders fallback until JavaScript loads
export function ProgressiveEnhancement({ 
  children, 
  fallback, 
  className = '',
  enabledByDefault = false 
}: ProgressiveEnhancementProps) {
  const [isJSEnabled, setIsJSEnabled] = useState(enabledByDefault)

  useEffect(() => {
    // This will only run if JavaScript is enabled
    setIsJSEnabled(true)
  }, [])

  return (
    <div className={className}>
      {isJSEnabled ? children : fallback}
    </div>
  )
}

// Hook to detect JavaScript availability
export function useJavaScriptDetection() {
  const [hasJS, setHasJS] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setHasJS(true)
    setIsHydrated(true)
  }, [])

  return { hasJS, isHydrated }
}

// Enhanced form that works without JavaScript
interface ProgressiveFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
  fallbackAction?: string
  fallbackMethod?: 'GET' | 'POST'
  className?: string
}

export function ProgressiveForm({
  children,
  onSubmit,
  fallbackAction,
  fallbackMethod = 'POST',
  className = '',
  ...props
}: ProgressiveFormProps) {
  const { hasJS } = useJavaScriptDetection()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (hasJS && onSubmit) {
      e.preventDefault()
      onSubmit(e)
    }
    // If no JS, form will submit normally to fallbackAction
  }

  return (
    <form
      className={className}
      onSubmit={handleSubmit}
      action={hasJS ? undefined : fallbackAction}
      method={hasJS ? undefined : fallbackMethod}
      {...props}
    >
      {children}
      
      {/* Hidden field to indicate JS availability */}
      <input type="hidden" name="js_enabled" value={hasJS ? '1' : '0'} />
    </form>
  )
}

// Progressive navigation that works without JavaScript
interface ProgressiveLinkProps {
  href: string
  children: React.ReactNode
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
  className?: string
  prefetch?: boolean
}

export function ProgressiveLink({
  href,
  children,
  onClick,
  className = '',
  prefetch = false,
  ...props
}: ProgressiveLinkProps) {
  const { hasJS } = useJavaScriptDetection()

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (hasJS && onClick) {
      onClick(e)
    }
    // If no JS, link will navigate normally
  }

  return (
    <a
      href={href}
      className={className}
      onClick={handleClick}
      {...(hasJS && prefetch ? { rel: 'prefetch' } : {})}
      {...props}
    >
      {children}
    </a>
  )
}

// Progressive button that degrades to a link
interface ProgressiveButtonProps {
  children: React.ReactNode
  onClick?: () => void
  fallbackHref?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  className?: string
}

export function ProgressiveButton({
  children,
  onClick,
  fallbackHref,
  type = 'button',
  disabled = false,
  className = '',
  ...props
}: ProgressiveButtonProps) {
  const { hasJS } = useJavaScriptDetection()

  if (!hasJS && fallbackHref) {
    return (
      <a href={fallbackHref} className={`btn ${className}`} {...props}>
        {children}
      </a>
    )
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

// Progressive search that works with and without JavaScript
interface ProgressiveSearchProps {
  onSearch?: (query: string) => void
  fallbackAction?: string
  placeholder?: string
  className?: string
  autoFocus?: boolean
}

export function ProgressiveSearch({
  onSearch,
  fallbackAction = '/products',
  placeholder = 'Search products...',
  className = '',
  autoFocus = false,
}: ProgressiveSearchProps) {
  const { hasJS } = useJavaScriptDetection()
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    if (hasJS && onSearch) {
      e.preventDefault()
      onSearch(query)
    }
    // If no JS, form submits to fallbackAction with query parameter
  }

  return (
    <form
      onSubmit={handleSubmit}
      action={hasJS ? undefined : fallbackAction}
      method={hasJS ? undefined : 'GET'}
      className={`relative ${className}`}
    >
      <input
        type="search"
        name="q"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="input pr-12"
        autoFocus={autoFocus}
        required
      />
      
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600"
        aria-label="Search"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
      
      {/* Fallback submit button for accessibility */}
      <noscript>
        <button type="submit" className="btn btn-primary mt-2 w-full">
          Search Products
        </button>
      </noscript>
    </form>
  )
}

// Progressive cart functionality
interface ProgressiveCartProps {
  productId: string
  productName: string
  productPrice: number
  onAddToCart?: (productId: string) => void
  fallbackAction?: string
  className?: string
}

export function ProgressiveAddToCart({
  productId,
  productName,
  productPrice,
  onAddToCart,
  fallbackAction = '/cart/add',
  className = '',
}: ProgressiveCartProps) {
  const { hasJS } = useJavaScriptDetection()

  const handleAddToCart = (e: React.FormEvent) => {
    if (hasJS && onAddToCart) {
      e.preventDefault()
      onAddToCart(productId)
    }
    // If no JS, form submits to server endpoint
  }

  return (
    <form
      onSubmit={handleAddToCart}
      action={hasJS ? undefined : fallbackAction}
      method={hasJS ? undefined : 'POST'}
      className={className}
    >
      <input type="hidden" name="product_id" value={productId} />
      <input type="hidden" name="product_name" value={productName} />
      <input type="hidden" name="product_price" value={productPrice} />
      <input type="hidden" name="quantity" value="1" />
      
      <button type="submit" className="btn btn-primary w-full">
        Add to Cart
      </button>
    </form>
  )
}

// Progressive wishlist functionality
interface ProgressiveWishlistProps {
  productId: string
  isInWishlist: boolean
  onToggleWishlist?: (productId: string) => void
  fallbackAction?: string
  className?: string
}

export function ProgressiveWishlist({
  productId,
  isInWishlist,
  onToggleWishlist,
  fallbackAction = '/wishlist/toggle',
  className = '',
}: ProgressiveWishlistProps) {
  const { hasJS } = useJavaScriptDetection()

  const handleToggle = (e: React.FormEvent) => {
    if (hasJS && onToggleWishlist) {
      e.preventDefault()
      onToggleWishlist(productId)
    }
  }

  return (
    <form
      onSubmit={handleToggle}
      action={hasJS ? undefined : fallbackAction}
      method={hasJS ? undefined : 'POST'}
      className={className}
    >
      <input type="hidden" name="product_id" value={productId} />
      <input type="hidden" name="action" value={isInWishlist ? 'remove' : 'add'} />
      
      <button
        type="submit"
        className={`btn ${isInWishlist ? 'btn-primary' : 'btn-outline'}`}
        aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <svg className="w-5 h-5" fill={isInWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
    </form>
  )
}

// No-script fallback styles
export function NoScriptStyles() {
  return (
    <noscript>
      <style>{`
        /* Enhanced styles for no-JavaScript experience */
        .js-only { display: none !important; }
        .no-js-hidden { display: none !important; }
        .no-js-block { display: block !important; }
        .no-js-inline { display: inline !important; }
        .no-js-flex { display: flex !important; }
        
        /* Form enhancements */
        .progressive-form {
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          padding: 1rem;
          margin: 1rem 0;
        }
        
        .progressive-form button[type="submit"] {
          background-color: #3b82f6;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          margin-top: 1rem;
        }
        
        .progressive-form button[type="submit"]:hover {
          background-color: #2563eb;
        }
        
        /* Navigation fallbacks */
        .mobile-nav { display: none; }
        .desktop-nav { display: block; }
        
        /* Simplified layouts for no-JS */
        .complex-layout {
          display: block !important;
          flex-direction: column !important;
        }
        
        .interactive-element {
          position: static !important;
          transform: none !important;
        }
      `}</style>
    </noscript>
  )
}
