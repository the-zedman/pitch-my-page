import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server-api'

// POST - Create a vote (upvote or downvote)
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
    const { pitch_id, vote_type } = body

    // Validate required fields
    if (!pitch_id || !vote_type) {
      return NextResponse.json(
        { error: 'Missing required fields: pitch_id and vote_type are required' },
        { status: 400 }
      )
    }

    // Validate vote_type
    if (vote_type !== 'upvote' && vote_type !== 'downvote') {
      return NextResponse.json(
        { error: 'Invalid vote_type. Must be "upvote" or "downvote"' },
        { status: 400 }
      )
    }

    // Check if pitch exists and is approved
    const { data: pitch, error: pitchError } = await supabase
      .from('pitches')
      .select('id, status')
      .eq('id', pitch_id)
      .eq('status', 'approved')
      .single()

    if (pitchError || !pitch) {
      return NextResponse.json(
        { error: 'Pitch not found or not approved' },
        { status: 404 }
      )
    }

    // Check if user already voted on this pitch
    const { data: existingVote, error: checkError } = await supabase
      .from('votes')
      .select('id, vote_type')
      .eq('user_id', user.id)
      .eq('pitch_id', pitch_id)
      .single()

    if (existingVote) {
      // User already voted - update the vote
      if (existingVote.vote_type === vote_type) {
        // Same vote type - return existing vote
        return NextResponse.json({
          vote: existingVote,
          message: 'You have already voted this way on this pitch.',
        })
      } else {
        // Different vote type - update it
        const { data: updatedVote, error: updateError } = await supabase
          .from('votes')
          .update({ vote_type })
          .eq('id', existingVote.id)
          .select()
          .single()

        if (updateError) {
          console.error('Error updating vote:', updateError)
          return NextResponse.json(
            { error: 'Failed to update vote', details: updateError.message },
            { status: 500 }
          )
        }

        return NextResponse.json({
          vote: updatedVote,
          message: 'Vote updated successfully.',
        })
      }
    }

    // Create new vote (triggers will update pitch vote counts)
    const { data: vote, error: voteError } = await supabase
      .from('votes')
      .insert({
        user_id: user.id,
        pitch_id,
        vote_type,
      })
      .select()
      .single()

    if (voteError) {
      console.error('Error creating vote:', voteError)
      return NextResponse.json(
        { error: 'Failed to create vote', details: voteError.message },
        { status: 500 }
      )
    }

    // TODO: Award points for voting
    // TODO: Check for voting achievements/challenges

    return NextResponse.json({
      vote,
      message: 'Vote submitted successfully!',
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error in POST votes API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Remove a vote
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const pitch_id = searchParams.get('pitch_id')

    if (!pitch_id) {
      return NextResponse.json(
        { error: 'Missing required parameter: pitch_id' },
        { status: 400 }
      )
    }

    // Delete the vote (triggers will update pitch vote counts)
    const { error: deleteError } = await supabase
      .from('votes')
      .delete()
      .eq('user_id', user.id)
      .eq('pitch_id', pitch_id)

    if (deleteError) {
      console.error('Error deleting vote:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete vote', details: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Vote removed successfully.',
    })
  } catch (error: any) {
    console.error('Error in DELETE votes API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// GET - Get votes for a pitch (or check if user has voted)
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const pitch_id = searchParams.get('pitch_id')

    if (!pitch_id) {
      return NextResponse.json(
        { error: 'Missing required parameter: pitch_id' },
        { status: 400 }
      )
    }

    // Get authenticated user (optional - for checking if user has voted)
    const { data: { user } } = await supabase.auth.getUser()

    // Get vote counts for the pitch
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('vote_type')
      .eq('pitch_id', pitch_id)

    if (votesError) {
      console.error('Error fetching votes:', votesError)
      return NextResponse.json(
        { error: 'Failed to fetch votes', details: votesError.message },
        { status: 500 }
      )
    }

    const upvotes = votes?.filter(v => v.vote_type === 'upvote').length || 0
    const downvotes = votes?.filter(v => v.vote_type === 'downvote').length || 0

    // Check if current user has voted
    let userVote = null
    if (user) {
      const { data: userVoteData } = await supabase
        .from('votes')
        .select('vote_type')
        .eq('user_id', user.id)
        .eq('pitch_id', pitch_id)
        .single()

      if (userVoteData) {
        userVote = userVoteData.vote_type
      }
    }

    return NextResponse.json({
      upvotes,
      downvotes,
      total: upvotes + downvotes,
      userVote, // 'upvote', 'downvote', or null
    })
  } catch (error: any) {
    console.error('Error in GET votes API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

