import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Heart, MessageSquare, ArrowRight } from 'lucide-react'
import HeaderNav from '@/components/HeaderNav'
import AnimatedHero from '@/components/AnimatedHero'
import AnimatedFeaturesSection from '@/components/AnimatedFeaturesSection'
import AnimatedPricingSection from '@/components/AnimatedPricingSection'
import AnimatedFeaturesListSection from '@/components/AnimatedFeaturesListSection'
import AnimatedCTASection from '@/components/AnimatedCTASection'
import RankedPitchesSection from '@/components/RankedPitchesSection'

export const metadata: Metadata = {
  title: 'Pitch My Page - Ethical Indie Content Promotion Platform',
  description: 'Promote your content and build ethical dofollow backlinks. Transparent voting, genuine community feedback, and affordable SEO solutions for indie developers and content creators. Start free with 2 reciprocal backlinks.',
  keywords: 'dofollow backlinks, ethical SEO, indie content promotion, page pitching platform, content promotion, backlink building, SEO backlinks, ethical link building',
  openGraph: {
    title: 'Pitch My Page - Ethical Indie Content Promotion Platform',
    description: 'Promote your content and build ethical dofollow backlinks. Transparent voting, genuine community feedback, and affordable SEO solutions for indie developers.',
    url: 'https://www.pitchmypage.com',
    siteName: 'Pitch My Page',
    images: [
      {
        url: '/og_image.png',
        width: 1200,
        height: 630,
        alt: 'Pitch My Page - Ethical Indie Content Promotion',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pitch My Page - Ethical Indie Content Promotion Platform',
    description: 'Promote your content and build ethical dofollow backlinks. Transparent voting, genuine community feedback.',
    images: ['/og_image.png'],
  },
  alternates: {
    canonical: 'https://www.pitchmypage.com',
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
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-400 to-primary-600">
        {/* Header */}
        <header className="container mx-auto px-4 py-6">
          <HeaderNav />
        </header>

      {/* Hero Section */}
      <AnimatedHero />

      {/* Ranked Pitches */}
      <RankedPitchesSection />

      {/* Features */}
      <AnimatedFeaturesSection />

      {/* Pricing Preview */}
      <AnimatedPricingSection />

      {/* Features Section */}
      <AnimatedFeaturesListSection />

      {/* CTA */}
      <AnimatedCTASection />

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                      <Image
                        src="/pitch-my-page-logo-compressed.png"
                        alt="Pitch My Page"
                        width={150}
                        height={40}
                        className="h-8 w-auto mb-4 rounded-lg"
                      />
                      <p className="text-sm">Ethical indie content promotion platform</p>
                    </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/gallery" className="hover:text-white">Gallery</Link></li>
                <li><Link href="#pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="#features" className="hover:text-white">Features</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/blog" className="hover:text-white">SEO Blog</Link></li>
                <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
                <li><Link href="/auth/login" className="hover:text-white">Login</Link></li>
                <li><Link href="/auth/signup" className="hover:text-white">Sign Up</Link></li>
                <li><Link href="/auth/forgot-password" className="hover:text-white">Forgot Password</Link></li>
                <li><Link href="/llms.txt" className="hover:text-white">llms.txt</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Pitch My Page. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

