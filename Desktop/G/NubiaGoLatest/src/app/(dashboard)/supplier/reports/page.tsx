'use client'

import { useState, useEffect } from 'react'
import ModernSubpageLayout from '@/components/dashboard/ModernSubpageLayout'
import FilterBar from '@/components/dashboard/FilterBar'
import DataTable from '@/components/dashboard/DataTable'
import StatusBadge from '@/components/dashboard/StatusBadge'
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Package, 
  Users, 
  Download,
  RefreshCw,
  Calendar,
  Eye
} from 'lucide-react'

interface ReportData {
  id: string
  title: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: any
}

interface ChartData {
  name: string
  sales: number
  orders: number
  revenue: number
}

export default function SupplierReports() {
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [reportData, setReportData] = useState<ReportData[]>([])
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})

  const filterOptions = [
    {
      key: 'period',
      label: 'Time Period',
      options: [
        { value: 'all', label: 'All Periods' },
        { value: '7d', label: 'Last 7 days' },
        { value: '30d', label: 'Last 30 days' },
        { value: '90d', label: 'Last 90 days' },
        { value: '1y', label: 'Last year' }
      ]
    }
  ]

  useEffect(() => {
    // Simulate loading reports data
    const loadReports = async () => {
      setLoading(true)
      
      // Mock data - replace with actual API calls
      const mockReportData: ReportData[] = [
        {
          id: '1',
          title: 'Total Revenue',
          value: '₦45,230',
          change: '+12.5%',
          trend: 'up',
          icon: DollarSign
        },
        {
          id: '2',
          title: 'Orders Processed',
          value: '1,234',
          change: '+8.2%',
          trend: 'up',
          icon: Package
        },
        {
          id: '3',
          title: 'Active Customers',
          value: '892',
          change: '+15.3%',
          trend: 'up',
          icon: Users
        },
        {
          id: '4',
          title: 'Conversion Rate',
          value: '3.2%',
          change: '-2.1%',
          trend: 'down',
          icon: TrendingUp
        }
      ]

      const mockChartData: ChartData[] = [
        { name: 'Jan', sales: 4000, orders: 240, revenue: 24000 },
        { name: 'Feb', sales: 3000, orders: 139, revenue: 22100 },
        { name: 'Mar', sales: 2000, orders: 980, revenue: 22900 },
        { name: 'Apr', sales: 2780, orders: 390, revenue: 20000 },
        { name: 'May', sales: 1890, orders: 480, revenue: 21800 },
        { name: 'Jun', sales: 2390, orders: 380, revenue: 25000 }
      ]

      setReportData(mockReportData)
      setChartData(mockChartData)
      setLoading(false)
    }

    loadReports()
  }, [selectedPeriod])

  const handleFilterChange = (filterKey: string, value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: value
    }))
  }

  const handleExportReport = () => {
    console.log('Exporting report for period:', selectedPeriod)
    // TODO: Implement export functionality
  }

  const handleRefreshData = () => {
    setLoading(true)
    // Simulate refresh
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/supplier' },
    { label: 'Reports', href: '/supplier/reports' }
  ]

  const reportColumns = [
    { key: 'name', label: 'Period', render: (value: string) => `${value} 2024` },
    { 
      key: 'revenue', 
      label: 'Revenue',
      render: (value: number) => `₦${value.toLocaleString()}`
    },
    { key: 'orders', label: 'Orders' },
    { 
      key: 'avgOrderValue', 
      label: 'Avg. Order Value',
      render: (value: number, row: any) => `₦${Math.round(row.revenue / row.orders)}`
    },
    { 
      key: 'growth', 
      label: 'Growth',
      render: () => (
        <StatusBadge 
          status={`+${Math.round(Math.random() * 20)}%`} 
          variant="default" 
        />
      )
    }
  ]

  const reportActions = [
    { key: 'view', label: 'View Details', icon: Eye, onClick: (row: any) => console.log('View report:', row.name) }
  ]

  const filteredChartData = chartData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const periodFilter = activeFilters.period || 'all'
    const matchesPeriod = periodFilter === 'all' || true // All data matches for now
    return matchesSearch && matchesPeriod
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <ModernSubpageLayout
      title="Reports & Analytics"
      subtitle="Track your business performance and insights"
      breadcrumbs={breadcrumbs}
      showExportButton
      onExportClick={handleExportReport}
      headerActions={
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          <button
            onClick={handleRefreshData}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      }
    >
      <div className="space-y-6">

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportData.map((metric) => {
          const IconComponent = metric.icon
          return (
            <div key={metric.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <IconComponent className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  </div>
                </div>
                <div className={`flex items-center space-x-1 ${
                  metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendingUp className={`h-4 w-4 ${
                    metric.trend === 'down' ? 'rotate-180' : ''
                  }`} />
                  <span className="text-sm font-medium">{metric.change}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Sales Overview</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Chart visualization would go here</p>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trends</h3>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Chart visualization would go here</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <FilterBar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search reports by period..."
        filters={filterOptions}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
      />

      {/* Detailed Reports Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Detailed Reports</h3>
        </div>
        
        <DataTable
          data={filteredChartData}
          columns={reportColumns}
          actions={reportActions}
        />
      </div>
      </div>
    </ModernSubpageLayout>
  )
}
