'use client'

import { useState, useEffect } from 'react'
import { testApiConnection } from '@/lib/api'
import { FaCheckCircle, FaTimesCircle, FaSync, FaBell, FaDatabase, FaCog } from 'react-icons/fa'

export default function SettingsPage() {
  const [apiUrl, setApiUrl] = useState('http://localhost:3000/api')
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const [notifyNewComplaint, setNotifyNewComplaint] = useState(true)
  const [notifyStatusChange, setNotifyStatusChange] = useState(true)
  const [testing, setTesting] = useState(false)
  const [sendingNotification, setSendingNotification] = useState(false)

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    setApiStatus('checking')
    try {
      await testApiConnection()
      setApiStatus('online')
    } catch (error) {
      setApiStatus('offline')
    }
  }

  const handleTestConnection = async () => {
    setTesting(true)
    await checkConnection()
    setTimeout(() => setTesting(false), 1000)
  }

  const handleTestNotification = async () => {
    setSendingNotification(true)
    try {
      const response = await fetch('http://localhost:3000/api/test-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Test Notification',
          message: 'This is a test notification from Settings page',
          data: { test: true }
        }),
      })
      
      if (response.ok) {
        alert('Test notification sent! Check the notification bell.')
      } else {
        alert('Failed to send notification')
      }
    } catch (error) {
      console.error('Error sending notification:', error)
      alert('Error sending notification')
    } finally {
      setSendingNotification(false)
    }
  }

  const handleSaveSettings = () => {
    localStorage.setItem('apiUrl', apiUrl)
    localStorage.setItem('notifyNewComplaint', String(notifyNewComplaint))
    localStorage.setItem('notifyStatusChange', String(notifyStatusChange))
    alert('Settings saved successfully!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">System Settings</h1>
        <button
          onClick={handleSaveSettings}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
        >
          Save All Settings
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* API Configuration */}
        <div className="card lg:col-span-2">
          <h3 className="text-xl font-semibold text-primary mb-6 flex items-center gap-2">
            <FaCog className="text-2xl" />
            API Configuration
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Backend API URL
              </label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="http://localhost:3000/api"
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter the base URL of your backend API server
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Connection Status
              </label>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                {apiStatus === 'checking' && (
                  <>
                    <FaSync className="animate-spin text-blue-500 text-xl" />
                    <span className="text-gray-600">Checking connection...</span>
                  </>
                )}
                {apiStatus === 'online' && (
                  <>
                    <FaCheckCircle className="text-green-500 text-xl" />
                    <span className="text-green-600 font-medium">API is Online</span>
                  </>
                )}
                {apiStatus === 'offline' && (
                  <>
                    <FaTimesCircle className="text-red-500 text-xl" />
                    <span className="text-red-600 font-medium">API is Offline</span>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
            >
              <FaSync className={testing ? 'animate-spin' : ''} />
              Test Connection
            </button>

            <button
              onClick={handleTestNotification}
              disabled={sendingNotification}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium"
            >
              <FaBell className={sendingNotification ? 'animate-bounce' : ''} />
              Test Notification
            </button>
          </div>
        </div>

        {/* System Information */}
        <div className="card">
          <h3 className="text-xl font-semibold text-primary mb-6 flex items-center gap-2">
            <FaDatabase className="text-2xl" />
            System Information
          </h3>
          
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Version</div>
              <div className="font-semibold text-gray-900">1.0.0</div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Environment</div>
              <div className="font-semibold text-gray-900">Production</div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Last Updated</div>
              <div className="font-semibold text-gray-900">
                {new Date().toLocaleDateString('en-IN')}
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Build</div>
              <div className="font-semibold text-gray-900">Next.js 14</div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="card">
        <h3 className="text-xl font-semibold text-primary mb-6 flex items-center gap-2">
          <FaBell className="text-2xl" />
          Notification Preferences
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div>
              <div className="font-medium text-gray-900">New Complaint Notifications</div>
              <div className="text-sm text-gray-600">
                Get notified when a new complaint is registered
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifyNewComplaint}
                onChange={(e) => setNotifyNewComplaint(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div>
              <div className="font-medium text-gray-900">Status Change Notifications</div>
              <div className="text-sm text-gray-600">
                Get notified when complaint status changes
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifyStatusChange}
                onChange={(e) => setNotifyStatusChange(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="card bg-gradient-to-br from-primary to-secondary text-white">
        <h3 className="text-2xl font-bold mb-4">About SurakshaBot</h3>
        <p className="text-lg mb-4 opacity-90">
          1930 Cyber Helpline Dashboard - Government of Odisha
        </p>
        <div className="space-y-2 opacity-90">
          <p>📞 Helpline: 1930</p>
          <p>📧 Email: cybercrime.odisha@gov.in</p>
          <p>🏛️ Department: Cyber Crime Police Station, Odisha</p>
        </div>
        <div className="mt-6 pt-6 border-t border-white/20">
          <p className="text-sm opacity-75">
            © {new Date().getFullYear()} Government of Odisha. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
