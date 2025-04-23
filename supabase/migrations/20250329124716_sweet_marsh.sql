-- Clean up all auth-related tables and sessions
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

-- Create new user
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
  crypt('Caccaman.1984', gen_salt('bf')),
  now(),
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