import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server-api'
import { createClient } from '@supabase/supabase-js'

// GET - Get admin statistics
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient(request)
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Use service role for admin queries (bypasses RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Calculate time ranges
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Get total users
    const { count: totalUsers } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    // Get active users (users who have been active within the time period)
    // We'll use last_active_date from profiles, or created_at as fallback
    const [activeLastHour, activeLastDay, activeLastWeek, activeLastMonth] = await Promise.all([
      supabaseAdmin
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .or(`last_active_date.gte.${oneHourAgo.toISOString().split('T')[0]},created_at.gte.${oneHourAgo.toISOString()}`),
      supabaseAdmin
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .or(`last_active_date.gte.${oneDayAgo.toISOString().split('T')[0]},created_at.gte.${oneDayAgo.toISOString()}`),
      supabaseAdmin
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .or(`last_active_date.gte.${oneWeekAgo.toISOString().split('T')[0]},created_at.gte.${oneWeekAgo.toISOString()}`),
      supabaseAdmin
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .or(`last_active_date.gte.${oneMonthAgo.toISOString().split('T')[0]},created_at.gte.${oneMonthAgo.toISOString()}`),
    ])

    // Better approach: Check activity from auth sessions or user actions
    // For now, let's use a simpler approach - check users who have created pitches/comments/votes recently
    const activeUsersHourQuery = supabaseAdmin
      .from('pitches')
      .select('user_id', { count: 'exact' })
      .gte('created_at', oneHourAgo.toISOString())
      .union(
        supabaseAdmin.from('comments').select('user_id').gte('created_at', oneHourAgo.toISOString()).limit(1000),
        supabaseAdmin.from('votes').select('user_id').gte('created_at', oneHourAgo.toISOString()).limit(1000)
      )

    // Get pitch stats
    const [totalPitches, approvedPitches, pendingPitches, rejectedPitches] = await Promise.all([
      supabaseAdmin.from('pitches').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('pitches').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      supabaseAdmin.from('pitches').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabaseAdmin.from('pitches').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
    ])

    // Get comments and votes stats
    const [totalComments, totalVotes] = await Promise.all([
      supabaseAdmin.from('comments').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
      supabaseAdmin.from('votes').select('*', { count: 'exact', head: true }),
    ])

    // For active users, let's use a better approach - count unique user_ids from recent activity
    const getActiveUsers = async (since: Date) => {
      const [pitchesData, commentsData, votesData] = await Promise.all([
        supabaseAdmin.from('pitches').select('user_id').gte('created_at', since.toISOString()),
        supabaseAdmin.from('comments').select('user_id').gte('created_at', since.toISOString()).eq('is_deleted', false),
        supabaseAdmin.from('votes').select('user_id').gte('created_at', since.toISOString()),
      ])

      const userIds = new Set<string>()
      pitchesData.data?.forEach(p => p.user_id && userIds.add(p.user_id))
      commentsData.data?.forEach(c => c.user_id && userIds.add(c.user_id))
      votesData.data?.forEach(v => v.user_id && userIds.add(v.user_id))

      return userIds.size
    }

    const [activeUsersHour, activeUsersDay, activeUsersWeek, activeUsersMonth] = await Promise.all([
      getActiveUsers(oneHourAgo),
      getActiveUsers(oneDayAgo),
      getActiveUsers(oneWeekAgo),
      getActiveUsers(oneMonthAgo),
    ])

    return NextResponse.json({
      stats: {
        totalUsers: totalUsers || 0,
        activeUsersLastHour: activeUsersHour,
        activeUsersLastDay: activeUsersDay,
        activeUsersLastWeek: activeUsersWeek,
        activeUsersLastMonth: activeUsersMonth,
        totalPitches: totalPitches.count || 0,
        approvedPitches: approvedPitches.count || 0,
        pendingPitches: pendingPitches.count || 0,
        rejectedPitches: rejectedPitches.count || 0,
        totalComments: totalComments.count || 0,
        totalVotes: totalVotes.count || 0,
      },
    })
  } catch (error: any) {
    console.error('Error in GET admin stats API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

