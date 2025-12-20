import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()

    // Send password reset email
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.pitchmypage.com'}/auth/reset-password`
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    })

    if (error) {
      console.error('Password reset error:', error)
      // Return the actual error in development, generic message in production
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
      // Don't reveal if email exists or not (security best practice)
      return NextResponse.json({
        message: 'If an account exists with this email, a password reset link has been sent.',
      })
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

