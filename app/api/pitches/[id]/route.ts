import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server-api'
import { verifyReciprocalLinks } from '@/lib/utils/reciprocal'

// PUT - Update a pitch
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { url, title, description, tags, category, thumbnail_url, source_url, re_verify_reciprocal } = body

    // Verify the pitch belongs to the user
    const { data: existingPitch, error: fetchError } = await supabase
      .from('pitches')
      .select('id, user_id, url')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingPitch) {
      return NextResponse.json(
        { error: 'Pitch not found or access denied' },
        { status: 404 }
      )
    }

    // Build update object
    const updates: any = {}
    if (url !== undefined) updates.url = url
    if (title !== undefined) updates.title = title
    if (description !== undefined) updates.description = description
    if (tags !== undefined) updates.tags = tags
    if (category !== undefined) updates.category = category
    if (thumbnail_url !== undefined) updates.thumbnail_url = thumbnail_url

    // If re-verifying reciprocal links
    if (re_verify_reciprocal && source_url) {
      try {
        const verification = await verifyReciprocalLinks(source_url)
        const verifiedUrls = verification.results
          .filter(r => r.found && r.isDofollow)
          .map(r => r.url)

        if (verifiedUrls.length > 0) {
          // Find existing backlinks for this pitch
          const { data: existingBacklinks } = await supabase
            .from('backlinks')
            .select('*')
            .eq('pitch_id', params.id)
            .eq('is_reciprocal', true)

          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.pitchmypage.com'
          const pitchPageUrl = `${appUrl}/pitches/${params.id}`

          // Update or create backlinks for verified reciprocal URLs
          // Create one backlink per verified reciprocal URL
          for (const reciprocalUrl of verifiedUrls) {
            // Check if we already have a backlink for this pitch
            const existingBacklink = existingBacklinks?.find(
              b => b.source_url === pitchPageUrl && b.target_url === existingPitch.url
            )

            if (existingBacklink) {
              // Update existing backlink to dofollow
              await supabase
                .from('backlinks')
                .update({
                  link_type: 'dofollow',
                  is_verified: true,
                  verification_status: 'verified',
                  is_active: true,
                  last_verified_at: new Date().toISOString(),
                  verification_attempts: (existingBacklink.verification_attempts || 0) + 1,
                })
                .eq('id', existingBacklink.id)
            } else {
              // Create new backlink (one per verified reciprocal URL)
              await supabase
                .from('backlinks')
                .insert({
                  user_id: user.id,
                  pitch_id: params.id,
                  source_url: pitchPageUrl,
                  target_url: existingPitch.url,
                  link_type: 'dofollow',
                  is_verified: true,
                  verification_status: 'verified',
                  is_active: true,
                  is_reciprocal: true,
                  verification_attempts: 1,
                  last_verified_at: new Date().toISOString(),
                })
            }
          }

          // If we had existing backlinks but none match the verified URLs, we could optionally
          // mark old ones as inactive, but for now we'll just create/update the verified ones
        }
      } catch (error) {
        console.error('Error re-verifying reciprocal links:', error)
        // Don't fail the update if verification fails
      }
    }

    const { data: pitch, error: updateError } = await supabase
      .from('pitches')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating pitch:', updateError)
      return NextResponse.json(
        { error: 'Failed to update pitch', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      pitch,
      message: 'Pitch updated successfully.',
    })
  } catch (error: any) {
    console.error('Error in PUT pitches API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Delete a pitch
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verify the pitch belongs to the user
    const { data: existingPitch, error: fetchError } = await supabase
      .from('pitches')
      .select('id, user_id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingPitch) {
      return NextResponse.json(
        { error: 'Pitch not found or access denied' },
        { status: 404 }
      )
    }

    // Delete the pitch (cascade will handle related records like backlinks, votes, comments)
    const { error: deleteError } = await supabase
      .from('pitches')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      console.error('Error deleting pitch:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete pitch', details: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Pitch deleted successfully.',
    })
  } catch (error: any) {
    console.error('Error in DELETE pitches API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

