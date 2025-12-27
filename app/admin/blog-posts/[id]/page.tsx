'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseClient } from '@/lib/supabase/client'
import {
  Loader2,
  AlertCircle,
  Save,
  ArrowLeft,
  Eye,
} from 'lucide-react'
import DashboardHeader from '@/components/DashboardHeader'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  featured_image_url: string | null
  status: string
  published_at: string | null
  meta_title: string | null
  meta_description: string | null
  keywords: string | null
}

export default function BlogPostEditPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params?.id as string
  const isNew = postId === 'new'

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [post, setPost] = useState<Partial<BlogPost>>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image_url: '',
    status: 'draft',
    published_at: null,
    meta_title: '',
    meta_description: '',
    keywords: '',
  })

  useEffect(() => {
    if (!isNew) {
      checkAdminAccess()
      loadPost()
    } else {
      checkAdminAccess()
    }
  }, [postId])

  const checkAdminAccess = async () => {
    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        setError('Access denied. Admin privileges required.')
        setLoading(false)
        return
      }

      if (isNew) {
        setLoading(false)
      }
    } catch (err: any) {
      console.error('Error checking admin access:', err)
      setError('Failed to verify admin access')
      setLoading(false)
    }
  }

  const loadPost = async () => {
    try {
      const response = await fetch(`/api/admin/blog-posts/${postId}`)
      if (!response.ok) {
        throw new Error('Failed to load blog post')
      }
      const data = await response.json()
      setPost(data.post)
      setLoading(false)
    } catch (err: any) {
      console.error('Error loading blog post:', err)
      setError(err.message || 'Failed to load blog post')
      setLoading(false)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleTitleChange = (title: string) => {
    setPost({ ...post, title })
    // Auto-generate slug if it's empty or matches the old title
    if (!post.slug || post.slug === generateSlug(post.title || '')) {
      setPost({ ...post, title, slug: generateSlug(title) })
    } else {
      setPost({ ...post, title })
    }
  }

  const handleSave = async (publish: boolean = false) => {
    try {
      setSaving(true)
      setError(null)

      if (!post.title || !post.slug || !post.content) {
        setError('Title, slug, and content are required')
        setSaving(false)
        return
      }

      const payload = {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || null,
        content: post.content,
        featured_image_url: post.featured_image_url || null,
        status: publish ? 'published' : (post.status || 'draft'),
        published_at: publish && !post.published_at ? new Date().toISOString() : post.published_at,
        meta_title: post.meta_title || null,
        meta_description: post.meta_description || null,
        keywords: post.keywords || null,
      }

      const url = isNew
        ? '/api/admin/blog-posts'
        : `/api/admin/blog-posts/${postId}`
      const method = isNew ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save blog post')
      }

      const data = await response.json()
      router.push('/admin/blog-posts')
    } catch (err: any) {
      console.error('Error saving blog post:', err)
      setError(err.message || 'Failed to save blog post')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (error && !post.id && !isNew) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/admin/blog-posts')}
            className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-200"
          >
            Back to Blog Posts
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/blog-posts"
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isNew ? 'Create New Blog Post' : 'Edit Blog Post'}
              </h1>
              <p className="text-gray-600 mt-1">
                {isNew ? 'Add a new blog post to your site' : 'Update blog post details'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {post.status === 'published' && (
              <Link
                href={`/blog/${post.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                <Eye className="w-4 h-4" />
                View
              </Link>
            )}
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Draft
                </>
              )}
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-200 transition disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                'Publish'
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={post.title || ''}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter blog post title"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={post.slug || ''}
              onChange={(e) => setPost({ ...post, slug: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
              placeholder="blog-post-url-slug"
            />
            <p className="text-xs text-gray-500 mt-1">
              URL: /blog/{post.slug || 'slug'}
            </p>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Excerpt
            </label>
            <textarea
              value={post.excerpt || ''}
              onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Short description of the blog post"
            />
          </div>

          {/* Featured Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Featured Image URL
            </label>
            <input
              type="url"
              value={post.featured_image_url || ''}
              onChange={(e) => setPost({ ...post, featured_image_url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="https://example.com/image.jpg"
            />
            {post.featured_image_url && (
              <div className="mt-2">
                <img
                  src={post.featured_image_url}
                  alt="Featured"
                  className="max-w-md h-48 object-cover rounded-lg border border-gray-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content <span className="text-red-500">*</span>
            </label>
            <div className="bg-white">
              <ReactQuill
                theme="snow"
                value={post.content || ''}
                onChange={(value) => setPost({ ...post, content: value })}
                placeholder="Write your blog post content here..."
                style={{ minHeight: '400px' }}
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                    [{ 'font': [] }],
                    [{ 'size': [] }],
                    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'align': [] }],
                    ['link', 'image', 'video'],
                    ['clean']
                  ],
                }}
                formats={[
                  'header', 'font', 'size',
                  'bold', 'italic', 'underline', 'strike', 'blockquote',
                  'list', 'bullet', 'indent',
                  'color', 'background',
                  'align',
                  'link', 'image', 'video'
                ]}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Use the toolbar to format your content. The content is saved as HTML.
            </p>
          </div>

          {/* Meta Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SEO Meta Title
            </label>
            <input
              type="text"
              value={post.meta_title || ''}
              onChange={(e) => setPost({ ...post, meta_title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="SEO title (defaults to title if empty)"
            />
          </div>

          {/* Meta Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SEO Meta Description
            </label>
            <textarea
              value={post.meta_description || ''}
              onChange={(e) => setPost({ ...post, meta_description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="SEO description (defaults to excerpt if empty)"
            />
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Keywords (comma-separated)
            </label>
            <input
              type="text"
              value={post.keywords || ''}
              onChange={(e) => setPost({ ...post, keywords: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="keyword1, keyword2, keyword3"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={post.status || 'draft'}
              onChange={(e) => setPost({ ...post, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

