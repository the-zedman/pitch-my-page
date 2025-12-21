import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server-api'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient(request)

    // Send password reset email
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.pitchmypage.com'}/auth/reset-password`
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    })

    if (error) {
      console.error('Password reset error:', error)
      console.error('Redirect URL:', redirectUrl)
      // Return error details to help debug
      return NextResponse.json(
        { 
          error: error.message,
          details: 'Make sure the redirect URL is added to Supabase allowed redirect URLs',
          redirectUrl: redirectUrl
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'If an account exists with this email, a password reset link has been sent.',
    })
  } catch (error: any) {
    console.error('Password reset API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

