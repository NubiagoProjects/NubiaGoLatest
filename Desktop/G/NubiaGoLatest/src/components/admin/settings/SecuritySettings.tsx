'use client'

import { useState } from 'react'
import { useAdminDashboardStore } from '@/store/admin/admin-dashboard.store'
import { useToast } from '@/components/ui/toast'
import { Eye, EyeOff, Key, Save, Trash2 } from 'lucide-react'

export function SecuritySettings() {
  const { success, error, warning } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    maxLoginAttempts: 5,
    ipWhitelist: ['192.168.1.1', '10.0.0.1']
  })

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [newIpAddress, setNewIpAddress] = useState('')

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      warning('Passwords do not match')
      return
    }
    if (newPassword.length < 8) {
      warning('Password must be at least 8 characters long')
      return
    }
    
    setIsSaving(true)
    try {
      // In a real app, you'd call an API to verify the current password and update it.
      await new Promise(resolve => setTimeout(resolve, 1000))
      success('Password updated successfully')
      setNewPassword('')
      setConfirmPassword('')
      setCurrentPassword('')
    } catch (err) {
      error('Failed to update password. Please check your current password.')
    } finally {
      setIsSaving(false)
    }
  }

  const addIpAddress = () => {
    if (newIpAddress && !security.ipWhitelist.includes(newIpAddress)) {
      const updatedWhitelist = [...security.ipWhitelist, newIpAddress]
      setSecurity(prev => ({ ...prev, ipWhitelist: updatedWhitelist }))
      setNewIpAddress('')
    }
  }

  const removeIpAddress = (ip: string) => {
    const updatedWhitelist = security.ipWhitelist.filter(addr => addr !== ip)
    setSecurity(prev => ({ ...prev, ipWhitelist: updatedWhitelist }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      success('Security settings saved successfully!')
    } catch (err) {
      error('Failed to save security settings.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Change Password */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Password & Security</h3>
        <div className="bg-gray-50 p-6 rounded-lg space-y-4 border border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter current password"
              />
              <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter new password"
              />
              <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirm new password"
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button
            onClick={handlePasswordChange}
            disabled={isSaving || !currentPassword || !newPassword || !confirmPassword}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Key className="h-4 w-4" />
            <span>Change Password</span>
          </button>
        </div>
      </div>

      {/* Security Preferences */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Security Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
            </div>
            <button
              onClick={() => setSecurity(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${security.twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${security.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'}`}/>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
              <input type="number" value={security.sessionTimeout} onChange={(e) => setSecurity(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" min="5" max="480" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password Expiry (days)</label>
              <input type="number" value={security.passwordExpiry} onChange={(e) => setSecurity(prev => ({ ...prev, passwordExpiry: parseInt(e.target.value) }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" min="30" max="365" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
              <input type="number" value={security.maxLoginAttempts} onChange={(e) => setSecurity((prev: any) => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" min="3" max="10" />
            </div>
          </div>
        </div>
      </div>

      {/* IP Whitelist */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">IP Address Whitelist</h3>
        <div className="space-y-4">
          <div className="flex space-x-3">
            <input type="text" value={newIpAddress} onChange={(e) => setNewIpAddress(e.target.value)} placeholder="Enter IP address (e.g., 192.168.1.1)" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            <button onClick={addIpAddress} disabled={!newIpAddress} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">Add</button>
          </div>
          <div className="space-y-2">
            {security.ipWhitelist.map((ip, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="font-mono text-sm text-gray-700">{ip}</span>
                <button onClick={() => removeIpAddress(ip)} className="text-red-500 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <button onClick={handleSave} disabled={isSaving} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
          {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="h-4 w-4" />}
          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>
    </div>
  )
}
