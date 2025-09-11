'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  Eye, 
  MousePointer, 
  ShoppingCart, 
  DollarSign,
  BarChart3,
  PieChart,
  Calendar,
  Filter,
  Download
} from 'lucide-react'
import { 
  recommendationAnalyticsService, 
  RecommendationMetrics,
  RecommendationPerformance 
} from '@/lib/services/recommendation-analytics.service'
import ModernSubpageLayout from '@/components/dashboard/ModernSubpageLayout'

interface DateRange {
  startDate: Date
  endDate: Date
}

export default function RecommendationAnalyticsPage() {
  const [metrics, setMetrics] = useState<RecommendationMetrics | null>(null)
  const [topProducts, setTopProducts] = useState<RecommendationPerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date()
  })
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Analytics', href: '/admin/analytics' },
    { label: 'Recommendations', href: '/admin/recommendations' }
  ]

  useEffect(() => {
    loadAnalytics()
  }, [dateRange, selectedAlgorithm, selectedCategory])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      
      const [metricsData, topProductsData] = await Promise.all([
        recommendationAnalyticsService.getRecommendationMetrics(
          dateRange.startDate,
          dateRange.endDate,
          selectedAlgorithm === 'all' ? undefined : selectedAlgorithm,
          selectedCategory === 'all' ? undefined : selectedCategory
        ),
        recommendationAnalyticsService.getTopPerformingRecommendations(
          dateRange.startDate,
          dateRange.endDate,
          10
        )
      ])

      setMetrics(metricsData)
      setTopProducts(topProductsData)
    } catch (error) {
      console.error('Error loading recommendation analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = () => {
    if (!metrics) return
    
    const data = {
      dateRange,
      metrics,
      topProducts,
      exportedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `recommendation-analytics-${dateRange.startDate.toISOString().split('T')[0]}-to-${dateRange.endDate.toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <ModernSubpageLayout
        title="Recommendation Analytics"
        breadcrumbs={breadcrumbs}
      >
        <div className="animate-pulse space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </ModernSubpageLayout>
    )
  }

  return (
    <ModernSubpageLayout
      title="Recommendation Analytics"
      subtitle="Monitor AI recommendation performance and user engagement"
      breadcrumbs={breadcrumbs}
      showAddButton={true}
      addButtonText="Export Data"
      onAddClick={handleExportData}
    >
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Date Range:</span>
            <input
              type="date"
              value={dateRange.startDate.toISOString().split('T')[0]}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: new Date(e.target.value) }))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.endDate.toISOString().split('T')[0]}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: new Date(e.target.value) }))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={selectedAlgorithm}
              onChange={(e) => setSelectedAlgorithm(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Algorithms</option>
              <option value="hybrid">Hybrid</option>
              <option value="collaborative">Collaborative Filtering</option>
              <option value="content_based">Content-Based</option>
              <option value="trending">Trending</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Fashion">Fashion</option>
              <option value="Home & Living">Home & Living</option>
              <option value="Beauty & Health">Beauty & Health</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics?.totalRecommendations.toLocaleString() || '0'}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clicks</p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics?.totalClicks.toLocaleString() || '0'}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <MousePointer className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversions</p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics?.totalConversions.toLocaleString() || '0'}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <ShoppingCart className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Click Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics?.clickThroughRate.toFixed(1) || '0.0'}%
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ${metrics?.revenueGenerated.toLocaleString() || '0'}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <DollarSign className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Algorithm Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Algorithm Performance</h3>
            <BarChart3 className="h-5 w-5 text-gray-500" />
          </div>
          <div className="space-y-4">
            {metrics?.topPerformingAlgorithms.map((algorithm, index) => (
              <div key={algorithm.algorithm} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-green-500' : 
                    index === 1 ? 'bg-blue-500' : 
                    index === 2 ? 'bg-yellow-500' : 'bg-gray-400'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {algorithm.algorithm.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {algorithm.ctr.toFixed(1)}% CTR
                  </div>
                  <div className="text-xs text-gray-500">
                    {algorithm.clicks} clicks, {algorithm.conversions} conversions
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Category Performance</h3>
            <PieChart className="h-5 w-5 text-gray-500" />
          </div>
          <div className="space-y-4">
            {metrics?.categoryPerformance.slice(0, 5).map((category, index) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-purple-500' : 
                    index === 1 ? 'bg-indigo-500' : 
                    index === 2 ? 'bg-pink-500' : 
                    index === 3 ? 'bg-orange-500' : 'bg-gray-400'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-900">
                    {category.category}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {category.ctr.toFixed(1)}% CTR
                  </div>
                  <div className="text-xs text-gray-500">
                    {category.clicks} clicks
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performing Products */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Top Performing Recommended Products</h3>
          <TrendingUp className="h-5 w-5 text-gray-500" />
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clicks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CTR
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Position
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topProducts.map((product, index) => (
                <tr key={product.productId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">
                            #{index + 1}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.productName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {product.productId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.totalViews.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.totalClicks.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.clickThroughRate >= 5 
                        ? 'bg-green-100 text-green-800'
                        : product.clickThroughRate >= 2
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.clickThroughRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.totalConversions.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${product.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.averagePosition.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {topProducts.length === 0 && (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-600">
              No recommendation performance data found for the selected date range and filters.
            </p>
          </div>
        )}
      </div>
    </ModernSubpageLayout>
  )
}
