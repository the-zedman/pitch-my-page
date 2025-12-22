import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Submit Your Pitch - Share Your Content | Pitch My Page',
  description: 'Submit your content, project, or page to Pitch My Page. Get ethical dofollow backlinks, community feedback, and exposure. Free for first 2 submissions with reciprocal links.',
  keywords: 'submit pitch, content submission, dofollow backlinks, pitch your page, content promotion, submit content',
  openGraph: {
    title: 'Submit Your Pitch - Share Your Content | Pitch My Page',
    description: 'Submit your content, project, or page to Pitch My Page. Get ethical dofollow backlinks and community feedback.',
    url: 'https://www.pitchmypage.com/submit',
    siteName: 'Pitch My Page',
    images: [
      {
        url: '/og_image.png',
        width: 1200,
        height: 630,
        alt: 'Submit Your Pitch - Share Your Content',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Submit Your Pitch - Share Your Content | Pitch My Page',
    description: 'Submit your content, project, or page to Pitch My Page. Get ethical dofollow backlinks.',
    images: ['/og_image.png'],
  },
  alternates: {
    canonical: 'https://www.pitchmypage.com/submit',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function SubmitLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

