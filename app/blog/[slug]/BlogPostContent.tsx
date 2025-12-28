'use client'

import { useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'

interface BlogPostContentProps {
  postId: string
  currentViews: number
}

export default function BlogPostContent({ postId, currentViews }: BlogPostContentProps) {
  useEffect(() => {
    // Increment view count client-side
    const incrementViews = async () => {
      try {
        const supabase = createSupabaseClient()
        await supabase
          .from('blog_posts')
          .update({ views: (currentViews || 0) + 1 })
          .eq('id', postId)
      } catch (error) {
        console.error('Error incrementing view count:', error)
      }
    }

    incrementViews()
  }, [postId, currentViews])

  return null // This component only handles side effects
}

