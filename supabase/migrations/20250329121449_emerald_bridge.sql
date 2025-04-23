/*
  # Reset database state
  
  1. Changes
    - Delete all data from profiles table
    - Delete all data from auth.users table
*/

-- Delete all data from profiles first (due to foreign key constraint)
TRUNCATE profiles CASCADE;

-- Delete all users from auth schema
TRUNCATE auth.users CASCADE;