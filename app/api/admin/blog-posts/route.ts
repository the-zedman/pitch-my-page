import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server-api'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient(request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'
    const limit = parseInt(searchParams.get('limit') || '100')

    const adminSupabase = createAdminSupabaseClient()
    let query = adminSupabase
      .from('blog_posts')
      .select(`
        id,
        title,
        slug,
        excerpt,
        featured_image_url,
        status,
        published_at,
        created_at,
        updated_at,
        views,
        author_id,
        meta_title,
        meta_description,
        profiles!blog_posts_author_id_fkey (
          username,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: posts, error } = await query

    if (error) {
      console.error('Error fetching blog posts:', error)
      return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 })
    }

    return NextResponse.json({ posts: posts || [] })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient(request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const {
      title,
      slug,
      excerpt,
      content,
      featured_image_url,
      status,
      published_at,
      meta_title,
      meta_description,
      keywords,
    } = body

    // Validate required fields
    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: 'Title, slug, and content are required' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const adminSupabase = createAdminSupabaseClient()
    const { data: existingPost } = await adminSupabase
      .from('blog_posts')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existingPost) {
      return NextResponse.json(
        { error: 'A blog post with this slug already exists' },
        { status: 400 }
      )
    }

    // Convert keywords from comma-separated string to array
    let keywordsArray: string[] | null = null
    if (keywords && typeof keywords === 'string' && keywords.trim()) {
      keywordsArray = keywords.split(',').map(k => k.trim()).filter(k => k.length > 0)
    }

    // Create the blog post
    const { data: post, error } = await adminSupabase
      .from('blog_posts')
      .insert({
        title,
        slug,
        excerpt: excerpt || null,
        content,
        featured_image_url: featured_image_url || null,
        author_id: user.id,
        status: status || 'draft',
        published_at: status === 'published' && published_at ? published_at : null,
        meta_title: meta_title || null,
        meta_description: meta_description || null,
        keywords: keywordsArray,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating blog post:', error)
      return NextResponse.json({ error: 'Failed to create blog post', details: error.message }, { status: 500 })
    }

    // Convert keywords array to comma-separated string for the form
    const postWithStringKeywords = {
      ...post,
      keywords: Array.isArray(post.keywords) ? post.keywords.join(', ') : (post.keywords || '')
    }

    return NextResponse.json({ post: postWithStringKeywords }, { status: 201 })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}
