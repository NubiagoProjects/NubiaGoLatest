'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Activity, Package, Heart, ShoppingCart, 
  Award, Bell, User, Calendar, TrendingUp
} from 'lucide-react'
import ModernSubpageLayout from '@/components/dashboard/ModernSubpageLayout'
import FilterBar from '@/components/dashboard/FilterBar'
import StatusBadge from '@/components/dashboard/StatusBadge'

interface ActivityItem {
  id: string
  type: 'order' | 'wishlist' | 'points' | 'profile' | 'notification'
  title: string
  description: string
  timestamp: string
  icon: any
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple'
  metadata?: any
}

export default function CustomerActivityPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    // Simulate loading activities
    setTimeout(() => {
      setActivities([
        {
          id: '1',
          type: 'order',
          title: 'Order Delivered',
          description: 'Your order ORD-001 (Wireless Headphones) has been delivered successfully',
          timestamp: '2024-01-22T14:30:00Z',
          icon: Package,
          color: 'green',
          metadata: { orderId: 'ORD-001', status: 'delivered' }
        },
        {
          id: '2',
          type: 'order',
          title: 'Order Shipped',
          description: 'Your order ORD-002 (Smart Watch) is on its way',
          timestamp: '2024-01-21T09:15:00Z',
          icon: Package,
          color: 'blue',
          metadata: { orderId: 'ORD-002', status: 'shipped' }
        },
        {
          id: '3',
          type: 'points',
          title: 'Points Earned',
          description: 'You earned 50 loyalty points from your recent purchase',
          timestamp: '2024-01-20T16:45:00Z',
          icon: Award,
          color: 'yellow',
          metadata: { points: 50, reason: 'purchase' }
        },
        {
          id: '4',
          type: 'wishlist',
          title: 'Item Added to Wishlist',
          description: 'You added "Gaming Keyboard" to your wishlist',
          timestamp: '2024-01-19T11:20:00Z',
          icon: Heart,
          color: 'red',
          metadata: { productId: 'PROD-123', productName: 'Gaming Keyboard' }
        },
        {
          id: '5',
          type: 'order',
          title: 'Order Placed',
          description: 'You placed order ORD-003 for 2 items totaling $149.98',
          timestamp: '2024-01-18T13:10:00Z',
          icon: ShoppingCart,
          color: 'blue',
          metadata: { orderId: 'ORD-003', total: 149.98, items: 2 }
        },
        {
          id: '6',
          type: 'profile',
          title: 'Profile Updated',
          description: 'You updated your profile information and shipping address',
          timestamp: '2024-01-17T10:05:00Z',
          icon: User,
          color: 'purple',
          metadata: { fields: ['address', 'phone'] }
        },
        {
          id: '7',
          type: 'notification',
          title: 'Promotion Alert',
          description: 'New 20% off promotion available on electronics',
          timestamp: '2024-01-16T08:30:00Z',
          icon: Bell,
          color: 'yellow',
          metadata: { promotion: 'ELECTRONICS20', discount: 20 }
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-100 text-blue-600'
      case 'green': return 'bg-green-100 text-green-600'
      case 'red': return 'bg-red-100 text-red-600'
      case 'yellow': return 'bg-yellow-100 text-yellow-600'
      case 'purple': return 'bg-purple-100 text-purple-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const filteredActivities = activities.filter(activity => {
    const matchesFilter = filter === 'all' || activity.type === filter
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours} hours ago`
    if (diffInHours < 48) return 'Yesterday'
    return date.toLocaleDateString()
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/customer' },
    { label: 'Activity History', href: '/customer/activity' }
  ]

  const filterOptions = [
    { label: 'All Activities', key: 'all' },
    { label: 'Orders', key: 'order' },
    { label: 'Wishlist', key: 'wishlist' },
    { label: 'Loyalty Points', key: 'points' },
    { label: 'Profile', key: 'profile' },
    { label: 'Notifications', key: 'notification' }
  ]

  const handleExport = async () => {
    console.log('Exporting activity history...')
    // TODO: Implement activity export functionality
  }

  if (loading) {
    return (
      <ModernSubpageLayout
        title="Activity History"
        subtitle="Track all your account activities and interactions"
        breadcrumbs={breadcrumbs}
        showExportButton={true}
        onExportClick={handleExport}
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </ModernSubpageLayout>
    )
  }

  return (
    <ModernSubpageLayout
      title="Activity History"
      subtitle="Track all your account activities and interactions"
      breadcrumbs={breadcrumbs}
      showExportButton={true}
      onExportClick={handleExport}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="text-2xl font-semibold text-gray-900">
                {activities.filter(a => a.type === 'order').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Heart className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Wishlist Items</p>
              <p className="text-2xl font-semibold text-gray-900">
                {activities.filter(a => a.type === 'wishlist').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Award className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Points Earned</p>
              <p className="text-2xl font-semibold text-gray-900">
                {activities
                  .filter(a => a.type === 'points')
                  .reduce((sum, a) => sum + (a.metadata?.points || 0), 0)
                }
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Activities</p>
              <p className="text-2xl font-semibold text-gray-900">{activities.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Activity Type Filter */}
          <div className="lg:w-48">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {filterOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-lg shadow mt-6">
        {filteredActivities.length === 0 ? (
          <div className="p-8 text-center">
            <Activity className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No activities found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Your activity history will appear here as you use the platform.'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredActivities.map((activity) => {
              const IconComponent = activity.icon
              return (
                <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getColorClasses(activity.color)}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <div className="flex items-center space-x-2">
                          <StatusBadge status={activity.type} />
                          <p className="text-xs text-gray-500">{formatTimestamp(activity.timestamp)}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                      
                      {/* Activity-specific metadata */}
                      {activity.metadata && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {activity.type === 'order' && activity.metadata.orderId && (
                            <Link
                              href={`/customer/orders`}
                              className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full hover:bg-blue-200 transition-colors"
                            >
                              View Order
                            </Link>
                          )}
                          {activity.type === 'points' && activity.metadata.points && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                              +{activity.metadata.points} points
                            </span>
                          )}
                          {activity.type === 'wishlist' && activity.metadata.productId && (
                            <Link
                              href={`/products`}
                              className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full hover:bg-red-200 transition-colors"
                            >
                              View Product
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </ModernSubpageLayout>
  )
}
