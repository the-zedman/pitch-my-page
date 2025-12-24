import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server-api'
import * as cheerio from 'cheerio'

// POST - Monitor a backlink (check uptime and link status)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerSupabaseClient(request)
    
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
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !backlink) {
      return NextResponse.json(
        { error: 'Backlink not found or access denied' },
        { status: 404 }
      )
    }

    const startTime = Date.now()

    try {
      // Fetch the source page
      const response = await fetch(backlink.source_url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; PitchMyPage/1.0; +https://pitchmypage.com)',
        },
        signal: AbortSignal.timeout(15000), // 15 seconds
      })

      const responseTime = Date.now() - startTime

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
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

      // Create monitoring log entry
      const logData = {
        backlink_id: id,
        check_status: linkFound ? 'success' : 'failed',
        http_status_code: response.status,
        response_time_ms: responseTime,
        link_type_detected: detectedLinkType || 'none',
        check_details: {
          linkFound,
          expectedType: backlink.link_type,
          detectedType: detectedLinkType,
        },
      }

      const { error: logError } = await supabase
        .from('monitoring_logs')
        .insert(logData)

      if (logError) {
        console.error('Error creating monitoring log:', logError)
      }

      // Calculate uptime percentage (based on last 30 days of logs)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: recentLogs, error: logsError } = await supabase
        .from('monitoring_logs')
        .select('check_status')
        .eq('backlink_id', id)
        .gte('checked_at', thirtyDaysAgo.toISOString())
        .order('checked_at', { ascending: false })
        .limit(100)

      let uptimePercentage = 100.00
      if (recentLogs && recentLogs.length > 0) {
        const successfulChecks = recentLogs.filter(log => log.check_status === 'success').length
        uptimePercentage = (successfulChecks / recentLogs.length) * 100
      }

      // Update backlink status
      const updates: any = {
        last_checked_at: new Date().toISOString(),
        uptime_percentage: Math.round(uptimePercentage * 100) / 100,
      }

      if (linkFound) {
        updates.is_active = true
        updates.is_verified = true
        updates.verification_status = 'verified'
        updates.failure_count = 0
        
        // Update link_type if it changed
        if (detectedLinkType && detectedLinkType !== backlink.link_type) {
          updates.link_type = detectedLinkType
        }
      } else {
        updates.is_active = false
        updates.failure_count = (backlink.failure_count || 0) + 1
        updates.last_failed_at = new Date().toISOString()
        
        // Send alert email if backlink was previously active and is now removed
        // Check subscription tier for alert frequency
        if (backlink.is_active) {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('subscription_tier')
              .eq('id', user.id)
              .single()

            const subscriptionTier = profile?.subscription_tier || 'free'
            const lastAlertSent = backlink.last_alert_sent_at ? new Date(backlink.last_alert_sent_at) : null
            
            // Determine alert frequency: weekly for free, daily for basic, hourly for power
            let alertFrequencyMs: number
            if (subscriptionTier === 'free') {
              alertFrequencyMs = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
            } else if (subscriptionTier === 'basic') {
              alertFrequencyMs = 24 * 60 * 60 * 1000 // 1 day in milliseconds
            } else if (subscriptionTier === 'power') {
              alertFrequencyMs = 60 * 60 * 1000 // 1 hour in milliseconds
            } else {
              alertFrequencyMs = 7 * 24 * 60 * 60 * 1000 // Default to weekly
            }
            
            const shouldSendAlert = !lastAlertSent || 
              (Date.now() - lastAlertSent.getTime()) >= alertFrequencyMs

            if (shouldSendAlert) {
              const { data: { user: authUser } } = await supabase.auth.getUser()
              if (authUser?.email) {
                const { sendBacklinkAlertEmail } = await import('@/lib/email/ses')
                await sendBacklinkAlertEmail(authUser.email, backlink.source_url, 'down')
                
                // Update last_alert_sent_at
                await supabase
                  .from('backlinks')
                  .update({ last_alert_sent_at: new Date().toISOString() })
                  .eq('id', id)
              }
            }
          } catch (emailError) {
            console.error('Error sending backlink removed alert email:', emailError)
          }
        }
      }

      // Check if link type changed from dofollow to nofollow (critical alert)
      if (linkFound && backlink.link_type === 'dofollow' && detectedLinkType === 'nofollow') {
        updates.link_type = 'nofollow'
        // Send alert email about type change (check subscription tier for frequency)
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_tier')
            .eq('id', user.id)
            .single()

          const subscriptionTier = profile?.subscription_tier || 'free'
          const lastAlertSent = backlink.last_alert_sent_at ? new Date(backlink.last_alert_sent_at) : null
          
          // Determine alert frequency: weekly for free, daily for paid
          const alertFrequency = subscriptionTier === 'free' ? 7 : 1 // days
          const shouldSendAlert = !lastAlertSent || 
            (Date.now() - lastAlertSent.getTime()) >= (alertFrequency * 24 * 60 * 60 * 1000)

          if (shouldSendAlert) {
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (authUser?.email) {
              const { sendBacklinkAlertEmail } = await import('@/lib/email/ses')
              await sendBacklinkAlertEmail(authUser.email, backlink.source_url, 'nofollow')
              
              // Update last_alert_sent_at
              updates.last_alert_sent_at = new Date().toISOString()
            }
          }
        } catch (emailError) {
          console.error('Error sending nofollow alert email:', emailError)
        }
      }

      const { data: updatedBacklink, error: updateError } = await supabase
        .from('backlinks')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating backlink after monitoring:', updateError)
        return NextResponse.json(
          { error: 'Failed to update backlink status', details: updateError.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        backlink: updatedBacklink,
        monitoring: {
          status: linkFound ? 'active' : 'inactive',
          linkType: detectedLinkType,
          responseTime,
          httpStatus: response.status,
          uptimePercentage,
        },
        message: linkFound 
          ? `Link is active (${detectedLinkType}). Uptime: ${uptimePercentage.toFixed(2)}%` 
          : 'Link not found on the source page.',
      })
    } catch (fetchError: any) {
      const responseTime = Date.now() - startTime

      // Create monitoring log entry for failure
      const logData = {
        backlink_id: id,
        check_status: 'failed',
        http_status_code: null,
        response_time_ms: responseTime,
        link_type_detected: 'none',
        error_message: fetchError.message,
        check_details: {
          error: fetchError.message,
        },
      }

      await supabase
        .from('monitoring_logs')
        .insert(logData)

      // Update backlink with failed status
      const updates: any = {
        last_checked_at: new Date().toISOString(),
        is_active: false,
        failure_count: (backlink.failure_count || 0) + 1,
        last_failed_at: new Date().toISOString(),
      }

      // Recalculate uptime
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: recentLogs } = await supabase
        .from('monitoring_logs')
        .select('check_status')
        .eq('backlink_id', id)
        .gte('checked_at', thirtyDaysAgo.toISOString())
        .order('checked_at', { ascending: false })
        .limit(100)

      if (recentLogs && recentLogs.length > 0) {
        const successfulChecks = recentLogs.filter(log => log.check_status === 'success').length
        updates.uptime_percentage = Math.round((successfulChecks / recentLogs.length) * 100 * 100) / 100
      }

      // Check if backlink was previously active
      const wasActive = backlink.is_active

      await supabase
        .from('backlinks')
        .update(updates)
        .eq('id', id)

      // Send alert email if backlink was previously active and is now down
      // Check subscription tier for alert frequency
      if (wasActive) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_tier')
            .eq('id', user.id)
            .single()

          const subscriptionTier = profile?.subscription_tier || 'free'
          const lastAlertSent = backlink.last_alert_sent_at ? new Date(backlink.last_alert_sent_at) : null
          
          // Determine alert frequency: weekly for free, daily for paid
          const alertFrequency = subscriptionTier === 'free' ? 7 : 1 // days
          const shouldSendAlert = !lastAlertSent || 
            (Date.now() - lastAlertSent.getTime()) >= (alertFrequency * 24 * 60 * 60 * 1000)

          if (shouldSendAlert) {
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (authUser?.email) {
              const { sendBacklinkAlertEmail } = await import('@/lib/email/ses')
              await sendBacklinkAlertEmail(authUser.email, backlink.source_url, 'down')
              
              // Update last_alert_sent_at
              await supabase
                .from('backlinks')
                .update({ last_alert_sent_at: new Date().toISOString() })
                .eq('id', id)
            }
          }
        } catch (emailError) {
          console.error('Error sending backlink down alert email:', emailError)
        }
      }

      console.error('Error monitoring backlink:', fetchError)
      
      return NextResponse.json(
        { 
          error: 'Failed to monitor backlink',
          details: fetchError.message || 'Could not fetch the source page.',
          monitoring: {
            status: 'failed',
            responseTime,
          },
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Error in monitor backlink API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

