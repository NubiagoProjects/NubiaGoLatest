'use client'

import { ReactNode, useState } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown, MoreHorizontal, Search, Filter } from 'lucide-react'

interface Column {
  key: string
  label: string
  mobileLabel?: string
  render?: (value: any, row: any) => ReactNode
  sortable?: boolean
  width?: string
}

interface Action {
  key: string
  label: string
  icon?: any
  onClick: (row: any) => void
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'gray'
}

interface ResponsiveDataViewProps {
  data: any[]
  columns: Column[]
  actions?: Action[]
  searchable?: boolean
  filterable?: boolean
  searchPlaceholder?: string
  onSearch?: (query: string) => void
  onFilter?: (filter: string) => void
  filterOptions?: { value: string; label: string }[]
  emptyMessage?: string
  className?: string
}

export default function ResponsiveDataView({
  data,
  columns,
  actions = [],
  searchable = false,
  filterable = false,
  searchPlaceholder = "Search...",
  onSearch,
  onFilter,
  filterOptions = [],
  emptyMessage = "No data available",
  className
}: ResponsiveDataViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterValue, setFilterValue] = useState('all')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    onSearch?.(query)
  }

  const handleFilter = (filter: string) => {
    setFilterValue(filter)
    onFilter?.(filter)
  }

  const toggleRowExpansion = (rowId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId)
    } else {
      newExpanded.add(rowId)
    }
    setExpandedRows(newExpanded)
  }

  const getActionColor = (color: string = 'blue') => {
    const colors = {
      blue: 'text-blue-600 hover:text-blue-800 hover:bg-blue-50',
      green: 'text-green-600 hover:text-green-800 hover:bg-green-50',
      yellow: 'text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50',
      red: 'text-red-600 hover:text-red-800 hover:bg-red-50',
      gray: 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 overflow-hidden', className)}>
      {/* Header with Search and Filter */}
      {(searchable || filterable) && (
        <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            {searchable && (
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
            {filterable && filterOptions.length > 0 && (
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={filterValue}
                  onChange={(e) => handleFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[120px]"
                >
                  <option value="all">All</option>
                  {filterOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  style={{ width: column.width }}
                >
                  {column.label}
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr key={row.id || index} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </div>
                  </td>
                ))}
                {actions.length > 0 && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {actions.map((action) => {
                        const Icon = action.icon
                        return (
                          <button
                            key={action.key}
                            onClick={() => action.onClick(row)}
                            className={cn(
                              'p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation',
                              getActionColor(action.color)
                            )}
                            title={action.label}
                          >
                            {Icon && <Icon className="h-4 w-4" />}
                          </button>
                        )
                      })}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden">
        {data.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {emptyMessage}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {data.map((row, index) => {
              const rowId = row.id || index.toString()
              const isExpanded = expandedRows.has(rowId)
              const primaryColumns = columns.slice(0, 2)
              const secondaryColumns = columns.slice(2)
              
              return (
                <div key={rowId} className="p-4">
                  {/* Primary Info - Always Visible */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      {primaryColumns.map((column) => (
                        <div key={column.key} className="mb-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {column.mobileLabel || column.label}
                            </span>
                          </div>
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {column.render ? column.render(row[column.key], row) : row[column.key]}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Actions and Expand Button */}
                    <div className="flex items-center space-x-2 ml-4">
                      {actions.length > 0 && (
                        <div className="flex items-center space-x-1">
                          {actions.slice(0, 2).map((action) => {
                            const Icon = action.icon
                            return (
                              <button
                                key={action.key}
                                onClick={() => action.onClick(row)}
                                className={cn(
                                  'p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation',
                                  getActionColor(action.color)
                                )}
                                title={action.label}
                              >
                                {Icon && <Icon className="h-4 w-4" />}
                              </button>
                            )
                          })}
                          {actions.length > 2 && (
                            <button
                              className="p-2 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
                              title="More actions"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      )}
                      
                      {secondaryColumns.length > 0 && (
                        <button
                          onClick={() => toggleRowExpansion(rowId)}
                          className="p-2 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
                        >
                          <ChevronDown className={cn(
                            'h-4 w-4 transition-transform',
                            isExpanded && 'rotate-180'
                          )} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Secondary Info - Expandable */}
                  {secondaryColumns.length > 0 && isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                      {secondaryColumns.map((column) => (
                        <div key={column.key} className="flex justify-between items-start">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {column.mobileLabel || column.label}
                          </span>
                          <div className="text-sm text-gray-900 text-right max-w-[60%]">
                            {column.render ? column.render(row[column.key], row) : row[column.key]}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Empty State */}
      {data.length === 0 && (
        <div className="hidden lg:block p-8 text-center text-gray-500">
          {emptyMessage}
        </div>
      )}
    </div>
  )
}
