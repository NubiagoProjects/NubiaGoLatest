// Lazy loading index for heavy components
// This file exports lazy-loaded versions of components that are not needed for initial page load

import React from 'react'
import { lazy } from 'react'

// Form components - complex forms with validation
export const ProductForm = lazy(() => import('../product/forms/base/ProductFormBase'))
export const SupplierProductForm = lazy(() => import('../product/forms/supplier/SupplierProductForm'))
export const AdminProductForm = lazy(() => import('../product/forms/admin/AdminProductForm'))

// Export loading fallbacks
export const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
)

export const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
  </div>
)
