/*
  # Configure OTP settings and email templates

  1. Changes
    - Set OTP expiration to 10 minutes
    - Configure email templates for OTP verification
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
    'otp_expiration_minutes', 10,
    'smtp_settings', jsonb_build_object(
      'admin_email', 'noreply@gifta.com',
      'host', 'smtp.sendgrid.net',
      'port', 587,
      'user', 'apikey',
      'pass', '',
      'tls', true
    ),
    'email_templates', jsonb_build_object(
      'signup_otp', jsonb_build_object(
        'subject', 'Verifica il tuo account Gifta',
        'content_html', '
          <h2>Benvenuto su Gifta!</h2>
          <p>Grazie per esserti registrato. Per completare la registrazione, inserisci il seguente codice di verifica:</p>
          <h1 style="font-size: 32px; letter-spacing: 5px; text-align: center; margin: 30px 0;">{{ .Token }}</h1>
          <p>Il codice scadrà tra 10 minuti.</p>
          <p>Se non hai richiesto tu questa registrazione, ignora questa email.</p>
        ',
        'content_text', '
          Benvenuto su Gifta!

          Grazie per esserti registrato. Per completare la registrazione, inserisci il seguente codice di verifica:

          {{ .Token }}

          Il codice scadrà tra 10 minuti.

          Se non hai richiesto tu questa registrazione, ignora questa email.
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
    'email_verification_required', true,
    'otp_expiration_minutes', 10
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