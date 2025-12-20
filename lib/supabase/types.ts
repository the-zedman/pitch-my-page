// Database types matching Supabase schema

export interface Profile {
  id: string
  username: string | null
  email: string | null
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  website: string | null
  role: 'user' | 'moderator' | 'admin'
  points: number
  level: number
  current_streak: number
  longest_streak: number
  last_active_date: string | null
  subscription_tier: 'free' | 'basic' | 'plus' | 'power'
  subscription_status: 'active' | 'canceled' | 'past_due'
  stripe_customer_id: string | null
  subscription_ends_at: string | null
  public_profile: boolean
  email_notifications: boolean
  created_at: string
  updated_at: string
}

export interface Pitch {
  id: string
  user_id: string
  url: string
  title: string
  description: string
  thumbnail_url: string | null
  tags: string[]
  category: 'ai' | 'content' | 'dev-tools' | 'saas' | 'design' | 'marketing' | 'other' | null
  status: 'pending' | 'approved' | 'rejected' | 'flagged'
  quality_score: number
  spam_score: number
  upvotes: number
  downvotes: number
  comments_count: number
  views: number
  follower_handicap: number
  featured_at: string | null
  featured_until: string | null
  domain_authority: number | null
  initial_da: number | null
  created_at: string
  updated_at: string
  approved_at: string | null
}

export interface Backlink {
  id: string
  user_id: string
  pitch_id: string
  source_url: string
  target_url: string
  anchor_text: string | null
  link_type: 'dofollow' | 'nofollow'
  is_verified: boolean
  verification_attempts: number
  last_verified_at: string | null
  verification_status: 'pending' | 'verified' | 'failed' | 'expired'
  is_active: boolean
  uptime_percentage: number
  last_checked_at: string | null
  last_failed_at: string | null
  failure_count: number
  is_toxic: boolean
  spam_score: number
  is_reciprocal: boolean
  reciprocal_pitch_id: string | null
  created_at: string
  expires_at: string | null
}

export interface Vote {
  id: string
  user_id: string
  pitch_id: string
  vote_type: 'upvote' | 'downvote'
  created_at: string
}

export interface Comment {
  id: string
  user_id: string
  pitch_id: string
  parent_id: string | null
  content: string
  is_edited: boolean
  is_deleted: boolean
  upvotes: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Achievement {
  id: string
  user_id: string
  achievement_type: 
    | 'first_pitch' 
    | 'first_vote' 
    | 'first_comment'
    | 'daily_voter' 
    | 'streak_3' 
    | 'streak_7' 
    | 'streak_30'
    | 'top_contributor' 
    | 'community_champion' 
    | 'seo_master'
  unlocked_at: string
  metadata: Record<string, any> | null
}

export interface Challenge {
  id: string
  challenge_type: 
    | 'vote_5_pitches' 
    | 'comment_3_pitches' 
    | 'submit_1_pitch'
    | 'verify_1_backlink' 
    | 'maintain_streak'
  title: string
  description: string | null
  points_reward: number
  start_date: string
  end_date: string
  created_at: string
}

export interface PointsTransaction {
  id: string
  user_id: string
  points_change: number
  transaction_type: 
    | 'submission' 
    | 'vote' 
    | 'comment' 
    | 'challenge' 
    | 'redemption' 
    | 'admin_adjustment'
  related_id: string | null
  description: string | null
  created_at: string
}

