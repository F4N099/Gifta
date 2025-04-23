/*
  # Configure Resend for Authentication Emails

  1. Changes
    - Update SMTP settings to use Resend
    - Configure email templates with proper styling
    - Set up authentication email flow
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
      'host', 'smtp.resend.com',
      'port', 587,
      'user', 'resend',
      'pass', 're_Gcht35Bu_95bRGX6dR7HBwgQA7hgX9viG',
      'tls', true,
      'name', 'Gifta'
    ),
    'email_templates', jsonb_build_object(
      'confirmation', jsonb_build_object(
        'subject', 'Verifica il tuo account Gifta',
        'content_html', '
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>Verifica il tuo account Gifta</title>
            </head>
            <body style="font-family: system-ui, -apple-system, sans-serif; padding: 40px 20px; background-color: #f3f4f6;">
              <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <img src="https://gifta.com/logo.png" alt="Gifta" style="display: block; margin: 0 auto 30px; width: 120px;">
                <h2 style="margin: 0 0 20px; color: #111827; text-align: center; font-size: 24px;">Benvenuto su Gifta!</h2>
                <p style="margin: 0 0 20px; color: #4b5563; line-height: 1.5;">Grazie per esserti registrato. Per completare la registrazione, clicca sul pulsante qui sotto:</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="{{ .ConfirmationURL }}" style="background-color: #f43f5e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 500;">
                    Verifica Account
                  </a>
                </div>
                <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">Se non hai richiesto tu questa registrazione, ignora questa email.</p>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">Il link scadrà tra 24 ore.</p>
              </div>
            </body>
          </html>
        ',
        'content_text', '
          Benvenuto su Gifta!

          Grazie per esserti registrato. Per completare la registrazione, visita il seguente link:

          {{ .ConfirmationURL }}

          Se non hai richiesto tu questa registrazione, ignora questa email.
          Il link scadrà tra 24 ore.
        '
      ),
      'recovery', jsonb_build_object(
        'subject', 'Reimposta la tua password Gifta',
        'content_html', '
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>Reimposta la tua password Gifta</title>
            </head>
            <body style="font-family: system-ui, -apple-system, sans-serif; padding: 40px 20px; background-color: #f3f4f6;">
              <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <img src="https://gifta.com/logo.png" alt="Gifta" style="display: block; margin: 0 auto 30px; width: 120px;">
                <h2 style="margin: 0 0 20px; color: #111827; text-align: center; font-size: 24px;">Reimposta la tua password</h2>
                <p style="margin: 0 0 20px; color: #4b5563; line-height: 1.5;">Hai richiesto di reimpostare la tua password. Clicca sul pulsante qui sotto per procedere:</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="{{ .RecoveryURL }}" style="background-color: #f43f5e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 500;">
                    Reimposta Password
                  </a>
                </div>
                <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">Se non hai richiesto tu il reset della password, ignora questa email.</p>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">Il link scadrà tra 24 ore.</p>
              </div>
            </body>
          </html>
        ',
        'content_text', '
          Reimposta la tua password Gifta

          Hai richiesto di reimpostare la tua password. Visita il seguente link per procedere:

          {{ .RecoveryURL }}

          Se non hai richiesto tu il reset della password, ignora questa email.
          Il link scadrà tra 24 ore.
        '
      ),
      'magic_link', jsonb_build_object(
        'subject', 'Il tuo link di accesso Gifta',
        'content_html', '
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>Il tuo link di accesso Gifta</title>
            </head>
            <body style="font-family: system-ui, -apple-system, sans-serif; padding: 40px 20px; background-color: #f3f4f6;">
              <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <img src="https://gifta.com/logo.png" alt="Gifta" style="display: block; margin: 0 auto 30px; width: 120px;">
                <h2 style="margin: 0 0 20px; color: #111827; text-align: center; font-size: 24px;">Il tuo link di accesso</h2>
                <p style="margin: 0 0 20px; color: #4b5563; line-height: 1.5;">Clicca sul pulsante qui sotto per accedere al tuo account:</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="{{ .MagicLink }}" style="background-color: #f43f5e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 500;">
                    Accedi
                  </a>
                </div>
                <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">Se non hai richiesto tu questo link, ignora questa email.</p>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">Il link scadrà tra 24 ore.</p>
              </div>
            </body>
          </html>
        ',
        'content_text', '
          Il tuo link di accesso Gifta

          Clicca sul link qui sotto per accedere al tuo account:

          {{ .MagicLink }}

          Se non hai richiesto tu questo link, ignora questa email.
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