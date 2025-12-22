import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import * as cheerio from 'cheerio'

// This endpoint is called by Vercel Cron daily to monitor all backlinks
// Schedule: Daily at 2 AM UTC (configured in vercel.json)
export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron
  // Vercel sends a signature header, but we can also check for a custom secret
  const cronSecret = process.env.CRON_SECRET
  
  // If CRON_SECRET is set, check for it in Authorization header or as a query param
  // Vercel Cron can pass it via query parameter: ?secret=xxx
  if (cronSecret) {
    const authHeader = request.headers.get('authorization')
    const querySecret = request.nextUrl.searchParams.get('secret')
    
    // Allow either Authorization header or query parameter
    const providedSecret = authHeader?.replace('Bearer ', '') || querySecret
    
    if (providedSecret !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    // Use service role key for admin access to all backlinks
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get all verified backlinks that need monitoring
    // Process in batches to avoid timeout
    const { data: backlinks, error: fetchError } = await supabaseAdmin
      .from('backlinks')
      .select('id, user_id, source_url, target_url, link_type, is_active, failure_count')
      .eq('is_verified', true)
      .order('last_checked_at', { ascending: true, nullsFirst: true })
      .limit(50) // Process 50 at a time to avoid timeout

    if (fetchError) {
      console.error('Error fetching backlinks for monitoring:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch backlinks', details: fetchError.message },
        { status: 500 }
      )
    }

    if (!backlinks || backlinks.length === 0) {
      return NextResponse.json({ message: 'No backlinks to monitor', checked: 0 })
    }

    let checked = 0
    let errors = 0
    const alerts: Array<{ userId: string; backlinkId: string; sourceUrl: string; type: 'nofollow' | 'down' }> = []

    // Monitor each backlink
    for (const backlink of backlinks) {
      try {
        const startTime = Date.now()
        
        // Fetch the source page
        const response = await fetch(backlink.source_url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; PitchMyPage/1.0; +https://pitchmypage.com)',
          },
          signal: AbortSignal.timeout(15000), // 15 seconds
        })

        const responseTime = Date.now() - startTime

        if (!response.ok) {
          // Page is down or inaccessible
          const wasActive = backlink.is_active
          
          const updates: any = {
            last_checked_at: new Date().toISOString(),
            is_active: false,
            failure_count: (backlink.failure_count || 0) + 1,
            last_failed_at: new Date().toISOString(),
          }

          await supabaseAdmin
            .from('backlinks')
            .update(updates)
            .eq('id', backlink.id)

          // Alert if it was previously active
          if (wasActive) {
            alerts.push({ userId: backlink.user_id, backlinkId: backlink.id, sourceUrl: backlink.source_url, type: 'down' })
          }
          
          checked++
          continue
        }

        const html = await response.text()
        const $ = cheerio.load(html)

        // Look for links to the target URL
        let linkFound = false
        let detectedLinkType: 'dofollow' | 'nofollow' | null = null

        $('a[href]').each((_, element) => {
          const href = $(element).attr('href')
          const rel = $(element).attr('rel') || ''

          if (href) {
            try {
              const linkUrl = new URL(href, backlink.source_url)
              const targetUrl = new URL(backlink.target_url)
              
              // Normalize URLs for comparison
              if (
                linkUrl.href === targetUrl.href ||
                linkUrl.href.replace(/\/$/, '') === targetUrl.href.replace(/\/$/, '') ||
                linkUrl.href.split('#')[0] === targetUrl.href.split('#')[0]
              ) {
                linkFound = true
                
                if (rel.toLowerCase().includes('nofollow')) {
                  detectedLinkType = 'nofollow'
                } else {
                  detectedLinkType = 'dofollow'
                }
                
                return false // Break the loop
              }
            } catch (urlError) {
              // Skip invalid URLs
            }
          }
        })

        // Prepare updates
        const wasActive = backlink.is_active
        const wasDofollow = backlink.link_type === 'dofollow'
        
        const updates: any = {
          last_checked_at: new Date().toISOString(),
        }

        if (linkFound) {
          updates.is_active = true
          updates.failure_count = 0
          
          // Check if link type changed from dofollow to nofollow
          if (wasDofollow && detectedLinkType === 'nofollow') {
            updates.link_type = 'nofollow'
            alerts.push({ userId: backlink.user_id, backlinkId: backlink.id, sourceUrl: backlink.source_url, type: 'nofollow' })
          } else if (detectedLinkType) {
            updates.link_type = detectedLinkType
          }
        } else {
          // Link not found - backlink removed
          updates.is_active = false
          updates.failure_count = (backlink.failure_count || 0) + 1
          updates.last_failed_at = new Date().toISOString()
          
          // Alert if it was previously active
          if (wasActive) {
            alerts.push({ userId: backlink.user_id, backlinkId: backlink.id, sourceUrl: backlink.source_url, type: 'down' })
          }
        }

        // Calculate uptime percentage
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const { data: recentLogs } = await supabaseAdmin
          .from('monitoring_logs')
          .select('check_status')
          .eq('backlink_id', backlink.id)
          .gte('checked_at', thirtyDaysAgo.toISOString())
          .order('checked_at', { ascending: false })
          .limit(100)

        if (recentLogs && recentLogs.length > 0) {
          const successfulChecks = recentLogs.filter(log => log.check_status === 'success').length
          updates.uptime_percentage = Math.round((successfulChecks / recentLogs.length) * 100 * 100) / 100
        }

        // Create monitoring log
        await supabaseAdmin
          .from('monitoring_logs')
          .insert({
            backlink_id: backlink.id,
            check_status: linkFound ? 'success' : 'failed',
            http_status_code: response.status,
            response_time_ms: responseTime,
            link_type_detected: detectedLinkType || 'none',
          })

        // Update backlink
        await supabaseAdmin
          .from('backlinks')
          .update(updates)
          .eq('id', backlink.id)

        checked++
      } catch (error: any) {
        errors++
        console.error(`Error monitoring backlink ${backlink.id}:`, error)
        
        // Update last_checked_at even on error
        await supabaseAdmin
          .from('backlinks')
          .update({ last_checked_at: new Date().toISOString() })
          .eq('id', backlink.id)
      }
    }

    // Send alert emails
    for (const alert of alerts) {
      try {
        const { data: user } = await supabaseAdmin.auth.admin.getUserById(alert.userId)
        if (user?.user?.email) {
          const { sendBacklinkAlertEmail } = await import('@/lib/email/ses')
          await sendBacklinkAlertEmail(user.user.email, alert.sourceUrl, alert.type)
        }
      } catch (emailError) {
        console.error(`Error sending alert email for backlink ${alert.backlinkId}:`, emailError)
      }
    }

    return NextResponse.json({
      message: `Monitored ${checked} backlinks successfully`,
      checked,
      errors,
      alerts: alerts.length,
      total: backlinks.length,
    })
  } catch (error: any) {
    console.error('Error in backlinks monitoring cron:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
