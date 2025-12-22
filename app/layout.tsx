import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

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
  other: {
    'apple-mobile-web-app-title': 'Pitch My Page',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
