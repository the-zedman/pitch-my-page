import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Pitch My Page - Ethical Indie Content Promotion Platform',
  description: 'Ethical content promotion platform with dofollow backlinks, transparent voting, and community-driven promotion for indie creators.',
  keywords: 'dofollow backlinks, ethical SEO boost, indie content promotion, page pitching platform, content promotion, backlink building',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
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

