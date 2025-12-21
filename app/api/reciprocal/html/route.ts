import { NextRequest, NextResponse } from 'next/server'

// GET - Get HTML code for reciprocal links
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const linkType = searchParams.get('type') || 'both' // 'pitchmypage', 'appideasfinder', or 'both'

    const htmlSnippets: Record<string, string> = {
      pitchmypage: `<a href="https://www.pitchmypage.com" rel="dofollow">Pitch My Page</a>`,
      appideasfinder: `<a href="https://www.appideasfinder.com" rel="dofollow">App Ideas Finder</a>`,
      both: `<a href="https://www.pitchmypage.com" rel="dofollow">Pitch My Page</a><br>
<a href="https://www.appideasfinder.com" rel="dofollow">App Ideas Finder</a>`,
    }

    const html = htmlSnippets[linkType] || htmlSnippets.both

    return NextResponse.json({
      html,
      pitchmypage: htmlSnippets.pitchmypage,
      appideasfinder: htmlSnippets.appideasfinder,
      both: htmlSnippets.both,
      instructions: {
        pitchmypage: 'Add this HTML to your page where you want the link to appear:',
        appideasfinder: 'Add this HTML to your page where you want the link to appear:',
        both: 'Add these HTML snippets to your page. You can add one or both links.',
      },
    })
  } catch (error: any) {
    console.error('Error in HTML API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

