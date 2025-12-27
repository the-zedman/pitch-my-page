import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase/server'

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createServerSupabaseClient()
  
  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, slug, meta_title, meta_description, excerpt, featured_image_url')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single()

  if (!post) {
    return {
      title: 'Blog Post Not Found | Pitch My Page',
    }
  }

  const title = post.meta_title || post.title
  const description = post.meta_description || post.excerpt || 'Read this blog post on Pitch My Page'
  const url = `https://www.pitchmypage.com/blog/${post.slug}`

  return {
    title: `${title} | Pitch My Page`,
    description,
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt || undefined,
      url,
      siteName: 'Pitch My Page',
      images: post.featured_image_url ? [
        {
          url: post.featured_image_url,
          width: 1200,
          height: 630,
          alt: post.title,
        }
      ] : undefined,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt || undefined,
      images: post.featured_image_url ? [post.featured_image_url] : undefined,
    },
    alternates: {
      canonical: url,
    },
  }
}

export default function BlogPostLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

