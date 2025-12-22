import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase/server'

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: pitch } = await supabase
      .from('pitches')
      .select('title, description, thumbnail_url, url')
      .eq('id', params.id)
      .single()

    if (!pitch) {
      return {
        title: 'Pitch Not Found | Pitch My Page',
        description: 'The pitch you are looking for does not exist.',
      }
    }

    const title = `${pitch.title} | Pitch My Page`
    const description = pitch.description?.substring(0, 160) || 'View this pitch on Pitch My Page'
    const image = pitch.thumbnail_url || '/og_image.png'
    const url = `https://www.pitchmypage.com/pitches/${params.id}`

    return {
      title,
      description,
      keywords: 'pitch details, content details, indie projects, dofollow backlinks',
      openGraph: {
        title,
        description,
        url,
        siteName: 'Pitch My Page',
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: pitch.title,
          },
        ],
        locale: 'en_US',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
      },
      alternates: {
        canonical: url,
      },
      robots: {
        index: true,
        follow: true,
      },
    }
  } catch (error) {
    return {
      title: 'Pitch Details | Pitch My Page',
      description: 'View pitch details, description, and community engagement.',
    }
  }
}

export default function PitchDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

