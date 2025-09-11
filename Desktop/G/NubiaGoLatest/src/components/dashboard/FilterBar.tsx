'use client'

import { useState } from 'react'
import { Search, Filter, X, Calendar, ChevronDown } from 'lucide-react'

interface FilterOption {
  key: string
  label: string
  options: Array<{ value: string; label: string }>
}

interface FilterBarProps {
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  filters?: FilterOption[]
  activeFilters?: Record<string, string>
  onFilterChange?: (filterKey: string, value: string) => void
  onClearFilters?: () => void
  showDateRange?: boolean
  dateRange?: { start: string; end: string }
  onDateRangeChange?: (range: { start: string; end: string }) => void
  className?: string
}

export default function FilterBar({
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  filters = [],
  activeFilters = {},
  onFilterChange,
  onClearFilters,
  showDateRange = false,
  dateRange,
  onDateRangeChange,
  className = ""
}: FilterBarProps) {
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set())

  const toggleDropdown = (filterKey: string) => {
    const newOpenDropdowns = new Set(openDropdowns)
    if (newOpenDropdowns.has(filterKey)) {
      newOpenDropdowns.delete(filterKey)
    } else {
      newOpenDropdowns.add(filterKey)
    }
    setOpenDropdowns(newOpenDropdowns)
  }

  const handleFilterSelect = (filterKey: string, value: string) => {
    if (onFilterChange) {
      onFilterChange(filterKey, value)
    }
    toggleDropdown(filterKey)
  }

  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {filters.map((filter) => (
            <div key={filter.key} className="relative">
              <button
                onClick={() => toggleDropdown(filter.key)}
                className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                  activeFilters[filter.key]
                    ? 'border-primary-300 bg-primary-50 text-primary-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="h-4 w-4 mr-2" />
                {activeFilters[filter.key] 
                  ? filter.options.find(opt => opt.value === activeFilters[filter.key])?.label || filter.label
                  : filter.label
                }
                <ChevronDown className="h-4 w-4 ml-2" />
              </button>

              {openDropdowns.has(filter.key) && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20">
                  <div className="py-1">
                    <button
                      onClick={() => handleFilterSelect(filter.key, '')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      All {filter.label}
                    </button>
                    {filter.options.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleFilterSelect(filter.key, option.value)}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                          activeFilters[filter.key] === option.value
                            ? 'text-primary-600 bg-primary-50'
                            : 'text-gray-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Date Range */}
          {showDateRange && (
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={dateRange?.start || ''}
                onChange={(e) => onDateRangeChange?.({ 
                  start: e.target.value, 
                  end: dateRange?.end || '' 
                })}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={dateRange?.end || ''}
                onChange={(e) => onDateRangeChange?.({ 
                  start: dateRange?.start || '', 
                  end: e.target.value 
                })}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <button
              onClick={onClearFilters}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Clear ({activeFilterCount})
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
