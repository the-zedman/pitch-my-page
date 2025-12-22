import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Pitch My Page - Ethical Indie Content Promotion Platform',
  description: 'Ethical content promotion platform with dofollow backlinks, transparent voting, and community-driven promotion for indie creators.',
  keywords: 'dofollow backlinks, ethical SEO boost, indie content promotion, page pitching platform, content promotion, backlink building',
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
