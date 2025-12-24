import Link from 'next/link'
import { Heart, MessageSquare, Eye, Rocket } from 'lucide-react'
import { Pitch } from '@/lib/supabase/types'
import { formatDate } from '@/lib/utils'

interface PitchCardProps {
  pitch: Pitch & {
    profiles?: {
      username: string | null
      avatar_url: string | null
    }
  }
  onVote?: (pitchId: string, voteType: 'upvote') => void
  userVote?: 'upvote' | 'downvote' | null
  isVoting?: boolean
}

export default function PitchCard({ pitch, onVote, userVote, isVoting }: PitchCardProps) {
  const voteCount = pitch.upvotes || 0
  const hasVoted = userVote === 'upvote'

  const handleVoteClick = () => {
    if (isVoting) return // Prevent double-clicking
    onVote?.(pitch.id, 'upvote')
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Thumbnail */}
      {pitch.thumbnail_url && (
        <Link href={`/pitches/${pitch.id}`}>
          <div className="w-full min-h-48 bg-gray-200 overflow-hidden flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity">
            <img
              src={pitch.thumbnail_url}
              alt={pitch.title}
              className="max-w-full max-h-96 object-contain"
            />
          </div>
        </Link>
      )}

      <div className="p-6">
        {/* Launch Status Badge */}
        {(pitch as any).launch_status === 'launching_soon' && (
          <div className="mb-3">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <Rocket className="w-3 h-3" />
              Launching Soon
              {(pitch as any).launch_date && (
                <span className="ml-1">
                  {new Date((pitch as any).launch_date).toLocaleDateString()}
                </span>
              )}
            </span>
          </div>
        )}

        {/* Title */}
        <Link href={`/pitches/${pitch.id}`}>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-primary-500 transition">
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
                className="px-2 py-1 bg-accent-eggshell text-primary-400 text-xs rounded-full"
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
            {/* Upvote Button */}
            <button
              onClick={handleVoteClick}
              disabled={isVoting}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                hasVoted
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
              } ${isVoting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              aria-label="Upvote"
            >
              <Heart className={`w-4 h-4 ${hasVoted ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{voteCount}</span>
            </button>

            {/* Comments */}
            <Link
              href={`/pitches/${pitch.id}#comments`}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition border border-transparent"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm font-medium">{pitch.comments_count || 0}</span>
            </Link>

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

