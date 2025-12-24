import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server-api'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient(request)
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, slug, excerpt, content, featured_image_url, meta_title, meta_description, keywords, published_at } = body

    // Validate required fields
    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: 'Title, slug, and content are required' },
        { status: 400 }
      )
    }

    // Create blog post
    const { data: post, error: postError } = await supabase
      .from('blog_posts')
      .insert({
        title,
        slug,
        excerpt: excerpt || null,
        content,
        featured_image_url: featured_image_url || null,
        author_id: user.id,
        status: published_at ? 'published' : 'draft',
        published_at: published_at || null,
        meta_title: meta_title || null,
        meta_description: meta_description || null,
        keywords: keywords || [],
      })
      .select()
      .single()

    if (postError) {
      console.error('Error creating blog post:', postError)
      return NextResponse.json(
        { error: 'Failed to create blog post', details: postError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ post }, { status: 201 })
  } catch (error: any) {
    console.error('Blog post creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

