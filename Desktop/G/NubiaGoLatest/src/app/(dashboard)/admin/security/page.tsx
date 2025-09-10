'use client'

import { useState } from 'react'
import { ModernDashboardLayout } from '@/components/dashboard/ModernDashboardLayout'
import { 
  Shield, 
  Key, 
  Users, 
  ShoppingBag, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Eye,
  Lock,
  Unlock,
  Activity,
  Clock,
  Globe,
  Smartphone
} from 'lucide-react'

export default function AdminSecurityPage() {
  const [activeTab, setActiveTab] = useState('overview')

  const sidebarItems = [
    { id: 'overview', icon: Shield, label: 'Dashboard', path: '/admin' },
    { id: 'users', icon: Users, label: 'Users', path: '/admin/users' },
    { id: 'orders', icon: ShoppingBag, label: 'Orders', path: '/admin/orders' },
    { id: 'products', icon: ShoppingBag, label: 'Products', path: '/admin/products' },
    { id: 'suppliers', icon: Users, label: 'Suppliers', path: '/admin/suppliers' },
    { id: 'security', icon: Shield, label: 'Security', path: '/admin/security' },
    { id: 'settings', icon: Shield, label: 'Settings', path: '/admin/settings' }
  ]

  const securityMetrics = {
    totalLogins: 12450,
    failedAttempts: 23,
    activeUsers: 1250,
    suspiciousActivity: 5
  }

  const recentActivity = [
    {
      id: 1,
      type: 'login',
      user: 'admin@nubiago.com',
      action: 'Successful login',
      ip: '192.168.1.100',
      location: 'Istanbul, Turkey',
      timestamp: '2 minutes ago',
      status: 'success'
    },
    {
      id: 2,
      type: 'failed_login',
      user: 'unknown@email.com',
      action: 'Failed login attempt',
      ip: '45.123.45.67',
      location: 'Unknown',
      timestamp: '15 minutes ago',
      status: 'warning'
    },
    {
      id: 3,
      type: 'password_change',
      user: 'user@nubiago.com',
      action: 'Password changed',
      ip: '192.168.1.105',
      location: 'Istanbul, Turkey',
      timestamp: '1 hour ago',
      status: 'success'
    },
    {
      id: 4,
      type: 'account_lock',
      user: 'suspicious@email.com',
      action: 'Account locked due to multiple failed attempts',
      ip: '123.45.67.89',
      location: 'Unknown',
      timestamp: '2 hours ago',
      status: 'error'
    }
  ]

  const securitySettings = [
    {
      name: 'Two-Factor Authentication',
      description: 'Require 2FA for all admin accounts',
      enabled: true
    },
    {
      name: 'Password Complexity',
      description: 'Enforce strong password requirements',
      enabled: true
    },
    {
      name: 'Session Timeout',
      description: 'Auto-logout after 30 minutes of inactivity',
      enabled: true
    },
    {
      name: 'IP Whitelist',
      description: 'Restrict admin access to specific IP addresses',
      enabled: false
    },
    {
      name: 'Login Notifications',
      description: 'Send email alerts for new login locations',
      enabled: true
    },
    {
      name: 'Account Lockout',
      description: 'Lock accounts after 5 failed login attempts',
      enabled: true
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'login': return <Eye className="h-4 w-4" />
      case 'failed_login': return <XCircle className="h-4 w-4" />
      case 'password_change': return <Key className="h-4 w-4" />
      case 'account_lock': return <Lock className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  return (
    <ModernDashboardLayout 
      sidebarItems={sidebarItems}
      title="Security Center"
      subtitle="Monitor and manage platform security"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Security Center</h1>
            <p className="text-gray-600">Monitor security events and manage access controls</p>
          </div>
        </div>

        {/* Security Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Logins</p>
                <p className="text-2xl font-bold text-gray-900">
                  {securityMetrics.totalLogins.toLocaleString()}
                </p>
                <p className="text-sm text-green-600">+12% from last week</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed Attempts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {securityMetrics.failedAttempts}
                </p>
                <p className="text-sm text-red-600">+3 from yesterday</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {securityMetrics.activeUsers.toLocaleString()}
                </p>
                <p className="text-sm text-blue-600">Currently online</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Suspicious Activity</p>
                <p className="text-2xl font-bold text-gray-900">
                  {securityMetrics.suspiciousActivity}
                </p>
                <p className="text-sm text-yellow-600">Requires attention</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Recent Activity
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Security Settings
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Security Activity</h3>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full border border-gray-200">
                        {getActionIcon(activity.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        {getStatusIcon(activity.status)}
                      </div>
                      <p className="text-sm text-gray-600">{activity.user}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center space-x-1">
                          <Globe className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{activity.ip}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Smartphone className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{activity.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{activity.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
              <div className="space-y-6">
                {securitySettings.map((setting, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{setting.name}</h4>
                      <p className="text-sm text-gray-600">{setting.description}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`text-sm font-medium ${setting.enabled ? 'text-green-600' : 'text-gray-500'}`}>
                        {setting.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <button
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          setting.enabled ? 'bg-orange-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            setting.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Security Alerts */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Alerts</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Multiple failed login attempts detected</p>
                  <p className="text-sm text-yellow-700">IP address 45.123.45.67 has attempted to login 5 times in the last hour</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Security scan completed</p>
                  <p className="text-sm text-blue-700">No vulnerabilities detected in the last security scan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModernDashboardLayout>
  )
}
