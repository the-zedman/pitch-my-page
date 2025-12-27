'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseClient } from '@/lib/supabase/client'
import {
  Settings,
  Loader2,
  AlertCircle,
  Save,
  Mail,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'
import DashboardHeader from '@/components/DashboardHeader'

export default function AdminSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [emailAlertEnabled, setEmailAlertEnabled] = useState(true)

  useEffect(() => {
    checkAdminAccess()
    loadSettings()
  }, [])

  const checkAdminAccess = async () => {
    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        setError('Access denied. Admin privileges required.')
        setLoading(false)
        return
      }

      setLoading(false)
    } catch (err: any) {
      console.error('Error checking admin access:', err)
      setError('Failed to verify admin access')
      setLoading(false)
    }
  }

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (!response.ok) {
        throw new Error('Failed to load settings')
      }
      const data = await response.json()
      setEmailAlertEnabled(data.email_alert_enabled !== false) // Default to true
    } catch (err: any) {
      console.error('Error loading settings:', err)
      // Don't show error, just use defaults
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_alert_enabled: emailAlertEnabled,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save settings')
      }

      // Show success message
      alert('Settings saved successfully!')
    } catch (err: any) {
      console.error('Error saving settings:', err)
      alert(`Failed to save settings: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Settings className="w-8 h-8" />
                Admin Settings
              </h1>
              <p className="text-gray-600">Configure platform settings and preferences</p>
            </div>
            <Link
              href="/admin"
              className="text-primary-500 hover:text-primary-200"
            >
              ← Back to Admin Dashboard
            </Link>
          </div>
        </div>

        {/* Settings Form */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Platform Settings</h2>
            
            {/* Email Alerts Section */}
            <div className="border border-gray-200 rounded-lg p-6 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="w-5 h-5 text-primary-500" />
                    <h3 className="text-lg font-semibold text-gray-900">Email Alerts</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Receive email notifications when new pitches are submitted. These emails include all pitch details, user information, and links to manage the pitch in the admin panel.
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setEmailAlertEnabled(!emailAlertEnabled)}
                      className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition"
                    >
                      {emailAlertEnabled ? (
                        <ToggleRight className="w-8 h-8 text-primary-500" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-gray-400" />
                      )}
                      <span className="font-medium">
                        {emailAlertEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Additional settings such as auto-approval, content moderation rules, and feature flags will be available in future updates.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
