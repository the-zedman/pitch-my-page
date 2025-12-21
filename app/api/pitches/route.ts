import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server-api'
import { verifyReciprocalLinks } from '@/lib/utils/reciprocal'

export async function POST(request: NextRequest) {
  try {
    // Debug: Log cookies
    const cookieHeader = request.headers.get('cookie')
    console.log('Cookies received:', cookieHeader ? 'Yes' : 'No')
    
    const supabase = await createServerSupabaseClient(request)
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Authentication error in pitches API:', {
        error: authError,
        hasCookies: !!cookieHeader,
        cookieCount: cookieHeader ? cookieHeader.split(';').length : 0,
      })
      
      // Try to get session to see if that works
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Session check:', session ? 'Found' : 'Not found')
      
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: 'Please log in to submit a pitch',
          details: authError?.message || 'No user session found',
          debug: process.env.NODE_ENV === 'development' ? {
            hasCookies: !!cookieHeader,
            authError: authError?.message,
            hasSession: !!session,
          } : undefined,
        },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { url, title, description, tags, category, thumbnail_url, source_url, verified_reciprocal_urls } = body

    // Validate required fields
    if (!url || !title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify reciprocal links if provided
    const verifiedUrls: string[] = verified_reciprocal_urls || []
    if (source_url && verifiedUrls.length > 0) {
      try {
        // Double-check verification on server side
        const verification = await verifyReciprocalLinks(source_url)
        const serverVerifiedUrls = verification.results
          .filter(r => r.found && r.isDofollow)
          .map(r => r.url)
        
        // Use intersection of client and server verified URLs
        const finalVerifiedUrls = verifiedUrls.filter(url => serverVerifiedUrls.includes(url))
        
        // Update verifiedUrls to only include server-verified ones
        verifiedUrls.length = 0
        verifiedUrls.push(...finalVerifiedUrls)
      } catch (error) {
        console.error('Error verifying reciprocal link:', error)
        // Clear verified URLs if verification fails
        verifiedUrls.length = 0
      }
    }

    // Check description length
    if (description.length < 100) {
      return NextResponse.json(
        { error: 'Description must be at least 100 characters' },
        { status: 400 }
      )
    }

    // Create pitch (auto-approved for now, admin panel coming later)
    const { data: pitch, error: pitchError } = await supabase
      .from('pitches')
      .insert({
        user_id: user.id,
        url,
        title,
        description,
        tags: tags || [],
        category: category || 'other',
        thumbnail_url: thumbnail_url || null,
        status: 'approved', // Auto-approved (admin panel for moderation coming later)
        approved_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (pitchError) {
      console.error('Error creating pitch:', pitchError)
      return NextResponse.json(
        { error: 'Failed to create pitch', details: pitchError.message },
        { status: 500 }
      )
    }

    // Create backlink records for each verified reciprocal link
    // Each verified reciprocal link = 1 dofollow backlink
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.pitchmypage.com'
    const pitchPageUrl = `${appUrl}/pitches/${pitch.id}` // The pitch page on our site
    
    let backlinksCreated = 0
    for (const reciprocalUrl of verifiedUrls) {
      try {
        // Determine which site the reciprocal link is for
        const isPitchMyPage = reciprocalUrl.includes('pitchmypage.com')
        const isAppIdeasFinder = reciprocalUrl.includes('appideasfinder.com')
        
        // Create backlink record (this will be verified and active)
        // source_url = our pitch page URL (where the backlink exists)
        // target_url = user's submitted page URL (where the link points to)
        const { error: backlinkError } = await supabase
          .from('backlinks')
          .insert({
            user_id: user.id,
            pitch_id: pitch.id,
            source_url: pitchPageUrl,
            target_url: url, // User's page URL
            link_type: 'dofollow', // Verified reciprocal = dofollow
            is_verified: true,
            verification_status: 'verified',
            is_active: true,
            is_reciprocal: true,
          })

        if (!backlinkError) {
          backlinksCreated++
        } else {
          console.error('Error creating reciprocal backlink:', backlinkError)
        }
      } catch (error) {
        console.error('Error creating backlink for', reciprocalUrl, error)
      }
    }

    // Award points for submission
    // TODO: Implement points transaction system
    // For now, we'll just return success

    const message = backlinksCreated > 0
      ? `Pitch submitted successfully! ${backlinksCreated} reciprocal dofollow backlink(s) created. It will be reviewed before going live.`
      : 'Pitch submitted successfully! Note: Without verified reciprocal links, your pitch will receive a nofollow link. It will be reviewed before going live.'

    return NextResponse.json({
      id: pitch.id,
      message: backlinksCreated > 0
        ? `Pitch submitted successfully! ${backlinksCreated} reciprocal dofollow backlink(s) created. Your pitch is now live!`
        : 'Pitch submitted successfully! Note: Without verified reciprocal links, your pitch will receive a nofollow link. You can add reciprocal links later and re-verify. Your pitch is now live!',
      backlinksCreated,
    })
  } catch (error) {
    console.error('Error in pitches API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient(request)
    const { searchParams } = new URL(request.url)
    
    const category = searchParams.get('category')
    const sort = searchParams.get('sort') || 'newest'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('pitches')
      .select('*')
      .eq('status', 'approved') // Only show approved pitches

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    // Apply sorting
    switch (sort) {
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      case 'most_voted':
        query = query.order('upvotes', { ascending: false })
        break
      case 'trending':
        // Trending = combination of votes and recent activity
        query = query.order('created_at', { ascending: false })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }

    query = query.range(offset, offset + limit - 1)

    const { data: pitches, error } = await query

    if (error) {
      console.error('Error fetching pitches:', error)
      return NextResponse.json(
        { error: 'Failed to fetch pitches' },
        { status: 500 }
      )
    }

    return NextResponse.json({ pitches: pitches || [] })
  } catch (error) {
    console.error('Error in GET pitches API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

