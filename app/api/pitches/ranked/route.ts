import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') // 'week' or 'month'
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!period || !['week', 'month'].includes(period)) {
      return NextResponse.json(
        { error: 'Invalid period. Must be "week" or "month"' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()
    
    // Calculate date range
    const now = new Date()
    const startDate = new Date()
    if (period === 'week') {
      startDate.setDate(now.getDate() - 7)
    } else {
      startDate.setMonth(now.getMonth() - 1)
    }

    // Fetch approved pitches (we'll calculate metrics dynamically for accuracy)
    const { data: pitches, error } = await supabase
      .from('pitches')
      .select(`
        id,
        title,
        favicon_url,
        category,
        created_at,
        updated_at
      `)
      .eq('status', 'approved')
      .gte('created_at', startDate.toISOString())
      .limit(limit * 3) // Get more to calculate and sort properly

    console.log(`[Ranked Pitches API] Period: ${period}, Found: ${pitches?.length || 0} pitches`)

    if (error) {
      console.error('Error fetching ranked pitches:', error)
      return NextResponse.json(
        { error: 'Failed to fetch ranked pitches' },
        { status: 500 }
      )
    }

    if (!pitches || pitches.length === 0) {
      return NextResponse.json({
        pitches: [],
        period,
      })
    }

    // Calculate upvotes and comments_count dynamically for each pitch
    const pitchesWithMetrics = await Promise.all(
      pitches.map(async (pitch) => {
        // Get upvote count from votes table
        const { count: upvotesCount } = await supabase
          .from('votes')
          .select('*', { count: 'exact', head: true })
          .eq('pitch_id', pitch.id)
          .eq('vote_type', 'upvote')

        // Get comments count from comments table
        const { count: commentsCount } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('pitch_id', pitch.id)
          .eq('is_deleted', false)

        return {
          ...pitch,
          upvotes: upvotesCount || 0,
          comments_count: commentsCount || 0,
        }
      })
    )

    // Sort by: upvotes (desc), then comments (desc), then longest-held rank
    // For longest-held rank, we use updated_at - older updated_at means the pitch
    // has held its current upvote count longer (hasn't been updated recently)
    const sortedPitches = pitchesWithMetrics.sort((a, b) => {
      // First: upvotes
      if (b.upvotes !== a.upvotes) {
        return b.upvotes - a.upvotes
      }
      // Second: comments
      if (b.comments_count !== a.comments_count) {
        return b.comments_count - a.comments_count
      }
      // Third: longest-held rank (older updated_at = held current rank longer)
      return new Date(a.updated_at || a.created_at).getTime() - new Date(b.updated_at || b.created_at).getTime()
    })

    // Return top N
    return NextResponse.json({
      pitches: sortedPitches.slice(0, limit),
      period,
    })
  } catch (error: any) {
    console.error('Ranked pitches error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

