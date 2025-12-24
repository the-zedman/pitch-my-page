import Link from 'next/link'
import Image from 'next/image'
import HeaderNav from '@/components/HeaderNav'
import { Metadata } from 'next'
import { HelpCircle, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions (FAQ) | Pitch My Page',
  description: 'Find answers to common questions about Pitch My Page. Learn how to submit pitches, earn backlinks, use the voting system, monitor backlinks, and more.',
  keywords: 'FAQ, help, how to use Pitch My Page, backlinks, content promotion, SEO, questions',
  openGraph: {
    title: 'Frequently Asked Questions (FAQ) | Pitch My Page',
    description: 'Find answers to common questions about Pitch My Page. Learn how to submit pitches, earn backlinks, use the voting system, and more.',
    url: 'https://www.pitchmypage.com/faq',
    siteName: 'Pitch My Page',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'FAQ | Pitch My Page',
    description: 'Find answers to common questions about Pitch My Page.',
  },
  alternates: {
    canonical: 'https://www.pitchmypage.com/faq',
  },
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white py-4">
        <div className="container mx-auto px-4">
          <HeaderNav variant="light" />
        </div>
      </header>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'What is Pitch My Page?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Pitch My Page is a community-driven platform that helps content creators, writers, bloggers, and indie developers promote their work while building valuable SEO backlinks. You can submit pitches, get discovered through community voting, and earn dofollow backlinks through reciprocal linking.'
                }
              },
              {
                '@type': 'Question',
                name: 'How do I earn dofollow backlinks?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Add a reciprocal link to Pitch My Page on your website. Copy the HTML code provided when submitting your pitch, add it to your site, and click "Verify". Once verified, you receive a dofollow backlink. Free users get 2 free reciprocal dofollow backlinks.'
                }
              },
              {
                '@type': 'Question',
                name: 'How does voting work?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Users can vote on any pitch in the gallery. Click the heart icon to upvote content. All votes are public and transparent. Pitches with more votes rank higher, ensuring quality content rises to the top.'
                }
              },
              {
                '@type': 'Question',
                name: 'What are the image requirements?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Thumbnails must be exactly 1200x630px (max 5MB). Favicons recommended up to 512x512px (max 5MB). Formats: JPEG, PNG, GIF, WebP (or ICO for favicon).'
                }
              },
              {
                '@type': 'Question',
                name: 'How often are backlinks monitored?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Free tier: weekly monitoring. Basic ($5/month): daily monitoring. Power ($29/month): hourly monitoring. You receive alerts when backlinks change status or are removed.'
                }
              }
            ]
          })
        }}
      />

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <HelpCircle className="w-16 h-16 text-primary-500 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600">
            Everything you need to know about using Pitch My Page
          </p>
        </div>

        <div className="space-y-8">
          {/* Getting Started */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-primary-500" />
              Getting Started
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">What is Pitch My Page?</h3>
                <p className="text-gray-700 leading-relaxed">
                  Pitch My Page is a community-driven platform that helps content creators, writers, bloggers, and indie developers promote their work while building valuable SEO backlinks. You can submit pitches (articles, blog posts, products, or web pages), get discovered through community voting, and earn dofollow backlinks through reciprocal linking.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">How do I create an account?</h3>
                <p className="text-gray-700 leading-relaxed">
                  Click the "Get Started" or "Sign Up" button in the header. You'll need to provide an email address and create a password. After signing up, verify your email address through the confirmation link sent to your inbox.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Is there a free tier?</h3>
                <p className="text-gray-700 leading-relaxed">
                  Yes! The free tier includes:
                </p>
                <ul className="list-disc list-inside text-gray-700 ml-4 mt-2 space-y-1">
                  <li>Unlimited pitch submissions</li>
                  <li>Community voting and comments</li>
                  <li>Unlimited backlink monitoring with weekly alerts</li>
                  <li>2 reciprocal dofollow backlinks</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">What can I submit?</h3>
                <p className="text-gray-700 leading-relaxed">
                  You can submit individual web pages, blog posts, articles, product pages, project pages, or entire websites. Each submission is called a "pitch" and represents one piece of content you want to promote.
                </p>
              </div>
            </div>
          </section>

          {/* Submitting Pitches */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-primary-500" />
              Submitting Pitches
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">How do I submit a pitch?</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Click "Submit Pitch" in the navigation menu or go to <Link href="/submit" className="text-primary-500 hover:text-primary-200">/submit</Link>. Enter your page URL, and the system will automatically fetch the title, description, and image. You can then:
                </p>
                <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                  <li>Edit the title and description</li>
                  <li>Add tags and select a category</li>
                  <li>Upload a custom thumbnail (must be 1200x630px)</li>
                  <li>Upload a custom favicon/logo icon (up to 512x512px)</li>
                  <li>Set launch status (live or launching soon with date)</li>
                  <li>Add reciprocal links (optional but recommended)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">What are the requirements for a pitch?</h3>
                <ul className="list-disc list-inside text-gray-700 ml-4 space-y-2">
                  <li><strong>URL:</strong> Must be a valid web page URL</li>
                  <li><strong>Title:</strong> Minimum 10 characters, maximum 200 characters</li>
                  <li><strong>Description:</strong> Minimum 100 characters, maximum 1000 characters</li>
                  <li><strong>Tags:</strong> At least 1 tag, maximum 10 tags</li>
                  <li><strong>Category:</strong> Must select one category (AI, Content, Dev Tools, SaaS, Design, Marketing, or Other)</li>
                  <li><strong>Thumbnail:</strong> Optional, but if uploaded must be exactly 1200x630px (max 5MB)</li>
                  <li><strong>Favicon:</strong> Optional, recommended up to 512x512px (max 5MB)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Can I edit my pitch after submission?</h3>
                <p className="text-gray-700 leading-relaxed">
                  Yes! Go to your Dashboard → My Pitches, find the pitch you want to edit, and click the "Edit" button. You can update the title, description, tags, category, thumbnail, favicon, and launch status. You can also re-verify reciprocal links to upgrade them from nofollow to dofollow.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">What does "launching soon" status mean?</h3>
                <p className="text-gray-700 leading-relaxed">
                  If your content or product isn't live yet but will be soon, you can set the status to "Launching Soon" and provide a launch date. This helps build anticipation and allows the community to prepare. The pitch will display a badge showing it's launching soon with the date.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">How long does it take for my pitch to appear?</h3>
                <p className="text-gray-700 leading-relaxed">
                  Pitches are auto-approved and appear immediately after submission. There's no waiting period or manual review process (though we reserve the right to moderate content if needed).
                </p>
              </div>
            </div>
          </section>

          {/* Reciprocal Links and Backlinks */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-primary-500" />
              Reciprocal Links and Backlinks
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">What are reciprocal links?</h3>
                <p className="text-gray-700 leading-relaxed">
                  Reciprocal links are when you add a link to Pitch My Page on your website, and in return, you receive a dofollow backlink to your pitch. This creates a mutually beneficial relationship that helps with SEO while providing value to your readers.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">How do I earn dofollow backlinks?</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  To earn a dofollow backlink, you need to:
                </p>
                <ol className="list-decimal list-inside text-gray-700 ml-4 space-y-2">
                  <li>Submit your pitch</li>
                  <li>Copy the HTML code provided in the reciprocal links section</li>
                  <li>Add that code to your website (in a sidebar, footer, or relevant article section)</li>
                  <li>Click "Verify" - our system checks that the link exists and is dofollow</li>
                  <li>Once verified, you receive a dofollow backlink to your pitch</li>
                </ol>
                <p className="text-gray-700 leading-relaxed mt-3">
                  Free users get 2 free reciprocal dofollow backlinks. Paid tiers offer more.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">What's the difference between dofollow and nofollow?</h3>
                <p className="text-gray-700 leading-relaxed">
                  Dofollow links pass SEO value (link juice) to the linked page, helping it rank better in search engines. Nofollow links don't pass SEO value. When you add a reciprocal link without verifying it, you receive a nofollow backlink. After verification, it upgrades to dofollow.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Can I re-verify my reciprocal link later?</h3>
                <p className="text-gray-700 leading-relaxed">
                  Yes! If you initially submitted without a reciprocal link (or with a nofollow link), you can edit your pitch and click "Re-verify" after adding the link to your site. This upgrades your backlink from nofollow to dofollow.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">How many backlinks can I earn?</h3>
                <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                  <li><strong>Free tier:</strong> 2 reciprocal dofollow backlinks</li>
                  <li><strong>Basic ($5/month):</strong> 2 free + 10 extra = 12 total dofollow backlinks</li>
                  <li><strong>Power ($29/month):</strong> Unlimited dofollow backlinks</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Voting and Community */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-primary-500" />
              Voting and Community Engagement
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">How does voting work?</h3>
                <p className="text-gray-700 leading-relaxed">
                  Users can vote on any pitch in the gallery. Click the heart icon to upvote content you find valuable. All votes are public and transparent—you can see who voted and when. Pitches with more votes rank higher in the gallery, ensuring quality content rises to the top.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Can I vote on my own pitch?</h3>
                <p className="text-gray-700 leading-relaxed">
                  While technically possible, we encourage authentic community engagement. The best way to get votes is to create valuable content that others genuinely appreciate.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">How do comments work?</h3>
                <p className="text-gray-700 leading-relaxed">
                  Anyone can comment on pitches. Comments allow you to provide feedback, ask questions, or engage in discussions. Comments are public and help create a genuine community around content discovery.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Is there a pay-to-play system?</h3>
                <p className="text-gray-700 leading-relaxed">
                  No! Pitch My Page is completely free from pay-to-play mechanics. Rankings are determined by genuine community votes, not advertising spend or paid promotions. This ensures a fair playing field for all creators.
                </p>
              </div>
            </div>
          </section>

          {/* Backlink Monitoring */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-primary-500" />
              Backlink Monitoring
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">What is backlink monitoring?</h3>
                <p className="text-gray-700 leading-relaxed">
                  Backlink monitoring tracks all the links pointing to your content across the web. The system checks whether links are still active, whether they're dofollow or nofollow, and alerts you when something changes. This helps protect your SEO investment.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">How do I add backlinks to monitor?</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Go to Dashboard → Backlinks, then click "Add New Backlink". You'll need to provide:
                </p>
                <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                  <li><strong>Source URL:</strong> The page where your backlink appears (e.g., example.com/article)</li>
                  <li><strong>Target URL:</strong> Where the link points to (your content page)</li>
                  <li><strong>Link Type:</strong> Dofollow or nofollow (as it should be)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">How often are backlinks checked?</h3>
                <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                  <li><strong>Free tier:</strong> Weekly monitoring with alerts</li>
                  <li><strong>Basic ($5/month):</strong> Daily monitoring with alerts</li>
                  <li><strong>Power ($29/month):</strong> Hourly monitoring with alerts</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">What alerts will I receive?</h3>
                <p className="text-gray-700 leading-relaxed">
                  You'll receive email alerts when:
                </p>
                <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                  <li>A dofollow link changes to nofollow</li>
                  <li>A backlink is removed entirely</li>
                  <li>A backlink becomes inaccessible</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-3">
                  Alerts respect your subscription tier frequency to prevent notification overload.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Can I manually check a backlink?</h3>
                <p className="text-gray-700 leading-relaxed">
                  Yes! On the Backlinks page, each backlink has a "Check" button that immediately verifies the link status and updates the "Last Checked" timestamp. You can also use the "CHECK ALL" button to verify all your backlinks at once.
                </p>
              </div>
            </div>
          </section>

          {/* Account and Dashboard */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-primary-500" />
              Account and Dashboard
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">What can I see on my dashboard?</h3>
                <p className="text-gray-700 leading-relaxed">
                  Your dashboard shows:
                </p>
                <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                  <li>Statistics: Total pitches, active backlinks, votes received, comments received</li>
                  <li>Recent activity: Your recent submissions, votes on your content, comments, and backlinks added</li>
                  <li>Quick actions: Links to submit pitches, manage backlinks, and browse the gallery</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">How do I manage my pitches?</h3>
                <p className="text-gray-700 leading-relaxed">
                  Go to Dashboard → My Pitches to see all your submissions. From there you can:
                </p>
                <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                  <li>Edit pitch details</li>
                  <li>Delete pitches</li>
                  <li>Re-verify reciprocal links</li>
                  <li>See reciprocal link status</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Can I delete my account?</h3>
                <p className="text-gray-700 leading-relaxed">
                  Account deletion functionality is coming soon. For now, please contact support if you need to delete your account. Note that deleting your account will remove all your pitches, but published pitches may remain visible if they've been shared.
                </p>
              </div>
            </div>
          </section>

          {/* Images and Media */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-primary-500" />
              Images and Media
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">What image requirements are there?</h3>
                <ul className="list-disc list-inside text-gray-700 ml-4 space-y-2">
                  <li><strong>Thumbnail:</strong> Optional, but if uploaded must be exactly 1200x630px (matches OG image standard). Maximum file size: 5MB. Formats: JPEG, PNG, GIF, or WebP.</li>
                  <li><strong>Favicon/Logo:</strong> Optional, recommended up to 512x512px. Maximum file size: 5MB. Formats: JPEG, PNG, GIF, WebP, or ICO.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">How do images get set automatically?</h3>
                <p className="text-gray-700 leading-relaxed">
                  When you enter a URL, Pitch My Page automatically fetches the Open Graph image from that page. It also tries to fetch the favicon. You can keep these automatic images or replace them with your own custom uploads.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Can I change images after submission?</h3>
                <p className="text-gray-700 leading-relaxed">
                  Yes! Edit your pitch and you can upload new thumbnail or favicon images. Simply click "Upload Image" or "Upload Favicon" and select a new file that meets the requirements.
                </p>
              </div>
            </div>
          </section>

          {/* Pricing and Plans */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-primary-500" />
              Pricing and Subscription Plans
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">What's included in the free tier?</h3>
                <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                  <li>Submit unlimited pitches</li>
                  <li>Community voting and comments</li>
                  <li>Unlimited backlink monitoring with weekly alerts</li>
                  <li>2 reciprocal dofollow backlinks</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">What's the difference between Basic and Power plans?</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  <strong>Basic Plan ($5/month):</strong> Everything in Free, plus:
                </p>
                <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                  <li>Daily backlink monitoring and alerts</li>
                  <li>Bulk upload (CSV) of backlinks to monitor</li>
                  <li>10 extra dofollow backlinks (12 total)</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-3 mb-3">
                  <strong>Power Plan ($29/month):</strong> Everything in Basic, plus:
                </p>
                <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                  <li>Hourly backlink monitoring and alerts</li>
                  <li>Auto-submit pitches on schedule</li>
                  <li>Bulk upload (CSV) of pitches</li>
                  <li>Unlimited dofollow backlinks</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Are Basic and Power plans available yet?</h3>
                <p className="text-gray-700 leading-relaxed">
                  Basic and Power plans are currently marked as "COMING SOON". The free tier is fully functional and provides excellent value for getting started. We'll announce when paid plans become available.
                </p>
              </div>
            </div>
          </section>

          {/* SEO and Technical */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-primary-500" />
              SEO and Technical Questions
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Will Pitch My Page backlinks help my SEO?</h3>
                <p className="text-gray-700 leading-relaxed">
                  Yes! Dofollow backlinks from Pitch My Page pass SEO value to your content, helping improve search engine rankings and domain authority. The backlinks are from a legitimate, indexed website, making them valuable for SEO.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Are the backlinks safe from Google penalties?</h3>
                <p className="text-gray-700 leading-relaxed">
                  Yes. Pitch My Page uses ethical reciprocal linking practices that search engines trust. We don't use link farms, spam networks, or black-hat tactics. All backlinks are transparent, verifiable, and follow search engine guidelines.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">How do I add the reciprocal link to my site?</h3>
                <p className="text-gray-700 leading-relaxed">
                  When submitting a pitch, you'll see a "Reciprocal Links" section that provides HTML code. Copy this code and paste it into your website's HTML—typically in a sidebar, footer, or at the end of a relevant article. The code includes a link to your pitch page on Pitch My Page.
                </p>
              </div>
            </div>
          </section>

          {/* Troubleshooting */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-primary-500" />
              Troubleshooting
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">My reciprocal link isn't verifying. What should I do?</h3>
                <p className="text-gray-700 leading-relaxed">
                  Make sure the link is actually live on your website and accessible. Check that you copied the HTML code correctly. The link must be dofollow (not nofollow) to earn a dofollow backlink. If issues persist, try editing your pitch and clicking "Re-verify" after ensuring the link is properly added to your site.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">My image upload failed. Why?</h3>
                <p className="text-gray-700 leading-relaxed">
                  Check that your image meets the requirements:
                </p>
                <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                  <li>Thumbnail: Exactly 1200x630px, max 5MB</li>
                  <li>Favicon: Up to 512x512px, max 5MB</li>
                  <li>File format: JPEG, PNG, GIF, WebP (or ICO for favicon)</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-3">
                  If your image doesn't meet these requirements, resize it before uploading.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">I'm not receiving email alerts. What's wrong?</h3>
                <p className="text-gray-700 leading-relaxed">
                  Check your spam/junk folder first. Ensure your email notifications are enabled in your account settings. Also verify that your subscription tier's alert frequency matches your expectations (weekly for Free, daily for Basic, hourly for Power).
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 mt-20">
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
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/features" className="hover:text-white">Features</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/blog" className="hover:text-white">SEO Blog</Link></li>
                <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
                <li><Link href="/api" className="hover:text-white">API</Link></li>
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

