import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server-api'

// POST - Increment view count for a pitch
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerSupabaseClient(request)

    // Verify pitch exists
    const { data: pitch, error: pitchError } = await supabase
      .from('pitches')
      .select('id, status')
      .eq('id', id)
      .single()

    if (pitchError || !pitch) {
      return NextResponse.json(
        { error: 'Pitch not found' },
        { status: 404 }
      )
    }

    // Only count views for approved pitches
    if (pitch.status !== 'approved') {
      return NextResponse.json({
        message: 'View not counted for unapproved pitches',
        views: 0,
      })
    }

    // Increment view count (using atomic increment to avoid race conditions)
    const { data: updatedPitch, error: updateError } = await supabase.rpc('increment_pitch_views', {
      pitch_id: id,
    })

    if (updateError) {
      // Fallback to manual increment if RPC doesn't exist
      const { data: currentPitch } = await supabase
        .from('pitches')
        .select('views')
        .eq('id', id)
        .single()

      const newViews = (currentPitch?.views || 0) + 1

      const { data: updated, error: fallbackError } = await supabase
        .from('pitches')
        .update({ views: newViews })
        .eq('id', id)
        .select('views')
        .single()

      if (fallbackError) {
        console.error('Error incrementing views:', fallbackError)
        return NextResponse.json(
          { error: 'Failed to increment views', details: fallbackError.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        views: updated.views,
        message: 'View counted successfully',
      })
    }

    // Get updated views count
    const { data: pitchData } = await supabase
      .from('pitches')
      .select('views')
      .eq('id', id)
      .single()

    return NextResponse.json({
      views: pitchData?.views || 0,
      message: 'View counted successfully',
    })
  } catch (error: any) {
    console.error('Error in POST pitch view API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

