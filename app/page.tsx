import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Shield, Users, TrendingUp, Link2, CheckCircle, Star, Heart, MessageSquare, ArrowRight } from 'lucide-react'
import HeaderNav from '@/components/HeaderNav'
import HeroCTA from '@/components/HeroCTA'
import CTASection from '@/components/CTASection'
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
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 text-balance">
          Pitch Your Page, Get Discovered, Rank Higher
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto text-balance">
          Pitch your page to an engaged community. Transparent voting, genuine feedback, and authentic rankings surface quality content. 
          No bots, no pay-to-win, just real value for indie developers and content creators.
        </p>
        <HeroCTA />
      </section>

      {/* Ranked Pitches */}
      <RankedPitchesSection />

      {/* Features */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
            Why Choose Pitch My Page?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="Community-Driven Rankings"
              description="Your content rises based on real votes from real people. No pay-to-play, no hidden algorithms—just genuine community engagement that determines what gets seen."
            />
            <FeatureCard
              icon={<Star className="w-8 h-8" />}
              title="Transparent Voting System"
              description="Every vote is public and authentic. See what the community loves, engage with comments, and watch your content climb the rankings organically—no shortcuts, just real engagement."
            />
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Genuine Community"
              description="Real feedback, networking opportunities, and collaboration tools. No spam, no scams—just authentic community engagement."
            />
            <FeatureCard
              icon={<CheckCircle className="w-8 h-8" />}
              title="For All Content Creators"
              description="Whether you're an indie developer launching a product, a writer sharing your latest article, or a marketer promoting content—our platform gives everyone an equal chance to be discovered."
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8" />}
              title="Perfect for Writers & Bloggers"
              description="Get your articles, blog posts, and content discovered by an engaged audience. Whether you're a solo blogger or part of a content team, showcase your best work and build real readership."
            />
            <FeatureCard
              icon={<Link2 className="w-8 h-8" />}
              title="Ethical Dofollow Backlinks"
              description="Build valuable SEO backlinks the right way. Get 2 free dofollow backlinks with reciprocal linking, or unlock unlimited backlinks with our affordable plans starting at $5/month."
            />
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section id="pricing" className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">
            Simple, Affordable Pricing
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Start free, upgrade when you see value. No pay-to-win mechanics—just transparent pricing.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <PricingCard
              name="Free"
              price="$0"
              features={[
                'Submit unlimited pitches',
                'Community voting and comments',
                'Unlimited backlink monitoring with weekly alerts',
                '2 reciprocal DOFOLLOW backlinks'
              ]}
              highlighted={true}
              comingSoon={false}
            />
            <PricingCard
              name="Basic"
              price="$5"
              period="/month"
              features={[
                'Everything in the FREE plan, plus',
                'Daily backlink monitoring and alerts',
                'Bulk upload (CSV) of backlinks to monitor',
                '10 extra DOFOLLOW backlinks'
              ]}
              highlighted={false}
              comingSoon={true}
            />
            <PricingCard
              name="Power"
              price="$29"
              period="/month"
              features={[
                'Everything in the BASIC plan, plus',
                'Hourly backlink monitoring and alerts',
                'Auto-submit pitches on schedule',
                'Bulk upload (CSV) of pitches',
                'Unlimited DOFOLLOW backlinks'
              ]}
              highlighted={false}
              comingSoon={true}
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
            Why Choose Pitch My Page?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="Community-Driven Rankings"
              description="Your content rises based on real votes from real people. No pay-to-play, no hidden algorithms—just genuine community engagement that determines what gets seen."
            />
            <FeatureCard
              icon={<Star className="w-8 h-8" />}
              title="Transparent Voting System"
              description="Every vote is public and authentic. See what the community loves, engage with comments, and watch your content climb the rankings organically—no shortcuts, just real engagement."
            />
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Genuine Community"
              description="Real feedback, networking opportunities, and collaboration tools. No spam, no scams—just authentic community engagement."
            />
            <FeatureCard
              icon={<CheckCircle className="w-8 h-8" />}
              title="For All Content Creators"
              description="Whether you're an indie developer launching a product, a writer sharing your latest article, or a marketer promoting content—our platform gives everyone an equal chance to be discovered."
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8" />}
              title="Perfect for Writers & Bloggers"
              description="Get your articles, blog posts, and content discovered by an engaged audience. Whether you're a solo blogger or part of a content team, showcase your best work and build real readership."
            />
            <FeatureCard
              icon={<Link2 className="w-8 h-8" />}
              title="Ethical Dofollow Backlinks"
              description="Build valuable SEO backlinks the right way. Get 2 free dofollow backlinks with reciprocal linking, or unlock unlimited backlinks with our affordable plans starting at $5/month."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-400 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Pitch Your Page?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join indie creators who are building sustainable growth through community engagement and ethical link building.
          </p>
          <CTASection />
        </div>
      </section>

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

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="text-primary-500 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function PricingCard({ name, price, period = '', features, highlighted, comingSoon = false }: { 
  name: string
  price: string
  period?: string
  features: string[]
  highlighted: boolean
  comingSoon?: boolean
}) {
  return (
    <div className={`bg-white p-6 rounded-lg shadow-md ${highlighted ? 'ring-2 ring-primary-500' : ''}`}>
      <div className="text-2xl font-bold mb-2 text-gray-900">{name}</div>
      <div className="text-4xl font-bold mb-4 text-gray-900">
        {price}
        {period && <span className="text-lg font-normal text-gray-600">{period}</span>}
      </div>
      <ul className="space-y-2 mb-6">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-gray-600">
            <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
      {comingSoon ? (
        <button
          disabled
          className="block w-full text-center py-2 px-4 rounded-lg font-semibold transition bg-gray-200 text-gray-500 cursor-not-allowed"
        >
          COMING SOON
        </button>
      ) : (
        <Link
          href="/auth/signup"
          className={`block text-center py-2 px-4 rounded-lg font-semibold transition ${
            highlighted
              ? 'bg-primary-500 text-white hover:bg-primary-200'
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
          }`}
        >
          Get Started
        </Link>
      )}
    </div>
  )
}

