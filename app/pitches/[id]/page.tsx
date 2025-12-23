'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Pitch } from '@/lib/supabase/types'
import { 
  ArrowLeft, 
  ExternalLink, 
  Calendar, 
  Tag, 
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react'
import HeaderNav from '@/components/HeaderNav'
import CommentsSection from '@/components/CommentsSection'

export default function PitchDetailPage() {
  const params = useParams()
  const router = useRouter()
  const pitchId = params.id as string
  
  const [pitch, setPitch] = useState<Pitch | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPitch()
    incrementView()
  }, [pitchId])

  const incrementView = async () => {
    try {
      // Increment view count (fire and forget, don't wait for response)
      fetch(`/api/pitches/${pitchId}/view`, {
        method: 'POST',
      }).catch(error => {
        console.error('Error incrementing view:', error)
        // Silently fail - don't interrupt user experience
      })
    } catch (error) {
      // Silently fail
      console.error('Error incrementing view:', error)
    }
  }

  const loadPitch = async () => {
    try {
      const supabase = createSupabaseClient()
      
      const { data, error: fetchError } = await supabase
        .from('pitches')
        .select('*, profiles(username, avatar_url)')
        .eq('id', pitchId)
        .single()

      if (fetchError) {
        throw fetchError
      }

      if (!data) {
        throw new Error('Pitch not found')
      }

      setPitch(data)
    } catch (err: any) {
      console.error('Error loading pitch:', err)
      setError(err.message || 'Failed to load pitch')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4" />
            Approved
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-4 h-4" />
            Pending Review
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <AlertCircle className="w-4 h-4" />
            Rejected
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-500" />
          <p className="text-gray-600">Loading pitch...</p>
        </div>
      </div>
    )
  }

  if (error || !pitch) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pitch Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The pitch you\'re looking for doesn\'t exist or has been removed.'}</p>
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-200 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Gallery
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-4">
        <div className="container mx-auto px-4">
          <HeaderNav />
        </div>
      </header>
      <div className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Button */}
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Gallery
          </Link>

        {/* Pitch Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Thumbnail */}
          {pitch.thumbnail_url && (
            <div className="w-full min-h-64 bg-gray-200 flex items-center justify-center">
              <img
                src={pitch.thumbnail_url}
                alt={pitch.title}
                className="max-w-full max-h-96 object-contain"
              />
            </div>
          )}

          <div className="p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{pitch.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <a
                    href={pitch.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary-500 hover:text-primary-200"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Visit Site
                  </a>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(pitch.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
              {getStatusBadge(pitch.status)}
            </div>

            {/* Description */}
            <div className="prose max-w-none mb-6">
              <p className="text-gray-700 text-lg leading-relaxed">{pitch.description}</p>
            </div>

            {/* Tags */}
            {pitch.tags && pitch.tags.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Tags:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {pitch.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-accent-eggshell text-primary-400 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Category */}
            {pitch.category && (
              <div className="mb-6">
                <span className="text-sm font-medium text-gray-700">Category: </span>
                <span className="text-sm text-gray-600 capitalize">
                  {pitch.category.replace('-', ' ')}
                </span>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div>
                <div className="text-2xl font-bold text-gray-900">{pitch.upvotes || 0}</div>
                <div className="text-sm text-gray-600">Upvotes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{pitch.comments_count || 0}</div>
                <div className="text-sm text-gray-600">Comments</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{pitch.views}</div>
                <div className="text-sm text-gray-600">Views</div>
              </div>
            </div>

            {/* Success Message */}
            {pitch.status === 'pending' && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Thank you for your submission!</strong> Your pitch is pending review and will be published once approved.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <CommentsSection pitchId={pitchId} />
        </div>
      </div>
    </div>
  )
}

