import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard - Manage Your Pitches & Backlinks | Pitch My Page',
  description: 'Manage your pitches, monitor backlinks, track analytics, and grow your content promotion. Dashboard for Pitch My Page users.',
  keywords: 'dashboard, manage pitches, backlink management, content analytics, pitch management',
  openGraph: {
    title: 'Dashboard - Manage Your Pitches & Backlinks | Pitch My Page',
    description: 'Manage your pitches, monitor backlinks, and track your content promotion progress.',
    url: 'https://www.pitchmypage.com/dashboard',
    siteName: 'Pitch My Page',
    images: [
      {
        url: '/og_image.png',
        width: 1200,
        height: 630,
        alt: 'Dashboard - Pitch My Page',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: false,
    follow: true,
  },
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

