import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/ses'

export async function POST(request: NextRequest) {
  try {
    const { to } = await request.json()

    if (!to) {
      return NextResponse.json(
        { error: 'Email address (to) is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: 'Invalid email address format' },
        { status: 400 }
      )
    }

    // Check environment variables
    const missingVars = []
    if (!process.env.AWS_ACCESS_KEY_ID) missingVars.push('AWS_ACCESS_KEY_ID')
    if (!process.env.AWS_SECRET_ACCESS_KEY) missingVars.push('AWS_SECRET_ACCESS_KEY')
    if (!process.env.AWS_REGION) missingVars.push('AWS_REGION')
    if (!process.env.SES_FROM_EMAIL) missingVars.push('SES_FROM_EMAIL')

    if (missingVars.length > 0) {
      return NextResponse.json({
        status: 'error',
        message: 'Missing required environment variables',
        missing: missingVars,
        tests: {
          environment: '❌ Missing variables',
          variables: missingVars
        }
      }, { status: 500 })
    }

    // Send test email
    await sendEmail({
      to,
      subject: 'Test Email from Pitch My Page',
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
              <h2 style="color: #1f2937; margin-top: 0;">✅ SES Test Successful!</h2>
              <p>If you're reading this, Amazon SES is configured correctly and working!</p>
              <div style="background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #065f46;">
                  <strong>Configuration Details:</strong><br>
                  Region: ${process.env.AWS_REGION}<br>
                  From Email: ${process.env.SES_FROM_EMAIL}
                </p>
              </div>
              <p style="color: #6b7280; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                This is a test email sent from your Pitch My Page application.
              </p>
            </div>
          </body>
        </html>
      `,
      text: 'Test Email from Pitch My Page - SES is working correctly!',
    })

    return NextResponse.json({
      status: 'success',
      message: 'Test email sent successfully!',
      tests: {
        environment: '✅ All variables set',
        ses_connection: '✅ Connected',
        email_sent: '✅ Sent',
        region: process.env.AWS_REGION,
        from_email: process.env.SES_FROM_EMAIL,
      },
      note: 'Check your inbox (and spam folder) for the test email.'
    })
  } catch (error: any) {
    console.error('SES test error:', error)
    
    // Provide helpful error messages
    let errorMessage = error.message || 'Unknown error'
    let errorCode = error.Code || error.code || 'UNKNOWN'
    
    if (errorCode === 'MessageRejected') {
      errorMessage = 'Email address not verified in SES. Please verify the "from" email address in AWS SES console.'
    } else if (errorCode === 'InvalidParameterValue') {
      errorMessage = 'Invalid email address or configuration. Check your SES settings.'
    } else if (errorCode === 'AccessDenied') {
      errorMessage = 'AWS credentials do not have permission to send emails. Check IAM permissions.'
    }

    return NextResponse.json({
      status: 'error',
      message: 'Failed to send test email',
      error: errorMessage,
      error_code: errorCode,
      tests: {
        environment: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Missing',
        ses_connection: '❌ Failed',
        error: errorMessage
      },
      troubleshooting: {
        check_verified_emails: 'Ensure the "from" email is verified in SES',
        check_iam_permissions: 'Verify IAM user has SES send permissions',
        check_region: 'Confirm AWS_REGION matches your SES region',
        check_sandbox: 'If in SES sandbox, recipient email must also be verified'
      }
    }, { status: 500 })
  }
}

export async function GET() {
  // Return configuration status without sending email
  const missingVars = []
  if (!process.env.AWS_ACCESS_KEY_ID) missingVars.push('AWS_ACCESS_KEY_ID')
  if (!process.env.AWS_SECRET_ACCESS_KEY) missingVars.push('AWS_SECRET_ACCESS_KEY')
  if (!process.env.AWS_REGION) missingVars.push('AWS_REGION')
  if (!process.env.SES_FROM_EMAIL) missingVars.push('SES_FROM_EMAIL')

  return NextResponse.json({
    status: missingVars.length === 0 ? 'configured' : 'missing_vars',
    environment: {
      aws_region: process.env.AWS_REGION || 'Not set',
      ses_from_email: process.env.SES_FROM_EMAIL || 'Not set',
      aws_access_key_id: process.env.AWS_ACCESS_KEY_ID ? '✅ Set' : '❌ Missing',
      aws_secret_access_key: process.env.AWS_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Missing',
    },
    missing_variables: missingVars,
    instructions: missingVars.length > 0 
      ? 'Add missing environment variables in Vercel dashboard'
      : 'Use POST /api/test-ses with {"to": "your-email@example.com"} to send a test email'
  })
}




