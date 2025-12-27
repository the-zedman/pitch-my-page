import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pitch Gallery - Browse All Submissions | Pitch My Page',
  description: 'Browse and discover amazing indie content, tools, and projects. Filter by category, search pitches, and find your next favorite project. Explore ethical dofollow backlinks and community-driven content promotion.',
  keywords: 'pitch gallery, indie projects, content discovery, dofollow backlinks, community submissions, content promotion',
  openGraph: {
    title: 'Pitch Gallery - Browse All Submissions | Pitch My Page',
    description: 'Browse and discover amazing indie content, tools, and projects. Filter by category and find your next favorite project.',
    url: 'https://www.pitchmypage.com/gallery',
    siteName: 'Pitch My Page',
    images: [
      {
        url: '/og_image.png',
        width: 1200,
        height: 630,
        alt: 'Pitch Gallery - Browse All Submissions',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pitch Gallery - Browse All Submissions | Pitch My Page',
    description: 'Browse and discover amazing indie content, tools, and projects.',
    images: ['/og_image.png'],
  },
  alternates: {
    canonical: 'https://www.pitchmypage.com/gallery',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


