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