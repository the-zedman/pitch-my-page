-- Add favicon_url column to pitches table
ALTER TABLE public.pitches
ADD COLUMN IF NOT EXISTS favicon_url TEXT;

