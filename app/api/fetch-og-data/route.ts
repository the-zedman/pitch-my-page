import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Fetch the page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PitchMyPage/1.0; +https://pitchmypage.com)',
      },
      // Timeout after 10 seconds
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Extract OG data
    const ogTitle = $('meta[property="og:title"]').attr('content') || $('title').text() || ''
    const ogDescription = $('meta[property="og:description"]').attr('content') || 
                         $('meta[name="description"]').attr('content') || ''
    const ogImage = $('meta[property="og:image"]').attr('content') || 
                   $('meta[property="twitter:image"]').attr('content') || ''

    // Resolve relative image URLs
    let imageUrl = ogImage
    if (imageUrl && !imageUrl.startsWith('http')) {
      const baseUrl = new URL(url)
      imageUrl = new URL(imageUrl, baseUrl.origin).href
    }

    return NextResponse.json({
      title: ogTitle.trim(),
      description: ogDescription.trim(),
      image: imageUrl || null,
    })
  } catch (error) {
    console.error('Error fetching OG data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch page data' },
      { status: 500 }
    )
  }
}

