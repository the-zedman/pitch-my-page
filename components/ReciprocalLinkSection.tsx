'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Copy, RefreshCw, AlertCircle, ExternalLink, Code } from 'lucide-react'

interface ReciprocalResult {
  url: string
  found: boolean
  isDofollow: boolean
  anchorText?: string
  error?: string
}

interface ReciprocalVerification {
  verified: boolean
  verifiedCount: number
  results: ReciprocalResult[]
  message: string
}

interface ReciprocalLinkSectionProps {
  sourceUrl: string | undefined
  onVerificationChange: (verifiedLinks: string[]) => void // Pass array of verified URLs
}

const RECIPROCAL_LINKS = [
  {
    name: 'Pitch My Page',
    url: 'https://www.pitchmypage.com',
    html: '<a href="https://www.pitchmypage.com" rel="dofollow">Pitch My Page</a>',
  },
  {
    name: 'App Ideas Finder',
    url: 'https://www.appideasfinder.com',
    html: '<a href="https://www.appideasfinder.com" rel="dofollow">App Ideas Finder</a>',
  },
]

export default function ReciprocalLinkSection({ 
  sourceUrl, 
  onVerificationChange 
}: ReciprocalLinkSectionProps) {
  const [verifying, setVerifying] = useState(false)
  const [verification, setVerification] = useState<ReciprocalVerification | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  // Notify parent when verification status changes
  useEffect(() => {
    if (verification) {
      const verifiedUrls = verification.results
        .filter(r => r.found && r.isDofollow)
        .map(r => r.url)
      onVerificationChange(verifiedUrls)
    }
  }, [verification, onVerificationChange])

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

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const getResultForUrl = (url: string): ReciprocalResult | undefined => {
    return verification?.results.find(r => r.url === url)
  }

  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 space-y-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Free Reciprocal Backlinks (2 Available)
          </h3>
          <p className="text-sm text-gray-700 mb-1">
            Add dofollow links to our sites on your page to get <strong>dofollow backlinks</strong> for your pitch.
            Each verified reciprocal link = <strong>1 dofollow backlink</strong>.
          </p>
          <p className="text-xs text-gray-600 mt-2">
            You can add both links on one page, or add them on different pages. Each verified link gives you one dofollow backlink.
            If you don't add any reciprocal links, your pitch will receive a <strong>nofollow</strong> link instead.
          </p>
        </div>
      </div>

      {/* Two Separate Link Sections */}
      <div className="space-y-4">
        {RECIPROCAL_LINKS.map((link, index) => {
          const result = getResultForUrl(link.url)
          const isVerified = result?.found && result?.isDofollow
          const isNofollow = result?.found && !result?.isDofollow
          const notFound = result && !result.found

          return (
            <div key={link.url} className="bg-white rounded-lg border-2 border-blue-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-900">{link.name}</h4>
                  {isVerified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3" />
                      Verified - 1 Dofollow Backlink
                    </span>
                  )}
                  {isNofollow && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <AlertCircle className="w-3 h-3" />
                      Found but Nofollow
                    </span>
                  )}
                  {notFound && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      <XCircle className="w-3 h-3" />
                      Not Found
                    </span>
                  )}
                </div>
              </div>

              {/* HTML Code */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Code className="w-3 h-3" />
                  HTML Code:
                </label>
                <div className="relative">
                  <pre className="bg-gray-50 border border-gray-200 rounded p-2 text-xs overflow-x-auto">
                    <code>{link.html}</code>
                  </pre>
                  <button
                    type="button"
                    onClick={() => handleCopy(link.html, index)}
                    className="absolute top-1.5 right-1.5 p-1 bg-gray-100 hover:bg-gray-200 rounded transition"
                    title="Copy to clipboard"
                  >
                    {copiedIndex === index ? (
                      <CheckCircle className="w-3 h-3 text-green-600" />
                    ) : (
                      <Copy className="w-3 h-3 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Status Details */}
              {result && (
                <div className="text-xs space-y-1">
                  {result.anchorText && (
                    <p className="text-gray-600">
                      Anchor text: <span className="font-mono">"{result.anchorText}"</span>
                    </p>
                  )}
                  {result.error && (
                    <p className="text-red-600">Error: {result.error}</p>
                  )}
                  {isNofollow && (
                    <p className="text-yellow-700">
                      ⚠️ Link found but it's nofollow. Remove <code className="bg-yellow-100 px-1 rounded">rel="nofollow"</code> to get your dofollow backlink.
                    </p>
                  )}
                </div>
              )}

              {!result && (
                <p className="text-xs text-gray-600">
                  Add this link to your page and verify to get 1 dofollow backlink.
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Verification Button */}
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
            verification.verifiedCount > 0
              ? 'bg-green-50 border-green-200'
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-start gap-3">
              {verification.verifiedCount > 0 ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className={`font-medium mb-2 ${
                  verification.verifiedCount > 0 ? 'text-green-800' : 'text-yellow-800'
                }`}>
                  {verification.message}
                </p>
                {verification.verifiedCount > 0 && (
                  <p className="text-sm text-green-700 mb-2">
                    ✅ You'll receive <strong>{verification.verifiedCount} dofollow backlink(s)</strong> for this pitch submission.
                  </p>
                )}
                {verification.verifiedCount === 0 && (
                  <div className="mt-3 p-3 bg-yellow-100 rounded border border-yellow-300">
                    <p className="text-sm text-yellow-900">
                      <strong>Note:</strong> Your pitch submission will receive a <strong>nofollow</strong> link 
                      if you don't add at least one reciprocal dofollow link. Add the HTML code above to your page and 
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
            Click "Verify Reciprocal Backlinks" to check if you've added the links to your page.
          </p>
        )}
      </div>
    </div>
  )
}
