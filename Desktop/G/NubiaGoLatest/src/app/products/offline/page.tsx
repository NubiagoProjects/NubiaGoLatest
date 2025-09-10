import React from 'react'
import { Metadata } from 'next'
import OfflineProductCatalog from '@/components/mobile/OfflineProductCatalog'
import { NoScriptStyles } from '@/components/mobile/ProgressiveEnhancement'

export const metadata: Metadata = {
  title: 'Offline Product Catalog - NubiaGo',
  description: 'Browse products even when offline. Optimized for African mobile networks.',
}

export default function OfflineProductsPage() {
  return (
    <>
      <NoScriptStyles />
      
      <div className="min-h-screen bg-gray-50">
        {/* Header for no-JS fallback */}
        <noscript>
          <div className="bg-blue-600 text-white p-4 text-center">
            <h1 className="text-xl font-bold">NubiaGo - Offline Product Catalog</h1>
            <p className="text-sm mt-1">Browse our products optimized for your connection</p>
          </div>
        </noscript>

        {/* Main content */}
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Product Catalog
            </h1>
            <p className="text-gray-600 text-sm">
              Optimized for offline browsing and slow connections
            </p>
          </div>

          <OfflineProductCatalog />
        </div>
      </div>
    </>
  )
}
