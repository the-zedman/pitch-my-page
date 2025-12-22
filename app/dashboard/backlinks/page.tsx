'use client'

import React, { useEffect, useState } from 'react'
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
import BacklinkFormModal from '@/components/BacklinkFormModal'

export default function BacklinksPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [backlinks, setBacklinks] = useState<Backlink[]>([])
  const [pitches, setPitches] = useState<Pitch[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedBacklink, setSelectedBacklink] = useState<Backlink | null>(null)
  const [checkingId, setCheckingId] = useState<string | null>(null)
  const [checkingAll, setCheckingAll] = useState(false)

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
      const backlinksRes = await fetch('/api/backlinks', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!backlinksRes.ok) {
        const errorData = await backlinksRes.json().catch(() => ({}))
        console.error('Backlinks API error:', errorData)
        throw new Error(errorData.error || 'Failed to load backlinks')
      }
      const { backlinks: backlinksData } = await backlinksRes.json()
      setBacklinks(backlinksData || [])
    } catch (err: any) {
      console.error('Error loading data:', err)
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleCheck = async (backlinkId: string) => {
    setCheckingId(backlinkId)
    try {
      const response = await fetch(`/api/backlinks/${backlinkId}/monitor`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Check failed')
        return
      }

      // Silently update - no alert for individual checks
      loadData() // Reload to show updated status
    } catch (err: any) {
      alert('Error checking backlink: ' + err.message)
    } finally {
      setCheckingId(null)
    }
  }

  const handleCheckAll = async () => {
    if (backlinks.length === 0) return
    
    setCheckingAll(true)
    let successCount = 0
    let failCount = 0

    try {
      // Check all backlinks sequentially
      for (const backlink of backlinks) {
        try {
          const response = await fetch(`/api/backlinks/${backlink.id}/monitor`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          })

          if (response.ok) {
            successCount++
          } else {
            failCount++
          }
        } catch (err) {
          failCount++
        }
      }

      // Reload data to show updated "Last Checked" times
      await loadData()
      
      alert(`Checked ${backlinks.length} backlink(s). ${successCount} successful, ${failCount} failed.`)
    } catch (err: any) {
      alert('Error checking all backlinks: ' + err.message)
    } finally {
      setCheckingAll(false)
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
            <div className="flex items-center gap-3">
              {backlinks.length > 0 && (
                <button
                  onClick={handleCheckAll}
                  disabled={checkingAll}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkingAll ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5" />
                      Check All
                    </>
                  )}
                </button>
              )}
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-200 transition"
              >
                <Plus className="w-5 h-5" />
                Add Backlink
              </button>
            </div>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {backlink.last_checked_at 
                          ? new Date(backlink.last_checked_at).toLocaleString('en-US', { 
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit', 
                              minute: '2-digit',
                              hour12: true
                            })
                          : 'Never'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleCheck(backlink.id)}
                            disabled={checkingId === backlink.id || checkingAll}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                            title="Check backlink status"
                          >
                            {checkingId === backlink.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <RefreshCw className="w-4 h-4" />
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
      </div>

      {/* Add/Edit Form Modal */}
      {(showAddForm || selectedBacklink) && (
        <BacklinkFormModal
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
