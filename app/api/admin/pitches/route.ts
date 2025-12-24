import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server-api'
import { createClient } from '@supabase/supabase-js'

// GET - Get all pitches for admin management
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

    // Use service role for admin queries
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabaseAdmin
      .from('pitches')
      .select(`
        id,
        title,
        url,
        status,
        created_at,
        updated_at,
        upvotes,
        views,
        comments_count,
        profiles:user_id (
          id,
          username,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: pitches, error: pitchesError } = await query

    if (pitchesError) {
      console.error('Error fetching pitches:', pitchesError)
      return NextResponse.json(
        { error: 'Failed to fetch pitches', details: pitchesError.message },
        { status: 500 }
      )
    }

    // Get total count
    let countQuery = supabaseAdmin.from('pitches').select('*', { count: 'exact', head: true })
    if (status && status !== 'all') {
      countQuery = countQuery.eq('status', status)
    }
    const { count } = await countQuery

    return NextResponse.json({
      pitches: pitches || [],
      total: count || 0,
      limit,
      offset,
    })
  } catch (error: any) {
    console.error('Error in GET admin pitches API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

