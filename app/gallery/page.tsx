'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import PitchCard from '@/components/PitchCard'
import { Pitch } from '@/lib/supabase/types'
import { Loader2, Search, Filter } from 'lucide-react'
import HeaderNav from '@/components/HeaderNav'

export default function GalleryPage() {
  const [pitches, setPitches] = useState<(Pitch & { profiles?: any })[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('newest')
  const [searchQuery, setSearchQuery] = useState('')

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
        setPitches(data.pitches || [])
      }
    } catch (error) {
      console.error('Error fetching pitches:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (pitchId: string, voteType: 'upvote') => {
    // TODO: Implement voting API
    console.log('Vote:', pitchId, voteType)
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
      <header className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-4">
        <div className="container mx-auto px-4">
          <HeaderNav />
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
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

