import Link from 'next/link'
import Image from 'next/image'
import HeaderNav from '@/components/HeaderNav'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import BlogPostList from './BlogPostList'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  featured_image_url: string | null
  published_at: string
  views: number
  author_id: string | null
  profiles?: {
    username: string | null
  } | null | undefined
}

export default async function BlogPage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select(`
      id,
      title,
      slug,
      excerpt,
      featured_image_url,
      published_at,
      views,
      author_id,
      profiles!blog_posts_author_id_fkey (
        username
      )
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  // Transform the data to match the BlogPost interface
  // Supabase returns profiles as an array, but we want a single object
  const blogPosts: BlogPost[] = (posts || []).map((post: any) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    featured_image_url: post.featured_image_url,
    published_at: post.published_at,
    views: post.views,
    author_id: post.author_id,
    profiles: Array.isArray(post.profiles) && post.profiles.length > 0 
      ? post.profiles[0] 
      : (post.profiles && !Array.isArray(post.profiles) ? post.profiles : null)
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white py-4">
        <div className="container mx-auto px-4">
          <HeaderNav variant="light" />
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            SEO & Content Marketing Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tips, insights, and strategies for content creators, indie developers, and marketers
          </p>
        </div>

        {/* Blog Posts List with Search */}
        <BlogPostList initialPosts={blogPosts} />
      </div>

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
