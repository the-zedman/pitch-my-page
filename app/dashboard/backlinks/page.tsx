'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Backlink, Pitch } from '@/lib/supabase/types'
import { 
  Plus, 
  Link2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Eye,
  Trash2,
  Edit,
  Clock,
  ExternalLink
} from 'lucide-react'
import DashboardHeader from '@/components/DashboardHeader'

export default function BacklinksPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [backlinks, setBacklinks] = useState<Backlink[]>([])
  const [pitches, setPitches] = useState<Pitch[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedBacklink, setSelectedBacklink] = useState<Backlink | null>(null)
  const [verifyingId, setVerifyingId] = useState<string | null>(null)
  const [monitoringId, setMonitoringId] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const supabase = createSupabaseClient()
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        router.push('/auth/login')
        return
      }

      // Fetch backlinks
      const backlinksRes = await fetch('/api/backlinks')
      if (!backlinksRes.ok) {
        throw new Error('Failed to load backlinks')
      }
      const { backlinks: backlinksData } = await backlinksRes.json()
      setBacklinks(backlinksData || [])

      // Fetch user's pitches directly (we need all pitches, not just approved ones)
      const { data: pitchesData, error: pitchesError } = await supabase
        .from('pitches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (pitchesError) {
        console.error('Error fetching pitches:', pitchesError)
        // Don't fail the whole load if pitches fail
        setPitches([])
      } else {
        setPitches(pitchesData || [])
      }
    } catch (err: any) {
      console.error('Error loading data:', err)
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (backlinkId: string) => {
    setVerifyingId(backlinkId)
    try {
      const response = await fetch(`/api/backlinks/${backlinkId}/verify`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Verification failed')
        return
      }

      alert(data.message || 'Backlink verified successfully!')
      loadData() // Reload to show updated status
    } catch (err: any) {
      alert('Error verifying backlink: ' + err.message)
    } finally {
      setVerifyingId(null)
    }
  }

  const handleMonitor = async (backlinkId: string) => {
    setMonitoringId(backlinkId)
    try {
      const response = await fetch(`/api/backlinks/${backlinkId}/monitor`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Monitoring check failed')
        return
      }

      alert(data.message || 'Monitoring check completed')
      loadData() // Reload to show updated status
    } catch (err: any) {
      alert('Error monitoring backlink: ' + err.message)
    } finally {
      setMonitoringId(null)
    }
  }

  const handleDelete = async (backlinkId: string) => {
    if (!confirm('Are you sure you want to delete this backlink?')) {
      return
    }

    try {
      const response = await fetch(`/api/backlinks/${backlinkId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || 'Failed to delete backlink')
        return
      }

      loadData() // Reload to remove deleted item
    } catch (err: any) {
      alert('Error deleting backlink: ' + err.message)
    }
  }

  const getStatusBadge = (backlink: Backlink) => {
    if (!backlink.is_verified) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3" />
          Pending Verification
        </span>
      )
    }

    if (backlink.is_active) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3" />
          Active
        </span>
      )
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircle className="w-3 h-3" />
        Inactive
      </span>
    )
  }

  const getLinkTypeBadge = (linkType: string) => {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        linkType === 'dofollow' 
          ? 'bg-blue-100 text-blue-800' 
          : 'bg-gray-100 text-gray-800'
      }`}>
        {linkType}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-500" />
          <p className="text-gray-600">Loading backlinks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <div className="py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Backlink Management</h1>
              <p className="text-gray-600 mt-1">Manage your dofollow and nofollow backlinks</p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-200 transition"
            >
              <Plus className="w-5 h-5" />
              Add Backlink
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-gray-900">{backlinks.length}</div>
            <div className="text-sm text-gray-600 mt-1">Total Backlinks</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">
              {backlinks.filter(b => b.is_active && b.is_verified).length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Active</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">
              {backlinks.filter(b => b.link_type === 'dofollow' && b.is_active).length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Dofollow Active</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-gray-900">
              {backlinks.length > 0 
                ? Math.round(backlinks.reduce((sum, b) => sum + (b.uptime_percentage || 0), 0) / backlinks.length)
                : 0}%
            </div>
            <div className="text-sm text-gray-600 mt-1">Avg Uptime</div>
          </div>
        </div>

        {/* Backlinks Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {backlinks.length === 0 ? (
            <div className="p-12 text-center">
              <Link2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No backlinks yet</h3>
              <p className="text-gray-600 mb-4">Add your first backlink to start monitoring your links</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-200 transition"
              >
                <Plus className="w-5 h-5" />
                Add Backlink
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source URL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Target URL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uptime
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Checked
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {backlinks.map((backlink) => (
                    <tr key={backlink.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a
                          href={backlink.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary-500 hover:text-primary-200 flex items-center gap-1"
                        >
                          {new URL(backlink.source_url).hostname}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {backlink.target_url.length > 50 
                            ? backlink.target_url.substring(0, 50) + '...'
                            : backlink.target_url
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(backlink)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getLinkTypeBadge(backlink.link_type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {backlink.uptime_percentage.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {backlink.last_checked_at 
                          ? new Date(backlink.last_checked_at).toLocaleDateString()
                          : 'Never'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {!backlink.is_verified && (
                            <button
                              onClick={() => handleVerify(backlink.id)}
                              disabled={verifyingId === backlink.id}
                              className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                              title="Verify backlink"
                            >
                              {verifyingId === backlink.id ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => handleMonitor(backlink.id)}
                            disabled={monitoringId === backlink.id}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                            title="Check status"
                          >
                            {monitoringId === backlink.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => setSelectedBacklink(backlink)}
                            className="text-gray-600 hover:text-gray-900"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(backlink.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {(showAddForm || selectedBacklink) && (
        <BacklinkFormModal
          pitches={pitches}
          backlink={selectedBacklink}
          onClose={() => {
            setShowAddForm(false)
            setSelectedBacklink(null)
          }}
          onSuccess={() => {
            setShowAddForm(false)
            setSelectedBacklink(null)
            loadData()
          }}
        />
      )}
    </div>
  )
}

// Backlink Form Modal Component
function BacklinkFormModal({ 
  pitches, 
  backlink, 
  onClose, 
  onSuccess 
}: { 
  pitches: Pitch[]
  backlink: Backlink | null
  onClose: () => void
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    pitch_id: backlink?.pitch_id || '',
    source_url: backlink?.source_url || '',
    target_url: backlink?.target_url || '',
    anchor_text: backlink?.anchor_text || '',
    link_type: backlink?.link_type || 'dofollow',
    expires_at: backlink?.expires_at ? backlink.expires_at.split('T')[0] : '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = backlink 
        ? `/api/backlinks/${backlink.id}`
        : '/api/backlinks'
      
      const method = backlink ? 'PUT' : 'POST'

      const payload: any = {
        source_url: formData.source_url,
        target_url: formData.target_url,
        anchor_text: formData.anchor_text || null,
        link_type: formData.link_type,
      }

      if (!backlink) {
        payload.pitch_id = formData.pitch_id
      }

      if (formData.expires_at) {
        payload.expires_at = new Date(formData.expires_at).toISOString()
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Failed to save backlink')
        return
      }

      alert(data.message || 'Backlink saved successfully!')
      onSuccess()
    } catch (err: any) {
      alert('Error saving backlink: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Auto-fill target_url when pitch is selected
  useEffect(() => {
    if (formData.pitch_id && !backlink) {
      const selectedPitch = pitches.find(p => p.id === formData.pitch_id)
      if (selectedPitch) {
        setFormData(prev => ({ ...prev, target_url: selectedPitch.url }))
      }
    }
  }, [formData.pitch_id, pitches, backlink])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {backlink ? 'Edit Backlink' : 'Add New Backlink'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!backlink && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pitch *
              </label>
              <select
                value={formData.pitch_id}
                onChange={(e) => setFormData(prev => ({ ...prev, pitch_id: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select a pitch...</option>
                {pitches.map((pitch) => (
                  <option key={pitch.id} value={pitch.id}>
                    {pitch.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source URL (where the link is placed) *
            </label>
            <input
              type="url"
              value={formData.source_url}
              onChange={(e) => setFormData(prev => ({ ...prev, source_url: e.target.value }))}
              required
              placeholder="https://yoursite.com/page"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target URL (the pitch URL) *
            </label>
            <input
              type="url"
              value={formData.target_url}
              onChange={(e) => setFormData(prev => ({ ...prev, target_url: e.target.value }))}
              required
              placeholder="https://pitchmypage.com/pitch/..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Anchor Text (optional)
            </label>
            <input
              type="text"
              value={formData.anchor_text}
              onChange={(e) => setFormData(prev => ({ ...prev, anchor_text: e.target.value }))}
              placeholder="Click here"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link Type *
            </label>
            <select
              value={formData.link_type}
              onChange={(e) => setFormData(prev => ({ ...prev, link_type: e.target.value as 'dofollow' | 'nofollow' }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="dofollow">Dofollow</option>
              <option value="nofollow">Nofollow</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expires At (optional)
            </label>
            <input
              type="date"
              value={formData.expires_at}
              onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-200 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : backlink ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  )
}

