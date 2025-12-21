'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Copy, RefreshCw, AlertCircle, ExternalLink, Code } from 'lucide-react'

interface ReciprocalVerification {
  verified: boolean
  verifiedCount: number
  requiredCount: number
  results: Array<{
    url: string
    found: boolean
    isDofollow: boolean
    anchorText?: string
    error?: string
  }>
  message: string
}

interface ReciprocalLinkSectionProps {
  sourceUrl: string | undefined
  onVerificationChange: (verified: boolean) => void
}

export default function ReciprocalLinkSection({ 
  sourceUrl, 
  onVerificationChange 
}: ReciprocalLinkSectionProps) {
  const [htmlCode, setHtmlCode] = useState<string>('')
  const [loadingHtml, setLoadingHtml] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [verification, setVerification] = useState<ReciprocalVerification | null>(null)
  const [copied, setCopied] = useState(false)

  // Load HTML code on mount
  useEffect(() => {
    loadHtmlCode()
  }, [])

  // Notify parent when verification status changes
  useEffect(() => {
    if (verification) {
      onVerificationChange(verification.verified)
    }
  }, [verification, onVerificationChange])

  const loadHtmlCode = async () => {
    setLoadingHtml(true)
    try {
      const response = await fetch('/api/reciprocal/html?type=both')
      const data = await response.json()
      if (data.both) {
        setHtmlCode(data.both)
      }
    } catch (error) {
      console.error('Failed to load HTML code:', error)
    } finally {
      setLoadingHtml(false)
    }
  }

  const handleVerify = async () => {
    if (!sourceUrl) {
      alert('Please enter your page URL first')
      return
    }

    setVerifying(true)
    try {
      const response = await fetch('/api/reciprocal/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_url: sourceUrl }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Verification failed')
        return
      }

      setVerification(data)
    } catch (error: any) {
      alert('Error verifying reciprocal links: ' + error.message)
    } finally {
      setVerifying(false)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 space-y-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Free Reciprocal Backlinks
          </h3>
          <p className="text-sm text-gray-700 mb-4">
            To get a <strong>dofollow backlink</strong> for your pitch submission, you need to add a 
            dofollow link to <strong>Pitch My Page</strong> or <strong>App Ideas Finder</strong> on your site.
            If you don't add a reciprocal link, your pitch will receive a <strong>nofollow</strong> link instead.
          </p>
        </div>
      </div>

      {/* HTML Code Section */}
      <div className="bg-white rounded-lg border border-blue-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Code className="w-4 h-4" />
            Copy this HTML code to your page:
          </label>
          {loadingHtml && (
            <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
          )}
        </div>
        <div className="relative">
          <pre className="bg-gray-50 border border-gray-200 rounded p-3 text-sm overflow-x-auto">
            <code>{htmlCode || 'Loading...'}</code>
          </pre>
          {htmlCode && (
            <button
              type="button"
              onClick={() => handleCopy(htmlCode)}
              className="absolute top-2 right-2 p-1.5 bg-gray-100 hover:bg-gray-200 rounded transition"
              title="Copy to clipboard"
            >
              {copied ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-gray-600" />
              )}
            </button>
          )}
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Add this link to the same page you're submitting. Make sure it's a <strong>dofollow</strong> link 
          (or don't add rel="nofollow").
        </p>
      </div>

      {/* Verification Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">
            Verify Reciprocal Links
          </label>
          <button
            type="button"
            onClick={handleVerify}
            disabled={!sourceUrl || verifying}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {verifying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Verify Reciprocal Backlinks
              </>
            )}
          </button>
        </div>

        {verification && (
          <div className={`rounded-lg p-4 border-2 ${
            verification.verified
              ? 'bg-green-50 border-green-200'
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-start gap-3">
              {verification.verified ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className={`font-medium mb-2 ${
                  verification.verified ? 'text-green-800' : 'text-yellow-800'
                }`}>
                  {verification.message}
                </p>
                
                {/* Detailed Results */}
                <div className="space-y-2 mt-3">
                  {verification.results.map((result, index) => (
                    <div key={index} className="text-sm">
                      <div className="flex items-center gap-2">
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                        >
                          {new URL(result.url).hostname}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        {result.found && result.isDofollow && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3" />
                            Dofollow Found
                          </span>
                        )}
                        {result.found && !result.isDofollow && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <AlertCircle className="w-3 h-3" />
                            Nofollow (needs to be dofollow)
                          </span>
                        )}
                        {!result.found && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <XCircle className="w-3 h-3" />
                            Not Found
                          </span>
                        )}
                      </div>
                      {result.anchorText && (
                        <p className="text-xs text-gray-600 mt-1 ml-5">
                          Anchor text: "{result.anchorText}"
                        </p>
                      )}
                      {result.error && (
                        <p className="text-xs text-red-600 mt-1 ml-5">
                          Error: {result.error}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {!verification.verified && (
                  <div className="mt-3 p-3 bg-yellow-100 rounded border border-yellow-300">
                    <p className="text-sm text-yellow-900">
                      <strong>Note:</strong> Your pitch submission will receive a <strong>nofollow</strong> link 
                      if you don't add a reciprocal dofollow link. Add the HTML code above to your page and 
                      verify again.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {!verification && sourceUrl && (
          <p className="text-sm text-gray-600 mt-2">
            Click "Verify Reciprocal Backlinks" to check if you've added the required links to your page.
          </p>
        )}
      </div>
    </div>
  )
}

