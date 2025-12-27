'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, MessageSquare, ArrowRight, Loader2 } from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase/client'

interface RankedPitch {
  id: string
  title: string
  favicon_url: string | null
  category: string | null
  upvotes: number
  comments_count: number
  userVote?: 'upvote' | 'downvote' | null
}

export default function RankedPitchesSection() {
  const [weekPitches, setWeekPitches] = useState<RankedPitch[]>([])
  const [monthPitches, setMonthPitches] = useState<RankedPitch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [votingId, setVotingId] = useState<string | null>(null)

  useEffect(() => {
    fetchRankedPitches()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchRankedPitches = async () => {
    try {
      setError(null)
      const [weekRes, monthRes] = await Promise.all([
        fetch('/api/pitches/ranked?period=week&limit=10'),
        fetch('/api/pitches/ranked?period=month&limit=10'),
      ])

      let weekData: RankedPitch[] = []
      let monthData: RankedPitch[] = []

      if (weekRes.ok) {
        const data = await weekRes.json()
        weekData = data.pitches || []
      } else {
        const weekError = await weekRes.json().catch(() => ({}))
        console.error('Week pitches error:', weekError)
      }

      if (monthRes.ok) {
        const data = await monthRes.json()
        monthData = data.pitches || []
      } else {
        const monthError = await monthRes.json().catch(() => ({}))
        console.error('Month pitches error:', monthError)
      }

      // Fetch user votes for all pitches
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Fetch votes for week pitches
        const weekPitchesWithVotes = await Promise.all(
          weekData.map(async (pitch) => {
            try {
              const voteResponse = await fetch(`/api/votes?pitch_id=${pitch.id}`)
              if (voteResponse.ok) {
                const voteData = await voteResponse.json()
                return {
                  ...pitch,
                  upvotes: voteData.upvotes || pitch.upvotes || 0,
                  userVote: voteData.userVote || null,
                }
              }
            } catch (error) {
              console.error(`Error fetching votes for pitch ${pitch.id}:`, error)
            }
            return { ...pitch, userVote: null }
          })
        )

        // Fetch votes for month pitches
        const monthPitchesWithVotes = await Promise.all(
          monthData.map(async (pitch) => {
            try {
              const voteResponse = await fetch(`/api/votes?pitch_id=${pitch.id}`)
              if (voteResponse.ok) {
                const voteData = await voteResponse.json()
                return {
                  ...pitch,
                  upvotes: voteData.upvotes || pitch.upvotes || 0,
                  userVote: voteData.userVote || null,
                }
              }
            } catch (error) {
              console.error(`Error fetching votes for pitch ${pitch.id}:`, error)
            }
            return { ...pitch, userVote: null }
          })
        )

        setWeekPitches(weekPitchesWithVotes)
        setMonthPitches(monthPitchesWithVotes)
      } else {
        setWeekPitches(weekData)
        setMonthPitches(monthData)
      }
    } catch (error) {
      console.error('Error fetching ranked pitches:', error)
      setError('Failed to load ranked pitches')
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (pitchId: string, pitches: RankedPitch[], setPitches: React.Dispatch<React.SetStateAction<RankedPitch[]>>) => {
    if (votingId === pitchId) return
    
    setVotingId(pitchId)
    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pitch_id: pitchId,
          vote_type: 'upvote',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/auth/login?redirect=/'
          return
        }
        alert(data.error || 'Failed to vote')
        return
      }

      // Refresh votes for this pitch
      const voteResponse = await fetch(`/api/votes?pitch_id=${pitchId}`)
      if (voteResponse.ok) {
        const voteData = await voteResponse.json()
        setPitches((prevPitches) =>
          prevPitches.map((pitch) =>
            pitch.id === pitchId
              ? {
                  ...pitch,
                  upvotes: voteData.upvotes || pitch.upvotes || 0,
                  userVote: voteData.userVote || null,
                }
              : pitch
          )
        )
        // Also refresh the ranked pitches API to get updated counts
        fetchRankedPitches()
      }
    } catch (error: any) {
      console.error('Error voting:', error)
      alert('Failed to vote. Please try again.')
    } finally {
      setVotingId(null)
    }
  }

  const getCategoryLabel = (category: string | null) => {
    if (!category) return 'Other'
    return category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  return (
    <section className="bg-white py-16" id="ranked-pitches">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          Top Ranked Pitches
        </h2>
        
        {error && (
          <div className="text-center py-4 text-red-500 mb-4 bg-red-50 rounded p-4">
            Error: {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* This Week */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Top This Week</h3>
              <Link 
                href="/rankings/week" 
                className="text-sm text-primary-500 hover:text-primary-200 flex items-center gap-1"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : weekPitches.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No pitches this week yet</div>
            ) : (
              <ol className="space-y-2">
                {weekPitches.map((pitch, index) => (
                  <li key={pitch.id} className="flex items-center gap-3 p-2 hover:bg-white rounded transition">
                    <span className="text-lg font-bold text-gray-400 w-6 flex-shrink-0">
                      {index + 1}
                    </span>
                    {pitch.favicon_url ? (
                      <img
                        src={pitch.favicon_url}
                        alt=""
                        className="w-5 h-5 rounded flex-shrink-0"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded bg-gray-300 flex-shrink-0" />
                    )}
                    <Link 
                      href={`/pitches/${pitch.id}`}
                      className="flex-1 min-w-0 group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary-500 transition">
                            {pitch.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {getCategoryLabel(pitch.category)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 flex-shrink-0">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {pitch.upvotes || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {pitch.comments_count || 0}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* This Month */}
          <div className="bg-gray-50 rounded-lg p-6 min-h-[300px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Top This Month</h3>
              <Link 
                href="/rankings/month" 
                className="text-sm text-primary-500 hover:text-primary-200 flex items-center gap-1"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : monthPitches.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No pitches this month yet</div>
            ) : (
              <ol className="space-y-2">
                {monthPitches.map((pitch, index) => (
                  <li key={pitch.id} className="flex items-center gap-3 p-2 hover:bg-white rounded transition">
                    <span className="text-lg font-bold text-gray-400 w-6 flex-shrink-0">
                      {index + 1}
                    </span>
                    {pitch.favicon_url ? (
                      <img
                        src={pitch.favicon_url}
                        alt=""
                        className="w-5 h-5 rounded flex-shrink-0"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded bg-gray-300 flex-shrink-0" />
                    )}
                    <Link 
                      href={`/pitches/${pitch.id}`}
                      className="flex-1 min-w-0 group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary-500 transition">
                            {pitch.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {getCategoryLabel(pitch.category)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 flex-shrink-0">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {pitch.upvotes || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {pitch.comments_count || 0}
                          </span>
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
    </section>
  )
}

