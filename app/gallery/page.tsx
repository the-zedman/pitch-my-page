'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import PitchCard from '@/components/PitchCard'
import { Pitch } from '@/lib/supabase/types'
import { Loader2, Search, Filter } from 'lucide-react'
import HeaderNav from '@/components/HeaderNav'

export default function GalleryPage() {
  const [pitches, setPitches] = useState<(Pitch & { profiles?: any; userVote?: 'upvote' | 'downvote' | null })[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('newest')
  const [searchQuery, setSearchQuery] = useState('')
  const [votingId, setVotingId] = useState<string | null>(null)

  useEffect(() => {
    fetchPitches()
  }, [category, sort])

  const fetchPitches = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        category,
        sort,
        limit: '20',
      })

      const response = await fetch(`/api/pitches?${params}`)
      if (response.ok) {
        const data = await response.json()
        const pitchesData = data.pitches || []
        
        // Fetch user votes for each pitch
        const pitchesWithVotes = await Promise.all(
          pitchesData.map(async (pitch: Pitch) => {
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
            return {
              ...pitch,
              upvotes: pitch.upvotes || 0,
              userVote: null,
            }
          })
        )
        
        setPitches(pitchesWithVotes)
      }
    } catch (error) {
      console.error('Error fetching pitches:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (pitchId: string, voteType: 'upvote') => {
    if (votingId === pitchId) return // Prevent double-clicking
    
    setVotingId(pitchId)
    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pitch_id: pitchId,
          vote_type: voteType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          // User not logged in - redirect to login
          window.location.href = '/auth/login?redirect=/gallery'
          return
        }
        alert(data.error || 'Failed to vote')
        return
      }

      // Update the pitch with new vote count and user vote status
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
      }
    } catch (error: any) {
      console.error('Error voting:', error)
      alert('Failed to vote. Please try again.')
    } finally {
      setVotingId(null)
    }
  }

  const filteredPitches = pitches.filter((pitch) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      pitch.title.toLowerCase().includes(query) ||
      pitch.description.toLowerCase().includes(query) ||
      pitch.tags?.some((tag) => tag.toLowerCase().includes(query))
    )
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white py-4">
        <div className="container mx-auto px-4">
          <HeaderNav variant="light" />
        </div>
      </header>
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Pitch Gallery</h1>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search pitches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="ai">AI</option>
                <option value="content">Content</option>
                <option value="dev-tools">Dev Tools</option>
                <option value="saas">SaaS</option>
                <option value="design">Design</option>
                <option value="marketing">Marketing</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="most_voted">Most Voted</option>
                <option value="trending">Trending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : filteredPitches.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">No pitches found. Be the first to submit!</p>
            <Link href="/submit" className="inline-block mt-4 bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-200">
              Submit Your First Pitch
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPitches.map((pitch) => (
              <PitchCard
                key={pitch.id}
                pitch={pitch}
                onVote={handleVote}
                userVote={pitch.userVote || null}
                isVoting={votingId === pitch.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

