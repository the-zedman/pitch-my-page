import Link from 'next/link'
import Image from 'next/image'
import HeaderNav from '@/components/HeaderNav'
import { ArrowLeft, Calendar, User, Eye } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import RelatedPosts from './RelatedPosts'
import BlogPostContent from './BlogPostContent'
import './quill-content.css'

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
  excerpt: string | null
  profiles?: {
    username: string | null
  } | null
}

interface RelatedPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  featured_image_url: string | null
  published_at: string
  views: number
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string }
}) {
  const slug = params.slug
  const supabase = await createServerSupabaseClient()

  // Fetch the post
  const { data: postData, error: fetchError } = await supabase
    .from('blog_posts')
    .select(`
      id,
      title,
      slug,
      content,
      featured_image_url,
      published_at,
      views,
      author_id,
      meta_title,
      meta_description,
      excerpt,
      profiles!blog_posts_author_id_fkey (
        username
      )
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (fetchError || !postData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Post Not Found</h1>
          <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist.</p>
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

  // Transform post data
  const post: BlogPost = {
    ...postData,
    profiles: Array.isArray(postData.profiles) && postData.profiles.length > 0
      ? postData.profiles[0]
      : (postData.profiles && !Array.isArray(postData.profiles) ? postData.profiles : null)
  }

  // Fetch related posts (excluding current post)
  const { data: relatedData } = await supabase
    .from('blog_posts')
    .select(`
      id,
      title,
      slug,
      excerpt,
      featured_image_url,
      published_at,
      views
    `)
    .eq('status', 'published')
    .neq('id', post.id)
    .order('published_at', { ascending: false })
    .limit(3)

  const relatedPosts: RelatedPost[] = (relatedData || []).map((p: any) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    featured_image_url: p.featured_image_url,
    published_at: p.published_at,
    views: p.views,
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Client-side component to increment views */}
      <BlogPostContent postId={post.id} currentViews={post.views} />

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
        <div className="blog-content-wrapper mb-12">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        {/* Related Posts Section */}
        <RelatedPosts posts={relatedPosts} />

        {/* Explore More Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Explore More</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/blog" className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-accent-eggshell transition">
              <div className="font-semibold text-gray-900 mb-1">All Blog Posts</div>
              <div className="text-sm text-gray-600">Read more SEO and content marketing tips</div>
            </Link>
            <Link href="/gallery" className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-accent-eggshell transition">
              <div className="font-semibold text-gray-900 mb-1">Browse Gallery</div>
              <div className="text-sm text-gray-600">Discover pitches from the community</div>
            </Link>
            <Link href="/submit" className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-accent-eggshell transition">
              <div className="font-semibold text-gray-900 mb-1">Submit Your Pitch</div>
              <div className="text-sm text-gray-600">Share your content with the community</div>
            </Link>
          </div>
        </div>
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
                <li><Link href="/rankings/week" className="hover:text-white">Top This Week</Link></li>
                <li><Link href="/rankings/month" className="hover:text-white">Top This Month</Link></li>
                <li><Link href="/#pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/#features" className="hover:text-white">Features</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/blog" className="hover:text-white">SEO Blog</Link></li>
                <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
                <li><Link href="/auth/login" className="hover:text-white">Login</Link></li>
                <li><Link href="/auth/signup" className="hover:text-white">Sign Up</Link></li>
                <li><Link href="/auth/forgot-password" className="hover:text-white">Forgot Password</Link></li>
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
