import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server-api'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, email, userId } = body

    // Use admin client to verify user exists and get user details
    const adminSupabase = createAdminSupabaseClient()
    
    let userToUse
    
    if (userId) {
      // Verify the user exists in auth.users
      const { data: authUser, error: authError } = await adminSupabase.auth.admin.getUserById(userId)
      
      if (authError || !authUser.user) {
        return NextResponse.json(
          { error: 'Invalid user ID' },
          { status: 401 }
        )
      }
      
      userToUse = { id: authUser.user.id, email: authUser.user.email || email }
    } else {
      // Try to get user from session
      const supabase = await createServerSupabaseClient()
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        return NextResponse.json(
          { error: 'Unauthorized - Please log in again' },
          { status: 401 }
        )
      }
      
      userToUse = user
    }
    
    // Use admin client to create profile
    return await createProfileWithAdmin(userToUse, body)
  } catch (error: any) {
    console.error('Profile creation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

async function createProfileWithAdmin(user: any, body: any) {
  const { username, email } = body

  // Use admin client to bypass RLS
  const adminSupabase = createAdminSupabaseClient()

  // Check if profile already exists
  const { data: existingProfile } = await adminSupabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (existingProfile) {
    // Return existing profile
    const { data: fullProfile } = await adminSupabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    return NextResponse.json({
      message: 'Profile already exists',
      profile: fullProfile,
    })
  }

  // Create profile using admin client
  const { data: profile, error: profileError } = await adminSupabase
    .from('profiles')
    .insert({
      id: user.id,
      email: email || user.email,
      username: username || user.email?.split('@')[0] || 'user',
      points: 10, // Welcome bonus
      level: 1,
    })
    .select()
    .single()

  if (profileError) {
    console.error('Profile creation error:', profileError)
    return NextResponse.json(
      { error: 'Failed to create profile', details: profileError.message },
      { status: 500 }
    )
  }

  return NextResponse.json({
    message: 'Profile created successfully',
    profile,
  })
}

