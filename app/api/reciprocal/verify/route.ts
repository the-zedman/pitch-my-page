import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server-api'
import { verifyReciprocalLinks } from '@/lib/utils/reciprocal'

// POST - Verify if user has added reciprocal dofollow links
// Note: This doesn't require authentication - anyone can verify if links exist on a page
export async function POST(request: NextRequest) {
  try {
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
      requiredCount: 0, // Optional - user can submit without reciprocal links (will get nofollow)
      results,
      message: verified
        ? `Great! Found ${verifiedCount} verified reciprocal dofollow link(s). You'll receive ${verifiedCount} dofollow backlink(s) for this pitch.`
        : 'No reciprocal dofollow links found. You can still submit, but your pitch will receive a nofollow link. Add dofollow links to get dofollow backlinks.',
    })
  } catch (error: any) {
    console.error('Error in verify reciprocal API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

