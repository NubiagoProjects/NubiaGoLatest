'use client'

import { ReactNode } from 'react'
import { ArrowLeft, Plus, Settings, Filter, Download, MoreVertical } from 'lucide-react'
import Link from 'next/link'

interface ModernSubpageLayoutProps {
  title: string
  subtitle?: string
  backUrl?: string
  children: ReactNode
  headerActions?: ReactNode
  showAddButton?: boolean
  addButtonText?: string
  addButtonUrl?: string
  onAddClick?: () => void
  showSettingsButton?: boolean
  onSettingsClick?: () => void
  showFilterButton?: boolean
  onFilterClick?: () => void
  showExportButton?: boolean
  onExportClick?: () => void
  breadcrumbs?: Array<{ label: string; href?: string }>
}

export default function ModernSubpageLayout({
  title,
  subtitle,
  backUrl,
  children,
  headerActions,
  showAddButton = false,
  addButtonText = "Add New",
  addButtonUrl,
  onAddClick,
  showSettingsButton = false,
  onSettingsClick,
  showFilterButton = false,
  onFilterClick,
  showExportButton = false,
  onExportClick,
  breadcrumbs = []
}: ModernSubpageLayoutProps) {
  
  const handleAddClick = () => {
    if (onAddClick) {
      onAddClick()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Title and navigation */}
            <div className="flex items-center space-x-4">
              {backUrl && (
                <Link 
                  href={backUrl}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              )}
              
              <div>
                {breadcrumbs.length > 0 && (
                  <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                    {breadcrumbs.map((crumb, index) => (
                      <div key={index} className="flex items-center">
                        {index > 0 && <span className="mx-2">/</span>}
                        {crumb.href ? (
                          <Link href={crumb.href} className="hover:text-gray-700">
                            {crumb.label}
                          </Link>
                        ) : (
                          <span className="text-gray-900 font-medium">{crumb.label}</span>
                        )}
                      </div>
                    ))}
                  </nav>
                )}
                
                <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                )}
              </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center space-x-3">
              {showExportButton && (
                <button
                  onClick={onExportClick}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
              )}

              {showFilterButton && (
                <button
                  onClick={onFilterClick}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </button>
              )}

              {showSettingsButton && (
                <button
                  onClick={onSettingsClick}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </button>
              )}

              {showAddButton && (
                <>
                  {addButtonUrl ? (
                    <Link
                      href={addButtonUrl}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {addButtonText}
                    </Link>
                  ) : (
                    <button
                      onClick={handleAddClick}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {addButtonText}
                    </button>
                  )}
                </>
              )}

              {headerActions}

              {/* More actions menu */}
              <div className="relative">
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  )
}
