# Pitch My Page

Ethical indie content promotion platform with dofollow backlinks, transparent voting, and community-driven promotion.

## Project Overview

Pitch My Page is a SaaS platform that empowers indie developers, content creators, bloggers, and marketers to pitch and promote individual web pages, articles, blog posts, projects, or sites. It focuses on:

- **Ethical dofollow backlinks** - Affordable, penalty-safe SEO boost
- **Transparent voting** - Anti-bot features and equitable exposure
- **Community engagement** - Genuine feedback and networking
- **Gamification** - Points, badges, streaks, and leaderboards
- **Fair monetization** - Starting at $1/month, free tier available

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Payments**: Stripe
- **Deployment**: Vercel
- **Email**: Amazon SES
- **SEO APIs**: Moz (optional), Google Analytics

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Stripe account (for payments)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/the-zedman/pitch-my-page.git
cd pitch-my-page
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Fill in your environment variables:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Set up the database:
   - Go to your Supabase project
   - Open SQL Editor
   - Run the SQL script from `database/schema.sql`

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
pitch-my-page/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── gallery/           # Gallery page
│   ├── submit/            # Submission form page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── PitchCard.tsx      # Pitch display card
│   └── SubmissionForm.tsx # Pitch submission form
├── database/              # Database schema
│   └── schema.sql         # Supabase schema
├── docs/                  # Documentation
│   └── wireframes.md      # UI wireframes
├── lib/                   # Utilities and helpers
│   ├── supabase/          # Supabase client setup
│   └── utils.ts           # Utility functions
└── public/                # Static assets
```

## Key Features

### MVP (Phase 1)
- ✅ User authentication (Supabase Auth)
- ✅ Pitch submission with OG data fetching
- ✅ Public gallery with search and filters
- ✅ Voting system (upvote/downvote)
- ✅ Database schema with RLS policies

### Phase 2 (Coming Soon)
- Backlink management and monitoring
- Gamification system (points, badges, streaks)
- Subscription tiers (Stripe integration)
- Analytics dashboard
- Collaboration tools

### Phase 3 (Future)
- AI-powered recommendations
- Advanced moderation tools
- Mobile PWA
- API access for Power tier

## Database Schema

The database uses PostgreSQL via Supabase with the following main tables:

- `profiles` - User profiles with gamification data
- `pitches` - Submitted pitches/pages
- `backlinks` - Dofollow/nofollow backlinks
- `votes` - User votes on pitches
- `comments` - Comments on pitches
- `achievements` - User badges/achievements
- `challenges` - Daily/weekly challenges
- `points_transactions` - Points history

See `database/schema.sql` for complete schema with RLS policies.

## API Routes

- `POST /api/pitches` - Create a new pitch
- `GET /api/pitches` - List approved pitches (with filters)
- `POST /api/fetch-og-data` - Fetch Open Graph data from URL

More API routes to be added for:
- Voting
- Comments
- Backlink management
- Analytics
- Subscriptions

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

The project is already configured with `vercel.json` for Next.js deployment.

### Environment Variables in Vercel

Make sure to add all required environment variables in the Vercel project settings under "Environment Variables".

## Development

### Running Tests

```bash
npm test          # Unit tests
npm run test:e2e  # E2E tests (Cypress)
```

### Linting

```bash
npm run lint
```

### Building for Production

```bash
npm run build
npm start
```

## Roadmap

See the PRP document for detailed development phases and priorities.

### Current Phase: MVP Core
- User authentication ✅
- Pitch submission ✅
- Gallery and search ✅
- Basic voting (in progress)
- Database setup ✅

### Next Phase: Engagement & Monetization
- Stripe integration
- Backlink management
- Gamification system
- Analytics dashboard

## Contributing

This is a private project, but feedback and suggestions are welcome!

## License

Proprietary - All rights reserved

## Support

For issues or questions, please contact the development team.

---

Built with ❤️ for indie creators

