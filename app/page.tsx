import Link from 'next/link'
import Image from 'next/image'
import { Shield, Users, TrendingUp, Link2, CheckCircle, Star } from 'lucide-react'
import HeaderNav from '@/components/HeaderNav'
import HeroCTA from '@/components/HeroCTA'
import CTASection from '@/components/CTASection'

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
          Promote Your Content, Build Your Backlinks
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto text-balance">
          Ethical dofollow backlinks, transparent voting, and genuine community feedback. 
          No bots, no pay-to-win, just real value for indie developers and content creators.
        </p>
        <HeroCTA />
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center text-white">
            <div className="text-4xl font-bold mb-2">1,000+</div>
            <div className="text-white/90">Active Users</div>
          </div>
          <div className="text-center text-white">
            <div className="text-4xl font-bold mb-2">5,000+</div>
            <div className="text-white/90">Pitches Submitted</div>
          </div>
          <div className="text-center text-white">
            <div className="text-4xl font-bold mb-2">95%+</div>
            <div className="text-white/90">Backlink Uptime</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
            Why Choose Pitch My Page?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={<Link2 className="w-8 h-8" />}
              title="Ethical Dofollow Backlinks"
              description="Get affordable, penalty-safe dofollow backlinks starting at $1/month or free via reciprocity. Monitor uptime and quality with 95% SLA."
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="Anti-Bot Transparency"
              description="Verified voting, transparent logs, and fairness handicaps ensure equitable exposure for indie creators, not just VC-backed giants."
            />
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Genuine Community"
              description="Real feedback, networking opportunities, and collaboration tools. No spam, no scams—just authentic community engagement."
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8" />}
              title="SEO Analytics"
              description="Track your traffic, domain authority impact, and conversion metrics. See real ROI beyond temporary hype."
            />
            <FeatureCard
              icon={<Star className="w-8 h-8" />}
              title="Gamified Engagement"
              description="Earn points, unlock badges, maintain streaks, and compete on leaderboards. Make promotion fun and rewarding."
            />
            <FeatureCard
              icon={<CheckCircle className="w-8 h-8" />}
              title="Quality Assurance"
              description="Advanced moderation, spam detection, and quality scoring. We maintain high standards so you don't have to worry."
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <PricingCard
              name="Free"
              price="$0"
              features={[
                '2 reciprocal backlinks',
                'Basic monitoring',
                'Gallery access',
                'Community voting'
              ]}
              highlighted={false}
            />
            <PricingCard
              name="Basic"
              price="$1"
              period="/month"
              features={[
                '1 extra dofollow link',
                'Full community access',
                'Email alerts',
                'Basic analytics'
              ]}
              highlighted={false}
            />
            <PricingCard
              name="Plus"
              price="$5"
              period="/month"
              features={[
                '10 dofollow links',
                'Advanced analytics',
                'Collaboration tools',
                'Bulk upload (CSV)'
              ]}
              highlighted={true}
            />
            <PricingCard
              name="Power"
              price="$39"
              period="/month"
              features={[
                'Unlimited dofollow links',
                'Featured placements',
                'White-label options',
                'Advanced analytics dashboard'
              ]}
              highlighted={false}
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
            Join indie creators who are building sustainable growth through ethical link building and community engagement.
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
                        className="h-8 w-auto mb-4"
                      />
                      <p className="text-sm">Ethical indie content promotion platform</p>
                    </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/gallery" className="hover:text-white">Gallery</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/features" className="hover:text-white">Features</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/blog" className="hover:text-white">SEO Blog</Link></li>
                <li><Link href="/docs" className="hover:text-white">Documentation</Link></li>
                <li><Link href="/api" className="hover:text-white">API</Link></li>
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

function PricingCard({ name, price, period = '', features, highlighted }: { 
  name: string
  price: string
  period?: string
  features: string[]
  highlighted: boolean
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
    </div>
  )
}

