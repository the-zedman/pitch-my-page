'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react'

export default function TestPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const runTest = async () => {
    setLoading(true)
    setResults(null)
    
    try {
      const response = await fetch('/api/test-supabase')
      const data = await response.json()
      setResults(data)
    } catch (error: any) {
      setResults({
        status: 'error',
        message: 'Failed to run test',
        error: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    if (status === '✅') return <CheckCircle className="w-5 h-5 text-green-500 inline" />
    if (status === '❌') return <XCircle className="w-5 h-5 text-red-500 inline" />
    if (status === '⚠️') return <AlertCircle className="w-5 h-5 text-yellow-500 inline" />
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-2">Supabase Connection Test</h1>
          <p className="text-gray-600 mb-6">
            Test your Supabase configuration and database setup
          </p>

          <button
            onClick={runTest}
            disabled={loading}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mb-8"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Testing...
              </>
            ) : (
              'Run Supabase Test'
            )}
          </button>

          {results && (
            <div className="space-y-6">
              {/* Status Banner */}
              <div className={`p-4 rounded-lg ${
                results.status === 'success' 
                  ? 'bg-green-50 border border-green-200' 
                  : results.status === 'partial'
                  ? 'bg-yellow-50 border border-yellow-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-start gap-3">
                  {results.status === 'success' ? (
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : results.status === 'partial' ? (
                    <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h2 className="font-semibold text-lg mb-1">{results.message}</h2>
                    {results.details && (
                      <p className="text-sm text-gray-600">
                        Profiles in database: {results.details.profiles_in_db}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Test Results */}
              {results.tests && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Test Results</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {Object.entries(results.tests).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {key.replace(/_/g, ' ')}:
                        </span>
                        <span className="flex items-center gap-2">
                          {typeof value === 'string' && value.match(/[✅❌⚠️]/) ? (
                            <>
                              {getStatusIcon(value.match(/[✅❌⚠️]/)?.[0] || '')}
                              <span className="text-sm">{value}</span>
                            </>
                          ) : (
                            <span className="text-sm text-gray-600">{String(value)}</span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Environment Variables */}
              {results.environment && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Environment Variables</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {Object.entries(results.environment).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                        <span className="text-sm font-medium text-gray-700">
                          {key.replace(/_/g, ' ').toUpperCase()}:
                        </span>
                        <span className="flex items-center gap-2">
                          {getStatusIcon(value.match(/[✅❌⚠️]/)?.[0] || '')}
                          <span className="text-sm">{value}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {results.recommendation && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Next Steps</h3>
                  <p className="text-sm text-blue-800">{results.recommendation}</p>
                </div>
              )}

              {/* Error Details */}
              {results.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-900 mb-2">Error Details</h3>
                  <pre className="text-xs text-red-800 overflow-auto">
                    {JSON.stringify(results.error, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="font-semibold mb-3">What this test checks:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✅ Supabase connection and credentials</li>
              <li>✅ Database table accessibility</li>
              <li>✅ Authentication service availability</li>
              <li>✅ Environment variables configuration</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

