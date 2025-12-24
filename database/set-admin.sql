-- Set zedman_org user as admin
-- Run this in Supabase SQL Editor

-- First, find the user by username or email
-- Update the role to 'admin' for the user with username 'zedman_org'
UPDATE public.profiles
SET role = 'admin'
WHERE username = 'zedman_org';

-- Verify the update
SELECT id, username, email, role
FROM public.profiles
WHERE username = 'zedman_org';

