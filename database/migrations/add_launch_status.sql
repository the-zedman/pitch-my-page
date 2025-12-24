-- Add launch_status and launch_date columns to pitches table
ALTER TABLE public.pitches
ADD COLUMN IF NOT EXISTS launch_status TEXT DEFAULT 'live' CHECK (launch_status IN ('live', 'launching_soon'));

ALTER TABLE public.pitches
ADD COLUMN IF NOT EXISTS launch_date TIMESTAMPTZ;

-- Update existing pitches to have 'live' status if null
UPDATE public.pitches
SET launch_status = 'live'
WHERE launch_status IS NULL;

