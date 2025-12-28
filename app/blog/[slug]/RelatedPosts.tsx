import Link from 'next/link'
import Image from 'next/image'
import { Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface RelatedPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  featured_image_url: string | null
  published_at: string
  views: number
}

interface RelatedPostsProps {
  posts: RelatedPost[]
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) {
    return null
  }

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Posts</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            {post.featured_image_url && (
              <div className="relative w-full h-40 bg-gray-200 overflow-hidden">
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                  {post.excerpt}
                </p>
              )}
              {post.published_at && (
                <p className="text-xs text-gray-500">
                  {formatDate(post.published_at)}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

