'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Calendar, User } from 'lucide-react'
import { formatDate } from '@/lib/utils'

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
  } | null
}

interface BlogPostListProps {
  initialPosts: BlogPost[]
}

export default function BlogPostList({ initialPosts }: BlogPostListProps) {
  const [posts] = useState<BlogPost[]>(initialPosts)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPosts = searchQuery.trim() === '' 
    ? posts 
    : posts.filter(post => {
        const query = searchQuery.toLowerCase()
        return (
          post.title.toLowerCase().includes(query) ||
          post.excerpt?.toLowerCase().includes(query)
        )
      })

  return (
    <>
      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search blog posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Blog Posts Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            {searchQuery ? 'No posts found matching your search.' : 'No blog posts yet. Check back soon!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {post.featured_image_url && (
                <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
                  <img
                    src={post.featured_image_url}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                )}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {post.published_at ? formatDate(post.published_at) : 'Draft'}
                    </span>
                    {post.profiles?.username && (
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {post.profiles.username}
                      </span>
                    )}
                  </div>
                  {post.views > 0 && (
                    <span>{post.views} views</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}

