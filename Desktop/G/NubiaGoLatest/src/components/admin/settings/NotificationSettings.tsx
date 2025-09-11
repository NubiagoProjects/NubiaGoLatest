'use client'

import { useState } from 'react'
import { useAdminDashboardStore } from '@/store/admin/admin-dashboard.store'
import { useToast } from '@/components/ui/toast'
import { Save } from 'lucide-react'

const notificationTypes = {
  emailNotifications: 'Receive notifications via email',
  pushNotifications: 'Receive push notifications in browser',
  orderUpdates: 'Get notified about order status changes',
  systemAlerts: 'Receive important system alerts',
  weeklyReports: 'Get weekly performance reports',
  marketingEmails: 'Receive marketing and promotional emails',
}

export const NotificationSettings = () => {
  const { success, error } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    orderUpdates: true,
    systemAlerts: true,
    weeklyReports: false,
    marketingEmails: false
  })

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      success('Notification settings saved successfully!')
    } catch (err) {
      error('Failed to save notification settings.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <h4 className="font-medium text-gray-900 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </h4>
                <p className="text-sm text-gray-600">
                  {notificationTypes[key as keyof typeof notificationTypes]}
                </p>
              </div>
              <button
                onClick={() => setNotifications(prev => ({ ...prev, [key]: !value }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-blue-600' : 'bg-gray-300'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`}/>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>
    </div>
  )
}
