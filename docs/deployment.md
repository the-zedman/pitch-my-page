# Deployment Guide

## Prerequisites

Before deploying, ensure you have:

1. **Supabase Project** set up with:
   - Database schema applied (run `database/schema.sql`)
   - Authentication enabled
   - Row Level Security (RLS) policies active

2. **Stripe Account** with:
   - API keys (publishable and secret)
   - Webhook endpoint configured

3. **Vercel Account** connected to your GitHub repository

## Environment Variables Setup

### In Vercel Dashboard

1. Go to your project settings → Environment Variables
2. Add the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_APP_URL=https://pitchmypage.com

# Email (AWS SES)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1

# Optional: SEO APIs
MOZ_API_KEY=your-key
MOZ_API_SECRET=your-secret
```

3. Apply to all environments (Production, Preview, Development)

## Supabase Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note down your project URL and anon key

### 2. Apply Database Schema

1. Open Supabase SQL Editor
2. Copy contents of `database/schema.sql`
3. Run the SQL script
4. Verify tables are created

### 3. Configure Authentication

1. Go to Authentication → Providers
2. Enable Email/Password authentication
3. (Optional) Enable Google and X/Twitter OAuth
4. Configure email templates

### 4. Set Up Row Level Security

The schema includes RLS policies, but verify they're enabled:

```sql
-- Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

## Stripe Setup

### 1. Create Stripe Account

1. Sign up at [stripe.com](https://stripe.com)
2. Get your API keys from Dashboard → Developers → API keys

### 2. Configure Webhooks

1. Go to Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy webhook signing secret

### 3. Create Products & Prices

Create subscription tiers:

- **Free**: $0 (no Stripe product needed)
- **Basic**: $1/month
- **Plus**: $5/month
- **Power**: $20/month

Note the price IDs for use in subscription code.

## Vercel Deployment

### Automatic Deployment (Recommended)

1. Push code to GitHub
2. Import repository in Vercel
3. Vercel will auto-detect Next.js
4. Add environment variables
5. Deploy!

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

## Post-Deployment Checklist

- [ ] Verify landing page loads
- [ ] Test user signup/login
- [ ] Verify database connection
- [ ] Test pitch submission
- [ ] Check gallery displays pitches
- [ ] Verify API routes work
- [ ] Test Stripe webhook (use test mode)
- [ ] Set up custom domain (if applicable)
- [ ] Configure SSL (automatic with Vercel)
- [ ] Set up monitoring/alerts

## Monitoring & Maintenance

### Database

- Monitor Supabase dashboard for:
  - Database size and performance
  - Query performance
  - Active connections

### Application

- Use Vercel Analytics for:
  - Page views
  - API route performance
  - Error tracking

### Link Monitoring

- Set up cron jobs (Vercel Cron) for:
  - Daily backlink checks
  - Uptime monitoring
  - Quality scoring

## Troubleshooting

### Build Failures

- Check environment variables are set
- Verify all dependencies are in `package.json`
- Check build logs in Vercel dashboard

### Database Connection Issues

- Verify Supabase URL and keys are correct
- Check RLS policies allow access
- Review Supabase logs for errors

### Authentication Issues

- Verify Supabase auth is enabled
- Check redirect URLs in Supabase settings
- Ensure cookies are properly configured

## Scaling Considerations

As the platform grows:

1. **Database**: Upgrade Supabase plan if needed
2. **API Routes**: Monitor Vercel function execution times
3. **Caching**: Implement caching for gallery/listings
4. **CDN**: Vercel handles this automatically
5. **Monitoring**: Set up error tracking (Sentry, etc.)


