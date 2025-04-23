/*
  # Configure authentication settings and clean up existing data

  1. Changes
    - Clean up all existing auth data
    - Make email confirmation required
    - Configure auth settings for OTP verification
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
    'enable_totp', true,
    'smtp_settings', jsonb_build_object(
      'admin_email', 'noreply@gifta.com',
      'host', 'smtp.sendgrid.net',
      'port', 587,
      'user', 'apikey',
      'pass', '',
      'tls', true
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the function to update settings
SELECT auth.set_auth_settings();

-- Create or replace trigger to ensure new users have email verification
CREATE OR REPLACE FUNCTION auth.tr_set_email_verification()
RETURNS TRIGGER AS $$
BEGIN
  NEW.email_confirmed_at = NULL;
  NEW.raw_app_meta_data = NEW.raw_app_meta_data || jsonb_build_object(
    'email_verification_required', true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS tr_require_email_verification ON auth.users;
CREATE TRIGGER tr_require_email_verification
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auth.tr_set_email_verification();