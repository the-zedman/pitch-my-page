import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server-api'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const adminSupabase = createAdminSupabaseClient()
    const { data: post, error } = await adminSupabase
      .from('blog_posts')
      .select(`
        *,
        profiles!blog_posts_author_id_fkey (
          username,
          email
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching blog post:', error)
      return NextResponse.json({ error: 'Failed to fetch blog post' }, { status: 500 })
    }

    if (!post) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
    }

    // Convert keywords array to comma-separated string for the form
    const postWithStringKeywords = {
      ...post,
      keywords: Array.isArray(post.keywords) ? post.keywords.join(', ') : (post.keywords || '')
    }

    return NextResponse.json({ post: postWithStringKeywords })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const adminSupabase = createAdminSupabaseClient()

    // Check if slug already exists (excluding current post)
    const { data: existingPost } = await adminSupabase
      .from('blog_posts')
      .select('id')
      .eq('slug', slug)
      .neq('id', params.id)
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

    // Update the blog post
    const updateData: any = {
      title,
      slug,
      excerpt: excerpt || null,
      content,
      featured_image_url: featured_image_url || null,
      status: status || 'draft',
      meta_title: meta_title || null,
      meta_description: meta_description || null,
      keywords: keywordsArray,
      updated_at: new Date().toISOString(),
    }

    // Only update published_at if status is published and it's provided
    if (status === 'published') {
      updateData.published_at = published_at || new Date().toISOString()
    } else if (status === 'draft') {
      updateData.published_at = null
    }

    const { data: post, error } = await adminSupabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating blog post:', error)
      return NextResponse.json({ error: 'Failed to update blog post', details: error.message }, { status: 500 })
    }

    if (!post) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
    }

    // Convert keywords array to comma-separated string for the form
    const postWithStringKeywords = {
      ...post,
      keywords: Array.isArray(post.keywords) ? post.keywords.join(', ') : (post.keywords || '')
    }

    return NextResponse.json({ post: postWithStringKeywords })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const adminSupabase = createAdminSupabaseClient()
    const { error } = await adminSupabase
      .from('blog_posts')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting blog post:', error)
      return NextResponse.json({ error: 'Failed to delete blog post' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}
