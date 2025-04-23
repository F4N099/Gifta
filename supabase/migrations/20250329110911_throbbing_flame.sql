/*
  # Add avatar_url to profiles table

  1. Changes
    - Add avatar_url column to profiles table
    - Create avatars bucket for storing profile pictures
    - Add policy to allow authenticated users to upload avatars
*/

-- Add avatar_url column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text;

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Allow authenticated users to upload avatars
CREATE POLICY "Allow authenticated users to upload avatars"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'avatars'
);

-- Allow authenticated users to update their own avatar
CREATE POLICY "Allow users to update their own avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[2]
);

-- Allow public access to avatars
CREATE POLICY "Allow public access to avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');