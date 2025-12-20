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
  LogOut,
  Settings,
  Loader2
} from 'lucide-react'
import { calculateLevel, getPointsForNextLevel } from '@/lib/utils'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState({
    pitches: 0,
    backlinks: 0,
    votes_received: 0,
    comments_received: 0,
  })

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

      // Get profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Profile error:', profileError)
        router.push('/auth/login')
        return
      }

      setProfile(profileData)

      // Get stats
      const [pitchesResult, backlinksResult] = await Promise.all([
        supabase
          .from('pitches')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('backlinks')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_active', true),
      ])

      setStats({
        pitches: pitchesResult.count || 0,
        backlinks: backlinksResult.count || 0,
        votes_received: profileData.points || 0, // Simplified for now
        comments_received: 0, // TODO: Calculate from comments
      })

    } catch (error) {
      console.error('Dashboard load error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    const supabase = createSupabaseClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!profile) {
    return null
  }

  const level = calculateLevel(profile.points)
  const pointsToNextLevel = getPointsForNextLevel(profile.points)
  const levelProgress = profile.points > 0 
    ? Math.min(100, ((profile.points - (Math.pow(level - 1, 2) * 100)) / (Math.pow(level, 2) * 100 - Math.pow(level - 1, 2) * 100)) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              Pitch My Page
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/submit"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Submit Pitch
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile.username || profile.email}!
          </h1>
          <p className="text-gray-600">Manage your pitches, backlinks, and track your progress</p>
        </div>

        {/* Gamification Card */}
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg shadow-lg p-6 mb-8 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold mb-1">Level {level}</h2>
              <p className="text-primary-100 text-sm">
                {profile.points} points • {pointsToNextLevel} to next level
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{profile.current_streak || 0}</div>
              <div className="text-sm text-primary-100">Day Streak</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-primary-400 rounded-full h-3 mb-4">
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
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition flex items-center gap-3"
            >
              <Plus className="w-5 h-5 text-primary-600" />
              <div>
                <div className="font-semibold">Submit a Pitch</div>
                <div className="text-sm text-gray-600">Share your content</div>
              </div>
            </Link>
            <Link
              href="/dashboard/backlinks"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition flex items-center gap-3"
            >
              <Link2 className="w-5 h-5 text-primary-600" />
              <div>
                <div className="font-semibold">Manage Backlinks</div>
                <div className="text-sm text-gray-600">Add or monitor links</div>
              </div>
            </Link>
            <Link
              href="/gallery"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition flex items-center gap-3"
            >
              <Star className="w-5 h-5 text-primary-600" />
              <div>
                <div className="font-semibold">Browse Gallery</div>
                <div className="text-sm text-gray-600">Discover new content</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity (Placeholder) */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <p className="text-gray-500 text-center py-8">
            No recent activity yet. Start by submitting your first pitch!
          </p>
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
      <div className="text-primary-600">{icon}</div>
    </div>
  )

  if (link) {
    return <Link href={link}>{content}</Link>
  }

  return content
}

