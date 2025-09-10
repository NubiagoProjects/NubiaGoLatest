'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, ChevronDown, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react'
import { isMobile as checkIsMobile } from '@/lib/mobile-detection'

interface Column {
  key: string
  label: string
  sortable?: boolean
  render?: (value: any, row: any) => React.ReactNode
  mobileLabel?: string
  hideOnMobile?: boolean
}

interface Action {
  key: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  onClick: (row: any) => void
  variant?: 'default' | 'danger' | 'primary'
}

interface ResponsiveTableProps {
  data: any[]
  columns: Column[]
  actions?: Action[]
  searchable?: boolean
  filterable?: boolean
  selectable?: boolean
  selectedItems?: string[]
  onSelectionChange?: (selected: string[]) => void
  searchQuery?: string
  onSearchChange?: (query: string) => void
  filterOptions?: { label: string; value: string }[]
  filterValue?: string
  onFilterChange?: (value: string) => void
  emptyMessage?: string
  loading?: boolean
  itemKey?: string
}

export default function ResponsiveTable({
  data,
  columns,
  actions = [],
  searchable = false,
  filterable = false,
  selectable = false,
  selectedItems = [],
  onSelectionChange,
  searchQuery = '',
  onSearchChange,
  filterOptions = [],
  filterValue = 'all',
  onFilterChange,
  emptyMessage = 'No data available',
  loading = false,
  itemKey = 'id'
}: ResponsiveTableProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(checkIsMobile())
    }
    
    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return
    
    if (checked) {
      onSelectionChange(data.map(item => item[itemKey]))
    } else {
      onSelectionChange([])
    }
  }

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (!onSelectionChange) return
    
    if (checked) {
      onSelectionChange([...selectedItems, itemId])
    } else {
      onSelectionChange(selectedItems.filter(id => id !== itemId))
    }
  }

  const toggleRowExpansion = (itemId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedRows(newExpanded)
  }

  const visibleColumns = columns.filter(col => !col.hideOnMobile || !isMobile)

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header with Search and Filters */}
      {(searchable || filterable) && (
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-3">
            <h3 className="text-lg font-semibold text-gray-900">Data Table</h3>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              {searchable && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent touch-manipulation"
                  />
                </div>
              )}
              {filterable && filterOptions.length > 0 && (
                <div className="relative">
                  <button 
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    className="flex items-center space-x-2 px-4 py-2 w-full sm:w-auto border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 touch-manipulation"
                  >
                    <Filter className="h-4 w-4" />
                    <span>Filter</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {showFilterDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                      {filterOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            onFilterChange?.(option.value)
                            setShowFilterDropdown(false)
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 touch-manipulation"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Card View */}
      {isMobile ? (
        <div className="p-4 space-y-4">
          {data.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {emptyMessage}
            </div>
          ) : (
            data.map((row) => (
              <div key={row[itemKey]} className="bg-gray-50 rounded-lg p-4 space-y-3">
                {selectable && (
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 w-5 h-5 touch-manipulation"
                      checked={selectedItems.includes(row[itemKey])}
                      onChange={(e) => handleSelectItem(row[itemKey], e.target.checked)}
                    />
                    <span className="ml-2 text-sm text-gray-600">Select item</span>
                  </div>
                )}
                
                {visibleColumns.map((column) => (
                  <div key={column.key} className="flex justify-between items-start">
                    <span className="text-sm font-medium text-gray-600 min-w-0 flex-1">
                      {column.mobileLabel || column.label}:
                    </span>
                    <span className="text-sm text-gray-900 ml-2 text-right">
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </span>
                  </div>
                ))}
                
                {actions.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                    {actions.map((action) => {
                      const Icon = action.icon
                      return (
                        <button
                          key={action.key}
                          onClick={() => action.onClick(row)}
                          className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors touch-manipulation ${
                            action.variant === 'danger' 
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : action.variant === 'primary'
                              ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{action.label}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        /* Desktop Table View */
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {selectable && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 touch-manipulation"
                      checked={selectedItems.length === data.length && data.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th key={column.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
              {data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)} className="px-6 py-8 text-center text-gray-500">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr key={row[itemKey]} className="hover:bg-gray-50">
                    {selectable && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 touch-manipulation"
                          checked={selectedItems.includes(row[itemKey])}
                          onChange={(e) => handleSelectItem(row[itemKey], e.target.checked)}
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                      </td>
                    ))}
                    {actions.length > 0 && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {actions.slice(0, 2).map((action) => {
                            const Icon = action.icon
                            return (
                              <button
                                key={action.key}
                                onClick={() => action.onClick(row)}
                                className={`p-2 rounded-lg transition-colors touch-manipulation ${
                                  action.variant === 'danger' 
                                    ? 'text-red-600 hover:bg-red-100'
                                    : action.variant === 'primary'
                                    ? 'text-primary-600 hover:bg-primary-100'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                                title={action.label}
                              >
                                <Icon className="h-4 w-4" />
                              </button>
                            )
                          })}
                          {actions.length > 2 && (
                            <div className="relative">
                              <button
                                onClick={() => toggleRowExpansion(row[itemKey])}
                                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors touch-manipulation"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                              {expandedRows.has(row[itemKey]) && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                                  {actions.slice(2).map((action) => {
                                    const Icon = action.icon
                                    return (
                                      <button
                                        key={action.key}
                                        onClick={() => {
                                          action.onClick(row)
                                          toggleRowExpansion(row[itemKey])
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2 touch-manipulation"
                                      >
                                        <Icon className="h-4 w-4" />
                                        <span>{action.label}</span>
                                      </button>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
