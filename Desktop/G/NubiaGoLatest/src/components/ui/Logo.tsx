import React from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const Logo = ({ size = 'md', className = '' }: LogoProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',    // Increased from w-6 h-6 (33% larger)
    md: 'w-10 h-10',  // Increased from w-8 h-8 (25% larger)
    lg: 'w-16 h-16'   // Increased from w-12 h-12 (33% larger)
  }

  return (
    <div 
      data-testid="logo-container"
      className={`${sizeClasses[size]} bg-primary-600 rounded-lg flex items-center justify-center overflow-hidden shadow-sm ${className}`}
    >
      <svg
        data-testid="logo-svg"
        viewBox="0 0 512 512"
        className="w-4/5 h-4/5"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Main logo shape */}
        <g fill="white">
          {/* Center tall arrow */}
          <path d="M256 128 C256 128, 238 128, 238 146 L238 302 C238 320, 256 320, 256 320 C256 320, 274 320, 274 302 L274 146 C274 128, 256 128, 256 128 Z" />
          <path d="M256 128 L220 164 C208 176, 220 188, 232 176 L256 152 L280 176 C292 188, 304 176, 292 164 L256 128 Z" />
          {/* Left arrow */}
          <path d="M190 220 C190 220, 172 220, 172 238 L172 320 C172 338, 190 338, 190 338 C190 338, 208 338, 208 320 L208 238 C208 220, 190 220, 190 220 Z" />
          <path d="M190 220 L154 256 C142 268, 154 280, 166 268 L190 244 L214 268 C226 280, 238 268, 226 256 L190 220 Z" />
          {/* Right arrow */}
          <path d="M322 260 C322 260, 304 260, 304 278 L304 360 C304 378, 322 378, 322 378 C322 378, 340 378, 340 360 L340 278 C340 260, 322 260, 322 260 Z" />
          <path d="M322 260 L286 296 C274 308, 286 320, 298 308 L322 284 L346 308 C358 320, 370 308, 358 296 L322 260 Z" />
          {/* Partial circle */}
          <path
            d="M256 100 C158 100, 78 180, 78 278 C78 376, 158 456, 256 456 C354 456, 434 376, 434 278"
            fill="none"
            stroke="white"
            strokeWidth="36"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  )
}
