import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server-api'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { sendNewUserNotificationEmail } from '@/lib/email/ses'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, email, userId } = body

    // Use admin client to verify user exists and get user details
    const adminSupabase = createAdminSupabaseClient()
    
    let userToUse
    
    if (userId) {
      // Verify the user exists in auth.users
      const { data: authUser, error: authError } = await adminSupabase.auth.admin.getUserById(userId)
      
      if (authError || !authUser.user) {
        return NextResponse.json(
          { error: 'Invalid user ID' },
          { status: 401 }
        )
      }
      
      userToUse = { id: authUser.user.id, email: authUser.user.email || email }
    } else {
      // Try to get user from session
      const supabase = await createServerSupabaseClient(request)
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        return NextResponse.json(
          { error: 'Unauthorized - Please log in again' },
          { status: 401 }
        )
      }
      
      userToUse = user
    }
    
    // Use admin client to create profile
    return await createProfileWithAdmin(userToUse, body)
  } catch (error: any) {
    console.error('Profile creation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

async function createProfileWithAdmin(user: any, body: any) {
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

  // Send notification email to all admins
  try {
    // Get all admin users
    const { data: admins } = await adminSupabase
      .from('profiles')
      .select('email')
      .eq('role', 'admin')
      .not('email', 'is', null)

    if (admins && admins.length > 0) {
      const adminEmails = admins.map(admin => admin.email).filter(Boolean) as string[]
      
      // Send email to all admins
      await Promise.all(
        adminEmails.map(adminEmail =>
          sendNewUserNotificationEmail(
            email || user.email || '',
            username || null,
            user.id,
            new Date().toISOString()
          ).catch(err => {
            // Use admin email as recipient (sendEmail will handle it)
            console.error(`Failed to send admin notification to ${adminEmail}:`, err)
          })
        )
      )

      // Also send to the admin email addresses directly
      // We need to modify sendEmail to accept a custom recipient
      // For now, let's send one email with all admins in the to field
      if (adminEmails.length > 0) {
        const { sendEmail } = await import('@/lib/email/ses')
        await sendEmail({
          to: adminEmails,
          subject: `🆕 New User Signup: ${username || email || 'New User'}`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #E07A5F 0%, #3D405B 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                  <h1 style="color: white; margin: 0;">🆕 New User Signup</h1>
                </div>
                <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
                  <h2 style="color: #1f2937; margin-top: 0;">A new user has joined Pitch My Page!</h2>
                  
                  <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; font-weight: 600; color: #374151; width: 140px;">Username:</td>
                        <td style="padding: 8px 0; color: #1f2937;">${username ? `@${username}` : 'Not set'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-weight: 600; color: #374151;">Email:</td>
                        <td style="padding: 8px 0; color: #1f2937;">${email || user.email || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-weight: 600; color: #374151;">User ID:</td>
                        <td style="padding: 8px 0; color: #1f2937; font-family: monospace; font-size: 12px;">${user.id}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-weight: 600; color: #374151;">Signup Date:</td>
                        <td style="padding: 8px 0; color: #1f2937;">${new Date().toLocaleString()}</td>
                      </tr>
                    </table>
                  </div>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.pitchmypage.com'}/admin/users" style="display: inline-block; background: #E07A5F; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">View in Admin Dashboard</a>
                  </div>
                  
                  <p style="color: #6b7280; font-size: 14px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                    This is an automated notification from Pitch My Page.
                  </p>
                </div>
              </body>
            </html>
          `,
          text: `New user signup:\n\nUsername: ${username || 'Not set'}\nEmail: ${email || user.email || 'N/A'}\nUser ID: ${user.id}\nSignup Date: ${new Date().toLocaleString()}\n\nView in admin dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'https://www.pitchmypage.com'}/admin/users`,
        }).catch(err => {
          console.error('Failed to send admin notification email:', err)
        })
      }
    }
  } catch (emailError) {
    // Don't fail profile creation if email fails
    console.error('Error sending admin notification email:', emailError)
  }

  return NextResponse.json({
    message: 'Profile created successfully',
    profile,
  })
}

