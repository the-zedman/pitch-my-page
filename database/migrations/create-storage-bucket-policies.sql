-- Storage bucket RLS policies for 'pitches' bucket
-- This allows authenticated users to upload, read, and delete their own files
-- Run this SQL in your Supabase SQL Editor

-- Note: Make sure your 'pitches' bucket exists and is set to 'public' if you want public read access
-- You can check/create the bucket in: Supabase Dashboard > Storage > New bucket

-- Drop existing policies if they exist (optional - remove IF EXISTS if you want to keep existing policies)
DROP POLICY IF EXISTS "Authenticated users can upload files to their folder" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read files from pitches bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public can read files from pitches bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their own files" ON storage.objects;

-- Policy: Allow authenticated users to upload files to their own folder
-- Files are stored as: {user_id}/{filename}
CREATE POLICY "Authenticated users can upload files to their folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'pitches' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow authenticated users to read any file in the pitches bucket
CREATE POLICY "Authenticated users can read files from pitches bucket"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'pitches');

-- Policy: Allow public to read files from pitches bucket (for public access to images)
-- This allows anyone to view the images without authentication
CREATE POLICY "Public can read files from pitches bucket"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'pitches');

-- Policy: Allow authenticated users to update their own files
CREATE POLICY "Authenticated users can update their own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'pitches' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'pitches' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow authenticated users to delete their own files
CREATE POLICY "Authenticated users can delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'pitches' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

