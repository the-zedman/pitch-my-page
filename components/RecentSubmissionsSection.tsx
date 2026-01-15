'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'

interface RecentPitch {
  id: string
  title: string
  description: string
  thumbnail_url: string | null
  tags: string[]
}

export default function RecentSubmissionsSection() {
  const [pitches, setPitches] = useState<RecentPitch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRecentPitches()
  }, [])

  const fetchRecentPitches = async () => {
    try {
      setError(null)
      const response = await fetch('/api/pitches?status=approved&sort=newest&limit=6')
      
      if (!response.ok) {
        throw new Error('Failed to fetch recent pitches')
      }

      const data = await response.json()
      setPitches(data.pitches || [])
    } catch (error: any) {
      console.error('Error fetching recent pitches:', error)
      setError('Failed to load recent submissions')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="bg-white py-16" id="recent-submissions">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          Most Recent Submissions
        </h2>
        
        {error && (
          <div className="text-center py-4 text-red-500 mb-4 bg-red-50 rounded p-4">
            Error: {error}
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : pitches.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No recent submissions yet
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {pitches.map((pitch) => (
              <Link
                key={pitch.id}
                href={`/pitches/${pitch.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow group"
              >
                {/* Thumbnail Image */}
                {pitch.thumbnail_url ? (
                  <div className="w-full h-48 bg-gray-200 overflow-hidden">
                    <img
                      src={pitch.thumbnail_url}
                      alt={pitch.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                    <span className="text-4xl text-primary-400">📄</span>
                  </div>
                )}

                <div className="p-6">
                  {/* Title/Heading */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-500 transition">
                    {pitch.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
                    {pitch.description}
                  </p>

                  {/* Tags */}
                  {pitch.tags && pitch.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {pitch.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-accent-eggshell text-primary-400 text-xs rounded-full font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                      {pitch.tags.length > 4 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{pitch.tags.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
