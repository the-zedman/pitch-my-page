'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Loader2, Mail, Send } from 'lucide-react'

export default function TestSESPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [configStatus, setConfigStatus] = useState<any>(null)
  const [testResults, setTestResults] = useState<any>(null)

  const checkConfig = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-ses')
      const data = await response.json()
      setConfigStatus(data)
    } catch (error: any) {
      setConfigStatus({
        status: 'error',
        message: 'Failed to check configuration',
        error: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const sendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    setTestResults(null)
    
    try {
      const response = await fetch('/api/test-ses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email }),
      })
      const data = await response.json()
      setTestResults(data)
    } catch (error: any) {
      setTestResults({
        status: 'error',
        message: 'Failed to send test email',
        error: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h1 className="text-3xl font-bold mb-2">Amazon SES Test</h1>
          <p className="text-gray-600 mb-6">
            Test your Amazon SES email configuration
          </p>

          <button
            onClick={checkConfig}
            disabled={loading}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mb-6"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Mail className="w-5 h-5" />
                Check Configuration
              </>
            )}
          </button>

          {configStatus && (
            <div className={`p-4 rounded-lg mb-6 ${
              configStatus.status === 'configured' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <h3 className="font-semibold mb-3">Configuration Status</h3>
              <div className="space-y-2 text-sm">
                {Object.entries(configStatus.environment || {}).map(([key, value]: [string, any]) => (
                  <div key={key} className="flex justify-between">
                    <span className="font-medium">{key.replace(/_/g, ' ').toUpperCase()}:</span>
                    <span>{String(value)}</span>
                  </div>
                ))}
              </div>
              {configStatus.missing_variables && configStatus.missing_variables.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-800">
                    <strong>Missing variables:</strong> {configStatus.missing_variables.join(', ')}
                  </p>
                </div>
              )}
            </div>
          )}

          <form onSubmit={sendTestEmail} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Send Test Email To
              </label>
              <div className="flex gap-2">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your-email@example.com"
                  required
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="bg-primary-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Test
                    </>
                  )}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Note: In SES sandbox mode, the recipient email must also be verified in AWS SES.
              </p>
            </div>
          </form>

          {testResults && (
            <div className={`mt-6 p-4 rounded-lg ${
              testResults.status === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-start gap-3">
                {testResults.status === 'success' ? (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">{testResults.message}</h3>
                  
                  {testResults.tests && (
                    <div className="space-y-1 text-sm mb-4">
                      {Object.entries(testResults.tests).map(([key, value]: [string, any]) => (
                        <div key={key} className="flex justify-between">
                          <span className="font-medium">{key.replace(/_/g, ' ')}:</span>
                          <span>{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {testResults.troubleshooting && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm font-semibold mb-2">Troubleshooting:</p>
                      <ul className="text-xs space-y-1">
                        {Object.entries(testResults.troubleshooting).map(([key, value]: [string, any]) => (
                          <li key={key}>• {String(value)}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {testResults.note && (
                    <p className="text-sm text-gray-600 mt-2">{testResults.note}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-semibold mb-4">Required Environment Variables</h2>
          <div className="space-y-2 text-sm font-mono bg-gray-50 p-4 rounded">
            <div>AWS_ACCESS_KEY_ID=your-access-key</div>
            <div>AWS_SECRET_ACCESS_KEY=your-secret-key</div>
            <div>AWS_REGION=ap-southeast-2</div>
            <div>SES_FROM_EMAIL=noreply@yourdomain.com</div>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Add these in your Vercel project settings → Environment Variables
          </p>
        </div>
      </div>
    </div>
  )
}

