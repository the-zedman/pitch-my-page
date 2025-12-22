import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server-api'

export async function PUT(request: NextRequest) {
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
    const { username, full_name, bio, website, avatar_url } = body

    // Validate username if provided
    if (username !== undefined) {
      if (!username || username.trim().length === 0) {
        return NextResponse.json(
          { error: 'Username cannot be empty' },
          { status: 400 }
        )
      }

      if (username.length < 3) {
        return NextResponse.json(
          { error: 'Username must be at least 3 characters' },
          { status: 400 }
        )
      }

      if (username.length > 30) {
        return NextResponse.json(
          { error: 'Username must be less than 30 characters' },
          { status: 400 }
        )
      }

      // Check for valid username format (alphanumeric, underscore, hyphen)
      if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        return NextResponse.json(
          { error: 'Username can only contain letters, numbers, underscores, and hyphens' },
          { status: 400 }
        )
      }

      // Check if username is already taken by another user
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username.trim().toLowerCase())
        .neq('id', user.id)
        .single()

      if (existingProfile) {
        return NextResponse.json(
          { error: 'Username is already taken' },
          { status: 409 }
        )
      }
    }

    // Build update object
    const updates: any = {
      updated_at: new Date().toISOString(),
    }

    if (username !== undefined) {
      updates.username = username.trim().toLowerCase()
    }
    if (full_name !== undefined) {
      updates.full_name = full_name.trim() || null
    }
    if (bio !== undefined) {
      updates.bio = bio.trim() || null
    }
    if (website !== undefined) {
      updates.website = website.trim() || null
    }
    if (avatar_url !== undefined) {
      updates.avatar_url = avatar_url.trim() || null
    }

    // Update profile
    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating profile:', updateError)
      return NextResponse.json(
        { error: 'Failed to update profile', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile,
    })
  } catch (error: any) {
    console.error('Error in profile update API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}


