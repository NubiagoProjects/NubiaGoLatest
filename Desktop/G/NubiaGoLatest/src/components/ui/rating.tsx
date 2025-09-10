'use client'

import { Star } from 'lucide-react'
import { useState } from 'react'

interface RatingProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  interactive?: boolean
  onRatingChange?: (rating: number) => void
  className?: string
}

export default function Rating({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  interactive = false,
  onRatingChange,
  className = ''
}: RatingProps) {
  const [hoverRating, setHoverRating] = useState(0)
  const [selectedRating, setSelectedRating] = useState(rating)

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  const handleStarClick = (starRating: number) => {
    if (interactive && onRatingChange) {
      setSelectedRating(starRating)
      onRatingChange(starRating)
    }
  }

  const handleStarHover = (starRating: number) => {
    if (interactive) {
      setHoverRating(starRating)
    }
  }

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0)
    }
  }

  const displayRating = interactive ? (hoverRating || selectedRating) : rating

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <div
        className="flex items-center"
        onMouseLeave={handleMouseLeave}
      >
        {Array.from({ length: maxRating }, (_, index) => {
          const starValue = index + 1
          const isFilled = starValue <= displayRating
          const isHalf = !isFilled && starValue - 0.5 <= displayRating

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleStarClick(starValue)}
              onMouseEnter={() => handleStarHover(starValue)}
              disabled={!interactive}
              className={`transition-colors ${
                interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
              }`}
            >
              <Star
                className={`${sizeClasses[size]} ${
                  isFilled
                    ? 'text-yellow-400 fill-current'
                    : isHalf
                    ? 'text-yellow-400 fill-current opacity-50'
                    : 'text-gray-300'
                }`}
              />
            </button>
          )
        })}
      </div>
      
      {showValue && (
        <span className="text-sm text-gray-600 ml-2">
          {displayRating.toFixed(1)}/{maxRating}
        </span>
      )}
    </div>
  )
} 
