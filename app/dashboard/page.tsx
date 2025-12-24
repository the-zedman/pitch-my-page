'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Profile } from '@/lib/supabase/types'
import { 
  TrendingUp, 
  Link2, 
  MessageSquare, 
  Star, 
  Award, 
  Plus,
  Loader2,
  AlertCircle,
  Heart,
  Eye,
  Clock
} from 'lucide-react'
import { calculateLevel, getPointsForNextLevel } from '@/lib/utils'
import DashboardHeader from '@/components/DashboardHeader'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    pitches: 0,
    backlinks: 0,
    votes_received: 0,
    comments_received: 0,
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const supabase = createSupabaseClient()
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        router.push('/auth/login')
        return
      }

      // Get or create profile
      let { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // If profile doesn't exist, create it via API (bypasses RLS)
      if (profileError && profileError.code === 'PGRST116') {
        const createResponse = await fetch('/api/profiles/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            email: user.email,
            username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
          }),
        })

        if (!createResponse.ok) {
          const errorData = await createResponse.json()
          console.error('Profile creation error:', errorData)
          setError('Failed to create profile. Please contact support.')
          return
        }

        const { profile: newProfile } = await createResponse.json()
        profileData = newProfile
      } else if (profileError) {
        console.error('Profile error:', profileError)
        setError('Failed to load profile. Please try again.')
        return
      }

      if (!profileData) {
        setError('Profile not found. Please contact support.')
        return
      }

      setProfile(profileData)

      // Get stats
      const [pitchesResult, backlinksResult, commentsResult] = await Promise.all([
        supabase
          .from('pitches')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('backlinks')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_active', true),
        supabase
          .from('comments')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_deleted', false),
      ])

      setStats({
        pitches: pitchesResult.count || 0,
        backlinks: backlinksResult.count || 0,
        votes_received: profileData.points || 0, // Simplified for now
        comments_received: commentsResult.count || 0,
      })

      // Fetch recent activity
      const activityItems: any[] = []

      // Get recent pitches
      const { data: recentPitches } = await supabase
        .from('pitches')
        .select('id, title, created_at, status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (recentPitches) {
        recentPitches.forEach(pitch => {
          activityItems.push({
            type: 'pitch_submitted',
            title: 'Submitted a pitch',
            description: pitch.title,
            timestamp: pitch.created_at,
            link: `/pitches/${pitch.id}`,
            status: pitch.status,
          })
        })
      }

      // Get recent votes on user's pitches
      const { data: recentVotes } = await supabase
        .from('votes')
        .select(`
          id,
          created_at,
          vote_type,
          pitch_id,
          pitches!inner (
            id,
            title,
            user_id
          )
        `)
        .eq('pitches.user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (recentVotes) {
        recentVotes.forEach((vote: any) => {
          activityItems.push({
            type: 'vote_received',
            title: `Received an ${vote.vote_type}`,
            description: `on "${vote.pitches.title}"`,
            timestamp: vote.created_at,
            link: `/pitches/${vote.pitch_id}`,
            voteType: vote.vote_type,
          })
        })
      }

      // Get recent comments on user's pitches
      const { data: recentComments } = await supabase
        .from('comments')
        .select(`
          id,
          created_at,
          content,
          user_id,
          pitch_id,
          pitches!inner (
            id,
            title,
            user_id
          ),
          profiles!comments_user_id_fkey (
            username
          )
        `)
        .eq('pitches.user_id', user.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(10)

      if (recentComments) {
        recentComments.forEach((comment: any) => {
          const username = comment.profiles?.username || 'Someone'
          activityItems.push({
            type: 'comment_received',
            title: `${username} commented`,
            description: `on "${comment.pitches.title}"`,
            timestamp: comment.created_at,
            link: `/pitches/${comment.pitch_id}`,
            commentPreview: comment.content.substring(0, 100),
          })
        })
      }

      // Get recent backlinks added
      const { data: recentBacklinks } = await supabase
        .from('backlinks')
        .select('id, source_url, target_url, created_at, is_verified, link_type')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (recentBacklinks) {
        recentBacklinks.forEach(backlink => {
          activityItems.push({
            type: 'backlink_added',
            title: 'Added a backlink',
            description: `Monitoring ${new URL(backlink.source_url).hostname}`,
            timestamp: backlink.created_at,
            link: '/dashboard/backlinks',
            isVerified: backlink.is_verified,
            linkType: backlink.link_type,
          })
        })
      }

      // Sort all activities by timestamp and limit to 20 most recent
      activityItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setRecentActivity(activityItems.slice(0, 20))

    } catch (error) {
      console.error('Dashboard load error:', error)
    } finally {
      setLoading(false)
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
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-200"
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  const level = calculateLevel(profile.points)
  const pointsToNextLevel = getPointsForNextLevel(profile.points)
  const levelProgress = profile.points > 0 
    ? Math.min(100, ((profile.points - (Math.pow(level - 1, 2) * 100)) / (Math.pow(level, 2) * 100 - Math.pow(level - 1, 2) * 100)) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile.username || profile.email}!
          </h1>
          <p className="text-gray-600">Manage your pitches, backlinks, and track your progress</p>
        </div>

        {/* Gamification Card - Hidden for now */}
        <div className="hidden bg-gradient-to-br from-primary-500 via-primary-400 to-primary-600 rounded-lg shadow-lg p-6 mb-8 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold mb-1">Level {level}</h2>
              <p className="text-white/90 text-sm">
                {profile.points} points • {pointsToNextLevel} to next level
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{profile.current_streak || 0}</div>
              <div className="text-sm text-primary-100">Day Streak</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-3 mb-4">
            <div
              className="bg-white rounded-full h-3 transition-all"
              style={{ width: `${levelProgress}%` }}
            />
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>{profile.longest_streak || 0} day best streak</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Link2 className="w-6 h-6" />}
            title="Pitches"
            value={stats.pitches}
            link="/dashboard/pitches"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Active Backlinks"
            value={stats.backlinks}
            link="/dashboard/backlinks"
          />
          <StatCard
            icon={<Star className="w-6 h-6" />}
            title="Votes Received"
            value={stats.votes_received}
          />
          <StatCard
            icon={<MessageSquare className="w-6 h-6" />}
            title="Comments"
            value={stats.comments_received}
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/submit"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-accent-eggshell transition flex items-center gap-3"
            >
              <Plus className="w-5 h-5 text-primary-500" />
              <div>
                <div className="font-semibold">Submit a Pitch</div>
                <div className="text-sm text-gray-600">Share your content</div>
              </div>
            </Link>
            <Link
              href="/dashboard/backlinks"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-accent-eggshell transition flex items-center gap-3"
            >
              <Link2 className="w-5 h-5 text-primary-500" />
              <div>
                <div className="font-semibold">Manage Backlinks</div>
                <div className="text-sm text-gray-600">Add or monitor links</div>
              </div>
            </Link>
            <Link
              href="/gallery"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-accent-eggshell transition flex items-center gap-3"
            >
              <Star className="w-5 h-5 text-primary-500" />
              <div>
                <div className="font-semibold">Browse Gallery</div>
                <div className="text-sm text-gray-600">Discover new content</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No recent activity yet. Start by submitting your first pitch!
            </p>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <ActivityItem key={index} activity={activity} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, title, value, link }: { 
  icon: React.ReactNode
  title: string
  value: number
  link?: string
}) {
  const content = (
    <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between">
      <div>
        <div className="text-gray-600 text-sm mb-1">{title}</div>
        <div className="text-3xl font-bold text-gray-900">{value}</div>
      </div>
      <div className="text-primary-500">{icon}</div>
    </div>
  )

  if (link) {
    return <Link href={link}>{content}</Link>
  }

  return content
}

function ActivityItem({ activity }: { activity: any }) {
  const getIcon = () => {
    switch (activity.type) {
      case 'pitch_submitted':
        return <Link2 className="w-5 h-5 text-primary-500" />
      case 'vote_received':
        return <Heart className="w-5 h-5 text-red-500" />
      case 'comment_received':
        return <MessageSquare className="w-5 h-5 text-blue-500" />
      case 'backlink_added':
        return <TrendingUp className="w-5 h-5 text-green-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return 'Just now'
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} day${days !== 1 ? 's' : ''} ago`
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      })
    }
  }

  const content = (
    <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="font-medium text-gray-900">{activity.title}</p>
            <p className="text-sm text-gray-600 mt-1 truncate">{activity.description}</p>
            {activity.commentPreview && (
              <p className="text-sm text-gray-500 mt-1 italic">"{activity.commentPreview}..."</p>
            )}
          </div>
          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
            {formatTimestamp(activity.timestamp)}
          </span>
        </div>
      </div>
    </div>
  )

  if (activity.link) {
    return <Link href={activity.link}>{content}</Link>
  }

  return content
}

