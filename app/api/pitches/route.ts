import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server-api'
import { verifyReciprocalLinks } from '@/lib/utils/reciprocal'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { url, title, description, tags, category, thumbnail_url, source_url, has_reciprocal } = body

    // Validate required fields
    if (!url || !title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check for reciprocal backlink if provided
    let reciprocalVerified = false
    if (source_url && has_reciprocal) {
      try {
        // Verify reciprocal link exists
        const verification = await verifyReciprocalLinks(source_url)
        reciprocalVerified = verification.verified
      } catch (error) {
        console.error('Error verifying reciprocal link:', error)
        // Continue with submission even if verification fails
      }
    }

    // Check description length
    if (description.length < 100) {
      return NextResponse.json(
        { error: 'Description must be at least 100 characters' },
        { status: 400 }
      )
    }

    // Create pitch (status will be 'pending' initially)
    const { data: pitch, error: pitchError } = await supabase
      .from('pitches')
      .insert({
        user_id: user.id,
        url,
        title,
        description,
        tags: tags || [],
        category: category || 'other',
        thumbnail_url: thumbnail_url || null,
        status: 'pending', // Requires moderation
      })
      .select()
      .single()

    if (pitchError) {
      console.error('Error creating pitch:', pitchError)
      return NextResponse.json(
        { error: 'Failed to create pitch', details: pitchError.message },
        { status: 500 }
      )
    }

    // Create backlink record if reciprocal link is verified
    // This represents the backlink FROM pitchmypage.com TO the user's page
    if (reciprocalVerified && url) {
      // Get the app URL for the source (pitchmypage.com)
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.pitchmypage.com'
      const sourceUrl = `${appUrl}/pitches/${pitch.id}` // The pitch page on our site

      // Create backlink record (this will be verified and active)
      // source_url = our pitch page URL (where the backlink exists)
      // target_url = user's submitted page URL (where the link points to)
      const { error: backlinkError } = await supabase
        .from('backlinks')
        .insert({
          user_id: user.id,
          pitch_id: pitch.id,
          source_url: sourceUrl,
          target_url: url, // User's page URL
          link_type: 'dofollow', // Verified reciprocal = dofollow
          is_verified: true,
          verification_status: 'verified',
          is_active: true,
          is_reciprocal: true,
        })

      if (backlinkError) {
        console.error('Error creating reciprocal backlink:', backlinkError)
        // Don't fail the pitch submission if backlink creation fails
      }
    }

    // Award points for submission
    // TODO: Implement points transaction system
    // For now, we'll just return success

    return NextResponse.json({
      id: pitch.id,
      message: reciprocalVerified
        ? 'Pitch submitted successfully! Reciprocal backlink verified - you\'ll receive a dofollow link. It will be reviewed before going live.'
        : 'Pitch submitted successfully! Note: Without a verified reciprocal link, your pitch will receive a nofollow link. It will be reviewed before going live.',
    })
  } catch (error) {
    console.error('Error in pitches API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    
    const category = searchParams.get('category')
    const sort = searchParams.get('sort') || 'newest'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('pitches')
      .select('*')
      .eq('status', 'approved') // Only show approved pitches

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    // Apply sorting
    switch (sort) {
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      case 'most_voted':
        query = query.order('upvotes', { ascending: false })
        break
      case 'trending':
        // Trending = combination of votes and recent activity
        query = query.order('created_at', { ascending: false })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }

    query = query.range(offset, offset + limit - 1)

    const { data: pitches, error } = await query

    if (error) {
      console.error('Error fetching pitches:', error)
      return NextResponse.json(
        { error: 'Failed to fetch pitches' },
        { status: 500 }
      )
    }

    return NextResponse.json({ pitches: pitches || [] })
  } catch (error) {
    console.error('Error in GET pitches API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

