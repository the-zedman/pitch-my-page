import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server-api'
import { createClient } from '@supabase/supabase-js'

// Helper function to check admin access
async function checkAdminAccess(request: NextRequest) {
  const supabase = await createServerSupabaseClient(request)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { error: 'Unauthorized', status: 401, user: null }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Forbidden - Admin access required', status: 403, user: null }
  }

  return { error: null, status: null, user }
}

// PUT - Update pitch status (approve/reject/etc)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const adminCheck = await checkAdminAccess(request)
    
    if (adminCheck.error) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      )
    }

    const body = await request.json()
    const { status, quality_score, spam_score } = body

    // Validate status
    if (status && !['pending', 'approved', 'rejected', 'flagged'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Use service role for admin updates
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const updates: any = {}
    if (status) {
      updates.status = status
      if (status === 'approved') {
        updates.approved_at = new Date().toISOString()
      }
    }
    if (quality_score !== undefined) updates.quality_score = quality_score
    if (spam_score !== undefined) updates.spam_score = spam_score

    const { data: pitch, error: updateError } = await supabaseAdmin
      .from('pitches')
      .update(updates)
      .eq('id', id)
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
    console.error('Error in PUT admin pitches API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Delete a pitch (admin can delete any pitch)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const adminCheck = await checkAdminAccess(request)
    
    if (adminCheck.error) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      )
    }

    // Use service role for admin deletes
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error: deleteError } = await supabaseAdmin
      .from('pitches')
      .delete()
      .eq('id', id)

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
    console.error('Error in DELETE admin pitches API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

