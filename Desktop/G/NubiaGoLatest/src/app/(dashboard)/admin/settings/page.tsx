'use client'

import { useState, useEffect } from 'react'
import { User, Shield, Bell, Settings as SettingsIcon } from 'lucide-react'
import AdminAuthGuard from '@/components/admin/AdminAuthGuard'
import ModernSubpageLayout from '@/components/dashboard/ModernSubpageLayout'
import { useAdminDashboardStore } from '@/store/admin/admin-dashboard.store'
import { ProfileSettings } from '@/components/admin/settings/ProfileSettings'
import { SecuritySettings } from '@/components/admin/settings/SecuritySettings'
import { NotificationSettings } from '@/components/admin/settings/NotificationSettings'
import { SystemSettings } from '@/components/admin/settings/SystemSettings'

const tabs = [
  { id: 'profile', label: 'Profile', icon: User, component: ProfileSettings },
  { id: 'security', label: 'Security', icon: Shield, component: SecuritySettings },
  { id: 'notifications', label: 'Notifications', icon: Bell, component: NotificationSettings },
  { id: 'system', label: 'System', icon: SettingsIcon, component: SystemSettings },
]

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const { loading } = useAdminDashboardStore()
  
  // Mock settings data
  const settings = {
    profile: { name: 'Admin User', email: 'admin@example.com' },
    security: { twoFactorEnabled: false },
    notifications: { emailEnabled: true },
    system: { autoBackup: true }
  }

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component

  if (loading || !settings) {
    return (
      <AdminAuthGuard>
        <ModernSubpageLayout title="Settings" subtitle="Manage your account, security, and system preferences.">
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </ModernSubpageLayout>
      </AdminAuthGuard>
    )
  }

  return (
    <AdminAuthGuard>
      <ModernSubpageLayout
        title="Settings"
        subtitle="Manage your account, security, and system preferences."
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Settings' }]}
      >
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-1/4 xl:w-1/5">
            <nav className="flex flex-col space-y-1">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </aside>

          <main className="flex-1">
            <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8">
              {ActiveComponent && <ActiveComponent />}
            </div>
          </main>
        </div>
      </ModernSubpageLayout>
    </AdminAuthGuard>
  )
}
