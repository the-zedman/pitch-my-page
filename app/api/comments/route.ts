import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server-api'

// GET - Get comments for a pitch
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient(request)
    const { searchParams } = new URL(request.url)
    const pitch_id = searchParams.get('pitch_id')

    if (!pitch_id) {
      return NextResponse.json(
        { error: 'Missing required parameter: pitch_id' },
        { status: 400 }
      )
    }

    // Verify pitch exists and is approved
    const { data: pitch, error: pitchError } = await supabase
      .from('pitches')
      .select('id, status')
      .eq('id', pitch_id)
      .single()

    if (pitchError || !pitch) {
      return NextResponse.json(
        { error: 'Pitch not found' },
        { status: 404 }
      )
    }

    if (pitch.status !== 'approved') {
      return NextResponse.json(
        { error: 'Pitch is not approved' },
        { status: 403 }
      )
    }

    // Get comments with user profiles (top-level comments only, no threading for now)
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        is_edited,
        created_at,
        updated_at,
        upvotes,
        profiles:user_id (
          id,
          username,
          avatar_url
        )
      `)
      .eq('pitch_id', pitch_id)
      .is('parent_id', null) // Only top-level comments for now
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    if (commentsError) {
      console.error('Error fetching comments:', commentsError)
      return NextResponse.json(
        { error: 'Failed to fetch comments', details: commentsError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      comments: comments || [],
      count: comments?.length || 0,
    })
  } catch (error: any) {
    console.error('Error in GET comments API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Create a new comment
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
    const { pitch_id, content, parent_id } = body

    // Validate required fields
    if (!pitch_id || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: pitch_id and content are required' },
        { status: 400 }
      )
    }

    // Validate content length
    if (content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment content cannot be empty' },
        { status: 400 }
      )
    }

    // Verify pitch exists and is approved
    const { data: pitch, error: pitchError } = await supabase
      .from('pitches')
      .select('id, status')
      .eq('id', pitch_id)
      .single()

    if (pitchError || !pitch) {
      return NextResponse.json(
        { error: 'Pitch not found' },
        { status: 404 }
      )
    }

    if (pitch.status !== 'approved') {
      return NextResponse.json(
        { error: 'Cannot comment on unapproved pitches' },
        { status: 403 }
      )
    }

    // If parent_id is provided, verify it exists and belongs to the same pitch
    if (parent_id) {
      const { data: parentComment, error: parentError } = await supabase
        .from('comments')
        .select('id, pitch_id')
        .eq('id', parent_id)
        .single()

      if (parentError || !parentComment || parentComment.pitch_id !== pitch_id) {
        return NextResponse.json(
          { error: 'Invalid parent comment' },
          { status: 400 }
        )
      }
    }

    // Create comment (triggers will update pitch comments_count)
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .insert({
        user_id: user.id,
        pitch_id,
        content: content.trim(),
        parent_id: parent_id || null,
      })
      .select(`
        id,
        content,
        is_edited,
        created_at,
        updated_at,
        upvotes,
        profiles:user_id (
          id,
          username,
          avatar_url
        )
      `)
      .single()

    if (commentError) {
      console.error('Error creating comment:', commentError)
      return NextResponse.json(
        { error: 'Failed to create comment', details: commentError.message },
        { status: 500 }
      )
    }

    // TODO: Award points for commenting
    // TODO: Check for commenting achievements/challenges

    return NextResponse.json({
      comment,
      message: 'Comment created successfully!',
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error in POST comments API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

