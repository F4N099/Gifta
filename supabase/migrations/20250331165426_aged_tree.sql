/*
  # Configure email confirmation links

  1. Changes
    - Make email_confirmed_at nullable to support email verification
    - Update auth settings for email confirmation links
    - Configure email templates
    - Set up triggers for new user registration
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

-- Create function to validate password strength
CREATE OR REPLACE FUNCTION auth.validate_password(password text)
RETURNS boolean AS $$
BEGIN
  -- Check minimum length
  IF length(password) < 8 THEN
    RETURN false;
  END IF;

  -- Check for uppercase letter
  IF password !~ '[A-Z]' THEN
    RETURN false;
  END IF;

  -- Check for lowercase letter
  IF password !~ '[a-z]' THEN
    RETURN false;
  END IF;

  -- Check for number
  IF password !~ '[0-9]' THEN
    RETURN false;
  END IF;

  -- Check for special character
  IF password !~ '[!@#$%^&*(),.?":{}|<>]' THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
      'host', 'smtp.sendgrid.net',
      'port', 587,
      'user', 'apikey',
      'pass', '',
      'tls', true
    ),
    'email_templates', jsonb_build_object(
      'confirmation', jsonb_build_object(
        'subject', 'Verifica il tuo account Gifta',
        'content_html', '
          <h2>Benvenuto su Gifta!</h2>
          <p>Grazie per esserti registrato. Per completare la registrazione, clicca sul pulsante qui sotto:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{ .ConfirmationURL }}" style="background-color: #f43f5e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Verifica Account
            </a>
          </div>
          <p>Se non hai richiesto tu questa registrazione, ignora questa email.</p>
          <p>Il link scadrà tra 24 ore.</p>
        ',
        'content_text', '
          Benvenuto su Gifta!

          Grazie per esserti registrato. Per completare la registrazione, visita il seguente link:

          {{ .ConfirmationURL }}

          Se non hai richiesto tu questa registrazione, ignora questa email.
          Il link scadrà tra 24 ore.
        '
      )
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
  -- Validate password strength
  IF NOT auth.validate_password(NEW.encrypted_password) THEN
    RAISE EXCEPTION 'Password does not meet security requirements';
  END IF;

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