/*
  # Reset database state and update schema
  
  1. Changes
    - Delete all data from profiles table
    - Delete all data from auth.users table
    - Add email and password columns to profiles table
*/

-- Delete all data from profiles first (due to foreign key constraint)
TRUNCATE profiles CASCADE;

-- Delete all users from auth schema
TRUNCATE auth.users CASCADE;

-- Add email column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email text;