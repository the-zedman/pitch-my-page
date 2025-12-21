import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server-api'

// PUT - Update a backlink
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { source_url, target_url, anchor_text, link_type, expires_at } = body

    // Verify the backlink belongs to the user
    const { data: existingBacklink, error: fetchError } = await supabase
      .from('backlinks')
      .select('id, user_id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingBacklink) {
      return NextResponse.json(
        { error: 'Backlink not found or access denied' },
        { status: 404 }
      )
    }

    // Validate URLs if provided
    if (source_url) {
      try {
        new URL(source_url)
      } catch {
        return NextResponse.json(
          { error: 'Invalid source_url format' },
          { status: 400 }
        )
      }
    }

    if (target_url) {
      try {
        new URL(target_url)
      } catch {
        return NextResponse.json(
          { error: 'Invalid target_url format' },
          { status: 400 }
        )
      }
    }

    // Build update object
    const updates: any = {}
    if (source_url !== undefined) updates.source_url = source_url
    if (target_url !== undefined) updates.target_url = target_url
    if (anchor_text !== undefined) updates.anchor_text = anchor_text
    if (link_type !== undefined) updates.link_type = link_type
    if (expires_at !== undefined) {
      updates.expires_at = expires_at ? new Date(expires_at).toISOString() : null
    }

    // If source_url or target_url changed, reset verification status
    if (source_url || target_url) {
      updates.is_verified = false
      updates.verification_status = 'pending'
      updates.is_active = false
      updates.verification_attempts = 0
    }

    const { data: backlink, error: updateError } = await supabase
      .from('backlinks')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating backlink:', updateError)
      return NextResponse.json(
        { error: 'Failed to update backlink', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      backlink,
      message: 'Backlink updated successfully.',
    })
  } catch (error: any) {
    console.error('Error in PUT backlinks API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Delete a backlink
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify the backlink belongs to the user
    const { data: existingBacklink, error: fetchError } = await supabase
      .from('backlinks')
      .select('id, user_id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingBacklink) {
      return NextResponse.json(
        { error: 'Backlink not found or access denied' },
        { status: 404 }
      )
    }

    // Delete the backlink (cascade will handle monitoring_logs)
    const { error: deleteError } = await supabase
      .from('backlinks')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      console.error('Error deleting backlink:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete backlink', details: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Backlink deleted successfully.',
    })
  } catch (error: any) {
    console.error('Error in DELETE backlinks API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

