'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseClient } from '@/lib/supabase/client'
import {
  CheckCircle,
  Clock,
  XCircle,
  Trash2,
  Eye,
  Loader2,
  AlertCircle,
  Filter
} from 'lucide-react'
import DashboardHeader from '@/components/DashboardHeader'

interface Pitch {
  id: string
  title: string
  url: string
  status: string
  created_at: string
  updated_at: string
  upvotes: number
  views: number
  comments_count: number
  profiles: {
    id: string
    username: string | null
    email: string | null
  } | null
}

export default function AdminPitchesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [pitches, setPitches] = useState<Pitch[]>([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    checkAdminAccess()
    loadPitches()
  }, [statusFilter])

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

  const loadPitches = async () => {
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        limit: '100',
      })
      const response = await fetch(`/api/admin/pitches?${params}`)
      if (!response.ok) {
        throw new Error('Failed to load pitches')
      }
      const data = await response.json()
      setPitches(data.pitches || [])
    } catch (err: any) {
      console.error('Error loading pitches:', err)
      setError('Failed to load pitches')
    }
  }

  const handleStatusChange = async (pitchId: string, newStatus: string) => {
    setUpdatingId(pitchId)
    try {
      const response = await fetch(`/api/admin/pitches/${pitchId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || 'Failed to update pitch status')
        return
      }

      loadPitches()
    } catch (err: any) {
      console.error('Error updating pitch:', err)
      alert('Failed to update pitch status')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (pitchId: string) => {
    if (!confirm('Are you sure you want to delete this pitch? This action cannot be undone.')) {
      return
    }

    setDeletingId(pitchId)
    try {
      const response = await fetch(`/api/admin/pitches/${pitchId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || 'Failed to delete pitch')
        return
      }

      loadPitches()
    } catch (err: any) {
      console.error('Error deleting pitch:', err)
      alert('Failed to delete pitch')
    } finally {
      setDeletingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3" />
            Approved
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        )
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Pitches</h1>
              <p className="text-gray-600">Approve, reject, or delete pitches</p>
            </div>
            <Link
              href="/admin"
              className="text-primary-500 hover:text-primary-200"
            >
              ← Back to Admin Dashboard
            </Link>
          </div>
        </div>

        {/* Status Filter */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Pitches Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {pitches.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600">No pitches found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stats
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pitches.map((pitch) => (
                    <tr key={pitch.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <Link
                            href={`/pitches/${pitch.id}`}
                            className="text-sm font-medium text-primary-500 hover:text-primary-200"
                          >
                            {pitch.title}
                          </Link>
                          <div className="text-xs text-gray-500 mt-1 truncate max-w-md">
                            {pitch.url}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pitch.profiles?.username ? (
                          <>@{pitch.profiles.username}</>
                        ) : (
                          <span className="text-gray-400">Anonymous</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(pitch.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>↑ {pitch.upvotes || 0}</div>
                        <div>👁 {pitch.views || 0}</div>
                        <div>💬 {pitch.comments_count || 0}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(pitch.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {pitch.status !== 'approved' && (
                            <button
                              onClick={() => handleStatusChange(pitch.id, 'approved')}
                              disabled={updatingId === pitch.id}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                              title="Approve"
                            >
                              {updatingId === pitch.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          {pitch.status !== 'rejected' && (
                            <button
                              onClick={() => handleStatusChange(pitch.id, 'rejected')}
                              disabled={updatingId === pitch.id}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              title="Reject"
                            >
                              {updatingId === pitch.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <XCircle className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          <Link
                            href={`/pitches/${pitch.id}`}
                            className="text-blue-600 hover:text-blue-900"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(pitch.id)}
                            disabled={deletingId === pitch.id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            title="Delete"
                          >
                            {deletingId === pitch.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
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
  )
}

