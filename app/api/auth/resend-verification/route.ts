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

    const supabase = await createServerSupabaseClient()

    // Resend verification email
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.pitchmypage.com'}/auth/callback`,
      },
    })

    if (error) {
      console.error('Resend verification error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to resend verification email' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Verification email sent successfully',
    })
  } catch (error: any) {
    console.error('Resend verification API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

