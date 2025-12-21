import * as cheerio from 'cheerio'

// Reciprocal backlink URLs
export const RECIPROCAL_URLS = [
  'https://www.pitchmypage.com',
  'https://www.appideasfinder.com',
]

export interface ReciprocalVerificationResult {
  url: string
  found: boolean
  isDofollow: boolean
  anchorText?: string
  error?: string
}

/**
 * Verify if a source URL contains dofollow links to reciprocal URLs
 */
export async function verifyReciprocalLinks(sourceUrl: string): Promise<{
  verified: boolean
  verifiedCount: number
  results: ReciprocalVerificationResult[]
}> {
  const results: ReciprocalVerificationResult[] = []

  // Check each reciprocal URL
  for (const reciprocalUrl of RECIPROCAL_URLS) {
    try {
      // Fetch the source page
      const response = await fetch(sourceUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; PitchMyPage/1.0; +https://pitchmypage.com)',
        },
        signal: AbortSignal.timeout(15000), // 15 seconds timeout
      })

      if (!response.ok) {
        results.push({
          url: reciprocalUrl,
          found: false,
          isDofollow: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        })
        continue
      }

      const html = await response.text()
      const $ = cheerio.load(html)

      let found = false
      let isDofollow = false
      let anchorText: string | undefined

      // Look for links to the reciprocal URL
      $('a[href]').each((_, element) => {
        const href = $(element).attr('href')
        const rel = $(element).attr('rel') || ''
        const anchor = $(element).text().trim()

        if (href) {
          try {
            // Handle relative URLs
            const linkUrl = new URL(href, sourceUrl)
            const targetUrl = new URL(reciprocalUrl)

            // Normalize URLs for comparison
            const linkHref = linkUrl.href.replace(/\/$/, '')
            const targetHref = targetUrl.href.replace(/\/$/, '')

            if (
              linkHref === targetHref ||
              linkUrl.hostname === targetUrl.hostname ||
              linkUrl.href.split('#')[0] === targetUrl.href.split('#')[0]
            ) {
              found = true

              // Check if it's nofollow
              const isNofollow = rel.toLowerCase().includes('nofollow')
              isDofollow = !isNofollow

              if (anchor && !anchorText) {
                anchorText = anchor
              }

              return false // Break the loop
            }
          } catch (urlError) {
            // Skip invalid URLs
            console.warn('Invalid URL found:', href)
          }
        }
      })

      results.push({
        url: reciprocalUrl,
        found,
        isDofollow,
        anchorText,
      })
    } catch (fetchError: any) {
      results.push({
        url: reciprocalUrl,
        found: false,
        isDofollow: false,
        error: fetchError.message || 'Failed to fetch source page',
      })
    }
  }

  const verifiedCount = results.filter(r => r.found && r.isDofollow).length
  const verified = verifiedCount > 0

  return {
    verified,
    verifiedCount,
    results,
  }
}

