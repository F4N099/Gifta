-- First, clean up all auth-related tables and sessions
TRUNCATE auth.users CASCADE;
TRUNCATE auth.sessions CASCADE;
TRUNCATE auth.refresh_tokens CASCADE;
TRUNCATE auth.mfa_factors CASCADE;
TRUNCATE auth.mfa_challenges CASCADE;
TRUNCATE auth.flow_state CASCADE;

-- Clean up profiles and storage
TRUNCATE profiles CASCADE;
TRUNCATE storage.objects CASCADE;

-- Force logout all users
DELETE FROM auth.sessions;
DELETE FROM auth.refresh_tokens;

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS tr_require_email_verification ON auth.users;
DROP FUNCTION IF EXISTS auth.tr_set_email_verification();
DROP FUNCTION IF EXISTS auth.validate_password();
DROP FUNCTION IF EXISTS auth.set_auth_settings();

-- Create function to update auth settings
CREATE OR REPLACE FUNCTION auth.set_auth_settings()
RETURNS void AS $$
BEGIN
  -- Update auth settings in users table metadata
  UPDATE auth.users
  SET raw_app_meta_data = raw_app_meta_data || jsonb_build_object(
    'email_confirm_required', false,
    'enable_signup', true,
    'mailer_autoconfirm', true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the function to update settings
SELECT auth.set_auth_settings();

-- Create test user with confirmed email
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'lucafanoni1@gmail.com',
  crypt('Test123!@#', gen_salt('bf')),
  now(), -- Set to current time to skip email verification
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Luca"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
);