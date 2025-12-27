'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { 
  Users, 
  TrendingUp, 
  MessageSquare, 
  Link2, 
  Loader2, 
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'
import DashboardHeader from '@/components/DashboardHeader'

interface AdminStats {
  totalUsers: number
  activeUsersLastHour: number
  activeUsersLastDay: number
  activeUsersLastWeek: number
  activeUsersLastMonth: number
  totalPitches: number
  approvedPitches: number
  pendingPitches: number
  rejectedPitches: number
  totalComments: number
  totalVotes: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkAdminAccess()
    loadStats()
  }, [])

  const checkAdminAccess = async () => {
    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        setError('Access denied. Admin privileges required.')
        setLoading(false)
        return
      }

      setLoading(false)
    } catch (err: any) {
      console.error('Error checking admin access:', err)
      setError('Failed to verify admin access')
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (!response.ok) {
        throw new Error('Failed to load stats')
      }
      const data = await response.json()
      setStats(data.stats)
    } catch (err: any) {
      console.error('Error loading stats:', err)
      setError('Failed to load statistics')
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
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage pitches, users, and monitor platform activity</p>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <StatCard
            icon={<Users className="w-6 h-6" />}
            title="Total Users"
            value={stats?.totalUsers || 0}
            color="blue"
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            title="Active (1h)"
            value={stats?.activeUsersLastHour || 0}
            color="green"
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            title="Active (24h)"
            value={stats?.activeUsersLastDay || 0}
            color="green"
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            title="Active (Week)"
            value={stats?.activeUsersLastWeek || 0}
            color="green"
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            title="Active (Month)"
            value={stats?.activeUsersLastMonth || 0}
            color="green"
          />
          <StatCard
            icon={<Users className="w-6 h-6" />}
            title="Total Pitches"
            value={stats?.totalPitches || 0}
            color="purple"
          />
        </div>

        {/* Pitch Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<CheckCircle className="w-6 h-6" />}
            title="Approved"
            value={stats?.approvedPitches || 0}
            color="green"
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            title="Pending"
            value={stats?.pendingPitches || 0}
            color="yellow"
          />
          <StatCard
            icon={<XCircle className="w-6 h-6" />}
            title="Rejected"
            value={stats?.rejectedPitches || 0}
            color="red"
          />
          <StatCard
            icon={<MessageSquare className="w-6 h-6" />}
            title="Total Comments"
            value={stats?.totalComments || 0}
            color="blue"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/admin/pitches"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-accent-eggshell transition"
            >
              <div className="font-semibold">Manage Pitches</div>
              <div className="text-sm text-gray-600">Approve, reject, or edit pitches</div>
            </a>
            <a
              href="/admin/blog-posts"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-accent-eggshell transition"
            >
              <div className="font-semibold">Blog Posts</div>
              <div className="text-sm text-gray-600">Create and manage blog posts</div>
            </a>
            <a
              href="/admin/users"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-accent-eggshell transition"
            >
              <div className="font-semibold">Manage Users</div>
              <div className="text-sm text-gray-600">View and manage user accounts</div>
            </a>
            <a
              href="/admin/settings"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-accent-eggshell transition"
            >
              <div className="font-semibold">Admin Settings</div>
              <div className="text-sm text-gray-600">Configure admin settings</div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, title, value, color }: { 
  icon: React.ReactNode
  title: string
  value: number
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple'
}) {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600',
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className={`${colorClasses[color]} mb-2`}>{icon}</div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value.toLocaleString()}</div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  )
}

