-- Pitch My Page Database Schema for Supabase PostgreSQL
-- Run this in Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- User profiles (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
  
  -- Gamification
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active_date DATE,
  
  -- Subscription
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'power')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'past_due')),
  stripe_customer_id TEXT UNIQUE,
  subscription_ends_at TIMESTAMPTZ,
  
  -- Privacy & Preferences
  public_profile BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pitches/Submissions
CREATE TABLE public.pitches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Core fields
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL CHECK (char_length(description) >= 100),
  thumbnail_url TEXT,
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  category TEXT CHECK (category IN ('ai', 'content', 'dev-tools', 'saas', 'design', 'marketing', 'other')),
  
  -- Status & Moderation
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'flagged')),
  quality_score INTEGER DEFAULT 50 CHECK (quality_score >= 0 AND quality_score <= 100),
  spam_score INTEGER DEFAULT 0 CHECK (spam_score >= 0 AND spam_score <= 100),
  
  -- Engagement metrics
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  
  -- Fairness & Handicaps (for equitable exposure)
  follower_handicap INTEGER DEFAULT 0, -- Reduces visibility for large followings
  featured_at TIMESTAMPTZ,
  featured_until TIMESTAMPTZ,
  
  -- SEO & Analytics
  domain_authority INTEGER,
  initial_da INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  
  CONSTRAINT url_unique_per_user UNIQUE (user_id, url)
);

-- Backlinks (reciprocal links)
CREATE TABLE public.backlinks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  pitch_id UUID REFERENCES public.pitches(id) ON DELETE CASCADE,
  
  -- Link details
  source_url TEXT NOT NULL, -- Where the link is placed (on user's site)
  target_url TEXT NOT NULL, -- The pitch URL being linked to
  anchor_text TEXT,
  link_type TEXT DEFAULT 'dofollow' CHECK (link_type IN ('dofollow', 'nofollow')),
  
  -- Verification & Monitoring
  is_verified BOOLEAN DEFAULT false,
  verification_attempts INTEGER DEFAULT 0,
  last_verified_at TIMESTAMPTZ,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed', 'expired')),
  
  -- Monitoring
  is_active BOOLEAN DEFAULT true,
  uptime_percentage NUMERIC(5,2) DEFAULT 100.00,
  last_checked_at TIMESTAMPTZ,
  last_failed_at TIMESTAMPTZ,
  last_alert_sent_at TIMESTAMPTZ, -- Track when alerts were last sent for frequency control
  failure_count INTEGER DEFAULT 0,
  
  -- Quality metrics
  is_toxic BOOLEAN DEFAULT false,
  spam_score INTEGER DEFAULT 0,
  
  -- Reciprocity
  is_reciprocal BOOLEAN DEFAULT false,
  reciprocal_pitch_id UUID REFERENCES public.pitches(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  CONSTRAINT unique_source_target UNIQUE (source_url, target_url)
);

-- Votes (upvote/downvote system)
CREATE TABLE public.votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  pitch_id UUID REFERENCES public.pitches(id) ON DELETE CASCADE,
  
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT one_vote_per_user_pitch UNIQUE (user_id, pitch_id)
);

-- Comments
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  pitch_id UUID REFERENCES public.pitches(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE, -- For threading
  
  content TEXT NOT NULL CHECK (char_length(content) > 0),
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  
  upvotes INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Link monitoring logs
CREATE TABLE public.monitoring_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  backlink_id UUID REFERENCES public.backlinks(id) ON DELETE CASCADE,
  
  check_status TEXT NOT NULL CHECK (check_status IN ('success', 'failed', 'timeout', 'changed')),
  http_status_code INTEGER,
  response_time_ms INTEGER,
  link_type_detected TEXT CHECK (link_type_detected IN ('dofollow', 'nofollow', 'none')),
  
  error_message TEXT,
  check_details JSONB,
  
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievements/Badges
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  achievement_type TEXT NOT NULL CHECK (achievement_type IN (
    'first_pitch', 'first_vote', 'first_comment',
    'daily_voter', 'streak_3', 'streak_7', 'streak_30',
    'top_contributor', 'community_champion', 'seo_master'
  )),
  
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

-- Daily challenges
CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  challenge_type TEXT NOT NULL CHECK (challenge_type IN (
    'vote_5_pitches', 'comment_3_pitches', 'submit_1_pitch',
    'verify_1_backlink', 'maintain_streak'
  )),
  
  title TEXT NOT NULL,
  description TEXT,
  points_reward INTEGER DEFAULT 10,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User challenge completions
CREATE TABLE public.challenge_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
  
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  points_earned INTEGER,
  
  CONSTRAINT unique_user_challenge UNIQUE (user_id, challenge_id)
);

-- Points transactions (for transparency)
CREATE TABLE public.points_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  points_change INTEGER NOT NULL, -- Can be positive or negative
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'submission', 'vote', 'comment', 'challenge', 'redemption', 'admin_adjustment'
  )),
  
  related_id UUID, -- ID of related entity (pitch_id, challenge_id, etc.)
  description TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leaderboards (pre-computed for performance)
CREATE TABLE public.leaderboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'all_time')),
  period_start DATE NOT NULL,
  period_end DATE,
  
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  points INTEGER DEFAULT 0,
  submissions_count INTEGER DEFAULT 0,
  votes_count INTEGER DEFAULT 0,
  
  computed_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_leaderboard_entry UNIQUE (period_type, period_start, user_id)
);

-- Indexes for performance
CREATE INDEX idx_pitches_user_id ON public.pitches(user_id);
CREATE INDEX idx_pitches_status ON public.pitches(status);
CREATE INDEX idx_pitches_category ON public.pitches(category);
CREATE INDEX idx_pitches_created_at ON public.pitches(created_at DESC);
CREATE INDEX idx_pitches_upvotes ON public.pitches(upvotes DESC);
CREATE INDEX idx_pitches_tags ON public.pitches USING GIN(tags);
CREATE INDEX idx_pitches_search ON public.pitches USING GIN(to_tsvector('english', title || ' ' || description));

CREATE INDEX idx_backlinks_user_id ON public.backlinks(user_id);
CREATE INDEX idx_backlinks_pitch_id ON public.backlinks(pitch_id);
CREATE INDEX idx_backlinks_is_active ON public.backlinks(is_active);
CREATE INDEX idx_backlinks_last_checked_at ON public.backlinks(last_checked_at);

CREATE INDEX idx_votes_user_id ON public.votes(user_id);
CREATE INDEX idx_votes_pitch_id ON public.votes(pitch_id);

CREATE INDEX idx_comments_pitch_id ON public.comments(pitch_id);
CREATE INDEX idx_comments_user_id ON public.comments(user_id);

CREATE INDEX idx_monitoring_logs_backlink_id ON public.monitoring_logs(backlink_id);
CREATE INDEX idx_monitoring_logs_checked_at ON public.monitoring_logs(checked_at DESC);

CREATE INDEX idx_achievements_user_id ON public.achievements(user_id);

CREATE INDEX idx_points_transactions_user_id ON public.points_transactions(user_id);
CREATE INDEX idx_points_transactions_created_at ON public.points_transactions(created_at DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pitches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backlinks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read their own profile, public profiles are readable by all
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (public_profile = true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Pitches: Approved pitches are public, users can manage their own
CREATE POLICY "Approved pitches are viewable by everyone"
  ON public.pitches FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Users can view their own pitches"
  ON public.pitches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create pitches"
  ON public.pitches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pitches"
  ON public.pitches FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pitches"
  ON public.pitches FOR DELETE
  USING (auth.uid() = user_id);

-- Votes: Users can vote on approved pitches
CREATE POLICY "Users can view votes on approved pitches"
  ON public.votes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pitches
      WHERE pitches.id = votes.pitch_id AND pitches.status = 'approved'
    )
  );

CREATE POLICY "Authenticated users can create votes"
  ON public.votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
  ON public.votes FOR DELETE
  USING (auth.uid() = user_id);

-- Comments: Public on approved pitches, users manage their own
CREATE POLICY "Comments on approved pitches are viewable"
  ON public.comments FOR SELECT
  USING (
    is_deleted = false AND
    EXISTS (
      SELECT 1 FROM public.pitches
      WHERE pitches.id = comments.pitch_id AND pitches.status = 'approved'
    )
  );

CREATE POLICY "Authenticated users can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id);

-- Backlinks: Users can manage their own
CREATE POLICY "Users can view their own backlinks"
  ON public.backlinks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own backlinks"
  ON public.backlinks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own backlinks"
  ON public.backlinks FOR UPDATE
  USING (auth.uid() = user_id);

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pitches_updated_at BEFORE UPDATE ON public.pitches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update pitch vote counts
CREATE OR REPLACE FUNCTION update_pitch_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 'upvote' THEN
      UPDATE public.pitches SET upvotes = upvotes + 1 WHERE id = NEW.pitch_id;
    ELSE
      UPDATE public.pitches SET downvotes = downvotes + 1 WHERE id = NEW.pitch_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 'upvote' THEN
      UPDATE public.pitches SET upvotes = GREATEST(upvotes - 1, 0) WHERE id = OLD.pitch_id;
    ELSE
      UPDATE public.pitches SET downvotes = GREATEST(downvotes - 1, 0) WHERE id = OLD.pitch_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pitch_vote_counts_trigger
  AFTER INSERT OR DELETE ON public.votes
  FOR EACH ROW EXECUTE FUNCTION update_pitch_vote_counts();

-- Function to update comment counts
CREATE OR REPLACE FUNCTION update_pitch_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.pitches SET comments_count = comments_count + 1 WHERE id = NEW.pitch_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.pitches SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.pitch_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pitch_comment_count_trigger
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION update_pitch_comment_count();


