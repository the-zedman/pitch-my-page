import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server-api'
import { verifyReciprocalLinks } from '@/lib/utils/reciprocal'

// POST - Verify if user has added reciprocal dofollow links
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { source_url } = body

    if (!source_url) {
      return NextResponse.json(
        { error: 'source_url is required' },
        { status: 400 }
      )
    }

    // Validate URL
    try {
      new URL(source_url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Verify reciprocal links
    const { verified, verifiedCount, results } = await verifyReciprocalLinks(source_url)

    return NextResponse.json({
      verified,
      verifiedCount,
      requiredCount: 1, // At least 1 reciprocal link required
      results,
      message: verified
        ? `Great! Found ${verifiedCount} verified reciprocal dofollow link(s).`
        : 'No reciprocal dofollow links found. Please add a dofollow link to one of our sites before submitting.',
    })
  } catch (error: any) {
    console.error('Error in verify reciprocal API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

