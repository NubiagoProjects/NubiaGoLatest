'use client'

import { useState } from 'react'
import { useAdminDashboardStore } from '@/store/admin/admin-dashboard.store'
import { useToast } from '@/components/ui/toast'
import { Save, Download, Upload, Trash2 } from 'lucide-react'

const backupFrequencies = ['hourly', 'daily', 'weekly', 'monthly']

export function SystemSettings() {
  const { success, error, warning } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [system, setSystem] = useState({
    automaticBackups: true,
    backupFrequency: 'daily',
    logRetention: 30,
    maintenanceMode: false,
    debugMode: false
  })

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      success('System settings saved successfully!')
    } catch (err) {
      error('Failed to save system settings.')
    } finally {
      setIsSaving(false)
    }
  }

  const exportSettings = () => {
    try {
      const dataStr = JSON.stringify(system, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
      
      const exportFileDefaultName = 'admin-settings.json'
      
      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', exportFileDefaultName)
      linkElement.click()
      
      success('Settings exported successfully!')
    } catch (err) {
      error('Failed to export settings.')
    }
  }

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string)
          // Simulate settings update
          setSystem(importedSettings)
          success('Settings imported successfully!')
        } catch (err) {
          error('Invalid settings file or failed to import.')
        }
      }
      reader.readAsText(file)
    }
  }

  const handleReset = async () => {
    if (confirm('This action cannot be undone. All settings will be reset to defaults. Continue?')) {
      try {
        setSystem({
          automaticBackups: true,
          backupFrequency: 'daily',
          logRetention: 30,
          maintenanceMode: false,
          debugMode: false
        })
        success('All settings have been reset to defaults.')
      } catch (err) {
        error('Failed to reset settings.')
      }
    }
  }

  return (
    <div className="space-y-8">
      {/* System Configuration */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">System Configuration</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <h4 className="font-medium text-gray-900">Automatic Backups</h4>
              <p className="text-sm text-gray-600">Automatically backup system data</p>
            </div>
            <button
              onClick={() => setSystem((prev: any) => ({ ...prev, automaticBackups: !prev.automaticBackups }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${system.automaticBackups ? 'bg-blue-600' : 'bg-gray-300'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${system.automaticBackups ? 'translate-x-6' : 'translate-x-1'}`}/>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
              <select value={system.backupFrequency} onChange={(e) => setSystem(prev => ({ ...prev, backupFrequency: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
                {backupFrequencies.map(freq => (
                  <option key={freq} value={freq}>{freq.charAt(0).toUpperCase() + freq.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Log Retention (days)</label>
              <input type="number" value={system.logRetention} onChange={(e) => setSystem(prev => ({ ...prev, logRetention: parseInt(e.target.value) }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" min="7" max="365" />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <h4 className="font-medium text-gray-900">Maintenance Mode</h4>
              <p className="text-sm text-gray-600">Temporarily disable public access for maintenance</p>
            </div>
            <button
              onClick={() => setSystem(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${system.maintenanceMode ? 'bg-blue-600' : 'bg-gray-300'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${system.maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`}/>
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <h4 className="font-medium text-gray-900">Debug Mode</h4>
              <p className="text-sm text-gray-600">Enable detailed logging for troubleshooting</p>
            </div>
            <button
              onClick={() => setSystem(prev => ({ ...prev, debugMode: !prev.debugMode }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${system.debugMode ? 'bg-blue-600' : 'bg-gray-300'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${system.debugMode ? 'translate-x-6' : 'translate-x-1'}`}/>
            </button>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Data Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button onClick={exportSettings} className="flex items-center justify-center space-x-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
            <Download className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium">Export Settings</span>
          </button>
          <label className="flex items-center justify-center space-x-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200">
            <Upload className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium">Import Settings</span>
            <input type="file" accept=".json" onChange={importSettings} className="hidden" />
          </label>
          <button onClick={handleReset} className="flex items-center justify-center space-x-2 p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-red-600 border border-red-200">
            <Trash2 className="h-5 w-5" />
            <span className="text-sm font-medium">Reset to Defaults</span>
          </button>
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
