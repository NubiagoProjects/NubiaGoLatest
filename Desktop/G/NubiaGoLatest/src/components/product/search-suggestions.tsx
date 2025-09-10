'use client'

import { useState, useEffect } from 'react'
import { Search, Clock, TrendingUp, X } from 'lucide-react'
import { useSearchHistoryStore } from '@/store/search-history'

interface SearchSuggestionsProps {
  query: string
  onSelect: (query: string) => void
  onClear?: () => void
  className?: string
}

export function SearchSuggestions({
  query,
  onSelect,
  onClear,
  className = ''
}: SearchSuggestionsProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const { getRecentSearches, getPopularSearches, clearHistory } = useSearchHistoryStore()

  const recentSearches = getRecentSearches(5)
  const popularSearches = getPopularSearches(5)

  // Show suggestions when query is empty and input is focused
  useEffect(() => {
    setShowSuggestions(!query)
  }, [query])

  if (!showSuggestions) return null

  return (
    <div className={`absolute top-full left-0 right-0 bg-white rounded-lg shadow-lg border border-gray-200 mt-1 z-50 ${className}`}>
      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900 flex items-center">
              <Clock className="h-4 w-4 mr-2 text-gray-500" />
              Recent Searches
            </h3>
            <button
              onClick={() => {
                clearHistory()
                onClear?.()
              }}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear All
            </button>
          </div>
          <div className="space-y-2">
            {recentSearches.map((search) => (
              <button
                key={search}
                onClick={() => onSelect(search)}
                className="flex items-center w-full px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
              >
                <Search className="h-4 w-4 mr-2 text-gray-400" />
                {search}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Popular Searches */}
      {popularSearches.length > 0 && (
        <div className="p-4">
          <div className="flex items-center mb-2">
            <TrendingUp className="h-4 w-4 mr-2 text-gray-500" />
            <h3 className="text-sm font-medium text-gray-900">Popular Searches</h3>
          </div>
          <div className="space-y-2">
            {popularSearches.map((search) => (
              <button
                key={search}
                onClick={() => onSelect(search)}
                className="flex items-center w-full px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
              >
                <Search className="h-4 w-4 mr-2 text-gray-400" />
                {search}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {recentSearches.length === 0 && popularSearches.length === 0 && (
        <div className="p-4 text-center">
          <Search className="h-6 w-6 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">No recent searches</p>
        </div>
      )}
    </div>
  )
}
