import Link from 'next/link'
import { ThumbsUp, ThumbsDown, MessageCircle, Eye } from 'lucide-react'
import { Pitch } from '@/lib/supabase/types'
import { formatDate } from '@/lib/utils'

interface PitchCardProps {
  pitch: Pitch & {
    profiles?: {
      username: string | null
      avatar_url: string | null
    }
  }
  onVote?: (pitchId: string, voteType: 'upvote' | 'downvote') => void
  userVote?: 'upvote' | 'downvote' | null
}

export default function PitchCard({ pitch, onVote, userVote }: PitchCardProps) {
  const voteCount = pitch.upvotes - pitch.downvotes

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Thumbnail */}
      {pitch.thumbnail_url && (
        <div className="w-full h-48 bg-gray-200 overflow-hidden">
          <img
            src={pitch.thumbnail_url}
            alt={pitch.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-6">
        {/* Title */}
        <Link href={`/pitches/${pitch.id}`}>
          <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-primary-600 transition">
            {pitch.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-gray-600 mb-4 line-clamp-2">
          {pitch.description}
        </p>

        {/* Tags */}
        {pitch.tags && pitch.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {pitch.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
            {pitch.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{pitch.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Engagement Metrics */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center gap-4">
            {/* Vote Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onVote?.(pitch.id, 'upvote')}
                className={`p-2 rounded-lg transition ${
                  userVote === 'upvote'
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                aria-label="Upvote"
              >
                <ThumbsUp className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium text-gray-700 min-w-[2rem] text-center">
                {voteCount > 0 ? '+' : ''}{voteCount}
              </span>
              <button
                onClick={() => onVote?.(pitch.id, 'downvote')}
                className={`p-2 rounded-lg transition ${
                  userVote === 'downvote'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                aria-label="Downvote"
              >
                <ThumbsDown className="w-4 h-4" />
              </button>
            </div>

            {/* Comments */}
            <div className="flex items-center gap-1 text-gray-600">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{pitch.comments_count || 0}</span>
            </div>

            {/* Views */}
            <div className="flex items-center gap-1 text-gray-600">
              <Eye className="w-4 h-4" />
              <span className="text-sm">{pitch.views || 0}</span>
            </div>
          </div>

          {/* Author & Date */}
          <div className="text-sm text-gray-500">
            {pitch.profiles?.username ? (
              <>@{pitch.profiles.username}</>
            ) : (
              <>Anonymous</>
            )}
            {' • '}
            {formatDate(pitch.created_at)}
          </div>
        </div>
      </div>
    </div>
  )
}

