import { SESClient, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-ses'

// Initialize SES client
const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'ap-southeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  const fromEmail = options.from || process.env.SES_FROM_EMAIL || 'noreply@pitchmypage.com'
  const toEmails = Array.isArray(options.to) ? options.to : [options.to]

  // SES requires verified email addresses
  // In production, ensure your "from" email is verified in SES
  const params: SendEmailCommandInput = {
    Source: fromEmail,
    Destination: {
      ToAddresses: toEmails,
    },
    Message: {
      Subject: {
        Data: options.subject,
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: options.html,
          Charset: 'UTF-8',
        },
        ...(options.text && {
          Text: {
            Data: options.text,
            Charset: 'UTF-8',
          },
        }),
      },
    },
  }

  try {
    const command = new SendEmailCommand(params)
    const response = await sesClient.send(command)
    console.log('Email sent successfully:', response.MessageId)
    return
  } catch (error: any) {
    console.error('Error sending email:', error)
    throw new Error(`Failed to send email: ${error.message}`)
  }
}

// Helper function for transactional emails
export async function sendVerificationEmail(to: string, token: string, userId: string): Promise<void> {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}&id=${userId}`
  
  await sendEmail({
    to,
    subject: 'Verify your Pitch My Page account',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">Pitch My Page</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1f2937; margin-top: 0;">Verify Your Email Address</h2>
            <p>Thanks for signing up! Please verify your email address to complete your registration.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">Verify Email</a>
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">${verificationUrl}</a>
            </p>
            <p style="color: #6b7280; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
              This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
            </p>
          </div>
        </body>
      </html>
    `,
    text: `Verify your Pitch My Page account by visiting: ${verificationUrl}`,
  })
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`
  
  await sendEmail({
    to,
    subject: 'Reset your Pitch My Page password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">Pitch My Page</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1f2937; margin-top: 0;">Reset Your Password</h2>
            <p>You requested to reset your password. Click the button below to create a new password.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">Reset Password</a>
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
            </p>
            <p style="color: #6b7280; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
              This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
            </p>
          </div>
        </body>
      </html>
    `,
    text: `Reset your password by visiting: ${resetUrl}`,
  })
}

export async function sendBacklinkAlertEmail(
  to: string,
  backlinkUrl: string,
  status: 'down' | 'changed' | 'nofollow'
): Promise<void> {
  const statusMessages = {
    down: 'is no longer accessible',
    changed: 'has changed (may be nofollow now)',
    nofollow: 'has become a nofollow link',
  }

  await sendEmail({
    to,
    subject: `Backlink Alert: ${backlinkUrl}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">Pitch My Page</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1f2937; margin-top: 0;">Backlink Alert</h2>
            <p>Your backlink at <strong>${backlinkUrl}</strong> ${statusMessages[status]}.</p>
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #92400e;">
                <strong>Action Required:</strong> Please check your backlink and update it if necessary to maintain your SEO benefits.
              </p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/backlinks" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">View Backlinks</a>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Your backlink at ${backlinkUrl} ${statusMessages[status]}. Visit ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/backlinks to manage your backlinks.`,
  })
}

export async function sendPitchSubmissionEmail(
  to: string,
  pitchTitle: string,
  pitchUrl: string,
  pitchId: string,
  userPitchCount: number,
  hasReciprocalLinks: boolean,
  userPageUrl: string
): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.pitchmypage.com'
  const pitchPageUrl = `${appUrl}/pitches/${pitchId}`
  const reVerifyUrl = `${appUrl}/dashboard/pitches`
  
  // HTML snippets for reciprocal links (display the actual HTML code)
  const pitchMyPageHtmlCode = `<a href="${appUrl}" rel="dofollow">Pitch My Page</a>`
  const appIdeasFinderHtmlCode = `<a href="https://www.appideasfinder.com" rel="dofollow">App Ideas Finder</a>`
  
  let reciprocalSection = ''
  let thankYouSection = ''
  
  if (hasReciprocalLinks && userPitchCount <= 2) {
    // Thank them for adding reciprocal links (first or second submit)
    thankYouSection = `
      <div style="background: #d1fae5; border-left: 4px solid #10b981; padding: 20px; margin: 25px 0; border-radius: 4px;">
        <p style="margin: 0; color: #065f46; font-weight: 600;">🎉 Thank you for adding reciprocal backlinks!</p>
        <p style="margin: 10px 0 0 0; color: #065f46;">Your pitch has been granted <strong>dofollow backlinks</strong> - this means maximum SEO value for your page. We really appreciate you taking the time to add those links!</p>
      </div>
    `
  } else if (!hasReciprocalLinks) {
    // Remind them to add reciprocal links
    reciprocalSection = `
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 4px;">
        <p style="margin: 0; color: #92400e; font-weight: 600;">⚡ Quick Upgrade Available!</p>
        <p style="margin: 10px 0; color: #92400e;">Your pitch currently has a <strong>NOFOLLOW</strong> link, but you can easily upgrade it to <strong>DOFOLLOW</strong> (which is much better for SEO) by adding a reciprocal link on your page.</p>
        <p style="margin: 10px 0; color: #92400e;"><strong>Here's what to do:</strong></p>
        <ol style="margin: 10px 0; padding-left: 20px; color: #92400e;">
          <li style="margin-bottom: 10px;">Add one of these HTML snippets to your page at <strong>${userPageUrl}</strong>:</li>
        </ol>
        <div style="background: #fff; padding: 15px; margin: 15px 0; border-radius: 4px; border: 1px solid #d1d5db;">
          <p style="margin: 0 0 10px 0; color: #374151; font-weight: 600; font-size: 14px;">Option 1: Link to Pitch My Page</p>
          <pre style="background: #f3f4f6; padding: 15px; border-radius: 4px; font-size: 13px; color: #1f2937; margin: 0; overflow-x: auto; font-family: 'Courier New', Courier, monospace; white-space: pre-wrap; word-wrap: break-word; border: 1px solid #e5e7eb;">${pitchMyPageHtmlCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
        </div>
        <div style="background: #fff; padding: 15px; margin: 15px 0; border-radius: 4px; border: 1px solid #d1d5db;">
          <p style="margin: 0 0 10px 0; color: #374151; font-weight: 600; font-size: 14px;">Option 2: Link to App Ideas Finder</p>
          <pre style="background: #f3f4f6; padding: 15px; border-radius: 4px; font-size: 13px; color: #1f2937; margin: 0; overflow-x: auto; font-family: 'Courier New', Courier, monospace; white-space: pre-wrap; word-wrap: break-word; border: 1px solid #e5e7eb;">${appIdeasFinderHtmlCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
        </div>
        <p style="margin: 15px 0 10px 0; color: #92400e;">2. Once you've added the link, click the button below to re-verify and upgrade your backlink to DOFOLLOW:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${reVerifyUrl}" style="display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">Re-verify & Upgrade to DOFOLLOW</a>
        </div>
        <p style="margin: 10px 0 0 0; color: #92400e; font-size: 14px;">It's that simple! Your backlink will automatically upgrade from NOFOLLOW to DOFOLLOW once we detect the reciprocal link on your page.</p>
      </div>
    `
  }

  await sendEmail({
    to,
    subject: `🎉 Your pitch "${pitchTitle}" has been submitted!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #E07A5F 0%, #3D405B 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">🎉 Pitch Submitted Successfully!</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1f2937; margin-top: 0;">Hi there!</h2>
            <p style="font-size: 16px;">We're thrilled to let you know that your pitch <strong>"${pitchTitle}"</strong> has been successfully submitted and is now live on Pitch My Page!</p>
            
            ${thankYouSection}
            ${reciprocalSection}
            
            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 4px;">
              <p style="margin: 0; color: #1e40af; font-weight: 600;">✨ What happens next?</p>
              <ul style="margin: 10px 0; padding-left: 20px; color: #1e40af;">
                <li style="margin-bottom: 8px;"><strong>Increased visibility:</strong> Your page is now discoverable by our community of creators, developers, and potential users</li>
                <li style="margin-bottom: 8px;"><strong>SEO boost:</strong> Quality backlinks from Pitch My Page help improve your search engine rankings</li>
                <li style="margin-bottom: 8px;"><strong>Community engagement:</strong> Get feedback, upvotes, and connect with like-minded creators</li>
                <li style="margin-bottom: 8px;"><strong>Traffic growth:</strong> Drive organic traffic to your page from our engaged community</li>
                <li style="margin-bottom: 8px;"><strong>Networking opportunities:</strong> Connect with other indie creators and potential collaborators</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${pitchPageUrl}" style="display: inline-block; background: #E07A5F; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 5px;">View Your Pitch</a>
              <a href="${appUrl}/dashboard/pitches" style="display: inline-block; background: #3D405B; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 5px;">Manage Pitches</a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">Thank you for being part of the Pitch My Page community! We're here to help indie creators like you get the visibility you deserve.</p>
            
            <p style="color: #6b7280; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
              Questions? Just reply to this email - we'd love to hear from you!<br>
              <br>
              Best regards,<br>
              The Pitch My Page Team
            </p>
          </div>
        </body>
      </html>
    `,
    text: `Your pitch "${pitchTitle}" has been submitted successfully! View it at ${pitchPageUrl}. ${hasReciprocalLinks && userPitchCount <= 2 ? 'Thank you for adding reciprocal backlinks!' : !hasReciprocalLinks ? 'To upgrade your backlink to DOFOLLOW, add a reciprocal link to your page and re-verify at ' + reVerifyUrl : ''}`,
  })
}


