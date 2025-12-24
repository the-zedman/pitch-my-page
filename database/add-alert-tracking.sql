-- Add last_alert_sent_at column to backlinks table for alert frequency tracking
-- This allows us to track when alerts were last sent and respect subscription tier frequencies

ALTER TABLE public.backlinks
ADD COLUMN IF NOT EXISTS last_alert_sent_at TIMESTAMPTZ;

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_backlinks_last_alert_sent_at ON public.backlinks(last_alert_sent_at);

-- Update subscription_tier constraint to remove 'plus' tier
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_subscription_tier_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_subscription_tier_check 
CHECK (subscription_tier IN ('free', 'basic', 'power'));

