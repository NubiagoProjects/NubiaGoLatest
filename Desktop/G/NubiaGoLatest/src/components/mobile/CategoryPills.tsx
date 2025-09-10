'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Grid3X3 } from 'lucide-react'
import { CATEGORIES_DATA } from '@/lib/constants'

interface CategoryPillsProps {
  activeCategory?: string
  onCategorySelect?: (category: string) => void
  showProductCount?: boolean
  maxVisible?: number
}

export default function CategoryPills({ 
  activeCategory,
  onCategorySelect,
  showProductCount = true,
  maxVisible = 8
}: CategoryPillsProps) {
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Check scroll position and update scroll buttons
  const checkScrollPosition = () => {
    if (!scrollContainerRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
  }

  useEffect(() => {
    checkScrollPosition()
    window.addEventListener('resize', checkScrollPosition)
    return () => window.removeEventListener('resize', checkScrollPosition)
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return

    const container = scrollContainerRef.current
    const scrollAmount = 200 // Adjust scroll amount as needed
    
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }

    // Check scroll position after scrolling
    setTimeout(checkScrollPosition, 300)
  }

  const handleCategoryClick = (categoryValue: string) => {
    onCategorySelect?.(categoryValue)
  }

  // Get popular categories first (you can customize this logic)
  const popularCategories = [
    'Electronics',
    'Fashion',
    'Home & Living',
    'Beauty & Cosmetics',
    'Sports & Outdoors',
    'Books & Media',
    'Automotive',
    'Health & Wellness'
  ]

  // Sort categories by popularity
  const sortedCategories = [...CATEGORIES_DATA].sort((a, b) => {
    const aIndex = popularCategories.indexOf(a.name)
    const bIndex = popularCategories.indexOf(b.name)
    if (aIndex === -1 && bIndex === -1) return 0
    if (aIndex === -1) return 1
    if (bIndex === -1) return -1
    return aIndex - bIndex
  })

  return (
    <div className="mobile-category-pills-container relative">
      {/* Left Scroll Button */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        </button>
      )}

      {/* Right Scroll Button */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <ChevronRight className="h-4 w-4 text-gray-600" />
        </button>
      )}

      {/* Categories Container */}
      <div 
        ref={scrollContainerRef}
        onScroll={checkScrollPosition}
        className="mobile-category-pills overflow-x-auto scrollbar-hide"
      >
        {/* All Categories Pill */}
        <div className="flex-shrink-0">
          <button
            onClick={() => handleCategoryClick('all')}
            className={`mobile-category-pill ${
              !activeCategory || activeCategory === 'all' 
                ? 'active' 
                : 'hover:bg-gray-100'
            }`}
          >
            <Grid3X3 className="h-4 w-4 mr-2" />
            All Categories
            {showProductCount && (
              <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                {sortedCategories.length}
              </span>
            )}
          </button>
        </div>

        {/* Category Pills */}
        {sortedCategories.slice(0, maxVisible).map((category) => (
          <div key={category.value} className="flex-shrink-0">
            <button
              onClick={() => handleCategoryClick(category.value)}
              className={`mobile-category-pill ${
                activeCategory === category.value 
                  ? 'active' 
                  : 'hover:bg-gray-100'
              }`}
            >

              {category.name}
              {showProductCount && (
                <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                  {category.subcategories?.length || 0}
                </span>
              )}
            </button>
          </div>
        ))}

        {/* See All Categories */}
        {sortedCategories.length > maxVisible && (
          <div className="flex-shrink-0">
            <Link
              href="/categories"
              className="mobile-category-pill text-primary-600 border-primary-200 hover:bg-primary-50"
            >
              See All
              <ChevronRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
