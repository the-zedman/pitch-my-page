import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Get the session from cookies
    const cookieStore = await cookies()
    const supabase = createServerSupabaseClient()
    
    // Get authenticated user - try to get from session first
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session?.user) {
      // Try alternative method - get user directly
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        return NextResponse.json(
          { error: 'Unauthorized - Please log in again' },
          { status: 401 }
        )
      }
      
      // Use admin client to create profile
      return await createProfileWithAdmin(user, request)
    }
    
    // Use admin client to create profile
    return await createProfileWithAdmin(session.user, request)
  } catch (error: any) {
    console.error('Profile creation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

async function createProfileWithAdmin(user: any, request: NextRequest) {
  const body = await request.json()
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

    const body = await request.json()
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
      return NextResponse.json({
        message: 'Profile already exists',
        profile: existingProfile,
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
  } catch (error: any) {
    console.error('Profile creation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

