import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server-api'

// GET - Fetch user's backlinks
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

    const { searchParams } = new URL(request.url)
    const pitchId = searchParams.get('pitch_id')
    const status = searchParams.get('status') // active, inactive, all

    let query = supabase
      .from('backlinks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (pitchId) {
      query = query.eq('pitch_id', pitchId)
    }

    if (status && status !== 'all') {
      if (status === 'active') {
        query = query.eq('is_active', true)
      } else if (status === 'inactive') {
        query = query.eq('is_active', false)
      }
    }

    const { data: backlinks, error } = await query

    if (error) {
      console.error('Error fetching backlinks:', error)
      return NextResponse.json(
        { error: 'Failed to fetch backlinks', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ backlinks: backlinks || [] })
  } catch (error: any) {
    console.error('Error in GET backlinks API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Create a new backlink
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { pitch_id, source_url, target_url, anchor_text, link_type, expires_at } = body

    // Validate required fields
    if (!pitch_id || !source_url || !target_url) {
      return NextResponse.json(
        { error: 'Missing required fields: pitch_id, source_url, and target_url are required' },
        { status: 400 }
      )
    }

    // Validate URLs
    try {
      new URL(source_url)
      new URL(target_url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Verify the pitch belongs to the user
    const { data: pitch, error: pitchError } = await supabase
      .from('pitches')
      .select('id, user_id')
      .eq('id', pitch_id)
      .eq('user_id', user.id)
      .single()

    if (pitchError || !pitch) {
      return NextResponse.json(
        { error: 'Pitch not found or access denied' },
        { status: 404 }
      )
    }

    // Check for duplicate (source_url + target_url combination)
    const { data: existing } = await supabase
      .from('backlinks')
      .select('id')
      .eq('source_url', source_url)
      .eq('target_url', target_url)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'A backlink with this source and target URL already exists' },
        { status: 409 }
      )
    }

    // Create backlink (starts as unverified and inactive until verification)
    const { data: backlink, error: backlinkError } = await supabase
      .from('backlinks')
      .insert({
        user_id: user.id,
        pitch_id,
        source_url,
        target_url,
        anchor_text: anchor_text || null,
        link_type: link_type || 'dofollow',
        is_verified: false,
        verification_status: 'pending',
        is_active: false, // Will be set to true after verification
        expires_at: expires_at ? new Date(expires_at).toISOString() : null,
      })
      .select()
      .single()

    if (backlinkError) {
      console.error('Error creating backlink:', backlinkError)
      return NextResponse.json(
        { error: 'Failed to create backlink', details: backlinkError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      backlink,
      message: 'Backlink created. Please verify it to activate monitoring.',
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error in POST backlinks API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

