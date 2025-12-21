import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server-api'
import * as cheerio from 'cheerio'

// POST - Verify a backlink (check if it exists on source_url)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Fetch the backlink
    const { data: backlink, error: fetchError } = await supabase
      .from('backlinks')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !backlink) {
      return NextResponse.json(
        { error: 'Backlink not found or access denied' },
        { status: 404 }
      )
    }

    try {
      // Fetch the source page
      const response = await fetch(backlink.source_url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; PitchMyPage/1.0; +https://pitchmypage.com)',
        },
        // Set a timeout
        signal: AbortSignal.timeout(15000), // 15 seconds
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const html = await response.text()
      const $ = cheerio.load(html)

      // Look for links to the target URL
      let linkFound = false
      let detectedLinkType: 'dofollow' | 'nofollow' | null = null
      let foundAnchorText: string | null = null

      $('a[href]').each((_, element) => {
        const href = $(element).attr('href')
        const rel = $(element).attr('rel') || ''
        const anchor = $(element).text().trim()

        // Handle relative URLs and different URL formats
        const targetUrl = new URL(backlink.target_url)
        const normalizedTarget = targetUrl.href

        if (href) {
          try {
            // Handle relative URLs
            const linkUrl = new URL(href, backlink.source_url)
            
            // Compare normalized URLs (ignore trailing slashes, fragments, etc.)
            if (
              linkUrl.href === normalizedTarget ||
              linkUrl.href.replace(/\/$/, '') === normalizedTarget.replace(/\/$/, '') ||
              linkUrl.href.split('#')[0] === normalizedTarget.split('#')[0]
            ) {
              linkFound = true
              
              // Check if it's nofollow
              if (rel.toLowerCase().includes('nofollow')) {
                detectedLinkType = 'nofollow'
              } else {
                detectedLinkType = 'dofollow'
              }
              
              if (anchor && !foundAnchorText) {
                foundAnchorText = anchor
              }
            }
          } catch (urlError) {
            // Skip invalid URLs
            console.warn('Invalid URL found:', href)
          }
        }
      })

      // Update backlink based on verification result
      const updates: any = {
        verification_attempts: backlink.verification_attempts + 1,
        last_verified_at: new Date().toISOString(),
      }

      if (linkFound && detectedLinkType) {
        updates.is_verified = true
        updates.verification_status = 'verified'
        updates.is_active = true
        updates.link_type = detectedLinkType
        
        // Update anchor_text if we found one and it wasn't set
        if (foundAnchorText && !backlink.anchor_text) {
          updates.anchor_text = foundAnchorText
        }
      } else {
        updates.is_verified = false
        updates.verification_status = 'failed'
        updates.is_active = false
      }

      const { data: updatedBacklink, error: updateError } = await supabase
        .from('backlinks')
        .update(updates)
        .eq('id', params.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating backlink after verification:', updateError)
        return NextResponse.json(
          { error: 'Failed to update backlink status', details: updateError.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        backlink: updatedBacklink,
        verified: linkFound,
        linkType: detectedLinkType,
        anchorText: foundAnchorText,
        message: linkFound 
          ? `Link verified! Detected as ${detectedLinkType}.` 
          : 'Link not found on the source page. Please check that the link has been added correctly.',
      })
    } catch (fetchError: any) {
      // Update backlink with failed status
      const updates: any = {
        verification_attempts: backlink.verification_attempts + 1,
        last_verified_at: new Date().toISOString(),
        is_verified: false,
        verification_status: 'failed',
        is_active: false,
      }

      await supabase
        .from('backlinks')
        .update(updates)
        .eq('id', params.id)

      console.error('Error verifying backlink:', fetchError)
      
      return NextResponse.json(
        { 
          error: 'Failed to verify backlink',
          details: fetchError.message || 'Could not fetch the source page. Please check the URL is accessible.',
          verified: false,
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Error in verify backlink API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

