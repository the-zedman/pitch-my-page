'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Pitch } from '@/lib/supabase/types'
import { 
  Plus, 
  Eye, 
  Edit,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
  Trash2,
  Link2
} from 'lucide-react'
import EditPitchModal from '@/components/EditPitchModal'
import DashboardHeader from '@/components/DashboardHeader'

export default function DashboardPitchesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [pitches, setPitches] = useState<Pitch[]>([])
  const [error, setError] = useState<string | null>(null)
  const [editingPitch, setEditingPitch] = useState<Pitch | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [reVerifyingId, setReVerifyingId] = useState<string | null>(null)

  useEffect(() => {
    loadPitches()
  }, [])

  const loadPitches = async () => {
    try {
      const supabase = createSupabaseClient()
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        router.push('/auth/login')
        return
      }

      // Fetch user's pitches
      const { data: pitchesData, error: pitchesError } = await supabase
        .from('pitches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (pitchesError) {
        throw pitchesError
      }

      setPitches(pitchesData || [])
    } catch (err: any) {
      console.error('Error loading pitches:', err)
      setError(err.message || 'Failed to load pitches')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (pitchId: string) => {
    if (!confirm('Are you sure you want to delete this pitch? This action cannot be undone.')) {
      return
    }

    setDeletingId(pitchId)
    try {
      const response = await fetch(`/api/pitches/${pitchId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || 'Failed to delete pitch')
        return
      }

      // Reload pitches
      loadPitches()
    } catch (err: any) {
      alert('Error deleting pitch: ' + err.message)
    } finally {
      setDeletingId(null)
    }
  }

  const handleReVerifyReciprocal = async (pitch: Pitch) => {
    setReVerifyingId(pitch.id)
    try {
      // First verify the reciprocal links on the user's page
      const verifyResponse = await fetch('/api/reciprocal/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_url: pitch.url }),
      })

      const verifyData = await verifyResponse.json()

      if (!verifyResponse.ok) {
        alert(verifyData.error || 'Failed to verify reciprocal links')
        return
      }

      if (!verifyData.verified || verifyData.verifiedCount === 0) {
        alert('No reciprocal dofollow links found. Please add dofollow links to Pitch My Page or App Ideas Finder on your page first.')
        return
      }

      // Now update the pitch to upgrade backlinks
      const response = await fetch(`/api/pitches/${pitch.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          re_verify_reciprocal: true,
          source_url: pitch.url, // The user's page URL where they added the reciprocal link
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Failed to update backlinks')
        return
      }

      alert(`Success! Found ${verifyData.verifiedCount} reciprocal dofollow link(s). Your backlink(s) have been upgraded to dofollow!`)
      loadPitches()
    } catch (err: any) {
      alert('Error re-verifying reciprocal links: ' + err.message)
    } finally {
      setReVerifyingId(null)
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
      case 'flagged':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            <AlertCircle className="w-3 h-3" />
            Flagged
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-500" />
          <p className="text-gray-600">Loading pitches...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">My Pitches</h1>
              <p className="text-gray-600 mt-1">Manage and track your submitted pitches</p>
            </div>
            <Link
              href="/submit"
              className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-200 transition"
            >
              <Plus className="w-5 h-5" />
              Submit New Pitch
            </Link>
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
            <div className="text-2xl font-bold text-gray-900">{pitches.length}</div>
            <div className="text-sm text-gray-600 mt-1">Total Pitches</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">
              {pitches.filter(p => p.status === 'approved').length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Approved</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-yellow-600">
              {pitches.filter(p => p.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Pending</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">
              {pitches.reduce((sum, p) => sum + (p.upvotes || 0), 0)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Total Upvotes</div>
          </div>
        </div>

        {/* Pitches List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {pitches.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No pitches yet</h3>
              <p className="text-gray-600 mb-4">Submit your first pitch to get started</p>
              <Link
                href="/submit"
                className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-200 transition"
              >
                <Plus className="w-5 h-5" />
                Submit Your First Pitch
              </Link>
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
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Upvotes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comments
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
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
                          <div className="text-sm font-medium text-gray-900">
                            {pitch.title}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 truncate max-w-md">
                            {pitch.description.substring(0, 100)}...
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(pitch.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pitch.upvotes}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pitch.comments_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(pitch.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/pitches/${pitch.id}`}
                            className="text-blue-600 hover:text-blue-900"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setEditingPitch(pitch)}
                            className="text-gray-600 hover:text-gray-900"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReVerifyReciprocal(pitch)}
                            disabled={reVerifyingId === pitch.id}
                            className="text-purple-600 hover:text-purple-900 disabled:opacity-50"
                            title="Re-verify reciprocal links (upgrade to dofollow)"
                          >
                            {reVerifyingId === pitch.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Link2 className="w-4 h-4" />
                            )}
                          </button>
                          {pitch.status === 'approved' && (
                            <a
                              href={pitch.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-900"
                              title="Visit site"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => handleDelete(pitch.id)}
                            disabled={deletingId === pitch.id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            title="Delete"
                          >
                            {deletingId === pitch.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
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

      {/* Edit Modal */}
      {editingPitch && (
        <EditPitchModal
          pitch={editingPitch}
          onClose={() => setEditingPitch(null)}
          onSuccess={() => {
            setEditingPitch(null)
            loadPitches()
          }}
        />
      )}
    </div>
  )
}

