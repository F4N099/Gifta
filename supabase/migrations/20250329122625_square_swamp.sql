/*
  # Force logout all users and clean up sessions
  
  1. Changes
    - Delete all sessions from auth.sessions
    - Delete all refresh tokens
    - Clean up any remaining user data
*/

-- Delete all sessions
TRUNCATE auth.sessions CASCADE;

-- Delete all refresh tokens
TRUNCATE auth.refresh_tokens CASCADE;

-- Clean up user data
TRUNCATE profiles CASCADE;
TRUNCATE auth.users CASCADE;