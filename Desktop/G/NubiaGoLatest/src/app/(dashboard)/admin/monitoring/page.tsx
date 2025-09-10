'use client'

import { useState, useEffect } from 'react'
import { 
  Activity, 
  Server, 
  Database, 
  Globe, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  RefreshCw,
  BarChart3,
  Cpu,
  HardDrive,
  Wifi,
  Users,
  ShoppingCart
} from 'lucide-react'

interface SystemMetric {
  id: string
  name: string
  value: string | number
  unit: string
  status: 'healthy' | 'warning' | 'critical'
  trend: 'up' | 'down' | 'stable'
  change: string
  lastUpdated: string
}

interface ServiceStatus {
  id: string
  name: string
  status: 'operational' | 'degraded' | 'outage'
  uptime: string
  responseTime: string
  lastIncident: string
}

export default function MonitoringPage() {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([])
  const [serviceStatuses, setServiceStatuses] = useState<ServiceStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('24h')

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockMetrics: SystemMetric[] = [
        {
          id: '1',
          name: 'CPU Usage',
          value: 45,
          unit: '%',
          status: 'healthy',
          trend: 'stable',
          change: '0%',
          lastUpdated: '2 min ago'
        },
        {
          id: '2',
          name: 'Memory Usage',
          value: 78,
          unit: '%',
          status: 'warning',
          trend: 'up',
          change: '+5%',
          lastUpdated: '2 min ago'
        },
        {
          id: '3',
          name: 'Disk Usage',
          value: 62,
          unit: '%',
          status: 'healthy',
          trend: 'stable',
          change: '0%',
          lastUpdated: '2 min ago'
        },
        {
          id: '4',
          name: 'Network Traffic',
          value: 2.4,
          unit: 'GB/s',
          status: 'healthy',
          trend: 'up',
          change: '+12%',
          lastUpdated: '2 min ago'
        },
        {
          id: '5',
          name: 'Active Users',
          value: 1247,
          unit: '',
          status: 'healthy',
          trend: 'up',
          change: '+23',
          lastUpdated: '1 min ago'
        },
        {
          id: '6',
          name: 'Database Connections',
          value: 89,
          unit: '',
          status: 'healthy',
          trend: 'stable',
          change: '0',
          lastUpdated: '2 min ago'
        },
        {
          id: '7',
          name: 'API Response Time',
          value: 145,
          unit: 'ms',
          status: 'healthy',
          trend: 'down',
          change: '-8ms',
          lastUpdated: '1 min ago'
        },
        {
          id: '8',
          name: 'Error Rate',
          value: 0.12,
          unit: '%',
          status: 'healthy',
          trend: 'down',
          change: '-0.03%',
          lastUpdated: '2 min ago'
        }
      ]

      const mockServices: ServiceStatus[] = [
        {
          id: '1',
          name: 'Web Application',
          status: 'operational',
          uptime: '99.98%',
          responseTime: '145ms',
          lastIncident: '2024-01-10'
        },
        {
          id: '2',
          name: 'Database Service',
          status: 'operational',
          uptime: '99.99%',
          responseTime: '23ms',
          lastIncident: '2024-01-05'
        },
        {
          id: '3',
          name: 'Payment Gateway',
          status: 'operational',
          uptime: '99.95%',
          responseTime: '89ms',
          lastIncident: '2024-01-12'
        },
        {
          id: '4',
          name: 'File Storage',
          status: 'operational',
          uptime: '99.97%',
          responseTime: '67ms',
          lastIncident: '2024-01-08'
        },
        {
          id: '5',
          name: 'Email Service',
          status: 'degraded',
          uptime: '98.5%',
          responseTime: '234ms',
          lastIncident: '2024-01-15'
        },
        {
          id: '6',
          name: 'Search Engine',
          status: 'operational',
          uptime: '99.92%',
          responseTime: '156ms',
          lastIncident: '2024-01-03'
        }
      ]

      setSystemMetrics(mockMetrics)
      setServiceStatuses(mockServices)
      setIsLoading(false)
    }, 1000)
  }, [])

  const handleRefresh = () => {
    setIsLoading(true)
    setLastRefresh(new Date())
    // Simulate refresh
    setTimeout(() => setIsLoading(false), 500)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'operational':
        return 'text-green-600 bg-green-50'
      case 'warning':
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50'
      case 'critical':
      case 'outage':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'operational':
        return <CheckCircle className="h-4 w-4" />
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="h-4 w-4" />
      case 'critical':
      case 'outage':
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <div className="h-4 w-4" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const overallSystemHealth = () => {
    const criticalCount = systemMetrics.filter(m => m.status === 'critical').length
    const warningCount = systemMetrics.filter(m => m.status === 'warning').length
    
    if (criticalCount > 0) return 'critical'
    if (warningCount > 0) return 'warning'
    return 'healthy'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading system metrics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">System Monitoring</h1>
              <p className="text-gray-600">Real-time system health, performance metrics, and service status</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
        </div>

        {/* Overall System Health */}
        <div className="mb-8">
          <div className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${
            overallSystemHealth() === 'healthy' ? 'border-green-500' :
            overallSystemHealth() === 'warning' ? 'border-yellow-500' : 'border-red-500'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-lg ${
                  overallSystemHealth() === 'healthy' ? 'bg-green-100' :
                  overallSystemHealth() === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  {overallSystemHealth() === 'healthy' ? (
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  ) : overallSystemHealth() === 'warning' ? (
                    <AlertTriangle className="h-8 w-8 text-yellow-600" />
                  ) : (
                    <XCircle className="h-8 w-8 text-red-600" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">System Health</h2>
                  <p className={`text-sm font-medium ${
                    overallSystemHealth() === 'healthy' ? 'text-green-600' :
                    overallSystemHealth() === 'warning' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {overallSystemHealth() === 'healthy' ? 'All systems operational' :
                     overallSystemHealth() === 'warning' ? 'Some systems experiencing issues' :
                     'Critical system issues detected'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {systemMetrics.filter(m => m.status === 'healthy').length}/{systemMetrics.length}
                </div>
                <div className="text-sm text-gray-500">Healthy metrics</div>
              </div>
            </div>
          </div>
        </div>

        {/* System Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {systemMetrics.map((metric) => (
            <div key={metric.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${
                  metric.status === 'healthy' ? 'bg-green-100' :
                  metric.status === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  {metric.status === 'healthy' ? (
                    <Activity className="h-5 w-5 text-green-600" />
                  ) : metric.status === 'warning' ? (
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  {getTrendIcon(metric.trend)}
                  <span className={`text-xs font-medium ${getTrendColor(metric.trend)}`}>
                    {metric.change}
                  </span>
                </div>
              </div>
              
              <div className="mb-2">
                <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                <div className="flex items-baseline space-x-1">
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  <p className="text-sm text-gray-500">{metric.unit}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                  {getStatusIcon(metric.status)}
                  <span className="ml-1 capitalize">{metric.status}</span>
                </span>
                <span className="text-xs text-gray-400">{metric.lastUpdated}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Service Status */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Service Status</h3>
            <p className="text-sm text-gray-600">Current status of all system services</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uptime
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Response Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Incident
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {serviceStatuses.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          service.status === 'operational' ? 'bg-green-400' :
                          service.status === 'degraded' ? 'bg-yellow-400' : 'bg-red-400'
                        }`}></div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{service.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                        {getStatusIcon(service.status)}
                        <span className="ml-1 capitalize">{service.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {service.uptime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {service.responseTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {service.lastIncident}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Performance Reports</h3>
            </div>
            <p className="text-gray-600 mb-4">Generate detailed performance reports and analytics</p>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              View Reports
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Security Status</h3>
            </div>
            <p className="text-gray-600 mb-4">Check security alerts and system vulnerabilities</p>
            <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Security Check
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Server className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">System Logs</h3>
            </div>
            <p className="text-gray-600 mb-4">Access system logs and error reports</p>
            <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              View Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
