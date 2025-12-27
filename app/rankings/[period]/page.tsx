'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, MessageSquare, ArrowLeft, Trophy, Calendar } from 'lucide-react'
import HeaderNav from '@/components/HeaderNav'

interface RankedPitch {
  id: string
  title: string
  favicon_url: string | null
  category: string | null
  upvotes: number
  comments_count: number
}

export default function RankingsPage() {
  const params = useParams()
  const router = useRouter()
  const period = params?.period as string
  const [pitches, setPitches] = useState<RankedPitch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (period && (period === 'week' || period === 'month')) {
      fetchRankedPitches()
    } else {
      setError('Invalid period')
      setLoading(false)
    }
  }, [period])

  const fetchRankedPitches = async () => {
    try {
      setError(null)
      setLoading(true)
      const response = await fetch(`/api/pitches/ranked?period=${period}&limit=100`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Ranked pitches error:', errorData)
        setError('Failed to load ranked pitches')
        return
      }

      const data = await response.json()
      setPitches(data.pitches || [])
    } catch (error) {
      console.error('Error fetching ranked pitches:', error)
      setError('Failed to load ranked pitches')
    } finally {
      setLoading(false)
    }
  }

  const getCategoryLabel = (category: string | null) => {
    if (!category) return 'Other'
    return category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  const getPeriodLabel = () => {
    return period === 'week' ? 'This Week' : 'This Month'
  }

  const getPeriodDescription = () => {
    return period === 'week' 
      ? 'Top ranked pitches from the past 7 days'
      : 'Top ranked pitches from the past 30 days'
  }

  if (!period || (period !== 'week' && period !== 'month')) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeaderNav />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Invalid Page</h1>
          <p className="text-gray-600 mb-8">The requested rankings page does not exist.</p>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderNav />
      
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-200 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-400 rounded-lg">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Top Ranked Pitches
              </h1>
              <p className="text-lg text-gray-600 mt-2 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {getPeriodLabel()}
              </p>
            </div>
          </div>
          
          <p className="text-gray-600 max-w-2xl">
            {getPeriodDescription()}. Rankings are based on upvotes, comments, and the length of time a pitch has held its position.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-800">Error: {error}</p>
          </div>
        )}

        {/* Rankings List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
              <p className="text-gray-600">Loading rankings...</p>
            </div>
          ) : pitches.length === 0 ? (
            <div className="text-center py-20">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No rankings yet
              </h3>
              <p className="text-gray-600 mb-6">
                {getPeriodDescription()}. Be the first to submit a pitch!
              </p>
              <Link
                href="/submit"
                className="inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-200 transition"
              >
                Submit Your Pitch
              </Link>
            </div>
          ) : (
            <ol className="divide-y divide-gray-200">
              {pitches.map((pitch, index) => (
                <li 
                  key={pitch.id} 
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <Link href={`/pitches/${pitch.id}`} className="block group">
                    <div className="flex items-center gap-6">
                      {/* Rank Number */}
                      <div className="flex-shrink-0 w-16 text-center">
                        {index === 0 ? (
                          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full">
                            <Trophy className="w-6 h-6 text-white" />
                          </div>
                        ) : index === 1 ? (
                          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full">
                            <Trophy className="w-6 h-6 text-white" />
                          </div>
                        ) : index === 2 ? (
                          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-300 to-orange-500 rounded-full">
                            <Trophy className="w-6 h-6 text-white" />
                          </div>
                        ) : (
                          <span className="text-2xl font-bold text-gray-400">
                            {index + 1}
                          </span>
                        )}
                      </div>

                      {/* Favicon */}
                      <div className="flex-shrink-0">
                        {pitch.favicon_url ? (
                          <img
                            src={pitch.favicon_url}
                            alt=""
                            className="w-12 h-12 rounded-lg border-2 border-gray-200 group-hover:border-primary-300 transition-colors"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-200 border-2 border-gray-200" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-500 transition-colors mb-2">
                          {pitch.title}
                        </h3>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                            {getCategoryLabel(pitch.category)}
                          </span>
                          <div className="flex items-center gap-4 text-gray-600">
                            <span className="flex items-center gap-2">
                              <Heart className="w-5 h-5 text-red-500" />
                              <span className="font-semibold">{pitch.upvotes || 0}</span>
                              <span className="text-sm">upvotes</span>
                            </span>
                            <span className="flex items-center gap-2">
                              <MessageSquare className="w-5 h-5 text-blue-500" />
                              <span className="font-semibold">{pitch.comments_count || 0}</span>
                              <span className="text-sm">comments</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="flex-shrink-0">
                        <ArrowLeft className="w-6 h-6 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all transform rotate-180" />
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  )
}

