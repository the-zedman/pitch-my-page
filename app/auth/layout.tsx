import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Authentication - Login or Sign Up | Pitch My Page',
  description: 'Login or sign up for Pitch My Page to start promoting your content with ethical dofollow backlinks. Free account includes 2 reciprocal backlinks.',
  keywords: 'login, sign up, register, authentication, pitch my page account',
  openGraph: {
    title: 'Authentication - Login or Sign Up | Pitch My Page',
    description: 'Login or sign up for Pitch My Page to start promoting your content.',
    url: 'https://www.pitchmypage.com/auth',
    siteName: 'Pitch My Page',
    images: [
      {
        url: '/og_image.png',
        width: 1200,
        height: 630,
        alt: 'Authentication - Pitch My Page',
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

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

