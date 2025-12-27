import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['400', '500', '600', '700']
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.pitchmypage.com'),
  title: {
    default: 'Pitch My Page - Ethical Indie Content Promotion Platform',
    template: '%s | Pitch My Page',
  },
  description: 'Ethical content promotion platform with dofollow backlinks, transparent voting, and community-driven promotion for indie creators.',
  keywords: 'dofollow backlinks, ethical SEO boost, indie content promotion, page pitching platform, content promotion, backlink building',
  authors: [{ name: 'Pitch My Page' }],
  creator: 'Pitch My Page',
  publisher: 'Pitch My Page',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', type: 'image/x-icon', sizes: 'any' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  appleWebApp: {
    title: 'Pitch My Page',
    capable: true,
    statusBarStyle: 'default',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.pitchmypage.com',
    siteName: 'Pitch My Page',
    title: 'Pitch My Page - Ethical Indie Content Promotion Platform',
    description: 'Ethical content promotion platform with dofollow backlinks, transparent voting, and community-driven promotion for indie creators.',
    images: [
      {
        url: '/og_image.png',
        width: 1200,
        height: 630,
        alt: 'Pitch My Page - Ethical Indie Content Promotion Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pitch My Page - Ethical Indie Content Promotion Platform',
    description: 'Ethical content promotion platform with dofollow backlinks, transparent voting, and community-driven promotion.',
    images: ['/og_image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add Google Search Console verification when available
    // google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Pitch My Page',
    url: 'https://www.pitchmypage.com',
    description: 'Ethical content promotion platform with dofollow backlinks, transparent voting, and community-driven promotion for indie creators.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.pitchmypage.com/gallery?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }

  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Pitch My Page',
    url: 'https://www.pitchmypage.com',
    logo: 'https://www.pitchmypage.com/pitch-my-page-logo-compressed.png',
    description: 'Ethical content promotion platform with dofollow backlinks for indie creators.',
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${inter.className}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
