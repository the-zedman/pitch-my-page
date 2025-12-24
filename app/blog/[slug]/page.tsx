'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import HeaderNav from '@/components/HeaderNav'
import { ArrowLeft, Calendar, User, Eye } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { createSupabaseClient } from '@/lib/supabase/client'

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  featured_image_url: string | null
  published_at: string
  views: number
  author_id: string | null
  meta_title: string | null
  meta_description: string | null
  profiles?: {
    username: string | null
  }
}

export default function BlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (slug) {
      fetchPost()
    }
  }, [slug])

  const fetchPost = async () => {
    try {
      const supabase = createSupabaseClient()
      
      // Fetch the post
      const { data, error: fetchError } = await supabase
        .from('blog_posts')
        .select(`
          *,
          profiles!blog_posts_author_id_fkey (
            username
          )
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single()

      if (fetchError) throw fetchError
      if (!data) {
        setError('Post not found')
        return
      }

      setPost(data)

      // Increment view count
      await supabase
        .from('blog_posts')
        .update({ views: (data.views || 0) + 1 })
        .eq('id', data.id)

    } catch (err: any) {
      console.error('Error fetching blog post:', err)
      setError(err.message || 'Failed to load blog post')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <p className="mt-4 text-gray-600">Loading post...</p>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Post Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The blog post you\'re looking for doesn\'t exist.'}</p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white py-4">
        <div className="container mx-auto px-4">
          <HeaderNav variant="light" />
        </div>
      </header>

      <article className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Back Button */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        {/* Featured Image */}
        {post.featured_image_url && (
          <div className="relative w-full h-64 md:h-96 bg-gray-200 rounded-lg overflow-hidden mb-8">
            <img
              src={post.featured_image_url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Post Header */}
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-gray-600 text-sm">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {post.published_at ? formatDate(post.published_at) : 'Draft'}
            </span>
            {post.profiles?.username && (
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {post.profiles.username}
              </span>
            )}
            {post.views > 0 && (
              <span className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                {post.views} views
              </span>
            )}
          </div>
        </header>

        {/* Post Content */}
        <div 
          className="prose prose-lg max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Image
                src="/pitch-my-page-logo-compressed.png"
                alt="Pitch My Page"
                width={150}
                height={40}
                className="h-8 w-auto mb-4 rounded-lg"
              />
              <p className="text-sm">Ethical indie content promotion platform</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/gallery" className="hover:text-white">Gallery</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/features" className="hover:text-white">Features</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/blog" className="hover:text-white">SEO Blog</Link></li>
                <li><Link href="/docs" className="hover:text-white">Documentation</Link></li>
                <li><Link href="/api" className="hover:text-white">API</Link></li>
                <li><Link href="/llms.txt" className="hover:text-white">llms.txt</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Pitch My Page. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

