/*
  # Test Registration Setup

  1. Changes
    - Clean up existing test data
    - Configure email verification settings
    - Set up Resend SMTP configuration
    - Create test user for verification
*/

-- First, clean up any existing data
TRUNCATE auth.users CASCADE;
TRUNCATE auth.sessions CASCADE;
TRUNCATE auth.refresh_tokens CASCADE;
TRUNCATE auth.mfa_factors CASCADE;
TRUNCATE auth.mfa_challenges CASCADE;
TRUNCATE auth.flow_state CASCADE;

-- Make email_confirmed_at nullable to support email verification
ALTER TABLE auth.users
ALTER COLUMN email_confirmed_at DROP NOT NULL;

-- Create function to update auth settings
CREATE OR REPLACE FUNCTION auth.set_auth_settings()
RETURNS void AS $$
BEGIN
  -- Update auth settings in users table metadata
  UPDATE auth.users
  SET raw_app_meta_data = raw_app_meta_data || jsonb_build_object(
    'email_confirm_required', true,
    'enable_signup', true,
    'double_confirm_changes', true,
    'mailer_autoconfirm', false,
    'smtp_settings', jsonb_build_object(
      'admin_email', 'noreply@gifta.com',
      'host', 'smtp.resend.com',
      'port', 587,
      'user', 'resend',
      'pass', 're_Gcht35Bu_95bRGX6dR7HBwgQA7hgX9viG',
      'tls', true,
      'name', 'Gifta'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the function to update settings
SELECT auth.set_auth_settings();

-- Create test user
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
  NULL, -- Set to NULL to require email verification
  now(),
  now(),
  '{"provider":"email","providers":["email"],"email_confirm_required":true}',
  '{"name":"Luca"}',
  now(),
  now(),
  encode(gen_random_bytes(32), 'hex'),
  '',
  '',
  ''
);